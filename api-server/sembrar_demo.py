"""Siembra los tres casos de demostración en la ingesta.

Cada proyecto muestra una clase distinta de falla, para que el recorrido de la
demo no repita el mismo hallazgo tres veces:

  PRY-2026-0041  Torres Cayalá II       expediente sano; el bloqueo es lo que falta
  PRY-2026-0052  Residencial Las Conchas LA TESIS: el mismo papel, la misma fecha,
                                         pasa en la capital y se cae en Pinula
  PRY-2026-0033  Plaza Corporativa       solvencia vencida + planos en el formato
                                         equivocado (dos fallas evitables)

Las fechas se calculan CONTRA HOY, no fijas: si se sembrara "2026-05-09" a mano,
en dos semanas el caso de Pinula dejaría de contar la historia que queremos.

    python api-server/sembrar_demo.py

Borra lo que haya en cada proyecto antes de sembrar, así se puede correr las
veces que haga falta. Requiere la API viva en :5000.
"""
import json
import urllib.error
import urllib.request
import uuid
from datetime import date, timedelta

API = "http://127.0.0.1:5000"
HOY = date.today()


def hace(dias: int) -> str:
    return (HOY - timedelta(days=dias)).isoformat()


# Un PDF con peso creíble: con 45 bytes la tarjeta del portal decía "0.00 MB".
PDF = b"%PDF-1.4\n% documento de demostracion Cimiento\n% " + b"0" * 220_000 + b"\n%%EOF\n"

CASOS = {
    "PRY-2026-0041": [
        # (documento, requisito, fecha_emision, archivo)
        ("Certificación del Registro General de la Propiedad con historial completo, emitida en los últimos 6 meses",
         "muni-gt-base", hace(40), "registral.pdf"),
        ("Solvencia Municipal del inmueble, emitida en los últimos 2 meses",
         "muni-gt-base", hace(15), "solvencia.pdf"),
        ("Formato de evaluación NRD2", "conred-nrd2", None, "nrd2.pdf"),
        ("Memoria descriptiva del proyecto", "conred-nrd2", None, "memoria.pdf"),
        ("Planos de ruta de evacuación y salidas de emergencia por nivel", "conred-nrd2", None, "evacuacion.pdf"),
        ("Planta de techos", "conred-nrd2", None, "techos.pdf"),
    ],
    "PRY-2026-0052": [
        # 100 días: dentro de los 6 meses de la capital, FUERA de los 3 de Pinula.
        ("Certificación del Registro General de la Propiedad, máximo 3 MESES de emisión",
         "scp-base", hace(100), "registral.pdf"),
        ("Solvencia municipal extendida por Tesorería", "scp-base", hace(20), "solvencia.pdf"),
        ("Recibo de pago del servicio de agua potable", "scp-base", None, "agua.pdf"),
        ("Copia digital de los planos en formato DWG", "scp-obra-mayor", None, "planos.dwg"),
    ],
    "PRY-2026-0033": [
        ("Certificación del Registro General de la Propiedad con historial completo, emitida en los últimos 6 meses",
         "muni-gt-base", hace(60), "registral.pdf"),
        # 95 días contra una vigencia de 60: bloqueante.
        ("Solvencia Municipal del inmueble, emitida en los últimos 2 meses",
         "muni-gt-base", hace(95), "solvencia.pdf"),
        # Se pide el CAD y se sube un PDF: riesgo de formato.
        ("Copia digital de todos los planos en disco compacto, formato CAD versión 2007",
         "muni-gt-cad-digital", None, "planos.pdf"),
        ("Formato de evaluación NRD2", "conred-nrd2", None, "nrd2.pdf"),
    ],
}


def _pedir(ruta, data=None, metodo="GET", headers=None):
    req = urllib.request.Request(API + ruta, data=data, method=metodo, headers=headers or {})
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def limpiar(proyecto):
    items = _pedir(f"/api/documentos?proyecto={proyecto}")["items"]
    for it in items:
        _pedir(f"/api/documentos/{it['id']}", metodo="DELETE")
    return len(items)


