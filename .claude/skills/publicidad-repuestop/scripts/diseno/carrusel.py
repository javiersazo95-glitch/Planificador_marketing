"""Genera un carrusel de RepuesTop (6 láminas 1080x1350) con los diseños aprobados el 12-nov:
portada A, intermedia M2 y final L2.

Uso:  python -I carrusel.py carruseles/c1_patente.json <carpeta de salida>

Ficha (JSON, en UTF-8):
{
  "total": 6,
  "portada": { "quien": "Compradores", "titulo": "¿Compraste un repuesto que <mark>no le hacía</mark> a tu auto?",
               "sub": "Plata perdida y otra vuelta al centro.", "celular": "ruta/captura.png" | "plantilla:celular_patente.png" },
  "pasos": [ { "titulo": "Pon tu <mark>patente</mark>", "texto": "…",
               "puntos": [ ["coche", "Búsqueda por patente"], ["check", "Datos completados"] ] } ],
  "final": { "cta": "repuestop.cl", "linea": "Pago seguro con Flow" }
}
Íconos disponibles: ver ICONOS. Los títulos admiten <mark>…</mark> (destacador amarillo).
"""
import json
import subprocess
import sys
from pathlib import Path
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent))  # noqa: E402
from rutas import SKILL, CHROME  # noqa: E402

A = (SKILL / "plantillas" / "assets").as_uri()
FUENTES = ("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap")


def ico(trazos):
    return f'<svg viewBox="0 0 24 24">{trazos}</svg>'


