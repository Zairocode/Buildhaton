# Catálogo de documentos — emisor y contexto operativo

Metadata de `motor/documentos.json`: quién **emite** o **elabora** cada documento,
más consejos de vigencia y formato. Complementa `reglas.json` (quién lo **exige**).

Fuentes primarias en [`fuentes/`](fuentes/). Resumen normativo en
[`matriz-requisitos.md`](matriz-requisitos.md) y [`municipal-guatemala.md`](municipal-guatemala.md).

Copia machine-readable: [`catalogo-documentos-meta.json`](catalogo-documentos-meta.json).

## Cómo leer este archivo

| Campo | Significado |
|---|---|
| `quien_emite` | Entidad u persona que **extiende** el documento oficial, **firma** el acta, o **elabora** el técnico (según familia) |
| `consejo_vencimiento` | Plazos duros o táctica de armado del expediente |
| `consejo_formato` | Formato, plantilla o rol profesional exigido |
| Confianza | **Alta** = fuente instructiva directa · **Media** = inferido de firmantes, plantillas o una sola guía secundaria |

> Los valores del catálogo son **transversales**. La vigencia por jurisdicción sigue en cada regla
> (`vigencia_meses` en `reglas.json`). Donde el emisor varía por municipio, el catálogo lo dice explícitamente.

## Resumen

| | |
|---|---|
| Documentos en catálogo | 104 |
| Con metadata documentada | 97 |
| Confianza alta | 38 |
| Confianza media | 59 |
| Sin metadata (baja confianza / solicitante) | 7 |

## Alta confianza

### acta

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `acta-notarial-asumiendo-responsabilidad` | Acta notarial asumiendo responsabilidad por daños a terceros, eximien… | Notario | — | SCP_construccion_mayor.pdf |
| `acta-notarial-de-compromiso-de` | Acta notarial de compromiso de señalización | Notario | **Formato:** Usar el formato adjunto en los requisitos DGAC; compromiso de señalización por declaración jurada. | VAC04 DGAC §10 |

### ambiental

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `edicto-publicado-archivo-individual` | Edicto publicado (archivo individual) | MARN (publicación en proceso del instrumento ambiental) | **Formato:** Solo categorías ambientales A y B1; B2 queda exento. | VAC04 MARN; matriz-requisitos.md |
| `plan-manejo-ambiental-xela` | Plan de Manejo Ambiental | Dirección de Servicios Ambientales, Municipalidad de Quetzaltenango | — | POT Quetzaltenango 2022 Arts. 41-46 |

### catastral

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `certificacion-catastral-de-la-direccion` | Certificación catastral de la Dirección de Catastro de SCP | Dirección de Catastro, Municipalidad de Santa Catarina Pinula | — | SCP_construccion_mayor.pdf |
| `informacion-catastral-del-poligono` | Información catastral del polígono emitida por la municipalidad | Municipalidad del predio | — | VAC04 MSPAS §4 |

### colegiatura

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `constancia-colegiado-activo` | Constancias de colegiado activo en original | Colegio profesional respectivo | — | VAC04 MSPAS §10; VAC04 DGAC observaciones |

