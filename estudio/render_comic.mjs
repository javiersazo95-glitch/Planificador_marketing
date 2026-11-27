// Exporta las laminas del elenco comic a PNG (Chrome + playwright).
// Uso: node estudio/render_comic.mjs [carpeta_salida] [cap1]   ("cap1" exporta solo las escenas del capitulo)
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const salida = resolve(process.argv[2] || join(aqui, 'out/comic'));
mkdirSync(join(salida, 'recortes'), { recursive: true });

const tmp = join(aqui, 'out/comic_ssr.mjs');
await build({
  stdin: {
    contents: `import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LaminaComic, ExpresionesComic, EscenaComic, RecorteComic } from './laminas.jsx';
import { Escena1, Escena2, Escena3, EscenaApp, Escena4 } from './cap1.jsx';
import { ELENCO_COMIC } from './elenco.jsx';
export const nombres = Object.keys(ELENCO_COMIC);
const C = { LaminaComic, ExpresionesComic, EscenaComic, RecorteComic, Escena1, Escena2, Escena3, EscenaApp, Escena4 };
export const html = (n, p = {}) => renderToStaticMarkup(React.createElement(C[n], p));`,
    resolveDir: join(aqui, 'src/comic'), loader: 'jsx',
  },
  bundle: true, platform: 'node', format: 'esm', outfile: tmp, logLevel: 'error',
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
});
const m = await import(pathToFileURL(tmp).href);

const nav = await chromium.launch({ channel: 'chrome', args: ['--disable-gpu'] }); // sin GPU: evita lineas finas en las esquinas redondeadas
const pag = await nav.newPage();
const foto = async (cuerpo, ancho, alto, archivo, transparente = false) => {
  await pag.setViewportSize({ width: ancho, height: alto });
  await pag.setContent(`<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,600;0,700;0,800;1,800&display=swap" rel="stylesheet"><style>html,body{margin:0;width:${ancho}px;height:${alto}px;position:relative;overflow:hidden}</style><body>${cuerpo}</body>`, { waitUntil: 'networkidle' });
  await pag.evaluate(() => document.fonts.ready);
  await pag.screenshot({ path: join(salida, archivo), omitBackground: transparente });
  console.log(join(salida, archivo));
};

await foto(m.html('Escena1'), 1080, 1920, 'cap1_escena1.png');
await foto(m.html('Escena2'), 1080, 1920, 'cap1_escena2.png');
const pantalla = 'data:image/png;base64,' + readFileSync(join(aqui, 'public/comic/fallas_arriba.png'), 'base64');
await foto(m.html('Escena3', { pantalla }), 1080, 1920, 'cap1_escena3.png');
const png = (n) => 'data:image/png;base64,' + readFileSync(join(aqui, 'public/comic', n), 'base64');
await foto(m.html('EscenaApp', { falla: png('app_falla.png'), diagnostico: png('app_diagnostico.png') }), 1080, 1920, 'cap1_escena_app.png');
await foto(m.html('Escena4'), 1080, 1920, 'cap1_escena4.png');
if (process.argv[3] === 'cap1') { await nav.close(); rmSync(tmp); process.exit(0); }
await foto(m.html('LaminaComic'), 1880, 1820, '01_elenco.png');
await foto(m.html('ExpresionesComic'), 1920, 1800, '02_caras.png');
await foto(m.html('EscenaComic'), 1080, 1920, '03_escena_reel.png');
for (const quien of m.nombres) await foto(m.html('RecorteComic', { quien }), 900, 1300, `recortes/${quien}.png`, true);
await nav.close();
rmSync(tmp);
