"""Propuestas A, B y C de portada de post (1080x1350). Uso: python -I portadas.py"""
import subprocess
from pathlib import Path
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent))  # noqa: E402
from rutas import SKILL, CHROME  # noqa: E402

AQUI = Path(__file__).resolve().parent
A = (SKILL / "plantillas" / "assets").as_uri()
CEL = (SKILL / "plantillas" / "celular_patente.png").as_uri()
FUENTES = ("https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Plus+Jakarta+Sans:wght@500;600;700;800"
           "&family=Barlow+Condensed:wght@700;800&display=swap")
QUIEN, TIT, SUB = "Compradores", "¿Compraste un repuesto que no le hacía a tu auto?", "Plata perdida y otra vuelta al centro."
MARCA = f'<div class="marca"><img src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span></div>'
BASE = """*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;overflow:hidden;font-family:'Plus Jakarta Sans';color:#1B2440;position:relative;background:#fff}
.marca{position:absolute;left:84px;top:70px;display:flex;align-items:center;gap:16px}.marca img{height:56px}
.wm{font:700 40px Montserrat;letter-spacing:-.02em;color:#3B4A5E}.wm b{color:#0F4EC2;font-weight:700}
.idx{position:absolute;right:84px;top:84px;font-weight:700;font-size:26px;color:#3B4A5E;opacity:.7}
h1,p{text-wrap:balance}h1{letter-spacing:-.03em}"""

DIS = {}

# A · Pregunta grande con el celular asomando (enlaza con el cierre de los reels)
DIS["A"] = f"""<style>{BASE}
body{{background:#fff url({A}/patron_azul.svg) repeat;background-size:420px}}
.quien{{position:absolute;left:84px;top:230px;font-weight:800;font-size:28px;color:#0F4EC2;letter-spacing:2px;text-transform:uppercase}}
h1{{position:absolute;left:84px;right:84px;top:285px;font-weight:800;font-size:92px;line-height:1.02}}
h1 mark{{background:linear-gradient(transparent 62%,#F8C805 62%,#F8C805 92%,transparent 92%);color:inherit}}
.sub{{position:absolute;left:84px;top:640px;width:430px;font-weight:600;font-size:36px;line-height:1.3;color:#3B4A5E}}
.cel{{position:absolute;left:560px;top:600px;width:440px;height:820px;border:14px solid #1B2440;border-radius:56px;overflow:hidden;
  background:#fff;box-shadow:0 30px 70px rgba(27,36,64,.22);transform:rotate(4deg)}}.cel img{{width:100%;display:block}}
.desliza{{position:absolute;left:84px;bottom:90px;background:#0F4EC2;color:#fff;font-weight:800;font-size:34px;padding:22px 40px;border-radius:999px}}
</style>{MARCA}<div class="idx">1/6</div><div class="quien">{QUIEN}</div>
<h1>¿Compraste un repuesto que <mark>no le hacía</mark> a tu auto?</h1><p class="sub">{SUB}</p>
<div class="cel"><img src="{CEL}"></div><div class="desliza">Desliza →</div>"""

# B · La patente como protagonista, sobre una curva azul baja
DIS["B"] = f"""<style>{BASE}
.quien{{position:absolute;left:84px;top:210px;font-weight:800;font-size:28px;color:#0F4EC2}}
h1{{position:absolute;left:84px;right:84px;top:260px;font-weight:800;font-size:88px;line-height:1.03}}
.sub{{position:absolute;left:84px;top:600px;font-weight:600;font-size:36px;color:#3B4A5E}}
.curva{{position:absolute;left:-60px;right:-60px;bottom:-420px;height:880px;background:#0F4EC2;border-radius:50% 50% 0 0 / 34% 34% 0 0}}
.curva2{{position:absolute;left:-60px;right:-60px;bottom:-440px;height:880px;background:#3F7AE0;border-radius:50% 50% 0 0 / 34% 34% 0 0;transform:translateY(-22px)}}
.placa{{position:absolute;left:50%;top:790px;transform:translateX(-50%) rotate(-3deg);width:720px;height:250px;background:#fff;border:10px solid #1B2440;
  border-radius:26px;box-shadow:0 26px 50px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center}}
.placa span{{font:800 170px 'Barlow Condensed';letter-spacing:8px;color:#1B2440}}
.placa i{{position:absolute;top:12px;font:700 26px 'Barlow Condensed';letter-spacing:12px;color:#1B2440;font-style:normal}}
.lema{{position:absolute;left:0;right:0;bottom:200px;text-align:center;color:#fff;font-weight:700;font-size:40px}}
.desliza{{position:absolute;left:50%;bottom:80px;transform:translateX(-50%);background:#F8C805;color:#1B2440;font-weight:800;font-size:34px;padding:20px 44px;border-radius:999px}}
</style>{MARCA}<div class="idx">1/6</div><div class="quien">{QUIEN}</div><h1>{TIT}</h1><p class="sub">{SUB}</p>
<div class="curva2"></div><div class="curva"></div>
<div class="placa"><i>CHILE</i><span>ABCD·12</span></div>
<div class="lema">Con tu patente, lo que le hace a tu auto.</div><div class="desliza">Desliza →</div>"""

# C · Editorial: número grande, ícono de línea gigante y franja lateral
DIS["C"] = f"""<style>{BASE}
body{{background:#F3F6FC}}
.lado{{position:absolute;left:0;top:0;bottom:0;width:26px;background:#0F4EC2}}.lado::after{{content:"";position:absolute;left:0;top:0;width:26px;height:300px;background:#F8C805}}
.quien{{position:absolute;left:110px;top:230px;font-weight:800;font-size:28px;color:#fff;background:#1B2440;padding:10px 22px;border-radius:10px}}
h1{{position:absolute;left:110px;right:84px;top:320px;font-weight:800;font-size:96px;line-height:1.0}}
.raya{{position:absolute;left:110px;top:760px;width:140px;height:10px;border-radius:5px;background:#F8C805}}
.sub{{position:absolute;left:110px;top:810px;width:640px;font-weight:600;font-size:38px;line-height:1.3;color:#3B4A5E}}
.icono{{position:absolute;right:-120px;bottom:-60px;width:760px;opacity:.13}}.icono img{{width:100%}}
.icono svg{{width:100%;height:100%;fill:none;stroke:#0F4EC2;stroke-width:.9;stroke-linecap:round;stroke-linejoin:round}}
.desliza{{position:absolute;left:110px;bottom:90px;font-weight:800;font-size:34px;color:#0F4EC2;border-bottom:5px solid #F8C805;padding-bottom:6px}}
</style><div class="lado"></div>{MARCA.replace('left:84px','')}<style>.marca{{left:110px}}</style><div class="idx">1/6</div>
<div class="quien">{QUIEN}</div><h1>{TIT}</h1><div class="raya"></div><p class="sub">{SUB}</p>
<div class="icono"><img src="{A}/logo_icono.svg"></div>
<div class="desliza">Desliza →</div>"""

for k, cuerpo in DIS.items():
    h = AQUI / f"portada_{k}.html"
    h.write_text(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><link href="{FUENTES}" rel="stylesheet"></head><body>{cuerpo}</body></html>', encoding="utf-8")
    png = AQUI / f"portada_{k}.png"
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000",
                    "--force-device-scale-factor=1", "--window-size=1080,1350", f"--screenshot={png}", h.as_uri()],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    h.unlink(); print("ok", png.name)
