// Poses de PERFIL (vista de lado completa, sin mezclar con vista de frente). Miran a la derecha.
// Pies en (0,0). Para mirar a la izquierda, envolver en scale(-1,1).
import React from 'react';
import { L, G, EXPRESIONES, Mano, Gota, Sombra, Zapato } from './personaje.jsx';

const AM = '#F8C805';
const S = { stroke: L, strokeWidth: G, strokeLinejoin: 'round', strokeLinecap: 'round' };
const linea = { fill: 'none', ...S };

/* contorno de un tramo de brazo o pierna que se adelgaza: circulo A (radio ra) a circulo B (radio rb) */
const puntos = (a, ra, b, rb) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
  const t = Math.atan2(dy, dx), be = Math.acos(Math.max(-1, Math.min(1, (ra - rb) / d)));
  const p = (c, r, g) => `${(c[0] + r * Math.cos(g)).toFixed(1)} ${(c[1] + r * Math.sin(g)).toFixed(1)}`;
  return { a1: p(a, ra, t + be), a2: p(a, ra, t - be), b1: p(b, rb, t + be), b2: p(b, rb, t - be), grande: 2 * be > Math.PI ? 1 : 0 };
};
const tramo = (a, ra, b, rb) => {
  const q = puntos(a, ra, b, rb);
  return `M${q.a1} L${q.b1} A${rb} ${rb} 0 ${q.grande} 0 ${q.b2} L${q.a2} A${ra} ${ra} 0 ${1 - q.grande} 0 ${q.a1} Z`;
};
const mezcla = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/* varias formas que se ven como una sola pieza: primero todos los bordes, encima todos los rellenos */
const Union = ({ formas, color }) => (
  <g>
    {formas.map((d, i) => <path key={`b${i}`} d={d} fill={L} stroke={L} strokeWidth={G * 2} strokeLinejoin="round" />)}
    {formas.map((d, i) => <path key={`r${i}`} d={d} fill={color} />)}
  </g>
);

const Pierna = ({ cadera, rodilla, tobillo, color, zapato, suela, r = [52, 38, 28] }) => (
  <g>
    <Union color={color} formas={[tramo(cadera, r[0], rodilla, r[1]), tramo(rodilla, r[1], tobillo, r[2])]} />
    <Zapato x={tobillo[0]} color={zapato} suela={suela} />
  </g>
);

/* brazo completo. manga: hasta que parte del brazo llega (corta) o si es larga */
const BrazoLado = ({ hombro, codo, muneca, piel, manga, corta, puno, mano, rot = 0, flip = false, tapa = false, r = [38, 27, 19] }) => {
  const formas = [tramo(hombro, r[0], codo, r[1]), tramo(codo, r[1], muneca, r[2])];
  const fin = mezcla(hombro, codo, 0.72);
  const q = puntos(hombro, r[0] + 3, fin, r[1] + 7);
  return (
    <g>
      <Union color={corta ? piel : manga} formas={formas} />
      {corta ? (
        <g>
          <path d={`M${q.a1} L${q.b1} L${q.b2} L${q.a2} A${r[0] + 3} ${r[0] + 3} 0 ${1 - q.grande} 0 ${q.a1} Z`} fill={manga} />
          <path d={`M${q.a1} L${q.b1} L${q.b2} L${q.a2}`} {...linea} />
        </g>
      ) : null}
      {tapa ? <circle cx={hombro[0]} cy={hombro[1]} r={r[0] + G + 1} fill={manga} /> : null}
      {puno ? <path d={tramo(mezcla(codo, muneca, 0.76), r[2] + 5, muneca, r[2] + 3)} fill={puno} {...S} /> : null}
      {mano ? <Mano x={muneca[0]} y={muneca[1]} tipo={mano} rot={rot} piel={piel} flip={flip} /> : null}
    </g>
  );
};

/* un solo ojo, visto de lado */
const Ojo = ({ x, y, rx, ry, e, piel, id, mirada, pestanas = false }) => {
  const tapa = y - ry + 2 * ry * e.parpado;
  const px = x + mirada[0] * (rx - e.pupila - 5), py = y + mirada[1] * (ry - e.pupila - 6) + (e.parpado > 0.3 ? 8 : 0);
  return (
    <g>
      <clipPath id={id}><ellipse cx={x} cy={y} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" />
      <g clipPath={`url(#${id})`}>
        <circle cx={px} cy={py} r={e.pupila} fill={L} />
        <circle cx={px + e.pupila * 0.35} cy={py - e.pupila * 0.35} r={e.pupila * 0.28} fill="#fff" />
        {e.parpado ? <g><rect x={x - rx - 4} y={y - ry - 10} width={rx * 2 + 8} height={tapa - (y - ry - 10)} fill={piel} /><path d={`M${x - rx - 4} ${tapa} L${x + rx + 4} ${tapa}`} {...linea} /></g> : null}
      </g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={L} strokeWidth={G} />
      {pestanas ? <path d={`M${x + rx * 0.6} ${y - ry * 0.78} l14 -15 M${x + rx * 0.9} ${y - ry * 0.45} l18 -8`} {...linea} /> : null}
    </g>
  );
};

const Ceja = ({ x, y, ang, color, w = 62, h = 14 }) => (
  <g transform={`translate(${x},${y}) rotate(${ang})`} fill="none" strokeLinecap="round">
    <path d={`M${-w / 2} 4 Q0 ${-h} ${w / 2} 0`} stroke={L} strokeWidth={h + 9} />
    <path d={`M${-w / 2} 4 Q0 ${-h} ${w / 2} 0`} stroke={color} strokeWidth={h} />
  </g>
);

