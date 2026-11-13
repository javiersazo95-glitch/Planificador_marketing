"""Animación del cierre L2 para reels (1080x1920, 30 fps), hecha por código.

El auto del logo (solo la silueta) entra desde la derecha con las ruedas girando, enciende los focos y frena
con un cabeceo; luego aparecen el engranaje y el ✔, y entran «RepuesTop», el lema con su franja y el botón.
El último cuadro es idéntico a final_L2_reel.png.

Uso: python -I anim_final.py [--oferta "App en Google Play y en la web"] [--dur 4.6] [--out final_L2_animado.mp4]
"""
import argparse
import re
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import finales  # noqa: E402  (misma maqueta L2 que la lámina aprobada)
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent))  # noqa: E402
from rutas import SKILL, CHROME  # noqa: E402

LOGO = SKILL / "plantillas" / "assets" / "logo_icono.svg"
SFX = SKILL / "plantillas" / "sfx"
W, H, FPS = 1080, 1920, 30
CAP = AQUI / "anim_capas"

# Ubicación del ícono en la L2 reel (img.ico: 520 px de ancho, centrado, arriba en 520)
VB_X, VB_Y, VB_W = 187, 98, 2614
ICO_X, ICO_Y, ICO_W = 280, 520, 520
ESC = ICO_W / VB_W


def px(x, y):
    return ICO_X + (x - VB_X) * ESC, ICO_Y + (y - VB_Y) * ESC


# Subtrazos del logo (índices medidos): gris 0 = engranaje inferior, 1+6 rueda izq., 2+7 rueda der.,
# 3 barra, 5 parte trasera, 15 remate del ✔; azul 0 = carrocería, 1 = ✔, 2 = engranaje superior.
PIEZAS = {"carroceria": [(0, 3), (0, 5), (1, 0)], "rueda_izq": [(0, 1), (0, 6)], "rueda_der": [(0, 2), (0, 7)],
          "engranaje": [(0, 0), (1, 2)], "check": [(1, 1), (0, 15)]}
RUEDA_IZQ, RUEDA_DER = px(850, 1074), px(2250, 1073)
RADIO_RUEDA, RADIO_MAZA = (1077 - 622) / 2 * ESC, (952 - 742) / 2 * ESC
FOCO = px(262, 975)
CENTRO_ENGRANAJE = px(1190, 830)
CHECK_X0, CHECK_X1 = px(1361, 0)[0], px(2373, 0)[0]


def chrome(html, png):
    f = CAP / (png.stem + ".html")
    f.write_text(html, encoding="utf-8")
    subprocess.run([finales.CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000",
                    "--force-device-scale-factor=1", "--default-background-color=00000000", f"--window-size={W},{H}",
                    f"--screenshot={png}", f.as_uri()], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    f.unlink()


def capas(oferta):
    CAP.mkdir(exist_ok=True)
    finales.OFERTA = oferta
    base = finales.L2(H)
    doc = lambda extra, cuerpo=base: (f'<!doctype html><html lang="es"><head><meta charset="utf-8"><link href="{finales.FUENTES}" '
                                      f'rel="stylesheet"></head><body>{cuerpo}<style>{extra}</style></body></html>')
    oculto = ".ico,.c .wm,.lema,.pie{visibility:hidden}"
    transp = "body{background:transparent!important}"
    chrome(doc(oculto), CAP / "fondo.png")
    chrome(doc(transp + ".ico,.lema,.pie{visibility:hidden}"), CAP / "wm.png")
    chrome(doc(transp + ".ico,.c .wm,.pie{visibility:hidden}.lema span{border-color:transparent}"), CAP / "lema.png")
    chrome(doc(transp + ".ico,.c .wm,.pie{visibility:hidden}.lema span{color:transparent}"), CAP / "franja.png")
    chrome(doc(transp + ".ico,.c .wm,.lema{visibility:hidden}"), CAP / "pie.png")
    chrome(doc(""), CAP / "referencia.png")
    # Piezas del logo: mismo viewBox, se ponen en el lugar del ícono
    s = LOGO.read_text(encoding="utf-8")
    trazos = re.findall(r'<path[^>]*?fill="([^"]+)"[^>]*?d="([^"]+)"', s)
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    subs = [(f, ["M" + q for q in d.split("M")[1:]]) for f, d in trazos]
    for nombre, idx in PIEZAS.items():
        por_color = {}
        for i, k in idx:                       # un solo <path> por color: así evenodd respeta los huecos (maza de la rueda)
            por_color.setdefault(subs[i][0], []).append(subs[i][1][k])
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">' + "".join(
            f'<path fill="{col}" fill-rule="evenodd" d="{"".join(ds)}"/>' for col, ds in por_color.items()) + "</svg>"
        ruta = CAP / f"{nombre}.svg"; ruta.write_text(svg, encoding="utf-8")
        chrome(doc(transp + ".c .wm,.lema,.pie{visibility:hidden}", base.replace(LOGO.as_uri().replace(LOGO.name, "") + LOGO.name, ruta.as_uri())
                   if LOGO.as_uri() not in base else base.replace(LOGO.as_uri(), ruta.as_uri())), CAP / f"{nombre}.png")
    # Puente del techo: tapa el corte donde pasa el ✔ mientras solo se ve la silueta
    p = np.zeros((H, W, 4), np.uint8)
    cv2.line(p, (637, 589), (678, 609), (0xC2, 0x4E, 0x0F, 255), 19, cv2.LINE_AA)
    cv2.imwrite(str(CAP / "puente.png"), p)


