#!/usr/bin/env python3
"""Video v4 de tiendas: voz femenina nueva (2 generaciones: narr4_G1.mp3 y narr4_G2.mp3 en capturas-tmp/video), escena de soporte,
clic realista (clic3.wav) y música de fondo con ducking. Cada grupo de la narración se mide y las escenas grabadas se estiran por tramos
para coincidir con su frase. Uso: python -I scripts/montar-video-tiendas-v4.py"""
import json, re, subprocess, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
V = R / "capturas-tmp/video"; SL = V / "slides"; T = V / "partes6"; T.mkdir(exist_ok=True)
FF = "C:/ffmpeg/ffmpeg"
guion = json.load(open(V / "guion_v4.json", encoding="utf8"))
_og2 = []
for _i, _g in guion["orden_G2"]:
    _og2 += [("historial", 1.8), ("cta", 0.0)] if _i == "cierre" else [(_i, _g)]
ORDEN = [("narr4_G1.mp3", i, g) for i, g in guion["orden_G1"]] + [("narr4_G2.mp3", i, g) for i, g in _og2]

def run(*a, capture=False):
    return subprocess.run([FF, "-y", "-v", "error" if not capture else "info", *map(str, a)], check=True, capture_output=capture, text=True)

# ---------- 1) intervalos de voz por archivo (silencios >= 0,55 s separan los grupos)
def intervalos(archivo):
    r = subprocess.run([FF, "-v", "info", "-i", str(V / archivo), "-af", "silencedetect=noise=-36dB:d=0.55", "-f", "null", "-"], capture_output=True, text=True).stderr
    dur = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", r).group(1)) * 3600 + float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", r).group(2)) * 60 + float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", r).group(3))
    s = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r)]; e = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r)]
    voz = []; ini = 0.0
    for a, b in zip(s, e):
        if a - ini > 0.25: voz.append([ini, a])
        ini = b
    if dur - ini > 0.25: voz.append([ini, dur])
    return voz
def fusionar(voz):
    fus = [voz[0]]
    for a, b in voz[1:]:
        if a - fus[-1][1] < 1.0: fus[-1][1] = b
        else: fus.append([a, b])
    return fus
CRUDO = {a: intervalos(a) for a in ["narr4_G1.mp3", "narr4_G2.mp3"]}
# G1: la voz tiene pausas naturales largas; se asignan los intervalos crudos a cada grupo según el recorrido revisado a mano
MAPA_G1 = {"A": range(0, 5), "s2g1": range(5, 7), "s2g2": range(7, 9), "s2g3": range(9, 13), "s2g4": [13], "s2g5": [14], "s2g6": [15], "s3g1": [16], "s3g2": range(17, 22),
           "s4g1": range(22, 25), "s4g2": range(25, 27), "s4g3": [27], "s4g4": [28], "s4g5": [29], "s5g0": [30], "s5g1": [31], "s5g2": [32], "s5g3": [33, 34]}
if len(CRUDO["narr4_G1.mp3"]) == 35:
    IV = {"narr4_G1.mp3": [[CRUDO["narr4_G1.mp3"][min(v)][0], CRUDO["narr4_G1.mp3"][max(v)][1]] for k, v in MAPA_G1.items()]}
else:
    IV = {"narr4_G1.mp3": fusionar(CRUDO["narr4_G1.mp3"])}
_g2 = fusionar(CRUDO["narr4_G2.mp3"])
if len(_g2) == 11:   # «ventas» tiene una pausa larga a mitad: se une
    _g2 = _g2[:5] + [[_g2[5][0], _g2[6][1]]] + _g2[7:]
_ult = _g2[-1]; _cr = [r for r in CRUDO["narr4_G2.mp3"] if r[0] >= _ult[0] - 0.01 and r[1] <= _ult[1] + 0.01]
_k = max(range(len(_cr) - 1), key=lambda i: _cr[i + 1][0] - _cr[i][1])
_g2 = _g2[:-1] + [[_cr[0][0], _cr[_k][1]], [_cr[_k + 1][0], _cr[-1][1]]]
IV["narr4_G2.mp3"] = _g2
P12 = fusionar(intervalos("narr5_P12.mp3")); print("P12 grupos", len(P12))
assert len(P12) == 2
esperados = {a: sum(1 for x in ORDEN if x[0] == a) for a in IV}
for a in IV:
    print(a, "grupos detectados", len(IV[a]), "esperados", esperados[a])
    if len(IV[a]) != esperados[a]:
        print("DISTINTO: ajustar manualmente", [[round(x, 2), round(y, 2)] for x, y in IV[a]]); raise SystemExit(2)
grupos = []   # (id, archivo, ini, fin, hueco)
cont = {a: 0 for a in IV}
_p12 = iter(P12)
for arch, id_, hueco in ORDEN:
    a, b = IV[arch][cont[arch]]; cont[arch] += 1
    if id_ in ("paso1", "paso2"): a, b = next(_p12); arch = "narr5_P12.mp3"
    grupos.append((id_, arch, max(a - 0.05, 0), b + 0.08, hueco))
