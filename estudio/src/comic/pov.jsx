// Vista desde los ojos de Seba usando la app (POV). Las manos siguen la pose de una referencia (27-nov):
// dos pulgares escribiendo; cada mano es una sola pieza que sostiene el celular desde abajo.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { L, G } from './personaje.jsx';
import { Entrada } from './cap1.jsx';

const FUENTE = "'Plus Jakarta Sans','Segoe UI',Arial,sans-serif";
const AM = '#F8C805';
const S = { stroke: L, strokeWidth: G + 2, strokeLinejoin: 'round', strokeLinecap: 'round' };
const linea = { fill: 'none', ...S };
const PIEL = '#EDB48C', POLERON = '#2E7D6B', PUNO = '#215C4F';

/* pantalla del celular */
const P = { x: 238, y: 348, w: 604, h: 1324 };
const TECLADO_Y = 1201;

const Teclado = () => {
  const filas = [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'], ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫']];
  const tecla = (x, y, w, t, clave, gris = false) => (
    <g key={clave}>
      <rect x={x} y={y} width={w} height={78} rx={11} fill={gris ? '#B7BECD' : '#fff'} />
      <text x={x + w / 2} y={y + 51} textAnchor="middle" fontFamily={FUENTE} fontWeight={600} fontSize={t.length > 1 ? 28 : 36} fill={L}>{t}</text>
    </g>
  );
  return (
    <g>
      <rect x={P.x} y={TECLADO_Y} width={P.w} height={P.y + P.h - TECLADO_Y} fill="#DCE0E9" />
      {filas.map((fila, j) => {
        const y = TECLADO_Y + 22 + j * 96;
        const anchos = fila.map((t) => (t === '⇧' || t === '⌫' ? 74 : 52));
        const total = anchos.reduce((a, b) => a + b, 0) + (fila.length - 1) * 7;
        let x = P.x + (P.w - total) / 2;
        return fila.map((t, i) => { const el = tecla(x, y, anchos[i], t, `${j}-${t}`, anchos[i] > 52); x += anchos[i] + 7; return el; });
      })}
      {tecla(P.x + 12, TECLADO_Y + 310, 100, '123', 'num', true)}
      {tecla(P.x + 122, TECLADO_Y + 310, 340, 'espacio', 'esp')}
      {tecla(P.x + 472, TECLADO_Y + 310, 120, 'intro', 'intro', true)}
    </g>
  );
};

/* mano izquierda: palma y dedos van detras del celular; el pulgar cruza por delante */
const IzqAtras = () => (
  <g {...S}>
    <path d="M40 1850 C62 1690 96 1540 138 1420 C162 1340 196 1262 252 1236 C286 1224 320 1252 330 1300 L330 1690 C296 1740 272 1800 266 1880 Z" fill={PIEL} />
    <path d="M-90 1790 L40 1806 L286 1862 L240 2010 L-90 2010 Z" fill={POLERON} />
    <path d="M30 1804 L286 1862 L270 1914 L14 1856 Z" fill={PUNO} />
  </g>
);
const IzqPulgar = () => (
  <g>
    <path d="M158 1426 C214 1392 282 1372 350 1328 C406 1292 456 1256 488 1282 C516 1310 486 1352 446 1382 C396 1420 356 1444 332 1502 C310 1558 292 1640 236 1706" fill={PIEL} {...S} />
    <path d="M436 1286 C462 1276 484 1288 482 1306" {...linea} strokeWidth={5} />
    <path d="M300 1470 C282 1480 262 1500 252 1524" {...linea} strokeWidth={5} />
  </g>
);
const DerAtras = () => (
  <g {...S}>
    <path d="M836 1096 C896 1106 938 1160 956 1250 C978 1390 1026 1520 1052 1660 C1070 1750 1080 1820 1078 1870 L842 1920 C826 1850 802 1806 756 1780 L750 1160 C768 1112 800 1092 836 1096 Z" fill={PIEL} />
    <path d="M1180 1800 L1082 1812 L826 1872 L876 2010 L1180 2010 Z" fill={POLERON} />
    <path d="M1090 1810 L826 1872 L842 1924 L1106 1862 Z" fill={PUNO} />
  </g>
);
const DerPulgar = () => (
  <g>
    <path d="M936 1508 C882 1476 818 1480 756 1500 C702 1518 640 1530 630 1564 C624 1598 662 1610 704 1604 C744 1600 764 1618 778 1662 C800 1730 836 1786 900 1806" fill={PIEL} {...S} />
    <path d="M668 1544 C648 1546 640 1560 646 1576" {...linea} strokeWidth={5} />
    <path d="M792 1620 C806 1604 826 1594 848 1592" {...linea} strokeWidth={5} />
  </g>
);

export const PovFalla = ({ pantalla }) => (
  <AbsoluteFill style={{ fontFamily: FUENTE, color: L }}>
    {/* el entorno queda desenfocado: la mirada esta en el celular */}
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', filter: 'blur(13px)', transform: 'scale(1.1)' }}>
      <Entrada />
    </svg>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      <IzqAtras />
      <DerAtras />
      {/* celular */}
      <rect x={232} y={342} width={640} height={1360} rx={72} fill={L} opacity={0.25} />
      <rect x={220} y={330} width={640} height={1360} rx={72} fill={L} />
      <clipPath id="pantalla-pov"><rect x={P.x} y={P.y} width={P.w} height={P.h} rx={54} /></clipPath>
      <g clipPath="url(#pantalla-pov)">
        <rect x={P.x} y={P.y} width={P.w} height={P.h} fill="#F4F6F9" />
        {/* captura real del formulario (version de pruebas), con el ejemplo sin enviar */}
        <rect x={P.x} y={P.y} width={P.w} height={62} fill="#fff" />
        <svg x={P.x} y={P.y + 62} width={P.w} height={TECLADO_Y - P.y - 62} viewBox="45 694 660 864" preserveAspectRatio="xMidYMin slice">
          <image href={pantalla} x={0} y={0} width={750} height={1624} />
        </svg>
        <Teclado />
      </g>
      <rect x={470} y={362} width={140} height={30} rx={15} fill={L} />
      {/* toque del pulgar derecho */}
      <circle cx={640} cy={1560} r={58} fill="none" stroke={AM} strokeWidth={9} />
      <IzqPulgar />
      <DerPulgar />
    </svg>
    <div style={{ position: 'absolute', left: 90, top: 170, background: AM, border: `7px solid ${L}`, padding: '10px 34px', fontSize: 54, fontWeight: 800, transform: 'rotate(-2deg)', boxShadow: `8px 8px 0 ${L}` }}>1. Cuento la falla</div>
    <div style={{ position: 'absolute', right: 50, top: 80, fontSize: 26, fontWeight: 700, background: '#ffffffd9', padding: '4px 14px', borderRadius: 10 }}>Recreación · ejemplo de prueba</div>
  </AbsoluteFill>
);
