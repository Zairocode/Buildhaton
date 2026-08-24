"""Motor de fallas: por qué te van a devolver el expediente, antes de entregarlo.

Módulo 3. El motor de requisitos dice QUÉ te piden; este mira lo que ya cargaste
y dice QUÉ va a fallar. Las fallas son datos (`fallas.json`) por la misma razón
que las reglas: quien mantiene la normativa municipal no escribe Python.

Las tres severidades:
  bloqueante  te devuelven el expediente en ventanilla
  riesgo      pasa ventanilla pero se cae después, o cuesta plata extra
  aviso       no falla, pero saberlo cambia cómo ordenás el trámite

`python motor/fallas.py` corre el self-check.
"""
import json
import pathlib
from collections import Counter
from datetime import date

try:                                  # importado como paquete (api-server)
    from motor.motor import aplica, requisitos, REGLAS as _REGLAS
except ImportError:                   # corrido como script desde motor/
    from motor import aplica, requisitos, REGLAS as _REGLAS

FALLAS = json.loads((pathlib.Path(__file__).parent / "fallas.json").read_text(encoding="utf-8"))

ORDEN = {"bloqueante": 0, "riesgo": 1, "aviso": 2}


def _antiguedad(fecha, hoy):
    """Días desde la emisión. None si no vino fecha o no parsea."""
    if not fecha:
        return None
    try:
        return (hoy - date.fromisoformat(str(fecha)[:10])).days
    except (ValueError, TypeError):
        return None


def _h(id, severidad, titulo, detalle, remedio=None, fuente=None, documento=None):
    return {
        "id": id, "severidad": severidad, "titulo": titulo, "detalle": detalle,
        "remedio": remedio, "fuente": fuente, "documento": documento, "veces": 0,
    }


