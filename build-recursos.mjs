// Regenera recursos.html desde recursos-para-empezar.md. Run: node build-recursos.mjs
import fs from 'fs';
const SRC = '/Users/tk/Documents/Codex/2026-09-08/what-happened-relevant-to-ai-safety/charla-unsam/recursos-para-empezar.md';
const md = fs.existsSync(SRC) ? fs.readFileSync(SRC, 'utf8') : fs.readFileSync(new URL('./recursos.md', import.meta.url), 'utf8');
fs.writeFileSync(new URL('./recursos.md', import.meta.url), md);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const inline = s => esc(s).replace(/\*\*\[([^\]]+)\]\(([^)]+)\)(:?)\*\*/g, '<a href="$2"><b>$1</b></a>$3').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>');
let html = '', inList = false;
for (const line of md.split('\n')) {
  if (line.startsWith('- ')) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${inline(line.slice(2))}</li>`; continue; }
  if (inList) { html += '</ul>'; inList = false; }
  if (line.startsWith('# ')) html += `<h1>${inline(line.slice(2))}</h1>`;
  else if (line.startsWith('## ')) html += `<h2>${inline(line.slice(3))}</h2>`;
  else if (line.trim()) html += `<p>${inline(line)}</p>`;
}
if (inList) html += '</ul>';
fs.writeFileSync(new URL('./recursos.html', import.meta.url), `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cómo empezar en AI Safety</title>
<style>
@font-face{font-family:"Bricolage Grotesque";font-weight:400;src:url(vendor/fonts/bricolage-grotesque-latin-400-normal.woff2) format("woff2")}
@font-face{font-family:"Bricolage Grotesque";font-weight:800;src:url(vendor/fonts/bricolage-grotesque-latin-800-normal.woff2) format("woff2")}
:root{color-scheme:dark}
body{margin:0;background:#03040a;color:#e6e9fb;font:18px/1.55 "Bricolage Grotesque",system-ui,sans-serif;padding:40px 20px 80px}
main{max-width:720px;margin:0 auto}
h1{font-size:40px;line-height:1.05;letter-spacing:-.02em;margin:0 0 20px;background:linear-gradient(90deg,#ffbb55,#ff6a5a);-webkit-background-clip:text;background-clip:text;color:transparent}
h2{font-size:26px;margin:44px 0 10px;color:#ffbb55}
ul{padding:0;list-style:none}
li{padding:16px 18px;margin:12px 0;border-radius:14px;background:#0d1024;box-shadow:0 0 0 1px rgba(140,160,255,.18)}
a{color:#7fe3ff}a b{color:#fff}
p{color:#b6bcdd} i{color:#8d94b8}
</style></head><body><main>${html}</main></body></html>
`);
console.log('recursos.html ok');
