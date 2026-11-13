#!/usr/bin/env node
// Lee commits nuevos de los repos de RepuesTop SIN escribir en ellos.
// Usa copias espejo propias en .espejos/. Uso: node scripts/sincronizar.mjs [--dias=30] [--no-guardar]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(raiz, 'config/repos.json'), 'utf8'));
const local = (() => { try { return JSON.parse(readFileSync(join(raiz, 'config/local.json'), 'utf8')); } catch { return {}; } })(); // rutas propias de cada computador
const estadoPath = join(raiz, 'estado/ultima-lectura.json');
const args = process.argv.slice(2);
const dias = Number((args.find(a => a.startsWith('--dias=')) || '--dias=30').split('=')[1]);
const guardar = !args.includes('--no-guardar');

const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
const estado = existsSync(estadoPath) ? JSON.parse(readFileSync(estadoPath, 'utf8')) : { repos: {} };
const MARKETING = /^(feat|fix\((app|web|seo|repuestin)|style|docs\(pase)|fundador|repuestin|precio|seo|texto|contrato|cotizacion|encargo|patente|moneda|taller|falla/i;

function espejo(r) {
  const dir = join(raiz, '.espejos', `${r.id}.git`);
  try {
    if (!existsSync(dir)) { mkdirSync(dirname(dir), { recursive: true }); git(raiz, 'clone', '--mirror', '--quiet', r.github, dir); }
    else git(dir, 'fetch', '--quiet', '--prune', 'origin');
    return { dir, fuente: 'github' };
  } catch {
    return { dir: join((local.repos && local.repos[r.id]) || r.ruta, '.git'), fuente: 'local(solo lectura)' };
  }
}

function commits(dir, rango, desde) {
  const base = ['log', '--no-merges', '--format=%H|%cI|%an|%s'];
  const a = desde ? [...base, rango] : [...base, `--since=${new Date(Date.now() - dias * 864e5).toISOString()}`, rango];
  let out = '';
  try { out = git(dir, ...a); } catch { return []; }
  return out.split('\n').filter(Boolean).map(l => {
    const [hash, fecha, autor, ...r] = l.split('|');
    const asunto = r.join('|');
    return { hash: hash.slice(0, 8), fecha, autor, asunto, marketing: MARKETING.test(asunto) };
  });
}

const resultado = { fecha: new Date().toISOString(), repos: {} };
let hayNovedades = false;
for (const r of cfg.repos) {
  const { dir, fuente } = espejo(r);
  const ref = b => { for (const p of [`refs/heads/${b}`, `refs/remotes/origin/${b}`]) { try { git(dir, 'rev-parse', '--verify', '-q', p); return p; } catch {} } return null; };
  const prev = estado.repos[r.id] || {};
  const salida = { fuente, ramas: {} };
  for (const [clave, rama] of [['produccion', r.rama_produccion], ['trabajo', r.rama_trabajo]]) {
    const p = ref(rama);
    if (!p) continue;
    const head = git(dir, 'rev-parse', p).slice(0, 8);
    const ultimo = prev[clave];
    const nuevos = commits(dir, ultimo ? `${ultimo}..${p}` : p, !!ultimo);
    // 'trabajo' solo muestra lo que aun no esta en produccion
    const filtrados = clave === 'trabajo' && ref(r.rama_produccion) ? nuevos.filter(c => { try { git(dir, 'merge-base', '--is-ancestor', c.hash, ref(r.rama_produccion)); return false; } catch { return true; } }) : nuevos;
    if (filtrados.length) hayNovedades = true;
    salida.ramas[clave] = { rama, head, desde: ultimo || `ultimos ${dias} dias`, commits: filtrados };
    prev[clave] = head;
  }
  estado.repos[r.id] = prev;
  resultado.repos[r.id] = salida;
}
resultado.hay_novedades = hayNovedades;
estado.actualizado = resultado.fecha;
if (guardar) writeFileSync(estadoPath, JSON.stringify(estado, null, 2) + '\n');
console.log(JSON.stringify(resultado, null, 2));
