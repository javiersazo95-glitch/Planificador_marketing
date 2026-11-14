"""Propuestas M1, M2 y M3 de lámina intermedia (1080x1350), en la línea de la portada A. Uso: python -I intermedias.py"""
import subprocess
from pathlib import Path
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent))  # noqa: E402
from rutas import SKILL, CHROME  # noqa: E402

AQUI = Path(__file__).resolve().parent
A = (SKILL / "plantillas" / "assets").as_uri()
FUENTES = ("https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap")
CHAT = '<svg viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>'
ALERTA = '<svg viewBox="0 0 24 24"><path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/></svg>'
TEXTO = "Chatea o pide cotización a la tienda. Antes de pagar te avisamos si el repuesto no figura como compatible."
TIT = 'Pregunta <mark>antes de comprar</mark>'
PUNTOS = f'<ul class="puntos"><li>{CHAT}Chat con la tienda</li><li>{ALERTA}Aviso de compatibilidad</li></ul>'
MARCA = f'<div class="marca"><img src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span></div><div class="idx">3/6</div>'
BASE = f"""*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:1080px;height:1350px;overflow:hidden;font-family:'Plus Jakarta Sans';color:#1B2440;position:relative;
  background:#fff url({A}/patron_azul.svg) repeat;background-size:420px}}
h1,p{{text-wrap:balance}}h1{{letter-spacing:-.03em;font-weight:800}}
h1 mark{{background:linear-gradient(transparent 62%,#F8C805 62%,#F8C805 92%,transparent 92%);color:inherit}}
.marca{{position:absolute;left:84px;top:70px;display:flex;align-items:center;gap:16px}}.marca img{{height:56px}}
.wm{{font:700 40px Montserrat;letter-spacing:-.02em;color:#3B4A5E}}.wm b{{color:#0F4EC2;font-weight:700}}
.idx{{position:absolute;right:84px;top:84px;font-weight:700;font-size:26px;color:#3B4A5E;opacity:.7}}
.puntos{{list-style:none;display:flex;flex-direction:column;gap:26px}}
.puntos li{{display:flex;align-items:center;gap:24px;font-size:36px;font-weight:700}}
.puntos svg{{width:58px;height:58px;flex:none;fill:none;stroke:#0F4EC2;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}}
.desliza{{position:absolute;left:84px;bottom:90px;background:#0F4EC2;color:#fff;font-weight:800;font-size:34px;padding:22px 40px;border-radius:999px}}"""

DIS = {}

# M1 · Número de paso gigante
DIS["M1"] = f"""<style>{BASE}
.num{{position:absolute;left:60px;top:150px;font:800 360px/1 'Plus Jakarta Sans';letter-spacing:-.06em;color:transparent;-webkit-text-stroke:5px #0F4EC2;opacity:.9}}
h1{{position:absolute;left:84px;right:84px;top:520px;font-size:96px;line-height:1.02}}
.txt{{position:absolute;left:84px;right:120px;top:770px;font-weight:600;font-size:38px;line-height:1.32;color:#3B4A5E}}
.puntos{{position:absolute;left:84px;top:960px}}
</style>{MARCA}<div class="num">02</div><h1>{TIT}</h1><p class="txt">{TEXTO}</p>{PUNTOS}<div class="desliza">Desliza →</div>"""

# M2 · Tarjeta blanca flotante sobre la textura
DIS["M2"] = f"""<style>{BASE}
.card{{position:absolute;left:60px;right:60px;top:190px;bottom:210px;background:#fff;border-radius:44px;
  box-shadow:0 30px 80px rgba(27,36,64,.16);padding:80px 70px}}
.chip{{display:inline-block;font-weight:800;font-size:28px;color:#0F4EC2;letter-spacing:2px;text-transform:uppercase}}
.card h1{{font-size:92px;line-height:1.02;margin:24px 0 40px}}
.txt{{font-weight:600;font-size:38px;line-height:1.32;color:#3B4A5E;margin-bottom:56px}}
.puntos{{border-top:3px solid #E6ECF7;padding-top:48px}}
.desliza{{left:auto;right:84px}}
.pasos{{position:absolute;left:84px;bottom:112px;display:flex;gap:14px}}.pasos i{{width:22px;height:22px;border-radius:50%;background:#C9D6EE}}.pasos i.on{{background:#0F4EC2;width:60px;border-radius:11px}}
</style>{MARCA}<div class="card"><span class="chip">Paso 2 de 4</span><h1>{TIT}</h1><p class="txt">{TEXTO}</p>{PUNTOS}</div>
<div class="pasos"><i></i><i class="on"></i><i></i><i></i></div><div class="desliza">Desliza →</div>"""

# M3 · Cinta de pasos arriba
PASOS = "".join(f'<div class="p{" on" if i == 2 else (" ok" if i < 2 else "")}"><b>{i}</b><span>{t}</span></div>'
                for i, t in enumerate(["Elige tu auto", "Pregunta", "Paga", "Retira"], 1))
DIS["M3"] = f"""<style>{BASE}
.cinta{{position:absolute;left:84px;right:84px;top:200px;display:flex;justify-content:space-between}}
.cinta::before{{content:"";position:absolute;left:40px;right:40px;top:38px;height:5px;background:#C9D6EE}}
.cinta .p{{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;width:200px}}
.cinta b{{width:80px;height:80px;border-radius:50%;background:#fff;border:5px solid #C9D6EE;display:flex;align-items:center;justify-content:center;font-size:36px;color:#8A9AB5}}
.cinta span{{font-size:26px;font-weight:700;color:#8A9AB5;text-align:center}}
.cinta .ok b{{border-color:#0F4EC2;color:#0F4EC2}}.cinta .ok span{{color:#3B4A5E}}
.cinta .on b{{background:#0F4EC2;border-color:#0F4EC2;color:#fff;box-shadow:0 0 0 10px #F8C805}}.cinta .on span{{color:#1B2440;font-weight:800}}
h1{{position:absolute;left:84px;right:84px;top:440px;font-size:96px;line-height:1.02}}
.txt{{position:absolute;left:84px;right:120px;top:690px;font-weight:600;font-size:38px;line-height:1.32;color:#3B4A5E}}
.puntos{{position:absolute;left:84px;top:900px}}
</style>{MARCA}<div class="cinta">{PASOS}</div><h1>{TIT}</h1><p class="txt">{TEXTO}</p>{PUNTOS}<div class="desliza">Desliza →</div>"""

for k, cuerpo in DIS.items():
    h = AQUI / f"intermedia_{k}.html"
    h.write_text(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><link href="{FUENTES}" rel="stylesheet"></head><body>{cuerpo}</body></html>', encoding="utf-8")
    png = AQUI / f"intermedia_{k}.png"
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000",
                    "--force-device-scale-factor=1", "--window-size=1080,1350", f"--screenshot={png}", h.as_uri()],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    h.unlink(); print("ok", png.name)
