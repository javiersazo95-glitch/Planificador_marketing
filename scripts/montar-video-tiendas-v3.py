#!/usr/bin/env python3
"""Monta el video v2 de tiendas: escenas grabadas (panel2 + panel3) + diapositivas + audio nuevo + clics. Uso: python -I scripts/montar-video-tiendas-v2.py"""
import json, subprocess, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
V = R / "capturas-tmp/video"; SL = V / "slides"; T = V / "partes3"; T.mkdir(exist_ok=True)
P2 = R / "capturas-tmp/panel2"; P3 = R / "capturas-tmp/panel3"; P4 = R / "capturas-tmp/panel4"; P5 = R / "capturas-tmp/panel5"
FF = "C:/ffmpeg/ffmpeg"
M2 = json.load(open(P2 / "marcas.json")); M3 = json.load(open(P3 / "marcas.json"))
C2 = json.load(open(P2 / "clics.json")); C3 = json.load(open(P3 / "clics.json"))
M4 = json.load(open(P4 / "marcas.json")); C4 = json.load(open(P4 / "clics.json"))
M5 = json.load(open(P5 / "marcas.json")); C5 = json.load(open(P5 / "clics.json"))
FUENTE = {n: (P2, M2, C2) for n in ["mercado", "panel", "formas", "paso1", "paso2", "paso3", "paso4", "historial"]}
FUENTE.update({n: (P3, M3, C3) for n in ["ventas", "preguntas"]})
FUENTE["retiro"] = (P5, M5, C5)
FUENTE["encargos"] = (P4, M4, C4)
BLUR_PANEL = "split[a][b];[b]crop=380:60:1520:34,boxblur=14:2[bb];[a][bb]overlay=1520:34"
BLUR_HERO = "split[a][b];[b]crop=340:60:290:166,boxblur=14:2[bb];[a][bb]overlay=290:166"
BLUR = {"panel": BLUR_PANEL, "formas": BLUR_PANEL, "paso1": BLUR_PANEL, "paso2": BLUR_PANEL, "paso3": BLUR_PANEL, "paso4": BLUR_PANEL, "historial": BLUR_PANEL,
        "ventas": BLUR_HERO, "retiro": BLUR_HERO, "preguntas": BLUR_HERO}
partes = []   # (archivo, duracion, escena, marca_escena)

def run(*a): subprocess.run([FF, "-y", "-v", "error", *map(str, a)], check=True)
def slide(nombre, d):
    out = T / f"s_{nombre}_{d:.2f}.mp4"
    run("-loop", 1, "-t", f"{d:.3f}", "-i", SL / f"{nombre}.png", "-vf", "scale=1920:1080,fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18", out)
    partes.append((out, d, None, None))
def escena(nombre, total, desde=0.0):
    carpeta, marcas, _ = FUENTE[nombre]; a = marcas[nombre] + desde
    dur_real = marcas[nombre + "_fin"] - marcas[nombre] - desde
    usar = min(dur_real, total); pad = max(total - usar, 0)
    vf = f"trim={a:.3f}:{a + usar:.3f},setpts=PTS-STARTPTS,scale=1920:1080," + (BLUR[nombre] + "," if nombre in BLUR else "") + f"tpad=stop_mode=clone:stop_duration={pad:.3f},fps=30,format=yuv420p"
    out = T / f"r_{nombre}.mp4"
    run("-i", carpeta / "pantalla_bruto.mp4", "-filter_complex", "[0:v]" + vf + "[v]", "-map", "[v]", "-t", f"{total:.3f}", "-c:v", "libx264", "-crf", "18", out)
    partes.append((out, total, nombre, a))

# ---- línea de tiempo (coincide con el audio ensamblado)
slide("01_titulo", 3.0); escena("mercado", 20.5)
for n, d in [("02_b1", 6.46), ("03_b2", 8.60), ("04_b3", 16.70), ("05_b4", 8.00), ("06_b5", 4.70), ("07_b6", 2.93)]: slide(n, d)
slide("08_costoA", 8.30); slide("09_costoB", 16.64)
escena("panel", 28.69); escena("formas", 17.43)
escena("paso1", 18.91); escena("paso2", 9.82); escena("paso3", 13.54); escena("paso4", 10.75)
escena("ventas", 29.58); escena("retiro", 20.09); escena("preguntas", 10.29); escena("encargos", 18.84)
escena("historial", 17.40); slide("11_cierre", 5.0)

# ---- clics en la línea de tiempo final
t = 0.0; pos = []
for f, d, esc, a in partes:
    if esc:
        _, _, cl = FUENTE[esc]
        pos += [t + (c - a) for c in cl if a <= c < a + d]
    t += d
total = t
(T / "lista.txt").write_text("".join(f"file '{f.as_posix()}'\n" for f, *_ in partes), encoding="utf8")
run("-f", "concat", "-safe", 0, "-i", T / "lista.txt", "-c", "copy", V / "video3_sin_audio.mp4")
print("clics:", len(pos), "duración", round(total, 2))

# ---- audio: A + (beneficios, costos, panel, formas de la v1) + B, con pausas de 1,5 s
ins = ["-i", V / "narr_A.mp3", "-i", V / "narracion.mp3", "-i", V / "narr_B.mp3", "-i", V / "clic.wav", "-i", V / "narr_C.mp3", "-i", V / "narr_D.mp3"]
trozos = [("[0:a]", None, None, 23.5), ("[1:a]", 25.94, 71.83, 47.39), ("[1:a]", 73.68, 97.12, 24.94), ("[4:a]", None, None, 28.69), ("[1:a]", 128.38, 144.31, 17.43),
          ("[2:a]", 0, 82.6, 82.6), ("[5:a]", None, None, 20.09), ("[2:a]", 98.95, None, 51.53)]
fc = ""; etq = ""
for i, (src, a, b, w) in enumerate(trozos):
    cut = (f"atrim={a}:{b}," if b is not None else f"atrim=start={a},") + "asetpts=PTS-STARTPTS," if a is not None else ""
    fc += f"{src}{cut}apad=whole_dur={w}[v{i}];"; etq += f"[v{i}]"
fc += f"{etq}concat=n={len(trozos)}:v=0:a=1[voz];"
cl = ""
for i, x in enumerate(pos):
    ms = int(x * 1000); fc += f"[3:a]adelay={ms}|{ms},volume=0.8[c{i}];"; cl += f"[c{i}]"
fc += f"[voz]{cl}amix=inputs={len(pos) + 1}:duration=longest:normalize=0:dropout_transition=0,alimiter=limit=0.95[m]"
run(*ins, "-filter_complex", fc, "-map", "[m]", "-t", f"{total:.3f}", "-c:a", "aac", "-b:a", "192k", V / "audio3_final.m4a")
run("-i", V / "video3_sin_audio.mp4", "-i", V / "audio3_final.m4a", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", V / "RepuesTop_video_tiendas_v3.mp4")
print("listo", V / "RepuesTop_video_tiendas_v3.mp4")
