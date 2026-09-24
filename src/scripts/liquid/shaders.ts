// GLSL for the water engine (WebGL2 / GLSL ES 3.00). Everything here is
// original: a height-field ripple simulation, a Voronoi-edge caustic web and
// an analytic pool-tile grid, refracted by the ripple normals.
//
// Palette constants are the brand colours (ink, accent, accent-soft, paper,
// sand) and mixes of them computed in scripts — no hue outside the brand.

/** Full-screen triangle generated from gl_VertexID: no vertex buffer needed. */
export const FULLSCREEN_VS = /* glsl */ `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

/**
 * Ripple simulation step (discrete 2D wave equation on a ping-pong grid).
 * R = current height, G = previous height. The grid lives in viewport space
 * and is shifted by the scroll delta so ripples stay attached to the page.
 */
export const SIM_FS = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uShift;
uniform float uDamping;
uniform float uAspect;
uniform vec4 uDrops[8];
uniform int uDropCount;

in vec2 vUv;
out vec4 outState;

float inside(vec2 uv) {
  vec2 s = step(vec2(0.0), uv) * step(uv, vec2(1.0));
  return s.x * s.y;
}

float heightAt(vec2 uv) {
  return texture(uState, uv).r * inside(uv);
}

void main() {
  vec2 uv = vUv - vec2(0.0, uShift);
  vec2 state = texture(uState, uv).rg * inside(uv);
  float neighbours =
    heightAt(uv + vec2(uTexel.x, 0.0)) + heightAt(uv - vec2(uTexel.x, 0.0)) +
    heightAt(uv + vec2(0.0, uTexel.y)) + heightAt(uv - vec2(0.0, uTexel.y));
  float h = (neighbours * 0.5 - state.g) * uDamping;

  for (int i = 0; i < 8; i++) {
    if (i >= uDropCount) break;
    vec4 d = uDrops[i];
    vec2 dp = (vUv - d.xy) * vec2(uAspect, 1.0);
    h += d.w * exp(-dot(dp, dp) / (d.z * d.z));
  }

  outState = vec4(clamp(h, -1.5, 1.5), state.r, 0.0, 1.0);
}`;

/** The water itself: one full-screen pass behind the whole site. */
export const DISPLAY_FS = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D uState;
uniform sampler2D uRefl;
uniform vec2 uSimTexel;
uniform vec2 uViewport;
uniform float uScroll;
uniform float uTime;
uniform float uIntro;
uniform vec3 uMouse;
uniform vec4 uBands[8];
uniform int uBandCount;
uniform float uWaveAmp;
uniform float uDepth;
uniform float uCaustics;
uniform vec4 uReflRect;
uniform float uReflOn;
uniform float uRipples;

in vec2 vUv;
out vec4 outColor;

// Brand colours and mixes (sRGB): ink #0b0b0b, anthracite #2a2a2a,
// accent #46607a, accent-soft #aebdc9, paper, sand #ede7df.
const vec3 INK = vec3(0.043);
const vec3 ANTHRACITE = vec3(0.165);
const vec3 ABYSS = vec3(0.059, 0.063, 0.071);     // ink + 6% accent
const vec3 DEEP = vec3(0.071, 0.082, 0.094);      // ink + 12% accent
const vec3 DEEP_LIT = vec3(0.094, 0.114, 0.137);  // ink + 22% accent
const vec3 CURRENT = vec3(0.184, 0.204, 0.220);   // anthracite + 18% accent
const vec3 ACCENT = vec3(0.275, 0.376, 0.478);
const vec3 SOFT = vec3(0.682, 0.741, 0.788);
const vec3 GLINT = vec3(0.859, 0.882, 0.906);     // paper + 45% accent-soft
const vec3 SHALLOW = vec3(0.949, 0.957, 0.965);   // paper + 16% accent-soft
const vec3 PAPER = vec3(1.0);
const vec3 SAND = vec3(0.929, 0.906, 0.875);
const vec3 SAND_LIT = vec3(0.976, 0.965, 0.949);

uvec2 pcg2d(uvec2 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * 1664525u;
  v.y += v.x * 1664525u;
  v ^= v >> 16u;
  v.x += v.y * 1664525u;
  v.y += v.x * 1664525u;
  v ^= v >> 16u;
  return v;
}

vec2 hash2(vec2 cell) {
  uvec2 h = pcg2d(uvec2(ivec2(cell) + 65536));
  return vec2(h) * (1.0 / 4294967295.0);
}

