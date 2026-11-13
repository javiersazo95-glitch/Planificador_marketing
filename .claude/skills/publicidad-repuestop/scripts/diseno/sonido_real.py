"""Sonido real (grabaciones con licencia libre) para la animación del cierre L2.

Fuentes en Edicion/redes/sonidos_cierre/ (créditos en creditos_sonido.md):
  mixkit_1536 «Old car arriving» (Mixkit, licencia gratuita de Mixkit): frena 8,6–9,1 s, clac 9,8 s.
  bsb_0534 «AC Cobra Engine» (BigSoundBank, CC0): acelerón 0,7–1,6 s, apagado 24,0–25,2 s.
  bsb_2368 «Screeching Tires #1» (BigSoundBank, CC0): chirrido de 2,2 s.
  bsb_0187 «Car (Arrival, Stop, Departure)» (BigSoundBank, CC0): llega y frena hacia 17,4 s.
Momentos de la animación: el auto entra 0–1,45 s (frena ~1,2–1,45) · engranaje 1,85 · ✔ 2,3–2,75 · marca 2,75–4.

Uso: python -I sonido_real.py   → final_L2_real_A.mp4, _B.mp4, _C.mp4
"""
import subprocess
from pathlib import Path
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent))  # noqa: E402
from rutas import ED  # noqa: E402

AQUI = Path(__file__).resolve().parent
SON = ED / "sonidos_cierre"
VIDEO = AQUI / "final_L2_animado.mp4"
DUR = 4.6
# Versión elegida (13-nov): B + lema con la voz «El Faraon» (generada por el usuario), cierre de 5,6 s
VOZ = ("faraon_lema.mp3", 2.75, 0)   # (archivo, segundo en que entra, dB): «Repuestop» 2,75–3,5 s y el lema 3,65–4,95 s
VIDEO_VOZ, DUR_VOZ = AQUI / "final_L2_animado_56.mp4", 5.6

# (archivo, desde, hasta, en qué segundo de la animación entra, dB, fundido de entrada, fundido de salida)
OPCIONES = {
    # A · Llegada real: un auto llega, frena, queda en ralentí y suena el clac del freno de mano con el ✔
    "A": [("mixkit_1536.mp3", 7.45, 10.7, 0.0, 0, 0.25, 0.4)],
    # B · Deportivo: acelerón de motor al entrar, chirrido corto al frenar, ralentí y el motor se apaga
    "B": [("bsb_0534.mp3", 0.6, 1.9, 0.0, -4, 0.2, 0.35),
          ("bsb_2368.mp3", 0.0, 0.9, 0.85, -10, 0.1, 0.35),
          ("bsb_0534.mp3", 22.9, 25.3, 1.45, -2, 0.25, 0.1)],
    # C · Auto de ciudad: llegada y frenada de un auto común; luego el motor se apaga
    "C": [("bsb_0187.mp3", 15.9, 18.6, 0.0, 0, 0.3, 0.5),
          ("bsb_0534.mp3", 23.6, 25.3, 2.0, -8, 0.3, 0.1)],
}

for nombre, partes in OPCIONES.items():
    entradas, filtros = [], []
    for k, (arch, a, b, t0, db, fi, fo) in enumerate(partes):
        entradas += ["-i", str(SON / arch)]
        largo = b - a; ms = int(t0 * 1000)
        filtros.append(f"[{k + 1}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,"
                       f"afade=t=in:d={fi},afade=t=out:st={largo - fo:.3f}:d={fo},volume={db}dB,adelay={ms}|{ms}[a{k}]")
    mezcla = "".join(f"[a{k}]" for k in range(len(partes)))
    filtro = (";".join(filtros) + f";{mezcla}amix=inputs={len(partes)}:normalize=0,"
              f"loudnorm=I=-17:TP=-2:LRA=11,apad=whole_dur={DUR},atrim=0:{DUR}[a]")
    salida = AQUI / f"final_L2_real_{nombre}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(VIDEO), *entradas, "-filter_complex", filtro,
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                    "-t", str(DUR), str(salida)], check=True)
    print("ok", salida.name)


# Final elegido: B con la voz del lema; el motor baja (sidechain) mientras habla Fer
partes = OPCIONES["B"]
entradas, filtros = [], []
for k, (arch, a, b, t0, db, fi, fo) in enumerate(partes):
    entradas += ["-i", str(SON / arch)]
    largo = b - a; ms = int(t0 * 1000)
    filtros.append(f"[{k + 1}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,"
                   f"afade=t=in:d={fi},afade=t=out:st={largo - fo:.3f}:d={fo},volume={db}dB,adelay={ms}|{ms}[a{k}]")
kv = len(partes) + 1
entradas += ["-i", str(SON / VOZ[0])]
mv = int(VOZ[1] * 1000)
filtros.append(f"[{kv}:a]aformat=sample_rates=48000:channel_layouts=mono,volume={VOZ[2]}dB,adelay={mv}|{mv},asplit=2[voz][llave]")
mezcla = "".join(f"[a{k}]" for k in range(len(partes)))
filtro = (";".join(filtros) + f";{mezcla}amix=inputs={len(partes)}:normalize=0[auto]"
          ";[auto][llave]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[autob]"
          f";[autob][voz]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-2:LRA=11,apad=whole_dur={DUR_VOZ},atrim=0:{DUR_VOZ}[a]")
salida = AQUI / "final_L2_cierre.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(VIDEO_VOZ), *entradas, "-filter_complex", filtro,
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                "-t", str(DUR_VOZ), str(salida)], check=True)
print("ok", salida.name)
