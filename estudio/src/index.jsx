// Estudio de video de RepuesTop. Una plantilla de Reel (9:16) y una lamina fija, ambas con la marca.
// Se alimentan con "escenas": [{ texto, segundos, imagen? , destacado? }] (props de Remotion, via --props=archivo.json).
import React from 'react';
import { registerRoot, Composition, Still, AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate } from 'remotion';

const MARCA = { azul: '#0056BF', marino: '#0A2149', celeste: '#38bdf8', fondo: '#F8FAFC' };
const FPS = 30;

const ejemplo = {
  cierre: 'Descarga RepuesTop gratis',
  escenas: [
    { texto: '¿Buscaste en 5 tiendas y nada?', segundos: 3 },
    { texto: 'Escríbele a Repuestín lo que buscas', segundos: 4 },
    { texto: 'Él pregunta a las tiendas por ti', segundos: 4 },
    { texto: 'repuestop.cl', segundos: 3, destacado: true },
  ],
};

const Escena = ({ texto, imagen, destacado, duracion }) => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const sale = interpolate(f, [duracion - 6, duracion], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ background: destacado ? MARCA.azul : MARCA.marino, fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif' }}>
      {imagen ? <Img src={staticFile(imagen)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} /> : null}
      {/* zona segura: 250 px libres arriba y 340 abajo */}
      <AbsoluteFill style={{ padding: '250px 72px 340px', justifyContent: 'center', alignItems: 'center', opacity: entra * sale }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 96, lineHeight: 1.08, textAlign: 'center', textWrap: 'balance', transform: `translateY(${(1 - entra) * 30}px)` }}>{texto}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Reel = ({ escenas = ejemplo.escenas, cierre = ejemplo.cierre }) => {
  let inicio = 0;
  const tramos = escenas.map(e => { const d = Math.round(e.segundos * FPS); const t = { ...e, inicio, d }; inicio += d; return t; });
  const cierreD = 2 * FPS;
  return (
    <AbsoluteFill style={{ background: MARCA.marino }}>
      {tramos.map((t, i) => (
        <Sequence key={i} from={t.inicio} durationInFrames={t.d}><Escena texto={t.texto} imagen={t.imagen} destacado={t.destacado} duracion={t.d} /></Sequence>
      ))}
      <Sequence from={inicio} durationInFrames={cierreD}>
        <AbsoluteFill style={{ background: MARCA.azul, justifyContent: 'center', alignItems: 'center', fontFamily: 'Outfit, sans-serif' }}>
          <div style={{ color: '#fff', fontSize: 112, fontWeight: 800 }}>RepuesTop</div>
          <div style={{ color: MARCA.fondo, fontSize: 56, marginTop: 24 }}>{cierre}</div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const Lamina = ({ titulo = 'Fundador: 0% de comisión', bajada = 'Suma tu tienda en repuestop.cl/vender' }) => (
  <AbsoluteFill style={{ background: MARCA.marino, justifyContent: 'center', padding: 96, fontFamily: 'Outfit, sans-serif' }}>
    <div style={{ color: MARCA.celeste, fontSize: 40, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>RepuesTop</div>
    <div style={{ color: '#fff', fontSize: 120, fontWeight: 800, lineHeight: 1.05, margin: '32px 0' }}>{titulo}</div>
    <div style={{ color: MARCA.fondo, fontSize: 48 }}>{bajada}</div>
  </AbsoluteFill>
);

const total = (p) => Math.round(((p.escenas || ejemplo.escenas).reduce((s, e) => s + e.segundos, 0) + 2) * FPS);

const Raiz = () => (
  <>
    <Composition id="Reel" component={Reel} width={1080} height={1920} fps={FPS} durationInFrames={total(ejemplo)} defaultProps={ejemplo}
      calculateMetadata={({ props }) => ({ durationInFrames: total(props) })} />
    <Still id="Lamina" component={Lamina} width={1080} height={1350} />
  </>
);

registerRoot(Raiz);
