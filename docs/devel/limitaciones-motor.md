# Limitaciones del motor de reglas y extensiones propuestas

El motor (`motor/reglas.json` + `motor/motor.py`, ~170 líneas) es deliberadamente
mínimo: las reglas son datos porque quien mantiene normativa municipal no escribe
Python (ver Convenciones en [`CLAUDE.md`](../../CLAUDE.md)). Ese minimalismo tiene
límites reales, y se golpearon directamente al integrar Quetzaltenango (Xela) como
cuarta jurisdicción — ver [`quetzaltenango-pot.md`](../quetzaltenango-pot.md) para el
caso completo. Este documento junta esas limitaciones en un solo lugar, con
extensiones propuestas y su costo relativo.

Estado actual (para contexto): 49 reglas, 4 jurisdicciones (`GT`, `muniguate`, `scp`,
`xela`), 104 documentos en el catálogo, `confianza` en 30 reglas `confirmada`, 11
`mirror` y 8 `SIN_CONFIRMAR`. Las 11 `mirror` son todas las de `muniguate` que citan
Guía 09-F/00-F/01-F — ambas guías salen del mismo mirror privado no oficial
(approvato.com.gt, ver [`municipal-guatemala.md`](../municipal-guatemala.md)) —
excepto las que ya estaban en `SIN_CONFIRMAR` por un disparador sin confirmar en el
propio texto (esas se quedan como estaban, no suben a `mirror`). `inab-bosque` bajó
de `confirmada` a `SIN_CONFIRMAR`: cita solo VAC02 §3j y CLAUDE.md marca a INAB
explícitamente como sin requisitos publicados en VAC04. `tipo` en 9 reglas `gestion`
y 5 `aviso` (el resto, 35, son requisitos documentales normales). `revisar_si` en 2
reglas (`conred-nrd2`, `conred-asientos-fijos`), por el cambio de la NRD-2 del
22/12/2025 (Acuerdo CN-3-2025) que VAC04 todavía cita sin versión.

## Limitaciones encontradas

### 1. Condiciones de un solo campo por operador

`cuando` es un dict plano de `campo: valor` o `campo: {operador: valor}`. No hay forma
de comparar dos campos del proyecto entre sí (p. ej. área construida como fracción del
área de terreno), y el único mecanismo de OR es el nivel superior `any` — una lista de
conjunciones AND, sin anidamiento arbitrario.

**Encontrado en:** el Art. 130 del POT de Xela ("proyectos de alto impacto") define
~30 sub-umbrales heterogéneos por rubro (m² para industria, unidades para vivienda,
número de parqueos para salud/deporte/comercio) — imposible de expresar con el DSL
actual sin una condición por rubro. Se resolvió sacando la clasificación del motor: un
campo booleano autodeclarado `alto_impacto_pot` que el usuario marca a mano, con la
lista del Art. 130 como texto de ayuda en el panel.

### 2. Vocabulario de operadores limitado

