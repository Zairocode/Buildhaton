/** Tokens y primitivas. Plano: sin degradados, hairlines, un solo acento. */
import type { ReactNode } from "react";

export const T = {
  papel: "#FBFBF9",
  blanco: "#FFFFFF",
  tinta: "#18181B",
  medio: "#3F3F46",
  tenue: "#71717A",
  linea: "#E4E4E7",
  lineaFuerte: "#D4D4D8",
  acento: "#0F766E",
  acentoSuave: "#F0FDFA",
  alerta: "#B45309",
  alertaSuave: "#FFFBEB",
  peligro: "#B91C1C",
  peligroSuave: "#FEF2F2",
  ok: "#15803D",
};

export const sans = "'IBM Plex Sans', system-ui, sans-serif";
export const mono = "'IBM Plex Mono', ui-monospace, monospace";

export function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-[10px] font-semibold uppercase tracking-[0.12em]"
      style={{ color: T.tenue, fontFamily: sans }}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  tono = "neutro",
}: {
  children: ReactNode;
  tono?: "neutro" | "curso" | "ok" | "alerta" | "peligro";
}) {
  const c = {
    neutro: { bg: T.blanco, fg: T.tenue, bd: T.linea },
    curso: { bg: T.acentoSuave, fg: T.acento, bd: T.acento },
    ok: { bg: "#F0FDF4", fg: T.ok, bd: T.ok },
    alerta: { bg: T.alertaSuave, fg: T.alerta, bd: T.alerta },
    peligro: { bg: T.peligroSuave, fg: T.peligro, bd: T.peligro },
  }[tono];
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-[3px] border px-2 py-[3px] text-[11px] font-medium"
      style={{ background: c.bg, color: c.fg, borderColor: c.bd, fontFamily: sans }}
    >
      {children}
    </span>
  );
}

export function Barra({ pct, alto = 3 }: { pct: number; alto?: number }) {
  return (
    <div className="w-full rounded-full" style={{ height: alto, background: T.linea }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: T.acento }}
      />
    </div>
  );
}

export function Boton({
  children,
  onClick,
  variante = "primario",
  tipo = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: "primario" | "borde" | "texto";
  tipo?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-[3px] px-3.5 py-2 text-[13px] font-semibold transition-colors disabled:opacity-40";
  const estilo =
    variante === "primario"
      ? { background: T.tinta, color: T.blanco, border: `1px solid ${T.tinta}` }
      : variante === "borde"
      ? { background: T.blanco, color: T.medio, border: `1px solid ${T.lineaFuerte}` }
      : { background: "transparent", color: T.acento, border: "1px solid transparent" };
  return (
    <button type={tipo} onClick={onClick} disabled={disabled} className={base} style={{ ...estilo, fontFamily: sans }}>
      {children}
    </button>
  );
}

export function Campo({
  label,
  children,
  ancho = "full",
}: {
  label: string;
  children: ReactNode;
  ancho?: "full" | "mitad";
}) {
  return (
    <label className={ancho === "mitad" ? "block" : "col-span-2 block"}>
      <Etiqueta>{label}</Etiqueta>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputCls =
  "w-full rounded-[3px] border px-3 py-2 text-[13.5px] outline-none focus:border-current";

export function Input(p: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={p.type ?? "text"}
      value={p.value}
      placeholder={p.placeholder}
      onChange={(e) => p.onChange(e.target.value)}
      className={inputCls}
      style={{ borderColor: T.lineaFuerte, color: T.tinta, background: T.blanco, fontFamily: sans }}
    />
  );
}

export function Selector(p: { value: string; onChange: (v: string) => void; opciones: { v: string; l: string }[] }) {
  return (
    <select
      value={p.value}
      onChange={(e) => p.onChange(e.target.value)}
      className={inputCls}
      style={{ borderColor: T.lineaFuerte, color: T.tinta, background: T.blanco, fontFamily: sans }}
    >
      <option value="">—</option>
      {p.opciones.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[4px] border ${className}`} style={{ borderColor: T.linea, background: T.blanco }}>
      {children}
    </div>
  );
}

export function Titulo({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]" style={{ color: T.tinta, fontFamily: sans }}>
        {children}
      </h1>
      {sub && (
        <p className="mt-1.5 text-[13.5px]" style={{ color: T.tenue, fontFamily: sans }}>
          {sub}
        </p>
      )}
    </div>
  );
}
