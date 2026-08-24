# Chile: LGUC + OGUC — permiso de edificación

Fuente: [`docs/fuentes/cl/CHILE_LGUC.pdf`](fuentes/cl/CHILE_LGUC.pdf) (Ley General de
Urbanismo y Construcciones, DFL 458/1975) y
[`docs/fuentes/cl/CHILE_OGUC.pdf`](fuentes/cl/CHILE_OGUC.pdf) (Ordenanza General,
Decreto 47/1992), ambos descargados de la Biblioteca del Congreso Nacional de Chile
(leychile.cl) — fuente oficial, no un mirror. Artículos elegidos porque son los que
usa **Revi** (competidor chileno, ver [`panorama-regional.md`](panorama-regional.md)),
dato aportado directamente por el equipo, no inferido.

## Marco legal de tres niveles (LGUC Art. 1-4)

La propia ley se autodescribe con tres niveles (Art. 2°): **Ley General** (principios,
potestades — la LGUC), **Ordenanza General** (procedimiento administrativo + estándares
técnicos — la OGUC), **Normas Técnicas** (especificaciones de materiales/sistemas,
p. ej. la NCh.433 de diseño sísmico que cita el Art. 5.1.7 — publicadas aparte, fuera
de estos dos PDF). El Ministerio de Vivienda y Urbanismo (MINVU) es la autoridad
nacional (Art. 3-4); el trámite de permiso lo ejecuta la **Dirección de Obras
Municipales (DOM)** de cada comuna (Art. 116 LGUC) — DOM es el análogo chileno del DCT
de Guatemala.

**Diferencia estructural con Guatemala, y por qué importa para el modelo
país→municipio:** en Guatemala cada municipalidad *agrega* sus propios requisitos
(Guía 09-F, POT de Xela) encima de la capa ministerial (VAC04). En Chile, hasta donde
se ha revisado, la lista de documentos para un permiso de edificación la fija
**íntegramente la OGUC a nivel nacional** (Art. 5.1.6) — la DOM comunal es quien
tramita y verifica, no quien define qué se pide. Esto es justo lo que motivó marcar a
Chile como caso de validación de "capa municipal delgada" en
[`expansion-multi-pais.md`](devel/expansion-multi-pais.md), y este documento lo
confirma con artículo en mano, no solo con el resumen de mercado que lo sugirió.

## El artículo troncal: LGUC Art. 116

"La construcción, reconstrucción, reparación, alteración, ampliación y demolición de
edificios... requerirán permiso de la Dirección de Obras Municipales a solicitud del
propietario." El Director de Obras Municipales concede el permiso si verifica:
- **letra a)** — el proyecto cumple las normas urbanísticas vigentes a la fecha de
  solicitud.
- **letra b)** — se acompañaron los antecedentes exigidos para el tipo de solicitud
  ("el Director de Obras Municipales sólo deberá verificar que se acompañan los
  antecedentes exigidos... y que aquellos corresponden al proyecto respectivo").

La letra b) es, literalmente, la descripción en la ley de lo que hace este motor de
requisitos: comprobar que la lista exigida está completa, no evaluar el proyecto en
sí. Buena señal de que el problema que resuelve Buildhaton es reconocible en el texto
legal chileno, no una analogía forzada.

**Búsqueda de cláusula de discrecionalidad (equivalente al "según sea el caso" de
Guatemala): no se encontró ninguna de alcance general**, ni en LGUC ni en OGUC (grep
sobre ambos textos completos por "a juicio del Director", "requisitos adicionales",
"que se estimen necesarios", "criterio de la Dirección" — un solo resultado, ver
abajo). Consistente con la caracterización de Chile como uno de los marcos "más
predecibles" de la región que traía la investigación de mercado — aquí queda
verificado contra el texto, no solo citado de un resumen.

El único resultado de esa búsqueda es LGUC Art. 116 bis A) (zonas declaradas en
catástrofe): "Los proyectos... no requerirán autorizaciones o pronunciamientos de
otros organismos del Estado **ni requisitos adicionales a los que establezca la
Ordenanza General**." Esto va en la dirección **opuesta** a una cláusula abierta — es
la ley cerrando explícitamente la puerta a requisitos adicionales, para un caso
especial (reconstrucción post-catástrofe). Refuerza la lectura de lista cerrada, no la
contradice.

