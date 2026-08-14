# Buildhaton

**Licenciamiento de construcción en Guatemala, sin depender de que alguien "ya sepa cómo se hace".**

Hoy sacar un permiso de construcción depende de experiencia no escrita: saber qué pide *esta* municipalidad, cómo se comporta *esta* ventanilla, y con qué te rebotaron la última vez. Esa experiencia vive en la cabeza de un arquitecto o contratista, es manual, es lenta, y cuando el proyecto termina se va con él.

Buildhaton convierte ese conocimiento tácito en algo consultable.

**Caso concreto:** el [Formulario Consolidado VAC02](docs/vac02.md) — 8 pantallas, ~100 campos, y un catálogo de **96 documentos adjuntos** de los cuales a tu proyecto le aplican tal vez 25. Cuáles 25 es exactamente el conocimiento que no está escrito.

---

## Lo que la VAC ya resolvió (y lo que no)

La **Ventanilla Ágil de la Construcción** ya consolidó el eje difícil de coordinar: un solo formulario alimenta a MARN, CONAP, CONRED, DGAC, MSPAS, IDAEH y MEM. Eso ya está hecho y no hay que rehacerlo.

Lo que sigue abierto:

| | Estado |
|---|---|
| Consolidar instituciones de gobierno central | ✅ VAC02 |
| Saber **qué documentos te aplican** antes de empezar | ❌ |
| Capa **municipal** (licencia, alineación, catastro) | ❌ |
| **Memoria** de por qué te rechazaron antes | ❌ |

Buildhaton se construye sobre la VAC, no contra ella.

---

## El problema

**1. Aprobar un permiso requiere experiencia, no solo cumplir.**
El requisito publicado y el requisito real no son el mismo documento. Saber qué funciona en las ventanillas ágiles de cada municipalidad es conocimiento de oficio, no información pública.

**2. Las reglas cambian por municipalidad, no por ministerio.**
Los municipios tienen autonomía en ordenamiento territorial. Santa Catarina Pinula tiene sus reglas de urbanización; la Ciudad de Guatemala tiene las suyas. Lo que aplica en una no aplica en la otra. Nadie mantiene ese mapa completo, actualizado e indexado.

Justo por eso la VAC pudo consolidar lo ministerial (uniforme) y no lo municipal (variable). El único rastro municipal en el VAC02 es la *certificación catastral emitida por la Municipalidad respectiva* — un documento que ya debes traer resuelto.

**2b. La condicionalidad es opaca.**
De 96 documentos, cuáles te tocan depende de disparadores dispersos: pasar de 16 m de altura, estar cerca de un bosque, tener obras hidrosanitarias, ser adyacente a un sitio arqueológico. Nadie te dice cuáles son antes de que te reboten.

**3. En municipios y departamentos menos desarrollados casi no hay reglas escritas.**
El vacío normativo también es un problema: sin criterio publicado, el trámite depende todavía más de a quién conozcas.

**4. El seguimiento es manual.**
Un arquitecto o contratista carga con licenciamiento, cumplimiento y seguimiento del expediente. Es trabajo de rastreo, no de diseño.

**5. La experiencia se pierde al cerrar el proyecto.**
Se acaba el contrato, se va el contratista, y con él se va el historial. No existe una bitácora de fallas comunes: los mismos rechazos se repiten proyecto tras proyecto.

---

## La solución: 3 módulos, 1 expediente

Los tres se alimentan del mismo expediente. Esa es la parte que los hace uno solo y no tres herramientas sueltas.

### 1. Motor de requisitos
> *"¿Qué me piden exactamente a mí?"*

Contestas ~10 preguntas sobre el proyecto (altura, colindancias, obras hidrosanitarias, cercanía a bosque o sitio arqueológico) y sale **tu** lista: cuáles de los 96 documentos aplican, qué institución los pide, y qué debes tener resuelto *antes* de abrir el VAC02.

Separa lo **ministerial** (uniforme, ya mapeado en la [matriz de requisitos](docs/matriz-requisitos.md) y validado contra los instructivos oficiales) de lo **municipal** (variable por autonomía, requiere indexado y refresco continuo).

### 2. Expediente con trazabilidad
> *"¿Dónde está mi trámite y qué falta?"*

Se ancla al **código de trazabilidad que emite la municipalidad**. Estado por institución — cada una aprueba, corrige o rechaza por separado y hoy no hay una vista única. Checklist de pendientes y validación de consistencia (nombre del proyecto y dirección deben coincidir entre planos, catastro y Registro de la Propiedad; el desajuste es causa común de devolución).

### 3. Bitácora de fallas y memoria institucional
> *"¿Con qué nos rebotaron la última vez?"*

Registro de rechazos, observaciones y correcciones por institución y por municipalidad. Lo que hoy se va con el contratista, aquí se queda en el proyecto.

