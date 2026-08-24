"""Motor de requisitos: filtra reglas.json contra las respuestas de un proyecto.

Las reglas son datos, no código, porque quien mantiene la normativa municipal
no es quien escribe Python. Correr `python motor.py` ejecuta el self-check.
"""
import json
import pathlib

try:                                  # importado como paquete (api-server)
    from motor.catalogo import resuelve
except ImportError:                   # corrido como script desde motor/
    from catalogo import resuelve

REGLAS = json.loads((pathlib.Path(__file__).parent / "reglas.json").read_text(encoding="utf-8"))

OPS = {
    ">":  lambda v, a: v is not None and v > a,
    "<":  lambda v, a: v is not None and v < a,
    ">=": lambda v, a: v is not None and v >= a,
    "<=": lambda v, a: v is not None and v <= a,
    "in": lambda v, a: v in a,
    "!=": lambda v, a: v is not None and v != a,
}

VALORES_CONFIANZA = {"confirmada", "mirror", "SIN_CONFIRMAR"}


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
    """Reglas que aplican a este proyecto, en orden ministerial -> municipal.

    `exige` viene resuelto: cada entrada es un dict con al menos `texto` (ver
    catalogo.resuelve). Se resuelve en cada llamada, no se muta REGLAS.
    """
    jur = {"GT", proyecto.get("municipalidad")}
    return [
        {**r, "exige": [resuelve(item) for item in r["exige"]]}
        for r in reglas
        if r["jurisdiccion"] in jur and aplica(r, proyecto)
    ]


MARCA = {"gestion": "[NO ES UN DOCUMENTO]", "aviso": ""}


