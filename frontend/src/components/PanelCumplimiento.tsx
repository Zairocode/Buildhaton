import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Bell, Blocks, Check, Copy, Download, Handshake, LayoutDashboard, Link2, Loader2,
  Paperclip, ShieldCheck, Trash2, Users as UsersIcon, FolderKanban,
} from "lucide-react";
import {
  borrarDoc, evaluar, pideFecha, subirDoc, urlDoc, type Documento, type Requisito,
} from "../lib/motor";
import {
  ACCESOS, ESTADOS, cargadosDe, permisosDe, sesionDe, useDocs, useStore, type ProyectoPanel,
} from "../lib/estado";
import { Barra, Chip, Etiqueta, Panel, T, mono, sans } from "./panel/ui";
import { RevisionExpediente } from "./panel/revision";
import { Notificaciones } from "./panel/notificaciones";
import { Administracion, Dashboard, NuevoProyecto, Proyectos, Usuarios, contar } from "./panel/vistas";

/* ===================== FICHA ===================== */

function Dato({ label, valor, esMono }: { label: string; valor: string; esMono?: boolean }) {
  return (
    <div>
      <Etiqueta>{label}</Etiqueta>
      <div className="mt-1.5 text-[14px]" style={{ color: T.tinta, fontFamily: esMono ? mono : sans }}>{valor}</div>
    </div>
  );
}

/**
 * Carga de un requisito. `<input type="file">` escondido detrás de un label —
 * sin dropzone ni librería: el archivo viaja a la API y queda en disco.
 *
 * La fecha se pide solo donde el requisito declara un plazo; es lo que permite
 * al motor de fallas decir "vencida" en vez de "no se sabe".
 */
function Cargar({
  doc, puede, pedirFecha, onSubir, onBorrar,
}: {
  doc?: Documento;
  puede: boolean;
  pedirFecha: boolean;
  onSubir: (f: File, fecha: string) => Promise<void>;
  onBorrar: () => Promise<void>;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [fecha, setFecha] = useState("");

  const correr = (accion: () => Promise<void>) => {
    setOcupado(true);
    accion().finally(() => setOcupado(false));
  };

  if (ocupado)
    return <Loader2 size={14} className="animate-spin" style={{ color: T.tenue }} />;

  if (doc)
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <a
            href={urlDoc(doc.id)}
            className="flex max-w-[190px] items-center gap-1.5 truncate text-[11.5px]"
            style={{ color: T.ok, fontFamily: mono }}
            title={doc.archivo}
          >
            <Check size={12} style={{ flexShrink: 0 }} />
            <span className="truncate">{doc.archivo}</span>
            <Download size={11} style={{ flexShrink: 0, color: T.tenue }} />
          </a>
          {pedirFecha && (
            <span className="text-[10.5px]" style={{ color: doc.fecha_emision ? T.tenue : T.alerta, fontFamily: mono }}>
              {doc.fecha_emision ? `emitida ${doc.fecha_emision}` : "sin fecha de emisión"}
            </span>
          )}
        </div>
        {puede && (
          <button onClick={() => correr(onBorrar)} title="Quitar archivo">
            <Trash2 size={13} style={{ color: T.tenue }} />
          </button>
        )}
      </div>
    );

  if (!puede) return <Chip>Pendiente</Chip>;

  return (
    <div className="flex items-center gap-2">
      {pedirFecha && (
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          title="Fecha de emisión del documento"
          className="rounded-[3px] border px-2 py-1.5 text-[11.5px] outline-none"
          style={{ borderColor: T.lineaFuerte, color: T.medio, background: T.blanco, fontFamily: mono }}
        />
      )}
      <label
        className="inline-flex cursor-pointer items-center gap-2 rounded-[3px] px-3.5 py-2 text-[13px] font-semibold"
        style={{ background: T.blanco, color: T.medio, border: `1px solid ${T.lineaFuerte}`, fontFamily: sans }}
      >
        <Paperclip size={13} /> Cargar
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";           // permite volver a elegir el mismo archivo
            if (f) correr(() => onSubir(f, fecha));
          }}
        />
      </label>
    </div>
  );
}

