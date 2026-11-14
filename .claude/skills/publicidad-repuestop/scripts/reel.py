#!/usr/bin/env python3
"""Arma un reel vertical de RepuesTop: tarjetas (PNG de pieza.py) + clips (demo_celular.py u otros) + voz
+ subtítulos pegados con la palabra activa en amarillo de marca. Deja además una hoja de contacto.

Uso:
  python -I reel.py render <reel.json> [--out reel.mp4]

Ficha (rutas relativas a la ficha):
{
  "voz": "voz.wav",                         # narración ya lista (−16 LUFS); manda la duración
  "musica": {"archivo": "pista.mp3", "db": -22},   # opcional; solo con licencia comercial
  "cola": 0.8,                              # segundos de imagen después de la voz
  "escenas": [
    {"archivo": "e1_gancho.png", "hasta": 4.08, "empuje": 0.04},  # imagen: acercamiento suave (4 %)
    {"archivo": "demo.mp4", "hasta": 20.34},                       # video: se usa desde su inicio
    {"archivo": "e5_cierre.png", "hasta": "fin"}
  ],
  "efectos": [{"t": 3.4, "sfx": "pop", "db": -10}],   # opcional: efectos manuales (ver sfx.py lista)
  "sfx_auto": true,                        # por defecto: whoosh en cada cambio de escena + los efectos del
                                           # `<clip>_sfx.json` que deja demo_celular.py (zoom, cortes, toques)
  "rotulos": [{"archivo": "gancho.png", "ini": 0, "fin": 3.2}],   # opcional: PNG 1080x1920 con transparencia
                                           # encima del video en ese tramo (p. ej. el gancho sobre el chat)
  "subtitulos": [                          # solo donde la imagen no trae ya el texto
    {"ini": 9.14, "fin": 13.64, "texto": "En RepuesTop, cada consulta llega ordenada, por producto."}
  ]
}
"hasta" = segundo del reel en que termina la escena ("fin" = voz + cola). Requiere ffmpeg con libass,
OpenCV, numpy y la fuente Montserrat instalada (C:/Windows/Fonts/Montserrat-Bold.otf).
"""
import argparse
import json
import math
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))   # con python -I no entra la carpeta del script
from sfx import ruta_efecto  # noqa: E402

W, H, FPS = 1080, 1920, 30
AMARILLO_ASS = "&H0005C8F8&"   # #F8C805 en formato ASS (BGR)
NAVY_ASS = "&H00402418&"       # #1B2440


# Volumen por defecto (dB) y adelanto (s) para que el punto fuerte del sonido caiga justo en el momento
SFX_DB = {"corte": -15, "zoom": -18, "zoom_salida": -20, "clic": -13, "pop": -12, "sello": -8,
          "vibrar": -12, "ding": -14, "deslizar": -17}
SFX_ADELANTO = {"corte": 0.29, "clic": 0.005}


def ffmpeg(*args):
    exe = shutil.which("ffmpeg") or sys.exit("No encontré ffmpeg en el PATH")
    subprocess.run([exe, "-y", "-loglevel", "error", *map(str, args)], check=True)


