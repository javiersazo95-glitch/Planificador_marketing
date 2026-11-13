// REEL "Recorriste tiendas... busca por tu patente" (sin el cierre L2: se pega despues con cierre_reels).
// Animacion 2D plana en codigo. Pantalla real grabada desde el entorno dev (patente de prueba ABCD11).
// Los tiempos (en segundos) estan todos en TIEMPOS: si la voz dura distinto, se ajusta aca y se vuelve a renderizar.
import React from 'react';
import { AbsoluteFill, Sequence, OffthreadVideo, Freeze, Img, staticFile, useCurrentFrame, interpolate, spring } from 'remotion';
import { C, FUENTE, lerp, clamp01, Tienda, Persona, Nube, Ampolleta, Subtitulo } from './prueba_patente.jsx';

const FPS = 30;
const S = (x) => Math.round(x * FPS);

export const TIEMPOS = {
  total: 29.4,
  idea: 5.2,            // se enciende la ampolleta
  logo: 5.8,            // aparece el logo
  telefonoEntra: 10.4,  // entra el celular
  videoA: 13.6,         // la grabacion empieza a correr (antes: cuadro congelado de la portada)
  videoB: 19.7,         // salto al catalogo (se salta la carga)
  parqueadero: 25.7,    // escena final en el auto
  // inicios de cada frase de la voz (Fer) -> ver GUION_VOZ
  voz: [0.3, 5.4, 10.6, 14.2, 19.5, 25.8],
};
// momentos dentro del video grabado (catalogo_patente.mp4)
const V = { inicio: 0.4, auto: 3.88, auto1: 6.48, cat: 8.1 };

export const GUION_VOZ = [
  '¿Recorriste tiendas de repuestos toda la mañana y no encontraste nada?',
  'Te presento Repuestop, el marketplace de repuestos de Chile,',
  'donde buscas repuestos por tu patente.',
  'Escribe tu patente, y Repuestop identifica tu auto.',
  'Después te muestra solo los repuestos que le sirven.',
  'Menos vueltas, más tiempo para ti.',
];

