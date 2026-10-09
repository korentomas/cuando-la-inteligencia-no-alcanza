import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { N, Form, rng, imageData } from './form.js';
import { SLIDES } from './slides.js';
import { connectLive, publicBase, qrSvg, clearServer } from './live.js';

const $ = s => document.querySelector(s);
const canvas = $('#gl'), stageEl = $('#stage'), frameEl = $('#frame');

// ---------- renderer, camera, post ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
const scene = new THREE.Scene();
scene.background = new THREE.Color('#03040a');
const camera = new THREE.PerspectiveCamera(45, 16 / 9, .1, 2000);
camera.position.set(0, 0, 60);
const HALF_H = 60 * Math.tan(THREE.MathUtils.degToRad(22.5));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .5, .4, .18);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- the particle cloud ----------
// The morph runs in the vertex shader: from/to buffers are uploaded once per
// transition, and only slides with live animation re-upload their "to" range.
const fromP = new Float32Array(N * 3), toP = new Float32Array(N * 3);
const fromC = new Float32Array(N * 3), toC = new Float32Array(N * 3);
const fromS = new Float32Array(N), toS = new Float32Array(N), spinA = new Float32Array(N);
const DEL = new Float32Array(N), JIT = new Float32Array(N * 3);
{
  const R = rng(7);
  for (let i = 0; i < N; i++) {
    DEL[i] = R();
    const u = R() * 2 - 1, th = R() * 6.2832, r = 3 + R() * 11, q = Math.sqrt(1 - u * u);
    JIT[i * 3] = q * Math.cos(th) * r; JIT[i * 3 + 1] = q * Math.sin(th) * r; JIT[i * 3 + 2] = u * r;
  }
}
let target = new Form().finish();
fromP.set(target.p); toP.set(target.p); fromC.set(target.c); toC.set(target.c); fromS.set(target.s); toS.set(target.s);
const geo = new THREE.BufferGeometry();
const A = (arr, n) => new THREE.BufferAttribute(arr, n);
const aTo = A(toP, 3), aFrom = A(fromP, 3), cTo = A(toC, 3), cFrom = A(fromC, 3), sTo = A(toS, 1), sFrom = A(fromS, 1), aSpin = A(spinA, 1);
[aTo, cTo, sTo].forEach(x => x.setUsage(THREE.DynamicDrawUsage));
geo.setAttribute('position', aTo); geo.setAttribute('aFrom', aFrom); geo.setAttribute('cTo', cTo); geo.setAttribute('cFrom', cFrom);
geo.setAttribute('sTo', sTo); geo.setAttribute('sFrom', sFrom); geo.setAttribute('aSpin', aSpin);
geo.setAttribute('aDel', A(DEL, 1)); geo.setAttribute('aJit', A(JIT, 3));
const U = { uScale: { value: 200 }, uK: { value: 9 }, uChaos: { value: 0 }, uSpinA: { value: 0 }, uTilt: { value: 0 }, uSpinC: { value: new THREE.Vector3() } };
const pmat = new THREE.ShaderMaterial({
  uniforms: U,
  vertexShader: `attribute vec3 aFrom,cTo,cFrom,aJit;attribute float sTo,sFrom,aSpin,aDel;
    uniform float uScale,uK,uChaos,uSpinA,uTilt;uniform vec3 uSpinC;varying vec3 vC;
    void main(){
      vec3 to=position;
      if(aSpin>.5){vec3 b=to-uSpinC;float ca=cos(uSpinA),sa=sin(uSpinA),ct=cos(uTilt),st=sin(uTilt);
        vec3 r=vec3(b.x*ca+b.z*sa,b.y,-b.x*sa+b.z*ca);to=uSpinC+vec3(r.x,r.y*ct-r.z*st,r.y*st+r.z*ct);}
      float e=clamp(uK*1.6-aDel*.6,0.,1.);e=e<.5?4.*e*e*e:1.-pow(-2.*e+2.,3.)/2.;
      vec3 p=mix(aFrom,to,e)+aJit*sin(e*3.14159)*uChaos;
      float s=mix(sFrom,sTo,e);vC=mix(cFrom,cTo,e);
      vec4 mv=modelViewMatrix*vec4(p,1.);
      gl_PointSize=s<=0.?0.:max(s*uScale/-mv.z,1.);gl_Position=projectionMatrix*mv;}`,
  fragmentShader: `varying vec3 vC;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=pow(1.-d*2.,1.7);gl_FragColor=vec4(vC*a,1.);}`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});