### dictamen

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `cert-eval-parametros-pot-xela` | Certificación de evaluación de parámetros normativos del predio | Departamento de Control de Obras, Municipalidad de Quetzaltenango | **Vencimiento:** Vigencia de 6 meses desde su emisión (Art. 53, POT Quetzaltenango 2022). | POT Quetzaltenango 2022 Art. 53 |
| `dictamen-de-agua-y-saneamiento` | Dictamen de agua y saneamiento | Empresa privada de agua y saneamiento | — | SCP_construccion_mayor.pdf — rama empresa privada |
| `dictamen-de-autorizacion-de-la-direccion` | Dictamen de autorización de la Dirección de Agua y Saneamiento | Dirección de Agua y Saneamiento, Municipalidad de Santa Catarina Pinula | — | SCP_construccion_mayor.pdf — rama pozo artesanal |
| `dictamen-departamento-ordenamiento-territorial-xela` | Dictamen del Departamento de Ordenamiento Territorial | Departamento de Ordenamiento Territorial, Municipalidad de Quetzaltenango | **Vencimiento:** Es de carácter obligatorio para todo proyecto de alto impacto: el Art. 60 del POT dice que nunca se dispensa. | POT Quetzaltenango 2022 Art. 60 |
| `dictamen-del-ign-con-banco-de-marca-mas` | Dictamen del IGN con banco de marca más cercano | Instituto Geográfico Nacional (IGN) | — | VAC04 DGAC §7 |
| `dictamen-favorable-del-inab` | Dictamen favorable del INAB | INAB | — | MUNIGUATE_guia_09F (corte >10 m³); SCP guías |
| `estudio-geotecnico-conred-xela` | Estudio geotécnico y autorización favorable de habitabilidad de CONRED | CONRED (autorización de habitabilidad) | **Vencimiento:** Solo aplica para regularizar obras existentes en zonas especiales de riesgo (ESP-Q6/Q7/Q8), no para obra nueva.<br>**Formato:** El estudio geotécnico lo elabora un profesional colegiado; la autorización favorable de habitabilidad la emite CONRED. | POT Quetzaltenango Art. 49 |
| `informe-asesoria-alto-impacto-xela` | Informe de Asesoría para proyectos de alto impacto | Municipalidad de Quetzaltenango (varias dependencias, coordina Control de Obras) | **Vencimiento:** Vigencia de 6 meses desde su emisión (Art. 53, POT Quetzaltenango 2022). | POT Quetzaltenango 2022 Art. 53 (Asesoría de proyecto) |
| `plan-de-aprovechamiento-forestal` | Plan de aprovechamiento forestal | INAB | — | VAC02 Anexo I |
| `resolucion-del-area-de-salud-area-norte` | Resolución del área de salud, área NORTE del MSPAS, sobre calidad de … | MSPAS — Área de Salud Norte | — | SCP gran magnitud |
| `resolucion-favorable-de-la-dgac` | Resolución favorable de la DGAC | DGAC | — | MUNIGUATE_guia_00F; VAC04 DGAC |
| `resolucion-favorable-del-marn-y-licencia` | Resolución favorable del MARN (y Licencia Ambiental si aplica) | MARN / DIGARN | **Vencimiento:** Tras la resolución, la boleta de pago de licencia vence en 72 horas (VAC09). | VAC04 MARN; VAC09; municipal-guatemala.md costura VAC↔muni |
| `resolucion-final-del-estudio-de-cambio` | Resolución final del Estudio de Cambio de Uso de Suelo del INAB | INAB | — | SCP gran magnitud |

### financiero

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `solvencia-municipal` | Solvencia Municipal del inmueble, emitida en los últimos 2 meses | Tesorería municipal (Muniguate y SCP) / Departamento de Catastro (Quetzaltenango) | **Vencimiento:** Sacala de ultimo, cuando el resto del folder ya este armado -- es el documento que mas se vence mientras el expediente espera. Vigencia: 2 meses en capital y Pinula; 1 mes en Quetzaltenango (POT Art. 53). | Guía 09-F; SCP obra mayor; POT Quetzaltenango Art. 53 |

### gestion

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `carta-de-la-asociacion-de-vecinos` | Carta de la asociación de vecinos manifestando que no tiene dificulta… | Asociación de vecinos debidamente registrada | — | SCP_construccion_mayor.pdf |

