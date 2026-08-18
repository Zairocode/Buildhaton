"""Glosario de términos técnicos del dominio (`glosario.json`).

`python motor/glosario.py` corre el self-check.
`python motor/glosario.py uso_publico` imprime la entrada por id.
"""
import json
import pathlib
import sys

_DATA = json.loads((pathlib.Path(__file__).parent / "glosario.json").read_text(encoding="utf-8"))
GLOSARIO = {e["id"]: e for e in _DATA["entradas"]}
CATEGORIAS = _DATA["categorias"]


def buscar(id_o_termino: str):
    """Lookup por id exacto o búsqueda parcial en termino/definicion."""
    if id_o_termino in GLOSARIO:
        return GLOSARIO[id_o_termino]
    q = id_o_termino.lower()
    for e in _DATA["entradas"]:
        if q in e["id"].lower() or q in e["termino"].lower():
            return e
    return None


def demo():
    assert len(GLOSARIO) == len(_DATA["entradas"])
    assert buscar("fuente_agua")["categoria"] == "campo_proyecto"
    assert buscar("SIN_CONFIRMAR")["id"] == "confianza_sin_confirmar"
    assert "campo_proyecto" in CATEGORIAS
    print(f"self-check OK — {len(GLOSARIO)} entradas, {len(CATEGORIAS)} categorías\n")
    for cat in sorted(CATEGORIAS):
        n = sum(1 for e in _DATA["entradas"] if e["categoria"] == cat)
        print(f"  {cat}: {n}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        e = buscar(" ".join(sys.argv[1:]))
        if e:
            print(json.dumps(e, ensure_ascii=False, indent=2))
        else:
            print("No encontrado", file=sys.stderr)
            sys.exit(1)
    else:
        demo()
