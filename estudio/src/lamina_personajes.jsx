// Lamina del elenco del reel R1 «El cuñado mecánico» (propuesta de personajes).
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, FUENTE } from './prueba_patente.jsx';
import { Humano, ELENCO } from './personajes.jsx';

const Cabeza = ({ props, animo }) => (
  <svg width={150} height={150} viewBox="-125 -655 250 250" style={{ background: '#fff', borderRadius: 22 }}>
    <Humano {...props} animo={animo} />
  </svg>
);

const Tarjeta = ({ x, k }) => {
  const p = ELENCO[k];
  return (
    <div style={{ position: 'absolute', left: x, top: 190, width: 430, height: 830, background: '#fff', borderRadius: 36, boxShadow: '0 10px 0 rgba(27,36,64,0.12)', borderTop: `14px solid ${p.color}`, boxSizing: 'border-box', padding: '12px 0', textAlign: 'center' }}>
      <svg width={430} height={470} viewBox="-215 -690 430 780" style={{ overflow: 'visible' }}><g transform="scale(0.98)"><Humano {...p.props} animo={p.animos[0]} /></g></svg>
      <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 38, color: C.marino, marginTop: 4 }}>{p.nombre}</div>
      <div style={{ fontFamily: FUENTE, fontWeight: 600, fontSize: 25, color: C.gris, marginTop: 4 }}>{p.rol}</div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 22, padding: '0 8px' }}>
        {p.animos.map((a) => <div key={a} style={{ width: 96 }}><svg width={96} height={96} viewBox="-125 -655 250 250" style={{ background: '#EEF2F8', borderRadius: 16 }}><Humano {...p.props} animo={a} /></svg>
          <div style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: 17, color: C.gris }}>{a}</div></div>)}
      </div>
    </div>
  );
};

export const LaminaPersonajes = () => (
  <AbsoluteFill style={{ background: '#DCE5F2', fontFamily: FUENTE }}>
    <div style={{ position: 'absolute', left: 60, top: 40, color: C.marino, fontWeight: 800, fontSize: 60 }}>Elenco · R1 «El cuñado mecánico»</div>
    <div style={{ position: 'absolute', left: 62, top: 118, color: C.gris, fontWeight: 600, fontSize: 28 }}>Propuesta de personajes · animación 2D plana · mismo estilo del reel de la patente</div>
    <Tarjeta x={60} k="cunado" />
    <Tarjeta x={520} k="dueno" />
    <Tarjeta x={980} k="mecanico" />
    <div style={{ position: 'absolute', left: 1440, top: 190, width: 430, height: 830, background: '#fff', borderRadius: 36, boxShadow: '0 10px 0 rgba(27,36,64,0.12)', borderTop: `14px solid ${C.amarillo}`, boxSizing: 'border-box', textAlign: 'center', padding: 12 }}>
      <Img src={staticFile('repuestin.webp')} style={{ width: 400, height: 400, objectFit: 'contain', marginTop: 40 }} />
      <div style={{ fontWeight: 800, fontSize: 38, color: C.marino, marginTop: 6 }}>Repuestín</div>
      <div style={{ fontWeight: 600, fontSize: 25, color: C.gris, marginTop: 4 }}>Mascota oficial (ya existe)</div>
      <div style={{ fontWeight: 600, fontSize: 22, color: C.gris, marginTop: 30, padding: '0 30px', lineHeight: 1.3 }}>Opcional en R1: podría aparecer en la pantalla de la app. Hoy no es parte del guion.</div>
    </div>
  </AbsoluteFill>
);