# orden de la línea de tiempo: todo el panel seguido (historial tras soporte) y la invitación al final
_ids = [g[0] for g in grupos if g[0] not in ("historial", "cta")]; _k2 = _ids.index("soporte") + 1
_ids = _ids[:_k2] + ["historial"] + _ids[_k2:] + ["cta"]; _por = {g[0]: g for g in grupos}; grupos = [_por[i] for i in _ids]
slot = {g[0]: (g[3] - g[2]) + g[4] for g in grupos}
t = 0.0; inicio = {}
for g in grupos: inicio[g[0]] = t; t += slot[g[0]]
TOTAL_VOZ = t; FIN_TARJETA = 3.0; TOTAL = TOTAL_VOZ + FIN_TARJETA
print("voz", round(TOTAL_VOZ, 1), "s; video", round(TOTAL, 1), "s")

# ---------- 2) escenas grabadas
def cargar(carpeta): return json.load(open(R / "capturas-tmp" / carpeta / "marcas.json")), json.load(open(R / "capturas-tmp" / carpeta / "clics.json"))
FUENTE = {}
for carpeta, esc in [("panel2", ["mercado", "panel", "formas", "paso1", "paso2", "paso3", "paso4", "historial"]), ("panel3", ["ventas", "preguntas"]), ("panel4", ["encargos"]), ("panel5", ["retiro"]), ("panel6", ["soporte"])]:
    m, c = cargar(carpeta)
    for e in esc: FUENTE[e] = (R / "capturas-tmp" / carpeta / "pantalla_bruto.mp4", m, c)
BLUR_PANEL = "split[a][b];[b]crop=380:60:1520:34,boxblur=14:2[bb];[a][bb]overlay=1520:34"
BLUR_HERO = "split[a][b];[b]crop=340:60:290:166,boxblur=14:2[bb];[a][bb]overlay=290:166"
BLUR = {n: BLUR_PANEL for n in ["panel", "formas", "paso1", "paso2", "paso3", "paso4", "historial", "soporte"]}
BLUR.update({n: BLUR_HERO for n in ["ventas", "retiro", "preguntas"]})
partes = []   # (archivo, duracion, escena, a_abs, factor)

def slide(nombre, d):
    out = T / f"s_{nombre}.mp4"
    run("-loop", 1, "-t", f"{d:.3f}", "-i", SL / f"{nombre}.png", "-vf", "scale=1920:1080,fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18", out)
    partes.append((out, d, None, 0, 1))
