// Elenco 2D de RepuesTop (animacion plana en codigo). Un solo "Humano" configurable + estados de animo.
// Pies en (0,0); cabeza centrada en (0,-520). Usar dentro de un <svg>.
import React from 'react';
import { C, lerp } from './prueba_patente.jsx';

const ANIMOS = {
  neutro:  { boca: 'M-24 -474 L24 -474', cejaI: 0, cejaD: 0, alzaD: 0, lid: 0 },
  feliz:   { boca: 'M-30 -478 Q0 -438 30 -478 Z', relleno: true, cejaI: 0, cejaD: 0, alzaD: 0, lid: 0, mejillas: 0.8 },
  triste:  { boca: 'M-26 -466 Q0 -494 26 -466', cejaI: -20, cejaD: 20, alzaD: 0, lid: 0.25, ojeras: true },
  cansado: { boca: 'M-22 -470 Q0 -480 22 -470', cejaI: -12, cejaD: 12, alzaD: 0, lid: 0.5, ojeras: true },
  canchero:{ boca: 'M-26 -472 Q8 -462 30 -488', cejaI: 0, cejaD: -4, alzaD: -9, lid: 0.35 },
  sorpresa:{ boca: 'O', cejaI: 8, cejaD: -8, alzaD: -10, lid: 0, ojosGrandes: true },
  timido:  { boca: 'M-24 -470 Q-6 -480 10 -470 Q18 -466 26 -476', cejaI: -16, cejaD: 16, alzaD: 0, lid: 0.1, mejillas: 1 },
};

const Pelo = ({ estilo, color }) => {
  if (estilo === 'atras') return <path d="M-95 -540 C-100 -655 100 -655 95 -540 C80 -600 30 -622 -10 -616 C-55 -610 -88 -586 -95 -540Z" fill={color} />;
  if (estilo === 'entradas') return (<g fill={color}><path d="M-96 -520 C-104 -600 -60 -628 -22 -606 C-40 -590 -78 -576 -96 -520Z" /><path d="M96 -520 C104 -600 60 -628 22 -606 C40 -590 78 -576 96 -520Z" /></g>);
  if (estilo === 'ninguno') return null;
  return <path d="M-96 -532 C-100 -640 90 -650 96 -540 C70 -585 20 -592 -18 -576 C-50 -566 -80 -556 -96 -532Z" fill={color} />;
};

