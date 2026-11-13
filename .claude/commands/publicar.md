---
description: Prepara una pieza terminada y, solo con tu "sí", la programa en las redes (Metricool)
---

Publica: $ARGUMENTS

1. Muestra la pieza final, el texto del post, la red, el día y la hora sugeridos (con `getBestTimeToPostByNetwork` si Metricool está conectado).
2. Pregunta de forma explícita: "¿Lo publico?". Publicar es público y no se puede deshacer; sin un "sí" claro del equipo, pieza por pieza, no se publica nada.
3. Con el "sí": programa con Metricool (`createScheduledPost`). Si no está conectado, deja todo listo en `contenido/` con instrucciones para subirlo a mano.
4. Marca la tarea como "publicada" con `node scripts/tareas.mjs` y agenda la medición a los 3 y 7 días.
