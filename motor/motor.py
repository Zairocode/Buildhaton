"""Motor de requisitos: filtra reglas.json contra las respuestas de un proyecto.

Las reglas son datos, no código, porque quien mantiene la normativa municipal
no es quien escribe Python. Correr `python motor.py` ejecuta el self-check.
"""
import json
import pathlib

REGLAS = json.loads((pathlib.Path(__file__).parent / "reglas.json").read_text(encoding="utf-8"))

OPS = {
    ">":  lambda v, a: v is not None and v > a,
    "<":  lambda v, a: v is not None and v < a,
    "in": lambda v, a: v in a,
}


def _match(valor, cond):
    if isinstance(cond, dict):
        return all(OPS[op](valor, arg) for op, arg in cond.items())
    return valor == cond


def aplica(regla, proyecto):
    cuando = regla["cuando"]
    if "any" in cuando:
        return any(all(_match(proyecto.get(k), v) for k, v in alt.items()) for alt in cuando["any"])
    return all(_match(proyecto.get(k), v) for k, v in cuando.items())


def requisitos(proyecto, reglas=REGLAS):
    """Reglas que aplican a este proyecto, en orden ministerial -> municipal."""
    jur = {"GT", proyecto.get("municipalidad")}
    return [r for r in reglas if r["jurisdiccion"] in jur and aplica(r, proyecto)]


def informe(proyecto):
    lineas = []
    for capa in ("ministerial", "municipal"):
        rs = [r for r in requisitos(proyecto) if r["capa"] == capa]
        if not rs:
            continue
        lineas.append(f"\n{capa.upper()}")
        for r in rs:
            flag = "  [SIN CONFIRMAR]" if r["confianza"] == "SIN_CONFIRMAR" else ""
            lineas.append(f"  {r['institucion']} — {r['id']}{flag}")
            lineas.extend(f"    - {d}" for d in r["exige"])
            if "nota" in r:
                lineas.append(f"    ! {r['nota']}")
    return "\n".join(lineas)


def demo():
    casa = {
        "municipalidad": "muniguate",
        "tipo_solicitud": "vivienda_unifamiliar",
        "area_construccion_m2": 450,
        "altura_m": 8,
        "uso_publico": False,
        "categoria_ambiental": "B2",
    }
    ids = {r["id"] for r in requisitos(casa)}
    assert ids == {
        "muni-gt-base", "muni-gt-colegiado", "muni-gt-cad-digital",
        "muni-gt-marn-resolucion", "muni-gt-nrd1-acta",
    }, ids

    torre = {
        "municipalidad": "muniguate",
        "tipo_solicitud": "EAP",
        "giro_exento": False,
        "area_construccion_m2": 900,
        "altura_m": 20,
        "uso_publico": True,
        "asientos_fijos": False,
        "categoria_ambiental": "B1",
        "tratamiento_aguas_residuales": "nueva",
        "corte_arboles_m3": 15,
        "impacto_social": True,
    }
    ids = {r["id"] for r in requisitos(torre)}
    assert "conred-nrd2" in ids and "conred-asientos-fijos" not in ids
    assert "dgac-altura" in ids                      # 20 m > 16
    assert "marn-edicto" in ids                      # B1 sí, B2 no
    assert "mspas-base" in ids                       # por impacto_social (rama any)
    assert "mspas-ptar-nueva" in ids and "mspas-ptar-existente" not in ids
    assert "muni-gt-fuera-de-guia" in ids            # 900 > 700
    assert "muni-gt-arboles-inab" in ids             # 15 > 10
    assert "muni-gt-eap-tasa" in ids

    # El eje que faltaba en la primera matriz: nueva vs. conexión a existente.
    a = {"municipalidad": "muniguate", "abastecimiento_agua_consumo_humano": True, "fuente_agua": "nueva"}
    b = {**a, "fuente_agua": "existente"}
    assert "mspas-fuente-nueva" in {r["id"] for r in requisitos(a)}
    assert "mspas-conexion-existente" in {r["id"] for r in requisitos(b)}
    assert requisitos(a) != requisitos(b)

    print("self-check OK\n")
    print(f"Caso: EAP {torre['area_construccion_m2']} m², {torre['altura_m']} m de altura, PTAR nueva")
    print(informe(torre))


if __name__ == "__main__":
    demo()
