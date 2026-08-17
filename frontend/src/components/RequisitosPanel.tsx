import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, HandCoins, Landmark, Loader2, RefreshCw } from "lucide-react";
import { desdeWizard, evaluar, type DatosMunicipales, type Respuesta } from "../lib/motor";

const NAVY = "#16324F";
const PAPER = "#EDF2F6";
const LINE = "#C7D3DD";
const ORANGE = "#E8622C";
const GREEN = "#2D9D78";
const INK = "#1A2332";

const MUNIS = [
  { id: "muniguate", nombre: "Guatemala (capital)" },
  { id: "scp", nombre: "Santa Catarina Pinula" },
  { id: "xela", nombre: "Quetzaltenango" },
] as const;

/** Solo se pregunta lo que la municipalidad elegida realmente usa. */
function preguntasDe(muni?: string) {
  const comunes = [
    { campo: "fuente_agua", label: "Sistema de agua", opciones: ["nueva", "existente"] },
    { campo: "asientos_fijos", label: "¿Asientos fijos?", bool: true },
  ];
  if (muni === "scp")
    return [
      { campo: "categoria_obra_scp", label: "Categoría de obra", opciones: ["menor", "mayor", "gran_magnitud"] },
      { campo: "fuente_agua_scp", label: "Fuente de agua", opciones: ["empresa_privada", "municipal", "pozo"] },
      { campo: "en_residencial_o_condominio", label: "¿En residencial o condominio?", bool: true },
      ...comunes,
    ];
  if (muni === "xela")
    return [
      { campo: "alto_impacto_pot", label: "¿Proyecto de alto impacto? (Art. 130 POT)", bool: true },
      { campo: "categoria_uso_suelo_xela", label: "Categoría de uso del suelo", opciones: ["residencial", "ordinario", "condicionado"] },
      { campo: "zona_macro_pot", label: "Zona del predio", opciones: ["urbana", "rural", "forestal", "especial"] },
      { campo: "desmembraciones_con_apertura_calle", label: "Desmembraciones con apertura de calle", num: true },
      { campo: "movimiento_tierra_m3", label: "Movimiento de tierra (m³)", num: true },
      ...comunes,
    ];
  return [
    { campo: "en_centro_historico", label: "¿En Centro Histórico?", bool: true },
    { campo: "en_cono_la_aurora", label: "¿En cono de La Aurora?", bool: true },
    { campo: "poligono_irregular", label: "¿Polígono irregular?", bool: true },
    { campo: "con_empagua", label: "¿Factibilidad EMPAGUA?", bool: true },
    { campo: "corte_arboles_m3", label: "Corte de árboles (m³)", num: true },
    { campo: "movimiento_tierra_m3", label: "Movimiento de tierra (m³)", num: true },
    ...comunes,
  ];
}

