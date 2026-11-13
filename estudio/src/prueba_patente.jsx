// PRUEBA de estilo (10 s): "Recorriste tiendas toda la manana..." -> busqueda por patente.
// Animacion 2D plana hecha en codigo (Remotion). Grabacion real de pantalla desde el entorno dev (patente de prueba ABCD11).
import React from 'react';
import { AbsoluteFill, Sequence, OffthreadVideo, staticFile, useCurrentFrame, interpolate, spring } from 'remotion';

const C = { azul: '#0F4EC2', marino: '#1B2440', gris: '#3B4A5E', amarillo: '#F8C805', blanco: '#FFFFFF' };
const FUENTE = "'Plus Jakarta Sans','Segoe UI',Arial,sans-serif";
const FPS = 30;
export const PRUEBA_FRAMES = 300;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/* ---------- Fondo de tienda (se desplaza para simular que camina) ---------- */
const CAJAS = ['#F8C805', '#E5483A', '#FFFFFF', '#1B2440', '#7FB2FF', '#F8C805', '#FFFFFF'];
const Estante = ({ x }) => {
  const filas = [0, 1, 2, 3];
  return (
    <g transform={`translate(${x},0)`}>
      <rect x={0} y={420} width={20} height={780} fill={C.azul} />
      <rect x={500} y={420} width={20} height={780} fill={C.azul} />
      {filas.map((f) => (
        <g key={f}>
          <rect x={0} y={560 + f * 170} width={520} height={14} fill="#0A3A93" />
          {[0, 1, 2, 3, 4].map((i) => {
            const w = 70 + ((i + f) % 3) * 12;
            const h = 90 + ((i * 7 + f * 3) % 4) * 14;
            return <rect key={i} x={36 + i * 92} y={560 + f * 170 - h} width={w} height={h} rx={6} fill={CAJAS[(i + f * 2) % CAJAS.length]} />;
          })}
        </g>
      ))}
    </g>
  );
};
const Letrero = ({ x, texto }) => (
  <g transform={`translate(${x},120)`}>
    <rect x={30} y={-130} width={6} height={130} fill={C.gris} />
    <rect x={434} y={-130} width={6} height={130} fill={C.gris} />
    <rect x={0} y={0} width={470} height={110} rx={14} fill="#E5483A" />
    <text x={235} y={76} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={64} fill="#fff">{texto}</text>
  </g>
);
const Tienda = ({ frame }) => {
  const periodo = 1080;
  const dx = -((frame * 5) % periodo);
  const bloque = (off) => (
    <g transform={`translate(${off},0)`}>
      <Estante x={0} />
      <Estante x={540} />
      <Letrero x={20} texto="FILTROS" />
      <Letrero x={560} texto="FRENOS" />
    </g>
  );
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill="#DCE5F2" />
      <rect y={1200} width={1080} height={720} fill="#B4C0D4" />
      <rect y={1190} width={1080} height={14} fill="#9BA9C0" />
      <g transform={`translate(${dx},0)`}>{bloque(0)}{bloque(periodo)}{bloque(periodo * 2)}</g>
      {/* piso: lineas de perspectiva suaves */}
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={0} y={1290 + i * 130} width={1080} height={4} fill="#A5B2C8" opacity={0.7} />)}
    </svg>
  );
};

