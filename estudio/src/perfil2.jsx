// Personaje de PERFIL v2 (mira a la derecha), con anatomia: torso con espalda y pecho, cuello, cabeza de perfil
// (frente, nariz, labios, menton), brazos y piernas de dos tramos con codo y rodilla (cinematica inversa).
// Pies en (0,0). Los objetivos de manos van en coordenadas locales (origen = centro de los pies).
import React from 'react';
import { C, lerp } from './prueba_patente.jsx';

const rad = (d) => (d * Math.PI) / 180;
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

// dos huesos: devuelve codo/rodilla y punta, eligiendo el lado con 'prefer' ('abajo' o 'adelante')
const ik = (sx, sy, tx, ty, l1, l2, prefer) => {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
  const max = l1 + l2 - 0.5, min = Math.abs(l1 - l2) + 0.5;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  if (d < min) d = min;
  const base = Math.atan2(dy, dx);
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const c1 = { x: sx + l1 * Math.cos(base + a), y: sy + l1 * Math.sin(base + a) };
  const c2 = { x: sx + l1 * Math.cos(base - a), y: sy + l1 * Math.sin(base - a) };
  const e = prefer === 'adelante' ? (c1.x > c2.x ? c1 : c2) : (c1.y > c2.y ? c1 : c2);
  return { ex: e.x, ey: e.y, hx: sx + dx, hy: sy + dy };
};