const OrejaLado = ({ x, y, piel, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={22} ry={31} fill={piel} {...S} />
    <path d="M10 -14 C-10 -22 -14 8 4 14" {...linea} strokeWidth={5} />
  </g>
);

/* boca de perfil, junto al borde de la cara */
const BocaLado = ({ x, y, habla, tipo }) => {
  if (habla !== null) return <path d={`M${x - 30} ${y} L${x + 20} ${y - 8} Q${x + 8} ${y + 8 + habla * 28} ${x - 12} ${y + 4 + habla * 20} Z`} fill="#5A1F2E" {...S} />;
  if (tipo === 'risa') return <path d={`M${x - 36} ${y - 8} Q${x - 8} ${y + 6} ${x + 20} ${y - 8} Q${x + 8} ${y + 28} ${x - 14} ${y + 24} Q${x - 30} ${y + 14} ${x - 36} ${y - 8} Z`} fill="#5A1F2E" {...S} />;
  if (tipo === 'o') return <ellipse cx={x - 18} cy={y} rx={13} ry={18} fill="#5A1F2E" {...S} />;
  if (tipo === 'mueca') return <path d={`M${x - 34} ${y + 6} Q${x - 20} ${y - 8} ${x - 6} ${y + 4} Q${x + 8} ${y + 14} ${x + 20} ${y - 2}`} {...linea} />;
  return <path d={`M${x - 34} ${y - 8} Q${x - 24} ${y + 12} ${x + 20} ${y}`} {...linea} />;
};

/* torso del Cunado de lado, derecho. La cadera queda en (0,-330) */
const TorsoCunado = ({ uid }) => {
  const camisa = '#D9463E';
  const torso = 'M-82 -342 C-124 -420 -118 -540 -58 -598 Q-26 -626 18 -620 C66 -612 82 -560 90 -524 C152 -486 168 -384 118 -318 Q20 -286 -82 -342 Z';
  const flores = [[-70, -470], [40, -430], [-48, -388], [96, -440], [66, -352], [2, -468]];
  return (
    <g>
        <clipPath id={`torso-${uid}`}><path d={torso} /></clipPath>
        <path d={torso} fill={camisa} />
        <g clipPath={`url(#torso-${uid})`}>
          {flores.map(([x, y], i) => (
            <g key={i} transform={`translate(${x},${y}) rotate(${i * 37})`} fill="#FFD9A0">{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx={0} cy={-13} rx={8} ry={13} transform={`rotate(${r})`} />)}<circle r={6} fill={AM} /></g>
          ))}
        </g>
        <path d={torso} {...linea} />
        {/* tapeta y botones por el borde de adelante */}
        <path d="M58 -592 C70 -540 134 -478 134 -396 Q132 -350 106 -318" {...linea} strokeWidth={5} />
        {[[88, -522], [124, -460], [134, -386]].map(([x, y]) => <circle key={y} cx={x + 6} cy={y} r={7} fill="#fff" stroke={L} strokeWidth={4} />)}
        <path d="M-92 -358 Q20 -304 130 -340 L116 -306 Q20 -270 -80 -322 Z" fill="#5A3A22" {...S} />
        <rect x={76} y={-336} width={40} height={32} rx={6} fill={AM} {...S} />
        {/* cuello de la camisa */}
        <path d="M-30 -616 L34 -566 L26 -626 Z" fill={camisa} {...S} />
    </g>
  );
};

/* cabeza del Cunado de perfil. (0,0) = centro de la cabeza */
const CabezaCunado = ({ e, habla, uid, mirada = [0.7, 0.25] }) => {
  const piel = '#D59A6A', pelo = '#241B18';
  return (
    <g>
        <path d="M-96 -14 C-104 -86 -54 -118 4 -116 C62 -114 86 -82 86 -42 L84 -8 C86 22 90 50 100 66 C122 90 108 120 66 122 C20 126 -34 108 -58 82 C-82 62 -94 30 -96 -14 Z" fill={piel} {...S} />
        <path d="M-36 66 C-6 86 22 54 54 62 C80 56 100 70 108 84 C108 108 92 118 62 118 C18 120 -22 102 -36 66 Z" fill={pelo} opacity={0.17} />
        {/* pelo engominado, con patilla */}
        <path d="M-92 36 C-124 -20 -122 -92 -66 -120 C-20 -150 62 -140 84 -86 C58 -100 32 -94 20 -80 C6 -102 -30 -94 -34 -68 C-28 -42 -26 -16 -34 4 L-48 -6 C-62 -16 -78 -4 -72 20 Z" fill={pelo} {...S} />
        <path d="M-88 -78 Q-50 -128 20 -122 M-94 -36 Q-84 -72 -56 -88" {...linea} stroke="#6C5A52" strokeWidth={6} />
        <OrejaLado x={-48} y={18} piel={piel} s={1.1} />
        <Ojo x={46} y={-26} rx={28} ry={36} e={e} piel={piel} id={`ojo-cun-${uid}`} mirada={mirada} />
        <Ceja x={48} y={-66 + e.alza} ang={e.cejaB} color={pelo} h={18} />
        {/* lentes de sol sobre la frente */}
        <g transform="translate(-10,-22)" {...S}><path d="M26 -108 C48 -118 76 -108 86 -94 C84 -76 62 -72 44 -80 C32 -86 26 -96 26 -108 Z" fill="#26324F" /><path d="M30 -104 C-6 -92 -36 -52 -40 2" {...linea} strokeWidth={7} /><path d="M46 -102 L62 -100" stroke="#fff" strokeWidth={5} /></g>
        {/* nariz y bigote */}
        <path d="M80 -14 C100 -4 144 12 140 34 C136 56 104 52 84 46" fill={piel} {...S} />
        <path d="M44 64 C50 40 82 34 98 46 C114 38 132 50 130 76 C116 66 106 76 92 68 C76 80 58 70 44 64 Z" fill={pelo} {...S} />
        <BocaLado x={84} y={92} habla={habla} tipo={e.boca} />
      {e.gota ? <Gota x={96} y={-96} /> : null}
    </g>
  );
};

