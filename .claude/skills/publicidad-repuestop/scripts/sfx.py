#!/usr/bin/env python3
"""Biblioteca de efectos de sonido de RepuesTop, sintetizados en código (sin licencias de terceros).

Uso:
  python -I sfx.py generar [--dir carpeta]     # crea los .wav (por defecto, plantillas/sfx/)
  python -I sfx.py lista

Efectos: corte (whoosh entre escenas), zoom / zoom_salida (barrido corto), clic (toque en pantalla),
pop (aparece un texto o tarjeta), sello (timbre que cae: «FALSO», «RECHAZADO»), vibrar (celular en la mesa),
ding (acierto), deslizar (scroll rápido), tecla (teclado del
celular), enviado (mensaje enviado), mensaje (mensaje recibido), plumon (tachar con plumón),
rayado (disco rayado), estatica (TV vieja), vhs (casete que entra), papel (hoja sobre la mesa),
motor (auto que llega y desacelera), frenada (chirrido corto), motor2 (motor por pulsos, más creíble),
whoosh_auto (paso rápido de auto), bocina (dos bocinazos) y sting (firma musical de marimba).
Todo a 48 kHz mono, normalizado a −1 dBFS; el volumen final se ajusta en la ficha del reel.
"""
import argparse
import sys
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
RNG = np.random.default_rng(7)          # semilla fija: siempre el mismo sonido
DIR = Path(__file__).resolve().parent.parent / "plantillas" / "sfx"


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, ataque, caida):
    """Envolvente: sube en `ataque` (0-1 del largo) y cae con curva."""
    x = np.linspace(0, 1, n)
    a = np.clip(x / max(ataque, 1e-4), 0, 1)
    d = np.clip((1 - x) / max(1 - ataque, 1e-4), 0, 1) ** caida
    return a * d


def ruido_barrido(dur, f0, f1, q=1.2):
    """Ruido blanco por un pasabanda que se mueve de f0 a f1 (bloques cortos, interpolado)."""
    n = int(dur * SR)
    pre = 2048                               # muestras previas para que el filtro arranque asentado
    r = RNG.standard_normal(n + pre)
    out = np.zeros(n)
    bloque = 512
    for i in range(0, n, bloque):
        fc = f0 * (f1 / f0) ** (i / n)
        lo, hi = fc / (1 + 1 / q), min(fc * (1 + 1 / q), SR / 2 - 100)
        sos = butter(2, [lo, hi], btype="band", fs=SR, output="sos")
        largo = min(bloque, n - i)
        out[i:i + largo] = sosfilt(sos, r[i:i + pre + largo])[-largo:]
    return out


def corte():
    s = ruido_barrido(0.42, 300, 4500) * env(int(0.42 * SR), 0.7, 2.5)
    return s


def zoom():
    d = 0.5
    t = t_(d)
    tono = np.sin(2 * np.pi * (220 * t + (700 - 220) * t * t / (2 * d))) * 0.25
    return (ruido_barrido(d, 400, 3000) + tono) * env(len(t), 0.85, 3)


def zoom_salida():
    d = 0.4
    t = t_(d)
    tono = np.sin(2 * np.pi * (600 * t - (600 - 250) * t * t / (2 * d))) * 0.2
    return (ruido_barrido(d, 2500, 350) + tono) * env(len(t), 0.25, 2)


def clic():
    t = t_(0.06)
    golpe = RNG.standard_normal(len(t)) * np.exp(-t / 0.002)
    tono = np.sin(2 * np.pi * 1900 * t) * np.exp(-t / 0.012) * 0.6
    sos = butter(2, 900, btype="high", fs=SR, output="sos")
    return sosfilt(sos, golpe * 0.5 + tono)


def pop():
    d = 0.12
    t = t_(d)
    f = 650 * np.exp(-t / 0.03) + 180
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035)


def sello():
    t = t_(0.35)
    bombo = np.sin(2 * np.pi * np.cumsum(110 * np.exp(-t / 0.05) + 55) / SR) * np.exp(-t / 0.09)
    sos = butter(2, 1800, btype="low", fs=SR, output="sos")
    golpe = sosfilt(sos, RNG.standard_normal(len(t))) * np.exp(-t / 0.025) * 2.5
    return bombo + golpe


def vibrar():
    t = t_(0.9)
    zumbido = np.sign(np.sin(2 * np.pi * 165 * t)) * 0.6 + np.sin(2 * np.pi * 330 * t) * 0.3
    sos = butter(2, 1200, btype="low", fs=SR, output="sos")
    patron = ((t % 0.45) < 0.32).astype(float)
    return sosfilt(sos, zumbido) * patron