ICONOS = {
    "chat": ico('<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'),
    "alerta": ico('<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/>'),
    "coche": ico('<path d="M3 14l2-5.5h14L21 14v4.5h-3V17H6v1.5H3z"/><circle cx="7.5" cy="14" r="1"/><circle cx="16.5" cy="14" r="1"/><path d="M5.5 8.5l1-3h11l1 3"/>'),
    "check": ico('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>'),
    "escudo": ico('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
    "candado": ico('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>'),
    "lupa": ico('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
    "tienda": ico('<path d="M4 9l1.5-5h13L20 9v2a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0z"/><path d="M5 12v8h14v-8"/>'),
    "etiqueta": ico('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>'),
    "reloj": ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    "usuario": ico('<circle cx="10" cy="8" r="3.5"/><path d="M3 20c0-4 3-6 7-6s7 2 7 6M18 8v6M15 11h6"/>'),
    "documento": ico('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'),
    "calendario": ico('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4"/>'),
    "estrella": ico('<path d="M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z"/>'),
    "pin": ico('<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    "llave": ico('<path d="M14.5 6.5a4 4 0 1 1-1 7.5L8 19.5H5v-3l5.5-5.5a4 4 0 0 1 4-4.5z"/>'),
}

BASE = f"""*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:1080px;height:1350px;overflow:hidden;font-family:'Plus Jakarta Sans';color:#1B2440;position:relative;
  background:#fff url({A}/patron_azul.svg) repeat;background-size:420px}}
h1,p{{text-wrap:balance}}h1{{letter-spacing:-.03em;font-weight:800}}
h1 mark{{background:linear-gradient(transparent 62%,#F8C805 62%,#F8C805 92%,transparent 92%);color:inherit}}
.marca{{position:absolute;left:84px;top:70px;display:flex;align-items:center;gap:16px}}.marca img{{height:56px}}
.wm{{font:700 40px Montserrat;letter-spacing:-.02em;color:#3B4A5E}}.wm b{{color:#0F4EC2;font-weight:700}}
.idx{{position:absolute;right:84px;top:84px;font-weight:700;font-size:26px;color:#3B4A5E;opacity:.7}}
.desliza{{position:absolute;left:84px;bottom:90px;background:#0F4EC2;color:#fff;font-weight:800;font-size:34px;padding:22px 40px;border-radius:999px}}"""


def marca(i, n):
    return f'<div class="marca"><img src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span></div><div class="idx">{i}/{n}</div>'


def portada(c, n):
    p = c["portada"]
    cel = p["celular"]
    cel_uri = (SKILL / "plantillas" / cel.split(":", 1)[1]).as_uri() if cel.startswith("plantilla:") else Path(cel).resolve().as_uri()
    return f"""<style>{BASE}
.quien{{position:absolute;left:84px;top:230px;font-weight:800;font-size:28px;color:#0F4EC2;letter-spacing:2px;text-transform:uppercase}}
h1{{position:absolute;left:84px;right:84px;top:285px;font-size:92px;line-height:1.02}}
.sub{{position:absolute;left:84px;top:640px;width:430px;font-weight:600;font-size:36px;line-height:1.3;color:#3B4A5E}}
.cel{{position:absolute;left:560px;top:600px;width:440px;height:820px;border:14px solid #1B2440;border-radius:56px;overflow:hidden;
  background:#fff;box-shadow:0 30px 70px rgba(27,36,64,.22);transform:rotate(4deg)}}.cel img{{width:100%;display:block}}
</style>{marca(1, n)}<div class="quien">{p['quien']}</div><h1>{p['titulo']}</h1><p class="sub">{p['sub']}</p>
<div class="cel"><img src="{cel_uri}"></div><div class="desliza">Desliza →</div>"""


def intermedia(c, k, n):
    paso = c["pasos"][k]
    total = len(c["pasos"])
    puntos = "".join(f"<li>{ICONOS[i]}{t}</li>" for i, t in paso["puntos"])
    avance = "".join(f'<i class="{"on" if j == k else ""}"></i>' for j in range(total))
    return f"""<style>{BASE}
.puntos{{list-style:none;display:flex;flex-direction:column;gap:26px;border-top:3px solid #E6ECF7;padding-top:48px}}
.puntos li{{display:flex;align-items:center;gap:24px;font-size:36px;font-weight:700}}
.puntos svg{{width:58px;height:58px;flex:none;fill:none;stroke:#0F4EC2;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}}
.card{{position:absolute;left:60px;right:60px;top:190px;bottom:210px;background:#fff;border-radius:44px;
  box-shadow:0 30px 80px rgba(27,36,64,.16);padding:80px 70px}}
.chip{{display:inline-block;font-weight:800;font-size:28px;color:#0F4EC2;letter-spacing:2px;text-transform:uppercase}}
.card h1{{font-size:92px;line-height:1.02;margin:24px 0 40px}}
.txt{{font-weight:600;font-size:38px;line-height:1.32;color:#3B4A5E;margin-bottom:56px}}
.desliza{{left:auto;right:84px}}
.pasos{{position:absolute;left:84px;bottom:112px;display:flex;gap:14px}}.pasos i{{width:22px;height:22px;border-radius:50%;background:#C9D6EE}}.pasos i.on{{background:#0F4EC2;width:60px;border-radius:11px}}
</style>{marca(k + 2, n)}<div class="card"><span class="chip">Paso {k + 1} de {total}</span><h1>{paso['titulo']}</h1><p class="txt">{paso['texto']}</p><ul class="puntos">{puntos}</ul></div>
<div class="pasos">{avance}</div><div class="desliza">Desliza →</div>"""


def final(c):
    f = c["final"]
    return f"""<style>{BASE}
.c{{position:absolute;left:0;right:0;top:230px;display:flex;flex-direction:column;align-items:center;text-align:center}}
.ico{{width:440px}}
.c .wm{{font-family:Montserrat;font-weight:800;letter-spacing:-.03em;color:#3B4A5E;line-height:1;font-size:130px;margin-top:20px}}.c .wm b{{color:#0F4EC2;font-weight:800}}
.lema{{font-weight:800;letter-spacing:-.02em;line-height:1.05;font-size:60px;margin-top:36px;color:#0F4EC2}}
.lema span{{display:inline-block;border-bottom:6px solid #F8C805;padding:6px 30px 14px}}
.pie{{position:absolute;left:0;right:0;bottom:90px;display:flex;flex-direction:column;align-items:center;gap:22px}}
.cta{{background:#0F4EC2;color:#fff;font-weight:800;font-size:44px;padding:22px 54px;border-radius:999px}}
.of{{font-weight:600;font-size:32px;color:#3B4A5E}}
</style><div class="c"><img class="ico" src="{A}/logo_icono.svg"><span class="wm">Repues<b>Top</b></span>
<p class="lema"><span>Movemos Chile juntos</span></p></div>
<div class="pie"><span class="cta">{f['cta']}</span><span class="of">{f['linea']}</span></div>"""


def png(salida, html):
    h = salida.with_suffix(".html")
    h.write_text(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><link href="{FUENTES}" rel="stylesheet"></head><body>{html}</body></html>', encoding="utf-8")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000",
                    "--force-device-scale-factor=1", "--window-size=1080,1350", f"--screenshot={salida}", h.as_uri()],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    h.unlink()


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    c = json.load(open(sys.argv[1], encoding="utf-8"))
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    n = 2 + len(c["pasos"])
    laminas = [portada(c, n)] + [intermedia(c, k, n) for k in range(len(c["pasos"]))] + [final(c)]
    for i, html in enumerate(laminas, 1):
        png(out / f"{i:02d}.png", html)
        print("ok", out / f"{i:02d}.png")


if __name__ == "__main__":
    main()