/* ===================== EL CUNADO inclinado sobre el motor ===================== */
export const CunadoInclinado = ({ expresion = 'canchero', habla = null, inclina = 40, uid = 'p' }) => {
  const e = EXPRESIONES[expresion];
  const piel = '#D59A6A', pelo = '#241B18', camisa = '#D9463E', pant = '#B79B6C', pantAtras = '#9C8158';
  return (
    <g>
      <Sombra rx={200} />
      {/* brazo de atras: se apoya en el borde del auto */}
      <BrazoLado hombro={[150, -460]} codo={[226, -388]} muneca={[208, -314]} piel="#BE855A" manga="#B93931" corta mano="abierta" rot={8} r={[32, 24, 17]} />
      <Pierna cadera={[-26, -322]} rodilla={[-66, -180]} tobillo={[-104, -44]} color={pantAtras} zapato="#653F25" suela="#3D2718" />
      <Union color={pant} formas={['M-86 -330 a82 66 0 1 0 164 0 a82 66 0 1 0 -164 0 Z', 'M-38 -398 C-94 -418 -142 -382 -140 -328 C-138 -276 -102 -248 -58 -254 C-22 -264 18 -300 20 -334 Z', tramo([8, -318], 56, [30, -172], 40), tramo([30, -172], 40, [4, -44], 29)]} />
      <Zapato x={4} color="#7A4E2E" suela="#4F321F" />
      <path d="M-122 -352 L-74 -332 Q-70 -298 -90 -288 Q-118 -294 -122 -352 Z" {...linea} strokeWidth={5} opacity={0.6} />
      <path d="M-90 -252 Q-64 -250 -44 -268" {...linea} strokeWidth={5} />
      {/* cuello */}
      <path d={tramo([160, -512], 46, [248, -570], 40)} fill={piel} {...S} />
      <g transform={`rotate(${inclina} 0 -330)`}><TorsoCunado uid={uid} /></g>
      {/* cabeza de perfil */}
      <g transform="translate(282,-606) rotate(10)"><CabezaCunado e={e} habla={habla} uid={uid} /></g>
      {/* brazo de adelante: apunta dentro del motor */}
      <BrazoLado hombro={[134, -486]} codo={[222, -424]} muneca={[312, -410]} piel={piel} manga={camisa} corta tapa mano="senala" rot={36} r={[34, 25, 18]} />
    </g>
  );
};

/* cabeza de Seba de perfil. (0,0) = centro de la cabeza */
const CabezaSeba = ({ e, habla, uid, mirada = [0.75, -0.2] }) => {
  const piel = '#EDB48C', pelo = '#4A2C1D';
  return (
    <g>
      <path d="M-92 -10 C-96 -84 -44 -118 12 -112 C68 -108 90 -70 88 -28 C86 -4 90 20 88 46 C86 90 58 114 20 114 C-26 112 -52 92 -66 68 C-82 50 -90 22 -92 -10 Z" fill={piel} {...S} />
      <path d="M-82 56 C-126 10 -126 -82 -74 -114 C-72 -150 -22 -162 -4 -140 C28 -170 84 -152 82 -120 C118 -122 120 -98 96 -86 C84 -100 62 -102 40 -96 C16 -82 -12 -88 -24 -62 C-40 -44 -34 -18 -40 -6 C-62 -14 -78 8 -62 32 Z" fill={pelo} {...S} />
      <OrejaLado x={-38} y={14} piel={piel} />
      <Ojo x={46} y={-10} rx={30} ry={40} e={e} piel={piel} id={`ojo-seba-${uid}`} mirada={mirada} />
      <Ceja x={46} y={-56 + e.alza} ang={e.cejaB} color={pelo} />
      <path d="M82 14 C104 20 138 38 128 54 C118 66 98 56 82 52" fill={piel} {...S} />
      <BocaLado x={66} y={80} habla={habla} tipo={e.boca} />
      {e.gota ? <Gota x={106} y={-66} /> : null}
    </g>
  );
};

