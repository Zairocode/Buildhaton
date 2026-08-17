/**
 * Puente entre el wizard VAC02 y el motor de requisitos.
 *
 * El VAC02 pregunta 79 cosas y aun asi NO alcanza para saber que te pide tu
 * municipalidad. Los campos de FALTANTES son los que ninguna pantalla del
 * formulario consolidado cubre — 13 de 15 son municipales. Esa brecha es el
 * producto.
 */

export const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export type Proyecto = Record<string, string | number | boolean | null>;

/** Datos municipales que el VAC02 nunca pregunta. Se piden aparte. */
export interface DatosMunicipales {
  municipalidad?: "muniguate" | "scp" | "xela";
  categoria_obra_scp?: "menor" | "mayor" | "gran_magnitud";
  fuente_agua?: "nueva" | "existente";
  fuente_agua_scp?: "empresa_privada" | "municipal" | "pozo";
  en_residencial_o_condominio?: boolean;
  en_centro_historico?: boolean;
  en_cono_la_aurora?: boolean;
  poligono_irregular?: boolean;
  giro_exento?: boolean;
  con_empagua?: boolean;
  requiere_mem?: boolean;
  aplica_nrd3?: boolean;
  asientos_fijos?: boolean;
  corte_arboles_m3?: number;
  movimiento_tierra_m3?: number;
  alto_impacto_pot?: boolean;
  categoria_uso_suelo_xela?: "residencial" | "ordinario" | "condicionado";
  zona_macro_pot?: "urbana" | "rural" | "forestal" | "especial";
  desmembraciones_con_apertura_calle?: number;
}

/** Los 15 campos que el formulario consolidado no cubre. */
export const FALTANTES: { campo: keyof DatosMunicipales; pregunta: string; capa: string }[] = [
  { campo: "municipalidad",               pregunta: "¿En qué municipalidad se tramita?",                     capa: "municipal" },
  { campo: "categoria_obra_scp",          pregunta: "Categoría de obra (Santa Catarina Pinula)",             capa: "scp" },
  { campo: "fuente_agua",                 pregunta: "¿Sistema de agua nuevo o conexión a uno existente?",    capa: "ministerial" },
  { campo: "fuente_agua_scp",             pregunta: "¿De dónde viene el agua? (Pinula)",                     capa: "scp" },
  { campo: "en_residencial_o_condominio", pregunta: "¿Está dentro de residencial o condominio?",             capa: "scp" },
  { campo: "en_centro_historico",         pregunta: "¿Está en Centro Histórico o área de amortiguamiento?",  capa: "municipal" },
  { campo: "en_cono_la_aurora",           pregunta: "¿Está dentro del cono de aproximación de La Aurora?",   capa: "municipal" },
  { campo: "poligono_irregular",          pregunta: "¿El polígono del terreno es irregular?",                capa: "municipal" },
  { campo: "giro_exento",                 pregunta: "¿El giro está exento de la tasa EAP?",                  capa: "municipal" },
  { campo: "con_empagua",                 pregunta: "¿Requiere factibilidad de agua de EMPAGUA?",            capa: "municipal" },
  { campo: "requiere_mem",                pregunta: "¿Aplica normativa del MEM?",                            capa: "municipal" },
  { campo: "aplica_nrd3",                 pregunta: "¿Aplica NRD-3 (edificación existente)?",                capa: "municipal" },
  { campo: "asientos_fijos",              pregunta: "¿Tiene asientos fijos?",                                capa: "ministerial" },
  { campo: "corte_arboles_m3",            pregunta: "Volumen de corte de árboles (m³)",                      capa: "municipal" },
  { campo: "movimiento_tierra_m3",        pregunta: "Volumen de movimiento de tierra (m³)",                  capa: "municipal" },
  { campo: "alto_impacto_pot",            pregunta: "¿Es un proyecto de alto impacto? (Xela, Art. 130 POT)", capa: "xela" },
  { campo: "categoria_uso_suelo_xela",    pregunta: "Categoría de uso del suelo (Xela)",                     capa: "xela" },
  { campo: "zona_macro_pot",              pregunta: "Zona del predio: urbana, rural, forestal o especial (Xela)", capa: "xela" },
  { campo: "desmembraciones_con_apertura_calle", pregunta: "Desmembraciones con apertura de calle (Xela)",   capa: "xela" },
];

const si = (v?: string) => (v == null || v === "" ? undefined : v === "Sí");

/**
 * Primer número del texto, NO todos los dígitos sueltos. Borrar los no-dígitos
 * convertía "18,500 m2" en 185002 y "700 m2" en 7002 — y 700 es el umbral que
 * decide si el trámite va por la guía 09-F o por la 00-F.
 */
