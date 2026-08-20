# Prompt para generar la presentación

Pegá todo lo que sigue (desde la línea punteada) en Claude, junto con las imágenes de
`capturas/`. Está escrito para producir un deck listo para exponer.

---

Necesito una presentación para un buildathon. El proyecto se llama **Cimiento** y ataca
el licenciamiento de construcción en Guatemala. Ya está construido y funcionando: no es una
idea, es una demo con datos normativos reales scrapeados de fuentes oficiales.

Hacé un deck de **10 a 12 láminas**, en español de Guatemala, para exponer en 5 minutos ante
un jurado que **no conoce el trámite de construcción**. Tiene que entenderse sin contexto previo.

## El problema

Sacar un permiso de construcción depende de experiencia no escrita. Quién sabe qué te van a
pedir es un arquitecto o contratista con años de oficio, y cuando el proyecto termina, esa
experiencia se va con él. No queda bitácora de por qué te rechazaron.

Tres datos duros que sostienen esto:

1. **96 documentos** posibles en el Anexo I del Formulario Consolidado VAC02. A un proyecto
   le aplican unos 25. Saber cuáles es exactamente el conocimiento que no está escrito.
2. **El Reglamento de Construcción de la capital es de 1970.** El de Urbanizaciones, de 1960.
   El de Drenajes, de 1964. Y solo en 2026 van ocho acuerdos municipales nuevos — el de
   Impacto Vial cambió en agosto de 2026.
3. **Las guías admiten por escrito que la lista no es la lista.** La capital: *"Se podrán
   requerir aquellos requisitos adicionales que se consideren necesarios… según sea el caso."*
   Santa Catarina Pinula: *"Otros requisitos que a criterio de la Dirección tengan una
   justificación técnica."* Dos municipalidades independientes, misma cláusula.

## Lo que ya existe y no hay que reinventar

La **Ventanilla Ágil de la Construcción (VAC)** ya consolidó las instituciones de gobierno
central: MARN, CONAP, CONRED, DGAC, MSPAS, IDAEH y MEM en un solo formulario. Eso está hecho.

**Lo que no está resuelto:** saber qué te aplica antes de empezar, la capa municipal, y la
memoria de rechazos. Ahí entra Cimiento. Es importante que el deck deje claro que
construimos **sobre** la VAC, no contra ella — si no, el jurado pregunta por qué no usan la VAC.

## Por qué lo municipal es el problema difícil

Los municipios tienen autonomía en ordenamiento territorial. Por eso la VAC pudo unificar lo
ministerial (uniforme) y no lo municipal (variable).

**La evidencia, y es la lámina más fuerte del deck.** El mismo proyecto — 450 m², 20 m de
altura, pozo, en condominio — evaluado en dos municipios vecinos:

|                    | Guatemala capital | Santa Catarina Pinula |
|--------------------|-------------------|-----------------------|
| Reglas que aplican | 11                | 8                     |
| Documentos         | 39                | 34                    |
| Ministeriales      | 3 (idénticas)     | 3 (idénticas)         |
| Municipales        | 8                 | 5                     |
| Reglas en común    | **cero**          | **cero**              |

La capa ministerial sale idéntica. La municipal **no comparte una sola regla**.

Diferencias concretas del mismo documento:
- Certificación del Registro de la Propiedad: **6 meses** de vigencia en la capital, **3 meses** en Pinula
- Planos digitales: las dos piden **DWG**, pero la capital exige **versión 2007** y Pinula no especifica versión
- Clasificación de obra: la capital por m² (30 / 200 / 700), Pinula por categoría (menor / mayor / gran magnitud)

**Y un requisito que no es un documento:** Pinula exige **carta de la asociación de vecinos**
manifestando que no tiene dificultad con la obra, y que los planos vengan sellados por ellos.
Es una negociación con los vecinos, y pueden negarse. **No existe nada equivalente en la capital.**
Ese detalle vende el producto solo: ninguna herramienta genérica modela eso.

## La solución: tres módulos sobre un mismo expediente

1. **Motor de requisitos** — contestás preguntas del proyecto y sale *tu* lista: cuáles de los
   96 aplican, qué institución los pide, y qué debés tener resuelto antes de abrir el VAC02.
   **Construido y funcionando.**
