#!/usr/bin/env node
// Conecta este computador con la carpeta compartida de Google Drive del equipo ("RepuesTop Marketing").
// Requiere Google Drive para escritorio instalado y con sesión iniciada.
// Uso: node scripts/configurar-drive.mjs            (la busca sola)
//      node scripts/configurar-drive.mjs --ruta="G:/Mi unidad/RepuesTop Marketing"
// Guarda la ruta en config/local.json (propio de cada computador, no se sube a GitHub).
import { existsSync, readdirSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOMBRE = 'RepuesTop Marketing';
const manual = (process.argv.find(a => a.startsWith('--ruta=')) || '').split('=').slice(1).join('=');

function candidatos() {
  const out = [];
  const raices = [];
  for (const l of 'DEFGHIJKLMNOPQRSTUVWXYZ') { const r = `${l}:/`; if (existsSync(r)) raices.push(r); }
  const home = process.env.USERPROFILE || process.env.HOME || '';
  if (home) raices.push(join(home, 'Google Drive'), join(home, 'GoogleDrive'));
  for (const r of raices) {
    for (const unidad of ['Mi unidad', 'My Drive']) out.push(join(r, unidad, NOMBRE));
    for (const comp of ['Unidades compartidas', 'Shared drives']) {
      const c = join(r, comp);
      if (!existsSync(c)) continue;
      try { for (const d of readdirSync(c)) { out.push(join(c, d, NOMBRE)); if (d === NOMBRE) out.push(join(c, d)); } } catch {}
    }
  }
  return out.filter(p => { try { return existsSync(p); } catch { return false; } });
}

const encontrados = manual ? [manual].filter(existsSync) : candidatos();
if (!encontrados.length) {
  console.log(`No encontré la carpeta "${NOMBRE}" en Google Drive.

Qué hacer (una sola vez por computador):
 1. Instalar "Google Drive para escritorio" (google.com/drive/download) e iniciar sesión con la cuenta que tiene la carpeta.
 2. Quien tiene el plan Google AI Pro crea en su Drive la carpeta "${NOMBRE}" y la comparte con el equipo como Editor.
 3. Cada colega, en drive.google.com > Compartido conmigo > "${NOMBRE}" > Organizar > Añadir acceso directo > Mi unidad.
 4. Volver a ejecutar: node scripts/configurar-drive.mjs
    (o indicar la ruta: node scripts/configurar-drive.mjs --ruta="G:/Mi unidad/${NOMBRE}")`);
  process.exit(1);
}
const drive = encontrados[0].replace(/\\/g, '/');
mkdirSync(join(drive, 'entregas'), { recursive: true });
let local = {};
try { local = JSON.parse(readFileSync(join(raiz, 'config/local.json'), 'utf8')); } catch {}
local.drive = drive;
writeFileSync(join(raiz, 'config/local.json'), JSON.stringify(local, null, 2) + '\n');
console.log(`Listo: este computador guarda las entregas en ${drive}/entregas (compartido con el equipo).`);
if (encontrados.length > 1) console.log(`(Había más de una opción; usé la primera. Otras: ${encontrados.slice(1).join(' | ')})`);
