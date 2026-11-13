"""Historias de Instagram de RepuesTop (1080x1920) con la mascota Repuestín.

Uso:  python -I historias.py encuesta <carpeta de salida>

Zonas seguras de Instagram: 250 px libres arriba y 340 abajo. La mascota se lee (solo lectura) de la copia del repo Market
que indica config/local.json (repos.market + /public/repuestin.webp).
Los stickers nativos (pregunta, enlace) los pone el equipo al subir: aquí se deja el espacio libre.
"""
import json
import subprocess
import sys
from pathlib import Path
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent))  # noqa: E402
from rutas import SKILL, CHROME  # noqa: E402

RAIZ = SKILL.parents[2]
A = (SKILL / "plantillas" / "assets").as_uri()
CEL = (SKILL / "plantillas" / "celular_patente.png").as_uri()
FUENTES = ("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap")


def mascota():
    local = json.load(open(RAIZ / "config" / "local.json", encoding="utf-8"))
    ruta = Path(local["repos"]["market"]) / "public" / "repuestin.webp"
    if not ruta.exists():
        raise SystemExit(f"No encuentro la mascota en {ruta}")
    return ruta.as_uri()


BASE = f"""*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:1080px;height:1920px;overflow:hidden;font-family:'Plus Jakarta Sans';color:#1B2440;position:relative;
  background:#fff url({A}/patron_azul.svg) repeat;background-size:420px}}
h1,p{{text-wrap:balance}}h1{{letter-spacing:-.03em;font-weight:800}}
h1 mark{{background:linear-gradient(transparent 62%,#F8C805 62%,#F8C805 92%,transparent 92%);color:inherit}}
.marca{{position:absolute;left:0;right:0;top:270px;display:flex;justify-content:center;align-items:center;gap:16px}}.marca img{{height:60px}}
.wm{{font:700 44px Montserrat;letter-spacing:-.02em;color:#3B4A5E}}.wm b{{color:#0F4EC2;font-weight:700}}
.masc{{position:absolute;left:50%;transform:translateX(-50%);border-radius:50%;box-shadow:0 30px 70px rgba(27,36,64,.25);background:#fff}}
.pill{{display:inline-block;background:#0F4EC2;color:#fff;font-weight:800;font-size:48px;padding:24px 60px;border-radius:999px}}"""


def h1_historia(masc):  # Presentación de Repuestín
    return f"""<style>{BASE}
.masc{{top:430px;width:560px;height:560px}}
h1{{position:absolute;left:90px;right:90px;top:1080px;font-size:104px;line-height:1.02;text-align:center}}
.sub{{position:absolute;left:120px;right:120px;top:1370px;font-weight:600;font-size:48px;line-height:1.3;color:#3B4A5E;text-align:center}}
</style><div class="marca"><img src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span></div>
<img class="masc" src="{masc}"><h1>Hola, soy <mark>Repuestín</mark></h1>
<p class="sub">Te ayudo a encontrar tu repuesto.</p>"""


def h2_historia(masc):  # Pregunta (el sticker de pregunta va en el espacio libre de abajo)
    return f"""<style>{BASE}
.masc{{top:430px;width:360px;height:360px}}
h1{{position:absolute;left:80px;right:80px;top:850px;font-size:108px;line-height:1.02;text-align:center}}
.abajo{{position:absolute;left:0;right:0;top:1330px;text-align:center;font-weight:700;font-size:44px;color:#3B4A5E}}
</style><div class="marca"><img src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span></div>
<img class="masc" src="{masc}"><h1>¿Qué repuesto te costó <mark>más encontrar</mark>?</h1>
<p class="abajo">Cuéntanos aquí ↓</p>"""


def h3_historia(masc):  # Patente + enlace (el sticker de enlace va sobre el botón)
    return f"""<style>{BASE}
h1{{position:absolute;left:80px;right:80px;top:380px;font-size:96px;line-height:1.03;text-align:center}}
.cel{{position:absolute;left:50%;top:820px;width:420px;height:620px;border:14px solid #1B2440;border-radius:56px;overflow:hidden;
  background:#fff;box-shadow:0 30px 70px rgba(27,36,64,.25);transform:translateX(-50%) rotate(-3deg)}}.cel img{{width:100%;display:block}}
.link{{position:absolute;left:0;right:0;top:1480px;text-align:center}}
</style><div class="marca" style="top:250px"><img src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span></div>
<h1>Pon tu patente y mira <mark>solo lo que le sirve</mark> a tu auto</h1>
<div class="cel"><img src="{CEL}"></div><div class="link"><span class="pill">repuestop.cl</span></div>"""


def png(salida, html):
    h = salida.with_suffix(".html")
    h.write_text(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><link href="{FUENTES}" rel="stylesheet"></head><body>{html}</body></html>', encoding="utf-8")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000",
                    "--force-device-scale-factor=1", "--window-size=1080,1920", f"--screenshot={salida}", h.as_uri()],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    h.unlink()


def main():
    if len(sys.argv) != 3 or sys.argv[1] != "encuesta":
        raise SystemExit(__doc__)
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    m = mascota()
    for i, fn in enumerate((h1_historia, h2_historia, h3_historia), 1):
        png(out / f"{i:02d}.png", fn(m))
        print("ok", out / f"{i:02d}.png")


if __name__ == "__main__":
    main()