/* ===================== SEBA de perfil, rascandose la cabeza ===================== */
export const SebaRasca = ({ expresion = 'preocupado', habla = null, uid = 'p' }) => {
  const e = EXPRESIONES[expresion];
  const piel = '#EDB48C', poleron = '#2E7D6B', jean = '#4C6A92';
  return (
    <g>
      <Sombra rx={150} />
      <Pierna cadera={[-18, -356]} rodilla={[-40, -196]} tobillo={[-68, -44]} color="#3D5779" zapato="#B93931" suela="#D9DEE8" r={[44, 33, 25]} />
      <Pierna cadera={[4, -352]} rodilla={[22, -196]} tobillo={[22, -44]} color={jean} zapato="#E5483A" suela="#fff" r={[48, 35, 26]} />
      <path d={tramo([6, -566], 32, [18, -650], 30)} fill={piel} {...S} />
      <BrazoLado hombro={[18, -536]} codo={[56, -444]} muneca={[100, -380]} piel="#D99C78" manga="#215C4F" puno="#1B4D42" mano="abierta" rot={-26} r={[30, 23, 17]} />
      {/* capucha atras */}
      <path d="M-24 -604 C-86 -616 -118 -574 -92 -528 C-70 -504 -40 -520 -20 -552 Z" fill="#256757" {...S} />
      {/* poleron de lado */}
      <path d="M-60 -352 C-84 -430 -92 -520 -56 -574 Q-30 -606 12 -602 C60 -596 76 -540 78 -486 C80 -434 74 -386 68 -346 Q6 -322 -60 -352 Z" fill={poleron} {...S} />
      <path d="M-62 -366 Q6 -338 68 -362 L66 -338 Q6 -314 -58 -342 Z" fill="#215C4F" {...S} />
      <path d="M70 -458 C40 -448 22 -420 18 -382" {...linea} />
      <path d="M-30 -596 Q8 -560 52 -588 Q30 -612 4 -610 Q-18 -610 -30 -596 Z" fill="#256757" {...S} />
      <path d="M42 -576 Q58 -540 52 -496" {...linea} stroke="#fff" strokeWidth={9} />
      {/* cabeza de perfil */}
      <g transform="translate(20,-724) rotate(-4)"><CabezaSeba e={e} habla={habla} uid={uid} /></g>
      {/* brazo de adelante: se rasca la nuca */}
      <BrazoLado hombro={[-14, -540]} codo={[-146, -558]} muneca={[-108, -682]} piel={piel} manga={poleron} puno="#215C4F" mano="abierta" rot={214} flip tapa r={[36, 27, 19]} />
    </g>
  );
};

