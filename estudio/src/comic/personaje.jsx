// Elenco "comic" de RepuesTop: caricatura plana con borde azul noche, en vista 3/4 (mirando a la derecha).
// Estilo propio: piel de tonos naturales, nariz y cabeza distintas por personaje (no se copia ninguna serie).
// Pies en (0,0). Alto aprox. 900. Usar dentro de un <svg>. Para mirar a la izquierda: espejo={true}.
import React from 'react';

export const L = '#1B2440'; // linea (azul noche de la marca)
const G = 7;                // grosor de linea

export const EXPRESIONES = {
  neutro:     { parpado: 0.22, cejaA: 0,   cejaB: 0,   alza: 0,   pupila: 11, boca: 'recta' },
  feliz:      { parpado: 0.1,  cejaA: -4,  cejaB: 4,   alza: -10, pupila: 12, boca: 'risa' },
  sorpresa:   { parpado: 0,    cejaA: -8,  cejaB: 8,   alza: -18, pupila: 7,  boca: 'o' },
  preocupado: { parpado: 0.12, cejaA: -20, cejaB: 20,  alza: -8,  pupila: 8,  boca: 'mueca', gota: true },
  canchero:   { parpado: 0.48, cejaA: 4,   cejaB: -12, alza: -4,  pupila: 11, boca: 'ladeada' },
  enojado:    { parpado: 0.28, cejaA: 20,  cejaB: -20, alza: 8,   pupila: 9,  boca: 'abajo' },
};

/* Trazo grueso con borde: sirve para brazos y piernas en cualquier pose */
const Tubo = ({ d, color, w }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={L} strokeWidth={w + G * 2} />
    <path d={d} stroke={color} strokeWidth={w} />
  </g>
);

/* Manos de 4 dedos. (0,0) = muneca */
const Mano = ({ x, y, tipo = 'abierta', rot = 0, piel, flip = false }) => {
  const f = {
    abierta: 'M-22 -4 C-30 20 -28 40 -18 48 C-12 54 -6 50 -6 42 C-4 58 12 60 13 44 C18 56 32 50 28 34 C34 28 34 14 26 4 C32 2 46 0 42 -12 C38 -22 24 -14 18 -8 C6 -18 -14 -16 -22 -4 Z',
    puno:    'M-24 -6 C-34 12 -28 36 -10 40 C0 50 22 46 26 32 C38 24 36 2 22 -6 C8 -18 -14 -18 -24 -6 Z',
    pulgar:  'M-24 -6 C-34 12 -28 36 -10 40 C0 50 22 46 26 32 C36 24 36 6 24 -2 L16 -6 C20 -22 22 -42 8 -44 C-6 -46 -4 -26 -8 -14 C-14 -14 -20 -12 -24 -6 Z',
    senala:  'M-24 -6 C-32 12 -26 34 -10 38 C0 46 18 42 22 30 L58 24 C72 22 70 4 56 5 L24 6 C20 -8 6 -16 -6 -14 C-14 -14 -20 -12 -24 -6 Z',
  }[tipo];
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -1 : 1},1)`}>
      <path d={f} fill={piel} stroke={L} strokeWidth={G} strokeLinejoin="round" />
      {tipo === 'puno' || tipo === 'pulgar' ? <path d="M-6 16 Q8 20 22 14 M-6 28 Q6 32 18 28" fill="none" stroke={L} strokeWidth={4} strokeLinecap="round" /> : null}
    </g>
  );
};

/* Un brazo: hombro -> codo -> muneca, con manga opcional (corta deja ver la piel) */
export const Brazo = ({ hombro, codo, muneca, mano = 'abierta', rot = 0, piel, manga, corta = false, flip = false, puno = null, tapa = false }) => {
  const d = `M${hombro[0]} ${hombro[1]} L${codo[0]} ${codo[1]} L${muneca[0]} ${muneca[1]}`;
  const m = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const hastaManga = m(hombro, codo, 0.85);
  return (
    <g>
      <Tubo d={d} color={corta ? piel : manga} w={42} />
      {corta ? <Tubo d={`M${hombro[0]} ${hombro[1]} L${hastaManga[0]} ${hastaManga[1]}`} color={manga} w={50} /> : null}
      {tapa ? <circle cx={hombro[0]} cy={hombro[1]} r={(corta ? 25 : 21) + G} fill={manga} /> : null}
      {puno ? <Tubo d={`M${m(codo, muneca, 0.82).join(' ')} L${m(codo, muneca, 0.9).join(' ')}`} color={puno} w={46} /> : null}
      <Mano x={muneca[0]} y={muneca[1]} tipo={mano} rot={rot} piel={piel} flip={flip} />
    </g>
  );
};

/* Ojos grandes ovalados con parpado. La mirada va en [-1..1] */
export const Ojos = ({ x, y, rx = 40, ry = 46, sep = 74, piel, e, mirada = [0.35, 0], id, pestanas = false }) => (
  <g>
    {[0, 1].map((i) => {
      const cx = x + i * sep;
      const a = i ? rx : rx * 0.9;
      const b = i ? ry : ry * 0.93;
      const lid = cy0(y, b, e.parpado);
      const clip = `ojo-${id}-${i}`;
      return (
        <g key={i}>
          <clipPath id={clip}><ellipse cx={cx} cy={y} rx={a} ry={b} /></clipPath>
          <ellipse cx={cx} cy={y} rx={a} ry={b} fill="#fff" />
          <g clipPath={`url(#${clip})`}>
            <circle cx={cx + mirada[0] * (a - e.pupila - 6)} cy={y + mirada[1] * (b - e.pupila - 6) + (e.parpado > 0.3 ? 8 : 0)} r={e.pupila} fill={L} />
            <circle cx={cx + mirada[0] * (a - e.pupila - 6) + e.pupila * 0.35} cy={y + mirada[1] * (b - e.pupila - 6) - e.pupila * 0.35 + (e.parpado > 0.3 ? 8 : 0)} r={e.pupila * 0.28} fill="#fff" />
            {e.parpado ? (<g><rect x={cx - a - 4} y={y - b - 10} width={a * 2 + 8} height={lid - (y - b - 10)} fill={piel} />
              <path d={`M${cx - a - 4} ${lid} L${cx + a + 4} ${lid}`} stroke={L} strokeWidth={G} /></g>) : null}
          </g>
          <ellipse cx={cx} cy={y} rx={a} ry={b} fill="none" stroke={L} strokeWidth={G} />
          {pestanas ? <path d={i ? `M${cx + a * 0.62} ${y - b * 0.76} l13 -15 M${cx + a * 0.88} ${y - b * 0.46} l17 -9` : `M${cx - a * 0.62} ${y - b * 0.76} l-13 -15 M${cx - a * 0.88} ${y - b * 0.46} l-17 -9`} stroke={L} strokeWidth={G} strokeLinecap="round" /> : null}
        </g>
      );
    })}
  </g>
);
const cy0 = (y, b, p) => y - b + 2 * b * p;