def ding():
    t = t_(0.7)
    return (np.sin(2 * np.pi * 1318.5 * t) + 0.6 * np.sin(2 * np.pi * 1975.5 * t) * (t > 0.09)) * np.exp(-t / 0.18)


def deslizar():
    return ruido_barrido(0.22, 1500, 6000, q=0.8) * env(int(0.22 * SR), 0.3, 2)


def tecla():
    """Toque suave de teclado del celular (sin vibración)."""
    t = t_(0.045)
    golpe = RNG.standard_normal(len(t)) * np.exp(-t / 0.004)
    sos = butter(2, [1800, 6000], btype="band", fs=SR, output="sos")
    return sosfilt(sos, golpe) + np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.006) * 0.25


def enviado():
    """Mensaje enviado: barrido corto hacia arriba con un pop al final (propio, no el de ninguna app)."""
    a = ruido_barrido(0.16, 900, 5200, q=0.9) * env(int(0.16 * SR), 0.6, 2) * 0.6
    t = t_(0.09)
    b = np.sin(2 * np.pi * np.cumsum(900 + 500 * (1 - np.exp(-t / 0.02))) / SR) * np.exp(-t / 0.03)
    return np.concatenate([a, b])


def mensaje():
    """Mensaje recibido: dos notas cortas ascendentes (propio, no el de ninguna app)."""
    t = t_(0.11)
    n1 = np.sin(2 * np.pi * 1046.5 * t) * np.exp(-t / 0.04)
    t2 = t_(0.22)
    n2 = (np.sin(2 * np.pi * 1568 * t2) + 0.3 * np.sin(2 * np.pi * 3136 * t2)) * np.exp(-t2 / 0.07)
    return np.concatenate([n1, n2])


def plumon():
    """Plumón tachando sobre papel: tres trazos rápidos de ruido agudo."""
    d = 0.5
    t = t_(d)
    sos = butter(2, [2200, 7500], btype="band", fs=SR, output="sos")
    r = sosfilt(sos, RNG.standard_normal(len(t)))
    trazos = np.clip(np.sin(2 * np.pi * 6 * t), 0, 1) ** 0.6 * (0.7 + 0.3 * RNG.random(len(t)))
    return r * trazos * env(len(t), 0.05, 1.2)


def rayado():
    """Disco rayado: la música se frena de golpe (corte cómico)."""
    d = 0.45
    t = t_(d)
    f = 900 * np.exp(-t / 0.12) + 120
    tono = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5
    return (ruido_barrido(d, 5000, 400, q=0.9) + tono) * env(len(t), 0.04, 1.5)


def estatica():
    """Estática de televisor viejo (1,2 s) con chasquidos."""
    t = t_(1.2)
    sos = butter(2, 700, btype="high", fs=SR, output="sos")
    r = sosfilt(sos, RNG.standard_normal(len(t))) * 0.5
    chasq = (RNG.random(len(t)) > 0.9993) * RNG.standard_normal(len(t)) * 4
    return (r + chasq) * env(len(t), 0.03, 0.6)


def vhs():
    """Casete VHS que entra: dos golpes mecánicos y zumbido de motor."""
    t = t_(0.55)
    sos = butter(2, 2500, btype="low", fs=SR, output="sos")
    g = np.zeros(len(t))
    for t0 in (0.0, 0.22):
        k = t >= t0
        g[k] += sosfilt(sos, RNG.standard_normal(k.sum())) * np.exp(-(t[k] - t0) / 0.015) * 2
    motor = np.sin(2 * np.pi * 60 * t) * 0.15 * (t > 0.22)
    return g + motor


def papel():
    """Hoja de papel que se pone sobre la mesa."""
    return ruido_barrido(0.35, 1200, 3500, q=0.7) * env(int(0.35 * SR), 0.2, 2.5)


def motor():
    """Auto que llega y desacelera (1,6 s): motor con armónicos que baja de tono, más ruido de rodado."""
    t = t_(1.6)
    f = 105 - 55 * np.clip(t / 1.3, 0, 1) ** 1.4              # baja de 105 a 50 Hz
    fase = 2 * np.pi * np.cumsum(f) / SR
    m = sum(np.sin(k * fase) / k for k in range(1, 7))
    m *= 1 + 0.25 * np.sin(2 * np.pi * 9 * t)                   # pulso de los cilindros
    sos = butter(2, 900, btype="low", fs=SR, output="sos")
    rodado = sosfilt(sos, RNG.standard_normal(len(t))) * 0.35
    return (m + rodado) * env(len(t), 0.25, 1.6)


def frenada():
    """Frenada corta: chirrido de neumático (tono con vibrato sobre ruido agudo)."""
    t = t_(0.5)
    tono = np.sin(2 * np.pi * (1900 + 60 * np.sin(2 * np.pi * 23 * t)) * t) * 0.5
    chirrido = ruido_barrido(0.5, 2600, 1800, q=3) + tono
    return chirrido * env(len(t), 0.08, 1.8)


