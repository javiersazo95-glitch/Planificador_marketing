"""Tapa datos personales (patente, chasis, direcciones, nombres de tiendas) en una grabacion de pantalla.

Como funciona: para cada dato se recorta UNA vez una "plantilla" (una imagen del texto) desde un cuadro de
referencia, y el script la busca en todos los cuadros del video (OpenCV). Donde la encuentra, aplica
desenfoque + mosaico. Sirve aunque la pantalla se desplace.

Uso:
  python -I censurar_pantalla.py config.json entrada.mp4 salida.mp4 [--solo-detectar]

El config.json se explica en LEEME.md (hay un ejemplo en ejemplo_config.json).
Ojo: los cuadros de referencia traen los datos reales. Guardalos fuera del repo (por ejemplo en Drive o en una carpeta temporal).
Despues de generar, REVISA el resultado a ojo (ver LEEME.md): las transiciones y los textos cortados pueden escaparse.
"""
import json
import subprocess
import sys
from pathlib import Path

import cv2


def cargar_config(ruta):
    cfg = json.load(open(ruta, encoding="utf-8"))
    base = Path(ruta).resolve().parent
    cfg["_refs"] = (base / cfg.get("referencias", ".")).resolve()
    cfg["_cache"] = (base / cfg.get("cache", "cache_censura")).resolve()
    return cfg


def plantilla(cfg, p):
    im = cv2.imread(str(cfg["_refs"] / p["ref"]))
    if im is None:
        raise SystemExit(f"No encuentro el cuadro de referencia {p['ref']} en {cfg['_refs']}")
    x0, y0, x1, y1 = p["caja"]
    gris = cv2.cvtColor(im[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY)
    return cv2.resize(gris, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)   # se busca a media resolucion


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 3:
        raise SystemExit(__doc__)
    cfg_ruta, entrada, salida = args
    solo_detectar = "--solo-detectar" in sys.argv
    cfg = cargar_config(cfg_ruta)

    # nombre -> (plantilla, umbral, (izq, arriba, der, abajo), grupo)
    plantillas = {}
    for nombre, p in cfg["plantillas"].items():
        plantillas[nombre] = (plantilla(cfg, p), p.get("umbral", 0.7), p.get("margen", [22, 16, 22, 16]), p.get("grupo", "a"))

    cap = cv2.VideoCapture(entrada)
    W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    def leer_todo():
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        i = 0
        while True:
            ok, fr = cap.read()
            if not ok:
                break
            yield i, fr
            i += 1

    def detectar(gris, grupo):
        gris = cv2.resize(gris, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
        cajas = []
        for nom, (pl, umb, (ml, mt, mr, mb), g) in plantillas.items():
            if g != grupo:
                continue
            h, w = pl.shape
            r = cv2.matchTemplate(gris, pl, cv2.TM_CCOEFF_NORMED)
            for _ in range(3):
                _, mv, _, loc = cv2.minMaxLoc(r)
                if mv < umb:
                    break
                x, y = loc
                cajas.append((nom, 2 * x - ml, 2 * y - mt, 2 * (x + w) + mr, 2 * (y + h) + mb, round(float(mv), 3)))
                r[max(0, y - h):y + h, max(0, x - w):x + w] = -1
        return cajas

    # 1) detectar (un archivo de cache por grupo: si agregas plantillas, ponlas en un grupo nuevo y solo se calcula ese)
    cfg["_cache"].mkdir(parents=True, exist_ok=True)
    det = {i: [] for i in range(n)}
    for grupo in sorted({p[3] for p in plantillas.values()}):
        cache = cfg["_cache"] / f"grupo_{grupo}.json"
        if cache.exists():
            d = {int(k): v for k, v in json.load(open(cache)).items()}
        else:
            d = {i: detectar(cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY), grupo) for i, fr in leer_todo()}
            json.dump(d, open(cache, "w"))
        for i, cs in d.items():
            det.setdefault(i, []).extend(cs)

    resumen = {}
    for i, cs in det.items():
        for c in cs:
            resumen.setdefault(c[0], []).append(i)
    for k, v in resumen.items():
        v = sorted(v)
        segs = []
        a = b = v[0]
        for i in v[1:]:
            if i - b > 3:
                segs.append((a, b))
                a = i
            b = i
        segs.append((a, b))
        print(k, len(v), "cuadros:", ", ".join(f"{x / fps:.1f}-{y / fps:.1f}s" for x, y in segs))
    if solo_detectar:
        return

    # 2) cada caja tambien se aplica en los 2 cuadros vecinos (por si el texto se mueve o aparece de a poco)
    cajas = {i: [] for i in range(n)}
    for i, cs in det.items():
        for c in cs:
            for j in range(max(0, i - 2), min(n, i + 3)):
                cajas[j].append(c[1:5])
    # zonas fijas por tiempo: textos cortados o deslizando que la plantilla no calza (se descubren al revisar a ojo)
    for e in cfg.get("extra", []):
        for j in range(max(0, int(e["desde"] * fps)), min(n, int(e["hasta"] * fps) + 1)):
            cajas[j].append(tuple(e["caja"]))

    def tapar(img, x0, y0, x1, y1):
        x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
        if x1 <= x0 or y1 <= y0:
            return
        roi = cv2.GaussianBlur(img[y0:y1, x0:x1], (0, 0), 14)
        h, w = roi.shape[:2]
        pq = cv2.resize(roi, (max(1, w // 18), max(1, h // 18)), interpolation=cv2.INTER_LINEAR)
        img[y0:y1, x0:x1] = cv2.resize(pq, (w, h), interpolation=cv2.INTER_NEAREST)

    # 3) escribir (el audio se copia tal cual)
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", f"{fps}", "-i", "-",
           "-i", entrada, "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-crf", "17", "-preset", "medium",
           "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest", salida]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i, fr in leer_todo():
        for b in cajas.get(i, []):
            tapar(fr, *[int(v) for v in b])
        p.stdin.write(fr.tobytes())
    p.stdin.close()
    p.wait()
    print("listo:", salida)


if __name__ == "__main__":
    main()