def leer(n):
    im = cv2.imread(str(CAP / f"{n}.png"), cv2.IMREAD_UNCHANGED)
    if im.shape[2] == 3:
        im = np.dstack([im, np.full(im.shape[:2], 255, np.uint8)])
    return im.astype(np.float32)


def sobre(fondo, capa, alfa=1.0):
    if alfa <= 0:
        return
    a = capa[..., 3:4] / 255.0 * alfa
    fondo[...] = fondo * (1 - a) + capa[..., :3] * a


def mover(capa, dx=0, dy=0, ang=0, centro=(0, 0), esc=1.0):
    if dx == 0 and dy == 0 and ang == 0 and esc == 1.0:
        return capa
    m = cv2.getRotationMatrix2D(centro, ang, esc)
    m[0, 2] += dx; m[1, 2] += dy
    return cv2.warpAffine(capa, m, (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))


def tramo(t, a, b):
    return float(np.clip((t - a) / (b - a), 0, 1))


def suave(u):
    return u * u * (3 - 2 * u)


def sale(u):
    return 1 - (1 - u) ** 3


def foco_capa(cx, cy, intensidad):
    """Brillo amarillo en el foco y un haz hacia la izquierda (hacia donde mira el auto)."""
    c = np.zeros((H, W, 4), np.float32)
    if intensidad <= 0:
        return c
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.hypot(xx - cx, yy - cy)
    brillo = np.exp(-(d / 22) ** 2)
    dx = cx - xx
    haz = np.where(dx > 0, np.exp(-((yy - cy) / (8 + dx * 0.22)) ** 2) * np.exp(-dx / 260), 0)
    a = np.clip(brillo * 1.0 + haz * 0.55, 0, 1) * intensidad
    c[..., 0], c[..., 1], c[..., 2] = 0x05, 0xC8, 0xF8          # #F8C805 en BGR
    c[..., 3] = a * 255
    return c


