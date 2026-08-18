/**
 * Réplica SANDBOX del Formulario Consolidado + la extensión de Cimiento
 * autocompletándolo.
 *
 * Reconstruido a partir de capturas de tutoriales públicos y de los
 * instructivos VAC01–VAC09. Es un entorno de demostración: no lleva los logos
 * ni los sellos institucionales, no envía datos a ningún lado, corre en
 * localhost con datos semilla, y el distintivo SANDBOX va pegado al nombre
 * (más el rótulo superior) para que no pueda recortarse fuera de contexto.
 *
 * Sirve para mostrar qué hace la extensión sobre el formulario; no es, ni
 * pretende ser, una versión operable del portal real.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Check, ChevronLeft, CloudDownload, Download, Globe, Loader2, Paperclip,
  Pencil, Plus, Send, ShieldCheck, ThumbsUp, Trash2, UserCheck, Building2, Leaf, Users,
} from "lucide-react";
import type { Empresa, ProyectoPanel } from "../lib/estado";
import { useDocs } from "../lib/estado";

/* Tomados de las capturas del portal real. */
const MORADO = "#6B3FA0";
const MORADO_CLARO = "#8A63BC";
const NAVY = "#2A3F8F";
const AMBAR = "#D5A429";
const VERDE = "#3C9C6D";
const BG = "#EFEFF3";
const LINEA = "#DDDDDD";
const INPUT_BG = "#F2F2F2";
const PLACE = "#A9A9A9";
const LABEL = "#333333";
const TINTA = "#212121";
const CREMA = "#FBF3D4";
const LAVANDA = "#EDEAF4";
const fuente = "'Segoe UI', Roboto, system-ui, sans-serif";

const sino = (v: unknown) => (v === true ? "Sí" : v === false ? "No" : "");
const txt = (v: unknown) => (v == null || v === "" ? "" : String(v));

/* ============================ PIEZAS ============================ */

function Etiqueta({ l, req }: { l: string; req?: boolean }) {
  return (
    <span className="text-[11.5px] leading-tight" style={{ color: LABEL }}>
      {l}:{req && <span style={{ color: "#D32F2F" }}>*</span>}
    </span>
  );
}

function Campo({ l, v, req, lleno, span = 1 }: {
  l: string; v: string; req?: boolean; lleno: boolean; span?: 1 | 2 | 3;
}) {
  const cls = span === 3 ? "sm:col-span-3" : span === 2 ? "sm:col-span-2" : "";
  return (
    <label className={`block ${cls}`}>
      <Etiqueta l={l} req={req} />
      <div
        className="mt-1 flex h-[30px] items-center rounded-[3px] border px-2.5 text-[12px] transition-colors duration-150"
        style={{
          borderColor: lleno ? MORADO_CLARO : LINEA,
          background: lleno ? "#F7F3FC" : INPUT_BG,
          color: lleno ? TINTA : PLACE,
        }}
      >
        {lleno ? v : ""}
      </div>
    </label>
  );
}

function Area({ l, v, req, lleno }: { l: string; v: string; req?: boolean; lleno: boolean }) {
  return (
    <label className="block">
      <Etiqueta l={l} req={req} />
      <div
        className="mt-1 h-[68px] rounded-[3px] border p-2.5 text-[12px] transition-colors duration-150"
        style={{
          borderColor: lleno ? MORADO_CLARO : LINEA,
          background: lleno ? "#F7F3FC" : INPUT_BG,
          color: lleno ? TINTA : PLACE,
        }}
      >
        {lleno ? v : "Item"}
      </div>
    </label>
  );
}

function SubTitulo({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 border-b pb-1.5 text-[14px]" style={{ borderColor: "#EBEBEB", color: "#4A4A4A" }}>
      {children}
    </div>
  );
}

/** Ícono PDF estilo Acrobat, como el de la grilla de adjuntos. */
function IconoPDF({ apagado }: { apagado?: boolean }) {
  const rojo = apagado ? "#D8B4B4" : "#E1332D";
  return (
    <svg width="44" height="54" viewBox="0 0 44 54" aria-hidden>
      <path d="M4 2h24l14 14v36a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill={rojo} />
      <path d="M28 2l14 14H30a2 2 0 0 1-2-2V2z" fill="#FFFFFF" opacity=".55" />
      <text x="22" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#FFFFFF" fontFamily={fuente}>
        PDF
      </text>
    </svg>
  );
}

