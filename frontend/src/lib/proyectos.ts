/**
 * Proyectos de ejemplo del panel.
 *
 * A diferencia del mockup, el denominador de "N/M documentos" NO esta escrito:
 * lo calcula el motor a partir de las reglas reales de cada municipalidad. Por
 * eso los proyectos guardan sus datos crudos y no un total.
 */
import type { Proyecto } from "./motor";

export type EstadoVac = "en_carga" | "listo_vac" | "enviado_vac" | "aprobado";

export const ESTADOS: Record<EstadoVac, { label: string; tono: "neutro" | "acento" | "ok" }> = {
  en_carga: { label: "En carga", tono: "neutro" },
  listo_vac: { label: "Listo para VAC", tono: "acento" },
  enviado_vac: { label: "Enviado a VAC", tono: "neutro" },
  aprobado: { label: "Aprobado", tono: "ok" },
};

export interface ProyectoPanel {
  id: string;
  nombre: string;
  municipalidadLabel: string;
  tipo: string;
  direccion: string;
  areaTerreno: number;
  propietario: string;
  nit: string;
  estado: EstadoVac;
  /** cuantos requisitos ya se cargaron (el total lo calcula el motor) */
  cargados: number;
  datos: Proyecto;
}

export const PROYECTOS: ProyectoPanel[] = [
  {
    id: "PRY-2026-0041",
    nombre: "Torres Cayalá II",
    municipalidadLabel: "Guatemala",
    tipo: "Mixto",
    direccion: "Zona 16, Ciudad de Guatemala",
    areaTerreno: 3200,
    propietario: "Grupo Cayalá S.A.",
    nit: "4821093-K",
    estado: "listo_vac",
    cargados: 34,
    datos: {
      municipalidad: "muniguate",
      tipo_solicitud: "Mixto",
      area_construccion_m2: 18500,
      altura_m: 42,
      uso_publico: true,
      categoria_ambiental: "A",
      movimiento_tierra_m3: 1200,
      abastecimiento_agua_consumo_humano: true,
      fuente_agua: "existente",
      con_empagua: true,
    },
  },
  {
    id: "PRY-2026-0052",
    nombre: "Residencial Las Conchas",
    municipalidadLabel: "Santa Catarina Pinula",
    tipo: "Residencial",
    direccion: "Km 14.5 Carretera a El Salvador",
    areaTerreno: 8400,
    propietario: "Desarrollos Pinula S.A.",
    nit: "7734021-8",
    estado: "en_carga",
    cargados: 11,
    datos: {
      municipalidad: "scp",
      tipo_solicitud: "Residencial",
      area_construccion_m2: 5200,
      altura_m: 9,
      uso_publico: false,
      categoria_ambiental: "B1",
      categoria_obra_scp: "mayor",
      fuente_agua_scp: "pozo",
      en_residencial_o_condominio: true,
      tratamiento_aguas_residuales: "nueva",
    },
  },
  {
    id: "PRY-2026-0033",
    nombre: "Plaza Corporativa Vista Hermosa",
    municipalidadLabel: "Guatemala",
    tipo: "Comercial",
    direccion: "Zona 15, Vista Hermosa II",
    areaTerreno: 2100,
    propietario: "Inmobiliaria VH S.A.",
    nit: "5512874-3",
    estado: "enviado_vac",
    cargados: 28,
    datos: {
      municipalidad: "muniguate",
      tipo_solicitud: "Plaza Comercial",
      area_construccion_m2: 9800,
      altura_m: 24,
      uso_publico: true,
      categoria_ambiental: "B1",
      asientos_fijos: false,
      corte_arboles_m3: 18,
      poligono_irregular: true,
    },
  },
];
