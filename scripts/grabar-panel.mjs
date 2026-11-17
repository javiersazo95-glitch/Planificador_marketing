#!/usr/bin/env node
// Graba la pantalla de la web DEV (Market y panel inventario) con cursor visible, para el video de tiendas.
// Uso: PU=<correo> PP=<clave> node scripts/grabar-panel.mjs [carpeta_salida]
// Las credenciales solo se leen del entorno (cuenta de prueba de dev). No publica nada: la carga de Excel se deja en el paso 3 y se descarta.
import { pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(pathToFileURL(join(raiz, 'node_modules/playwright/index.mjs')).href);
const out = process.argv[2] || join(raiz, 'capturas-tmp/panel');
mkdirSync(join(out, 'video'), { recursive: true });
const demo = join(raiz, 'capturas-tmp/panel/demo_catalogo.xlsx');

const nav = await chromium.launch({ channel: 'msedge' });
const ctx = await nav.newContext({
  viewport: { width: 1600, height: 900 }, locale: 'es-CL',
});
await ctx.addInitScript(() => {
  const poner = () => {
    if (document.getElementById('__cur')) return;
    const d = document.createElement('div'); d.id = '__cur';
    d.style.cssText = 'position:fixed;z-index:2147483647;width:22px;height:22px;border-radius:50%;background:rgba(248,200,5,.85);border:3px solid #0F4EC2;pointer-events:none;left:-50px;top:-50px;transform:translate(-50%,-50%);transition:left .05s linear,top .05s linear';
    document.documentElement.appendChild(d);
    addEventListener('mousemove', e => { d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; }, true);
    const st = document.createElement('style');
    st.textContent = '@keyframes __aro{from{transform:translate(-50%,-50%) scale(.3);opacity:1}to{transform:translate(-50%,-50%) scale(2.6);opacity:0}}';
    document.documentElement.appendChild(st);
    addEventListener('mousedown', e => {
      d.style.transform = 'translate(-50%,-50%) scale(.7)';
      const r = document.createElement('div');
      r.style.cssText = 'position:fixed;z-index:2147483646;width:60px;height:60px;border-radius:50%;border:5px solid #F8C805;box-shadow:0 0 0 3px #0F4EC2;pointer-events:none;left:' + e.clientX + 'px;top:' + e.clientY + 'px;animation:__aro .6s ease-out forwards';
      document.documentElement.appendChild(r); setTimeout(() => r.remove(), 700);
    }, true);
    addEventListener('mouseup', () => { d.style.transform = 'translate(-50%,-50%)'; }, true);
  };
  addEventListener('DOMContentLoaded', poner); poner();
});
const p = await ctx.newPage();
// Captura de pantalla por CDP (no necesita descargar nada): cada cambio de imagen queda con su hora y luego se arma el video con ffmpeg del equipo.
const cdp = await ctx.newCDPSession(p); const frames = [];
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  const f = join(out, 'video', `f${String(frames.length).padStart(6, '0')}.jpg`);
  writeFileSync(f, Buffer.from(data, 'base64')); frames.push({ t: metadata.timestamp, f });
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1600, maxHeight: 900, everyNthFrame: 1 });
const marcas = {}; const clicks = [];
const marca = (n) => { marcas[n] = Date.now() / 1000; console.log(n); };
const esp = (s) => p.waitForTimeout(s * 1000);
const ir = async (loc, pasos = 25) => { const b = await loc.boundingBox(); if (b) await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: pasos }); };
const clic = async (loc) => { await ir(loc); await esp(0.4); clicks.push(Date.now() / 1000 + 0.05); await loc.click(); };
const bajar = async (px, pasos = 6) => { for (let i = 0; i < pasos; i++) { await p.mouse.wheel(0, px / pasos); await esp(0.35); } };

// ---- MERCADO (web pública dev)
await p.goto('https://dev-repuestop.repuestop.cl/', { waitUntil: 'networkidle', timeout: 60000 });
await esp(1.5);
const ok = p.getByRole('button', { name: 'Entendido' }); if (await ok.count()) await ok.first().click();
await esp(1);
marca('market_ini');
await p.mouse.move(800, 400, { steps: 20 }); await esp(3);
const pat = p.getByPlaceholder(/Ingresa tu patente/);
await clic(pat); await pat.pressSequentially('ABCD11', { delay: 180 }); await esp(1.2);
await clic(p.getByRole('button', { name: /Buscar repuestos/ }).last()); await p.waitForLoadState('networkidle').catch(() => {}); await esp(5);
await bajar(500); await esp(2);
marca('market_fin');

