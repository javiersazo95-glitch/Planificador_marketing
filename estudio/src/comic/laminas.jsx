// Laminas del elenco comic: presentacion, expresiones, escena de prueba y recorte transparente.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Personaje, ELENCO_COMIC } from './elenco.jsx';
import { L, EXPRESIONES } from './personaje.jsx';

const FUENTE = "'Plus Jakarta Sans','Segoe UI',Arial,sans-serif";
const AZ = '#0F4EC2', AM = '#F8C805';
const NOMBRES = Object.keys(ELENCO_COMIC);

export const LaminaComic = () => (
  <AbsoluteFill style={{ background: '#FFF6DF', fontFamily: FUENTE, color: L }}>
    <div style={{ position: 'absolute', left: 60, top: 36, fontSize: 70, fontWeight: 800 }}>La pandilla RepuesTop</div>
    <div style={{ position: 'absolute', left: 62, top: 124, fontSize: 30, fontWeight: 600, color: '#3B4A5E' }}>Elenco para cómics y series · propuesta 1 (por aprobar)</div>
    {NOMBRES.map((k, i) => {
      const p = ELENCO_COMIC[k];
      const x = 60 + (i % 3) * 610, y = 196 + Math.floor(i / 3) * 800;
      return (
        <div key={k} style={{ position: 'absolute', left: x, top: y, width: 580, height: 770, background: '#fff', border: `6px solid ${L}`, borderRadius: 34, overflow: 'hidden', boxShadow: `10px 10px 0 ${L}` }}>
          <svg width={568} height={570} viewBox="-330 -1040 660 1085" style={{ display: 'block', background: '#E6EEFB' }}>
            <circle cx={10} cy={-600} r={300} fill={p.color} opacity={0.16} />
            <Personaje quien={k} />
          </svg>
          <div style={{ borderTop: `6px solid ${L}`, height: 188, padding: '12px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 24, height: 24, borderRadius: 12, background: p.color, border: `4px solid ${L}` }} />
              <div style={{ fontSize: 44, fontWeight: 800 }}>{p.nombre}</div>
            </div>
            <div style={{ fontSize: 27, fontWeight: 700, color: '#3B4A5E' }}>{p.rol}</div>
            <div style={{ fontSize: 24, fontWeight: 600, marginTop: 6 }}>Maña: {p.mana}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: AZ }}>Muestra: {p.sirve}</div>
          </div>
        </div>
      );
    })}
  </AbsoluteFill>
);

export const ExpresionesComic = () => {
  const ex = Object.keys(EXPRESIONES);
  return (
    <AbsoluteFill style={{ background: '#FFF6DF', fontFamily: FUENTE, color: L }}>
      <div style={{ position: 'absolute', left: 50, top: 26, fontSize: 56, fontWeight: 800 }}>Caras de cada personaje</div>
      {ex.map((n, j) => <div key={n} style={{ position: 'absolute', left: 280 + j * 270, top: 120, width: 250, textAlign: 'center', fontSize: 28, fontWeight: 800 }}>{n}</div>)}
      {NOMBRES.map((k, i) => (
        <React.Fragment key={k}>
          <div style={{ position: 'absolute', left: 40, top: 270 + i * 270, width: 230, fontSize: 32, fontWeight: 800 }}>{ELENCO_COMIC[k].nombre}</div>
          {ex.map((n, j) => (
            <svg key={n} width={250} height={250} viewBox={k === 'nando' ? '-180 -1030 400 420' : '-200 -980 420 420'} style={{ position: 'absolute', left: 280 + j * 270, top: 170 + i * 270, background: '#E6EEFB', border: `5px solid ${L}`, borderRadius: 24 }}>
              <Personaje quien={k} expresion={n} pose="quieto" uid="cara" />
            </svg>
          ))}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

/* Escena de prueba vertical (reel): asi se veria un capitulo */
const Calle = () => (
  <g stroke={L} strokeWidth={7} strokeLinejoin="round">
    <rect x={0} y={0} width={1080} height={1920} fill="#BFE0F7" stroke="none" />
    {/* edificio */}
    <rect x={-20} y={150} width={330} height={1300} fill="#E8A55C" />
    {[0, 1, 2, 3, 4].map((f) => [0, 1].map((c) => (
      <g key={`${f}-${c}`}><rect x={40 + c * 130} y={240 + f * 200} width={86} height={128} fill="#33507A" /><path d={`M${30 + c * 130} ${378 + f * 200} h106`} strokeWidth={14} /></g>
    )))}
    {/* tienda */}
    <rect x={310} y={330} width={800} height={1120} fill="#F4EBD8" />
    <rect x={380} y={640} width={660} height={810} fill="#2D4A73" />
    <path d="M330 480 L1100 480 L1100 590 L330 590 Z" fill={AZ} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${330 + i * 112} 590 q56 66 112 0 Z`} fill={i % 2 ? '#fff' : AZ} />)}
    <text x={710} y={456} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={62} fill={L} stroke="none">REPUESTOS</text>
    {[0, 1, 2].map((f) => (<g key={f}><path d={`M420 ${830 + f * 170} h580`} strokeWidth={16} />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={440 + i * 112} y={740 + f * 170 + ((i + f) % 3) * 16} width={82} height={82 - ((i + f) % 3) * 16} rx={8} fill={[AM, '#E5483A', '#fff', '#7FB2FF'][(i + f) % 4]} />)}</g>))}
    {/* vereda */}
    <rect x={-20} y={1450} width={1120} height={490} fill="#C9CCD3" />
    <path d="M-20 1560 H1100 M180 1560 L60 1930 M560 1560 L540 1930 M920 1560 L1020 1930" fill="none" strokeWidth={5} opacity={0.35} />
  </g>
);

export const EscenaComic = () => (
  <AbsoluteFill style={{ fontFamily: FUENTE, color: L }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <Calle />
      <g transform="translate(240,1650) scale(0.98)"><Personaje quien="cunado" expresion="canchero" pose="senala" uid="esc" /></g>
      <g transform="translate(850,1665) scale(0.98)"><Personaje quien="seba" expresion="preocupado" pose="quieto" espejo mirada={[0.7, 0]} uid="esc" /></g>
    </svg>
    <div style={{ position: 'absolute', left: 90, right: 90, top: 170, background: '#FFF9EC', border: `7px solid ${L}`, borderRadius: 30, boxShadow: `10px 10px 0 ${L}`, padding: '22px 36px', fontSize: 62, fontWeight: 800, lineHeight: 1.15, textAlign: 'center' }}>
      Tres repuestos comprados y <span style={{ color: AZ, fontStyle: 'italic' }}>el auto sigue igual.</span>
    </div>
    <div style={{ position: 'absolute', left: 70, bottom: 130, background: AM, border: `7px solid ${L}`, padding: '10px 28px', fontSize: 46, fontWeight: 800, boxShadow: `8px 8px 0 ${L}` }}>CAPÍTULO 1</div>
    <div style={{ position: 'absolute', right: 50, bottom: 40, fontSize: 26, fontWeight: 700, background: '#ffffffcc', padding: '4px 14px', borderRadius: 10 }}>Recreación</div>
  </AbsoluteFill>
);

/* Recorte con fondo transparente para armar comics en cualquier editor */
export const RecorteComic = ({ quien = 'seba', expresion = null, pose = null }) => (
  <AbsoluteFill>
    <svg width={900} height={1300} viewBox="-340 -1040 680 1075"><Personaje quien={quien} expresion={expresion} pose={pose} /></svg>
  </AbsoluteFill>
);
