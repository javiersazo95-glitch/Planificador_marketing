# Planificador de Marketing — RepuesTop

La oficina de marketing y publicidad de RepuesTop. Aquí vive el **agente líder de marketing**: se mantiene al día
con los cambios de RepuesTop, propone qué publicar cada día, escribe guiones, arma reels e imágenes, lleva el
panel con el estado de las redes y trabaja con el material que sube el equipo.

> Los repos de RepuesTop (backend/app, web y panel de tiendas) solo se **leen**. El agente nunca los modifica.

---

## Comandos del agente

Abre Claude Code **en esta carpeta** (`Planificador_marketing`). Los comandos solo existen aquí.

### Los principales
| Comando | Para qué sirve |
|---|---|
| `/marketing` | **El de todos los días.** Se pone al día con los últimos cambios de RepuesTop, revisa si subieron material y te propone qué publicar hoy. **Los lunes** propone el plan de la semana con dos caminos. |
| `/panel` | Abre el panel en tu navegador: qué hacer hoy, plan de la semana, redes, entregas y pendientes. |

### Para producir contenido
| Comando | Para qué sirve |
|---|---|
| `/guion` | Escribe el libreto de un video o post. Ej.: `/guion reel sobre la búsqueda por patente` |
| `/reel` | Arma el video o la imagen a partir de un guion aprobado. |
| `/recursos` | Revisa los videos, fotos o audios que subieron desde el panel y trabaja con ellos. |
| `/publicar` | Prepara la publicación y la programa en las redes, **siempre con tu "sí"**. (Sin Metricool conectado, deja todo listo para subir a mano). |

### Para preparar tu computador
| Comando | Para qué sirve |
|---|---|
| `/revisar` | Revisa qué le falta a tu computador para trabajar con el agente y te guía paso a paso. |

**Tips:**
- Puedes agregar detalles después de cualquier comando: `/marketing hoy quiero algo para tiendas`.
- También puedes hablarle normal, sin comandos: *"hazme un post para Black Friday"* o *"configura Drive"*.

---

## Primera vez en tu computador

**Al abrir el agente, revisa solo tu computador** y te dice qué te falta instalar o configurar, en orden de
importancia. Si algo falta, te lo explica y se ofrece a hacerlo contigo. Puedes repetir la revisión cuando quieras
con `/revisar`.

Qué revisa:
| Qué | Para qué sirve | Si falta |
|---|---|---|
| Node.js | Hace funcionar los scripts del agente | Instalar Node.js 20+ desde nodejs.org |
| Git con tu nombre | Guardar los cambios a tu nombre | El agente lo configura contigo |
| Acceso a este repo en GitHub | Compartir la memoria del agente con el equipo | Iniciar sesión en GitHub y pedir acceso |
| Lectura de los 3 repos de RepuesTop | Saber qué hay nuevo en la web y la app | Pedir acceso de lectura en GitHub |
| Playwright y Remotion | Sacar capturas y generar videos | El agente ejecuta `npm install` |
| Microsoft Edge | Generar videos y capturas | Instalar Edge |
| Google Drive compartido | Subir y ver los videos y fotos del equipo | Instalar Google Drive para escritorio y decir «configura Drive» |
| Metricool | Publicar y ver los números de las redes | Conectarlo en claude.ai → Conectores |

Pasos manuales (solo los que el agente no puede hacer por ti):
1. Clonar este repo y abrirlo con Claude Code.
2. Instalar **Google Drive para escritorio** (google.com/drive/download) e iniciar sesión.
3. Tener acceso a la carpeta compartida **"RepuesTop Marketing"**:
   - Quien tiene el plan Google AI Pro la crea en su Drive y la comparte con cada colega como **Editor**.
   - Cada colega: drive.google.com → Compartido conmigo → "RepuesTop Marketing" → Organizar →
     Añadir acceso directo → Mi unidad.
4. Decirle al agente **«configura Drive»**. Al abrir `/panel` debe aparecer el aviso verde
   "Se guarda en la carpeta compartida de Google Drive".

---

## Cómo se comparte el trabajo entre colegas

| Qué | Dónde vive | Cómo se comparte |
|---|---|---|
| Videos, fotos y audios que suben | Carpeta de Google Drive **"RepuesTop Marketing"** | Drive la sincroniza en cada computador |
| Estado de cada entrega (recibido, revisando, trabajando, listo) | Una ficha por entrega en esa misma carpeta | Igual que los archivos |
| Planes, tareas, novedades, historial | Este repo en GitHub | Automático: al abrir el agente trae lo último y al terminar cada respuesta sube lo suyo |

- Si un colega ya subió un material, el panel lo muestra como **"Ya entregado por …"** para que nadie lo repita.
- Si dos personas cambian el mismo archivo a la vez, se combinan solos y queda la versión más reciente (con aviso).
- Sin Google Drive conectado, el panel **no deja subir archivos**, para que nada quede guardado solo en un computador.

---

## Qué hay en esta carpeta
| Carpeta | Contenido |
|---|---|
| `.claude/` | Comandos, skills (marketing y publicidad), permisos y ganchos automáticos |
| `CLAUDE.md` | Instrucciones y reglas del agente |
| `config/` | Marca, redes y repos que lee el agente (`local.json` es propio de cada computador y no se sube) |
| `conocimiento/`, `novedades/` | Ficha del producto y lo nuevo en RepuesTop, en lenguaje simple |
| `datos/` | Plan de hoy, plan de la semana, tareas y datos del panel |
| `scripts/` | Lectura de los repos, panel, entregas, revisión del computador y sincronización |
| `estudio/` | Plantillas de video (Remotion) |
