"""Mezcla (musica + efectos, sin voz nueva) y cierre L2 del reel de busqueda manual (produccion, Maxus T60).
Uso (desde estudio/):  python -I mezclar_manual.py
Si hay voces en public/voz_manual/ (v1..v6, mp3/wav/m4a), se mezclan en VOZ_INICIOS."""
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
SKILL = AQUI.parent / ".claude/skills/publicidad-repuestop"
SFX = SKILL / "plantillas/sfx"
MUSICA = Path(r"C:\Users\SMK GAMING\Downloads\Repuestop\Edicion\redes\musica\pixabay_the-mountain_upbeat-corporate_576594.mp3")
OUT = AQUI / "out"
VOZ_DIR = AQUI / "public" / "voz_manual"
TOTAL = 28.7
VOZ_INICIOS = [0.3, 5.4, 10.6, 13.5, 21.3, 25.5]
EFECTOS = [("pop", 0.35, -6), ("ding", 5.25, -8), ("pop", 5.85, -6), ("corte", 10.35, -10),
           ("clic", 11.2, -8), ("clic", 12.66, -8), ("clic", 13.6, -8), ("clic", 15.1, -8), ("clic", 16.0, -8), ("clic", 17.3, -8),
           ("clic", 18.0, -8), ("ding", 19.5, -10), ("clic", 21.25, -9), ("mensaje", 22.8, -8), ("pop", 23.3, -6),
           ("zoom_salida", 25.1, -12), ("motor", 25.6, -14), ("sting", 25.8, -14)]


def run(*a):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, a)], check=True)


def voces():
    res = []
    for i, ini in enumerate(VOZ_INICIOS, 1):
        for ext in ("mp3", "wav", "m4a"):
            p = VOZ_DIR / f"v{i}.{ext}"
            if p.exists():
                res.append((p, ini))
                break
    return res


def mezclar(video, salida):
    ent = ["-i", video, "-i", MUSICA]
    fil = [f"[1:a]atrim=0:{TOTAL},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,volume=-21dB,"
           f"afade=t=in:d=0.8,afade=t=out:st={TOTAL - 1.2}:d=1.2[mus]"]
    k, fx = 2, []
    for nombre, t, db in EFECTOS:
        ent += ["-i", SFX / f"{nombre}.wav"]
        ms = int(t * 1000)
        fil.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=mono,volume={db}dB,adelay={ms}|{ms}[e{k}]")
        fx.append(f"[e{k}]")
        k += 1
    fil.append("".join(fx) + f"amix=inputs={len(fx)}:normalize=0,apad=whole_dur={TOTAL}[fx]")
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
    print("voz:", f"{len(v)} frases" if v else "NO (musica y subtitulos)")


def cierre(reel, salida):
    sys.path.insert(0, str(SKILL / "scripts" / "diseno"))
    import cierre_reels as cr
    cr.TMP.mkdir(parents=True, exist_ok=True)
    mudo = cr.TMP / "anim_manual.mp4"
    cr.video_cierre(cr.COMPRADORES, 5.6, mudo, con_capas=True)
    final = cr.TMP / "cierre_manual.mp4"
    cr.audio_cierre(mudo, [], 2.75, 5.6, final)
    cr.unir(reel, TOTAL, final, salida)


if __name__ == "__main__":
    mezclar(OUT / "reel_manual_mudo.mp4", OUT / "reel_manual_audio.mp4")
    cierre(OUT / "reel_manual_audio.mp4", OUT / "reel_manual_final.mp4")
    print("listo:", OUT / "reel_manual_final.mp4")
