# Buildhaton API Server

This directory contains the Flask API that evaluates a construction project against the rule engine in [motor/motor.py](../motor/motor.py) and [motor/reglas.json](../motor/reglas.json).

The frontend talks to this service via HTTP JSON. The API accepts a project document, normalizes the stored demo shape when needed, validates obvious field types, and returns the matching requirement list from the rule engine.

## Run locally

```bash
cd Buildhaton
python3 -m pip install -r api-server/requirements.txt
python3 api-server/app.py
```

The service listens on:

- http://127.0.0.1:5000

## Frontend integration

Set the frontend API URL to the server origin. The project currently defaults to:

```ts
const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
```

The frontend should call:

- `POST /api/validate` for validation plus requirements
- `POST /api/requirements` for requirements-only output
- `GET /health` to confirm the server is live

### Example fetch

```ts
const response = await fetch("http://127.0.0.1:5000/api/validate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    municipalidad: "muniguate",
    tipo_solicitud: "vivienda_unifamiliar",
    area_construccion_m2: 450,
    altura_m: 8,
    uso_publico: false,
    categoria_ambiental: "B2",
    aplica_nrd3: false,
    en_centro_historico: false,
    en_cono_la_aurora: false,
    requiere_mem: false,
    con_empagua: false,
    giro_exento: false,
    corte_arboles_m3: 0,
    movimiento_tierra_m3: 0,
  }),
});

const data = await response.json();
```

## Accepted input shape

The API accepts either:

1. a flat engine document, such as the JSON used by the rule engine, or
2. a stored nested project payload in the format used by [demo.json](../demo.json)

The stored demo payload looks like this:

```json
{
  "solicitante": {},
  "proyecto": {
    "tipoUso": "Plaza Comercial",
    "areaConstruccion": "160",
    "alturaEdificio": "500",
    "aguasPluviales": "No",
    "afectaSalud": "Sí",
    "impactoSocial": "Sí",
    "almacenamiento": "No",
    "bosque": "Sí"
  },
  "ambiental": {
    "tipoLicencia": "B1",
    "consumoAguaPotable": "Sí"
  },
  "municipalidad": "muniguate"
}
```

The API converts this to the engine document automatically before evaluating rules.

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

The `POST /api/validate` endpoint returns a JSON object similar to:

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

See the JSON samples under [api-server/examples](examples) and the stored sample in [demo.json](../demo.json).

## Notes for frontend usage

- `municipalidad` is required for rule evaluation.
- `tipo_solicitud` is required for rule evaluation.
- Boolean values should be passed as actual JSON booleans.
- Numeric values should be numbers, not strings.
- If the frontend stores the project in the nested demo format, the API converts it automatically before rule matching.
