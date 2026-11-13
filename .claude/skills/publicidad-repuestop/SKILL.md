---
name: publicidad-repuestop
description: Creador de publicidad de RepuesTop: guiones y libretos, ganchos, textos de posts, reels, carruseles e imágenes, edición de video y publicación en Instagram, Facebook, TikTok y YouTube. Úsala cuando el equipo pida crear un video, reel, imagen, guion, libreto, copy, anuncio, historia o carrusel, editar fotos o audios que entregó, sacar capturas del sistema para un video, o publicar y programar contenido.
---

# Publicidad RepuesTop — creador y publicista

Antes de crear: leer `CLAUDE.md`, `conocimiento/producto.md` (qué mostrar y qué NO decir), `config/marca.json`.
Mensajes al equipo: simples, sin jerga. Pocas opciones, una recomendada.

## Flujo de una pieza
1. **Idea** → objetivo (qué queremos que pase), público (uno solo), red y formato (`referencias/formatos-por-red.md`).
2. **Guion** con `referencias/plantilla-guion.md`: gancho en 3 segundos, escenas con visual + texto en pantalla +
   voz/audio, cierre con llamado a la acción. Ganchos de `referencias/ganchos.md`. Duración 15–30 s.
3. **Material**: qué saco yo del sistema (`node scripts/capturas.mjs`, capturas reales de la marca), qué necesito
   del equipo (grabar pantalla del celular, 10 s de un mesón, un audio leyendo el texto, fotos) y de dónde conseguirlo.
   Para tomas que no existen, entregar prompts listos para IA de video (`referencias/prompts-ia-video.md`).
4. **Edición** con `referencias/guia-edicion.md` y el proyecto `estudio/` (Remotion): 1080×1920, subtítulos
   grandes, colores y fuentes de la marca, logo y mascota Repuestín, zona segura de cada red.
5. **Texto del post**: gancho en la primera línea, 3 líneas máximo, llamado a la acción, enlace con etiqueta
   (`utm_source=<red>&utm_medium=<formato>&utm_campaign=<tema>`), 3 a 5 hashtags.
6. **Aprobación**: mostrar pieza final + texto + red + día y hora sugeridos y preguntar "¿Lo publico?".
7. **Publicar** (solo con "sí" explícito, pieza por pieza): por Metricool (`createScheduledPost`) si está conectado;
   si no, dejar la carpeta lista en `contenido/AAAA-MM-DD-tema/` con instrucciones para que el equipo suba.
8. **Registrar** en `datos/tareas.json` con `node scripts/tareas.mjs` y medir a los 3 y 7 días.

## Material que entrega el equipo
Revisar `recursos/entrantes/`: describir lo que llegó (qué se ve, qué se escucha), proponer cómo usarlo
(recorte, fondo, audio como voz en off, subtítulos) y editarlo. Si falta algo, pedirlo con un ejemplo concreto y
sugerir de dónde sacarlo (grabación de pantalla, fotos de tienda, reseñas reales con permiso, capturas de Play).

## Reglas de contenido
- Mostrar el producto real (capturas reales, pantalla del celular); nada de pantallas inventadas.
- Cero cifras de tiendas o usuarios sin aprobación; cero descuentos o plazos de despacho no confirmados.
- Fundador: confirmar vigencia (1 mes desde el 11-nov; 2 meses para quien postuló hasta el 10-nov) antes de usarlo.
- Marca en trámite: "RepuesTop" sin ®. Música con licencia libre o de la biblioteca de cada red.
- Personas reales (mecánicos, clientes): pedir permiso por escrito antes de mostrar rostro o nombre.
- Repuestín es la mascota: voz amable, ayuda sin presionar; nunca promete lo que la plataforma no hace.
- Guiones existentes para reutilizar: `C:/Users/Leprosy1513/Documents/Codex/RespuesTop-mono-repo/docs/planes/plan_publicidad_tiktok_instagram.md`
  (5 guiones: leer, adaptar a lo vigente y no repetir los ya publicados).