/* ---------- Personaje ---------- */
const Persona = ({ frame, animo, camina }) => {
  const t = frame / 5; // ritmo de pasos
  const paso = camina ? Math.sin(t * Math.PI) : 0;
  const rebote = camina ? Math.abs(Math.cos(t * Math.PI)) * 10 : 0;
  const respira = Math.sin(frame / 12) * 3;
  const pelo = '#5A3A22';
  const piel = '#F2BE92';
  const camisa = C.azul;
  const m = clamp01(animo);
  const mouthCtrl = lerp(-503, -443, m);
  const brow = (1 - m) * 20;
  return (
    <g transform={`translate(0,${-rebote + respira * 0.3})`}>
      <ellipse cx={0} cy={0} rx={130} ry={22} fill="#000" opacity={0.16} transform={`translate(0,${rebote})`} />
      {/* piernas */}
      <g transform={`translate(-34,-250) rotate(${paso * 24})`}>
        <rect x={-26} y={0} width={52} height={230} rx={22} fill={C.marino} />
        <ellipse cx={8} cy={236} rx={50} ry={20} fill="#fff" />
      </g>
      <g transform={`translate(34,-250) rotate(${-paso * 24})`}>
        <rect x={-26} y={0} width={52} height={230} rx={22} fill="#27325A" />
        <ellipse cx={8} cy={236} rx={50} ry={20} fill="#fff" />
      </g>
      {/* brazo atras */}
      <g transform={`translate(-82,-400) rotate(${-paso * 28})`}>
        <rect x={-20} y={0} width={40} height={170} rx={20} fill={camisa} />
        <circle cx={0} cy={178} r={24} fill={piel} />
      </g>
      {/* torso */}
      <rect x={-92} y={-430} width={184} height={200} rx={44} fill={camisa} />
      <rect x={-92} y={-340} width={184} height={22} fill={C.amarillo} opacity={0.95} />
      {/* brazo adelante */}
      <g transform={`translate(82,-400) rotate(${paso * 28})`}>
        <rect x={-20} y={0} width={40} height={170} rx={20} fill={camisa} />
        <circle cx={0} cy={178} r={24} fill={piel} />
      </g>
      {/* cuello y cabeza */}
      <rect x={-22} y={-452} width={44} height={40} fill={piel} />
      <g transform={`translate(0,${respira * 0.5})`}>
        <circle cx={0} cy={-520} r={92} fill={piel} />
        <ellipse cx={-92} cy={-515} rx={14} ry={22} fill={piel} />
        <ellipse cx={92} cy={-515} rx={14} ry={22} fill={piel} />
        <path d="M-96 -532 C-100 -640 90 -650 96 -540 C70 -585 20 -592 -18 -576 C-50 -566 -80 -556 -96 -532Z" fill={pelo} />
        {/* ojos */}
        <circle cx={-32} cy={-520} r={17} fill="#fff" />
        <circle cx={32} cy={-520} r={17} fill="#fff" />
        <circle cx={-29 + (1 - m) * 3} cy={-517 + (1 - m) * 4} r={8} fill={C.marino} />
        <circle cx={35 + (1 - m) * 3} cy={-517 + (1 - m) * 4} r={8} fill={C.marino} />
        {/* cejas */}
        <g transform={`translate(-34,-556) rotate(${-brow})`}><rect x={-20} y={-3} width={40} height={7} rx={3} fill={pelo} /></g>
        <g transform={`translate(34,-556) rotate(${brow})`}><rect x={-20} y={-3} width={40} height={7} rx={3} fill={pelo} /></g>
        {/* mejillas y boca */}
        <circle cx={-58} cy={-488} r={13} fill="#F29B8C" opacity={0.35 + m * 0.4} />
        <circle cx={58} cy={-488} r={13} fill="#F29B8C" opacity={0.35 + m * 0.4} />
        <path d={`M-28 -474 Q0 ${mouthCtrl} 28 -474`} stroke={C.marino} strokeWidth={7} strokeLinecap="round" fill={m > 0.6 ? '#fff' : 'none'} />
      </g>
    </g>
  );
};

/* ---------- Nube con lluvia y ampolleta ---------- */
const Nube = ({ frame, opacidad }) => (
  <g opacity={opacidad}>
    <g fill="#6B7A90">
      <circle cx={-70} cy={0} r={52} /><circle cx={0} cy={-30} r={68} /><circle cx={80} cy={0} r={56} /><rect x={-122} y={0} width={258} height={50} rx={25} />
    </g>
    <g fill="#8393AB" opacity={0.7}><circle cx={0} cy={-34} r={44} /></g>
    {[-80, -30, 20, 70].map((x, i) => {
      const y = ((frame * 9 + i * 23) % 80);
      return <rect key={i} x={x} y={70 + y} width={7} height={26} rx={3} fill="#6AA7FF" opacity={1 - y / 90} />;
    })}
  </g>
);
const Ampolleta = ({ escala }) => (
  <g transform={`scale(${escala})`}>
    <circle cx={0} cy={0} r={80} fill={C.amarillo} opacity={0.28} />
    <circle cx={0} cy={0} r={52} fill={C.amarillo} />
    <rect x={-22} y={44} width={44} height={30} rx={8} fill="#9AA6BA" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={-4} y={-110} width={8} height={30} rx={4} fill={C.amarillo} transform={`rotate(${i * 45})`} />)}
  </g>
);