def motor2():
    """Motor más creíble (1,6 s): explosiones de cilindro que se espacian al desacelerar, filtradas como escape."""
    n = int(1.6 * SR); out = np.zeros(n)
    t, k = 0.0, 0
    sos = butter(2, [70, 520], btype="band", fs=SR, output="sos")
    while t < 1.55:
        f = 62 - 34 * min(t / 1.3, 1) ** 1.3                    # pulsos por segundo: 62 → 28
        i = int(t * SR); largo = int(0.03 * SR)
        golpe = RNG.standard_normal(largo) * np.exp(-np.arange(largo) / (0.006 * SR)) * (0.8 + 0.4 * RNG.random())
        out[i:i + largo] += golpe[:max(0, min(largo, n - i))]
        t += 1 / f; k += 1
    out = sosfilt(sos, out)
    return out * env(n, 0.2, 1.4)


def whoosh_auto():
    """Paso rápido de auto (1,3 s): ruido que sube y baja de tono (efecto Doppler) y se apaga."""
    a = ruido_barrido(0.75, 300, 1600, q=1.5) * env(int(0.75 * SR), 0.85, 1.5)
    b = ruido_barrido(0.55, 1600, 250, q=1.5) * env(int(0.55 * SR), 0.05, 2.5)
    return np.concatenate([a, b])


def bocina():
    """Dos bocinazos cortos y simpáticos (dos tonos a la vez, como bocina de auto chico)."""
    t = t_(0.13)
    def toque():
        x = sum(np.sign(np.sin(2 * np.pi * f * t)) * 0.5 for f in (415, 523))
        sos = butter(2, 2200, btype="low", fs=SR, output="sos")
        return sosfilt(sos, x) * env(len(t), 0.05, 0.4)
    return np.concatenate([toque(), np.zeros(int(0.07 * SR)), toque()])


def nota(f, dur, vol=1.0):
    """Nota de marimba: fundamental + armónico 4 que se apaga rápido."""
    t = t_(dur)
    return vol * (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.05))


def sting():
    """Firma musical de la marca (1,8 s): arpegio ascendente de marimba que cierra en un acorde mayor."""
    n = int(1.8 * SR); out = np.zeros(n)
    for t0, f in ((0.0, 523.25), (0.12, 659.25), (0.24, 783.99)):    # Do-Mi-Sol
        x = nota(f, 0.6); i = int(t0 * SR); out[i:i + len(x)] += x
    i = int(0.42 * SR)
    for f in (523.25, 659.25, 783.99, 1046.5):                        # acorde final Do mayor
        x = nota(f, 1.38, 0.7); out[i:i + len(x)] += x[:n - i]
    return out


EFECTOS = {"corte": corte, "zoom": zoom, "zoom_salida": zoom_salida, "clic": clic, "pop": pop,
           "sello": sello, "vibrar": vibrar, "ding": ding, "deslizar": deslizar,
           "tecla": tecla, "enviado": enviado, "mensaje": mensaje,
           "plumon": plumon, "rayado": rayado, "estatica": estatica, "vhs": vhs, "papel": papel,
           "motor": motor, "frenada": frenada,
           "motor2": motor2, "whoosh_auto": whoosh_auto, "bocina": bocina, "sting": sting}


def guardar(señal, ruta):
    s = señal / (np.max(np.abs(señal)) + 1e-9) * 0.89          # −1 dBFS
    fade = min(240, len(s) // 4)
    s[-fade:] *= np.linspace(1, 0, fade)                       # sin chasquido al final
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((s * 32767).astype(np.int16).tobytes())


def ruta_efecto(nombre, carpeta=None):
    """Ruta del .wav; lo genera si falta."""
    carpeta = Path(carpeta or DIR)
    r = carpeta / f"{nombre}.wav"
    if not r.exists():
        if nombre not in EFECTOS:
            sys.exit(f"Efecto desconocido «{nombre}». Disponibles: {', '.join(EFECTOS)}")
        carpeta.mkdir(parents=True, exist_ok=True)
        guardar(EFECTOS[nombre](), r)
    return r


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("generar"); g.add_argument("--dir")
    sub.add_parser("lista")
    a = ap.parse_args()
    if a.cmd == "lista":
        print("\n".join(EFECTOS))
        return
    carpeta = Path(a.dir or DIR); carpeta.mkdir(parents=True, exist_ok=True)
    for nombre, fn in EFECTOS.items():
        guardar(fn(), carpeta / f"{nombre}.wav")
        print("ok", carpeta / f"{nombre}.wav")


if __name__ == "__main__":
    main()
