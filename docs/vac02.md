# VAC02 — Formulario Consolidado

Fuente: instructivo de llenado VAC02 ([v1](fuentes/VAC02_v1_llenado.pdf) · [v2](fuentes/VAC02_v2_llenado.pdf)) · Plataforma: http://app.vac.com.gt/

> **Los requisitos por institución viven en [`matriz-requisitos.md`](matriz-requisitos.md)**, validados contra VAC04. Este documento describe el formulario; aquel describe qué te piden y cuándo.

La **Ventanilla Ágil de la Construcción (VAC)** ya resuelve una parte del problema: un solo formulario alimenta a todas las instituciones de gobierno central. Cada institución evalúa con su propia normativa y responde **aprobación, corrección o rechazo** por separado.

**Esto es clave para el alcance de Buildhaton:** el eje ministerial ya está consolidado. Lo que no está resuelto es (a) saber *qué te aplica* antes de empezar, (b) la capa municipal, y (c) la memoria de por qué te rechazaron.

---

## Antes del formulario (solo en v2)

- **Administrar Mis Proyectos** — lista los proyectos vigentes bajo el NIT registrado en el usuario
- **Nueva Solicitud de Proyecto** — cada pulsación genera una solicitud nueva
- **Editar** — continúa un formulario ya iniciado

## Las 8 pantallas

### 1. Documentos requeridos (precondición)
Documentos que debes tener **antes** de sentarte a llenar:

| | Documento | Nota |
|---|---|---|
| a | Documento de Identificación Representante Legal | |
| b | Nombramiento de Representante Legal | |
| c | Patente de Comercio y de Sociedad | |
| d | Certificación Registro de la Propiedad | |
| e | Registro Tributario Unificado (RTU) | |
| f | Plano de Localización | |
| g | Plano de Ubicación | con coordenadas geográficas de referencia |
| h | Plano Acotado | |
| i | Plano Amueblado | |
| j | Plano de Elevaciones | |
| k | Plano de Secciones | |
| l | Contrato legal que aplique | arrendamiento, promesa de compraventa, unificación de bienes, inmueble del estado |
| m | Constancias de Colegiado Activo | de los profesionales que elaboran los planos |
| n | Instrumento Ambiental | |
| o | Factura pago DGAC | cuando aplique |
| p | Recibo pago MSPAS | cuando aplique |
| q | Plano de Conjunto | cuando el proyecto tiene varias torres |
| r | Coordenadas de ubicación | **las 4** |
| s | — | todos los planos firmados, timbrados y sellados |

### 2. Información del Solicitante
NIT, Nombre Comercial, Tipo de Empresa, Razón Social, Departamento, País. Selección de representante legal (si se registró más de uno). Del representante: Fecha de Nacimiento, Género, Etnia, Idioma.

### 3. Datos del Proyecto
- **Nombre del Proyecto** — debe coincidir *exactamente* con planos y documentos legales. Inconsistencia aquí = rechazo.
- **Tipo de uso** — lista: apartamentos, plaza comercial, oficina, viviendas, etc.
- **Niveles**
- **Tipo de proyecto según listado taxativo ambiental** — lo define el Gestor Ambiental según clasificación MARN
- **Actividades colindantes** — norte, sur, este, oeste
- **Adyacencia a sitio cultural/arqueológico**, tipo de obra, afectación al paisaje → Ministerio de Cultura y Deportes (Registro de Bienes Culturales / Patrimonio Cultural de la Nación)
- **Preguntas MSPAS** *(explícitas solo en v2)*: ¿genera aguas pluviales? ¿afecta la salud humana circunvecina? ¿almacena agua, combustible, lubricantes u otros? ¿tiene impacto social?
- **Área total del terreno** y **área total de construcción** en m²
- **Monto de inversión** y **número de empleos** → impacto económico-social
- **Descripción** de: características del entorno, actividades (etapa de construcción), del proyecto
- **Cercanía a área de bosque** → permiso vía INAB
- **Altura del edificio** y **cota de banqueta** → DGAC
- **Sitio arqueológico**: nombre y época → IDAEH
- **Dirección del inmueble** — debe ir *tal como aparece en catastro*
- **Información registral** — Registro de la Propiedad

### 4. Información Ambiental
- **Tipo de licencia**: A, B1 o B2 — se elige con el asesor del Instrumento Ambiental, depende del tamaño
- Consumo de agua (m³), combustibles, lubricantes — y su uso
- Consumo de energía y empresa suministradora
- Caracterización y descarga de aguas residuales
- Fuente de agua potable (empresa o pozo propio)
- Especificaciones de transporte (público, privado, especial)
- Jornada de trabajo (diaria, mixta, diurna)
- Número de empleados, total y por jornada
- Producción de gases, riesgos ocupacionales, producción de olores
- Tipo de riesgo (si aplica) — describir
- Tratamiento de aguas residuales — tipo de proceso