const points = new THREE.Points(geo, pmat);
points.frustumCulled = false;
scene.add(points);

const morph = { t0: -99, dur: 1, chaos: 0 };
const spin = { on: false, c: [0, 0, 0], ang: 0, tilt: 0 };
const ease = e => e < .5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
function setForm(F, { dur = 2, chaos = 1 } = {}) {
  // bake where every particle is right now into the "from" buffers
  const kk = (clock - morph.t0) / morph.dur, ch = morph.chaos, ca = Math.cos(spin.ang), sa = Math.sin(spin.ang), ct = Math.cos(spin.tilt), st = Math.sin(spin.tilt), c = spin.c;
  for (let i = 0; i < N; i++) {
    const j = i * 3; let x = toP[j], y = toP[j + 1], z = toP[j + 2];
    if (spinA[i]) { const bx = x - c[0], by = y - c[1], bz = z - c[2], rx = bx * ca + bz * sa, rz = -bx * sa + bz * ca; x = c[0] + rx; y = c[1] + by * ct - rz * st; z = c[2] + by * st + rz * ct; }
    let e = kk * 1.6 - DEL[i] * .6; e = ease(e < 0 ? 0 : e > 1 ? 1 : e);
    const b = Math.sin(e * Math.PI) * ch;
    fromP[j] += (x - fromP[j]) * e + JIT[j] * b; fromP[j + 1] += (y - fromP[j + 1]) * e + JIT[j + 1] * b; fromP[j + 2] += (z - fromP[j + 2]) * e + JIT[j + 2] * b;
    for (let d = 0; d < 3; d++) fromC[j + d] += (toC[j + d] - fromC[j + d]) * e;
    fromS[i] += (toS[i] - fromS[i]) * e;
  }
  spinA.fill(0);
  if (F.spin) { spinA.fill(1, F.spin.a, F.spin.b); spin.c = F.spin.o.c; }
  spin.on = !!F.spin; spin.ang = 0; spin.tilt = F.spin?.o.tilt ?? 0;
  target = F; toP.set(F.p); toC.set(F.c); toS.set(F.s);
  morph.t0 = clock; morph.dur = dur; morph.chaos = chaos * .3;
  for (const a of [aTo, aFrom, cTo, cFrom, sTo, sFrom, aSpin]) { a.clearUpdateRanges(); a.needsUpdate = true; }
  fullUpload = true;
  U.uSpinC.value.set(...spin.c);
}
let fullUpload = false;
function stepParticles(t, dt) {
  U.uK.value = (t - morph.t0) / morph.dur; U.uChaos.value = morph.chaos;
  if (spin.on) {
    const o = target.spin.o;
    if (o.tiltT !== undefined) o.tilt += (o.tiltT - o.tilt) * .04;
    spin.ang = o.angle ? o.angle(t) : t * (o.speed ?? .1); spin.tilt = o.tilt ?? 0;
    U.uSpinA.value = spin.ang; U.uTilt.value = spin.tilt;
  }
  if (!target.lives.length) { fullUpload = false; return; }
  for (const fn of target.lives) fn(target.p, target.c, target.s, t, dt);
  const n = target.n;
  toP.set(target.p.subarray(0, n * 3)); toC.set(target.c.subarray(0, n * 3)); toS.set(target.s.subarray(0, n));
  // right after a slide change the whole buffer must go up, not just this slide's range
  if (!fullUpload) { aTo.addUpdateRange(0, n * 3); cTo.addUpdateRange(0, n * 3); sTo.addUpdateRange(0, n); }
  aTo.needsUpdate = cTo.needsUpdate = sTo.needsUpdate = true; fullUpload = false;
}

