#!/usr/bin/env node
// Sirve el panel de marketing en local: http://localhost:4321
// - Cada vez que se abre o recarga la página, vuelve a armar el panel con los datos más recientes.
// - Recibe el material que sube el equipo (videos, fotos, audios, textos) en recursos/entrantes/<id>/.
// - Entrega el estado de cada entrega para el seguimiento en vivo.
// Uso: node scripts/servidor-panel.mjs [--puerto=4321] [--abrir]
import { createServer } from 'node:http';
import { execFileSync, exec } from 'node:child_process';
import { readFileSync, createWriteStream, createReadStream, statSync, existsSync, unlinkSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { raiz, cargar, crear, agregarArchivo, rutaSegura, carpetaDe } from './entregas.mjs';

const puerto = Number((process.argv.find(a => a.startsWith('--puerto=')) || '--puerto=4321').split('=')[1]);
const url = `http://localhost:${puerto}`;
const MAX_ARCHIVO = 2 * 1024 ** 3; // 2 GB por archivo
const abrir = () => exec(process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`);

const TIPOS = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8' };

function pagina() {
  execFileSync(process.execPath, [join(raiz, 'scripts/panel.mjs')], { cwd: raiz, stdio: 'ignore' });
  const cuerpo = readFileSync(join(raiz, 'panel/panel.html'), 'utf8');
  // Mismo esqueleto que usa la página publicada: doctype, charset y viewport.
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>${cuerpo}</body></html>`;
}

const json = (res, codigo, obj) => { res.writeHead(codigo, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); };
const texto = (res, codigo, t) => { res.writeHead(codigo, { 'content-type': 'text/plain; charset=utf-8' }); res.end(t); };
const leerCuerpo = req => new Promise((ok, mal) => { let s = ''; req.on('data', c => { s += c; if (s.length > 1e5) { mal(new Error('demasiado grande')); req.destroy(); } }); req.on('end', () => ok(s)); req.on('error', mal); });
const nombreLimpio = n => basename(String(n)).replace(/[^\p{L}\p{N}._ -]/gu, '_').replace(/^\.+/, '').slice(0, 120) || 'archivo';

const servidor = createServer(async (req, res) => {
  const u = new URL(req.url, url);
  try {
    if (req.method === 'GET' && u.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(pagina());
    }
    if (req.method === 'GET' && u.pathname === '/api/entregas') return json(res, 200, cargar());

    if (req.method === 'POST' && u.pathname === '/api/entregas') {
      const datos = JSON.parse((await leerCuerpo(req)) || '{}');
      const e = crear({ para: datos.para, nota: datos.nota, autor: datos.autor });
      console.log(`Entrega #${e.id} creada: ${e.para}`);
      return json(res, 201, e);
    }

    const m = u.pathname.match(/^\/api\/entregas\/([\w-]+)\/archivo$/);
    if (req.method === 'POST' && m) {
      const e = cargar().entregas.find(x => x.id === m[1]);
      if (!e) return texto(res, 404, 'No existe esa entrega.');
      if (Number(req.headers['content-length'] || 0) > MAX_ARCHIVO) return texto(res, 413, 'El archivo pesa más de 2 GB.');
      let nombre = nombreLimpio(decodeURIComponent(req.headers['x-nombre'] || 'archivo'));
      if (nombre === 'entrega.json' || existsSync(join(carpetaDe(e.id), nombre))) nombre = `${Date.now()}-${nombre}`;
      const destino = join(carpetaDe(e.id), nombre);
      let bytes = 0;
      const sal = createWriteStream(destino);
      req.on('data', c => { bytes += c.length; if (bytes > MAX_ARCHIVO) req.destroy(); });
      req.pipe(sal);
      sal.on('finish', () => { agregarArchivo(e.id, nombre, bytes); console.log(`  + ${nombre} (${bytes} bytes)`); json(res, 201, { nombre, bytes }); });
      req.on('error', () => { sal.destroy(); try { unlinkSync(destino); } catch {} });
      sal.on('error', err => texto(res, 500, 'No se pudo guardar: ' + err.message));
      return;
    }

    // Ver un archivo de recursos/ o contenido/ (resultado de una entrega), con soporte para adelantar videos.
    if (req.method === 'GET' && u.pathname === '/archivos') {
      const abs = rutaSegura(u.searchParams.get('ruta') || '');
      if (!abs) return texto(res, 404, 'Archivo no encontrado.');
      const tam = statSync(abs).size;
      const tipo = TIPOS[extname(abs).toLowerCase()] || 'application/octet-stream';
      const rango = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
      if (rango) {
        const ini = rango[1] ? Number(rango[1]) : 0, fin = rango[2] ? Number(rango[2]) : tam - 1;
        res.writeHead(206, { 'content-type': tipo, 'content-range': `bytes ${ini}-${fin}/${tam}`, 'accept-ranges': 'bytes', 'content-length': fin - ini + 1 });
        return createReadStream(abs, { start: ini, end: fin }).pipe(res);
      }
      res.writeHead(200, { 'content-type': tipo, 'content-length': tam, 'accept-ranges': 'bytes' });
      return createReadStream(abs).pipe(res);
    }
    res.writeHead(404); res.end();
  } catch (e) {
    texto(res, 500, 'Error en el panel: ' + e.message);
  }
});

// Si el panel ya está corriendo, no se levanta otro: solo se abre el navegador.
servidor.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.log(`El panel ya estaba corriendo en ${url}`);
    if (process.argv.includes('--abrir')) abrir();
    setTimeout(() => process.exit(0), 500);
  } else { console.error(e.message); process.exit(1); }
});

servidor.listen(puerto, '127.0.0.1', () => {
  console.log(`Panel de marketing en ${url} (Ctrl+C para cerrar)`);
  if (process.argv.includes('--abrir')) abrir();
});
