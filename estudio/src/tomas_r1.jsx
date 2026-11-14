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
const Ventila = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={82} fill="#10131F" /><circle r={82} fill="none" stroke="#3A4458" strokeWidth={8} />
    {[-36, -12, 12, 36].map((k) => <rect key={k} x={-62} y={k - 5} width={124} height={10} rx={5} fill="#2C3548" />)}
    <circle cx={28} cy={-2} r={9} fill="#9AA6BA" />
  </g>
);
const Tablero = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <defs><linearGradient id="parab2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8EC8FF" /><stop offset="1" stopColor="#E3F1FF" /></linearGradient></defs>
    <rect width={1080} height={820} fill="url(#parab2)" />
    <rect x={0} y={700} width={1080} height={140} fill="#6B7788" /><rect x={90} y={560} width={220} height={150} rx={10} fill="#DDE6F2" /><rect x={760} y={520} width={240} height={190} rx={10} fill="#C7D6EA" />
    {/* parabrisas: techo, parantes y espejo */}
    <rect x={0} y={0} width={1080} height={110} fill="#1F2635" />
    <path d="M0 0 L190 0 L80 850 L0 850 Z" fill="#1F2635" /><path d="M1080 0 L890 0 L1000 850 L1080 850 Z" fill="#1F2635" />
    <rect x={532} y={104} width={16} height={46} fill="#10131F" /><rect x={420} y={140} width={240} height={84} rx={18} fill="#10131F" /><rect x={432} y={150} width={216} height={64} rx={12} fill="#4C5A72" />
    {/* tablero */}
    <path d="M0 820 Q540 740 1080 820 L1080 1920 L0 1920 Z" fill="#232A3A" />
    <path d="M0 820 Q540 740 1080 820 L1080 856 Q540 778 0 856 Z" fill="#3A4458" />
    <Ventila x={150} y={1010} /><Ventila x={930} y={1010} />
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
      {/* consola central: botón de balizas, clima, palanca y freno de mano */}
      <g transform="translate(540,1000)"><path d="M0 -42 L40 28 L-40 28 Z" fill="none" stroke="#E5483A" strokeWidth={9} strokeLinejoin="round" /><path d="M0 -20 L20 16 L-20 16 Z" fill="none" stroke="#E5483A" strokeWidth={5} strokeLinejoin="round" /></g>
      <g transform="translate(540,1520)">
        <rect x={-340} y={-30} width={680} height={150} rx={30} fill="#10131F" /><rect x={-340} y={-30} width={680} height={150} rx={30} fill="none" stroke="#3A4458" strokeWidth={6} />
        <rect x={-70} y={-8} width={140} height={46} rx={10} fill="#1A2232" /><text x={0} y={28} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={34} fill="#2A9D5B">22°</text>
        {[-250, -160, 160, 250].map((x) => <g key={x}><circle cx={x} cy={44} r={44} fill="#2C3548" /><circle cx={x} cy={44} r={30} fill="#3A4458" /><rect x={x - 3} y={18} width={6} height={22} fill="#9AA6BA" /></g>)}
        <rect x={-110} y={62} width={50} height={32} rx={10} fill="#2C3548" /><rect x={60} y={62} width={50} height={32} rx={10} fill="#2C3548" />
      </g>
      <g transform="translate(540,1800)">
        <path d="M-150 -80 Q0 -140 150 -80 L190 120 L-190 120 Z" fill="#1A2030" />
        <rect x={-9} y={-120} width={18} height={150} fill="#10131F" /><circle cx={0} cy={-132} r={42} fill="#10131F" /><circle cx={-10} cy={-142} r={12} fill="#3A4458" opacity={0.7} />
        <text x={0} y={70} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={40} fill="#6B7788">P R N D</text>
      </g>
      <g transform="translate(790,1790) rotate(-18)"><rect x={-18} y={-120} width={36} height={170} rx={14} fill="#10131F" /><rect x={-22} y={-132} width={44} height={30} rx={10} fill="#3A4458" /></g>
      {/* guantera, a la derecha */}
      <g transform="translate(940,1560)"><rect x={-140} y={-170} width={280} height={330} rx={40} fill="#1B2232" /><rect x={-140} y={-170} width={280} height={330} rx={40} fill="none" stroke="#3A4458" strokeWidth={6} /><rect x={-40} y={-140} width={80} height={20} rx={10} fill="#3A4458" /></g>
      {/* volante, abajo a la izquierda */}
      <path d="M-120 1980 Q-60 1560 230 1560" stroke="#10131F" strokeWidth={70} fill="none" strokeLinecap="round" />
      <path d="M-120 1980 Q-60 1560 230 1560" stroke="#2C3548" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
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

