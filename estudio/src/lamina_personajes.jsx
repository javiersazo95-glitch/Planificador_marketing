// Lamina del elenco del reel R1 «El cuñado mecánico» (v2: defectos, frases y objetos chilenos).
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, FUENTE } from './prueba_patente.jsx';
import { Humano } from './personajes.jsx';
import { ELENCO } from './elenco_r1.jsx';

const Tarjeta = ({ x, k }) => {
  const p = ELENCO[k];
  return (
    <div style={{ position: 'absolute', left: x, top: 190, width: 430, height: 1230, background: '#fff', borderRadius: 36, boxShadow: '0 10px 0 rgba(27,36,64,0.12)', borderTop: `14px solid ${p.color}`, boxSizing: 'border-box', padding: '8px 22px', textAlign: 'center' }}>
      <svg width={386} height={450} viewBox="-215 -690 430 780" style={{ overflow: 'visible' }}><g transform="scale(0.96)"><Humano {...p.props} animo={p.animos[0]} /></g></svg>
      <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 38, color: C.marino }}>{p.nombre}</div>
      <div style={{ fontFamily: FUENTE, fontWeight: 600, fontSize: 24, color: C.gris }}>{p.rol}</div>
      <div style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: 19, color: p.color, marginTop: 6 }}>{p.objetos}</div>
      <div style={{ textAlign: 'left', marginTop: 14 }}>
        <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 21, color: C.marino, marginBottom: 4 }}>Sus mañas</div>
        {p.defectos.map((d) => <div key={d} style={{ fontFamily: FUENTE, fontWeight: 600, fontSize: 21, color: C.gris, lineHeight: 1.22, marginBottom: 4 }}>• {d}</div>)}
      </div>
      <div style={{ background: '#EEF2F8', borderRadius: 22, padding: '10px 16px', marginTop: 10, textAlign: 'left' }}>
        {p.frases.map((f) => <div key={f} style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 21, color: C.marino, lineHeight: 1.22, marginBottom: 5 }}>{f}</div>)}
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 12 }}>
        {p.animos.map((a) => (
          <div key={a} style={{ width: 90 }}>
            <svg width={90} height={90} viewBox="-125 -655 250 250" style={{ background: '#EEF2F8', borderRadius: 14 }}><Humano {...p.props} animo={a} /></svg>
            <div style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: 16, color: C.gris }}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LaminaPersonajes = () => (
  <AbsoluteFill style={{ background: '#DCE5F2', fontFamily: FUENTE }}>
    <div style={{ position: 'absolute', left: 60, top: 40, color: C.marino, fontWeight: 800, fontSize: 60 }}>Elenco · R1 «El cuñado mecánico»</div>
    <div style={{ position: 'absolute', left: 62, top: 118, color: C.gris, fontWeight: 600, fontSize: 28 }}>Versión 2 · mañas de comportamiento y modismos chilenos (el humor es la maña, nunca el físico)</div>
    <Tarjeta x={60} k="cunado" />
    <Tarjeta x={520} k="dueno" />
    <Tarjeta x={980} k="mecanico" />
    <div style={{ position: 'absolute', left: 1440, top: 190, width: 430, height: 560, background: '#fff', borderRadius: 36, boxShadow: '0 10px 0 rgba(27,36,64,0.12)', borderTop: `14px solid ${C.amarillo}`, boxSizing: 'border-box', textAlign: 'center', padding: 12 }}>
      <Img src={staticFile('repuestin.webp')} style={{ width: 300, height: 300, objectFit: 'contain', marginTop: 20 }} />
      <div style={{ fontWeight: 800, fontSize: 36, color: C.marino }}>Repuestín</div>
      <div style={{ fontWeight: 600, fontSize: 23, color: C.gris }}>Mascota oficial · opcional en R1</div>
    </div>
    <div style={{ position: 'absolute', left: 1440, top: 780, width: 430, height: 640, background: C.marino, borderRadius: 36, boxSizing: 'border-box', padding: '28px 30px', color: '#fff' }}>
      <div style={{ fontWeight: 800, fontSize: 28, color: C.amarillo, marginBottom: 12 }}>Cómo hablan</div>
      {['«po», «ya po», «al tiro», «cachai», «pucha», «estoy chato»', 'Garabato fuerte: nunca. «Weón» solo con cariño y con versión limpia de respaldo', 'El maestro trata de «jefe» y usa diminutivos; el cuñado habla fuerte y seguro', 'La broma es la maña, nunca el físico, el origen ni el oficio'].map((t) => <div key={t} style={{ fontWeight: 600, fontSize: 22, lineHeight: 1.28, marginBottom: 14 }}>• {t}</div>)}
    </div>
  </AbsoluteFill>
);
