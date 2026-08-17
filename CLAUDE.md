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

**4. Las guías municipales admiten que la lista no es la lista.** La capital: *"Se podrán requerir aquellos requisitos adicionales que se consideren necesarios… según sea el caso."* Santa Catarina Pinula: *"Otros requisitos que a criterio de la Dirección tengan una justificación técnica."* Dos municipalidades independientes, misma cláusula. Ningún motor de reglas cierra esa brecha — solo el historial de qué pidieron de verdad, que es el módulo 3.

**5. Las dos municipalidades ni siquiera clasifican las obras igual.** La capital usa metros cuadrados (30 / 200 / 700); Pinula usa categorías cualitativas (menor / mayor / gran magnitud). Y coinciden en documentos con parámetros distintos: la certificación registral vale **6 meses** en la capital y **3 meses** en Pinula. La jurisdicción no es un filtro sobre un trámite genérico, es un eje. Detalle completo en [`docs/comparativa-municipal.md`](docs/comparativa-municipal.md).

## Mapa de documentación

| Archivo | Contenido |
|---|---|
| [`docs/comparativa-municipal.md`](docs/comparativa-municipal.md) | **Capital vs. Santa Catarina Pinula.** La evidencia de la tesis. Empieza por aquí si necesitas convencer a alguien. |
| [`docs/matriz-requisitos.md`](docs/matriz-requisitos.md) | Requisitos ministeriales por institución + disparadores. Validado contra VAC04. |
| [`docs/municipal-guatemala.md`](docs/municipal-guatemala.md) | Capa municipal (Muniguate): Guía 09-F y Guía 00-F/01-F, umbrales, documentos exclusivos, costura VAC↔muni. |
| [`docs/buenas-practicas-vum.md`](docs/buenas-practicas-vum.md) | **Presentación oficial VUM:** citas, causas de rechazo, esquema POT, PDUM Antigua Pedrera, NRD completo, hallazgos MARN 2025-2026. |
| [`docs/normativa-muniguate.md`](docs/normativa-muniguate.md) | Índice de 107 cuerpos normativos / 420 archivos con acuerdo y fecha. La lista de vigilancia. |
| [`docs/vac02.md`](docs/vac02.md) | Estructura del Formulario Consolidado, 8 pantallas, catálogo de 96 documentos. |
| [`docs/fuentes/`](docs/fuentes/) | PDFs originales. Toda afirmación en los .md debe poder rastrearse aquí. |
| [`motor/`](motor/) | Motor de requisitos: reglas como datos + ~55 líneas de filtro. |

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
| `vac.com.gt` | ✅ urllib con User-Agent de navegador (WebFetch da 403) |
| `scp.gob.gt` | ✅ urllib con User-Agent — Santa Catarina Pinula |
| `approvato.com.gt` | ✅ accesible — fuente de Guía 09-F y Guía 00-F/01-F |
| `vu.muniguate.com` | ⚠️ **403 a todo cliente automatizado.** Solo con navegador real (Claude in Chrome) |
| `muniguate.com` | ❌ 403 |
| `asisehace.gt` | ❌ redirige a pronacom.org — catálogo nacional fuera de línea |
| `app.vac.com.gt` | 🔒 requiere cuenta registrada |

**Cómo se raspó vu.muniguate.com.** No tiene API: el contenido está renderizado en el DOM dentro de acordeones Bootstrap colapsados. Se extrae leyendo `.accordion-header` + el panel `#regCollapseNNN` con `javascript_tool`, sin necesidad de hacer clic. Los formularios (F02–F14) sí se descargan por botón JS y no tienen URL estable.

No gastes intentos con urllib/WebFetch sobre muniguate: ya se intentó por tres vías y todas dan 403.

## Datos operativos de la VUM confirmados por presentación oficial

