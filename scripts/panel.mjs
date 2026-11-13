#!/usr/bin/env node
// Arma panel/panel.html (panel de marketing de RepuesTop) desde datos/ y config/.
// Datos cortos para pintar: datos/panel-extra.json. Historial: datos/tareas.json. Uso: node scripts/panel.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cargar as cargarEntregas, almacen } from './entregas.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (r, def) => { try { return JSON.parse(readFileSync(join(raiz, r), 'utf8')); } catch { return def; } };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const tareas = leer('datos/tareas.json', { tareas: [] }).tareas;
const cfgRedes = leer('config/redes.json', { redes: {} }).redes || {};
const marca = leer('config/marca.json', {});
const x = leer('datos/panel-extra.json', {});
const porId = Object.fromEntries(tareas.map(t => [t.id, t]));

// Mascota (solo lectura desde la ruta de la marca)
let mascota = '';
try { const p = marca.logos?.mascota_repuestin; if (p && existsSync(p)) mascota = `data:image/webp;base64,${readFileSync(p).toString('base64')}`; } catch {}

const ahora = new Date();
const fechaLarga = ahora.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
const hora = ahora.getHours();
const saludo = hora < 12 ? 'Buenos días, equipo' : hora < 20 ? 'Buenas tardes, equipo' : 'Buenas noches, equipo';

// ---------- iconos (trazo, 24x24) ----------
const I = {
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  calendario: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  historial: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  antena: '<path d="M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4"/><circle cx="12" cy="12" r="2"/>',
  megafono: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 8a5 5 0 0 1 0 8M18 5a9 9 0 0 1 0 14"/>',
  lista: '<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
  enchufe: '<path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
  llave: '<path d="M14.7 6.3a4 4 0 0 0 5 5L22 14l-8 8-2.3-2.3a4 4 0 0 0-5-5L2 10l8-8z" transform="scale(.9) translate(1.3 1.3)"/>',
  ampolleta: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  bandera: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  estrella: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  alerta: '<path d="M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  camara: '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  caja: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
  idea: '<path d="M12 2l1.8 5.5H19l-4.6 3.4 1.8 5.5L12 13l-4.2 3.4 1.8-5.5L5 7.5h5.2z"/>',
  persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  tienda: '<path d="M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 14v7h14v-7"/>',
  rayo: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  meta: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  subir: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  archivo: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  manos: '<path d="M9 11V6a2 2 0 0 1 4 0v5M13 10V5a2 2 0 0 1 4 0v8"/><path d="M9 11a2 2 0 0 0-4 0v2a8 8 0 0 0 8 8h1a6 6 0 0 0 6-6v-2"/>',
};
const ic = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;

