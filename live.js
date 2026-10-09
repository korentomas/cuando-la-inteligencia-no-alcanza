// Respuestas del público en vivo + QR. Dos modos:
// - servidor: el deck lo sirve server.mjs (o CONFIG.publicUrl apunta a uno). Usa /api.
// - sala: sin servidor (GitHub Pages, archivo local). Los celulares publican en una
//   "sala" de ntfy.sh (servicio público, sin cuenta) y el deck la escucha.
import { CONFIG } from './config.js';

let info = null;
// con publicUrl, el deck usa ese servidor aunque esté abierto desde otro lado
const API = (CONFIG.publicUrl ? CONFIG.publicUrl.replace(/\/$/, '') + '/' : '') + 'api/';
const RELAY = 'https://ntfy.sh/';
const local = () => ['localhost', '127.0.0.1', ''].includes(location.hostname) || location.protocol === 'file:';
const clean = t => String(t || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

export async function serverInfo() {
  if (info !== null) return info;
  try { const r = await fetch(API + 'info', { cache: 'no-store', signal: AbortSignal.timeout(4000) }); info = r.ok ? await r.json() : false; } catch { info = false; }
  return info;
}

// sala de ntfy: fija para esta compu hasta que se borran las respuestas
function sala(renew = false) {
  const fromUrl = new URLSearchParams(location.search).get('sala');
  if (fromUrl && !renew) return fromUrl;
  let s = null; try { s = renew ? null : localStorage.getItem('unsam-sala'); } catch {}
  if (!s) { s = 'cuando-ia-' + crypto.getRandomValues(new Uint32Array(2)).reduce((a, n) => a + n.toString(36), ''); try { localStorage.setItem('unsam-sala', s); } catch {} }
  return s;
}

// base pública del sitio: la URL actual, salvo que sea local (los celulares no llegan a localhost)
function siteBase() {
  const here = location.origin + location.pathname.replace(/[^/]*$/, '');
  return local() ? CONFIG.siteUrl : here;
}

export async function answerUrl() {
  if (CONFIG.publicUrl) return CONFIG.publicUrl.replace(/\/$/, '') + '/responder';
  const i = await serverInfo();
  if (i) return local() && i.lan?.length ? `http://${i.lan[0]}:${i.port}/responder` : location.origin + '/responder';
  return siteBase() + 'responder.html?sala=' + sala();
}
export async function resourcesUrl() {
  if (CONFIG.publicUrl) return CONFIG.publicUrl.replace(/\/$/, '') + '/recursos';
  return siteBase() + 'recursos.html';
}

export function qrSvg(text, { dark = '#03040a', light = '#ffffff', margin = 2 } = {}) {
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount(), s = n + margin * 2;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x + margin},${y + margin}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges"><rect width="${s}" height="${s}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
}

let relayES = null;
function listenRelay(onMsg) {
  relayES?.close();
  const seen = new Set();
  relayES = new EventSource(RELAY + sala() + '/sse?since=all');
  relayES.onmessage = e => {
    let m; try { m = JSON.parse(e.data); } catch { return; }
    if (m.event !== 'message' || seen.has(m.id)) return;
    seen.add(m.id);
    for (const t of String(m.message || '').split('\n').map(clean).filter(Boolean).slice(0, 2)) onMsg({ type: 'add', t });
  };
}

export async function connectLive(onMsg) {
  if (await serverInfo()) {
    const es = new EventSource(API + 'stream');
    es.onmessage = e => { try { onMsg(JSON.parse(e.data)); } catch {} };
    return 'servidor';
  }
  if (CONFIG.relay === false) return false;
  connectLive.onMsg = onMsg;
  listenRelay(onMsg);
  return 'sala';
}

export async function clearServer() {
  if (await serverInfo()) {
    const r = await fetch(API + 'respuestas' + location.search, { method: 'DELETE' }).catch(() => null);
    return !!r?.ok;
  }
  // sala: se abre una nueva (nuevo QR); la anterior queda olvidada
  sala(true);
  connectLive.onMsg?.({ type: 'reset' });
  if (connectLive.onMsg) listenRelay(connectLive.onMsg);
  return true;
}