/* ============================ DATOS ============================ */

type Campito = { l: string; v: string; req?: boolean; span?: 1 | 2 | 3 };

/** Documentos que la grilla de adjuntos muestra cuando no hay carga propia. */
const ADJUNTOS_BASE = [
  "Certificación del Registro de la Propiedad",
  "Patente de Comercio de Empresa",
  "Nombramiento de representante legal",
  "Boleta de Pago CONAP",
  "Mapa de Ubicación CONAP",
  "Dictamen de Ubicación CONAP",
  "Resolución de Admisión a Trámite MSPAS",
  "Evaluación Técnica MSPAS",
  "Licencia Categoría B1 MARN",
  "MARN Dictamen Técnico",
  "Recibo de pago Licencia MARN",
  "Resolución DGAC",
];

function datos(p: ProyectoPanel, e: Empresa) {
  const d = p.datos;
  const niveles = String(Math.max(1, Math.round(Number(d.altura_m ?? 3) / 3)));

  const solicitante: { sub: string; campos: Campito[] }[] = [
    { sub: "Datos de la Empresa", campos: [
      { l: "NIT", v: e.nit, req: true },
      { l: "Tipo de empresa", v: "EMPRESA INDIVIDUAL", req: true },
      { l: "Nombre comercial", v: e.nombreComercial, req: true },
      { l: "Razón Social", v: e.razonSocial, req: true },
      { l: "Actividad económica (CIIU)", v: "Construcción de edificios — 4100", req: true, span: 2 },
      { l: "Teléfono principal", v: "2288-4400" },
      { l: "Teléfono Móvil", v: "5512-8874" },
      { l: "Domicilio Fiscal", v: "Zona 10, Ciudad de Guatemala", req: true },
      { l: "Zona", v: "10", req: true },
      { l: "País", v: "GUATEMALA", req: true },
      { l: "Departamento", v: e.departamento, req: true },
      { l: "Municipio", v: "Guatemala", req: true },
      { l: "Email Principal", v: "tramites@zairo.gt", req: true },
      { l: "Email Secundario", v: "-" },
    ]},
    { sub: "Representantes Legales", campos: [
      { l: "Representante Legal", v: e.representante, req: true, span: 2 },
    ]},
    { sub: "Datos Sociolingüísticos", campos: [
      { l: "Seleccione el genero", v: "Masculino", req: true },
      { l: "Seleccione fecha de nacimiento", v: "19/04/1988", req: true },
      { l: "Seleccione etnia", v: "Ladina", req: true },
      { l: "Seleccione idioma", v: "Español", req: true },
    ]},
  ];

  const general: Campito[] = [
    { l: "Nombre del Proyecto", v: p.nombre, req: true, span: 2 },
    { l: "Tipo de uso que tendrá el proyecto", v: p.tipo.toUpperCase(), req: true },
    { l: "¿Cuántos niveles tendrá?", v: niveles, req: true },
    { l: "Tipo de Proyecto según el listado taxativo ambiental", v: "Sector 10, Subsector B", req: true, span: 2 },
    { l: "Actividades colindantes al proyecto", v: "Comercio y vivienda", req: true, span: 2 },
    { l: "¿Está adyacente a un sitio cultural, natural o arqueológico?", v: "No", req: true, span: 2 },
    { l: "¿Afecta en la salud humana circunvecina?", v: sino(d.afecta_salud_circunvecina) || "No", req: true },
    { l: "¿Tipo de Obra?", v: "General", req: true },
    { l: "¿Afecta el paisaje?", v: "No", req: true },
    { l: "Impacto social?", v: sino(d.impacto_social) || "No", req: true },
    { l: "¿Aguas pluviales?", v: sino(d.genera_aguas_pluviales) || "Sí", req: true },
    { l: "Almacenamiento de consumo de agua, combustibles, lubricantes, otros?", v: sino(d.almacena_agua_combustible_lubricantes) || "No", req: true, span: 2 },
    { l: "Área total del terreno (en metros cuadrados)", v: txt(p.areaTerreno), req: true },
    { l: "Área total de construcción (en metros cuadrados)", v: txt(d.area_construccion_m2), req: true },
    { l: "Monto de inversión del proyecto (en quetzales)", v: "Q15,000.00", req: true },
    { l: "Número de empleos que genera el proyecto", v: "180", req: true },
    { l: "Descripción de características del entorno", v: "Entorno urbano consolidado", req: true, span: 2 },
    { l: "Descripción de actividades (etapa de construcción)", v: "Excavación, cimentación, obra gris", req: true, span: 2 },
    { l: "Descripción del Proyecto", v: `${p.tipo} en ${p.direccion}`, req: true, span: 2 },
    { l: "Categoría según POT", v: "G4", req: true },
    { l: "¿Tiene una Hectárea o más de Bosque?", v: "No", req: true },
    { l: "Altura del edificio (metros)", v: txt(d.altura_m), req: true },
    { l: "Cota de la Banqueta (metros)", v: "20.2000", req: true },
    { l: "¿Está en un sitio arqueológico?", v: "No", req: true },
  ];

  const ambiental: Campito[] = [
    { l: "Tipo de licencia a solicitar", v: `Categoría ${d.categoria_ambiental ?? "B1"}`, req: true },
    { l: "Cantidad de consumo de agua, combustibles, lubricantes, otros", v: "10 Litros", req: true },
    { l: "Caracterización de aguas residuales", v: "Sí", req: true },
    { l: "Descarga de aguas residuales", v: "No", req: true },
    { l: "Consumo de energía", v: "Sí", req: true },
    { l: "Empresa", v: "Empresa Eléctrica de Guatemala", req: true },
    { l: "Consumo de agua", v: sino(d.abastecimiento_agua_consumo_humano) || "Sí", req: true },
    { l: "Empresa", v: d.con_empagua ? "Empagua" : "Pozo propio", req: true },
    { l: "Especificación del Transporte", v: "Terrestre", req: true },
    { l: "Jornada de Trabajo", v: "Completa", req: true },
    { l: "Número de empleados", v: "180", req: true },
    { l: "Número de empleados por jornada", v: "60", req: true },
    { l: "¿Olores?", v: "No", req: true },
    { l: "Gases", v: "No", req: true },
    { l: "Ruido", v: "Sí", req: true },
    { l: "Riesgos ocupacionales", v: "Sí", req: true },
    { l: "Desechos sólidos", v: "Sí", req: true },
    { l: "Tratamiento de aguas residuales", v: txt(d.tratamiento_aguas_residuales) || "Nueva", req: true },
  ];

  const coordenadas = [
    { lon: "-90.55660270", lat: "14.49890270", g: "90", m: "33", s: "23.80", dir: "O" },
    { lon: "-90.55642830", lat: "14.49911310", g: "90", m: "33", s: "23.10", dir: "O" },
    { lon: "-90.56683880", lat: "14.61180340", g: "90", m: "34", s: "0.60", dir: "O" },
    { lon: "-90.56297520", lat: "14.61271700", g: "90", m: "33", s: "46.70", dir: "O" },
  ];

  const contactos = [
    { tipo: "REPRESENTANTE LEGAL", nombre: e.representante, dir: "Zona 10", correo: "luan@zairo.gt", prof: "Adm. de Empresas", tel: "5512-8874" },
    { tipo: "ARRENDATARIO", nombre: "—", dir: "—", correo: "—", prof: "—", tel: "—" },
    { tipo: "RESPONSABLE DE LA EVALUACION", nombre: "Ana Lucía Ordóñez", dir: "Zona 14", correo: "aordonez@zairo.gt", prof: "Arquitecta", tel: "4471-2093" },
    { tipo: "RESPONSABLE DE LA EJECUCION", nombre: "Marco Tulio Recinos", dir: "Zona 15", correo: "mrecinos@zairo.gt", prof: "Ingeniero Civil", tel: "3308-5521" },
    { tipo: "RESPONSABLE DE LA PLANIFICACION", nombre: "Ana Lucía Ordóñez", dir: "Zona 14", correo: "aordonez@zairo.gt", prof: "Arquitecta", tel: "4471-2093" },
  ];

  return { solicitante, general, ambiental, coordenadas, contactos };
}