- **Email para citas:** `vu.attvec@gmail.com` — indicar tipo (vivienda/edificio/comercio), cantidad de expedientes y nombre + teléfono de quien se presenta
- **Gracia en cita:** 15 minutos máximo de espera; si no se presenta, reprogramar
- **NRD1 en VUM:** El acta debe incluir **conclusiones y recomendaciones de la memoria de cálculo estructural** — el acta vacía no pasa
- **POT tiene 4 reglamentos complementarios:** DDE (estacionamientos), Incentivos, IV (Impacto Vial — agregó Art. 25 ter), VP (Vivienda Prioritaria)
- **PDUM Antigua Pedrera (COM-20-2023):** Plan suplementario para 23 ha, 4 sectores. Sectores CAP-1/CAP-2 hasta 64 m; Interior A/B hasta 48 m. IE máx. 8.7 / 5.7. APAUP 10% del predio en todos. Frente mínimo 15 m, superficie mínima 450 m².
- **4ª entidad jurídica del inmueble:** además de RGP, RIC y la VUM/POT, existe **DICABI** (Dirección de Catastro y Avalúo de Bienes) — toda partición/desmembración debe avisarse a DICABI
- **Causas de rechazo más comunes en VUM:** dependencias no coinciden con DCT, póliza incompleta, planos (áreas/cotas/memoria), acta NRD1 sin cálculo estructural, estacionamientos, incentivos
- **MARN 2025-2026:** Requisitos exigidos fuera de TdR confirmados (listado de personal, fórmula de evaporación, estudios imposibles). Frase clave: *"El patrón no es la exigencia. Es la falta de certeza sobre qué se va a exigir."*

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
| `docs/fuentes/MUNIGUATE_VUM_buenas_practicas.pdf` | — | Presentación oficial VUM: buenas prácticas, citas, causas de rechazo, POT, NRD, casos MARN 2025-2026 |

## Trabajo pendiente

**Datos**
- Leer el **POT** (11 archivos, COM-008-2026) y el **Reglamento de Construcción** (COM-004-2024) y sacarles reglas. Están indexados en `normativa-muniguate.md` pero nadie los ha leído.
- Guía 04 (medio ambiente municipal — cortes de árboles < 10 m³), formulario F08 vigente y F02 v3 vigente, tabla de costos municipal — descarga por botón JS, hace falta navegador
- Las "guías por dependencia" que la 09-F y 00-F mencionan: EMPAGUA, DPD-DMA, VUCH, Bomberos
- **Revisar CONRED contra la NRD-2 vigente.** Cambió el 22/12/2025 (Acuerdo CN-3-2025) y VAC04 la cita sin versión. Las reglas `conred-*` pueden estar desactualizadas.
- Confirmar el umbral DGAC en VAC04 (actualmente en dos fuentes: VAC02 + Guía 00-F, pero ninguna es VAC04)
- Confirmar el cono de aproximación La Aurora (límites geográficos exactos)
- Confirmar disparador exacto de NRD-1 (acta en VUM) y NRD-3
- Requisitos de CONAP, IDAEH, MEM, INAB
- Resolver la discrepancia de SCP: la guía de obra mayor cita AG **137-2016** para el instrumento ambiental y la de obra menor cita AG **61-2015**

**Preguntas abiertas que cambian el producto**
- **¿La VAC tiene API?** Define si el módulo 2 sincroniza estado real o solo lo registra en paralelo. Es la pregunta de mayor impacto.
- ¿El código de trazabilidad municipal es consultable, o solo en ventanilla?
- ¿Quién carga la bitácora — el contratista, o se extrae de las resoluciones de rechazo?
- ¿Usuario final: constructora, arquitecto independiente, o municipalidad?

## Cómo están conectadas las piezas

```
frontend/src/components/VacWizard.tsx   wizard de las 8 pantallas del VAC02
        ↓ data (camelCase, "Sí"/"No", strings)
frontend/src/lib/motor.ts               TRADUCTOR + cliente HTTP
        ↓ proyecto (snake_case, tipado)
api-server/app.py                       POST /api/validate
        ↓
motor/motor.py + reglas.json            35 reglas, 3 jurisdicciones
```

`frontend/src/lib/motor.ts` es la pieza clave y la más fácil de romper: el wizard usa
nombres del VAC02 y el motor usa los suyos. **Si agregás un campo al motor, agregalo al
traductor o quedará siempre vacío y la regla nunca disparará.**

### El hallazgo que justifica el producto, en código

El VAC02 captura 79 campos y **aun así le faltan 15** para saber qué pide una
municipalidad. Están enumerados en `FALTANTES` dentro de `motor.ts`; 13 de los 15 son
municipales. Por eso el panel los pregunta aparte, y por eso el wizard solo no alcanza.

Ejemplos de lo que el Formulario Consolidado nunca pregunta: en qué municipalidad se
tramita, si el terreno está en Centro Histórico, si el polígono es irregular, cuántos m³
de árboles se cortan, si está dentro de un residencial (que en Pinula obliga a la carta
de la asociación de vecinos).

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
