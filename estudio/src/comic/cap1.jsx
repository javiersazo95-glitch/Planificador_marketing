// Capitulo 1 «El diagnostico del cunado» (serie «El auto de Seba»). Se aprueba escena por escena.
// Referencias: la persona se inclina desde el frente del auto, con el capo levantado atras.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CunadoInclinado, SebaRasca, SebaCelular, SebaSentado, CataMuestra, LuchoRevisa, CunadoRetrocede } from './perfil.jsx';
import { L, G } from './personaje.jsx';

const FUENTE = "'Plus Jakarta Sans','Segoe UI',Arial,sans-serif";
const AZ = '#0F4EC2', AM = '#F8C805';
const S = { stroke: L, strokeWidth: G, strokeLinejoin: 'round', strokeLinecap: 'round' };

/* ---------- entrada de casa ---------- */
export const Entrada = () => (
  <g {...S}>
    <rect x={0} y={0} width={1080} height={1920} fill="#BFE0F7" stroke="none" />
    <g fill="#fff" stroke="none" opacity={0.8}><ellipse cx={900} cy={190} rx={130} ry={42} /><ellipse cx={960} cy={160} rx={80} ry={44} /></g>
    {/* arbol */}
    <rect x={950} y={880} width={46} height={450} fill="#8A5B34" />
    <path d="M870 900 C780 880 790 760 880 750 C870 650 1010 620 1050 710 C1150 700 1170 850 1080 880 C1090 960 980 990 940 930 C920 960 860 950 870 900 Z" fill="#5E9E5A" />
    {/* casa */}
    <rect x={-20} y={720} width={850} height={620} fill="#F4D9A6" />
    <path d="M-30 730 L-30 610 L760 610 L880 730 Z" fill="#B85C45" />
    <path d="M60 612 L60 728 M200 612 L220 728 M340 612 L372 728 M480 612 L525 728 M620 612 L680 728" strokeWidth={5} opacity={0.5} fill="none" />
    <rect x={50} y={810} width={420} height={530} fill="#D9DEE8" />
    {[890, 970, 1050, 1130, 1210].map((y) => <path key={y} d={`M50 ${y} H470`} strokeWidth={5} />)}
    <rect x={560} y={830} width={190} height={200} fill="#33507A" /><path d="M655 830 V1030 M560 930 H750" fill="none" />
    {/* piso */}
    <rect x={-20} y={1340} width={1120} height={600} fill="#B9BECA" />
    <path d="M-20 1450 H1100 M200 1340 L40 1930 M760 1340 L900 1930" fill="none" strokeWidth={5} opacity={0.28} />
  </g>
);

