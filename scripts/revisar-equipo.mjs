#!/usr/bin/env node
// Revisa si este computador está listo para trabajar con el agente de marketing y dice qué falta.
// Se ejecuta solo al abrir una sesión (gancho SessionStart) y también con /revisar.
// Uso: node scripts/revisar-equipo.mjs [--breve]   (--breve: solo muestra lo que falta)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const breve = process.argv.includes('--breve');
const win = process.platform === 'win32';
const sh = (cmd, args, ms = 15000) => { try { return execFileSync(cmd, args, { cwd: raiz, encoding: 'utf8', timeout: ms, stdio: ['ignore', 'pipe', 'pipe'] }).trim(); } catch { return null; } };
const leer = r => { try { return JSON.parse(readFileSync(join(raiz, r), 'utf8')); } catch { return null; } };
const local = leer('config/local.json') || {};
const repos = (leer('config/repos.json') || { repos: [] }).repos;

const res = []; // { ok: true|false|'aviso', que, detalle, arreglo, critico }
const add = (ok, que, detalle, arreglo = '', critico = true) => res.push({ ok, que, detalle, arreglo, critico });

// 1. Node
const nodeMayor = Number(process.versions.node.split('.')[0]);
add(nodeMayor >= 18, 'Node.js', `versión ${process.versions.node}`, 'Instalar Node.js 20 o más nuevo desde nodejs.org y volver a abrir Claude Code.');

// 2. Git con nombre (para guardar cambios a nombre de cada uno)
const gNombre = sh('git', ['config', 'user.name']);
const gCorreo = sh('git', ['config', 'user.email']);
add(!!(gNombre && gCorreo), 'Git con tu nombre', gNombre ? `${gNombre}` : 'sin nombre configurado',
  'Pídele al agente: «configura mi nombre en git» (o ejecuta git config --global user.name "Tu Nombre" y git config --global user.email "tu@correo").');

// 3. Acceso a GitHub de este repo (memoria compartida del equipo)
const remoto = sh('git', ['remote', 'get-url', 'origin']);
const accesoPropio = remoto && sh('git', ['ls-remote', '--heads', 'origin'], 20000) !== null;
add(!!accesoPropio, 'GitHub del equipo (Planificador_marketing)', accesoPropio ? 'conectado' : 'sin acceso',
  'Inicia sesión en GitHub en este computador (al hacer git pull te lo pedirá) y pide acceso al repo javiersazo95-glitch/Planificador_marketing.');

// 4. Lectura de los repos de RepuesTop (para saber las novedades del producto)
for (const r of repos) {
  const rutaLocal = (local.repos && local.repos[r.id]) || r.ruta;
  const hayLocal = rutaLocal && existsSync(join(rutaLocal, '.git'));
  const hayGithub = sh('git', ['ls-remote', '--heads', r.github, r.rama_produccion], 20000) !== null;
  add(hayGithub || hayLocal, `Lectura de ${r.descripcion} (${r.id})`, hayGithub ? 'acceso por GitHub' : hayLocal ? 'solo copia local' : 'sin acceso',
    `Pide acceso de lectura en GitHub a ${r.github.replace('https://github.com/', '').replace('.git', '')}.`);
}

// 5. Dependencias instaladas
const playwright = existsSync(join(raiz, 'node_modules/playwright'));
add(playwright, 'Herramienta de capturas (Playwright)', playwright ? 'instalada' : 'falta instalar', 'Ejecutar en esta carpeta: npm install', false);
const remotion = existsSync(join(raiz, 'estudio/node_modules/remotion'));
add(remotion, 'Estudio de video (Remotion)', remotion ? 'instalado' : 'falta instalar', 'Ejecutar en esta carpeta: npm --prefix estudio install', false);

// 6. Navegador para generar videos y capturas
const edge = win ? ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
  : ['/Applications/Microsoft Edge.app', '/usr/bin/microsoft-edge'].find(existsSync);
add(!!edge, 'Navegador Microsoft Edge', edge ? 'encontrado' : 'no encontrado',
  'Instalar Microsoft Edge (se usa para generar videos y capturas).', false);

// 7. Google Drive compartido (donde se guardan los videos y fotos del equipo)
const driveApp = win
  ? existsSync('C:/Program Files/Google/Drive File Stream') || (sh('tasklist', ['/FI', 'IMAGENAME eq GoogleDriveFS.exe']) || '').includes('GoogleDriveFS')
  : existsSync('/Applications/Google Drive.app');
const driveOk = !!(local.drive && existsSync(local.drive));
add(driveOk, 'Carpeta compartida de Google Drive', driveOk ? `conectada: ${local.drive}` : driveApp ? 'Drive instalado, falta conectar la carpeta' : 'Google Drive para escritorio no instalado',
  driveApp ? 'Pídele al agente: «configura Drive». Si no encuentra la carpeta, pide que te compartan «RepuesTop Marketing» y añade un acceso directo en Mi unidad.'
    : 'Instalar «Google Drive para escritorio» (google.com/drive/download), iniciar sesión, pedir acceso a la carpeta «RepuesTop Marketing» y luego decirle al agente: «configura Drive».');

// ---- salida ----
const faltan = res.filter(r => !r.ok);
const criticos = faltan.filter(r => r.critico);
const lineas = [];
lineas.push(`REVISIÓN DEL COMPUTADOR: ${res.length - faltan.length} de ${res.length} listo.${faltan.length ? ` Faltan ${faltan.length} cosa(s)${criticos.length ? `, ${criticos.length} importante(s)` : ''}.` : ' Todo listo para trabajar.'}`);
for (const r of breve ? faltan : res) {
  lineas.push(`${r.ok ? '[OK]' : r.critico ? '[FALTA]' : '[OPCIONAL]'} ${r.que}: ${r.detalle}`);
  if (!r.ok && r.arreglo) lineas.push(`      Cómo arreglarlo: ${r.arreglo}`);
}
lineas.push('Metricool (para publicar y ver números de las redes): lo revisa el agente en la conversación.');
if (faltan.length) lineas.push('INSTRUCCIÓN PARA EL AGENTE: antes de cualquier otra cosa, explícale al usuario en lenguaje simple qué le falta, en orden de importancia, y ofrécete a guiarlo paso a paso. Lo que puedas hacer tú (npm install, git config con los datos que te dé, «configura Drive») hazlo con su permiso.');
console.log(lineas.join('\n'));
