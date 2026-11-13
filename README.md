# Planificador de Marketing — RepuesTop

La oficina de marketing y publicidad de RepuesTop. Aquí vive el agente que planifica, crea reels e imágenes,
propone campañas y lleva el panel con el estado de las redes. Los repos de RepuesTop solo se **leen**.

## Cómo se usa (día a día)
| Comando | Qué hace |
|---|---|
| `/marketing` | Se pone al día con los últimos cambios de RepuesTop y propone el plan de hoy (lunes: el de la semana). |
| `/panel` | Abre el panel en tu navegador: qué hacer hoy, plan de la semana, redes, entregas y pendientes. |
| `/guion`, `/reel`, `/publicar`, `/recursos` | Libreto, video, publicar (siempre con tu "sí") y usar el material que subieron. |

## Todo el equipo ve lo mismo
- **La memoria del agente** (planes, historial, novedades) se guarda en GitHub. Al abrir una sesión se trae lo
  último automáticamente y al terminar se suben los cambios. No hay que hacer nada.
- **Los videos, fotos y audios** que suben desde el panel van a la carpeta compartida de **Google Drive
  "RepuesTop Marketing"**. Así, si un colega ya subió un video, los demás lo ven como "Ya entregado".

## Preparar un computador nuevo (una sola vez)
1. Clonar este repo y abrirlo con Claude Code.
2. Instalar dependencias:
   ```bash
   npm install
   ```
   ```bash
   npm --prefix estudio install
   ```
3. Instalar **Google Drive para escritorio** (google.com/drive/download) e iniciar sesión.
4. Tener acceso a la carpeta **"RepuesTop Marketing"**:
   - Quien tiene el plan Google AI Pro la crea en su Drive y la comparte con cada colega como **Editor**.
   - Cada colega: drive.google.com → Compartido conmigo → "RepuesTop Marketing" → Organizar →
     Añadir acceso directo → Mi unidad.
5. Conectar este computador con la carpeta:
   ```bash
   node scripts/configurar-drive.mjs
   ```
6. Listo: escribe `/panel` y verás el aviso verde "Se guarda en la carpeta compartida de Google Drive".
