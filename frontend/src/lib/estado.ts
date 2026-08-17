/**
 * Estado de la app: empresa, usuarios y proyectos.
 *
 * Persiste en localStorage porque no hay backend. Los proyectos cuelgan del NIT
 * de la EMPRESA, no de la persona — igual que en la VAC ("todos los proyectos
 * registrados bajo el NIT que registro en su usuario"). Cuando el contratista
 * se va, el historial se queda.
 */
import { useCallback, useEffect, useState } from "react";
import { docsDe, jurisdicciones, type Documento, type Jurisdiccion, type Proyecto } from "./motor";

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

/**
 * Permiso dentro de Cimiento — no confundir con `Rol`, que es el cargo que el
 * VAC02 exige nombrar en el expediente. Un Responsable de Ejecución puede ser
 * lector acá y seguir firmando el expediente allá.
 */
export type Acceso = "admin" | "gestor" | "lector";

export const ACCESOS: Record<Acceso, { label: string; detalle: string }> = {
  admin: { label: "Administrador", detalle: "Gestiona usuarios, empresa y permisos" },
  gestor: { label: "Gestor", detalle: "Crea proyectos y carga documentos" },
  lector: { label: "Lector", detalle: "Solo consulta; no modifica el expediente" },
};

export const PUEDE: Record<Acceso, { subir: boolean; crearProyecto: boolean; administrar: boolean }> = {
  admin: { subir: true, crearProyecto: true, administrar: true },
  gestor: { subir: true, crearProyecto: true, administrar: false },
  lector: { subir: false, crearProyecto: false, administrar: false },
};

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  acceso: Acceso;
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

/** Respaldo si la API no responde. La lista viva sale de `useJurisdicciones`. */
export const MUNICIPALIDADES = [
  { id: "muniguate", label: "Guatemala" },
  { id: "scp", label: "Santa Catarina Pinula" },
  { id: "xela", label: "Quetzaltenango" },
];

/**
 * Municipalidades con reglas cargadas, leídas del motor. Al raspar una
 * municipalidad nueva y escribir sus reglas, aparece acá sola.
 */
export function useJurisdicciones() {
  const [todas, setTodas] = useState<Jurisdiccion[] | null>(null);
  useEffect(() => {
    let vivo = true;
    jurisdicciones()
      .then((j) => vivo && setTodas(j))
      .catch(() => vivo && setTodas([]));
    return () => { vivo = false; };
  }, []);

  const municipales = (todas ?? []).filter((j) => j.capa === "municipal");
  return {
    todas: todas ?? [],
    cargando: todas === null,
    // "GT" es la capa ministerial, no una municipalidad donde se tramite.
    municipalidades: municipales.length ? municipales.map((j) => ({ id: j.id, label: j.label })) : MUNICIPALIDADES,
  };
}

export interface ProyectoPanel {
  id: string;
  nombre: string;
  municipalidadLabel: string;
  tipo: string;
  direccion: string;
  areaTerreno: number;
  estado: EstadoVac;
  /** arranque de demo para los proyectos semilla; lo real se suma de `docs` */
  cargados: number;
  contactos: string[];
  datos: Proyecto;
}

/** Mensaje que sale al chat del equipo. Se guarda para poder mostrar el hilo. */
export interface Notificacion {
  id: string;
  /** id del usuario destinatario */
  para: string;
  canal: "whatsapp" | "correo";
  texto: string;
  proyecto: string;
  severidad: "bloqueante" | "riesgo" | "aviso" | "info";
  en: string;
}

export interface Store {
  empresa: Empresa;
  usuarios: Usuario[];
  proyectos: ProyectoPanel[];
  /** usuario activo. Sin login: el panel lo cambia a mano. */
  sesion: string;
  notificaciones: Notificacion[];
}

/** Cuántos requisitos tiene cubiertos: base de demo + archivos realmente subidos. */
export const cargadosDe = (p: ProyectoPanel, docs: Documento[] = []) =>
  p.cargados + new Set(docs.map((d) => d.documento)).size;

