#!/usr/bin/env python3
"""Monta el video de tiendas: pantalla grabada + diapositivas + narración + sonido de clic. Uso: python -I scripts/montar-video-tiendas.py"""
import json, subprocess, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
V = R / "capturas-tmp/video"; P = R / "capturas-tmp/panel"; SL = V / "slides"; T = V / "partes"; T.mkdir(exist_ok=True)
FF = "C:/ffmpeg/ffmpeg"
RAW = P / "pantalla_bruto.mp4"
clics = json.load(open(P / "clics.json"))
BLUR = "split[a][b];[b]crop=380:60:1520:34,boxblur=14:2[bb];[a][bb]overlay=1520:34"
partes = []   # (archivo, duracion, [(raw_a, raw_b)] para ubicar clics)

def run(*a): subprocess.run([FF, "-y", "-v", "error", *map(str, a)], check=True)
def slide(nombre, d):
    out = T / f"s_{nombre}_{d:.2f}.mp4"
    run("-loop", 1, "-t", d, "-i", SL / f"{nombre}.png", "-vf", "scale=1920:1080,fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18", out)
    partes.append((out, d, None))
def raw(a, b, total, blur=True, tag=""):
    out = T / f"r_{tag}_{a}.mp4"; pad = max(total - (b - a), 0)
    vf = f"trim={a}:{b},setpts=PTS-STARTPTS,scale=1920:1080," + (BLUR + "," if blur else "") + f"tpad=stop_mode=clone:stop_duration={pad:.2f},fps=30,format=yuv420p"
    run("-i", RAW, "-filter_complex", "[0:v]" + vf + "[v]", "-map", "[v]", "-t", total, "-c:v", "libx264", "-crf", "18", out)
    partes.append((out, total, (a, b)))

slide("01_titulo", 3.0)
raw(5.5, 21.5, 22.0, blur=False, tag="mercado")
for n in ["02_b1", "03_b2", "04_b3", "05_b4", "06_b5", "07_b6"]: slide(n, 47.8 / 6)
slide("08_costoA", 12.0); slide("09_costoB", 13.2)
raw(29.3, 49.2, 29.5, tag="panel")
raw(49.2, 61.1, 17.7, tag="cargar")
raw(61.1, 78.6, 17.5, tag="paso1")
raw(78.7, 90.2, 11.5, tag="paso2")
raw(90.6, 97.8, 13.4, tag="paso3")
slide("10_paso4", 8.9)
raw(102.0, 113.3, 17.9, tag="historial")
slide("11_cierre", 5.0)

# lista de concatenación y ubicación de los clics en la línea de tiempo final
t = 0.0; pos = []
for f, d, rg in partes:
    if rg: pos += [t + (c - rg[0]) for c in clics if rg[0] <= c < rg[1] and (c - rg[0]) < d]
    t += d
total = t
(T / "lista.txt").write_text("".join(f"file '{f.as_posix()}'\n" for f, _, _ in partes), encoding="utf8")
run("-f", "concat", "-safe", 0, "-i", T / "lista.txt", "-c", "copy", V / "video_sin_audio.mp4")
print("clics en el video:", [round(x, 1) for x in pos], "duración", round(total, 1))

# sonido de clic (tic corto) y mezcla con la narración
run("-f", "lavfi", "-i", "sine=f=2400:d=0.035", "-f", "lavfi", "-i", "anoisesrc=d=0.035:c=white:a=0.6",
    "-filter_complex", "[0]afade=t=out:st=0.0:d=0.035[a];[1]highpass=f=2500,afade=t=out:st=0:d=0.03[n];[a][n]amix=inputs=2:normalize=0,volume=1.3[c]",
    "-map", "[c]", V / "clic.wav")
ins = ["-i", V / "narracion.mp3", "-i", V / "clic.wav"]
fc = "[0:a]apad=whole_dur=%.2f,volume=1.0[voz];" % total
etq = ""
for i, x in enumerate(pos):
    ms = int(x * 1000); fc += f"[1:a]adelay={ms}|{ms},volume=0.8[c{i}];"; etq += f"[c{i}]"
fc += f"[voz]{etq}amix=inputs={len(pos) + 1}:duration=longest:normalize=0:dropout_transition=0,alimiter=limit=0.95[m]"
run(*ins, "-filter_complex", fc, "-map", "[m]", "-t", total, "-c:a", "aac", "-b:a", "192k", V / "audio_final.m4a")
run("-i", V / "video_sin_audio.mp4", "-i", V / "audio_final.m4a", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", V / "RepuesTop_video_tiendas_v1.mp4")
print("listo", V / "RepuesTop_video_tiendas_v1.mp4")
