#!/usr/bin/env node
// Entregas: material (videos, fotos, audios, textos) que el equipo sube desde el panel para que el agente trabaje.
// Se guardan en la carpeta COMPARTIDA de Google Drive (config/local.json -> "drive"), así todo el equipo ve lo mismo:
//   <Drive>/entregas/<id>/entrega.json   ficha y estado (un archivo por entrega: nadie pisa a nadie)
//   <Drive>/entregas/<id>/<archivos>     material subido
//   <Drive>/entregas/<id>/resultado/     pieza final hecha por el agente
// Si este computador no tiene Drive configurado, se usa recursos/entrantes/ (solo local) y el panel lo advierte.
// CLI:
//   node scripts/entregas.mjs listar [--estado=recibido]
//   node scripts/entregas.mjs estado <id> <recibido|revisando|trabajando|listo|problema> --nota="qué estoy haciendo" [--resultado=ruta] [--tarea=1]
//   node scripts/entregas.mjs donde        (muestra dónde se están guardando)
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve, basename, isAbsolute, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

export const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ESTADOS = {
  recibido: 'Recibido: el agente aún no lo revisa',
  revisando: 'Revisando el material',
  trabajando: 'Trabajando en la pieza',
  listo: 'Listo para revisar',
  problema: 'Hay un problema con el material',
};

export function almacen() {
  let drive = null;
  try { drive = JSON.parse(readFileSync(join(raiz, 'config/local.json'), 'utf8')).drive || null; } catch {}
  if (drive && existsSync(drive)) return { base: join(drive, 'entregas'), compartido: true, drive };
  return { base: join(raiz, 'recursos/entrantes'), compartido: false, drive, falta: drive ? 'no-encontrada' : 'sin-configurar' };
}
const ficha = (base, id) => join(base, id, 'entrega.json');
const ahora = () => new Date().toISOString();
const escribir = (ruta, obj) => { const tmp = ruta + '.tmp'; writeFileSync(tmp, JSON.stringify(obj, null, 2) + '\n'); renameSync(tmp, ruta); };

export function cargar() {
  const { base, compartido } = almacen();
  const entregas = [];
  if (existsSync(base)) for (const d of readdirSync(base, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    try { entregas.push(JSON.parse(readFileSync(ficha(base, d.name), 'utf8'))); } catch {}
  }
  entregas.sort((a, b) => String(a.creada).localeCompare(String(b.creada)));
  return { compartido, entregas };
}
function buscar(id) {
  const { base } = almacen();
  const r = ficha(base, String(id));
  if (!existsSync(r)) throw new Error(`No existe la entrega ${id}`);
  return { ruta: r, e: JSON.parse(readFileSync(r, 'utf8')), base };
}

export function crear({ para = '', nota = '', autor = '' }) {
  const { base } = almacen();
  // id con fecha + azar: dos personas pueden crear entregas a la vez sin chocar
  const f = new Date();
  const id = `${f.toISOString().slice(0, 10).replace(/-/g, '')}-${String(f.getHours()).padStart(2, '0')}${String(f.getMinutes()).padStart(2, '0')}-${randomBytes(2).toString('hex')}`;
  mkdirSync(join(base, id), { recursive: true });
  const e = { id, creada: ahora(), autor: String(autor).slice(0, 80), para: String(para).slice(0, 200), nota: String(nota).slice(0, 2000),
    archivos: [], estado: 'recibido', resultado: null, tarea: null,
    historial: [{ fecha: ahora(), estado: 'recibido', nota: 'Material recibido desde el panel.' }] };
  escribir(ficha(base, id), e);
  return e;
}
export const carpetaDe = id => join(almacen().base, String(id));
export function agregarArchivo(id, nombre, bytes) {
  const { ruta, e } = buscar(id);
  e.archivos.push({ nombre, bytes }); escribir(ruta, e); return e;
}
export function cambiarEstado(id, estado, { nota = '', resultado, tarea } = {}) {
  if (!ESTADOS[estado]) throw new Error(`Estado inválido. Usa: ${Object.keys(ESTADOS).join(', ')}`);
  const { ruta, e, base } = buscar(id);
  if (resultado) {
    // El resultado se copia a la carpeta compartida de la entrega para que todo el equipo lo vea.
    const origen = isAbsolute(resultado) ? resultado : join(raiz, resultado);
    if (!existsSync(origen)) throw new Error(`No encuentro el resultado: ${resultado}`);
    const dest = join(base, String(id), 'resultado');
    mkdirSync(dest, { recursive: true });
    copyFileSync(origen, join(dest, basename(origen)));
    e.resultado = `${id}/resultado/${basename(origen)}`;
  }
  e.estado = estado;
  if (tarea) e.tarea = String(tarea);
  e.historial.push({ fecha: ahora(), estado, nota });
  escribir(ruta, e); return e;
}
// Ruta segura para mostrar archivos en el panel local: solo dentro de la carpeta de entregas.
export function rutaSegura(rel) {
  const { base } = almacen();
  const abs = resolve(base, rel);
  const r = relative(resolve(base), abs);
  return r && !r.startsWith('..') && !isAbsolute(r) && existsSync(abs) ? abs : null;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const [cmd, ...resto] = process.argv.slice(2);
  const flags = Object.fromEntries(resto.filter(a => a.startsWith('--')).map(a => { const i = a.indexOf('='); return [a.slice(2, i), a.slice(i + 1)]; }));
  const pos = resto.filter(a => !a.startsWith('--'));
  const a = almacen();
  if (cmd === 'donde') {
    console.log(a.compartido ? `Compartido en Google Drive: ${a.base}` : `SOLO LOCAL (${a.falta}): ${a.base}\nEjecuta: node scripts/configurar-drive.mjs`);
  } else if (cmd === 'listar') {
    if (!a.compartido) console.log(`⚠ Drive no configurado en este computador: solo veo entregas locales. Ejecuta node scripts/configurar-drive.mjs`);
    const l = cargar().entregas.filter(e => !flags.estado || e.estado === flags.estado);
    for (const e of l) console.log(`#${e.id} [${e.estado}] para: ${e.para || '-'}${e.autor ? ` · de ${e.autor}` : ''} · ${e.archivos.length} archivo(s) en ${join(a.base, e.id)}${e.nota ? ` · nota: ${e.nota}` : ''}`);
    if (!l.length) console.log('Sin entregas.');
  } else if (cmd === 'estado') {
    const e = cambiarEstado(pos[0], pos[1], flags);
    console.log(`Entrega ${e.id} -> ${e.estado}${flags.nota ? ` (${flags.nota})` : ''}`);
  } else { console.error('Comandos: donde | listar | estado'); process.exit(1); }
}