// Distance to the nearest Voronoi cell wall (F2 - F1) with slowly orbiting
// feature points: thin bright walls = the web light draws on a pool floor.
float cellEdge(vec2 x, float t) {
  vec2 n = floor(x);
  vec2 f = x - n;
  float f1 = 8.0;
  float f2 = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      o = 0.5 + 0.38 * sin(t * (0.55 + 0.45 * o.yx) + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < f1) {
        f2 = f1;
        f1 = d;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }
  return sqrt(f2) - sqrt(f1);
}

float caustic(vec2 q, float t, float layers) {
  // Two octaves of domain warp bend the straight Voronoi walls into the
  // curved, uneven filaments real caustics have.
  vec2 warp = vec2(
    sin(q.y * 2.1 + t * 0.31) + sin(q.y * 4.7 - q.x * 1.3 - t * 0.23) * 0.45,
    cos(q.x * 1.9 - t * 0.27) + cos(q.x * 4.3 + q.y * 1.1 + t * 0.19) * 0.45
  ) * 0.16;
  // Thin filaments with a soft bloom either side of each cell wall…
  float e = cellEdge(q + warp, t);
  float c = exp(-e * 24.0) + exp(-e * 7.0) * 0.22;
  if (layers > 1.5) {
    float e2 = cellEdge(q * 1.43 + vec2(5.2, 1.3) - warp * 0.8, t * 1.23 + 1.9);
    float c2 = exp(-e2 * 28.0) + exp(-e2 * 8.0) * 0.18;
    // …brightest where two webs cross, like light focusing on a pool floor.
    c = c * 0.55 + c2 * 0.3 + c * c2 * 0.9;
  }
  // Slow large-scale variation so the light gathers in patches instead of
  // tiling the whole surface evenly.
  float patchy = 0.55 + 0.45 * sin(q.x * 0.37 + t * 0.07) * sin(q.y * 0.29 - t * 0.05 + 1.3);
  return c * patchy;
}

// Vertical displacement (px) of the waterline between two bands: a slow
// travelling swell, amplified by scroll speed, bent by passing ripples and
// drawn toward a nearby cursor like surface tension.
float boundaryOffset(float x, float seed, float lineViewY, float h) {
  float t = uTime;
  float w = sin(x * 0.0039 + t * 0.52 + seed) * 0.66
          + sin(x * 0.0087 - t * 0.71 + seed * 1.7) * 0.27
          + sin(x * 0.0161 + t * 1.13 + seed * 2.3) * 0.07;
  float dy = uMouse.y - lineViewY;
  float dx = (x - uMouse.x) / 130.0;
  float pull = exp(-dx * dx) * exp(-(dy * dy) / (160.0 * 160.0)) * uMouse.z;
  return w * uWaveAmp + clamp(dy, -70.0, 70.0) * 0.3 * pull + h * 22.0;
}

float deepness(float tone) {
  return tone < 0.5 ? 1.0 : (tone > 2.5 ? 0.85 : 0.0);
}

vec3 toneBase(float tone) {
  if (tone < 0.5) return DEEP;
  if (tone < 1.5) return SHALLOW;
  if (tone < 2.5) return SAND;
  return CURRENT;
}

vec3 toneSolid(float tone) {
  if (tone < 0.5) return INK;
  if (tone < 1.5) return PAPER;
  if (tone < 2.5) return SAND;
  return ANTHRACITE;
}

