#!/usr/bin/env node
// Mantiene la memoria del agente igual para todo el equipo usando GitHub (solo este repo: Planificador_marketing).
//   node scripts/equipo.mjs traer   -> trae lo último que subieron los colegas (al iniciar sesión)
//   node scripts/equipo.mjs subir   -> guarda y sube los cambios de esta sesión (al terminar)
// Nunca toca los repos de RepuesTop. Los archivos pesados (videos) van a Google Drive, no aquí.
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const git = (...a) => execFileSync('git', a, { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const silencioso = process.argv.includes('--silencioso');
const decir = m => { if (!silencioso) console.log(m); };
const cmd = process.argv[2];

function rama() { try { return git('rev-parse', '--abbrev-ref', 'HEAD'); } catch { return 'main'; } }
function tieneCommits() { try { git('rev-parse', '--verify', '-q', 'HEAD'); return true; } catch { return false; } }
function remotoTiene(r) { try { return !!git('ls-remote', '--heads', 'origin', r); } catch { return false; } }
const intentar = (...a) => { try { git(...a); return true; } catch { return false; } };
// Trae lo del equipo sin quedar nunca trabado: si dos personas tocaron el mismo archivo,
// se combinan los cambios y, donde chocan, gana la versión de este computador (la más reciente).
function integrar(r) {
  if (intentar('pull', '--quiet', '--rebase', '--autostash', 'origin', r)) return [];
  intentar('rebase', '--abort');
  // Archivos que cambiaron los dos lados (aquí y en GitHub) desde el último punto en común.
  const lista = rango => { try { return git('diff', '--name-only', rango).split('\n').filter(Boolean); } catch { return []; } };
  const mios = new Set(lista(`origin/${r}...HEAD`));
  const chocan = lista(`HEAD...origin/${r}`).filter(f => mios.has(f));
  if (intentar('-c', 'core.editor=true', 'pull', '--quiet', '--no-rebase', '--no-edit', '-X', 'ours', 'origin', r)) return chocan;
  intentar('merge', '--abort');
  throw new Error('No pude combinar los cambios del equipo. Avísale al agente para revisarlo.');
}

// Guarda en un commit lo que cambió en este computador (si hay algo). Devuelve cuántos archivos.
function guardarLocal() {
  git('add', '-A');
  const cambios = git('diff', '--cached', '--name-only');
  if (!cambios) return 0;
  const n = cambios.split('\n').length;
  const quien = (() => { try { return git('config', 'user.name'); } catch { return 'equipo'; } })();
  git('commit', '--quiet', '-m', `chore(agente): memoria de marketing actualizada (${n} archivo(s))\n\nSesion de ${quien}.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`);
  return n;
}
const avisoChoque = l => l.length ? ` Ojo: estos archivos los cambiaron dos personas a la vez y quedó la versión de este computador: ${l.join(', ')}.` : '';

try {
  const r = rama();
  if (cmd === 'traer') {
    if (!remotoTiene(r)) { decir('GitHub aún no tiene esta rama; nada que traer.'); process.exit(0); }
    git('fetch', '--quiet', 'origin', r);
    if (!tieneCommits()) { git('reset', '--quiet', `origin/${r}`); decir('Memoria del equipo descargada.'); process.exit(0); }
    guardarLocal();
    const antes = git('rev-parse', 'HEAD');
    const chocan = integrar(r);
    const despues = git('rev-parse', 'HEAD');
    decir((antes === despues ? 'Memoria del equipo al día (sin cambios nuevos).' : 'Memoria del equipo actualizada con lo último de los colegas.') + avisoChoque(chocan));
  } else if (cmd === 'subir') {
    const n = guardarLocal();
    const pendientes = remotoTiene(r) && tieneCommits() ? (() => { git('fetch', '--quiet', 'origin', r); return Number(git('rev-list', '--count', `origin/${r}..HEAD`)); })() : 1;
    if (!n && !pendientes) { decir('Sin cambios para subir.'); process.exit(0); }
    const chocan = remotoTiene(r) ? integrar(r) : [];
    git('push', '--quiet', '-u', 'origin', r);
    decir(`Cambios subidos a GitHub. El equipo los verá al iniciar su próxima sesión.${avisoChoque(chocan)}`);
  } else {
    console.error('Uso: node scripts/equipo.mjs traer|subir'); process.exit(1);
  }
} catch (e) {
  // Nunca bloquear la sesión: avisar y seguir.
  console.error(`No se pudo sincronizar con GitHub (${cmd}): ${(e.stderr || e.message || '').toString().trim().split('\n').slice(-2).join(' ')}`);
  process.exit(0);
}