// ---------- per-slide extras (sprites, lines, meshes) ----------
let group = new THREE.Group(); scene.add(group);
const dying = [];
function retireGroup() {
  const mats = [];
  group.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { if (!m.transparent) { m.transparent = true; m.needsUpdate = true; } mats.push([m, m.opacity]); }); });
  dying.push({ g: group, mats, t0: clock });
  group = new THREE.Group(); scene.add(group); W.group = group;
}
function tickDying() {
  for (let i = dying.length - 1; i >= 0; i--) {
    const d = dying[i], p = (clock - d.t0) / .45;
    if (p >= 1) {
      scene.remove(d.g);
      d.g.traverse(o => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach(m => { m.map?.dispose(); m.dispose(); }); });
      dying.splice(i, 1);
    } else d.mats.forEach(([m, o]) => m.opacity = o * (1 - p));
  }
}

function label(text, { size = 1.6, color = '#eef1ff', weight = 700, font = 'Bricolage Grotesque', glow = null } = {}) {
  const px = 96, cv = document.createElement('canvas'), g = cv.getContext('2d');
  const f = `${weight} ${px}px "${font}"`; g.font = f;
  cv.width = Math.ceil(g.measureText(text).width) + 40; cv.height = Math.ceil(px * 1.35);
  g.font = f; g.textBaseline = 'middle'; g.textAlign = 'center';
  if (glow) { g.shadowColor = glow; g.shadowBlur = 24; }
  g.fillStyle = color; g.fillText(text, cv.width / 2, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(size * cv.width / cv.height, size, 1);
  sp.userData.aspect = cv.width / cv.height;
  return sp;
}
function lines(arr, color = 0x4060ff, opacity = .35) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
}

// ---------- camera ----------
const cam = { p: new THREE.Vector3(0, 0, 60), l: new THREE.Vector3(), look: new THREE.Vector3(), still: false, speed: 2.2 };
function setCam(p = [0, 0, 60], l = [0, 0, 0], { still = false, instant = false, speed = 2.2 } = {}) {
  cam.p.set(...p); cam.l.set(...l); cam.still = still; cam.speed = speed;
  if (instant) { camera.position.copy(cam.p); cam.look.copy(cam.l); }
}
const mouse = { x: 0, y: 0 };
addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; });

// ---------- responses for the audience question ----------
const EXAMPLE = ['Salud', 'Educación', 'Pobreza', 'Salud', 'Cambio climático', 'Educación', 'Salud', 'IA', 'Energía', 'Salud', 'Pobreza', 'Educación', 'Vivienda', 'Salud', 'Cambio climático', 'IA', 'Educación', 'Pobreza', 'Energía', 'Salud', 'Educación', 'Vivienda', 'Salud', 'Pobreza', 'Cambio climático', 'Educación', 'IA', 'Educación', 'Salud', 'Pobreza', 'Cambio climático', 'Vivienda'];
let raw = EXAMPLE, isExample = true;
try { const s = JSON.parse(localStorage.getItem('unsam-respuestas')); if (s?.raw?.length) { raw = s.raw; isExample = false; } } catch {}
function aggregate(lines) {
  const m = new Map;
  for (const line of lines) {
    const lab = line.trim().replace(/\s+/g, ' '); if (!lab) continue;
    const key = lab.toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!m.has(key)) m.set(key, { label: lab, count: 0 }); m.get(key).count++;
  }
  const a = [...m.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
  if (a.length > 10) { const rest = a.splice(9); a.push({ label: 'Otras (agrupadas)', count: rest.reduce((n, x) => n + x.count, 0) }); }
  return a;
}