/* ---------- auto de lado, capo levantado. (0,0) = suelo bajo el parachoques delantero; mira a la derecha ---------- */
export const AutoCapo = ({ color = '#3F86C9', sombra = '#2F6DA8' }) => (
  <g {...S}>
    <ellipse cx={-520} cy={4} rx={640} ry={34} fill={L} opacity={0.22} stroke="none" />
    {/* hueco del motor: queda DENTRO del auto, entre la orilla de atras y la de adelante */}
    <clipPath id="hueco-motor"><path d="M-392 -336 L-386 -382 L-92 -352 L-50 -300 Z" /></clipPath>
    <path d="M-392 -336 L-386 -382 L-92 -352 L-50 -300 Z" fill="#26324F" />
    <g clipPath="url(#hueco-motor)">
      <rect x={-352} y={-360} width={96} height={50} rx={12} fill="#7B8798" />
      {[-338, -312, -286].map((x) => <rect key={x} x={x} y={-366} width={16} height={20} rx={5} fill="#C7CDD8" />)}
      <path d="M-252 -340 C-220 -372 -190 -322 -160 -338" fill="none" strokeWidth={14} />
      <circle cx={-208} cy={-322} r={28} fill="#C7CDD8" /><circle cx={-208} cy={-322} r={10} fill={AM} />
      <rect x={-150} y={-346} width={56} height={46} rx={8} fill="#454C5E" /><rect x={-140} y={-354} width={12} height={14} fill="#E5483A" />
    </g>
    {/* orilla del otro costado */}
    <path d="M-400 -384 L-386 -398 L-96 -368 Q-70 -356 -50 -304 L-92 -352 L-386 -382 Z" fill={color} />
    {/* capo levantado, aprobado: visto de lado se ve angosto. No ensancharlo */}
    <path d="M-392 -362 L-236 -800 Q-214 -830 -186 -806 L-178 -790 L-348 -368 Z" fill={color} />
    <path d="M-366 -384 L-222 -776 L-206 -772 L-350 -392 Z" fill={sombra} strokeWidth={5} />
    <path d="M-72 -318 L-322 -482" fill="none" strokeWidth={16} /><path d="M-72 -318 L-322 -482" fill="none" stroke="#C7CDD8" strokeWidth={6} />
    {/* cabina */}
    <path d="M-1250 -330 L-1250 -590 Q-1240 -610 -1180 -612 L-640 -612 Q-590 -606 -560 -570 L-388 -338 Z" fill={color} />
    <path d="M-622 -574 Q-596 -572 -576 -548 L-436 -356 L-700 -356 L-700 -574 Z" fill="#CDE8FA" />
    <rect x={-1180} y={-574} width={440} height={218} rx={18} fill="#CDE8FA" />
    <path d="M-660 -540 L-600 -460 M-1120 -540 L-1040 -450" fill="none" stroke="#fff" strokeWidth={12} />
    {/* carroceria */}
    <path d="M-1260 -80 L-1260 -330 Q-1250 -344 -1220 -344 L-392 -340 L-52 -304 Q18 -292 24 -226 L34 -118 Q34 -74 -14 -70 L-80 -70 Q-92 -262 -232 -262 Q-372 -262 -386 -70 Z" fill={color} />
    <path d="M-1260 -130 L-380 -130 L-386 -70 L-1260 -70 Z" fill={sombra} />
    <path d="M-440 -340 L-440 -132 M-720 -340 L-720 -132" fill="none" strokeWidth={5} />
    <rect x={-690} y={-300} width={70} height={18} rx={9} fill="#C7CDD8" />
    <path d="M-452 -356 Q-440 -412 -384 -400 Q-366 -372 -386 -352 Z" fill={sombra} />
    <path d="M-52 -282 Q10 -276 14 -230 L-36 -226 Q-58 -250 -52 -282 Z" fill="#FFF1B8" />
    <path d="M-66 -132 L36 -134 Q48 -76 -10 -70 L-76 -70 Z" fill="#C7CDD8" />
    {/* ruedas: diametro cercano al 40% del alto */}
    {[-233, -1030].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-116} r={120} fill="#26262E" />
        <circle cx={x} cy={-116} r={68} fill="#D9DEE8" />
        {[0, 72, 144, 216, 288].map((r) => <path key={r} d={`M${x} -134 L${x} -170`} transform={`rotate(${r} ${x} -116)`} strokeWidth={15} stroke="#7B8798" />)}
        <circle cx={x} cy={-116} r={20} fill="#7B8798" />
      </g>
    ))}
  </g>
);

/* Cajas de repuestos ya comprados */
const Caja = ({ x, y, rot = 0, n }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} {...S}>
    <rect x={-72} y={-92} width={144} height={92} rx={8} fill="#C99763" />
    <rect x={-16} y={-92} width={32} height={34} fill="#E7C99A" strokeWidth={5} />
    <circle cx={34} cy={-32} r={24} fill="#fff" strokeWidth={5} />
    <text x={34} y={-20} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={34} fill={L} stroke="none">{n}</text>
  </g>
);

/* Globo de dialogo con cola hacia quien habla */
export const Globo = ({ x, y, w, h, cola, children, lineas = null, letra = 56 }) => (
  <g>
    <rect x={x + 9} y={y + 9} width={w} height={h} rx={52} fill={L} />
    <rect x={x} y={y} width={w} height={h} rx={52} fill="#fff" {...S} />
    <path d={`M${cola[0] - 44} ${y + h - 4} L${cola[1]} ${cola[2]} L${cola[0] + 34} ${y + h - 4}`} fill="#fff" {...S} />
    <rect x={cola[0] - 52} y={y + h - 16} width={92} height={12} fill="#fff" />
    {(lineas || [children]).map((t, i, todas) => <text key={i} x={x + w / 2} y={y + h / 2 + letra * 0.36 + (i - (todas.length - 1) / 2) * letra * 1.18} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={letra} fill={L}>{t}</text>)}
  </g>
);

