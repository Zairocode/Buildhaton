import json
import os
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

DATA_DIR = Path(ROOT_DIR) / "api-server" / "data"
STATUS_STORE_PATH = DATA_DIR / "project_statuses.json"
DOCS_STORE_PATH = DATA_DIR / "documents.json"
BITACORA_STORE_PATH = DATA_DIR / "bitacora.json"
UPLOADS_DIR = DATA_DIR / "uploads"

from flask import Flask, jsonify, request, send_file
from werkzeug.utils import secure_filename

from motor.motor import REGLAS, informe, requisitos
from motor.fallas import resumen, revisar

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024  # 25 MB por archivo

# Se derivan de reglas.json: al cargar reglas de una municipalidad nueva,
# la API y el selector del panel la aceptan sin tocar codigo.
VALID_MUNICIPALITIES = {r["jurisdiccion"] for r in REGLAS}

# "GT" es la capa ministerial (VAC), no una municipalidad.
NOMBRES_JURISDICCION = {
    "GT": "Gobierno central (VAC)",
    "muniguate": "Guatemala",
    "scp": "Santa Catarina Pinula",
}

ID_SEGURO = re.compile(r"^[A-Za-z0-9._-]{1,64}$")


@app.after_request
def _cors(response):
    """El frontend corre en otro puerto (vite:5173). Sin esto el browser lo bloquea."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    return response


@app.route("/api/<path:_>", methods=["OPTIONS"])
def _preflight(_):
    return ("", 204)


def _field_error(field: str, code: str, message: str, **extra: Any):
    payload = {
        "field": field,
        "code": code,
        "message": message,
    }
    payload.update(extra)
    return payload


def _as_bool(value: Any):
    if isinstance(value, bool):
        return value
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return bool(value)

    text = str(value).strip().lower()
    if text in {"sí", "si", "yes", "true", "1", "s"}:
        return True
    if text in {"no", "false", "0", "n"}:
        return False
    return None


def _as_number(value: Any):
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    if isinstance(value, str):
        cleaned = re.sub(r"[^\d.-]", "", value.strip())
        if cleaned in {"", "-", ".", "-."}:
            return None
        try:
            return float(cleaned)
        except ValueError:
            return None
    return None


def stored_project_to_engine_document(project: Any):
    """Converts stored project records (demo.json shape) into the flat document expected by motor.py."""
    if not isinstance(project, dict):
        raise ValueError("Request body must be a JSON object with project data.")

    if "proyecto" in project or "ambiental" in project:
        proyecto = project.get("proyecto") if isinstance(project.get("proyecto"), dict) else {}
        ambiental = project.get("ambiental") if isinstance(project.get("ambiental"), dict) else {}
        flat = dict(project)
        flat.pop("proyecto", None)
        flat.pop("ambiental", None)
        flat.pop("seguridad", None)
        flat.pop("coordenadas", None)
        flat.pop("contactos", None)
        flat.pop("documentosAdjuntos", None)

        flat["municipalidad"] = flat.get("municipalidad")
        flat["tipo_solicitud"] = proyecto.get("tipoUso") or flat.get("tipo_solicitud")
        flat["area_construccion_m2"] = _as_number(proyecto.get("areaConstruccion"))
        flat["altura_m"] = _as_number(proyecto.get("alturaEdificio"))
        flat["uso_publico"] = (
            proyecto.get("tipoUso") in {"Plaza Comercial", "Oficina", "Industrial", "Mixto"}
        ) or _as_bool(flat.get("uso_publico"))
        flat["genera_aguas_pluviales"] = _as_bool(proyecto.get("aguasPluviales"))
        flat["afecta_salud_circunvecina"] = _as_bool(proyecto.get("afectaSalud"))
        flat["impacto_social"] = _as_bool(proyecto.get("impactoSocial"))
        flat["almacena_agua_combustible_lubricantes"] = _as_bool(proyecto.get("almacenamiento"))
        flat["cercano_area_bosque"] = _as_bool(proyecto.get("bosque"))
        flat["categoria_ambiental"] = ambiental.get("tipoLicencia") or flat.get("categoria_ambiental")
        flat["abastecimiento_agua_consumo_humano"] = _as_bool(ambiental.get("consumoAguaPotable"))
        flat["tratamiento_aguas_residuales"] = "nueva" if _as_bool(ambiental.get("tratamientoAR")) else None
        flat["asientos_fijos"] = _as_bool(flat.get("asientos_fijos"))
        flat["giro_exento"] = _as_bool(flat.get("giro_exento"))
        flat["en_residencial_o_condominio"] = _as_bool(flat.get("en_residencial_o_condominio"))
        flat["en_centro_historico"] = _as_bool(flat.get("en_centro_historico"))
        flat["en_cono_la_aurora"] = _as_bool(flat.get("en_cono_la_aurora"))
        flat["requiere_mem"] = _as_bool(flat.get("requiere_mem"))
        flat["con_empagua"] = _as_bool(flat.get("con_empagua"))
        flat["aplica_nrd3"] = _as_bool(flat.get("aplica_nrd3"))
        flat["corte_arboles_m3"] = _as_number(flat.get("corte_arboles_m3"))
        flat["movimiento_tierra_m3"] = _as_number(flat.get("movimiento_tierra_m3"))

        project = flat

    if isinstance(project, dict):
        normalized = dict(project)
        for key in ["municipalidad", "tipo_solicitud", "fuente_agua", "fuente_agua_scp", "categoria_obra_scp"]:
            value = normalized.get(key)
            if value is not None and isinstance(value, str):
                normalized[key] = value.strip()

        if normalized.get("municipalidad") is not None and normalized["municipalidad"] == "":
            normalized["municipalidad"] = None

        for key in [
            "area_construccion_m2",
            "altura_m",
            "corte_arboles_m3",
            "movimiento_tierra_m3",
        ]:
            if key in normalized:
                normalized[key] = _as_number(normalized.get(key))

        for key in [
            "uso_publico",
            "aplica_nrd3",
            "en_residencial_o_condominio",
            "giro_exento",
            "cercano_area_bosque",
            "genera_aguas_pluviales",
            "afecta_salud_circunvecina",
            "impacto_social",
            "almacena_agua_combustible_lubricantes",
            "abastecimiento_agua_consumo_humano",
            "requiere_mem",
            "con_empagua",
            "en_centro_historico",
            "en_cono_la_aurora",
        ]:
            if key in normalized:
                normalized[key] = _as_bool(normalized.get(key))

        return normalized

    return project


def _normalize_project(project: Any):
    return stored_project_to_engine_document(project)


def _collect_errors(project: dict):
    errors = []
    warnings = []

    if "municipalidad" not in project or project.get("municipalidad") in (None, ""):
        errors.append(
            _field_error(
                "municipalidad",
                "missing_field",
                "'municipalidad' is required to evaluate the project requirements.",
            )
        )
    elif project.get("municipalidad") not in VALID_MUNICIPALITIES:
        errors.append(
            _field_error(
                "municipalidad",
                "unsupported_municipality",
                f"Unsupported municipality '{project.get('municipalidad')}'. Allowed values: {sorted(VALID_MUNICIPALITIES)}.",
            )
        )

    if "tipo_solicitud" not in project or project.get("tipo_solicitud") in (None, ""):
        errors.append(
            _field_error(
                "tipo_solicitud",
                "missing_field",
                "'tipo_solicitud' is required to evaluate the project requirements.",
            )
        )

    numeric_fields = [
        "area_construccion_m2",
        "altura_m",
        "corte_arboles_m3",
        "movimiento_tierra_m3",
    ]
    for field in numeric_fields:
        if field in project and project.get(field) is not None:
            value = project.get(field)
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                errors.append(
                    _field_error(
                        field,
                        "invalid_numeric_value",
                        f"'{field}' must be a number, not {type(value).__name__}.",
                    )
                )

    for field in ["uso_publico", "aplica_nrd3", "en_residencial_o_condominio", "giro_exento"]:
        if field in project and project.get(field) is not None and not isinstance(project.get(field), bool):
            errors.append(
                _field_error(
                    field,
                    "invalid_boolean_value",
                    f"'{field}' must be a boolean value.",
                )
            )

    if "municipalidad" in project and project.get("municipalidad") == "muniguate" and "area_construccion_m2" in project:
        area = project.get("area_construccion_m2")
        if isinstance(area, (int, float)) and area > 700:
            warnings.append(
                {
                    "code": "outside_guide_scope",
                    "message": "Area exceeds the municipal guide scope; a different municipal guide may apply.",
                    "field": "area_construccion_m2",
                }
            )

    return errors, warnings


def _serialize_rule(rule: dict):
    return {
        "id": rule.get("id"),
        "capa": rule.get("capa"),
        "jurisdiccion": rule.get("jurisdiccion"),
        "institucion": rule.get("institucion"),
        "tipo": rule.get("tipo"),
        "confianza": rule.get("confianza"),
        "documentos": rule.get("exige", []),
        "fuente": rule.get("fuente"),
        "nota": rule.get("nota"),
    }


def _load_store(path: Path) -> list:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        return []

    try:
        with path.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, json.JSONDecodeError):
        return []

    return data if isinstance(data, list) else []


def _save_store(path: Path, items: list) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_suffix(".json.tmp")
    with temp_path.open("w", encoding="utf-8") as fh:
        json.dump(items, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    os.replace(temp_path, path)


def _load_status_store() -> list:
    return _load_store(STATUS_STORE_PATH)


def _save_status_store(items: list) -> None:
    _save_store(STATUS_STORE_PATH, items)


@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "buildhaton-rule-api", "status": "healthy"})


@app.get("/api/jurisdicciones")
def list_jurisdicciones():
    """Que jurisdicciones tienen reglas cargadas. Sale de reglas.json, no de una
    lista fija: es el tablero de avance del raspado de municipalidades."""
    conteo: dict[str, dict] = {}
    for regla in REGLAS:
        jur = regla["jurisdiccion"]
        fila = conteo.setdefault(
            jur,
            {
                "id": jur,
                "label": NOMBRES_JURISDICCION.get(jur, jur),
                "capa": regla.get("capa"),
                "reglas": 0,
                "documentos": 0,
                "sin_confirmar": 0,
                "fuentes": set(),
            },
        )
        fila["reglas"] += 1
        if regla.get("tipo") != "aviso":
            fila["documentos"] += len(regla.get("exige", []))
        if regla.get("confianza") == "SIN_CONFIRMAR":
            fila["sin_confirmar"] += 1
        if regla.get("fuente"):
            fila["fuentes"].add(regla["fuente"])

    items = []
    for fila in conteo.values():
        fila["fuentes"] = sorted(fila["fuentes"])
        items.append(fila)
    items.sort(key=lambda f: (f["capa"] != "ministerial", f["label"]))

    return jsonify({"ok": True, "items": items, "count": len(items)})


def _doc_dir(proyecto: str) -> Path:
    return UPLOADS_DIR / proyecto


@app.get("/api/documentos")
def list_documentos():
    proyecto = (request.args.get("proyecto") or "").strip()
    items = _load_store(DOCS_STORE_PATH)
    if proyecto:
        items = [d for d in items if d.get("proyecto") == proyecto]
    return jsonify({"ok": True, "items": items, "count": len(items)})


@app.post("/api/documentos")
def upload_documento():
    """Sube el archivo de un requisito. multipart: proyecto, requisito, documento, archivo."""
    archivo = request.files.get("archivo")
    proyecto = (request.form.get("proyecto") or "").strip()
    documento = (request.form.get("documento") or "").strip()

    if archivo is None or not archivo.filename:
        return jsonify({"ok": False, "error": _field_error("archivo", "missing_file", "Falta el archivo.")}), 400
    if not ID_SEGURO.match(proyecto):
        return jsonify({"ok": False, "error": _field_error("proyecto", "invalid_id", "'proyecto' invalido o ausente.")}), 400
    if not documento:
        return jsonify({"ok": False, "error": _field_error("documento", "missing_field", "Falta el nombre del requisito.")}), 400

    # La fecha de emision alimenta las reglas de vigencia del motor de fallas.
    # Si viene mal escrita se guarda vacia: el motor prefiere decir "no se sabe"
    # antes que afirmar que un documento esta vigente.
    fecha_emision = (request.form.get("fecha_emision") or "").strip()[:10] or None
    if fecha_emision is not None:
        try:
            date.fromisoformat(fecha_emision)
        except ValueError:
            return jsonify({"ok": False, "error": _field_error(
                "fecha_emision", "invalid_date", "La fecha de emision debe ser AAAA-MM-DD.")}), 400

    nombre = secure_filename(archivo.filename) or "documento"
    destino_dir = _doc_dir(proyecto)
    destino_dir.mkdir(parents=True, exist_ok=True)

    items = _load_store(DOCS_STORE_PATH)
    doc_id = f"doc-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    ruta = destino_dir / f"{doc_id}-{nombre}"
    archivo.save(ruta)

    registro = {
        "id": doc_id,
        "proyecto": proyecto,
        "requisito": (request.form.get("requisito") or "").strip() or None,
        "documento": documento,
        "archivo": nombre,
        "bytes": ruta.stat().st_size,
        "fecha_emision": fecha_emision,
        "subido_por": (request.form.get("usuario") or "").strip() or None,
        "subido_en": datetime.now(timezone.utc).isoformat(),
    }
    items.append(registro)
    _save_store(DOCS_STORE_PATH, items)

    return jsonify({"ok": True, "documento": registro}), 201


@app.get("/api/documentos/<doc_id>/archivo")
def download_documento(doc_id: str):
    items = _load_store(DOCS_STORE_PATH)
    registro = next((d for d in items if d.get("id") == doc_id), None)
    if registro is None:
        return jsonify({"ok": False, "error": _field_error("id", "not_found", "Documento inexistente.")}), 404

    ruta = _doc_dir(registro["proyecto"]) / f"{registro['id']}-{registro['archivo']}"
    if not ruta.exists():
        return jsonify({"ok": False, "error": _field_error("id", "file_missing", "El archivo ya no esta en disco.")}), 404
    return send_file(ruta, as_attachment=True, download_name=registro["archivo"])


@app.delete("/api/documentos/<doc_id>")
def delete_documento(doc_id: str):
    items = _load_store(DOCS_STORE_PATH)
    registro = next((d for d in items if d.get("id") == doc_id), None)
    if registro is None:
        return jsonify({"ok": False, "error": _field_error("id", "not_found", "Documento inexistente.")}), 404

    ruta = _doc_dir(registro["proyecto"]) / f"{registro['id']}-{registro['archivo']}"
    ruta.unlink(missing_ok=True)
    _save_store(DOCS_STORE_PATH, [d for d in items if d.get("id") != doc_id])
    return jsonify({"ok": True, "id": doc_id})


@app.get("/api/bitacora")
def get_bitacora():
    """Memoria de rechazos. `demo` avisa que todavia no hay rechazos reales
    cargados: los contadores que se muestran arriba salen de datos sembrados."""
    items = _load_store(BITACORA_STORE_PATH)
    return jsonify({
        "ok": True,
        "items": items,
        "count": len(items),
        "demo": all(i.get("origen") == "demo" for i in items) if items else True,
    })


@app.post("/api/bitacora")
def add_bitacora():
    """Registra un rechazo real. Es lo que convierte el motor de fallas en
    memoria: la proxima revision de cualquier proyecto ya lo toma en cuenta."""
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or not str(payload.get("falla") or "").strip():
        return jsonify({"ok": False, "error": _field_error(
            "falla", "missing_field", "Se requiere el id de la falla que causo el rechazo.")}), 400

    items = _load_store(BITACORA_STORE_PATH)
    registro = {
        "id": f"bit-{len(items) + 1}",
        "falla": str(payload["falla"]).strip()[:120],
        "proyecto": str(payload.get("proyecto") or "").strip()[:64] or None,
        "fecha": str(payload.get("fecha") or date.today().isoformat())[:10],
        "institucion": str(payload.get("institucion") or "").strip()[:120] or None,
        "nota": str(payload.get("nota") or "").strip()[:500] or None,
        "origen": "real",
    }
    items.append(registro)
    _save_store(BITACORA_STORE_PATH, items)
    return jsonify({"ok": True, "registro": registro}), 201


@app.post("/api/revision")
def revisar_expediente():
    """Motor de fallas: cruza los requisitos del proyecto con los archivos ya
    cargados y devuelve que va a fallar. Body: {proyecto: <id>, datos: {...}}."""
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"ok": False, "error": _field_error(
            "body", "invalid_json", "Se espera un objeto JSON.")}), 400

    proyecto_id = str(payload.get("proyecto") or "").strip()
    datos = payload.get("datos")
    if not isinstance(datos, dict):
        return jsonify({"ok": False, "error": _field_error(
            "datos", "missing_field", "Falta 'datos' con la informacion del proyecto.")}), 400

    cargados = [d for d in _load_store(DOCS_STORE_PATH) if d.get("proyecto") == proyecto_id]
    bitacora = _load_store(BITACORA_STORE_PATH)
    hallazgos = revisar(_normalize_project(datos), cargados, bitacora=bitacora)

    return jsonify({
        "ok": True,
        "proyecto": proyecto_id,
        "hallazgos": hallazgos,
        "resumen": resumen(hallazgos),
        "cargados": len(cargados),
        "bitacora_demo": all(i.get("origen") == "demo" for i in bitacora) if bitacora else True,
    })


@app.get("/api/project-status")
@app.get("/api/status")
def get_project_statuses():
    items = _load_status_store()
    return jsonify({"ok": True, "items": items, "count": len(items)})


@app.post("/api/project-status")
@app.post("/api/status")
def save_project_status():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            "ok": False,
            "error": _field_error("body", "invalid_json", "Request body must be valid JSON."),
        }), 400

    if isinstance(payload, list):
        records = payload
    elif isinstance(payload, dict):
        records = [payload]
    else:
        return jsonify({
            "ok": False,
            "error": _field_error("body", "invalid_structure", "Request body must be a JSON object or an array of objects."),
        }), 400

    existing = _load_status_store()
    now = datetime.now(timezone.utc).isoformat()
    saved = []

    for index, item in enumerate(records, start=1):
        if not isinstance(item, dict):
            return jsonify({
                "ok": False,
                "error": _field_error("body", "invalid_structure", f"Item #{index} must be a JSON object."),
            }), 400

        record = dict(item)
        record["stored_at"] = now
        record["id"] = f"status-{len(existing) + len(saved) + 1}"
        saved.append(record)

    existing.extend(saved)
    _save_status_store(existing)

    return jsonify({
        "ok": True,
        "saved": saved[0] if len(saved) == 1 else saved,
        "count": len(saved),
        "total": len(existing),
    }), 201


@app.post("/api/validate")
def validate_project():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            "ok": False,
            "errors": [
                _field_error("body", "invalid_json", "Request body must be valid JSON.")
            ],
            "warnings": [],
            "requirements": [],
            "documents": [],
            "summary": {"total_rules": 0, "documents": 0},
        }), 400

    try:
        project = _normalize_project(payload)
    except ValueError as exc:
        return jsonify({
            "ok": False,
            "errors": [_field_error("body", "invalid_structure", str(exc))],
            "warnings": [],
            "requirements": [],
            "documents": [],
            "summary": {"total_rules": 0, "documents": 0},
        }), 400

    errors, warnings = _collect_errors(project)
    matching_rules = requisitos(project)
    rule_payload = [_serialize_rule(rule) for rule in matching_rules]

    documents = []
    for rule in matching_rules:
        for doc in rule.get("exige", []):
            documents.append({
                "rule_id": rule.get("id"),
                "institution": rule.get("institucion"),
                "capa": rule.get("capa"),
                "document": doc,
            })

    response = {
        "ok": not errors,
        "errors": errors,
        "warnings": warnings,
        "requirements": rule_payload,
        "documents": documents,
        "informe": informe(project),
        "summary": {
            "total_rules": len(rule_payload),
            "ministerial_rules": sum(1 for rule in rule_payload if rule.get("capa") == "ministerial"),
            "municipal_rules": sum(1 for rule in rule_payload if rule.get("capa") == "municipal"),
            "documents": len(documents),
        },
        "project": project,
    }

    status_code = 200 if not errors else 422
    return jsonify(response), status_code


@app.post("/api/requirements")
def list_requirements():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            "ok": False,
            "errors": [_field_error("body", "invalid_json", "Request body must be valid JSON.")],
            "warnings": [],
            "requirements": [],
            "documents": [],
        }), 400

    project = _normalize_project(payload)
    rules = requisitos(project)
    return jsonify({
        "ok": True,
        "requirements": [_serialize_rule(rule) for rule in rules],
        "documents": [
            {"rule_id": rule.get("id"), "document": doc, "institution": rule.get("institucion"), "capa": rule.get("capa")}
            for rule in rules
            for doc in rule.get("exige", [])
        ],
        "informe": informe(project),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
