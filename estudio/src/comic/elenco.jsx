// Los 6 personajes. Cada uno se reconoce por silueta, un objeto y un color.
import React from 'react';
import { L, G, EXPRESIONES, Tubo, Brazo, Ojos, Cejas, Boca, Gota, Sombra, Zapato } from './personaje.jsx';

const AZ = '#0F4EC2', AM = '#F8C805', GR = '#3B4A5E';
const S = { stroke: L, strokeWidth: G, strokeLinejoin: 'round', strokeLinecap: 'round' };
const linea = { fill: 'none', ...S };

const Oreja = ({ x, y, piel, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M10 -26 C-26 -44 -40 4 -18 24 C-6 36 10 30 14 18 Z" fill={piel} {...S} />
    <path d="M-2 -12 C-18 -14 -20 6 -6 12" {...linea} strokeWidth={5} />
  </g>
);

const Piernas = ({ color, xa = -62, xb = 58, y = -360, w = 70, zapato, suela, largo = -50 }) => (
  <g>
    <Tubo d={`M${xa + 8} ${y} L${xa} ${largo}`} color={color} w={w} />
    <Tubo d={`M${xb - 8} ${y} L${xb} ${largo}`} color={color} w={w} />
    <Zapato x={xa} color={zapato} suela={suela} />
    <Zapato x={xb + 6} color={zapato} suela={suela} />
  </g>
);

const Cuello = ({ x = 0, y, piel, w = 52, alto = 70 }) => <Tubo d={`M${x} ${y} L${x} ${y + alto}`} color={piel} w={w} />;

/* Posicion de los brazos. a = brazo de atras (izq. en pantalla), b = brazo de adelante */
const POSES = {
  quieto:  (h) => ({ a: { codo: [h[0][0] - 44, h[0][1] + 110], muneca: [h[0][0] - 34, h[0][1] + 210], mano: 'abierta' }, b: { codo: [h[1][0] + 46, h[1][1] + 108], muneca: [h[1][0] + 42, h[1][1] + 208], mano: 'abierta', flip: true } }),
  pulgar:  (h) => ({ a: { codo: [h[0][0] - 52, h[0][1] + 105], muneca: [h[0][0] - 36, h[0][1] + 205], mano: 'abierta' }, b: { codo: [h[1][0] + 92, h[1][1] + 78], muneca: [h[1][0] + 128, h[1][1] - 12], mano: 'pulgar' } }),
  senala:  (h) => ({ a: { codo: [h[0][0] - 52, h[0][1] + 105], muneca: [h[0][0] - 36, h[0][1] + 205], mano: 'abierta' }, b: { codo: [h[1][0] + 78, h[1][1] + 62], muneca: [h[1][0] + 164, h[1][1] + 18], mano: 'senala' } }),
  cintura: (h) => ({ a: { codo: [h[0][0] - 96, h[0][1] + 94], muneca: [h[0][0] - 14, h[0][1] + 162], mano: 'puno' }, b: { codo: [h[1][0] + 96, h[1][1] + 94], muneca: [h[1][0] + 20, h[1][1] + 162], mano: 'puno', flip: true } }),
  arriba:  (h) => ({ a: { codo: [h[0][0] - 110, h[0][1] + 20], muneca: [h[0][0] - 126, h[0][1] - 100], mano: 'abierta', rot: 180 }, b: { codo: [h[1][0] + 112, h[1][1] + 20], muneca: [h[1][0] + 130, h[1][1] - 100], mano: 'abierta', rot: 180, flip: true } }),
  muestra: (h) => ({ a: { codo: [h[0][0] - 52, h[0][1] + 105], muneca: [h[0][0] - 36, h[0][1] + 205], mano: 'abierta' }, b: { codo: [h[1][0] + 70, h[1][1] + 100], muneca: [h[1][0] + 128, h[1][1] + 34], mano: 'puno' } }),
};

const dosBrazos = (hombros, pose, comun, tapa = false) => {
  const p = typeof pose === 'string' ? POSES[pose](hombros) : pose;
  return {
    p,
    a: <Brazo hombro={hombros[0]} {...p.a} {...comun} />,
    b: <Brazo hombro={hombros[1]} {...p.b} {...comun} tapa={tapa} />,
  };
};

/* ===================== 1. SEBA, el dueno del auto ===================== */
const Seba = ({ e, pose, habla, id, mirada }) => {
  const delante = !!pose.aDelante;
  const piel = '#EDB48C', pelo = '#4A2C1D', poleron = '#2E7D6B';
  const br = dosBrazos([[-82, -548], [74, -540]], pose, { piel, manga: poleron, puno: '#215C4F' }, true);
  return (
    <g>
      <Sombra />
      <Piernas color="#4C6A92" zapato="#E5483A" />
      {delante ? null : br.a}
      <Cuello x={6} y={-620} piel={piel} />
      <path d="M-112 -330 Q-128 -500 -80 -576 Q4 -616 92 -576 Q138 -500 120 -330 Q4 -306 -112 -330 Z" fill={poleron} {...S} />
      <path d="M-70 -392 Q4 -420 80 -392 L92 -334 Q4 -318 -82 -334 Z" fill="#256757" {...S} />
      <path d="M-66 -578 Q4 -516 84 -578 Q50 -604 6 -602 Q-36 -604 -66 -578 Z" fill="#256757" {...S} />
      <path d="M-18 -548 L-26 -478 M36 -548 L46 -480" {...linea} stroke="#fff" strokeWidth={9} />
      {br.b}
      {/* cabeza */}
      <path d="M-104 -742 C-108 -862 -44 -892 20 -886 C104 -880 124 -810 116 -728 C112 -650 76 -598 12 -596 C-62 -596 -100 -650 -104 -742 Z" fill={piel} {...S} />
      <Oreja x={-98} y={-720} piel={piel} />
      <path d="M-110 -750 C-140 -850 -92 -910 -40 -908 C-30 -944 40 -954 62 -922 C92 -946 130 -916 112 -890 C146 -872 142 -818 118 -790 C112 -826 86 -838 58 -836 C20 -812 -36 -828 -52 -806 C-68 -790 -62 -760 -86 -742 Z" fill={pelo} {...S} />
      <Ojos x={-6} y={-748} piel={piel} e={e} id={id} mirada={mirada} />
      <Cejas x={-8} y={-806} e={e} color={pelo} />
      <path d="M52 -712 C70 -724 112 -702 106 -684 C100 -668 72 -674 56 -682" fill={piel} {...S} />
      <Boca x={36} y={-646} tipo={e.boca} habla={habla} />
      {delante ? br.a : null}
      {e.gota ? <Gota x={delante ? 104 : -62} y={-826} /> : null}
    </g>
  );
};

/* ===================== 2. EL CUNADO, "sabe de autos" ===================== */
const Cunado = ({ e, pose, habla, id, mirada, inclina = 0, cabeza = 0 }) => {
  const piel = '#D59A6A', pelo = '#241B18', camisa = '#D9463E';
  const br = dosBrazos([[-112, -540], [114, -534]], pose, { piel, manga: camisa, corta: true }, true);
  return (
    <g>
      <Sombra rx={220} />
      <Piernas color="#B79B6C" xa={-70} xb={66} y={-300} w={76} zapato="#7A4E2E" suela="#4F321F" />
      <g transform={`rotate(${inclina} 0 -300)`}>
      {br.a}
      <Cuello x={10} y={-626} piel={piel} w={78} />
      <path d="M-118 -576 Q-4 -622 128 -576 Q196 -430 164 -336 Q130 -258 4 -262 Q-132 -262 -156 -338 Q-180 -440 -118 -576 Z" fill={camisa} {...S} />
      {[[-104, -420], [-60, -500], [108, -446], [80, -320], [-70, -316], [130, -366]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${i * 37})`} fill="#FFD9A0">{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx={0} cy={-14} rx={8} ry={14} transform={`rotate(${r})`} />)}<circle r={6} fill={AM} /></g>
      ))}
      <path d="M16 -590 L24 -268" {...linea} />
      {[-500, -430, -360].map((y) => <circle key={y} cx={40} cy={y} r={8} fill="#fff" stroke={L} strokeWidth={4} />)}
      <path d="M-150 -318 Q4 -278 162 -316 L156 -282 Q4 -244 -146 -284 Z" fill="#5A3A22" {...S} />
      <rect x={4} y={-290} width={50} height={38} rx={6} fill={AM} {...S} />
      <path d="M-48 -590 L16 -540 L-6 -602 Z M76 -590 L16 -540 L40 -604 Z" fill={camisa} {...S} />
      {br.b}
      <g transform={`rotate(${cabeza} 20 -610)`}>
      {/* cabeza: mandibula ancha */}
      <path d="M-100 -776 C-98 -866 -34 -886 24 -882 C96 -878 112 -830 112 -764 C146 -716 154 -636 108 -612 C62 -586 -40 -588 -82 -618 C-122 -648 -102 -716 -100 -776 Z" fill={piel} {...S} />
      <path d="M-90 -668 C-60 -640 -30 -690 8 -672 C50 -696 100 -654 134 -678 C150 -622 108 -600 56 -596 C-10 -590 -92 -600 -90 -668 Z" fill={pelo} opacity={0.17} />
      <Oreja x={-98} y={-736} piel={piel} s={1.1} />
      {/* pelo engominado con entradas */}
      <path d="M-104 -740 C-136 -836 -92 -906 -6 -904 C60 -928 134 -900 118 -836 C104 -866 78 -868 60 -854 C50 -884 -2 -886 -18 -856 C-52 -866 -70 -826 -66 -798 C-84 -792 -84 -764 -86 -740 Z" fill={pelo} {...S} />
      <path d="M-82 -854 Q-30 -896 40 -892 M-96 -820 Q-80 -846 -54 -858" {...linea} stroke="#6C5A52" strokeWidth={6} />
      <Ojos x={-2} y={-758} rx={36} ry={40} piel={piel} e={e} id={id} mirada={mirada} />
      <Cejas x={-6} y={-810} e={e} color={pelo} h={18} />
      {/* lentes de sol sobre la frente */}
      <g transform="translate(36,-862) rotate(-4)" {...S}><rect x={-68} y={-20} width={60} height={34} rx={14} fill="#26324F" /><rect x={8} y={-20} width={64} height={34} rx={14} fill="#26324F" /><path d="M-8 -8 L8 -8" /><path d="M-56 -10 L-40 -10" stroke="#fff" strokeWidth={6} /></g>
      <path d="M44 -724 C58 -750 124 -738 126 -708 C128 -678 80 -682 56 -690" fill={piel} {...S} />
      <path d="M-2 -668 C16 -696 52 -690 62 -678 C80 -694 124 -688 130 -658 C100 -668 84 -656 62 -662 C36 -648 20 -668 -2 -668 Z" fill={pelo} {...S} />
      <Boca x={50} y={-634} tipo={e.boca} habla={habla} s={0.9} />
      {e.gota ? <Gota x={-60} y={-836} /> : null}
      </g>
      </g>
    </g>
  );
};

/* ===================== 3. DON LUCHO, maestro del taller ===================== */
const Lucho = ({ e, pose, habla, id, mirada }) => {
  const piel = '#B9784F', cana = '#D7D9E0', overol = AZ;
  const br = dosBrazos([[-104, -548], [112, -548]], pose, { piel, manga: '#F2F4F8', corta: true });
  return (
    <g>
      <Sombra rx={210} />
      <Piernas color={overol} xa={-66} xb={64} y={-340} w={80} zapato="#5B4636" suela="#2E241D" />
      {br.a}
      <Cuello x={8} y={-622} piel={piel} w={70} />
      <path d="M-110 -576 Q4 -612 120 -576 Q152 -460 136 -330 Q4 -298 -128 -330 Q-146 -460 -110 -576 Z" fill="#F2F4F8" {...S} />
      <path d="M-72 -480 L84 -480 L96 -410 L134 -400 Q142 -350 136 -330 Q4 -298 -128 -330 Q-134 -362 -126 -400 L-84 -410 Z" fill={overol} {...S} />
      <path d="M-66 -476 L-88 -580 M76 -476 L100 -580" {...linea} stroke={L} strokeWidth={40} /><path d="M-66 -476 L-88 -580 M76 -476 L100 -580" {...linea} stroke={overol} strokeWidth={28} />
      <circle cx={-62} cy={-464} r={11} fill={AM} {...S} strokeWidth={4} /><circle cx={74} cy={-464} r={11} fill={AM} {...S} strokeWidth={4} />
      <rect x={-34} y={-440} width={84} height={58} rx={10} fill="#0B3C98" {...S} />
      <rect x={-12} y={-478} width={12} height={56} rx={4} fill={AM} {...S} strokeWidth={4} />
      <path d="M18 -440 L18 -470 M10 -486 Q4 -470 18 -466 Q32 -470 26 -486" {...linea} stroke="#C7CDD8" strokeWidth={10} />
      {br.b}
      {/* cabeza redonda */}
      <ellipse cx={8} cy={-728} rx={116} ry={128} fill={piel} {...S} />
      <path d="M-106 -770 C-134 -760 -132 -690 -102 -668 C-96 -690 -70 -700 -74 -722 C-66 -746 -80 -772 -106 -770 Z" fill={cana} {...S} />
      <Oreja x={-96} y={-718} piel={piel} s={1.15} />
      <Ojos x={-8} y={-758} rx={34} ry={37} sep={68} piel={piel} e={e} id={id} mirada={mirada} />
      {/* gorra amarilla */}
      <path d="M-108 -800 C-116 -916 -40 -938 14 -936 C92 -932 126 -878 120 -812 Q10 -846 -108 -800 Z" fill={AM} {...S} />
      <path d="M-14 -832 Q80 -870 178 -808 Q178 -786 150 -792 Q74 -824 -14 -808 Z" fill="#E0AE00" {...S} />
      <circle cx={8} cy={-936} r={12} fill={AZ} {...S} strokeWidth={5} />
      <circle cx={44} cy={-884} r={26} fill={AZ} {...S} strokeWidth={5} /><path d="M30 -884 L41 -873 L60 -896" {...linea} stroke="#fff" strokeWidth={8} />
      <Cejas x={-10} y={-802} sep={70} e={e} color={cana} h={16} />
      {/* nariz grande y bigote canoso */}
      <ellipse cx={80} cy={-702} rx={42} ry={32} fill="#AE6C46" {...S} />
      <path d="M-16 -652 C-4 -692 44 -694 70 -676 C96 -696 138 -678 140 -642 C124 -656 114 -640 96 -648 C80 -632 64 -648 56 -652 C40 -632 20 -646 12 -650 C2 -640 -8 -644 -16 -652 Z" fill={cana} {...S} />
      <Boca x={58} y={-630} tipo={e.boca} habla={habla} s={0.8} />
      {e.gota ? <Gota x={-66} y={-806} /> : null}
    </g>
  );
};

/* ===================== 4. DONA CARMEN, duena de la repuestera ===================== */
const Carmen = ({ e, pose, habla, id, mirada }) => {
  const piel = '#F2C3A0', pelo = '#6B2D3C', blusa = '#7B4FA3';
  const br = dosBrazos([[-80, -540], [90, -540]], pose, { piel, manga: blusa, puno: '#F2F4F8' });
  const tablet = (
    <g transform={`translate(${br.p.b.muneca[0] + 14},${br.p.b.muneca[1] - 30}) rotate(10)`}>
      <rect x={-46} y={-78} width={104} height={140} rx={14} fill="#26324F" {...S} />
      <rect x={-34} y={-64} width={80} height={104} rx={6} fill="#fff" />
      {[-46, -18, 10].map((y, i) => <g key={i}><rect x={-24} y={y} width={18} height={18} rx={4} fill={i === 1 ? AM : AZ} /><rect x={2} y={y + 5} width={36} height={8} rx={4} fill="#9AA6BA" /></g>)}
    </g>
  );
  return (
    <g>
      <Sombra rx={180} />
      <Piernas color="#2F3A57" xa={-52} xb={50} y={-320} w={60} zapato="#26324F" suela="#26324F" />
      {br.a}
      <Cuello x={6} y={-616} piel={piel} w={44} />
      <path d="M-86 -566 Q6 -602 96 -566 Q118 -480 92 -420 Q130 -360 124 -308 Q6 -284 -114 -308 Q-120 -360 -82 -420 Q-108 -480 -86 -566 Z" fill={blusa} {...S} />
      {/* chaleco de la tienda */}
      <path d="M-86 -566 Q-52 -584 -34 -582 L-14 -470 L-26 -306 Q-76 -296 -114 -308 Q-120 -360 -82 -420 Q-108 -480 -86 -566 Z M96 -566 Q62 -584 44 -582 L26 -470 L36 -306 Q86 -296 124 -308 Q130 -360 92 -420 Q118 -480 96 -566 Z" fill={GR} {...S} />
      <rect x={46} y={-478} width={46} height={28} rx={6} fill="#fff" {...S} strokeWidth={4} /><rect x={54} y={-468} width={30} height={8} rx={4} fill={AZ} />
      {br.b}
      {pose === 'muestra' ? tablet : null}
      {/* mono (tomate) */}
      <circle cx={-84} cy={-880} r={62} fill={pelo} {...S} />
      <path d="M-122 -886 Q-96 -930 -54 -906" {...linea} stroke="#96495B" strokeWidth={7} />
      <path d="M-96 -750 C-100 -856 -40 -886 18 -882 C92 -876 112 -820 108 -740 C106 -660 66 -604 14 -600 C-44 -600 -92 -656 -96 -750 Z" fill={piel} {...S} />
      <Oreja x={-90} y={-726} piel={piel} s={0.9} />
      <circle cx={-98} cy={-690} r={13} fill={AM} {...S} strokeWidth={5} />
      <path d="M-100 -720 C-138 -850 -66 -908 14 -902 C96 -906 140 -846 112 -776 C96 -826 66 -838 40 -846 C26 -806 -30 -792 -58 -794 C-76 -776 -70 -738 -100 -720 Z" fill={pelo} {...S} />
      <path d="M-70 -848 L-18 -944" {...linea} stroke={L} strokeWidth={18} /><path d="M-70 -848 L-18 -944" {...linea} stroke={AM} strokeWidth={9} />
      <Ojos x={-6} y={-746} rx={34} ry={40} sep={68} piel={piel} e={e} id={id} mirada={mirada} pestanas />
      <Cejas x={-8} y={-806} sep={70} e={e} color={pelo} h={10} />
      {/* anteojos */}
      <g fill="none" stroke={AZ} strokeWidth={7}><circle cx={-6} cy={-736} r={45} /><circle cx={66} cy={-736} r={49} /><path d="M-50 -742 L-92 -734" /></g>
      <path d="M50 -698 C72 -692 98 -674 80 -664 C70 -660 60 -664 52 -668" fill={piel} {...S} />
      <Boca x={34} y={-638} tipo={e.boca} habla={habla} s={0.82} labio="#B8324F" />
      {e.gota ? <Gota x={-56} y={-822} /> : null}
    </g>
  );
};

/* ===================== 5. CATA, conductora que parte de cero ===================== */
const Cata = ({ e, pose, habla, id, mirada }) => {
  const piel = '#9A6240', pelo = '#1F1512', chaqueta = AM;
  const br = dosBrazos([[-74, -522], [82, -522]], pose, { piel, manga: chaqueta, puno: '#D9A900' });
  const m = br.p.b.muneca;
  return (
    <g>
      <Sombra rx={170} />
      <Piernas color="#26324F" xa={-48} xb={46} y={-320} w={56} zapato="#fff" suela="#E5483A" />
      {/* cola de pelo */}
      <path d="M-60 -846 C-190 -880 -236 -760 -178 -680 C-160 -652 -190 -620 -214 -616 C-150 -580 -92 -640 -108 -700 C-122 -750 -100 -776 -62 -770 Z" fill={pelo} {...S} />
      {br.a}
      <Cuello x={4} y={-604} piel={piel} w={42} />
      <path d="M-78 -548 Q4 -584 86 -548 Q112 -450 98 -318 Q4 -296 -92 -318 Q-106 -450 -78 -548 Z" fill="#fff" {...S} />
      <path d="M-78 -548 Q-50 -566 -28 -566 L-6 -460 L-16 -308 Q-56 -306 -92 -318 Q-106 -450 -78 -548 Z M86 -548 Q58 -566 36 -566 L16 -460 L24 -308 Q64 -306 98 -318 Q112 -450 86 -548 Z" fill={chaqueta} {...S} />
      <path d="M-66 -390 L-40 -380 M48 -380 L74 -390" {...linea} />
      <path d="M-70 -556 L66 -330" {...linea} strokeWidth={24} /><path d="M-70 -556 L66 -330" {...linea} stroke={AZ} strokeWidth={12} />
      <rect x={42} y={-360} width={92} height={72} rx={20} fill={AZ} {...S} />
      {br.b}
      {pose === 'muestra' ? (
        <g transform={`translate(${m[0] + 12},${m[1] - 32}) rotate(8)`}><rect x={-34} y={-66} width={72} height={124} rx={16} fill="#26324F" {...S} /><rect x={-24} y={-52} width={52} height={92} rx={6} fill="#fff" /><rect x={-18} y={-32} width={40} height={22} rx={6} fill={AZ} /><rect x={-18} y={0} width={40} height={16} rx={4} fill={AM} /></g>
      ) : null}
      <path d="M-92 -744 C-96 -850 -34 -878 20 -874 C92 -868 110 -806 106 -732 C102 -652 62 -592 14 -590 C-42 -592 -88 -652 -92 -744 Z" fill={piel} {...S} />
      <Oreja x={-86} y={-718} piel={piel} s={0.88} />
      <circle cx={-96} cy={-668} r={24} fill="none" stroke={L} strokeWidth={17} /><circle cx={-96} cy={-668} r={24} fill="none" stroke={AM} strokeWidth={8} />
      <path d="M-96 -730 C-128 -850 -54 -906 22 -898 C96 -896 132 -840 110 -772 C98 -808 74 -826 52 -830 C30 -796 -8 -808 -30 -794 C-56 -788 -60 -748 -96 -730 Z" fill={pelo} {...S} />
      <path d="M-96 -826 Q-30 -886 94 -840" {...linea} stroke={L} strokeWidth={30} /><path d="M-96 -826 Q-30 -886 94 -840" {...linea} stroke="#E5483A" strokeWidth={18} />
      <Ojos x={-6} y={-736} rx={37} ry={46} sep={70} piel={piel} e={e} id={id} mirada={mirada} pestanas />
      <Cejas x={-8} y={-800} sep={72} e={e} color={pelo} h={11} />
      <path d="M52 -690 C68 -684 88 -668 74 -658 C66 -654 58 -658 52 -662" fill={piel} {...S} />
      <Boca x={32} y={-630} tipo={e.boca} habla={habla} s={0.84} labio="#5C1F2B" />
      {e.gota ? <Gota x={-54} y={-818} /> : null}
    </g>
  );
};

/* ===================== 6. NANDO, el desarmador ===================== */
const Nando = ({ e, pose, habla, id, mirada }) => {
  const piel = '#E8A67E', pelo = '#C4561F', polera = GR;
  const br = dosBrazos([[-70, -566], [54, -556]], pose, { piel, manga: polera, corta: true }, true);
  const m = br.p.b.muneca;
  return (
    <g>
      <Sombra rx={170} />
      <Piernas color="#5C6B4A" xa={-52} xb={50} y={-370} w={58} zapato="#8A6A3F" suela="#3B2C1B" />
      {br.a}
      <Cuello x={6} y={-668} piel={piel} w={40} alto={86} />
      <path d="M-74 -592 Q4 -622 82 -592 Q100 -480 80 -356 Q4 -336 -74 -356 Q-92 -480 -74 -592 Z" fill={polera} {...S} />
      <circle cx={6} cy={-476} r={40} fill="#fff" {...S} strokeWidth={5} />
      <g stroke={L} strokeWidth={9} fill="none"><circle cx={6} cy={-476} r={18} />{[0, 45, 90, 135, 180, 225, 270, 315].map((r) => <path key={r} d="M6 -500 L6 -512" transform={`rotate(${r} 6 -476)`} />)}</g>
      <path d="M-82 -372 Q4 -346 86 -372 L84 -338 Q4 -316 -80 -338 Z" fill="#6B4A2B" {...S} />
      <g transform="translate(-52,-352) rotate(14)"><rect x={-8} y={0} width={16} height={92} rx={8} fill="#C7CDD8" {...S} strokeWidth={5} /><circle cx={0} cy={96} r={20} fill="#C7CDD8" {...S} strokeWidth={5} /></g>
      {br.b}
      {pose === 'muestra' ? (
        <g transform={`translate(${m[0] + 18},${m[1] - 40}) rotate(-12)`} {...S}><circle r={52} fill="#9AA6BA" /><circle r={30} fill="#C7CDD8" /><circle r={10} fill={L} />{[0, 60, 120, 180, 240, 300].map((r) => <circle key={r} cx={0} cy={-41} r={6} fill={L} stroke="none" transform={`rotate(${r})`} />)}</g>
      ) : null}
      {/* cabeza alargada */}
      <path d="M-80 -800 C-80 -900 -34 -928 12 -926 C70 -922 90 -870 88 -790 C88 -702 66 -634 16 -630 C-40 -632 -80 -708 -80 -800 Z" fill={piel} {...S} />
      <Oreja x={-76} y={-776} piel={piel} s={1.2} />
      {/* pelo parado */}
      <path d="M-86 -792 C-110 -852 -100 -882 -80 -896 L-116 -940 L-58 -934 L-66 -992 L-18 -950 L12 -1008 L34 -950 L90 -978 L74 -922 L128 -916 L86 -878 C96 -856 96 -836 88 -820 C60 -880 -20 -886 -50 -856 C-70 -838 -62 -806 -86 -792 Z" fill={pelo} {...S} />
      <Ojos x={-4} y={-800} rx={32} ry={42} sep={62} piel={piel} e={e} id={id} mirada={mirada} />
      <Cejas x={-6} y={-860} sep={66} w={48} e={e} color={pelo} h={13} />
      <path d="M44 -764 C72 -752 116 -716 96 -702 C80 -694 62 -712 48 -722" fill={piel} {...S} />
      <g fill="#B9754F"><circle cx={-34} cy={-742} r={5} /><circle cx={-14} cy={-728} r={5} /><circle cx={-42} cy={-720} r={5} /></g>
      <path d="M-30 -696 q16 -10 30 4" stroke="#4A4F5E" strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.45} />
      <Boca x={26} y={-676} tipo={e.boca} habla={habla} s={0.8} />
      {e.gota ? <Gota x={-44} y={-868} /> : null}
    </g>
  );
};

export const ELENCO_COMIC = {
  seba:   { C: Seba,   nombre: 'Seba',          rol: 'El dueño del auto',            color: '#2E7D6B', sirve: 'Patente y encargos', mana: 'Le cree al último que le habló', expr: 'preocupado', pose: 'quieto' },
  cunado: { C: Cunado, nombre: 'El Cuñado',     rol: 'El que «sabe de autos»',       color: '#D9463E', sirve: 'Fallas y talleres',  mana: 'Nunca admite que se equivocó',   expr: 'canchero',   pose: 'cintura' },
  lucho:  { C: Lucho,  nombre: 'Don Lucho',     rol: 'Maestro del taller',           color: '#E0AE00', sirve: 'Agenda del taller',  mana: 'Explica todo con peras y manzanas', expr: 'feliz',   pose: 'pulgar' },
  carmen: { C: Carmen, nombre: 'Doña Carmen',   rol: 'Dueña de la repuestera',       color: '#7B4FA3', sirve: 'Carga por Excel',    mana: 'Sabe de memoria dónde está todo', expr: 'neutro',    pose: 'muestra' },
  cata:   { C: Cata,   nombre: 'Cata',          rol: 'Conductora primeriza',         color: '#0F4EC2', sirve: 'Repuestín',          mana: 'Pregunta todo y anota',          expr: 'feliz',      pose: 'muestra' },
  nando:  { C: Nando,  nombre: 'Nando',         rol: 'El de la desarmaduría',        color: '#3B4A5E', sirve: 'Publicar sus piezas', mana: 'Tiene de todo, no encuentra nada', expr: 'sorpresa', pose: 'muestra' },
};

/* Un personaje listo para usar: <Personaje quien="cata" expresion="feliz" pose="senala" /> */
export const Personaje = ({ quien, expresion, pose, habla = null, espejo = false, mirada = [0.35, 0], uid = '', inclina = 0, cabeza = 0 }) => {
  const p = ELENCO_COMIC[quien];
  const e = EXPRESIONES[expresion || p.expr];
  const id = `${quien}-${expresion || p.expr}-${typeof pose === 'object' && pose ? 'libre' : pose || p.pose}-${uid}`;
  return <g transform={espejo ? 'scale(-1,1)' : undefined}><p.C e={e} pose={pose || p.pose} habla={habla} id={id} mirada={mirada} inclina={inclina} cabeza={cabeza} /></g>;
};
