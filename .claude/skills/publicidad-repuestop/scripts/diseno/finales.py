"""Finales v2 (12-nov): logo y lema protagonistas. L1 y L2 sin app; L3 y L4 con la app en chico.
Genera post 1080x1350 y reel 1080x1920 de cada uno, más la lámina comparativa finales_comparacion.png.
Uso: python -I finales.py"""
import subprocess
from pathlib import Path
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent))  # noqa: E402
from rutas import SKILL, CHROME  # noqa: E402

AQUI = Path(__file__).resolve().parent
A = (SKILL / "plantillas" / "assets").as_uri()
CEL = (SKILL / "plantillas" / "celular_patente.png").as_uri()
FUENTES = ("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap")
OFERTA, CTA = "App en Google Play y en la web", "repuestop.cl"


def base(h):
    return f"""*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:1080px;height:{h}px;overflow:hidden;font-family:'Plus Jakarta Sans';color:#1B2440;position:relative;
  background:#fff url({A}/patron_azul.svg) repeat;background-size:420px}}
.c{{position:absolute;left:0;right:0;display:flex;flex-direction:column;align-items:center;text-align:center}}
.wm{{font-family:Montserrat;font-weight:800;letter-spacing:-.03em;color:#3B4A5E;line-height:1}}.wm b{{color:#0F4EC2;font-weight:800}}
.lema{{font-weight:800;letter-spacing:-.02em;line-height:1.05;color:#1B2440}}
.lema mark{{background:linear-gradient(transparent 60%,#F8C805 60%,#F8C805 90%,transparent 90%);color:inherit}}
.cta{{background:#0F4EC2;color:#fff;font-weight:800;font-size:44px;padding:22px 54px;border-radius:999px}}
.of{{font-weight:600;font-size:32px;color:#3B4A5E}}
.cel{{position:absolute;border:12px solid #1B2440;border-radius:48px;overflow:hidden;background:#fff;box-shadow:0 26px 60px rgba(27,36,64,.2)}}
.cel img{{width:100%;display:block}}"""


def L1(h):  # Sello horizontal: logo grande en una línea, lema destacado debajo
    r = h > 1500
    return f"""<style>{base(h)}
.c{{top:{'46%' if r else '50%'};transform:translateY(-50%);gap:0}}
.logo{{display:flex;align-items:center;gap:28px}}.logo img{{height:140px}}.logo .wm{{font-size:116px}}
.lema{{font-size:{84 if r else 74}px;margin-top:70px}}
.raya{{width:160px;height:10px;border-radius:5px;background:#0F4EC2;margin:70px 0 60px}}
.of{{margin-top:26px}}
</style><div class="c"><div class="logo"><img src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span></div>
<p class="lema">Movemos <mark>Chile juntos</mark></p><div class="raya"></div><span class="cta">{CTA}</span><span class="of">{OFERTA}</span></div>"""


def L2(h):  # Sello vertical: ícono enorme arriba, nombre y lema como bloque de marca
    r = h > 1500
    return f"""<style>{base(h)}
.c{{top:{520 if r else 230}px}}
.ico{{width:{520 if r else 440}px}}
.c .wm{{font-size:{150 if r else 130}px;margin-top:20px}}
.lema{{font-size:{70 if r else 60}px;margin-top:36px;color:#0F4EC2}}
.lema span{{display:inline-block;border-bottom:6px solid #F8C805;padding:6px 30px 14px}}
.pie{{position:absolute;left:0;right:0;bottom:{380 if r else 90}px;display:flex;flex-direction:column;align-items:center;gap:22px}}
</style><div class="c"><img class="ico" src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span>
<p class="lema"><span>Movemos Chile juntos</span></p></div>
<div class="pie"><span class="cta">{CTA}</span><span class="of">{OFERTA}</span></div>"""


