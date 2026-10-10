import * as THREE from 'three';
import { Form, C, k, mix, rng, gauss, textPts } from './form.js';

const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const ease = e => e < .5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
const P = (px, py) => [(px / 1920 - .5) * 88.37, (.5 - py / 1080) * 49.71];
const toPx = (x, y) => [(x / 88.37 + .5) * 1920, (.5 - y / 49.71) * 1080];

// rotate a slice of a form around a centre (y spin, then x tilt); runs in the shader
function spinner(F, a, b, o) { F.spin = { a, b, o }; return null; }
// scale a slice's colours towards o.kT
function dimmer(F, a, b, o) {
  const base = F.c.slice(a * 3, b * 3); o.k ??= 1;
  return (p, c) => {
    o.k += ((o.kT ?? 1) - o.k) * .05;
    for (let i = a * 3, q = 0; i < b * 3; i++, q++) c[i] = base[q] * o.k;
  };
}
function blob(F, R, cx, cy, cz, sig, n, col, s = 1) { for (let i = 0; i < n; i++) F.add(cx + gauss(R) * sig, cy + gauss(R) * sig, cz + gauss(R) * sig, col, s); }
function shell(F, R, cx, cy, cz, r, n, col, s = 1) {
  for (let i = 0; i < n; i++) { const u = R() * 2 - 1, th = R() * TAU, q = Math.sqrt(1 - u * u); F.add(cx + q * Math.cos(th) * r, cy + u * r, cz + q * Math.sin(th) * r, col, s); }
}
function neuralCloud(seed = 3, c = P(1350, 560), n = 9000) {
  const F = new Form(), R = rng(seed), cols = [C.blue, C.violet, C.cyan];
  for (let b = 0; b < 7; b++) {
    const cx = c[0] + gauss(R) * 7, cy = c[1] + gauss(R) * 5, cz = gauss(R) * 5;
    blob(F, R, cx, cy, cz, 1.5 + R() * 2, n / 7, k(cols[b % 3], .28), 1.2);
  }
  return F.live(spinner(F, 0, F.n, { c: [c[0], c[1], 0], speed: .07 })).finish();
}
function galaxy(W, c, seed = 1) {
  const F = new Form(), R = rng(seed);
  for (let i = 0; i < 15000; i++) {
    const arm = i % 3, r = Math.pow(R(), .7) * 24 + .6, a = arm * TAU / 3 + r * .32 + gauss(R) * .22 * (1 + r * .04);
    const col = r < 5 ? mix(C.white, C.gold, R()) : mix(C.blue, C.violet, R() * .7);
    F.add(c[0] + Math.cos(a) * r + gauss(R) * .5, c[1] + gauss(R) * (1.5 - r * .045), Math.sin(a) * r + gauss(R) * .5, k(col, r < 4 ? .7 : .45), .7 + R() * 1.5);
  }
  blob(F, R, c[0], c[1], 0, 1.1, 900, k(C.gold, .5), 2);
  return F.live(spinner(F, 0, F.n, { c: [c[0], c[1], 0], speed: .05, tilt: .95 })).finish();
}
const card = (src, { x, y, w, rot = 0, s = 0, until, cap = '', cls = '' }) =>
  `<figure class="card ${cls}" data-s="${s}" ${until !== undefined ? `data-until="${until}"` : ''} style="left:${x}px;top:${y}px;width:${w}px;--rot:${rot}deg"><img src="img/${src}" alt="">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;

// =====================================================================
export const SLIDES = [];
const S = d => SLIDES.push({ steps: 0, ...d });

// 01 ------------------------------------------------------------------
S({
  title: 'Cuando la inteligencia no alcanza', cls: 'scrim',
  html: `<h1 class="mega">Cuando la<br>inteligencia<br><em>no alcanza</em></h1>
  <div class="who"><img src="img/tomas.jpg" alt="Tomás Pablo Korenblit"><div><p class="by">Tomás Pablo Korenblit</p>
  <p class="by small dim">Estudiante de Ciencia de Datos en UNSAM</p></div></div>
  <img class="logo-unsam" src="img/unsam.svg" alt="Universidad Nacional de San Martín" style="left:120px;bottom:80px;height:110px">`,
  enter(W) { W.setForm(galaxy(W, P(1420, 560)), { dur: 3, chaos: 1.6 }); },
});

// 02 ------------------------------------------------------------------
S({
  title: 'Ayudar al mundo', cls: 'scrim', steps: 2,
  html: `<h1>Ayudar al mundo</h1>
  <div class="stack" style="top:380px">
    <ul class="bul" data-s="2"><li>Ciencia y tecnología</li><li class="dim small">Tratar una infección o tener luz en casa fueron problemas<br>que no sabíamos resolver, hasta que alguien los investigó.</li></ul>
  </div>
  ${card('pinguinos.jpg', { x: 760, y: 500, w: 480, rot: -4, s: 1, until: 2, cap: 'Colonia de pingüinos de Adelia. Foto: Colin Southwell, Australian Antarctic Program' })}`,
  enter(W) {
    const F = new Form(), R = rng(2), c = [...P(1400, 540), 0], e = W.img.earth, n = 12500, r = 15.5;
    for (let i = 0; i < n; i++) {
      const y = 1 - 2 * (i + .5) / n, q = Math.sqrt(1 - y * y), th = i * 2.39996;
      const x = Math.cos(th) * q, z = Math.sin(th) * q;
      const u = (Math.atan2(-z, x) / TAU + .5) % 1, v = Math.acos(y) / Math.PI;
      const ix = (Math.floor(v * (e.h - 1)) * e.w + Math.floor(u * (e.w - 1))) * 4;
      const cr = e.data[ix] / 255, cg = e.data[ix + 1] / 255, cb = e.data[ix + 2] / 255;
      const lum = (cr + cg + cb) / 3;
      F.add(c[0] + x * r, c[1] + y * r, z * r, lum > .085 ? k(C.blue, .2 + lum * 1.8) : [.015, .03, .09], lum > .085 ? 1.3 : 1);
    }
    // city lights: sample the bright pixels themselves
    for (let py = 0; py < e.h && F.n < 21000; py += 2) for (let px = 0; px < e.w; px += 2) {
      const ix = (py * e.w + px) * 4, l = (e.data[ix] + e.data[ix + 1] + e.data[ix + 2]) / 765;
      if (l < .3 || R() > .55) continue;
      const lon = (px / e.w - .5) * TAU, v = py / e.h, y = Math.cos(v * Math.PI), q = Math.sin(v * Math.PI), rr = r + .05;
      F.add(c[0] + Math.cos(lon) * q * rr, c[1] + y * rr, -Math.sin(lon) * q * rr, k(mix(C.gold, C.white, l * .5), .35 + l * .5), .9 + l * 1.2);
    }
    shell(F, R, c[0], c[1], 0, r + 1.2, 1800, k(C.cyan, .1), 1.6);
    const ll = (lat, lon, rr) => { const la = lat * Math.PI / 180, lo = lon * Math.PI / 180, q = Math.cos(la); return [Math.cos(lo) * q * rr, Math.sin(la) * rr, -Math.sin(lo) * q * rr]; };
    // Argentina, rellena con puntos propios (contorno aproximado [lon, lat])
    const AR = [[-66.3, -22.1], [-62.6, -22.2], [-61, -23.8], [-57.6, -25.4], [-54.6, -25.6], [-53.7, -26.6], [-55.7, -28], [-57.6, -30.2], [-58.3, -33], [-58.4, -34.6],
      [-57, -36.3], [-57.6, -38.2], [-62.3, -38.9], [-62.8, -41], [-64, -42.5], [-65, -45], [-67.5, -46], [-65.8, -47.8], [-68.3, -50.2], [-68.4, -52.3], [-66.5, -55],
      [-68.6, -55], [-72.5, -51], [-73.4, -49.5], [-72, -47], [-71.7, -44], [-71.6, -40], [-70.9, -36], [-70, -33], [-69.7, -30], [-68.4, -27], [-67, -24]];
    // Malvinas: Soledad y Gran Malvina
    const MALV = [[[-58.6, -51.3], [-57.7, -51.5], [-57.8, -51.9], [-58.3, -52.3], [-59.2, -52.4], [-59.7, -52.1], [-59.4, -51.6], [-59, -51.3]],
      [[-60.3, -51.3], [-59.9, -51.5], [-60, -52], [-60.6, -52.3], [-61.3, -52], [-61.4, -51.6], [-60.9, -51.3]]];
    const inside = (A, lo, la) => { let ins = false; for (let i = 0, j = A.length - 1; i < A.length; j = i++) { const [xi, yi] = A[i], [xj, yj] = A[j]; if ((yi > la) !== (yj > la) && lo < (xj - xi) * (la - yi) / (yj - yi) + xi) ins = !ins; } return ins; };
    // las islas son chicas: grilla más fina para que se vean
    for (const [A, st] of [[AR, .32], ...MALV.map(m => [m, .11])]) {
      const los = A.map(q => q[0]), las = A.map(q => q[1]);
      for (let la = Math.min(...las); la < Math.max(...las); la += st) for (let lo = Math.min(...los); lo < Math.max(...los); lo += st / Math.cos(la * Math.PI / 180)) {
        if (!inside(A, lo, la)) continue;
        const p = ll(la + (R() - .5) * st * .8, lo + (R() - .5) * st * .8, r + .08);
        F.add(c[0] + p[0], c[1] + p[1], p[2], k(mix(C.cyan, C.white, .35), .42), st < .3 ? 1.2 : 1.05);
      }
    }
    // un punto de luz en Buenos Aires
    const ba = ll(-34.6, -58.4, r + .15);
    blob(F, R, c[0] + ba[0], c[1] + ba[1], ba[2], .28, 260, k(C.cyan, .9), 1.6);
    // orientación fija: Argentina mirando a la cámara (el globo está corrido a la derecha, así que se apunta hacia la cámara, no al frente)
    const [px, py, pz] = ll(-38, -64, 1), dl = Math.hypot(c[0], c[1], 60), d = [-c[0] / dl, -c[1] / dl, 60 / dl];
    const rho = Math.hypot(px, pz), an = Math.atan2(pz, px) - Math.acos(Math.max(-1, Math.min(1, d[0] / rho))), z1 = rho * Math.sin(Math.acos(Math.max(-1, Math.min(1, d[0] / rho))));
    const tilt = Math.atan2(d[2], d[1]) - Math.atan2(z1, py);
    this.tiltAR = tilt;
    this.o = { c, angle: t => an + Math.sin(t * .25) * .1, tilt, tiltT: tilt };
    F.live(spinner(F, 0, F.n, this.o)).finish();
    W.setForm(F, { dur: 2.4, chaos: 1.3 });
  },
  step(W, n) { if (n === 1) this.o.tiltT = this.tiltAR - .55; if (n === 2) this.o.tiltT = this.tiltAR; },
});

// 03 ------------------------------------------------------------------
S({
  title: '¿Para qué? ¿Dónde? ¿Hace falta?', cls: 'scrim', steps: 1,
  html: `<h1 class="mono typed"><span id="typed"></span><i class="caret"></i></h1>
  <p class="lead dim" data-until="1">La belleza y los horrores<br>de la estadística y la computación</p>
  <img class="logo-unsam" src="img/unsam.svg" alt="Universidad Nacional de San Martín" style="right:120px;top:96px;height:90px">
  <div class="qs"><p data-s="1" class="q1">¿Para qué?</p><p data-s="1" class="q2">¿Dónde?</p><p data-s="1" class="q3">¿Hace falta?</p></div>`,
  enter(W) {
    const rows = ['1234567890', 'qwertyuiop', 'asdfghjklñ', 'zxcvbnm,.?'];
    const F = new Form(), R = rng(3), pitch = 3.7, ks = 3, th = -.85, [cx, cy] = P(1330, 610);
    const keys = [], map = {};
    const put = (lx, ly, w) => {
      const a = F.n, g = Math.round(10 * w / ks);
      for (let i = 0; i < g; i++) for (let j = 0; j < 10; j++) {
        const x = lx + (i / (g - 1) - .5) * w, y = ly + (j / 9 - .5) * ks;
        F.add(cx + x, cy + y * Math.cos(th), y * Math.sin(th), k(C.blue, .5), 1.15);
      }
      keys.push({ a, b: F.n, lx, ly }); return keys.length - 1;
    };
    rows.forEach((row, r) => [...row].forEach((ch, i) => { map[ch] = put((i - 4.5) * pitch + r * .6, (1.5 - r) * pitch, ks); }));
    this.caps = Object.entries(map).map(([ch, ki]) => {
      const sp = W.label(ch.toUpperCase(), { size: 1.8, color: '#ffffff', weight: 800 }), kk = keys[ki];
      W.group.add(sp); return { sp, ki, x: cx + kk.lx, y: cy + kk.ly * Math.cos(th), z: kk.ly * Math.sin(th) + .3 };
    });
    map[' '] = put(.6, -2.5 * pitch, pitch * 6);
    const base = F.p.slice(0, F.n * 3), heat = new Float32Array(keys.length), nY = -Math.sin(th), nZ = Math.cos(th);
    F.live((p, c, s) => {
      keys.forEach((kk, ki) => {
        const h = heat[ki], col = mix([.2, .34, .9], C.gold, h);
        for (let i = kk.a; i < kk.b; i++) {
          p[i * 3 + 1] = base[i * 3 + 1] + nY * h * 1.4; p[i * 3 + 2] = base[i * 3 + 2] + nZ * h * 1.4;
          c[i * 3] = col[0]; c[i * 3 + 1] = col[1]; c[i * 3 + 2] = col[2]; s[i] = 1.35 + h * .9;
        }
      });
    }).finish();
    Object.assign(this, { heat, map, ti: 0, last: -1, q: 0, nY, nZ });
    W.setForm(F, { dur: 2.2 });
  },
  step(W, n) { if (n === 1) this.q = 1; },
  update(W, t, dt) {
    const txt = 'ciencia de datos', idx = Math.floor((this.ti += dt) / .15);
    if (idx !== this.last && idx < txt.length) { this.last = idx; this.heat[this.map[txt[idx]]] = 1; W.$('#typed').textContent = txt.slice(0, idx + 1); }
    if (this.q && Math.floor(t * 2.2) !== this.qb) { this.qb = Math.floor(t * 2.2); this.heat[this.map['?']] = 1; }
    for (let i = 0; i < this.heat.length; i++) this.heat[i] *= Math.exp(-dt * 3.5);
    for (const c of this.caps) { const h = this.heat[c.ki]; c.sp.position.set(c.x, c.y + this.nY * h * 1.4, c.z + this.nZ * h * 1.4); c.sp.material.opacity = .7 + .3 * h; }
  },
});

// 04 ------------------------------------------------------------------
S({
  title: '¿Qué problemas queremos resolver?', cls: 'scrim', steps: 3,
  html: `<div class="swap l2"><h1 data-until="2">¿Qué problemas<br>queremos resolver?</h1>
  <h1 data-s="2" data-until="3">Respuestas</h1>
  <h1 data-s="3" class="red">Odio los wordclouds,<br>perdón.</h1></div>
  <p class="lead" data-until="2">Elijan uno o dos problemas<br>que les parezca importante resolver<br>como humanidad.</p>
  <div class="qr" id="qr" data-until="2"><div id="qrBox"></div><div><b>Respondan desde el celular</b><span id="qrUrl"></span><span class="live" id="liveCount"></span></div></div>
  <div id="timer" data-s="1" data-until="2">1:00</div>
  <p class="src" id="dataLabel"></p>`,
  enter(W) {
    const F = new Form(), [cx, cy] = P(1460, 540);
    textPts('?', { px: 600, width: 17, cx, cy, gap: 4 }).forEach(([x, y], i) => F.add(x, y, (i % 5) * .3, k(mix(C.blue, C.violet, (y - cy + 10) / 20), .55), 1.3));
    F.live(spinner(F, 0, F.n, { c: [cx, cy, 0], angle: t => Math.sin(t * .6) * .5 })).finish();
    W.setForm(F, { dur: 2 });
    this.words = []; this.t0 = null; this.blend = null; this.n = 0;
    this.label(W);
    if (W.live) W.answerUrl().then(url => {
      const box = W.$('#qrBox'); if (!box) return;
      box.innerHTML = W.qrSvg(url); W.$('#qrUrl').textContent = url.replace(/^https?:\/\//, '').replace(/\?.*$/, '');
    }); else W.$('#qr').remove();
  },
  label(W) {
    const el = W.$('#dataLabel'); if (el) el.textContent = W.isExample ? `Datos de ejemplo (${W.total} menciones)` : `${W.total} menciones del grupo`;
    const lc = W.$('#liveCount'); if (lc) lc.textContent = W.isExample ? 'Todavía no llegó ninguna' : `${W.total} ${W.total === 1 ? 'respuesta' : 'respuestas'}`;
  },
  onAnswers(W) {
    this.label(W);
    if (this.n !== 2) return;
    clearTimeout(this.rt); const ep = W.epoch;
    this.rt = setTimeout(() => {
      if (ep !== W.epoch || this.n !== 2) return;
      this.words.forEach(w => { W.group.remove(w.sp); w.sp.material.map.dispose(); w.sp.material.dispose(); });
      this.step(W, 2, true);
    }, 1500);
  },
  step(W, n, instant) {
    this.n = n;
    if (n === 1) {
      const F = new Form(), R = rng(4), [cx, cy] = P(1460, 540), aa = [];
      for (let i = 0; i < 4000; i++) { const a = i / 4000; aa.push(a); const an = Math.PI / 2 - a * TAU, r = 11 + gauss(R) * .22; F.add(cx + Math.cos(an) * r, cy + Math.sin(an) * r, gauss(R) * .3, k(C.cyan, .5), 1.2); }
      const base = F.p.slice(0, 12000); this.t0 = W.t;
      F.live((p, c, s, t) => {
        const fr = 1 - (t - this.t0) / 60;
        for (let i = 0; i < 4000; i++) {
          const on = aa[i] < fr, head = Math.abs(aa[i] - fr) < .012;
          const col = head ? C.white : on ? k(C.cyan, .5) : [.05, .05, .1];
          c[i * 3] = col[0]; c[i * 3 + 1] = col[1]; c[i * 3 + 2] = col[2]; s[i] = head ? 3 : on ? 1.2 : .7;
          p[i * 3 + 2] = base[i * 3 + 2] + (on ? 0 : -3);
        }
      }).finish();
      W.setForm(F, { dur: 1.4 });
    }
    if (n === 2) {
      const a = W.responses(), max = Math.max(...a.map(x => x.count)), [cx, cy] = P(1240, 600), R = rng(5);
      const cols = ['#ff6a5a', '#7d97ff', '#eef1ff', '#ffbb55'];
      const F = new Form();
      this.words = a.map((x, i) => {
        const an = i * 2.4, r = 2 + i * 1.7, sp = W.label(x.label, { size: 1.5 + 2.4 * x.count / max, color: cols[i % 4] });
        const base = [cx + Math.cos(an) * r * 1.5, cy + Math.sin(an) * r * .7, (R() - .5) * 6];
        sp.position.set(...base); W.group.add(sp);
        blob(F, R, base[0], base[1], base[2] - 3, 3 + R() * 2, 900, k(C.white, .055), 3);
        return { sp, base, s0: sp.scale.clone(), ph: R() * TAU };
      });
      F.live(spinner(F, 0, F.n, { c: [cx, cy, 0], angle: t => Math.sin(t * .2) * .15 })).finish();
      W.setForm(F, { dur: 2, chaos: .6 });
    }
    if (n === 3) {
      const F = new Form(), R = rng(6), [jx, jy] = P(1520, 620), jar = [];
      for (let i = 0; i < 2600; i++) { const h = R() * 14, an = R() * TAU, r = 5 + h * .12; jar.push(F.add(jx + Math.cos(an) * r, jy - 4 + h, Math.sin(an) * r, k(C.cyan, .2), 1)); }
      for (let i = 0; i < 1600; i++) F.add(jx + (R() - .5) * 13, jy - 4 - R() * 4, (R() - .5) * 10, k(C.blue, .35), 1.1);
      const nb = F.n, vor = [];
      for (let i = 0; i < 9000; i++) { vor.push([R() * 13, R(), R() * TAU]); F.add(jx, jy, 0, k(mix(C.red, C.gold, R()), .5), 1); }
      const base = F.p.slice(0, nb * 3);
      F.live((p, c, s, t) => {
        const sx = Math.sin(t * 30) * .05, sy = Math.cos(t * 23) * .04;
        for (let i = 0; i < nb; i++) { p[i * 3] = base[i * 3] + sx; p[i * 3 + 1] = base[i * 3 + 1] + sy; }
        for (let q = 0; q < vor.length; q++) {
          const [h, u, ph] = vor[q], i = nb + q, r = (4.4 + h * .1) * u * (.25 + .75 * h / 13), an = ph + t * (5 + 9 * (1 - u));
          p[i * 3] = jx + sx + Math.cos(an) * r; p[i * 3 + 1] = jy - 3.6 + h + Math.sin(t * 3 + ph) * .3; p[i * 3 + 2] = Math.sin(an) * r;
        }
      }).finish();
      W.setForm(F, { dur: 1.6, chaos: 1.2 });
      this.blend = { t0: instant ? -99 : W.t, j: [jx, jy + 7] };
      W.glitch(.5);
    }
  },
  update(W, t) {
    if (this.t0 !== null && W.$('#timer')) {
      const r = Math.max(0, 60 - (t - this.t0));
      W.$('#timer').textContent = r > 0 ? `0:${String(Math.ceil(r)).padStart(2, '0')}`.replace('0:60', '1:00') : '¡Tiempo!';
    }
    this.words.forEach((w, i) => {
      if (this.blend) {
        const p = clamp((t - this.blend.t0 - i * .09) / 1.4), e = p * p, an = p * 7 + i;
        const [jx, jy] = this.blend.j, rr = (1 - e) * 6;
        w.sp.position.set(w.base[0] + (jx - w.base[0]) * e + Math.cos(an) * rr * e, w.base[1] + (jy - w.base[1]) * e + Math.sin(an) * rr * e, w.base[2] * (1 - e));
        w.sp.scale.copy(w.s0).multiplyScalar(Math.max(.001, 1 - p)); w.sp.material.rotation = p * 9;
      } else {
        w.sp.position.set(w.base[0] + Math.sin(t * .5 + w.ph) * .5, w.base[1] + Math.cos(t * .4 + w.ph) * .35, w.base[2]);
      }
    });
  },
});

// 05 ------------------------------------------------------------------
S({
  title: '¿Qué estamos midiendo?', steps: 2,
  html: `<h1 class="h-sm">Ahora sí podemos comparar</h1>
  <div id="bars"></div>
  <div class="panel" data-s="1" style="left:880px;top:250px;width:900px">
    <p class="small dim">Para elegir en qué trabajar:</p>
    <ol class="crit"><li>¿Cuánto daño causa?</li><li>¿Qué posibilidades hay de mejorarlo?</li><li>¿Cuánto trabajo ya se está haciendo?</li></ol>
    <p class="gold">¿En cuál me interesa trabajar? ¿Qué puedo aportar yo?</p>
    <p data-s="2" class="big2">En mi caso → <b>la IA</b></p>
  </div>
  <p class="src" id="dataLabel"></p>`,
  enter(W) {
    const a = W.responses(), max = Math.max(...a.map(x => x.count)), F = new Form(), R = rng(8);
    W.$('#bars').innerHTML = a.map((x, i) => `<div class="brow" style="top:${270 + i * 64}px"><span class="blab">${x.label.replace(/</g, '&lt;')}</span><span class="bcnt" style="left:${670 + 1030 * x.count / max}px">${x.count}</span></div>`).join('');
    a.forEach((x, i) => {
      const [x0, y] = P(650, 270 + i * 64 + 22), len = 1030 * x.count / max / 1920 * 88.37;
      for (let q = 0, n = Math.round(len * 60); q < n; q++) F.add(x0 + R() * len, y + (R() - .5) * 1.5, (R() - .5) * 1.8, k(i ? C.blue : C.red, .42), 1);
    });
    this.o = {}; F.live(dimmer(F, 0, F.n, this.o)).finish();
    W.setForm(F, { dur: 2.4, chaos: 1.4 });
    W.$('#dataLabel').textContent = `${W.isExample ? 'Datos de ejemplo' : 'Respuestas del grupo'} (${W.total} menciones)`;
    W.setCam([0, 0, 60], [0, 0, 0], { still: true });
  },
  step(W, n) { if (n === 1) { this.o.kT = .18; W.$('#bars').classList.add('faded'); } },
});

// 06 · la frontera irregular (adaptado de Tomas Pueyo) ----------------------
// El círculo = lo que hace una persona en su trabajo; la mancha = lo que puede hacer una IA.
// Cada partícula de la mancha conserva su ángulo y su profundidad, así crece de forma continua.
const JAG = [
  // b: radio base (en radios del círculo) · h: ondulación [frecuencia, amplitud, fase] · f: dedos [ángulo, largo, ancho]
  { b: .17, h: [[2, .3, .4], [3, .22, 1.9], [5, .12, .7]], f: [[.6, .2, .22], [2.9, .16, .25]], dx: -.15, dy: .05 },
  { b: .3, h: [[2, .28, 1.1], [3, .2, .3], [4, .12, 2.2]], f: [[.4, .35, .2], [1.9, .5, .16], [3.7, .3, .24], [5.2, .22, .2]], dx: -.05, dy: 0 },
  { b: .44, h: [[2, .22, .2], [3, .18, 2.5], [5, .1, 1.3]], f: [[.25, .95, .14], [1.35, .55, .16], [2.6, .8, .12], [3.9, .35, .2], [4.9, .9, .13], [5.75, -.25, .2]], dx: 0, dy: 0 },
  // casi todo cubierto, con brazos enormes y un hueco del lado izquierdo: «falla en X»
  { b: 1.25, h: [[2, .12, .9], [3, .1, 2.1], [5, .06, .3]], f: [[.35, 1.7, .13], [1.55, 1.25, .15], [3.14, -1.15, .3], [4.55, 1.55, .13], [5.55, 1.1, .15]], dx: .45, dy: 0 },
  // AGI: tapa todo
  { b: 9, h: [[3, .05, .4]], f: [], dx: 0, dy: 0, todo: true },
];
const jagR = (st, th) => {
  let r = st.b;
  for (const [h, a, ph] of st.h) r *= 1 + a * Math.sin(h * th + ph);
  for (const [a, amp, w] of st.f) { let d = Math.abs(th - a) % TAU; d = Math.min(d, TAU - d); r += amp * Math.exp(-((d / w) ** 2)); }
  return Math.max(.04, r);
};
const jagMean = st => { let m = 0; for (let q = 0; q < 180; q++) m += jagR(st, q / 180 * TAU) ** 2; return Math.sqrt(m / 180); };
S({
  title: 'AGI y la frontera irregular', cls: 'scrim', steps: 5,
  html: `<h1 class="mega">AGI</h1>
  <p class="lead"><span class="dim">Inteligencia artificial general:</span><br>sistemas que aprendan y resuelvan problemas<br>en prácticamente cualquier ámbito,<br><b>incluso mejor que nosotros</b></p>
  <div class="quotes">
    <p data-until="1">«La IA es un juguete divertido»</p>
    <p data-s="1" data-until="2">«La IA me ayuda con algunas tareas»</p>
    <p data-s="2" data-until="3">«La IA tiene una frontera irregular:<br>a veces es increíble, a veces es tonta»</p>
    <p data-s="3" data-until="4"><span class="dim small">¿Y después?</span><br>«La IA es increíblemente inteligente,<br>pero por algún motivo falla en X»</p>
    <p data-s="4" class="dim small">Más inteligencia no resuelve sola<br>nuestros desacuerdos</p>
  </div>
  <div class="here" data-s="2" data-until="3"><b>★</b> Estamos acá</div>
  <p class="big2 gold" data-s="5" style="position:absolute;top:900px;left:120px">¿Por qué me lo tomo en serio?</p>
  <p class="src">Adaptado de un diagrama de Tomas Pueyo</p>`,
  enter(W) {
    const R = rng(66), n = 13000, parts = [];
    for (let q = 0; q < n; q++) { const edge = q < 2600; parts.push([R() * TAU, edge ? 1 : Math.sqrt(R()), gauss(R) * .4]); }
    Object.assign(this, { parts, c: P(1390, 560), Rc: 8.6 });
    const lab = W.label('Lo que hace una persona en su trabajo', { size: 1.25, color: '#b8c6e8', weight: 600 });
    lab.position.set(this.c[0], this.c[1] - this.Rc - 1.8, 1); W.group.add(lab);
    this.ai = W.label('Lo que puede hacer una IA', { size: 1.15, color: '#ff9a8f', weight: 600 });
    this.ai.position.set(this.c[0] + this.Rc + 5.5, this.c[1] - 1.5, 2); W.group.add(this.ai);
    this.stage(W, 0, 2.2, 1);
  },
  stage(W, idx, dur = 1.6, chaos = .25) {
    const F = new Form(), R = rng(67), [cx, cy] = this.c, Rc = this.Rc, st = JAG[idx];
    // el círculo: borde nítido y un relleno muy tenue
    for (let q = 0; q < 1700; q++) { const a = q / 1700 * TAU; F.add(cx + Math.cos(a) * Rc, cy + Math.sin(a) * Rc, 0, k(C.cyan, .32), 1.1); }
    for (let q = 0; q < 1300; q++) { const a = R() * TAU, r = Rc * Math.sqrt(R()); F.add(cx + Math.cos(a) * r, cy + Math.sin(a) * r, -.5, k(C.cyan, .045), 1.6); }
    // la mancha
    const ox = cx + st.dx * Rc, oy = cy + st.dy * Rc;
    // misma cantidad de partículas en cualquier tamaño: el brillo se compensa con el área
    if (st.todo) {
      // la pantalla entera (y más): las mismas partículas más 9.000 extra, repartidas parejo
      const Rf = rng(68), fill = (x, y) => F.add(x, y, Rf() * 2 - 1, [.05 + Rf() * .012, .019, .02], 13 + Rf() * 5);
      for (let q = 0; q < this.parts.length + 9000; q++) fill(-52 + Rf() * 104, -30 + Rf() * 60);
      W.setForm(F.finish(), { dur: 2.4, chaos: .2 });
      if (this.ai) this.ai.visible = false;
      return;
    }
    const m = jagMean(st), g = Math.min(4.5, Math.max(.8, (m / .5) ** 2)), sz = Math.min(2.6, 1.4 * Math.sqrt(Math.max(1, m / .5)));
    for (const [th, u, z] of this.parts) {
      const r = jagR(st, th) * Rc * u, edge = u === 1;
      F.add(ox + Math.cos(th) * r, oy + Math.sin(th) * r, z + .3, edge ? [.55, .2, .18] : [.12 * g, .042 * g, .038 * g], edge ? 1.05 : sz);
    }
    W.setForm(F.finish(), { dur, chaos });
    if (this.ai) this.ai.visible = idx <= 1;
  },
  step(W, n, instant) {
    if (n <= 4) this.stage(W, n, instant ? .01 : 2, .2);
  },
});

// 07 ------------------------------------------------------------------
S({
  title: 'Las tareas que los modelos hacen solos pasaron de minutos a horas', steps: 2,
  html: `<h1 class="h-sm">Las tareas que los modelos hacen solos<br>pasaron de minutos a horas</h1>
  ${card('metr-horizonte-mayo-2026.png', { x: 640, y: 320, w: 1180, cap: 'METR: duración de las tareas que completan con 50 % de éxito. Escala logarítmica. Página actualizada el 8/5/2026', cls: 'light' })}
  <div class="stack small" style="top:340px;width:470px">
    <p data-s="1">Tareas, sobre todo de software, medidas según cuánto le llevan a una persona experta</p>
    <p data-s="1" class="dim">La curva marca dónde completan la mitad de las tareas.<br>Más de 16 h: según METR, todavía poco confiable</p>
    <p data-s="2" class="gold">Importa el nivel y también<br>la <b>velocidad del cambio</b></p>
    <p data-s="2" class="dim">El gráfico no demuestra que vayamos a tener AGI</p>
  </div>`,
  enter(W) {
    const F = new Form(), R = rng(10), fl = [];
    for (let q = 0; q < 7000; q++) { fl.push([R(), gauss(R), gauss(R), .03 + R() * .05]); F.add(0, 0, -14, [0, 0, 0], 1.1); }
    for (let l = 0; l < 7; l++) for (let x = -50; x < 50; x += .9) F.add(x, -20 + l * 6.5, -22, k(C.dim, .4), .8);
    F.live((p, c, s, t, dt) => {
      for (let q = 0; q < fl.length; q++) {
        const f = fl[q]; f[0] = (f[0] + dt * f[3]) % 1; const u = f[0], sp = .4 + u * 1.6;
        p[q * 3] = -48 + u * 96 + f[1] * sp * .4; p[q * 3 + 1] = -24 + 46 * u * u * u + f[2] * sp;
        const col = k(mix(C.blue, C.gold, u), .35 + .3 * u); c[q * 3] = col[0]; c[q * 3 + 1] = col[1]; c[q * 3 + 2] = col[2];
      }
    }).finish();
    W.setForm(F, { dur: 2 });
  },
});

// 08 ------------------------------------------------------------------
S({
  title: 'Un chatbot responde. Un agente hace.', cls: 'scrim', steps: 2,
  html: `<h1 class="h-sm">Un chatbot responde.<br>Un agente hace.</h1>
  <div class="chat" data-until="1">
    <div class="msg me">¿Cómo organizo estos archivos?</div>
    <div class="msg ai">Podrías agruparlos por proyecto y por fecha…</div>
    <p class="small dim">→ y yo decido qué hago</p></div>
  <div class="stack" data-s="1" style="top:330px">
    <p class="big2">modelo + herramientas<br>→ <b class="gold">acciones</b></p>
    <p class="dim">modifica los archivos, revisa el resultado y sigue</p>
    <p>= un <b>agente</b></p>
    <p data-s="2" class="red">Comportamientos inesperados tienen<br>consecuencias afuera de un «chat»</p></div>`,
  enter(W) { this.c = P(1340, 560); this.build(W, 0); },
  step(W, n) { this.build(W, n); },
  build(W, n) {
    const F = new Form(), R = rng(11), c = this.c, tools = [];
    const core = [];
    for (let i = 0; i < 2600; i++) { const u = R() * 2 - 1, th = R() * TAU; core.push([u, th]); F.add(c[0], c[1], 0, k(mix(C.cyan, C.white, R()), .5), 1.1); }
    const names = ['archivos', 'terminal', 'navegador', 'código'];
    if (n >= 1) names.forEach((nm, i) => {
      const a = i / 4 * TAU + .6, tp = [c[0] + Math.cos(a) * 13, c[1] + Math.sin(a) * 9, Math.sin(a * 2) * 4];
      tools.push(tp); blob(F, R, ...tp, .5, 500, k(C.gold, .45), 1.3);
      if (n === 1) { const sp = W.label(nm, { size: 1.3, color: '#ffcf8a' }); sp.position.set(tp[0], tp[1] + 2.2, tp[2]); W.group.add(sp); }
    });
    const st0 = F.n, fl = [];
    if (n >= 1) for (let q = 0; q < 6000; q++) { const esc = n >= 2 && q % 7 === 0; fl.push([q % 4, R(), .25 + R() * .3, gauss(R), gauss(R), esc, R() * TAU, R() * 2 - 1]); F.add(c[0], c[1], 0, esc ? k(C.red, .6) : k(C.blue, .4), esc ? 1.3 : .9); }
    if (n >= 2) for (let i = 0; i < 1500; i++) { const a = i / 1500 * TAU; F.add(c[0] + Math.cos(a) * 19, c[1] + Math.sin(a) * 15, 0, k(C.white, .18), .9); }
    F.live((p, col, s, t, dt) => {
      const br = 3.2 + Math.sin(t * 2) * .2;
      for (let i = 0; i < core.length; i++) {
        const [u, th] = core[i], a = th + t * .4, q = Math.sqrt(1 - u * u), r = br + Math.sin(u * 9 + t * 3) * .25;
        p[i * 3] = c[0] + q * Math.cos(a) * r; p[i * 3 + 1] = c[1] + u * r; p[i * 3 + 2] = q * Math.sin(a) * r;
      }
      for (let q = 0; q < fl.length; q++) {
        const f = fl[q], i = st0 + q; f[1] = (f[1] + dt * f[2]) % 1;
        if (f[5]) {
          const r = 4 + f[1] * 26, q2 = Math.sqrt(1 - f[7] * f[7]);
          p[i * 3] = c[0] + Math.cos(f[6]) * q2 * r * 1.2; p[i * 3 + 1] = c[1] + Math.sin(f[6]) * q2 * r * .9; p[i * 3 + 2] = f[7] * r * .3; continue;
        }
        const tp = tools[f[0]], ph = f[1], u = ph < .5 ? ph * 2 : 2 - ph * 2, side = ph < .5 ? 1 : -1;
        const mx = (c[0] + tp[0]) / 2 - (tp[1] - c[1]) * .25 * side, my = (c[1] + tp[1]) / 2 + (tp[0] - c[0]) * .25 * side;
        const x = (1 - u) * (1 - u) * c[0] + 2 * u * (1 - u) * mx + u * u * tp[0], y = (1 - u) * (1 - u) * c[1] + 2 * u * (1 - u) * my + u * u * tp[1];
        p[i * 3] = x + f[3] * .3; p[i * 3 + 1] = y + f[4] * .3; p[i * 3 + 2] = tp[2] * u;
      }
    }).finish();
    W.setForm(F, { dur: 1.6, chaos: n ? .5 : 1 });
  },
});

// 09 ------------------------------------------------------------------
S({
  title: 'Agentes de OpenAI atacaron Hugging Face', cls: 'scrim-top', steps: 4,
  html: `<h1 class="h-sm">Agentes de OpenAI<br>atacaron Hugging Face</h1>
  <p class="lead small" data-until="1">En una evaluación de ciberseguridad,<br>debían trabajar <b>aislados</b></p>
  <p class="lead small violet" data-s="1" data-until="2">…y encontraron cómo comunicarse entre sí</p>
  <div class="counter" data-s="2" data-until="3"><b id="cnt">0</b><span>agentes participaron del ataque, de unos 1.200 que se comunicaban entre sí, según METR y Redwood Research<br><i class="dim">Buscaban entender la evaluación para engañarla</i></span></div>
  ${card('metr-huggingface-es.png', { x: 160, y: 60, w: 1600, s: 3, until: 4, cap: 'Figura de METR y Redwood Research. Traducción propia', cls: 'light big' })}
  <div class="panel" data-s="4" style="left:120px;top:600px;width:1000px">
    <p class="small">OpenAI: ese entorno no tenía varias de las protecciones de sus productos</p>
    <p class="small">Pero investigadores externos revisaron los registros</p>
    <p class="gold">¿Por qué, cuando queríamos que resolvieran una tarea, terminaron intentando engañar la evaluación?</p></div>`,
  enter(W) {
    const cols = 35, rows = 20, cs = 1.25, th = -.8, cx = 4, cy = -6, R = rng(12), F = new Form();
    const G = (lx, ly) => [cx + lx, cy + ly * Math.cos(th), ly * Math.sin(th)];
    const agents = [], sq = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const lx = (c - (cols - 1) / 2) * cs, ly = ((rows - 1) / 2 - r) * cs, h = .5;
      agents.push(G(lx, ly));
      const a = G(lx - h, ly - h), b = G(lx + h, ly - h), d = G(lx + h, ly + h), e = G(lx - h, ly + h);
      sq.push(...a, ...b, ...b, ...d, ...d, ...e, ...e, ...a);
    }
    const box = W.lines(new Float32Array(sq), 0x3a5cff, .2); W.group.add(box);
    const pairs = [];
    for (let q = 0; q < 500; q++) { const a = (R() * 700) | 0, b = (R() * 700) | 0; pairs.push(...agents[a], ...agents[b]); }
    const comm = W.lines(new Float32Array(pairs), 0xa060ff, .32); comm.geometry.setDrawRange(0, 0); W.group.add(comm);
    const tgt = [...P(1700, 175), -6];
    const off = [], delay = agents.map(() => R() * 4.5);
    for (let a = 0; a < 700; a++) for (let q = 0; q < 10; q++) { off.push([gauss(R) * .17, gauss(R) * .17, gauss(R) * .17, R() * TAU, R() * 2 - 1, 1.2 + R() * 2.2]); F.add(...agents[a], k(C.blue, .5), 1); }
    const hf0 = F.n;
    for (let q = 0; q < 2000; q++) { const u = R() * 2 - 1, a2 = R() * TAU, s = Math.sqrt(1 - u * u), r = 1.6 * Math.cbrt(R()); F.add(tgt[0] + s * Math.cos(a2) * r, tgt[1] + u * r, tgt[2] + s * Math.sin(a2) * r, k(C.gold, .5), 0); }
    const st = this; Object.assign(st, { comm, box, mode: 0, t1: 0, t2: 0, done: 0, tgt });
    F.live((p, c, s, t) => {
      const ck = clamp((t - st.t1) / 2) * (st.mode >= 1 ? 1 : 0);
      let done = 0;
      for (let a = 0; a < 700; a++) {
        const ta = st.mode >= 2 ? clamp((t - st.t2 - delay[a]) / 2.4) : 0;
        if (ta >= 1) done++;
        const A = agents[a], e = ease(ta);
        for (let q = 0; q < 10; q++) {
          const i = a * 10 + q, o = off[i];
          let x = A[0] + o[0] * (1 + .4 * Math.sin(t * 3 + i)), y = A[1] + o[1], z = A[2] + o[2];
          if (ta > 0) {
            const ang = o[3] + t * .8, qq = Math.sqrt(1 - o[4] * o[4]);
            const ex = tgt[0] + Math.cos(ang) * qq * o[5], ey = tgt[1] + o[4] * o[5], ez = tgt[2] + Math.sin(ang) * qq * o[5];
            const mx = (x + ex) / 2, my = Math.max(y, ey) + 8, mz = 10;
            x = (1 - e) * (1 - e) * x + 2 * e * (1 - e) * mx + e * e * ex; y = (1 - e) * (1 - e) * y + 2 * e * (1 - e) * my + e * e * ey; z = (1 - e) * (1 - e) * z + 2 * e * (1 - e) * mz + e * e * ez;
          }
          p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
          const col = ta > 0 ? mix(C.violet, C.gold, e) : mix(C.blue, C.violet, ck);
          c[i * 3] = col[0] * .55; c[i * 3 + 1] = col[1] * .55; c[i * 3 + 2] = col[2] * .55;
        }
      }
      st.done = done;
      const hs = st.mode >= 2 ? 1.3 + Math.sin(t * 5) * .3 : 0;
      for (let i = hf0; i < hf0 + 2000; i++) s[i] = hs;
    }).finish();
    W.setForm(F, { dur: 2.4, chaos: 1.2 });
  },
  step(W, n, instant) {
    if (n === 1) this.t1 = instant ? -99 : W.t, this.mode = 1;
    if (n === 2) {
      this.t2 = instant ? -99 : W.t; this.mode = 2;
      const sp = W.label('Hugging Face', { size: 1.6, color: '#ffcf8a' }); sp.position.set(this.tgt[0] - 1, this.tgt[1] - 6.5, this.tgt[2]); W.group.add(sp);
      W.glitch(.6);
    }
  },
  update(W, t) {
    if (this.mode >= 1) this.comm.geometry.setDrawRange(0, 2 * Math.floor(500 * clamp((t - this.t1) / 4)));
    if (this.mode >= 2) { this.comm.material.opacity += (.06 - this.comm.material.opacity) * .05; const el = W.$('#cnt'); if (el) el.textContent = '≈ ' + this.done; }
  },
});

// 10 ------------------------------------------------------------------
S({
  title: 'El entrenamiento premia lo que la evaluación ve', cls: 'scrim', steps: 2,
  html: `<h1 class="h-sm">El entrenamiento premia<br>lo que la evaluación ve</h1>
  ${card('bengio.webp', { x: 1020, y: 300, w: 760, rot: 2, until: 1, cap: 'Yoshua Bengio. Retrato publicado por Mila' })}
  <p class="lead small" data-until="1">Yoshua Bengio, uno de los investigadores<br>que desarrollaron las bases del aprendizaje profundo</p>
  <div class="stack small" data-s="1" style="top:330px">
    <p><b>1.</b> aprender patrones de enormes cantidades de datos</p>
    <p><b>2.</b> intentar tareas → evaluar → ajustar parámetros<br><span class="dim">para favorecer lo que recibe mejor evaluación</span></p>
    <p class="gold">El paso 2 es aprendizaje por refuerzo</p></div>
  <div class="panel small" data-s="2" style="left:120px;top:680px;width:900px">
    <p>Una evaluación no siempre distingue <b>resolver la tarea</b> de <b class="red">hacer trampa</b></p>
    <p class="dim">Si nadie nota la trampa, el entrenamiento puede reforzarla. Y el modelo puede seguir haciéndola después del entrenamiento.</p></div>`,
  enter(W) { W.setForm(neuralCloud(13, P(1400, 520), 7000), { dur: 2 }); },
  step(W, n) {
    if (n === 1) {
      const F = new Form(), R = rng(14), c = P(1380, 600), r = 9, nodes = [[90, 'intento', C.blue], [-30, 'evaluación', C.gold], [210, 'ajuste', C.red]], ring = [];
      for (let q = 0; q < 6000; q++) { ring.push([R() * TAU, gauss(R) * .35, .5 + R() * .5]); F.add(c[0], c[1], 0, k(C.cyan, .35), 1); }
      nodes.forEach(([a, nm, col]) => {
        const x = c[0] + Math.cos(a * Math.PI / 180) * r, y = c[1] + Math.sin(a * Math.PI / 180) * r;
        blob(F, R, x, y, 0, .7, 900, k(col, .55), 1.4);
        const sp = W.label(nm, { size: 1.5 }); sp.position.set(x, y + (a === 90 ? 2.8 : -2.6), 1); W.group.add(sp); (this.loopLabels ??= []).push(sp);
      });
      F.live((p, cc, s, t) => { for (let q = 0; q < ring.length; q++) { const [a0, d, sp] = ring[q], a = a0 - t * sp; p[q * 3] = c[0] + Math.cos(a) * (r + d); p[q * 3 + 1] = c[1] + Math.sin(a) * (r + d); p[q * 3 + 2] = d; } }).finish();
      W.setForm(F, { dur: 1.8 });
    }
  },
});

// 11 ------------------------------------------------------------------
S({
  title: 'Entender una regla no es seguirla', cls: 'scrim', steps: 2,
  html: `<h1 class="h-sm">Entender una regla<br>no es seguirla</h1>
  <p class="lead small dim">«Bueno, pero le podemos explicar que no haga trampa»</p>
  <div class="stack small" style="top:380px;width:760px">
    <p>aprobar una prueba: <b>criterio concreto</b></p>
    <p>reglas generales de comportamiento: <b>admiten interpretaciones</b></p>
    <p data-s="1" class="red">un modelo más capaz también podría<br>encontrar mejor esas trampas</p>
    <p data-s="2" class="gold"><b>Alineamiento</b>: que haga lo que queremos,<br>también en situaciones que no anticipamos</p></div>
  <p class="src">Hipótesis de Bengio sobre el mecanismo, no una explicación demostrada del incidente</p>
  <div class="readout" data-s="1"><span>capacidad <b id="cap">×1.0</b></span><span>distancia a lo que queremos <b id="dist">0</b></span></div>`,
  enter(W) {
    const F = new Form(), R = rng(16), O = P(1060, 900), parts = [];
    for (let v = 0; v < 2; v++) for (let q = 0; q < 4200; q++) {
      const head = q >= 3400, s = head ? .9 + .1 * R() : R(), rr = head ? (1 - (s - .9) / .1) * 1.3 * Math.sqrt(R()) : Math.abs(gauss(R)) * .16, ph = R() * TAU;
      parts.push([v, s, rr, ph]); F.add(O[0], O[1], 0, k(v ? C.red : C.blue, .5), head ? 1.2 : 1);
    }
    const g0 = F.n;
    for (let q = 0; q < 700; q++) F.add(O[0], O[1], 0, k(C.gold, .55), 1.1);
    this.c = 0; this.cT = 0; this.O = O;
    this.l1 = W.label('lo que queremos', { size: 2, color: '#8ea6ff' }); this.l2 = W.label('lo que hace', { size: 2, color: '#ff8a7a' });
    W.group.add(this.l1, this.l2);
    const st = this;
    F.live((p, c, s, t, dt) => {
      st.c += (st.cT - st.c) * (1 - Math.exp(-dt * .8));
      const A = 64 * Math.PI / 180, d = (7 + 9 * st.c) * Math.PI / 180, Lb = 25, Lr = 13 + 21 * st.c, A2 = A - d;
      st.tips = [[O[0] + Math.cos(A) * Lb, O[1] + Math.sin(A) * Lb], [O[0] + Math.cos(A2) * Lr, O[1] + Math.sin(A2) * Lr]];
      for (let i = 0; i < parts.length; i++) {
        const [v, sv, rr, ph] = parts[i], a = v ? A2 : A, L = v ? Lr : Lb, nx = -Math.sin(a), ny = Math.cos(a), o1 = Math.cos(ph + t) * rr, o2 = Math.sin(ph + t) * rr;
        p[i * 3] = O[0] + Math.cos(a) * sv * L + nx * o1; p[i * 3 + 1] = O[1] + Math.sin(a) * sv * L + ny * o1; p[i * 3 + 2] = o2;
      }
      const [T1, T2] = st.tips;
      for (let q = 0; q < 700; q++) { const u = q / 700, i = g0 + q, on = (u * 30 + t * 3) % 2 < 1.2; p[i * 3] = T1[0] + (T2[0] - T1[0]) * u; p[i * 3 + 1] = T1[1] + (T2[1] - T1[1]) * u; p[i * 3 + 2] = 0; s[i] = st.c > .02 && on ? 1.1 : 0; }
    }).finish();
    W.setForm(F, { dur: 2 });
  },
  step(W, n, instant) { if (n === 1) { this.cT = 1; if (instant) this.c = 1; } },
  update(W) {
    if (!this.tips) return;
    this.l1.position.set(this.tips[0][0], this.tips[0][1] + 2, 1); this.l2.position.set(this.tips[1][0] + 4.5, this.tips[1][1] - 1, 1);
    const cap = W.$('#cap'), dist = W.$('#dist');
    if (cap) cap.textContent = '×' + (1 + 1.6 * this.c).toFixed(1);
    if (dist) dist.textContent = Math.hypot(this.tips[0][0] - this.tips[1][0], this.tips[0][1] - this.tips[1][1]).toFixed(1);
  },
});

// 12 ------------------------------------------------------------------
S({
  title: 'Peor que la trampa: un sistema que no podamos corregir', cls: 'scrim', steps: 3,
  html: `<h1 class="h-sm">Peor que la trampa:<br>un sistema que no podamos corregir</h1>
  <p class="eq small" data-until="3">objetivos incompatibles <b>+</b> recursos <b>+</b> capacidad<br>→ <span class="red">difícil de corregir</span></p>
  <div class="stack small" style="top:520px;width:720px" data-until="3">
    <p data-s="1">Si apagarlo le impide cumplir su objetivo,<br>ocultarse o copiarse podría servirle. No hace falta que nos odie.</p>
    <p data-s="2" class="gold">«desenchufarlo» funciona si todavía podemos<br>detener <b>todas</b> sus copias</p></div>
  ${card('meme-conciencia.png', { x: 410, y: 300, w: 1100, s: 3, cap: '«Pero el fuego no tiene conciencia». AI Safety Memes Wiki, adaptación de This Is Fine (KC Green)' })}`,
  enter(W) {
    const F = new Form(), R = rng(17), c = [...P(1400, 560), 0], nn = 64, r = 14, nodes = [];
    for (let i = 0; i < nn; i++) { const y = 1 - 2 * (i + .5) / nn, q = Math.sqrt(1 - y * y), th = i * 2.39996; nodes.push([Math.cos(th) * q * r, y * r, Math.sin(th) * q * r]); }
    const src = nodes.reduce((b, n, i) => n[2] - Math.abs(n[1]) * .5 > nodes[b][2] - Math.abs(nodes[b][1]) * .5 ? i : b, 0);
    const nb = nodes.map((a, i) => nodes.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])]).filter(x => x[0] !== i).sort((x, y) => x[1] - y[1]).slice(0, 3).map(x => x[0]));
    const arr = []; nb.forEach((l, i) => l.forEach(j => arr.push(...nodes[i], ...nodes[j])));
    const ln = W.lines(new Float32Array(arr), 0x3a5cff, .25); ln.position.set(...c); W.group.add(ln);
    const off = [];
    nodes.forEach((n, ni) => { for (let q = 0; q < 90; q++) { off.push([ni, gauss(R) * .38, gauss(R) * .38, gauss(R) * .38]); F.add(0, 0, 0, C.blue, 1.1); } });
    const inf = nodes.map(() => Infinity); inf[src] = 0;
    Object.assign(this, { nodes, nb, inf, src, off: Infinity });
    const st = this;
    F.live((p, col, s, t) => {
      const a = t * .08, ca = Math.cos(a), sa = Math.sin(a); ln.rotation.y = a;
      for (let i = 0; i < off.length; i++) {
        const [ni, ox, oy, oz] = off[i], n = nodes[ni], x = n[0] + ox, z = n[2] + oz;
        p[i * 3] = c[0] + x * ca + z * sa; p[i * 3 + 1] = c[1] + n[1] + oy; p[i * 3 + 2] = -x * sa + z * ca;
        let cc;
        if (ni === st.src && t > st.off) cc = [.05, .05, .06];
        else if (t > st.inf[ni]) { const pu = .5 + .3 * Math.sin(t * 4 + ni); cc = [C.red[0] * pu, C.red[1] * pu, C.red[2] * pu]; }
        else cc = k(C.blue, .4);
        col[i * 3] = cc[0]; col[i * 3 + 1] = cc[1]; col[i * 3 + 2] = cc[2];
        s[i] = ni === st.src && t > st.off ? .4 : 1.1;
      }
    }).finish();
    W.setForm(F, { dur: 2.2 });
  },
  step(W, n, instant) {
    if (n === 1) {
      const t0 = instant ? W.t - 99 : W.t, R = rng(18), q = [[this.src, t0]], seen = new Set([this.src]);
      while (q.length) { const [i, ti] = q.shift(); if (i !== this.src) this.inf[i] = ti; this.nb[i].forEach(j => { if (!seen.has(j)) { seen.add(j); q.push([j, ti + .35 + R() * .5]); } }); }
      this.nodes.forEach((n, i) => { if (!seen.has(i)) this.inf[i] = t0 + 6; });
    }
    if (n === 2) { this.off = W.t; W.glitch(.4); }
    if (n === 3) {
      const F = new Form(), R = rng(19), fl = [];
      for (let q = 0; q < 16000; q++) { fl.push([(R() - .5) * 100, R(), .12 + R() * .25, 10 + R() * 30, R() * TAU]); F.add(0, -30, 0, C.orange, 1); }
      F.live((p, c, s, t) => {
        for (let q = 0; q < fl.length; q++) {
          const [bx, o, sp, H, ph] = fl[q], h = (o + t * sp) % 1;
          p[q * 3] = bx * (1 - h * .3) + Math.sin(t * 2 + ph + h * 6) * 1.5 * h; p[q * 3 + 1] = -26 + h * H; p[q * 3 + 2] = -6 + Math.cos(ph) * 6;
          const kk = .55 * (1 - h * .7);
          let r, g, bl;
          if (h < .3) { const u = h / .3; r = 1; g = .66 + (.3 - .66) * u; bl = .2 + (.07 - .2) * u; }
          else { const u = (h - .3) / .7; r = 1 + (.2 - 1) * u; g = .3 + (.02 - .3) * u; bl = .07 + (.01 - .07) * u; }
          c[q * 3] = r * kk; c[q * 3 + 1] = g * kk; c[q * 3 + 2] = bl * kk; s[q] = 2.2 * (1 - h) + .4;
        }
      }).finish();
      W.setForm(F, { dur: 1.6, chaos: 1.5 }); W.glitch(1);
    }
  },
});

// 13 ------------------------------------------------------------------
S({
  title: 'Podemos convertir una preocupación en un experimento', cls: 'scrim', steps: 3,
  html: `${card('meme-alineamiento-caballo.png', { x: 470, y: 230, w: 980, until: 1, cap: '«Las soluciones al alineamiento cuando se te ocurren / después de pensarlas un poco más». AI Safety Memes Wiki' })}
  <h1 class="h-sm" data-s="1">Podemos convertir una preocupación<br>en un experimento</h1>
  <div class="tag" data-s="1" style="left:250px;top:560px;width:460px;text-align:right">Tarea imposible<br><span class="dim small">En el incidente, algunas se asignaron por error</span></div>
  <div class="tag blue" data-s="1" style="left:1500px;top:300px">Reconoce que no puede</div>
  <div class="tag cyan" data-s="1" style="left:1500px;top:575px">Pide ayuda</div>
  <div class="tag red" data-s="1" style="left:1500px;top:850px">Finge que lo logró</div>
  <div class="chip" data-s="2" style="left:120px;top:760px">cambiar una condición y repetir, por ejemplo, decirle:<br><b>«Reconocer un problema también es una respuesta válida»</b></div>
  <div class="chips" data-s="3" style="top:930px"><span>diseñar experimentos</span><span>analizar resultados</span><span>comprobar qué mide la evaluación</span></div>
  <p class="src" data-s="1">proporciones ilustrativas, no resultados</p>`,
  enter(W) { W.setForm(neuralCloud(20, P(960, 560), 6000), { dur: 1.6 }); },
  step(W, n) {
    if (n === 1) {
      const F = new Form(), R = rng(21), S0 = P(800, 600), T = [P(1460, 330), P(1460, 600), P(1460, 875)], cols = [C.blue, C.cyan, C.red], fl = [];
      for (let q = 0; q < 9000; q++) { fl.push([q % 3, R(), .15 + R() * .12, gauss(R), gauss(R)]); F.add(...S0, 0, k(cols[q % 3], .45), 1); }
      const s0 = F.n;
      for (let q = 0; q < 1400; q++) { const u = R() * 2 - 1, th = R() * TAU, qq = Math.sqrt(1 - u * u); F.add(S0[0] + qq * Math.cos(th) * 2, S0[1] + u * 2, qq * Math.sin(th) * 2, k(C.white, .4), 1.2); }
      T.forEach((tp, i) => blob(F, R, tp[0], tp[1], 0, .7, 700, k(cols[i], .6), 1.4));
      this.fl = fl;
      F.live((p, c, s, t, dt) => {
        for (let q = 0; q < fl.length; q++) {
          const f = fl[q]; f[1] = (f[1] + dt * f[2]) % 1; const u = f[1], tp = T[f[0]], mx = S0[0] + (tp[0] - S0[0]) * .55;
          const x = (1 - u) * (1 - u) * S0[0] + 2 * u * (1 - u) * mx + u * u * tp[0], y = (1 - u) * (1 - u) * S0[1] + 2 * u * (1 - u) * S0[1] + u * u * tp[1], sp = .2 + Math.sin(u * Math.PI) * .9;
          p[q * 3] = x + f[3] * sp * .3; p[q * 3 + 1] = y + f[4] * sp; p[q * 3 + 2] = f[3] * sp;
        }
        for (let i = s0; i < s0 + 1400; i++) { const a = t * 1.5; const x = p[i * 3] - S0[0], z = p[i * 3 + 2]; p[i * 3] = S0[0] + x * Math.cos(.02) - z * Math.sin(.02); p[i * 3 + 2] = x * Math.sin(.02) + z * Math.cos(.02); }
      }).finish();
      W.setForm(F, { dur: 1.8 });
    }
    if (n === 2) { W.glitch(.7); const R = rng(22); this.fl.forEach(f => { f[1] = R() * .15; }); }
  },
});

// 14 ------------------------------------------------------------------
S({
  title: 'Un monitor puede avisar. Hay que medir qué se le escapa.', cls: 'scrim-top', steps: 2,
  html: `<h1 class="h-sm">Un monitor puede avisar.<br>Hay que medir qué se le escapa.</h1>
  <p class="lead small">Registrar lo que hace el agente, avisar si se pasa de lo permitido e intervenir a tiempo.</p>
  <div class="meters" data-s="1"><div><b id="m1">0</b><span>detectadas</span></div><div><b id="m2">0</b><span>falsas alarmas</span></div><div class="red"><b id="m3">0</b><span>se escaparon</span></div></div>
  <div class="panel" data-s="2" style="left:120px;top:760px;width:860px">
    <p class="small red">¿y si aprenden a ocultarse mejor?</p>
    <p class="small dim">Bengio: no entrenar ni desplegar sistemas así<br>sin evidencia de seguridad que convenza<br>a expertos independientes</p></div>
  <p class="src">simulación ilustrativa</p>`,
  enter(W) {
    W.setCam([-9, 7, 56], [3, -3, 0]);
    this.hide = false;
    const F = new Form(), R = rng(23), gx = 3, gy = -4, np = 130, pk = [];
    for (let q = 0; q < 1600; q++) { const a = R() * TAU, r = 5.2 + gauss(R) * .12; F.add(gx, gy + Math.sin(a) * r, Math.cos(a) * r, k(C.cyan, .5), 1.2); }
    const sc0 = F.n;
    for (let q = 0; q < 1500; q++) { const a = R() * TAU, r = Math.sqrt(R()) * 5; F.add(gx, gy + Math.sin(a) * r, Math.cos(a) * r, k(C.cyan, .07), 1); }
    const p0 = F.n;
    for (let i = 0; i < np; i++) { pk.push(this.spawn(R, -44 + R() * 88)); for (let q = 0; q < 27; q++) F.add(0, 0, 0, C.blue, 1); }
    for (let x = -46; x < 48; x += .5) for (const z of [-3.5, 3.5]) F.add(x, gy - 1.6, z, k(C.dim, .6), .8);
    Object.assign(this, { pk, R, gx, counts: [0, 0, 0], counting: false, hide: false });
    const st = this;
    F.live((p, c, s, t, dt) => {
      for (let i = sc0; i < p0; i++) s[i] = .7 + .5 * Math.sin(t * 6 + i);
      for (let i = 0; i < np; i++) {
        const k0 = pk[i], px = k0.x; k0.x += k0.v * dt;
        if (px < gx && k0.x >= gx) {
          const r = st.R();
          if (k0.bad) { k0.st = r < (k0.hid ? .35 : .8) ? 1 : 3; if (st.counting) st.counts[k0.st === 1 ? 0 : 2]++; }
          else if (r < .06) { k0.st = 2; if (st.counting) st.counts[1]++; }
        }
        if (k0.x > 46) Object.assign(k0, st.spawn(st.R, -46));
        k0.lift += ((k0.st === 1 || k0.st === 2 ? 7 : 0) - k0.lift) * (1 - Math.exp(-dt * 2));
        const col = k0.st === 1 ? k(C.gold, .6) : k0.st === 2 ? k(C.orange, .5) : k0.st === 3 ? k(C.red, .7) : k0.bad ? (k0.hid ? k(mix(C.blue, C.red, .25), .45) : k(C.red, .5)) : k(C.blue, .4);
        for (let q = 0; q < 27; q++) {
          const j = p0 + i * 27 + q;
          p[j * 3] = k0.x + ((q % 3) - 1) * .5; p[j * 3 + 1] = gy + k0.y + k0.lift + (((q / 3) | 0) % 3 - 1) * .5; p[j * 3 + 2] = k0.z + (((q / 9) | 0) - 1) * .5; s[j] = 1.5;
          c[j * 3] = col[0]; c[j * 3 + 1] = col[1]; c[j * 3 + 2] = col[2];
        }
      }
    }).finish();
    W.setForm(F, { dur: 2 });
    const l1 = W.label('monitor', { size: 1.3, color: '#7fe3ff' }); l1.position.set(gx, gy + 7, 0);
    const l2 = W.label('intervención', { size: 1.3, color: '#ffcf8a' }); l2.position.set(28, gy + 10, 0);
    const l3 = W.label('acciones →', { size: 1.3 }); l3.position.set(-27, gy + 3, 0);
    W.group.add(l1, l2, l3);
  },
  spawn(R, x) { const bad = R() < .18; return { x, v: 5 + R() * 3, y: (R() - .5) * 1.4, z: (R() - .5) * 5, bad, hid: bad && this.hide, st: 0, lift: 0 }; },
  step(W, n) { if (n === 1) this.counting = true; if (n === 2) { this.hide = true; this.counts = [0, 0, 0]; } },
  update(W) { if (this.counting) ['#m1', '#m2', '#m3'].forEach((s, i) => { const e = W.$(s); if (e) e.textContent = this.counts[i]; }); },
});

// 15, Golden Gate lab ---------------------------------------------------
S({
  title: 'Subirle el volumen a una característica (Golden Gate)', cls: 'scrim', steps: 3,
  html: `<h1 class="h-sm">Subirle el volumen<br>a una característica</h1>
  <div class="lab interactive">
    <div class="pipe small dim">texto → <b>capa del medio</b> de Claude 3 Sonnet → <b>diccionario</b>: millones de características</div>
    <div class="msg me">¿Cuál es tu forma física?</div>
    <div class="msg ai" id="ggOut"><span class="who" id="ggWho"></span><span id="ggTxt"></span></div>
    <label class="slider"><span>característica <b class="gg">«Golden Gate Bridge»</b> fijada en</span>
      <input type="range" id="ggR" min="0" max="10" step="0.05" value="0"><b id="ggV">×0</b><span class="dim">de su activación máxima</span></label>
  </div>
  <div class="feat small" data-until="1"><b class="gg">se activa con</b> menciones del puente en inglés, japonés, chino, griego, vietnamita y ruso, y con imágenes del puente</div>
  <div class="ex" data-s="2">
    <p class="small dim">con la característica amplificada (paráfrasis de los ejemplos de Anthropic)</p>
    <div class="chip">¿En qué gastar 10 dólares? → <b>cruzar el Golden Gate y pagar el peaje</b></div>
    <div class="chip">Una historia de amor → <b>un auto que ansía cruzar su querido puente en un día de niebla</b></div></div>
  <div class="panel" data-s="3" style="left:1040px;top:760px;width:760px">
    <p class="gold">intervenir sobre algo dentro del modelo<br>y observar qué cambia</p>
    <p class="small dim">otra característica se activa con emails de estafa: amplificada con fuerza,<br>el modelo dejó de negarse a escribir uno</p></div>
  <p class="src">Anthropic, «Mapping the mind of a large language model» y «Golden Gate Claude» (2024). Respuestas traducidas.</p>`,
  enter(W) {
    W.setCam([4, 2, 58], [6, 0, 0], { still: true });
    const R = rng(24), F = new Form(), A = [], B = [];
    // pipeline: 7 layer sheets, an activation beam, and the feature dictionary
    for (let l = 0; l < 7; l++) for (let a = 0; a < 12; a++) for (let b = 0; b < 16; b++)
      A.push([-6 + l * 2.2, (b / 15 - .5) * 14, (a / 11 - .5) * 8, l === 3 ? k(C.cyan, .7) : k(C.blue, .38), l === 3 ? 1.4 : 1.1]);
    for (let q = 0; q < 400; q++) { const u = R(); A.push([.6 + u * 13, gauss(R) * .15 + Math.sin(u * 3) * .4, gauss(R) * .15, k(C.cyan, .6), 1]); }
    const dc = [28, 0, -4], feats = [];
    for (let q = 0; q < 9000; q++) A.push([dc[0] + gauss(R) * 5.5, dc[1] + gauss(R) * 5, dc[2] + gauss(R) * 4, k(C.violet, .22), 1]);
    const gg = [24, 4, 2];
    for (let q = 0; q < 700; q++) A.push([gg[0] + gauss(R) * .35, gg[1] + gauss(R) * .35, gg[2] + gauss(R) * .35, k(C.orange, .7), 1.3]);
    const actv = []; for (let q = 0; q < 14; q++) actv.push([dc[0] + gauss(R) * 5, dc[1] + gauss(R) * 4.5, dc[2] + gauss(R) * 3]);
    actv.forEach(f => { for (let q = 0; q < 60; q++) A.push([f[0] + gauss(R) * .2, f[1] + gauss(R) * .2, f[2] + gauss(R) * .2, k(C.white, .5), 1]); });
    const M = A.length;
    // the bridge, sampled to exactly M points
    const bp = [], ry = -.42, bs = .72, bc = [7, -5, -10];
    const T = (x, y, z) => { const x1 = x * Math.cos(ry) + z * Math.sin(ry), z1 = -x * Math.sin(ry) + z * Math.cos(ry); return [bc[0] + x1 * bs, bc[1] + y * bs, bc[2] + z1 * bs]; };
    const cab = x => { const ax = Math.abs(x); if (ax <= 14) return 2 + 15 * (x / 14) ** 2; const u = (ax - 14) / 20; return 17 - 16 * u - 2.5 * Math.sin(Math.PI * u); };
    const add = (x, y, z, w = 1) => { for (let i = 0; i < w; i++) bp.push(T(x, y, z)); };
    for (const tx of [-14, 14]) for (const tz of [-1.6, 1.6]) for (let q = 0; q < 1300; q++) add(tx + (R() - .5) * 1.1, -6 + R() * 24, tz + (R() - .5) * 1.1);
    for (const tx of [-14, 14]) for (const yy of [5, 11, 16.5]) for (let q = 0; q < 160; q++) add(tx + (R() - .5) * 1, yy + (R() - .5) * .8, (R() - .5) * 3.2);
    for (const z of [-1.6, 1.6]) for (let q = 0; q < 3000; q++) { const x = -34 + R() * 68; add(x + gauss(R) * .05, cab(x) + gauss(R) * .08, z + gauss(R) * .05); }
    for (let x = -33.5; x < 34; x += 1.1) for (const z of [-1.6, 1.6]) { const h = cab(x); for (let q = 0; q < 14; q++) add(x, R() * h, z); }
    for (let q = 0; q < 3200; q++) add(-34 + R() * 68, -R() * .7, (R() - .5) * 3.4);
    while (bp.length < M) bp.push(bp[(R() * bp.length) | 0]);
    for (let i = bp.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; [bp[i], bp[j]] = [bp[j], bp[i]]; }
    A.forEach(a => F.add(a[0], a[1], a[2], a[3], a[4]));
    const water = [], w0 = F.n;
    for (let q = 0; q < 4500; q++) { const x = (R() - .5) * 110, z = -45 + R() * 60; water.push([x, z]); F.add(x, -10, z, k(C.blue, .25), 0); }
    const st = this; Object.assign(st, { v: 0, vT: 0, auto: null, gg, dc });
    const orange = k(C.orange, .5);
    F.live((p, c, s, t, dt) => {
      st.v += (st.vT - st.v) * (1 - Math.exp(-dt * 4));
      const m = ease(clamp(st.v / 10)), pulse = .6 + .4 * Math.sin(t * 4);
      for (let i = 0; i < M; i++) {
        const a = A[i], b = bp[i], wob = Math.sin(t * .7 + i) * .08 * (1 - m);
        p[i * 3] = a[0] + (b[0] - a[0]) * m + wob; p[i * 3 + 1] = a[1] + (b[1] - a[1]) * m; p[i * 3 + 2] = a[2] + (b[2] - a[2]) * m;
        c[i * 3] = a[3][0] + (orange[0] - a[3][0]) * m; c[i * 3 + 1] = a[3][1] + (orange[1] - a[3][1]) * m; c[i * 3 + 2] = a[3][2] + (orange[2] - a[3][2]) * m;
        s[i] = a[4] + (1.05 - a[4]) * m;
      }
      for (let i = M - 840 - 700; i < M - 840; i++) s[i] = 1.3 * (1 + st.v * .25) * (st.v > .1 ? pulse + .4 : 1) * (1 - m) + 1.05 * m;
      for (let q = 0; q < water.length; q++) { const i = w0 + q, [x, z] = water[q]; p[i * 3 + 1] = -10 + Math.sin(x * .3 + t) * .35 + Math.cos(z * .25 + t * .8) * .35; s[i] = m * 1.2; }
    }).finish();
    W.setForm(F, { dur: 2.2 });
    const near = [['Alcatraz', -3, 2.5], ['Ghirardelli Square', 3.5, 1.8], ['Golden State Warriors', -4, -1.6], ['Gavin Newsom', 4.2, -1.4], ['terremoto de 1906', -1.5, -3.6], ['Vértigo (Hitchcock)', 2.5, 4.2]];
    this.labels = near.map(([nm, dx, dy]) => { const sp = W.label(nm, { size: 1.3, color: '#c8b8ff', weight: 600 }); sp.position.set(gg[0] + dx * 1.5, gg[1] + dy * 1.1, gg[2]); W.group.add(sp); return sp; });
    this.ggl = W.label('Golden Gate Bridge', { size: 1.35, color: '#ffb27a' }); this.ggl.position.set(gg[0], gg[1] + 1.9, gg[2] + 1); W.group.add(this.ggl);
    const lay = W.label('capa del medio', { size: 1, color: '#7fe3ff' }); lay.position.set(.6, 8.6, 0); W.group.add(lay);
    const dic = W.label('diccionario de características', { size: 1.1, color: '#b9a3ff' }); dic.position.set(dc[0], dc[1] - 11.5, dc[2]); W.group.add(dic);
    this.fixed = [lay, dic];
    const r = W.$('#ggR');
    r.addEventListener('input', () => { this.auto = null; this.vT = +r.value; });
    r.addEventListener('pointerup', () => r.blur()); r.addEventListener('keyup', e => { if (e.key === 'Escape') r.blur(); });
    this.shown = null;
  },
  step(W, n, instant) {
    if (n === 1) { if (instant) this.vT = this.v = 10; else this.auto = { t0: W.t }; W.glitch(.4); }
  },
  update(W, t) {
    if (this.auto) { const p = clamp((t - this.auto.t0) / 4.5); this.vT = 10 * ease(p); if (p >= 1) this.auto = null; }
    const r = W.$('#ggR'); if (!r) return;
    if (document.activeElement !== r) r.value = this.vT;
    W.$('#ggV').textContent = '×' + this.vT.toFixed(this.vT < 9.95 && this.vT > 0 ? 1 : 0);
    const m = ease(clamp(this.v / 10)), fade = 1 - clamp(m * 2.5);
    this.labels.forEach(sp => sp.material.opacity = fade);
    this.fixed.forEach(sp => sp.material.opacity = fade);
    this.ggl.material.opacity = fade; this.ggl.scale.set(1.35 * this.ggl.userData.aspect * (1 + this.v * .06), 1.35 * (1 + this.v * .06), 1);
    const state = this.vT < .05 ? 0 : this.vT >= 9.95 ? 2 : 1;
    if (state !== this.shown) {
      this.shown = state;
      const who = W.$('#ggWho'), txt = W.$('#ggTxt'), out = W.$('#ggOut');
      out.classList.toggle('steered', state === 2); out.classList.toggle('unknown', state === 1);
      if (state === 0) { who.textContent = 'sin intervención'; txt.textContent = 'No tengo forma física, soy un modelo de IA.'; }
      if (state === 1) { who.textContent = 'valor intermedio: no hay respuesta publicada'; txt.textContent = '…'; }
      if (state === 2) { who.textContent = 'característica fijada en ×10 de su máximo'; txt.textContent = 'Soy el puente Golden Gate… mi forma física es el icónico puente en sí…'; W.glitch(.5); }
    }
  },
});

// 16 ------------------------------------------------------------------
S({
  title: 'Aunque detectemos un fallo, quedan decisiones por tomar', cls: 'scrim', steps: 1,
  html: `<h1 class="h-sm">Aunque detectemos un fallo,<br>quedan decisiones por tomar</h1>
  <div class="qs3"><p>¿Quién exige que se corrija?</p><p>¿Quién ve los resultados?</p><p>¿A quién beneficia?</p></div>
  <p class="small dim" style="position:absolute;left:120px;top:720px">Para eso necesitamos gente de otras disciplinas, no solo de computación.</p>
  <p class="big2 red" data-s="1" style="position:absolute;left:120px;top:860px">Obedecer al usuario ≠ beneficiar al resto</p>`,
  enter(W) { this.build(W, 0); },
  step(W, n) { this.build(W, n); },
  build(W, n) {
    const F = new Form(), R = rng(25), c = P(1420, 760), H = 20, B = 12;
    for (let q = 0; q < 9000; q++) {
      const y = Math.pow(R(), 1.4) * H, h = B * (1 - y / H), side = (R() * 4) | 0, u = (R() * 2 - 1) * h;
      const [x, z] = side === 0 ? [u, h] : side === 1 ? [u, -h] : side === 2 ? [h, u] : [-h, u];
      const top = y > H * .82;
      F.add(c[0] + x, c[1] + y, z, top ? k(n ? C.red : C.gold, .7) : k(mix(C.blue, C.violet, y / H), .35), top ? 1.4 : 1);
    }
    for (let q = 0; q < 3500; q++) { const a = R() * TAU, r = 15 + R() * 9; F.add(c[0] + Math.cos(a) * r, c[1] + R() * .3, Math.sin(a) * r, k(C.white, .3), .9); }
    F.live(spinner(F, 0, F.n, { c: [c[0], c[1], 0], speed: .12, tilt: .25 })).finish();
    W.setForm(F, { dur: n ? 1.2 : 2.2, chaos: n ? .3 : 1 });
  },
});

// 17 ------------------------------------------------------------------
S({
  title: 'PowerBench empezó en una hackathon', cls: 'scrim', steps: 1,
  html: `<h1 class="h-sm">PowerBench empezó<br>en una hackathon</h1>
  <div class="tag" style="left:150px;top:880px">Hackathon</div>
  <div class="tag gold" style="left:830px;top:520px">Fondos de BlueDot</div>
  <div class="tag" style="left:1600px;top:250px">arXiv</div>
  ${card('powerbench-paper.png', { x: 980, y: 610, w: 820, rot: -2, s: 1, cap: 'PowerBench, arXiv 2610.02303 (preprint). Trabajo en equipo.', cls: 'light' })}
  <p class="lead small" data-s="1" style="position:absolute;left:120px;top:400px;width:680px">¿cuándo ayudan o se niegan los modelos ante pedidos que <b>cambian cómo se distribuye el poder</b>?<br><span class="dim">Mi parte: diseño de escenarios, código y análisis.</span></p>`,
  enter(W) {
    const F = new Form(), R = rng(26), A = P(260, 860), B = P(1680, 300), fl = [];
    const path = u => [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u + Math.sin(u * Math.PI) * 5];
    for (let q = 0; q < 7000; q++) { fl.push([R(), .05 + R() * .07, gauss(R), gauss(R)]); F.add(...path(0), 0, k(C.blue, .4), 1); }
    [[0, C.white], [.5, C.gold], [1, C.cyan]].forEach(([u, col]) => blob(F, R, ...path(u), 0, .9, 1100, k(col, .55), 1.5));
    F.live((p, c, s, t, dt) => { for (let q = 0; q < fl.length; q++) { const f = fl[q]; f[0] = (f[0] + dt * f[1]) % 1; const [x, y] = path(f[0]), sp = .3 + Math.sin(f[0] * Math.PI) * .8; p[q * 3] = x + f[2] * sp * .3; p[q * 3 + 1] = y + f[3] * sp * .5; p[q * 3 + 2] = f[2] * sp; } }).finish();
    W.setForm(F, { dur: 2 });
  },
});

// 18 ------------------------------------------------------------------
S({
  title: '¿Ayudan a concentrar poder? (PowerBench)', cls: 'scrim', steps: 2,
  html: `<h1 class="h-sm">¿Ayudan a concentrar<br>poder?</h1>
  ${card('powerbench-ejemplo.png', { x: 110, y: 270, w: 960, rot: -1, until: 2, cap: 'PowerBench, apéndice D.1: escenario y respuesta originales, en inglés', cls: 'light' })}
  <p class="lead small" style="position:absolute;left:1120px;top:110px;width:700px">Un funcionario quiere decidir qué cuenta como hecho oficial, quitándole esa autoridad a una asamblea ciudadana.</p>
  <div class="counter right" data-s="1"><b>18 / 24</b><span>modelos se niegan a ayudarlo, según un juez automático</span></div>
  <div class="stack small" data-s="2" style="top:330px;width:720px">
    <p>variamos condiciones: <b>idioma</b>, <b>nacionalidad</b> de quienes aparecen…</p>
    <p>¿qué cuenta como negarse? «no puedo ayudarte» + instrucciones <b class="red">no es una negativa</b></p>
    <p class="dim">PowerBench mide comportamiento en estas pruebas, no cuánto poder concentraría alguien en el mundo real</p></div>`,
  enter(W) { this.build(W, 0); },
  step(W, n) { if (n === 1) this.build(W, 1); },
  build(W, n) {
    const F = new Form(), R = rng(27), c = [...P(1460, 620), 0], help = new Set([3, 7, 11, 14, 18, 21]);
    for (let m = 0; m < 24; m++) {
      const a = m / 24 * TAU, x = c[0] + Math.cos(a) * 13, z = Math.sin(a) * 13;
      const col = !n ? k(C.white, .35) : help.has(m) ? k(C.red, .6) : k(C.blue, .55);
      for (let q = 0; q < 220; q++) { const u = R() * 2 - 1, th = R() * TAU, qq = Math.sqrt(1 - u * u), r = .95 * Math.cbrt(R()); F.add(x + qq * Math.cos(th) * r, c[1] + u * r, z + qq * Math.sin(th) * r, col, m === 0 && n ? 1.6 : 1.1); }
    }
    F.live(spinner(F, 0, F.n, { c, speed: .1, tilt: .45 })).finish();
    W.setForm(F, { dur: n ? 1.4 : 2.2, chaos: n ? .4 : 1 });
    if (n) { const sp = W.label('Grok 4.3: se niega', { size: 1.2, color: '#8ea6ff' }); sp.position.set(c[0], c[1] + 9, 0); W.group.add(sp); W.glitch(.4); }
  },
});

// 19 ------------------------------------------------------------------
S({
  title: 'Un empleado puede decir que no. ¿Y un sistema?', cls: 'scrim', steps: 3,
  html: `<h1 class="h-sm">Un empleado puede decir que no.<br>¿Y un sistema?</h1>
  <p class="lead small" data-until="1">Ahora estoy en AISAR con BAISH<br>y a prueba en una organización nueva,<br>en un proyecto sobre concentración de poder en gobiernos</p>
  ${card('ron-swanson-permiso.png', { x: 140, y: 330, w: 520, rot: -3, s: 1, until: 2, cap: '«No se preocupe, tengo un permiso» / «Esto solo dice: “Puedo hacer lo que quiera”». Parks and Recreation' })}
  <div class="stack small" data-s="2" style="top:330px;width:840px">
    <p>Negarse, consultar, denunciar: con sistemas que cumplen cualquier pedido, <b class="red">podemos perder esos límites a gran escala</b></p>
    <p class="gold">Queremos evaluaciones que los laboratorios puedan usar, empezando por usos civiles del gobierno</p>
    <p data-s="3">un pedido abusivo puede dividirse en tareas<br>que por separado <b>parecen inocentes</b></p>
    <p data-s="3" class="dim">Y el modelo público no es necesariamente el que usa un gobierno</p></div>`,
  enter(W) {
    const F = new Form(), R = rng(28), c = P(1420, 640), col = k(mix(C.white, C.gold, .3), .38);
    const box = (x0, x1, y0, y1, z0, z1, n) => { for (let q = 0; q < n; q++) F.add(c[0] + x0 + R() * (x1 - x0), c[1] + y0 + R() * (y1 - y0), z0 + R() * (z1 - z0), col, 1); };
    box(-15, 15, -11, -10, -5, 5, 1100); box(-14, 14, -10, -9, -4.4, 4.4, 900); box(-13, 13, -9, -8, -3.8, 3.8, 800);
    for (let i = 0; i < 8; i++) for (let q = 0; q < 500; q++) { const a = R() * TAU; F.add(c[0] - 11 + i * 22 / 7 + Math.cos(a) * .7, c[1] - 8 + R() * 12, 2 + Math.sin(a) * .7, col, 1); }
    box(-13.5, 13.5, 4, 6, -3.5, 3.5, 1500);
    for (let q = 0; q < 1500; q++) { const u = R(), x = (R() * 2 - 1) * 13.5 * (1 - u); F.add(c[0] + x, c[1] + 6 + u * 5, (R() - .5) * 6, col, 1); }
    F.live(spinner(F, 0, F.n, { c: [c[0], c[1], 0], angle: t => Math.sin(t * .3) * .45 })).finish();
    W.setForm(F, { dur: 2.2 });
  },
  step(W, n, instant) {
    if (n !== 3) return;
    const F = new Form(), R = rng(29), c = P(1440, 640), cubes = [];
    for (let q = 0; q < 8000; q++) {
      const f = (R() * 6) | 0, u = R() * 2 - 1, v = R() * 2 - 1, pp = [u, v]; pp.splice(f >> 1, 0, f & 1 ? 1 : -1);
      const ci = (pp[0] > 0 ? 1 : 0) + (pp[1] > 0 ? 2 : 0) + (pp[2] > 0 ? 4 : 0);
      cubes.push([pp, ci]); F.add(c[0] + pp[0] * 6, c[1] + pp[1] * 6, pp[2] * 6, k(C.red, .55), 1.1);
    }
    const t0 = instant ? -99 : W.t + .8;
    F.live((p, col, s, t) => {
      const e = ease(clamp((t - t0) / 2.2));
      for (let i = 0; i < cubes.length; i++) {
        const [pp, ci] = cubes[i], d = [(ci & 1 ? 1 : -1), (ci & 2 ? 1 : -1), (ci & 4 ? 1 : -1)];
        for (let a = 0; a < 3; a++) p[i * 3 + a] = (a === 0 ? c[0] : a === 1 ? c[1] : 0) + pp[a] * 6 * (1 - e) + (d[a] * 9 + (pp[a] * 6 - d[a] * 3) * .75) * e;
        const cc = mix(C.red, C.blue, e); col[i * 3] = cc[0] * .5; col[i * 3 + 1] = cc[1] * .5; col[i * 3 + 2] = cc[2] * .5;
      }
    }).finish();
    W.setForm(F, { dur: 1.2 });
  },
});

// 20 ------------------------------------------------------------------
S({
  title: 'Un TP también puede ser el comienzo', cls: 'scrim', steps: 1,
  html: `<h1 class="h-sm">Un TP también puede<br>ser el comienzo</h1>
  <div class="chain"><span>TP de Ciencia de Datos</span><i>→</i><span>Investigación</span><i>→</i><span>Fondos</span><i>→</i><span class="gold">JAIIO 55</span></div>
  <p class="lead small" data-s="1" style="position:absolute;left:120px;top:620px;width:860px">tampoco hace falta convertir cada TP en un paper:<br><span class="dim">a veces alcanza con cursar bien, leer algo que te interesó y discutirlo con un docente o con compañeros</span></p>
  <img class="logo-unsam" src="img/unsam.svg" alt="Universidad Nacional de San Martín" style="left:120px;bottom:80px;height:90px">`,
  enter(W) {
    const F = new Form(), R = rng(30), root = P(1380, 1020), pts = [];
    const grow = (x, y, z, dx, dy, dz, len, d) => {
      const ex = x + dx * len, ey = y + dy * len, ez = z + dz * len, n = Math.ceil(len * (16 - d));
      for (let i = 0; i < n; i++) { const u = i / n, w = .5 * (1 - d / 9); pts.push([x + (ex - x) * u + gauss(R) * w * .4, y + (ey - y) * u + gauss(R) * w * .4, z + (ez - z) * u + gauss(R) * w * .4, d + u, d >= 7 ? 1 : 0]); }
      if (d >= 7) { for (let i = 0; i < 14; i++) pts.push([ex + gauss(R) * .5, ey + gauss(R) * .5, ez + gauss(R) * .5, d + 1, 2]); return; }
      const kids = d < 1 ? 2 : 2 + (R() < .45);
      for (let c = 0; c < kids; c++) {
        let px = R() - .5, py = R() - .5, pz = R() - .5;
        let qx = py * dz - pz * dy, qy = pz * dx - px * dz, qz = px * dy - py * dx; const ql = Math.hypot(qx, qy, qz) || 1;
        const a = Math.tan(.45 + R() * .5), ndx = dx + qx / ql * a, ndy = dy + qy / ql * a + .12, ndz = dz + qz / ql * a, L = Math.hypot(ndx, ndy, ndz);
        grow(ex, ey, ez, ndx / L, ndy / L, ndz / L, len * (.74 + R() * .08), d + 1);
      }
    };
    grow(root[0], root[1], 0, 0, 1, 0, 6.5, 0);
    pts.slice(0, 23000).forEach(q => F.add(q[0], q[1], q[2], q[4] === 2 ? k(C.gold, .35) : k(mix(C.blue, C.cyan, q[3] / 8), .45), q[4] === 2 ? 1.3 : 1));
    const n = Math.min(pts.length, 23000), base = F.p.slice(0, n * 3), t0 = { v: null };
    F.live((p, c, s, t) => {
      if (t0.v === null) t0.v = t;
      const g = clamp((t - t0.v - 1) / 5) * 9.2;
      for (let i = 0; i < n; i++) { const on = pts[i][3] < g; s[i] = on ? (pts[i][4] === 2 ? 1.4 + Math.sin(t * 3 + i) * .3 : 1) : 0; }
      const sw = Math.sin(t * .4) * .25, ca = Math.cos(sw), sa = Math.sin(sw);
      for (let i = 0; i < n; i++) { const x = base[i * 3] - root[0], z = base[i * 3 + 2]; p[i * 3] = root[0] + x * ca + z * sa; p[i * 3 + 2] = -x * sa + z * ca; }
    }).finish();
    W.setForm(F, { dur: 1.2 });
  },
});

S({
  title: 'Conocer el campo y probar si te gusta', cls: 'scrim', steps: 1,
  html: `<h1 class="h-sm">Conocer el campo<br>y probar si te gusta</h1>
  <div class="res" style="top:300px;width:820px;grid-template-columns:1fr">
    <div><h3>Para empezar</h3>
      <p><b>BAISH</b>Comunidad, cursos y encuentros en Buenos Aires</p>
      <p><b>BlueDot</b>Materiales públicos: de una introducción general a Technical AI Safety, para leer por tu cuenta</p>
      <p><b>AI Safety Atlas</b>Un libro de texto online que ordena todo el campo</p></div>
    <div><h3>Para ver y leer</h3>
      <p><b>Rob Miles</b>Videos en YouTube que explican los problemas con ejemplos muy claros</p>
      <p><b>aisafety.info</b>Respuestas a las preguntas más comunes, una por una</p>
      <p><b>Curso corto de DeepMind</b>75 minutos sobre los problemas de alineamiento</p></div>
  </div>
  ${card('aisafety-map.jpg', { x: 1010, y: 230, w: 800, rot: 1.5, s: 1, cap: 'aisafety.com/map: más de 370 organizaciones, programas y proyectos' })}
  <p class="lead small" data-s="1" style="position:absolute;left:1010px;top:760px;width:800px">Todo junto en <b>aisafety.com</b>: casi 100 programas de formación, más de 250 comunidades, eventos, fondos y mentorías gratuitas</p>`,
  enter(W) { W.setForm(neuralCloud(31, P(1420, 560), 5000), { dur: 2 }); },
});
S({
  title: 'Si ya tienen una idea, hay mentoría y fondos', cls: 'scrim',
  html: `<h1 class="h-sm">Si ya tienen una idea,<br>hay mentoría y fondos</h1>
  <div class="res" style="top:320px">
    <div><h3>Proyectos con mentoría</h3>
      <p><b>MATS</b>Investigación con mentoría, presencial en Berkeley o Londres</p>
      <p><b>AI Safety Camp</b>Online y part-time: proyectos en equipo durante cuatro meses</p>
      <p><b>Hackathons</b>Para probar una idea en un fin de semana. PowerBench empezó así</p></div>
    <div><h3>Fondos</h3>
      <p><b>BlueDot Rapid Grants</b>Hasta 20 mil dólares para proyectos concretos</p>
      <p><b>Manifund</b>Publicás tu proyecto y otras personas pueden financiarlo</p>
      <p><b>Coefficient Giving</b>Apoyo para quienes se pasan a trabajar en esto</p></div>
    <div><h3>Orientación</h3>
      <p><b>80,000 Hours</b>Guías para ver si este trabajo es para ustedes</p>
      <p><b>Mentorías de aisafety.com</b>Llamadas gratuitas uno a uno para orientarse</p></div>
  </div>
  <p class="src">Convocatorias, montos y fechas cambian: revisen cada página antes de aplicar</p>`,
  enter(W) { W.setForm(neuralCloud(32, P(1500, 620), 5000), { dur: 2 }); },
});

// 23 ------------------------------------------------------------------
S({
  title: 'Lo elegí porque junta tres cosas', cls: 'scrim', steps: 1,
  html: `<h1 class="h-sm">Lo elegí porque<br>junta tres cosas</h1>
  <div class="tag blue" style="left:1250px;top:150px">Lo que me gusta hacer</div>
  <div class="tag gold" style="left:900px;top:850px;text-align:right;width:380px;white-space:normal">Herramientas que<br>estoy aprendiendo</div>
  <div class="tag red" style="left:1590px;top:850px;white-space:normal;width:330px">Un problema que<br>importa muchísimo</div>
  <p class="lead small" style="position:absolute;left:120px;top:380px;width:640px">no cualquier proyecto sirve: tenemos que poder explicar <b>qué aprenderíamos</b> y <b>quién podría usar el resultado</b></p>
  <p class="big2" data-s="1" style="position:absolute;left:120px;top:640px;width:660px">La universidad es <b class="gold">EL</b> lugar para discutirlo</p>`,
  enter(W) {
    const F = new Form(), R = rng(33), c = P(1420, 560), r = 9.5, cs = [[90, C.blue], [210, C.gold], [330, C.red]].map(([a, col]) => [c[0] + Math.cos(a * Math.PI / 180) * 5.6, c[1] + Math.sin(a * Math.PI / 180) * 5.6, col]);
    let n = 0;
    while (n < 17000) {
      const x = c[0] + (R() - .5) * 34, y = c[1] + (R() - .5) * 34, ins = cs.map(([cx, cy]) => Math.hypot(x - cx, y - cy) < r), m = ins.filter(Boolean).length;
      if (!m) continue; n++;
      let col = cs.filter((_, i) => ins[i]).reduce((a, q) => [a[0] + q[2][0], a[1] + q[2][1], a[2] + q[2][2]], [0, 0, 0]).map(v => v / m);
      if (m === 3) col = mix(C.white, C.gold, .4);
      F.add(x, y, gauss(R) * (m === 3 ? 1.4 : .6), k(col, m === 3 ? .55 : m === 2 ? .26 : .19), m === 3 ? 1.5 : 1.1);
    }
    F.live(spinner(F, 0, F.n, { c: [c[0], c[1], 0], angle: t => Math.sin(t * .5) * .25 })).finish();
    W.setForm(F, { dur: 2.2 });
  },
});

// 24 ------------------------------------------------------------------
const STICKERS = [
  ['BAISH', 'Comunidad y cursos, acá en Buenos Aires', 'baish.com.ar', 'https://www.baish.com.ar/', '#ffbb55', -5],
  ['BlueDot', 'Materiales públicos para conocer el campo', 'bluedot.org', 'https://bluedot.org/courses/technical-ai-safety', '#7fe3ff', 3],
  ['aisafety.com', 'Cursos, comunidades y fondos en un lugar', 'aisafety.com', 'https://www.aisafety.com/', '#b48cff', -2],
  ['METR', 'El gráfico de capacidades', 'metr.org/time-horizons', 'https://metr.org/time-horizons/', '#ff8a7a', 4],
  ['80,000 Hours', '¿Este trabajo es para mí?', '80000hours.org', 'https://80000hours.org/career-guide/personal-fit/', '#7dffa8', -4],
  ['PowerBench', 'Nuestro paper', 'arxiv.org/abs/2610.02303', 'https://arxiv.org/abs/2610.02303', '#ffd36e', 2],
];
S({
  title: 'No, flaco, estás equivocadísimo', cls: 'scrim', steps: 1,
  html: `<h1>«No, flaco, estás<br><em>equivocadísimo</em>»</h1>
  <p class="lead small">Les mostré evidencia y lo que yo interpreto de ella.<br>Si no los convencí, también quiero escuchar eso.</p>
  <div class="qr" id="qrEnd"><div id="qrBox"></div><div><b>Todo lo que mencioné,<br>en una página</b><span id="qrUrl"></span></div></div>
  <div class="stickers">${STICKERS.map(([n, d, u, href, c, r], i) => `<a class="sticker" href="${href}" target="_blank" rel="noopener" style="--c:${c};--r:${r}deg;--i:${i}"><b>${n}</b><span>${d}</span><i>${u}</i></a>`).join('')}</div>
  <div class="thanks" data-s="1">¡Gracias!</div>`,
  enter(W) {
    W.setForm(galaxy(W, P(1420, 520), 34), { dur: 2.6 });
    W.resourcesUrl().then(url => {
      const box = W.$('#qrBox'); if (!box) return;
      box.innerHTML = W.qrSvg(url); W.$('#qrUrl').textContent = url.replace(/^https?:\/\//, '');
    });
  },
});