def cadena(nombres, duraciones, efectos, tag, tr=0.6):
    """Diapositivas con efecto de transición entre cada cambio (xfade). Cada cambio empieza justo cuando empieza su frase."""
    entradas = []; fc = ""
    for i, (n, d) in enumerate(zip(nombres, duraciones)):
        largo = d + (tr if i < len(nombres) - 1 else 0)
        entradas += ["-loop", 1, "-t", f"{largo:.3f}", "-i", SL / f"{n}.png"]
        fc += f"[{i}:v]scale=1920:1080,fps=30,format=yuv420p,setsar=1[x{i}];"
    acum = 0.0; previo = "x0"
    for i in range(1, len(nombres)):
        acum += duraciones[i - 1]
        fc += f"[{previo}][x{i}]xfade=transition={efectos[(i - 1) % len(efectos)]}:duration={tr}:offset={acum:.3f}[y{i}];"; previo = f"y{i}"
    out = T / f"c_{tag}.mp4"
    run(*entradas, "-filter_complex", fc.rstrip(";"), "-map", f"[{previo}]", "-t", f"{sum(duraciones):.3f}", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", out)
    partes.append((out, sum(duraciones), None, 0, 1))
def tramo(nombre, ra, rb, dur, tag):
    video, marcas, _ = FUENTE[nombre]; a = marcas[nombre] + ra; b = min(marcas[nombre] + rb, marcas[nombre + "_fin"])
    f = min(max(dur / (b - a), 0.85), 1.25)        # estiramiento limitado; lo que falta se congela o se recorta
    largo = (b - a) * f; pad = max(dur - largo, 0)
    vf = f"trim={a:.3f}:{b:.3f},setpts=(PTS-STARTPTS)*{f:.4f},scale=1920:1080," + (BLUR[nombre] + "," if nombre in BLUR else "") + f"tpad=stop_mode=clone:stop_duration={pad:.3f},fps=30,format=yuv420p"
    out = T / f"r_{tag}.mp4"
    run("-i", video, "-filter_complex", "[0:v]" + vf + "[v]", "-map", "[v]", "-t", f"{dur:.3f}", "-c:v", "libx264", "-crf", "18", out)
    partes.append((out, dur, nombre, a, f))

slide("01_titulo", 3.0); tramo("mercado", 0, 20.5, slot["A"] - 3.0, "mercado")
cadena(["02_b1", "03_b2", "04_b3", "05_b4", "06_b5", "07_b6"], [slot[g] for g in ["s2g1", "s2g2", "s2g3", "s2g4", "s2g5", "s2g6"]], ["slideleft", "circleopen", "wiperight", "slidedown", "diagtl"], "beneficios")
cadena(["08_costoA", "09_costoB"], [slot["s3g1"], slot["s3g2"]], ["smoothleft"], "costos")
for (ra, rb), g in zip([(0, 13.1), (13.1, 17.2), (17.2, 21.4), (21.4, 24.6), (24.6, 29.2)], ["s4g1", "s4g2", "s4g3", "s4g4", "s4g5"]): tramo("panel", ra, rb, slot[g], "panel_" + g)
for (ra, rb), g in zip([(0, 3.8), (3.8, 7.7), (7.7, 11.8), (11.8, 17.4)], ["s5g0", "s5g1", "s5g2", "s5g3"]): tramo("formas", ra, rb, slot[g], "formas_" + g)
for esc, g, rb in [("paso1", "paso1", 18.9), ("paso2", "paso2", 9.8), ("paso3", "paso3", 13.5), ("paso4", "paso4", 10.8), ("soporte", "soporte", 22.0), ("historial", "historial", 13.0),
                   ("ventas", "ventas", 29.6), ("retiro", "retiro", 20.1), ("preguntas", "preguntas", 10.3), ("encargos", "encargos", 18.8)]:
    tramo(esc, 0, rb, slot[g], esc)
slide("11_cierre", slot["cta"] + FIN_TARJETA)

# ---------- 3) clics en la línea de tiempo
t = 0.0; pos = []
for f, d, esc, a, fac in partes:
    if esc:
        cl = FUENTE[esc][2]; b = a + d / fac
        pos += [t + (c - a) * fac for c in cl if a <= c < b and (c - a) * fac < d]
    t += d
total_video = t
(T / "lista.txt").write_text("".join(f"file '{f.as_posix()}'\n" for f, *_ in partes), encoding="utf8")
run("-f", "concat", "-safe", 0, "-i", T / "lista.txt", "-c", "copy", V / "video6_sin_audio.mp4")
print("clics:", len(pos), "duración", round(total_video, 2), "(voz+tarjeta", round(TOTAL, 2), ")")

# ---------- 4) audio: voz recortada por grupo, clics y música con ducking
ins = ["-i", V / "narr4_G1.mp3", "-i", V / "narr4_G2.mp3", "-i", V / "clic3.wav", "-i", V / "musica_alegre.wav", "-i", V / "narr5_P12.mp3", "-i", V / "whoosh.wav"]
fc = ""; etq = ""
for k, (id_, arch, a, b, hueco) in enumerate(grupos):
    src = {"narr4_G1.mp3": "[0:a]", "narr4_G2.mp3": "[1:a]", "narr5_P12.mp3": "[4:a]"}[arch]
    fc += f"{src}atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(b - a - 0.05, 0):.3f}:d=0.05,apad=whole_dur={slot[id_]:.3f}[v{k}];"; etq += f"[v{k}]"
fc += f"{etq}concat=n={len(grupos)}:v=0:a=1,apad=whole_dur={total_video:.3f}[voz];"
cl = ""
for i, x in enumerate(pos):
    ms = int(x * 1000); fc += f"[2:a]adelay={ms}|{ms},volume=0.9[c{i}];"; cl += f"[c{i}]"
wpos = [inicio[g] - 0.1 for g in ["s2g2", "s2g3", "s2g4", "s2g5", "s2g6", "s3g2"]]
for i, x in enumerate(wpos):
    ms = int(max(x, 0) * 1000); fc += f"[5:a]adelay={ms}|{ms},volume=0.85[w{i}];"; cl += f"[w{i}]"
fc += "[voz]asplit=2[vm][vs];"
fc += f"[3:a]atrim=0:{total_video:.2f},volume=0.30,afade=t=in:d=2,afade=t=out:st={total_video - 5:.2f}:d=5[mus];"
fc += "[mus][vs]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=500:makeup=1[musd];"
fc += f"[vm]{cl}[musd]amix=inputs={len(pos) + len(wpos) + 2}:duration=longest:normalize=0:dropout_transition=0,alimiter=limit=0.95[m]"
run(*ins, "-filter_complex", fc, "-map", "[m]", "-t", f"{total_video:.3f}", "-c:a", "aac", "-b:a", "192k", V / "audio6_final.m4a")
run("-i", V / "video6_sin_audio.mp4", "-i", V / "audio6_final.m4a", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", V / "RepuesTop_video_tiendas_v6.mp4")
json.dump({g[0]: {"inicio": round(inicio[g[0]], 2), "dur": round(slot[g[0]], 2)} for g in grupos}, open(V / "tiempos_v6.json", "w"), indent=1)
print("listo", V / "RepuesTop_video_tiendas_v6.mp4")