const NUMERO = /-?\d[\d,]*(?:\.\d+)?/;
const num = (v?: string) => {
  const m = NUMERO.exec(String(v ?? ""));
  if (!m) return undefined;
  const n = parseFloat(m[0].replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

/** Tipos de uso que implican acceso de publico -> dispara NRD-2 de CONRED. */
const USO_PUBLICO = ["Plaza Comercial", "Oficina", "Industrial", "Mixto"];

/** Traduce lo que el wizard ya capturo a los campos del motor. */
export function desdeWizard(form: any): Proyecto {
  const p = form?.proyecto ?? {};
  const a = form?.ambiental ?? {};

  const out: Proyecto = {
    tipo_solicitud: p.tipoUso ?? null,
    area_construccion_m2: num(p.areaConstruccion) ?? null,
    altura_m: num(p.alturaEdificio) ?? null,
    uso_publico: p.tipoUso ? USO_PUBLICO.includes(p.tipoUso) : null,
    genera_aguas_pluviales: si(p.aguasPluviales) ?? null,
    afecta_salud_circunvecina: si(p.afectaSalud) ?? null,
    impacto_social: si(p.impactoSocial) ?? null,
    almacena_agua_combustible_lubricantes: si(p.almacenamiento) ?? null,
    cercano_area_bosque: si(p.bosque) ?? null,
    categoria_ambiental: a.tipoLicencia ?? null,
    abastecimiento_agua_consumo_humano: si(a.consumoAguaPotable) ?? null,
    tratamiento_aguas_residuales: a.tratamientoAR ? "nueva" : null,
  };

  for (const k of Object.keys(out)) if (out[k] === null) delete out[k];
  return out;
}

export interface Requisito {
  id: string;
  capa: "ministerial" | "municipal";
  institucion: string;
  tipo: string | null;
  confianza: string;
  documentos: string[];
  fuente: string;
  nota: string | null;
}

export interface Respuesta {
  ok: boolean;
  errors: { field: string; code: string; message: string }[];
  warnings: { code: string; message: string; field?: string }[];
  requirements: Requisito[];
  summary: { total_rules: number; ministerial_rules: number; municipal_rules: number; documents: number };
}

export async function evaluar(proyecto: Proyecto): Promise<Respuesta> {
  const r = await fetch(`${API}/api/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proyecto),
  });
  return r.json();
}

/* ===================== JURISDICCIONES ===================== */

/** Sale de reglas.json, no de una lista fija: es el avance del raspado. */
export interface Jurisdiccion {
  id: string;
  label: string;
  capa: "ministerial" | "municipal";
  reglas: number;
  documentos: number;
  sin_confirmar: number;
  fuentes: string[];
}

export async function jurisdicciones(): Promise<Jurisdiccion[]> {
  const r = await fetch(`${API}/api/jurisdicciones`);
  const j = await r.json();
  return j.items ?? [];
}

/* ===================== DOCUMENTOS ===================== */

export interface Documento {
  id: string;
  proyecto: string;
  requisito: string | null;
  /** nombre del requisito que satisface — es la llave contra la lista del motor */
  documento: string;
  archivo: string;
  bytes: number;
  /** alimenta las reglas de vigencia del motor de fallas; null = "no se sabe" */
  fecha_emision: string | null;
  subido_por: string | null;
  subido_en: string;
}

/** Requisitos cuyo nombre declara un plazo: solo a esos se les pide la fecha. */
export const pideFecha = (nombre: string) => /meses|emitid|vigenc/i.test(nombre);

export async function docsDe(proyecto: string): Promise<Documento[]> {
  const r = await fetch(`${API}/api/documentos?proyecto=${encodeURIComponent(proyecto)}`);
  const j = await r.json();
  return j.items ?? [];
}

export async function subirDoc(campos: {
  proyecto: string;
  documento: string;
  requisito?: string;
  usuario?: string;
  fechaEmision?: string;
  archivo: File;
}): Promise<Documento> {
  const fd = new FormData();
  fd.append("proyecto", campos.proyecto);
  fd.append("documento", campos.documento);
  if (campos.requisito) fd.append("requisito", campos.requisito);
  if (campos.usuario) fd.append("usuario", campos.usuario);
  if (campos.fechaEmision) fd.append("fecha_emision", campos.fechaEmision);
  fd.append("archivo", campos.archivo);

  const r = await fetch(`${API}/api/documentos`, { method: "POST", body: fd });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error?.message ?? "No se pudo subir el archivo");
  return j.documento;
}

export async function borrarDoc(id: string): Promise<void> {
  await fetch(`${API}/api/documentos/${id}`, { method: "DELETE" });
}

export const urlDoc = (id: string) => `${API}/api/documentos/${id}/archivo`;

/* ===================== MOTOR DE FALLAS ===================== */

export type Severidad = "bloqueante" | "riesgo" | "aviso";

export interface Hallazgo {
  id: string;
  severidad: Severidad;
  titulo: string;
  detalle: string;
  remedio: string | null;
  fuente: string | null;
  /** requisito afectado, si la falla es sobre un documento concreto */
  documento: string | null;
  /** veces que esta falla causó un rechazo en la bitácora */
  veces: number;
}

export interface Revision {
  hallazgos: Hallazgo[];
  resumen: { bloqueante: number; riesgo: number; aviso: number; total: number; listo: boolean };
  cargados: number;
  /** true mientras la bitácora solo tenga rechazos sembrados, no reales */
  bitacora_demo: boolean;
}

export const SEVERIDADES: Record<Severidad, { label: string; tono: "peligro" | "alerta" | "neutro" }> = {
  bloqueante: { label: "Bloqueante", tono: "peligro" },
  riesgo: { label: "Riesgo", tono: "alerta" },
  aviso: { label: "Aviso", tono: "neutro" },
};

/** Cruza los requisitos del proyecto con lo ya cargado. */
export async function revisar(proyecto: string, datos: Proyecto): Promise<Revision> {
  const r = await fetch(`${API}/api/revision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proyecto, datos }),
  });
  return r.json();
}

export interface Rechazo {
  id: string;
  falla: string;
  proyecto: string | null;
  fecha: string;
  institucion: string | null;
  nota: string | null;
  origen: "demo" | "real";
}

export async function bitacora(): Promise<{ items: Rechazo[]; demo: boolean }> {
  const r = await fetch(`${API}/api/bitacora`);
  const j = await r.json();
  return { items: j.items ?? [], demo: j.demo ?? true };
}

/** Registrar un rechazo real es lo que hace que el motor aprenda. */
export async function registrarRechazo(r: {
  falla: string; proyecto?: string; institucion?: string; nota?: string;
}): Promise<void> {
  await fetch(`${API}/api/bitacora`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r),
  });
}