def subir(proyecto, documento, requisito, fecha, archivo):
    """Multipart armado a mano: curl bajo el shell de Windows manda los acentos
    en cp1252 y el nombre deja de calzar con el requisito del motor."""
    borde = f"----cimiento{uuid.uuid4().hex}"
    campos = {"proyecto": proyecto, "documento": documento,
              "requisito": requisito, "usuario": "Ana Lucía Ordóñez"}
    if fecha:
        campos["fecha_emision"] = fecha

    cuerpo = b""
    for k, v in campos.items():
        cuerpo += f"--{borde}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode("utf-8")
    cuerpo += (f"--{borde}\r\nContent-Disposition: form-data; name=\"archivo\"; "
               f"filename=\"{archivo}\"\r\nContent-Type: application/pdf\r\n\r\n").encode("utf-8")
    cuerpo += PDF + f"\r\n--{borde}--\r\n".encode("utf-8")

    d = _pedir("/api/documentos", cuerpo, "POST",
               {"Content-Type": f"multipart/form-data; boundary={borde}"})["documento"]
    assert d["documento"] == documento, f"el nombre se corrompio: {d['documento']!r}"
    return d


def revisar(proyecto, datos):
    return _pedir("/api/revision",
                  json.dumps({"proyecto": proyecto, "datos": datos}).encode("utf-8"),
                  "POST", {"Content-Type": "application/json"})


DATOS = {
    "PRY-2026-0041": {"municipalidad": "muniguate", "tipo_solicitud": "Mixto",
                      "area_construccion_m2": 18500, "altura_m": 42, "uso_publico": True,
                      "categoria_ambiental": "A"},
    "PRY-2026-0052": {"municipalidad": "scp", "tipo_solicitud": "Residencial",
                      "area_construccion_m2": 5200, "altura_m": 9, "uso_publico": False,
                      "categoria_ambiental": "B1", "categoria_obra_scp": "mayor",
                      "fuente_agua_scp": "pozo", "en_residencial_o_condominio": True},
    "PRY-2026-0033": {"municipalidad": "muniguate", "tipo_solicitud": "Plaza Comercial",
                      "area_construccion_m2": 9800, "altura_m": 24, "uso_publico": True,
                      "categoria_ambiental": "B1", "corte_arboles_m3": 18},
}


def main():
    try:
        _pedir("/health")
    except (urllib.error.URLError, OSError):
        raise SystemExit("La API no responde en :5000. Levantala con: python api-server/app.py")

    for proyecto, docs in CASOS.items():
        print(f"\n{proyecto}  (borrados {limpiar(proyecto)})")
        for documento, requisito, fecha, archivo in docs:
            d = subir(proyecto, documento, requisito, fecha, archivo)
            marca = f"emitida {d['fecha_emision']}" if d["fecha_emision"] else "sin fecha"
            print(f"   {archivo:16} {marca:22} {documento[:52]}")

        r = revisar(proyecto, DATOS[proyecto])["resumen"]
        print(f"   -> {r['bloqueante']} bloqueantes · {r['riesgo']} riesgos · {r['aviso']} avisos")

    # El caso que sostiene la tesis: el MISMO papel con la MISMA fecha, juzgado
    # por las dos municipalidades. Si esto deja de dispararse, la demo perdio
    # su mejor momento y hay que revisarlo antes de presentar.
    scp = revisar("PRY-2026-0052", DATOS["PRY-2026-0052"])["hallazgos"]
    assert any(h["id"] == "registral-vencida-scp" for h in scp), \
        "el caso de Pinula ya no dispara la certificacion vencida"
    print("\nLa certificacion de 100 dias entra en la capital y se cae en Pinula: OK")


if __name__ == "__main__":
    main()
