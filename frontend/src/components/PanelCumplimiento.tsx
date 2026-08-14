import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Grid2x2, Link2, Loader2, Users } from "lucide-react";
import { evaluar, type Requisito } from "../lib/motor";
import { ESTADOS, PROYECTOS, type ProyectoPanel } from "../lib/proyectos";

/* ---------- Modernist ---------- */
const CREMA = "#FAF7F2";
const TINTA = "#1C1917";
const CARMIN = "#C2410C";
const LINEA = "#E3DDD3";
const TENUE = "#78716C";
const OK = "#2D9D78";
const serif = { fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif" };

/** Un requisito calculado vale por documento, salvo los avisos. */
function contar(rs: Requisito[]) {
  return rs.filter((r) => r.tipo !== "aviso").reduce((n, r) => n + r.documentos.length, 0);
}

/* ================= Dashboard ================= */

function Dashboard({ onAbrir }: { onAbrir: (p: ProyectoPanel) => void }) {
  const [totales, setTotales] = useState<Record<string, number | null>>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    // El total de cada proyecto lo dice el motor, no una constante.
    PROYECTOS.forEach((p) =>
      evaluar(p.datos)
        .then((r) => setTotales((t) => ({ ...t, [p.id]: contar(r.requirements) })))
        .catch(() => setTotales((t) => ({ ...t, [p.id]: null })))
    );
  }, []);

  const filtrados = PROYECTOS.filter(
    (p) =>
      p.nombre.toLowerCase().includes(q.toLowerCase()) ||
      p.municipalidadLabel.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[52px] leading-[1.05] tracking-tight" style={{ ...serif, color: TINTA }}>
            Proyectos
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: TENUE }}>
            Gestioná el archivo de cumplimiento de cada proyecto inmobiliario
          </p>
        </div>
        <button
          className="shrink-0 rounded px-4 py-2.5 text-[13px] font-semibold text-white"
          style={{ background: CARMIN }}
        >
          + Nuevo proyecto
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar proyecto o municipalidad"
        className="mb-8 w-full max-w-md rounded border px-3 py-2.5 text-[13px] outline-none"
        style={{ borderColor: LINEA, background: "white", color: TINTA }}
      />

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="text-[10.5px] font-semibold uppercase tracking-[0.09em]" style={{ color: TENUE }}>
            <th className="border-b pb-3 pr-4" style={{ borderColor: LINEA }}>Proyecto</th>
            <th className="border-b pb-3 pr-4" style={{ borderColor: LINEA }}>Municipalidad</th>
            <th className="border-b pb-3 pr-4" style={{ borderColor: LINEA }}>Tipo</th>
            <th className="border-b pb-3 pr-4" style={{ borderColor: LINEA }}>Documentos</th>
            <th className="border-b pb-3" style={{ borderColor: LINEA }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((p) => {
            const total = totales[p.id];
            const pct = total ? Math.min(100, Math.round((p.cargados / total) * 100)) : 0;
            const est = ESTADOS[p.estado];
            return (
              <tr
                key={p.id}
                onClick={() => onAbrir(p)}
                className="cursor-pointer transition-colors hover:bg-black/[0.02]"
              >
                <td className="border-b py-4 pr-4" style={{ borderColor: LINEA }}>
                  <div className="text-[15px] font-semibold" style={{ color: TINTA }}>{p.nombre}</div>
                  <div className="mt-0.5 font-mono text-[11px]" style={{ color: TENUE }}>{p.id}</div>
                </td>
                <td className="border-b py-4 pr-4 text-[13.5px]" style={{ borderColor: LINEA, color: TINTA }}>
                  {p.municipalidadLabel}
                </td>
                <td className="border-b py-4 pr-4 text-[13.5px]" style={{ borderColor: LINEA, color: TINTA }}>
                  {p.tipo}
                </td>
                <td className="border-b py-4 pr-4" style={{ borderColor: LINEA }}>
                  {total == null ? (
                    <span className="flex items-center gap-1.5 text-[12px]" style={{ color: TENUE }}>
                      <Loader2 size={11} className="animate-spin" /> calculando…
                    </span>
                  ) : (
                    <>
                      <div className="text-[13px]" style={{ color: TINTA }}>
                        {p.cargados}/{total} cargados
                      </div>
                      <div className="mt-1.5 h-[3px] w-40 rounded-full" style={{ background: LINEA }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CARMIN }} />
                      </div>
                    </>
                  )}
                </td>
                <td className="border-b py-4" style={{ borderColor: LINEA }}>
                  <span
                    className="inline-block rounded border px-2.5 py-1 text-[11.5px] font-medium"
                    style={{
                      borderColor: est.tono === "acento" ? CARMIN : "transparent",
                      color: est.tono === "acento" ? CARMIN : est.tono === "ok" ? OK : TENUE,
                    }}
                  >
                    {est.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="mt-6 text-[11.5px]" style={{ color: TENUE }}>
        El total de documentos de cada proyecto lo calcula el motor de reglas contra la normativa de su
        municipalidad. No es un número fijo: cambia con el proyecto y con el municipio.
      </p>
    </>
  );
}

/* ================= Ficha ================= */

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.09em]" style={{ color: TENUE }}>
        {label}
      </div>
      <div className="mt-1 text-[15px]" style={{ color: TINTA }}>{valor}</div>
    </div>
  );
}

