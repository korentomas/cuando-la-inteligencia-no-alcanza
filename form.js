// Particle formations: every slide builds a Form (target positions, colours, sizes)
// and the engine morphs the shared cloud of N points into it.
export const N = 24000;

export function rng(a) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export const gauss = R => Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(6.2831853 * R());

export const C = {
  blue: [.22, .4, 1], red: [1, .2, .14], gold: [1, .66, .2], orange: [1, .3, .07],
  white: [.78, .82, 1], cyan: [.2, .8, 1], violet: [.58, .3, 1], green: [.25, 1, .5],
  dim: [.1, .13, .3], pink: [1, .3, .7],
};
export const k = (c, s) => [c[0] * s, c[1] * s, c[2] * s];
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// Stable background starfield: an index always has the same dust spot, so
// unused particles drift back to the same sky on every slide.
const DUST = new Float32Array(N * 3), DUSTC = new Float32Array(N * 3), DUSTS = new Float32Array(N);
{
  const R = rng(99);
  for (let i = 0; i < N; i++) {
    DUST[i * 3] = (R() - .5) * 320; DUST[i * 3 + 1] = (R() - .5) * 190; DUST[i * 3 + 2] = -40 - R() * 180;
    const b = R() < .03 ? .5 + R() * .4 : .05 + R() * .14, w = R();
    DUSTC[i * 3] = b * (.55 + .3 * w); DUSTC[i * 3 + 1] = b * (.62 + .2 * w); DUSTC[i * 3 + 2] = b * 1.25;
    DUSTS[i] = .9 + R() * 1.6;
  }
}

export class Form {
  constructor() {
    this.p = new Float32Array(N * 3); this.c = new Float32Array(N * 3); this.s = new Float32Array(N);
    this.n = 0; this.lives = [];
  }
  add(x, y, z, c, s = 1) {
    const i = this.n; if (i >= N) return -1; this.n++;
    const j = i * 3;
    this.p[j] = x; this.p[j + 1] = y; this.p[j + 2] = z;
    this.c[j] = c[0]; this.c[j + 1] = c[1]; this.c[j + 2] = c[2];
    this.s[i] = s; return i;
  }
  live(fn) { if (fn) this.lives.push(fn); return this; }
  finish() {
    for (let i = this.n; i < N; i++) {
      const j = i * 3;
      this.p[j] = DUST[j]; this.p[j + 1] = DUST[j + 1]; this.p[j + 2] = DUST[j + 2];
      this.c[j] = DUSTC[j]; this.c[j + 1] = DUSTC[j + 1]; this.c[j + 2] = DUSTC[j + 2];
      this.s[i] = DUSTS[i];
    }
    return this;
  }
}

// Rasterise text with the deck font and return [x, y] samples in world units.
export function textPts(str, { weight = 800, px = 220, width = 40, cx = 0, cy = 0, gap = 3, lineH = 1.02 } = {}) {
  const lines = str.split('\n');
  const font = `${weight} ${px}px "Bricolage Grotesque"`;
  const cv = document.createElement('canvas'), g = cv.getContext('2d');
  g.font = font;
  const tw = Math.max(...lines.map(l => g.measureText(l).width));
  cv.width = Math.ceil(tw) + 20; cv.height = Math.ceil(px * lineH * lines.length) + 30;
  g.font = font; g.fillStyle = '#fff'; g.textBaseline = 'top'; g.textAlign = 'center';
  lines.forEach((l, i) => g.fillText(l, cv.width / 2, 10 + i * px * lineH));
  const d = g.getImageData(0, 0, cv.width, cv.height).data, s = width / cv.width, out = [];
  for (let y = 0; y < cv.height; y += gap) for (let x = 0; x < cv.width; x += gap)
    if (d[(y * cv.width + x) * 4 + 3] > 128) out.push([cx + (x - cv.width / 2) * s, cy - (y - cv.height / 2) * s]);
  return out;
}

export async function imageData(url) {
  const img = new Image(); img.src = url; await img.decode();
  const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  return { w: img.width, h: img.height, data: g.getImageData(0, 0, img.width, img.height).data };
}
