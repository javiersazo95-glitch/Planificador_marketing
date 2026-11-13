// REEL R1 «El cuñado mecánico» (animacion 2D). Sin el cierre L2: se pega despues (mezclar_r1.py).
// Pantalla real: seccion Fallas del entorno dev (los diagnosticos son privados: solo se ve la falla y el boton «Ver diagnosticos»).
import React from 'react';
import { AbsoluteFill, Sequence, OffthreadVideo, Img, staticFile, useCurrentFrame, interpolate, spring } from 'remotion';
import { C, FUENTE, lerp, clamp01, Subtitulo } from './prueba_patente.jsx';
import { Humano } from './personajes.jsx';
import { ELENCO } from './elenco_r1.jsx';

const FPS = 30;
const S = (x) => Math.round(x * FPS);

export const T = {
  total: 28.6,
  s1: 0, s2a: 3.2, s2b: 4.9, s2c: 6.6, s3: 8.4, s4: 12.4, s5: 21.8, s6: 25.6,
  videoA: 13.8,   // la grabacion empieza a correr (antes: cuadro fijo de la lista)
  videoB: 17.5,   // salto al detalle de la falla
};
const V = { ini: 1.0, detalle: 5.9 };   // segundos dentro de fallas_dev.mp4
export const R1_FRAMES = S(T.total);

const CUN = ELENCO.cunado.props, DUE = ELENCO.dueno.props;

/* ---------- utilidades visuales ---------- */
const Pill = ({ texto, top = 290, color = '#fff', fondo = C.marino, desde = 0 }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f - desde, fps: FPS, config: { damping: 12, stiffness: 170 } });
  return (
    <div style={{ position: 'absolute', top, left: 60, right: 60, display: 'flex', justifyContent: 'center', transform: `scale(${e}) rotate(${(1 - e) * -4}deg)`, opacity: clamp01(e * 1.5) }}>
      <div style={{ background: fondo, color, fontFamily: FUENTE, fontWeight: 800, fontSize: 60, lineHeight: 1.1, padding: '20px 40px', borderRadius: 34, textAlign: 'center', boxShadow: '0 10px 0 rgba(0,0,0,0.18)', textWrap: 'balance' }}>{texto}</div>
    </div>
  );
};
const Recreacion = () => (
  <div style={{ position: 'absolute', top: 262, left: 40, fontFamily: FUENTE, fontWeight: 700, fontSize: 26, color: '#fff', background: 'rgba(27,36,64,0.7)', padding: '6px 16px', borderRadius: 14 }}>Recreación</div>
);

/* ---------- fondos ---------- */
const Garage = ({ blur = 0 }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, filter: blur ? `blur(${blur}px)` : undefined }}>
    <defs><linearGradient id="cielo2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7DBBFF" /><stop offset="1" stopColor="#D5ECFF" /></linearGradient></defs>
    <rect width={1080} height={800} fill="url(#cielo2)" />
    <rect x={0} y={420} width={1080} height={820} fill="#F3E7C8" />
    <rect x={0} y={400} width={1080} height={40} fill="#B4492F" />
    <rect x={620} y={560} width={380} height={560} rx={12} fill="#C9CFD9" />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={632} y={572 + i * 108} width={356} height={92} rx={8} fill="#DDE2EA" />)}
    <rect x={90} y={600} width={260} height={230} rx={10} fill="#9CC4EA" /><rect x={90} y={600} width={260} height={230} rx={10} fill="none" stroke="#fff" strokeWidth={14} /><path d="M220 600 V830 M90 715 H350" stroke="#fff" strokeWidth={10} />
    <rect x={0} y={1240} width={1080} height={680} fill="#5A6577" />
    <rect x={0} y={1230} width={1080} height={16} fill="#8892A3" />
    {[0, 1, 2].map((i) => <rect key={i} x={120 + i * 340} y={1480} width={160} height={10} fill="#fff" opacity={0.5} />)}
    <g transform="translate(70,1180)"><circle cx={0} cy={-40} r={70} fill="#2F8F4E" /><rect x={-10} y={10} width={20} height={60} fill="#6B4A2B" /></g>
    <g transform="translate(1010,1190)"><circle cx={0} cy={-40} r={60} fill="#2F8F4E" /><rect x={-9} y={0} width={18} height={60} fill="#6B4A2B" /></g>
  </svg>
);