vec3 shadeDeep(vec2 p, float pageY, float bandTop, float kind, float tone, vec2 refr, vec2 grad) {
  float t = uTime;
  float fromTop = max(pageY - bandTop, 0.0);
  float surf = exp(-fromTop / 560.0);

  vec3 base = tone > 2.5
    ? CURRENT
    : mix(DEEP, ABYSS, clamp(uDepth * 0.5 + step(2.5, kind) * 0.5, 0.0, 1.0));
  base = mix(base, DEEP_LIT, surf * 0.55);

  // Slanted shafts of light, drifting almost imperceptibly.
  vec2 sp = p + refr * 0.5;
  float a = sp.x * 0.82 + (sp.y + uScroll * 0.3) * 0.46;
  float s = sin(a * 0.0046 + t * 0.085) * 0.5
          + sin(a * 0.0109 - t * 0.061 + 1.7) * 0.3
          + sin(a * 0.0213 + t * 0.117 + 0.4) * 0.2;
  base += SOFT * smoothstep(0.42, 1.0, s * 0.5 + 0.5) * 0.03 * (0.3 + surf);

  // Faint caustic web close to the surface.
  vec2 q = (vec2(p.x, p.y + uScroll * 0.85) + refr * 1.5) / 175.0;
  base += SOFT * caustic(q, t * 0.5, 1.0) * 0.045 * surf * surf;

  // Pool tiles on the hero and page headers, wobbling under the ripples.
  if (kind > 0.5 && kind < 2.5) {
    vec2 gp = vec2(p.x, p.y + uScroll * 0.92) + refr * 2.6
      + vec2(sin(p.y * 0.012 + t * 0.55), cos(p.x * 0.010 - t * 0.47)) * 1.5;
    vec2 g = abs(fract(gp / 56.0 - 0.5) - 0.5) * 56.0;
    float line = 1.0 - smoothstep(0.3, 1.5, min(g.x, g.y));
    base += GLINT * line * (kind < 1.5 ? 0.065 : 0.04) * (0.45 + 0.55 * surf);
  }

  // The cursor is a light held just above the water.
  vec2 md = p - uMouse.xy;
  float glow = exp(-dot(md, md) / (2.0 * 330.0 * 330.0)) * uMouse.z;
  base += ACCENT * glow * 0.11;
  vec3 n = normalize(vec3(-grad * 11.0, 1.0));
  vec3 halfV = normalize(normalize(vec3(uMouse.xy - p, 520.0)) + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, halfV), 0.0), 320.0);
  base += GLINT * spec * 0.2 * uMouse.z;
  // Ambient glints on ripple crests, cursor or not: thin and bright rather
  // than broad shading, so ripples read as light on water, not as shapes.
  float crest = max(dot(n.xy, vec2(-0.55, -0.83)), 0.0);
  base += GLINT * crest * crest * 0.5;
  return base;
}

vec3 shadeShallow(vec2 p, float tone, vec2 refr, vec2 grad) {
  float t = uTime;
  bool sand = tone > 1.5;
  vec3 base = sand ? SAND : SHALLOW;
  vec3 lit = sand ? SAND_LIT : PAPER;

  vec2 q = (vec2(p.x, p.y + uScroll * 0.86) + refr * 2.2) / 150.0;
  float c = caustic(q, t * 0.42, uCaustics);

  vec2 md = p - uMouse.xy;
  float glow = exp(-dot(md, md) / (2.0 * 300.0 * 300.0)) * uMouse.z;
  vec3 col = mix(base * 0.995, lit, clamp(c * (0.42 + glow * 0.4), 0.0, 1.0));

  // Ripples catch the light on one flank and shade the other.
  float slope = dot(grad, vec2(-0.6, -0.8));
  col += slope * (sand ? vec3(0.1, 0.095, 0.09) : vec3(0.1));
  return col;
}

