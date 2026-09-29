"""Build the site's web fonts from the @fontsource-variable packages.

The raw variable files ship every axis at full range (Fraunces "full" is
~270 KB for roman + italic). The site only needs:

- Fraunces roman   : display headings — wght 300–600, opsz 36–144, SOFT 100
- Fraunces italic  : display accents  — wght 300–500, opsz 36–144, SOFT 100, WONK 1
- Instrument Sans  : text & UI        — wght 400–700

so each file is partially instanced (axes pinned or narrowed) and subset to
the characters French copy uses. Output goes to public/fonts/ and is
committed, so building the site never needs Python.

    pip install fonttools brotli
    python3 scripts/build-fonts.py
"""

import io
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules" / "@fontsource-variable"
OUT = ROOT / "public" / "fonts"

# Basic Latin, Latin-1 (all French accents, « » · ° ×), Œ œ, Ÿ, typographic
# punctuation (thin/narrow no-break spaces, dashes, quotes, ellipsis), €.
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + [0x152, 0x153, 0x178, 0x2009, 0x202F, 0x2013, 0x2014, 0x2018, 0x2019,
       0x201A, 0x201C, 0x201D, 0x201E, 0x2022, 0x2026, 0x2039, 0x203A, 0x20AC]
)

JOBS = [
    (
        SRC / "fraunces" / "files" / "fraunces-latin-full-normal.woff2",
        OUT / "fraunces-roman.woff2",
        {"wght": (300, 600), "opsz": (36, 144), "SOFT": 100, "WONK": 0},
    ),
    (
        SRC / "fraunces" / "files" / "fraunces-latin-full-italic.woff2",
        OUT / "fraunces-italic.woff2",
        {"wght": (300, 500), "opsz": (36, 144), "SOFT": 100, "WONK": 1},
    ),
    (
        SRC / "instrument-sans" / "files" / "instrument-sans-latin-wght-normal.woff2",
        OUT / "instrument-sans.woff2",
        {},
    ),
]


def build(src: Path, dest: Path, axes: dict) -> None:
    font = TTFont(src)
    if axes:
        font = instancer.instantiateVariableFont(font, axes, updateFontNames=False)
        # Round-trip so the subsetter sees fully decompiled, consistent tables
        # (the instanced italic otherwise trips over a lazily loaded gvar).
        buffer = io.BytesIO()
        font.save(buffer)
        buffer.seek(0)
        font = TTFont(buffer)

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=UNICODES)
    subsetter.subset(font)

    dest.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(dest)
    print(f"{dest.relative_to(ROOT)}: {src.stat().st_size // 1024} KB -> {dest.stat().st_size // 1024} KB")


if __name__ == "__main__":
    for src, dest, axes in JOBS:
        build(src, dest, axes)
