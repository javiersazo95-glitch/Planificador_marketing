// Tomas de R1 rehechas segun referencias: gente inclinada sobre el motor con el capo levantado y planos de detalle
// (manos sobre el tablero, la rueda y el reloj de bencina). Solo el dibujo: textos y subtitulos van en reel_r1.jsx.
import React from 'react';
import { useCurrentFrame, spring } from 'remotion';
import { C, FUENTE, lerp } from './prueba_patente.jsx';
import { Humano } from './personajes.jsx';
import { Perfil } from './perfil.jsx';
import { ELENCO } from './elenco_r1.jsx';

const CUN = ELENCO.cunado.props, DUE = ELENCO.dueno.props;
const PIEL_C = CUN.piel, PIEL_D = DUE.piel;
const FPS = 30;

export const Mano = ({ x, y, rot = 0, manga = '#fff', piel, senala = false, reloj = false, esc = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${esc})`}>
    <rect x={-520} y={-42} width={520} height={84} rx={42} fill={manga} />
    <rect x={-70} y={-42} width={34} height={84} fill="#000" opacity={0.1} />
    {reloj ? <rect x={-34} y={-30} width={30} height={60} rx={8} fill="#10131F" /> : null}
    <ellipse cx={34} cy={0} rx={62} ry={46} fill={piel} />
    {senala ? (<g><rect x={64} y={-17} width={132} height={34} rx={17} fill={piel} /><ellipse cx={34} cy={-40} rx={30} ry={18} fill={piel} transform="rotate(-20 34 -40)" /></g>)
      : (<g>{[-22, 0, 22].map((d) => <circle key={d} cx={76} cy={d} r={19} fill={piel} />)}<ellipse cx={36} cy={-42} rx={32} ry={18} fill={piel} /></g>)}
  </g>
);

/* ---------- auto de lado con el capo levantado (frente a la derecha) ---------- */
export const AutoAbierto = () => (
  <g>
    <ellipse cx={0} cy={0} rx={340} ry={30} fill="#000" opacity={0.22} />
    <path d="M-300 -50 L-300 -150 Q-295 -190 -250 -200 L-170 -205 L-110 -300 Q-100 -320 -70 -320 L130 -320 Q165 -320 180 -295 L200 -212 L305 -200 Q312 -195 312 -140 L312 -50 Z" fill="#E5483A" />
    <path d="M-95 -285 L-148 -208 L-20 -208 L-20 -285Z M5 -285 L5 -208 L150 -208 L116 -283Z" fill="#1B2440" />
    <rect x={-300} y={-90} width={612} height={20} fill="#C23A2E" />
    {/* hueco del motor, visto desde arriba */}
    <path d="M200 -212 L305 -200 L312 -250 L212 -262 Z" fill="#1B2440" />
    <rect x={222} y={-250} width={50} height={32} rx={6} fill="#4A5568" />{[228, 242, 256].map((x) => <rect key={x} x={x} y={-258} width={10} height={14} rx={3} fill="#7B8798" />)}
    <g transform="translate(288,-228)"><circle r={19} fill="#F8C805" /><circle r={13} fill="#E5483A" /><circle r={4} fill="#fff" /></g>
    {/* capo levantado */}
    <path d="M204 -258 L318 -452" stroke="#C23A2E" strokeWidth={30} strokeLinecap="round" />
    <path d="M214 -258 L324 -444" stroke="#7A2A22" strokeWidth={8} strokeLinecap="round" />
    <path d="M330 -440 L318 -214" stroke="#9AA6BA" strokeWidth={6} />
    {[-185, 180].map((x) => (<g key={x}><circle cx={x} cy={-45} r={62} fill="#1B2440" /><circle cx={x} cy={-45} r={30} fill="#9AA6BA" /></g>))}
  </g>
);

/* ---------- Toma 1: el cuñado inclinado sobre el motor ---------- */
export const TomaCapo = ({ Fondo }) => {
  const f = useCurrentFrame();
  const burbuja = spring({ frame: f - 12, fps: FPS, config: { damping: 11, stiffness: 140 } });
  const mete = spring({ frame: f - 4, fps: FPS, config: { damping: 14, stiffness: 90 } });
  const inc = lerp(8, 30, mete);
  const mano = [lerp(70, 66, mete), lerp(120, 63, mete)];
  const sacude = Math.sin(f / 2.6) * 3 * mete;
  return (
    <>
      <Fondo />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(520,1330) scale(1.0)"><AutoAbierto /></g>
        <g transform="translate(655,1385)"><rect x={-60} y={-34} width={120} height={50} rx={8} fill="#B4492F" /><rect x={-60} y={-34} width={120} height={14} rx={6} fill="#8E3722" /><rect x={-14} y={-46} width={28} height={16} rx={6} fill="#10131F" /></g>
        {/* dueño mirando con los brazos cruzados */}
        <g transform="translate(190,1440) scale(0.9)"><Humano {...DUE} mochila={false} boletas={false} brazosCruzados animo="cansado" frame={f} /></g>
        {/* cuñado de perfil mirando a la izquierda, inclinado sobre el motor */}
        <g transform="translate(930,1400) scale(-0.95,0.95)"><Perfil {...CUN} frame={f} inclinacion={inc} manoD={[mano[0] + sacude, mano[1]]} animo="concentrado" manoT={[-40, 160]} /></g>
        {/* lupa sobre el alternador */}
        <g transform={`translate(300,710) scale(${0.5 + burbuja * 0.3})`} opacity={burbuja}>
          <circle r={200} fill="#fff" stroke={C.marino} strokeWidth={10} />
          <rect x={-150} y={-90} width={300} height={190} rx={18} fill="#2A3140" />
          <rect x={-120} y={-60} width={170} height={110} rx={10} fill="#4A5568" />{[-100, -62, -24, 14].map((x) => <rect key={x} x={x} y={-76} width={26} height={30} rx={5} fill="#7B8798" />)}
          <path d="M-100 90 C-30 40 40 40 100 70" stroke="#111" strokeWidth={9} fill="none" />
          <g transform="translate(95,10)"><circle r={54} fill="#F8C805" /><circle r={40} fill="#E5483A" />{[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={Math.cos(a * Math.PI / 180) * 26} cy={Math.sin(a * Math.PI / 180) * 26} r={5} fill="#fff" />)}<circle r={9} fill="#fff" /></g>
          <g transform="translate(40,150)"><rect x={-140} y={-34} width={280} height={64} rx={20} fill={C.amarillo} /><text x={0} y={12} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={40} fill={C.marino}>¿el alternador?</text></g>
        </g>
        <path d="M420 800 Q600 900 760 1040" stroke={C.marino} strokeWidth={6} strokeDasharray="14 12" fill="none" opacity={burbuja} />
      </svg>
    </>
  );
};

/* ---------- tablero (para los planos de detalle) ---------- */
const Tablero = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <defs><linearGradient id="parab2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8EC8FF" /><stop offset="1" stopColor="#E3F1FF" /></linearGradient></defs>
    <rect width={1080} height={820} fill="url(#parab2)" />
    <rect x={0} y={700} width={1080} height={140} fill="#6B7788" /><rect x={90} y={560} width={220} height={150} rx={10} fill="#DDE6F2" /><rect x={760} y={520} width={240} height={190} rx={10} fill="#C7D6EA" />
    <path d="M0 820 Q540 740 1080 820 L1080 1920 L0 1920 Z" fill="#232A3A" />
    <path d="M0 820 Q540 740 1080 820 L1080 856 Q540 778 0 856 Z" fill="#3A4458" />
    {children}
  </svg>
);

/* ---------- Toma 2a: la radio no prende ---------- */
export const TomaRadio = () => {
  const f = useCurrentFrame();
  const aprieta = Math.abs(Math.sin(f / 5)) * 18;
  const parp = Math.floor(f / 6) % 2 === 0;
  return (
    <Tablero>
      {/* rejillas de ventilacion */}
      {[0, 1].map((i) => <g key={i} transform={`translate(${i ? 880 : 200},1040)`}>{[0, 1, 2, 3].map((k) => <rect key={k} x={-70} y={k * 26 - 40} width={140} height={14} rx={7} fill="#10131F" />)}</g>)}
      {/* radio grande */}
      <g transform="translate(540,1240)">
        <rect x={-340} y={-200} width={680} height={400} rx={40} fill="#10131F" /><rect x={-340} y={-200} width={680} height={400} rx={40} fill="none" stroke="#3A4458" strokeWidth={8} />
        <rect x={-290} y={-150} width={400} height={130} rx={18} fill="#1A2232" />
        <text x={-90} y={-62} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={70} fill={parp ? '#3F4A60' : '#2B3447'}>— — —</text>
        <circle cx={220} cy={-80} r={62} fill="#2C3548" /><circle cx={220} cy={-80} r={40} fill="#3A4458" /><rect x={216} y={-110} width={8} height={30} fill="#9AA6BA" />
        {[-250, -150, -50, 50, 150].map((x) => <rect key={x} x={x} y={40} width={80} height={56} rx={14} fill="#2C3548" />)}
        <circle cx={-250 + 40} cy={68} r={10} fill="#E5483A" />
      </g>
      <text x={540} y={880} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={120} fill="#E5483A" opacity={parp ? 1 : 0.35}>?</text>
      {/* mano del dueño apretando el boton */}
      <Mano x={190 + aprieta} y={1310} rot={-8} manga="#8FB1E8" piel={PIEL_D} />
      {/* mano del cuñado señalando con seguridad */}
      <g transform="translate(1080,0) scale(-1,1)"><Mano x={90} y={1020 - Math.sin(f / 7) * 8} rot={12} manga="#F4F1E8" piel={PIEL_C} senala reloj /></g>
    </Tablero>
  );
};

/* ---------- Toma 2c: sin bencina ---------- */
export const TomaBencina = () => {
  const f = useCurrentFrame();
  const parp = Math.floor(f / 6) % 2 === 0;
  const aguja = -84 + Math.sin(f / 3) * 3;
  return (
    <Tablero>
      <g transform="translate(540,1180)">
        <circle r={330} fill="#10131F" stroke="#3A4458" strokeWidth={14} />
        <path d="M-250 70 A260 260 0 0 1 250 70" stroke="#6B7788" strokeWidth={14} fill="none" />
        {[-84, -60, -30, 0, 30, 60, 84].map((a) => <rect key={a} x={-3} y={-262} width={6} height={a % 60 === 0 || Math.abs(a) === 84 ? 40 : 24} fill="#9AA6BA" transform={`rotate(${a} 0 70)`} />)}
        <text x={-230} y={140} fontFamily={FUENTE} fontWeight={800} fontSize={74} fill="#E5483A">E</text>
        <text x={168} y={140} fontFamily={FUENTE} fontWeight={800} fontSize={74} fill="#fff">F</text>
        <g transform={`rotate(${aguja} 0 70)`}><path d="M-8 70 L0 -240 L8 70Z" fill="#E5483A" /></g>
        <circle cx={0} cy={70} r={30} fill="#2C3548" />
        {/* bomba de bencina */}
        <g transform="translate(0,210)" opacity={parp ? 1 : 0.35}><rect x={-34} y={-44} width={52} height={80} rx={8} fill="#F8C805" /><rect x={-24} y={-34} width={32} height={22} rx={3} fill="#10131F" /><path d="M18 -30 L44 -6 L44 28" stroke="#F8C805" strokeWidth={8} fill="none" strokeLinecap="round" /></g>
      </g>
      {/* volante, mano del dueño */}
      <path d="M-80 1760 Q540 1500 1160 1760" stroke="#10131F" strokeWidth={90} fill="none" />
      <g transform="translate(250,1650) rotate(-18) scale(0.9)"><Mano x={0} y={0} rot={0} manga="#8FB1E8" piel={PIEL_D} /></g>
      {/* mano del cuñado señalando el reloj */}
      <g transform="translate(1080,0) scale(-1,1)"><Mano x={110} y={1010 + Math.sin(f / 6) * 8} rot={20} manga="#F4F1E8" piel={PIEL_C} senala reloj /></g>
    </Tablero>
  );
};

/* ---------- Toma 2b: ruido en la rueda (cuñado agachado escuchando) ---------- */
export const TomaRueda = ({ Fondo }) => {
  const f = useCurrentFrame();
  const tiembla = Math.sin(f * 2.1) * 3;
  const ruido = (i) => ({ x: 520 + i * 120 + Math.sin((f + i * 9) / 5) * 8, y: 960 - ((f * 5 + i * 40) % 150), o: 1 - ((f * 5 + i * 40) % 150) / 150 });
  return (
    <>
      <Fondo />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {/* costado del auto */}
        <g transform={`translate(${tiembla},0)`}>
          <path d="M120 1180 L120 940 Q160 880 300 860 L1100 860 L1100 1180 Z" fill="#E5483A" />
          <path d="M120 1070 L1100 1070" stroke="#C23A2E" strokeWidth={26} />
          <circle cx={650} cy={1250} r={290} fill="#1B2440" /><circle cx={650} cy={1250} r={205} fill="#9AA6BA" />
          {[0, 72, 144, 216, 288].map((a) => <rect key={a} x={624} y={1058} width={52} height={150} rx={20} fill="#C9D0DC" transform={`rotate(${a} 650 1250)`} />)}
          <circle cx={650} cy={1250} r={56} fill="#3B4A5E" />
        </g>
        {[0, 1, 2].map((i) => { const r = ruido(i); return <text key={i} x={r.x} y={r.y} opacity={r.o} fontFamily={FUENTE} fontWeight={800} fontSize={74} fill="#E5483A">ñiii…</text>; })}
        {/* cuñado agachado, oreja junto a la rueda */}
        <g transform="translate(150,1760) scale(1.2)"><Perfil {...CUN} frame={f} agachado={0.85} inclinacion={22} manoD={[110, -30]} manoT={[-40, 150]} animo="concentrado" /></g>
      </svg>
    </>
  );
};