### El pegamento: recomendaciones
El módulo 3 alimenta al módulo 1. La bitácora de rechazos reales le da criterio al índice normativo: no solo *"esto es el requisito"* sino *"así lo han rechazado antes aquí"*.

Ese es el objetivo de fondo — **cerrar la brecha de conocimiento civil en un área especializada**, para quien no tiene 15 años de oficio.

---

## Alcance del buildathon

**Dentro:**
- **Módulo 1 sobre el VAC02 real** — la matriz de disparadores ya está extraída, es la demo más fuerte y la que menos depende de datos que no tenemos
- 2 municipalidades como piloto (una con normativa desarrollada, una sin) para demostrar que el problema es la variabilidad
- 1 tipo de obra, no todos
- Los 3 módulos conectados sobre un expediente realista

**Fuera:**
- Cobertura nacional de los 340 municipios
- Integración oficial con VAC o con sistemas municipales
- Cualquier cosa que se parezca a asesoría legal vinculante

---

## Preguntas abiertas

- **¿La VAC tiene API?** Define si el módulo 2 sincroniza estado real o solo lo registra en paralelo. Es la pregunta que más cambia el producto.
- ¿El código de trazabilidad municipal es consultable, o solo se ve en ventanilla?
- ¿Quién carga la bitácora — el contratista, o se extrae de las resoluciones de rechazo?
- ¿Producto para constructoras, para arquitectos independientes, o para la municipalidad? Cambia a quién le sirve el módulo 1.
- ¿Cómo se mantiene el índice municipal actualizado sin un equipo dedicado?

---

## Motor de requisitos

```bash
python motor/motor.py    # self-check + informe de ejemplo
```

Las reglas viven en [`motor/reglas.json`](motor/reglas.json) como **datos, no código** — quien mantiene la normativa municipal no es quien escribe Python. [`motor/motor.py`](motor/motor.py) son ~40 líneas: filtra reglas contra las respuestas del proyecto y agrupa por capa.

28 reglas de tres jurisdicciones — ministerial, capital y Santa Catarina Pinula — cada una con su `fuente` y su `confianza`. Las no verificadas salen marcadas `[SIN CONFIRMAR]` en vez de fingir certeza, y las que no se resuelven con papel (la carta de la asociación de vecinos) salen marcadas `[NO ES UN DOCUMENTO]`.

Ambas municipalidades se reservan por escrito el derecho de pedir más. El motor lo dice en la salida en vez de fingir completitud:

```
ADVERTENCIAS
  * Esta lista NO es completa: la guía se reserva pedir requisitos adicionales segun sea el caso
```

```python
{"id": "muni-gt-cad-digital",
 "cuando": {"any": [{"area_construccion_m2": {">": 200}},
                    {"tipo_solicitud": "fraccionamiento"},
                    {"poligono_irregular": true}]},
 "exige": ["Copia digital de todos los planos en CD, formato CAD versión 2007"],
 "fuente": "Guía 09-F · PTLI.23 v2"}
```

## Documentación

- [`docs/comparativa-municipal.md`](docs/comparativa-municipal.md) — **Guatemala vs. Santa Catarina Pinula**: la evidencia de que la autonomía municipal rompe el proceso
- [`docs/matriz-requisitos.md`](docs/matriz-requisitos.md) — **requisitos ministeriales y sus disparadores**, validados contra VAC04
- [`docs/municipal-guatemala.md`](docs/municipal-guatemala.md) — capa municipal de la capital: umbrales y costura VAC↔muni
- [`docs/normativa-muniguate.md`](docs/normativa-muniguate.md) — **índice de 107 cuerpos normativos / 420 archivos** con acuerdo y fecha
- [`docs/vac02.md`](docs/vac02.md) — estructura del Formulario Consolidado y catálogo de 96 documentos
- [`docs/fuentes/`](docs/fuentes/) — 11 PDFs oficiales: instructivos VAC, Guía 09-F y las tres guías de SCP

---

## Estado

**Módulo 1 funcionando, con dos municipalidades y self-check verde.** El motor demuestra la tesis en código: la misma obra en la capital y en Pinula produce dos listas sin un solo requisito en común.

```
MISMA OBRA (450 m², pozo, en condominio) EN CADA MUNICIPALIDAD
  CAPITAL                5 reglas, 17 requisitos
  SANTA CATARINA PINULA  5 reglas, 18 requisitos
```

Falta:
- Cargar reglas desde el POT y el Reglamento de Construcción (ya indexados, no leídos)
- Guía 08 (obras > 700 m²) y Guía 04 de la capital — descarga por botón JS, hace falta navegador
- Confirmar el umbral de 16 m de DGAC
- **Revisar CONRED contra la NRD-2 vigente** — cambió en diciembre 2025 (CN-3-2025) y VAC04 la cita sin versión
- Módulos 2 y 3