/* ---------- auto de lado, proporciones reales (frente a la derecha) ---------- */
export const AutoLado = () => (
  <g>
    <ellipse cx={0} cy={2} rx={350} ry={20} fill="#000" opacity={0.22} />
    {/* carroceria */}
    <path d="M-320 -62 L-320 -150 Q-318 -178 -292 -184 L-206 -194 L-152 -264 Q-140 -284 -112 -286 L68 -286 Q100 -286 120 -262 L176 -196 L282 -178 Q318 -168 320 -136 L320 -62 Z" fill="#E5483A" />
    {/* ventanas */}
    <path d="M-196 -198 L-150 -258 Q-146 -266 -132 -266 L-60 -266 L-60 -198 Z" fill="#1B2440" />
    <path d="M-30 -198 L-30 -266 L66 -266 Q80 -266 90 -250 L130 -198 Z" fill="#1B2440" />
    <path d="M-150 -258 L-110 -262" stroke="#fff" strokeOpacity={0.25} strokeWidth={6} strokeLinecap="round" />
    {/* detalles */}
    <path d="M-45 -198 L-45 -76" stroke="#C23A2E" strokeWidth={6} />
    <rect x={-84} y={-176} width={30} height={9} rx={4} fill="#C23A2E" /><rect x={-4} y={-176} width={30} height={9} rx={4} fill="#C23A2E" />
    <path d="M-320 -92 L320 -92" stroke="#C23A2E" strokeWidth={14} />
    <rect x={-320} y={-76} width={640} height={20} rx={8} fill="#8E2B22" />
    <path d="M110 -202 L136 -214 L150 -204 L128 -196 Z" fill="#1B2440" />
    <rect x={296} y={-156} width={26} height={34} rx={10} fill="#F8C805" /><rect x={-322} y={-150} width={14} height={40} rx={6} fill="#B3261E" />
    {/* pasos de rueda y ruedas (diametro real = 0.4 de la altura del auto) */}
    {[-195, 190].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-58} r={72} fill="#10131F" />
        <circle cx={x} cy={-58} r={60} fill="#1B2440" /><circle cx={x} cy={-58} r={38} fill="#9AA6BA" />
        {[0, 72, 144, 216, 288].map((a) => <rect key={a} x={x - 4} y={-92} width={8} height={26} rx={4} fill="#C9D0DC" transform={`rotate(${a} ${x} -58)`} />)}
        <circle cx={x} cy={-58} r={9} fill="#3B4A5E" />
      </g>
    ))}
  </g>
);

/* ---------- Toma 2b: ruido en la rueda (cuñado agachado escuchando) ---------- */
export const TomaRueda = ({ Fondo }) => {
  const f = useCurrentFrame();
  const tiembla = Math.sin(f * 2.1) * 2;
  return (
    <>
      <Fondo />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {/* auto completo, de lado */}
        <g transform={`translate(${520 + tiembla},1340) scale(1.6)`}><AutoLado /></g>
        {/* ñiii saliendo de la rueda delantera */}
        <g transform={`translate(${860 + Math.sin(f * 1.3) * 5},1010) rotate(-7)`}>
          <text textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={92} fill="#fff" stroke="#1B2440" strokeWidth={10} paintOrder="stroke">ñiii…</text>
          {[0, 1, 2].map((k) => <path key={k} d={`M${150 + k * 26} ${-60 + k * -6} q${18 + k * 4} ${28} 0 ${56 + k * 8}`} stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.9 - k * 0.2} />)}
        </g>
        {/* cuñado agachado junto a la rueda delantera, mirando a la derecha, oreja pegada a la llanta */}
        <g transform="translate(575,1700) scale(1.0)"><Perfil {...CUN} frame={f} agachado={0.85} inclinacion={22} manoD={[92, -158]} manoT={[-40, 150]} animo="concentrado" /></g>
      </svg>
    </>
  );
};