void main() {
  vec2 uv = vUv;
  vec2 p = vec2(uv.x, 1.0 - uv.y) * uViewport;
  float pageY = p.y + uScroll;
  float t = uTime;

  float h = 0.0;
  vec2 grad = vec2(0.0);
  if (uRipples > 0.5) {
    h = texture(uState, uv).r;
    float hl = texture(uState, uv - vec2(uSimTexel.x, 0.0)).r;
    float hr = texture(uState, uv + vec2(uSimTexel.x, 0.0)).r;
    float hb = texture(uState, uv - vec2(0.0, uSimTexel.y)).r;
    float ht = texture(uState, uv + vec2(0.0, uSimTexel.y)).r;
    grad = vec2(hr - hl, hb - ht);
  }
  vec2 refr = grad * 34.0;

  // Which band is this pixel in, once the waterlines are displaced?
  int raw = 0;
  for (int i = 1; i < 8; i++) {
    if (i >= uBandCount) break;
    if (pageY >= uBands[i].x) raw = i;
  }
  float topB = -1e6;
  float botB = 1e6;
  if (raw > 0) {
    float by = uBands[raw].x;
    topB = by + boundaryOffset(p.x, fract(by * 0.00173) * 6.2831, by - uScroll, h);
  }
  if (raw + 1 < uBandCount) {
    float by = uBands[raw + 1].x;
    botB = by + boundaryOffset(p.x, fract(by * 0.00173) * 6.2831, by - uScroll, h);
  }

  int band = raw;
  int other = raw;
  float sd;
  if (pageY < topB) {
    band = raw - 1;
    sd = topB - pageY;
  } else if (pageY >= botB) {
    band = raw + 1;
    sd = pageY - botB;
  } else if (pageY - topB < botB - pageY) {
    other = max(raw - 1, 0);
    sd = pageY - topB;
  } else {
    other = min(raw + 1, uBandCount - 1);
    sd = botB - pageY;
  }

  vec4 B = uBands[band];
  float tone = B.z;
  float otherTone = uBands[other].z;
  float deep = deepness(tone);

  vec3 col = deep > 0.5
    ? shadeDeep(p, pageY, B.x, B.w, tone, refr, grad)
    : shadeShallow(p, tone, refr, grad);

  // Mirror image of the hero's floating villa, broken up by the swell.
  if (uReflOn > 0.01 && deep > 0.5) {
    float waterY = uReflRect.y + uReflRect.w * 0.93;
    float d = p.y - waterY;
    float span = uReflRect.w * 0.5;
    if (d > 0.0 && d < span && p.x > uReflRect.x && p.x < uReflRect.x + uReflRect.z) {
      float k = d / span;
      float wob = sin(p.y * 0.085 - t * 1.9) * (0.8 + k * 6.0) + refr.x * 3.0;
      vec2 sp = vec2(p.x + wob, waterY - d + refr.y * 3.0);
      vec2 tuv = (sp - uReflRect.xy) / uReflRect.zw;
      vec4 r = textureLod(uRefl, tuv, 0.6 + k * 4.0);
      float a = r.a * (1.0 - k) * (1.0 - k) * 0.5 * step(0.0, tuv.y) * uReflOn;
      vec3 rc = r.rgb / max(r.a, 0.001);
      col = mix(col, rc * vec3(0.42, 0.5, 0.58) + DEEP * 0.35, a);
    }
  }

  // Waterline between two different kinds of water.
  if (abs(tone - otherTone) > 0.5) {
    float line = exp(-sd * sd / 4.5);
    float halo = exp(-sd / 34.0);
    if (deep > deepness(otherTone)) {
      col += GLINT * (line * 0.28 + halo * 0.03);
    } else {
      col *= 1.0 - line * 0.06;
      float band2 = sd - 6.0;
      col = mix(col, PAPER, exp(-band2 * band2 / 30.0) * 0.2);
      col -= halo * 0.008;
    }
    col = mix(col, toneBase(otherTone), (1.0 - smoothstep(-0.5, 3.4, sd)) * 0.5);
  }

  col = mix(toneSolid(tone), col, uIntro);

  // Interleaved-gradient dither: kills banding in the deep gradients.
  float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  col += (n - 0.5) / 255.0;
  outColor = vec4(col, 1.0);
}`;

/** Suspended particles: stateless, positions are a pure function of seed + time. */
export const PARTICLE_VS = /* glsl */ `#version 300 es
precision highp float;

in vec4 aSeed;
uniform vec2 uViewport;
uniform float uScroll;
uniform float uTime;
uniform vec3 uMouse;
uniform vec4 uBands[8];
uniform int uBandCount;
uniform float uPointScale;
uniform float uIntro;

out float vAlpha;

void main() {
  float depth = mix(0.35, 1.0, aSeed.z);
  float span = uViewport.y + 120.0;
  float rise = mix(5.0, 16.0, aSeed.w) * depth;
  float y = mod(aSeed.y * span - uTime * rise - uScroll * depth * 0.6, span) - 60.0;
  float x = aSeed.x * (uViewport.x + 80.0) - 40.0
    + sin(uTime * mix(0.12, 0.33, aSeed.w) + aSeed.y * 31.0) * 26.0 * depth;
  vec2 pos = vec2(x, y);

  // Pushed aside by the cursor, like motes in a moving current.
  vec2 d = pos - uMouse.xy;
  float dist2 = dot(d, d);
  pos += d * inversesqrt(dist2 + 1.0) * 46.0 * depth * exp(-dist2 / (2.0 * 110.0 * 110.0)) * uMouse.z;

  float pageY = pos.y + uScroll;
  float tone = uBands[0].z;
  for (int i = 1; i < 8; i++) {
    if (i >= uBandCount) break;
    if (pageY >= uBands[i].x) tone = uBands[i].z;
  }
  float deep = tone < 0.5 ? 1.0 : (tone > 2.5 ? 0.8 : 0.0);
  float twinkle = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed.w) + aSeed.x * 40.0);
  vAlpha = deep * mix(0.14, 0.55, aSeed.z * aSeed.z) * twinkle * uIntro;

  gl_PointSize = mix(1.2, 3.2, aSeed.z * aSeed.z) * uPointScale;
  gl_Position = vAlpha < 0.01
    ? vec4(2.0, 2.0, 0.0, 1.0)
    : vec4(pos.x / uViewport.x * 2.0 - 1.0, 1.0 - pos.y / uViewport.y * 2.0, 0.0, 1.0);
}`;

export const PARTICLE_FS = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
out vec4 outColor;
void main() {
  float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vAlpha;
  outColor = vec4(vec3(0.86, 0.89, 0.92) * a, a);
}`;