2. **Expediente con trazabilidad** — estado por institución. Cada una aprueba, corrige o
   rechaza por separado y hoy no hay vista única. *Parcial.*
3. **Bitácora de fallas** — memoria de rechazos por institución y municipalidad. Lo que hoy se
   va con el contratista. *Pendiente.*

## Lo que está construido, con números

- **35 reglas** en 3 jurisdicciones: 11 ministeriales, 16 de la capital, 8 de Pinula
- **13 PDFs oficiales** scrapeados como fuente, versionados en el repo
- **107 cuerpos normativos / 420 archivos** indexados con número de acuerdo y fecha
- Stack: motor de reglas en Python (reglas como datos, no como código) → API Flask → React + TypeScript
- **6 de las 35 reglas están marcadas "sin confirmar"** y se muestran igual, marcadas, en vez de omitirlas

## Decisiones de producto que conviene destacar

- **Las reglas son datos, no código.** Quien mantiene normativa municipal no escribe Python.
- **Lo incierto se marca, no se esconde.** Un requisito marcado vale más que uno ausente, y
  mucho más que uno presentado como cierto sin serlo.
- **Lo que no se resuelve con papel se señala aparte.** La carta de vecinos lleva su propia
  etiqueta: no es un archivo que subís.
- **El sistema admite que la lista puede crecer**, porque las municipalidades lo dicen por escrito.
  Fingir completitud sería mentir.

## Capturas disponibles (en `capturas/`)

| Archivo | Qué muestra | Sugerencia de uso |
|---|---|---|
| `01-dashboard-resumen.jpg` | Métricas agregadas: 119 requisitos exigidos, 46 pendientes, 7 instituciones, carga por institución | Lámina de "así se ve" |
| `02-proyectos-tabla.jpg` | Cartera con denominadores distintos por proyecto: 34/48, 11/26, 28/39, 0/6 | Apoyo del argumento "no es un número fijo" |
| `03-ficha-requisitos-mspas.jpg` | Requisitos agrupados por institución | Detalle del módulo 1 |
| `04-ficha-carta-vecinos.jpg` | **La mejor.** Carta de vecinos marcada "No es un documento", regla de los 100 m del pozo, y la cláusula de discrecionalidad | Lámina del remate |
| `05-ficha-vac-id-link.jpg` | Pestaña VAC con ID y link para la extensión | Cómo se conecta con la VAC |
| `06-usuarios.jpg` | Los 5 roles que el VAC02 exige por expediente | Opcional |
| `07-nuevo-proyecto.jpg` | Alta con datos de empresa prellenados | Opcional |
| `08-ficha-torres-cayala.jpg` | Proyecto de la capital: CONRED, 34/48 | Comparar contra la 04 |
| `09-wizard-vac02.jpg` | Wizard de las 8 pantallas del VAC02 | Opcional |

Datos crudos por si querés generar gráficas: `datos-comparativo.json` y `datos-cifras.json`.

## Estilo

- Sobrio y técnico. **Sin degradados.** Un solo color de acento (teal `#0F766E`), tinta casi
  negra `#18181B`, fondo hueso `#FBFBF9`, hairlines `#E4E4E7`.
- Tipografía IBM Plex Sans; IBM Plex Mono para cifras y códigos.
- Los números grandes son el protagonista: 96, 1970, cero reglas en común.
- Nada de stock photos ni iconos decorativos. Si hay ícono, que sea Lucide y que signifique algo.
- Una idea por lámina. Si una lámina necesita párrafo, está mal.

## Arco narrativo sugerido

1. Portada
2. El problema, en una frase: *"para sacar un permiso necesitás a alguien que ya sepa"*
3. Los 96 documentos
4. El reglamento de 1970 + los 8 acuerdos de 2026
5. Lo que la VAC ya resolvió, y lo que no
6. **El contraste: mismo proyecto, dos municipios, cero reglas en común**
7. **La carta de los vecinos** — el requisito que no es un documento
8. La solución: 3 módulos
9. Demo: el panel (capturas 01, 02, 04)
10. Lo construido: 35 reglas, 13 PDFs, 107 cuerpos normativos
11. Qué sigue: bitácora de rechazos, más municipios
12. Cierre

Las láminas 6 y 7 son el corazón. Si hay que recortar, recortá de las otras.
