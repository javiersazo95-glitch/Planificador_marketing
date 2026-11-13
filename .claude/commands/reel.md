---
description: Produce el video o la imagen de un guion aprobado (capturas del sistema, edición, subtítulos)
---

Usa la skill `publicidad-repuestop`. Produce: $ARGUMENTS

1. Lee el guion en `contenido/` (si no existe, créalo con `/guion` primero).
2. Saca las capturas reales con `node scripts/capturas.mjs` y usa las de la marca en `config/marca.json`.
3. Revisa `recursos/entrantes/` por material del equipo y úsalo.
4. Monta la pieza en `estudio/` (1080×1920, subtítulos grandes, marca) y deja los archivos en `contenido/AAAA-MM-DD-tema/final/`.
5. Si falta material, dilo en simple y pide exactamente qué traer y de dónde sacarlo.
6. Muestra el resultado, actualiza el estado de la tarea y pregunta si pasamos a `/publicar`.