### legal

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `fianza-de-cumplimiento-a-favor-de-la` | Fianza de cumplimiento a favor de la Municipalidad (art. 148 Código M… | Compañía afianzadora (a favor de la municipalidad) | — | SCP gran magnitud; Código Municipal Art. 148 |

### otro

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `autorizacion-del-delegado-de-derecho-de` | Autorización del delegado de Derecho de Vía, Asesoría Jurídica de Cam… | Delegado de Derecho de Vía, MOPT (Asesoría Jurídica de Caminos) | — | SCP gran magnitud |
| `consulta-a-se-obtiene-en-la-ventanilla` | Consulta 'A' (se obtiene en la Ventanilla Única Municipal) | Ventanilla Única Municipal (Municipalidad de Guatemala) | **Formato:** Se proporciona en las instalaciones de la VUM; no tiene URL ni descarga. | MUNIGUATE_guia_09F.pdf |

### pago

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `boleto-ornato` | Boleto de Ornato del profesional responsable | Tesorería municipal (donde se pagó el arbitrio) | **Formato:** Presentá el boleto de la municipalidad donde efectuaste el pago; no tiene que ser la misma donde tramitás. | MUNIGUATE_guia_09F.pdf — requisito de presentar boleto de la muni del pago |
| `constancia-de-pago-del-ultimo-mes-del` | Constancia de pago del último mes del servicio de agua | Proveedor municipal de agua potable | — | SCP_construccion_mayor.pdf — rama agua municipal |
| `duplicado-del-recibo-de-pago-por` | Duplicado del recibo de pago por factibilidad de agua potable EMPAGUA… | EMPAGUA | — | MUNIGUATE_guia_00F_01F.pdf |
| `factura-electronica-dgac` | Factura Electrónica DGAC | DGAC | — | VAC04 DGAC §9 |
| `pago-de-arancel-aa-011` | Pago de arancel AA-011 | MSPAS (arancel código AA-011, AG 53-2022) | — | VAC04 MSPAS §12 |
| `recibo-de-pago-de-tasa-q-350-00-por` | Recibo de pago de tasa Q 350.00 por solicitud EAP | Tesorería Municipal de Guatemala | — | MUNIGUATE_guia_09F.pdf — tasa EAP Q350 |

### planos

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `copia-de-planos-sellados-por-el` | Copia de planos sellados por el Ministerio (cuando aplique) | Ministerio correspondiente (salida del trámite VAC) | **Formato:** Copia de planos sellados al concluir MSPAS, MARN u otra institución en la VAC. | municipal-guatemala.md — costura VAC↔muni |
| `planos-dwg-scp` | Copia digital de los planos en formato DWG | — | **Formato:** Adjuntá el DWG además del juego impreso; un PDF no sustituye el archivo editable. | SCP guías de construcción; comparativa-municipal.md |
| `planos-cad-2007` | Copia digital de todos los planos en disco compacto, formato CAD vers… | — | **Formato:** Exportá desde tu CAD como «AutoCAD 2007 Drawing (*.dwg)» y grabalo en el disco compacto. | MUNIGUATE_guia_09F.pdf — umbral >200 m² |
| `planos-sellados-por-la-asociacion-de` | Planos sellados por la asociación de vecinos (obra mayor) | Asociación de vecinos debidamente registrada | — | SCP_construccion_mayor.pdf |

### registral

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `cert-rgp` | Certificación del Registro General de la Propiedad con historial comp… | Registro General de la Propiedad (RGP) | **Vencimiento:** Pedí una certificación nueva antes de armar el expediente. Vigencia: 6 meses capital, 3 meses Pinula y Quetzaltenango (Segundo Registro, POT Art. 148). Si el proyecto cruza municipalidades, usá el plazo más corto. | Guía 09-F; comparativa-municipal; POT Quetzaltenango Art. 148 |

### sanitario

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `certificado-de-calidad-del-agua-ag-178` | Certificado de calidad del agua (AG 178-2009) | MSPAS | **Vencimiento:** Si la fuente es pozo, presentalo dentro del plazo del AG 178-2009 tras la perforación; si no, el dictamen sanitario favorable se anula. | VAC04 MSPAS §18; AG 178-2009 |
| `constancia-del-abastecedor-garantizando` | Constancia del abastecedor garantizando dotación y continuidad | Abastecedor del sistema de agua | — | VAC04 MSPAS §19 |

## Media confianza

### acta

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `alternativa-acta-de-declaracion-jurada-2` | ALTERNATIVA: Acta de declaración jurada + copia de recepción de solic… | Propietario (formato VUM) + recepción DGAC | **Formato:** Válvula de escape: paralelizar trámite municipal si DGAC aún no concluyó. | MUNIGUATE_guia_00F |
| `alternativa-acta-de-declaracion-jurada` | ALTERNATIVA: Acta de declaración jurada + copia de recepción de solic… | Propietario (formato VUM) + recepción DGAC | **Formato:** Válvula de escape: paralelizar trámite municipal si DGAC aún no concluyó (Guía 00-F). La válvula análoga para MARN usa el mismo formato VUM pero acuse ante MARN — ver nota en regla muni-gt-marn-resolucion. | MUNIGUATE_guia_00F — válvula DGAC; Guía 09-F — válvula MARN (misma forma, distinto acuse) |
| `acta-de-declaracion-jurada-de` | Acta de declaración jurada de cumplimiento NRD-1 CONRED (firmada por … | Profesional estructural y ejecutor (formato VUM) | **Formato:** Acta de declaración jurada NRD-1; incluir en planos los códigos AGIES aplicados. | MUNIGUATE_guia_00F — actas CONRED NRD-1 |
| `acta-de-declaracion-jurada-de-2` | Acta de declaración jurada de cumplimiento NRD-3 CONRED (firmada por … | Propietario y ejecutor (formato VUM) | **Formato:** Acta de declaración jurada NRD-3 para edificaciones existentes. | MUNIGUATE_guia_00F — actas CONRED NRD-3 |
| `declaracion-jurada-del-propietario` | Declaración jurada del propietario comprometiéndose a cumplir toda la… | Propietario | — | SCP gran magnitud |

### ambiental

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `copia-digital-del-instrumento-ambiental` | Copia digital del instrumento ambiental completo | Consultor ambiental (elabora); resolución MARN (emite) | **Formato:** Misma copia digital del instrumento subido al expediente VAC. | municipal-guatemala.md costura VAC↔muni |

### dictamen

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `resolucion-favorable-del-mem-ministerio` | Resolución favorable del MEM (Ministerio de Energía y Minas) | MEM (Ministerio de Energía y Minas) | — | MUNIGUATE_guia_00F — sin requisitos en VAC04 |

### formulario

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `formato-de-evaluacion-nrd2` | Formato de evaluación NRD2 | CONRED (plantilla) | **Formato:** Formato de evaluación NRD-2. | VAC04 CONRED §2 |
| `formato-de-informacion` | Formato de información | CONRED (plantilla) | **Formato:** Formato oficial NRD-2; lo completa el evaluador del proyecto. | VAC04 CONRED §1 |
| `formulario-f02-version-3-todos-los-demas` | Formulario F02 (versión 3) — todos los demás proyectos (Guía 00-F) | Municipalidad de Guatemala (plantilla F02 v3) | — | MUNIGUATE_guia_00F_01F.pdf |
| `formulario-f08-version-actual-proyectos` | Formulario F08 (versión actual) — proyectos Guía 09-F (≤ 700 m², vivi… | Municipalidad de Guatemala (plantilla F08) | **Formato:** Sin borrones, tachones ni corrector. | MUNIGUATE_guia_09F.pdf |
| `formulario-de-solicitud-fs-001-2022` | Formulario de Solicitud FS-001-2022 | MSPAS (plantilla) | **Formato:** Firma, huella y datos deben coincidir en toda la documentación del expediente. | VAC04 MSPAS §1 |
| `formulario-de-solicitud-de-control-de` | Formulario de Solicitud de Control de Alturas | DGAC (plantilla; lo firma el representante legal) | — | VAC04 DGAC §2 |
| `formulario-de-solicitud-de-la-direccion` | Formulario de solicitud de la Dirección Municipal de Planificación | Dirección Municipal de Planificación, SCP (plantilla) | — | SCP guías de construcción |

### gestion

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `carta-de-solicitud-al-director-general` | Carta de solicitud al Director General de Aeronáutica Civil | Solicitante (propietario o representante legal) | — | VAC04 DGAC §1 |
| `cronograma-general-de-ejecucion-del` | Cronograma general de ejecución del proyecto | Solicitante o profesional responsable | — | SCP gran magnitud |
| `presupuesto-por-renglones-de-la` | Presupuesto por renglones de la construcción | Solicitante o profesional responsable | — | SCP gran magnitud |

### informe

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `informe-de-caracterizacion-de-afluentes` | Informe de caracterización de afluentes (15 parámetros) | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `informe-de-estimacion-de-efluentes-15` | Informe de estimación de efluentes (15 parámetros) | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `informe-tecnico-descriptivo-de-la-ptar-a` | Informe técnico descriptivo de la PTAR a la que se conectará | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `informes-de-caracterizacion-fisica` | Informes de caracterización física, química y microbiológica (COGUANO… | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |

### manual

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `manual-de-mantenimiento` | Manual de mantenimiento | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `manual-de-mantenimiento-del-sistema` | Manual de mantenimiento del sistema | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `manual-de-operacion` | Manual de operación | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `manual-de-operacion-del-sistema` | Manual de operación del sistema | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |

### memoria_tecnica

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `memoria-descriptiva-dct` | Memoria Descriptiva DCT | Profesional responsable (formato DCT de ventanilla) | **Formato:** La guía de lineamientos DCT se entrega en la Ventanilla Única Municipal. | MUNIGUATE_guia_09F.pdf |
| `memoria-de-diseno-estructural-y-estudio` | Memoria de diseño estructural y estudio geotécnico | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `memoria-descriptiva-del-proyecto` | Memoria descriptiva del proyecto | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `memoria-descriptiva-detallada-de-las` | Memoria descriptiva detallada de las obras | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `memoria-fotografica-del-proyecto` | Memoria fotográfica del proyecto | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `memorias-de-calculo-crecimiento` | Memorias de cálculo (crecimiento poblacional, dotación) | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `memorias-detalladas-de-calculo-del` | Memorias detalladas de cálculo del sistema | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |

### otro

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `cumplimiento-de-nrd-1-nrd-2-y-nrd-3` | Cumplimiento de NRD-1, NRD-2 y NRD-3 | Varía por norma (acta VUM, resolución CONRED, etc.) | **Formato:** Gran magnitud SCP exige las tres normas; ver tratamiento distinto en Guía 00-F Muniguate. | SCP gran magnitud; municipal-guatemala.md actas CONRED |
| `detalle-de-volumen-de-tierra-a-mover-en` | Detalle de volumen de tierra a mover en metros cúbicos | Profesional colegiado responsable | — | SCP obra mayor |
| `estudio-de-impacto-vial` | Estudio de Impacto Vial | Profesional o consultor vial | **Formato:** Obligatorio en gran magnitud SCP; en Xela lo define el Departamento de Vía Pública caso a caso (POT Art. 38, SIN_CONFIRMAR umbral). | SCP gran magnitud; quetzaltenango-pot.md |
| `estudio-de-cambio-de-uso-de-suelo` | Estudio de cambio de uso de suelo autorizado por INAB, con sello de r… | Consultor (elabora); INAB autoriza | **Formato:** Presentar con sello de recibido de INAB. | SCP gran magnitud |
| `libreta-topografica-firmada` | Libreta topográfica firmada | Profesional que elaboró la nivelación | — | VAC04 DGAC §6 |
| `localizacion-geografica-del-botadero-con` | Localización geográfica del botadero con autorización de su propietario | Solicitante + propietario del botadero (autorización) | — | SCP obra mayor |
| `medidas-de-mitigacion-para-impactos` | Medidas de mitigación para impactos negativos a colindancias y vía pú… | Profesional colegiado responsable | — | MUNIGUATE_guia_00F — movimiento de tierra >900 m³ |
| `memorial-dirigido-al-alcalde-solicitando` | Memorial dirigido al Alcalde solicitando la licencia | Solicitante | — | SCP gran magnitud |
| `planta-de-techos` | Planta de techos | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `pronunciamientos-de-responsabilidad` | Pronunciamientos de responsabilidad profesional (DRPSA-011-2022) | Profesional colegiado responsable | **Formato:** Formato DRPSA-011-2022 del sitio MSPAS; firma, sello y timbre. | VAC04 MSPAS §11 |
| `redes-de-energia-electrica-e` | Redes de energía eléctrica e instalaciones especiales SUBTERRÁNEAS | Profesional colegiado responsable | **Formato:** Instalaciones subterráneas obligatorias en gran magnitud SCP. | SCP gran magnitud |

### planos

| ID | Documento | Quién emite / elabora | Consejos | Fuente |
|---|---|---|---|---|
| `dos-juegos-de-planos-numerados-timbrados` | Dos juegos de planos numerados, timbrados, sellados y firmados | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `indicar-en-planos-estructurales-los` | Indicar en planos estructurales los códigos de la Norma AGIES aplicada | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `memoria-descriptiva-y-planos-de-los` | Memoria descriptiva y planos de los factores de impacto a considerar | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `plano-de-detalle-de-asientos-fijos` | Plano de detalle de asientos fijos | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `plano-de-localizacion-con-coordenadas-a4` | Plano de localización con coordenadas (>= A4) | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `plano-de-ubicacion-con-areas-libres-y` | Plano de ubicación con áreas libres y materiales (>= A4) | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `plano-de-ubicacion-del-pozo-mecanico` | Plano de ubicación del pozo mecánico: distancia radial NO MENOR A 100… | Profesional colegiado responsable | **Formato:** Distancia radial no menor a 100 m respecto a pozos cercanos (SCP gran magnitud). | SCP gran magnitud; comparativa-municipal.md |
| `planos-de-arquitectura-y-estabilizacion` | Planos de arquitectura y estabilización de taludes en un solo archivo… | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `planos-de-elevaciones-y-secciones-de` | Planos de elevaciones y secciones de componentes (A1) | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `planos-de-elevacion-y-seccion-con-cota-0` | Planos de elevación y sección con cota 0+00 y elevación msnm | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `planos-de-planta-general-de-la-ptar-a1` | Planos de planta general de la PTAR (A1) | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `planos-de-planta-general-del-sistema-a1` | Planos de planta general del sistema (A1) | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `planos-de-ruta-de-evacuacion-y-salidas` | Planos de ruta de evacuación y salidas de emergencia por nivel | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `planos-firmados-sellados-y-timbrados-por` | Planos firmados, sellados y timbrados por ingeniero o arquitecto cole… | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |
| `planos-hidraulicos-autorizados-por` | Planos hidráulicos autorizados por Ingeniero Sanitario colegiado activo | Ingeniero Sanitario colegiado activo | — | SCP gran magnitud |
| `planos-topograficos-con-curvas-de-nivel` | Planos topográficos con curvas de nivel (A1) | Profesional colegiado responsable | **Formato:** Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS. | VAC04 MSPAS reglas transversales |

## Sin metadata — intentionalmente en null

Documentos que **arma o aporta el solicitante** sin emisor institucional único:

| ID | Categoría | Motivo |
|---|---|---|
| `dpi-autenticado-del-propietario` | identificacion | Copia autenticada del DPI del titular |
| `dpi-del-evaluador-nrd-2` | identificacion | Copia del DPI del evaluador NRD-2 |
| `dpi-del-propietario-o-representante` | identificacion | Copia del DPI del propietario o representante |
| `reglamento-de-copropiedad-del-condominio` | legal | Documento constitutivo preexistente del condominio |
| `cd-en-sobre-pegado-en-hoja-de-papel-bond` | otro | Presentación física armada por el solicitante |
| `expediente-fisico-en-folder-color-claro` | otro | El solicitante arma el folder según guía |
| `recibo-de-pago-del-servicio-de-agua` | pago | Emisor depende del proveedor (EMPAGUA, municipal, privado) |

## Variaciones jurisdiccionales críticas

| Documento | Capital / Pinula | Quetzaltenango |
|---|---|---|
| `cert-rgp` | RGP, 6 m / 3 m | Segundo Registro de la Propiedad, 3 m (Art. 148) |
| `solvencia-municipal` | Tesorería, 2 m | Departamento de Catastro, 1 m (Art. 53) |
| `planos-cad-2007` vs `planos-dwg-scp` | CAD 2007 (capital) | DWG editable (Pinula) |

## Mantenimiento

1. Editar `motor/documentos.json`.
2. Actualizar [`catalogo-documentos-meta.json`](catalogo-documentos-meta.json) con `confianza` y `fuente`.
3. Regenerar o editar este archivo.
4. Correr `python motor/catalogo.py`.
