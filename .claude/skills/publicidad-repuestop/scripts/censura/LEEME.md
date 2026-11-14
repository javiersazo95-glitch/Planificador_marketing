# Censurar datos personales en una grabación de pantalla

Para videos que graba el equipo en el celular (patente, chasis, direcciones, nombres de tiendas, etc.).
Regla del equipo: **nunca publicar un video sin revisar a ojo el resultado.**

## Pasos
1. **Ver qué sale.** Saca cuadros del video (uno por segundo) y anota qué datos aparecen y cuándo:
   `ffmpeg -i video.mp4 -vf "fps=1,scale=270:-1,tile=8x3" hoja.png`
2. **Cuadros de referencia.** Por cada dato, saca un cuadro donde se vea nítido:
   `ffmpeg -ss 16.0 -i video.mp4 -frames:v 1 referencias/ref_16.0.png`
   ⚠ Estos cuadros traen los datos reales: guárdalos **fuera del repo** (Drive o carpeta temporal).
3. **Config.** Copia `ejemplo_config.json`. Por cada dato anota el cuadro (`ref`) y la caja `[x0,y0,x1,y1]` del texto.
   Recorta solo el texto (una línea); el `margen` agranda la zona tapada (por ejemplo, para incluir la línea de abajo).
4. **Detectar y generar:**
   - `python -I censurar_pantalla.py config.json video.mp4 censurado.mp4 --solo-detectar` muestra en qué segundos aparece cada dato.
   - `python -I censurar_pantalla.py config.json video.mp4 censurado.mp4` genera el video.
   Tarda unos 4 minutos por grupo de plantillas la primera vez; después usa el caché.
5. **Revisar a ojo** (lo más importante). Mira el resultado cada 0,125 s en los momentos de transición: cuando se abre o
   cierra un chat, cuando la pantalla se desplaza, cuando el texto aparece cortado. Ahí la detección falla.
   Lo que se escape va a `"extra"` (zona fija entre dos segundos). Repite hasta que no quede nada legible.

## Qué requiere
Python con `opencv-python` y `numpy`, y `ffmpeg`. Sirve para cualquier video vertical; la config es por video.

## Límites
- Solo encuentra texto que se ve igual que la plantilla (mismo tamaño y letra). Un dato nuevo necesita una plantilla nueva.
- No tapa fotos ni caras. Para eso hay que agregar una zona en `extra` o editar a mano.
- La detección automática de «fugas» no basta: en la primera pasada se escaparon dos tramos que solo se vieron mirando el video.