/* mano mostrando tres dedos, hacia arriba. (0,0) = muneca */
const ManoTres = ({ x, y, piel, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    {[[[-15, -34], [-28, -92]], [[2, -38], [3, -104]], [[17, -32], [33, -86]]].map(([a, b], i) => <path key={i} d={tramo(a, 11, b, 9)} fill={piel} {...S} />)}
    <path d="M-22 6 C-34 -14 -30 -40 -12 -48 C8 -54 28 -42 28 -24 C30 -6 20 10 2 12 C-10 13 -18 12 -22 6 Z" fill={piel} {...S} />
    <path d="M24 -16 C8 -26 -12 -24 -16 -10 C-10 -2 4 -4 20 -2" fill={piel} {...S} />
  </g>
);

/* ===================== SEBA sentado, muestra tres dedos ===================== */
export const SebaSentado = ({ expresion = 'preocupado', habla = null, uid = 'p' }) => {
  const e = EXPRESIONES[expresion];
  const piel = '#EDB48C', poleron = '#2E7D6B', jean = '#4C6A92';
  return (
    <g>
      <Sombra rx={220} />
      {/* caja en la que se sienta */}
      <g {...S}><rect x={-206} y={-164} width={190} height={164} rx={10} fill="#B9854F" /><rect x={-134} y={-164} width={44} height={54} fill="#E7C99A" strokeWidth={5} /></g>
      {/* brazo de atras, apoyado en la rodilla */}
      <BrazoLado hombro={[-52, -392]} codo={[-6, -286]} muneca={[62, -272]} piel="#D99C78" manga="#215C4F" puno="#1B4D42" mano="abierta" rot={-70} r={[30, 23, 17]} />
      <Pierna cadera={[-92, -212]} rodilla={[34, -250]} tobillo={[26, -44]} color="#3D5779" zapato="#B93931" suela="#D9DEE8" r={[46, 36, 25]} />
      <g transform="translate(-96,150) rotate(10 0 -350)">
        <path d={tramo([6, -566], 32, [18, -650], 30)} fill={piel} {...S} />
        <path d="M-24 -604 C-86 -616 -118 -574 -92 -528 C-70 -504 -40 -520 -20 -552 Z" fill="#256757" {...S} />
        <path d="M-60 -352 C-84 -430 -92 -520 -56 -574 Q-30 -606 12 -602 C60 -596 76 -540 78 -486 C80 -434 74 -386 68 -346 Q6 -322 -60 -352 Z" fill={poleron} {...S} />
        <path d="M-62 -366 Q6 -338 68 -362 L66 -338 Q6 -314 -58 -342 Z" fill="#215C4F" {...S} />
        <path d="M-30 -596 Q8 -560 52 -588 Q30 -612 4 -610 Q-18 -610 -30 -596 Z" fill="#256757" {...S} />
        <path d="M42 -576 Q58 -540 52 -496" {...linea} stroke="#fff" strokeWidth={9} />
      </g>
      {/* pierna de adelante, con la cadera */}
      <Union color={jean} formas={['M-150 -214 a54 50 0 1 0 108 0 a54 50 0 1 0 -108 0 Z', tramo([-96, -208], 52, [92, -236], 40), tramo([92, -236], 40, [116, -44], 28)]} />
      <Zapato x={116} color="#E5483A" suela="#fff" />
      <g transform="translate(-6,-560) rotate(2)"><CabezaSeba e={e} habla={habla} uid={uid} mirada={[0.8, -0.1]} /></g>
      {/* brazo de adelante: codo en la rodilla y tres dedos arriba */}
      <BrazoLado hombro={[-72, -392]} codo={[66, -282]} muneca={[196, -352]} piel={piel} manga={poleron} puno="#215C4F" mano={null} tapa r={[36, 27, 19]} />
      <ManoTres x={202} y={-356} piel={piel} rot={14} />
    </g>
  );
};

/* ===================== SEBA de perfil, mira el celular ===================== */
export const SebaCelular = ({ expresion = 'feliz', habla = null, uid = 'p' }) => {
  const e = EXPRESIONES[expresion];
  const piel = '#EDB48C', poleron = '#2E7D6B', jean = '#4C6A92';
  return (
    <g>
      <Sombra rx={150} />
      <Pierna cadera={[-18, -356]} rodilla={[-40, -196]} tobillo={[-68, -44]} color="#3D5779" zapato="#B93931" suela="#D9DEE8" r={[44, 33, 25]} />
      <Pierna cadera={[4, -352]} rodilla={[22, -196]} tobillo={[22, -44]} color={jean} zapato="#E5483A" suela="#fff" r={[48, 35, 26]} />
      <path d={tramo([6, -566], 32, [26, -646], 30)} fill={piel} {...S} />
      <path d="M-24 -604 C-86 -616 -118 -574 -92 -528 C-70 -504 -40 -520 -20 -552 Z" fill="#256757" {...S} />
      <path d="M-60 -352 C-84 -430 -92 -520 -56 -574 Q-30 -606 12 -602 C60 -596 76 -540 78 -486 C80 -434 74 -386 68 -346 Q6 -322 -60 -352 Z" fill={poleron} {...S} />
      <path d="M-62 -366 Q6 -338 68 -362 L66 -338 Q6 -314 -58 -342 Z" fill="#215C4F" {...S} />
      <path d="M-30 -596 Q8 -560 52 -588 Q30 -612 4 -610 Q-18 -610 -30 -596 Z" fill="#256757" {...S} />
      <path d="M42 -576 Q58 -540 52 -496" {...linea} stroke="#fff" strokeWidth={9} />
      {/* cabeza inclinada mirando la pantalla */}
      <g transform="translate(34,-716) rotate(9)"><CabezaSeba e={e} habla={habla} uid={uid} mirada={[0.75, 0.55]} /></g>
      {/* brazo de adelante: codo pegado al cuerpo y el celular a la altura del pecho */}
      <BrazoLado hombro={[-14, -540]} codo={[2, -414]} muneca={[108, -450]} piel={piel} manga={poleron} puno="#215C4F" mano={null} tapa r={[36, 27, 19]} />
      {/* palma bajo el celular */}
      <path d="M104 -470 C128 -488 166 -480 176 -458 C182 -440 160 -428 136 -430 C120 -430 108 -434 102 -440 Z" fill={piel} {...S} />
      {/* celular visto de lado, con la pantalla hacia Seba */}
      <g transform="translate(164,-512) rotate(26)" {...S}>
        <rect x={-23} y={-70} width={46} height={134} rx={14} fill={L} />
        <rect x={-15} y={-58} width={15} height={110} rx={6} fill="#BFE0F7" stroke="none" />
      </g>
      {/* dedos que abrazan el borde de adelante y pulgar sobre la pantalla */}
      {[[180, -492], [174, -468]].map(([x, y]) => <path key={y} d={tramo([x + 14, y], 11, [x - 6, y + 8], 11)} fill={piel} {...S} strokeWidth={5.5} />)}
      <path d={tramo([116, -462], 15, [141, -500], 11)} fill={piel} {...S} strokeWidth={5.5} />
    </g>
  );
};

/* ===================== CATA de perfil, muestra el celular ===================== */
export const CataMuestra = ({ expresion = 'feliz', habla = null, uid = 'p' }) => {
  const e = EXPRESIONES[expresion];
  const piel = '#9A6240', pelo = '#1F1512', pant = '#26324F', sombra = '#D9A900';
  const chaqueta = 'M-48 -330 C-58 -410 -70 -498 -44 -540 Q-26 -568 2 -570 L22 -568 C52 -556 68 -522 66 -486 C64 -448 48 -420 48 -388 L52 -330 Q2 -316 -48 -330 Z';
  return (
    <g>
      <Sombra rx={140} />
      <Pierna cadera={[-12, -328]} rodilla={[-34, -182]} tobillo={[-58, -44]} color="#1A2238" zapato="#D9DEE8" suela="#B93931" r={[34, 26, 19]} />
      {/* pierna de adelante con la cadera, en una sola pieza */}
      <Union color={pant} formas={['M-46 -322 a46 36 0 1 0 92 0 a46 36 0 1 0 -92 0 Z', tramo([6, -318], 40, [16, -182], 28), tramo([16, -182], 28, [14, -44], 21)]} />
      <Zapato x={14} color="#fff" suela="#E5483A" />
      {/* cuello */}
      <path d={tramo([2, -548], 21, [12, -626], 20)} fill={piel} {...S} />
      {/* chaqueta corta cerrada, con pretina, cierre y bolsillo */}
      <path d={chaqueta} fill={AM} {...S} />
      <path d="M-50 -354 Q2 -340 50 -354 L52 -326 Q2 -310 -48 -326 Z" fill={sombra} {...S} />
      <path d="M40 -552 C58 -520 48 -470 38 -430 C30 -400 32 -376 34 -346" {...linea} strokeWidth={5} />
      {/* solapa: una sola pieza, limpia */}
      <path d="M-20 -566 Q2 -556 24 -569 L50 -546 L22 -526 Q12 -548 -20 -566 Z" fill={sombra} {...S} />
      {/* cabeza de perfil */}
      <g transform="translate(14,-694)">
        {/* cola de pelo */}
        <path d="M-84 -78 C-152 -110 -206 -50 -178 18 C-164 52 -176 80 -206 94 C-148 124 -94 82 -100 34 C-106 4 -96 -18 -76 -30 Z" fill={pelo} {...S} />
        <path d="M-86 -10 C-90 -78 -40 -108 10 -104 C62 -100 82 -64 80 -24 C78 -4 82 14 80 40 C76 80 52 108 20 108 C-20 108 -48 90 -62 66 C-76 48 -84 20 -86 -10 Z" fill={piel} {...S} />
        <path d="M-80 42 C-114 6 -112 -88 -56 -116 C-10 -146 66 -128 88 -80 C98 -60 92 -48 82 -42 C70 -70 46 -82 22 -78 C-4 -56 -32 -66 -42 -42 C-56 -20 -46 6 -60 30 Z" fill={pelo} {...S} />
        <path d="M-58 -88 Q-18 -126 44 -110 M-84 -36 Q-80 -62 -64 -78 M-160 -30 Q-154 -62 -118 -70" {...linea} stroke="#5A3F35" strokeWidth={6} />
        {/* colet rojo donde nace la cola */}
        <ellipse cx={-92} cy={-56} rx={14} ry={31} transform="rotate(32 -92 -56)" fill="#E5483A" {...S} />
        <OrejaLado x={-38} y={14} piel={piel} s={0.85} />
        <circle cx={-40} cy={56} r={19} fill="none" stroke={L} strokeWidth={15} /><circle cx={-40} cy={56} r={19} fill="none" stroke={AM} strokeWidth={7} />
        <Ojo x={40} y={-6} rx={27} ry={37} e={e} piel={piel} id={`ojo-cata-${uid}`} mirada={[0.7, 0.05]} pestanas />
        <Ceja x={36} y={-54 + e.alza} ang={e.cejaB} color={pelo} w={50} h={10} />
        <path d="M76 12 C94 18 112 32 102 44 C94 52 82 46 74 44" fill={piel} {...S} />
        <BocaLado x={56} y={72} habla={habla} tipo={e.boca} />
      </g>
      {/* brazo de adelante con el celular a la vista */}
      <BrazoLado hombro={[-4, -508]} codo={[48, -414]} muneca={[136, -438]} piel={piel} manga={AM} puno={sombra} mano={null} tapa r={[29, 22, 16]} />
      {/* cartera: la correa pasa por el hombro y el bolso descansa en la cadera */}
      <path d="M-16 -561 C-40 -536 -56 -470 -64 -388" {...linea} strokeWidth={21} />
      <path d="M-16 -561 C-40 -536 -56 -470 -64 -388" {...linea} stroke="#0F4EC2" strokeWidth={9} />
      <path d="M-112 -388 Q-66 -402 -20 -388 L-14 -328 Q-16 -304 -40 -302 L-92 -302 Q-116 -304 -118 -328 Z" fill="#0F4EC2" {...S} />
      <path d="M-112 -388 Q-66 -402 -20 -388 L-24 -356 Q-66 -330 -108 -356 Z" fill="#0B3C98" {...S} />
      <circle cx={-66} cy={-348} r={9} fill={AM} {...S} strokeWidth={4} />
      {/* mano y celular */}
      <path d="M126 -452 C142 -478 190 -470 196 -444 C192 -418 150 -410 130 -424 Z" fill={piel} {...S} />
      <g transform="translate(184,-490) rotate(9)" {...S}>
        <rect x={-44} y={-82} width={88} height={164} rx={17} fill={L} />
        <rect x={-33} y={-68} width={66} height={134} rx={6} fill="#fff" stroke="none" />
        <rect x={-27} y={-56} width={54} height={40} rx={9} fill="#E5570C" stroke="none" />
        {[0, 1, 2].map((i) => <circle key={i} cx={-18 + i * 18} cy={4} r={7} fill="#0F4EC2" stroke="none" />)}
        <rect x={-27} y={26} width={54} height={14} rx={6} fill="#D9DEE8" stroke="none" />
      </g>
      {[-478, -452].map((y) => <path key={y} d={tramo([222, y], 10, [204, y + 4], 11)} fill={piel} {...S} />)}
      <path d={tramo([142, -438], 15, [170, -466], 11)} fill={piel} {...S} />
    </g>
  );
};

/* mano abierta en alto («yo no fui»): dedos arriba y pulgar hacia el cuerpo. (0,0) = muneca */
const ManoAlto = ({ x, y, piel, rot = 0, s = 1.12 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-16 8 C-20 -6 -26 -10 -36 -18 C-52 -30 -52 -48 -41 -49 C-33 -50 -28 -38 -19 -32 C-22 -48 -22 -66 -13 -69 C-5 -71 -2 -64 -3 -57 C-3 -74 1 -82 8 -81 C16 -80 15 -68 14 -59 C17 -71 25 -75 30 -69 C35 -62 30 -46 29 -34 C29 -16 24 -2 15 8" fill={piel} {...S} strokeWidth={G / s} />
    <path d="M-3 -57 L-3 -42 M14 -59 L13 -43 M-19 -32 Q-12 -22 -14 -12" {...linea} strokeWidth={4} />
  </g>
);

/* mano derecha empunando la matraca. La pose sale de la referencia del usuario (27-nov), pero dibujada con el
   estilo del comic (tres dedos y pulgar, sin unas ni pliegues). Coordenadas de la referencia ampliada: antebrazo hacia la derecha, mango en diagonal, (592,780) = centro del agarre.
   Orden: palma (atras), matraca, y encima pulgar y dedos. Se refleja para que en pantalla quede igual a la foto */
const ManoMatraca = ({ x, y, piel, k = 0.215 }) => {
  const trazo = { fill: piel, ...S, strokeWidth: G / k };
  const fino = { ...linea, strokeWidth: 4.5 / k };
  const dedo = { fill: piel, ...S, strokeWidth: 6 / k };
  const metal = { fill: '#C7CDD8', ...S, strokeWidth: 5 / k };
  return (
    <g transform={`translate(${x},${y}) scale(${-k},${k}) translate(-592,-780)`}>
      {/* palma y muneca: sin borde a la derecha, para unirse con el antebrazo */}
      <path d="M912 741 C868 735 830 718 790 680 C748 642 725 600 665 592 L590 595 C560 605 535 635 520 660 L600 880 L660 950 C700 975 760 962 800 940 C830 920 856 917 880 921" {...trazo} />
      {/* matraca: empunadura, barra, cabeza y dado apoyado en el motor */}
      <g transform="translate(592,780) rotate(-19.7)">
        <rect x={-34} y={230} width={68} height={110} {...metal} />
        <rect x={-210} y={320} width={150} height={60} {...metal} />
        <rect x={-292} y={290} width={110} height={122} rx={20} {...metal} />
        <path d="M-288 334 H-186 M-258 358 V404 M-218 358 V404" {...fino} />
        <rect x={-56} y={-235} width={112} height={510} rx={54} fill="#E5483A" {...S} strokeWidth={5 / k} />
        <circle cx={0} cy={350} r={90} {...metal} />
        <circle cx={0} cy={350} r={38} fill="#7B8798" {...S} strokeWidth={4 / k} />
      </g>
      {/* pulgar cruzando sobre el mango: abierto atras para unirse con la palma */}
      <path d="M722 622 C690 596 638 584 590 592 C545 600 505 640 495 674 C488 704 515 722 548 711 C580 701 602 676 628 664 C645 657 660 657 676 662" {...trazo} />
      {/* tres dedos redondos que envuelven el mango, como las demas manos del comic */}
      <path d={tramo([528, 920], 47, [622, 902], 40)} {...dedo} />
      <path d={tramo([495, 833], 52, [636, 826], 43)} {...dedo} />
      <path d={tramo([492, 742], 52, [598, 766], 41)} {...dedo} />
    </g>
  );
};

/* mano apoyada en la orilla del auto, dedos hacia abajo y juntos */
const ManoApoyada = ({ x, y, piel, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <path d="M-17 -6 C-22 10 -20 28 -17 36 C-15 46 -4 47 -3 38 C-1 50 12 49 13 38 C17 46 28 42 27 32 C28 18 24 4 17 -6" fill={piel} {...S} />
    <path d="M-3 38 L-3 22 M13 38 L12 22" {...linea} strokeWidth={4} />
  </g>
);

/* ===================== EL CUNADO retrocede incomodo y empuja las cajas ===================== */
export const CunadoRetrocede = ({ expresion = 'preocupado', habla = null, uid = 'p' }) => {
  const e = EXPRESIONES[expresion];
  const piel = '#D59A6A', camisa = '#D9463E', pant = '#B79B6C';
  return (
    <g>
      <Sombra rx={200} />
      {/* brazo de atras, mano abierta: «yo no fui» */}
      <BrazoLado hombro={[-14, -528]} codo={[100, -484]} muneca={[160, -566]} piel="#BE855A" manga="#B93931" corta mano={null} r={[31, 23, 16]} />
      <ManoAlto x={160} y={-566} piel="#BE855A" rot={22} s={1.05} />
      <Pierna cadera={[-30, -322]} rodilla={[-70, -178]} tobillo={[-62, -44]} color="#9C8158" zapato="#653F25" suela="#3D2718" />
      <Union color={pant} formas={['M-94 -326 a82 62 0 1 0 164 0 a82 62 0 1 0 -164 0 Z', 'M-56 -392 C-112 -410 -164 -374 -162 -320 C-160 -270 -124 -244 -80 -250 C-42 -260 -4 -294 -2 -328 Z', tramo([8, -318], 56, [74, -190], 40), tramo([74, -190], 40, [96, -68], 29)]} />
      {/* pie de adelante dando el paso hacia atras: se calza sobre el tobillo */}
      <g transform="translate(96,-68) rotate(-16) translate(0,44)"><Zapato x={0} color="#7A4E2E" suela="#4F321F" /></g>
      <path d="M-144 -340 L-96 -320 Q-92 -286 -112 -276 Q-140 -282 -144 -340 Z" {...linea} strokeWidth={5} opacity={0.6} />
      <path d="M-112 -246 Q-86 -244 -64 -262" {...linea} strokeWidth={5} />
      <path d={tramo([-40, -572], 46, [-38, -646], 40)} fill={piel} {...S} />
      <g transform="rotate(-12 0 -330)"><TorsoCunado uid={uid} /></g>
      <g transform="translate(-34,-716) rotate(-6)"><CabezaCunado e={e} habla={habla} uid={uid} mirada={[0.8, -0.1]} /></g>
      <BrazoLado hombro={[-48, -522]} codo={[24, -416]} muneca={[130, -446]} piel={piel} manga={camisa} corta tapa mano={null} r={[34, 25, 18]} />
      <ManoAlto x={130} y={-446} piel={piel} rot={30} s={1.15} />
    </g>
  );
};

/* ===================== DON LUCHO revisa el motor con matraca y dado ===================== */
export const LuchoRevisa = ({ expresion = 'feliz', habla = null, uid = 'p' }) => {
  const e = EXPRESIONES[expresion];
  const piel = '#B9784F', cana = '#D7D9E0', azul = '#0F4EC2', azulSombra = '#0B3C98';
  const torso = 'M-70 -344 C-106 -420 -102 -536 -52 -592 Q-24 -620 16 -612 C60 -602 82 -560 88 -516 C112 -470 112 -396 88 -328 Q12 -302 -70 -344 Z';
  return (
    <g>
      <Sombra rx={200} />
      {/* mecanico derecho: el brazo derecho (el de atras) sale del pecho y trabaja con la matraca */}
      <BrazoLado hombro={[130, -482]} codo={[190, -420]} muneca={[286, -435]} piel="#A66B45" manga="#A66B45" mano={null} r={[32, 25, 21]} />
      {/* boca de la manga corta, asomada por delante del pecho */}
      <path d="M138 -496 C168 -478 190 -464 213 -448 Q221 -423 209 -396 L150 -386 Z" fill="#B7C1D6" {...S} />
      <ManoMatraca x={352} y={-446} piel="#A66B45" />
      <Pierna cadera={[-26, -322]} rodilla={[-62, -180]} tobillo={[-96, -44]} color={azulSombra} zapato="#46362A" suela="#1F1813" />
      <Union color={azul} formas={['M-78 -330 a74 58 0 1 0 148 0 a74 58 0 1 0 -148 0 Z', tramo([8, -318], 54, [32, -172], 40), tramo([32, -172], 40, [8, -44], 30)]} />
      <Zapato x={8} color="#5B4636" suela="#2E241D" />
      <path d={tramo([132, -506], 44, [208, -566], 38)} fill={piel} {...S} />
      <g transform="rotate(34 0 -330)">
        <clipPath id={`torso-lucho-${uid}`}><path d={torso} /></clipPath>
        <path d={torso} fill="#F2F4F8" />
        <g clipPath={`url(#torso-lucho-${uid})`}>
          {/* pechera del overol */}
          <path d="M-120 -428 L14 -428 L30 -522 L130 -522 L130 -280 L-120 -280 Z" fill={azul} {...S} />
          <path d="M44 -520 L-34 -618" {...linea} strokeWidth={36} /><path d="M44 -520 L-34 -618" {...linea} stroke={azul} strokeWidth={22} />
        </g>
        <path d={torso} {...linea} />
        <rect x={50} y={-484} width={13} height={52} rx={4} fill={AM} {...S} strokeWidth={4} />
        <path d="M34 -450 L96 -450 L90 -396 Q64 -384 40 -396 Z" fill={azulSombra} {...S} />
        <circle cx={46} cy={-506} r={11} fill={AM} {...S} strokeWidth={4} />
      </g>
      {/* cabeza de perfil */}
      <g transform="translate(244,-602) rotate(8)">
        <path d="M-92 -10 C-98 -80 -48 -112 6 -110 C66 -108 90 -74 86 -30 C84 -6 88 20 86 46 C82 90 50 114 12 112 C-30 110 -58 90 -70 66 C-86 46 -90 20 -92 -10 Z" fill={piel} {...S} />
        <path d="M-90 -44 C-112 -6 -102 50 -66 68 C-62 44 -40 38 -44 16 C-30 -8 -42 -34 -60 -46 Z" fill={cana} {...S} />
        <OrejaLado x={-44} y={16} piel={piel} s={1.15} />
        <Ojo x={42} y={-6} rx={24} ry={29} e={e} piel={piel} id={`ojo-lucho-${uid}`} mirada={[0.65, 0.35]} />
        <Ceja x={42} y={-42 + e.alza * 0.3} ang={e.cejaB} color={cana} w={56} h={14} />
        {/* gorra */}
        <path d="M-96 -46 C-104 -132 -42 -160 12 -156 C70 -152 96 -112 92 -66 Q4 -88 -96 -46 Z" fill={AM} {...S} />
        <path d="M44 -74 Q112 -98 164 -62 Q162 -44 140 -48 Q96 -68 46 -56 Z" fill="#E0AE00" {...S} />
        <circle cx={22} cy={-116} r={22} fill={azul} {...S} strokeWidth={5} /><path d="M34 -116 L25 -106 L9 -125" {...linea} stroke="#fff" strokeWidth={7} />
        {/* nariz grande y bigote canoso */}
        <path d="M74 -4 C104 -14 146 8 140 38 C132 66 98 60 76 46" fill="#AE6C46" {...S} />
        <path d="M30 60 C40 36 74 34 94 46 C112 36 134 50 134 78 C118 68 108 80 94 70 C76 84 62 70 52 76 C46 70 38 68 30 60 Z" fill={cana} {...S} />
        <BocaLado x={76} y={92} habla={habla} tipo={habla === null ? 'ladeada' : e.boca} />
      </g>
      {/* la mano izquierda (la de adelante) se apoya en la punta del auto, sin tapar la otra */}
      <BrazoLado hombro={[116, -482]} codo={[100, -392]} muneca={[140, -340]} piel={piel} manga="#F2F4F8" corta mano={null} r={[34, 25, 18]} />
      <ManoApoyada x={139} y={-342} piel={piel} rot={-30} />
    </g>
  );
};
