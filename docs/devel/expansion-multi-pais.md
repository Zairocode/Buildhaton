# Expansión a múltiples países: propuesta de cambios

**Desarrollo, no normativa.** Este documento no agrega ninguna regla nueva — es la
propuesta de qué cambiar en el motor para que el mismo código sirva a más de un país
sin que cada instancia cargue normativa que no le corresponde.

## Alcance decidido

- **Próximo país: Colombia.** Sigue siendo una república unitaria como Guatemala
  (país → municipio, sin nivel intermedio con reglas propias), pero más descentralizada:
  las ciudades principales (Bogotá D.C., Medellín, Cali, …) tienen POT y curadurías
  urbanas propias con más peso relativo que lo que ve Guatemala fuera de la capital.
  Misma forma de dos capas que ya existe (`GT` nacional + `muniguate`/`scp`/`xela`
  municipal), solo que con más municipios en alcance y, previsiblemente, más variación
  entre ellos — el caso que ya motivó [`comparativa-municipal.md`](../comparativa-municipal.md)
  se repite, no cambia de forma.
- **Chile y Perú son candidatos siguientes con la misma forma.** ⚠️ Sin verificar
  contra fuente primaria todavía — lo que sigue sale de un resumen de investigación de
  mercado (Gemini), no de un código o instructivo oficial leído directamente, y debe
  tratarse con el mismo cuidado que cualquier dato `SIN_CONFIRMAR` del resto de este
  proyecto antes de convertirse en reglas. Con esa salvedad: ambos son unitarios con
  código técnico nacional (Ley General de Urbanismo y Construcciones + OGUC en Chile,
  Reglamento Nacional de Edificaciones en Perú) y trámite de licencia a nivel
  municipal — el mismo país → municipio que ya usa Guatemala, no un caso nuevo.
  Interesante en particular **Chile como tercer caso de validación**: se describe como
  uno de los marcos "más predecibles y estrictos" de la región, con permisos
  estandarizados — si eso se confirma, Chile tendría una capa municipal *delgada*
  frente a una nacional fuerte, el espejo de Colombia (capa municipal gruesa). Probar
  el modelo país→municipio contra un caso de variación municipal baja, no solo alta,
  es la clase de prueba que ya rindió con Xela (ver
  [`limitaciones-motor.md`](limitaciones-motor.md)) — las generalizaciones que
  sirvieron salieron de casos reales con formas distintas, no solo de más de lo mismo.
  **Actualización:** verificado directamente que Chile ya tiene un competidor real
  (Revi, de la Cámara Chilena de la Construcción) con tracción en 12 municipalidades y
  respaldo de Google — y que el VUC de Bogotá es distrital, no nacional, reforzando el
  patrón de decentralización colombiana. Detalle y fuentes en
  [`panorama-regional.md`](../panorama-regional.md).
  **Segunda actualización, esta vez contra el texto legal directo (no un resumen):**
  la hipótesis de capa municipal delgada queda confirmada — la OGUC (Ordenanza General,
  fuente oficial vigente) fija íntegramente a nivel nacional la lista de documentos
  para un permiso de edificación (Art. 5.1.6); la Dirección de Obras Municipales
  tramita y verifica, no define qué se pide. Búsqueda explícita de una cláusula tipo
  "según sea el caso" no encontró ninguna de alcance general en LGUC ni OGUC — un
  contraste directo con Guatemala. Detalle, citas y el borrador de reglas de prueba en
  [`chile-lguc-oguc.md`](../chile-lguc-oguc.md) y
  [`motor/paises/cl/reglas-borrador.json`](../../motor/paises/cl/reglas-borrador.json)
  (validado con un smoke test contra el `aplica()` real de `motor.py`, sin modificarlo
  — ningún cambio de DSL fue necesario para modelar lo encontrado).
- **Colombia tiene una particularidad de dominio que no rompe el modelo de
  jurisdicción, pero sí afecta un campo existente.** El trámite de licencia en
  Colombia pasa por **Curadurías Urbanas** — profesionales privados que ejercen una
  función pública, no una oficina municipal como el DCT de Guatemala. Sigue siendo
  capa `municipal` (la curaduría opera dentro de un municipio, por un municipio), pero
  el valor de `institucion`/`quien_emite` en las reglas y el catálogo de documentos de
  Colombia se va a leer distinto ("Curaduría Urbana N.º 3 de Bogotá" no es un
  ministerio ni una dirección municipal) — anotarlo para quien empiece esa carga de
  datos, no requiere ningún cambio de esquema.
- **Explícitamente fuera del alcance del motor de requisitos:** certificaciones de
  sostenibilidad (CES de Chile, EDGE en Colombia/Perú) y marcos de concesión para obra
  pública. Son mecanismos voluntarios o de otro tipo de proyecto (infraestructura
  pública, no licenciamiento privado) — no son requisitos de licencia de construcción
  y no deberían terminar como entradas de `documentos.json` a menos que el producto
  cambie de alcance. Lo mismo para la dinámica gremial (CAMACOL, CAPECO, Cámara
  Chilena de la Construcción): es contexto de mercado/costos, no dato de trámite.