// ---------- the context handed to slides ----------
let clock = 0;
const W = {
  THREE, scene, camera, Form, label, lines, setForm, setCam,
  get group() { return group; }, set group(g) { group = g; },
  get t() { return clock; },
  glitch() {},
  responses: () => aggregate(raw), get isExample() { return isExample; }, get total() { return raw.length; },
  P: (px, py) => [(px / 1920 - .5) * 88.37, (.5 - py / 1080) * 49.71],
  $: s => slideEl?.querySelector(s), $$: s => [...(slideEl?.querySelectorAll(s) || [])],
  img: {}, epoch: 0, qrSvg, publicBase, live: false,
  later(ms, fn) { const e = W.epoch; setTimeout(() => { if (e === W.epoch) fn(); }, ms); },
};

// ---------- layout ----------
function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  renderer.setSize(w, h, false); composer.setSize(w, h); bloom.resolution.set(w, h);
  camera.aspect = a;
  const halfH = a < 16 / 9 ? HALF_H * (16 / 9) / a : HALF_H;
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(halfH / 60)); camera.updateProjectionMatrix();
  pmat.uniforms.uScale.value = renderer.domElement.height * .2 * (HALF_H / halfH);
  const s = Math.min(w / 1920, h / 1080);
  frameEl.style.width = 1920 * s + 'px'; frameEl.style.height = 1080 * s + 'px';
  stageEl.style.transform = `scale(${s})`;
}
addEventListener('resize', resize); resize();

// ---------- navigation ----------
let cur = -1, step = 0, slideEl = null;
const chan = new BroadcastChannel('charla-unsam');
function render(i) {
  W.epoch++;
  if (cur >= 0) SLIDES[cur].leave?.(W);
  retireGroup();
  const old = slideEl;
  if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 250); }
  const s = SLIDES[i];
  slideEl = document.createElement('section');
  slideEl.className = 'slide ' + (s.cls || '');
  slideEl.innerHTML = s.html;
  stageEl.append(slideEl);
  cur = i; step = 0;
  setCam();
  s.enter(W);
  W.glitch(.9);
}
function applyClasses() {
  slideEl.querySelectorAll('[data-s],[data-until]').forEach(el => {
    const a = +(el.dataset.s || 0), b = el.dataset.until === undefined ? 1e9 : +el.dataset.until;
    el.classList.toggle('in', step >= a && step < b);
  });
  $('#count').textContent = String(cur + 1).padStart(2, '0') + ' / ' + SLIDES.length;
  $('#bar').style.width = ((cur + (step / (SLIDES[cur].steps + 1))) / (SLIDES.length - 1) * 100) + '%';
  history.replaceState(null, '', `#${cur + 1}.${step}`);
  chan.postMessage({ type: 'state', cur, step, steps: SLIDES[cur].steps, total: SLIDES.length, titles: SLIDES.map(s => s.title) });
}
function go(i, s = 0, { fresh = false } = {}) {
  i = Math.max(0, Math.min(SLIDES.length - 1, i));
  s = Math.max(0, Math.min(SLIDES[i].steps, s));
  if (i !== cur || fresh || s < step) {
    const instant = i === cur || i < cur;
    render(i);
    while (step < s) { step++; SLIDES[i].step?.(W, step, instant && step < s); }
  } else while (step < s) { step++; SLIDES[i].step?.(W, step, false); }
  applyClasses();
}
const next = () => step < SLIDES[cur].steps ? go(cur, step + 1) : cur < SLIDES.length - 1 && go(cur + 1, 0);
const prev = () => step > 0 ? go(cur, step - 1) : cur > 0 && go(cur - 1, SLIDES[cur - 1].steps);
chan.onmessage = e => {
  const m = e.data;
  if (m.type === 'cmd') { if (m.cmd === 'next') next(); else if (m.cmd === 'prev') prev(); else if (m.cmd === 'goto') go(m.i, 0); else if (m.cmd === 'hello') applyClasses(); }
};

window.deck = { go, next, prev, get cur() { return cur; }, get step() { return step; } };

