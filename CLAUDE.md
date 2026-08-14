# Contexto para agentes

Buildhaton ataca el licenciamiento de construcción en Guatemala. Lee esto antes de tocar nada — hay hallazgos que contradicen lo que asumirías por sentido común, y hay datos marcados como no verificados que **no debes tratar como ciertos**.

## Qué es el proyecto

Tres módulos sobre un mismo expediente:

1. **Motor de requisitos** — de 96 documentos posibles, cuáles te aplican. Implementado en `motor/`.
2. **Expediente con trazabilidad** — estado por institución. No implementado.
3. **Bitácora de fallas** — memoria de rechazos. No implementado.

El [README](README.md) tiene el planteamiento completo.

## Los cuatro hechos que cambian el análisis

**1. La VAC ya consolidó los ministerios.** La Ventanilla Ágil de la Construcción unifica MARN, CONAP, CONRED, DGAC, MSPAS, IDAEH y MEM en un solo formulario (VAC02). Si propones "consolidar las instituciones", estás proponiendo algo que ya existe. El valor está en la condicionalidad, la capa municipal y la memoria.

**2. Lo municipal es la mitad no resuelta, y es donde está la variabilidad.** Los municipios tienen autonomía en ordenamiento territorial. Por eso la VAC pudo unificar lo ministerial (uniforme) y no lo municipal. El único rastro municipal dentro del VAC02 es la certificación catastral.

**3. La costura entre capas tiene una válvula de escape poco conocida.** La municipalidad exige la resolución del MARN como entrada. Pero si el trámite MARN no ha concluido, se puede ingresar el expediente municipal con **acta de declaración jurada** + copia de recepción de la solicitud ante MARN. Permite paralelizar. Fuente: Guía 09-F.

**4. La guía municipal admite que la lista no es la lista.** Textual: *"Se podrán requerir aquellos requisitos adicionales que se consideren necesarios para la autorización de la solicitud, según sea el caso."* Esa discrecionalidad es el problema que el proyecto ataca, y es la razón de ser del módulo 3.

## Mapa de documentación

| Archivo | Contenido |
|---|---|
| [`docs/matriz-requisitos.md`](docs/matriz-requisitos.md) | Requisitos ministeriales por institución + disparadores. Validado contra VAC04. |
| [`docs/municipal-guatemala.md`](docs/municipal-guatemala.md) | Capa municipal (Muniguate): Guía 09-F y Guía 00-F/01-F, umbrales, documentos exclusivos, costura VAC↔muni. |
| [`docs/vac02.md`](docs/vac02.md) | Estructura del Formulario Consolidado, 8 pantallas, catálogo de 96 documentos. |
| [`docs/fuentes/`](docs/fuentes/) | PDFs originales. Toda afirmación en los .md debe poder rastrearse aquí. |
| [`motor/`](motor/) | Motor de requisitos: reglas como datos + ~40 líneas de filtro. |

## Nivel de confianza de los datos

Esto importa más que ninguna otra sección.

### ✅ Verificado contra instructivos oficiales
Todo lo que cita **VAC04** (`docs/fuentes/VAC04_requisitos_b.pdf`) — requisitos de CONRED, DGAC, MSPAS y MARN. VAC04 a su vez cita la normativa de origen: NRD2, DRPSA-011-2022, AG 178-2009, COGUANOR NTG 29001, AG 53-2022.

### ⚠️ De fuente secundaria
La **Guía 09-F municipal** salió de un mirror privado (approvato.com.gt), no del portal oficial, y es de **2019**. Los umbrales y montos (Q350, 200 m², 700 m², 10 m³) pueden estar desactualizados. **Confirmar antes de usarlos en producción.**

### ❌ No verificado — no lo trates como cierto
- **El umbral de 16 m de DGAC.** Aparece solo en VAC02, no se repite en VAC04, y el texto dice *"especialmente en el Departamento de Guatemala"* — ambiguo si es nacional o departamental. En `reglas.json` está marcado `"confianza": "SIN_CONFIRMAR"`. **No le quites esa marca sin una fuente.**
- **CONAP, IDAEH, MEM e INAB.** Tienen documentos en el Anexo I del VAC02 pero **cero requisitos publicados en VAC04**. No hay base para escribir reglas de estas instituciones todavía.
- **Nada se validó dentro de `app.vac.com.gt`.** La plataforma requiere cuenta. No se creó ninguna ni se ingresaron credenciales.

## Errores ya cometidos y corregidos

No los repitas:

| Error | Realidad |
|---|---|
| CONRED aplica siempre | Solo a edificaciones de **uso público** |
| CONAP aplica siempre | Sin requisitos publicados; no hay base |
| MSPAS tiene 2 ramas | Tiene **base + 9 paquetes**, y el eje que faltaba es **obra nueva vs. conexión a sistema existente** |
| Edicto MARN siempre | Solo categorías **A y B1**; B2 exento |
| "Carta" de señalización DGAC | Es **acta notarial** |
| El formulario municipal es único | Hay **dos formularios distintos**: F08 (Guía 09-F, vivienda ≤ 700 m²) y F02 v3 (Guía 00-F, todos los demás proyectos) |
| DGAC tiene un solo disparador | Tiene **dos**: altura > 16 m Y estar dentro del cono de aproximación de La Aurora (geográfico) |

## Fuentes y accesibilidad

