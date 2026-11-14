#!/usr/bin/env python3
"""Arma piezas de redes de RepuesTop (post 1080x1350, carrusel, historia 1080x1920) desde una ficha JSON.

Uso:
  python -I pieza.py nuevo <post|carrusel|historia> <ficha.json>   # crea una ficha de ejemplo para editar
  python -I pieza.py render <ficha.json> [--out CARPETA]            # genera HTML + PNG por lámina
  python -I pieza.py iconos                                          # lista los íconos disponibles

La ficha:
{
  "formato": "post" | "historia",          (carrusel = post con varias láminas)
  "nombre": "t1-cotizaciones-perdidas",
  "laminas": [
    {"tipo": "dolor", "quien": "Casas de repuestos", "titulo": "...", "texto": "...",
     "solucion": "...", "puntos": [["chat", "..."], ["check", "..."]],
     "oferta": "...", "cta": "repuestop.cl", "recreacion": false},
    {"tipo": "texto", "titulo": "...", "texto": "...", "puntos": [...]},
    {"tipo": "cierre", "titulo": "...", "texto": "...", "cta": "...", "oferta": "..."},
    {"tipo": "cierre_claro", "titulo": "...", "oferta": "...", "cta": "...",
     "celular": "pantalla.png"},  # cierre de reels (aprobado 12-nov): blanco con textura, sin ola;
    {"tipo": "diccionario", "serie": "Diccionario del repuestero", "capitulo": 1, "portada": true},
    {"tipo": "diccionario", "serie": "...", "capitulo": 1, "palabra": "Precio", "categoria": "sust.",
     "definicion": "...", "ver_tambien": "«¿?»", "burbuja": {"texto": "precio", "hora": "23:47"}},
    {"tipo": "chat", "contacto": "Número desconocido", "estado": "en línea", "titulo": "CONFÍA, DIJO",
     "mensajes": [{"de": "otro", "texto": "...", "hora": "21:14"},
                  {"de": "yo", "comprobante": {"titulo": "Transferencia exitosa", "monto": "$380.000"}, "hora": "21:15"},
                  {"sistema": "Este contacto te bloqueó"}]}   # chat simulado genérico (sin marcas)
  ]                                # "celular" (opcional, ruta relativa a la ficha) = captura limpia de la app
}
Los textos se escapan; no se admite HTML dentro de la ficha. Sin dependencias: solo Chrome instalado.
"""
import argparse
import html
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
PLANTILLAS = SKILL / "plantillas"
MEDIDAS = {"post": (1080, 1350), "historia": (1080, 1920)}
FUENTES = ("https://fonts.googleapis.com/css2?family=Montserrat:wght@700"
           "&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap")

