---
description: Muestra el panel de marketing: historial, plan de hoy, plan de la semana y estado de las redes
---

Arma y publica el panel de marketing de RepuesTop.

1. Ejecuta `node scripts/sincronizar.mjs --no-guardar` para tener lo último y, si Metricool está conectado, actualiza `datos/metricas/`.
2. Asegura que `datos/planes/` tenga el plan de hoy y el de la semana (2 panoramas); si faltan, créalos como en `/marketing`.
3. Actualiza `datos/panel-extra.json` respetando su forma actual. Regla de oro: **todo lo que aparece debe explicar QUÉ ES, QUÉ HAY QUE HACER (y quién), PARA QUÉ SIRVE y QUÉ RESULTADO ESPERAMOS**, en frases simples de 1 o 2 líneas, sin jerga. Ordenado, sin párrafos largos.
   - `recomendacion`: lo que dice Repuestín hoy (1 frase).
   - `acciones`: pasos concretos para el equipo hoy, en orden: `texto`, `quien`, `como` (instrucciones paso a paso), `para`, `resultado`.
   - `hoy`: `titulo`, `porque` y `piezas` con `tarea` (id en tareas.json), `titulo`, `formato`, `redes`, `publico`, `recomendada`, `que`, `objetivo`, `yo`, `ustedes`, `resultado` (meta concreta, p. ej. "Meta inicial: 1.000 reproducciones en 3 días") y `guion` (lista de escenas).
   - `semana`: `rango`, `explica`, `recomendado` y 2 `panoramas` con `nombre`, `publico`, `resumen`, `objetivo`, `esfuerzo`, `esfuerzo_detalle`, `resultado` (con meta) y 7 `dias` (`dia`, `pieza` de 1 a 3 palabras, `redes`, `detalle`).
   - `redes.<red>`: `semaforo` (verde/amarillo/rojo), `porque` (por qué ese color), `numeros` (máx. 3: `etiqueta`, `valor`), `consejo`, `falta` (qué hay que hacer), `resultado`.
   - `novedades` (máx. 4: `fecha`, `titulo`, `explica`, `idea`), `alerta` (`titulo`, `explica`, `resultado`).
   - `desarrollo`, `material`, `ideas`: objetos `titulo`, `porque`, `resultado`. `fechas`: `fecha`, `texto`, `porque`.
   Las metas son objetivos, no datos reales: cuando haya números de Metricool, basarlas en ellos. Redes válidas: instagram, facebook, tiktok, youtube, google.
4. Ejecuta `node scripts/panel.mjs` (genera `panel/panel.html`; incluye la mascota Repuestín y los colores de cada red).
5. **Despliégalo solo en el navegador del equipo** (obligatorio, sin preguntar): ejecuta `node scripts/servidor-panel.mjs --abrir` con Bash y `run_in_background: true`. Eso levanta http://localhost:4321 y abre el navegador predeterminado; si el servidor ya estaba corriendo, solo abre el navegador. El servidor rearma el panel en cada recarga. Fuera de esta app, el equipo puede usar `npm run panel`.
6. Si el equipo quiere compartirlo, publícalo también en el enlace de siempre: https://claude.ai/artifact/K7cNbm8yKYR2La73P2fhxC (desde otra sesión, pasa esa URL como `url`).
7. Resume en 5 líneas: lo hecho, lo de hoy, lo de la semana y lo más urgente.

Pedido adicional: $ARGUMENTS
