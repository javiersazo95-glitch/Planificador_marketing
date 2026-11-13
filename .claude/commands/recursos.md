---
description: Revisa las fotos, videos o audios que dejó el equipo en recursos/entrantes y los usa en el contenido
---

1. Ejecuta `node scripts/entregas.mjs listar`. Las entregas en `recibido` son las nuevas: el campo `para` dice qué pedido cumplen y `nota` trae lo que explicó el equipo. Los archivos están en su `carpeta`.
2. Por cada entrega nueva, marca `node scripts/entregas.mjs estado <id> revisando --nota="Revisando el video de Repuestín"` y revisa el material. Describe en simple lo que llegó (qué se ve, qué se escucha, calidad).
3. Si sirve: marca `trabajando` con una nota de qué pieza armas y sigue el flujo de `/reel`. Al terminar, marca `listo` con `--resultado=` apuntando al archivo final en `contenido/` y `--tarea=` con la tarea relacionada.
4. Si no sirve (muy oscuro, mucho ruido, rostros sin permiso): marca `problema` y explica en la nota, en simple, qué pasó y cómo regrabarlo.
5. El equipo ve cada cambio en vivo en el panel (sección "Entregar material al agente"), así que actualiza el estado en cada avance.
Contexto del equipo: $ARGUMENTS
