"""Pone el cierre animado L2 aprobado (13-nov) al final de los reels T-1, R10, R7 y R11.

Para cada reel: corta la versión aprobada donde empezaba su cierre viejo (la música se apaga en 0,35 s)
y pega el cierre nuevo. El cierre lleva el sonido real B, la voz «El Faraon» con el lema y la línea bajo
el botón según el público.
- R10 y R7: se quita el «RepuesTop. Movemos Chile juntos.» de Fer (ahora lo dice el cierre).
- T-1: se mantiene la invitación de Gerardo («Súmate a RepuesTop…») sobre la animación y después va el lema.

Uso: python -I cierre_reels.py            (deja <reel>_cierreL2.mp4 junto a cada reel)
"""
import subprocess
from pathlib import Path
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent))  # noqa: E402
from rutas import ED  # noqa: E402

AQUI = Path(__file__).resolve().parent
SON = ED / "sonidos_cierre"
TMP = AQUI / "anim_capas" / "cierres"
TIENDAS, COMPRADORES = "1 mes gratis para tiendas nuevas", "Pago seguro con Flow"

# Sonido B (archivo, desde, hasta, entra en, dB, fundido entrada, fundido salida)
AUTO = [("bsb_0534.mp3", 0.6, 1.9, 0.0, -4, 0.2, 0.35),
        ("bsb_2368.mp3", 0.0, 0.9, 0.85, -10, 0.1, 0.35),
        ("bsb_0534.mp3", 22.9, 25.3, 1.45, -2, 0.25, 0.1)]
LEMA = SON / "faraon_lema.mp3"

REELS = {
    # nombre: (reel aprobado, segundo de corte, oferta, voces extra [(archivo, desde, hasta, entra en)], lema entra en, duración del cierre)
    "r11": (ED / "2026-W47/r11_comercial_prohibido/r11_comercial_prohibido_v2.mp4", 26.2, COMPRADORES, [], 2.75, 5.6),
    "r7": (ED / "2026-W47/r7_transferencia/r7_transferencia_v4.mp4", 17.7, COMPRADORES, [], 2.75, 5.6),
    "r10": (ED / "2026-W47/r10_precio/r10_precio_v2.mp4", 16.07, TIENDAS, [], 2.75, 5.6),
    "t1": (ED / "2026-W46/t1_reel/t1_cotizaciones_reel_v4.mp4", 20.58, TIENDAS,
           [(ED / "2026-W46/t1_reel/voz_eleven.wav", 20.55, 28.25, 0.3)], 8.1, 10.6),
}


def run(*a):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, a)], check=True)


def video_cierre(oferta, dur, salida, con_capas):
    args = ["python", "-I", str(AQUI / "anim_final.py"), "--oferta", oferta, "--dur", str(dur), "--out", str(salida)]
    if not con_capas:
        args.append("--sin-capas")
    subprocess.run(args, check=True)


def audio_cierre(video, voces, t_lema, dur, salida):
    entradas, filtros = [], []
    for k, (arch, a, b, t0, db, fi, fo) in enumerate(AUTO):
        entradas += ["-i", SON / arch]
        ms = int(t0 * 1000)
        filtros.append(f"[{k + 1}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,"
                       f"afade=t=in:d={fi},afade=t=out:st={b - a - fo:.3f}:d={fo},volume={db}dB,adelay={ms}|{ms}[a{k}]")
    n = len(AUTO)
    habla = [(LEMA, 0, None, t_lema)] + voces
    for j, (arch, a, b, t0) in enumerate(habla):
        entradas += ["-i", arch]
        recorte = f"atrim={a}:{b},asetpts=PTS-STARTPTS," if b else ""
        ms = int(t0 * 1000)
        filtros.append(f"[{n + 1 + j}:a]{recorte}aformat=sample_rates=48000:channel_layouts=mono,"
                       f"adelay={ms}|{ms}[v{j}]")
    autos = "".join(f"[a{k}]" for k in range(n))
    voces_l = "".join(f"[v{j}]" for j in range(len(habla)))
    filtro = (";".join(filtros) +
              f";{autos}amix=inputs={n}:normalize=0[auto]"
              f";{voces_l}amix=inputs={len(habla)}:normalize=0,asplit=2[voz][llave]"
              ";[auto][llave]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[autob]"
              f";[autob][voz]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-2:LRA=11,apad=whole_dur={dur},atrim=0:{dur}[a]")
    run("-i", video, *entradas, "-filter_complex", filtro, "-map", "0:v", "-map", "[a]", "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "1", "-t", dur, salida)


def unir(reel, corte, cierre, salida):
    f = (f"[0:v]trim=0:{corte},setpts=PTS-STARTPTS[v0];[0:a]atrim=0:{corte},asetpts=PTS-STARTPTS,"
         f"afade=t=out:st={corte - 0.35:.3f}:d=0.35[a0];[1:v]setpts=PTS-STARTPTS[v1];[1:a]asetpts=PTS-STARTPTS[a1];"
         "[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]")
    run("-i", reel, "-i", cierre, "-filter_complex", f, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "17",
        "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "1", salida)


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    hechas = set()
    for nombre, (reel, corte, oferta, voces, t_lema, dur) in sorted(REELS.items(), key=lambda x: x[1][2]):
        mudo = TMP / f"anim_{nombre}.mp4"
        video_cierre(oferta, dur, mudo, con_capas=oferta not in hechas)
        hechas.add(oferta)
        cierre = TMP / f"cierre_{nombre}.mp4"
        audio_cierre(mudo, voces, t_lema, dur, cierre)
        salida = reel.resolve().with_name(reel.stem.rsplit("_v", 1)[0] + "_cierreL2.mp4")
        unir(reel, corte, cierre, salida)
        print("ok", salida)


if __name__ == "__main__":
    main()