def rayos(capa_vacia, x_cola, y, n_alfa):
    if n_alfa <= 0:
        return None
    for k, (dy, largo) in enumerate(((-38, 120), (0, 170), (38, 110))):
        x0 = int(x_cola + 30 + k * 18)
        cv2.line(capa_vacia, (x0, int(y + dy)), (x0 + largo, int(y + dy)), (0x5E, 0x4A, 0x3B, 255), 7, cv2.LINE_AA)
    return capa_vacia


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--oferta", default="App en Google Play y en la web")
    ap.add_argument("--dur", type=float, default=4.6)
    ap.add_argument("--out", default=str(AQUI / "final_L2_animado.mp4"))
    ap.add_argument("--sin-capas", action="store_true", help="reusa las capas ya generadas")
    a = ap.parse_args()
    if not a.sin_capas:
        capas(a.oferta)
    fondo = cv2.imread(str(CAP / "fondo.png")).astype(np.float32)
    L = {n: leer(n) for n in ["carroceria", "rueda_izq", "rueda_der", "engranaje", "check", "puente", "wm", "lema", "franja", "pie"]}

    T_LLEGA, DESDE = 1.45, 900.0
    def pos(t):                       # desplazamiento horizontal del auto (px a la derecha de su lugar)
        return DESDE * (1 - sale(tramo(t, 0, T_LLEGA)))
    sin_audio = Path(a.out).with_suffix(".sinaudio.mp4")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
                           "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", str(sin_audio)], stdin=subprocess.PIPE)
    n = int(round(a.dur * FPS))
    for i in range(n):
        t = i / FPS
        x = pos(t)
        vel = (pos(t) - pos(t + 1 / FPS)) * FPS                  # px/s
        f = fondo.copy()
        # Rayos de velocidad detrás (a la derecha) mientras se mueve
        av = float(np.clip(vel / 900, 0, 1))
        if av > 0.05:
            r = np.zeros((H, W, 4), np.float32)
            rayos(r, px(2797, 0)[0] + x, RUEDA_DER[1] - 60, av)
            sobre(f, r, av * 0.55)
        # Cabeceo al frenar: rota la carrocería sobre la rueda trasera (el frente baja)
        u = t - (T_LLEGA - 0.25)
        cab = 0.0
        if 0 <= u < 0.6:
            cab = 3.2 * np.exp(-u / 0.16) * np.sin(np.pi * u / 0.3)
        bote = 2.5 * np.sin(t * 38) * av
        carro = mover(L["carroceria"], x, bote, cab, (RUEDA_DER[0], RUEDA_DER[1]))
        puente = mover(L["puente"], x, bote, cab, (RUEDA_DER[0], RUEDA_DER[1]))
        # Engranaje (detrás del auto)
        ue = sale(tramo(t, 1.85, 2.35))
        if ue > 0:
            sobre(f, mover(L["engranaje"], 0, 0, -28 * (1 - ue), CENTRO_ENGRANAJE, 0.85 + 0.15 * ue), ue)
        sobre(f, carro)
        sobre(f, puente, 1 - tramo(t, 2.3, 2.6))
        # Ruedas: giran según lo recorrido (hacia la izquierda = antihorario); rayos de llanta solo en movimiento
        giro = np.degrees((DESDE - x) / RADIO_RUEDA)
        for nom, (cx, cy) in (("rueda_izq", RUEDA_IZQ), ("rueda_der", RUEDA_DER)):
            sobre(f, mover(L[nom], x, bote, 0))
            al = min(1.0, av * 3)
            if al > 0.02:
                rr = np.zeros((H, W, 4), np.float32)
                for k in range(3):
                    th = np.radians(giro + k * 120)
                    p0 = (int(cx + x), int(cy + bote))
                    p1 = (int(cx + x + np.cos(th) * (RADIO_MAZA + 4)), int(cy + bote - np.sin(th) * (RADIO_MAZA + 4)))
                    cv2.line(rr, p0, p1, (0x5E, 0x4A, 0x3B, 255), 6, cv2.LINE_AA)
                sobre(f, rr, al)
        # Focos: parpadean al partir, quedan encendidos y se apagan cuando aparece la marca
        luz = 0.0
        if 0.22 <= t < 0.3 or 0.36 <= t:
            luz = 1.0
        luz *= 1 - tramo(t, 2.2, 2.6)
        if luz > 0:
            fx, fy = FOCO
            sobre(f, foco_capa(fx + x, fy + bote, luz))
        # ✔ que se dibuja de izquierda a derecha
        uc = suave(tramo(t, 2.3, 2.75))
        if uc > 0:
            c = L["check"].copy()
            corte = int(CHECK_X0 + (CHECK_X1 - CHECK_X0 + 20) * uc)
            c[:, corte:, 3] = 0
            sobre(f, c)
        # Marca, lema, franja y botón
        uw = sale(tramo(t, 2.75, 3.15))
        if uw > 0:
            sobre(f, mover(L["wm"], 0, 30 * (1 - uw)), uw)
        ul = sale(tramo(t, 3.1, 3.4))
        if ul > 0:
            sobre(f, L["lema"], ul)
        uf = sale(tramo(t, 3.3, 3.7))
        if uf > 0:
            fr = L["franja"].copy()
            ys, xs = np.where(fr[..., 3] > 0)
            if len(xs):
                cx = (xs.min() + xs.max()) / 2; mitad = (xs.max() - xs.min()) / 2 * uf
                fr[:, :int(cx - mitad), 3] = 0; fr[:, int(cx + mitad) + 1:, 3] = 0
            sobre(f, fr)
        up = tramo(t, 3.7, 4.0)
        if up > 0:
            esc = 0.85 + 0.15 * sale(up) + 0.05 * np.sin(np.pi * up) * (up < 1)
            ys, xs = np.where(L["pie"][..., 3] > 0)
            sobre(f, mover(L["pie"], 0, 0, 0, ((xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2), esc), sale(up))
        ff.stdin.write(np.clip(f, 0, 255).astype(np.uint8).tobytes())
        if i == n - 1:
            cv2.imwrite(str(CAP / "ultimo_cuadro.png"), np.clip(f, 0, 255).astype(np.uint8))
    ff.stdin.close(); ff.wait()
    # Sonido: motor, clics de luces, frenada, pops de la marca
    ef = [("motor", 0.0, -6), ("clic", 0.22, -12), ("clic", 0.36, -12), ("frenada", 1.18, -14),
          ("pop", 1.9, -16), ("pop", 2.35, -14), ("pop", 2.8, -15), ("pop", 3.15, -16), ("pop", 3.72, -13)]
    entradas, filtros = [], []
    for k, (nom, t0, db) in enumerate(ef):
        entradas += ["-i", str(SFX / f"{nom}.wav")]
        filtros.append(f"[{k + 1}:a]adelay={int(t0 * 1000)}|{int(t0 * 1000)},volume={db}dB[a{k}]")
    mezcla = "".join(f"[a{k}]" for k in range(len(ef)))
    filtro = ";".join(filtros) + f";{mezcla}amix=inputs={len(ef)}:normalize=0,apad=whole_dur={a.dur},atrim=0:{a.dur}[a]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(sin_audio), *entradas, "-filter_complex", filtro,
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", str(a.dur), a.out], check=True)
    sin_audio.unlink()
    ref = cv2.imread(str(CAP / "referencia.png")).astype(int)
    ult = cv2.imread(str(CAP / "ultimo_cuadro.png")).astype(int)
    print("ok", a.out, f"({a.dur} s) · diferencia del último cuadro con la L2: {np.abs(ref - ult).mean():.2f}")


if __name__ == "__main__":
    main()
