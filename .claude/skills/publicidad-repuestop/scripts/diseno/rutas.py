"""Rutas comunes de los scripts de diseño (portadas, intermedias, finales, cierre animado, sonido).

- SKILL: carpeta de la skill publicidad-repuestop (trae plantillas/ con logos, fuentes y sonidos).
- CHROME: Chrome o Edge para renderizar HTML a imagen. Se puede forzar con REPUESTOP_NAVEGADOR.
- ED: carpeta de edición con los reels y los sonidos del cierre (sonidos_cierre/). Se puede cambiar con REPUESTOP_EDICION.
"""
import os
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
SKILL = AQUI.parents[1]
sys.path.insert(0, str(AQUI))
sys.path.insert(0, str(AQUI.parent))   # para `from sfx import ruta_efecto`

def _navegador():
    for c in (os.environ.get("REPUESTOP_NAVEGADOR"),
              r"C:\Program Files\Google\Chrome\Application\chrome.exe",
              r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"):
        if c and Path(c).exists():
            return c
    raise SystemExit("No encontré Chrome ni Edge. Instala uno o define REPUESTOP_NAVEGADOR.")

CHROME = _navegador()
ED = Path(os.environ.get("REPUESTOP_EDICION", r"C:\Users\SMK GAMING\Downloads\Repuestop\Edicion\redes"))