def revisar(proyecto, cargados=(), hoy=None, bitacora=()):
    """Hallazgos sobre un expediente. `cargados` son los archivos ya subidos:
    [{documento, archivo, fecha_emision}]. `bitacora` es el historial de rechazos
    reales, y solo aporta el contador `veces` — nunca genera ni oculta hallazgos.
    """
    hoy = hoy or date.today()
    reglas = requisitos(proyecto)
    subidos = {str(c.get("documento", "")): c for c in cargados}
    out = []

    # --- Derivado del cruce reglas x archivos -------------------------------
    for r in reglas:
        if r.get("tipo") == "aviso":
            continue
        for d in r["exige"]:
            nombre = d["texto"]
            tipo_d = d.get("tipo") or r.get("tipo")
            if tipo_d == "gestion":
                out.append(_h(
                    f"gestion-{r['id']}", "riesgo", "Esto no se resuelve subiendo un archivo",
                    f"«{nombre}» no es un documento que emita una institución: hay que conseguirlo. "
                    "Ningún motor de reglas lo acelera y no depende de vos.",
                    "Arrancá esta gestión primero — es la de plazo menos predecible del expediente.",
                    r.get("fuente"), nombre,
                ))
            elif nombre not in subidos:
                out.append(_h(
                    f"faltante-{r['id']}-{nombre[:24]}", "bloqueante", "Requisito sin documento",
                    f"«{nombre}» lo exige {r['institucion']} y no hay archivo cargado.",
                    "Cargalo en la pestaña Requisitos.", r.get("fuente"), nombre,
                ))

            # Vigencia y formato salen del catalogo (documentos.json + override de la
            # regla), no de una entrada aparte en fallas.json: agregarle vigencia a un
            # documento nuevo ya no requiere tocar este archivo.
            c = subidos.get(nombre)
            if c is not None and d.get("vigencia_meses"):
                dias_max = d["vigencia_meses"] * 30
                dias = _antiguedad(c.get("fecha_emision"), hoy)
                base_id = f"vencido-{r['id']}-{d['documento_id']}"
                if dias is None:
                    out.append(_h(
                        f"{base_id}-sin-fecha", "riesgo", "No sabemos si está vigente",
                        f"«{nombre}» tiene vigencia de {d['vigencia_meses']} meses y el archivo se "
                        "cargó sin fecha de emisión.",
                        "Poné la fecha de emisión al cargarlo para que el sistema te avise antes de que venza.",
                        r.get("fuente"), nombre,
                    ))
                elif dias > dias_max:
                    out.append(_h(
                        base_id, "bloqueante", "Documento vencido",
                        f"«{nombre}» vence a los {d['vigencia_meses']} meses de emitido "
                        f"({r['institucion']}). El archivo cargado tiene {dias} días de emitido.",
                        d.get("consejo_vencimiento"), r.get("fuente"), nombre,
                    ))

            if c is not None and d.get("extensiones_validas"):
                ext = pathlib.PurePosixPath(str(c.get("archivo", ""))).suffix.lower()
                if ext not in d["extensiones_validas"]:
                    out.append(_h(
                        f"formato-{r['id']}-{d['documento_id']}", "riesgo",
                        "Documento en formato incorrecto",
                        f"Se pide «{nombre}» en {', '.join(d['extensiones_validas'])} y se cargó "
                        f"«{c.get('archivo')}» ({ext or 'sin extensión'}).",
                        d.get("consejo_formato"), r.get("fuente"), nombre,
                    ))
        if r.get("confianza") == "SIN_CONFIRMAR":
            out.append(_h(
                f"sin-confirmar-{r['id']}", "aviso", "Requisito sin fuente confirmada",
                f"La regla {r['id']} ({r['institucion']}) sale de una fuente secundaria y no está "
                "verificada contra el instructivo oficial vigente.",
                "Confirmalo en ventanilla antes de presupuestar el trámite con este dato.",
                r.get("fuente"),
            ))
        if r.get("revisar_si"):
            out.append(_h(
                f"revisar-{r['id']}", "aviso", "Esta regla puede estar desactualizada",
                f"La regla {r['id']} ({r['institucion']}) depende de una norma marcada para "
                f"revisión: {r['revisar_si']}",
                "Confirmá contra la fuente vigente antes de presupuestar el trámite con este dato.",
                r.get("fuente"),
            ))

    # --- Reglas de fallas de expediente (no dependen de un documento puntual) ----
    for f in FALLAS:
        if "cuando" in f and not aplica(f, proyecto):
            continue
        out.append(_h(f["id"], f["severidad"], f["titulo"], f["detalle"],
                      f.get("remedio"), f.get("fuente")))

    veces = Counter(b.get("falla") for b in bitacora)
    for h in out:
        h["veces"] = veces.get(h["id"], 0)

    out.sort(key=lambda h: (ORDEN[h["severidad"]], -h["veces"], h["titulo"]))
    return out


def resumen(hallazgos):
    c = Counter(h["severidad"] for h in hallazgos)
    return {"bloqueante": c["bloqueante"], "riesgo": c["riesgo"], "aviso": c["aviso"],
            "total": len(hallazgos), "listo": c["bloqueante"] == 0}