## Precursor: Certificado de Informaciones Previas — CIP (OGUC Art. 1.4.4)

Documento emitido por la DOM (o la SEREMI de Vivienda y Urbanismo si la municipalidad
no tiene esa unidad) que fija las condiciones urbanísticas aplicables al predio. Plazo
de emisión: 7 días (15 si la DOM no tiene información catastral del predio). Es
insumo obligatorio del expediente de permiso (aparece como ítem 2 del Art. 5.1.6, ver
abajo). Análogo funcional a la "Consulta A" que `muni-gt-base` exige en Guatemala —
mismo rol: una certificación previa emitida por la misma autoridad que luego tramita
el permiso, que fija las reglas urbanísticas del predio antes de armar el expediente.

## El documento troncal de requisitos: OGUC Art. 5.1.6 — permiso de edificación de obra nueva

✅ Confirmado contra la OGUC (vigente). Antecedentes a presentar ante la DOM, "en un
ejemplar" salvo excepción indicada:

1. Solicitud firmada por propietario + arquitecto proyectista, con: lista de
   documentos/planos numerados, declaración de dominio, disposiciones especiales
   acogidas, profesionales competentes, si hay edificios de uso público, si cuenta con
   Revisor Independiente, si cuenta con Revisor de Cálculo Estructural, si cuenta con
   anteproyecto aprobado vigente.
2. Fotocopia del **Certificado de Informaciones Previas** (CIP) vigente + plancheta
   catastral si fue proporcionada.
3. Formulario único de estadísticas de edificación.
4. Informe del Revisor Independiente o del arquitecto proyectista (declaración jurada)
   — solo para permisos de una vivienda o viviendas progresivas/infraestructura
   sanitaria.
5. Informe favorable del Revisor de Proyecto de Cálculo Estructural, cuando
   corresponda su contratación.
6. Certificado de factibilidad de agua potable/alcantarillado (empresa sanitaria), o
   proyecto propio aprobado si no hay empresa sanitaria en el área.
7. Planos de arquitectura numerados (ubicación, emplazamiento, plantas acotadas de
   todos los pisos, cortes y elevaciones, planta de cubiertas, plano de cierro si
   aplica).
8. Cuadro de superficies + cálculo de carga de ocupación.
9. Plano comparativo de sombras — solo si se acoge al Art. 2.6.11.
10. Proyecto de cálculo estructural, cuando corresponda según Art. 5.1.7 (ver abajo).
11. Especificaciones técnicas (seguridad contra incendio, acondicionamiento térmico) —
    para uso residencial y equipamiento de educación/salud (no cementerios/crematorios)
    se exige además Informe de acreditación/Ensayo/Memoria de Cálculo o, alternativamente
    para vivienda, Informe de Precalificación Energética.
12. Levantamiento topográfico (salvo que ya esté en las plantas de arquitectura).
13. Carpeta de Ascensores e Instalaciones similares, cuando aplique (plano general,
    especificaciones técnicas, estudio de ascensores si corresponde).
14. Plano de Accesibilidad + Memoria de Accesibilidad — para los edificios del Art.
    4.1.7 (no revisado en este pase — pendiente).
15. Proyecto de telecomunicaciones — solo si el proyecto debe registrarse en el
    Registro de Proyectos Inmobiliarios.
16. Comprobante de ingreso del Informe de Mitigación de Impacto Vial, o certificado de
    que no se requiere, emitido por el sistema electrónico.

Notas del propio artículo: los antecedentes 7, 8, 10 y 11 requieren dos copias
adicionales una vez el expediente esté apto para el permiso. Las solicitudes fuera de
límites urbanos deben además cumplir el Art. 55 LGUC (ver abajo). Hay un régimen
simplificado para "proyectos tipo" (Art. 5.1.28, no revisado en este pase) que
reemplaza varios ítems por un plano de emplazamiento + informe de calidad de subsuelo.

## Cálculo estructural: OGUC Art. 5.1.7