/* ============================ PORTAL ============================ */

export default function Portal({
  proyecto, empresa, onSalir, onEnviado,
}: {
  proyecto: ProyectoPanel;
  empresa: Empresa;
  onSalir: () => void;
  onEnviado: () => void;
}) {
  const { docs } = useDocs(proyecto.id);
  const D = useMemo(() => datos(proyecto, empresa), [proyecto, empresa]);

  /** Adjuntos: primero lo que de verdad se cargó en Cimiento, luego el resto. */
  const adjuntos = useMemo(() => {
    const propios = docs.map((d) => ({
      nombre: d.documento, archivo: d.archivo,
      mb: (d.bytes / 1024 / 1024).toFixed(2), deCimiento: true,
    }));
    const vistos = new Set(propios.map((a) => a.nombre));
    const resto = ADJUNTOS_BASE.filter((n) => !vistos.has(n)).map((n) => ({
      nombre: n, archivo: "Plano.pdf", mb: "0.21", deCimiento: false,
    }));
    return [...propios, ...resto];
  }, [docs]);

  const solicitanteN = D.solicitante.reduce((a, g) => a + g.campos.length, 0);
  const PASOS = [
    { label: "Solicitante", titulo: "Información del Solicitante:", Icono: UserCheck, n: solicitanteN },
    { label: "General", titulo: "Datos del Proyecto:", Icono: Building2, n: D.general.length },
    { label: "Ambiental", titulo: "Información Ambiental:", Icono: Leaf, n: D.ambiental.length },
    { label: "Seguridad", titulo: "Información de Seguridad:", Icono: ShieldCheck, n: 2 },
    { label: "Adjuntos", titulo: "Archivos Adjuntos:", Icono: Paperclip, n: adjuntos.length },
    { label: "Coordenadas", titulo: "Coordenadas:", Icono: Globe, n: D.coordenadas.length },
    { label: "Contactos", titulo: "Sección de Contactos:", Icono: Users, n: D.contactos.length },
    { label: "Enviar", titulo: "Envío de Formulario", Icono: Send, n: 1 },
  ];
  const total = PASOS.reduce((a, s) => a + s.n, 0);
  const inicio = PASOS.map((_, i) => PASOS.slice(0, i).reduce((a, s) => a + s.n, 0));

  const [llenos, setLlenos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [paso, setPaso] = useState(0);
  const [enviado, setEnviado] = useState(false);

  /** ultima pieza de la pantalla actual: la extension llena hasta aca y se detiene */
  const meta = inicio[paso] + PASOS[paso].n;

  // Una pieza cada 55 ms, pero SOLO de la pantalla actual. Avanzar es del humano:
  // el jurado tiene que ver quien confirma, no una barra que corre sola hasta el final.
  useEffect(() => {
    if (!corriendo) return;
    if (llenos >= meta) { setCorriendo(false); return; }
    const t = setTimeout(() => setLlenos((n) => n + 1), 55);
    return () => clearTimeout(t);
  }, [corriendo, llenos, meta]);

  const listo = llenos >= total && total > 0;
  /** la pantalla ya se lleno y espera que el humano le de Siguiente */
  const pantallaLista = !corriendo && llenos > 0 && llenos >= meta && !listo;
  const avanzar = () => { setPaso((k) => Math.min(7, k + 1)); setCorriendo(true); };
  const S = PASOS[paso];
  /** cuántas piezas de ESTA pantalla ya se pintaron */
  const hechos = Math.max(0, Math.min(S.n, llenos - inicio[paso]));

  const enviar = () => { setEnviado(true); onEnviado(); };

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: fuente }}>
      <div className="px-4 py-1.5 text-center text-[11px] font-semibold" style={{ background: "#B3261E", color: "#FFF" }}>
        ENTORNO SANDBOX · Réplica de demostración construida por Cimiento. No es el portal real, no
        está afiliada a ninguna institución y no procesa trámites.
      </div>

      <header className="border-b bg-white" style={{ borderColor: LINEA }}>
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-6 py-2.5">
          <div className="flex h-9 items-center rounded-[2px] px-3 text-[19px] font-bold italic tracking-tight text-white"
               style={{ background: MORADO }}>
            VAC
          </div>
          {/* El distintivo va pegado al nombre a proposito: si alguien recorta
              la captura, el "SANDBOX" se recorta junto con el "VAC". */}
          <span className="rounded-[2px] border px-2 py-[3px] text-[10px] font-bold tracking-[0.14em]"
                style={{ borderColor: "#B3261E", color: "#B3261E", background: "#FDECEA" }}>
            SANDBOX
          </span>
          <div className="ml-1 text-[9.5px] leading-tight" style={{ color: "#6B6B6B" }}>
            Ventanilla Ágil<br />de la Construcción
          </div>
          <div className="ml-auto text-right">
            <div className="text-[13px]" style={{ color: TINTA }}>{empresa.razonSocial}</div>
            <div className="text-[10.5px]" style={{ color: "#6B6B6B" }}>usuario: {empresa.representante}</div>
          </div>
          <button onClick={onSalir} className="ml-4 flex items-center gap-1 text-[12px]" style={{ color: NAVY }}>
            <ChevronLeft size={13} /> Salir
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-5 pb-24">
        <div className="rounded-[3px] border bg-white px-6 py-5" style={{ borderColor: LINEA }}>
          <h1 className="text-center text-[26px] font-normal tracking-wide" style={{ color: MORADO }}>
            FORMULARIO CONSOLIDADO
          </h1>
          <p className="mt-0.5 text-center text-[11.5px]" style={{ color: "#6B6B6B" }}>
            Proporcione la información requerida y luego haga clic en el Siguiente
          </p>

          <div className="mt-5 flex justify-between gap-1">
            {PASOS.map((s, i) => {
              const activo = i <= paso;
              const Ico = s.Icono;
              return (
                <button key={s.label} onClick={() => setPaso(i)} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full"
                       style={{ background: activo ? MORADO : "#C9C9CE" }}>
                    <Ico size={17} color="#FFFFFF" />
                  </div>
                  <span className="text-center text-[10.5px] font-semibold leading-tight"
                        style={{ color: activo ? MORADO : "#9A9AA0" }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 h-3.5 w-full overflow-hidden rounded-[2px]" style={{ background: "#DFDFE6" }}>
          <div
            className="h-full transition-all duration-100"
            style={{
              width: `${total ? (llenos / total) * 100 : 0}%`,
              backgroundColor: MORADO,
              backgroundImage:
                "linear-gradient(45deg, rgba(255,255,255,.18) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.18) 50%, rgba(255,255,255,.18) 75%, transparent 75%, transparent)",
              backgroundSize: "14px 14px",
            }}
          />
        </div>

        {/* Banda de formatos descargables, tal como aparece en Adjuntos. */}
        {paso === 4 && (
          <div className="mt-4 flex flex-wrap gap-8 rounded-[3px] border px-5 py-2.5"
               style={{ background: CREMA, borderColor: "#EADFA8" }}>
            {["Descargar Formato CONRED", "Descargar Formato MARN Categoría B1", "Descargar Formato MARN Categoría B2"].map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: NAVY }}>
                <CloudDownload size={13} /> {f}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-[3px] border bg-white px-6 py-5" style={{ borderColor: LINEA }}>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[19px]" style={{ color: MORADO }}>{S.titulo}</h2>
            <span className="text-[17px]" style={{ color: "#4A4A4A" }}>
              {paso === 7
                ? <>Paso <span style={{ color: "#E07B0B" }}>9</span> - 9</>
                : <>Sección <span style={{ color: "#E07B0B" }}>{paso + 1}</span> - 8</>}
            </span>
          </div>

          {/* ---------- 1. Solicitante ---------- */}
          {paso === 0 && D.solicitante.map((g, gi) => {
            const off = D.solicitante.slice(0, gi).reduce((a, x) => a + x.campos.length, 0);
            return (
              <div key={g.sub} className="mb-5">
                <SubTitulo>{g.sub}</SubTitulo>
                <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
                  {g.campos.map((c, i) => <Campo key={c.l + i} {...c} lleno={off + i < hechos} />)}
                </div>
              </div>
            );
          })}

          {/* ---------- 2. General ---------- */}
          {paso === 1 && (
            <>
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
                {D.general.map((c, i) => <Campo key={c.l + i} {...c} lleno={i < hechos} />)}
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="rounded-[3px] border p-4" style={{ borderColor: LINEA, background: "#FAFAFC" }}>
                  <SubTitulo>Dirección del Inmueble</SubTitulo>
                  <div className="grid gap-3">
                    <Campo l="Dirección" v={proyecto.direccion} req lleno={hechos > 4} />
                    <div className="grid grid-cols-2 gap-3">
                      <Campo l="Departamento" v="GUATEMALA" req lleno={hechos > 6} />
                      <Campo l="Municipio" v={proyecto.municipalidadLabel} req lleno={hechos > 6} />
                    </div>
                  </div>
                </div>
                <div className="rounded-[3px] border p-4" style={{ borderColor: LINEA, background: "#FAFAFC" }}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[14px]" style={{ color: "#4A4A4A" }}>Información Registral</span>
                    <span className="flex items-center gap-1 rounded-[3px] px-2.5 py-1 text-[10.5px] text-white" style={{ background: VERDE }}>
                      <Plus size={11} /> Agregar Finca
                    </span>
                  </div>
                  <table className="w-full text-[11.5px]">
                    <thead>
                      <tr style={{ background: LAVANDA }}>
                        {["Finca", "Folio", "Libro", "Departamento"].map((h) => (
                          <th key={h} className="border px-2 py-1.5 text-left font-semibold" style={{ borderColor: LINEA, color: LABEL }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ color: hechos > 8 ? TINTA : "transparent" }}>
                        {["10", "20", "1050", "GUATEMALA"].map((v, i) => (
                          <td key={i} className="border px-2 py-1.5" style={{ borderColor: LINEA }}>{v}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ---------- 3. Ambiental ---------- */}
          {paso === 2 && (
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
              {D.ambiental.map((c, i) => <Campo key={c.l + i} {...c} lleno={i < hechos} />)}
            </div>
          )}

          {/* ---------- 4. Seguridad ---------- */}
          {paso === 3 && (
            <div className="grid gap-4">
              <Area l="Plan de mitigación" req v="Delimitación perimetral, señalización de obra, control de polvo y manejo de escombros según el instrumento ambiental aprobado." lleno={hechos > 0} />
              <Area l="Equipo Protección" req v="Casco, arnés de cuerpo completo, botas con punta de acero, chaleco reflectivo, gafas y protección auditiva." lleno={hechos > 1} />
            </div>
          )}

          {/* ---------- 5. Adjuntos ---------- */}
          {paso === 4 && (
            <>
              <div className="mb-4 flex h-[30px] w-[260px] items-center justify-between rounded-[3px] border px-2.5 text-[12px]"
                   style={{ borderColor: LINEA, background: INPUT_BG, color: PLACE }}>
                Seleccione requisito <span style={{ color: "#8A8A8A" }}>▾</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {adjuntos.map((a, i) => {
                  const on = i < hechos;
                  return (
                    <div key={a.nombre + i}
                         className="flex flex-col items-center rounded-[3px] border px-3 py-4 transition-colors duration-150"
                         style={{ borderColor: on ? MORADO_CLARO : LINEA, background: on ? "#FCFAFE" : "#FAFAFA" }}>
                      <IconoPDF apagado={!on} />
                      {/* Los requisitos del motor traen el plazo en el nombre y
                          desbordan la tarjeta; el nombre completo va en el title. */}
                      <div className="mt-2.5 text-center text-[11px] font-semibold leading-tight"
                           style={{ color: on ? TINTA : "#B8B8B8" }} title={a.nombre}>
                        {a.nombre.length > 58 ? `${a.nombre.slice(0, 58)}…` : a.nombre}
                      </div>
                      <div className="mt-1 text-center text-[10.5px]" style={{ color: on ? "#8A8A8A" : "#C8C8C8" }}>
                        {a.archivo}
                      </div>
                      <div className="text-[10.5px]" style={{ color: on ? "#8A8A8A" : "#C8C8C8" }}>( {a.mb} MB )</div>
                      {a.deCimiento && on && (
                        <div className="mt-1.5 rounded-[2px] px-1.5 py-[2px] text-[9px] font-bold tracking-wide text-white" style={{ background: "#0F766E" }}>
                          DESDE CIMIENTO
                        </div>
                      )}
                      <button className="mt-2.5 rounded-[3px] px-2.5 py-1" style={{ background: on ? NAVY : "#C8CBD8" }}>
                        <Download size={12} color="#FFFFFF" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ---------- 6. Coordenadas ---------- */}
          {paso === 5 && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr style={{ background: LAVANDA }}>
                      {["Longitud", "Latitud", "Long. Grados", "Long. Minutos", "Long. Segundos", "Dirección"].map((h) => (
                        <th key={h} className="border px-2 py-1.5 text-left font-semibold" style={{ borderColor: LINEA, color: LABEL }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {D.coordenadas.map((c, i) => {
                      const on = i < hechos;
                      const sel = i === 0 && on;
                      return (
                        <tr key={i} style={{ background: sel ? NAVY : "#FFFFFF", color: sel ? "#FFFFFF" : on ? TINTA : "transparent" }}>
                          {[c.lon, c.lat, c.g, c.m, c.s, c.dir].map((v, j) => (
                            <td key={j} className="border px-2 py-1.5" style={{ borderColor: LINEA }}>{v}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Mapa dibujado: el portal real usa Google Maps, que aca no carga. */}
              <div className="relative h-[260px] overflow-hidden rounded-[2px] border" style={{ borderColor: LINEA, background: "#E8EDE4" }}>
                <svg width="100%" height="100%" aria-label="mapa de referencia">
                  <rect width="100%" height="100%" fill="#EAEFE6" />
                  {[40, 110, 180, 240].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100%" y2={y} stroke="#FFFFFF" strokeWidth="6" />
                  ))}
                  {[80, 200, 330, 460].map((x) => (
                    <line key={x} x1={x} y1="0" x2={x} y2="100%" stroke="#FFFFFF" strokeWidth="5" />
                  ))}
                  <line x1="0" y1="150" x2="100%" y2="120" stroke="#F5D372" strokeWidth="9" />
                  {hechos >= 4 && (
                    <polygon points="205,115 330,112 335,185 210,188" fill="rgba(225,51,45,.18)" stroke="#E1332D" strokeWidth="2.5" />
                  )}
                  <text x="12" y="252" fontSize="10" fill="#9AA394" fontFamily={fuente}>
                    Referencia — {proyecto.municipalidadLabel}
                  </text>
                </svg>
              </div>
            </div>
          )}

          {/* ---------- 7. Contactos ---------- */}
          {paso === 6 && (
            <>
              <button className="mb-3 rounded-[3px] px-3 py-1.5 text-[11.5px] text-white" style={{ background: "#7C8CA8" }}>
                Agregar Contacto
              </button>
              <div className="overflow-x-auto">
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr style={{ background: LAVANDA }}>
                      {["Tipo", "Nombre", "Dirección", "Correo", "Profesión", "Teléfono", "Acciones"].map((h) => (
                        <th key={h} className="border px-2.5 py-2 text-left font-semibold" style={{ borderColor: LINEA, color: LABEL }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {D.contactos.map((c, i) => {
                      const on = i < hechos;
                      return (
                        <tr key={c.tipo} style={{ color: on ? "#4A4A4A" : "transparent" }}>
                          {[c.tipo, c.nombre, c.dir, c.correo, c.prof, c.tel].map((v, j) => (
                            <td key={j} className="border px-2.5 py-2" style={{ borderColor: LINEA }}>{v}</td>
                          ))}
                          <td className="border px-2.5 py-2" style={{ borderColor: LINEA }}>
                            <div className="flex gap-1.5">
                              {[Pencil, Trash2].map((Ico, k) => (
                                <span key={k} className="rounded-[3px] px-1.5 py-1" style={{ background: on ? NAVY : "#D8DAE4" }}>
                                  <Ico size={11} color="#FFFFFF" />
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ---------- 8. Enviar ---------- */}
          {paso === 7 && (
            <div className="py-3 text-center">
              <h3 className="text-[15px] font-bold" style={{ color: TINTA }}>INGRESO DE FORMULARIO CONSOLIDADO</h3>
              <p className="mx-auto mt-3 max-w-2xl text-[11px] leading-relaxed" style={{ color: "#6B6B6B" }}>
                Estoy al tanto, que de acuerdo con el numeral 5 del artículo 3 del decreto número 5-2021
                del Congreso de la República, Ley para la Simplificación de requisitos y Trámites
                Administrativos, se presumen auténticos todos los datos, documentos y pronunciamientos
                que presento sin perjuicio de las responsabilidades administrativas civiles y penales en
                que puedo incurrir por falta de veracidad en lo declarado presentado o informado.
              </p>
              <button
                onClick={enviar}
                disabled={!listo || enviado}
                className="mt-5 inline-flex items-center gap-2 rounded-[3px] px-4 py-2 text-[12px] text-white disabled:opacity-50"
                style={{ background: VERDE }}
              >
                <ThumbsUp size={13} /> {enviado ? "Solicitud enviada" : "Aceptar y enviar solicitud para revisión"}
              </button>
              {enviado && (
                <div className="mx-auto mt-4 max-w-md rounded-[3px] border px-4 py-3" style={{ borderColor: VERDE, background: "#F1FAF5" }}>
                  <div className="flex items-center justify-center gap-2 text-[12.5px] font-semibold" style={{ color: "#1F6B47" }}>
                    <Check size={14} /> Expediente {proyecto.id} recibido
                  </div>
                  <p className="mt-1 text-[11px]" style={{ color: "#4A4A4A" }}>
                    Los requisitos municipales continúan su trámite aparte.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "#EBEBEB" }}>
            <button onClick={() => setPaso((k) => Math.max(0, k - 1))}
                    className="rounded-[3px] px-6 py-1.5 text-[12.5px] text-white" style={{ background: AMBAR }}>
              Anterior
            </button>
            {paso < 7 && (
              <button onClick={avanzar} disabled={corriendo}
                      className="rounded-[3px] px-6 py-1.5 text-[12.5px] text-white transition-shadow disabled:opacity-50"
                      style={{ background: NAVY, boxShadow: pantallaLista ? "0 0 0 3px rgba(15,118,110,0.45)" : "none" }}>
                Siguiente
              </button>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-[11px]" style={{ color: "#8A8A8A" }}>Copyright © 2020</p>
      </main>

      {/* La "extensión": popup flotante, como se ve en el navegador. Va a la
          derecha: tapa Anterior/Siguiente pero NO el boton verde de enviar (que
          va centrado), y el stepper es clickeable, asi que nunca bloquea. */}
      <div className="fixed bottom-5 right-5 w-[300px] rounded-[6px] border bg-white shadow-2xl" style={{ borderColor: LINEA }}>
        <div className="flex items-center gap-2 rounded-t-[6px] px-4 py-2.5" style={{ background: "#0F766E" }}>
          <img src="/cimiento-blanco.png" alt="Cimiento" className="h-[15px] w-auto" />
          <span className="ml-auto text-[10px] text-white opacity-70">extensión</span>
        </div>

        <div className="px-4 py-3">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#71717A" }}>
            Proyecto detectado
          </div>
          <div className="mt-0.5 text-[13px] font-semibold" style={{ color: TINTA }}>{proyecto.nombre}</div>
          <div className="text-[10.5px]" style={{ color: "#71717A" }}>{proyecto.id}</div>

          <div className="mt-2.5 h-[3px] w-full rounded-full" style={{ background: "#E4E4E7" }}>
            <div className="h-full rounded-full transition-all duration-100"
                 style={{ width: `${total ? (llenos / total) * 100 : 0}%`, background: "#0F766E" }} />
          </div>
          <div className="mt-1.5 text-[10.5px]" style={{ color: "#71717A" }}>
            {llenos} / {total} campos · pantalla {paso + 1} de 8
          </div>

          {pantallaLista ? (
            /* La extension termino su pantalla y cede el turno. Este es el momento
               que el jurado tiene que ver: Cimiento redacta, la persona aprueba. */
            <div className="mt-2.5 rounded-[3px] border p-2.5" style={{ borderColor: "#0F766E", background: "#F0FDFA" }}>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "#0F766E" }}>
                <Check size={13} /> Pantalla {paso + 1} de 8 lista
              </div>
              <p className="mt-1 text-[10.5px] leading-snug" style={{ color: "#3F6B66" }}>
                Revisá los datos y dale <strong>Siguiente</strong>. Cimiento no avanza
                ni envía nada por su cuenta.
              </p>
            </div>
          ) : !listo ? (
            <button
              onClick={() => { setPaso(0); setLlenos(0); setCorriendo(true); }}
              disabled={corriendo}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[3px] px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-60"
              style={{ background: "#0F766E" }}
            >
              {corriendo ? <><Loader2 size={13} className="animate-spin" /> Completando…</> : "Autocompletar formulario"}
            </button>
          ) : (
            <>
              <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "#15803D" }}>
                <Check size={13} /> Las 8 pantallas completas
              </div>
              {docs.length > 0 && (
                <div className="mt-1.5 text-[10.5px]" style={{ color: "#71717A" }}>
                  {docs.length} documento{docs.length === 1 ? "" : "s"} adjuntado{docs.length === 1 ? "" : "s"} desde la ingesta
                </div>
              )}
              <div className="mt-2.5 rounded-[3px] border p-2.5" style={{ borderColor: "#B45309", background: "#FFFBEB" }}>
                <p className="text-[10.5px] leading-snug" style={{ color: "#7C4A08" }}>
                  Este formulario cubre gobierno central. Los requisitos municipales de{" "}
                  {proyecto.municipalidadLabel} <strong>no viajan aquí</strong> — se tramitan aparte, y
                  son los que Cimiento te lleva en paralelo.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
