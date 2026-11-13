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

try {
  if (cmd === 'traer') {
    const r = rama();
    if (!remotoTiene(r)) { decir('GitHub aún no tiene esta rama; nada que traer.'); process.exit(0); }
    git('fetch', '--quiet', 'origin', r);
    if (!tieneCommits()) { git('reset', '--quiet', `origin/${r}`); decir('Memoria del equipo descargada.'); process.exit(0); }
    const antes = git('rev-parse', 'HEAD');
    git('pull', '--quiet', '--rebase', '--autostash', 'origin', r);
    const despues = git('rev-parse', 'HEAD');
    decir(antes === despues ? 'Memoria del equipo al día (sin cambios nuevos).' : `Memoria del equipo actualizada: ${git('log', '--oneline', `${antes}..${despues}`).split('\n').length} cambio(s) de colegas.`);
  } else if (cmd === 'subir') {
    git('add', '-A');
    const cambios = git('diff', '--cached', '--name-only');
    if (!cambios) { decir('Sin cambios para subir.'); process.exit(0); }
    const n = cambios.split('\n').length;
    const quien = (() => { try { return git('config', 'user.name'); } catch { return 'equipo'; } })();
    git('commit', '--quiet', '-m', `chore(agente): memoria de marketing actualizada (${n} archivo(s))\n\nSesion de ${quien}.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`);
    const r = rama();
    if (remotoTiene(r)) git('pull', '--quiet', '--rebase', '--autostash', 'origin', r);
    git('push', '--quiet', '-u', 'origin', r);
    decir(`Cambios subidos a GitHub (${n} archivo(s)). El equipo los verá al iniciar su próxima sesión.`);
  } else {
    console.error('Uso: node scripts/equipo.mjs traer|subir'); process.exit(1);
  }
} catch (e) {
  // Nunca bloquear la sesión: avisar y seguir.
  console.error(`No se pudo sincronizar con GitHub (${cmd}): ${(e.stderr || e.message || '').toString().trim().split('\n').slice(-2).join(' ')}`);
  process.exit(0);
}
