// Servidor de la charla: sirve el deck y recibe respuestas del público.
//   node server.mjs            → http://localhost:8770
//   PORT=3000 ADMIN_TOKEN=xyz node server.mjs
// El público abre /responder (el QR de la slide 4 apunta ahí) y las
// respuestas llegan en vivo al deck por /api/stream.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { opcion } from './opciones.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = +(process.env.PORT || process.argv[2] || 8770);
const ADMIN = process.env.ADMIN_TOKEN || '';
const LOG = path.join(ROOT, 'respuestas.jsonl');
const MAX_TOTAL = 600, PER_DEVICE = 4, PER_IP = 150;
// detrás de un proxy (Render, túneles) la IP real viene en X-Forwarded-For
const TRUST_PROXY = !!(process.env.RENDER || process.env.TRUST_PROXY);

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8' };
const PUBLIC = ['index.html', 'presenter.html', 'responder.html', 'recursos.html', 'main.js', 'slides.js', 'form.js', 'notes.js', 'live.js', 'config.js', 'opciones.js', 'style.css', 'img/', 'vendor/'];

let answers = [];
try {
  const rows = fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  answers = rows.slice(rows.findLastIndex(a => a.reset) + 1).filter(a => typeof a.t === 'string');
} catch {}
const byDevice = new Map(), byIp = new Map(), clients = new Set();

const lanIPs = () => Object.values(os.networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address)
  .sort((a, b) => (/^(192\.168|10\.)/.test(b) ? 1 : 0) - (/^(192\.168|10\.)/.test(a) ? 1 : 0));
const LOOP = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
// presentador = la compu que corre el servidor, sin proxy de por medio, y desde una página del propio deck
const isLocal = req => LOOP.includes(req.socket.remoteAddress) && !req.headers['x-forwarded-for'] &&
  (!req.headers.origin || /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(req.headers.origin) && req.headers.origin.endsWith(':' + PORT));
const clientIp = req => (TRUST_PROXY && (req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress;
const isAdmin = (req, url) => isLocal(req) || (ADMIN && url.searchParams.get('admin') === ADMIN);
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const send = (res, code, body, type = 'application/json') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', ...CORS }); res.end(typeof body === 'string' ? body : JSON.stringify(body)); };
const broadcast = msg => { const s = `data: ${JSON.stringify(msg)}\n\n`; for (const c of clients) c.write(s); };

function readBody(req) {
  return new Promise((ok, bad) => { let b = ''; req.on('data', d => { b += d; if (b.length > 2000) { bad(new Error('too big')); req.destroy(); } }); req.on('end', () => ok(b)); });
}

http.createServer(async (req, res) => {
  let url; try { url = new URL(req.url, 'http://x'); } catch { return send(res, 400, { error: 'pedido inválido' }); }
  const p = url.pathname;
  try {
    if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
    if (p === '/api/info') return send(res, 200, { lan: lanIPs(), port: PORT, count: answers.length });
    if (p === '/api/respuestas' && req.method === 'GET') return send(res, 200, answers.map(a => a.t));
    if (p === '/api/respuestas' && req.method === 'POST') {
      const ip = clientIp(req), nIp = byIp.get(ip) || 0;
      if (answers.length >= MAX_TOTAL) return send(res, 429, { error: 'Llegamos al máximo de respuestas.' });
      const body = JSON.parse(await readBody(req) || '{}');
      const dev = ip + '|' + String(body.id || '').slice(0, 40), nDev = byDevice.get(dev) || 0;
      if (nDev >= PER_DEVICE || nIp >= PER_IP) return send(res, 429, { error: 'Ya mandaste varias respuestas, gracias.' });
      const items = [].concat(body.respuestas || body.texto || []).filter(x => typeof x === 'string').map(opcion).filter(Boolean).slice(0, 2);
      if (!items.length) return send(res, 400, { error: 'Elegí al menos un problema.' });
      byDevice.set(dev, nDev + 1); byIp.set(ip, nIp + 1);
      for (const t of items) { const a = { t, at: Date.now() }; answers.push(a); fs.appendFileSync(LOG, JSON.stringify(a) + '\n'); broadcast({ type: 'add', t }); }
      return send(res, 200, { ok: true });
    }
    if (p === '/api/respuestas' && req.method === 'DELETE') {
      if (!isAdmin(req, url)) return send(res, 403, { error: 'solo el presentador' });
      answers = []; byIp.clear(); byDevice.clear(); fs.appendFileSync(LOG, JSON.stringify({ reset: true, at: Date.now() }) + '\n');
      broadcast({ type: 'reset' }); return send(res, 200, { ok: true });
    }
    if (p === '/api/stream') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', ...CORS });
      res.write(`data: ${JSON.stringify({ type: 'all', items: answers.map(a => a.t) })}\n\n`);
      clients.add(res); const ping = setInterval(() => res.write(': ping\n\n'), 20000);
      req.on('close', () => { clients.delete(res); clearInterval(ping); });
      return;
    }
    // static files (only the deck's own files are served)
    let f = p === '/' ? 'index.html' : p === '/responder' ? 'responder.html' : p === '/recursos' ? 'recursos.html' : decodeURIComponent(p.slice(1));
    if (!PUBLIC.some(x => x.endsWith('/') ? f.startsWith(x) : f === x) || f.includes('..')) return send(res, 404, 'no encontrado', 'text/plain');
    const full = path.join(ROOT, f);
    fs.readFile(full, (e, data) => e ? send(res, 404, 'no encontrado', 'text/plain') : (res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }), res.end(data)));
  } catch (e) { send(res, 400, { error: 'pedido inválido' }); }
}).listen(PORT, () => {
  console.log(`Deck:      http://localhost:${PORT}`);
  for (const ip of lanIPs()) console.log(`Público:   http://${ip}:${PORT}/responder`);
  if (answers.length) console.log(`(${answers.length} respuestas guardadas en respuestas.jsonl)`);
});
