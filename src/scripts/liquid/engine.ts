import { onTick } from './ticker';
import { getBands, getDocHeight, watchBands } from './bands';
import { FrameGovernor, NEXT_TIER_DOWN, TIER_SETTINGS, isTierForced, type Tier, type TierSettings } from './quality';
import { clamp, damp } from './env';
import { DISPLAY_FS, FULLSCREEN_VS, PARTICLE_FS, PARTICLE_VS, SIM_FS } from './shaders';

// The water behind the whole site: one fixed WebGL2 canvas (persisted across
// page navigations) painting every [data-tone] band as a kind of water, with
// a ripple simulation driven by the pointer, clicks, UI events and scroll.
// Lazy-loaded (see ./index.ts) so none of this ships until WebGL is usable.

const TONE_ID: Record<string, number> = { ink: 0, paper: 1, sand: 2, anthracite: 3 };
const KIND_ID: Record<string, number> = { hero: 1, header: 2, abyss: 3 };
const MAX_BANDS = 8;
const MAX_DROPS = 8;
const SIM_HZ = 90;
const MAX_SIM_STEPS = 3;
const STATIC_TIME = 41.7;

interface Drop {
  x: number;
  y: number;
  r: number;
  s: number;
}

export interface DropDetail {
  x: number;
  y: number;
  radius?: number;
  strength?: number;
}

export interface LiquidEngine {
  readonly tier: Tier;
  drop(x: number, y: number, radius?: number, strength?: number): void;
  /** Hero entrance: the water "wakes up" from the page's plain colour with a first drop. */
  intro(): void;
  /** Re-read page structure after a navigation swap. */
  refresh(): void;
  /** Suspend the governor (known-slow moments like page transitions). */
  hold(seconds: number): void;
}

type Uniforms = Record<string, WebGLUniformLocation | null>;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('createShader failed');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader: ${log}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vs: string, fs: string, names: string[]): { program: WebGLProgram; u: Uniforms } {
  const program = gl.createProgram();
  if (!program) throw new Error('createProgram failed');
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`link: ${gl.getProgramInfoLog(program)}`);
  }
  const u: Uniforms = {};
  for (const name of names) u[name] = gl.getUniformLocation(program, name);
  return { program, u };
}

