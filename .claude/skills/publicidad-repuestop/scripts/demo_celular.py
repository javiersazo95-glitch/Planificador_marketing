#!/usr/bin/env python3
"""Demo de la app dentro de un marco de celular, sobre fondo de marca, con desplazamiento y zoom suaves.

Toma grabaciones de pantalla (.mp4) o capturas (.png/.jpg) y entrega un clip vertical 1080x1920 sin
audio, listo para usar como medio en `editar-video/montar_video.py`. Hace en casa lo que nos gustó
de openvid (cuya licencia no permite uso comercial).

Uso:
  python -I demo_celular.py ejemplo <demo.json>          # ficha de ejemplo
  python -I demo_celular.py render <demo.json> [--out clip.mp4] [--preview 5]

Ficha (rutas relativas a la ficha):
{
  "fondo": "azul" | "blanco" | "textura" | "claro" | "navy",
  "fps": 30,
  "pantalla": [1080, 2063],                       # opcional: proporción del contenido tras quitar franjas
  (por toma) "quitar_franjas": [[70, 212], [2205, 2340]]   # quita barra del navegador y navegación de Android
  "tomas": [
    {"archivo": "pantallas/cotizaciones.png", "dur": 4.0,
     "scroll": [0.0, 0.35],                       # opcional: recorre la captura de arriba (0) hacia abajo (1)
     "zoom": [{"t": 1.0, "x": 0.5, "y": 0.30, "escala": 1.6, "dur": 0.7},
              {"t": 3.0, "escala": 1.0, "dur": 0.6}]},
    {"archivo": "grabaciones/pin.mp4", "ini": 2.0, "dur": 5.0}
  ]
}
- x, y del zoom: punto de la PANTALLA del celular (0-1) que se acerca al centro. escala 1 = sin zoom.
- toques (por toma, opcional): [1.2, 3.4] = segundos de la toma en que el dedo toca la pantalla (suena un clic).
- Además del .mp4 deja `<clip>_sfx.json` con los efectos de sonido (zoom, corte entre tomas y toques), que
  `reel.py` mezcla solo cuando usa el clip.
- Videos: se usan desde `ini` durante `dur` segundos. Capturas: quedan fijas (o se desplazan con `scroll`).
Requiere opencv-python, numpy, Pillow y ffmpeg en el PATH.
"""
import argparse
import json
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
# Pantalla del celular: proporción 1080x2340 (la del Redmi Note 8 Pro de las grabaciones).
SH = 1400
SW = round(SH * 1080 / 2340)          # 646
BISEL = 20
RADIO_PANT = 52
SX = (W - SW) // 2
SY = (H - SH) // 2 - 10
AZUL, AZUL2, AZUL_OSC = (15, 78, 194), (63, 122, 224), (10, 52, 140)


def geometria(ancho, alto):
    """Ajusta el celular a la proporción del contenido (por ejemplo, tras quitar la barra del navegador)."""
    global SW, SX
    SW = round(SH * ancho / alto)
    SX = (W - SW) // 2


def suave(p):
    """Curva de entrada y salida suave (0..1 -> 0..1)."""
    p = min(max(p, 0.0), 1.0)
    return p * p * (3 - 2 * p)


