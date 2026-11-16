#!/usr/bin/env python3
"""Convierte un carrusel de RepuesTop (ficha de diseno/carrusel.py) en un VIDEO vertical con musica, efectos
y el cierre L2 animado: para TikTok, Reels, Shorts y Facebook Reels (los posts de solo imagen quedaban planos).

Uso:
  python -I carrusel_video.py <ficha_carrusel.json> <salida.mp4> --musica <pista.mp3>
         [--db -21] [--seg 3.4] [--oferta "Pago seguro con Flow"] [--inicio 0]

- Genera las laminas 9:16 SIN el boton «Desliza →» (no tiene sentido en video), usa portada + pasos
  (la lamina final se reemplaza por el cierre L2 animado: logo, motor, voz de El Faraon y boton).
- Cada lamina dura --seg segundos con acercamiento suave; reel.py agrega whoosh en cada cambio de lamina.
- --inicio: segundo de la pista donde empieza la musica (para no arrancar en silencio o en un cierre).
- La musica debe tener licencia comercial (ver Edicion/redes/musica/licencias.md).
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
DISENO = AQUI / "diseno"


def correr(*a):
    subprocess.run([str(x) for x in a], check=True)


def duracion(ruta):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(ruta)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ficha")
    ap.add_argument("salida")
    ap.add_argument("--musica", required=True)
    ap.add_argument("--db", type=float, default=-21)
    ap.add_argument("--seg", type=float, default=3.4)
    ap.add_argument("--oferta", default="Pago seguro con Flow")
    ap.add_argument("--inicio", type=float, default=0)
    a = ap.parse_args()

    ficha = json.load(open(a.ficha, encoding="utf-8"))
    ficha["alto"] = 1920
    salida = Path(a.salida).resolve()
    salida.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        t = Path(t)
        (t / "ficha.json").write_text(json.dumps(ficha, ensure_ascii=False), encoding="utf-8")
        # laminas 9:16 sin «Desliza →»
        codigo = ("import sys; p=r'%s'; s=open(p,encoding='utf8').read().replace('<div class=\"desliza\">Desliza →</div>',''); "
                  "sys.argv=[p,sys.argv[1],sys.argv[2]]; exec(compile(s,p,'exec'),{'__name__':'__main__','__file__':p})"
                  % str(DISENO / "carrusel.py"))
        correr(sys.executable, "-I", "-c", codigo, t / "ficha.json", t / "laminas")
        pngs = sorted((t / "laminas").glob("*.png"))[:-1]          # sin la lamina final: la reemplaza el cierre L2
        total = a.seg * len(pngs)
        # pista de "voz" en silencio (reel.py manda la duracion con ella)
        correr("ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", f"{total - 0.8:.2f}", t / "silencio.wav")
        # musica desde el segundo --inicio
        musica = t / "musica.mp3"
        correr("ffmpeg", "-v", "error", "-y", "-ss", f"{a.inicio}", "-i", a.musica, "-t", f"{total + 2:.1f}", "-c:a", "libmp3lame", "-b:a", "192k", musica)
        escenas = [{"archivo": p.name, "hasta": round(a.seg * (i + 1), 2) if i < len(pngs) - 1 else "fin", "empuje": 0.04} for i, p in enumerate(pngs)]
        for p in pngs:
            (t / p.name).write_bytes(p.read_bytes())
        reel = {"voz": "silencio.wav", "cola": 0.8, "musica": {"archivo": "musica.mp3", "db": a.db}, "escenas": escenas, "sfx_auto": True}
        (t / "reel.json").write_text(json.dumps(reel), encoding="utf-8")
        sin_cierre = t / "sin_cierre.mp4"
        correr(sys.executable, "-I", AQUI / "reel.py", "render", t / "reel.json", "--out", sin_cierre)
        # cierre L2 animado
        sys.path.insert(0, str(DISENO))
        import cierre_reels as cr
        cr.TMP.mkdir(parents=True, exist_ok=True)
        mudo = cr.TMP / "anim_carrusel_video.mp4"
        cr.video_cierre(a.oferta, 5.6, mudo, con_capas=True)
        cierre = cr.TMP / "cierre_carrusel_video.mp4"
        cr.audio_cierre(mudo, [], 2.75, 5.6, cierre)
        cr.unir(sin_cierre, duracion(sin_cierre), cierre, salida)
        hoja = sin_cierre.with_name(sin_cierre.stem + "_hoja.png")
        if hoja.exists():
            (salida.with_name(salida.stem + "_hoja.png")).write_bytes(hoja.read_bytes())
    print("listo:", salida, f"({duracion(salida):.1f} s)")


if __name__ == "__main__":
    main()