// Small deterministic PRNG so particle seeds are identical on every visit.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Engine implements LiquidEngine {
  tier: Tier;
  private settings: TierSettings;
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly display: { program: WebGLProgram; u: Uniforms };
  private readonly sim: { program: WebGLProgram; u: Uniforms };
  private readonly particles: { program: WebGLProgram; u: Uniforms };
  private readonly vao: WebGLVertexArrayObject;
  private readonly particleVao: WebGLVertexArrayObject;
  private readonly particleCapacity = 400;
  private readonly floatTargets: boolean;

  private simTex: WebGLTexture[] = [];
  private simFbo: WebGLFramebuffer[] = [];
  private simIndex = 0;
  private simW = 0;
  private simH = 0;
  private ripples = false;

  private reflTex: WebGLTexture | null = null;
  private reflSrc = '';
  private reflEl: HTMLImageElement | null = null;
  private reflReady = false;

  private cssW = 1;
  private cssH = 1;
  private time = 0;
  private intro01 = 1;
  private drops: Drop[] = [];
  private readonly dropData = new Float32Array(MAX_DROPS * 4);
  private readonly bandData = new Float32Array(MAX_BANDS * 4);
  private bandCount = 1;

  private pointerX = -9999;
  private pointerY = -9999;
  private lightX = -9999;
  private lightY = -9999;
  private presence = 0;
  private presenceTarget = 0;
  private trailX = -9999;
  private trailY = -9999;
  private touchDown = false;

  private lastScroll = window.scrollY;
  private pendingShift = 0;
  private scrollVel = 0;
  private waveAmp = 8;

  private simAcc = 0;
  private renderAcc = 1;
  private lastInput = performance.now();
  private readonly governor = new FrameGovernor();
  private readonly governed: boolean;
  private dirty = true;
  private stopped = false;
  private revealed = false;
  private readonly unsubscribeTick: () => void;
  private readonly resizeObserver: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, tier: Exclude<Tier, 'off'>) {
    this.canvas = canvas;
    this.tier = tier;
    this.settings = TIER_SETTINGS[tier];
    this.governed = !isTierForced();

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
    });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;

    this.floatTargets = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));

    this.display = link(gl, FULLSCREEN_VS, DISPLAY_FS, [
      'uState', 'uRefl', 'uSimTexel', 'uViewport', 'uScroll', 'uTime', 'uIntro', 'uMouse', 'uBands',
      'uBandCount', 'uWaveAmp', 'uDepth', 'uCaustics', 'uReflRect', 'uReflOn', 'uRipples',
    ]);
    this.sim = link(gl, FULLSCREEN_VS, SIM_FS, ['uState', 'uTexel', 'uShift', 'uDamping', 'uAspect', 'uDrops', 'uDropCount']);
    this.particles = link(gl, PARTICLE_VS, PARTICLE_FS, [
      'uViewport', 'uScroll', 'uTime', 'uMouse', 'uBands', 'uBandCount', 'uPointScale', 'uIntro',
    ]);

    const vao = gl.createVertexArray();
    const particleVao = gl.createVertexArray();
    if (!vao || !particleVao) throw new Error('VAO unavailable');
    this.vao = vao;
    this.particleVao = particleVao;

    const rand = mulberry32(0x5eed);
    const seeds = new Float32Array(this.particleCapacity * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = rand();
    gl.bindVertexArray(particleVao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.particles.program, 'aSeed');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(vao);

    // A 1×1 transparent placeholder keeps sampler unit 1 valid before the
    // villa texture (if any) has loaded.
    this.reflTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.reflTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));

    this.time = this.settings.animate ? 12 : STATIC_TIME;
    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    watchBands(() => {
      this.dirty = true;
    });
    this.bindInput();
    this.findReflection();

    canvas.addEventListener('webglcontextlost', this.onContextLost);
    this.unsubscribeTick = onTick(this.tick);
  }

  // ---------------------------------------------------------------- public

  drop(x: number, y: number, radius = 26, strength = 0.5): void {
    if (!this.ripples || this.stopped) return;
    if (this.drops.length > 24) this.drops.shift();
    this.drops.push({ x, y, r: radius, s: strength });
    this.lastInput = performance.now();
  }

  intro(): void {
    if (!this.settings.animate) return;
    this.intro01 = 0;
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    const rect = hero?.getBoundingClientRect();
    if (!rect || rect.bottom < 0) return;
    const cx = rect.left + rect.width * 0.5;
    const cy = Math.min(rect.top + rect.height * 0.46, this.cssH * 0.5);
    window.setTimeout(() => this.drop(cx, cy, 44, 0.75), 180);
    window.setTimeout(() => this.drop(cx + rect.width * 0.18, cy + 90, 22, 0.4), 620);
  }

  refresh(): void {
    this.dirty = true;
    this.lastScroll = window.scrollY;
    this.pendingShift = 0;
    this.scrollVel = 0;
    this.findReflection();
  }

  hold(seconds: number): void {
    this.governor.pause(seconds);
  }

  // ----------------------------------------------------------------- input

  private bindInput(): void {
    const opts = { passive: true } as const;
    window.addEventListener('pointermove', this.onPointerMove, opts);
    window.addEventListener('pointerdown', this.onPointerDown, opts);
    window.addEventListener('pointerup', this.onPointerUp, opts);
    window.addEventListener('pointercancel', this.onPointerUp, opts);
    document.documentElement.addEventListener('pointerleave', this.onLeave, opts);
    window.addEventListener('blur', this.onLeave);
    window.addEventListener('liquid:drop', this.onDropEvent as EventListener);
    document.addEventListener('visibilitychange', () => this.governor.pause(2));
    window.addEventListener('scroll', this.onScroll, opts);
  }

  private onPointerMove = (e: PointerEvent): void => {
    this.lastInput = performance.now();
    if (e.pointerType === 'touch' && !this.touchDown) return;
    this.pointerX = e.clientX;
    this.pointerY = e.clientY;
    this.presenceTarget = e.pointerType === 'touch' ? 0.7 : 1;
    if (this.lightX < -999) {
      this.lightX = e.clientX;
      this.lightY = e.clientY;
    }
  };

  private onPointerDown = (e: PointerEvent): void => {
    this.lastInput = performance.now();
    const touch = e.pointerType === 'touch';
    if (touch) {
      this.touchDown = true;
      this.pointerX = this.lightX = this.trailX = e.clientX;
      this.pointerY = this.lightY = this.trailY = e.clientY;
      this.presenceTarget = 0.7;
    }
    this.drop(e.clientX, e.clientY, touch ? 24 : 18, touch ? 0.42 : 0.36);
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') {
      this.touchDown = false;
      this.presenceTarget = 0;
    }
  };

  private onLeave = (): void => {
    this.presenceTarget = 0;
  };

  private onScroll = (): void => {
    this.dirty = true;
  };

  private onDropEvent = (e: CustomEvent<DropDetail>): void => {
    const d = e.detail;
    if (d) this.drop(d.x, d.y, d.radius, d.strength);
  };

  private onContextLost = (e: Event): void => {
    e.preventDefault();
    this.stop();
  };

  private stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.unsubscribeTick();
    this.resizeObserver.disconnect();
    document.documentElement.classList.remove('liquid');
    document.documentElement.dataset.liquidTier = 'off';
  }

  // ------------------------------------------------------------- resources

  private resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    let scale = this.settings.renderScale;
    const pixels = w * h * scale * scale;
    if (pixels > this.settings.maxPixels) scale *= Math.sqrt(this.settings.maxPixels / pixels);
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));
    this.cssW = w;
    this.cssH = h;
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw;
      this.canvas.height = ch;
    }

    const wantRipples = this.settings.ripples && this.floatTargets;
    const sw = Math.max(32, Math.round(w * this.settings.simScale));
    const sh = Math.max(32, Math.round(h * this.settings.simScale));
    if (!wantRipples) {
      this.destroySim();
      this.ripples = false;
    } else if (sw !== this.simW || sh !== this.simH || !this.ripples) {
      this.ripples = this.createSim(sw, sh);
    }
    this.dirty = true;
  }

  private destroySim(): void {
    const gl = this.gl;
    this.simTex.forEach((t) => gl.deleteTexture(t));
    this.simFbo.forEach((f) => gl.deleteFramebuffer(f));
    this.simTex = [];
    this.simFbo = [];
    this.simW = this.simH = 0;
  }

  private createSim(w: number, h: number): boolean {
    const gl = this.gl;
    this.destroySim();
    for (let i = 0; i < 2; i++) {
      const tex = gl.createTexture();
      const fbo = gl.createFramebuffer();
      if (!tex || !fbo) return false;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteTexture(tex);
        gl.deleteFramebuffer(fbo);
        this.destroySim();
        return false;
      }
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.simTex.push(tex);
      this.simFbo.push(fbo);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.simW = w;
    this.simH = h;
    this.simIndex = 0;
    return true;
  }

  private findReflection(): void {
    const img = document.querySelector<HTMLImageElement>('img[data-liquid-reflect]');
    this.reflEl = img;
    if (!img) return;
    const src = img.currentSrc || img.src;
    if (src === this.reflSrc && this.reflReady) return;
    this.reflReady = false;
    const upload = () => {
      if (!img.naturalWidth) return;
      const w = Math.min(1024, img.naturalWidth);
      const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
      const scratch = document.createElement('canvas');
      scratch.width = w;
      scratch.height = h;
      const ctx = scratch.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const gl = this.gl;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.reflTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.reflSrc = src;
      this.reflReady = true;
      this.dirty = true;
    };
    if (img.complete && img.naturalWidth) upload();
    else img.addEventListener('load', upload, { once: true });
  }

  // ------------------------------------------------------------------ loop

  private tick = (dt: number, now: number): void => {
    if (this.stopped || document.hidden) return;

    if (this.governed && this.settings.animate && this.governor.sample(dt)) this.stepDown();

    const idle = now - this.lastInput > 6000;
    const fps = idle ? this.settings.idleFps : this.settings.fps;
    this.renderAcc += dt;
    if (this.renderAcc < 1 / fps - 0.002) return;
    const frameDt = Math.min(this.renderAcc, 1 / 15);
    this.renderAcc = 0;

    const scroll = window.scrollY;
    const dy = scroll - this.lastScroll;
    this.lastScroll = scroll;
    if (Math.abs(dy) > this.cssH) {
      // A jump (navigation, anchor): not a real movement of the water.
      this.pendingShift = 0;
      this.scrollVel = 0;
      if (this.ripples) this.createSim(this.simW, this.simH);
    } else {
      this.pendingShift += dy;
      this.scrollVel = damp(this.scrollVel, dy / frameDt, 7, frameDt);
    }

    if (!this.settings.animate) {
      if (!this.dirty && dy === 0) return;
      this.dirty = false;
      this.render(0);
      return;
    }

    this.time += frameDt;
    this.intro01 = damp(this.intro01, 1, 1.9, frameDt);
    this.presence = damp(this.presence, this.presenceTarget, 3.2, frameDt);
    if (this.pointerX > -999) {
      this.lightX = damp(this.lightX, this.pointerX, 9, frameDt);
      this.lightY = damp(this.lightY, this.pointerY, 9, frameDt);
    }
    this.waveAmp = damp(this.waveAmp, 7 + Math.min(Math.abs(this.scrollVel) * 0.011, 26), 5, frameDt);

    if (this.ripples) {
      this.simAcc = Math.min(this.simAcc + frameDt, MAX_SIM_STEPS / SIM_HZ);
      let steps = 0;
      while (this.simAcc >= 1 / SIM_HZ && steps < MAX_SIM_STEPS) {
        this.simAcc -= 1 / SIM_HZ;
        this.addTrail();
        this.simStep();
        steps++;
      }
    }

    this.render(this.presence);
  };

  private addTrail(): void {
    if (this.pointerX < -999 || this.presenceTarget === 0) return;
    if (this.trailX < -999) {
      this.trailX = this.pointerX;
      this.trailY = this.pointerY;
      return;
    }
    const dx = this.pointerX - this.trailX;
    const dy = this.pointerY - this.trailY;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) return;
    this.trailX = this.pointerX;
    this.trailY = this.pointerY;
    if (this.drops.length < MAX_DROPS) {
      this.drops.push({ x: this.pointerX, y: this.pointerY, r: 15, s: Math.min(dist * 0.0032, 0.045) });
    }
  }

  private stepDown(): void {
    const next = NEXT_TIER_DOWN[this.tier];
    if (next === this.tier || next === 'off') return;
    this.tier = next;
    this.settings = TIER_SETTINGS[next as Exclude<Tier, 'off'>];
    document.documentElement.dataset.liquidTier = next;
    if (!this.settings.animate) this.time = STATIC_TIME;
    this.resize();
  }

  private simStep(): void {
    const gl = this.gl;
    const { u } = this.sim;
    const src = this.simIndex;
    const dst = 1 - src;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.simFbo[dst]);
    gl.viewport(0, 0, this.simW, this.simH);
    gl.useProgram(this.sim.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.simTex[src]);
    gl.uniform1i(u.uState, 0);
    gl.uniform2f(u.uTexel, 1 / this.simW, 1 / this.simH);
    gl.uniform1f(u.uShift, this.pendingShift / this.cssH);
    this.pendingShift = 0;
    gl.uniform1f(u.uDamping, 0.982);
    gl.uniform1f(u.uAspect, this.cssW / this.cssH);

    const n = Math.min(this.drops.length, MAX_DROPS);
    for (let i = 0; i < n; i++) {
      const d = this.drops[i];
      this.dropData[i * 4] = d.x / this.cssW;
      this.dropData[i * 4 + 1] = 1 - d.y / this.cssH;
      this.dropData[i * 4 + 2] = Math.max(d.r, 6) / this.cssH;
      this.dropData[i * 4 + 3] = d.s;
    }
    this.drops.splice(0, n);
    gl.uniform4fv(u.uDrops, this.dropData);
    gl.uniform1i(u.uDropCount, n);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.simIndex = dst;
  }

  private packBands(): void {
    const bands = getBands();
    const viewTop = this.lastScroll - 240;
    const viewBottom = this.lastScroll + this.cssH + 240;
    let start = bands.findIndex((b) => b.bottom > viewTop);
    if (start < 0) start = Math.max(0, bands.length - 1);
    let n = 0;
    for (let i = start; i < bands.length && n < MAX_BANDS; i++) {
      const b = bands[i];
      if (n > 0 && b.top > viewBottom) break;
      this.bandData[n * 4] = b.top;
      this.bandData[n * 4 + 1] = b.bottom;
      this.bandData[n * 4 + 2] = TONE_ID[b.tone] ?? 0;
      this.bandData[n * 4 + 3] = KIND_ID[b.kind] ?? 0;
      n++;
    }
    if (n === 0) {
      this.bandData.set([-1e6, 1e6, 0, 0], 0);
      n = 1;
    }
    this.bandCount = n;
  }

  private render(presence: number): void {
    const gl = this.gl;
    this.packBands();

    const docH = getDocHeight() || document.documentElement.scrollHeight;
    const depth = clamp(this.lastScroll / Math.max(docH - this.cssH, 1), 0, 1);

    let reflOn = 0;
    let rx = 0;
    let ry = 0;
    let rw = 1;
    let rh = 1;
    if (this.reflReady && this.reflEl && this.reflEl.isConnected && this.settings.animate) {
      const r = this.reflEl.getBoundingClientRect();
      if (r.width > 0 && r.bottom + r.height * 0.5 > 0 && r.top < this.cssH) {
        // The reflection fades in with the object itself (its reveal
        // animates opacity) — never a reflection of something not there.
        reflOn = Number.parseFloat(getComputedStyle(this.reflEl).opacity) || 0;
        rx = r.left;
        ry = r.top;
        rw = r.width;
        rh = r.height;
      }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.bindVertexArray(this.vao);
    gl.useProgram(this.display.program);
    const u = this.display.u;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.ripples ? this.simTex[this.simIndex] : this.reflTex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.reflTex);
    gl.uniform1i(u.uState, 0);
    gl.uniform1i(u.uRefl, 1);
    gl.uniform2f(u.uSimTexel, 1 / Math.max(this.simW, 1), 1 / Math.max(this.simH, 1));
    gl.uniform2f(u.uViewport, this.cssW, this.cssH);
    gl.uniform1f(u.uScroll, this.lastScroll);
    gl.uniform1f(u.uTime, this.time % 3600);
    gl.uniform1f(u.uIntro, this.settings.animate ? this.intro01 : 1);
    gl.uniform3f(u.uMouse, this.lightX, this.lightY, this.settings.animate ? presence : 0);
    gl.uniform4fv(u.uBands, this.bandData);
    gl.uniform1i(u.uBandCount, this.bandCount);
    gl.uniform1f(u.uWaveAmp, this.settings.animate ? this.waveAmp : 7);
    gl.uniform1f(u.uDepth, depth);
    gl.uniform1f(u.uCaustics, this.settings.causticLayers);
    gl.uniform4f(u.uReflRect, rx, ry, rw, rh);
    gl.uniform1f(u.uReflOn, reflOn);
    gl.uniform1f(u.uRipples, this.ripples ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const count = Math.min(this.settings.particles, this.particleCapacity);
    if (count > 0) {
      const p = this.particles.u;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(this.particles.program);
      gl.bindVertexArray(this.particleVao);
      gl.uniform2f(p.uViewport, this.cssW, this.cssH);
      gl.uniform1f(p.uScroll, this.lastScroll);
      gl.uniform1f(p.uTime, this.time % 3600);
      gl.uniform3f(p.uMouse, this.lightX, this.lightY, presence);
      gl.uniform4fv(p.uBands, this.bandData);
      gl.uniform1i(p.uBandCount, this.bandCount);
      gl.uniform1f(p.uPointScale, this.canvas.width / this.cssW);
      gl.uniform1f(p.uIntro, this.intro01);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.disable(gl.BLEND);
      gl.bindVertexArray(this.vao);
    }

    if (!this.revealed) {
      this.revealed = true;
      // Only now — with real water on screen — let the sections go
      // transparent. Their solid colours fade out over the canvas, which
      // already paints nearly the same colour underneath: no flash.
      requestAnimationFrame(() => document.documentElement.classList.add('liquid'));
    }
  }
}

export function createEngine(canvas: HTMLCanvasElement, tier: Tier): LiquidEngine | null {
  if (tier === 'off') return null;
  try {
    return new Engine(canvas, tier);
  } catch (error) {
    console.warn('[liquid] water disabled:', error);
    document.documentElement.dataset.liquidTier = 'off';
    return null;
  }
}