def fondo_y_marco(tipo):
    """Fondo de marca + cuerpo del celular (BGR) y máscara alfa de la pantalla."""
    k = 2  # se dibuja al doble y se reduce: bordes suaves
    img = Image.new("RGB", (W * k, H * k), (255, 255, 255))
    d = ImageDraw.Draw(img)
    if tipo in ("textura", "claro", "navy", "azul-sin-ola", "pizarra", "celeste", "acero"):
        # Fondos de marca renderizados con Chrome desde plantillas/ (misma hoja de estilos que las tarjetas):
        # textura = azul con ola (T-1); claro = blanco con textura, sin ola; navy = azul marino con textura, sin ola.
        archivo = "fondo.html" if tipo == "textura" else f"fondo_{tipo}.html"
        png = Path(tempfile.gettempdir()) / f"repuestop_fondo_{tipo}.png"
        html = Path(__file__).resolve().parent.parent / "plantillas" / archivo
        chrome = next((c for c in (r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                                   r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                                   shutil.which("chrome") or "", shutil.which("google-chrome") or "") if c and Path(c).exists()), None)
        if not chrome:
            sys.exit(f"Para el fondo '{tipo}' hace falta Chrome")
        subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=4000",
                        f"--window-size={W},{H}", f"--screenshot={png}", html.as_uri()],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        img = Image.open(png).convert("RGB").resize((W * k, H * k), Image.LANCZOS)
        d = ImageDraw.Draw(img)
    elif tipo == "azul":
        for y in range(H * k):  # degradado vertical
            f = y / (H * k)
            c = tuple(round(AZUL[i] * (1 - f) + AZUL_OSC[i] * f) for i in range(3))
            d.line([(0, y), (W * k, y)], fill=c)
        ola_color, ola_color2 = AZUL2, (255, 255, 255)
    else:
        ola_color, ola_color2 = AZUL2, AZUL
    # Ola inferior, como en las piezas aprobadas (la textura ya la trae)
    pts, pts2 = [], []
    if tipo in ("textura", "claro", "navy", "azul-sin-ola", "pizarra", "celeste", "acero"):
        pts = None
    if pts is not None:
        for x in range(0, W * k + 1, 8):
            u = x / (W * k)
            pts.append((x, (H - 300 + 40 * math.sin(u * math.pi * 1.6 + 0.6)) * k))
            pts2.append((x, (H - 270 + 40 * math.sin(u * math.pi * 1.6 + 0.9)) * k))
        d.polygon(pts + [(W * k, H * k), (0, H * k)], fill=ola_color)
        if tipo == "blanco":
            d.polygon(pts2 + [(W * k, H * k), (0, H * k)], fill=ola_color2)
    # Sombra del celular
    sombra = Image.new("L", (W * k, H * k), 0)
    ImageDraw.Draw(sombra).rounded_rectangle(
        [(SX - BISEL + 14) * k, (SY - BISEL + 30) * k, (SX + SW + BISEL + 14) * k, (SY + SH + BISEL + 30) * k],
        radius=(RADIO_PANT + BISEL) * k, fill=110)
    sombra = sombra.filter(ImageFilter.GaussianBlur(28 * k))
    img.paste((0, 0, 0), mask=sombra)
    # Cuerpo y borde del celular
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([(SX - BISEL) * k, (SY - BISEL) * k, (SX + SW + BISEL) * k, (SY + SH + BISEL) * k],
                        radius=(RADIO_PANT + BISEL) * k, fill=(17, 20, 28), outline=(70, 78, 96), width=3 * k)
    img = img.resize((W, H), Image.LANCZOS)
    mascara = Image.new("L", (SW * k, SH * k), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, SW * k - 1, SH * k - 1], radius=RADIO_PANT * k, fill=255)
    mascara = mascara.resize((SW, SH), Image.LANCZOS)
    base = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    alfa = (np.array(mascara, dtype=np.float32) / 255.0)[..., None]
    return base, alfa