# Íconos de línea (se pintan con stroke; sin rellenos ni cuadros de color, como la tarjeta aprobada).
ICONOS = {
    "chat": '<svg viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>',
    "cuaderno": '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 3v18M12 8h4M12 12h4"/></svg>',
    "lupa": '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>',
    "caja": '<svg viewBox="0 0 24 24"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
    "check": '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/></svg>',
    "escudo": '<svg viewBox="0 0 24 24"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>',
    "candado": '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/></svg>',
    "pin": '<svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 12h.01M12 12h.01M16 12h.01" stroke-width="3"/></svg>',
    "ubicacion": '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    "reloj": '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
    "boleta": '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/></svg>',
    "celular": '<svg viewBox="0 0 24 24"><rect x="6.5" y="2.5" width="11" height="19" rx="2"/><path d="M10.5 18.5h3"/></svg>',
    "llave": '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3.5 17.5 6.5 20.5l6-6a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
    "alerta": '<svg viewBox="0 0 24 24"><path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/></svg>',
    "auto": '<svg viewBox="0 0 24 24"><path d="M3.5 16v-3.2l2-4.6A2 2 0 0 1 7.3 7h9.4a2 2 0 0 1 1.8 1.2l2 4.6V16z"/><path d="M3.5 12.5h17"/><circle cx="7.5" cy="16.5" r="1.7"/><circle cx="16.5" cy="16.5" r="1.7"/></svg>',
    "tienda": '<svg viewBox="0 0 32 32"><path d="M5.5 14v13h21V14"/><path d="M4 13 6.5 5h19L28 13"/><path d="M4 13a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0"/><path d="M18 27v-8h5v8"/><rect x="9" y="18.5" width="5.5" height="4.5" rx=".5"/></svg>',
    "carro": '<svg viewBox="0 0 24 24"><circle cx="8" cy="20.5" r="1.3"/><circle cx="18" cy="20.5" r="1.3"/><path d="M2 3h2.3l2.5 12.2a1.6 1.6 0 0 0 1.6 1.3h9.4a1.6 1.6 0 0 0 1.6-1.2L21.5 7H5.4"/></svg>',
    "taller": '<svg viewBox="0 0 32 32"><path d="M4 9v19M28 9v19M2 28h4M26 28h4M4 22.5h24"/><path d="M8 19.5v-3.6l2.3-4.6a2 2 0 0 1 1.8-1.1h7.8a2 2 0 0 1 1.8 1.1l2.3 4.6v3.6Z"/><path d="M8.5 15.8h15"/><circle cx="11.5" cy="20.8" r="1.6"/><circle cx="20.5" cy="20.8" r="1.6"/></svg>',
}

EJEMPLO = {
    "formato": "post",
    "nombre": "ejemplo",
    "dolor": "T-1",
    "laminas": [
        {"tipo": "dolor", "quien": "Casas de repuestos",
         "titulo": "¿Cuántas cotizaciones se te perdieron hoy en el WhatsApp?",
         "texto": "Respondes tarde y el cliente ya compró en otra parte.",
         "solucion": "En RepuesTop cada cotización llega ordenada, por producto.",
         "puntos": [["chat", "Cotización y chat dentro de la app"], ["check", "Aviso de cada pregunta nueva"]],
         "oferta": "1 mes gratis para tiendas nuevas", "cta": "repuestop.cl", "recreacion": False},
    ],
    "descripcion": "Publicidad · RepuesTop. ...",
}


def e(texto):
    return html.escape(str(texto or ""))


def uri(path):
    return path.resolve().as_uri()


def marca(blanca=False):
    logo = PLANTILLAS / "assets" / ("logo_icono_blanco.svg" if blanca else "logo_icono.svg")
    return f'<div class="marca"><img src="{uri(logo)}" alt=""><span class="wordmark">Repues<b>Top</b></span></div>'


def puntos(lista):
    if not lista:
        return ""
    items = []
    for icono, texto in lista:
        if icono not in ICONOS:
            sys.exit(f"Ícono desconocido: {icono}. Disponibles: {', '.join(ICONOS)}")
        items.append(f"<li>{ICONOS[icono]}<span>{e(texto)}</span></li>")
    return f'<ul class="puntos">{"".join(items)}</ul>'


