"""Mezcla de sonido y cierre L2 del reel "Recorriste tiendas... busca por tu patente".

Pasos: video mudo de Remotion (out/reel_patente_mudo.mp4) + música + efectos + voz de Fer (si existe)
-> out/reel_patente_audio.mp4 -> se pega el cierre L2 animado (el oficial de la skill) -> out/reel_patente_final.mp4

La voz va en public/voz/l1..l6 (mp3, wav o m4a), una por frase del GUION_VOZ de src/reel_patente.jsx.
Si faltan, el reel sale con música y efectos (borrador sin voz).

Uso (desde estudio/):  python -I mezclar_reel_patente.py [--sin-cierre]
"""
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
SKILL = RAIZ / ".claude/skills/publicidad-repuestop"
SFX = SKILL / "plantillas/sfx"
MUSICA = Path(r"C:\Users\SMK GAMING\Downloads\Repuestop\Edicion\redes\musica\pixabay_the-mountain_upbeat-corporate_576594.mp3")
OUT = AQUI / "out"
VOZ_DIR = AQUI / "public" / "voz"
TOTAL = 29.4                      # = TIEMPOS.total de reel_patente.jsx
VOZ_INICIOS = [0.3, 5.4, 10.6, 14.3, 19.5, 25.8]   # = TIEMPOS.voz

# (efecto, segundo, dB)
EFECTOS = [
    ("pop", 0.35, -6), ("ding", 5.25, -8), ("pop", 5.85, -6), ("corte", 10.35, -10),
    ("tecla", 14.27, -8), ("tecla", 14.44, -8), ("tecla", 14.61, -8), ("tecla", 14.78, -8), ("tecla", 14.95, -8), ("tecla", 15.12, -8),
    ("clic", 15.95, -8), ("ding", 17.05, -8), ("clic", 19.62, -9), ("zoom", 19.7, -12), ("pop", 20.6, -6),
    ("zoom_salida", 25.35, -12), ("motor", 25.7, -14), ("sting", 25.9, -14),
]


def run(*a):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, a)], check=True)


def voces():
    res = []
    for i, ini in enumerate(VOZ_INICIOS, 1):
        for ext in ("mp3", "wav", "m4a"):
            p = VOZ_DIR / f"l{i}.{ext}"
            if p.exists():
                res.append((p, ini))
                break
    return res


def mezclar(video, salida):
    ent = ["-i", video, "-i", MUSICA]
    fil = [f"[1:a]atrim=0:{TOTAL},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,volume=-21dB,"
           f"afade=t=in:d=0.8,afade=t=out:st={TOTAL - 1.2}:d=1.2[mus]"]
    k = 2
    etiquetas = []
    for nombre, t, db in EFECTOS:
        ent += ["-i", SFX / f"{nombre}.wav"]
        ms = int(t * 1000)
        fil.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=mono,volume={db}dB,adelay={ms}|{ms}[e{k}]")
        etiquetas.append(f"[e{k}]")
        k += 1
    fx = "".join(etiquetas)
    fil.append(f"{fx}amix=inputs={len(etiquetas)}:normalize=0,apad=whole_dur={TOTAL}[fx]")
    v = voces()
    if v:
        vet = []
        for p, ini in v:
            ent += ["-i", p]
            ms = int(ini * 1000)
            fil.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=mono,adelay={ms}|{ms}[v{k}]")
            vet.append(f"[v{k}]")
            k += 1
        fil.append("".join(vet) + f"amix=inputs={len(vet)}:normalize=0,asplit=2[voz][llave]")
        fil.append("[mus][llave]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[musb]")
        fil.append(f"[musb][fx][voz]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-2:LRA=11,atrim=0:{TOTAL}[a]")
    else:
        fil.append(f"[mus][fx]amix=inputs=2:normalize=0,loudnorm=I=-18:TP=-2:LRA=11,atrim=0:{TOTAL}[a]")
    run(*ent, "-filter_complex", ";".join(fil), "-map", "0:v", "-map", "[a]", "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "1", "-t", TOTAL, salida)
    print("voz de Fer:", "sí (%d frases)" % len(v) if v else "NO (borrador sin voz)")


def cierre(reel, salida):
    sys.path.insert(0, str(SKILL / "scripts" / "diseno"))
    import cierre_reels as cr
    cr.TMP.mkdir(parents=True, exist_ok=True)
    mudo = cr.TMP / "anim_patente.mp4"
    cr.video_cierre(cr.COMPRADORES, 5.6, mudo, con_capas=True)
    final = cr.TMP / "cierre_patente.mp4"
    cr.audio_cierre(mudo, [], 2.75, 5.6, final)
    cr.unir(reel, TOTAL, final, salida)


if __name__ == "__main__":
    mudo = OUT / "reel_patente_mudo.mp4"
    con_audio = OUT / "reel_patente_audio.mp4"
    mezclar(mudo, con_audio)
    if "--sin-cierre" not in sys.argv:
        cierre(con_audio, OUT / "reel_patente_final.mp4")
        print("listo:", OUT / "reel_patente_final.mp4")
