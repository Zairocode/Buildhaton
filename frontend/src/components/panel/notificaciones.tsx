/**
 * Notificaciones al chat del equipo.
 *
 * El texto NO es de relleno: cada mensaje sale de un hallazgo del motor de
 * fallas, así que la notificación dice qué se va a caer y qué hacer. El envío
 * real a un chat es un POST a un webhook — está aislado en `enviarAlChat`.
 */
import { useState } from "react";
import { Bell, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { revisar } from "../../lib/motor";
import type { Notificacion, Store, Usuario } from "../../lib/estado";
import { Boton, Chip, Etiqueta, Panel, T, Titulo, mono, sans } from "./ui";

const TONO = {
  bloqueante: "peligro", riesgo: "alerta", aviso: "neutro", info: "ok",
} as const;

/**
 * A quién le llega qué. Un lector no recibe tareas: solo consulta.
 * ponytail: reparto por permiso, no por rol del expediente. Si hace falta
 * dirigir por cargo (VAC02), la llave es `usuario.rol`.
 */
function destinatarios(usuarios: Usuario[], severidad: Notificacion["severidad"]) {
  if (severidad === "bloqueante") return usuarios.filter((u) => u.acceso !== "lector");
  if (severidad === "info") return usuarios;
  return usuarios.filter((u) => u.acceso === "gestor");
}

/** Payload que se le manda a un chat. Hoy se guarda; mañana se hace POST. */
export function enviarAlChat(n: Notificacion, u: Usuario) {
  return {
    canal: n.canal,
    para: n.canal === "whatsapp" ? u.telefono : u.email,
    plantilla: `cimiento_${n.severidad}`,
    variables: { proyecto: n.proyecto, mensaje: n.texto },
  };
  // ponytail: sin webhook real — falta el token del proveedor. Cuando exista,
  // esto es un fetch POST y nada más de este archivo cambia.
}

/** Corre el motor de fallas sobre cada proyecto y arma los mensajes. */
async function generar(store: Store): Promise<Notificacion[]> {
  const out: Notificacion[] = [];
  const ahora = Date.now();

  for (const p of store.proyectos) {
    const rev = await revisar(p.id, p.datos).catch(() => null);
    if (!rev) continue;

    const mensajes: { texto: string; sev: Notificacion["severidad"] }[] = [];

    if (rev.resumen.bloqueante > 0) {
      mensajes.push({
        sev: "bloqueante",
        texto: `${p.nombre}: ${rev.resumen.bloqueante} requisitos bloquean el ingreso del expediente. Si se presenta así, lo devuelven en ventanilla.`,
      });
    }

    // El hallazgo con más rechazos en la bitácora es el que vale avisar.
    const reincidente = rev.hallazgos.filter((h) => h.veces > 0).sort((a, b) => b.veces - a.veces)[0];
    if (reincidente) {
      mensajes.push({
        sev: reincidente.severidad,
        texto: `${p.nombre}: «${reincidente.titulo}» ya causó ${reincidente.veces} rechazo${reincidente.veces > 1 ? "s" : ""} en expedientes anteriores. ${reincidente.remedio ?? ""}`.trim(),
      });
    }

    for (const h of rev.hallazgos.filter((h) => h.severidad === "riesgo" && h.veces === 0).slice(0, 1)) {
      mensajes.push({ sev: "riesgo", texto: `${p.nombre}: ${h.titulo}. ${h.remedio ?? ""}`.trim() });
    }

    mensajes.forEach((m, i) =>
      destinatarios(store.usuarios, m.sev).forEach((u, j) =>
        out.push({
          id: `n-${ahora}-${p.id}-${i}-${j}`,
          para: u.id,
          canal: m.sev === "bloqueante" ? "whatsapp" : "correo",
          texto: m.texto,
          proyecto: p.id,
          severidad: m.sev,
          en: new Date().toISOString(),
        })
      )
    );
  }
  return out;
}

/** Aviso suelto — lo usa el portal al enviar el expediente. */
export function avisoEnvio(store: Store, proyecto: string): Notificacion[] {
  return destinatarios(store.usuarios, "info").map((u, j) => ({
    id: `n-${Date.now()}-env-${j}`,
    para: u.id,
    canal: "whatsapp" as const,
    texto: `Expediente ${proyecto} enviado a la ventanilla. Los requisitos municipales siguen su trámite aparte.`,
    proyecto,
    severidad: "info" as const,
    en: new Date().toISOString(),
  }));
}

function Burbuja({ n, u }: { n: Notificacion; u?: Usuario }) {
  const hora = new Date(n.en).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex gap-2.5">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{ background: T.acentoSuave, color: T.acento, fontFamily: sans }}
      >
        {(u?.nombre ?? "?").slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-semibold" style={{ color: T.tinta, fontFamily: sans }}>
            {u?.nombre ?? "—"}
          </span>
          <Chip tono={TONO[n.severidad]}>{n.canal === "whatsapp" ? "WhatsApp" : "Correo"}</Chip>
          <span className="text-[10.5px]" style={{ color: T.tenue, fontFamily: mono }}>{hora}</span>
        </div>
        <div
          className="rounded-[4px] rounded-tl-none border px-3 py-2 text-[12.5px] leading-relaxed"
          style={{ borderColor: T.linea, background: T.blanco, color: T.medio, fontFamily: sans }}
        >
          {n.texto}
        </div>
      </div>
    </div>
  );
}

export function Notificaciones({ store, setStore }: { store: Store; setStore: (f: (s: Store) => Store) => void }) {
  const [corriendo, setCorriendo] = useState(false);
  const ns = [...store.notificaciones].reverse();
  const porId = new Map(store.usuarios.map((u) => [u.id, u]));

  const correr = () => {
    setCorriendo(true);
    generar(store)
      .then((nuevas) => setStore((s) => ({ ...s, notificaciones: [...s.notificaciones, ...nuevas] })))
      .finally(() => setCorriendo(false));
  };

  // El destinatario puede haber sido borrado despues de recibir el mensaje.
  const conDestino = ns.find((n) => porId.has(n.para));
  const ejemplo = conDestino ? enviarAlChat(conDestino, porId.get(conDestino.para)!) : null;

  return (
    <>
      <Titulo sub="Cada mensaje sale de un hallazgo del motor de fallas — no de una plantilla genérica.">
        Notificaciones
      </Titulo>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Boton onClick={correr} disabled={corriendo}>
          {corriendo ? <><Loader2 size={13} className="animate-spin" /> Revisando la cartera…</>
                     : <><Bell size={13} /> Revisar y notificar</>}
        </Boton>
        {ns.length > 0 && (
          <Boton variante="texto" onClick={() => setStore((s) => ({ ...s, notificaciones: [] }))}>
            <Trash2 size={13} /> Limpiar hilo
          </Boton>
        )}
        <span className="text-[12px]" style={{ color: T.tenue, fontFamily: mono }}>
          {ns.length} mensaje{ns.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel className="p-5">
          {ns.length === 0 ? (
            <div className="flex items-center gap-2 py-6 text-[13px]" style={{ color: T.tenue, fontFamily: sans }}>
              <MessageSquare size={15} /> Sin mensajes todavía. Corré «Revisar y notificar».
            </div>
          ) : (
            <div className="space-y-5">
              {ns.map((n) => <Burbuja key={n.id} n={n} u={porId.get(n.para)} />)}
            </div>
          )}
        </Panel>

        <div>
          <Panel className="p-4">
            <Etiqueta>Reparto</Etiqueta>
            <ul className="mt-2.5 space-y-1.5 text-[12px] leading-snug" style={{ color: T.medio, fontFamily: sans }}>
              <li><strong>Bloqueante</strong> → WhatsApp a admin y gestores</li>
              <li><strong>Riesgo</strong> → correo a gestores</li>
              <li><strong>Envío</strong> → a todo el equipo</li>
              <li style={{ color: T.tenue }}>Un lector no recibe tareas: solo consulta.</li>
            </ul>
          </Panel>

          <Panel className="mt-4 p-4">
            <Etiqueta>Salida al proveedor de chat</Etiqueta>
            <pre
              className="mt-2.5 overflow-x-auto rounded-[3px] border p-3 text-[10.5px] leading-relaxed"
              style={{ borderColor: T.linea, background: T.papel, color: T.medio, fontFamily: mono }}
            >
{ejemplo ? JSON.stringify(ejemplo, null, 2) : "// corré una revisión para ver el payload"}
            </pre>
            <p className="mt-2 text-[11px] leading-snug" style={{ color: T.alerta, fontFamily: sans }}>
              El mensaje se arma completo pero todavía no sale: falta el token del proveedor. Es un
              <code style={{ fontFamily: mono }}> POST </code> y nada más cambia.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