/** Documentos subidos, agrupados por proyecto. Un solo GET para toda la cartera. */
export function useDocs(proyecto?: string) {
  const [docs, setDocs] = useState<Documento[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(() => {
    setCargando(true);
    return docsDe(proyecto ?? "")
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setCargando(false));
  }, [proyecto]);

  useEffect(() => { recargar(); }, [recargar]);

  const de = useCallback((id: string) => docs.filter((d) => d.proyecto === id), [docs]);
  return { docs, de, cargando, recargar };
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
    { id: "u1", nombre: "Luan Mejía", rol: "Representante Legal", acceso: "admin", profesion: "Administrador de Empresas", colegiado: "—", email: "luan@zairo.gt", telefono: "5512-8874" },
    { id: "u2", nombre: "Ana Lucía Ordóñez", rol: "Responsable de Planificación", acceso: "gestor", profesion: "Arquitecta", colegiado: "CAG 8842", email: "aordonez@zairo.gt", telefono: "4471-2093" },
    { id: "u3", nombre: "Marco Tulio Recinos", rol: "Responsable de Ejecución", acceso: "lector", profesion: "Ingeniero Civil", colegiado: "CIG 12507", email: "mrecinos@zairo.gt", telefono: "3308-5521" },
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
    {
      id: "PRY-2026-0067", nombre: "Residencial Altos de Xelajú", municipalidadLabel: "Quetzaltenango",
      tipo: "Residencial", direccion: "Zona 3, Quetzaltenango", areaTerreno: 1800,
      estado: "en_carga", cargados: 2, contactos: ["u1", "u2"],
      datos: {
        municipalidad: "xela", tipo_solicitud: "Residencial", area_construccion_m2: 420, altura_m: 9,
        uso_publico: false, categoria_ambiental: "B2", categoria_uso_suelo_xela: "residencial",
        zona_macro_pot: "urbana", alto_impacto_pot: false, movimiento_tierra_m3: 12,
      },
    },
  ],
  sesion: "u1",
  notificaciones: [],
};

const CLAVE = "cimiento.v3";

function leer(): Store {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado ? (JSON.parse(guardado) as Store) : SEMILLA;
  } catch {
    return SEMILLA;
  }
}

function guardar(s: Store) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(s));
  } catch {
    /* modo privado: seguimos solo en memoria */
  }
  return s;
}

export function useStore() {
  const [store, setInterno] = useState<Store>(leer);

  /**
   * Persiste dentro del setter, no en un useEffect.
   * Crear un proyecto desmonta el panel en el mismo commit (se salta al
   * formulario), y el efecto nunca llegaria a correr: el proyecto se perdia.
   *
   * Aplica sobre lo que hay EN DISCO, no sobre el render previo: el panel y el
   * portal montan cada uno su propio useStore, y con `prev` el segundo en
   * escribir borraba lo que hizo el primero.
   */
  const setStore = useCallback((f: (s: Store) => Store) => {
    setInterno(guardar(f(leer())));
  }, []);

  return { store, setStore, reiniciar: () => setInterno(guardar(SEMILLA)) };
}

/** Usuario activo. Si el de la sesión ya no existe, cae al primero. */
export const sesionDe = (s: Store) => s.usuarios.find((u) => u.id === s.sesion) ?? s.usuarios[0];

/** Sin usuario válido no se asume nada: lectura. */
export const permisosDe = (s: Store) => PUEDE[sesionDe(s)?.acceso ?? "lector"];

/** Evita el bloqueo por quedarse sin administrador. */
export const esUltimoAdmin = (s: Store, id: string) =>
  s.usuarios.filter((u) => u.acceso === "admin").every((u) => u.id === id) &&
  s.usuarios.some((u) => u.id === id && u.acceso === "admin");

export function nuevoCodigo(proyectos: ProyectoPanel[]) {
  const n = proyectos.length + 41;
  return `PRY-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}
