/**
 * Estado de la app: empresa, usuarios y proyectos.
 *
 * Persiste en localStorage porque no hay backend. Los proyectos cuelgan del NIT
 * de la EMPRESA, no de la persona — igual que en la VAC ("todos los proyectos
 * registrados bajo el NIT que registro en su usuario"). Cuando el contratista
 * se va, el historial se queda.
 */
import { useCallback, useState } from "react";
import type { Proyecto } from "./motor";

export type EstadoVac = "en_carga" | "listo_vac" | "enviado_vac" | "aprobado";

export const ESTADOS: Record<EstadoVac, { label: string; tono: "neutro" | "curso" | "ok" }> = {
  en_carga: { label: "En carga", tono: "neutro" },
  listo_vac: { label: "Listo para VAC", tono: "curso" },
  enviado_vac: { label: "Enviado a VAC", tono: "curso" },
  aprobado: { label: "Aprobado", tono: "ok" },
};

/** Los 5 contactos que el Formulario Consolidado VAC02 exige por expediente. */
export const ROLES = [
  "Representante Legal",
  "Responsable de Ejecución",
  "Responsable de Evaluación",
  "Responsable de Planificación",
  "Arrendatario",
] as const;
export type Rol = (typeof ROLES)[number];

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  profesion: string;
  colegiado: string;
  email: string;
  telefono: string;
}

export interface Empresa {
  razonSocial: string;
  nit: string;
  nombreComercial: string;
  representante: string;
  departamento: string;
}

export const MUNICIPALIDADES = [
  { id: "muniguate", label: "Guatemala", reglas: true },
  { id: "scp", label: "Santa Catarina Pinula", reglas: true },
] as const;

export interface ProyectoPanel {
  id: string;
  nombre: string;
  municipalidadLabel: string;
  tipo: string;
  direccion: string;
  areaTerreno: number;
  estado: EstadoVac;
  /** requisitos ya cargados; el total lo calcula el motor */
  cargados: number;
  contactos: string[];
  datos: Proyecto;
}

export interface Store {
  empresa: Empresa;
  usuarios: Usuario[];
  proyectos: ProyectoPanel[];
}

const SEMILLA: Store = {
  empresa: {
    razonSocial: "Constructora Zairo, Sociedad Anónima",
    nit: "4821093-K",
    nombreComercial: "Zairo Construcciones",
    representante: "Luan Mejía",
    departamento: "Guatemala",
  },
  usuarios: [
    { id: "u1", nombre: "Luan Mejía", rol: "Representante Legal", profesion: "Administrador de Empresas", colegiado: "—", email: "luan@zairo.gt", telefono: "5512-8874" },
    { id: "u2", nombre: "Ana Lucía Ordóñez", rol: "Responsable de Planificación", profesion: "Arquitecta", colegiado: "CAG 8842", email: "aordonez@zairo.gt", telefono: "4471-2093" },
    { id: "u3", nombre: "Marco Tulio Recinos", rol: "Responsable de Ejecución", profesion: "Ingeniero Civil", colegiado: "CIG 12507", email: "mrecinos@zairo.gt", telefono: "3308-5521" },
  ],
  proyectos: [
    {
      id: "PRY-2026-0041", nombre: "Torres Cayalá II", municipalidadLabel: "Guatemala", tipo: "Mixto",
      direccion: "Zona 16, Ciudad de Guatemala", areaTerreno: 3200, estado: "listo_vac", cargados: 34,
      contactos: ["u1", "u2", "u3"],
      datos: {
        municipalidad: "muniguate", tipo_solicitud: "Mixto", area_construccion_m2: 18500, altura_m: 42,
        uso_publico: true, categoria_ambiental: "A", movimiento_tierra_m3: 1200,
        abastecimiento_agua_consumo_humano: true, fuente_agua: "existente", con_empagua: true,
      },
    },
    {
      id: "PRY-2026-0052", nombre: "Residencial Las Conchas", municipalidadLabel: "Santa Catarina Pinula",
      tipo: "Residencial", direccion: "Km 14.5 Carretera a El Salvador", areaTerreno: 8400,
      estado: "en_carga", cargados: 11, contactos: ["u1", "u2"],
      datos: {
        municipalidad: "scp", tipo_solicitud: "Residencial", area_construccion_m2: 5200, altura_m: 9,
        uso_publico: false, categoria_ambiental: "B1", categoria_obra_scp: "mayor",
        fuente_agua_scp: "pozo", en_residencial_o_condominio: true, tratamiento_aguas_residuales: "nueva",
      },
    },
    {
      id: "PRY-2026-0033", nombre: "Plaza Corporativa Vista Hermosa", municipalidadLabel: "Guatemala",
      tipo: "Comercial", direccion: "Zona 15, Vista Hermosa II", areaTerreno: 2100,
      estado: "enviado_vac", cargados: 28, contactos: ["u1", "u3"],
      datos: {
        municipalidad: "muniguate", tipo_solicitud: "Plaza Comercial", area_construccion_m2: 9800,
        altura_m: 24, uso_publico: true, categoria_ambiental: "B1", asientos_fijos: false,
        corte_arboles_m3: 18, poligono_irregular: true,
      },
    },
  ],
};

const CLAVE = "tramitologia.v1";

function guardar(s: Store) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(s));
  } catch {
    /* modo privado: seguimos solo en memoria */
  }
  return s;
}

export function useStore() {
  const [store, setInterno] = useState<Store>(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return guardado ? (JSON.parse(guardado) as Store) : SEMILLA;
    } catch {
      return SEMILLA;
    }
  });

  /**
   * Persiste dentro del setter, no en un useEffect.
   * Crear un proyecto desmonta el panel en el mismo commit (se salta al
   * formulario), y el efecto nunca llegaria a correr: el proyecto se perdia.
   */
  const setStore = useCallback((f: (s: Store) => Store) => {
    setInterno((prev) => guardar(f(prev)));
  }, []);

  return { store, setStore, reiniciar: () => setInterno(guardar(SEMILLA)) };
}

export function nuevoCodigo(proyectos: ProyectoPanel[]) {
  const n = proyectos.length + 41;
  return `PRY-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}