### 5. Información de Seguridad
Resumen del Plan de Mitigación de Riesgos y Equipo de Protección (viene del instrumento ambiental).

### 6. Documentos Adjuntos
- Máximo **100 MB** por archivo
- Legibles, completos, en el apartado correcto — lo contrario genera devolución
- Planos y documentos legales **se suben una sola vez** y se replican a todas las instituciones
- Catálogo completo: 96 documentos posibles → [Anexo I](#anexo-i--catálogo-de-documentos-96)

### 7. Coordenadas
Requeridas por **CONAP** (emite el mapa de ubicación); el resto de instituciones las consultan.
**Las 4 coordenadas en un mismo formato**: Decimal, Sexagesimal, GTM o UTM.

### 8. Contactos
| Rol | Quién es |
|---|---|
| Representante Legal | responsable de la entidad solicitante, con nombramiento |
| Responsable de Ejecución | profesional responsable del proyecto |
| Responsable de Evaluación | aclara dudas junto al de ejecución |
| Responsable de Planificación | lidera la planificación y sus fases |
| Arrendatario | cuando quien presenta no es dueño del terreno |

Por contacto: tipo, nombre, dirección, correo, profesión, teléfono → botón **Update**.
Un profesional puede ocupar varios cargos. Si la figura no existe en la organización → `NA`.

Al final: **Enviar** → revisión, aprobación o corrección.

### Después de enviar (solo en v2)
Aprobado el formulario, **la plataforma genera un expediente por institución**. Botón **"Avance"** → estado de cada una; **"Abrir Formulario"** → el expediente individual.

Reportes: icono azul (documentos resultantes), icono rojo (contraseña del proyecto con el registro de instituciones), icono impresora (resumen del formulario en PDF).

Flujo de corrección y estados → [`matriz-requisitos.md`](matriz-requisitos.md#estados-del-expediente).

---

## Matriz de disparadores

Movida a [`matriz-requisitos.md`](matriz-requisitos.md) y validada contra VAC04. La versión que vivía aquí tenía tres errores: daba CONRED y CONAP como universales, y le faltaba el eje *obra nueva vs. conexión a sistema existente* de MSPAS.

---

## Dónde está la fricción real

1. **Condicionalidad opaca.** 96 documentos posibles; a un proyecto le aplican tal vez 25. Saber cuáles es precisamente la experiencia que no está escrita.
2. **Consistencia entre documentos.** El nombre del proyecto y la dirección deben coincidir con planos, catastro y Registro de la Propiedad. Un desajuste = devolución.
3. **N evaluadores independientes.** Cada institución aprueba, corrige o rechaza por su cuenta. No hay un estado único legible.
4. **Dependencias externas previas.** Colegiado activo, instrumento ambiental, pagos DGAC/MSPAS — todo debe existir *antes* de llenar.
5. **La capa municipal queda fuera.** VAC cubre gobierno central. Licencia de construcción, alineación y catastro siguen siendo municipales y varían por autonomía.

---

## Anexo I — Catálogo de documentos (96)

<details>
<summary>Lista completa</summary>

1. Boleta de pago de solicitud de ubicación (CONAP)
2. Boleta de pago MSPAS
3. Carta autorización Gestor - IDAEH
4. Carta de compromiso de señalización DGAC
5. Carta de solicitud al Director de Aeronáutica Civil
6. Certificación Bienes Inmuebles - IDAEH
7. Certificación catastral emitido por la Municipalidad respectiva
8. Certificación de Colegiado Activo de los consultores que participaron en la elaboración del instrumento ambiental
9. Certificación del Registro de la Propiedad
10. Certificado Banco Marca IGN
11. Colegiado Activo de Especialista del Diseño de la Planta de Tratamiento
12. Colegiado Activo Especialista de Cálculos Hidráulicos
13. Constancia de colegiado activo del arquitecto o ingeniero civil que firma los planos de localización
14. Constancia de colegiado activo — firmada y sellada por el Ingeniero responsable de cada plano
15. Constancia de Inscripción en el Registro Tributario Unificado
16. Constancia del abastecedor, garantizando dotación y continuidad
17. Coordenadas del terreno
18. Declaración jurada del consultor ambiental
19. Documento Personal de Identificación del Arrendatario CONRED (si corresponde)
20. Documento Personal de Identificación DPI del evaluador NRD-2
21. DPI del solicitante o Representante Legal
22. EIA MARN (Estudio de Impacto Ambiental)
23. Escritura Constitutiva de la Sociedad
24. Estudio de factibilidad del proyecto
25. Estudio Geotécnico - MSPAS
26. Estudio Hidrogeológico - MSPAS
27. FEL-DGAC
28. Formato de evaluación NRD2
29. Formato de información CONRED
30. Formulario ALE-01 MEM
31. Formulario ALE-11 MEM
32. Formulario de Solicitud de Alturas de Edificios DGAC
33. Formulario de solicitud de Licencia Ambiental
34. Formulario Solicitud - IDAEH
35. Fotografías de los elementos que se utilizan como ruta de evacuación (gradas, cambios de nivel, rampas, puertas, portones, pasamanos, señalización)
36. Informe de caracterización (o estimación) de afluentes
37. Informe de estimación de efluentes
38. Informe técnico descriptivo sobre la PTAR hacia la que se pretende conectar
39. Informes de caracterización física, química y microbiológica
40. Informes descriptivos e interpretativos de infiltración o permeabilidad (aguas pluviales)
41. Informes descriptivos e interpretativos de infiltración o permeabilidad (tratamiento de aguas residuales)
42. Libreta Topográfica
43. Manual de operación y mantenimiento del sistema (agua para consumo humano)
44. Manual de operación y mantenimiento del sistema (aguas pluviales)
45. Manual de operación y mantenimiento del sistema (aguas residuales)
46. Manual de operación y mantenimiento del sistema (tratamiento de aguas residuales)
47. Memoria de cálculo del diseño planta de tratamiento de producción
48. Memoria descriptiva del proyecto - CONRED
49. Memoria Descriptiva - IDAEH
50. Memoria detallada de cálculo del sistema (agua para consumo humano)
51. Memorias detalladas de cálculo del sistema (aguas pluviales)
52. Memorias detalladas de cálculo del sistema (aguas residuales)
53. Memorias detalladas de cálculo del sistema (tratamiento de aguas residuales)
54. Nombramiento de representante legal
55. Patente de comercio de la empresa
56. Patente de sociedad
57. Plan de aprovechamiento forestal
58. Plan de contingencia y programa de simulacros
59. Plano de gradas/rampas y pasamanos incluyendo planta y perfil
60. Plano amueblado
61. Plano con áreas calculadas por cada ambiente
62. Plano de Caminamiento DGAC
63. Plano de Cotas
64. Plano de detalle de puertas - CONRED
65. Plano de detalles técnicos MEM
66. Plano de estructura
67. Plano de instalaciones MEM
68. Plano de localización del proyecto
69. Plano de medidas de seguridad industrial
70. Plano de Nivelación DGAC
71. Plano de secciones y elevaciones
72. Plano de ubicación firmado y sellado
73. Plano de Ubicación y Localización - DGAC
74. Plano detalle de tubería perforada MSPAS
75. Planos de áreas por fases
76. Planos de arquitectura por fases
77. Planos de elevaciones y secciones de los componentes del sistema (agua para consumo humano)
78. Planos de elevaciones y secciones de los componentes del sistema (aguas pluviales)
79. Planos de elevaciones y secciones de los componentes del sistema (aguas residuales)
80. Planos de elevaciones y secciones de los componentes del sistema (tratamiento de aguas residuales)
81. Planos de instalación eléctrica
82. Planos de instalaciones hidráulicas
83. Planos de medidas de seguridad industrial MEM
84. Planos de planta general del sistema, incluyendo distribución de componentes (agua para consumo humano)
85. Planos de planta general del sistema, incluyendo distribución de componentes (aguas residuales)
86. Planos de planta general del sistema, incluyendo distribución de componentes (aguas pluviales)
87. Planos de planta general del sistema, incluyendo distribución de componentes (tratamiento de aguas residuales)
88. Planos de planta y perfil de gradas y pasamanos
89. Planos de ruta de evacuación - CONRED
90. Planos topográficos con curvas de nivel MSPAS
91. Planta de techos - CONRED
92. Pronunciamiento del solicitante
93. Pronunciamiento profesional para el responsable del diseño del proyecto
94. Pronunciamiento profesional para el(los) especialista(s) a cargo del(los) estudio(s) técnico(s) MSPAS
95. Título de propiedad
96. Título de propiedad inscrito en el RGP o contrato de arrendamiento MEM

</details>