- **Países federales (México, Argentina) quedan fuera de este documento.** Se abordarán
  como **instancias independientes** más adelante, no como un tercer nivel dentro del
  mismo esquema `capa`. Cuando llegue ese trabajo, es un fork de la estructura de
  directorio por país que se propone aquí, no una generalización de `ministerial`/
  `municipal` a N niveles.
- Por lo mismo, **`capa` se queda binaria** (ver punto 4 abajo) — no se propone aquí
  ningún cambio de esquema para soportar un nivel estatal/departamental con reglas
  propias. Si algún país unitario futuro resulta tener un nivel intermedio real con
  reglas propias (un departamento colombiano que emita requisitos, por ejemplo — no
  confirmado todavía), ese es un problema a resolver cuando aparezca, no antes.

## Qué asume hoy el código que ya no es cierto

El motor fue escrito para un solo país y esa suposición está hardcodeada en varios
lugares, no aislada en un solo archivo:

1. **`motor/motor.py:47`** — `jur = {"GT", proyecto.get("municipalidad")}`. El literal
   `"GT"` asume que la capa nacional siempre se llama así. Cargar un segundo país
   significa que esa capa nacional tiene otro id (`"CO"`), y el código no tiene dónde
   leerlo salvo hardcodeándolo de nuevo.
2. **`api-server/app.py:32-34`** — `NOMBRES_JURISDICCION` es un diccionario fijo con
   las tres municipalidades de Guatemala más `"GT"`. No hay forma de agregar un país
   sin editar este diccionario en código Python, lo cual contradice la convención de
   que la normativa (incluyendo sus nombres visibles) es dato, no código.
3. **`api-server/app.py:30`** — `VALID_MUNICIPALITIES = {r["jurisdiccion"] for r in REGLAS}`
   incluye `"GT"` como si fuera una municipalidad válida para el campo `municipalidad`
   del proyecto, porque no hay manera de distinguir programáticamente "esto es la capa
   nacional" de "esto es un municipio" — hoy se sabe por convención (`"GT"` a secas) no
   por dato.
4. **`frontend/src/lib/motor.ts:16`** — `municipalidad?: "muniguate" | "scp" | "xela"`
   es un union type de TypeScript escrito a mano. Agregar un municipio, y con más razón
   un país, requiere tocar este archivo aunque `/api/jurisdicciones` ya devuelve la
   lista completa en runtime — el tipo estático no se deriva de esa respuesta.
5. **`motor/reglas.json`, `documentos.json`, `glosario.json`, `fallas.json`** son
   archivos únicos, todos de Guatemala, sin ningún campo `pais`. No existe hoy la
   operación "cargar solo un país" — solo existe "cargar todo lo que hay", que hoy es
   lo mismo por accidente.

## Cambios propuestos, por costo/beneficio

1. **Partición física por país: `motor/paises/<iso>/`.**
   Mover lo que hoy es `motor/reglas.json`, `documentos.json`, `glosario.json`,
   `fallas.json` a `motor/paises/gt/` (mismo contenido, mismo esquema — es un `git mv`,
   no una reescritura). Colombia entra después como `motor/paises/co/` con sus propios
   cuatro archivos. `motor.py`/`catalogo.py`/`fallas.py`/`glosario.py` dejan de asumir
   una ruta fija y reciben el país a cargar (variable de entorno o argumento —
   `BUILDHATON_PAIS=gt` para la instancia de Guatemala, `co` para la de Colombia).

   **Por qué partición física y no un campo `pais` en un `reglas.json` único filtrado
   en runtime:** con un archivo único, cada instancia desplegada carga en memoria la
   normativa de todos los países aunque solo use una, y cualquier PR que edite
   normativa de un país toca el mismo blob JSON que el de los demás — más difícil de
   revisar, más fácil de generar un conflicto de merge entre alguien tocando Colombia y
   alguien tocando Guatemala el mismo día. La partición física resuelve ambas cosas a
   costo bajo porque el esquema de cada regla no cambia, solo su ubicación. Esta es la
   decisión central de la propuesta — vale la pena confirmarla antes de ejecutar el
   resto, que depende de ella.

   Costo: medio. Es mecánico (mover archivos, parametrizar cuatro rutas) pero toca los
   cuatro módulos del motor más `api-server/app.py` (que hoy importa `motor.motor`
   asumiendo un único `reglas.json` ya cargado a nivel de módulo).

