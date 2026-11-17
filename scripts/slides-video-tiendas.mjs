// Genera las diapositivas 1920x1080 del video para casas de repuestos (marca RepuesTop).
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(pathToFileURL(join(raiz, 'node_modules/playwright/index.mjs')).href);
const out = join(raiz, 'capturas-tmp/video/slides');
import { readFileSync } from 'node:fs';
const logo = 'data:image/svg+xml;base64,' + readFileSync(join(raiz, '.claude/skills/publicidad-repuestop/plantillas/assets/logo_icono.svg')).toString('base64');
const css = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Montserrat:wght@700&display=swap');
*{box-sizing:border-box;margin:0}body{width:1920px;height:1080px;font-family:'Plus Jakarta Sans',sans-serif;background:#fff;color:#1B2440;position:relative;overflow:hidden}
.top{position:absolute;left:90px;top:60px;display:flex;align-items:center;gap:18px;font:700 44px Montserrat;color:#1B2440}.top img{height:64px}.top b{color:#0F4EC2}
.w{position:absolute;left:140px;right:140px;top:300px}.k{font-weight:800;font-size:28px;color:#0F4EC2;letter-spacing:3px;text-transform:uppercase}
h1{font-size:104px;line-height:1.05;font-weight:800;margin-top:24px}h1 mark{background:linear-gradient(transparent 62%,#F8C805 62%);color:inherit}
p{font-size:48px;line-height:1.35;color:#3B4A5E;margin-top:34px;max-width:1500px}.big{font-size:240px;font-weight:800;color:#0F4EC2;line-height:1;margin-top:20px}
.ola{position:absolute;left:0;right:0;bottom:0;height:110px;background:#0F4EC2}.ola:before{content:'';position:absolute;left:0;right:0;top:-40px;height:60px;background:#F8C805;opacity:.0}
.steps{display:flex;gap:30px;margin-top:40px}.s{flex:1;border-radius:28px;padding:36px;background:#F2F5FB;border:4px solid #E3E9F5}.s.on{background:#0F4EC2;color:#fff;border-color:#0F4EC2}.s .n{font-size:90px;font-weight:800;color:#F8C805}.s h3{font-size:42px;margin-top:10px}
.btn{display:inline-block;background:#F8C805;color:#1B2440;font-weight:800;font-size:64px;padding:30px 70px;border-radius:70px;margin-top:50px}
.fin{background:#fff;text-align:center}.fin .w{top:230px;left:0;right:0}.fin img{height:230px}.fin h2{font:700 120px Montserrat;margin-top:10px}.fin h2 b{color:#0F4EC2}.fin .l{font-size:60px;font-weight:800;color:#0F4EC2;display:inline-block;border-bottom:12px solid #F8C805;margin-top:20px}`;
const top = `<div class="top"><img src="${logo}"><span>Repues<b>Top</b></span></div>`;
const L = (k, h, p, extra = '') => `<style>${css}</style>${top}<div class="w"><div class="k">${k}</div><h1>${h}</h1>${p ? `<p>${p}</p>` : ''}${extra}</div><div class="ola"></div>`;
const steps = (on) => `<div class="steps">${[['Sube tu archivo','Tu Excel y tus fotos'],['Relaciona','Tus columnas con las de RepuesTop'],['Completa','Lo que falta, en amarillo'],['Revisa y publica','Cómo quedará en tu tienda']].map((s, i) => `<div class="s ${i + 1 === on ? 'on' : ''}"><div class="n">${i + 1}</div><h3>${s[0]}</h3><p style="font-size:30px;margin-top:10px;color:inherit">${s[1]}</p></div>`).join('')}</div>`;
const S = {
  '01_titulo': L('Para casas de repuestos', 'RepuesTop: <mark>vende más</mark> por patente', 'Así funciona la plataforma y cómo cargar tus productos.'),
  '02_b1': L('Beneficio 1', 'Clientes que llegan con su <mark>patente</mark>', 'Ven solo los repuestos que le sirven a su auto.'),
  '03_b2': L('Beneficio 2', 'Un <mark>panel web</mark> para tu inventario', 'Precios, stock y estado de cada producto, sincronizado con la web y la app.'),
  '04_b3': L('Beneficio 3', '<mark>Chat</mark> y cotización en PDF', 'Responde preguntas de disponibilidad y cotiza en el mismo chat. Repuestín ayuda a conectar compradores y tiendas.'),
  '05_b4': L('Beneficio 4', 'Un <mark>asistente</mark> para tu tienda', 'Ranking semanal y las búsquedas que perdiste.'),
  '06_b5': L('Beneficio 5', '<mark>Destaca</mark> tus productos', 'Con Moneda RepuesTop y Top Ventas.'),
  '07_b6': L('Beneficio 6', 'Pago seguro con <mark>Flow</mark>', 'Compra protegida para tus clientes.'),
  '08_costoA': L('Costos', 'Comisión solo cuando <mark>vendes</mark>', 'El comprador no paga comisión.', '<div class="big">7% <span style="font-size:110px">+ IVA</span></div>'),
  '09_costoB': L('Promoción para tiendas nuevas', 'Tu primer mes, <mark>gratis</mark>', 'Sin comisión de RepuesTop durante el mes: solo el costo del pago con Flow (2,89% + IVA). Recibes la insignia Fundador en tu perfil.'),
  '10_paso4': L('Carga con Excel · paso 4', 'Revisa y <mark>publica</mark>', 'Ves cómo quedará cada repuesto en tu tienda. Nada se publica hasta este último paso.', ''),
  '11_cierre': `<style>${css}</style><div class="fin"><div class="w"><img src="${logo}"><h2>Repues<b>Top</b></h2><p style="margin:10px auto 0;font-weight:800;color:#1B2440;font-size:64px">Movemos Chile juntos</p><div class="btn">repuestop.cl/vender</div><p style="margin:40px auto 0;font-size:46px">Tu primer mes gratis</p></div></div>`,
};
S['10_paso4'] = `<style>${css}</style>${top}<div class="w" style="top:200px"><div class="k">Carga con Excel</div><h1 style="font-size:84px">Revisa y <mark>publica</mark></h1>${steps(4)}<p style="font-size:42px;margin-top:10px">Ves cómo quedará cada repuesto en tu tienda. Nada se publica hasta este último paso.</p></div><div class="ola"></div>`;
const nav = await chromium.launch({ channel: 'msedge' });
const p = await (await nav.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
for (const [n, h] of Object.entries(S)) { await p.setContent(h, { waitUntil: 'networkidle' }); await p.waitForTimeout(500); await p.screenshot({ path: join(out, n + '.png') }); console.log(n); }
await nav.close();