/* ---------- Subtitulo ---------- */
const Subtitulo = ({ palabras, desde = 0 }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f - desde, fps: FPS, config: { damping: 14, stiffness: 160 } });
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1430, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.85, 1, e)})`, opacity: clamp01(e * 1.4) }}>
      <div style={{ background: 'rgba(27,36,64,0.9)', borderRadius: 30, padding: '26px 38px', fontFamily: FUENTE, fontWeight: 800, fontSize: 62, lineHeight: 1.18, color: '#fff', textAlign: 'center', textWrap: 'balance' }}>
        {palabras.map(([p, hl], i) => <span key={i} style={{ color: hl ? C.amarillo : '#fff' }}>{p}{' '}</span>)}
      </div>
    </div>
  );
};

/* ---------- Escenas ---------- */
const Escena1y2 = () => {
  const f = useCurrentFrame(); // 0..165
  const idea = f >= 135;
  const animo = idea ? interpolate(f, [135, 150], [0, 1], { extrapolateRight: 'clamp' }) : 0;
  const nubeOp = idea ? interpolate(f, [135, 148], [1, 0], { extrapolateRight: 'clamp' }) : interpolate(f, [40, 56], [0, 1], { extrapolateRight: 'clamp' });
  const nubeY = idea ? -interpolate(f, [135, 150], [0, 80]) : 0;
  const bulbo = idea ? spring({ frame: f - 138, fps: FPS, config: { damping: 8, stiffness: 180 } }) : 0;
  const entra = spring({ frame: f, fps: FPS, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <Tienda frame={idea ? 135 + (f - 135) * 0.2 : f} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540,1330) scale(1.12)`}>
          <Persona frame={f} animo={animo} camina={!idea || f < 150} />
          <g transform={`translate(0,${-700 + nubeY})`}><Nube frame={f} opacidad={nubeOp} /></g>
          <g transform={`translate(0,-740)`}><Ampolleta escala={bulbo} /></g>
        </g>
      </svg>
      {/* chapa amarilla de gancho */}
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - entra) * -80}px)`, opacity: entra }}>
        <div style={{ background: C.amarillo, color: C.marino, fontFamily: FUENTE, fontWeight: 800, fontSize: 64, padding: '18px 40px', borderRadius: 999, boxShadow: '0 8px 0 rgba(0,0,0,0.15)' }}>¿Te ha pasado esto?</div>
      </div>
      {!idea ? (
        <Subtitulo palabras={[['¿Recorriste', 0], ['tiendas', 0], ['toda', 0], ['la', 0], ['mañana', 0], ['y', 0], ['no', 1], ['encontraste', 1], ['nada?', 1]]} desde={6} />
      ) : (
        <Subtitulo palabras={[['Hasta', 0], ['que', 0], ['conoces', 0], ['Repuestop', 1]]} desde={138} />
      )}
    </AbsoluteFill>
  );
};

const Telefono = () => {
  const f = useCurrentFrame(); // 0..135 (desde el cuadro 165)
  const sube = spring({ frame: f, fps: FPS, config: { damping: 15, stiffness: 110 } });
  const ancho = 600, alto = 1300;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(16px)', transform: 'scale(1.06)' }}><Tienda frame={170} /></div>
      <AbsoluteFill style={{ background: 'rgba(27,36,64,0.62)' }} />
      <div style={{ position: 'absolute', left: (1080 - ancho) / 2, top: 250 + (1 - sube) * 1500, width: ancho, height: alto, borderRadius: 78, background: '#0B1220', padding: 15, boxShadow: '0 40px 90px rgba(0,0,0,0.45)', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 64, overflow: 'hidden', background: '#fff' }}>
          <Sequence from={0} durationInFrames={100}>
            <OffthreadVideo src={staticFile('busqueda_patente.mp4')} startFrom={Math.round(1.4 * FPS)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          </Sequence>
          <Sequence from={100} durationInFrames={40}>
            <OffthreadVideo src={staticFile('busqueda_patente.mp4')} startFrom={Math.round(8.7 * FPS)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          </Sequence>
        </div>
      </div>
      {f < 55 ? <Subtitulo palabras={[['Pon', 0], ['tu', 0], ['patente', 1]]} desde={8} /> : null}
      {f >= 55 ? <Sequence from={55}><Subtitulo palabras={[['y', 0], ['mira', 0], ['solo', 1], ['lo', 1], ['que', 1], ['le', 1], ['sirve', 1], ['a', 0], ['tu', 0], ['auto', 0]]} /></Sequence> : null}
    </AbsoluteFill>
  );
};

export const PruebaPatente = () => (
  <AbsoluteFill style={{ background: C.marino }}>
    <Sequence from={0} durationInFrames={165}><Escena1y2 /></Sequence>
    <Sequence from={165} durationInFrames={PRUEBA_FRAMES - 165}><Telefono /></Sequence>
  </AbsoluteFill>
);
