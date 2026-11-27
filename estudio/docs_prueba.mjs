// Documentos DE PRUEBA para acreditar el taller ficticio en la web de pruebas. No imitan ningun documento real.
// Uso: node estudio/docs_prueba.mjs carpeta_salida
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const salida = resolve(process.argv[2] || 'estudio/out/taller');
mkdirSync(salida, { recursive: true });

const documentos = {
  '1_identidad_PRUEBA': 'Identidad del responsable',
  '2_inicio_actividades_PRUEBA': 'Inicio de actividades',
  '3_patente_municipal_PRUEBA': 'Patente municipal',
};
const pagina = (titulo) => `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;font-family:Arial,sans-serif;color:#111;text-align:center;padding:90px 60px}
  .sello{border:8px dashed #c0392b;color:#c0392b;font-size:44px;font-weight:700;padding:26px;margin-bottom:60px}
  h1{font-size:34px} p{font-size:22px;line-height:1.6}
  .fondo{position:fixed;left:-120px;top:520px;width:1100px;transform:rotate(-30deg);font-size:96px;font-weight:700;color:rgba(192,57,43,.13)}
</style><div class="fondo">SIN VALOR · PRUEBA</div>
<div class="sello">DOCUMENTO DE PRUEBA<br>SIN VALOR LEGAL</div>
<h1>Archivo de ejemplo: «${titulo}»</h1>
<p>Taller ficticio: Mecánica Tres Bujías.<br>Sirve solo para probar la web de pruebas de RepuesTop.<br>No es un documento oficial, no acredita nada y no corresponde a ninguna persona ni empresa.</p>`;

const nav = await chromium.launch({ channel: 'chrome' });
const pag = await nav.newPage();
for (const [archivo, titulo] of Object.entries(documentos)) {
  await pag.setContent(pagina(titulo));
  await pag.pdf({ path: join(salida, `${archivo}.pdf`), format: 'A4', printBackground: true });
  console.log(join(salida, `${archivo}.pdf`));
}
await nav.close();
