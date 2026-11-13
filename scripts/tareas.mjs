#!/usr/bin/env node
// Historial de tareas de marketing (datos/tareas.json).
// Uso:
//   node scripts/tareas.mjs listar [--estado=propuesta]
//   node scripts/tareas.mjs agregar --titulo="..." --tipo=reel --red=instagram [--fecha=AAAA-MM-DD] [--publico=...] [--archivos=a,b] [--notas="..."]
//   node scripts/tareas.mjs estado <id> <propuesta|aprobada|en_produccion|lista|publicada|descartada>
//   node scripts/tareas.mjs resultado <id> --vistas=1200 --interacciones=80 --clics=14 [--notas="..."]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const ruta = join(raiz, 'datos/tareas.json');
const ESTADOS = ['propuesta', 'aprobada', 'en_produccion', 'lista', 'publicada', 'descartada'];

const [cmd, ...resto] = process.argv.slice(2);
const flags = Object.fromEntries(resto.filter(a => a.startsWith('--')).map(a => {
  const i = a.indexOf('=');
  return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)];
}));
const pos = resto.filter(a => !a.startsWith('--'));

mkdirSync(dirname(ruta), { recursive: true });
const datos = existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : { siguiente_id: 1, tareas: [] };
const guardar = () => writeFileSync(ruta, JSON.stringify(datos, null, 2) + '\n');
const hoy = () => new Date().toISOString().slice(0, 10);
const buscar = id => {
  const t = datos.tareas.find(x => x.id === Number(id));
  if (!t) { console.error(`No existe la tarea ${id}`); process.exit(1); }
  return t;
};

switch (cmd) {
  case 'agregar': {
    if (!flags.titulo) { console.error('Falta --titulo'); process.exit(1); }
    const t = {
      id: datos.siguiente_id++,
      fecha: flags.fecha || hoy(),
      tipo: flags.tipo || 'reel',
      titulo: flags.titulo,
      red: flags.red || '',
      publico: flags.publico || '',
      estado: 'propuesta',
      archivos: flags.archivos ? String(flags.archivos).split(',') : [],
      notas: flags.notas || '',
      resultado: null,
      historial: [{ fecha: hoy(), estado: 'propuesta' }],
    };
    datos.tareas.push(t);
    guardar();
    console.log(JSON.stringify(t, null, 2));
    break;
  }
  case 'estado': {
    const [id, estado] = pos;
    if (!ESTADOS.includes(estado)) { console.error(`Estado invalido. Usa: ${ESTADOS.join(', ')}`); process.exit(1); }
    const t = buscar(id);
    t.estado = estado;
    t.historial.push({ fecha: hoy(), estado });
    guardar();
    console.log(`Tarea ${t.id} -> ${estado}`);
    break;
  }
  case 'resultado': {
    const t = buscar(pos[0]);
    t.resultado = {
      medido: hoy(),
      vistas: Number(flags.vistas || 0),
      interacciones: Number(flags.interacciones || 0),
      clics: Number(flags.clics || 0),
      notas: flags.notas || '',
    };
    guardar();
    console.log(JSON.stringify(t.resultado, null, 2));
    break;
  }
  case 'listar': {
    const lista = datos.tareas.filter(t => !flags.estado || t.estado === flags.estado);
    for (const t of lista) console.log(`#${t.id} ${t.fecha} [${t.estado}] ${t.tipo}/${t.red || '-'} ${t.titulo}`);
    if (!lista.length) console.log('Sin tareas.');
    break;
  }
  default:
    console.error('Comandos: listar | agregar | estado | resultado');
    process.exit(1);
}