function Ficha({ p, onVolver }: { p: ProyectoPanel; onVolver: () => void }) {
  const [tab, setTab] = useState<"info" | "docs" | "vac">("info");
  const [rs, setRs] = useState<Requisito[] | null>(null);

  useEffect(() => {
    setRs(null);
    evaluar(p.datos).then((r) => setRs(r.requirements)).catch(() => setRs([]));
  }, [p]);

  const total = rs ? contar(rs) : null;
  const pct = total ? Math.min(100, Math.round((p.cargados / total) * 100)) : 0;
  const est = ESTADOS[p.estado];

  /* Agrupado por institucion: asi es como llegan los rechazos, uno por institucion. */
  const grupos = useMemo(() => {
    const m = new Map<string, Requisito[]>();
    (rs ?? []).filter((r) => r.tipo !== "aviso").forEach((r) => {
      m.set(r.institucion, [...(m.get(r.institucion) ?? []), r]);
    });
    return [...m.entries()];
  }, [rs]);

  const avisos = (rs ?? []).filter((r) => r.tipo === "aviso");

  return (
    <>
      <button
        onClick={onVolver}
        className="mb-6 flex items-center gap-2 text-[13px] font-semibold"
        style={{ color: CARMIN }}
      >
        <ArrowLeft size={15} /> Volver a proyectos
      </button>

      <div className="mb-7 flex flex-wrap items-baseline gap-4">
        <h1 className="text-[46px] leading-none tracking-tight" style={{ ...serif, color: TINTA }}>
          {p.nombre}
        </h1>
        <span className="font-mono text-[12px]" style={{ color: TENUE }}>{p.id}</span>
        <span
          className="rounded border px-2.5 py-1 text-[11.5px] font-medium"
          style={{
            borderColor: est.tono === "acento" ? CARMIN : LINEA,
            color: est.tono === "acento" ? CARMIN : TENUE,
          }}
        >
          {est.label}
        </span>
      </div>

      <div className="mb-7 flex gap-7 border-b" style={{ borderColor: LINEA }}>
        {([["info", "Info"], ["docs", "Documentos"], ["vac", "VAC"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="-mb-px border-b-2 pb-3 text-[14px] transition-colors"
            style={{
              borderColor: tab === k ? CARMIN : "transparent",
              color: tab === k ? CARMIN : TENUE,
              fontWeight: tab === k ? 600 : 400,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="grid gap-7 sm:grid-cols-2">
          <Dato label="Municipalidad" valor={p.municipalidadLabel} />
          <Dato label="Tipo de obra" valor={p.tipo} />
          <Dato label="Dirección" valor={p.direccion} />
          <Dato label="Área de terreno" valor={`${p.areaTerreno.toLocaleString("es-GT")} m²`} />
          <Dato
            label="Área de construcción"
            valor={`${Number(p.datos.area_construccion_m2).toLocaleString("es-GT")} m²`}
          />
          <Dato label="Altura" valor={`${p.datos.altura_m} m`} />
          <Dato label="Propietario / desarrollador" valor={p.propietario} />
          <Dato label="NIT" valor={p.nit} />
        </div>
      )}

      {tab === "docs" && (
        <div>
          <div className="mb-7 flex items-center gap-4">
            <span className="text-[13.5px]" style={{ color: TINTA }}>
              {total == null ? "calculando…" : `${p.cargados}/${total} cargados · ${pct}%`}
            </span>
            <div className="h-[3px] flex-1 rounded-full" style={{ background: LINEA }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CARMIN }} />
            </div>
          </div>

          {grupos.map(([institucion, reglas]) => (
            <section key={institucion} className="mb-8">
              <h2 className="mb-3 text-[22px]" style={{ ...serif, color: TINTA }}>{institucion}</h2>
              {reglas.map((r) => (
                <div key={r.id}>
                  {r.documentos.map((d) => (
                    <div
                      key={d}
                      className="flex items-center justify-between gap-4 border-b py-3"
                      style={{ borderColor: LINEA }}
                    >
                      <span className="text-[13.5px]" style={{ color: TINTA }}>{d}</span>
                      <div className="flex shrink-0 items-center gap-3">
                        {r.confianza === "SIN_CONFIRMAR" && (
                          <span className="text-[10.5px] font-bold" style={{ color: CARMIN }}>
                            SIN CONFIRMAR
                          </span>
                        )}
                        {r.tipo === "gestion" ? (
                          <span
                            className="rounded border px-2 py-1 text-[11px] font-semibold"
                            style={{ borderColor: CARMIN, color: CARMIN }}
                          >
                            No es un documento
                          </span>
                        ) : (
                          <button
                            className="rounded px-3 py-1.5 text-[11.5px] font-semibold text-white"
                            style={{ background: TINTA }}
                          >
                            Cargar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {r.nota && (
                    <p className="border-l-2 py-2 pl-3 text-[11.5px] italic" style={{ borderColor: CARMIN, color: TENUE }}>
                      {r.nota}
                    </p>
                  )}
                </div>
              ))}
            </section>
          ))}

          {avisos.map((a) => (
            <div key={a.id} className="rounded border p-4" style={{ borderColor: CARMIN, background: "#FFF8F3" }}>
              {a.documentos.map((d) => (
                <p key={d} className="text-[13px] font-semibold" style={{ color: TINTA }}>{d}</p>
              ))}
              <p className="mt-1 text-[11px]" style={{ color: TENUE }}>{a.fuente}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "vac" && (
        <div className="rounded p-7" style={{ background: "#F3EEE7" }}>
          <div className="mb-6 text-[10.5px] font-bold uppercase tracking-[0.11em]" style={{ color: CARMIN }}>
            Ventanilla Ágil de la Construcción
          </div>
          <div className="mb-7 grid gap-7 sm:grid-cols-2">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.09em]" style={{ color: TENUE }}>
                ID de proyecto
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="font-mono text-[22px] font-bold" style={{ color: TINTA }}>{p.id}</span>
                <Copy size={15} style={{ color: TENUE }} />
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.09em]" style={{ color: TENUE }}>
                Link de VAC
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <Link2 size={14} style={{ color: TENUE }} />
                <span className="text-[13px]" style={{ color: TINTA }}>
                  https://app.vac.com.gt/tramite/{p.id}
                </span>
                <Copy size={15} style={{ color: TENUE }} />
              </div>
            </div>
          </div>
          <h3 className="mb-2 text-[18px]" style={{ ...serif, color: TINTA }}>Cómo usarlo</h3>
          <ol className="ml-4 list-decimal space-y-1 text-[13px]" style={{ color: TINTA }}>
            <li>Copiá el ID o el link del proyecto.</li>
            <li>Abrí la extensión de VAC en tu navegador.</li>
            <li>Pegalo ahí — la extensión completa el formulario de VAC automáticamente.</li>
          </ol>
          <p className="mt-5 border-t pt-4 text-[11.5px]" style={{ borderColor: LINEA, color: TENUE }}>
            El VAC02 cubre las instituciones de gobierno central. Los requisitos municipales de este
            proyecto viven en la pestaña Documentos y no viajan con el expediente VAC.
          </p>
        </div>
      )}
    </>
  );
}

/* ================= Shell ================= */

export default function PanelCumplimiento({ onIrAlWizard }: { onIrAlWizard: () => void }) {
  const [abierto, setAbierto] = useState<ProyectoPanel | null>(null);
  const [seccion, setSeccion] = useState<"proyectos" | "usuarios">("proyectos");

  return (
    <div className="flex min-h-screen" style={{ background: CREMA }}>
      <aside className="w-60 shrink-0 border-r p-6" style={{ borderColor: LINEA }}>
        <div className="mb-8">
          <div className="text-[23px] leading-tight" style={{ ...serif, color: TINTA }}>Tramitología</div>
          <div className="text-[11.5px]" style={{ color: TENUE }}>Panel de cumplimiento</div>
        </div>
        <nav className="space-y-1">
          {([["proyectos", "Proyectos", Grid2x2], ["usuarios", "Usuarios", Users]] as const).map(
            ([k, l, Icono]) => (
              <button
                key={k}
                onClick={() => {
                  setSeccion(k);
                  setAbierto(null);
                }}
                className="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-left text-[13.5px] transition-colors"
                style={{
                  background: seccion === k ? CARMIN : "transparent",
                  color: seccion === k ? "white" : TENUE,
                  fontWeight: seccion === k ? 600 : 400,
                }}
              >
                <Icono size={15} /> {l}
              </button>
            )
          )}
        </nav>
        <button
          onClick={onIrAlWizard}
          className="mt-8 w-full rounded border px-3 py-2 text-[12px] font-medium"
          style={{ borderColor: LINEA, color: TENUE }}
        >
          Abrir formulario VAC02
        </button>
      </aside>

      <main className="flex-1 overflow-x-auto p-10">
        {seccion === "usuarios" ? (
          <>
            <h1 className="text-[52px] leading-none tracking-tight" style={{ ...serif, color: TINTA }}>
              Usuarios
            </h1>
            <p className="mt-3 text-[14px]" style={{ color: TENUE }}>
              Los proyectos cuelgan del NIT de la empresa, no de la persona. Cuando el contratista se va,
              el historial se queda.
            </p>
          </>
        ) : abierto ? (
          <Ficha p={abierto} onVolver={() => setAbierto(null)} />
        ) : (
          <Dashboard onAbrir={setAbierto} />
        )}
      </main>
    </div>
  );
}
