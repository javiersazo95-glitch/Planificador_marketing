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
const out = join(raiz, SOLO === 'market' ? 'capturas-tmp/panel3' : 'capturas-tmp/panel2');
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

// ================= MERCADO PÚBLICO =================
if (SOLO !== 'market') {
await p.goto('https://dev-repuestop.repuestop.cl/', { waitUntil: 'networkidle', timeout: 60000 });
await esp(1.5); { const ok = p.getByRole('button', { name: 'Entendido' }); if (await ok.count()) await ok.first().click(); }
await esp(1);
await escena('mercado', 20.5, [
  [1, async () => { await p.mouse.move(800, 420, { steps: 20 }); }],
  [3, async () => { const pat = p.getByPlaceholder(/Ingresa tu patente/); await clic(pat); await pat.pressSequentially('ABCD11', { delay: 170 }); }],
  [7, async () => { await clic(p.getByRole('button', { name: /Buscar repuestos/ }).last()); await p.waitForLoadState('networkidle').catch(() => {}); }],
  [11.5, async () => { await clic(p.getByText(/Ver repuestos disponibles/).first()); await p.waitForLoadState('networkidle').catch(() => {}); }],
  [15.5, async () => { await p.mouse.wheel(0, 260); }],
]);

// ================= PANEL INVENTARIO =================
await p.goto('https://dev-inventario.repuestop.cl/', { waitUntil: 'networkidle', timeout: 60000 });
await p.fill('input[type=email]', process.env.PU); await p.fill('input[type=password]', process.env.PP);
await p.click('button[type=submit]'); await esp(6);
await escena('panel', 29.2, [
  [0.3, async () => { await p.mouse.move(700, 290, { steps: 30 }); }],
  [4.5, async () => { await p.mouse.move(1150, 320, { steps: 30 }); }],
  [9, async () => { await p.mouse.move(500, 300, { steps: 30 }); }],
  [13.1, async () => { const b = p.getByPlaceholder(/Buscar por SKU/); await clic(b); await b.pressSequentially('freno', { delay: 200 }); }],
  [17.2, async () => { const b = p.getByPlaceholder(/Buscar por SKU/); await b.fill(''); const sel = p.locator('select').first(); await ir(sel); await esp(0.5); clicks.push(ahora()); await sel.selectOption({ index: 1 }).catch(() => {}); }],
  [21.4, async () => { await clic(p.getByText('Cuadrícula', { exact: true }).first()); }],
  [23.5, async () => { await clic(p.getByText('Tabla', { exact: true }).first()); }],
  [24.6, async () => { await p.mouse.move(1070, 90, { steps: 25 }); }],
  [26.6, async () => { await p.mouse.move(1400, 112, { steps: 25 }); }],
]);
await escena('formas', 17.4, [
  [0.3, async () => { await clic(p.getByText('Cargar inventario', { exact: true }).first()); }],
  [3.8, async () => { await ir(p.getByText('Un repuesto').first()); }],
  [7.7, async () => { await ir(p.getByText('Cargar mi inventario con Excel').first()); }],
  [11.8, async () => { await ir(p.getByText('Sólo cambiar precios y stock').first()); }],
]);
await escena('paso1', 18.9, [
  [0.6, async () => { await clic(p.getByText('Cargar mi inventario con Excel').first()); }],
  [4, async () => { await ir(p.getByText(/Tengo mi Excel/).first()); }],
  [6.5, async () => { await ir(p.getByText(/Prefiero la plantilla/).first()); }],
  [8.5, async () => { await p.locator('input[type=file][accept*=xlsx]').setInputFiles(excel); }],
  [12, async () => { await p.locator('input[type=file][accept*=zip]').last().setInputFiles(zipFotos); }],
  [16, async () => { await ir(p.getByRole('button', { name: /Siguiente/ })); }],
  [18.3, async () => { await clic(p.getByRole('button', { name: /Siguiente/ })); }],
]);
await escena('paso2', 9.8, [
  [1.2, async () => { await p.mouse.move(800, 500, { steps: 20 }); await p.mouse.wheel(0, 320); }],
  [5.5, async () => { await p.mouse.wheel(0, 320); }],
  [9.0, async () => { await clic(p.getByRole('button', { name: /Siguiente/ })); }],
]);
await escena('paso3', 13.5, [
  [1, async () => { await p.mouse.move(1250, 700, { steps: 30 }); }],
  [5.5, async () => { await clic(p.locator('button', { hasText: /^\s*\+?\s*Completar\s*$/ }).first()); }],
  [7.2, async () => { const o = p.locator('select:visible, [role=option]:visible').first(); if (await o.count()) { const tag = await o.evaluate(e => e.tagName); if (tag === 'SELECT') await o.selectOption({ index: 1 }); else await o.click(); } else await p.keyboard.press('Escape'); }],
  [8.8, async () => { await clic(p.getByRole('button', { name: 'Completar todas' })); }],
  [10.3, async () => { const d = p.locator('select:visible').last(); await d.selectOption({ index: 1 }); await esp(0.4); await clic(p.getByRole('button', { name: /Aplicar a las filas vacías/ })); }],
  [11.5, async () => { await clic(p.getByText('Elegir', { exact: true }).first()); }],
  [12.4, async () => { await clic(p.getByText(/^pastillas_freno_ce/).first()); }],
  [13.1, async () => { await clic(p.getByRole('button', { name: 'Listo', exact: true })); }],
]);
marcas.limbo = ahora();
await intentar('columnas_resto', async () => {
  await p.screenshot({ path: join(out, 'dbg_antes_columnas.png') });
  for (let i = 0; i < 4; i++) {
    const c = p.getByRole('button', { name: 'Completar todas' }); const n = await c.count(); console.log('  columnas iter', i, 'completar todas', n); if (!n) break;
    await c.first().evaluate(b => b.click()); await esp(1.2); console.log('  abierto');
    await p.screenshot({ path: join(out, 'dbg_dialogo' + i + '.png') });
    const sel = p.locator('select:visible').filter({ has: p.locator('option', { hasText: 'Elige un valor' }) }); const ns = await sel.count(); console.log('  selects visibles', ns);
    if (ns) await sel.first().selectOption({ index: 1 }, { timeout: 5000 });
    else { const chip = p.locator('button:visible').filter({ hasText: /6 meses|Todos|Cualquier|Universal/ }).first(); console.log('  chips', await chip.count()); await chip.click({ force: true, timeout: 5000 }); }
    await esp(0.8); { const ap = p.getByRole('button', { name: /Aplicar a las filas vac/ }); if (await ap.count()) await ap.first().click({ force: true, timeout: 4000 }).catch(() => {}); } await esp(1.4); console.log('  aplicado');
  }
});
await intentar('fotos_resto', async () => {
  const fotos = [/^disco_freno_venti/, /^filtro_aceite_blind/, /^filtro_aire/, /^amortiguador/, /^kit_embrague/];
  for (const f of fotos) { await p.getByText('Elegir', { exact: true }).first().click({ timeout: 6000 }); await esp(1.2); await p.getByText(f).first().click(); await esp(0.5); await p.getByRole('button', { name: 'Listo', exact: true }).click(); await esp(1); }
});
await escena('paso4', 10.8, [
  [0.3, async () => { await p.keyboard.press('Escape'); await clic(p.getByRole('button', { name: /Siguiente/ }).last()); }],
  [4.5, async () => { await p.mouse.move(800, 500, { steps: 20 }); await p.mouse.wheel(0, 380); }],
]);
// descartar el borrador (no se publica nada) — fuera del video
marcas.limpieza = ahora();
await intentar('descartar', async () => { await p.getByRole('button', { name: /Descartar todo/ }).first().evaluate(b => b.click()); await esp(1.2); await p.getByRole('button', { name: /Sí, descartar todo/ }).first().evaluate(b => b.click()); await esp(2); });
await escena('historial', 17.6, [
  [0.4, async () => { await clic(p.getByText('Historial de cargas', { exact: true }).first()); }],
  [4, async () => { await p.mouse.move(800, 520, { steps: 25 }); }],
  [8, async () => { const d = p.getByText('Ver detalle').first(); if (await d.count()) await clic(d); }],
]);

}
// ================= MERCADO: PANEL DE VENDEDOR =================
if (SOLO !== 'panel') {
await p.goto('https://dev-repuestop.repuestop.cl/', { waitUntil: 'networkidle', timeout: 60000 });
await esp(1); { const ok = p.getByRole('button', { name: 'Entendido' }); if (await ok.count()) await ok.first().click(); }
await p.getByText('Iniciar sesión').first().click(); await esp(2);
await p.getByText('Iniciar manualmente').first().click(); await esp(1.2);
await p.locator('input[type=email]').first().fill(process.env.PU); await p.locator('input[type=password]').first().fill(process.env.PP);
await p.keyboard.press('Enter'); await esp(7); await p.mouse.click(800, 746); await esp(1.5);

const vf = ['Ahora, cómo avanzar una venta.', 'Cuando un cliente paga, el pedido aparece en Pedidos recibidos con la boleta pendiente.', 'Presiona Confirmar pedido.', 'Son tres pasos.', 'Primero, confirmas que tienes el stock y puedes cumplir la entrega.', 'Segundo, revisas que el repuesto sea compatible con el vehículo del comprador.', 'Y tercero, adjuntas la boleta o factura en PDF.', 'Con eso el pedido queda en preparación, y ya puedes avisar que está listo para retirar.'];
const T = ini(vf, 29.6, 27.8);
let idxPedido = 0;
await p.goto('https://dev-repuestop.repuestop.cl/perfil/pedidos', { waitUntil: 'networkidle' }); await esp(2.5);
await intentar('buscar_pedido', async () => {
  const n = await p.getByRole('button', { name: 'Confirmar pedido' }).count();
  for (let i = 0; i < n; i++) {
    await p.getByRole('button', { name: 'Confirmar pedido' }).nth(i).click({ timeout: 6000 }); await esp(1.8);
    const t = await p.innerText('body'); const ok = /Paso 1 de 3/.test(t);
    await p.getByRole('button', { name: 'Volver', exact: true }).last().click({ timeout: 5000 }).catch(() => p.keyboard.press('Escape')); await esp(1);
    if (ok) { idxPedido = i; break; }
  }
  console.log('pedido elegido idx', idxPedido);
});
await p.goto('https://dev-repuestop.repuestop.cl/perfil/resumen', { waitUntil: 'networkidle' }); await esp(2);
const tarjeta = () => p.locator('div').filter({ hasText: /Venta 2587 9683 28/ }).last();
await escena('ventas', 29.6, [
  [0.2, async () => { await nav2('Pedidos recibidos', 'https://dev-repuestop.repuestop.cl/perfil/pedidos'); }],
  [T[1] + 1.5, async () => { await p.mouse.move(900, 700, { steps: 25 }); await p.mouse.wheel(0, 300); }],
  [T[2] + 0.2, async () => { await p.mouse.wheel(0, -300); await esp(0.3); await clic(p.getByRole('button', { name: 'Confirmar pedido' }).nth(idxPedido)); }],
  [T[4] + 2.2, async () => { const c = p.getByText('Tengo el stock y puedo cumplir la entrega'); await c.first().waitFor({ timeout: 9000 }); await clic(c); }],
  [T[5] + 2.8, async () => { const c = p.getByText('Revisé que estos repuestos son compatibles'); await c.first().waitFor({ timeout: 9000 }); await clic(c); }],
  [T[6] + 1.2, async () => { const f = p.locator('input[type=file]').last(); await f.waitFor({ state: 'attached', timeout: 9000 }); await f.setInputFiles(boleta); }],
  [T[7] + 0.6, async () => { const b = p.getByRole('button', { name: /Confirmar pedido|Confirmar/ }).last(); await clic(p.locator('button[type=submit]:not([disabled])').last()); }],
  [T[7] + 3.8, async () => { const b = p.getByRole('button', { name: 'Entendido' }); if (await b.count()) await clic(b.last()); }],
  [T[7] + 5.8, async () => { await ir(p.getByRole('button', { name: /Listo para retirar/ })); }],
]);
const rf = ['Cuando una venta termina, el dinero queda disponible.', 'En Retirar dinero ves el monto disponible y las ventas listas.', 'Elige una venta y presiona Solicitar retiro, o usa Retirar ahora, y el depósito se hace a tus datos bancarios.'];
const R = ini(rf, 16.4, 14.5);
await escena('retiro', 16.4, [
  [0.3, async () => { await p.keyboard.press('Escape'); await nav2('Retirar dinero', 'https://dev-repuestop.repuestop.cl/perfil/retiros'); }],
  [R[1] + 0.6, async () => { await ir(p.getByText(/Retirar ahora/).first()); }],
  [R[2] + 0.5, async () => { await ir(p.getByRole('button', { name: 'Solicitar retiro' }).first()); }],
  [R[2] + 5.5, async () => { await ir(p.getByText(/Retirar ahora/).first()); }],
]);
await escena('preguntas', 10.3, [
  [0.3, async () => { await p.keyboard.press('Escape'); await nav2('Preguntas de productos', 'https://dev-repuestop.repuestop.cl/perfil/preguntas_productos'); }],
  [3.6, async () => { await clic(p.getByRole('button', { name: /Pendientes/ }).first()); }],
  [5.3, async () => { const t = p.getByPlaceholder(/Escribe la respuesta pública/).first(); await clic(t); await t.pressSequentially('Hola, sí tenemos stock disponible. ¡Te esperamos!', { delay: 45 }); }],
  [8.9, async () => { await clic(p.getByRole('button', { name: 'Responder' }).first()); }],
]);
const ef = ['En Encargos puedes ver lo que los compradores necesitan y enviar tu oferta.', 'Entra al mural público, elige un encargo, revisa el vehículo y el repuesto que piden, selecciona el producto de tu inventario que lo cubre, y envía tu oferta.', 'Después puedes seguirla en Mis ofertas.'];
const E = ini(ef, 18.8, 17);
await p.goto('https://dev-repuestop.repuestop.cl/subastas', { waitUntil: 'networkidle' }); await esp(2);
await escena('encargos', 18.8, [
  [0.4, async () => { await p.mouse.move(900, 620, { steps: 25 }); }],
  [E[1] + 0.2, async () => { await clic(p.getByRole('button', { name: /Ver encargo/ }).first()); await p.waitForLoadState('networkidle').catch(() => {}); }],
  [E[1] + 2.6, async () => { await clic(p.getByRole('button', { name: 'Enviar oferta' }).first()); }],
  [E[1] + 4.2, async () => { await clic(p.getByText('Juego de pastillas de freno delanteras').first()); }],
  [E[1] + 5.8, async () => { const pr = p.getByPlaceholder('Ej: 45000').first(); await clic(pr); await pr.fill('18990'); }],
  [E[1] + 7.4, async () => { await clic(p.getByRole('button', { name: /Revisar oferta/ })); }],
  [E[1] + 9.3, async () => { await clic(p.getByRole('button', { name: /Confirmar y enviar/ })); }],
  [E[2] + 0.6, async () => { await p.keyboard.press('Escape'); await p.goto('https://dev-repuestop.repuestop.cl/perfil/gestion_subastas', { waitUntil: 'networkidle' }); }],
]);
}
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