const Motor = () => (
  <g>
    <rect x={-150} y={-90} width={300} height={190} rx={18} fill="#2A3140" />
    <rect x={-120} y={-60} width={170} height={110} rx={10} fill="#4A5568" />
    {[-100, -62, -24, 14].map((x) => <rect key={x} x={x} y={-76} width={26} height={30} rx={5} fill="#7B8798" />)}
    <path d="M-100 90 C-30 40 40 40 100 70" stroke="#111" strokeWidth={9} fill="none" />
    <g transform="translate(95,10)"><circle r={52} fill="#E5483A" /><circle r={36} fill="#C23A2E" />{[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={Math.cos(a * Math.PI / 180) * 24} cy={Math.sin(a * Math.PI / 180) * 24} r={5} fill="#fff" />)}<circle r={9} fill="#fff" /></g>
  </g>
);

const Auto = ({ capo = true }) => (
  <g>
    <ellipse cx={0} cy={0} rx={330} ry={30} fill="#000" opacity={0.22} />
    <path d="M-300 -50 L-300 -150 Q-295 -190 -250 -200 L-170 -205 L-110 -300 Q-100 -320 -70 -320 L130 -320 Q165 -320 180 -295 L235 -205 L270 -195 Q310 -185 310 -140 L310 -50 Z" fill="#E5483A" />
    <path d="M-95 -285 L-148 -208 L-20 -208 L-20 -285Z M5 -285 L5 -208 L150 -208 L112 -283Z" fill="#1B2440" />
    <rect x={-300} y={-90} width={610} height={20} fill="#C23A2E" />
    {capo ? <path d="M180 -300 L330 -420 L372 -392 L240 -280 Z" fill="#C23A2E" /> : null}
    {[-185, 175].map((x) => (<g key={x}><circle cx={x} cy={-45} r={62} fill="#1B2440" /><circle cx={x} cy={-45} r={30} fill="#9AA6BA" /></g>))}
  </g>
);

