/**
 * Notificaciones al chat del equipo.
 *
 * El texto NO es de relleno: cada mensaje sale de un hallazgo del motor de
 * fallas, así que la notificación dice qué se va a caer y qué hacer. El envío
 * real a un chat es un POST a un webhook — está aislado en `enviarAlChat`.
 */
import { useState } from "react";
import { Bell, CheckCheck, Inbox, Loader2, Mail, Trash2 } from "lucide-react";
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

/**
 * Un color estable por persona, derivado del id. El mismo tono la identifica en
 * el hilo de WhatsApp y en la bandeja, que es como uno reconoce a alguien de un
 * vistazo sin leer el nombre.
 */
const PALETA = ["#0F766E", "#B45309", "#7C3AED", "#BE123C", "#1D4ED8", "#0369A1", "#4D7C0F", "#A21CAF"];
const colorDe = (id: string) => PALETA[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETA.length];

const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
const inicial = (u?: Usuario) => (u?.nombre ?? "?").trim().slice(0, 1).toUpperCase();

/** Asunto del correo: tiene que decir algo parado en la bandeja, sin abrirlo. */
const ASUNTO: Record<Notificacion["severidad"], string> = {
  bloqueante: "Bloquea el ingreso del expediente",
  riesgo: "Riesgo detectado antes de ingresar",
  aviso: "Revisión recomendada",
  info: "Actualización del expediente",
};

/* Colores propios de WhatsApp: no salen del tema del panel a proposito, la
   gracia es que se reconozca el canal antes de leer nada. */
const WA = {
  fondo: "#EFEAE2",
  cabecera: "#075E54",
  burbuja: "#D9FDD3",
  tinta: "#111B21",
  tenue: "#667781",
  visto: "#53BDEB",
};

