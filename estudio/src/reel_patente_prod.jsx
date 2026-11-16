// REEL «Recorriste tiendas... busca por tu patente» — VERSION PRODUCCION (repuestop.cl, patente real tapada, MAXUS T60).
// Misma historia y voces de Fer del reel aprobado; solo cambia la pantalla del celular (ahora real, de produccion).
import React from 'react';
import { AbsoluteFill, Sequence, OffthreadVideo, Img, staticFile, useCurrentFrame, spring } from 'remotion';
import { C, FUENTE, clamp01, Tienda, Subtitulo } from './prueba_patente.jsx';
import { Tienda12, Final } from './reel_patente.jsx';

const FPS = 30;
const S = (x) => Math.round(x * FPS);
export const TPP = { total: 29.4, entra: 10.4, inicio: 13.8, fin: 25.6 };
// tramos de patente_prod.mp4 (segundos dentro del video grabado)
export const TRAMOS_PP = [
  { v: 1.0, d: 5.9 },   // escribe la patente, Buscar y ficha del vehiculo
  { v: 8.2, d: 3.4 },   // repuestos compatibles (se salta la carga); luego queda el ultimo cuadro fijo
];
export const PATENTE_PROD_FRAMES = S(TPP.total);
const ANCHO = 550, ALTO = 1190;

const TelefonoProd = () => {
  const f = useCurrentFrame();
  const g = f + S(TPP.entra);
  const t0 = S(TPP.entra);
  const sube = spring({ frame: f, fps: FPS, config: { damping: 15, stiffness: 110 } });
  const estilo = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' };
  let acum = S(TPP.inicio);
  const segs = TRAMOS_PP.map((t) => { const o = { ...t, ini: acum, n: S(t.d) }; acum += o.n; return o; });
  const tRes = segs[1].ini;
  const sello = spring({ frame: g - (tRes + S(1.5)), fps: FPS, config: { damping: 10, stiffness: 160 } });
  const chunks = [
    [10.4, 13.9, [['donde', 0], ['buscas', 0], ['repuestos', 0], ['por', 0], ['tu', 0], ['patente', 1]]],
    [13.9, 16.6, [['Escribe', 0], ['tu', 0], ['patente', 1]]],
    [16.6, 19.7, [['y', 0], ['Repuestop', 1], ['identifica', 0], ['tu', 0], ['auto', 0]]],
    [19.7, 25.6, [['Te', 0], ['muestra', 0], ['solo', 1], ['lo', 1], ['que', 1], ['le', 1], ['sirve', 1], ['a', 0], ['tu', 0], ['auto', 0]]],
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(16px)', transform: 'scale(1.06)' }}><Tienda frame={170} /></div>
      <AbsoluteFill style={{ background: 'rgba(27,36,64,0.64)' }} />
      <div style={{ position: 'absolute', left: (1080 - ANCHO) / 2, top: 215 + (1 - sube) * 1500, width: ANCHO, height: ALTO, borderRadius: 78, background: '#0B1220', padding: 15, boxShadow: '0 40px 90px rgba(0,0,0,0.45)', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 64, overflow: 'hidden', background: '#fff' }}>
          <Sequence from={0} durationInFrames={Math.max(1, S(TPP.inicio) - t0)}><Img src={staticFile('patente_prod_ini.png')} style={estilo} /></Sequence>
          {segs.map((s, i) => (
            <Sequence key={i} from={s.ini - t0} durationInFrames={s.n}>
              <OffthreadVideo src={staticFile('patente_prod.mp4')} startFrom={S(s.v)} muted style={estilo} />
            </Sequence>
          ))}
          <Sequence from={segs[1].ini + segs[1].n - t0}><Img src={staticFile('patente_prod_fin.png')} style={estilo} /></Sequence>
        </div>
      </div>
      {g >= tRes + S(1.5) ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', transform: `scale(${sello}) rotate(-3deg)`, opacity: clamp01(sello * 1.4) }}>
          <div style={{ background: '#1FA463', color: '#fff', fontFamily: FUENTE, fontWeight: 800, fontSize: 50, padding: '16px 34px', borderRadius: 999, boxShadow: '0 8px 0 rgba(0,0,0,0.25)' }}>✓ Compatibles con tu auto</div>
        </div>
      ) : null}
      {chunks.map(([a, b, p], i) => (g >= S(a) && g < S(b) ? <Subtitulo key={i} palabras={p} desde={S(a) - t0} /> : null))}
    </AbsoluteFill>
  );
};

export const ReelPatenteProd = () => (
  <AbsoluteFill style={{ background: C.marino }}>
    <Sequence from={0} durationInFrames={S(TPP.entra) + 4}><Tienda12 /></Sequence>
    <Sequence from={S(TPP.entra)} durationInFrames={S(TPP.fin) - S(TPP.entra) + 2}><TelefonoProd /></Sequence>
    <Sequence from={S(TPP.fin)} durationInFrames={S(TPP.total) - S(TPP.fin)}><Final /></Sequence>
  </AbsoluteFill>
);
