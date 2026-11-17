#!/usr/bin/env node
// Graba, con cursor y aro de clic, todas las escenas del video v2 para casas de repuestos (web dev).
// Cada escena dura lo mismo que su frase en el audio: las acciones se programan con hora (beats).
// Uso: PU=<correo vendedor> PP=<clave> node scripts/grabar-video-tiendas.mjs  (cuentas de prueba de dev, solo por entorno)
import { pathToFileURL, fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(pathToFileURL(join(raiz, 'node_modules/playwright/index.mjs')).href);
const SOLO = process.env.SOLO || 'todo';
const out = join(raiz, 'capturas-tmp/panel5');
rmSync(out, { recursive: true, force: true }); mkdirSync(join(out, 'cuadros'), { recursive: true });
const A = join(raiz, 'capturas-tmp/panel');   // archivos de demo
const excel = join(A, 'demo_catalogo.xlsx'), zipFotos = join(A, 'fotos_demo.zip'), boleta = join(A, 'boleta_demo.pdf');

const nav = await chromium.launch({ channel: 'msedge' });
const ctx = await nav.newContext({ viewport: { width: 1600, height: 900 }, locale: 'es-CL' });
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
const cdp = await ctx.newCDPSession(p); const frames = [];
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  const f = join(out, 'cuadros', `f${String(frames.length).padStart(6, '0')}.jpg`);
  writeFileSync(f, Buffer.from(data, 'base64')); frames.push({ t: metadata.timestamp, f });
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1600, maxHeight: 900, everyNthFrame: 1 });

const ahora = () => Date.now() / 1000;
const marcas = {}, clicks = [], fallas = [];
const esp = (s) => p.waitForTimeout(Math.max(s, 0) * 1000);
const ir = async (loc, pasos = 22) => { const b = await loc.first().boundingBox({ timeout: 4000 }); if (b) await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: pasos }); };
const clic = async (loc) => { await ir(loc); await esp(0.35); clicks.push(ahora() + 0.05); await loc.first().click({ timeout: 6000 }); };
const nav2 = async (texto, url) => { try { await clic(p.getByText(texto, { exact: true }).first()); } catch { await p.goto(url, { waitUntil: 'networkidle' }); } };
const intentar = async (nombre, fn) => { try { await fn(); } catch (e) { fallas.push(nombre + ': ' + String(e.message).split('\n')[0]); console.log('FALLA', nombre, String(e.message).split('\n')[0].slice(0, 120)); } };
// escena: dura 'dur' s; cada beat [t, fn] se ejecuta cuando el reloj de la escena llega a t
async function escena(nombre, dur, beats) {
  const s0 = ahora(); marcas[nombre] = s0; console.log('>>', nombre, dur);
  for (const [t, fn] of beats) { const falta = s0 + t - ahora(); if (falta > 0) await esp(falta); await intentar(nombre + '@' + t, fn); }
  const resto = s0 + dur - ahora(); if (resto > 0) await esp(resto); else console.log('   (escena pasada por', (-resto).toFixed(1), 's)');
  marcas[nombre + '_fin'] = ahora();
}
// tiempos de inicio de frases (proporcional a los caracteres) para escenas de venta, retiro, etc.
const ini = (frases, dur, habla) => { const tot = frases.reduce((a, f) => a + f.length, 0); let a = 0; return frases.map(f => { const t = a / tot * habla; a += f.length; return +t.toFixed(2); }); };


await p.goto('https://dev-repuestop.repuestop.cl/', { waitUntil: 'networkidle', timeout: 60000 });
await esp(1); { const ok = p.getByRole('button', { name: 'Entendido' }); if (await ok.count()) await ok.first().click(); }
await p.getByText('Iniciar sesión').first().click(); await esp(2);
await p.getByText('Iniciar manualmente').first().click(); await esp(1.2);
await p.locator('input[type=email]').first().fill(process.env.PU); await p.locator('input[type=password]').first().fill(process.env.PP);
await p.keyboard.press('Enter'); await esp(7); await p.mouse.click(800, 746); await esp(1.5);

await escena('retiro', 20.1, [
  [0.3, async () => { await p.keyboard.press('Escape'); await nav2('Retirar dinero', 'https://dev-repuestop.repuestop.cl/perfil/retiros'); }],
  [3.4, async () => { await ir(p.getByText(/Retirar ahora/).first()); }],
  [8.0, async () => { await p.mouse.move(800, 640, { steps: 30 }); }],
  [12.4, async () => { await ir(p.getByText(/Total a retirar|TOTAL A RETIRAR/i).first()); }],
  [14.6, async () => { await ir(p.getByRole('button', { name: 'Solicitar retiro' }).last()); }],
]);
marcas.fin = ahora();

// ---- cerrar y armar el bruto
await cdp.send('Page.stopScreencast').catch(() => {});
const base = frames[0].t;
for (const k of Object.keys(marcas)) marcas[k] = +(marcas[k] - base).toFixed(2);
writeFileSync(join(out, 'marcas.json'), JSON.stringify(marcas, null, 2));
writeFileSync(join(out, 'clics.json'), JSON.stringify(clicks.map(c => +(c - base).toFixed(2))));
writeFileSync(join(out, 'fallas.json'), JSON.stringify(fallas, null, 2));
await ctx.close(); await nav.close();
const NL = String.fromCharCode(10), BS = String.fromCharCode(92); const ruta = (f) => f.split(BS).join('/');
let lista = 'ffconcat version 1.0' + NL;
frames.forEach((fr, i) => { const d = i < frames.length - 1 ? frames[i + 1].t - fr.t : 0.5; lista += `file '${ruta(fr.f)}'` + NL + `duration ${Math.max(d, 0.001).toFixed(4)}` + NL; });
lista += `file '${ruta(frames[frames.length - 1].f)}'` + NL;
writeFileSync(join(out, 'cuadros.txt'), lista);
execFileSync('C:/ffmpeg/ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', join(out, 'cuadros.txt'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '18', join(out, 'pantalla_bruto.mp4')], { stdio: 'ignore' });
console.log('LISTO', join(out, 'pantalla_bruto.mp4'), 'cuadros', frames.length, 'fallas', fallas.length);