export const Humano = ({
  frame = 0, caminar = false, animo = 'neutro',
  piel = '#F2BE92', pelo = '#5A3A22', peloEstilo = 'corto',
  camisa = C.azul, franja = null, pantalon = C.marino, zapatos = '#fff',
  lentes = false, bigote = false, barba = false, gorra = null, cerveza = false, overol = false, ancho = 1,
}) => {
  const a = ANIMOS[animo] || ANIMOS.neutro;
  const t = frame / 5;
  const paso = caminar ? Math.sin(t * Math.PI) : 0;
  const rebote = caminar ? Math.abs(Math.cos(t * Math.PI)) * 10 : 0;
  const respira = Math.sin(frame / 12) * 3;
  const ropa = overol ? '#2F6FB3' : camisa;
  const ropaPant = overol ? '#2F6FB3' : pantalon;
  return (
    <g transform={`translate(0,${-rebote})`}>
      <ellipse cx={0} cy={0} rx={130 * ancho} ry={22} fill="#000" opacity={0.16} transform={`translate(0,${rebote})`} />
      {/* piernas */}
      {[[-34, 1, ropaPant], [34, -1, ropaPant]].map(([x, s, c], i) => (
        <g key={i} transform={`translate(${x * ancho},-250) rotate(${paso * 24 * s})`}>
          <rect x={-26} y={0} width={52} height={230} rx={22} fill={c} opacity={i ? 0.92 : 1} />
          <ellipse cx={8} cy={236} rx={50} ry={20} fill={zapatos} />
        </g>
      ))}
      {/* brazo de atras */}
      <g transform={`translate(${-82 * ancho},-400) rotate(${-paso * 28})`}>
        <rect x={-20} y={0} width={40} height={170} rx={20} fill={ropa} />
        <circle cx={0} cy={178} r={24} fill={piel} />
      </g>
      {/* torso */}
      <rect x={-92 * ancho} y={-430} width={184 * ancho} height={200} rx={44} fill={ropa} />
      {franja ? <rect x={-92 * ancho} y={-340} width={184 * ancho} height={22} fill={franja} opacity={0.95} /> : null}
      {overol ? (<g><rect x={-60} y={-430} width={22} height={90} fill="#245A93" /><rect x={38} y={-430} width={22} height={90} fill="#245A93" />
        <rect x={-34} y={-360} width={68} height={50} rx={8} fill="#245A93" /><rect x={-20} y={-350} width={40} height={14} rx={4} fill="#fff" /></g>) : null}
      {/* brazo de adelante (con cerveza si corresponde) */}
      <g transform={`translate(${82 * ancho},-400) rotate(${cerveza ? -38 : paso * 28})`}>
        <rect x={-20} y={0} width={40} height={170} rx={20} fill={ropa} />
        <circle cx={0} cy={178} r={24} fill={piel} />
        {cerveza ? (<g transform="translate(-4,150)"><rect x={-18} y={-30} width={36} height={62} rx={7} fill="#E3A82B" /><rect x={-18} y={-12} width={36} height={22} fill="#fff" /><rect x={-18} y={-30} width={36} height={8} rx={4} fill="#C9C9C9" /></g>) : null}
      </g>
      {/* cuello y cabeza */}
      <rect x={-22} y={-452} width={44} height={40} fill={piel} />
      <g transform={`translate(0,${respira * 0.5})`}>
        <circle cx={0} cy={-520} r={92} fill={piel} />
        <ellipse cx={-92} cy={-515} rx={14} ry={22} fill={piel} />
        <ellipse cx={92} cy={-515} rx={14} ry={22} fill={piel} />
        <Pelo estilo={gorra ? 'ninguno' : peloEstilo} color={pelo} />
        {barba ? <path d="M-84 -500 C-84 -420 84 -420 84 -500 C70 -450 -70 -450 -84 -500Z" fill={pelo} opacity={0.85} /> : null}
        {/* ojos */}
        {[-32, 32].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={-520} r={a.ojosGrandes ? 21 : 17} fill="#fff" />
            <circle cx={x + (i ? 3 : -3) + (animo === 'triste' || animo === 'cansado' ? 0 : 0)} cy={-517 + (a.lid ? 3 : 0)} r={a.ojosGrandes ? 6 : 8} fill={C.marino} />
            {a.lid ? <rect x={x - 19} y={-540} width={38} height={20 * a.lid + 4} fill={piel} /> : null}
            {a.ojeras ? <path d={`M${x - 14} -500 Q${x} -494 ${x + 14} -500`} stroke="#B98A6B" strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
          </g>
        ))}
        {/* cejas */}
        <g transform={`translate(-34,-558) rotate(${a.cejaI})`}><rect x={-20} y={-3} width={40} height={7} rx={3} fill={pelo} /></g>
        <g transform={`translate(34,${-558 + a.alzaD}) rotate(${a.cejaD})`}><rect x={-20} y={-3} width={40} height={7} rx={3} fill={pelo} /></g>
        {a.mejillas ? (<g><circle cx={-58} cy={-488} r={13} fill="#F29B8C" opacity={0.4 * a.mejillas} /><circle cx={58} cy={-488} r={13} fill="#F29B8C" opacity={0.4 * a.mejillas} /></g>) : null}
        {/* boca */}
        {a.boca === 'O'
          ? <ellipse cx={0} cy={-470} rx={14} ry={19} fill={C.marino} />
          : <path d={a.boca} stroke={C.marino} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill={a.relleno ? '#fff' : 'none'} />}
        {bigote ? <path d="M-38 -490 Q-18 -508 0 -494 Q18 -508 38 -490 Q18 -484 0 -486 Q-18 -484 -38 -490Z" fill={pelo} /> : null}
        {/* lentes de sol */}
        {lentes ? (<g><rect x={-62} y={-540} width={54} height={40} rx={14} fill="#10131F" /><rect x={8} y={-540} width={54} height={40} rx={14} fill="#10131F" />
          <rect x={-10} y={-530} width={20} height={6} fill="#10131F" /><path d="M-56 -532 L-40 -532" stroke="#fff" strokeOpacity={0.35} strokeWidth={5} strokeLinecap="round" /></g>) : null}
        {/* gorra */}
        {gorra ? (<g><path d="M-98 -540 C-98 -640 98 -640 98 -540 Z" fill={gorra} /><path d="M-98 -542 L118 -542 Q126 -530 100 -528 L-98 -528Z" fill={gorra} opacity={0.9} /><circle cx={0} cy={-600} r={9} fill="#fff" opacity={0.9} /></g>) : null}
      </g>
    </g>
  );
};

/* Retratos de personajes del reel R1 */
export const ELENCO = {
  cunado: { nombre: 'El cuñado', rol: 'El que «sabe de autos»', color: '#E5483A',
    props: { piel: '#E7B089', pelo: '#3D2B1F', peloEstilo: 'atras', camisa: '#F4F1E8', franja: null, pantalon: '#3B4A5E', zapatos: '#6B4A2B', lentes: true, bigote: true, cerveza: true, ancho: 1.12 },
    animos: ['canchero', 'neutro', 'sorpresa', 'timido'] },
  dueno: { nombre: 'El dueño del auto', rol: 'Ya cambió tres alternadores', color: C.azul,
    props: { piel: '#F2BE92', pelo: '#2B2B33', peloEstilo: 'corto', camisa: '#8FB1E8', franja: null, pantalon: C.marino, zapatos: '#fff' },
    animos: ['cansado', 'triste', 'sorpresa', 'feliz'] },
  mecanico: { nombre: 'Mecánico del taller', rol: 'Taller acreditado en la app', color: '#1FA463',
    props: { piel: '#C98E63', pelo: '#2A1A12', peloEstilo: 'corto', gorra: C.amarillo, overol: true, barba: true, zapatos: '#2A2F3C' },
    animos: ['neutro', 'feliz', 'canchero', 'sorpresa'] },
};
