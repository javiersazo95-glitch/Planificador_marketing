#!/usr/bin/env python3
"""Música de fondo alegre (Do mayor, 112 bpm, sin descargas) y 'whoosh' de transición. Salida en capturas-tmp/video: musica_alegre.wav y whoosh.wav"""
import numpy as np, wave, pathlib
from scipy.signal import butter, lfilter
SR = 44100; V = pathlib.Path(__file__).resolve().parent.parent / "capturas-tmp/video"; rng = np.random.default_rng(11)
def guardar(n, x):
    x = np.clip(x, -1, 1); st = np.stack([x, x], 1) if x.ndim == 1 else x
    with wave.open(str(V / n), "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype("<i2").tobytes())
def lp(x, f): b, a = butter(2, f / (SR / 2), "low"); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f / (SR / 2), "high"); return lfilter(b, a, x)
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band"); return lfilter(b, a, x)

# ---------- whoosh: ruido que barre de grave a agudo con cola suave
n = int(0.55 * SR); t = np.arange(n) / SR; ruido = rng.standard_normal(n); sal = np.zeros(n)
for k in range(8):
    seg = slice(int(k * n / 8), int((k + 1) * n / 8)); f = 500 * (1.45 ** k)
    r = bp(ruido, f, f * 1.8); sal[seg] += r[seg]
env = np.sin(np.pi * np.minimum(t / 0.55, 1)) ** 1.6
w = lp(sal * env, 9000); w = w / np.abs(w).max() * 0.8
guardar("whoosh.wav", w)

# ---------- música alegre: C – G – Am – F, 112 bpm
bpm = 112; beat = 60 / bpm; compas = 4 * beat
acordes = [([261.63, 329.63, 392.0], 65.41), ([196.0, 246.94, 293.66], 98.0), ([220.0, 261.63, 329.63], 110.0), ([174.61, 220.0, 261.63], 87.31)]
def env_p(n, ataque, caida): tt = np.arange(n) / SR; return np.minimum(tt / ataque, 1) * np.exp(-tt * caida)
unidad_n = int(4 * compas * SR); buc = np.zeros(unidad_n + SR)
def sumar(x, pos): buc[pos:pos + len(x)] += x[:len(buc) - pos]
for k, (fr, bajo) in enumerate(acordes):
    t0 = int(k * compas * SR)
    # bajo saltarín (negras con octava)
    for q in range(4):
        m = int(0.32 * SR); tm = np.arange(m) / SR; f = bajo * (2 if q % 2 else 1)
        sumar(np.sin(2 * np.pi * f * tm) * env_p(m, 0.005, 9) * 0.34, t0 + int(q * beat * SR))
    # arpegio de pluck brillante en corcheas
    orden = [0, 1, 2, 1, 0, 1, 2, 1]
    for j, idx in enumerate(orden):
        m = int(0.28 * SR); tm = np.arange(m) / SR; f = fr[idx] * 2
        onda = (np.sign(np.sin(2 * np.pi * f * tm)) * 0.35 + np.sin(2 * np.pi * f * tm) * 0.65)
        sumar(lp(onda, 5200) * env_p(m, 0.002, 14) * (0.22 if j % 2 == 0 else 0.15), t0 + int(j * beat / 2 * SR))
    # acorde en contratiempo (stab suave)
    for b in (1, 3):
        m = int(0.22 * SR); tm = np.arange(m) / SR
        acorde = sum(np.sin(2 * np.pi * f * tm) for f in fr) / 3
        sumar(acorde * env_p(m, 0.003, 12) * 0.20, t0 + int((b + 0.5) * beat * SR))
    # kick suave en 1 y 3, shaker en corcheas, palmada en 2 y 4
    for b in range(4):
        pos = t0 + int(b * beat * SR)
        if b in (0, 2):
            m = int(0.18 * SR); tm = np.arange(m) / SR; f = 110 * np.exp(-tm * 22) + 45
            sumar(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tm * 18) * 0.38, pos)
        else:
            m = int(0.12 * SR); tm = np.arange(m) / SR
            sumar(bp(rng.standard_normal(m), 1500, 5000) * np.exp(-tm * 38) * 0.20, pos)
    for j in range(8):
        m = int(0.04 * SR); tm = np.arange(m) / SR
        sumar(hp(rng.standard_normal(m), 6500) * np.exp(-tm * 110) * (0.06 if j % 2 else 0.04), t0 + int(j * beat / 2 * SR))
buc = lp(buc, 7500)
unidad = buc[:unidad_n].copy(); cola = buc[unidad_n:]; unidad[:len(cola)] += cola
total = int(420 * SR); mus = np.tile(unidad, int(np.ceil(total / unidad_n)))[:total]
mus = mus / np.abs(mus).max() * 0.8
f = int(3 * SR); mus[:f] *= np.linspace(0, 1, f); mus[-f:] *= np.linspace(1, 0, f)
guardar("musica_alegre.wav", np.stack([mus, np.roll(mus, int(0.01 * SR)) * 0.97], 1))
print("listo")
