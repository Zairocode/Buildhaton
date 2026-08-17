import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Building2, Database, Landmark, Loader2, Plus, ScrollText, ShieldAlert, Trash2, UserPlus,
} from "lucide-react";
import { evaluar, type Requisito } from "../../lib/motor";
import {
  ACCESOS, ESTADOS, ROLES, cargadosDe, esUltimoAdmin, nuevoCodigo, permisosDe, useDocs, useJurisdicciones,
  type Acceso, type ProyectoPanel, type Rol, type Store, type Usuario,
} from "../../lib/estado";
import { Barra, Boton, Campo, Chip, Etiqueta, Input, Panel, Selector, T, Titulo, mono, sans } from "./ui";

export const contar = (rs: Requisito[]) =>
  rs.filter((r) => r.tipo !== "aviso").reduce((n, r) => n + r.documentos.length, 0);

/** Evalua todos los proyectos contra el motor una sola vez. */
export function useRequisitos(proyectos: ProyectoPanel[]) {
  const [mapa, setMapa] = useState<Record<string, Requisito[]>>({});
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    let vivo = true;
    setCargando(true);
    Promise.all(
      proyectos.map((p) =>
        evaluar(p.datos)
          .then((r) => [p.id, r.requirements] as const)
          .catch(() => [p.id, [] as Requisito[]] as const)
      )
    ).then((pares) => {
      if (!vivo) return;
      setMapa(Object.fromEntries(pares));
      setCargando(false);
    });
    return () => { vivo = false; };
  }, [proyectos]);
  return { mapa, cargando };
}

/* ===================== DASHBOARD ===================== */

function Metrica({ valor, label, nota, tono }: { valor: string; label: string; nota?: string; tono?: string }) {
  return (
    <Panel className="p-5">
      <div className="text-[34px] font-semibold leading-none tracking-[-0.03em]" style={{ color: tono ?? T.tinta, fontFamily: mono }}>
        {valor}
      </div>
      <div className="mt-2.5 text-[12.5px] font-medium" style={{ color: T.medio, fontFamily: sans }}>{label}</div>
      {nota && <div className="mt-1 text-[11.5px] leading-snug" style={{ color: T.tenue, fontFamily: sans }}>{nota}</div>}
    </Panel>
  );
}

