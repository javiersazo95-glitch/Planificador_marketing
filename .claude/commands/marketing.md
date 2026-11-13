---
description: Arranque de sesión de marketing y publicidad de RepuesTop: se actualiza con los últimos cambios y propone el plan de hoy (lunes: plan de la semana)
---

Actúa como el líder de marketing y publicidad de RepuesTop. Trabaja desde `Planificador_marketing`. Los repos de RepuesTop son SOLO LECTURA.

1. Lee `CLAUDE.md` y las skills `marketing-repuestop` y `publicidad-repuestop`.
2. Ejecuta `node scripts/sincronizar.mjs --no-guardar`. Resume en 3 a 5 líneas simples qué hay nuevo desde la última vez (producción = ya lo puede ver el público; trabajo = viene pronto). Guarda el resumen en `novedades/AAAA-MM-DD.md` y actualiza `conocimiento/producto.md` si cambió algo. Después ejecuta `node scripts/sincronizar.mjs` (sin la opción) para guardar el punto de partida.
3. Si Metricool está conectado, trae los números de ayer y de la semana a `datos/metricas/AAAA-MM-DD.json`. Si no, pide al equipo capturas de cada red (solo si hace falta).
4. Revisa `node scripts/entregas.mjs listar --estado=recibido`: si el equipo subió material desde el panel, avísalo primero y trabájalo con el flujo de `/recursos` (actualizando su estado para que el equipo lo siga en vivo).
5. Lee `datos/tareas.json` para no repetir ideas y ver qué quedó pendiente o cómo le fue a lo ya publicado (mide a los 3 y 7 días).
6. Propón:
   - **Hoy es lunes** (revisa la fecha real): plan de la semana con 2 panoramas distintos que tú eliges según el momento. Guárdalo en `datos/planes/semana/`.
   - **Otro día**: plan de hoy con 2 o 3 piezas, distintas a las anteriores. Guárdalo en `datos/planes/dia/`.
   Cada pieza: objetivo, público, red y formato, guion por escenas, texto del post, edición, qué capturas haces tú, qué material necesitas del equipo y de dónde sacarlo.
7. Registra cada propuesta con `node scripts/tareas.mjs agregar ...`.
8. Cierra con una pregunta simple ("¿Cuál hacemos?") y 2 o 3 opciones, la primera recomendada. Lenguaje simple, sin tecnicismos.

Pedido adicional del equipo: $ARGUMENTS
