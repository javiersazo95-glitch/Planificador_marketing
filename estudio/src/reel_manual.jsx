// REEL «busca tu repuesto por tu auto» (version produccion, busqueda manual). Pantalla REAL de repuestop.cl (Maxus T60).
// Reutiliza las escenas de la tienda y del estacionamiento de reel_patente.jsx. Sin voz nueva todavia: subtitulos + musica.
import React from 'react';
import { AbsoluteFill, Sequence, OffthreadVideo, Img, staticFile, useCurrentFrame, spring } from 'remotion';
import { C, FUENTE, clamp01, Tienda, Subtitulo } from './prueba_patente.jsx';
import { Tienda12, Final } from './reel_patente.jsx';

const FPS = 30;
const S = (x) => Math.round(x * FPS);
export const TM = { total: 28.7, entra: 10.4, inicio: 10.9, fin: 25.2 };
// tramos del video grabado (segundos dentro de manual_prod.mp4): se cortan los tiempos muertos
export const TRAMOS = [
  { v: 0.9, d: 2.5 },   // pestaña «Búsqueda manual» y marca
  { v: 4.0, d: 2.4 },   // modelo y año
  { v: 7.4, d: 2.0 },   // versión y combustible
  { v: 10.0, d: 1.6 },  // Buscar repuestos
  { v: 12.2, d: 1.8 },  // ficha del vehículo
  { v: 14.6, d: 1.4 },  // Ver repuestos disponibles
  { v: 17.7, d: 2.6 },  // repuestos compatibles
];
export const MANUAL_FRAMES = S(TM.total);
const ANCHO = 550, ALTO = 1190;

const TelefonoManual = () => {
  const f = useCurrentFrame();
  const g = f + S(TM.entra);
  const t0 = S(TM.entra);
  const sube = spring({ frame: f, fps: FPS, config: { damping: 15, stiffness: 110 } });
  const estilo = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' };
  let acum = S(TM.inicio);
  const segs = TRAMOS.map((t) => { const o = { ...t, ini: acum, n: S(t.d) }; acum += o.n; return o; });
  const tResultados = segs[6].ini;
  const sello = spring({ frame: g - (tResultados + 20), fps: FPS, config: { damping: 10, stiffness: 160 } });
  const chunks = [
    [10.4, 13.4, [['donde', 0], ['eliges', 1], ['tu', 1], ['auto', 1]]],
    [13.4, 17.8, [['Elige', 0], ['marca,', 1], ['modelo', 1], ['y', 0], ['año', 1]]],
    [17.8, 21.2, [['y', 0], ['Repuestop', 1], ['identifica', 0], ['tu', 0], ['vehículo', 0]]],
    [21.2, 25.2, [['y', 0], ['te', 0], ['muestra', 0], ['solo', 1], ['lo', 1], ['que', 1], ['le', 1], ['sirve', 1]]],
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(16px)', transform: 'scale(1.06)' }}><Tienda frame={170} /></div>
      <AbsoluteFill style={{ background: 'rgba(27,36,64,0.64)' }} />
      <div style={{ position: 'absolute', left: (1080 - ANCHO) / 2, top: 215 + (1 - sube) * 1500, width: ANCHO, height: ALTO, borderRadius: 78, background: '#0B1220', padding: 15, boxShadow: '0 40px 90px rgba(0,0,0,0.45)', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 64, overflow: 'hidden', background: '#fff' }}>
          <Sequence from={0} durationInFrames={Math.max(1, S(TM.inicio) - t0)}><Img src={staticFile('manual_ini.png')} style={estilo} /></Sequence>
          {segs.map((s, i) => (
            <Sequence key={i} from={s.ini - t0} durationInFrames={s.n}>
              <OffthreadVideo src={staticFile('manual_prod.mp4')} startFrom={S(s.v)} muted style={estilo} />
            </Sequence>
          ))}
        </div>
      </div>
      {g >= tResultados + 20 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', transform: `scale(${sello}) rotate(-3deg)`, opacity: clamp01(sello * 1.4) }}>
          <div style={{ background: '#1FA463', color: '#fff', fontFamily: FUENTE, fontWeight: 800, fontSize: 50, padding: '16px 34px', borderRadius: 999, boxShadow: '0 8px 0 rgba(0,0,0,0.25)' }}>✓ Compatibles con tu auto</div>
        </div>
      ) : null}
      {chunks.map(([a, b, p], i) => (g >= S(a) && g < S(b) ? <Subtitulo key={i} palabras={p} desde={S(a) - t0} /> : null))}
    </AbsoluteFill>
  );
};

export const ReelManual = () => (
  <AbsoluteFill style={{ background: C.marino }}>
    <Sequence from={0} durationInFrames={S(TM.entra) + 4}><Tienda12 /></Sequence>
    <Sequence from={S(TM.entra)} durationInFrames={S(TM.fin) - S(TM.entra) + 2}><TelefonoManual /></Sequence>
    <Sequence from={S(TM.fin)} durationInFrames={S(TM.total) - S(TM.fin)}><Final /></Sequence>
  </AbsoluteFill>
);