def lamina(formato, l, i, total):
    tipo = l.get("tipo", "dolor")
    indice = f'<span class="indice">{i}/{total}</span>' if total > 1 else ""
    aviso = '<span class="aviso">Recreación</span>' if l.get("recreacion") else ""
    oferta = f'<p class="oferta">{e(l["oferta"])}</p>' if l.get("oferta") else ""
    cta = f'<span class="cta">{e(l["cta"])}</span>' if l.get("cta") else ""
    if tipo == "dolor":
        quien = f'<span class="quien">{e(l["quien"])}</span>' if l.get("quien") else ""
        texto = f'<p>{e(l["texto"])}</p>' if l.get("texto") else ""
        cuerpo = (f'{marca()}{indice}{aviso}'
                  f'<div class="dolor">{quien}<h1>{e(l["titulo"])}</h1>{texto}</div>'
                  f'<div class="ola"><div class="ola-in"><h2>{e(l.get("solucion"))}</h2><div class="raya"></div>'
                  f'{puntos(l.get("puntos"))}</div>'
                  f'<div class="pie">{oferta or "<span></span>"}{cta}</div></div>')
        clase = ""
    elif tipo == "texto":
        texto = f'<p>{e(l["texto"])}</p>' if l.get("texto") else ""
        cuerpo = (f'{marca()}{indice}{aviso}<div class="cuerpo"><h1>{e(l["titulo"])}</h1>'
                  f'<div class="raya"></div>{texto}{puntos(l.get("puntos"))}</div>')
        clase = "texto"
    elif tipo == "cierre_claro":
        etiqueta = f'<span class="etiqueta">{e(l["oferta"])}</span>' if l.get("oferta") else ""
        cel = ""
        if l.get("celular"):
            ruta = (Path(l["_base"]) / l["celular"]).resolve()
            if not ruta.exists():
                sys.exit(f"No existe la captura del celular: {ruta}")
            cel = f'<div class="celu"><img src="{uri(ruta)}" alt=""></div>'
        # El lema va siempre (pedido del usuario, 12-nov): con celular, bajo el botón; sin celular, al pie
        lema = '<span class="lema">RepuesTop, movemos Chile juntos</span>' if cel else ""
        cuerpo = (f'<div class="arriba">{marca()}<h1>{e(l["titulo"])}</h1>{etiqueta}{cta}{lema}</div>{cel}'
                  + ('' if cel else '<span class="eslogan">RepuesTop, movemos Chile juntos</span>'))
        clase = "cierre-claro" + (" con-celu" if cel else "")
    elif tipo == "diccionario":
        serie = e(l.get("serie", "Diccionario del repuestero"))
        cap = f'Cap. {e(l["capitulo"])}' if l.get("capitulo") else ""
        if l.get("portada"):
            cuerpo = (f'{marca()}<div class="dic-portada">{ICONOS["cuaderno"]}<h1>{serie}</h1>'
                      f'<span class="dic-cap">{cap}</span></div>')
        else:
            b = l.get("burbuja") or {}
            burbuja = (f'<div class="dic-burbuja"><span>{e(b.get("texto"))}</span>'
                       f'<small>{e(b.get("hora", ""))}</small></div>') if b.get("texto") else ""
            ver = f'<p class="dic-ver">Ver también: {e(l["ver_tambien"])}</p>' if l.get("ver_tambien") else ""
            cat = f' <em>({e(l["categoria"])})</em>' if l.get("categoria") else ""
            cuerpo = (f'{marca()}<span class="dic-serie">{serie} · {cap}</span>{burbuja}'
                      f'<div class="dic-cuerpo"><h1>{e(l["palabra"])}.{cat}</h1><div class="raya"></div>'
                      f'<p class="dic-def">{e(l.get("definicion"))}</p>{ver}</div>')
        clase = "diccionario"
    elif tipo == "chat":
        burbujas = []
        for m in l.get("mensajes", []):
            if m.get("sistema"):
                burbujas.append(f'<div class="ch-sis">{e(m["sistema"])}</div>')
                continue
            yo = m.get("de") == "yo"
            vistos = ' <b class="ch-vistos">✓✓</b>' if yo else ""
            hora = f'<small>{e(m.get("hora", ""))}{vistos}</small>'
            if m.get("comprobante"):
                c = m["comprobante"]
                contenido = (f'<div class="ch-comp">{ICONOS["check"]}<span>{e(c.get("titulo"))}</span>'
                             f'<strong>{e(c.get("monto"))}</strong><em>{e(c.get("detalle", "Destinatario: •••• ••••"))}</em></div>')
            else:
                contenido = f'<span>{e(m.get("texto"))}</span>'
            burbujas.append(f'<div class="ch-msg {"yo" if yo else "otro"}">{contenido}{hora}</div>')
        titulo = f'<div class="ch-tp">{e(l["titulo"])}</div>' if l.get("titulo") else ""
        cuerpo = (f'<div class="ch-head"><span class="ch-back">‹</span><span class="ch-avatar"></span>'
                  f'<div><b>{e(l.get("contacto", "Número desconocido"))}</b><small>{e(l.get("estado", ""))}</small></div></div>'
                  f'<div class="ch-lista">{"".join(burbujas)}</div>{titulo}')
        clase = "chat"
    elif tipo == "cierre":
        texto = f'<p>{e(l["texto"])}</p>' if l.get("texto") else ""
        cuerpo = (f'<div class="sobre-azul">{marca(blanca=True)}</div>{indice}'
                  f'<div class="cuerpo"><h1>{e(l["titulo"])}</h1>{texto}{oferta}{cta}</div>'
                  f'<span class="eslogan">Movemos Chile juntos</span>')
        clase = "cierre"
    else:
        sys.exit(f"Tipo de lámina desconocido: {tipo} (usa dolor, texto, diccionario, chat, cierre o cierre_claro)")
    css = uri(PLANTILLAS / "marca.css")
    return (f'<!doctype html><html lang="es"><head><meta charset="utf-8">'
            f'<link href="{FUENTES}" rel="stylesheet"><link href="{css}" rel="stylesheet"></head>'
            f'<body><section class="pieza {formato} {clase}">{cuerpo}</section></body></html>')