def demo():
    HOY = date(2026, 8, 16)
    base = {"tipo_solicitud": "vivienda_unifamiliar", "area_construccion_m2": 450,
            "altura_m": 8, "uso_publico": False, "categoria_ambiental": "B2"}

    # Sin cargar nada, todo requisito real es un bloqueante.
    vacio = revisar({**base, "municipalidad": "muniguate"}, hoy=HOY)
    assert all(h["severidad"] == "bloqueante" for h in vacio if h["id"].startswith("faltante-"))
    assert resumen(vacio)["listo"] is False

    # LA TESIS, en el motor de fallas: el MISMO papel, con la MISMA fecha,
    # pasa en la capital y se cae en Pinula. 100 dias < 180 pero > 90.
    registral = [{"documento": "Certificación del Registro General de la Propiedad con historial completo, emitida en los últimos 6 meses",
                  "archivo": "registral.pdf", "fecha_emision": "2026-05-08"},
                 {"documento": "Certificación del Registro General de la Propiedad, máximo 3 MESES de emisión",
                  "archivo": "registral.pdf", "fecha_emision": "2026-05-08"}]
    ids_cap = {h["id"] for h in revisar({**base, "municipalidad": "muniguate"}, registral, hoy=HOY)}
    ids_scp = {h["id"] for h in revisar({**base, "municipalidad": "scp", "categoria_obra_scp": "mayor"}, registral, hoy=HOY)}
    assert "vencido-muni-gt-base-cert-rgp" not in ids_cap, "100 dias entra en los 6 meses de la capital"
    assert "vencido-scp-base-cert-rgp" in ids_scp, "100 dias NO entra en los 3 meses de Pinula"

    # Cargado sin fecha: no se afirma que este vencido, se marca que no se sabe.
    sin_fecha = [{**registral[0], "fecha_emision": None}]
    ids = {h["id"] for h in revisar({**base, "municipalidad": "muniguate"}, sin_fecha, hoy=HOY)}
    assert "vencido-muni-gt-base-cert-rgp-sin-fecha" in ids and "vencido-muni-gt-base-cert-rgp" not in ids

    # Formato: un PDF donde piden el CAD.
    cad = [{"documento": "Copia digital de todos los planos en disco compacto, formato CAD versión 2007",
            "archivo": "planos.pdf"}]
    h = next(h for h in revisar({**base, "municipalidad": "muniguate"}, cad, hoy=HOY)
             if h["id"] == "formato-muni-gt-cad-digital-planos-cad-2007")
    assert "planos.pdf" in h["detalle"]

    # Lo que no se arregla subiendo un archivo: la carta de los vecinos en Pinula.
    pinula = revisar({**base, "municipalidad": "scp", "categoria_obra_scp": "mayor",
                      "en_residencial_o_condominio": True}, hoy=HOY)
    assert any(h["id"].startswith("gestion-scp-asociacion-vecinos") for h in pinula)

    # DGAC cobra por torre solo si la altura la mete en el tramite.
    alto = {**base, "municipalidad": "muniguate", "altura_m": 42}
    assert "dgac-por-torre" in {h["id"] for h in revisar(alto, hoy=HOY)}
    assert "dgac-por-torre" not in {h["id"] for h in revisar({**base, "municipalidad": "muniguate"}, hoy=HOY)}

    # revisar_si: aviso de que una regla depende de una norma marcada para revisión
    # (p. ej. CONRED tras el Acuerdo CN-3-2025), sin bloquear el expediente.
    _REGLAS.append({
        "id": "prueba-revisar-si", "capa": "ministerial", "jurisdiccion": "GT",
        "institucion": "TEST", "cuando": {}, "exige": [], "confianza": "confirmada",
        "fuente": "prueba", "revisar_si": "cambia si la norma de prueba se actualiza",
    })
    try:
        ids = {h["id"] for h in revisar({**base, "municipalidad": "muniguate"}, hoy=HOY)}
        assert "revisar-prueba-revisar-si" in ids
    finally:
        _REGLAS.pop()

    # La bitacora ordena, no inventa: sube el hallazgo mas repetido, no agrega ninguno.
    log = [{"falla": "expediente-fisico"}] * 9
    con = revisar({**base, "municipalidad": "muniguate"}, hoy=HOY, bitacora=log)
    assert len(con) == len(vacio), "la bitacora no debe crear ni borrar hallazgos"
    assert next(h["veces"] for h in con if h["id"] == "expediente-fisico") == 9
    avisos = [h["id"] for h in con if h["severidad"] == "aviso"]
    assert avisos[0] == "expediente-fisico", "el mas repetido encabeza su severidad"

    print("self-check OK\n")
    caso = {**base, "municipalidad": "muniguate", "altura_m": 42, "uso_publico": True,
            "categoria_ambiental": "B1", "area_construccion_m2": 18500}
    hs = revisar(caso, registral, hoy=HOY)
    r = resumen(hs)
    print(f"Torre 18,500 m² en la capital, solo con la certificación registral cargada")
    print(f"  {r['bloqueante']} bloqueantes · {r['riesgo']} riesgos · {r['aviso']} avisos\n")
    for h in hs:
        if h["severidad"] != "bloqueante":
            print(f"  [{h['severidad'].upper():10}] {h['titulo']}")
            print(f"               {h['remedio'] or ''}"[:100])


if __name__ == "__main__":
    demo()
