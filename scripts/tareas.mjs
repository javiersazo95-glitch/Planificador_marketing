#!/usr/bin/env node
// Historial de tareas de marketing. Una tarea = un archivo en datos/tareas/<id>.json
// (así dos colegas pueden agregar tareas a la vez sin chocar en GitHub).
// Uso:
//   node scripts/tareas.mjs listar [--estado=propuesta]
//   node scripts/tareas.mjs agregar --titulo="..." --tipo=reel --red=instagram [--fecha=AAAA-MM-DD] [--publico=...] [--archivos=a,b] [--notas="..."]
//   node scripts/tareas.mjs estado <id> <propuesta|aprobada|en_produccion|lista|publicada|descartada>
//   node scripts/tareas.mjs resultado <id> --vistas=1200 --interacciones=80 --clics=14 [--notas="..."]
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(raiz, 'datos/tareas');
export const ESTADOS = ['propuesta', 'aprobada', 'en_produccion', 'lista', 'publicada', 'descartada'];
const hoy = () => new Date().toISOString().slice(0, 10);
const escribir = t => { mkdirSync(dir, { recursive: true }); const r = join(dir, `${t.id}.json`); writeFileSync(r + '.tmp', JSON.stringify(t, null, 2) + '\n'); renameSync(r + '.tmp', r); };

// Migra el formato antiguo (un solo datos/tareas.json) a un archivo por tarea.
function migrar() {
  const viejo = join(raiz, 'datos/tareas.json');
  if (!existsSync(viejo)) return;
  try { for (const t of JSON.parse(readFileSync(viejo, 'utf8')).tareas || []) { t.id = String(t.id); if (!existsSync(join(dir, `${t.id}.json`))) escribir(t); } } catch { return; }
  renameSync(viejo, viejo + '.migrado');
}

export function cargar() {
  migrar();
  if (!existsSync(dir)) return [];
  const l = [];
  for (const f of readdirSync(dir)) if (f.endsWith('.json')) { try { l.push(JSON.parse(readFileSync(join(dir, f), 'utf8'))); } catch {} }
  return l.sort((a, b) => `${a.fecha}${a.creada || ''}${a.id}`.localeCompare(`${b.fecha}${b.creada || ''}${b.id}`));
}
function buscar(id) {
  const r = join(dir, `${id}.json`);
  if (!existsSync(r)) { console.error(`No existe la tarea ${id}`); process.exit(1); }
  return JSON.parse(readFileSync(r, 'utf8'));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const [cmd, ...resto] = process.argv.slice(2);
  const flags = Object.fromEntries(resto.filter(a => a.startsWith('--')).map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
  const pos = resto.filter(a => !a.startsWith('--'));
  switch (cmd) {
    case 'agregar': {
      if (!flags.titulo) { console.error('Falta --titulo'); process.exit(1); }
      const f = new Date();
      const t = {
        id: `${f.toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(2).toString('hex')}`,
        creada: f.toISOString(), fecha: flags.fecha || hoy(), tipo: flags.tipo || 'reel', titulo: flags.titulo,
        red: flags.red || '', publico: flags.publico || '', estado: 'propuesta',
        archivos: flags.archivos ? String(flags.archivos).split(',') : [], notas: flags.notas || '', resultado: null,
        historial: [{ fecha: hoy(), estado: 'propuesta' }],
      };
      escribir(t); console.log(JSON.stringify(t, null, 2)); break;
    }
    case 'estado': {
      const [id, estado] = pos;
      if (!ESTADOS.includes(estado)) { console.error(`Estado inválido. Usa: ${ESTADOS.join(', ')}`); process.exit(1); }
      const t = buscar(id); t.estado = estado; t.historial.push({ fecha: hoy(), estado }); escribir(t);
      console.log(`Tarea ${t.id} -> ${estado}`); break;
    }
    case 'resultado': {
      const t = buscar(pos[0]);
      t.resultado = { medido: hoy(), vistas: Number(flags.vistas || 0), interacciones: Number(flags.interacciones || 0), clics: Number(flags.clics || 0), notas: flags.notas || '' };
      escribir(t); console.log(JSON.stringify(t.resultado, null, 2)); break;
    }
    case 'listar': {
      const l = cargar().filter(t => !flags.estado || t.estado === flags.estado);
      for (const t of l) console.log(`#${t.id} ${t.fecha} [${t.estado}] ${t.tipo}/${t.red || '-'} ${t.titulo}`);
      if (!l.length) console.log('Sin tareas.'); break;
    }
    default: console.error('Comandos: listar | agregar | estado | resultado'); process.exit(1);
  }
}