def chrome():
    candidatos = [os.environ.get("CHROME", ""),
                  r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                  r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                  shutil.which("chrome") or "", shutil.which("google-chrome") or ""]
    for c in candidatos:
        if c and Path(c).exists():
            return c
    sys.exit("No encontré Chrome. Define la variable CHROME con su ruta.")


def render(ficha_path, out):
    ficha = json.loads(Path(ficha_path).read_text(encoding="utf-8"))
    formato = ficha.get("formato", "post")
    if formato == "carrusel":
        formato = "post"
    if formato not in MEDIDAS:
        sys.exit(f"Formato desconocido: {formato}")
    w, h = MEDIDAS[formato]
    out = Path(out or Path(ficha_path).parent)
    out.mkdir(parents=True, exist_ok=True)
    nombre = ficha.get("nombre") or Path(ficha_path).stem
    laminas = ficha["laminas"]
    exe = chrome()
    for i, l in enumerate(laminas, 1):
        l = {**l, "_base": str(Path(ficha_path).resolve().parent)}
        sufijo = f"_{i:02d}" if len(laminas) > 1 else ""
        html_path = out / f"{nombre}{sufijo}.html"
        png_path = out / f"{nombre}{sufijo}.png"
        html_path.write_text(lamina(formato, l, i, len(laminas)), encoding="utf-8")
        subprocess.run([exe, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                        "--virtual-time-budget=8000", "--force-device-scale-factor=1",
                        f"--window-size={w},{h}", f"--screenshot={png_path.resolve()}",
                        html_path.resolve().as_uri()],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"ok {png_path}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    n = sub.add_parser("nuevo")
    n.add_argument("formato", choices=["post", "carrusel", "historia"])
    n.add_argument("ficha")
    r = sub.add_parser("render")
    r.add_argument("ficha")
    r.add_argument("--out")
    sub.add_parser("iconos")
    a = ap.parse_args()
    if a.cmd == "iconos":
        print("\n".join(ICONOS))
    elif a.cmd == "nuevo":
        ej = dict(EJEMPLO, formato=a.formato)
        if a.formato == "carrusel":
            ej["laminas"] = EJEMPLO["laminas"] + [
                {"tipo": "texto", "titulo": "Una idea por lámina", "texto": "Texto corto y concreto."},
                {"tipo": "cierre", "titulo": "Súmate a RepuesTop", "cta": "repuestop.cl",
                 "oferta": "1 mes gratis para tiendas nuevas"}]
        Path(a.ficha).write_text(json.dumps(ej, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"ok {a.ficha}")
    else:
        render(a.ficha, a.out)


if __name__ == "__main__":
    main()