// ---------- redes (glifos de relleno blanco) ----------
const RED = {
  instagram: { nombre: 'Instagram', g: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="#fff"/>' },
  facebook: { nombre: 'Facebook', g: '<path fill="#fff" d="M14.2 21v-7.3h2.5l.4-2.9h-2.9V9c0-.8.3-1.4 1.4-1.4h1.6V5a20 20 0 0 0-2.3-.1c-2.3 0-3.8 1.4-3.8 3.9v2.1H8.6v2.9h2.5V21z"/>' },
  tiktok: { nombre: 'TikTok', g: '<path fill="#fff" d="M16.4 3c.3 2.3 1.7 3.8 3.9 4v2.9c-1.4 0-2.8-.4-3.9-1.1v6.3a5.8 5.8 0 1 1-5.8-5.8v3a2.9 2.9 0 1 0 2.9 2.8V3z"/>' },
  youtube: { nombre: 'YouTube', g: '<rect x="2" y="5.5" width="20" height="13" rx="4" fill="#fff"/><path d="M10 9v6l5.2-3z" fill="var(--yt)"/>' },
  google: { nombre: 'Google', g: '<path fill="#fff" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.4 3-7.3z"/><path fill="#fff" opacity=".85" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#fff" opacity=".7" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#fff" opacity=".9" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z"/>' },
};
const glifo = (id, tam = 'md') => RED[id] ? `<span class="red-ic red-${id} ${tam}" title="${RED[id].nombre}" role="img" aria-label="${RED[id].nombre}"><svg viewBox="0 0 24 24">${RED[id].g}</svg></span>` : '';

const ESTADO = { propuesta: ['Por decidir', 'warn'], aprobada: ['Aprobada', 'info'], en_produccion: ['En producción', 'info'], lista: ['Lista', 'info'], publicada: ['Publicada', 'ok'], descartada: ['Descartada', 'mute'] };
const pillEstado = e => { const [t, c] = ESTADO[e] || [e || 'Sin estado', 'mute']; return `<span class="pill ${c}">${esc(t)}</span>`; };
const SEM = { verde: ['Va bien', 'ok'], amarillo: ['A mejorar', 'warn'], rojo: ['Urgente', 'bad'] };

// ---------- cálculos ----------
const propuestas = tareas.filter(t => t.estado === 'propuesta').length;
const publicadas = tareas.filter(t => t.estado === 'publicada').length;
const redesSociales = ['instagram', 'facebook', 'tiktok', 'youtube'];
const conectadas = redesSociales.filter(r => cfgRedes[r]?.conectada).length;
const pedidos = (x.desarrollo || []).length;

// ---------- secciones ----------
const stats = [
  { n: propuestas, t: 'ideas esperan tu sí', i: 'reloj', c: 'sun' },
  { n: publicadas, t: 'publicaciones hechas', i: 'check', c: 'mint' },
  { n: `${conectadas}/4`, t: 'redes conectadas', i: 'enchufe', c: 'rose' },
  { n: pedidos, t: 'pedidos a desarrollo', i: 'llave', c: 'sky' },
].map(s => `<div class="stat ${s.c}"><span class="stat-ic">${ic(s.i)}</span><span class="stat-n">${esc(s.n)}</span><span class="stat-t">${esc(s.t)}</span></div>`).join('');

// Bloque de explicación: qué es, qué hacer, para qué y qué resultado esperamos.
const FILAS = {
  que: ['Qué es', 'info', 'c-azul'],
  como: ['Cómo se hace', 'lista', 'c-azul'],
  objetivo: ['Para qué', 'bandera', 'c-rose'],
  para: ['Para qué', 'bandera', 'c-rose'],
  yo: ['Lo hago yo', 'rayo', 'c-cielo'],
  ustedes: ['Necesito de ustedes', 'persona', 'c-sun'],
  resultado: ['Resultado esperado', 'meta', 'c-menta'],
};
const exp = (o, claves) => {
  const filas = claves.filter(k => o?.[k]).map(k => { const [et, i, c] = FILAS[k]; return `<div class="exp-fila ${k}"><dt>${ic(i, c)}${et}</dt><dd>${esc(o[k])}</dd></div>`; }).join('');
  return filas ? `<dl class="exp">${filas}</dl>` : '';
};

const hoy = x.hoy || {};
const piezas = (hoy.piezas || []).map(p => {
  const t = porId[p.tarea];
  return `<article class="pieza${p.recomendada ? ' reco' : ''}">
    ${p.recomendada ? `<span class="cinta">${ic('estrella')}Recomendada</span>` : ''}
    <div class="pieza-top"><div class="pieza-redes">${(p.redes || []).map(r => glifo(r)).join('')}</div>${pillEstado(t?.estado)}</div>
    <h3>${esc(p.titulo)}</h3>
    <div class="chips"><span class="chip">${ic('camara')}${esc(p.formato)}</span><span class="chip">${ic(p.publico === 'Tiendas' ? 'tienda' : 'persona')}${esc(p.publico)}</span></div>
    ${exp(p, ['que', 'objetivo', 'yo', 'ustedes', 'resultado'])}
    ${p.guion?.length ? `<details class="guion"><summary>${ic('camara')}Ver el guion</summary><ol>${p.guion.map(g => `<li>${esc(g)}</li>`).join('')}</ol></details>` : ''}
  </article>`;
}).join('');

// ---------- entregas (material que sube el equipo) ----------
const entregasDatos = cargarEntregas().entregas;
const alm = almacen();
// ¿Alguien ya entregó esto? (para no volver a pedirlo a otro colega)
const normal = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim();
const entregado = titulo => entregasDatos.filter(e => e.estado !== 'problema' && normal(e.para) === normal(titulo)).pop();
const marcaEntregado = titulo => {
  const e = entregado(titulo);
  if (!e) return '';
  const quien = e.autor ? ` por ${esc(e.autor)}` : '';
  return `<span class="ya-ent ${e.estado === 'listo' ? 'listo' : ''}">${ic('check')}${e.estado === 'listo' ? 'Hecho' : 'Ya entregado'}${quien} · ${esc(({ recibido: 'esperando al agente', revisando: 'en revisión', trabajando: 'el agente trabaja en ello', listo: 'pieza lista' })[e.estado] || '')}</span>`;
};

const acciones = (x.acciones || []).map((a, n) => `<li class="accion${entregado(a.texto) ? ' hecha' : ''}">
    <span class="paso">${entregado(a.texto) ? ic('check') : n + 1}</span>
    <div class="accion-cuerpo">
      <div class="accion-cab"><h3>${esc(a.texto)}</h3>${a.quien ? `<span class="chip">${ic('persona')}${esc(a.quien)}</span>` : ''}${marcaEntregado(a.texto)}</div>
      ${entregado(a.texto) ? '' : exp(a, ['como', 'para', 'resultado'])}
    </div>
  </li>`).join('');
const opcionesPara = [
  ...(x.material || []).map(m => typeof m === 'string' ? m : m.titulo),
  ...(x.acciones || []).filter(a => /equipo/i.test(a.quien || '')).map(a => a.texto),
].filter((v, i, a) => v && a.indexOf(v) === i);
const jsonSeguro = o => JSON.stringify(o).replace(/</g, '\\u003c');

const DIAS_LARGOS = { Lun: 'Lunes', Mar: 'Martes', 'Mié': 'Miércoles', Jue: 'Jueves', Vie: 'Viernes', 'Sáb': 'Sábado', Dom: 'Domingo' };
const sem = x.semana || {};
const panoramas = (sem.panoramas || []).map(p => {
  const reco = p.id === sem.recomendado;
  return `<article class="panorama${reco ? ' reco' : ''}">
    <header>
      <span class="letra">${esc(p.id)}</span>
      <div><h3>${esc(p.nombre)}</h3><p>${esc(p.publico)}</p></div>
      ${reco ? `<span class="sello">${ic('estrella')}Mi recomendación</span>` : ''}
    </header>
    <div class="pano-cuerpo">
      ${exp({ que: p.resumen, objetivo: p.objetivo, ustedes: p.esfuerzo_detalle ? `Esfuerzo ${String(p.esfuerzo || '').toLowerCase()}: ${p.esfuerzo_detalle}` : p.esfuerzo, resultado: p.resultado }, ['que', 'objetivo', 'ustedes', 'resultado'])}
    </div>
    <div class="dias-zona" data-pano="${esc(p.id)}">
      <p class="dias-ayuda">${ic('flecha')}Toca un día para ver qué se hace, paso a paso, y qué esperamos lograr.</p>
      <div class="dias" role="tablist" aria-label="Días del camino ${esc(p.id)}">${(p.dias || []).map((d, i) => `<button type="button" class="dia-btn" role="tab" id="dia-${esc(p.id)}-${i}" aria-controls="det-${esc(p.id)}-${i}" aria-selected="${i === 0}"><span class="dia">${esc(d.dia)}</span><span class="dia-redes">${(d.redes || []).map(r => glifo(r, 'sm')).join('') || `<span class="red-ic vacio sm">${ic('check')}</span>`}</span><span class="dia-pieza">${esc(d.pieza)}</span></button>`).join('')}</div>
      ${(p.dias || []).map((d, i) => `<div class="dia-det" role="tabpanel" id="det-${esc(p.id)}-${i}" aria-labelledby="dia-${esc(p.id)}-${i}"${i === 0 ? '' : ' hidden'}>
        <div class="dia-det-cab"><span class="dia-det-dia">${esc(DIAS_LARGOS[d.dia] || d.dia)}</span><h4>${esc(d.detalle || d.pieza)}</h4><span class="dia-det-redes">${(d.redes || []).map(r => glifo(r, 'sm')).join('')}</span></div>
        ${d.objetivo ? `<div class="exp-fila objetivo"><dt>${ic('bandera', 'c-rose')}Objetivo</dt><dd>${esc(d.objetivo)}</dd></div>` : ''}
        ${d.pasos?.length ? `<div class="exp-fila pasos"><dt>${ic('lista', 'c-azul')}Paso a paso</dt><dd><ol class="pasos">${d.pasos.map(s => { const m = String(s).match(/^(Ustedes|Yo):\s*(.*)$/); return `<li>${m ? `<span class="quien ${m[1] === 'Yo' ? 'yo' : 'ust'}">${m[1] === 'Yo' ? 'Agente' : 'Equipo'}</span>${esc(m[2])}` : esc(s)}</li>`; }).join('')}</ol></dd></div>` : ''}
        ${d.resultado ? `<div class="exp-fila resultado"><dt>${ic('meta')}Resultado esperado</dt><dd>${esc(d.resultado)}</dd></div>` : ''}
      </div>`).join('')}
    </div>
  </article>`;
}).join('');

const redesHtml = ['instagram', 'facebook', 'tiktok', 'youtube', 'google'].map(id => {
  const r = x.redes?.[id] || {};
  const cfg = id === 'google' ? cfgRedes.google_maps || {} : cfgRedes[id] || {};
  const [st, sc] = SEM[r.semaforo] || ['Sin datos', 'mute'];
  const conexion = id === 'google' ? 'Sin perfil de empresa' : cfg.conectada ? 'Conectada' : cfg.existe ? 'Sin conectar' : 'Sin cuenta';
  const nums = r.numeros || [];
  return `<article class="red red-${id}">
    <header class="red-cab">${glifo(id, 'lg')}<div><h3>${RED[id].nombre}</h3><span>${esc(conexion)}</span></div><span class="pill ${sc} sobre">${st}</span></header>
    <div class="red-cuerpo">
      ${nums.length ? `<dl class="nums">${nums.slice(0, 3).map(n => `<div><dd>${esc(n.valor)}</dd><dt>${esc(n.etiqueta)}</dt></div>`).join('')}</dl>` : `<p class="sin-num">${ic('antena')}Aún sin números</p>`}
      ${r.porque ? `<p class="linea porque">${ic('info', 'c-azul')}<span><b>${st === 'Sin datos' ? 'Estado' : st}:</b> ${esc(r.porque)}</span></p>` : ''}
      ${r.consejo ? `<p class="linea">${ic('ampolleta', 'c-sun')}<span><b>Consejo:</b> ${esc(r.consejo)}</span></p>` : ''}
      ${r.falta ? `<p class="linea">${ic('lista', 'c-rose')}<span><b>Hay que hacer:</b> ${esc(r.falta)}</span></p>` : ''}
      ${r.resultado ? `<p class="linea">${ic('meta', 'c-menta')}<span><b>Así logramos:</b> ${esc(r.resultado)}</span></p>` : ''}
    </div>
  </article>`;
}).join('');

const hechas = tareas.filter(t => t.estado !== 'propuesta').sort((a, b) => b.fecha.localeCompare(a.fecha));
const historial = hechas.length
  ? `<ol class="hist">${hechas.slice(0, 8).map(t => `<li><span class="hist-fecha">${esc(t.fecha.slice(8, 10))}/${esc(t.fecha.slice(5, 7))}</span><div><strong>${esc(t.titulo)}</strong><span>${t.resultado ? `${t.resultado.vistas} vistas · ${t.resultado.interacciones} interacciones · ${t.resultado.clics} clics` : 'Resultado pendiente'}</span></div>${pillEstado(t.estado)}</li>`).join('')}</ol>`
  : `<div class="vacio-box">${ic('historial')}<div><strong>Aún no hay publicaciones</strong><span>Cuando aprueben la primera pieza, aquí verán qué se hizo y cómo le fue.</span></div></div>`;

const novedades = (x.novedades || []).slice(0, 4).map((n, i) => `<li class="nov-${i % 4}"><span class="nov-punto"></span><span class="nov-fecha">${esc(n.fecha)}</span><strong>${esc(n.titulo)}</strong>${n.explica ? `<span class="nov-exp">${esc(n.explica)}</span>` : ''}<span class="nov-idea">${ic('ampolleta')}Idea: ${esc(n.idea)}</span></li>`).join('');

// Ítem de pendientes: texto simple u objeto { titulo | texto, fecha?, porque, resultado }
const item = i => typeof i === 'string' ? `<span class="it-t">${esc(i)}</span>${marcaEntregado(i)}` :
  `<span class="it-t">${i.fecha ? `<b class="it-fecha">${esc(i.fecha)}</b>` : ''}${esc(i.titulo || i.texto)}</span>${marcaEntregado(i.titulo || i.texto) || `${i.porque ? `<span class="it-p">${esc(i.porque)}</span>` : ''}${i.resultado ? `<span class="it-r">${ic('meta')}${esc(i.resultado)}</span>` : ''}`}`;
const caja = (titulo, icono, color, explica, items) => {
  const arr = items || [];
  const primeros = arr.slice(0, 3).map(i => `<li>${item(i)}</li>`).join('');
  const resto = arr.slice(3).map(i => `<li>${item(i)}</li>`).join('');
  return `<article class="caja ${color}">
    <header><span class="caja-ic">${ic(icono)}</span><h3>${titulo}</h3><span class="cuenta">${arr.length}</span></header>
    <p class="caja-exp">${esc(explica)}</p>
    ${arr.length ? `<ul>${primeros}</ul>${resto ? `<details><summary>Ver ${arr.length - 3} más</summary><ul>${resto}</ul></details>` : ''}` : '<p class="nada">Nada por ahora</p>'}
  </article>`;
};

const html = `<title>Panel Marketing RepuesTop</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<style>
/* Concepto: tablero de la oficina de marketing. Franja azul de la marca con Repuestín al frente,
   luego tarjetas de colores ordenadas por pregunta: ¿qué hacemos hoy?, ¿y la semana?, ¿cómo van las redes? */
:root{
  --fondo:#eef3fa; --sup:#ffffff; --sup2:#f5f8fd; --linea:#dbe4f1; --tinta:#0b1b38; --suave:#5a6b87;
  --azul:#0056bf; --azul2:#2f7bff; --marino:#0a2149; --cielo:#38bdf8; --sol:#f5b700; --menta:#10b981; --rosa:#e8457c;
  --sol-bg:#fff4cf; --sol-fg:#8a5a00; --menta-bg:#d8f6ea; --menta-fg:#05744f; --rosa-bg:#ffe1ea; --rosa-fg:#b0204f;
  --cielo-bg:#dcf2ff; --cielo-fg:#075f8c; --gris-bg:#e8edf5; --gris-fg:#55657f; --azul-bg:#e3eeff;
  --heroA:#0a2149; --heroB:#0056bf; --hero-txt:#ffffff; --hero-suave:#c4d7f5;
  --ig1:#feda75; --ig2:#fa7e1e; --ig3:#d62976; --ig4:#962fbf; --fb:#1877f2; --tt:#111111; --tt1:#25f4ee; --tt2:#fe2c55; --yt:#ff0033;
  --g1:#4285f4; --g2:#34a853; --g3:#fbbc05; --g4:#ea4335;
  --sombra:0 1px 2px rgba(11,27,56,.06),0 8px 24px rgba(11,27,56,.06);
  --display:'Outfit',ui-sans-serif,system-ui,sans-serif; --texto:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --fondo:#08111f; --sup:#101c31; --sup2:#14223b; --linea:#22344f; --tinta:#e9f0fb; --suave:#9db0cd;
  --azul:#5b9bff; --azul2:#7fb2ff; --cielo:#5fd0ff; --sol:#ffc93d; --menta:#34d399; --rosa:#ff6b9a;
  --sol-bg:#3a2c06; --sol-fg:#ffd766; --menta-bg:#0b3527; --menta-fg:#6ee7b7; --rosa-bg:#3d1424; --rosa-fg:#ff9fbd;
  --cielo-bg:#0b2f45; --cielo-fg:#8fdcff; --gris-bg:#1b2a44; --gris-fg:#a3b3cc; --azul-bg:#152c55;
  --heroA:#071530; --heroB:#0f3f8f; --hero-suave:#a9c2ea; --sombra:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.25); color-scheme:dark}}
:root[data-theme="dark"]{
  --fondo:#08111f; --sup:#101c31; --sup2:#14223b; --linea:#22344f; --tinta:#e9f0fb; --suave:#9db0cd;
  --azul:#5b9bff; --azul2:#7fb2ff; --cielo:#5fd0ff; --sol:#ffc93d; --menta:#34d399; --rosa:#ff6b9a;
  --sol-bg:#3a2c06; --sol-fg:#ffd766; --menta-bg:#0b3527; --menta-fg:#6ee7b7; --rosa-bg:#3d1424; --rosa-fg:#ff9fbd;
  --cielo-bg:#0b2f45; --cielo-fg:#8fdcff; --gris-bg:#1b2a44; --gris-fg:#a3b3cc; --azul-bg:#152c55;
  --heroA:#071530; --heroB:#0f3f8f; --hero-suave:#a9c2ea; --sombra:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.25); color-scheme:dark}

*{box-sizing:border-box}
body{background:var(--fondo);color:var(--tinta);font-family:var(--texto);font-size:15px;line-height:1.5}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--heroA)}
.in{max-width:1120px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1,h2,h3{font-family:var(--display);margin:0;line-height:1.15;text-wrap:balance}
p{margin:0}
.ic{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

/* HERO */
.hero{background:radial-gradient(120% 140% at 85% 0%,var(--heroB) 0%,var(--heroA) 62%);color:var(--hero-txt);position:relative;overflow:hidden}
.hero::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.09) 1px,transparent 1px);background-size:22px 22px;pointer-events:none}
.hero .in{position:relative;z-index:1;padding-block:28px 26px;display:grid;gap:22px}
.hero-top{display:flex;align-items:center;gap:20px;justify-content:space-between}
.marca{font-family:var(--display);font-weight:800;font-size:18px;letter-spacing:-.01em}
.marca b{color:var(--cielo)}
.hero-fecha{font-size:13px;color:var(--hero-suave);text-transform:capitalize;display:flex;gap:6px;align-items:center}
.hero-main{display:flex;gap:20px;align-items:center}
.mascota{width:112px;height:112px;border-radius:50%;flex:none;background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.18),0 10px 30px rgba(0,0,0,.3);object-fit:cover}
.mascota.sin{display:grid;place-items:center;color:var(--azul);font:800 40px var(--display)}
.hero h1{font-size:clamp(26px,4.4vw,40px);font-weight:800;letter-spacing:-.02em}
.burbuja{margin-top:12px;background:#fff;color:#0b1b38;border-radius:18px 18px 18px 4px;padding:12px 16px;max-width:560px;font-weight:600;position:relative;box-shadow:0 6px 18px rgba(0,0,0,.18)}
.burbuja small{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0056bf;margin-bottom:2px}
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.stat{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:14px;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:12px;align-items:center;backdrop-filter:blur(6px)}
.stat-ic{grid-row:1/3;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;color:#0b1b38}
.stat-ic .ic{width:22px;height:22px}
.stat.sun .stat-ic{background:#ffd34d}.stat.mint .stat-ic{background:#5eead4}.stat.rose .stat-ic{background:#ff9cbc}.stat.sky .stat-ic{background:#93dcff}
.stat-n{font:800 26px/1 var(--display);font-variant-numeric:tabular-nums}
.stat-t{font-size:12.5px;color:var(--hero-suave)}

/* NAV */
nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:color-mix(in srgb,var(--fondo) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--linea)}
nav .in{display:flex;gap:6px;overflow-x:auto;padding-block:10px;scrollbar-width:none}
nav a{flex:none;display:flex;align-items:center;gap:6px;color:var(--suave);text-decoration:none;padding:7px 13px;border-radius:999px;font-weight:600;font-size:13.5px;border:1px solid transparent}
nav a:hover,nav a:focus-visible{background:var(--sup);border-color:var(--linea);color:var(--azul);outline:none}

/* SECCIONES */
main .in{display:grid;gap:40px;padding-block:28px 56px}
section{scroll-margin-top:64px;display:grid;gap:16px}
.sec-cab{display:flex;align-items:center;gap:12px}
.sec-ic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex:none}
.sec-ic .ic{width:21px;height:21px}
.sec-cab h2{font-size:22px;font-weight:700}
.sec-cab p{color:var(--suave);font-size:13.5px}
.t-sun{background:var(--sol-bg);color:var(--sol-fg)}.t-azul{background:var(--azul-bg);color:var(--azul)}.t-rosa{background:var(--rosa-bg);color:var(--rosa-fg)}
.t-menta{background:var(--menta-bg);color:var(--menta-fg)}.t-cielo{background:var(--cielo-bg);color:var(--cielo-fg)}
.c-sun{color:var(--sol)}.c-rose{color:var(--rosa)}.c-azul{color:var(--azul)}.c-cielo{color:var(--cielo)}.c-menta{color:var(--menta)}

/* explicación: qué es / para qué / quién / resultado */
.exp{margin:0;display:grid;gap:8px}
.exp-fila{display:grid;gap:2px;padding:9px 11px;border-radius:12px;background:var(--sup2)}
.exp-fila dt{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--suave)}
.exp-fila dt .ic{width:15px;height:15px}
.exp-fila dd{margin:0;font-size:14px}
.exp-fila.resultado{background:var(--menta-bg)}
.exp-fila.resultado dt,.exp-fila.resultado dd{color:var(--menta-fg)}
.exp-fila.resultado dd{font-weight:600}
.exp-fila.ustedes{background:var(--sol-bg)}
.exp-fila.ustedes dt,.exp-fila.ustedes dd{color:var(--sol-fg)}
.guion{border-top:1px dashed var(--linea);padding-top:10px}
.guion summary{display:inline-flex;gap:6px;align-items:center;cursor:pointer;font-weight:700;font-size:13.5px;color:var(--azul);list-style:none}
.guion summary::-webkit-details-marker{display:none}
.guion summary .ic{width:15px;height:15px}
.guion ol,.guion ul{margin:8px 0 0;padding-left:20px;display:grid;gap:4px;font-size:13.5px;color:var(--suave)}
.guion li strong{color:var(--tinta)}
.pano-det{margin:0 18px 18px}

/* pasos del equipo */
.acciones{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.accion{display:grid;grid-template-columns:auto 1fr;gap:14px;background:var(--sup);border:1px solid var(--linea);border-radius:18px;padding:16px;box-shadow:var(--sombra)}
.paso{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font:800 18px var(--display);background:var(--rosa-bg);color:var(--rosa-fg)}
.accion-cuerpo{display:grid;gap:10px;min-width:0}
.accion-cab{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.accion-cab h3{font-size:17px;flex:1;min-width:200px}
.accion .exp{grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))}
.alerta div{display:grid;gap:4px}
.alerta p{font-weight:500}
.alerta-r{display:flex;gap:6px;align-items:center;font-weight:700!important}
.alerta-r .ic{width:16px;height:16px}

.alerta{display:flex;gap:12px;align-items:flex-start;background:var(--sol-bg);color:var(--sol-fg);border-radius:14px;padding:14px 16px;font-weight:600}
.alerta .ic{width:22px;height:22px;margin-top:1px}

.pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}
.pill.ok{background:var(--menta-bg);color:var(--menta-fg)}.pill.warn{background:var(--sol-bg);color:var(--sol-fg)}
.pill.bad{background:var(--rosa-bg);color:var(--rosa-fg)}.pill.info{background:var(--azul-bg);color:var(--azul)}.pill.mute{background:var(--gris-bg);color:var(--gris-fg)}

/* iconos de redes */
.red-ic{display:inline-grid;place-items:center;border-radius:10px;flex:none}
.red-ic svg{width:60%;height:60%}
.red-ic.md{width:34px;height:34px}.red-ic.sm{width:22px;height:22px;border-radius:7px}.red-ic.lg{width:46px;height:46px;border-radius:14px}
.red-instagram{background:radial-gradient(circle at 30% 107%,var(--ig1) 0%,var(--ig2) 30%,var(--ig3) 60%,var(--ig4) 100%)}
.red-facebook{background:var(--fb)}
.red-tiktok{background:var(--tt);box-shadow:inset -2px -2px 0 var(--tt2),inset 2px 2px 0 var(--tt1)}
.red-youtube{background:var(--yt)}
.red-google{background:conic-gradient(var(--g4) 0 25%,var(--g3) 0 50%,var(--g2) 0 75%,var(--g1) 0)}
.red-ic.vacio{background:var(--gris-bg);color:var(--gris-fg)}
.red-ic.vacio .ic{width:13px;height:13px}

/* HOY */
.hoy-intro{color:var(--suave)}
.hoy-intro strong{color:var(--tinta)}
.piezas{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}
.pieza{background:var(--sup);border:1px solid var(--linea);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:var(--sombra);position:relative;min-width:0;transition:transform .15s ease}
.pieza:hover{transform:translateY(-2px)}
.pieza.reco{border:2px solid var(--azul);background:linear-gradient(180deg,var(--azul-bg),var(--sup) 55%)}
.cinta{position:absolute;top:-11px;right:16px;display:flex;gap:4px;align-items:center;background:var(--sol);color:#3a2700;font-size:11.5px;font-weight:800;padding:4px 10px;border-radius:999px}
.cinta .ic{width:13px;height:13px;fill:currentColor;stroke:none}
.pieza-redes{display:flex;gap:6px}
.pieza h3{font-size:17px;font-weight:700}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{display:inline-flex;align-items:center;gap:5px;background:var(--sup2);border:1px solid var(--linea);color:var(--suave);font-size:12.5px;font-weight:600;padding:4px 9px;border-radius:999px}
.chip .ic{width:14px;height:14px}
.pieza-top{display:flex;justify-content:space-between;align-items:center;gap:8px}
.pano-cuerpo{padding:14px 18px}
.linea b{font-weight:700}
.nov-exp{font-size:13.5px;color:var(--suave)}
.caja-exp{font-size:13px;color:var(--suave)}
.caja li{display:grid;gap:2px}
.it-t{font-weight:600}
.it-fecha{color:var(--azul);margin-right:6px}
.it-p{font-size:12.5px;color:var(--suave)}
.it-r{display:flex;gap:5px;align-items:flex-start;font-size:12.5px;color:var(--menta-fg);font-weight:600}
.it-r .ic{width:14px;height:14px;margin-top:2px}

/* SEMANA */
.panoramas{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.panorama{background:var(--sup);border:1px solid var(--linea);border-radius:20px;overflow:hidden;box-shadow:var(--sombra);display:flex;flex-direction:column;min-width:0}
.panorama header{display:flex;gap:12px;align-items:center;padding:16px 18px;flex-wrap:wrap}
.panorama.reco header{background:linear-gradient(120deg,var(--marino),var(--azul));color:#fff}
.panorama.reco header p{color:#c4d7f5}
.letra{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font:800 20px var(--display);background:var(--sol-bg);color:var(--sol-fg);flex:none}
.panorama.reco .letra{background:var(--sol);color:#3a2700}
.panorama header h3{font-size:18px}
.panorama header p{font-size:13px;color:var(--suave)}
.sello{margin-left:auto;display:flex;gap:5px;align-items:center;font-size:12px;font-weight:800;background:var(--sol);color:#3a2700;padding:5px 10px;border-radius:999px}
.sello .ic{width:13px;height:13px;fill:currentColor;stroke:none}
.resumen{padding:14px 18px 0;color:var(--suave)}
.mini{display:grid;grid-template-columns:1fr 2fr;gap:10px;padding:14px 18px}
.mini div{background:var(--sup2);border-radius:12px;padding:10px 12px;min-width:0}
.mini span{display:block;font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--suave);font-weight:700}
.mini strong{font-size:14px}
.dias-zona{padding:0 18px 18px;display:grid;gap:10px;margin-top:auto}
.dias-ayuda{display:flex;gap:6px;align-items:center;font-size:12.5px;font-weight:600;color:var(--suave)}
.dias-ayuda .ic{width:15px;height:15px;color:var(--azul)}
.dias{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.dia-btn{all:unset;box-sizing:border-box;cursor:pointer;background:var(--sup2);border:1.5px solid var(--linea);border-radius:12px;padding:8px 4px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;min-width:0;transition:border-color .15s,background .15s,transform .15s}
.dia-btn:hover{border-color:var(--azul);transform:translateY(-2px)}
.dia-btn:focus-visible{outline:2px solid var(--azul);outline-offset:2px}
.dia-btn[aria-selected="true"]{background:var(--azul-bg);border-color:var(--azul);box-shadow:0 0 0 3px color-mix(in srgb,var(--azul) 18%,transparent)}
.dia{font:700 12px var(--display);text-transform:uppercase;letter-spacing:.06em;color:var(--azul)}
.dia-redes{display:flex;gap:3px;flex-wrap:wrap;justify-content:center;min-height:22px}
.dia-pieza{font-size:11px;line-height:1.25;color:var(--suave);overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto}
.dia-det{background:var(--sup);border:1.5px solid var(--azul);border-radius:16px;padding:14px;display:grid;gap:8px}
.dia-det-cab{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.dia-det-dia{font:800 12px var(--display);text-transform:uppercase;letter-spacing:.07em;background:var(--azul);color:#fff;padding:4px 10px;border-radius:999px}
.dia-det-cab h4{font:700 16px var(--display);margin:0;flex:1;min-width:180px}
.dia-det-redes{display:flex;gap:4px}
.pasos{margin:4px 0 0;padding-left:20px;display:grid;gap:6px}
.pasos li{padding-left:2px}
.quien{display:inline-block;font-size:11px;font-weight:800;padding:1px 8px;border-radius:999px;margin-right:6px;vertical-align:1px}
.quien.yo{background:var(--cielo-bg);color:var(--cielo-fg)}.quien.ust{background:var(--sol-bg);color:var(--sol-fg)}
@media (max-width:560px){.dias{grid-template-columns:repeat(4,minmax(0,1fr))}}

/* ENTREGAS */
.ent-grid{display:grid;gap:16px;grid-template-columns:minmax(0,5fr) minmax(0,7fr)}
@media (max-width:860px){.ent-grid{grid-template-columns:minmax(0,1fr)}}
.ent-form,.ent-lista-caja{background:var(--sup);border:1px solid var(--linea);border-radius:20px;padding:18px;box-shadow:var(--sombra);display:grid;gap:14px;align-content:start;min-width:0}
.campo{display:grid;gap:6px}
.campo>label{font-weight:700;font-size:13.5px}
.opc{font-weight:500;color:var(--suave)}
select,textarea{font:inherit;color:var(--tinta);background:var(--sup2);border:1.5px solid var(--linea);border-radius:12px;padding:10px 12px;width:100%}
select:focus-visible,textarea:focus-visible{outline:2px solid var(--azul);outline-offset:1px}
input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.soltar{display:grid;justify-items:center;gap:6px;text-align:center;padding:22px 14px;border:2px dashed var(--linea);border-radius:16px;background:var(--sup2);cursor:pointer;color:var(--suave);transition:border-color .15s,background .15s}
.soltar .ic{width:30px;height:30px;color:var(--azul)}
.soltar strong{color:var(--azul)}
.soltar small{font-weight:600;color:var(--tinta)}
.soltar.sobre,.soltar:hover{border-color:var(--azul);background:var(--azul-bg)}
input[type=file]:focus-visible+.soltar,.soltar:focus-within{outline:2px solid var(--azul)}
.btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;justify-content:center;align-items:center;gap:8px;background:var(--azul);color:#fff;font:700 15px var(--display);padding:12px 18px;border-radius:12px;transition:filter .15s}
.btn:hover{filter:brightness(1.08)}.btn:focus-visible{outline:2px solid var(--tinta);outline-offset:2px}
.btn[disabled]{opacity:.5;cursor:not-allowed}
.progreso{display:grid;gap:4px}
.barra{height:8px;border-radius:999px;background:var(--gris-bg);overflow:hidden}
.barra span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--azul),var(--cielo));transition:width .2s}
.ent-msg{font-weight:600;font-size:13.5px;min-height:1px}
.ent-msg.ok{color:var(--menta-fg)}.ent-msg.err{color:var(--rosa-fg)}
.ent-solo-local{display:flex;gap:8px;align-items:center;background:var(--sol-bg);color:var(--sol-fg);padding:10px 12px;border-radius:12px;font-weight:600;font-size:13.5px}
.ent-lista-cab{display:flex;justify-content:space-between;align-items:center;gap:10px}
.ent-lista-cab h3{font-size:17px}
.vivo{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--menta-fg)}
.vivo i{width:8px;height:8px;border-radius:50%;background:var(--menta);box-shadow:0 0 0 3px var(--menta-bg)}
.ent-lista{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.ent{border:1px solid var(--linea);border-radius:16px;padding:14px;display:grid;gap:10px;background:var(--sup2)}
.ent.problema{border-color:var(--rosa)}
.ent-cab{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}
.ent-cab strong{font-size:15px;display:block}
.ent-cab small{color:var(--suave);font-size:12.5px}
.pasos-ent{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;list-style:none;margin:0;padding:0}
.pasos-ent li{display:grid;gap:5px;font-size:11.5px;font-weight:700;color:var(--suave);text-align:center}
.pasos-ent li::before{content:"";height:6px;border-radius:999px;background:var(--gris-bg)}
.pasos-ent li.hecho{color:var(--menta-fg)}.pasos-ent li.hecho::before{background:var(--menta)}
.pasos-ent li.ahora{color:var(--azul)}.pasos-ent li.ahora::before{background:var(--azul);animation:pulso 1.6s ease-in-out infinite}
.pasos-ent.prob li.ahora{color:var(--rosa-fg)}.pasos-ent.prob li.ahora::before{background:var(--rosa);animation:none}
@keyframes pulso{50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){.pasos-ent li.ahora::before{animation:none}}
.ent-ahora{display:flex;gap:8px;align-items:flex-start;background:var(--sup);border-radius:12px;padding:10px 12px;font-size:13.5px}
.ent-ahora .ic{color:var(--azul);margin-top:1px}
.ent-ahora b{display:block;font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--suave)}
.ent-arch{display:flex;flex-wrap:wrap;gap:6px}
.ent-arch .chip{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ent details summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--azul)}
.ent details ol{margin:6px 0 0;padding-left:18px;display:grid;gap:4px;font-size:12.5px;color:var(--suave)}
.ent-res{display:inline-flex;gap:6px;align-items:center;font-weight:700;color:var(--menta-fg);text-decoration:none;background:var(--menta-bg);padding:6px 12px;border-radius:999px;justify-self:start}
.ent-vacio{color:var(--suave);font-size:13.5px}
input[type=text]{font:inherit;color:var(--tinta);background:var(--sup2);border:1.5px solid var(--linea);border-radius:12px;padding:10px 12px;width:100%}
input[type=text]:focus-visible{outline:2px solid var(--azul);outline-offset:1px}
.ent-drive{display:flex;gap:10px;align-items:flex-start;border-radius:12px;padding:10px 12px;font-size:13.5px}
.ent-drive.ok{background:var(--menta-bg);color:var(--menta-fg);font-weight:600}
.ent-drive.mal{background:var(--rosa-bg);color:var(--rosa-fg)}
.ent-drive.mal strong{display:block}
.ent-drive .ic{margin-top:1px}
.ya-ent{display:inline-flex;gap:5px;align-items:center;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--cielo-bg);color:var(--cielo-fg);justify-self:start}
.ya-ent.listo{background:var(--menta-bg);color:var(--menta-fg)}
.ya-ent .ic{width:13px;height:13px}
.accion.hecha{opacity:.75}
.accion.hecha .paso{background:var(--menta-bg);color:var(--menta-fg)}
.accion.hecha .paso .ic{width:20px;height:20px}

/* REDES */
.redes{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))}
.red{background:var(--sup);border:1px solid var(--linea);border-radius:18px;overflow:hidden;box-shadow:var(--sombra);display:flex;flex-direction:column;min-width:0}
.red-cab{display:flex;gap:10px;align-items:center;padding:14px;color:#fff;position:relative;flex-wrap:wrap}
.red-cab h3{font-size:16px}
.red-cab span{font-size:12px;opacity:.85}
.red-cab .pill.sobre{margin-left:auto;opacity:1}
.red-instagram .red-cab{background:linear-gradient(135deg,var(--ig2),var(--ig3) 55%,var(--ig4))}
.red-facebook .red-cab{background:var(--fb)}
.red-tiktok .red-cab{background:var(--tt)}
.red-youtube .red-cab{background:var(--yt)}
.red-google .red-cab{background:linear-gradient(135deg,var(--g1),#3367d6)}
.red-cab .red-ic{background:rgba(255,255,255,.2);box-shadow:none}
.red-cuerpo{padding:14px;display:grid;gap:10px}
.nums{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0}
.nums div{background:var(--sup2);border-radius:10px;padding:8px;text-align:center}
.nums dd{margin:0;font:800 18px var(--display);font-variant-numeric:tabular-nums}
.nums dt{font-size:11px;color:var(--suave)}
.sin-num{display:flex;gap:8px;align-items:center;background:var(--sup2);border:1px dashed var(--linea);border-radius:10px;padding:10px;color:var(--suave);font-size:13px;font-weight:600}
.linea{display:flex;gap:8px;align-items:flex-start;font-size:13.5px}
.linea .ic{margin-top:1px}

/* HISTORIAL + NOVEDADES */
.dos{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.panel-caja{background:var(--sup);border:1px solid var(--linea);border-radius:20px;padding:18px;box-shadow:var(--sombra);min-width:0;display:grid;gap:14px;align-content:start}
.vacio-box{display:flex;gap:14px;align-items:center;background:var(--sup2);border:1px dashed var(--linea);border-radius:14px;padding:16px;color:var(--suave)}
.vacio-box .ic{width:32px;height:32px;color:var(--azul)}
.vacio-box strong{display:block;color:var(--tinta)}
.hist{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.hist li{display:flex;gap:12px;align-items:center;background:var(--sup2);border-radius:12px;padding:10px 12px}
.hist-fecha{font:800 13px var(--display);color:var(--azul);background:var(--azul-bg);border-radius:8px;padding:6px 8px;font-variant-numeric:tabular-nums}
.hist li div{flex:1;min-width:0}.hist li div span{display:block;font-size:12.5px;color:var(--suave)}
.nov{list-style:none;margin:0;padding:0 0 0 6px;display:grid;gap:16px;position:relative}
.nov::before{content:"";position:absolute;left:11px;top:6px;bottom:6px;width:2px;background:var(--linea)}
.nov li{display:grid;grid-template-columns:24px 1fr;column-gap:12px;row-gap:2px;position:relative}
.nov-punto{grid-row:1/4;width:12px;height:12px;border-radius:50%;margin:4px 0 0 0;box-shadow:0 0 0 4px var(--sup)}
.nov-0 .nov-punto{background:var(--azul)}.nov-1 .nov-punto{background:var(--rosa)}.nov-2 .nov-punto{background:var(--menta)}.nov-3 .nov-punto{background:var(--sol)}
.nov-fecha{font-size:12px;font-weight:700;color:var(--suave);text-transform:uppercase;letter-spacing:.05em}
.nov strong{font-size:15px}
.nov-idea{display:inline-flex;gap:6px;align-items:center;font-size:13px;color:var(--sol-fg);background:var(--sol-bg);border-radius:999px;padding:3px 10px;justify-self:start}
.nov-idea .ic{width:14px;height:14px}

/* PENDIENTES */
.cajas{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))}
.caja{background:var(--sup);border:1px solid var(--linea);border-radius:18px;padding:16px;box-shadow:var(--sombra);min-width:0;display:grid;gap:10px;align-content:start}
.caja header{display:flex;gap:10px;align-items:center}
.caja h3{font-size:15.5px;flex:1}
.caja-ic{width:36px;height:36px;border-radius:11px;display:grid;place-items:center}
.cuenta{font:800 13px var(--display);min-width:26px;height:26px;border-radius:999px;display:grid;place-items:center;padding:0 8px}
.caja.azul .caja-ic,.caja.azul .cuenta{background:var(--azul-bg);color:var(--azul)}
.caja.rosa .caja-ic,.caja.rosa .cuenta{background:var(--rosa-bg);color:var(--rosa-fg)}
.caja.sol .caja-ic,.caja.sol .cuenta{background:var(--sol-bg);color:var(--sol-fg)}
.caja.menta .caja-ic,.caja.menta .cuenta{background:var(--menta-bg);color:var(--menta-fg)}
.caja ul{margin:0;padding-left:18px;display:grid;gap:5px;font-size:13.5px}
.caja li::marker{color:var(--suave)}
.caja details summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--azul);list-style:none;margin-bottom:6px}
.caja details summary::-webkit-details-marker{display:none}
.caja .nada{color:var(--suave);font-size:13.5px}
summary:focus-visible,a:focus-visible{outline:2px solid var(--azul);outline-offset:2px;border-radius:6px}

footer{color:var(--suave);font-size:12.5px;text-align:center;padding-block:0 32px}

@media (max-width:760px){
  .stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hero-main{align-items:flex-start}
  .mascota{width:76px;height:76px}
  .mini{grid-template-columns:1fr}
}
@media (max-width:420px){.hero-top{flex-direction:column;align-items:flex-start;gap:6px}.stat{padding:12px}.stat-n{font-size:22px}}
@media (prefers-reduced-motion:no-preference){
  .burbuja{animation:pop .5s cubic-bezier(.2,.9,.3,1.3) both}
  @keyframes pop{from{transform:scale(.94);transform-origin:0 100%}to{transform:scale(1)}}
}
</style>

<header class="hero"><div class="in">
  <div class="hero-top"><span class="marca">Repues<b>Top</b> · Marketing</span><span class="hero-fecha">${ic('calendario')}${esc(fechaLarga)}</span></div>
  <div class="hero-main">
    ${mascota ? `<img class="mascota" src="${mascota}" alt="Repuestín, la mascota de RepuesTop">` : '<span class="mascota sin">R</span>'}
    <div><h1>${saludo}</h1>
      <p class="burbuja"><small>Repuestín recomienda</small>${esc(x.recomendacion || 'Ejecuta /marketing para recibir la propuesta de hoy.')}</p></div>
  </div>
  <div class="stats">${stats}</div>
</div></header>

<nav aria-label="Secciones"><div class="in">
  <a href="#tareas">${ic('manos')}Qué hacer</a><a href="#entregas">${ic('subir')}Entregar</a><a href="#hoy">${ic('sol')}Hoy</a><a href="#semana">${ic('calendario')}Semana</a><a href="#redes">${ic('antena')}Redes</a><a href="#historial">${ic('historial')}Historial</a><a href="#novedades">${ic('megafono')}Novedades</a><a href="#pendientes">${ic('lista')}Pendientes</a>
</div></nav>

<main lang="es"><div class="in">
  ${x.alerta ? (typeof x.alerta === 'string'
    ? `<div class="alerta">${ic('alerta')}<span>${esc(x.alerta)}</span></div>`
    : `<div class="alerta">${ic('alerta')}<div><strong>${esc(x.alerta.titulo)}</strong><p>${esc(x.alerta.explica || '')}</p>${x.alerta.resultado ? `<p class="alerta-r">${ic('meta')}${esc(x.alerta.resultado)}</p>` : ''}</div></div>`) : ''}

  ${acciones ? `<section id="tareas">
    <div class="sec-cab"><span class="sec-ic t-rosa">${ic('manos')}</span><div><h2>Lo que necesito de ustedes hoy</h2><p>Pasos concretos, en orden. Cada uno dice cómo hacerlo, para qué sirve y qué logramos.</p></div></div>
    <ol class="acciones">${acciones}</ol>
  </section>` : ''}

  <section id="entregas">
    <div class="sec-cab"><span class="sec-ic t-cielo">${ic('subir')}</span><div><h2>Entregar material al agente</h2><p>Suban aquí los videos, fotos, audios o textos que les pido. Yo los reviso, trabajo con ellos y aquí ven en qué va cada uno.</p></div></div>
    <div class="ent-grid">
      <form class="ent-form" id="ent-form" autocomplete="off">
        <div class="campo"><label for="ent-para">¿Para qué es este material?</label>
          <select id="ent-para" name="para">${opcionesPara.map(o => `<option value="${esc(o)}">${esc(o)}${entregado(o) ? ' (ya entregado)' : ''}</option>`).join('')}<option value="Otra cosa">Otra cosa (explíquenlo en la nota)</option></select></div>
        <div class="campo"><label for="ent-autor">Tu nombre</label>
          <input id="ent-autor" name="autor" type="text" maxlength="60" placeholder="Para que el equipo sepa quién lo subió"></div>
        <div class="campo"><label for="ent-archivos">Archivos</label>
          <label class="soltar" id="ent-soltar" for="ent-archivos">${ic('subir')}<span><strong>Toca para elegir</strong> o arrastra aquí videos, fotos, audios o documentos</span><small id="ent-elegidos">Ningún archivo elegido</small></label>
          <input id="ent-archivos" name="archivos" type="file" multiple accept="video/*,image/*,audio/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.csv"></div>
        <div class="campo"><label for="ent-nota">Nota para el agente <span class="opc">(opcional)</span></label>
          <textarea id="ent-nota" name="nota" rows="3" placeholder="Ej.: es la grabación de Repuestín; la segunda parte salió mejor."></textarea></div>
        <button type="submit" class="btn" id="ent-enviar">${ic('subir')}Enviar al agente</button>
        <div class="progreso" id="ent-progreso" hidden><div class="barra"><span id="ent-barra"></span></div><small id="ent-pct"></small></div>
        <p class="ent-msg" id="ent-msg" role="status"></p>
        <p class="ent-solo-local" id="ent-solo-local" hidden>${ic('info')}Para subir archivos abran el panel en su computador con el comando /panel.</p>
        ${alm.compartido
          ? `<p class="ent-drive ok">${ic('check')}Se guarda en la carpeta compartida de Google Drive: todo el equipo lo ve.</p>`
          : `<div class="ent-drive mal" id="ent-sin-drive">${ic('alerta')}<div><strong>Este computador no está conectado a Google Drive</strong><span>Si suben algo aquí, el resto del equipo no lo verá. Por eso está bloqueado. Para conectarlo, pídanle al agente «configura Drive» (una sola vez por computador).</span></div></div>`}
      </form>
      <div class="ent-lista-caja">
        <div class="ent-lista-cab"><h3>Seguimiento</h3><span class="vivo" id="ent-vivo" hidden><i></i>Se actualiza solo</span></div>
        <ol class="ent-lista" id="ent-lista"></ol>
      </div>
    </div>
  </section>

  <section id="hoy">
    <div class="sec-cab"><span class="sec-ic t-sun">${ic('sol')}</span><div><h2>Propuestas para hoy: ${esc(hoy.titulo || 'sin plan')}</h2><p>${esc(hoy.porque || '')} Elijan cuál hacemos; abajo de cada una está qué es, quién hace qué y qué esperamos lograr.</p></div></div>
    ${piezas ? `<div class="piezas">${piezas}</div>` : '<div class="vacio-box">' + ic('sol') + '<div><strong>Sin plan para hoy</strong><span>Ejecuta /marketing y aparecerá aquí.</span></div></div>'}
  </section>

  <section id="semana">
    <div class="sec-cab"><span class="sec-ic t-azul">${ic('calendario')}</span><div><h2>Plan de la semana${sem.rango ? `: ${esc(sem.rango)}` : ''}</h2><p>${esc(sem.explica || 'Dos caminos para elegir.')}</p></div></div>
    <div class="panoramas">${panoramas || ''}</div>
  </section>

  <section id="redes">
    <div class="sec-cab"><span class="sec-ic t-rosa">${ic('antena')}</span><div><h2>Cómo van las redes</h2><p>Para cada red: cómo estamos, un consejo, lo que hay que hacer y qué logramos con eso.</p></div></div>
    <div class="redes">${redesHtml}</div>
  </section>

  <div class="dos">
    <section id="historial" class="panel-caja">
      <div class="sec-cab"><span class="sec-ic t-menta">${ic('historial')}</span><div><h2>Lo que hemos hecho</h2><p>Cada publicación hecha y cuánta gente la vio, para repetir lo que funciona.</p></div></div>
      ${historial}
    </section>
    <section id="novedades" class="panel-caja">
      <div class="sec-cab"><span class="sec-ic t-cielo">${ic('megafono')}</span><div><h2>Novedades de RepuesTop</h2><p>Lo nuevo en la web y la app, y cómo lo podemos aprovechar en redes.</p></div></div>
      <ol class="nov">${novedades}</ol>
    </section>
  </div>

  <section id="pendientes">
    <div class="sec-cab"><span class="sec-ic t-sun">${ic('lista')}</span><div><h2>Pendientes</h2><p>Lo que falta para trabajar mejor, por qué importa y qué logramos al hacerlo.</p></div></div>
    <div class="cajas">
      ${caja('Material para mí', 'camara', 'rosa', 'Cosas que necesito para producir las piezas.', x.material)}
      ${caja('Pedidos a desarrollo', 'llave', 'azul', 'Cambios en la web o la app que ayudan al marketing. Yo no los toco.', x.desarrollo)}
      ${caja('Fechas que vienen', 'calendario', 'sol', 'Momentos del año en que conviene publicar sobre ciertos temas.', x.fechas)}
      ${caja('Ideas en reserva', 'idea', 'menta', 'Ideas buenas que guardamos para cuando haya espacio.', x.ideas)}
    </div>
  </section>
</div></main>
<footer><div class="in">Panel generado el ${esc(ahora.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }))} · se actualiza con /panel</div></footer>
<script id="datos-entregas" type="application/json">${jsonSeguro({ entregas: entregasDatos, compartido: alm.compartido, iconos: { archivo: ic('archivo'), info: ic('rayo'), meta: ic('meta'), alerta: ic('alerta') } })}</script>
<script>
(function () {
  // Días seleccionables de cada camino
  document.querySelectorAll('.dias-zona').forEach(function (zona) {
    var botones = zona.querySelectorAll('.dia-btn');
    botones.forEach(function (b, i) {
      b.addEventListener('click', function () { elegir(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + botones.length) % botones.length;
          elegir(n); botones[n].focus();
        }
      });
    });
    function elegir(n) {
      botones.forEach(function (b, i) {
        b.setAttribute('aria-selected', String(i === n));
        b.tabIndex = i === n ? 0 : -1;
        document.getElementById(b.getAttribute('aria-controls')).hidden = i !== n;
      });
    }
    elegir(0);
  });

  // Entregas: subir material y seguir el trabajo del agente
  var datos = JSON.parse(document.getElementById('datos-entregas').textContent);
  var ICON = datos.iconos;
  var local = /^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname);
  var lista = document.getElementById('ent-lista');
  var PASOS = ['recibido', 'revisando', 'trabajando', 'listo'];
  var NOMBRES = { recibido: 'Recibido', revisando: 'Revisando', trabajando: 'Trabajando', listo: 'Listo' };
  var EXPLICA = {
    recibido: 'Llegó bien. Lo reviso en la próxima sesión de marketing.',
    revisando: 'Estoy revisando si el material sirve.',
    trabajando: 'Estoy armando la pieza con este material.',
    listo: 'La pieza está lista para que la revisen.',
    problema: 'Hay un problema con el material.'
  };
  function txt(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function fecha(iso) { try { return new Date(iso).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } }
  function peso(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }

  function pintar(entregas) {
    if (!entregas.length) { lista.innerHTML = '<li class="ent-vacio">Aún no han subido material. Cuando suban algo, aquí verán si ya lo revisé, si estoy trabajando en ello o si está listo.</li>'; return; }
    lista.innerHTML = entregas.slice().reverse().map(function (e) {
      var prob = e.estado === 'problema';
      var idx = prob ? Math.max(0, PASOS.indexOf((e.historial.filter(function (h) { return h.estado !== 'problema'; }).pop() || {}).estado)) : PASOS.indexOf(e.estado);
      var pasos = PASOS.map(function (p, i) { var c = i < idx || (i === idx && e.estado === 'listo') ? 'hecho' : i === idx ? 'ahora' : ''; return '<li class="' + c + '">' + NOMBRES[p] + '</li>'; }).join('');
      var ultima = e.historial[e.historial.length - 1] || {};
      var nota = ultima.nota && ultima.estado === e.estado ? ultima.nota : EXPLICA[e.estado];
      var pill = prob ? '<span class="pill bad">Hay un problema</span>' : e.estado === 'listo' ? '<span class="pill ok">Listo</span>' : e.estado === 'recibido' ? '<span class="pill warn">Esperando al agente</span>' : '<span class="pill info">En proceso</span>';
      return '<li class="ent' + (prob ? ' problema' : '') + '">' +
        '<div class="ent-cab"><div><strong>' + txt(e.para || 'Material') + '</strong><small>' + (e.autor ? 'Subido por ' + txt(e.autor) + ' · ' : '') + fecha(e.creada) + '</small></div>' + pill + '</div>' +
        '<ol class="pasos-ent' + (prob ? ' prob' : '') + '">' + pasos + '</ol>' +
        '<div class="ent-ahora">' + (prob ? ICON.alerta : ICON.info) + '<div><b>' + (prob ? 'Qué pasó' : 'Qué estoy haciendo') + '</b>' + txt(nota) + '</div></div>' +
        (e.archivos.length ? '<div class="ent-arch">' + e.archivos.map(function (a) { return '<span class="chip" title="' + txt(a.nombre) + '">' + ICON.archivo + txt(a.nombre) + ' · ' + peso(a.bytes) + '</span>'; }).join('') + '</div>' : '') +
        (e.nota ? '<div class="ent-ahora">' + ICON.info + '<div><b>Su nota</b>' + txt(e.nota) + '</div></div>' : '') +
        (e.resultado ? (local ? '<a class="ent-res" target="_blank" rel="noopener" href="/archivos?ruta=' + encodeURIComponent(e.resultado) + '">' + ICON.meta + 'Ver el resultado</a>' : '<span class="ent-res">' + ICON.meta + 'Resultado: ' + txt(e.resultado) + '</span>') : '') +
        '<details><summary>Ver historial (' + e.historial.length + ')</summary><ol>' + e.historial.map(function (h) { return '<li><strong>' + fecha(h.fecha) + '</strong> · ' + txt(NOMBRES[h.estado] || 'Problema') + (h.nota ? ': ' + txt(h.nota) : '') + '</li>'; }).join('') + '</ol></details>' +
        '</li>';
    }).join('');
  }
  pintar(datos.entregas || []);

  var form = document.getElementById('ent-form');
  var input = document.getElementById('ent-archivos');
  var zona = document.getElementById('ent-soltar');
  var elegidos = document.getElementById('ent-elegidos');
  var msg = document.getElementById('ent-msg');
  var enviar = document.getElementById('ent-enviar');
  var archivos = [];

  if (!local) {
    document.getElementById('ent-solo-local').hidden = false;
    enviar.disabled = true; input.disabled = true;
    return;
  }
  if (!datos.compartido) { enviar.disabled = true; input.disabled = true; }

  var autor = document.getElementById('ent-autor');
  try { autor.value = localStorage.getItem('rt-autor') || ''; } catch (e) {}
  autor.addEventListener('change', function () { try { localStorage.setItem('rt-autor', autor.value.trim()); } catch (e) {} });

  document.getElementById('ent-vivo').hidden = false;
  function refrescar() { fetch('/api/entregas', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) { pintar(d.entregas || []); }).catch(function () {}); }
  setInterval(refrescar, 8000);

  function mostrar() { elegidos.textContent = archivos.length ? archivos.map(function (f) { return f.name; }).join(', ') : 'Ningún archivo elegido'; }
  input.addEventListener('change', function () { archivos = Array.prototype.slice.call(input.files); mostrar(); });
  ['dragenter', 'dragover'].forEach(function (t) { zona.addEventListener(t, function (e) { e.preventDefault(); zona.classList.add('sobre'); }); });
  ['dragleave', 'drop'].forEach(function (t) { zona.addEventListener(t, function (e) { e.preventDefault(); zona.classList.remove('sobre'); }); });
  zona.addEventListener('drop', function (e) { archivos = archivos.concat(Array.prototype.slice.call(e.dataTransfer.files)); mostrar(); });

  function subir(id, f, i, total) {
    return new Promise(function (ok, mal) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/entregas/' + id + '/archivo');
      xhr.setRequestHeader('x-nombre', encodeURIComponent(f.name));
      xhr.upload.onprogress = function (e) {
        if (!e.lengthComputable) return;
        var pct = Math.round(((i + e.loaded / e.total) / total) * 100);
        document.getElementById('ent-barra').style.width = pct + '%';
        document.getElementById('ent-pct').textContent = 'Subiendo ' + (i + 1) + ' de ' + total + ' · ' + pct + '%';
      };
      xhr.onload = function () { xhr.status < 300 ? ok() : mal(new Error(xhr.responseText || 'Error al subir')); };
      xhr.onerror = function () { mal(new Error('Se cortó la conexión con el panel.')); };
      xhr.send(f);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'ent-msg'; msg.textContent = '';
    if (!archivos.length) { msg.className = 'ent-msg err'; msg.textContent = 'Elijan al menos un archivo para enviar.'; return; }
    enviar.disabled = true;
    document.getElementById('ent-progreso').hidden = false;
    fetch('/api/entregas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ para: document.getElementById('ent-para').value, nota: document.getElementById('ent-nota').value, autor: autor.value.trim() }) })
      .then(function (r) { if (!r.ok) throw new Error('No se pudo crear la entrega.'); return r.json(); })
      .then(function (ent) {
        var cadena = Promise.resolve();
        archivos.forEach(function (f, i) { cadena = cadena.then(function () { return subir(ent.id, f, i, archivos.length); }); });
        return cadena.then(function () { return ent; });
      })
      .then(function (ent) {
        msg.className = 'ent-msg ok';
        msg.textContent = 'Listo: la entrega #' + ent.id + ' llegó. La verán abajo y se irá actualizando mientras trabajo en ella.';
        archivos = []; input.value = ''; document.getElementById('ent-nota').value = ''; mostrar(); refrescar();
      })
      .catch(function (err) { msg.className = 'ent-msg err'; msg.textContent = err.message + ' Revisen que el panel siga abierto y vuelvan a intentar.'; })
      .then(function () { enviar.disabled = false; setTimeout(function () { document.getElementById('ent-progreso').hidden = true; }, 1500); });
  });
})();
</script>
`;

mkdirSync(join(raiz, 'panel'), { recursive: true });
writeFileSync(join(raiz, 'panel/panel.html'), html);
console.log(`panel/panel.html generado (${Math.round(html.length / 1024)} KB, ${tareas.length} tareas, mascota ${mascota ? 'sí' : 'no'})`);
