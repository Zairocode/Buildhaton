# Capa municipal — Quetzaltenango (Xela)

Cuarta jurisdicción del motor (`"xela"`), junto a `GT` (ministerial), `muniguate` y `scp`.
Fuente: [`fuentes/QUETZALTENANGO_POT_2022.pdf`](fuentes/QUETZALTENANGO_POT_2022.pdf) — Plan
de Ordenamiento Territorial del municipio de Quetzaltenango, 93 páginas, aprobado por
Acta 155-2017 Punto Quinto del Concejo Municipal, vigente por 10 años desde su publicación
en el Diario de Centro América. `pdftotext` no estaba disponible en el entorno de lectura;
se usó un parser propio (Python stdlib) que reconstruye el texto de cada página decodificando
las fuentes subseteadas del PDF — verificado cruzando el texto de los Art. 26-28 contra la
tabla numérica del Anexo 2, que coincide dígito por dígito.

A diferencia de las guías de Muniguate y Pinula (que son *instructivos de trámite*: qué
documento traer), el POT de Xela es un **reglamento de ordenamiento territorial**: la
mayoría de sus artículos fijan parámetros de diseño (índice de edificabilidad, altura,
permeabilidad, retiros), no documentos a presentar. Este archivo separa ambas cosas: lo que
sí entró al motor como regla (`motor/reglas.json`, `jurisdiccion: "xela"`) y lo que quedó
como referencia porque no es un requisito documental.

---

## Licencias de obra (Art. 66) — el eje que reemplaza los m² de la capital

| Licencia | Umbral | Vigencia |
|---|---|---|
| **Permiso de obra ligera** | obras **< 20 m²** y trabajos de carácter ligero (repellos, molduras, reparación de techos) | 1 mes |
| **Licencia de obra de construcción** | obras y pavimentaciones **desde 20 m² en adelante** | ligada a una Tabla de Cobros externa que este PDF no reproduce (ver Gaps) |
| **Licencia de obra de movimiento de tierra y excavaciones** | transporte de **4 m³** de material en adelante | — |
| **Licencia de obra de urbanización** | siempre que haya apertura de nuevas calles; **más de 5 desmembraciones** con apertura de calle exige además esta licencia | aprobación en dos etapas del Concejo Municipal (anteproyecto, luego proyecto una vez ejecutadas al 100% las obras) |

El corte de **20 m²** es literal ("desde veinte metros cuadrados en adelante") — a
diferencia de los umbrales de la capital y Pinula, que se leen como "más de X" (exclusivos),
este es inclusivo. El motor necesitó agregar operadores `>=`/`<=` al evaluador genérico
para modelarlo sin forzar el número (`motor/motor.py`, tabla `OPS`).

---

## Vigencias (Art. 53, 54, 80, 148) — el análogo directo a la tabla de la comparativa

| Documento / licencia | Vigencia | Cita |
|---|---|---|
| Certificación de evaluación de parámetros normativos | **6 meses** | Art. 53 |
| Certificación factible de evaluación de parámetros | **6 meses** desde emisión | Art. 54 |
| Informe de Asesoría (proyectos de alto impacto) | **6 meses** | Art. 53 |
| Certificación de licencia de obra / construcción antigua / rural / informal / permiso de obra ligera | **1 mes** | Art. 53 |
| Certificación de localización de predio / solvencia municipal | **1 mes** | Art. 53 |
| **Certificación del Segundo Registro de la Propiedad** | **3 meses** (expedida con antelación no mayor a ese plazo) | Art. 148 |
| Licencia de uso del suelo — residencial | indefinida | Art. 80 |
| Licencia de uso del suelo — ordinario | **4 años** | Art. 80 |
| Licencia de uso del suelo — condicionado | **3 años** | Art. 80 |
| Autorización de fraccionamiento | 12 meses, una prórroga igual | Art. 57 |
| Obra provisional / uso del suelo provisional | máx. 1 año calendario, no renovable | Art. 67, 79 |

**El mismo hallazgo que ya dejó la comparativa capital-Pinula se repite acá**: la
certificación registral vale **6 meses en la capital, 3 en Pinula y 3 en Quetzaltenango**
(Art. 148) — dos de tres municipios coinciden en 3, y es la capital la que queda como
excepción. El motor reutiliza el documento de catálogo `cert-rgp` (ya existente) con
`vigencia_meses: 3` en la regla `xela-cert-rgp`, igual que hace `scp-base`.

---

## Alto impacto (Art. 130) — autodeclarado, no calculado

El catch-all es claro: *"Todas aquellas [obras] que su área de construcción sean mayor a
1000 m2 o más de 5 unidades habitacionales o funcionales"* — más una lista de ~30
sub-umbrales por rubro (residencial, comercio, deporte, salud, industria, educación,
entretenimiento…), cada uno con su propia unidad (m², parqueos, unidades). Es demasiado
heterogéneo para el DSL de una sola condición por campo que usa el motor.

**Decisión de diseño:** se agregó un campo booleano `alto_impacto_pot` que el panel
pregunta directo, mostrando la lista del Art. 130 como ayuda — el usuario se autoclasifica,
igual que ya hace `categoria_obra_scp` en Pinula. Si es `true`, dispara:

- **Equipo multidisciplinario** colegiado (estructural, sanitario, hidráulico, eléctrico,
  ambiental) + revisión obligatoria de la **Mesa Técnica de Ordenamiento Territorial**
  (`xela-alto-impacto-equipo`, marcado `tipo: "gestion"` — no es un documento).
