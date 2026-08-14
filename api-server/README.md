# Buildhaton API Server

This directory contains a small Flask API that evaluates a construction project against the rule engine in [motor/motor.py](../motor/motor.py) and [motor/reglas.json](../motor/reglas.json).

## Run

```bash
cd Buildhaton
python3 -m pip install -r api-server/requirements.txt
python3 api-server/app.py
```

The server starts on:

- http://127.0.0.1:5000

## Endpoints

### Health check

```bash
curl http://127.0.0.1:5000/health
```

### Validate a project

```bash
curl -X POST http://127.0.0.1:5000/api/validate \
  -H "Content-Type: application/json" \
  -d @api-server/examples/project-muniguate-valid.json
```

### List requirements only

```bash
curl -X POST http://127.0.0.1:5000/api/requirements \
  -H "Content-Type: application/json" \
  -d @api-server/examples/project-scp.json
```

## Response format

The `POST /api/validate` endpoint returns:

```json
{
  "ok": true,
  "errors": [],
  "warnings": [],
  "requirements": [
    {
      "id": "muni-gt-base",
      "capa": "municipal",
      "jurisdiccion": "muniguate",
      "institucion": "Municipalidad de Guatemala (DCT)",
      "tipo": null,
      "confianza": "confirmada",
      "documentos": ["Formulario F08 ..."],
      "fuente": "Guía 09-F · Guía 00-F · documentos generales",
      "nota": null
    }
  ],
  "documents": [
    {
      "rule_id": "muni-gt-base",
      "institution": "Municipalidad de Guatemala (DCT)",
      "capa": "municipal",
      "document": "Formulario F08 ..."
    }
  ],
  "informe": "...",
  "summary": {
    "total_rules": 5,
    "ministerial_rules": 0,
    "municipal_rules": 5,
    "documents": 17
  },
  "project": {
    "municipalidad": "muniguate"
  }
}
```

The API validates obvious field shapes such as booleans and numeric values before evaluating the requirement list.

## Example payloads

See the JSON samples under [api-server/examples](examples).