/* ---------- Escena 1: capo abierto ---------- */
const S1 = () => {
  const f = useCurrentFrame();
  const burbuja = spring({ frame: f - 14, fps: FPS, config: { damping: 11, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <Garage />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(700,1500) scale(1.3)"><Auto capo /></g>
        <g transform={`translate(330,900) scale(${0.8 + burbuja * 0.35})`} opacity={burbuja}>
          <circle cx={0} cy={0} r={190} fill="#fff" stroke={C.marino} strokeWidth={10} />
          <g transform="scale(0.95)"><Motor /></g>
          <g transform="translate(110,150)"><rect x={-130} y={-34} width={260} height={64} rx={20} fill={C.amarillo} /><text x={0} y={12} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={40} fill={C.marino}>¿alternador?</text></g>
        </g>
        <g transform="translate(250,1760) scale(1.3)"><Humano {...CUN} animo="canchero" frame={f} /></g>
      </svg>
      <Pill texto={<>TODOS TENEMOS UN CUÑADO QUE <span style={{ color: C.amarillo }}>«SABE DE AUTOS»</span></>} top={300} desde={4} />
      <Recreacion />
      <Subtitulo palabras={[['Eso', 0], ['es', 0], ['el', 0], ['alternador,', 1], ['po.', 0]]} desde={S(0.7)} />
    </AbsoluteFill>
  );
};

/* ---------- Escenas 2: interior (radio / bencina) ---------- */
const Interior = ({ foco }) => {
  const f = useCurrentFrame();
  const parpadeo = Math.floor(f / 6) % 2 === 0;
  const tiembla = foco === 'radio' ? Math.sin(f * 1.7) * 2 : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="parab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8EC8FF" /><stop offset="1" stopColor="#DCEEFF" /></linearGradient></defs>
        <rect width={1080} height={1000} fill="url(#parab)" />
        <rect x={0} y={860} width={1080} height={160} fill="#5A6577" />
        <rect x={0} y={880} width={1080} height={10} fill="#fff" opacity={0.4} />
        {/* personajes */}
        <g transform="translate(250,1480) scale(1.38)"><Humano {...DUE} mochila={false} boletas={false} animo={foco === 'radio' ? 'cansado' : 'triste'} frame={f} /></g>
        <g transform="translate(830,1480) scale(1.38)"><Humano {...CUN} cerveza={false} guaipe={false} animo="canchero" frame={f} /></g>
        {/* tablero */}
        <path d="M0 1010 Q540 940 1080 1010 L1080 1920 L0 1920 Z" fill="#232A3A" />
        <path d="M0 1010 Q540 940 1080 1010 L1080 1040 Q540 972 0 1040 Z" fill="#3A4458" />
        {/* volante */}
        <g transform="translate(250,1260)"><circle r={175} fill="none" stroke="#10131F" strokeWidth={34} /><circle r={52} fill="#10131F" /><path d="M-170 0 H-52 M170 0 H52 M0 52 V170" stroke="#10131F" strokeWidth={26} /></g>
        {/* reloj de bencina */}
        <g transform="translate(250,1090)"><rect x={-110} y={-48} width={220} height={96} rx={24} fill="#10131F" />
          <path d="M-70 18 A70 70 0 0 1 70 18" stroke="#9AA6BA" strokeWidth={8} fill="none" />
          <text x={-84} y={38} fontFamily={FUENTE} fontWeight={800} fontSize={24} fill="#E5483A">E</text><text x={70} y={38} fontFamily={FUENTE} fontWeight={800} fontSize={24} fill="#fff">F</text>
          <g transform={`rotate(${foco === 'bencina' ? -78 + Math.sin(f / 3) * 3 : -10} 0 14)`}><rect x={-3} y={-50} width={6} height={64} fill="#E5483A" /></g>
          {foco === 'bencina' && parpadeo ? <circle cx={0} cy={-26} r={11} fill="#F8C805" /> : null}
        </g>
        {/* radio */}
        <g transform={`translate(${540 + tiembla},1130)`}>
          <rect x={-130} y={-60} width={260} height={130} rx={18} fill="#10131F" />
          <rect x={-100} y={-40} width={140} height={46} rx={8} fill="#1C2433" />
          <text x={-30} y={-8} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={30} fill={foco === 'radio' ? '#3A4458' : '#2A9D5B'}>{foco === 'radio' ? 'OFF' : '98.1'}</text>
          <circle cx={78} cy={-18} r={22} fill="#3A4458" /><circle cx={-60} cy={44} r={12} fill="#3A4458" /><circle cx={-20} cy={44} r={12} fill="#3A4458" /><circle cx={20} cy={44} r={12} fill="#3A4458" />
        </g>
        {foco === 'radio' ? <g transform="translate(540,980)" opacity={parpadeo ? 1 : 0.4}><text textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={70} fill="#E5483A">✕</text></g> : null}
      </svg>
    </AbsoluteFill>
  );
};

const Rueda = () => {
  const f = useCurrentFrame();
  const tiembla = Math.sin(f * 2.1) * 4;
  const ruido = (i) => ({ x: 560 + i * 130 + Math.sin((f + i * 9) / 5) * 8, y: 760 - ((f * 5 + i * 40) % 140), o: 1 - ((f * 5 + i * 40) % 140) / 140 });
  return (
    <AbsoluteFill>
      <Garage blur={0} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect x={0} y={1240} width={1080} height={680} fill="#5A6577" />
        <g transform={`translate(${540 + tiembla},1340)`}>
          <path d="M-700 -170 L-700 -520 Q-640 -620 -500 -640 L420 -640 L700 -420 L700 -170 Z" fill="#E5483A" />
          <path d="M-700 -330 L700 -330" stroke="#C23A2E" strokeWidth={30} />
          <circle r={330} fill="#10131F" /><circle r={230} fill="#9AA6BA" />
          {[0, 72, 144, 216, 288].map((a) => <rect key={a} x={-26} y={-220} width={52} height={170} rx={20} fill="#C9D0DC" transform={`rotate(${a})`} />)}
          <circle r={64} fill="#3B4A5E" />
        </g>
        {[0, 1, 2].map((i) => { const r = ruido(i); return <text key={i} x={r.x} y={r.y} opacity={r.o} fontFamily={FUENTE} fontWeight={800} fontSize={74} fill="#E5483A">ñiii…</text>; })}
        <g transform="translate(230,1830) scale(1.22)"><Humano {...DUE} mochila={false} boletas={false} animo="triste" frame={f} /></g>
        <g transform="translate(860,1830) scale(1.22)"><Humano {...CUN} animo="canchero" frame={f} /></g>
      </svg>
    </AbsoluteFill>
  );
};

const Corte2 = ({ foco, texto, palabras, desde }) => (
  <AbsoluteFill>
    {foco === 'rueda' ? <Rueda /> : <Interior foco={foco} />}
    <Pill texto={texto} top={290} desde={2} />
    <Recreacion />
    <Subtitulo palabras={palabras} desde={desde} />
  </AbsoluteFill>
);

/* ---------- Escena 3: el dueño ---------- */
const Alternador = ({ n, f0 }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f - f0, fps: FPS, config: { damping: 9, stiffness: 190 } });
  return (
    <g transform={`translate(${n * 150},0) scale(${e})`} opacity={clamp01(e * 2)}>
      <circle r={50} fill="#E5483A" stroke="#fff" strokeWidth={6} /><circle r={32} fill="#C23A2E" />{[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={Math.cos(a * Math.PI / 180) * 22} cy={Math.sin(a * Math.PI / 180) * 22} r={4.5} fill="#fff" />)}<circle r={8} fill="#fff" />
    </g>
  );
};
const S3 = () => {
  const f = useCurrentFrame();
  const sube = spring({ frame: f, fps: FPS, config: { damping: 15, stiffness: 110 } });
  const cartel = spring({ frame: f - 10, fps: FPS, config: { damping: 11, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <Garage blur={14} />
      <AbsoluteFill style={{ background: 'rgba(27,36,64,0.35)' }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540,${1880 + (1 - sube) * 300}) scale(1.9)`}><Humano {...DUE} mochila boletas={false} animo="cansado" frame={f} /></g>
        <g transform={`translate(540,${480 - (1 - cartel) * 300})`} opacity={cartel}>
          <rect x={-70} y={-230} width={10} height={90} fill={C.gris} /><rect x={60} y={-230} width={10} height={90} fill={C.gris} />
          <rect x={-440} y={-150} width={880} height={330} rx={40} fill="#fff" stroke={C.azul} strokeWidth={12} />
          <text x={0} y={-60} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={54} fill={C.marino}>Costo hasta ahora:</text>
          <text x={0} y={110} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={76} fill="#E5483A">3 alternadores</text>
          <g transform="translate(-150,-6)"><Alternador n={0} f0={S(0.5)} /><Alternador n={1} f0={S(0.8)} /><Alternador n={2} f0={S(1.1)} /></g>
        </g>
      </svg>
      <Recreacion />
      <Subtitulo palabras={[['Ya', 0], ['cambié…', 0], ['tres.', 1]]} desde={S(0.7)} />
    </AbsoluteFill>
  );
};

/* ---------- Escena 4: la app (pantalla real de Fallas) ---------- */
const ANCHO = 550, ALTO = 1190;
const S4 = () => {
  const f = useCurrentFrame();
  const g = f + S(T.s4);
  const sube = spring({ frame: f, fps: FPS, config: { damping: 15, stiffness: 110 } });
  const vA = S(T.videoA), vB = S(T.videoB), t0 = S(T.s4);
  const estilo = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' };
  const sello = spring({ frame: g - S(18.4), fps: FPS, config: { damping: 10, stiffness: 160 } });
  const chunks = [
    [12.9, 14.8, [['Antes', 0], ['de', 0], ['cambiar', 0], ['el', 0], ['cuarto', 1], ['alternador,', 1]]],
    [14.8, 16.5, [['reporta', 0], ['la', 0], ['falla', 1], ['en', 0], ['Repuestop:', 1]]],
    [16.5, 18.1, [['un', 0], ['taller', 1], ['acreditado', 1], ['te', 0], ['responde', 0]]],
    [18.1, 21.7, [['con', 0], ['diagnóstico', 1], ['y', 0], ['precio', 1], ['estimado.', 1]]],
  ];
  return (
    <AbsoluteFill>
      <Garage blur={16} />
      <AbsoluteFill style={{ background: 'rgba(27,36,64,0.66)' }} />
      <div style={{ position: 'absolute', left: (1080 - ANCHO) / 2, top: 215 + (1 - sube) * 1500, width: ANCHO, height: ALTO, borderRadius: 78, background: '#0B1220', padding: 15, boxShadow: '0 40px 90px rgba(0,0,0,0.45)', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 64, overflow: 'hidden', background: '#fff' }}>
          <Sequence from={0} durationInFrames={Math.max(1, vA - t0)}><Img src={staticFile('r1/fallas_ini.png')} style={estilo} /></Sequence>
          <Sequence from={vA - t0} durationInFrames={vB - vA}><OffthreadVideo src={staticFile('r1/fallas_dev.mp4')} startFrom={S(V.ini)} muted style={estilo} /></Sequence>
          <Sequence from={vB - t0}><OffthreadVideo src={staticFile('r1/fallas_dev.mp4')} startFrom={S(V.detalle)} muted style={estilo} /></Sequence>
        </div>
      </div>
      {g >= S(18.4) ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', transform: `scale(${sello}) rotate(-3deg)`, opacity: clamp01(sello * 1.4) }}>
          <div style={{ background: '#1FA463', color: '#fff', fontFamily: FUENTE, fontWeight: 800, fontSize: 48, padding: '16px 34px', borderRadius: 999, boxShadow: '0 8px 0 rgba(0,0,0,0.25)' }}>✓ Talleres acreditados responden</div>
        </div>
      ) : null}
      <Recreacion />
      {chunks.map(([a, b, p], i) => (g >= S(a) && g < S(b) ? <Subtitulo key={i} palabras={p} desde={S(a) - t0} /> : null))}
    </AbsoluteFill>
  );
};

/* ---------- Escena 5: el cuñado cambia de opinion ---------- */
const S5 = () => {
  const f = useCurrentFrame();
  const sinLentes = f >= S(0.7);
  const animo = f < S(0.7) ? 'canchero' : f < S(1.7) ? 'sorpresa' : 'timido';
  const entra = spring({ frame: f, fps: FPS, config: { damping: 14, stiffness: 120 } });
  const lentesY = sinLentes ? interpolate(f, [S(0.7), S(0.7) + 8], [0, -90], { extrapolateRight: 'clamp' }) : 0;
  return (
    <AbsoluteFill>
      <Garage />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(820,1700) scale(1.3)"><Humano {...DUE} mochila={false} boletas={false} animo="feliz" frame={f} /></g>
        {/* celular del dueño */}
        <g transform={`translate(${590 + (1 - entra) * 200},1200) rotate(-6) scale(1.15)`}>
          <rect x={-80} y={-150} width={160} height={290} rx={26} fill="#0B1220" /><rect x={-70} y={-138} width={140} height={266} rx={18} fill="#fff" />
          <rect x={-60} y={-120} width={120} height={46} rx={10} fill="#E8F7EE" /><text x={0} y={-90} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={20} fill="#1FA463">✓ Diagnóstico</text>
          <rect x={-60} y={-62} width={120} height={14} rx={7} fill="#DDE2EA" /><rect x={-60} y={-38} width={90} height={14} rx={7} fill="#DDE2EA" /><rect x={-60} y={-14} width={104} height={14} rx={7} fill="#DDE2EA" />
          <rect x={-60} y={30} width={120} height={46} rx={14} fill={C.azul} /><text x={0} y={60} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={20} fill="#fff">Ver precio</text>
        </g>
        <g transform={`translate(${260 + (1 - entra) * -200},1700) scale(1.3)`}>
          <Humano {...CUN} lentes={!sinLentes} guaipe cerveza animo={animo} frame={f} />
        </g>
        {sinLentes ? <g transform={`translate(${260 + (1 - entra) * -200},${1700 + lentesY * 0.2}) scale(1.3)`} opacity={interpolate(f, [S(0.7), S(0.7) + 14], [1, 0], { extrapolateRight: 'clamp' })}><g transform={`translate(0,${lentesY - 520})`}><rect x={-62} y={-20} width={54} height={40} rx={14} fill="#10131F" /><rect x={8} y={-20} width={54} height={40} rx={14} fill="#10131F" /></g></g> : null}
      </svg>
      <Recreacion />
      <Subtitulo palabras={[['…Bueno,', 0], ['yo', 0], ['dije', 0], ['que', 0], ['podía', 0], ['ser', 0], ['eléctrico.', 1]]} desde={S(0.6)} />
    </AbsoluteFill>
  );
};

/* ---------- Escena 6: tarjeta ---------- */
const S6 = () => {
  const f = useCurrentFrame();
  const e = spring({ frame: f, fps: FPS, config: { damping: 13, stiffness: 130 } });
  const b = spring({ frame: f - 14, fps: FPS, config: { damping: 11, stiffness: 150 } });
  return (
    <AbsoluteFill style={{ background: C.azul, alignItems: 'center', justifyContent: 'center', fontFamily: FUENTE }}>
      <div style={{ textAlign: 'center', padding: '0 70px', transform: `scale(${lerp(0.8, 1, e)})`, opacity: e }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 104, lineHeight: 1.08, textWrap: 'balance' }}>Tu auto merece algo mejor que <span style={{ color: C.amarillo }}>tu cuñado</span></div>
      </div>
      <div style={{ marginTop: 60, transform: `scale(${b})`, opacity: clamp01(b * 1.5) }}>
        <div style={{ background: C.amarillo, color: C.marino, fontWeight: 800, fontSize: 70, padding: '18px 54px', borderRadius: 999, boxShadow: '0 10px 0 rgba(0,0,0,0.2)' }}>repuestop.cl</div>
      </div>
      <div style={{ position: 'absolute', top: 262, left: 40, fontWeight: 700, fontSize: 26, color: '#fff', background: 'rgba(27,36,64,0.45)', padding: '6px 16px', borderRadius: 14 }}>Recreación</div>
    </AbsoluteFill>
  );
};

export const ReelR1 = () => (
  <AbsoluteFill style={{ background: C.marino }}>
    <Sequence from={S(T.s1)} durationInFrames={S(T.s2a - T.s1)}><S1 /></Sequence>
    <Sequence from={S(T.s2a)} durationInFrames={S(T.s2b - T.s2a)}><Corte2 foco="radio" texto="La radio no prende" palabras={[['Alternador.', 1]]} desde={S(0.65)} /></Sequence>
    <Sequence from={S(T.s2b)} durationInFrames={S(T.s2c - T.s2b)}><Corte2 foco="rueda" texto="Ruido raro en la rueda" palabras={[['Alternador,', 1], ['po.', 0]]} desde={S(0.6)} /></Sequence>
    <Sequence from={S(T.s2c)} durationInFrames={S(T.s3 - T.s2c)}><Corte2 foco="bencina" texto="Se quedó sin bencina" palabras={[['Sin', 0], ['duda…', 0], ['alternador.', 1]]} desde={S(0.6)} /></Sequence>
    <Sequence from={S(T.s3)} durationInFrames={S(T.s4 - T.s3)}><S3 /></Sequence>
    <Sequence from={S(T.s4)} durationInFrames={S(T.s5 - T.s4)}><S4 /></Sequence>
    <Sequence from={S(T.s5)} durationInFrames={S(T.s6 - T.s5)}><S5 /></Sequence>
    <Sequence from={S(T.s6)} durationInFrames={S(T.total - T.s6)}><S6 /></Sequence>
  </AbsoluteFill>
);
