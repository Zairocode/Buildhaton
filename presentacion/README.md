# Presentación

Material para armar el deck del buildathon.

```
presentacion/
├── PROMPT.md                 pegar en Claude junto con las capturas
├── datos-comparativo.json    capital vs Pinula, salida real de la API
├── datos-cifras.json         cifras del motor y del corpus normativo
└── capturas/                 9 capturas de la app corriendo
```

## Cómo usarlo

Abrí `PROMPT.md`, copiá desde la línea punteada, y pegalo en Claude adjuntando las imágenes de
`capturas/`. El prompt ya trae el arco narrativo, los datos duros, el estilo visual y qué
captura va en cada lámina.

## Las dos láminas que importan

**Mismo proyecto, dos municipios vecinos, cero reglas en común.**

| | Guatemala | Santa Catarina Pinula |
|---|---|---|
| Reglas | 11 | 8 |
| Documentos | 39 | 34 |
| Ministeriales | 3 — idénticas | 3 — idénticas |
| Municipales | 8 | 5 |
| En común | **ninguna** | **ninguna** |

**La carta de la asociación de vecinos.** Pinula la exige y pide además que los planos vengan
sellados por ellos. Es una negociación: pueden negarse. No existe equivalente en la capital.
Está en `capturas/04-ficha-carta-vecinos.jpg`, marcada en la app como *"No es un documento"*.

## Reproducir las capturas

```bash
python api-server/app.py                     # :5000
cd frontend && npm install && npm run dev    # :5173
```

Los números del dashboard salen del motor en vivo, así que cambian si se agregan reglas o
proyectos. Las capturas de esta carpeta son del 14/08/2026 con 35 reglas cargadas.

## Cifras verificables

| Dato | Valor | Fuente |
|---|---|---|
| Documentos del Anexo I del VAC02 | 96 | `docs/vac02.md` |
| Reglas en el motor | 35 (11 GT · 16 capital · 8 Pinula) | `motor/reglas.json` |
| Reglas marcadas sin confirmar | 6 | ídem |
| Cuerpos normativos indexados | 107 | `docs/normativa-muniguate.md` |
| Archivos normativos con acuerdo y fecha | 420 | ídem |
| PDFs oficiales versionados | 13 | `docs/fuentes/` |
| Reglamento de Construcción de la capital | 1970, últ. reforma COM-004-2024 | `docs/normativa-muniguate.md` |
| Acuerdos municipales nuevos en 2026 | 8 | ídem |

Todo lo afirmado en el deck debería poder rastrearse a estas fuentes. Si algo no se puede
rastrear, no va.
