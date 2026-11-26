import React from 'react';
import { registerRoot, Still } from 'remotion';
import { LaminaComic, ExpresionesComic, EscenaComic, RecorteComic } from './laminas.jsx';

const Raiz = () => (
  <>
    <Still id="ElencoComic" component={LaminaComic} width={1880} height={1820} />
    <Still id="CarasComic" component={ExpresionesComic} width={1920} height={1800} />
    <Still id="EscenaComic" component={EscenaComic} width={1080} height={1920} />
    <Still id="Recorte" component={RecorteComic} width={900} height={1300} defaultProps={{ quien: 'seba', expresion: null, pose: null }} />
  </>
);

registerRoot(Raiz);
