# Capa municipal — Municipalidad de Guatemala

Fuente: **Guía 09-F**, código `PTLI.23 Versión 2` — Ventanilla Única Municipal, Dirección de Control Territorial (DCT). Copia local: [`fuentes/MUNIGUATE_guia_09F.pdf`](fuentes/MUNIGUATE_guia_09F.pdf).

> ⚠️ **Obtenida de un mirror privado** (approvato.com.gt), no del portal municipal — `vu.muniguate.com` bloquea acceso automatizado. La versión es de 2019. **Confirmar contra la guía vigente antes de codificar montos o umbrales.** Ver [Estado del scraping](#estado-del-scraping).

Esta es la mitad que la VAC no cubre. Confirma la tesis del proyecto: mismo país, reglas distintas, y aquí aparecen requisitos que no existen en ninguna parte del expediente ministerial.

---

## Alcance de esta guía

**Aplica a:**
- Vivienda unifamiliar hasta **700 m²**
- Ampliaciones y remodelaciones en vivienda unifamiliar hasta **700 m²**
- Establecimiento Abierto al Público (**EAP**)
- Fraccionamientos hasta **4 predios**

**No aplica a:**
- Centro Histórico, Conjunto Histórico o Área de Amortiguamiento
- Cambio de uso de suelo

> Los cuatro exclusiones son **disparadores puramente municipales**. No tienen equivalente en el VAC02 y dependen del ordenamiento territorial de cada muni.

---

## Umbrales

Los números concretos que definen ramas del árbol de decisión:

| Umbral | Efecto |
|---|---|
| **30 m²** | Obras mayores a 30 m² → planos firmados, sellados y timbrados por ingeniero o arquitecto **colegiado activo**. Código de obra: `CONSTRUCCIÓN MAYOR A 30 M²` |
| **200 m²** | Proyectos > 200 m², fraccionamientos, o polígonos irregulares → **copia digital de todos los planos en disco compacto, formato CAD versión 2007** |
| **700 m²** | Techo de esta guía. Arriba de eso, otra guía |
| **4 predios** | Techo de fraccionamiento para esta guía |
| **10 m³** | Corte de árboles > 10 m³ → **dictamen favorable del INAB**. Menor a 10 m³ → Guía 04, Dirección de Medio Ambiente municipal |
| **Q 350.00** | Tasa por solicitud EAP. Exentos: tiendas, abarroterías, panaderías, farmacias, librerías, centros educativos, centros comunitarios e iglesias |
| **6 meses** | Vigencia máxima de la Certificación del Registro General de la Propiedad |
| **2 meses** | Vigencia máxima de la Solvencia Municipal |
| **3 años** | Contrato de arrendamiento mayor a 3 años → debe estar **inscrito en el Registro de la Propiedad** |

---

## Documentos que solo existen en la capa municipal

Ninguno de estos aparece en el Anexo I del VAC02:

| Documento | Detalle |
|---|---|
| **Formulario F08** | versión actual. Sin borrones, tachones ni corrector |
| **Boleto de Ornato vigente** | del propietario **y** del ingeniero/arquitecto responsable. Arbitrio municipal — se presenta el de la muni donde se pagó |
| **Solvencia Municipal** del inmueble | emitida en los últimos 2 meses |
| **Consulta "A"** | se proporciona **en las instalaciones** de la Ventanilla Única Municipal |
| **Memoria Descriptiva DCT** | según guía de lineamientos que **se proporciona en la ventanilla** |
| **Póliza de seguro** por daños y perjuicios a terceros y a propiedad privada | monto mínimo según la **tabla de costos vigente de la Municipalidad** |
| **Patente de comercio** | previo a la autorización |

**Certificación del Registro General de la Propiedad** existe en ambas capas, pero la muni añade condiciones que el VAC no pide: historial completo, emitida en los últimos 6 meses, y **en original** para fraccionamientos.

### Documentos según quién solicita
- Propietario menor de edad → ambos padres firman + copia autenticada de ambos DPI + documentos de patria potestad o tutela
- Persona jurídica → nombramiento inscrito en el registro correspondiente
- Propietario fallecido con proceso sucesorio → acta de discernimiento de cargo como albacea judicial o testamentario
- Mandato → vigente e inscrito en el Registro de Poderes del Organismo Judicial
- Gestor autorizado → DPI autenticado, declarado en el Formulario F08
- Arrendamiento → contrato vigente con cláusula que autorice expresamente *"ante la Municipalidad de Guatemala, de realizar los trabajos correspondientes a…"*

---

## La costura entre VAC y municipalidad

Esta es la relación exacta entre las dos capas, y hasta ahora era una suposición:

**La municipalidad exige la salida del proceso ministerial como entrada suya.**

| Requisito municipal | Viene de |
|---|---|
| Resolución favorable del **MARN** (y Licencia Ambiental si aplica) | expediente MARN en VAC → [flujo VAC09](matriz-requisitos.md#flujo-post-resolución-vac09) |
| Copia del **instrumento ambiental** completo, en formato digital | mismo instrumento que se sube al VAC |
| Copia de planos **sellados por el Ministerio** (cuando aplique) | salida del VAC |
| **Dictamen favorable del MSPAS** | expediente MSPAS en VAC — para EAP, cambio de uso en establecimientos existentes y localización industrial |
| **Dictamen favorable del INAB** | INAB, que **no está integrado a VAC** |

### La válvula de escape

> *"Si aún no ha concluido el trámite del MARN, podrá ingresar el expediente a través de un **acta de declaración jurada** según formato proporcionado en la Ventanilla Única Municipal, adjuntando copia de recepción de la solicitud ante el MARN."*

Se puede paralelizar el trámite municipal con el ministerial mediante declaración jurada. **Eso es conocimiento de oficio puro** — cambia el cronograma del proyecto y no está en ningún lado salvo en esta línea de una guía.

---

## La cláusula que justifica el proyecto

Textual, de la guía:

> *"Se podrán requerir aquellos requisitos adicionales que se consideren necesarios para la autorización de la solicitud, según sea el caso."*

La guía misma admite que la lista no es la lista. Esa discrecionalidad es, literalmente, la razón por la que hoy se necesita experiencia — y por la que el módulo 3 (bitácora de rechazos) no es opcional: es la única forma de saber qué se pide "según el caso".

---

## Fricción física

El expediente municipal **no es digital**:

- Fólder **color claro, tamaño oficio, con gancho**, ordenado según la guía
- Planos en **papel bond**, escala legible, normas **ICAITI** para dimensiones
- Sin borrones, tachones ni corrector
- El CD va **en sobre para CD pegado en una hoja de papel bond**
- Planos de arquitectura y estabilización de taludes en **un solo archivo PDF** dentro del CD
- *"No se dará trámite a expedientes que no cumplan con los requisitos solicitados"*

Un expediente rebotado por el color del fólder cuesta lo mismo que uno rebotado por un cálculo estructural.

---

## Planos específicos por tipo de obra

La guía define códigos de obra con sus propios planos, además de los generales:

| Código de obra | Planos específicos |
|---|---|
| **Construcción mayor a 30 m²** | planta amueblada; planos estructurales (cimentación, columnas y vigas, armado de techos); planos de instalaciones (agua, drenajes, iluminación y fuerza); instalaciones especiales (salidas de emergencia, ubicación de extintores) |
| **Demolición** | planta arquitectónica (cuando hay construcción existente); plano de áreas a demoler (demolición parcial) |
| **Movimiento de tierra / excavación** | plano con curvas de nivel (originales y modificadas); secciones del terreno (perfiles originales y modificados); planos del sistema de estabilización de taludes con detalles estructurales |
| **Fraccionamiento** | plano de localización (calles, avenidas, dimensiones de finca matriz); plano de ubicación; plano de desmembración (fracciones y servidumbres de paso); plano de registro individual por cada fracción y del resto de finca matriz |

**Planos generales obligatorios para cualquier solicitud:** localización, ubicación, amueblado de todos los niveles, amueblado de conjunto, acotado, elevaciones y secciones (longitudinales y transversales). El de ubicación debe indicar áreas libres y su material.

---

## Estado del scraping

| Fuente | Resultado |
|---|---|
| `vu.muniguate.com/docs` | **403** — bloqueo a clientes automatizados, en todo el dominio |
| `muniguate.com/empresadevivienda/...` | **403** — mismo bloqueo |
| `asisehace.gt` (catálogo nacional de trámites) | **redirige a pronacom.org** — el catálogo ya no está en línea |
| `approvato.com.gt` (mirror privado) | ✅ funcionó — de ahí salió la Guía 09-F |
| `vac.com.gt` | ✅ funcionó — los 7 instructivos VAC |

**Para completar la capa municipal hace falta bajar los PDFs desde un navegador real.** Las guías que esta misma referencia y que faltan:

- **Guía 08** — obras mayores (el rango arriba de 700 m²)
- **Guía 04** — Dirección de Medio Ambiente municipal (cortes de árboles < 10 m³)
- Las "guías por dependencia" que la 09-F menciona sin nombrar
- Formulario **F08** vigente
- **Tabla de costos vigente** de la Municipalidad (define el monto de la póliza y el cálculo de la licencia)

Y después, otra municipalidad para contrastar — Santa Catarina Pinula es el caso que motiva el proyecto.