2. **`motor/paises/<iso>/pais.json`: metadata del país, no reglas.**
   Un archivo chico por país con lo que hoy está hardcodeado en dos lugares distintos:
   ```json
   {
     "id": "GT",
     "nombre": "Guatemala",
     "capa_nacional": "GT",
     "municipios": [
       {"id": "muniguate", "nombre": "Guatemala"},
       {"id": "scp", "nombre": "Santa Catarina Pinula"},
       {"id": "xela", "nombre": "Quetzaltenango"}
     ]
   }
   ```
   Reemplaza `NOMBRES_JURISDICCION` (punto 2 de la sección anterior) y le da a
   `motor.py:47` de dónde leer `capa_nacional` en vez de asumir el literal `"GT"`.
   También resuelve el punto 3: `VALID_MUNICIPALITIES` puede construirse desde
   `pais["municipios"]`, que por definición no incluye la capa nacional.

   Costo: bajo. Es un archivo nuevo chico por país más un cambio contenido en
   `motor.py` (una constante que deja de ser literal) y en `api-server/app.py`
   (`NOMBRES_JURISDICCION` se deriva de `pais.json` en vez de vivir en Python).

3. **Nuevo self-check: los `jurisdiccion` de `reglas.json` están todos declarados en
   `pais.json`.**
   Mismo patrón que el check de no-cruce entre jurisdicciones que ya recorre
   `{r["jurisdiccion"] for r in REGLAS}` dinámicamente (`motor/motor.py::demo()`):
   agregar que ese conjunto, menos `capa_nacional`, sea subconjunto exacto de los ids
   en `pais["municipios"]`. Atrapa un id de municipio mal escrito en una regla nueva
   (hoy pasaría desapercibido — el motor simplemente nunca aplicaría esa regla, sin
   avisar) y un municipio declarado en `pais.json` sin ninguna regla que lo use
   (probablemente un país cargado a medias).

   Costo: bajo. Extiende un check que ya existe, no agrega un mecanismo nuevo.

4. **`capa: "ministerial"` → `"nacional"` (opcional, cosmético).**
   Guatemala le puso ese nombre porque la capa nacional es literalmente la
   consolidación de ministerios que hace la VAC — pero esa razón no es universal.
   Colombia no tiene necesariamente un equivalente VAC que unifique ministerios en un
   solo trámite; su capa nacional puede ser, por ejemplo, una licencia ambiental de
   ANLA tramitada aparte, sin ventanilla consolidada. Nombrar la capa `"nacional"` en
   vez de `"ministerial"` describe la posición en la jerarquía sin asumir cómo está
   organizada por dentro. Es un rename mecánico (`reglas.json` de Guatemala,
   `motor.py::informe()`, `api-server/app.py` en el sort de `/api/jurisdicciones` y en
   `ministerial_rules`, y el agrupamiento por capa en el frontend) — toca varios
   archivos pero ninguno cambia de forma, solo de string.

   Costo: bajo-medio (mecánico, pero disperso en ~5 archivos). No bloquea nada de lo
   demás — se puede hacer antes, después, o nunca sin afectar los puntos 1-3. Marcado
   opcional a propósito.

5. **Vocabulario y `glosario.json` por país: decisión pendiente, no resuelta aquí.**
   `glosario.json` hoy mezcla campos universales (`area_construccion_m2`, `altura_m`)
   con enums específicos de Guatemala (`categoria_ambiental` con valores B1/B2 de
   MARN, campos con sufijo `_scp` o `_pot`). Cuando arranque la carga de datos de
   Colombia va a hacer falta un criterio explícito: ¿un glosario compartido con
   entradas país-específicas marcadas, o un glosario por país que hereda uno base? No
   se resuelve en este documento porque no hay todavía un segundo conjunto de datos
   real contra el cual decidir — la Guía 09-F municipal enseñó que ese tipo de
   decisión se acierta mejor con el caso real en la mano (ver el proceso que llevó a
   `sugerir()` en `catalogo.py`). Que quien empiece la carga de datos de Colombia
   decida esto con el primer lote real de requisitos, no antes.

6. **Fuera de alcance de esta propuesta:**
   - **Nivel estatal/departamental con reglas propias** (soporte federal). Ver
     "Alcance decidido" arriba — instancias independientes más adelante, no un tercer
     valor de `capa` aquí.
   - **Wizard del frontend multi-país.** `VacWizard.tsx` está construido alrededor del
     Formulario Consolidado del VAC guatemalteco, pantalla por pantalla. Colombia no
     tiene necesariamente un formulario nacional consolidado equivalente (sin
     confirmar todavía) — el wizard de un segundo país probablemente no puede
     reutilizar la misma estructura de 8 pantallas, y ese es un proyecto de frontend
     aparte, no una consecuencia automática de partición por país en el backend.

## Orden de ejecución sugerido

1 y 2 son la base (partición física + `pais.json`) — sin ellas los demás puntos no
tienen dónde vivir. 3 se agrega en el mismo cambio porque es una extensión directa de
un check que ya existe. 4 es independiente y puede ir en cualquier momento. 5 se
resuelve cuando exista un primer lote real de reglas de Colombia, no antes — proponer
un esquema de glosario sin datos reales contra qué probarlo es el mismo error que
`docs/devel/limitaciones-motor.md` ya documentó para el DSL de reglas: las
generalizaciones que se acertaron fueron las que salieron de un caso real (Xela), no
las que se anticiparon.
