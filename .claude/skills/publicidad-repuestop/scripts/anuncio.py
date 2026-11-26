#!/usr/bin/env python3
"""Anuncios pagados de productos (Meta Ads) desde una ficha JSON.

Uso:
  python -I anuncio.py <ficha.json> --out <carpeta>

Genera: <nombre>_feed_4x5.png (1080x1350), <nombre>_vertical_9x16.png (1080x1920, texto dentro de la
zona segura de Reels: y entre 270 y 1250) y las tarjetas del carrusel <nombre>_carrusel_N.png (1080x1080).

La ficha:
{ "nombre": "real-spark", "tienda": "REAL REPUESTOS", "ciudad": "Santiago",
  "titulo": "¿Tienes un Spark?", "bajada": "Repuestos desde $19.021",
  "nota": "Precios al 25-nov, IVA incluido. Sujeto a stock.",
  "productos": [{"foto": "https://img.repuestop.cl/...", "nombre": "...", "auto": "...", "precio": "$...",
                 "zoom": 1.3}],  # 2 o 3 productos; zoom es opcional. Sin "foto": solo texto y sin carrusel
  "final": {"titulo": "...", "puntos": [["lupa", "..."]]} }
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pieza import FUENTES, ICONOS, PLANTILLAS, chrome, e, marca, uri  # noqa: E402

MEDIDAS = {"feed": (1080, 1350, "feed_4x5"), "vertical": (1080, 1920, "vertical_9x16"),
           "carrusel": (1080, 1080, "carrusel")}


# Regla del equipo (26-nov): ningún anuncio puede dar a entender que el envío viene incluido.
ENVIO = "Envío no incluido. A regiones se paga al recibir."


def envio(f):
    return f'<span class="envio">{e(f.get("envio") or ENVIO)}</span>'


def foto(p):
    if not p.get("foto"):
        return ""  # la tienda aún no sube foto: la tarjeta va solo con texto (nunca una foto inventada)
    if not str(p.get("foto", "")).startswith("https://img.repuestop.cl/"):
        sys.exit(f"La foto debe venir de https://img.repuestop.cl/: {p.get('foto')}")
    zoom = float(p.get("zoom", 1))  # acerca fotos con mucho margen; se recorta lo que sobra
    estilo = f' style="transform:scale({zoom});transform-origin:50% 45%"' if zoom != 1 else ""
    return f'<div class="foto"><img src="{e(p["foto"])}" alt=""{estilo}></div>'


def precio(p):
    clase = "precio" if p["precio"].startswith("$") else "precio cotizar"
    return f'<span class="{clase}">{e(p["precio"])}</span>'


def vende(f):
    return f'Vende {e(f["tienda"])}, {e(f["ciudad"])}'


def portada(f, formato):
    lista = f'n{len(f["productos"])}' if all(p.get("foto") for p in f["productos"]) else "lista"
    tarjetas = "".join(f'<li>{foto(p)}<div class="info"><b>{e(p["nombre"])}</b><small>{e(p["auto"])}</small>'
                       f'{precio(p)}</div></li>' for p in f["productos"])
    chip = '<span class="chip">Pago seguro con Flow</span>'
    pie = (f'<div class="pie"><p><b>{vende(f)}</b><br>{e(f["nota"])}{envio(f)}</p>'
           + ('<span class="web">repuestop.cl</span>' if formato == "feed" else "") + "</div>")
    cola = '<span class="lema">Movemos Chile juntos</span>' if formato == "vertical" else ""
    return (f'{marca(blanca=True)}{chip}<header><h1>{e(f["titulo"])}</h1><h2>{e(f["bajada"])}</h2></header>'
            f'<ul class="{lista}">{tarjetas}</ul>{pie}{cola}')


def tarjeta(f, p, i, total):
    return (f'{marca()}<span class="chip">{e(f["tienda"])} · {e(f["ciudad"])}</span>{foto(p)}'
            f'<div class="banda"><b>{e(p["nombre"])}</b><small>{e(p["auto"])}</small>'
            f'<div class="fila">{precio(p)}<span class="nota">{e(f["nota"])}{envio(f).replace(". ", ".<br>")}</span></div></div>')


def final(f):
    puntos = "".join(f"<li>{ICONOS[i]}<span>{e(t)}</span></li>" for i, t in f["final"]["puntos"])
    return (f'{marca(blanca=True)}<div class="cuerpo"><h1>{e(f["final"]["titulo"])}</h1><ul>{puntos}</ul>'
            f'<span class="web">repuestop.cl</span></div><p class="vende">{vende(f)}{envio(f)}</p>')


def foto_png(exe, tmp, cuerpo, clase, w, h, destino):
    html_path = Path(tmp) / (destino.stem + ".html")
    html_path.write_text(
        f'<!doctype html><html lang="es"><head><meta charset="utf-8"><link href="{FUENTES}" rel="stylesheet">'
        f'<link href="{uri(PLANTILLAS / "anuncio.css")}" rel="stylesheet"></head>'
        f'<body><section class="ad {clase}">{cuerpo}</section></body></html>', encoding="utf-8")
    subprocess.run([exe, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=10000",
                    "--force-device-scale-factor=1", f"--window-size={w},{h}", f"--screenshot={destino.resolve()}",
                    html_path.resolve().as_uri()], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"ok {destino}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("ficha")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    f = json.loads(Path(a.ficha).read_text(encoding="utf-8"))
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    exe = chrome()
    largo = " largo" if len(f["tienda"]) > 24 else ""  # nombres largos: letra más chica para no encimarse
    with tempfile.TemporaryDirectory() as tmp:
        for formato in ("feed", "vertical"):
            w, h, sufijo = MEDIDAS[formato]
            foto_png(exe, tmp, portada(f, formato), f"portada {formato}{largo}", w, h, out / f"{f['nombre']}_{sufijo}.png")
        if not all(p.get("foto") for p in f["productos"]):
            return  # el carrusel muestra un producto por tarjeta: sin fotos no se hace
        w, h, _ = MEDIDAS["carrusel"]
        total = len(f["productos"]) + 1
        for i, p in enumerate(f["productos"], 1):
            foto_png(exe, tmp, tarjeta(f, p, i, total), f"tarjeta{largo}", w, h, out / f"{f['nombre']}_carrusel_{i}.png")
        foto_png(exe, tmp, final(f), "final", w, h, out / f"{f['nombre']}_carrusel_{total}.png")


if __name__ == "__main__":
    main()
