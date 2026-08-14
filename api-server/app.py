import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

DATA_DIR = Path(ROOT_DIR) / "api-server" / "data"
STATUS_STORE_PATH = DATA_DIR / "project_statuses.json"

from flask import Flask, jsonify, request

from motor.motor import informe, requisitos

app = Flask(__name__)

VALID_MUNICIPALITIES = {"GT", "muniguate", "scp"}


@app.after_request
def _cors(response):
    """El frontend corre en otro puerto (vite:5173). Sin esto el browser lo bloquea."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
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


def _normalize_project(project: Any):
    if not isinstance(project, dict):
        raise ValueError("Request body must be a JSON object with project data.")

    normalized = dict(project)
    for key in ["municipalidad", "tipo_solicitud", "fuente_agua", "fuente_agua_scp", "categoria_obra_scp"]:
        value = normalized.get(key)
        if value is not None and isinstance(value, str):
            normalized[key] = value.strip()

    if normalized.get("municipalidad") is not None and normalized["municipalidad"] == "":
        normalized["municipalidad"] = None

    return normalized


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


def _load_status_store() -> list:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATUS_STORE_PATH.exists():
        return []

    try:
        with STATUS_STORE_PATH.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, json.JSONDecodeError):
        return []

    return data if isinstance(data, list) else []


def _save_status_store(items: list) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = STATUS_STORE_PATH.with_suffix(".json.tmp")
    with temp_path.open("w", encoding="utf-8") as fh:
        json.dump(items, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    os.replace(temp_path, STATUS_STORE_PATH)


@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "buildhaton-rule-api", "status": "healthy"})


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
