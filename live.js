// Respuestas del público en vivo + QR. Funciona solo si el deck lo sirve server.mjs;
// en un hosting estático (sin /api) el deck sigue andando con las respuestas pegadas con E.
import { CONFIG } from './config.js';

let info = null;
// con publicUrl, el deck usa ese servidor aunque esté abierto desde otro lado
const API = (CONFIG.publicUrl ? CONFIG.publicUrl.replace(/\/$/, '') + '/' : '') + 'api/';
export async function serverInfo() {
  if (info !== null) return info;
  try { const r = await fetch(API + 'info', { cache: 'no-store', signal: AbortSignal.timeout(4000) }); info = r.ok ? await r.json() : false; } catch { info = false; }
  return info;
}
export async function publicBase() {
  if (CONFIG.publicUrl) return CONFIG.publicUrl.replace(/\/$/, '');
  const i = await serverInfo(), h = location.hostname;
  if (i && i.lan?.length && (h === 'localhost' || h === '127.0.0.1')) return `http://${i.lan[0]}:${i.port}`;
  return location.origin + location.pathname.replace(/[^/]*$/, '').replace(/\/$/, '');
}
export function qrSvg(text, { dark = '#03040a', light = '#ffffff', margin = 2 } = {}) {
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount(), s = n + margin * 2;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x + margin},${y + margin}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges"><rect width="${s}" height="${s}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
}
export async function connectLive(onMsg) {
  if (!(await serverInfo())) return false;
  const es = new EventSource(API + 'stream');
  es.onmessage = e => { try { onMsg(JSON.parse(e.data)); } catch {} };
  return true;
}
export async function clearServer() {
  const r = await fetch(API + 'respuestas' + location.search, { method: 'DELETE' }).catch(() => null);
  return !!r?.ok;
}
