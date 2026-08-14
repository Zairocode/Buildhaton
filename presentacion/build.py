"""Incrusta las capturas en el deck para que sea un solo archivo autocontenido.

    python presentacion/build.py

Lee deck.src.html, reemplaza {{IMG_NN}} por data URIs y escribe deck.html.
"""
import base64
import pathlib
import re

AQUI = pathlib.Path(__file__).parent
SRC = AQUI / "deck.src.html"
OUT = AQUI / "deck.html"
CAPTURAS = AQUI / "capturas"

html = SRC.read_text(encoding="utf-8")
faltantes = []

def incrustar(m):
    n = m.group(1)
    archivos = sorted(CAPTURAS.glob(f"{n}-*.jpg"))
    if not archivos:
        faltantes.append(n)
        return m.group(0)
    b64 = base64.b64encode(archivos[0].read_bytes()).decode()
    print(f"  {archivos[0].name}  {len(b64) // 1024} KB en base64")
    return f"data:image/jpeg;base64,{b64}"

html = re.sub(r"\{\{IMG_(\d+)\}\}", incrustar, html)

if faltantes:
    raise SystemExit(f"Faltan capturas para: {', '.join(faltantes)}")

OUT.write_text(html, encoding="utf-8")
print(f"\nOK  {OUT.name}  {len(html.encode()) // 1024} KB")