function Ficha({
  p, onVolver, puedeSubir, usuario, onPortal,
}: { p: ProyectoPanel; onVolver: () => void; puedeSubir: boolean; usuario: string; onPortal: () => void }) {
  const [tab, setTab] = useState<"info" | "docs" | "revision" | "vac">("docs");
  const [rs, setRs] = useState<Requisito[] | null>(null);
  const { docs, recargar } = useDocs(p.id);
  const [error, setError] = useState<string | null>(null);
  /** cada carga o borrado invalida la revisión: el motor de fallas la rehace */
  const [refresco, setRefresco] = useState(0);

  useEffect(() => {
    setRs(null);
    evaluar(p.datos).then((r) => setRs(r.requirements)).catch(() => setRs([]));
  }, [p]);

  /** Un archivo por requisito: el último que se subió gana. */
  const porDocumento = useMemo(() => {
    const m = new Map<string, Documento>();
    docs.forEach((d) => m.set(d.documento, d));
    return m;
  }, [docs]);

  const subir = (documento: string, requisito: string) => async (archivo: File, fechaEmision: string) => {
    setError(null);
    try {
      await subirDoc({ proyecto: p.id, documento, requisito, usuario, fechaEmision, archivo });
      await recargar();
      setRefresco((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir el archivo");
    }
  };

  const borrar = (id: string) => async () => {
    await borrarDoc(id);
    await recargar();
    setRefresco((n) => n + 1);
  };

  const cargados = cargadosDe(p, docs);
  const total = rs ? contar(rs) : null;
  const pct = total ? Math.round((cargados / total) * 100) : 0;

  const grupos = useMemo(() => {
    const m = new Map<string, Requisito[]>();
    (rs ?? []).filter((r) => r.tipo !== "aviso").forEach((r) =>
      m.set(r.institucion, [...(m.get(r.institucion) ?? []), r])
    );
    return [...m.entries()];
  }, [rs]);
  const avisos = (rs ?? []).filter((r) => r.tipo === "aviso");

  return (
    <>
      <button
        onClick={onVolver}
        className="mb-5 flex items-center gap-1.5 text-[12.5px] font-semibold"
        style={{ color: T.acento, fontFamily: sans }}
      >
        <ArrowLeft size={14} /> Volver
      </button>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em]" style={{ color: T.tinta, fontFamily: sans }}>
          {p.nombre}
        </h1>
        <span className="text-[12px]" style={{ color: T.tenue, fontFamily: mono }}>{p.id}</span>
        <Chip tono={ESTADOS[p.estado].tono}>{ESTADOS[p.estado].label}</Chip>
      </div>

      <div className="mb-7 flex gap-6 border-b" style={{ borderColor: T.linea }}>
        {([["info", "Información"], ["docs", "Requisitos"], ["revision", "Revisión"], ["vac", "VAC"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="-mb-px border-b-2 pb-3 text-[13.5px]"
            style={{
              borderColor: tab === k ? T.acento : "transparent",
              color: tab === k ? T.acento : T.tenue,
              fontWeight: tab === k ? 600 : 400,
              fontFamily: sans,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <Panel className="max-w-4xl p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Dato label="Municipalidad" valor={p.municipalidadLabel} />
            <Dato label="Tipo de obra" valor={p.tipo} />
            <Dato label="Dirección" valor={p.direccion || "—"} />
            <Dato label="Área de terreno" valor={p.areaTerreno ? `${p.areaTerreno.toLocaleString("es-GT")} m²` : "—"} esMono />
            <Dato label="Área de construcción" valor={`${Number(p.datos.area_construccion_m2 ?? 0).toLocaleString("es-GT")} m²`} esMono />
            <Dato label="Altura" valor={`${p.datos.altura_m ?? 0} m`} esMono />
          </div>
        </Panel>
      )}

      {tab === "docs" && (
        <div className="max-w-4xl">
          <div className="mb-7 flex items-center gap-4">
            <span className="whitespace-nowrap text-[13px]" style={{ color: T.medio, fontFamily: mono }}>
              {total == null ? "calculando…" : `${cargados}/${total} · ${pct}%`}
            </span>
            <div className="flex-1"><Barra pct={pct} /></div>
          </div>

          {error && (
            <div className="mb-5 rounded-[4px] border p-3 text-[12.5px]" style={{ borderColor: T.peligro, background: T.peligroSuave, color: T.peligro, fontFamily: sans }}>
              {error}
            </div>
          )}

          {total == null && (
            <div className="flex items-center gap-2 text-[13px]" style={{ color: T.tenue, fontFamily: sans }}>
              <Loader2 size={14} className="animate-spin" /> evaluando normativa de {p.municipalidadLabel}…
            </div>
          )}

          {grupos.map(([institucion, reglas]) => (
            <section key={institucion} className="mb-7">
              <h2 className="mb-3 text-[15px] font-semibold" style={{ color: T.tinta, fontFamily: sans }}>
                {institucion}
              </h2>
              <Panel>
                {reglas.map((r) => (
                  <div key={r.id}>
                    {r.documentos.map((d, i) => (
                      <div
                        key={d}
                        className="flex items-center justify-between gap-4 px-5 py-3"
                        style={{ borderTop: i === 0 && r === reglas[0] ? "none" : `1px solid ${T.linea}` }}
                      >
                        <span className="text-[13px] leading-snug" style={{ color: T.tinta, fontFamily: sans }}>{d}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          {r.confianza === "SIN_CONFIRMAR" && <Chip tono="alerta">Sin confirmar</Chip>}
                          {r.tipo === "gestion" ? (
                            <Chip tono="peligro"><Handshake size={11} /> No es un documento</Chip>
                          ) : (
                            <Cargar
                              doc={porDocumento.get(d)}
                              puede={puedeSubir}
                              pedirFecha={pideFecha(d)}
                              onSubir={subir(d, r.id)}
                              onBorrar={borrar(porDocumento.get(d)?.id ?? "")}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    {r.nota && (
                      <p
                        className="mx-5 mb-3 border-l-2 py-1.5 pl-3 text-[11.5px] italic leading-snug"
                        style={{ borderColor: T.alerta, color: T.tenue, fontFamily: sans }}
                      >
                        {r.nota}
                      </p>
                    )}
                  </div>
                ))}
              </Panel>
              <p className="mt-1.5 text-[10.5px]" style={{ color: T.tenue, fontFamily: mono }}>
                {[...new Set(reglas.map((r) => r.fuente))].join(" · ")}
              </p>
            </section>
          ))}

          {avisos.map((a) => (
            <div key={a.id} className="rounded-[4px] border p-4" style={{ borderColor: T.alerta, background: T.alertaSuave }}>
              {a.documentos.map((d) => (
                <p key={d} className="text-[12.5px] font-semibold" style={{ color: T.tinta, fontFamily: sans }}>{d}</p>
              ))}
              <p className="mt-1 text-[10.5px]" style={{ color: T.tenue, fontFamily: mono }}>{a.fuente}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "revision" && <RevisionExpediente p={p} refresco={refresco} />}

      {tab === "vac" && (
        <Panel className="max-w-3xl p-6">
          <Etiqueta>Ventanilla Ágil de la Construcción</Etiqueta>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <Etiqueta>ID de proyecto</Etiqueta>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[19px] font-semibold" style={{ color: T.tinta, fontFamily: mono }}>{p.id}</span>
                <Copy size={14} style={{ color: T.tenue }} />
              </div>
            </div>
            <div>
              <Etiqueta>Link de VAC</Etiqueta>
              <div className="mt-1.5 flex items-center gap-2">
                <Link2 size={13} style={{ color: T.tenue }} />
                <span className="text-[12.5px]" style={{ color: T.tinta, fontFamily: mono }}>
                  app.vac.com.gt/tramite/{p.id}
                </span>
              </div>
            </div>
          </div>
          <ol className="mt-6 ml-4 list-decimal space-y-1 text-[13px]" style={{ color: T.medio, fontFamily: sans }}>
            <li>Abrí el portal de la ventanilla en tu navegador.</li>
            <li>La extensión de Cimiento detecta el proyecto por su ID.</li>
            <li>Completa el formulario con los datos que ya cargaste acá.</li>
          </ol>

          <button
            onClick={onPortal}
            className="mt-5 inline-flex items-center gap-2 rounded-[3px] px-3.5 py-2 text-[13px] font-semibold"
            style={{ background: T.tinta, color: T.blanco, fontFamily: sans }}
          >
            <Blocks size={14} /> Abrir portal con la extensión
          </button>
          <p className="mt-2 text-[11px]" style={{ color: T.tenue, fontFamily: sans }}>
            Abre un portal simulado, construido para esta demostración.
          </p>
          <p className="mt-5 border-t pt-4 text-[11.5px] leading-snug" style={{ borderColor: T.linea, color: T.tenue, fontFamily: sans }}>
            El VAC02 cubre las instituciones de gobierno central. Los requisitos municipales de este
            proyecto no viajan con el expediente VAC: se tramitan aparte, en {p.municipalidadLabel}.
          </p>
        </Panel>
      )}
    </>
  );
}

/* ===================== SHELL ===================== */

type Vista = "dashboard" | "proyectos" | "usuarios" | "nuevo" | "admin" | "avisos";

const NAV = [
  { k: "dashboard", l: "Resumen", Icono: LayoutDashboard, soloAdmin: false },
  { k: "proyectos", l: "Proyectos", Icono: FolderKanban, soloAdmin: false },
  { k: "avisos", l: "Notificaciones", Icono: Bell, soloAdmin: false },
  { k: "usuarios", l: "Usuarios", Icono: UsersIcon, soloAdmin: false },
  { k: "admin", l: "Administración", Icono: ShieldCheck, soloAdmin: true },
] as const;

export default function PanelCumplimiento({
  onLlenarVac, onAbrirPortal,
}: {
  onLlenarVac: (p: ProyectoPanel) => void;
  onAbrirPortal: (p: ProyectoPanel) => void;
}) {
  const { store, setStore } = useStore();
  const [vista, setVista] = useState<Vista>("dashboard");
  const [abierto, setAbierto] = useState<ProyectoPanel | null>(null);

  const yo = sesionDe(store);
  const permisos = permisosDe(store);

  const abrir = (p: ProyectoPanel) => {
    setAbierto(p);
    setVista("proyectos");
  };

  /** Cambiar de usuario sale de una vista que ese perfil quizá ya no puede ver. */
  const cambiarSesion = (id: string) => {
    setStore((s) => ({ ...s, sesion: id }));
    setVista("dashboard");
    setAbierto(null);
  };

  return (
    <div className="flex min-h-screen" style={{ background: T.papel, fontFamily: sans }}>
      <aside className="w-56 shrink-0 border-r px-4 py-6" style={{ borderColor: T.linea, background: T.blanco }}>
        <div className="mb-8 px-2">
          <div className="text-[16px] font-semibold tracking-[-0.01em]" style={{ color: T.tinta }}>Cimiento</div>
          <div className="text-[11px]" style={{ color: T.tenue }}>Panel de cumplimiento</div>
        </div>
        <nav className="space-y-0.5">
          {NAV.filter((n) => !n.soloAdmin || permisos.administrar).map(({ k, l, Icono }) => {
            const activo = vista === k && !abierto;
            return (
              <button
                key={k}
                onClick={() => { setVista(k); setAbierto(null); }}
                className="flex w-full items-center gap-2.5 rounded-[3px] px-2.5 py-2 text-left text-[13px]"
                style={{
                  background: activo ? T.acentoSuave : "transparent",
                  color: activo ? T.acento : T.medio,
                  fontWeight: activo ? 600 : 400,
                }}
              >
                <Icono size={15} /> {l}
              </button>
            );
          })}
        </nav>
        <div className="mt-8 border-t px-2 pt-4" style={{ borderColor: T.linea }}>
          <Etiqueta>Empresa</Etiqueta>
          <div className="mt-1.5 text-[12px] leading-snug" style={{ color: T.medio }}>
            {store.empresa.nombreComercial}
          </div>
          <div className="text-[11px]" style={{ color: T.tenue, fontFamily: mono }}>NIT {store.empresa.nit}</div>
        </div>

        {/* Sin login: se cambia de usuario a mano para ver el panel con cada permiso. */}
        <div className="mt-5 border-t px-2 pt-4" style={{ borderColor: T.linea }}>
          <Etiqueta>Sesión</Etiqueta>
          <select
            value={yo?.id ?? ""}
            onChange={(e) => cambiarSesion(e.target.value)}
            className="mt-1.5 w-full rounded-[3px] border px-2 py-1.5 text-[12px] outline-none"
            style={{ borderColor: T.linea, color: T.tinta, background: T.blanco, fontFamily: sans }}
          >
            {store.usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
          {yo && (
            <div className="mt-2">
              <Chip tono={yo.acceso === "admin" ? "curso" : "neutro"}>{ACCESOS[yo.acceso]?.label ?? yo.acceso}</Chip>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto px-9 py-8">
        {abierto ? (
          <Ficha
            p={abierto}
            onVolver={() => setAbierto(null)}
            puedeSubir={permisos.subir}
            usuario={yo?.nombre ?? ""}
            onPortal={() => onAbrirPortal(abierto)}
          />
        ) : vista === "dashboard" ? (
          <Dashboard store={store} onAbrir={abrir} />
        ) : vista === "avisos" ? (
          <Notificaciones store={store} setStore={setStore} />
        ) : vista === "usuarios" ? (
          <Usuarios store={store} setStore={setStore} />
        ) : vista === "admin" && permisos.administrar ? (
          <Administracion store={store} setStore={setStore} />
        ) : vista === "nuevo" && permisos.crearProyecto ? (
          <NuevoProyecto
            store={store}
            onCancelar={() => setVista("proyectos")}
            onCrear={(p) => {
              setStore((s) => ({ ...s, proyectos: [...s.proyectos, p] }));
              onLlenarVac(p);
            }}
          />
        ) : (
          <Proyectos store={store} onAbrir={abrir} onNuevo={() => setVista("nuevo")} />
        )}
      </main>
    </div>
  );
}