def L3(h):  # L1 arriba + celular chico asomando al pie, centrado
    r = h > 1500
    return f"""<style>{base(h)}
.c{{top:{300 if r else 110}px}}
.logo{{display:flex;align-items:center;gap:26px}}.logo img{{height:130px}}.logo .wm{{font-size:108px}}
.lema{{font-size:{80 if r else 66}px;margin-top:50px}}
.cta{{margin-top:{60 if r else 44}px}}.of{{margin-top:20px}}
.cel{{left:50%;transform:translateX(-50%);width:{420 if r else 360}px;height:900px;top:{1280 if r else 930}px}}
</style><div class="c"><div class="logo"><img src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span></div>
<p class="lema">Movemos <mark>Chile juntos</mark></p><span class="cta">{CTA}</span><span class="of">{OFERTA}</span></div>
<div class="cel"><img src="{CEL}"></div>"""


def L4(h):  # Marca alineada a la izquierda + celular chico girado a la derecha (como la portada A)
    r = h > 1500
    return f"""<style>{base(h)}
.izq{{position:absolute;left:84px;top:{420 if r else 170}px;display:flex;flex-direction:column;align-items:flex-start}}
.izq img{{height:{170 if r else 150}px}}
.izq .wm{{font-size:{120 if r else 104}px;margin-top:24px}}
.lema{{font-size:{80 if r else 68}px;margin-top:40px;text-align:left}}
.cta{{margin-top:{60 if r else 50}px}}.of{{margin-top:18px}}
.cel{{width:{380 if r else 330}px;height:820px;right:70px;top:{1050 if r else 760}px;transform:rotate(6deg)}}
</style><div class="izq"><img src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span>
<p class="lema">Movemos<br><mark>Chile juntos</mark></p><span class="cta">{CTA}</span><span class="of">{OFERTA}</span></div>
<div class="cel"><img src="{CEL}"></div>"""


def png(nombre, html, w, h):
    f = AQUI / f"{nombre}.html"
    f.write_text(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><link href="{FUENTES}" rel="stylesheet"></head><body>{html}</body></html>', encoding="utf-8")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000",
                    "--force-device-scale-factor=1", f"--window-size={w},{h}", f"--screenshot={AQUI / (nombre + '.png')}", f.as_uri()],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    f.unlink()


PROP = [("L1", L1, "Sin app", "Logo horizontal grande y lema destacado"),
        ("L2", L2, "Sin app", "Ícono enorme, nombre y lema como sello"),
        ("L3", L3, "App chica", "Logo y lema arriba; celular chico al pie"),
        ("L4", L4, "App chica", "Marca a la izquierda; celular girado a la derecha")]
def main():
    for k, fn, _, _ in PROP:
        for fmt, h in (("post", 1350), ("reel", 1920)):
            png(f"final_{k}_{fmt}", fn(h), 1080, h)
        print("ok", k)

    # Lámina comparativa: una fila por propuesta, con su rótulo, el post y el reel
    filas = "".join(f"""<div class="fila"><div class="rot"><b>{k}</b><span class="tag {'app' if 'app' in t.lower() else ''}">{t}</span><p>{d}</p></div>
    <figure><img src="final_{k}_post.png" style="height:500px"><figcaption>Post 4:5</figcaption></figure>
    <figure><img src="final_{k}_reel.png" style="height:500px"><figcaption>Reel 9:16</figcaption></figure></div>""" for k, _, t, d in PROP)
    H = 4 * 600 + 40
    html = f"""<style>*{{margin:0;box-sizing:border-box}}body{{width:1400px;height:{H}px;background:#EEF1F6;font-family:'Plus Jakarta Sans';padding:20px 40px}}
    .fila{{display:flex;align-items:center;gap:40px;height:600px;border-bottom:2px solid #D5DBE6}}.fila:last-child{{border:0}}
    .rot{{width:380px}}.rot b{{font:800 90px Montserrat;color:#1B2440;display:block}}
    .tag{{display:inline-block;font-weight:800;font-size:28px;padding:8px 20px;border-radius:12px;background:#1B2440;color:#fff;margin:6px 0 16px}}.tag.app{{background:#0F4EC2}}
    .rot p{{font-weight:600;font-size:30px;color:#3B4A5E;line-height:1.3}}
    figure{{display:flex;flex-direction:column;align-items:center;gap:8px}}figure img{{box-shadow:0 6px 20px rgba(0,0,0,.15)}}
    figcaption{{font-weight:700;font-size:24px;color:#3B4A5E}}</style>{filas}"""
    png("finales_comparacion", html, 1400, H)
    print("ok comparacion")


if __name__ == "__main__":
    main()