def informe(proyecto):
    rs = requisitos(proyecto)
    lineas = []
    for capa in ("ministerial", "municipal"):
        bloque = [r for r in rs if r["capa"] == capa and r.get("tipo") != "aviso"]
        if not bloque:
            continue
        lineas.append(f"\n{capa.upper()}")
        for r in bloque:
            etiqueta = "  [SIN CONFIRMAR]" if r["confianza"] == "SIN_CONFIRMAR" else ""
            lineas.append(f"  {r['institucion']} — {r['id']}{etiqueta}".rstrip())
            for d in r["exige"]:
                marca = MARCA.get(d.get("tipo") or r.get("tipo"), "")
                lineas.append(f"    - {d['texto']}  {marca}".rstrip())
            if "nota" in r:
                lineas.append(f"    ! {r['nota']}")
    avisos = [r for r in rs if r.get("tipo") == "aviso"]
    if avisos:
        lineas.append("\nADVERTENCIAS")
        lineas.extend(f"  * {d['texto']}  ({r['fuente']})" for r in avisos for d in r["exige"])
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
    ids = {r["id"] for r in requisitos(casa) if r.get("tipo") != "aviso"}
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

    # La tesis del proyecto: mismo proyecto, distinta muni, distinto tramite.
    obra = {"area_construccion_m2": 450, "altura_m": 8, "categoria_obra_scp": "mayor",
            "fuente_agua_scp": "pozo", "en_residencial_o_condominio": True}

    # No-cruce entre jurisdicciones municipales, genérico: recorre {jurisdiccion} tal
    # como sale de REGLAS, no una lista fija de pares. Agregar una jurisdicción nueva
    # no requiere escribir un bloque de asserts a mano — el loop la recoge sola.
    municipales = sorted(j for j in {r["jurisdiccion"] for r in REGLAS} if j != "GT")
    ids_por_jur = {j: {r["id"] for r in requisitos({**obra, "municipalidad": j})} for j in municipales}
    for i, a in enumerate(municipales):
        for b in municipales[i + 1:]:
            solape = ids_por_jur[a] & ids_por_jur[b]
            assert not solape, f"reglas cruzadas entre {a} y {b}: {solape}"
        # Ninguna lista publicada es completa, y cada muni lo dice por escrito.
        assert any(r.get("tipo") == "aviso" for r in requisitos({**obra, "municipalidad": a}))

    ids_cap, ids_scp = ids_por_jur["muniguate"], ids_por_jur["scp"]
    assert "scp-asociacion-vecinos" in ids_scp      # requisito social, no existe en la capital
    assert "scp-agua-pozo" in ids_scp
    assert "muni-gt-cad-digital" in ids_cap         # CAD 2007 vs DWG

    # 20 m² es el corte legal (Art. 66): "desde 20 m2 en adelante" es licencia, no permiso.
    obra_ligera = {"municipalidad": "xela", "area_construccion_m2": 15}
    licencia = {"municipalidad": "xela", "area_construccion_m2": 25}
    ids_ligera = {r["id"] for r in requisitos(obra_ligera)}
    ids_licencia = {r["id"] for r in requisitos(licencia)}
    assert "xela-permiso-obra-ligera" in ids_ligera and "xela-licencia-construccion" not in ids_ligera
    assert "xela-licencia-construccion" in ids_licencia and "xela-permiso-obra-ligera" not in ids_licencia

    # Alto impacto (Art. 130) es autodeclarado: dispara equipo + dictámenes + impacto vial.
    alto = {"municipalidad": "xela", "alto_impacto_pot": True}
    bajo = {"municipalidad": "xela", "alto_impacto_pot": False}
    ids_alto = {r["id"] for r in requisitos(alto)}
    ids_bajo = {r["id"] for r in requisitos(bajo)}
    assert {"xela-alto-impacto-equipo", "xela-alto-impacto-dictamenes", "xela-impacto-vial"} <= ids_alto
    assert not ({"xela-alto-impacto-equipo", "xela-alto-impacto-dictamenes", "xela-impacto-vial"} & ids_bajo)

    # Operador "!=": comparación de un campo contra un valor fijo, mismo patrón que >=/<=.
    regla_distinto = {"cuando": {"tipo_solicitud": {"!=": "EAP"}}}
    assert aplica(regla_distinto, {"tipo_solicitud": "vivienda_unifamiliar"})
    assert not aplica(regla_distinto, {"tipo_solicitud": "EAP"})

    # `tipo` por entrada de `exige`, con fallback al `tipo` de la regla: una misma
    # regla puede mezclar un documento real con un trámite no-documental.
    regla_mixta = {
        "id": "prueba-mixta", "capa": "municipal", "confianza": "confirmada",
        "cuando": {}, "tipo": "gestion",
        "exige": [
            {"documento_id": None, "texto": "hereda gestion de la regla"},
            {"documento_id": None, "texto": "documento real", "tipo": None},
        ],
    }
    efectivos = [d.get("tipo") or regla_mixta.get("tipo") for d in regla_mixta["exige"]]
    assert efectivos == ["gestion", "gestion"]  # sin tipo propio, el fallback aplica a ambas
    regla_mixta["exige"][1]["tipo"] = "documental_explicito"
    efectivos = [d.get("tipo") or regla_mixta.get("tipo") for d in regla_mixta["exige"]]
    assert efectivos == ["gestion", "documental_explicito"]  # con tipo propio, gana la entrada

    # `confianza` es un enum cerrado; un valor fuera de VALORES_CONFIANZA es un typo.
    invalidas = {r["id"] for r in REGLAS if r.get("confianza") not in VALORES_CONFIANZA}
    assert not invalidas, f"confianza fuera de {VALORES_CONFIANZA}: {invalidas}"

    print("self-check OK\n")
    print(f"Caso: EAP {torre['area_construccion_m2']} m², {torre['altura_m']} m de altura, PTAR nueva")
    print(informe(torre))
    print("\n" + "=" * 70)
    print("MISMA OBRA (450 m², pozo, en condominio) EN CADA MUNICIPALIDAD")
    for j in municipales:
        rs = [r for r in requisitos({**obra, "municipalidad": j}) if r["capa"] == "municipal"]
        docs = sum(len(r["exige"]) for r in rs if r.get("tipo") != "aviso")
        print(f"  {j:22} {len(rs)} reglas, {docs} requisitos")


if __name__ == "__main__":
    import sys                              # la consola de Windows es cp1252 y no traga "≤"
    sys.stdout.reconfigure(encoding="utf-8")
    demo()
