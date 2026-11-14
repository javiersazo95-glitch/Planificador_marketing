// ESCENA DE PRUEBA «Nico y Repuestín» (historia 2 de Nico Primer Cambio, elenco R3).
// Personajes: recortes de las láminas generadas con ChatGPT (entregas/imagen gpt). Sin cierre L2: se pega después con ffmpeg.
import React from 'react';
import { AbsoluteFill, Sequence, OffthreadVideo, Audio, Img, staticFile, useCurrentFrame, interpolate, spring } from 'remotion';
import { C, FUENTE, lerp, clamp01, Subtitulo } from './prueba_patente.jsx';

const FPS = 30;
const S = (x) => Math.round(x * FPS);
const CUERPO = S(24.2);
export const NICO_FRAMES = CUERPO + S(5.6);
const T = { a: 0, b: 5.6, c: 13.8 };
const VOZ = [['n1', 0.3], ['n2', 5.9], ['n3', 14.0]]; // narración (voz provisional de Windows; reemplazar por Fer de ElevenLabs con el mismo nombre)

const img = (n) => staticFile(`gpt/${n}.png`);
const BG = '#E6EFFD';

const Fondo = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <defs><linearGradient id="fn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3F7FF" /><stop offset="1" stopColor="#D5E4FB" /></linearGradient></defs>
    <rect width={1080} height={1920} fill="url(#fn)" />
    <circle cx={980} cy={420} r={260} fill="#fff" opacity={0.55} />
    <circle cx={60} cy={1180} r={320} fill="#fff" opacity={0.5} />
    <path d="M0 1560 C 250 1490 520 1640 1080 1540 L1080 1920 L0 1920Z" fill={C.azul} opacity={0.12} />
    <path d="M0 1640 C 300 1580 640 1700 1080 1620 L1080 1920 L0 1920Z" fill={C.azul} opacity={0.10} />
  </svg>
);

const Pill = ({ texto, top = 250, desde = 0 }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f - desde, fps: FPS, config: { damping: 12, stiffness: 170 } });
  return (
    <div style={{ position: 'absolute', top, left: 60, right: 60, display: 'flex', justifyContent: 'center', transform: `scale(${e}) rotate(${(1 - e) * -4}deg)`, opacity: clamp01(e * 1.5) }}>
      <div style={{ background: C.marino, color: '#fff', fontFamily: FUENTE, fontWeight: 800, fontSize: 62, lineHeight: 1.1, padding: '20px 42px', borderRadius: 34, textAlign: 'center', boxShadow: '0 10px 0 rgba(0,0,0,0.16)', textWrap: 'balance' }}>{texto}</div>
    </div>
  );
};

const Recreacion = () => (
  <div style={{ position: 'absolute', top: 190, left: 40, fontFamily: FUENTE, fontWeight: 700, fontSize: 26, color: '#fff', background: 'rgba(27,36,64,0.7)', padding: '6px 16px', borderRadius: 14 }}>Recreación</div>
);

const Avatar = ({ src, x, y, size = 300, desde = 0, borde = C.azul, flip = false }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f - desde, fps: FPS, config: { damping: 11, stiffness: 150 } });
  const bob = Math.sin((f - desde) / 9) * 6;
  return (
    <div style={{ position: 'absolute', left: x, top: y + bob, width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: '#fff', border: `12px solid ${borde}`, boxShadow: '0 14px 0 rgba(15,78,194,0.18)', transform: `scale(${e})`, opacity: clamp01(e * 1.6) }}>
      <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: flip ? 'scaleX(-1)' : undefined }} />
    </div>
  );
};

const Burbuja = ({ texto, x, y, w = 560, desde = 0, lado = 'izq', color = '#fff', txt = C.marino }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f - desde, fps: FPS, config: { damping: 13, stiffness: 180 } });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `scale(${e})`, transformOrigin: lado === 'izq' ? 'left center' : 'right center', opacity: clamp01(e * 1.6) }}>
      <div style={{ background: color, color: txt, fontFamily: FUENTE, fontWeight: 800, fontSize: 46, lineHeight: 1.18, padding: '26px 34px', borderRadius: 40, boxShadow: '0 10px 0 rgba(27,36,64,0.14)' }}>{texto}</div>
    </div>
  );
};

const Puntos = ({ x, y, desde, hasta }) => {
  const f = useCurrentFrame();
  if (f < desde || f > hasta) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, background: '#fff', borderRadius: 40, padding: '24px 36px', display: 'flex', gap: 14, boxShadow: '0 10px 0 rgba(27,36,64,0.14)' }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: C.azul, opacity: 0.35 + 0.65 * Math.abs(Math.sin((f - desde) / 6 - i * 0.7)) }} />)}
    </div>
  );
};