class Toma:
    def __init__(self, spec, carpeta, fps):
        self.spec = spec
        self.dur = float(spec["dur"])
        self.carpeta = carpeta
        self.parches = {}
        ruta = (carpeta / spec["archivo"]).resolve()
        if not ruta.exists():
            sys.exit(f"No existe: {ruta}")
        self.es_video = ruta.suffix.lower() in (".mp4", ".mov", ".webm", ".mkv")
        if self.es_video:
            # Las grabaciones del celular (screenrecord) tienen cuadros por segundo variables: OpenCV
            # calcula mal los tiempos. Se pasa el video completo a cuadros constantes (eso rellena los
            # momentos en que la pantalla estuvo quieta y screenrecord no grabó cuadros) y luego se
            # recorta el tramo, que se lee desde 0.
            ini = float(spec.get("ini", 0))
            tramo = Path(tempfile.gettempdir()) / f"demo_celular_{abs(hash((str(ruta), ini, self.dur)))}.mp4"
            subprocess.run([shutil.which("ffmpeg") or "ffmpeg", "-y", "-loglevel", "error", "-i", str(ruta),
                            "-vf", f"fps={fps},trim=start={ini}:duration={self.dur + 0.5},setpts=PTS-STARTPTS",
                            "-an", "-c:v", "libx264", "-crf", "12", "-preset", "veryfast", str(tramo)], check=True)
            self.cap = cv2.VideoCapture(str(tramo))
            self.vfps = fps
            self.idx_leido, self.ultimo = -1, None
        else:
            img = cv2.imread(str(ruta), cv2.IMREAD_COLOR)
            if img is None:
                sys.exit(f"No pude leer la imagen: {ruta}")
            self.img = img

    def cuadro(self, t):
        if not self.es_video:
            return self.img
        objetivo = int(t * self.vfps)
        while self.idx_leido < objetivo:
            ok, f = self.cap.read()
            if not ok:
                break
            self.ultimo, self.idx_leido = f, self.idx_leido + 1
        if self.ultimo is None:
            sys.exit(f"El video de {self.spec['archivo']} no tiene cuadros en ese tramo")
        return self.ultimo

    def pantalla(self, t):
        """Contenido ajustado al tamaño de la pantalla (SW x SH), con desplazamiento si corresponde."""
        src = self.cuadro(t)
        if self.spec.get("tapar") or self.spec.get("parches"):
            src = src.copy()
        # Tapar zonas con un color (íconos de notificación, datos que no deben verse): [x0, y0, x1, y1, "#RRGGBB"]
        for x0, y0, x1, y1, color in self.spec.get("tapar", []):
            c = color.lstrip("#")
            src[y0:y1, x0:x1] = (int(c[4:6], 16), int(c[2:4], 16), int(c[0:2], 16))
        # Parches de imagen (por ejemplo, una portada con marca ajena): {"archivo", "caja": [x0,y0,x1,y1], "hasta": s}
        for p in self.spec.get("parches", []):
            if t > float(p.get("hasta", 1e9)):
                continue
            x0, y0, x1, y1 = p["caja"]
            img = self.parches.get(p["archivo"])
            if img is None:
                img = cv2.imread(str((self.carpeta / p["archivo"]).resolve()), cv2.IMREAD_COLOR)
                if img is None:
                    sys.exit(f"No pude leer el parche {p['archivo']}")
                img = self.parches[p["archivo"]] = cv2.resize(img, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
            src[y0:y1, x0:x1] = img
        franjas = self.spec.get("quitar_franjas")    # [[y0, y1], ...] en px del original: barra del navegador, etc.
        if franjas:
            conservar, y = [], 0
            for y0, y1 in sorted(franjas):
                if y0 > y:
                    conservar.append(src[y:y0])
                y = max(y, y1)
            conservar.append(src[y:])
            src = np.vstack([c for c in conservar if len(c)])
        h, w = src.shape[:2]
        scroll = self.spec.get("scroll")
        esc = SW / w
        alto = h * esc
        if alto < SH:                          # no alcanza a llenar el alto: se llena y se recorta al centro
            esc = SH / h
            scroll = None
        m = cv2.resize(src, (round(w * esc), round(h * esc)), interpolation=cv2.INTER_AREA)
        mh, mw = m.shape[:2]
        x0 = max(0, (mw - SW) // 2)
        sobra = max(0, mh - SH)
        if scroll:
            a, b = scroll
            p = a + (b - a) * suave(t / self.dur)
            y0 = round(sobra * p)
        else:
            y0 = 0 if self.es_video is False and alto >= SH else sobra // 2
        recorte = m[y0:y0 + SH, x0:x0 + SW]
        if recorte.shape[0] < SH or recorte.shape[1] < SW:   # relleno blanco si faltara
            lienzo = np.full((SH, SW, 3), 255, np.uint8)
            lienzo[:recorte.shape[0], :recorte.shape[1]] = recorte
            recorte = lienzo
        return recorte


def camara(zooms, t):
    """Estado (cx, cy, escala) de la cámara en el segundo t de la toma."""
    estado = (W / 2, H / 2, 1.0)
    for z in sorted(zooms or [], key=lambda z: z["t"]):
        if t < z["t"]:
            break
        s = float(z.get("escala", 1.0))
        if s <= 1.0:
            meta = (W / 2, H / 2, 1.0)
        else:
            meta = (SX + float(z.get("x", 0.5)) * SW, SY + float(z.get("y", 0.5)) * SH, s)
        d = float(z.get("dur", 0.6))
        # dur ≈ 0 = salto inmediato (si no, el primer cuadro sale sin zoom y se ve un parpadeo)
        p = 1.0 if d <= 0.05 else suave((t - z["t"]) / d)
        estado = tuple(estado[i] + (meta[i] - estado[i]) * p for i in range(3))
    cx, cy, s = estado
    # No mostrar fuera del lienzo
    mx, my = W / (2 * s), H / (2 * s)
    return min(max(cx, mx), W - mx), min(max(cy, my), H - my), s


def render(ficha, out, preview=None):
    ficha_path = Path(ficha).resolve()
    spec = json.loads(ficha_path.read_text(encoding="utf-8"))
    fps = int(spec.get("fps", 30))
    if spec.get("pantalla"):                        # [ancho, alto] del contenido ya recortado
        geometria(*spec["pantalla"])
    base, alfa = fondo_y_marco(spec.get("fondo", "azul"))
    tomas = [Toma(t, ficha_path.parent, fps) for t in spec["tomas"]]
    total = sum(t.dur for t in tomas)
    if preview:
        total = min(total, float(preview))
    out = Path(out or ficha_path.with_suffix(".mp4"))
    out.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg") or sys.exit("No encontré ffmpeg en el PATH")
    proc = subprocess.Popen([ffmpeg, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
                             "-s", f"{W}x{H}", "-r", str(fps), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                             "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)],
                            stdin=subprocess.PIPE)
    n = round(total * fps)
    inicio, k = 0.0, 0
    zona = (slice(SY, SY + SH), slice(SX, SX + SW))
    for toma in tomas:
        cuadros = round(toma.dur * fps)
        for j in range(cuadros):
            if k >= n:
                break
            t = j / fps
            lienzo = base.copy()
            pant = toma.pantalla(t).astype(np.float32)
            lienzo[zona] = (pant * alfa + lienzo[zona].astype(np.float32) * (1 - alfa)).astype(np.uint8)
            cx, cy, s = camara(toma.spec.get("zoom"), t)
            if s > 1.0001:
                M = np.float32([[s, 0, W / 2 - s * cx], [0, s, H / 2 - s * cy]])
                lienzo = cv2.warpAffine(lienzo, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            proc.stdin.write(lienzo.tobytes())
            k += 1
        inicio += toma.dur
    proc.stdin.close()
    if proc.wait() != 0:
        sys.exit("ffmpeg falló")
    sfx = efectos_sonido(tomas, total)
    out.with_name(out.stem + "_sfx.json").write_text(json.dumps(sfx, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"ok {out} ({k / fps:.1f} s) + {len(sfx)} efectos de sonido en {out.stem}_sfx.json")


def efectos_sonido(tomas, total):
    """Momentos con sonido: zoom de entrada o salida, corte entre tomas y toques del dedo."""
    ev, inicio = [], 0.0
    for i, toma in enumerate(tomas):
        if i > 0:
            ev.append({"t": round(inicio, 3), "sfx": "corte"})
        escala = 1.0
        for z in sorted(toma.spec.get("zoom") or [], key=lambda z: z["t"]):
            s, d = float(z.get("escala", 1.0)), float(z.get("dur", 0.6))
            if d > 0.05 and abs(s - escala) > 0.05:     # los saltos inmediatos no suenan
                ev.append({"t": round(inicio + float(z["t"]), 3), "sfx": "zoom" if s > escala else "zoom_salida",
                           "dur": d})
            escala = s
        for tq in toma.spec.get("toques") or []:
            ev.append({"t": round(inicio + float(tq), 3), "sfx": "clic"})
        inicio += toma.dur
    return sorted((e for e in ev if e["t"] < total), key=lambda e: e["t"])


EJEMPLO = {
    "fondo": "azul", "fps": 30,
    "tomas": [
        {"archivo": "pantallas/captura1.png", "dur": 4.0, "scroll": [0.0, 0.3],
         "zoom": [{"t": 1.0, "x": 0.5, "y": 0.3, "escala": 1.6, "dur": 0.7}, {"t": 3.0, "escala": 1.0, "dur": 0.6}]},
        {"archivo": "grabaciones/clip1.mp4", "ini": 0.0, "dur": 5.0},
    ],
}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    e = sub.add_parser("ejemplo")
    e.add_argument("ficha")
    r = sub.add_parser("render")
    r.add_argument("ficha")
    r.add_argument("--out")
    r.add_argument("--preview", type=float, help="solo los primeros N segundos")
    a = ap.parse_args()
    if a.cmd == "ejemplo":
        Path(a.ficha).write_text(json.dumps(EJEMPLO, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"ok {a.ficha}")
    else:
        render(a.ficha, a.out, a.preview)


if __name__ == "__main__":
    main()