// ---- PANEL (tras entrar; el inicio de sesión se corta en el montaje)
await p.goto('https://dev-inventario.repuestop.cl/', { waitUntil: 'networkidle', timeout: 60000 });
await p.fill('input[type=email]', process.env.PU); await p.fill('input[type=password]', process.env.PP);
await p.click('button[type=submit]'); await esp(6);
marca('panel_ini');
await p.mouse.move(700, 300, { steps: 20 }); await esp(5);          // tarjetas de resumen
await clic(p.getByText('Cuadrícula', { exact: true }).first()); await esp(4);
await clic(p.getByText('Tabla', { exact: true }).first()); await esp(2);
const bus = p.getByPlaceholder(/Buscar por SKU/);
await clic(bus); await bus.pressSequentially('freno', { delay: 200 }); await esp(4);
await bus.fill(''); await esp(1.5);
marca('panel_fin');

marca('cargar_ini');
await clic(p.getByText('Cargar inventario', { exact: true }).first()); await esp(3);
for (const t of ['Un repuesto', 'Cargar mi inventario con Excel', 'Sólo cambiar precios y stock']) { await ir(p.getByText(t).first()); await esp(2.5); }
marca('cargar_fin');

marca('excel_ini');
await clic(p.getByText('Cargar mi inventario con Excel').first()); await esp(4);
{ const d = p.getByText(/Descargar la plantilla/).first(); if (await d.count()) { await ir(d); await esp(3); } }
await p.locator('input[type=file][accept*=xlsx]').setInputFiles(demo); await esp(4);
marca('excel_paso1');
await clic(p.getByRole('button', { name: /Siguiente/ }).first()); await esp(5);
marca('excel_paso2'); await bajar(300); await esp(4);
await clic(p.getByRole('button', { name: /Siguiente/ }).first()); await esp(5);
marca('excel_paso3'); await bajar(250); await esp(5);
marca('excel_fin');
// limpiar el borrador para no dejar datos en dev
try { await clic(p.getByRole('button', { name: /Descartar todo/ })); await esp(1.5);
  const c = p.getByRole('button', { name: /Descartar|Sí|Confirmar/ }).last(); if (await c.count()) await c.click(); await esp(2); } catch {}

marca('historial_ini');
await clic(p.getByText('Historial de cargas', { exact: true }).first()); await esp(5);
const det = p.getByText('Ver detalle').first(); if (await det.count()) { await clic(det); await esp(5); }
marca('historial_fin');
marca('fin');

await cdp.send('Page.stopScreencast').catch(() => {});
const base0 = frames[0].t;
for (const k of Object.keys(marcas)) marcas[k] = +(marcas[k] - base0).toFixed(1);
writeFileSync(join(out, 'marcas.json'), JSON.stringify(marcas, null, 2));
writeFileSync(join(out, 'clics.json'), JSON.stringify(clicks.map(c => +(c - base0).toFixed(2))));
await ctx.close(); await nav.close();
// arma el video: cada cuadro dura hasta el siguiente
const NL = String.fromCharCode(10), BS = String.fromCharCode(92);
const ruta = (f) => f.split(BS).join('/');
let lista = 'ffconcat version 1.0' + NL;
frames.forEach((fr, i) => {
  const d = i < frames.length - 1 ? frames[i + 1].t - fr.t : 0.5;
  lista += `file '${ruta(fr.f)}'` + NL + `duration ${Math.max(d, 0.001).toFixed(4)}` + NL;
});
lista += `file '${ruta(frames[frames.length - 1].f)}'` + NL;
writeFileSync(join(out, 'cuadros.txt'), lista);
execFileSync('C:/ffmpeg/ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', join(out, 'cuadros.txt'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '18', join(out, 'pantalla_bruto.mp4')], { stdio: 'ignore' });
console.log('video listo', join(out, 'pantalla_bruto.mp4'), 'cuadros', frames.length);