/* ---------- Escena A: el gancho ---------- */
const EscA = () => {
  const f = useCurrentFrame();
  const q = (d, x, y, s) => { const e = spring({ frame: f - d, fps: FPS, config: { damping: 8, stiffness: 140 } }); return <div style={{ position: 'absolute', left: x, top: y - Math.sin((f - d) / 8) * 10, fontFamily: FUENTE, fontWeight: 900, fontSize: s, color: C.azul, transform: `scale(${e}) rotate(${(1 - e) * 20}deg)` }}>?</div>; };
  return (
    <AbsoluteFill>
      <Pill texto="¿Y si compro el repuesto equivocado?" />
      <Avatar src={img('nico_dudoso')} x={290} y={620} size={500} desde={6} />
      {q(24, 130, 640, 190)}{q(36, 850, 560, 150)}{q(48, 820, 900, 120)}
      <Subtitulo palabras={[['Nico va a comprar su ', false], ['primer repuesto', true], ['… y duda.', false]]} desde={30} />
    </AbsoluteFill>
  );
};

/* ---------- Escena B: Repuestín al rescate ---------- */
const EscB = () => (
  <AbsoluteFill>
    <Pill texto="Escríbele a Repuestín" />
    <Avatar src={img('nico_dudoso')} x={60} y={560} size={290} desde={4} />
    <Burbuja texto="Necesito el amortiguador de mi auto." x={390} y={590} w={620} desde={14} />
    <Puntos x={410} y={960} desde={52} hasta={78} />
    <Avatar src={img('repuestin')} x={730} y={900} size={290} desde={50} borde={C.amarillo} />
    <Burbuja texto="Tranquilo. Pregunto a las tiendas por ti." x={50} y={900} w={620} desde={78} lado="der" color={C.azul} txt="#fff" />
    <Burbuja texto="Te aviso apenas respondan." x={410} y={1180} w={620} desde={130} lado="der" color={C.amarillo} />
    <Subtitulo palabras={[['Él ', false], ['pregunta a las tiendas', true], [' por ti', false]]} desde={96} />
  </AbsoluteFill>
);

/* ---------- Escena C: final feliz ---------- */
const EscC = () => {
  const f = useCurrentFrame();
  const e = spring({ frame: f, fps: FPS, config: { damping: 12, stiffness: 120 } });
  const ck = spring({ frame: f - 40, fps: FPS, config: { damping: 8, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <Pill texto="Tú esperas tranquilo" />
      <div style={{ position: 'absolute', left: 80, top: 390, width: 640, height: 1010, transform: `translateY(${(1 - e) * 140 + Math.sin(f / 14) * 8}px) scale(${lerp(0.9, 1, e)})`, opacity: clamp01(e * 1.5), mixBlendMode: 'multiply', WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 5%, #000 97%, transparent 100%)', WebkitMaskComposite: 'source-in', maskComposite: 'intersect' }}>
        <Img src={img('nico_cuerpo')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ position: 'absolute', left: 540, top: 430, transform: `scale(${ck}) rotate(${(1 - ck) * 12}deg)`, transformOrigin: 'left bottom' }}>
        <div style={{ background: '#fff', borderRadius: 44, padding: '26px 38px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 10px 0 rgba(27,36,64,0.14)' }}>
          <svg width={72} height={72} viewBox="0 0 72 72"><circle cx={36} cy={36} r={36} fill="#2F9E5B" /><path d="M20 37 L32 49 L53 25" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 48, color: C.marino, lineHeight: 1.1 }}>Repuestín<br />te avisa</span>
        </div>
      </div>
      <Avatar src={img('repuestin')} x={770} y={1010} size={230} desde={50} borde={C.amarillo} />
      <Subtitulo palabras={[['Escríbele a Repuestín. ', false], ['Él se encarga.', true]]} desde={20} />
    </AbsoluteFill>
  );
};

export const EscenaNico = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Fondo />
    <Sequence from={S(T.a)} durationInFrames={S(T.b - T.a)}><EscA /></Sequence>
    <Sequence from={S(T.b)} durationInFrames={S(T.c - T.b)}><EscB /></Sequence>
    <Sequence from={S(T.c)} durationInFrames={CUERPO - S(T.c)}><EscC /></Sequence>
    <Sequence from={0} durationInFrames={CUERPO}><Recreacion /></Sequence>
    {VOZ.map(([n, t]) => <Sequence key={n} from={S(t)}><Audio src={staticFile(`voz_nico/${n}.wav`)} /></Sequence>)}
    <Sequence from={CUERPO} durationInFrames={S(5.6)}><OffthreadVideo src={staticFile('cierre_L2.mp4')} style={{ width: 1080, height: 1920 }} /></Sequence>
  </AbsoluteFill>
);
