// Server-side text splitting for animated labels/headlines. Astro hands us a
// slot as an HTML string, so entities are decoded first and every glyph is
// re-escaped by the template when rendered.

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: '’',
  lsquo: '‘',
  hellip: '…',
  ndash: '–',
  mdash: '—',
};

export function decodeEntities(html: string): string {
  return html.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/**
 * Plain-text label → words → graphemes. Returns null when the slot contains
 * markup (icons, <strong>…), in which case callers render it untouched.
 * Non-breaking spaces stay inside their word so they keep not breaking.
 */
export function splitLabel(html: string): string[][] | null {
  if (/<[a-z!/]/i.test(html)) return null;
  const text = decodeEntities(html).replace(/[ \t\n\r]+/g, ' ').trim();
  if (!text) return null;
  return text.split(' ').map((word) => Array.from(word));
}
