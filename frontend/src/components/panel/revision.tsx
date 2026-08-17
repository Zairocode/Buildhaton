/**
 * Motor de fallas, visible. El motor de requisitos dice QUÉ te piden; esto
 * cruza esa lista con lo que realmente cargaste y dice QUÉ va a fallar.
 */
import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, History, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { SEVERIDADES, revisar, type Hallazgo, type Revision, type Severidad } from "../../lib/motor";
import type { ProyectoPanel } from "../../lib/estado";
import { Chip, Etiqueta, Panel, T, mono, sans } from "./ui";

function Contador({ n, label, tono }: { n: number; label: string; tono: string }) {
  return (
    <div className="flex-1 px-5 py-4">
      <div className="text-[26px] font-semibold tracking-[-0.02em]" style={{ color: n ? tono : T.tenue, fontFamily: sans }}>
        {n}
      </div>
      <div className="mt-0.5 text-[11.5px]" style={{ color: T.tenue, fontFamily: sans }}>{label}</div>
    </div>
  );
}

function Fila({ h }: { h: Hallazgo }) {
  const s = SEVERIDADES[h.severidad];
  return (
    <div className="border-t px-5 py-4 first:border-t-0" style={{ borderColor: T.linea }}>
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <Chip tono={s.tono}>{s.label}</Chip>
        <span className="text-[13.5px] font-semibold" style={{ color: T.tinta, fontFamily: sans }}>{h.titulo}</span>
        {h.veces > 0 && (
          <Chip tono="peligro"><History size={11} /> {h.veces} rechazo{h.veces > 1 ? "s" : ""} registrado{h.veces > 1 ? "s" : ""}</Chip>
        )}
      </div>
      {h.documento && (
        <p className="mb-1.5 text-[11.5px] leading-snug" style={{ color: T.medio, fontFamily: mono }}>{h.documento}</p>
      )}
      <p className="text-[12.5px] leading-relaxed" style={{ color: T.medio, fontFamily: sans }}>{h.detalle}</p>
      {h.remedio && (
        <p className="mt-2 border-l-2 py-1 pl-3 text-[12.5px] leading-relaxed"
           style={{ borderColor: T.acento, color: T.tinta, fontFamily: sans }}>
          {h.remedio}
        </p>
      )}
      {h.fuente && (
        <p className="mt-2 text-[10.5px]" style={{ color: T.tenue, fontFamily: mono }}>{h.fuente}</p>
      )}
    </div>
  );
}

/** Los faltantes son muchos y todos dicen lo mismo: se cuentan, no se listan. */
function Faltantes({ hs }: { hs: Hallazgo[] }) {
  const [abierto, setAbierto] = useState(false);
  const Icono = abierto ? ChevronDown : ChevronRight;
  return (
    <div className="border-t px-5 py-4 first:border-t-0" style={{ borderColor: T.linea }}>
      <button onClick={() => setAbierto(!abierto)} className="flex w-full items-center gap-2 text-left">
        <Icono size={14} style={{ color: T.tenue }} />
        <Chip tono="peligro">Bloqueante</Chip>
        <span className="text-[13.5px] font-semibold" style={{ color: T.tinta, fontFamily: sans }}>
          {hs.length} requisitos sin documento cargado
        </span>
      </button>
      {abierto && (
        <ul className="mt-3 space-y-1.5 pl-6">
          {hs.map((h) => (
            <li key={h.id} className="text-[12px] leading-snug" style={{ color: T.medio, fontFamily: sans }}>
              {h.documento}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RevisionExpediente({ p, refresco }: { p: ProyectoPanel; refresco: number }) {
  const [rev, setRev] = useState<Revision | null>(null);

  useEffect(() => {
    setRev(null);
    revisar(p.id, p.datos).then(setRev).catch(() => setRev(null));
  }, [p, refresco]);

  if (!rev)
    return (
      <div className="flex items-center gap-2 text-[13px]" style={{ color: T.tenue, fontFamily: sans }}>
        <Loader2 size={14} className="animate-spin" /> revisando el expediente…
      </div>
    );

  const { resumen: r } = rev;
  const faltantes = rev.hallazgos.filter((h) => h.id.startsWith("faltante-"));
  const resto = rev.hallazgos.filter((h) => !h.id.startsWith("faltante-"));
  const porSev = (s: Severidad) => resto.filter((h) => h.severidad === s);

  return (
    <div className="max-w-4xl">
      <div
        className="mb-5 flex items-start gap-3 rounded-[4px] border p-4"
        style={{
          borderColor: r.listo ? T.ok : T.peligro,
          background: r.listo ? "#F0FDF4" : T.peligroSuave,
        }}
      >
        {r.listo ? <ShieldCheck size={18} style={{ color: T.ok, flexShrink: 0 }} />
                 : <ShieldAlert size={18} style={{ color: T.peligro, flexShrink: 0 }} />}
        <div>
          <p className="text-[13.5px] font-semibold" style={{ color: r.listo ? T.ok : T.peligro, fontFamily: sans }}>
            {r.listo
              ? "Sin bloqueantes: el expediente puede ingresar"
              : `${r.bloqueante} bloqueante${r.bloqueante > 1 ? "s" : ""} — te lo devuelven en ventanilla`}
          </p>
          <p className="mt-0.5 text-[12px]" style={{ color: T.medio, fontFamily: sans }}>
            {rev.cargados} archivo{rev.cargados === 1 ? "" : "s"} cargado{rev.cargados === 1 ? "" : "s"} ·
            revisado contra la normativa de {p.municipalidadLabel} y la capa ministerial
          </p>
        </div>
      </div>

      <Panel className="mb-6 flex divide-x">
        <Contador n={r.bloqueante} label="Bloqueantes" tono={T.peligro} />
        <Contador n={r.riesgo} label="Riesgos" tono={T.alerta} />
        <Contador n={r.aviso} label="Avisos" tono={T.medio} />
      </Panel>

      {(["bloqueante", "riesgo", "aviso"] as const).map((s) => {
        const hs = porSev(s);
        const conFaltantes = s === "bloqueante" && faltantes.length > 0;
        if (!hs.length && !conFaltantes) return null;
        return (
          <section key={s} className="mb-7">
            <h2 className="mb-2.5 flex items-center gap-2 text-[15px] font-semibold" style={{ color: T.tinta, fontFamily: sans }}>
              {s === "bloqueante" && <ShieldAlert size={15} style={{ color: T.peligro }} />}
              {s === "riesgo" && <AlertTriangle size={15} style={{ color: T.alerta }} />}
              {SEVERIDADES[s].label}s
            </h2>
            <Panel>
              {conFaltantes && <Faltantes hs={faltantes} />}
              {hs.map((h) => <Fila key={h.id} h={h} />)}
            </Panel>
          </section>
        );
      })}

      <div className="rounded-[4px] border p-4" style={{ borderColor: T.linea, background: T.blanco }}>
        <Etiqueta>Bitácora de rechazos</Etiqueta>
        <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: T.medio, fontFamily: sans }}>
          Los contadores de «rechazos registrados» ordenan los hallazgos por lo que más ha fallado
          antes. Cada rechazo real que se registre hace que la próxima revisión de{" "}
          <em>cualquier</em> proyecto lo tome en cuenta.
        </p>
        {rev.bitacora_demo && (
          <p className="mt-2 text-[11.5px] leading-snug" style={{ color: T.alerta, fontFamily: sans }}>
            La bitácora actual está sembrada con casos de demostración. Los conteos ilustran el
            mecanismo; no son estadísticas de expedientes reales.
          </p>
        )}
      </div>
    </div>
  );
}
