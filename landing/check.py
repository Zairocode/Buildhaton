"""Chequeo del sitio estático: que nada apunte a un archivo que no existe.

    python landing/check.py

Corrélo después de cambiar fotos, renombrar archivos o tocar el HTML.
Falla ruidosamente en vez de dejar una imagen rota en producción.
"""
import pathlib
import re
import sys
from html.parser import HTMLParser

sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # la consola de Windows es cp1252

AQUI = pathlib.Path(__file__).parent
AVISOS = []
VACIAS = {"img", "br", "hr", "meta", "link", "input", "source", "path", "circle", "rect", "line", "polyline", "polygon", "use", "ellipse"}


class Revisor(HTMLParser):
    """Recolecta recursos locales y verifica que las etiquetas cierren."""

    def __init__(self):
        super().__init__()
        self.recursos = []
        self.pila = []
        self.desbalance = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        for att in ("src", "href"):
            v = d.get(att, "")
            if v and not v.startswith(("http", "#", "mailto:", "data:")):
                self.recursos.append(v)
        if tag not in VACIAS:
            self.pila.append(tag)

    def handle_endtag(self, tag):
        if tag in VACIAS:
            return
        if not self.pila:
            self.desbalance.append(f"cierre sobrante </{tag}>")
        elif self.pila[-1] != tag:
            self.desbalance.append(f"se esperaba </{self.pila[-1]}> y vino </{tag}>")
            if tag in self.pila:
                while self.pila and self.pila.pop() != tag:
                    pass
        else:
            self.pila.pop()


def revisa(pagina):
    fallos = []
    html = (AQUI / pagina).read_text(encoding="utf-8")
    r = Revisor()
    r.feed(html)

    for ruta in r.recursos:
        ruta = ruta.split("#")[0]          # "/#contacto" es la portada, no un archivo
        if ruta in ("", "/"):
            continue
        # las rutas absolutas del 404 se resuelven contra la raíz del sitio
        destino = AQUI / ruta.lstrip("/")
        if not destino.exists():
            fallos.append(f"{pagina}: falta {ruta}")

    # Fondos declarados en style="background-image:url('…')". El CSS tiene un
    # fondo de reserva, así que una foto que falta se avisa pero no rompe.
    for ruta in re.findall(r"url\('([^']+)'\)", html):
        if not (AQUI / ruta.lstrip("/")).exists():
            AVISOS.append(f"{pagina}: sin foto todavía en {ruta} (se ve el fondo de reserva)")

    fallos += [f"{pagina}: {d}" for d in r.desbalance]
    fallos += [f"{pagina}: quedó sin cerrar <{t}>" for t in r.pila if t != "html"]
    return fallos


def main():
    fallos = revisa("index.html") + revisa("404.html")

    # el JS solo puede animar lo que existe en el HTML
    js = (AQUI / "js" / "app.js").read_text(encoding="utf-8")
    index = (AQUI / "index.html").read_text(encoding="utf-8")
    for ident in set(re.findall(r'getElementById\("([^"]+)"\)|#([A-Za-z][\w-]*)"', js)):
        nombre = ident[0] or ident[1]
        if nombre and f'id="{nombre}"' not in index:
            fallos.append(f"app.js apunta a #{nombre} y no existe en index.html")

    # el CSS no debe quedar con llaves abiertas
    css = (AQUI / "css" / "estilo.css").read_text(encoding="utf-8")
    if css.count("{") != css.count("}"):
        fallos.append(f"estilo.css: {css.count('{')} llaves abiertas vs {css.count('}')} cerradas")

    if AVISOS:
        print("\n".join("  aviso: " + a for a in AVISOS))
    if fallos:
        print("\n".join("  ✗ " + f for f in fallos))
        sys.exit(1)
    print("OK - index.html, 404.html, css y js consistentes")


if __name__ == "__main__":
    main()
