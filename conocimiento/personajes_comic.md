# La pandilla RepuesTop — elenco para cómics y series
Propuesta 1 · 26-nov-2026 · **elenco aprobado el 26-nov** · capítulo 1 en producción, escena por escena · no publicar nada sin el «sí».

## Dónde está
- Imágenes: Drive `contenido/2026-11-26-personajes-comic/final/` (elenco, caras, escena de prueba y recortes sin fondo).
- Código: `estudio/src/comic/` · exportar: `node estudio/render_comic.mjs` (usa Chrome).
- Uso: `<Personaje quien="cata" expresion="feliz" pose="senala" espejo habla={0.5} />`.
  Caras: neutro, feliz, sorpresa, preocupado, canchero, enojado. Poses: quieto, pulgar, senala, cintura, arriba, muestra.
  `habla` (0 a 1) abre la boca para sincronizar la voz. El teléfono, la tablet y la pieza solo salen en la pose `muestra`.

## Estilo
Escenas de acción: **vista de lado completa** (poses en `estudio/src/comic/perfil.jsx`), sin mezclar frente y lado.
Capó aprobado: angosto, visto de lado. El Cuñado de lado tiene trasero bien marcado (sin exagerar), reservado para un chiste de situación (por ejemplo, bota las cajas al agacharse).
Escena 1, versión 4, **aprobada el 26-nov**: `contenido/2026-11-26-reel-comic-cap1/escenas/cap1_escena1_v4.png`.
Escena 2, **aprobada el 26-nov**: `contenido/2026-11-26-reel-comic-cap1/escenas/cap1_escena2.png` (texto de arriba nuevo: «Batería, bujías, filtro… y nada.»).
Escena 3, **aprobada el 26-nov** (con la frase nueva): `contenido/2026-11-26-reel-comic-cap1/escenas/cap1_escena3_v2.png`. Cata de lado sin cintillo (colet rojo en la cola), chaqueta cerrada y cartera de hombro con tapa. Captura real de repuestop.cl/fallas (`node estudio/capturar_fallas.mjs`). Frase propuesta: «Cuenta la falla en RepuesTop antes de comprar otro repuesto», porque el 26-nov producción mostraba 0 talleres publicados y no conviene prometer que «los talleres te responden».
Escena 4, versión 6 (27-nov, mano derecha copiada de una foto de referencia del usuario), en revisión (Don Lucho es derecho: matraca con dado en la mano derecha y la izquierda apoyada en el auto, manos del Cuñado con el pulgar hacia el cuerpo; de día no va linterna): `contenido/2026-11-26-reel-comic-cap1/escenas/cap1_escena4_v6.png` (texto nuevo arriba «Llega Don Lucho, el maestro del taller»; el Cuñado bota las cajas con el trasero).
Caricatura plana de comedia, borde azul noche (#1B2440), ojos grandes con párpado, vista 3/4.
**No copiar series existentes:** sin piel amarilla ni la boca/ojos típicos de Los Simpson (marca de Disney; podrían reclamar).

## Personajes
| Nombre | Rol | Maña | Función que muestra |
|---|---|---|---|
| Seba | Dueño del auto | Le cree al último que le habló | Patente y encargos |
| El Cuñado | El que «sabe de autos» | Nunca admite que se equivocó | Fallas y talleres |
| Don Lucho | Maestro del taller (la solución) | Explica con peras y manzanas | Agenda del taller |
| Doña Carmen | Dueña de la repuestera | Sabe de memoria dónde está todo | Carga por Excel |
| Cata | Conductora primeriza | Pregunta todo y anota | Repuestín |
| Nando | Desarmaduría | Tiene de todo, no encuentra nada | Publicar sus piezas |

Reglas: el humor es la maña, nunca el físico, el origen ni el oficio. Español simple, sin modismos. Aviso «Recreación».

## Serie recomendada: «El auto de Seba»
Capítulo 1, «El diagnóstico del cuñado» (reaprovecha el guion R1).
- **Objetivo:** que la gente siga la serie y conozca Fallas y talleres. **Público:** conductores.
- **Red y formato:** reel 9:16, unos 22 s (Instagram, TikTok, Facebook, Shorts).

| Tiempo | Escena | Texto o voz |
|---|---|---|
| 0–3 s | Auto con el capó levantado: Cuñado inclinado sobre el motor, Seba preocupado | Texto: «Tres repuestos comprados y el auto sigue igual.» Cuñado: «Es el alternador.» |
| 3–8 s | Seba rodeado de cajas | Seba: «Ya cambié… tres.» |
| 8–14 s | Cata muestra el celular y la pantalla real de Fallas | Cata: «Cuenta la falla en RepuesTop y los talleres te responden.» |
| Por crear (pedida el 26-nov) | Seba publica la falla en la app y le llega el diagnóstico (pantalla real, con un ejemplo de prueba) | Texto por definir |
| 14–18 s | Don Lucho revisa; Cuñado incómodo | Lucho: «Vamos a revisarlo con calma.» Cuñado: «Yo dije que podía ser eléctrico.» |
| 18–22 s | Cierre L2 compradores | «Pago seguro con Flow» + motor + voz de cierre |

- **Texto del post:** «Todos tenemos un cuñado que sabe de autos 😅 Antes de comprar otro repuesto, cuenta la falla en RepuesTop. ¿Quién es el tuyo? repuestop.cl»
- **Hashtags:** #RepuesTop #RepuestosChile #Mecánica #Autos #TallerMecánico #HumorDeAutos
- **Edición:** cortes cada 2–3 s, golpe de cámara en cada remate, subtítulos grandes, música liviana de comedia.
- **Captura (agente):** pantalla de Fallas en dev, sin datos de prueba ni diagnósticos privados a la vista.
- **Del equipo:** aprobar elenco y guion. Voces: ElevenLabs en plan pagado antes de publicar.

Capítulos siguientes: 2) Cata pide su primer repuesto con Repuestín. 3) Doña Carmen sube su catálogo desde Excel (tiendas).
