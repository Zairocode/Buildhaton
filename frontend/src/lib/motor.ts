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
  municipalidad?: "muniguate" | "scp";
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
];

const si = (v?: string) => (v == null || v === "" ? undefined : v === "Sí");
const num = (v?: string) => {
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
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
