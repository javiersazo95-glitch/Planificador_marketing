"""Mezcla de sonido y cierre L2 del reel R1 «El cuñado mecánico».

Video mudo de Remotion (out/r1_mudo.mp4) + voces (public/r1/*.mp3) + música + efectos
-> out/r1_audio.mp4 -> cierre L2 animado oficial (compradores) -> out/r1_final.mp4

Uso (desde estudio/):  python -I mezclar_r1.py [--sin-cierre]
"""
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
SKILL = AQUI.parent / ".claude/skills/publicidad-repuestop"
SFX = SKILL / "plantillas/sfx"
MUSICA = Path(r"C:\Users\SMK GAMING\Downloads\Repuestop\Edicion\redes\musica\pixabay_bombinsound_retro-funky-groove_622862.mp3")
OUT = AQUI / "out"
VOZ = AQUI / "public" / "r1"
TOTAL = 28.6   # = T.total de src/reel_r1.jsx

# (archivo, segundo en que entra, dB)
VOCES = [
    ("c1_eso_es_el_alternador.mp3", 0.70, 0), ("c2_alternador.mp3", 3.90, 0), ("c3_alternador_po.mp3", 5.55, 0),
    ("c4_sin_duda_alternador.mp3", 7.20, 0), ("d1_ya_cambie_tres.mp3", 9.10, 2), ("v1_narracion_app.mp3", 12.90, 1),
    ("c5_yo_dije_electrico.mp3", 22.40, 0),
]
# (efecto, segundo, dB)
EFECTOS = [
    ("pop", 0.25, -6), ("corte", 3.15, -10), ("clic", 3.5, -8), ("corte", 4.85, -10), ("frenada", 5.2, -16),
    ("corte", 6.55, -10), ("vibrar", 6.9, -14), ("rayado", 8.2, -10), ("pop", 8.9, -6), ("pop", 9.2, -6), ("pop", 9.5, -6),
    ("corte", 12.35, -10), ("deslizar", 12.5, -12),
    *[("tecla", 14.3 + 0.16 * i, -9) for i in range(7)],
    ("ding", 16.1, -10), ("clic", 17.45, -8), ("mensaje", 18.4, -8),
    ("corte", 21.75, -10), ("pop", 22.5, -8), ("corte", 25.55, -10), ("sting", 25.7, -12), ("pop", 26.2, -8),
]


def run(*a):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, a)], check=True)


def mezclar(video, salida):
    ent = ["-i", video, "-i", MUSICA]
    fil = [f"[1:a]atrim=7:{7 + TOTAL},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,volume=-19dB,"
           f"afade=t=in:d=0.6,afade=t=out:st={TOTAL - 1.2}:d=1.2[mus]"]
    k = 2
    fx = []
    for nombre, t, db in EFECTOS:
        ent += ["-i", SFX / f"{nombre}.wav"]
        ms = int(t * 1000)
        fil.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=mono,volume={db}dB,adelay={ms}|{ms}[e{k}]")
        fx.append(f"[e{k}]")
        k += 1
    fil.append("".join(fx) + f"amix=inputs={len(fx)}:normalize=0,apad=whole_dur={TOTAL}[fx]")
    vz = []
    for arch, t, db in VOCES:
        ent += ["-i", VOZ / arch]
        ms = int(t * 1000)
        fil.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=mono,volume={db}dB,adelay={ms}|{ms}[v{k}]")
        vz.append(f"[v{k}]")
        k += 1
    fil.append("".join(vz) + f"amix=inputs={len(vz)}:normalize=0,asplit=2[voz][llave]")
    fil.append("[mus][llave]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=300[musb]")
    fil.append(f"[musb][fx][voz]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-2:LRA=11,atrim=0:{TOTAL}[a]")
    run(*ent, "-filter_complex", ";".join(fil), "-map", "0:v", "-map", "[a]", "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "1", "-t", TOTAL, salida)


def cierre(reel, salida):
    sys.path.insert(0, str(SKILL / "scripts" / "diseno"))
    import cierre_reels as cr
    cr.TMP.mkdir(parents=True, exist_ok=True)
    mudo = cr.TMP / "anim_r1.mp4"
    cr.video_cierre(cr.COMPRADORES, 5.6, mudo, con_capas=True)
    final = cr.TMP / "cierre_r1.mp4"
    cr.audio_cierre(mudo, [], 2.75, 5.6, final)
    cr.unir(reel, TOTAL, final, salida)


if __name__ == "__main__":
    con_audio = OUT / "r1_audio.mp4"
    mezclar(OUT / "r1_mudo.mp4", con_audio)
    if "--sin-cierre" not in sys.argv:
        cierre(con_audio, OUT / "r1_final.mp4")
        print("listo:", OUT / "r1_final.mp4")
