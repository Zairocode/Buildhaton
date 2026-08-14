# Matriz de requisitos VAC — validada

Estado: **validada contra los instructivos oficiales**, no contra la plataforma. Ver [Cómo se validó](#cómo-se-validó) y [Qué quedó sin validar](#qué-quedó-sin-validar).

Fuentes en [`fuentes/`](fuentes/). Esta es la lógica que alimenta el módulo 1 del [README](../README.md).

| Doc | Contenido |
|---|---|
| VAC01 | Registro de usuarios nuevos |
| VAC02 v1 / v2 | Llenado del Formulario Consolidado + Anexo I (96 documentos) |
| VAC04 (a: 2p, b: 8p) | **Requisitos por institución** — la fuente normativa de esta matriz |
| VAC05 | Inclusión de correcciones |
| VAC07 | Procedimiento DGAC |
| VAC09 | Obtención de Licencia Ambiental (MARN) |

---

## Resumen de la validación

| | |
|---|---|
| ✅ Confirmado | Disparadores MSPAS, documentos DGAC, documentos MARN, plano de conjunto, figura arrendatario |
| ⚠️ Corregido | CONRED no es universal · MSPAS tiene eje *nuevo/existente* · edicto MARN solo A y B1 · acta notarial DGAC · asientos fijos |
| ❌ Sin validar | CONAP, IDAEH, MEM, INAB — tienen documentos en el Anexo I pero **ninguna sección de requisitos en VAC04** |

**El error más grande de la primera versión:** faltaba el eje **obra nueva vs. conexión a sistema existente**. Duplica las ramas de MSPAS y cambia el diseño del cuestionario.

---

## CONRED — NRD2

> ⚠️ **Corrección.** Antes lo tenía como "siempre". No lo es.

**Disparador:** edificaciones e instalaciones de **uso público** — las que permiten acceso de personal (empleados, contratistas, subcontratistas) o de usuarios (clientes, consumidores, beneficiarios, compradores). Aplica a las existentes y a las futuras.

Una vivienda unifamiliar privada queda fuera. Esto es una pregunta real del cuestionario, no un default.

1. Formato de información
2. Formato de evaluación
3. Plano de ubicación y localización
4. Plano de conjunto
5. Planta de techos
6. Plano en planta por nivel, achurados y áreas
7. Plano en planta por nivel de elementos de rutas de evacuación y salidas de emergencia
8. Plano en planta por nivel acotado
9. Plano de detalle de cada elemento en rutas de evacuación y salidas de emergencia
10. **Cuando existan asientos fijos** → plano de detalle de asientos fijos ⚠️ *sub-disparador nuevo*
11. Plano de elevaciones y secciones
12. Memoria descriptiva del proyecto
13. Memoria fotográfica del proyecto
14. DPI del evaluador del proyecto
15. DPI del propietario / administrador / representante legal del inmueble
16. **Cuando corresponda** → DPI del arrendatario
17. Nombramiento del representante legal del inmueble, o certificación de propiedad

Fuente: VAC04 · https://conred.gob.gt/evaluaciones-edificaciones/

---

## DGAC — control de alturas

**Disparador declarado (VAC02):** *"especialmente en el Departamento de Guatemala todos los proyectos que superen los 16 mts de altura deben poseer autorización por parte de la DGAC"*.

> ⚠️ **Ojo con este umbral.** El "16 m" aparece **solo en VAC02**, no se repite en VAC04, y la palabra *"especialmente"* deja ambiguo si el umbral es nacional o específico del Departamento de Guatemala. **Confirmar antes de codificarlo como regla.** El alcance de DGAC además cubre *edificios, torres y vallas publicitarias* — los rótulos publicitarios son un disparador aparte que no estaba en la matriz.

1. Carta de solicitud dirigida al Director General de Aeronáutica Civil
2. Formulario de Solicitud de Control de Alturas de Edificios, Torres, Rótulos publicitarios y Otros — firmado por el Representante Legal, con sello de la entidad
3. Identificación del solicitante y acreditación de la calidad con que actúa (y la de su representada, si es persona jurídica)
4. Documentación legal que acredite la propiedad o figura jurídica que otorgue libre disfrute
5. Plano de localización y ubicación, firmado por Arquitecto o Ingeniero Civil colegiado activo, con medidas del terreno y **coordenadas en WGS-84** + constancia de colegiado
6. Libreta topográfica que respalda la obtención de cota, firmada por quien la elabora
7. **Dictamen del IGN** refiriendo el banco de marca más cercano a la dirección del proyecto
8. Planos de elevación y sección — cota 0+00, elevación msnm de la cota de banqueta y de la parte más alta *incluyendo cuarto de máquinas, depósitos, antenas o cualquier instalación superior*
9. Factura Electrónica emitida por DGAC por el pago recibido
10. **Acta notarial** de compromiso de señalización, por declaración jurada ⚠️ *antes lo tenía como "carta" — es acta notarial*

**Observaciones oficiales:**
- El nombre del proyecto debe venir igual en todos los documentos
- Todos los planos firmados, sellados y timbrados, con constancia de colegiado activo

**Mecánica en plataforma (VAC07):**
- En el Formulario Consolidado se ingresa altura y cota **del edificio más alto** como referencia general
- En el expediente DGAC se llena aparte la sección **"Información de Torres"**, por cada torre, y debe coincidir con el Formulario de Solicitud de Alturas
- Latitud y longitud llevan la letra de dirección al final (N, S, E, O); coordenada **central** de cada torre
- Todos los campos son obligatorios
- **Un formulario DGAC y un pago por cada torre o edificio**

Fuente: VAC04, VAC07 · https://www.dgac.gob.gt/wp-content/uploads/2022/08/Requisitos-para-Edificios-Torres-y-Vallas-Publicitarias.pdf

---

## MSPAS — el árbol real

> ⚠️ **La corrección más importante.** No son 2 ramas, son **una base + 9 paquetes condicionales**, y el eje que faltaba es **sistema nuevo vs. conexión a sistema existente**.

### Base — siempre que aplique MSPAS
1. Formulario de Solicitud **FS-001-2022** (firma/huella y datos deben coincidir en toda la documentación)
2. DPI vigente del solicitante (extranjeros: pasaporte, hojas de identificación)
3. Documentos que acrediten la calidad con que actúa (representación legal e inscripción; representación de menores/incapaces/ausentes; autoridades municipales: acta de toma de posesión; Consejos de Desarrollo: documento idóneo)
4. **Información catastral del polígono, emitida por la municipalidad respectiva** ← el único punto donde lo municipal entra al VAC
5. *Si el solicitante es Corporación Municipal o Consejo de Desarrollo* → certificación del punto de acta del Concejo Municipal aprobando el proyecto
6. Plano de localización con coordenadas geográficas, identificando calles, avenidas, colindancias, puntos de conexión de alcantarillado pluvial y sanitario, descargas, cuerpos receptores y fuentes de abastecimiento cercanas — **formato ≥ A4**
7. Plano de ubicación: polígono, área total, áreas de construcción, áreas libres y sus materiales — **formato ≥ A4**
8. Planos topográficos con curvas de nivel — **formato A1**
9. Memoria descriptiva detallada de las obras
10. Constancias vigentes de colegiado activo **en original**, de diseñadores y de quienes realicen estudios técnicos
11. Pronunciamientos de responsabilidad profesional — Norma Técnica **DRPSA-011-2022**, formato del sitio del MSPAS
12. Pago de arancel **código AA-011** (Acuerdo Gubernativo 53-2022), cuando aplique

### Paquetes condicionales

| # | Disparador | Documentos adicionales |
|---|---|---|
| 1 | Incluye **abastecimiento de agua para consumo humano** | planos de planta general (A1, con captación/tratamiento/almacenamiento/distribución); planos de elevaciones y secciones (A1); memorias de cálculo (crecimiento poblacional, dotación, factores de diseño); manual de operación; manual de mantenimiento |
| 2 | Usa un **sistema nuevo** de abastecimiento, o al menos **una fuente nueva** | Certificado de calidad del agua (AG 178-2009). **Si la fuente es pozo:** el certificado se presenta después de perforar, dentro del plazo del AG 178-2009. **Si no se presenta en plazo, el dictamen sanitario favorable se anula.** El compromiso queda en la sección IV del FS-001-2022 |
| 3 | **Conexión a abastecimiento existente** | constancia del abastecedor garantizando dotación y continuidad; informes de caracterización física, química y microbiológica según el "programa de análisis mínimo" de **COGUANOR NTG 29001** |
| 4 | Obras hidrosanitarias de **aguas pluviales** (construcción, reparación o modificación de alcantarillado pluvial) | planos de planta general (A1: captación, conducción, descarga); planos de elevaciones y secciones (A1); memorias de cálculo con **referencias pluviométricas comprobables**; manual de operación; manual de mantenimiento; *si usa pozos de absorción* → informes de infiltración/permeabilidad |
| 5 | **Conexión a alcantarillado pluvial existente** | constancia del proveedor garantizando cumplimiento de normas |
| 6 | Obras hidrosanitarias de **aguas residuales** (alcantarillado sanitario) | planos de planta general (A1: conexiones, conducción, estructuras sanitarias accesorias); planos de elevaciones y secciones (A1); memorias de cálculo (caudales promedio y máximo horario); manual de operación; manual de mantenimiento |
| 7 | **Conexión a alcantarillado sanitario existente** | constancia del proveedor garantizando cumplimiento de normas |
| 8 | Obras hidrosanitarias de **tratamiento de aguas residuales** (PTAR) | planos de planta general (A1: captación, conducción, medición de caudal, tratamiento, descarga); planos de elevaciones y secciones (A1); **informe de caracterización de afluentes** (16 parámetros); **informe de estimación de efluentes** (mismos parámetros); memorias de cálculo; manual de operación; manual de mantenimiento; *si usa pozos de absorción* → informes de infiltración/permeabilidad |
| 9 | **Conexión a PTAR existente** | informe técnico descriptivo de la planta, con detalle suficiente para determinar si soporta el caudal y la carga contaminante |

**Parámetros de caracterización (paquete 8)** — temperatura, pH, oxígeno disuelto, sólidos sedimentables, sólidos suspendidos totales, sólidos disueltos totales, sólidos totales, material flotante, color aparente, grasas y aceites, DQO, DBO₅, nitrógeno total, fósforo total, grupo coliforme total.

La caracterización de afluentes admite **estimación** solo si se cumplen las tres condiciones: aún no se generan las aguas residuales, el diseñador se basó en fuentes confiables y reconocidas, y aplicó ajustes para mitigar el error de la estimación.

**Reglas transversales:** planos legibles, acotados, con escala especificada. Planos, informes, memorias y pronunciamientos avalados por profesional colegiado activo con firma, sello y timbre.

Fuente: VAC04 · https://www.mspas.gob.gt/descargas-mspas/download/505-requisitos-urbanizacion/2742-drpsa-011-2022-requisitos

---

## MARN — licencia ambiental

**Categorías:** A, B1, B2 — se elige junto con el asesor que elabora el Instrumento Ambiental, según el tamaño del proyecto y el listado taxativo del MARN.

1. **Instrumento ambiental** (y todos los documentos requeridos dentro de él)
2. Fotografías MARN — archivo individual
3. **Edicto publicado** — archivo individual — ⚠️ **solo categorías A y B1** *(condicional nuevo: B2 queda exento)*
4. Planos arquitectónicos — archivo individual
5. Plano de ubicación — archivo individual
6. Plano de localización — archivo individual
7. Certificación de propiedad o documento equivalente
8. DPI del proponente
9. RTU actualizado
10. Nombramiento de representante legal
11. Constancia de colegiado y licencia de consultor ambiental

### Flujo post-resolución (VAC09)

Esto ocurre **después** de la resolución y es donde hay un plazo duro:

1. "Generar Solicitud de Licencia" → elegir **Primera Licencia** si el proyecto es nuevo
2. Consignar No. de Resolución (formato `0XXXX-202X/DIGARN/XXX/xxxx`) y fecha, tal como aparecen
3. Enmiendas solo si existe resolución de enmienda previa
4. Elegir años a pagar: **1 a 5**
5. "Confirmar Reporte" → el archivo se aloja en Documentos Adjuntos → imprimir, firmar y sellar
6. Volver a subir con el mismo nombre: **"Solicitud de Licencia MARN"** → "Aprobar"
7. Delegado MARN genera **Boleta de Pago** → **⏱ 72 horas para pagar antes de que la boleta se venza**
8. Subir "Recibo de pago Licencia" → Aprobar
9. Delegado genera licencia → firma del Director de Gestión Ambiental → estado **Finalizado**
10. Resolución y Licencia firmadas quedan en "Resultados" del expediente MARN

Fuente: VAC04, VAC09 · https://www.marn.gob.gt/viceministro-de-ambiente/digarn/ventanilla-ambiental-2/

---

## Disparadores capturados en el propio formulario

VAC02 v2 aclara qué preguntas del Formulario Consolidado alimentan a qué institución. Estas son las que el motor de requisitos debe hacer:

| Campo del formulario | Alimenta a |
|---|---|
| Niveles / altura del edificio / cota de banqueta | DGAC |
| Tipo de proyecto según listado taxativo ambiental | MARN |
| Adyacencia a sitio cultural o arqueológico; tipo de obra; afectación al paisaje | Ministerio de Cultura y Deportes (IDAEH) |
| Nombre del sitio arqueológico y época | IDAEH |
| ¿Genera aguas pluviales? ¿Afecta la salud humana circunvecina? ¿Almacena agua, combustible, lubricantes u otros? ¿Tiene impacto social? | **MSPAS** |
| Cercanía a área de bosque | INAB — *"se vinculará a VAC posteriormente"*, **hoy fuera de la plataforma** |
| 4 coordenadas (Decimal, Sexagesimal, GTM o UTM — mismo formato las 4) | CONAP emite el mapa; el resto consulta |
| Actividades colindantes (N, S, E, O) | replicado |
| Área total del terreno y de construcción (m²), monto de inversión, número de empleos | estadística VAC |
| Varias torres | plano de conjunto + un expediente DGAC por torre |
| Quien presenta no es el propietario | figura **Arrendatario** |

---

## Estados del expediente

Al aprobarse el Formulario Consolidado, **la plataforma genera un expediente por institución**. Se consultan con el botón **"Avance"**, y cada uno se abre con **"Abrir Formulario"**.

Estado conocido y documentado: **`Corrección Revisión Expediente`** — se muestra en **rojo**, y es el único estado en el que se pueden modificar documentos.

### Flujo de corrección (VAC05)

1. Ubicar el proyecto → **"Avance"**
2. Ubicar la institución → **"Abrir Formulario"** (solo habilitado en estado `Corrección Revisión Expediente`)
3. Ir a **"Archivos Adjuntos"**
   - **"+Agregar Documentos"** para documentos nuevos
   - **"Cambiar"** para reemplazar uno ya cargado
4. **"Aprobar"** arriba del formulario → cierra la corrección y devuelve el expediente al delegado

> **Fricción documentada:** solo la **documentación** es modificable. Cualquier otro dato del formulario **solo lo cambia Administración VAC por correo electrónico**. Y no se puede corregir nada hasta que el expediente entre en estado `Corrección Revisión Expediente`.

Estas dos reglas son, textualmente, el caso de negocio del módulo 3: un dato mal escrito al inicio cuesta un correo y una espera.

### Reportes por proyecto
- **Icono azul** → documentos resultantes de todos los procesos
- **Icono rojo** → descarga la **contraseña del proyecto** con el registro de las instituciones a las que se presentó
- **Icono impresora** → resumen del Formulario Consolidado en PDF

---

## Cómo se validó

**No se validó dentro de app.vac.com.gt.** La plataforma requiere cuenta registrada; no se creó ninguna ni se ingresaron credenciales.

Se validó contra los **instructivos oficiales publicados por la VAC**, en particular **VAC04 "Instructivo Requisitos Instituciones"**, que es el documento normativo que lista requisitos por institución. Para efectos de construir un motor de reglas esto es mejor fuente que la UI: VAC04 cita la normativa de origen de cada institución (NRD2, DRPSA-011-2022, AG 178-2009, COGUANOR NTG 29001, AG 53-2022).

**Para cerrar la validación en la plataforma hace falta una cuenta VAC.** Con acceso, lo que falta comprobar es: qué campos son obligatorios en pantalla, qué instituciones se activan automáticamente según las respuestas, y si existe API.

## Qué quedó sin validar

**VAC04 solo documenta 4 instituciones:** CONRED, DGAC, MSPAS y MARN.

El Anexo I de VAC02 contiene documentos de instituciones que VAC04 no cubre:

| Institución | Documentos en Anexo I | Requisitos en VAC04 |
|---|---|---|
| CONAP | Boleta de pago de solicitud de ubicación, coordenadas del terreno | ❌ ninguno |
| IDAEH / Cultura | Carta autorización gestor, certificación bienes inmuebles, formulario solicitud, memoria descriptiva | ❌ ninguno |
| MEM | Formularios ALE-01 y ALE-11, planos de detalles técnicos / instalaciones / seguridad industrial, título de propiedad inscrito en RGP | ❌ ninguno |
| INAB | Plan de aprovechamiento forestal | ❌ — VAC02 dice que se vinculará después |

La comunicación pública de la VAC habla de **9 instituciones**; los instructivos documentan requisitos de 4. Esa brecha es, por sí sola, evidencia del problema que ataca Buildhaton.

**Además falta confirmar:** el umbral de 16 m de DGAC (alcance nacional vs. Departamento de Guatemala) y si existe API de consulta de estado.