export const Cartel = ({ children, top = 240 }) => (
  <div style={{ position: 'absolute', left: 80, right: 80, top, background: '#FFF9EC', border: `7px solid ${L}`, borderRadius: 30, boxShadow: `10px 10px 0 ${L}`, padding: '20px 30px', fontSize: 60, fontWeight: 800, lineHeight: 1.15, textAlign: 'center' }}>{children}</div>
);

export const Escena1 = () => (
  <AbsoluteFill style={{ fontFamily: FUENTE, color: L }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <Entrada />
      <g transform="translate(726,1480)"><AutoCapo /></g>
      <g transform="translate(868,1500) scale(-1,1)"><CunadoInclinado uid="e1" /></g>
      {/* las tres cajas ya compradas, en primer plano */}
      <ellipse cx={642} cy={1738} rx={190} ry={22} fill={L} opacity={0.18} />
      <Caja x={568} y={1734} rot={-2} n={1} /><Caja x={722} y={1738} rot={3} n={2} /><Caja x={646} y={1643} rot={-5} n={3} />
      <g transform="translate(208,1850) scale(1.0)"><SebaRasca uid="e1" /></g>
      <Globo x={462} y={505} w={560} h={130} cola={[655, 606, 766]}>Es el alternador.</Globo>
    </svg>
    <Cartel>Tres repuestos comprados<br />y <span style={{ color: AZ, fontStyle: 'italic' }}>el auto sigue igual.</span></Cartel>
    <div style={{ position: 'absolute', left: 108, top: 170, background: AM, border: `7px solid ${L}`, padding: '6px 24px', fontSize: 38, fontWeight: 800, transform: 'rotate(-3deg)', boxShadow: `7px 7px 0 ${L}` }}>CAPÍTULO 1</div>
    <div style={{ position: 'absolute', right: 90, top: 450, fontSize: 26, fontWeight: 700, background: '#ffffffcc', padding: '4px 14px', borderRadius: 10 }}>Recreación</div>
  </AbsoluteFill>
);

/* Caja abierta con el repuesto asomado. (0,0) = apoyo en el suelo */
const Repuesto = ({ tipo }) => {
  if (tipo === 'bateria') return (<g><rect x={-62} y={-168} width={124} height={90} rx={10} fill="#454C5E" /><rect x={-46} y={-188} width={26} height={22} rx={5} fill="#E5483A" /><rect x={20} y={-188} width={26} height={22} rx={5} fill="#C7CDD8" /><path d="M-62 -140 H62" fill="none" strokeWidth={5} /></g>);
  if (tipo === 'bujias') return (<g>{[-44, 0, 44].map((x, i) => (<g key={x} transform={`translate(${x},-112) rotate(${(i - 1) * 14})`}><rect x={-5} y={-92} width={10} height={20} rx={3} fill="#C7CDD8" strokeWidth={5} /><rect x={-11} y={-74} width={22} height={36} rx={7} fill="#fff" strokeWidth={5} /><rect x={-18} y={-40} width={36} height={22} rx={4} fill="#9AA6BA" strokeWidth={5} /><rect x={-11} y={-18} width={22} height={30} fill="#7B8798" strokeWidth={5} /></g>))}</g>);
  return (<g><rect x={-58} y={-178} width={116} height={100} rx={14} fill="#FFF1B8" />{[-38, -19, 0, 19, 38].map((x) => <path key={x} d={`M${x} -170 V-96`} fill="none" strokeWidth={5} />)}<rect x={-64} y={-190} width={128} height={22} rx={9} fill="#E5483A" /></g>);
};
const CajaAbierta = ({ x, y, n, tipo, s = 1, rot = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${rot})`} {...S}>
    <ellipse cx={0} cy={2} rx={124} ry={18} fill={L} opacity={0.18} stroke="none" />
    <path d="M-92 -110 L-128 -150 L-70 -146 L-62 -110 Z M92 -110 L128 -150 L70 -146 L62 -110 Z" fill="#B9854F" />
    <path d="M-92 -110 L-76 -132 H76 L92 -110 Z" fill="#6B4A2B" />
    <Repuesto tipo={tipo} />
    <rect x={-92} y={-110} width={184} height={110} rx={8} fill="#C99763" />
    <circle cx={0} cy={-52} r={32} fill="#fff" strokeWidth={5} />
    <text x={0} y={-37} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={44} fill={L} stroke="none">{n}</text>
  </g>
);

/* Boleta de compra, sin cifras */
const Boleta = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} {...S}>
    <path d="M-40 -64 H40 V56 L27 46 L13 58 L0 46 L-13 58 L-27 46 L-40 58 Z" fill="#fff" strokeWidth={5} />
    <path d="M-22 -40 H22 M-22 -20 H12 M-22 0 H22 M-22 20 H6" fill="none" strokeWidth={5} opacity={0.6} />
  </g>
);

export const Escena2 = () => (
  <AbsoluteFill style={{ fontFamily: FUENTE, color: L }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <Entrada />
      {/* al fondo, el cunado sigue metido en el motor */}
      <g transform="translate(784,1420) scale(0.8)"><AutoCapo /></g>
      <g transform="translate(898,1436) scale(-0.8,0.8)"><CunadoInclinado uid="e2" /></g>
      <CajaAbierta x={900} y={1622} n={3} tipo="filtro" s={0.95} rot={3} />
      <g transform="translate(330,1832) scale(1.42)"><SebaSentado uid="e2" /></g>
      <Boleta x={640} y={1650} rot={-24} s={0.9} /><Boleta x={575} y={1868} rot={72} />
      <CajaAbierta x={750} y={1852} n={1} tipo="bateria" s={1.04} rot={-3} />
      <CajaAbierta x={944} y={1874} n={2} tipo="bujias" s={1.0} rot={4} />
      <Globo x={90} y={490} w={600} h={140} cola={[300, 340, 720]}>Ya cambié… tres.</Globo>
    </svg>
    <Cartel top={200}>Batería, bujías, filtro…<br /><span style={{ color: AZ, fontStyle: 'italic' }}>y nada.</span></Cartel>
    <div style={{ position: 'absolute', right: 90, top: 410, fontSize: 26, fontWeight: 700, background: '#ffffffcc', padding: '4px 14px', borderRadius: 10 }}>Recreación</div>
  </AbsoluteFill>
);

/* pantalla = captura real de Fallas (data URI). Sale ampliada, como zoom del celular de Cata */
export const Escena3 = ({ pantalla }) => (
  <AbsoluteFill style={{ fontFamily: FUENTE, color: L }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <Entrada />
      <g transform="translate(868,1850) scale(-0.95,0.95)"><SebaRasca expresion="sorpresa" uid="e3" /></g>
      <g transform="translate(262,1850) scale(1.12)"><CataMuestra uid="e3" /></g>
      <Globo x={396} y={745} w={634} h={240} letra={47} cola={[500, 418, 1128]} lineas={['Cuenta la falla en', 'RepuesTop antes de', 'comprar otro repuesto.']} />
    </svg>
    <div style={{ position: 'absolute', left: 70, top: 180, width: 920, border: `10px solid ${L}`, borderRadius: 42, overflow: 'hidden', background: '#fff', boxShadow: `12px 12px 0 ${L}`, lineHeight: 0 }}>
      <img src={pantalla} style={{ width: 920, display: 'block' }} />
    </div>
    <div style={{ position: 'absolute', left: 110, top: 652, background: AM, border: `7px solid ${L}`, padding: '4px 24px', fontSize: 36, fontWeight: 800, transform: 'rotate(-2deg)', boxShadow: `7px 7px 0 ${L}` }}>repuestop.cl/fallas</div>
    <div style={{ position: 'absolute', right: 70, top: 112, fontSize: 26, fontWeight: 700, background: '#ffffffcc', padding: '4px 14px', borderRadius: 10 }}>Recreación</div>
  </AbsoluteFill>
);

/* Seba publica la falla y le llega el diagnostico (pantallas reales de la version de pruebas) */
const Pantalla = ({ src, left, top, width }) => (
  <div style={{ position: 'absolute', left, top, width, border: `9px solid ${L}`, borderRadius: 36, overflow: 'hidden', background: '#fff', boxShadow: `11px 11px 0 ${L}`, lineHeight: 0 }}>
    <img src={src} style={{ width, display: 'block' }} />
  </div>
);
const Paso = ({ left, top, giro = -2, children }) => (
  <div style={{ position: 'absolute', left, top, background: AM, border: `7px solid ${L}`, padding: '6px 26px', fontSize: 40, fontWeight: 800, transform: `rotate(${giro}deg)`, boxShadow: `7px 7px 0 ${L}` }}>{children}</div>
);
export const EscenaApp = ({ falla, diagnostico }) => (
  <AbsoluteFill style={{ fontFamily: FUENTE, color: L }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <Entrada />
      <g transform="translate(250,1885) scale(0.76)"><SebaCelular uid="app" /></g>
      {/* globo con la cola hacia la boca, por el costado */}
      <rect x={529} y={1289} width={500} height={190} rx={52} fill={L} />
      <rect x={520} y={1280} width={500} height={190} rx={52} fill="#fff" {...S} />
      <path d="M524 1346 L398 1396 L524 1410" fill="#fff" {...S} />
      <rect x={518} y={1351} width={14} height={54} fill="#fff" />
      {['¡Ya me llegó', 'un diagnóstico!'].map((t, i) => <text key={t} x={770} y={1366 + i * 62} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={52} fill={L}>{t}</text>)}
    </svg>
    <Pantalla src={falla} left={265} top={245} width={540} />
    <Paso left={110} top={172}>1. Cuento la falla</Paso>
    <Pantalla src={diagnostico} left={180} top={776} width={710} />
    <Paso left={420} top={700} giro={2}>2. Llega el diagnóstico</Paso>
    <div style={{ position: 'absolute', right: 60, top: 90, fontSize: 26, fontWeight: 700, background: '#ffffffcc', padding: '4px 14px', borderRadius: 10 }}>Recreación · ejemplo de prueba</div>
  </AbsoluteFill>
);

/* version sin pantallas: las pantallas se ven despues, desde los ojos de Seba */
export const EscenaCelular = () => (
  <AbsoluteFill style={{ fontFamily: FUENTE, color: L }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <Entrada />
      <g transform="translate(400,1850) scale(1.2)"><SebaCelular uid="cel" /></g>
      <Globo x={440} y={520} w={580} h={190} letra={52} cola={[680, 614, 1062]} lineas={['Voy a contar', 'lo que le pasa.']} />
    </svg>
    <Cartel top={190}>Seba abre RepuesTop<br /><span style={{ color: AZ, fontStyle: 'italic' }}>y cuenta la falla.</span></Cartel>
    <div style={{ position: 'absolute', right: 90, top: 400, fontSize: 26, fontWeight: 700, background: '#ffffffcc', padding: '4px 14px', borderRadius: 10 }}>Recreación</div>
  </AbsoluteFill>
);

/* estrella de golpe y lineas de movimiento */
const Golpe = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} {...S}>
    <path d="M0 -66 L16 -24 L60 -40 L34 -2 L72 22 L26 24 L28 70 L0 34 L-30 62 L-24 18 L-66 10 L-26 -12 L-48 -52 L-10 -26 Z" fill={AM} />
  </g>
);

export const Escena4 = () => (
  <AbsoluteFill style={{ fontFamily: FUENTE, color: L }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <Entrada />
      <g transform="translate(330,1632) scale(0.9)"><AutoCapo /></g>
      <g transform="translate(452,1652) scale(-0.9,0.9)"><LuchoRevisa uid="e4" /></g>
      {/* las cajas salen volando */}
      <CajaAbierta x={968} y={1352} n={3} tipo="filtro" s={0.78} rot={34} />
      <CajaAbierta x={992} y={1540} n={2} tipo="bujias" s={0.76} rot={-38} />
      <CajaAbierta x={952} y={1758} n={1} tipo="bateria" s={0.86} rot={13} />
      <g transform="translate(748,1732) scale(-0.94,0.94)"><CunadoRetrocede uid="e4" /></g>
      <Golpe x={924} y={1422} s={0.7} />
      <path d="M930 1196 q46 -20 94 2 M960 1166 q30 -10 56 2" fill="none" {...S} strokeWidth={8} />
      <Globo x={60} y={490} w={600} h={190} letra={52} cola={[240, 222, 950]} lineas={['Vamos a revisarlo', 'con calma.']} />
      <Globo x={430} y={720} w={590} h={180} letra={50} cola={[760, 782, 950]} lineas={['Yo dije que podía', 'ser eléctrico.']} />
    </svg>
    <Cartel top={200}>Llega Don Lucho,<br /><span style={{ color: AZ, fontStyle: 'italic' }}>el maestro del taller.</span></Cartel>
    <div style={{ position: 'absolute', right: 90, top: 410, fontSize: 26, fontWeight: 700, background: '#ffffffcc', padding: '4px 14px', borderRadius: 10 }}>Recreación</div>
  </AbsoluteFill>
);
