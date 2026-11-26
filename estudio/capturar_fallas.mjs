// Captura la parte de arriba de la pantalla publica de Fallas (produccion, sin sesion) para el comic.
// Uso: node estudio/capturar_fallas.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const salida = join(dirname(fileURLToPath(import.meta.url)), 'public/comic');
mkdirSync(salida, { recursive: true });
const nav = await chromium.launch({ channel: 'chrome' });
const pag = await nav.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 4, isMobile: true, hasTouch: true });
await pag.goto('https://repuestop.cl/fallas', { waitUntil: 'networkidle' });
await pag.getByText('Registra la falla de tu veh').filter({ visible: true }).first().waitFor();
await pag.waitForTimeout(1500);
// solo encabezado y aviso naranjo: se dejan fuera los contadores y el aviso de almacenamiento
await pag.screenshot({ path: join(salida, 'fallas_arriba.png'), clip: { x: 0, y: 0, width: 375, height: 193 } });
console.log(join(salida, 'fallas_arriba.png'));
await nav.close();