export function Dashboard({ store, onAbrir }: { store: Store; onAbrir: (p: ProyectoPanel) => void }) {
  const { mapa, cargando } = useRequisitos(store.proyectos);
  const { de } = useDocs();

  const m = useMemo(() => {
    const todas = Object.values(mapa).flat();
    const reales = todas.filter((r) => r.tipo !== "aviso");
    const exigidos = contar(todas);
    const cargados = store.proyectos.reduce((n, p) => n + cargadosDe(p, de(p.id)), 0);
    const porInstitucion = new Map<string, number>();
    reales.forEach((r) => porInstitucion.set(r.institucion, (porInstitucion.get(r.institucion) ?? 0) + r.documentos.length));
    return {
      exigidos,
      pendientes: Math.max(0, exigidos - cargados),
      instituciones: porInstitucion.size,
      porInstitucion: [...porInstitucion.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [mapa, store.proyectos, de]);

  if (cargando)
    return (
      <div className="flex items-center gap-2 text-[13px]" style={{ color: T.tenue, fontFamily: sans }}>
        <Loader2 size={14} className="animate-spin" /> evaluando la cartera contra el motor de reglas…
      </div>
    );

  return (
    <>
      <Titulo sub={`${store.empresa.razonSocial} · NIT ${store.empresa.nit}`}>Resumen</Titulo>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica valor={String(store.proyectos.length)} label="Proyectos activos" />
        <Metrica valor={String(m.exigidos)} label="Requisitos exigidos" nota="calculados, no de una lista fija" />
        <Metrica valor={String(m.pendientes)} label="Pendientes de carga" tono={m.pendientes ? T.alerta : T.ok} />
        <Metrica valor={String(m.instituciones)} label="Instituciones involucradas" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel className="p-5">
          <Etiqueta>Carga por institución</Etiqueta>
          <div className="mt-4 space-y-3">
            {m.porInstitucion.map(([inst, n]) => (
              <div key={inst}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-[13px]" style={{ color: T.tinta, fontFamily: sans }}>{inst}</span>
                  <span className="text-[12px]" style={{ color: T.tenue, fontFamily: mono }}>{n}</span>
                </div>
                <Barra pct={(n / m.porInstitucion[0][1]) * 100} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <Etiqueta>Estado de la cartera</Etiqueta>
          <div className="mt-4 space-y-2.5">
            {store.proyectos.map((p) => {
              const total = contar(mapa[p.id] ?? []);
              return (
                <button
                  key={p.id}
                  onClick={() => onAbrir(p)}
                  className="flex w-full items-center justify-between gap-3 border-b pb-2.5 text-left last:border-0"
                  style={{ borderColor: T.linea }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium" style={{ color: T.tinta, fontFamily: sans }}>{p.nombre}</div>
                    <div className="text-[11px]" style={{ color: T.tenue, fontFamily: mono }}>
                      {cargadosDe(p, de(p.id))}/{total}
                    </div>
                  </div>
                  <Chip tono={ESTADOS[p.estado].tono}>{ESTADOS[p.estado].label}</Chip>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

    </>
  );
}

/* ===================== PROYECTOS ===================== */

export function Proyectos({
  store, onAbrir, onNuevo,
}: { store: Store; onAbrir: (p: ProyectoPanel) => void; onNuevo: () => void }) {
  const { mapa, cargando } = useRequisitos(store.proyectos);
  const { de } = useDocs();
  const [q, setQ] = useState("");
  const lista = store.proyectos.filter(
    (p) => p.nombre.toLowerCase().includes(q.toLowerCase()) || p.municipalidadLabel.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="mb-7 flex items-start justify-between gap-4">
        <Titulo sub="Cada proyecto se evalúa contra la normativa de su municipalidad">Proyectos</Titulo>
        {permisosDe(store).crearProyecto && (
          <Boton onClick={onNuevo}>
            <Plus size={15} /> Nuevo proyecto
          </Boton>
        )}
      </div>

      <div className="mb-5 max-w-sm">
        <Input value={q} onChange={setQ} placeholder="Buscar proyecto o municipalidad" />
      </div>

      <Panel>
        <table className="w-full border-collapse text-left" style={{ fontFamily: sans }}>
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.tenue }}>
              {["Proyecto", "Municipalidad", "Tipo", "Documentos", "Estado"].map((h) => (
                <th key={h} className="border-b px-5 py-3" style={{ borderColor: T.linea }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => {
              const total = contar(mapa[p.id] ?? []);
              return (
                <tr key={p.id} onClick={() => onAbrir(p)} className="cursor-pointer hover:bg-black/[0.015]">
                  <td className="border-b px-5 py-3.5" style={{ borderColor: T.linea }}>
                    <div className="text-[14px] font-medium" style={{ color: T.tinta }}>{p.nombre}</div>
                    <div className="text-[11px]" style={{ color: T.tenue, fontFamily: mono }}>{p.id}</div>
                  </td>
                  <td className="border-b px-5 py-3.5 text-[13px]" style={{ borderColor: T.linea, color: T.medio }}>
                    {p.municipalidadLabel}
                  </td>
                  <td className="border-b px-5 py-3.5 text-[13px]" style={{ borderColor: T.linea, color: T.medio }}>
                    {p.tipo}
                  </td>
                  <td className="border-b px-5 py-3.5" style={{ borderColor: T.linea }}>
                    {cargando ? (
                      <Loader2 size={12} className="animate-spin" style={{ color: T.tenue }} />
                    ) : (
                      <div className="w-40">
                        <div className="mb-1.5 text-[12.5px]" style={{ color: T.medio, fontFamily: mono }}>
                          {cargadosDe(p, de(p.id))}/{total}
                        </div>
                        <Barra pct={total ? (cargadosDe(p, de(p.id)) / total) * 100 : 0} />
                      </div>
                    )}
                  </td>
                  <td className="border-b px-5 py-3.5" style={{ borderColor: T.linea }}>
                    <Chip tono={ESTADOS[p.estado].tono}>{ESTADOS[p.estado].label}</Chip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

/* ===================== NUEVO PROYECTO ===================== */

export function NuevoProyecto({
  store, onCrear, onCancelar,
}: { store: Store; onCrear: (p: ProyectoPanel) => void; onCancelar: () => void }) {
  const [f, setF] = useState({
    nombre: "", municipalidad: "", tipo: "", direccion: "",
    areaTerreno: "", areaConstruccion: "", altura: "", contactos: [] as string[],
  });
  const set = (k: string) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const { municipalidades } = useJurisdicciones();
  const muni = municipalidades.find((x) => x.id === f.municipalidad);
  const listo = f.nombre && f.municipalidad && f.tipo && f.areaConstruccion;

  function crear() {
    const id = nuevoCodigo(store.proyectos);
    onCrear({
      id,
      nombre: f.nombre,
      municipalidadLabel: muni?.label ?? "",
      tipo: f.tipo,
      direccion: f.direccion,
      areaTerreno: Number(f.areaTerreno) || 0,
      estado: "en_carga",
      cargados: 0,
      contactos: f.contactos,
      datos: {
        municipalidad: f.municipalidad,
        tipo_solicitud: f.tipo,
        area_construccion_m2: Number(f.areaConstruccion) || 0,
        altura_m: Number(f.altura) || 0,
        uso_publico: ["Plaza Comercial", "Oficina", "Industrial", "Mixto"].includes(f.tipo),
      },
    });
  }

  return (
    <div className="max-w-3xl">
      <Titulo sub="Los datos de la empresa vienen de tu perfil. Solo completás lo del proyecto.">
        Nuevo proyecto
      </Titulo>

      {/* lo que ya sabemos */}
      <Panel className="mb-6 p-5" >
        <Etiqueta>Solicitante — tomado de tu perfil</Etiqueta>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {[
            ["Razón social", store.empresa.razonSocial],
            ["NIT", store.empresa.nit],
            ["Representante legal", store.empresa.representante],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.tenue, fontFamily: sans }}>{l}</div>
              <div className="mt-1 text-[13.5px]" style={{ color: T.tinta, fontFamily: l === "NIT" ? mono : sans }}>{v}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Nombre del proyecto">
          <Input value={f.nombre} onChange={set("nombre")} placeholder="Debe coincidir con planos y escrituras" />
        </Campo>
        <Campo label="Municipalidad" ancho="mitad">
          <Selector
            value={f.municipalidad}
            onChange={set("municipalidad")}
            opciones={municipalidades.map((x) => ({ v: x.id, l: x.label }))}
          />
        </Campo>
        <Campo label="Tipo de obra" ancho="mitad">
          <Selector
            value={f.tipo}
            onChange={set("tipo")}
            opciones={["Vivienda", "Apartamentos", "Plaza Comercial", "Oficina", "Industrial", "Mixto", "Residencial"].map((x) => ({ v: x, l: x }))}
          />
        </Campo>
        <Campo label="Dirección del inmueble">
          <Input value={f.direccion} onChange={set("direccion")} placeholder="Como aparece en catastro" />
        </Campo>
        <Campo label="Área de terreno (m²)" ancho="mitad">
          <Input value={f.areaTerreno} onChange={set("areaTerreno")} type="number" />
        </Campo>
        <Campo label="Área de construcción (m²)" ancho="mitad">
          <Input value={f.areaConstruccion} onChange={set("areaConstruccion")} type="number" />
        </Campo>
        <Campo label="Altura del edificio (m)" ancho="mitad">
          <Input value={f.altura} onChange={set("altura")} type="number" />
        </Campo>
      </div>

      <div className="mt-6">
        <Etiqueta>Contactos del expediente</Etiqueta>
        <p className="mb-3 mt-1 text-[11.5px]" style={{ color: T.tenue, fontFamily: sans }}>
          El VAC02 exige nombrarlos por expediente. Se toman de Usuarios.
        </p>
        <div className="space-y-1.5">
          {store.usuarios.map((u) => (
            <label key={u.id} className="flex items-center gap-2.5 text-[13px]" style={{ color: T.tinta, fontFamily: sans }}>
              <input
                type="checkbox"
                checked={f.contactos.includes(u.id)}
                onChange={(e) =>
                  setF((s) => ({
                    ...s,
                    contactos: e.target.checked ? [...s.contactos, u.id] : s.contactos.filter((x) => x !== u.id),
                  }))
                }
                style={{ accentColor: T.acento }}
              />
              {u.nombre} <span style={{ color: T.tenue }}>· {u.rol}</span>
            </label>
          ))}
        </div>
      </div>

      {muni && (
        <div className="mt-6 flex gap-2.5 rounded-[4px] border p-4" style={{ borderColor: T.acento, background: T.acentoSuave }}>
          <ScrollText size={16} style={{ color: T.acento, flexShrink: 0, marginTop: 1 }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: T.medio, fontFamily: sans }}>
            Al crear el proyecto vas directo al <b>Formulario Consolidado VAC02</b>, ya con estos datos
            puestos. El motor evalúa la normativa de <b>{muni.label}</b> y te arma la lista de requisitos.
          </p>
        </div>
      )}

      <div className="mt-7 flex gap-2.5">
        <Boton onClick={crear} disabled={!listo}>
          Crear y llenar formulario <ArrowRight size={15} />
        </Boton>
        <Boton variante="borde" onClick={onCancelar}>Cancelar</Boton>
      </div>
    </div>
  );
}

/* ===================== USUARIOS ===================== */

export function Usuarios({ store, setStore }: { store: Store; setStore: (f: (s: Store) => Store) => void }) {
  const [abierto, setAbierto] = useState(false);
  const vacio = {
    nombre: "", rol: "" as Rol | "", acceso: "gestor" as Acceso,
    profesion: "", colegiado: "", email: "", telefono: "",
  };
  const [f, setF] = useState(vacio);
  const set = (k: string) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const listo = f.nombre && f.rol;
  const admin = permisosDe(store).administrar;

  function crear() {
    const u: Usuario = { id: `u${Date.now()}`, ...(f as Omit<Usuario, "id">) };
    setStore((s) => ({ ...s, usuarios: [...s.usuarios, u] }));
    setF(vacio);
    setAbierto(false);
  }

  const enUso = (id: string) => store.proyectos.filter((p) => p.contactos.includes(id));

  return (
    <>
      <div className="mb-7 flex items-start justify-between gap-4">
        <Titulo sub="Rol en el expediente (VAC02) y acceso dentro de Cimiento son dos cosas distintas">
          Usuarios
        </Titulo>
        {admin && (
          <Boton onClick={() => setAbierto((v) => !v)}>
            <UserPlus size={15} /> {abierto ? "Cerrar" : "Agregar usuario"}
          </Boton>
        )}
      </div>

      {!admin && (
        <div className="mb-6 flex gap-2.5 rounded-[4px] border p-3.5" style={{ borderColor: T.linea, background: T.blanco }}>
          <ShieldAlert size={15} style={{ color: T.tenue, flexShrink: 0, marginTop: 1 }} />
          <p className="text-[12.5px]" style={{ color: T.tenue, fontFamily: sans }}>
            Estás viendo el directorio en modo consulta. Solo un administrador cambia usuarios y accesos.
          </p>
        </div>
      )}

      <Panel className="mb-6 p-5">
        <Etiqueta>Empresa</Etiqueta>
        <div className="mt-3 grid gap-4 sm:grid-cols-4">
          {[
            ["Razón social", store.empresa.razonSocial],
            ["Nombre comercial", store.empresa.nombreComercial],
            ["NIT", store.empresa.nit],
            ["Departamento", store.empresa.departamento],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.tenue, fontFamily: sans }}>{l}</div>
              <div className="mt-1 text-[13px]" style={{ color: T.tinta, fontFamily: l === "NIT" ? mono : sans }}>{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-start gap-2 border-t pt-3.5 text-[11.5px] leading-snug" style={{ borderColor: T.linea, color: T.tenue, fontFamily: sans }}>
          <Building2 size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          Los proyectos cuelgan del NIT de la empresa, no de la persona. Cuando el contratista se va, el
          historial se queda.
        </p>
      </Panel>

      {abierto && (
        <Panel className="mb-6 p-5">
          <Etiqueta>Nuevo usuario</Etiqueta>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <Campo label="Nombre completo" ancho="mitad"><Input value={f.nombre} onChange={set("nombre")} /></Campo>
            <Campo label="Rol en el expediente" ancho="mitad">
              <Selector value={f.rol} onChange={set("rol")} opciones={ROLES.map((r) => ({ v: r, l: r }))} />
            </Campo>
            <Campo label="Acceso en Cimiento" ancho="mitad">
              <Selector
                value={f.acceso}
                onChange={set("acceso")}
                opciones={Object.entries(ACCESOS).map(([v, a]) => ({ v, l: `${a.label} — ${a.detalle}` }))}
              />
            </Campo>
            <Campo label="Profesión" ancho="mitad"><Input value={f.profesion} onChange={set("profesion")} placeholder="Arquitecto, Ingeniero Civil…" /></Campo>
            <Campo label="Colegiado activo" ancho="mitad"><Input value={f.colegiado} onChange={set("colegiado")} placeholder="CAG / CIG · NA si no aplica" /></Campo>
            <Campo label="Correo" ancho="mitad"><Input value={f.email} onChange={set("email")} type="email" /></Campo>
            <Campo label="Teléfono" ancho="mitad"><Input value={f.telefono} onChange={set("telefono")} /></Campo>
          </div>
          <div className="mt-5 flex gap-2.5">
            <Boton onClick={crear} disabled={!listo}>Guardar usuario</Boton>
            <Boton variante="borde" onClick={() => setAbierto(false)}>Cancelar</Boton>
          </div>
        </Panel>
      )}

      <Panel>
        <table className="w-full border-collapse text-left" style={{ fontFamily: sans }}>
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.tenue }}>
              {["Nombre", "Rol VAC02", "Acceso", "Profesión", "Colegiado", "Proyectos", ""].map((h) => (
                <th key={h} className="border-b px-5 py-3" style={{ borderColor: T.linea }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {store.usuarios.map((u) => {
              const ultimo = esUltimoAdmin(store, u.id);
              return (
              <tr key={u.id}>
                <td className="border-b px-5 py-3.5" style={{ borderColor: T.linea }}>
                  <div className="text-[14px] font-medium" style={{ color: T.tinta }}>
                    {u.nombre}
                    {u.id === store.sesion && <span className="ml-2 text-[11px]" style={{ color: T.acento }}>· vos</span>}
                  </div>
                  <div className="text-[11.5px]" style={{ color: T.tenue }}>{u.email}</div>
                </td>
                <td className="border-b px-5 py-3.5" style={{ borderColor: T.linea }}>
                  <Chip>{u.rol}</Chip>
                </td>
                <td className="border-b px-5 py-3.5" style={{ borderColor: T.linea }}>
                  {admin && !ultimo ? (
                    <div className="w-36">
                      <Selector
                        value={u.acceso}
                        onChange={(v) =>
                          setStore((s) => ({
                            ...s,
                            usuarios: s.usuarios.map((x) => (x.id === u.id ? { ...x, acceso: v as Acceso } : x)),
                          }))
                        }
                        opciones={Object.entries(ACCESOS).map(([v, a]) => ({ v, l: a.label }))}
                      />
                    </div>
                  ) : (
                    <Chip tono={u.acceso === "admin" ? "curso" : "neutro"}>
                      {ACCESOS[u.acceso]?.label ?? u.acceso}
                      {ultimo && " · único"}
                    </Chip>
                  )}
                </td>
                <td className="border-b px-5 py-3.5 text-[13px]" style={{ borderColor: T.linea, color: T.medio }}>{u.profesion}</td>
                <td className="border-b px-5 py-3.5 text-[13px]" style={{ borderColor: T.linea, color: T.medio, fontFamily: mono }}>{u.colegiado}</td>
                <td className="border-b px-5 py-3.5 text-[13px]" style={{ borderColor: T.linea, color: T.medio }}>
                  {enUso(u.id).length}
                </td>
                <td className="border-b px-5 py-3.5" style={{ borderColor: T.linea }}>
                  {admin && !ultimo && (
                    <button
                      onClick={() => setStore((s) => ({
                        ...s,
                        usuarios: s.usuarios.filter((x) => x.id !== u.id),
                        proyectos: s.proyectos.map((p) => ({ ...p, contactos: p.contactos.filter((c) => c !== u.id) })),
                      }))}
                      title="Quitar"
                    >
                      <Trash2 size={14} style={{ color: T.tenue }} />
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-snug" style={{ color: T.tenue, fontFamily: sans }}>
        <Landmark size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        Un profesional puede ocupar varios roles. Si la empresa no tiene alguna de las figuras, el VAC02
        pide consignar <span style={{ fontFamily: mono }}>NA</span> en vez de dejarlo vacío.
      </p>
    </>
  );
}

/* ===================== ADMINISTRACIÓN ===================== */

export function Administracion({
  store, setStore,
}: { store: Store; setStore: (f: (s: Store) => Store) => void }) {
  const { todas, cargando } = useJurisdicciones();
  const { docs } = useDocs();
  const set = (k: keyof Store["empresa"]) => (v: string) =>
    setStore((s) => ({ ...s, empresa: { ...s.empresa, [k]: v } }));

  const mb = (docs.reduce((n, d) => n + d.bytes, 0) / 1_048_576).toFixed(1);

  return (
    <>
      <Titulo sub="Datos de la empresa, cobertura normativa cargada y archivos del expediente">
        Administración
      </Titulo>

      <Panel className="mb-6 p-5">
        <Etiqueta>Empresa solicitante</Etiqueta>
        <p className="mb-4 mt-1 text-[11.5px]" style={{ color: T.tenue, fontFamily: sans }}>
          Se copian a cada expediente nuevo. Deben coincidir con la patente y el RTU.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Razón social" ancho="mitad"><Input value={store.empresa.razonSocial} onChange={set("razonSocial")} /></Campo>
          <Campo label="Nombre comercial" ancho="mitad"><Input value={store.empresa.nombreComercial} onChange={set("nombreComercial")} /></Campo>
          <Campo label="NIT" ancho="mitad"><Input value={store.empresa.nit} onChange={set("nit")} /></Campo>
          <Campo label="Representante legal" ancho="mitad"><Input value={store.empresa.representante} onChange={set("representante")} /></Campo>
          <Campo label="Departamento" ancho="mitad"><Input value={store.empresa.departamento} onChange={set("departamento")} /></Campo>
        </div>
      </Panel>

      <Panel className="mb-6 p-5">
        <div className="flex items-center gap-2">
          <Database size={14} style={{ color: T.tenue }} />
          <Etiqueta>Cobertura del motor de reglas</Etiqueta>
        </div>
        <p className="mb-4 mt-1 text-[11.5px]" style={{ color: T.tenue, fontFamily: sans }}>
          Sale de <span style={{ fontFamily: mono }}>reglas.json</span>. Cada jurisdicción que se investiga y
          se escribe aparece acá y en el selector de proyectos, sin tocar la app.
        </p>

        {cargando ? (
          <div className="flex items-center gap-2 text-[13px]" style={{ color: T.tenue, fontFamily: sans }}>
            <Loader2 size={14} className="animate-spin" /> consultando el motor…
          </div>
        ) : (
          <table className="w-full border-collapse text-left" style={{ fontFamily: sans }}>
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.tenue }}>
                {["Jurisdicción", "Capa", "Reglas", "Documentos", "Sin confirmar", "Fuentes"].map((h) => (
                  <th key={h} className="border-b px-3 py-2.5" style={{ borderColor: T.linea }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todas.map((j) => (
                <tr key={j.id}>
                  <td className="border-b px-3 py-3" style={{ borderColor: T.linea }}>
                    <div className="text-[13.5px] font-medium" style={{ color: T.tinta }}>{j.label}</div>
                    <div className="text-[11px]" style={{ color: T.tenue, fontFamily: mono }}>{j.id}</div>
                  </td>
                  <td className="border-b px-3 py-3" style={{ borderColor: T.linea }}>
                    <Chip tono={j.capa === "municipal" ? "curso" : "neutro"}>{j.capa}</Chip>
                  </td>
                  <td className="border-b px-3 py-3 text-[13px]" style={{ borderColor: T.linea, color: T.medio, fontFamily: mono }}>{j.reglas}</td>
                  <td className="border-b px-3 py-3 text-[13px]" style={{ borderColor: T.linea, color: T.medio, fontFamily: mono }}>{j.documentos}</td>
                  <td className="border-b px-3 py-3" style={{ borderColor: T.linea }}>
                    {j.sin_confirmar ? <Chip tono="alerta">{j.sin_confirmar}</Chip> : <span className="text-[13px]" style={{ color: T.tenue, fontFamily: mono }}>0</span>}
                  </td>
                  <td className="border-b px-3 py-3 text-[11px] leading-snug" style={{ borderColor: T.linea, color: T.tenue, fontFamily: mono }}>
                    {j.fuentes.join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel className="p-5">
        <Etiqueta>Archivos del expediente</Etiqueta>
        <div className="mt-3 flex gap-8">
          <div>
            <div className="text-[26px] font-semibold leading-none" style={{ color: T.tinta, fontFamily: mono }}>{docs.length}</div>
            <div className="mt-1.5 text-[12px]" style={{ color: T.tenue, fontFamily: sans }}>documentos cargados</div>
          </div>
          <div>
            <div className="text-[26px] font-semibold leading-none" style={{ color: T.tinta, fontFamily: mono }}>{mb}</div>
            <div className="mt-1.5 text-[12px]" style={{ color: T.tenue, fontFamily: sans }}>MB en el servidor</div>
          </div>
        </div>
        <p className="mt-4 border-t pt-3.5 text-[11.5px] leading-snug" style={{ borderColor: T.linea, color: T.tenue, fontFamily: sans }}>
          Los archivos viven en la API, no en el navegador. El expediente municipal sigue entregándose
          físico — esto es la copia digital que evita rearmar la carpeta en cada corrección.
        </p>
      </Panel>
    </>
  );
}
