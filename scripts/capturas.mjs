#!/usr/bin/env node
// Saca capturas en formato celular de paginas PUBLICAS de repuestop.cl (sin iniciar sesion, sin escribir nada).
// Requiere: npm install (playwright) y npx playwright install chromium (pendiente de aprobacion del equipo).
// Uso: node scripts/capturas.mjs [--destino=contenido/AAAA-MM-DD-tema/capturas] [--rutas=/,/repuestos,/tiendas]
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, def) => (process.argv.find(a => a.startsWith(`--${n}=`)) || `--${n}=${def}`).split('=').slice(1).join('=');
const destino = join(raiz, arg('destino', `capturas-tmp/${new Date().toISOString().slice(0, 10)}`));
const rutas = arg('rutas', '/,/repuestos,/tiendas,/vender,/talleres,/fallas,/subastas').split(',');
const BASE = 'https://repuestop.cl';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.error('Falta Playwright. Pedir permiso al equipo para instalarlo: npm install && npx playwright install chromium'); process.exit(2); }

mkdirSync(destino, { recursive: true });
const nav = await chromium.launch({ channel: 'msedge' });
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'es-CL' });
const pag = await ctx.newPage();
for (const r of rutas) {
  const archivo = join(destino, (r === '/' ? 'inicio' : r.replace(/^\//, '').replace(/[\/:]/g, '-')) + '.png');
  try {
    await pag.goto(BASE + r, { waitUntil: 'networkidle', timeout: 45000 });
    // cierra el aviso de cookies eligiendo lo minimo (si aparece)
    const rechazar = pag.getByRole('button', { name: /cerrar|close|rechazar|solo necesarias/i });
    if (await rechazar.count()) await rechazar.first().click().catch(() => {});
    await pag.waitForTimeout(800);
    await pag.screenshot({ path: archivo });
    console.log('ok', archivo);
  } catch (e) { console.error('fallo', r, e.message); }
}
await nav.close();