/* ---------------- Escena 1 + 2: tienda ---------------- */
const Tienda12 = () => {
  const f = useCurrentFrame();
  const idea = S(TIEMPOS.idea);
  const esIdea = f >= idea;
  const animo = esIdea ? interpolate(f, [idea, idea + 14], [0, 1], { extrapolateRight: 'clamp' }) : 0;
  const nubeOp = esIdea ? interpolate(f, [idea, idea + 12], [1, 0], { extrapolateRight: 'clamp' }) : interpolate(f, [40, 56], [0, 1], { extrapolateRight: 'clamp' });
  const nubeY = esIdea ? -interpolate(f, [idea, idea + 14], [0, 80]) : 0;
  const bulbo = esIdea ? spring({ frame: f - idea - 2, fps: FPS, config: { damping: 8, stiffness: 180 } }) : 0;
  const bulboSale = esIdea ? interpolate(f, [idea + 50, idea + 62], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const pill = spring({ frame: f - 3, fps: FPS, config: { damping: 14 } });
  const pillSale = interpolate(f, [idea - 6, idea + 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const logoF = f - S(TIEMPOS.logo);
  const logo = spring({ frame: logoF, fps: FPS, config: { damping: 11, stiffness: 150 } });
  // el fondo se desplaza mientras camina; al llegar la idea se frena
  const fondo = esIdea ? idea + (f - idea) * 0.15 : f;
  return (
    <AbsoluteFill>
      <Tienda frame={fondo} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(540,1330) scale(1.12)">
          <Persona frame={f} animo={animo} camina={!esIdea || f < idea + 16} />
          <g transform={`translate(0,${-700 + nubeY})`}><Nube frame={f} opacidad={nubeOp} /></g>
          <g transform="translate(0,-740)" opacity={bulboSale}><Ampolleta escala={bulbo} /></g>
        </g>
      </svg>
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - pill) * -80}px)`, opacity: pill * pillSale }}>
        <div style={{ background: C.amarillo, color: C.marino, fontFamily: FUENTE, fontWeight: 800, fontSize: 64, padding: '18px 40px', borderRadius: 999, boxShadow: '0 8px 0 rgba(0,0,0,0.15)' }}>¿Te ha pasado esto?</div>
      </div>
      {/* tarjeta con el logo */}
      {logoF >= 0 ? (
        <div style={{ position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${logo})`, opacity: clamp01(logo * 1.5) }}>
          <div style={{ background: '#fff', borderRadius: 40, padding: '22px 44px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 14px 0 rgba(15,78,194,0.25)', border: `6px solid ${C.azul}` }}>
            <Img src={staticFile('logo_icono.svg')} style={{ width: 150, height: 84 }} />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 84, color: C.azul, letterSpacing: -2 }}>Repues<span style={{ color: C.marino }}>Top</span></span>
          </div>
        </div>
      ) : null}
      {f < idea ? (
        <Subtitulo palabras={[['¿Recorriste', 0], ['tiendas', 0], ['toda', 0], ['la', 0], ['mañana', 0], ['y', 0], ['no', 1], ['encontraste', 1], ['nada?', 1]]} desde={S(TIEMPOS.voz[0])} />
      ) : (
        <Sequence from={idea}><Subtitulo palabras={[['Te', 0], ['presento', 0], ['Repuestop,', 1], ['el', 0], ['marketplace', 0], ['de', 0], ['repuestos', 0], ['de', 0], ['Chile', 1]]} desde={S(TIEMPOS.voz[1] - TIEMPOS.idea)} /></Sequence>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- Escenas 3, 4 y 5: celular ---------------- */
const ANCHO = 550, ALTO = 1190, MARCO = 15;
const Telefono = () => {
  const f = useCurrentFrame(); // relativo al inicio de la escena del celular
  const t0 = S(TIEMPOS.telefonoEntra);
  const g = f + t0; // cuadro global
  const sube = spring({ frame: f, fps: FPS, config: { damping: 15, stiffness: 110 } });
  const salta = spring({ frame: g - S(TIEMPOS.parqueadero - 0.35), fps: FPS, config: { damping: 18, stiffness: 120 } });
  const vA = S(TIEMPOS.videoA), vB = S(TIEMPOS.videoB);
  // pop cuando identifica el auto
  const tAuto = S(TIEMPOS.videoA + V.auto - V.inicio);
  const pop = g > tAuto ? 1 + 0.045 * Math.exp(-(g - tAuto) / 5) * Math.cos((g - tAuto) / 2.2) : 1;
  // zoom al catalogo (columna derecha)
  const zoom = interpolate(g, [vB, vB + 16], [1, 1.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const estilo = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' };
  const origen = '100% 0%';
  const clipA = (
    <OffthreadVideo src={staticFile('catalogo_patente.mp4')} startFrom={S(V.inicio)} muted style={estilo} />
  );
  const sticker = spring({ frame: g - (vB + 26), fps: FPS, config: { damping: 10, stiffness: 160 } });
  const fuera = g > S(TIEMPOS.parqueadero - 0.35) ? (1 - salta) * 0 : 1;
  return (
    <AbsoluteFill style={{ opacity: g > S(TIEMPOS.parqueadero) ? 0 : 1 }}>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(16px)', transform: 'scale(1.06)' }}><Tienda frame={S(TIEMPOS.idea) + 8} /></div>
      <AbsoluteFill style={{ background: 'rgba(27,36,64,0.64)' }} />
      <div style={{ position: 'absolute', left: (1080 - ANCHO) / 2, top: 215 + (1 - sube) * 1500 + salta * 1700, width: ANCHO, height: ALTO, borderRadius: 78, background: '#0B1220', padding: MARCO, boxShadow: '0 40px 90px rgba(0,0,0,0.45)', boxSizing: 'border-box', transform: `scale(${pop})` }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 64, overflow: 'hidden', background: '#fff' }}>
          <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: origen }}>
            {/* 1) portada congelada hasta que empieza a escribir */}
            <Sequence from={0} durationInFrames={Math.max(1, vA - t0)}><Img src={staticFile('portada_patente.png')} style={estilo} /></Sequence>
            {/* 2) escribe la patente y aparece el auto */}
            <Sequence from={vA - t0} durationInFrames={vB - vA}>
              <OffthreadVideo src={staticFile('catalogo_patente.mp4')} startFrom={S(V.inicio)} muted style={estilo} />
            </Sequence>
            {/* 3) catalogo (salta la carga) */}
            <Sequence from={vB - t0}>
              <OffthreadVideo src={staticFile('catalogo_patente.mp4')} startFrom={S(V.cat)} muted style={estilo} />
            </Sequence>
          </div>
        </div>
      </div>
      {/* sello de compatibilidad */}
      {g >= vB + 26 && g < S(TIEMPOS.parqueadero) ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', transform: `scale(${sticker}) rotate(-3deg)`, opacity: clamp01(sticker * 1.4) }}>
          <div style={{ background: '#1FA463', color: '#fff', fontFamily: FUENTE, fontWeight: 800, fontSize: 50, padding: '16px 34px', borderRadius: 999, boxShadow: '0 8px 0 rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 56 }}>✓</span> Compatibles con tu auto
          </div>
        </div>
      ) : null}
      {/* subtitulos */}
      {g < S(TIEMPOS.voz[3] - 0.1) ? <Sub desde={S(TIEMPOS.voz[2]) - t0} palabras={[['donde', 0], ['buscas', 0], ['repuestos', 0], ['por', 0], ['tu', 0], ['patente', 1]]} /> : null}
      {g >= S(TIEMPOS.voz[3] - 0.1) && g < S(17.0) ? <Sub desde={S(TIEMPOS.voz[3]) - t0} palabras={[['Escribe', 0], ['tu', 0], ['patente', 1]]} /> : null}
      {g >= S(17.0) && g < S(TIEMPOS.voz[4] - 0.1) ? <Sub desde={S(17.0) - t0} palabras={[['y', 0], ['Repuestop', 1], ['identifica', 0], ['tu', 0], ['auto', 0]]} /> : null}
      {g >= S(TIEMPOS.voz[4] - 0.1) && g < S(TIEMPOS.parqueadero - 0.2) ? <Sub desde={S(TIEMPOS.voz[4]) - t0} palabras={[['Te', 0], ['muestra', 0], ['solo', 1], ['lo', 1], ['que', 1], ['le', 1], ['sirve', 1], ['a', 0], ['tu', 0], ['auto', 0]]} /> : null}
    </AbsoluteFill>
  );
};
// subtitulo con "desde" relativo a la escena del celular (Subtitulo usa useCurrentFrame)
const Sub = ({ palabras, desde }) => <Subtitulo palabras={palabras} desde={desde} />;

/* ---------------- Escena 6: estacionamiento ---------------- */
const Confeti = ({ frame }) => {
  const colores = [C.amarillo, C.azul, '#E5483A', '#1FA463', '#fff'];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 46 }).map((_, i) => {
        const h1 = (Math.sin(i * 12.9898) * 43758.5453) % 1, h2 = (Math.sin(i * 78.233) * 12345.678) % 1;
        const x = Math.abs(h1) * 1080, v = 6 + Math.abs(h2) * 7, y0 = -Math.abs(h2) * 600;
        const y = y0 + frame * v;
        if (y > 1960) return null;
        return <rect key={i} x={x + Math.sin(frame / 9 + i) * 24} y={y} width={16} height={26} fill={colores[i % 5]} transform={`rotate(${frame * 9 + i * 30} ${x} ${y})`} />;
      })}
    </svg>
  );
};
const Auto = () => (
  <g>
    <ellipse cx={0} cy={0} rx={330} ry={30} fill="#000" opacity={0.2} />
    <path d="M-300 -50 L-300 -150 Q-295 -190 -250 -200 L-170 -205 L-110 -300 Q-100 -320 -70 -320 L130 -320 Q165 -320 180 -295 L235 -205 L270 -195 Q310 -185 310 -140 L310 -50 Z" fill="#E5483A" />
    <path d="M-95 -285 L-148 -208 L-20 -208 L-20 -285Z M5 -285 L5 -208 L150 -208 L112 -283Z" fill="#1B2440" />
    <rect x={-300} y={-90} width={610} height={20} fill="#C23A2E" />
    <rect x={-120} y={-160} width={150} height={52} rx={8} fill="#fff" /><text x={-45} y={-120} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={34} fill={C.marino}>ABCD11</text>
    {[-185, 175].map((x) => (<g key={x}><circle cx={x} cy={-45} r={62} fill="#1B2440" /><circle cx={x} cy={-45} r={30} fill="#9AA6BA" /></g>))}
  </g>
);
const Estacionamiento = ({ frame }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3C9BFF" /><stop offset="1" stopColor="#BFE3FF" /></linearGradient></defs>
    <rect width={1080} height={1000} fill="url(#cielo)" />
    <rect x={0} y={330} width={1080} height={600} fill="#EEF2F8" />
    <rect x={0} y={330} width={1080} height={70} fill={C.azul} />
    <rect x={0} y={400} width={1080} height={14} fill={C.amarillo} />
    <text x={540} y={640} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={140} fill="#E5483A">REPUESTOS</text>
    {[90, 330, 570, 810].map((x) => <rect key={x} x={x} y={720} width={190} height={150} rx={10} fill="#BFD2EA" />)}
    <rect x={0} y={920} width={1080} height={1000} fill="#4A5568" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={140 + i * 260} y={1000} width={14} height={300} fill="#fff" opacity={0.85} transform={`skewX(-12)`} />)}
    <g transform="translate(160,880)"><circle cx={0} cy={0} r={90} fill="#2F8F4E" /><rect x={-8} y={60} width={16} height={60} fill="#6B4A2B" /></g>
    <g transform="translate(940,870)"><circle cx={0} cy={0} r={80} fill="#2F8F4E" /><rect x={-8} y={55} width={16} height={60} fill="#6B4A2B" /></g>
    <g transform="translate(700,1400) scale(1.25)"><Auto /></g>
  </svg>
);
const Final = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 60], [-80, 160], { extrapolateRight: 'clamp' });
  const llega = f > 60;
  return (
    <AbsoluteFill>
      <Estacionamiento frame={f} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${280 + x},1470) scale(1.0)`}><Persona frame={f} animo={1} camina={!llega} /></g>
      </svg>
      <Confeti frame={Math.max(0, f - 6)} />
      <Subtitulo palabras={[['Menos', 0], ['vueltas,', 1], ['más', 0], ['tiempo', 1], ['para', 0], ['ti.', 0]]} desde={S(TIEMPOS.voz[5] - TIEMPOS.parqueadero)} />
    </AbsoluteFill>
  );
};

export const ReelPatente = () => (
  <AbsoluteFill style={{ background: C.marino }}>
    <Sequence from={0} durationInFrames={S(TIEMPOS.telefonoEntra) + 4}><Tienda12 /></Sequence>
    <Sequence from={S(TIEMPOS.telefonoEntra)} durationInFrames={S(TIEMPOS.parqueadero) - S(TIEMPOS.telefonoEntra) + 2}><Telefono /></Sequence>
    <Sequence from={S(TIEMPOS.parqueadero)} durationInFrames={S(TIEMPOS.total) - S(TIEMPOS.parqueadero)}><Final /></Sequence>
  </AbsoluteFill>
);
export const REEL_PATENTE_FRAMES = S(TIEMPOS.total);
