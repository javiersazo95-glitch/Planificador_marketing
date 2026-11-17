#!/usr/bin/env python3
"""Sintetiza (sin descargar nada) el sonido de clic de ratón y una música de fondo suave para el video de tiendas.
Salida: capturas-tmp/video/clic2.wav y capturas-tmp/video/musica_fondo.wav (5 min, bucle de 4 compases). Uso: python -I scripts/sintetizar-audio.py"""
import numpy as np, wave, pathlib
from scipy.signal import butter, lfilter
SR = 44100
V = pathlib.Path(__file__).resolve().parent.parent / "capturas-tmp/video"
rng = np.random.default_rng(7)
def guardar(nombre, x):
    x = np.clip(x, -1, 1); st = np.stack([x, x], 1) if x.ndim == 1 else x
    with wave.open(str(V / nombre), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype("<i2").tobytes())
def band(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band"); return lfilter(b, a, x)
def low(x, f): b, a = butter(2, f / (SR / 2), "low"); return lfilter(b, a, x)
def high(x, f): b, a = butter(2, f / (SR / 2), "high"); return lfilter(b, a, x)

# ---------- clic de ratón: «tac» de bajada + «tic» de subida (más suave)
def tac(n, f_cuerpo, f_ruido, vol):
    t = np.arange(n) / SR
    ruido = band(rng.standard_normal(n), f_ruido * 0.6, f_ruido * 1.6) * np.exp(-t * 700)
    cuerpo = np.sin(2 * np.pi * f_cuerpo * t) * np.exp(-t * 180)
    golpe = np.zeros(n); golpe[:12] = np.hanning(24)[:12]            # transitorio seco
    return (0.9 * ruido + 0.7 * cuerpo + 0.5 * golpe) * vol
n = int(0.16 * SR); clic = np.zeros(n)
a = tac(int(0.05 * SR), 140, 3200, 1.0); clic[:len(a)] += a
b = tac(int(0.04 * SR), 190, 4500, 0.55); i = int(0.075 * SR); clic[i:i + len(b)] += b
clic = low(clic, 9000); clic = clic / np.abs(clic).max() * 0.85
guardar("clic2.wav", clic)

# ---------- música: Am7 – Fmaj7 – Cmaj7 – G6, 96 bpm, arpegio suave + colchón + bajo
bpm = 96; beat = 60 / bpm; compas = 4 * beat
notas = {"A2": 110.0, "F2": 87.31, "C3": 130.81, "G2": 98.0}
acordes = [([220.0, 261.63, 329.63, 392.0], "A2"), ([174.61, 220.0, 261.63, 329.63], "F2"),
           ([261.63, 329.63, 392.0, 493.88], "C3"), ([196.0, 246.94, 293.66, 329.63], "G2")]
def env(n, ataque, caida):
    t = np.arange(n) / SR; e = np.minimum(t / ataque, 1) * np.exp(-t * caida); return e
bucle = np.zeros(int(4 * compas * SR) + SR)
for k, (freqs, bajo) in enumerate(acordes):
    t0 = int(k * compas * SR)
    n = int((compas + 0.8) * SR); tt = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.003 * tt) for f in freqs) / len(freqs)
    pad *= np.minimum(tt / 0.6, 1) * np.minimum((compas + 0.8 - tt) / 0.8, 1) * 0.16
    bucle[t0:t0 + n] += pad
    # arpegio en corcheas
    orden = [0, 1, 2, 3, 2, 1, 2, 3]
    for j, idx in enumerate(orden):
        f = freqs[idx] * 2; s = t0 + int(j * beat / 2 * SR); m = int(0.7 * SR); tm = np.arange(m) / SR
        nota = (np.sin(2 * np.pi * f * tm) + 0.35 * np.sin(2 * np.pi * f * 2 * tm)) * env(m, 0.004, 5.5) * (0.20 if j % 4 == 0 else 0.14)
        bucle[s:s + m] += nota
    # bajo
    for q in range(4):
        s = t0 + int(q * beat * SR); m = int(0.5 * SR); tm = np.arange(m) / SR
        bucle[s:s + m] += np.sin(2 * np.pi * notas[bajo] * tm) * env(m, 0.01, 4.0) * 0.30
    # hi-hat suave en contratiempos
    for j in range(8):
        s = t0 + int((j * beat / 2 + beat / 4 * (j % 2)) * SR); m = int(0.05 * SR)
        bucle[s:s + m] += high(rng.standard_normal(m), 7000) * np.exp(-np.arange(m) / SR * 90) * 0.035
bucle = low(bucle, 5200)
unidad = bucle[:int(4 * compas * SR)]
# cola del último acorde se mezcla con el inicio del siguiente bucle
cola = bucle[int(4 * compas * SR):]; unidad[:len(cola)] += cola
total = int(420 * SR); reps = int(np.ceil(total / len(unidad))); musica = np.tile(unidad, reps)[:total]
musica = musica / np.abs(musica).max() * 0.8
fade = int(3 * SR); musica[:fade] *= np.linspace(0, 1, fade); musica[-fade:] *= np.linspace(1, 0, fade)
# estéreo ligero
izq = musica; der = np.roll(musica, int(0.012 * SR)) * 0.97
guardar("musica_fondo.wav", np.stack([izq, der], 1))
print("listo", V / "clic2.wav", V / "musica_fondo.wav")