export const Cejas = ({ x, y, sep = 74, e, color, w = 56, h = 14 }) => (
  <g>
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${x + i * sep},${y + e.alza}) rotate(${i ? e.cejaB : e.cejaA})`} fill="none" strokeLinecap="round">
        <path d={`M${-w / 2} 4 Q0 ${-h} ${w / 2} 0`} stroke={L} strokeWidth={h + 9} />
        <path d={`M${-w / 2} 4 Q0 ${-h} ${w / 2} 0`} stroke={color} strokeWidth={h} />
      </g>
    ))}
  </g>
);

/* Boca. (0,0) = centro. "habla" (0..1) abre la boca para sincronizar la voz */
export const Boca = ({ x, y, tipo, habla = null, s = 1, labio = null }) => {
  const trazo = { stroke: labio || L, strokeWidth: labio ? G + 3 : G, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const lleno = { stroke: L, strokeWidth: G, strokeLinejoin: 'round', fill: '#5A1F2E' };
  let c;
  if (habla !== null) {
    const h = 8 + habla * 38;
    c = <g><path d={`M-34 0 Q0 -12 34 0 Q22 ${h} 0 ${h} Q-22 ${h} -34 0 Z`} {...lleno} /></g>;
  } else if (tipo === 'risa') {
    c = (<g><path d="M-52 -8 Q0 8 54 -14 Q44 46 2 48 Q-40 46 -52 -8 Z" {...lleno} />
      <path d="M-42 -3 Q0 10 44 -9 L40 6 Q0 22 -36 10 Z" fill="#fff" /><path d="M-22 40 Q4 20 28 38 Q4 52 -22 40 Z" fill="#E86A6A" />
      <path d="M-52 -8 Q0 8 54 -14 Q44 46 2 48 Q-40 46 -52 -8 Z" fill="none" stroke={L} strokeWidth={G} strokeLinejoin="round" /></g>);
  } else if (tipo === 'o') c = <ellipse cx={0} cy={14} rx={20} ry={28} {...lleno} />;
  else if (tipo === 'mueca') c = <path d="M-38 16 Q-22 -2 -6 12 Q10 24 22 8 Q30 0 40 8" fill="none" {...trazo} />;
  else if (tipo === 'ladeada') c = <path d="M-34 10 Q10 22 44 -14 M36 -22 Q48 -16 52 -4" fill="none" {...trazo} />;
  else if (tipo === 'abajo') c = <path d="M-38 18 Q2 -16 42 14" fill="none" {...trazo} />;
  else c = <path d="M-32 6 Q4 14 36 2" fill="none" {...trazo} />;
  return <g transform={`translate(${x},${y}) scale(${s})`}>{c}</g>;
};

export const Gota = ({ x, y }) => (
  <path d={`M${x} ${y} C${x + 8} ${y + 20} ${x + 20} ${y + 30} ${x + 18} ${y + 44} C${x + 14} ${y + 62} ${x - 16} ${y + 60} ${x - 16} ${y + 40} C${x - 16} ${y + 26} ${x - 4} ${y + 16} ${x} ${y} Z`} fill="#9FD4FF" stroke={L} strokeWidth={5} />
);

export const Sombra = ({ rx = 190 }) => <ellipse cx={10} cy={6} rx={rx} ry={24} fill={L} opacity={0.18} />;

/* Zapato en 3/4 apuntando a la derecha. (0,0) = apoyo bajo el tobillo */
export const Zapato = ({ x, color, suela = '#fff' }) => (
  <g transform={`translate(${x},0)`} stroke={L} strokeWidth={G} strokeLinejoin="round">
    <path d="M-38 -48 Q-48 -10 -36 -6 L66 -6 Q82 -14 68 -32 Q52 -48 26 -46 Q10 -62 -38 -48 Z" fill={color} />
    <path d="M-40 -14 L74 -14 Q84 2 64 4 L-34 4 Q-46 0 -40 -14 Z" fill={suela} />
  </g>
);

export { Tubo, Mano, G };
