// Fotos de perfil para el taller ficticio de los ejemplos (cuenta de pruebas).
// Uso: node estudio/logos_taller.mjs carpeta_salida
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const salida = resolve(process.argv[2] || 'estudio/out/taller');
mkdirSync(salida, { recursive: true });

const texto = (y, t, tam, color, esp = 0) =>
  `<text x="512" y="${y}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="${tam}" letter-spacing="${esp}" fill="${color}">${t}</text>`;

// engranaje centrado en (0,0)
const engranaje = (r, dientes, color) => {
  const puntas = Array.from({ length: dientes }, (_, i) => `<rect x="${-r * 0.13}" y="${-r * 1.24}" width="${r * 0.26}" height="${r * 0.36}" rx="${r * 0.06}" transform="rotate(${(360 / dientes) * i})"/>`).join('');
  return `<g fill="${color}">${puntas}<circle r="${r}"/></g>`;
};

// bujia de pie, centrada en x=0, de alto ~330
const bujia = (x, y, giro) => `<g transform="translate(${x},${y}) rotate(${giro})" stroke="#14181F" stroke-width="10" stroke-linejoin="round">
  <rect x="-22" y="-170" width="44" height="42" rx="10" fill="#C9CFD9"/>
  <path d="M-34 -130 H34 L44 -20 H-44 Z" fill="#FFFFFF"/>
  <path d="M-40 -96 H40 M-42 -70 H42" fill="none"/>
  <rect x="-62" y="-22" width="124" height="60" rx="12" fill="#C9CFD9"/>
  <rect x="-40" y="38" width="80" height="78" rx="6" fill="#8D96A6"/>
  <path d="M-40 62 H40 M-40 86 H40" fill="none" stroke-width="7"/>
  <path d="M-8 116 V146 M26 116 V160 H4" fill="none" stroke-linecap="round"/>
</g>`;

const logos = {
  piston_nielol: `<circle cx="512" cy="512" r="512" fill="#14312A"/>
    <circle cx="512" cy="512" r="474" fill="none" stroke="#F2B233" stroke-width="16"/>
    <path d="M150 560 L330 372 L420 458 L540 300 L700 470 L770 420 L874 560 Z" fill="#2F6B52"/>
    <g stroke="#14181F" stroke-width="12" stroke-linejoin="round" transform="translate(0,-36)">
      <path d="M482 386 L470 560 L554 560 L542 386 Z" fill="#8D96A6"/>
      <circle cx="512" cy="548" r="46" fill="#C9CFD9"/><circle cx="512" cy="548" r="16" fill="#14181F"/>
      <rect x="396" y="196" width="232" height="204" rx="26" fill="#E7EBF1"/>
      <path d="M396 250 H628 M396 288 H628 M396 326 H628" fill="none" stroke-width="10"/>
      <circle cx="512" cy="370" r="20" fill="#8D96A6"/>
    </g>
    ${texto(668, 'MECÁNICA', 74, '#F2B233', 14)}
    ${texto(768, 'PISTÓN ÑIELOL', 90, '#FFFFFF')}
    ${texto(848, 'TEMUCO', 44, '#9FD1B9', 18)}`,

  temuco_city: `<circle cx="512" cy="512" r="512" fill="#1C2330"/>
    <circle cx="512" cy="512" r="474" fill="none" stroke="#FF7A1A" stroke-width="16"/>
    <g transform="translate(512,340)">${engranaje(168, 12, '#FF7A1A')}<circle r="126" fill="#1C2330"/></g>
    <g fill="#FFFFFF">
      <path d="M420 392 V318 H448 V282 H492 V350 H512 V250 H562 V332 H586 V300 H616 V392 Z"/>
      <rect x="396" y="392" width="244" height="16" rx="8"/>
    </g>
    ${texto(650, 'MECÁNICA GENERAL', 66, '#FFFFFF', 3)}
    ${texto(762, 'TEMUCO CITY', 100, '#FF7A1A')}
    ${texto(846, 'FRENOS · MOTOR · ELÉCTRICO', 36, '#AEB8C9', 3)}`,

  tres_bujias: `<circle cx="512" cy="512" r="512" fill="#B3261E"/>
    <circle cx="512" cy="512" r="474" fill="none" stroke="#FFF3E0" stroke-width="16"/>
    ${bujia(360, 350, -18)}${bujia(664, 350, 18)}${bujia(512, 326, 0)}
    ${texto(642, 'MECÁNICA', 74, '#FFD9A0', 14)}
    ${texto(756, 'TRES BUJÍAS', 104, '#FFFFFF')}
    ${texto(842, 'TEMUCO', 44, '#FFD9A0', 18)}`,
};

const nav = await chromium.launch({ channel: 'chrome', args: ['--disable-gpu'] });
const pag = await nav.newPage();
const fuente = '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=swap" rel="stylesheet">';
const pintar = async (cuerpo, ancho, alto, archivo, transparente) => {
  await pag.setViewportSize({ width: ancho, height: alto });
  await pag.setContent(`<!doctype html><meta charset="utf-8">${fuente}<style>html,body{margin:0}</style><body>${cuerpo}</body>`, { waitUntil: 'networkidle' });
  await pag.evaluate(() => document.fonts.ready);
  await pag.screenshot({ path: join(salida, archivo), omitBackground: transparente });
  console.log(join(salida, archivo));
};
const svg = (c, lado) => `<svg width="${lado}" height="${lado}" viewBox="0 0 1024 1024">${c}</svg>`;

// archivos para subir: cuadrados de 1024 (la app los muestra redondos)
for (const [nombre, c] of Object.entries(logos)) {
  const fondo = c.match(/fill="(#[0-9A-F]{6})"/i)[1];
  await pintar(svg(`<rect width="1024" height="1024" fill="${fondo}"/>${c}`, 1024), 1024, 1024, `taller_${nombre}.png`, false);
}
// lamina para elegir: grande y como se ve de chico en la app
const lamina = Object.values(logos).map((c, i) => `<div style="display:flex;flex-direction:column;align-items:center;gap:26px">
  <div style="font:800 56px 'Plus Jakarta Sans';color:#1B2440">${i + 1}</div>${svg(c, 520)}${svg(c, 90)}</div>`).join('');
await pintar(`<div style="display:flex;gap:50px;padding:36px 50px;background:#fff;justify-content:center">${lamina}</div>`, 1760, 820, 'taller_opciones.png', false);
await nav.close();