Obligatorio salvo: edificaciones **< 100 m²**, obras menores, y edificaciones de
clases C/D/E/F con carga de ocupación **< 20 personas** (la exención completa tiene más
condiciones que no se terminaron de leer en este pase — marcar como pendiente antes de
codificar la exención completa). Cuando aplica, exige memoria de cálculo (cargas,
fuerzas horizontales, tensiones admisibles, medianería) + planos de estructura
(fundaciones, secciones, detalles, especificaciones técnicas con referencia a la tabla
4.2 de la norma técnica NCh.433) firmados por ingeniero civil o arquitecto. El
Director de Obras Municipales **no revisa** el cálculo estructural — la responsabilidad
es del profesional firmante o del Revisor Independiente/de Cálculo Estructural.

## Excepción de zona rural: LGUC Art. 55

Fuera de los límites urbanos del Plan Regulador no se permite construir salvo
explotación agrícola, vivienda del propietario/trabajadores, o vivienda social/hasta
1.000 UF con subsidio estatal. Construcciones industriales, de infraestructura,
equipamiento, turismo y poblaciones fuera de límite urbano requieren informe previo
favorable de la SEREMI de Vivienda y del Servicio Agrícola (SAG) — un requisito
adicional que se agrega, no que reemplaza, al trámite DOM. Es un disparador geográfico
autodeclarado, mismo patrón que `en_cono_la_aurora` en Guatemala — no hay razonamiento
espacial real en el motor (ver `limitaciones-motor.md` punto 6), solo un booleano.

## Explícitamente fuera del alcance de `reglas.json` (por diseño, no por vacío)

- **OGUC Art. 2.6.3** (rasantes y distanciamientos a deslindes) y el **Art. 1.1.2**
  (definiciones — dentro de él, "Coeficiente de constructibilidad", "Coeficiente de
  ocupación de los pisos superiores" y "Coeficiente de ocupación del suelo", COS) son
  **parámetros de diseño**, no requisitos documentales: fijan cuánto y cómo se puede
  construir, no qué papel hay que entregar. Es exactamente la distinción que
  `limitaciones-motor.md` (punto 5) ya decidió mantener fuera de `reglas.json` para
  Guatemala/Xela — no es un gap nuevo, es la misma frontera aplicada a un país nuevo.
  Dato relevante para posicionamiento competitivo: la página de Revi describe que
  "Clara... analiza el proyecto contra la normativa", lo que sugiere que Revi sí cubre
  contenido de este tipo (cumplimiento técnico/de diseño), no solo completitud
  documental — un alcance más amplio que el que tiene hoy el motor de Buildhaton.
  Anotado aquí para quien haga el análisis competitivo pendiente en
  `panorama-regional.md`.
- Nota metodológica: la numeración de Títulos/Capítulos de la OGUC **no predice** si
  un artículo es procedimental o técnico — el 1.1.2 (Título 1, "Disposiciones
  Generales", el mismo título que trae el trámite del permiso) es una definición
  técnica, no procedimental. La clasificación "requisito documental vs. parámetro de
  diseño" hay que hacerla artículo por artículo, no por dónde vive en el índice.
- **OGUC Art. 2.1.25 / 2.1.26** (definición del uso de suelo "Residencial") es
  vocabulario/clasificación, no una regla — material de glosario (`campo_proyecto` o
  enum), no una entrada de `reglas.json`.
- **OGUC Art. 3.1.3 / 3.1.4** (fusión y loteo de predios) es un trámite distinto al
  permiso de edificación, con su propia lista de documentos (Art. 3.1.4 numeral por
  numeral, no transcrito en este pase). No se modeló en el borrador de reglas — queda
  pendiente si se decide cubrir loteo como trámite separado.

## Pendiente / no verificado en este pase

- Art. 4.1.7 (qué edificios exigen Plano de Accesibilidad) y Art. 5.1.28 (régimen de
  "proyectos tipo") — citados por el 5.1.6 pero no leídos en este pase.
- Exención completa de cálculo estructural (Art. 5.1.7, condiciones de clase C/D/E/F).
- El trámite de "obra menor" (mencionado varias veces como categoría con requisitos
  reducidos, nunca definido en los artículos leídos) — necesario para saber qué
  proyectos caen fuera del Art. 5.1.6 completo.
- Si existe alguna variación real entre comunas (más allá de quién es la DOM que
  tramita) — con lo leído hasta ahora, no se encontró ninguna, pero el pase fue
  parcial (Títulos 2-4 y gran parte del 5 no se revisaron).