Antes de Xela solo existían `>`, `<`, `in`. Se agregaron `>=` y `<=` durante esa
integración porque el Art. 66 del POT usa umbrales inclusivos ("desde 20 m² en
adelante"), a diferencia de los umbrales exclusivos ("más de X m²") que ya usaban la
capital y Pinula. Siguen sin existir `!=`, comparación entre dos campos, o cualquier
expresión compuesta.

### 3. `tipo` es de la regla completa, no de cada entrada de `exige`

Una regla no puede mezclar, en la misma entrada, un documento real (`tipo: null`) con
un trámite no-documental (`tipo: "gestion"`) — el campo se aplica a toda la regla.
Cuando el Art. 60/130 del POT de Xela exige simultáneamente un equipo multidisciplinario
(gestión, no se resuelve subiendo un archivo) y un Informe de Asesoría + Dictamen del
Departamento de Ordenamiento Territorial (documentos reales), hubo que partir eso en
dos reglas (`xela-alto-impacto-equipo` y `xela-alto-impacto-dictamenes`) solo para que
`tipo` se aplicara correctamente a cada mitad.

### 4. `vigencia_meses` se sobreescribe por regla, no por rama dentro de una regla

El mecanismo existente (cada ocurrencia de un `documento` en `exige` puede traer su
propio `vigencia_meses`, distinto del que tenga otra regla que referencia el mismo
documento — así `cert-rgp` vale 6 meses en `muniguate` y 3 en `scp`/`xela`) funciona
bien cuando la vigencia varía **entre jurisdicciones**. No hay forma de expresar una
vigencia que varíe **dentro de la misma regla** según otro campo. La licencia de uso
del suelo de Xela tiene vigencia indefinida/4 años/3 años según sea
residencial/ordinario/condicionado (Art. 80) — se modeló como tres reglas
(`xela-uso-suelo-residencial/ordinario/condicionado`) en vez de una con una rama
interna.

### 5. Sin soporte para tablas de parámetros por zona

El Anexo 2 del POT de Xela (índice de edificabilidad, altura máxima, % de
permeabilidad, frente y superficie mínima, por 11+ sub-zonas URB/RUR/FOR) no tiene
dónde vivir en el modelo actual: el motor solo sabe de documentos que un solicitante
presenta, no de restricciones de diseño que un proyecto debe cumplir. Se dejó como
tabla de referencia en `docs/quetzaltenango-pot.md`, fuera de `reglas.json`, a
propósito — mezclar ambas cosas en el mismo esquema rompería la distinción entre
"qué debo entregar" y "cómo debo diseñar", que hoy son preguntas distintas.

### 6. Sin razonamiento geográfico o espacial

El cono de aproximación de La Aurora (dispara requisitos DGAC) y el radio de 200 m
alrededor de fuentes de agua (ESP-Q10 en el POT de Xela) son, en la realidad, polígonos
o distancias sobre un mapa. En el motor se modelan como booleanos que el usuario
autodeclara (`en_cono_la_aurora`, etc.) — el motor no sabe calcular geometría, solo
consumir la conclusión que alguien ya calculó a mano.

### 7. El self-check de no-cruce entre jurisdicciones es manual, no genérico

`motor.py::demo()` tiene un bloque por cada par de jurisdicciones que verifica que sus
conjuntos de ids de reglas no se solapen (`not (ids_cap & ids_scp)`, luego
`not (ids_xela & ids_cap) and not (ids_xela & ids_scp)`). Cada jurisdicción nueva exige
escribir su propio bloque a mano; no hay un check que recorra automáticamente
`{r["jurisdiccion"] for r in REGLAS}` y verifique la propiedad para todas las
combinaciones. Si se agrega una quinta jurisdicción y se olvida el bloque, el
self-check sigue en verde sin haber probado nada nuevo.

### 8. `confianza` es binaria, sin distinguir el origen de la fuente

El esquema solo tiene `confirmada` / `SIN_CONFIRMAR`. `CLAUDE.md` ya documenta en
prosa una distinción de tres niveles (✅ verificado contra instructivo oficial, ⚠️ de
fuente secundaria/mirror no oficial, ❌ no verificado) — pero esa distinción no existe
como campo en `reglas.json`. No se puede, por ejemplo, filtrar programáticamente "todo
lo que viene de la Guía 09-F (mirror de 2019, potencialmente desactualizada)" para
priorizar una revisión.

### 9. Sin campo estructurado de "revisar si cambia la fuente"

La NRD-2 de CONRED cambió el 22/12/2025 (Acuerdo CN-3-2025) y las reglas `conred-*`
podrían estar desactualizadas — pero eso solo está anotado como texto libre en
`CLAUDE.md` (sección "Trabajo pendiente"), no como un campo en las reglas mismas
(`conred-nrd2` y `conred-asientos-fijos` no tienen `nota`). No hay manera de que un
proceso futuro pregunte "¿qué reglas dependen de una norma con más de N meses sin
revisión?".

## Extensiones propuestas, por costo/beneficio

1. ✅ **`tipo` por entrada de `exige`, con fallback al `tipo` de la regla.** Resuelve el
   punto 3 sin obligar a partir reglas. Implementado: `catalogo.resuelve()` agrega
   `tipo` a la entrada resuelta solo si viene explícito; `motor.informe()` y
   `fallas.revisar()` calculan el tipo efectivo como `d.get("tipo") or r.get("tipo")`
   antes de decidir si es un requisito documental o una gestión. No se tocó el formato
   de `cuando`. Reglas existentes sin `tipo` por entrada siguen funcionando igual
   (fallback al `tipo` de la regla completa) — `xela-alto-impacto-equipo`/
   `-dictamenes` no se fusionaron porque además difieren en `institucion`, que sigue
   siendo un campo de regla completa, no de entrada.
2. ✅ **Operador `!=`.** Agregado a `OPS` en `motor.py`, mismo patrón que `>=`/`<=`.
   Sin uso real en `reglas.json` todavía — cubierto solo por el self-check.
3. ✅ **Check de no-cruce entre jurisdicciones, genérico.** `motor.py::demo()` ahora
   recorre `{r["jurisdiccion"] for r in REGLAS} - {"GT"}` y verifica todas las
   combinaciones de a pares. Agregar una jurisdicción nueva no requiere código nuevo.
4. ✅ **Nivel de confianza de tres valores.** Se optó por extender `confianza` en vez
   de agregar `fuente_tipo` aparte (menos sprawl de esquema, mismos consumidores
   existentes — `SIN_CONFIRMAR` sigue funcionando igual en frontend/api-server).
   Valores: `confirmada` (✅ oficial), `mirror` (⚠️ fuente secundaria/mirror no
   oficial), `SIN_CONFIRMAR` (❌ no verificado) — mapea 1:1 a la sección "Nivel de
   confianza de los datos" de `CLAUDE.md`. `motor.py::demo()` valida que ninguna
   regla tenga un valor fuera de `VALORES_CONFIANZA`. Documentado en
   `motor/glosario.json` (`confianza_mirror`). **Pendiente:** reclasificar las 49
   reglas existentes — hoy todas siguen en `confirmada`/`SIN_CONFIRMAR`, ninguna usa
   `mirror` todavía aunque varias deberían (las que citan la Guía 09-F).
5. ✅ **Campo opcional `revisar_si`.** Texto libre en una regla que describe qué
   cambio en la norma de origen la invalidaría. Cuando está presente,
   `fallas.revisar()` emite un hallazgo tipo `aviso` (`revisar-<id>`) sin bloquear el
   expediente. Documentado en `motor/glosario.json`. **Pendiente:** poblarlo en las
   reglas que ya se sabe que están en riesgo — mínimo `conred-nrd2` y
   `conred-asientos-fijos` (NRD-2 cambió el 22/12/2025, Acuerdo CN-3-2025, VAC04 la
   cita sin versión).
6. **Comparación entre dos campos del proyecto** (p. ej.
   `{"campo_a": "area_construccion_m2", "op": ">", "campo_b": "area_terreno_m2"}`).
   Costo alto: cambia la forma del DSL de `cuando`, no solo agrega un operador. Vale
   la pena solo si aparece un caso real que lo necesite — hoy no lo hay.
7. **Explícitamente fuera de alcance por ahora:** una tabla de parámetros de diseño
   por zona (punto 5) y razonamiento geográfico real (punto 6). Son preguntas
   distintas a "qué documento necesito" — mezclarlas en `reglas.json` rompería la
   separación de responsabilidades del motor actual. Si en algún momento hacen falta,
   deberían vivir en un módulo nuevo, no estirar este.