| Fuente | Estado |
|---|---|
| `vac.com.gt` | ✅ accesible con User-Agent de navegador (urllib funciona; WebFetch da 403) |
| `approvato.com.gt` | ✅ accesible — fuente de Guía 09-F y Guía 00-F/01-F |
| `vu.muniguate.com` | ❌ **403 a todo cliente automatizado** |
| `muniguate.com` | ❌ **403** |
| `asisehace.gt` | ❌ redirige a pronacom.org — catálogo nacional de trámites fuera de línea |
| `app.vac.com.gt` | 🔒 requiere cuenta registrada |

**Para avanzar en lo municipal hace falta un navegador real.** No gastes intentos re-scrapeando muniguate: ya se intentó por tres vías distintas.

## PDFs locales disponibles

| Archivo | Código | Contenido |
|---|---|---|
| `docs/fuentes/VAC01_usuarios_nuevos.pdf` | VAC01 | Registro de usuarios nuevos en la plataforma |
| `docs/fuentes/VAC02_v1_llenado.pdf` | VAC02 v1 | Llenado del Formulario Consolidado (versión 1) |
| `docs/fuentes/VAC02_v2_llenado.pdf` | VAC02 v2 | Llenado del Formulario Consolidado (versión 2, más completa) |
| `docs/fuentes/VAC04_requisitos_a.pdf` | VAC04 parte a | Requisitos por institución (primeras páginas) |
| `docs/fuentes/VAC04_requisitos_b.pdf` | VAC04 parte b | Requisitos por institución (MSPAS completo, MARN, CONRED, DGAC) |
| `docs/fuentes/VAC05_correcciones.pdf` | VAC05 | Procedimiento de correcciones en la plataforma |
| `docs/fuentes/VAC07_dgac.pdf` | VAC07 | Procedimiento específico DGAC |
| `docs/fuentes/VAC09_lic_ambiental.pdf` | VAC09 | Obtención de Licencia Ambiental MARN |
| `docs/fuentes/MUNIGUATE_guia_09F.pdf` | PTLI.23 v2 | Guía 09-F — Ventanilla Única Municipal (vivienda ≤ 700 m²) |
| `docs/fuentes/MUNIGUATE_guia_00F_01F.pdf` | PLTI.01/02 v2 | Guía 00-F/01-F — Guía General de la Ventanilla Única (todos los proyectos) |

## Trabajo pendiente

**Datos**
- Guía 04 (medio ambiente municipal — cortes de árboles < 10 m³), formulario F08 vigente y F02 v3 vigente, tabla de costos municipal
- Las "guías por dependencia" que la 09-F y 00-F mencionan: EMPAGUA, DPD-DMA, VUCH, Bomberos
- Una segunda municipalidad para contrastar — **Santa Catarina Pinula** es el caso que motiva el proyecto
- Confirmar el umbral DGAC en VAC04 (actualmente en dos fuentes: VAC02 + Guía 00-F, pero ninguna es VAC04)
- Confirmar el cono de aproximación La Aurora (límites geográficos exactos)
- Confirmar disparador exacto de NRD-1 (acta en VUM) y NRD-3
- Requisitos de CONAP, IDAEH, MEM, INAB

**Preguntas abiertas que cambian el producto**
- **¿La VAC tiene API?** Define si el módulo 2 sincroniza estado real o solo lo registra en paralelo. Es la pregunta de mayor impacto.
- ¿El código de trazabilidad municipal es consultable, o solo en ventanilla?
- ¿Quién carga la bitácora — el contratista, o se extrae de las resoluciones de rechazo?
- ¿Usuario final: constructora, arquitecto independiente, o municipalidad?

## Convenciones

- **Documentación en español.** Es el idioma del dominio y de los usuarios.
- **Toda afirmación normativa lleva su fuente.** Las reglas en `reglas.json` tienen campos `fuente` y `confianza`; los .md citan el instructivo y el numeral.
- **Las reglas son datos, no código.** Quien mantiene normativa municipal no escribe Python. Si agregas lógica, que sea al evaluador genérico, no reglas hardcodeadas.
- **Marca lo incierto en vez de omitirlo.** Un requisito con `"confianza": "SIN_CONFIRMAR"` vale más que ninguno; uno presentado como cierto sin serlo vale menos que nada.
- `python motor/motor.py` corre el self-check. Si tocas `reglas.json` o `motor.py`, que siga verde.

## Plazos duros ya identificados

Para cuando se construya el módulo 2:

- **72 horas** para pagar la boleta de licencia MARN antes de que venza (VAC09)
- Certificado de calidad de agua de pozo: si no se presenta en el plazo del AG 178-2009 tras la perforación, **el dictamen sanitario favorable se anula** (VAC04)
- Solvencia municipal: vigencia **2 meses**
- Certificación del Registro General de la Propiedad: emitida en los últimos **6 meses**

## Fricción documentada (casos de negocio)

- **VAC05:** en un expediente en corrección solo se pueden cambiar **documentos**. Cualquier otro dato del formulario lo modifica Administración VAC **por correo electrónico**. Un dato mal escrito al inicio cuesta un correo y una espera.
- **VAC07:** proyectos de varias torres requieren **un formulario DGAC y un pago por cada torre**.
- **Guía 09-F:** el expediente municipal es **físico** — fólder color claro tamaño oficio con gancho, sin borrones ni corrector, CD en sobre pegado a hoja de papel bond, planos en CAD versión 2007.