def duracion(ruta):
    exe = shutil.which("ffprobe") or sys.exit("No encontré ffprobe")
    r = subprocess.run([exe, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(ruta)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def suave(p):
    p = min(max(p, 0.0), 1.0)
    return p * p * (3 - 2 * p)


def clip_imagen(png, dur, empuje, salida):
    """Imagen fija con acercamiento suave sub-píxel (sin el temblor de zoompan)."""
    img = cv2.imread(str(png), cv2.IMREAD_COLOR)
    if img is None:
        sys.exit(f"No pude leer {png}")
    img = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    proc = subprocess.Popen([shutil.which("ffmpeg"), "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
                             "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16",
                             "-pix_fmt", "yuv420p", str(salida)], stdin=subprocess.PIPE)
    n = round(dur * FPS)
    for k in range(n):
        s = 1.0 + empuje * suave(k / max(n - 1, 1))
        M = np.float32([[s, 0, W / 2 * (1 - s)], [0, s, H / 2 * (1 - s)]])
        proc.stdin.write(cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        sys.exit("ffmpeg falló al armar una escena de imagen")


def clip_video(src, dur, salida):
    ffmpeg("-i", src, "-t", f"{dur:.3f}", "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},tpad=stop_mode=clone:stop_duration=2",
           "-t", f"{dur:.3f}", "-an", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", salida)


def ass_tiempo(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def subtitulos_ass(subs, ruta):
    """Grupos de hasta 3 palabras; un evento por palabra con la palabra activa en amarillo."""
    cab = ("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 0\n\n"
           "[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
           "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
           "MarginL, MarginR, MarginV, Encoding\n"
           f"Style: Sub,Montserrat,76,&H00FFFFFF,&H00FFFFFF,{NAVY_ASS},&H64000000,-1,0,0,0,100,100,0,0,1,7,2,2,90,90,330,1\n\n"
           "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
    ev = []
    for s in subs:
        palabras = s["texto"].upper().split()
        ini, fin = float(s["ini"]), float(s["fin"])
        pesos = [len(re.sub(r"[^\wÁÉÍÓÚÑÜ]", "", p)) + 2 for p in palabras]   # duración ~ largo de la palabra
        total, t = sum(pesos), ini
        tiempos = []
        for p in pesos:
            d = (fin - ini) * p / total
            tiempos.append((t, t + d)); t += d
        # Grupos de hasta 3 palabras y 16 caracteres: siempre en una sola línea
        grupos, actual = [], []
        for i, p in enumerate(palabras):
            largo = sum(len(palabras[j]) + 1 for j in actual) + len(p)
            if actual and (len(actual) == 3 or largo > 16):
                grupos.append(actual); actual = []
            actual.append(i)
        if actual:
            grupos.append(actual)
        for g in grupos:
            for i in g:
                texto = " ".join((f"{{\\c{AMARILLO_ASS}}}{palabras[j]}{{\\c&H00FFFFFF&}}" if j == i else palabras[j]) for j in g)
                ev.append(f"Dialogue: 0,{ass_tiempo(tiempos[i][0])},{ass_tiempo(tiempos[i][1])},Sub,,0,0,0,,{texto}")
    Path(ruta).write_text(cab + "\n".join(ev) + "\n", encoding="utf-8")


def hoja(video, salida, n=8):
    d = duracion(video)
    with tempfile.TemporaryDirectory() as tmp:
        cuadros = []
        for k in range(n):
            t = d * (k + 0.5) / n
            f = Path(tmp) / f"h{k}.png"
            ffmpeg("-ss", f"{t:.2f}", "-i", video, "-frames:v", "1", "-vf", "scale=216:-1", f)
            cuadros.append(f)
        args = []
        for f in cuadros:
            args += ["-i", f]
        ffmpeg(*args, "-filter_complex", f"hstack={n}", salida)


def render(ficha, out):
    ficha = Path(ficha).resolve()
    base = ficha.parent
    spec = json.loads(ficha.read_text(encoding="utf-8"))
    voz = base / spec["voz"]
    total = duracion(voz) + float(spec.get("cola", 0.8))
    out = Path(out or ficha.with_suffix(".mp4"))
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        partes, t0 = [], 0.0
        auto = spec.get("sfx_auto", True)
        efectos = [dict(e) for e in spec.get("efectos", [])]
        for i, e in enumerate(spec["escenas"]):
            hasta = total if e.get("hasta") == "fin" else float(e["hasta"])
            dur = hasta - t0
            if dur <= 0:
                sys.exit(f"La escena {i + 1} termina antes de empezar ({t0:.2f} → {hasta:.2f})")
            src, parte = base / e["archivo"], tmp / f"p{i:02d}.mp4"
            if src.suffix.lower() in (".png", ".jpg", ".jpeg"):
                clip_imagen(src, dur, float(e.get("empuje", 0.04)), parte)
            else:
                clip_video(src, dur, parte)
                lado = src.with_name(src.stem + "_sfx.json")
                if auto and lado.exists():
                    for ev in json.loads(lado.read_text(encoding="utf-8")):
                        if ev["t"] < dur - 0.05:
                            efectos.append({**ev, "t": t0 + ev["t"]})
            if auto and i > 0:
                efectos.append({"t": t0, "sfx": "corte"})
            partes.append(parte); t0 = hasta
        lista = tmp / "lista.txt"
        lista.write_text("".join(f"file '{p.as_posix()}'\n" for p in partes), encoding="utf-8")
        mudo = tmp / "mudo.mp4"
        ffmpeg("-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", mudo)
        vf = "null"
        rotulos = spec.get("rotulos", [])
        if spec.get("subtitulos"):
            ass = tmp / "subs.ass"
            subtitulos_ass(spec["subtitulos"], ass)
            # ruta escapada para el filtro de ffmpeg en Windows (C\:/...)
            vf = "ass='" + ass.as_posix().replace(":", "\\:") + "'"
        audio = ["-i", voz]
        cadenas = [f"[1:a]aresample=48000,apad=whole_dur={total:.3f},asplit=2[v1][vp]"]
        mezcla = ["[vp]"]
        if spec.get("musica"):
            m = spec["musica"]
            desde = float(m.get("desde", 0))   # segundo de la pista donde parte la música
            audio += ["-stream_loop", "-1", "-ss", f"{desde:.2f}", "-i", base / m["archivo"]]
            sale = max(total - 1.8, 0)
            # la señal de control (v1) también va alargada: si no, el compresor corta la música al terminar la voz
            cadenas.append(f"[2:a]aresample=48000,volume={m.get('db', -20)}dB,afade=t=in:d=0.4,afade=t=out:st={sale:.2f}:d=1.8[m]")
            cadenas.append("[m][v1]sidechaincompress=threshold=0.04:ratio=6:attack=15:release=350[md]")
            mezcla.append("[md]")
        else:
            cadenas.append("[v1]anullsink")
        n_in = 2 + (1 if spec.get("musica") else 0)   # entradas ya usadas: video, voz [y música]
        efectos = sorted((e for e in efectos if 0 <= float(e["t"]) < total), key=lambda e: float(e["t"]))
        for k, e in enumerate(efectos):
            nombre = e["sfx"]
            audio += ["-i", ruta_efecto(nombre)]
            ms = max(0, round((float(e["t"]) - SFX_ADELANTO.get(nombre, 0)) * 1000))
            cadenas.append(f"[{n_in + k}:a]aresample=48000,volume={e.get('db', SFX_DB.get(nombre, -14))}dB,"
                           f"adelay={ms}:all=1[s{k}]")
            mezcla.append(f"[s{k}]")
        cadenas.append("".join(mezcla) + f"amix=inputs={len(mezcla)}:duration=first:normalize=0,alimiter=limit=0.89[a]")
        filtro_audio = ";".join(cadenas)
        if efectos:
            print("efectos: " + ", ".join(f"{e['sfx']}@{float(e['t']):.2f}" for e in efectos))
        # Rótulos: entradas extra de imagen, superpuestas en su tramo antes de los subtítulos
        cadena_v, previo = [], "[0:v]"
        for k, r in enumerate(rotulos):
            audio += ["-loop", "1", "-i", base / r["archivo"]]
        n_audio_in = 2 + (1 if spec.get("musica") else 0) + len(efectos)   # video + voz [+ música] + efectos
        for k, r in enumerate(rotulos):
            cadena_v.append(f"{previo}[{n_audio_in + k}:v]overlay=0:0:enable='between(t,{float(r['ini']):.3f},{float(r['fin']):.3f})'[r{k}]")
            previo = f"[r{k}]"
        cadena_v.append(f"{previo}{vf}[v]")
        ffmpeg("-i", mudo, *audio, "-filter_complex", ";".join(cadena_v) + f";{filtro_audio}", "-map", "[v]", "-map", "[a]",
               "-t", f"{total:.3f}", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
               "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out)
    hoja(out, out.with_name(out.stem + "_hoja.png"))
    print(f"ok {out} ({total:.1f} s) + hoja de contacto {out.stem}_hoja.png")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("render")
    r.add_argument("ficha")
    r.add_argument("--out")
    a = ap.parse_args()
    render(a.ficha, a.out)


if __name__ == "__main__":
    main()
