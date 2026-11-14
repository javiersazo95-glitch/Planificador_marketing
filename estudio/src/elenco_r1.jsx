// Elenco del reel R1 «El cuñado mecánico»: aspecto, defectos de comportamiento, frases y objetos chilenos.
// Regla del guion: el humor es la maña, nunca el físico, el origen ni el oficio.
import { C } from './prueba_patente.jsx';

export const ELENCO = {
  cunado: {
    nombre: 'El cuñado', rol: 'El que «sabe de autos»', color: '#E5483A',
    props: { piel: '#D49C6D', pelo: '#1E1713', peloEstilo: 'atras', canas: true, cara: 'ancha', cejasGrosor: 12, nariz: 1.2, camisa: '#F4F1E8', pantalon: '#3B4A5E', lentes: true, bigote: true, cerveza: true, chalas: true, guaipe: true, ancho: 1.12 },
    animos: ['canchero', 'neutro', 'sorpresa', 'timido'],
    defectos: ['Sabe de todo… sin haber abierto nunca un capó', 'Jamás admite que se equivocó', 'Siempre «tiene un amigo» que lo arregla más barato', 'Cuenta la historia de su primer auto antes de ayudar'],
    frases: ['«Eso es el alternador.»', '«Alternador.»', '«Sin duda… alternador.»'],
    objetos: 'chalas con calcetines · guaipe al hombro · lentes de sol',
  },
  dueno: {
    nombre: 'El dueño del auto', rol: 'Ya cambió tres alternadores', color: C.azul,
    props: { piel: '#DFAD85', pelo: '#17151A', peloEstilo: 'chasquilla', cara: 'ovalada', barba: 'rastrojo', cejasGrosor: 10, nariz: 1.05, camisa: '#8FB1E8', pantalon: C.marino, zapatos: '#fff', mochila: true, boletas: true },
    animos: ['cansado', 'triste', 'sorpresa', 'feliz'],
    defectos: ['Le hace caso al último que le habló', 'Deja la revisión para cuando «ya no parte»', 'Guarda todas las boletas… y nunca las mira', 'Acepta todo para no discutir'],
    frases: ['«Ya cambié… tres.»'],
    objetos: 'mochila · fajo de boletas · ojeras',
  },
  mecanico: {
    nombre: 'El maestro del taller', rol: 'Taller acreditado en la app', color: '#1FA463',
    props: { piel: '#BA865E', pelo: '#2B2420', peloEstilo: 'corto', cara: 'cuadrada', cejasGrosor: 12, nariz: 1.25, bigote: true, gorra: C.amarillo, overol: true, barba: 'rastrojo', zapatos: '#2A2F3C', lapiz: true },
    animos: ['neutro', 'feliz', 'canchero', 'sorpresa'],
    defectos: ['Se emociona explicando el motor «con peras y manzanas»', 'Explica todo con paciencia y ejemplos', 'Trata a todos con respeto', 'Antes de opinar, mira la pieza vieja'],
    frases: ['«Vamos a revisarlo con calma.»', '«Mire, esto no es el alternador.»'],
    objetos: 'gorra · overol · lápiz en el pecho',
  },
};
