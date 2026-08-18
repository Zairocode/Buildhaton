# Glosario técnico

Definiciones de campos del motor, valores enumerados, instituciones, umbrales y metadata que aparecen en la UI o en `reglas.json` y suelen confundir.

**Fuente canónica:** [`motor/glosario.json`](../motor/glosario.json) (96 entradas, version 1).

**Consulta rápida:**

```bash
python motor/glosario.py fuente_agua
python motor/glosario.py NRD-2
```

## Categorías

| Categoría | Qué incluye |
|---|---|
| `campo_proyecto` | Variables snake_case del objeto `proyecto` que evalúa el motor |
| `campo_wizard` | Campos del VAC02 traducidos en `motor.ts` (`desdeWizard`) |
| `jurisdiccion` | IDs `GT`, `muniguate`, `scp`, `xela` |
| `institucion` | VAC, VUM, CONRED, MSPAS, MARN, DGAC, INAB, MEM, RGP, EMPAGUA, DCT |
| `norma` | NRD-1/2/3, DRPSA-011-2022, AG 178-2009 |
| `concepto` | Costura VAC↔muni, válvula de escape, colegiado activo, FALTANTES, EAP, PTAR… |
| `umbral` | 16 m, 30/200/700 m², 10 m³ árboles, 100 m pozo, 72 h MARN, vigencias registral/solvencia |
| `metadata` | `confianza`, `tipo` aviso/gestión, `vigencia_meses`, severidades de fallas, operadores DSL |

## Campos del proyecto (motor)

Estos son los **24 campos** usados en condiciones `cuando` de `reglas.json`, más los que solo vienen del panel FALTANTES:

| Campo | Una línea |
|---|---|
| `municipalidad` | Dónde se tramita — no lo pregunta el VAC02 |
| `uso_publico` | Dispara CONRED NRD-2 (no es «cualquier obra pública» genérico) |
| `altura_m` | >16 m → DGAC (SIN_CONFIRMAR alcance nacional) |
| `area_construccion_m2` | Umbrales 30 / 200 / 700 m² capital; ≥20 m² Xela |
| `fuente_agua` | `nueva` vs `existente` — eje MSPAS más importante |
| `tratamiento_aguas_residuales` | `nueva` PTAR vs `conexion_existente` |
| `categoria_ambiental` | A / B1 / B2 MARN (edicto solo A y B1) |
| `categoria_obra_scp` | menor / mayor / gran_magnitud (Pinula) |
| `fuente_agua_scp` | empresa_privada / municipal / pozo (Pinula) |
| `alto_impacto_pot` | Autodeclarado Art. 130 POT Xela |
| `zona_macro_pot` | urbana / rural / forestal / especial (Xela) |

Lista completa con definiciones, valores y fuentes: ver JSON por `categoria: "campo_proyecto"`.

## Brechas conocidas wizard → motor

| Wizard | Motor | Problema |
|---|---|---|
| `tratamientoAR` (Sí/No) | `tratamiento_aguas_residuales` | Solo mapea a `nueva`; conexión a PTAR existiente hay que fijarla en el panel |
| `tipoUso` | `uso_publico` | Solo Plaza Comercial, Oficina, Industrial, Mixo → true |
| `consumoAguaPotable` | `abastecimiento_agua_consumo_humano` | No distingue fuente nueva vs existente → panel `fuente_agua` |

## Relación con otros archivos

| Archivo | Rol |
|---|---|
| [`motor/reglas.json`](../motor/reglas.json) | Usa los campos en `cuando` |
| [`motor/documentos.json`](../motor/documentos.json) | Catálogo de PDFs/planos — ver [`catalogo-documentos.md`](catalogo-documentos.md) |
| [`frontend/src/lib/motor.ts`](../frontend/src/lib/motor.ts) | Traductor wizard + `FALTANTES` |

## Mantenimiento

Al introducir un campo nuevo al motor:

1. Agregar entrada en `motor/glosario.json` con `id`, `termino`, `categoria`, `definicion`, `fuente`, `confianza`.
2. Si tiene valores enum, documentarlos en `valores`.
3. Correr `python motor/glosario.py`.