export default function RequisitosPanel({ form }: { form: any }) {
  const [muni, setMuni] = useState<string>("muniguate");
  const [extra, setExtra] = useState<DatosMunicipales>({});
  const [res, setRes] = useState<Respuesta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proyecto = useMemo(
    () => ({ ...desdeWizard(form), ...extra, municipalidad: muni }),
    [form, extra, muni]
  );

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    setError(null);
    evaluar(proyecto)
      .then((r) => vivo && setRes(r))
      .catch(() => vivo && setError("No se pudo conectar con el motor. ¿Está corriendo api-server?"))
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [proyecto]);

  const reglas = res?.requirements ?? [];
  const avisos = reglas.filter((r) => r.tipo === "aviso");
  const porCapa = (capa: string) => reglas.filter((r) => r.capa === capa && r.tipo !== "aviso");
  const totalDocs = reglas.filter((r) => r.tipo !== "aviso").reduce((n, r) => n + r.documentos.length, 0);

  return (
    <div className="space-y-5">
      {/* --- el golpe: 96 -> los tuyos --- */}
      <div className="rounded-lg p-5" style={{ background: NAVY, color: "white" }}>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold" style={{ color: ORANGE }}>
            {cargando ? "··" : totalDocs}
          </span>
          <span className="text-sm opacity-90">
            requisitos para <b>tu</b> proyecto, de 96 posibles en el Anexo I del VAC02
          </span>
        </div>
        <div className="mt-1 text-[12px] opacity-70">
          {res?.summary.ministerial_rules ?? 0} reglas ministeriales · {res?.summary.municipal_rules ?? 0} municipales
        </div>
      </div>

      {/* --- los datos que el VAC02 nunca pide --- */}
      <div className="rounded-lg border p-4" style={{ borderColor: LINE, background: PAPER }}>
        <div className="mb-3 flex items-start gap-2">
          <Building2 size={16} style={{ color: ORANGE, marginTop: 2 }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: INK }}>
            El Formulario Consolidado pregunta 79 datos y aun así <b>no alcanza</b> para saber qué te pide tu
            municipalidad. Estos son los que nunca pregunta.
          </p>
        </div>

        <div className="mb-3 flex gap-2">
          {MUNIS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMuni(m.id);
                setExtra({});
              }}
              className="rounded border px-3 py-1.5 text-[12px] font-medium transition"
              style={{
                borderColor: muni === m.id ? ORANGE : LINE,
                background: muni === m.id ? ORANGE : "white",
                color: muni === m.id ? "white" : INK,
              }}
            >
              {m.nombre}
            </button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {preguntasDe(muni).map((q: any) => (
            <label key={q.campo} className="flex items-center justify-between gap-2 text-[12px]" style={{ color: INK }}>
              <span className="flex-1">{q.label}</span>
              {q.bool ? (
                <input
                  type="checkbox"
                  checked={Boolean((extra as any)[q.campo])}
                  onChange={(e) => setExtra({ ...extra, [q.campo]: e.target.checked })}
                  style={{ accentColor: ORANGE }}
                />
              ) : q.num ? (
                <input
                  type="number"
                  className="w-20 rounded border px-2 py-1 text-[12px]"
                  style={{ borderColor: LINE }}
                  onChange={(e) => setExtra({ ...extra, [q.campo]: Number(e.target.value) || undefined })}
                />
              ) : (
                <select
                  className="rounded border px-2 py-1 text-[12px]"
                  style={{ borderColor: LINE }}
                  value={(extra as any)[q.campo] ?? ""}
                  onChange={(e) => setExtra({ ...extra, [q.campo]: e.target.value || undefined })}
                >
                  <option value="">—</option>
                  {q.opciones.map((o: string) => (
                    <option key={o} value={o}>
                      {o.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              )}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded border p-3 text-[12px]" style={{ borderColor: ORANGE, color: ORANGE }}>
          {error}
        </div>
      )}

      {/* --- el expediente --- */}
      {(["ministerial", "municipal"] as const).map((capa) => {
        const rs = porCapa(capa);
        if (!rs.length) return null;
        return (
          <section key={capa}>
            <h3
              className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider"
              style={{ color: NAVY }}
            >
              {capa === "ministerial" ? <Landmark size={13} /> : <Building2 size={13} />}
              {capa} · {rs.length} reglas
            </h3>
            <div className="space-y-2">
              {rs.map((r) => (
                <article key={r.id} className="rounded border bg-white p-3" style={{ borderColor: LINE }}>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-[12.5px] font-semibold" style={{ color: NAVY }}>
                      {r.institucion}
                    </span>
                    {r.confianza === "SIN_CONFIRMAR" && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ background: "#FFF3E6", color: ORANGE }}
                      >
                        SIN CONFIRMAR
                      </span>
                    )}
                    {r.tipo === "gestion" && (
                      <span
                        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ background: "#FDECEC", color: "#C0392B" }}
                      >
                        <HandCoins size={10} /> NO ES UN DOCUMENTO
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {r.documentos.map((d) => (
                      <li key={d} className="flex gap-2 text-[12px] leading-snug" style={{ color: INK }}>
                        <span style={{ color: GREEN }}>▸</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  {r.nota && (
                    <p className="mt-2 border-l-2 pl-2 text-[11px] italic" style={{ borderColor: ORANGE, color: "#6B7A89" }}>
                      {r.nota}
                    </p>
                  )}
                  <p className="mt-1.5 text-[10px]" style={{ color: "#9AA8B5" }}>
                    {r.fuente}
                  </p>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {/* --- la honestidad --- */}
      {avisos.map((a) => (
        <div
          key={a.id}
          className="flex gap-2 rounded border p-3"
          style={{ borderColor: ORANGE, background: "#FFF8F3" }}
        >
          <AlertTriangle size={15} style={{ color: ORANGE, flexShrink: 0, marginTop: 1 }} />
          <div>
            {a.documentos.map((d) => (
              <p key={d} className="text-[12px] font-medium" style={{ color: INK }}>
                {d}
              </p>
            ))}
            <p className="mt-0.5 text-[10.5px]" style={{ color: "#9AA8B5" }}>
              {a.fuente}
            </p>
          </div>
        </div>
      ))}

      {cargando && (
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "#6B7A89" }}>
          <Loader2 size={13} className="animate-spin" /> consultando el motor…
        </div>
      )}
      {!cargando && !error && (
        <button
          onClick={() => setExtra({ ...extra })}
          className="flex items-center gap-1.5 text-[11px]"
          style={{ color: "#9AA8B5" }}
        >
          <RefreshCw size={11} /> recalcular
        </button>
      )}
    </div>
  );
}
