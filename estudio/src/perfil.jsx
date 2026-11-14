// Personaje de PERFIL (mira a la derecha) con inclinacion del torso, agachado y brazos con objetivo.
// Para escenas de accion: revisar el motor, escuchar la rueda. Pies en (0,0). Para mirar a la izquierda: scale(-1,1) afuera.
import React from 'react';
import { C, lerp } from './prueba_patente.jsx';

const rad = (d) => (d * Math.PI) / 180;

// brazo de dos tramos (hombro -> codo -> mano) con grosor redondeado
const Brazo = ({ sx, sy, mx, my, ropa, piel, cuff }) => {
  const dx = mx - sx, dy = my - sy;
  const d = Math.hypot(dx, dy) || 1;
  const ex = (sx + mx) / 2 - (dy / d) * 22, ey = (sy + my) / 2 + (dx / d) * 22 + 10;
  return (
    <g>
      <path d={`M${sx} ${sy} L${ex} ${ey} L${mx} ${my}`} stroke={ropa} strokeWidth={42} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {cuff ? <circle cx={mx - (mx - ex) * 0.12} cy={my - (my - ey) * 0.12} r={25} fill={cuff} /> : null}
      <circle cx={mx} cy={my} r={25} fill={piel} />
    </g>
  );
};

export const Perfil = ({
  frame = 0, inclinacion = 0, agachado = 0, animo = 'neutro',
  piel = '#D49C6D', pelo = '#1E1713', camisa = '#F4F1E8', pantalon = '#3B4A5E', zapatos = '#fff',
  lentes = false, bigote = false, gorra = null, cerveza = false, chalas = false, guaipe = false, ancho = 1,
  manoD = [70, 150], manoT = [-30, 170], cejasGrosor = 11,
}) => {
  const th = rad(inclinacion);
  const L = 190;
  const hipY = lerp(-250, -125, agachado);
  const neck = { x: Math.sin(th) * L, y: hipY - Math.cos(th) * L };
  const hc = { x: neck.x + Math.sin(th) * 82 + 14, y: neck.y - Math.cos(th) * 82 };
  const respira = Math.sin(frame / 11) * 2;
  const knee = { x: lerp(12, 96, agachado), y: lerp(-125, -132, agachado) };
  const tobillo = { x: lerp(12, 30, agachado), y: -22 };
  const sh = { x: neck.x - Math.sin(th) * 6, y: neck.y + Math.cos(th) * 30 };
  const m = {
    neutro: { boca: 'M44 54 Q62 58 76 50', cejaRot: 0, ojo: 8 },
    canchero: { boca: 'M44 54 Q66 56 80 42', cejaRot: -6, ojo: 8 },
    concentrado: { boca: 'M46 56 L76 56', cejaRot: 12, ojo: 7 },
    sorpresa: { boca: 'O', cejaRot: -10, ojo: 7 },
    cansado: { boca: 'M44 58 Q62 50 76 56', cejaRot: 10, ojo: 8 },
  }[animo] || { boca: 'M44 54 Q62 58 76 50', cejaRot: 0, ojo: 8 };
  const caminoPierna = (dx, color, op) => (
    <path d={`M${dx} ${hipY} L${knee.x + dx * 0.3} ${knee.y} L${tobillo.x + dx * 0.3} ${tobillo.y}`} stroke={color} strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={op} />
  );
  const pie = (dx) => (chalas
    ? (<g><rect x={tobillo.x + dx * 0.3 - 18} y={-60} width={36} height={44} rx={13} fill="#fff" /><rect x={tobillo.x + dx * 0.3 - 20} y={-8} width={96} height={12} rx={6} fill="#6B4A2B" /><path d={`M${tobillo.x + dx * 0.3 - 6} -10 Q${tobillo.x + dx * 0.3 + 26} -44 ${tobillo.x + dx * 0.3 + 60} -10`} stroke="#8A5B34" strokeWidth={9} fill="none" strokeLinecap="round" /></g>)
    : <ellipse cx={tobillo.x + dx * 0.3 + 30} cy={-14} rx={58} ry={21} fill={zapatos} />);
  return (
    <g>
      <ellipse cx={30} cy={0} rx={150} ry={22} fill="#000" opacity={0.17} />
      {/* brazo de atras (con cerveza) */}
      <Brazo sx={sh.x} sy={sh.y} mx={sh.x + manoT[0]} my={sh.y + manoT[1]} ropa={camisa} piel={piel} />
      {cerveza ? (<g transform={`translate(${sh.x + manoT[0]},${sh.y + manoT[1] - 6})`}><rect x={-17} y={-34} width={34} height={62} rx={7} fill="#E3A82B" /><rect x={-17} y={-14} width={34} height={22} fill="#fff" /><rect x={-17} y={-34} width={34} height={8} rx={4} fill="#C9C9C9" /></g>) : null}
      {/* piernas */}
      {caminoPierna(-14, pantalon, 0.92)}{pie(-14)}
      {caminoPierna(14, pantalon, 1)}{pie(14)}
      {/* torso */}
      <path d={`M0 ${hipY} L${neck.x} ${neck.y}`} stroke={camisa} strokeWidth={150 * ancho} strokeLinecap="round" />
      {guaipe ? (<g transform={`translate(${neck.x},${neck.y + 24}) rotate(${inclinacion})`}><path d="M-34 -20 L26 -14 L34 70 L-6 62 Z" fill="#E5483A" /><path d="M-26 -8 L28 -2 M-20 14 L30 22 M-14 38 L32 46" stroke="#fff" strokeOpacity={0.55} strokeWidth={5} /></g>) : null}
      {/* cuello */}
      <path d={`M${neck.x} ${neck.y} L${hc.x - 4} ${hc.y + 50}`} stroke={piel} strokeWidth={46} strokeLinecap="round" />
      {/* brazo de adelante */}
      <Brazo sx={sh.x} sy={sh.y} mx={sh.x + manoD[0]} my={sh.y + manoD[1]} ropa={camisa} piel={piel} />
      {/* cabeza de perfil */}
      <g transform={`translate(${hc.x},${hc.y + respira}) rotate(${inclinacion * 0.5})`}>
        <circle r={86} fill={piel} />
        <circle cx={82} cy={10} r={17} fill={piel} />
        <ellipse cx={-14} cy={8} rx={14} ry={24} fill="#000" opacity={0.12} />
        <path d="M-90 6 C-98 -92 72 -110 86 -30 C52 -62 0 -62 -30 -40 C-50 -28 -80 -18 -90 6Z" fill={pelo} />
        {gorra ? (<g><path d="M-92 -18 C-92 -112 92 -112 92 -18 Z" fill={gorra} /><path d="M64 -34 L136 -26 Q140 -14 124 -12 L62 -18Z" fill={gorra} /></g>) : null}
        <circle cx={44} cy={-14} r={15} fill="#fff" /><circle cx={48} cy={-12} r={m.ojo} fill="#2A1A12" />
        <g transform={`translate(46,-44) rotate(${m.cejaRot})`}><rect x={-20} y={-cejasGrosor / 2} width={42} height={cejasGrosor} rx={cejasGrosor / 2} fill={pelo} /></g>
        {m.boca === 'O' ? <ellipse cx={62} cy={52} rx={10} ry={13} fill={C.marino} /> : <path d={m.boca} stroke={C.marino} strokeWidth={7} strokeLinecap="round" fill="none" />}
        {bigote ? <path d="M54 36 Q76 24 98 34 Q78 46 54 42Z" fill={pelo} /> : null}
        {lentes ? (<g><rect x={22} y={-36} width={62} height={38} rx={14} fill="#10131F" /><path d="M22 -20 L-16 -12" stroke="#10131F" strokeWidth={7} strokeLinecap="round" /></g>) : null}
      </g>
    </g>
  );
};