export const Perfil2 = ({
  frame = 0, inclinacion = 20, agachado = 0, animo = 'concentrado',
  piel = '#D49C6D', pelo = '#1E1713', camisa = '#F4F1E8', pantalon = '#3B4A5E', zapatos = '#fff',
  lentes = false, bigote = false, cerveza = false, chalas = false, guaipe = false, canas = false, cejasGrosor = 11,
  manoCerca = [150, -300], manoLejos = [-30, -130], ancho = 1,
}) => {
  const inc = rad(inclinacion);
  const hipY = lerp(-238, -112, agachado);
  const respira = Math.sin(frame / 11) * 1.5;
  // piernas (rodilla hacia adelante)
  const pieCerca = { x: 40 + 18 * agachado, y: -8 }, pieLejos = { x: -12 + 6 * agachado, y: -8 };
  const piernaC = ik(0, hipY, pieCerca.x, pieCerca.y, 120, 118, 'adelante');
  const piernaL = ik(0, hipY, pieLejos.x, pieLejos.y, 120, 118, 'adelante');
  // hombro en el mundo local
  const [shx, shy] = rot(8, -190, inc);
  const sh = { x: shx, y: hipY + shy };
  const brazoC = ik(sh.x, sh.y, manoCerca[0], manoCerca[1], 98, 90, 'abajo');
  const brazoL = ik(sh.x - 6, sh.y + 4, manoLejos[0], manoLejos[1], 98, 90, 'abajo');
  const bocas = {
    neutro: 'M74 49 L88 47', concentrado: 'M74 50 L88 50', canchero: 'M74 49 Q84 52 90 42', cansado: 'M74 52 Q82 48 88 51', sorpresa: 'O',
  };
  const boca = bocas[animo] || bocas.neutro;
  const hueso = (x1, y1, x2, y2, color, w, op = 1) => <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={op} />;
  const pie = (p, k, op) => (chalas
    ? (<g opacity={op}><rect x={p.hx - 22} y={-58} width={42} height={52} rx={14} fill="#fff" /><rect x={p.hx - 24} y={-8} width={104} height={13} rx={6} fill="#6B4A2B" /><path d={`M${p.hx - 8} -8 Q${p.hx + 26} -46 ${p.hx + 62} -8`} stroke="#8A5B34" strokeWidth={10} fill="none" strokeLinecap="round" /></g>)
    : <ellipse cx={p.hx + 26} cy={-14} rx={52} ry={19} fill={zapatos} opacity={op} />);
  return (
    <g>
      <ellipse cx={20} cy={2} rx={130} ry={18} fill="#000" opacity={0.17} />
      {/* brazo de atras (con cerveza) */}
      <g>
        {hueso(sh.x - 6, sh.y + 4, brazoL.ex, brazoL.ey, camisa, 42, 0.88)}
        {hueso(brazoL.ex, brazoL.ey, brazoL.hx, brazoL.hy, piel, 30, 0.9)}
        <circle cx={brazoL.hx} cy={brazoL.hy} r={22} fill={piel} />
        {cerveza ? (<g transform={`translate(${brazoL.hx},${brazoL.hy - 8})`}><rect x={-16} y={-34} width={32} height={60} rx={7} fill="#E3A82B" /><rect x={-16} y={-14} width={32} height={22} fill="#fff" /><rect x={-16} y={-34} width={32} height={8} rx={4} fill="#C9C9C9" /></g>) : null}
      </g>
      {/* piernas */}
      <g>
        {hueso(0, hipY, piernaL.ex, piernaL.ey, pantalon, 54, 0.9)}{hueso(piernaL.ex, piernaL.ey, piernaL.hx, piernaL.hy, pantalon, 48, 0.9)}{pie(piernaL, 0, 1)}
        {hueso(0, hipY, piernaC.ex, piernaC.ey, pantalon, 58)}{hueso(piernaC.ex, piernaC.ey, piernaC.hx, piernaC.hy, pantalon, 50)}<circle cx={piernaC.ex} cy={piernaC.ey} r={27} fill={pantalon} />{pie(piernaC, 1, 1)}
      </g>
      {/* torso, cuello y cabeza (giran con la inclinacion) */}
      <g transform={`translate(0,${hipY}) rotate(${inclinacion})`}>
        <g transform="scale(1,1.12)"><path d={`M${-46 * ancho} 8 C${-62 * ancho} -40 ${-68 * ancho} -100 ${-52 * ancho} -170 C${-44 * ancho} -198 -12 -206 22 -198 C${56 * ancho} -188 ${72 * ancho} -150 ${70 * ancho} -100 C${68 * ancho} -60 ${62 * ancho} -20 ${52 * ancho} 8 Z`} fill={camisa} /></g>
        <path d="M-30 -10 L40 -6" stroke="#000" strokeOpacity={0.08} strokeWidth={14} />
        {guaipe ? (<g transform="translate(0,-14)"><path d="M-26 -198 L26 -192 L16 -112 L-30 -118 Z" fill="#E5483A" /><path d="M-20 -178 L22 -172 M-22 -152 L20 -146 M-24 -128 L18 -122" stroke="#fff" strokeOpacity={0.55} strokeWidth={5} /></g>) : null}
        <path d="M-8 -226 L30 -226 L32 -262 L-4 -262 Z" fill={piel} />
        <path d="M-12 -220 L36 -220 L24 -234 L-2 -234 Z" fill={camisa} stroke="#C9C5B8" strokeWidth={3} />
        {/* cabeza de perfil */}
        <g transform={`translate(14,${-286 + respira}) rotate(${-inclinacion * 0.5}) scale(0.8)`}>
          <path d="M-58 -20 C-62 -72 -24 -96 26 -88 C64 -80 80 -52 80 -26 C80 -14 84 -6 92 6 C98 16 94 24 84 26 C80 27 78 29 78 33 C80 37 78 42 74 44 C78 52 76 60 68 62 C70 72 64 86 50 94 C26 106 -24 100 -48 66 C-62 44 -60 6 -58 -20 Z" fill={piel} />
          <ellipse cx={-14} cy={10} rx={13} ry={22} fill="#000" opacity={0.14} />
          <path d="M-62 -22 C-70 -96 24 -112 64 -70 C40 -74 6 -66 -22 -40 C-34 -26 -50 -14 -62 -22 Z" fill={pelo} />
          <rect x={-34} y={-6} width={14} height={34} rx={6} fill={pelo} opacity={0.85} />
          {canas ? <path d="M-60 -30 C-64 -60 -44 -84 -18 -90 C-34 -64 -46 -44 -60 -30 Z" fill="#C9CCD3" opacity={0.9} /> : null}
          <g transform="translate(58,-56) rotate(-4)"><rect x={-26} y={-cejasGrosor / 2} width={52} height={cejasGrosor} rx={cejasGrosor / 2} fill={pelo} /></g>
          {lentes ? (<g><rect x={30} y={-42} width={58} height={36} rx={13} fill="#10131F" /><path d="M30 -28 L-10 -20" stroke="#10131F" strokeWidth={7} strokeLinecap="round" /><path d="M38 -34 L52 -34" stroke="#fff" strokeOpacity={0.35} strokeWidth={5} strokeLinecap="round" /></g>)
            : (<g><ellipse cx={58} cy={-24} rx={12} ry={9} fill="#fff" /><circle cx={62} cy={-24} r={6} fill="#2A1A12" /></g>)}
          {boca === 'O' ? <ellipse cx={82} cy={50} rx={7} ry={10} fill={C.marino} /> : <path d={boca} stroke={C.marino} strokeWidth={6} strokeLinecap="round" fill="none" />}
          {bigote ? <path d="M72 34 Q88 28 98 36 Q88 46 72 44 Z" fill={pelo} /> : null}
        </g>
      </g>
      {/* brazo de adelante */}
      <g>
        {hueso(sh.x, sh.y, brazoC.ex, brazoC.ey, camisa, 44)}
        {hueso(brazoC.ex, brazoC.ey, brazoC.hx, brazoC.hy, piel, 32)}
        <path d={`M${brazoC.ex} ${brazoC.ey} L${brazoC.ex + (brazoC.hx - brazoC.ex) * 0.22} ${brazoC.ey + (brazoC.hy - brazoC.ey) * 0.22}`} stroke={camisa} strokeWidth={46} strokeLinecap="round" />
        <ellipse cx={brazoC.hx} cy={brazoC.hy} rx={26} ry={22} fill={piel} />
      </g>
    </g>
  );
};