function HiloWhatsApp({ ns, porId }: { ns: Notificacion[]; porId: Map<string, Usuario> }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-2.5" style={{ background: WA.cabecera }}>
        {/* El C1 hace de foto de contacto, que es lo que va en esta esquina. */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
          <img src="/c1_w.png" alt="" className="h-[15px] w-auto" />
        </div>
        <div className="min-w-0">
          <img src="/cimiento-blanco.png" alt="Cimiento" className="h-[13px] w-auto" />
          <div className="mt-1 text-[10.5px] text-white opacity-70" style={{ fontFamily: sans }}>WhatsApp Business</div>
        </div>
        <span className="ml-auto text-[10.5px] text-white opacity-70" style={{ fontFamily: mono }}>{ns.length}</span>
      </div>

      {/* Cronologico: un hilo se lee del mas viejo al mas nuevo. */}
      <div className="space-y-2 px-3.5 py-4" style={{ background: WA.fondo, minHeight: 240 }}>
        {ns.length === 0 ? (
          <p className="py-10 text-center text-[12px]" style={{ color: WA.tenue, fontFamily: sans }}>
            Sin alertas por este canal.
          </p>
        ) : (
          ns.map((n) => (
            <div key={n.id} className="flex justify-end">
              <div className="max-w-[86%] rounded-[7.5px] rounded-tr-none px-2.5 py-1.5"
                   style={{ background: WA.burbuja, boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)" }}>
                <div className="text-[11.5px] font-semibold" style={{ color: colorDe(n.para), fontFamily: sans }}>
                  {porId.get(n.para)?.nombre ?? "Destinatario eliminado"}
                </div>
                <p className="mt-0.5 text-[12.5px] leading-[1.45]" style={{ color: WA.tinta, fontFamily: sans }}>
                  {n.texto}
                </p>
                <div className="mt-0.5 flex items-center justify-end gap-1">
                  <span className="text-[10px]" style={{ color: WA.tenue, fontFamily: sans }}>{hora(n.en)}</span>
                  <CheckCheck size={13} color={WA.visto} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

function Bandeja({ ns, porId }: { ns: Notificacion[]; porId: Map<string, Usuario> }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-2.5 border-b px-4 py-3" style={{ borderColor: T.linea, background: T.papel }}>
        <Mail size={15} color={T.medio} />
        <div className="text-[12.5px] font-semibold" style={{ color: T.tinta, fontFamily: sans }}>Correo</div>
        <span className="ml-auto text-[10.5px]" style={{ color: T.tenue, fontFamily: mono }}>{ns.length}</span>
      </div>

      <div style={{ minHeight: 240 }}>
        {ns.length === 0 ? (
          <p className="flex items-center justify-center gap-2 py-14 text-[12px]" style={{ color: T.tenue, fontFamily: sans }}>
            <Inbox size={14} /> Sin correos por este canal.
          </p>
        ) : (
          ns.map((n) => {
            const u = porId.get(n.para);
            return (
              <article key={n.id} className="flex gap-3 border-b px-4 py-3 last:border-b-0" style={{ borderColor: T.linea }}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                     style={{ background: colorDe(n.para), fontFamily: sans }}>
                  {inicial(u)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-[12.5px] font-semibold" style={{ color: T.tinta, fontFamily: sans }}>
                      {u?.nombre ?? "Destinatario eliminado"}
                    </span>
                    <span className="ml-auto shrink-0 text-[10.5px]" style={{ color: T.tenue, fontFamily: mono }}>{hora(n.en)}</span>
                  </div>
                  <div className="truncate text-[10.5px]" style={{ color: T.tenue, fontFamily: mono }}>{u?.email ?? "—"}</div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Chip tono={TONO[n.severidad]}>{n.proyecto}</Chip>
                    <span className="text-[12px] font-semibold" style={{ color: T.tinta, fontFamily: sans }}>
                      {ASUNTO[n.severidad]}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed" style={{ color: T.medio, fontFamily: sans }}>{n.texto}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </Panel>
  );
}

export function Notificaciones({ store, setStore }: { store: Store; setStore: (f: (s: Store) => Store) => void }) {
  const [corriendo, setCorriendo] = useState(false);
  const porId = new Map(store.usuarios.map((u) => [u.id, u]));

  const wa = store.notificaciones.filter((n) => n.canal === "whatsapp");
  const correo = [...store.notificaciones].reverse().filter((n) => n.canal === "correo");
  const total = store.notificaciones.length;

  const correr = () => {
    setCorriendo(true);
    generar(store)
      .then((nuevas) => setStore((s) => ({ ...s, notificaciones: [...s.notificaciones, ...nuevas] })))
      .finally(() => setCorriendo(false));
  };

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
        {total > 0 && (
          <Boton variante="texto" onClick={() => setStore((s) => ({ ...s, notificaciones: [] }))}>
            <Trash2 size={13} /> Limpiar hilo
          </Boton>
        )}
        <span className="text-[12px]" style={{ color: T.tenue, fontFamily: mono }}>
          {total} mensaje{total === 1 ? "" : "s"} · {wa.length} WhatsApp · {correo.length} correo
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HiloWhatsApp ns={wa} porId={porId} />
        <Bandeja ns={correo} porId={porId} />
      </div>

      <Panel className="mt-6 p-4">
        <Etiqueta>Reparto</Etiqueta>
        <ul className="mt-2.5 grid gap-1.5 text-[12px] leading-snug sm:grid-cols-2 lg:grid-cols-4"
            style={{ color: T.medio, fontFamily: sans }}>
          <li><strong>Bloqueante</strong> → WhatsApp a admin y gestores</li>
          <li><strong>Riesgo</strong> → correo a gestores</li>
          <li><strong>Envío</strong> → a todo el equipo</li>
          <li style={{ color: T.tenue }}>Un lector no recibe tareas: solo consulta.</li>
        </ul>
        <p className="mt-3 border-t pt-2.5 text-[11px] leading-snug"
           style={{ borderColor: T.linea, color: T.alerta, fontFamily: sans }}>
          Entorno de demostración: los mensajes se arman completos pero no salen del navegador.
        </p>
      </Panel>
    </>
  );
}
