import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Copy, Handshake, LayoutDashboard, Link2, Loader2, Users as UsersIcon, FolderKanban,
} from "lucide-react";
import { evaluar, type Requisito } from "../lib/motor";
import { ESTADOS, useStore, type ProyectoPanel } from "../lib/estado";
import { Barra, Boton, Chip, Etiqueta, Panel, T, mono, sans } from "./panel/ui";
import { Dashboard, NuevoProyecto, Proyectos, Usuarios, contar } from "./panel/vistas";

/* ===================== FICHA ===================== */

function Dato({ label, valor, esMono }: { label: string; valor: string; esMono?: boolean }) {
  return (
    <div>
      <Etiqueta>{label}</Etiqueta>
      <div className="mt-1.5 text-[14px]" style={{ color: T.tinta, fontFamily: esMono ? mono : sans }}>{valor}</div>
    </div>
  );
}

function Ficha({ p, onVolver }: { p: ProyectoPanel; onVolver: () => void }) {
  const [tab, setTab] = useState<"info" | "docs" | "vac">("docs");
  const [rs, setRs] = useState<Requisito[] | null>(null);

  useEffect(() => {
    setRs(null);
    evaluar(p.datos).then((r) => setRs(r.requirements)).catch(() => setRs([]));
  }, [p]);

  const total = rs ? contar(rs) : null;
  const pct = total ? Math.round((p.cargados / total) * 100) : 0;

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
        {([["info", "Información"], ["docs", "Requisitos"], ["vac", "VAC"]] as const).map(([k, l]) => (
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
              {total == null ? "calculando…" : `${p.cargados}/${total} · ${pct}%`}
            </span>
            <div className="flex-1"><Barra pct={pct} /></div>
          </div>

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
                            <Boton variante="borde">Cargar</Boton>
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
            <li>Copiá el ID o el link del proyecto.</li>
            <li>Abrí la extensión de VAC en tu navegador.</li>
            <li>Pegalo ahí — la extensión completa el formulario automáticamente.</li>
          </ol>
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

type Vista = "dashboard" | "proyectos" | "usuarios" | "nuevo";

const NAV = [
  { k: "dashboard", l: "Resumen", Icono: LayoutDashboard },
  { k: "proyectos", l: "Proyectos", Icono: FolderKanban },
  { k: "usuarios", l: "Usuarios", Icono: UsersIcon },
] as const;

export default function PanelCumplimiento({ onLlenarVac }: { onLlenarVac: (p: ProyectoPanel) => void }) {
  const { store, setStore } = useStore();
  const [vista, setVista] = useState<Vista>("dashboard");
  const [abierto, setAbierto] = useState<ProyectoPanel | null>(null);

  const abrir = (p: ProyectoPanel) => {
    setAbierto(p);
    setVista("proyectos");
  };

  return (
    <div className="flex min-h-screen" style={{ background: T.papel, fontFamily: sans }}>
      <aside className="w-56 shrink-0 border-r px-4 py-6" style={{ borderColor: T.linea, background: T.blanco }}>
        <div className="mb-8 px-2">
          <div className="text-[16px] font-semibold tracking-[-0.01em]" style={{ color: T.tinta }}>Tramitología</div>
          <div className="text-[11px]" style={{ color: T.tenue }}>Panel de cumplimiento</div>
        </div>
        <nav className="space-y-0.5">
          {NAV.map(({ k, l, Icono }) => {
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
      </aside>

      <main className="flex-1 overflow-x-auto px-9 py-8">
        {abierto ? (
          <Ficha p={abierto} onVolver={() => setAbierto(null)} />
        ) : vista === "dashboard" ? (
          <Dashboard store={store} onAbrir={abrir} />
        ) : vista === "usuarios" ? (
          <Usuarios store={store} setStore={setStore} />
        ) : vista === "nuevo" ? (
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