- **Informe de Asesoría** + **Dictamen del Departamento de Ordenamiento Territorial**, este
  último *"de carácter obligatorio"* según el propio Art. 60, sin excepción posible
  (`xela-alto-impacto-dictamenes`).
- **Estudio o Revisión de Impacto Vial** (`xela-impacto-vial`) — marcado `SIN_CONFIRMAR`:
  el Art. 38 no da un umbral objetivo entre la revisión ligera (solo chequeo de planos) y
  el estudio completo, lo decide caso por caso el Departamento de Vía Pública.

---

## Zona rural/forestal → Plan de Manejo Ambiental

El POT clasifica el suelo en 4 macro-categorías con hasta 21 sub-zonas codificadas
(URB-Q1…Q7 + URB-PRO, RUR-AGR, RUR-AGR-CM, RUR-CP, 5 tipos forestales, 13 tipos ESP de
protección especial). El motor **no modela el código de sub-zona** — solo importa para los
parámetros de diseño (ver siguiente sección), fuera de alcance del motor de requisitos.

Lo único que sí dispara un documento es la macro-categoría: actividad agrícola en suelo
rural (Art. 41-42) o construcción adyacente a suelo forestal (Art. 46) exige **Plan de
Manejo Ambiental** aprobado por la Dirección de Servicios Ambientales. Campo:
`zona_macro_pot: "urbana" | "rural" | "forestal" | "especial"`, regla
`xela-zona-rural-forestal`.

---

## Parámetros de diseño (Anexo 2) — referencia, no reglas del motor

Esta tabla **no está en `reglas.json`**: son restricciones de diseño (a qué debe ajustarse
el proyecto), no documentos que un solicitante presente. Se deja aquí como referencia, con
el mismo criterio que ya usó `docs/buenas-practicas-vum.md` para los parámetros del PDUM
Antigua Pedrera.

| Sector | Superficie mín. (m²) | Frente mín. (m) | IE base | IE ampliado | Altura total máx. (m) |
|---|---|---|---|---|---|
| URB-Q1 | 500 | 15 | 3.20 | 5.90 | 51.00 |
| URB-Q2 | 400 | 15 | 3.20 | 5.90 | 47.00 |
| URB-Q3 | 300 | 10 | 2.60 | 5.00 | 44.00 |
| URB-Q4 | 150 | 6 | 2.20 | 4.00 | 29.00 |
| URB-Q5 | 100 | 5 | 1.80 | 3.00 | 26.00 |
| URB-Q6 | 100 | 5 | 1.50 | 2.30 | 16.00 |
| URB-Q7 (pendiente 20-35%) | 200 | 6 | 0.80 | 1.30 | 14.00 |
| URB-PRO (protección natural) | 400 | 15 | 0.70 | — | 6.00 |
| RUR-CP (centro poblado rural) | 100 | 5 | 1.80 | 3.00 | 26.00 |

Tabla completa (parqueo, vías, aportes urbanísticos, tolerancias) en el Anexo 2 del PDF
original, pp. 74-75.

---

## La cláusula de discrecionalidad — tercer caso, misma redacción

> *"Todo proyecto está sujeto a la ampliación de requisitos, según sea el caso, a criterio
> de las dependencias responsables y con una base técnica justificada."* (Art. 61)

> *"Aquellos casos que no se encuentren contemplados en el presente Plan o que generen
> controversia, serán resueltos por la Mesa Técnica con aprobación del Concejo Municipal."*
> (Art. 155)

La capital y Pinula ya mostraban esta cláusula (ver
[`comparativa-municipal.md`](comparativa-municipal.md#las-dos-coinciden-en-algo-se-reservan-el-criterio)).
Xela la repite, y de hecho la incrusta dentro del artículo central de requisitos (Art. 61),
no en una disposición final — tres municipios independientes, mismo patrón: **ninguna lista
publicada es la lista completa.**

---

## Gaps — lo que no se pudo confirmar en esta lectura

1. **Números de acuerdo de las Reformas 01-2019 y 02-2021.** La portada del PDF dice que el
   plan incluye estas reformas, y el cuerpo tiene artículos insertados (`19 BIS`, `145 Bis`,
   `145 Ter`) que confirman que existieron, pero no se encontró el número de acuerdo ni la
   fecha de publicación de ninguna de las dos en el texto extraíble. Puede estar en las
   páginas de mapas (pp. 77-93), que son imágenes sin texto.
2. **Tabla de Cobros de Licencia de Obras de Construcción.** El Art. 69 dice que la vigencia
   real de una licencia de obra depende de esta tabla externa ("de acuerdo con su magnitud y
   complejidad"), que no está incluida en este PDF. Sin ella, el motor no puede fijar
   `vigencia_meses` para `xela-licencia-construccion`.
3. **Sub-tipos ESP-Q3 a ESP-Q8.** El Art. 47 dice que hay 13 tipos de zona especial de
   protección y detalla Q1, Q2 (+ 7 sub-tipos), Q9 a Q13, pero no se encontró el párrafo que
   define Q3-Q8 individualmente (los Art. 49-51 los mencionan de pasada para regularización
   de obras en zonas de riesgo). Como el motor solo usa la macro-categoría, esto no bloquea
   ninguna regla actual, pero bloquea completar el Anexo 1/2 si se quiere granularidad de
   sub-zona en el futuro.

Ninguna regla de este archivo depende de estos tres vacíos — quedan documentados para quien
retome la lectura del PDF, no para bloquear lo ya integrado.