// ---------- keyboard ----------
let typed = '';
const editor = $('#editor');
addEventListener('keydown', e => {
  if (editor.open || e.target.closest?.('input,textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  if (!/^[0-9]$/.test(k) && k !== 'Enter' && typed) { typed = ''; $('#goto').classList.remove('show'); }
  if (/^[0-9]$/.test(k)) { typed += k; $('#goto').textContent = '→ ' + typed; $('#goto').classList.add('show'); return; }
  if (k === 'Enter' && typed) { go(+typed - 1, 0); typed = ''; $('#goto').classList.remove('show'); return; }
  if (k === 'Escape') { typed = ''; $('#goto').classList.remove('show'); }
  if ([' ', 'ArrowRight', 'PageDown', 'ArrowDown', 'Enter'].includes(k)) { e.preventDefault(); next(); }
  else if (['ArrowLeft', 'PageUp', 'ArrowUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
  else if (k === 'Home') go(0); else if (k === 'End') go(SLIDES.length - 1);
  else if (k === 'f' || k === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
  else if (k === 'p' || k === 'P') open('presenter.html', 'presenter', 'width=1200,height=800');
  else if (k === 'b' || k === 'B' || k === '.') document.body.classList.toggle('black');
  else if (k === 'e' || k === 'E') openEditor();
  else if (k === 'r' || k === 'R') go(cur, step, { fresh: true });
  else if (k === 'h' || k === '?') $('#help').classList.toggle('show');
});
stageEl.addEventListener('click', e => { if (!e.target.closest('button,a,input,label,.interactive')) next(); });

// ---------- live answers from phones ----------
function onLive(msg) {
  if (msg.type === 'all') { if (msg.items.length) { raw = msg.items; isExample = false; } }
  else if (msg.type === 'add') { if (isExample) { raw = []; isExample = false; } raw = raw.concat(msg.t); }
  else if (msg.type === 'reset') { raw = EXAMPLE; isExample = true; }
  SLIDES[cur]?.onAnswers?.(W);
}

// ---------- response editor ----------
function openEditor() {
  $('#responses').value = isExample ? '' : raw.join('\n'); $('#err').textContent = '';
  editor.showModal(); $('#responses').focus();
}
$('#respForm').onsubmit = e => {
  e.preventDefault();
  const ls = $('#responses').value.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  if (!ls.length) { $('#err').textContent = 'Ingresá al menos una respuesta.'; return; }
  raw = ls; isExample = false;
  try { localStorage.setItem('unsam-respuestas', JSON.stringify({ raw })); } catch {}
  editor.close(); go(cur, step, { fresh: true });
};
$('#useExample').onclick = () => { raw = EXAMPLE; isExample = true; try { localStorage.removeItem('unsam-respuestas'); } catch {} editor.close(); go(cur, step, { fresh: true }); };
$('#cancel').onclick = () => editor.close();
$('#clearServer').onclick = async () => { $('#err').textContent = (await clearServer()) ? 'Respuestas del servidor borradas.' : 'No hay servidor, o no sos el presentador.'; };

// ---------- loop ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; clock += dt;
  SLIDES[cur]?.update?.(W, clock, dt);
  stepParticles(clock, dt);
  tickDying();
  const par = cam.still ? .15 : 1, f = 1 - Math.exp(-dt * cam.speed);
  camera.position.x += (cam.p.x + mouse.x * 1.6 * par - camera.position.x) * f;
  camera.position.y += (cam.p.y - mouse.y * 1 * par - camera.position.y) * f;
  camera.position.z += (cam.p.z - camera.position.z) * f;
  cam.look.lerp(cam.l, f); camera.lookAt(cam.look);
  composer.render();
  requestAnimationFrame(loop);
}

// ---------- boot ----------
(async () => {
  await Promise.all(['400', '600', '800'].map(w => document.fonts.load(`${w} 40px "Bricolage Grotesque"`)).concat(document.fonts.load('40px "JetBrains Mono"')));
  W.img.earth = await imageData('img/tierra.jpg');
  W.live = await connectLive(onLive);
  const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
  go(m ? +m[1] - 1 : 0, m ? +(m[2] || 0) : 0);
  requestAnimationFrame(loop);
  document.body.classList.add('ready');
})();
