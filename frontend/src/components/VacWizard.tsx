import React, { useState, useMemo } from "react";
import {
  FileText, User, Building2, Leaf, ShieldCheck, Paperclip,
  MapPin, Users, CheckCircle2, ChevronLeft, ChevronRight,
  Plus, Trash2, Copy, Check,
} from "lucide-react";
import RequisitosPanel from "./RequisitosPanel";

// ---------- design tokens ----------
const NAVY = "#16324F";
const NAVY_DEEP = "#0E2238";
const PAPER = "#EDF2F6";
const LINE = "#C7D3DD";
const ORANGE = "#E8622C";
const GREEN = "#2D9D78";
const INK = "#1A2332";

// ---------- types ----------
interface Step {
  key: string;
  label: string;
  sheet: string;
  icon: React.ElementType;
}

interface Coord {
  tipo: string;
  longitud: string;
  latitud: string;
}

interface Contacto {
  tipo: string;
  nombre: string;
  direccion: string;
  correo: string;
  profesion: string;
  telefono: string;
}

interface SolicitanteData {
  nit?: string;
  tipoEmpresa?: string;
  nombreComercial?: string;
  razonSocial?: string;
  ciiu?: string;
  telefono?: string;
  domicilioFiscal?: string;
  zona?: string;
  departamento?: string;
  municipio?: string;
  emailPrincipal?: string;
  emailSecundario?: string;
  representante?: string;
  fechaNacimiento?: string;
  genero?: string;
  etnia?: string;
  idioma?: string;
}

interface ProyectoData {
  nombre?: string;
  tipoUso?: string;
  niveles?: string;
  tipoAmbiental?: string;
  colindancias?: string;
  adyacenteCultural?: string;
  tipoObra?: string;
  afectaPaisaje?: string;
  aguasPluviales?: string;
  afectaSalud?: string;
  impactoSocial?: string;
  almacenamiento?: string;
  areaTerreno?: string;
  areaConstruccion?: string;
  montoInversion?: string;
  empleosGenerados?: string;
  descEntorno?: string;
  descActividades?: string;
  descProyecto?: string;
  categoriaPot?: string;
  bosque?: string;
  alturaEdificio?: string;
  cotaBanqueta?: string;
  sitioArqueologico?: string;
  nombreSitio?: string;
  epoca?: string;
  direccionInmueble?: string;
  deptoInmueble?: string;
  municipioInmueble?: string;
  finca?: string;
  folio?: string;
  libro?: string;
}

interface AmbientalData {
  tipoLicencia?: string;
  consumoAgua?: string;
  consumoEnergia?: string;
  empresaEnergia?: string;
  caracterizacionAR?: string;
  descargaAR?: string;
  consumoAguaPotable?: string;
  empresaAgua?: string;
  transporte?: string;
  jornada?: string;
  numEmpleados?: string;
  empleadosPorJornada?: string;
  olores?: string;
  gases?: string;
  riesgosOcupacionales?: string;
  proveedorConsumo?: string;
  ruido?: string;
  tipoRiesgo?: string;
  tratamientoAR?: string;
  usoConsumo?: string;
  desechosSolidos?: string;
}

interface SeguridadData {
  planMitigacion?: string;
  equipoProteccion?: string;
}

interface FormData {
  solicitante: SolicitanteData;
  proyecto: ProyectoData;
  ambiental: AmbientalData;
  seguridad: SeguridadData;
}

// ---------- constants ----------
const STEPS: Step[] = [
  { key: "docs",        label: "Documentos requeridos", sheet: "01", icon: FileText },
  { key: "solicitante", label: "Solicitante",            sheet: "02", icon: User },
  { key: "proyecto",    label: "Datos del proyecto",     sheet: "03", icon: Building2 },
  { key: "ambiental",   label: "Información ambiental",  sheet: "04", icon: Leaf },
  { key: "seguridad",   label: "Seguridad",              sheet: "05", icon: ShieldCheck },
  { key: "adjuntos",    label: "Documentos adjuntos",    sheet: "06", icon: Paperclip },
  { key: "coordenadas", label: "Coordenadas",            sheet: "07", icon: MapPin },
  { key: "contactos",   label: "Contactos",              sheet: "08", icon: Users },
  { key: "revision",    label: "Revisión y envío",       sheet: "09", icon: CheckCircle2 },
];

const DOCS_REQUERIDOS: string[] = [
  "Documento de Identificación Representante Legal",
  "Nombramiento de Representante Legal",
  "Patente de Comercio y de Sociedad",
  "Certificación Registro de la Propiedad",
  "Registro Tributario Unificado RTU",
  "Plano de Localización del Proyecto",
  "Plano de Ubicación del Proyecto (con coordenadas)",
  "Plano Acotado",
  "Plano Amueblado",
  "Plano de Elevaciones",
  "Plano de Secciones",
  "Contrato legal aplicable al proyecto",
  "Constancias de Colegiado Activo de los profesionales",
  "Instrumento Ambiental",
  "Factura pago DGAC (cuando aplique)",
  "Recibo pago MSPAS (cuando aplique)",
  "Plano de Conjunto (si hay varias torres)",
  "Coordenadas de ubicación (las 4)",
];

const ADJUNTOS_LISTA: string[] = [
  "Certificación del Registro de la Propiedad",
  "Nombramiento de representante legal",
  "Patente de comercio de la empresa",
  "Carta de compromiso de señalización DGAC",
  "Memoria descriptiva del proyecto - CONRED",
  "Elevaciones y Secciones - DGAC",
  "Planos de ruta de evacuación - CONRED",
];

const TIPOS_CONTACTO: string[] = [
  "Representante Legal",
  "Responsable de Ejecución",
  "Responsable de Evaluación",
  "Responsable de Planificación",
  "Arrendatario",
];

// ---------- primitive components ----------
interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, required, children, hint }: FieldProps) {
  return (
    <label className="block">
      <span
        className="flex items-baseline gap-1 text-[11px] font-semibold tracking-wide uppercase"
        style={{ color: NAVY }}
      >
        {label}
        {required && <span style={{ color: ORANGE }}>*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <span className="mt-1 block text-[11px]" style={{ color: "#6B7A89" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

const inputBase =
  "w-full rounded-none border-b-2 bg-white/60 px-2.5 py-2 text-[13.5px] outline-none transition-colors focus:bg-white";

interface TextInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}

function TextInput({ value, onChange, placeholder, type = "text", hint }: TextInputProps) {
  return (
    <>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputBase}
        style={{ borderColor: LINE, color: INK }}
        onFocus={(e) => (e.target.style.borderColor = ORANGE)}
        onBlur={(e) => (e.target.style.borderColor = LINE)}
      />
      {hint && (
        <p className="mt-1 text-[11px]" style={{ color: "#9AA8B5" }}>
          {hint}
        </p>
      )}
    </>
  );
}

interface TextAreaProps {
  value?: string;
  onChange: (value: string) => void;
  rows?: number;
}

function TextArea({ value, onChange, rows = 3 }: TextAreaProps) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={inputBase + " resize-none"}
      style={{ borderColor: LINE, color: INK }}
      onFocus={(e) => (e.target.style.borderColor = ORANGE)}
      onBlur={(e) => (e.target.style.borderColor = LINE)}
    />
  );
}

interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

function Select({ value, onChange, options, placeholder }: SelectProps) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputBase}
      style={{ borderColor: LINE, color: INK }}
    >
      <option value="">{placeholder ?? "Seleccione..."}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

interface YesNoProps {
  value?: string;
  onChange: (value: string) => void;
}

function YesNo({ value, onChange }: YesNoProps) {
  return (
    <div className="flex gap-4 pt-1">
      {["Sí", "No"].map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => onChange(opt)}
          className="flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: value === opt ? ORANGE : "#6B7A89" }}
        >
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full border-2"
            style={{ borderColor: value === opt ? ORANGE : LINE }}
          >
            {value === opt && (
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: ORANGE }} />
            )}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}

interface SheetHeaderProps {
  step: Step;
}

function SheetHeader({ step }: SheetHeaderProps) {
  const Icon = step.icon;
  return (
    <div className="mb-6 flex items-end justify-between border-b-2 pb-4" style={{ borderColor: NAVY }}>
      <div>
        <div
          className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em]"
          style={{ color: ORANGE }}
        >
          HOJA {step.sheet} / 09
        </div>
        <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold" style={{ color: NAVY }}>
          <Icon size={22} strokeWidth={2.2} />
          {step.label}
        </h2>
      </div>
      <div className="hidden font-mono text-[11px] sm:block" style={{ color: "#8494A3" }}>
        FORMULARIO CONSOLIDADO VAC02
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  ok?: boolean;
}

function SummaryCard({ label, value, ok }: SummaryCardProps) {
  return (
    <div className="rounded-sm border p-3.5" style={{ borderColor: LINE }}>
      <div className="flex items-center justify-between">
        <span
          className="text-[10.5px] font-bold uppercase tracking-wide"
          style={{ color: "#8494A3" }}
        >
          {label}
        </span>
        {ok !== undefined && (
          <span className="h-2 w-2 rounded-full" style={{ background: ok ? GREEN : ORANGE }} />
        )}
      </div>
      <div className="mt-1 text-[14px] font-semibold" style={{ color: INK }}>
        {value}
      </div>
    </div>
  );
}

// ---------- main component ----------
export default function VACWizard() {
  const [step, setStep] = useState<number>(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [data, setData] = useState<FormData>({
    solicitante: {},
    proyecto: {},
    ambiental: {},
    seguridad: {},
  });
  const [coords, setCoords] = useState<Coord[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [adjuntos, setAdjuntos] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  const set =
    <S extends keyof FormData>(section: S) =>
    <F extends keyof FormData[S]>(field: F) =>
    (value: FormData[S][F]) =>
      setData((d) => ({ ...d, [section]: { ...d[section], [field]: value } }));

  const setSolicitante = set("solicitante");
  const setProyecto = set("proyecto");
  const setAmbiental = set("ambiental");
  const setSeguridad = set("seguridad");

  const progress = ((step + 1) / STEPS.length) * 100;

  const addCoord = () =>
    setCoords((c) => [...c, { tipo: "Decimal", longitud: "", latitud: "" }]);

  const addContacto = () =>
    setContactos((c) => [
      ...c,
      { tipo: "", nombre: "", direccion: "", correo: "", profesion: "", telefono: "" },
    ]);

  const fullPayload = useMemo(
    () => ({
      solicitante: data.solicitante,
      proyecto: data.proyecto,
      ambiental: data.ambiental,
      seguridad: data.seguridad,
      coordenadas: coords,
      contactos,
      documentosAdjuntos: adjuntos,
    }),
    [data, coords, contactos, adjuntos],
  );

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(fullPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const updateCoord = (i: number, field: keyof Coord, value: string) =>
    setCoords((arr) => arr.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));

  const updateContacto = (i: number, field: keyof Contacto, value: string) =>
    setContactos((arr) => arr.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: PAPER,
        backgroundImage:
          "linear-gradient(#DCE6EE 1px, transparent 1px), linear-gradient(90deg, #DCE6EE 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* top bar */}
      <div className="text-white" style={{ background: NAVY_DEEP }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-sm font-mono text-sm font-bold"
              style={{ background: ORANGE }}
            >
              VAC
            </div>
            <div>
              <div className="text-sm font-bold leading-none">Ventanilla Ágil de la Construcción</div>
              <div className="mt-0.5 text-[11px] leading-none text-white/50">
                Formulario Consolidado · VAC02
              </div>
            </div>
          </div>
          <div className="hidden font-mono text-[11px] text-white/50 sm:block">app.vac.com.gt</div>
        </div>
        <div className="h-[3px] w-full bg-white/10">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progress}%`, background: ORANGE }}
          />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-6 px-5 py-8">
        {/* sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <ol className="space-y-0.5">
            {STEPS.map((s, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => setStep(i)}
                    className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-[13px] transition-colors"
                    style={{
                      background: active ? NAVY : "transparent",
                      color: active ? "white" : done ? NAVY : "#6B7A89",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px]"
                      style={{
                        background: active ? ORANGE : done ? GREEN : "transparent",
                        color: active || done ? "white" : "#8494A3",
                        border: active || done ? "none" : `1.5px solid ${LINE}`,
                      }}
                    >
                      {done ? <Check size={11} /> : s.sheet}
                    </span>
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* main sheet */}
        <main className="flex-1 rounded-sm bg-white p-6 shadow-[0_1px_0_#C7D3DD,0_8px_24px_-12px_rgba(22,50,79,0.25)] sm:p-8">
          <SheetHeader step={STEPS[step]} />

          {/* STEP 0: docs requeridos */}
          {step === 0 && (
            <div>
              <p className="mb-5 text-[13.5px] leading-relaxed" style={{ color: "#4A5A6A" }}>
                Antes de iniciar, verificá que tengas disponibles estos documentos. Se solicitan una
                sola vez y se reutilizan para todas las instituciones dentro de la plataforma.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {DOCS_REQUERIDOS.map((doc) => (
                  <label
                    key={doc}
                    className="flex cursor-pointer items-start gap-2.5 rounded-sm border px-3 py-2.5 text-[13px]"
                    style={{
                      borderColor: checked[doc] ? GREEN : LINE,
                      background: checked[doc] ? "#F0FAF6" : "white",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[doc]}
                      onChange={(e) =>
                        setChecked((c) => ({ ...c, [doc]: e.target.checked }))
                      }
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <span style={{ color: INK }}>{doc}</span>
                  </label>
                ))}
              </div>
              <p className="mt-4 font-mono text-[11px]" style={{ color: "#8494A3" }}>
                {Object.values(checked).filter(Boolean).length} / {DOCS_REQUERIDOS.length} confirmados
              </p>
            </div>
          )}

          {/* STEP 1: solicitante */}
          {step === 1 && (
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field label="NIT" required>
                <TextInput value={data.solicitante.nit} onChange={setSolicitante("nit")} placeholder="0000000-0" />
              </Field>
              <Field label="Tipo de empresa" required>
                <Select value={data.solicitante.tipoEmpresa} onChange={setSolicitante("tipoEmpresa")} options={["Individual", "Sociedad Anónima", "Sociedad Civil", "Otro"]} />
              </Field>
              <Field label="Nombre comercial" required>
                <TextInput value={data.solicitante.nombreComercial} onChange={setSolicitante("nombreComercial")} />
              </Field>
              <Field label="Razón social" required>
                <TextInput value={data.solicitante.razonSocial} onChange={setSolicitante("razonSocial")} />
              </Field>
              <Field label="Actividad económica (CIIU)">
                <TextInput value={data.solicitante.ciiu} onChange={setSolicitante("ciiu")} />
              </Field>
              <Field label="Teléfono principal" required>
                <TextInput value={data.solicitante.telefono} onChange={setSolicitante("telefono")} />
              </Field>
              <Field label="Domicilio fiscal" required>
                <TextInput value={data.solicitante.domicilioFiscal} onChange={setSolicitante("domicilioFiscal")} />
              </Field>
              <Field label="Zona">
                <TextInput value={data.solicitante.zona} onChange={setSolicitante("zona")} />
              </Field>
              <Field label="Departamento" required>
                <TextInput value={data.solicitante.departamento} onChange={setSolicitante("departamento")} />
              </Field>
              <Field label="Municipio" required>
                <TextInput value={data.solicitante.municipio} onChange={setSolicitante("municipio")} />
              </Field>
              <Field label="Email principal" required>
                <TextInput type="email" value={data.solicitante.emailPrincipal} onChange={setSolicitante("emailPrincipal")} />
              </Field>
              <Field label="Email secundario">
                <TextInput type="email" value={data.solicitante.emailSecundario} onChange={setSolicitante("emailSecundario")} />
              </Field>
              <Field label="Representante legal" required>
                <TextInput value={data.solicitante.representante} onChange={setSolicitante("representante")} />
              </Field>
              <Field label="Fecha de nacimiento" required>
                <TextInput type="date" value={data.solicitante.fechaNacimiento} onChange={setSolicitante("fechaNacimiento")} />
              </Field>
              <Field label="Género" required>
                <div className="flex gap-4 pt-1.5">
                  {["Femenino", "Masculino"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSolicitante("genero")(g)}
                      className="text-[13px] font-medium"
                      style={{ color: data.solicitante.genero === g ? ORANGE : "#6B7A89" }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Etnia" required>
                <TextInput value={data.solicitante.etnia} onChange={setSolicitante("etnia")} />
              </Field>
              <Field label="Idioma" required>
                <TextInput value={data.solicitante.idioma} onChange={setSolicitante("idioma")} />
              </Field>
            </div>
          )}

          {/* STEP 2: proyecto */}
          {step === 2 && (
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field label="Nombre del proyecto" required>
                <TextInput value={data.proyecto.nombre} onChange={setProyecto("nombre")} hint="Debe coincidir exacto con planos y documentos legales" />
              </Field>
              <Field label="Tipo de uso" required>
                <Select value={data.proyecto.tipoUso} onChange={setProyecto("tipoUso")} options={["Apartamentos", "Plaza Comercial", "Oficina", "Vivienda", "Industrial", "Mixto"]} />
              </Field>
              <Field label="Niveles" required>
                <TextInput type="number" value={data.proyecto.niveles} onChange={setProyecto("niveles")} hint="Más de 16m requiere autorización DGAC" />
              </Field>
              <Field label="Tipo según listado taxativo ambiental" required>
                <TextInput value={data.proyecto.tipoAmbiental} onChange={setProyecto("tipoAmbiental")} />
              </Field>
              <Field label="Actividades colindantes" required>
                <TextInput value={data.proyecto.colindancias} onChange={setProyecto("colindancias")} placeholder="Norte, sur, este, oeste..." />
              </Field>
              <Field label="¿Adyacente a sitio cultural/arqueológico?" required>
                <YesNo value={data.proyecto.adyacenteCultural} onChange={setProyecto("adyacenteCultural")} />
              </Field>
              <Field label="Tipo de obra" required>
                <div className="flex gap-4 pt-1.5">
                  {["General", "Urbanización"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setProyecto("tipoObra")(g)}
                      className="text-[13px] font-medium"
                      style={{ color: data.proyecto.tipoObra === g ? ORANGE : "#6B7A89" }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="¿Afecta el paisaje?" required>
                <YesNo value={data.proyecto.afectaPaisaje} onChange={setProyecto("afectaPaisaje")} />
              </Field>
              <Field label="¿Genera aguas pluviales?" required>
                <YesNo value={data.proyecto.aguasPluviales} onChange={setProyecto("aguasPluviales")} />
              </Field>
              <Field label="¿Afecta salud humana circunvecina?" required>
                <YesNo value={data.proyecto.afectaSalud} onChange={setProyecto("afectaSalud")} />
              </Field>
              <Field label="¿Impacto social?" required>
                <YesNo value={data.proyecto.impactoSocial} onChange={setProyecto("impactoSocial")} />
              </Field>
              <Field label="¿Almacenamiento de agua/combustibles/lubricantes?" required>
                <YesNo value={data.proyecto.almacenamiento} onChange={setProyecto("almacenamiento")} />
              </Field>
              <Field label="Área total del terreno (m²)" required>
                <TextInput type="number" value={data.proyecto.areaTerreno} onChange={setProyecto("areaTerreno")} />
              </Field>
              <Field label="Área total de construcción (m²)" required>
                <TextInput type="number" value={data.proyecto.areaConstruccion} onChange={setProyecto("areaConstruccion")} />
              </Field>
              <Field label="Monto de inversión (Q)" required>
                <TextInput type="number" value={data.proyecto.montoInversion} onChange={setProyecto("montoInversion")} />
              </Field>
              <Field label="Número de empleos que genera" required>
                <TextInput type="number" value={data.proyecto.empleosGenerados} onChange={setProyecto("empleosGenerados")} />
              </Field>
              <Field label="Descripción de características del entorno" required>
                <TextArea value={data.proyecto.descEntorno} onChange={setProyecto("descEntorno")} />
              </Field>
              <Field label="Descripción de actividades (etapa construcción)" required>
                <TextArea value={data.proyecto.descActividades} onChange={setProyecto("descActividades")} />
              </Field>
              <Field label="Descripción del proyecto" required>
                <TextArea value={data.proyecto.descProyecto} onChange={setProyecto("descProyecto")} />
              </Field>
              <Field label="Categoría según POT">
                <TextInput value={data.proyecto.categoriaPot} onChange={setProyecto("categoriaPot")} />
              </Field>
              <Field label="¿Tiene una hectárea o más de bosque?" required>
                <YesNo value={data.proyecto.bosque} onChange={setProyecto("bosque")} />
              </Field>
              <Field label="Altura del edificio (m)" required>
                <TextInput type="number" value={data.proyecto.alturaEdificio} onChange={setProyecto("alturaEdificio")} />
              </Field>
              <Field label="Cota de la banqueta (m)" required>
                <TextInput type="number" value={data.proyecto.cotaBanqueta} onChange={setProyecto("cotaBanqueta")} />
              </Field>
              <Field label="¿Está en sitio arqueológico?" required>
                <YesNo value={data.proyecto.sitioArqueologico} onChange={setProyecto("sitioArqueologico")} />
              </Field>
              {data.proyecto.sitioArqueologico === "Sí" && (
                <>
                  <Field label="Nombre del sitio arqueológico" required>
                    <TextInput value={data.proyecto.nombreSitio} onChange={setProyecto("nombreSitio")} />
                  </Field>
                  <Field label="Época" required>
                    <TextInput value={data.proyecto.epoca} onChange={setProyecto("epoca")} />
                  </Field>
                </>
              )}
              <Field label="Dirección del inmueble" required>
                <TextInput value={data.proyecto.direccionInmueble} onChange={setProyecto("direccionInmueble")} hint="Tal como aparece en catastro" />
              </Field>
              <Field label="Departamento (inmueble)" required>
                <TextInput value={data.proyecto.deptoInmueble} onChange={setProyecto("deptoInmueble")} />
              </Field>
              <Field label="Municipio (inmueble)" required>
                <TextInput value={data.proyecto.municipioInmueble} onChange={setProyecto("municipioInmueble")} />
              </Field>
              <Field label="Información registral — Finca" required>
                <TextInput value={data.proyecto.finca} onChange={setProyecto("finca")} />
              </Field>
              <Field label="Información registral — Folio" required>
                <TextInput value={data.proyecto.folio} onChange={setProyecto("folio")} />
              </Field>
              <Field label="Información registral — Libro" required>
                <TextInput value={data.proyecto.libro} onChange={setProyecto("libro")} />
              </Field>
            </div>
          )}

          {/* STEP 3: ambiental */}
          {step === 3 && (
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field label="Tipo de licencia a solicitar" required>
                <Select value={data.ambiental.tipoLicencia} onChange={setAmbiental("tipoLicencia")} options={["A", "B1", "B2"]} />
              </Field>
              <Field label="Cantidad consumo agua/combustibles/lubricantes" required>
                <TextInput value={data.ambiental.consumoAgua} onChange={setAmbiental("consumoAgua")} placeholder="m³" />
              </Field>
              <Field label="¿Consumo de energía?" required>
                <YesNo value={data.ambiental.consumoEnergia} onChange={setAmbiental("consumoEnergia")} />
              </Field>
              {data.ambiental.consumoEnergia === "Sí" && (
                <Field label="Empresa de energía">
                  <TextInput value={data.ambiental.empresaEnergia} onChange={setAmbiental("empresaEnergia")} />
                </Field>
              )}
              <Field label="Caracterización de aguas residuales" required>
                <YesNo value={data.ambiental.caracterizacionAR} onChange={setAmbiental("caracterizacionAR")} />
              </Field>
              <Field label="Descarga de aguas residuales" required>
                <YesNo value={data.ambiental.descargaAR} onChange={setAmbiental("descargaAR")} />
              </Field>
              <Field label="¿Consumo de agua potable?" required>
                <YesNo value={data.ambiental.consumoAguaPotable} onChange={setAmbiental("consumoAguaPotable")} />
              </Field>
              {data.ambiental.consumoAguaPotable === "Sí" && (
                <Field label="Empresa proveedora de agua">
                  <TextInput value={data.ambiental.empresaAgua} onChange={setAmbiental("empresaAgua")} />
                </Field>
              )}
              <Field label="Especificación del transporte" required>
                <TextInput value={data.ambiental.transporte} onChange={setAmbiental("transporte")} placeholder="Público / privado / especial" />
              </Field>
              <Field label="Jornada de trabajo" required>
                <TextInput value={data.ambiental.jornada} onChange={setAmbiental("jornada")} placeholder="Diaria / mixta / diurna" />
              </Field>
              <Field label="Número de empleados" required>
                <TextInput type="number" value={data.ambiental.numEmpleados} onChange={setAmbiental("numEmpleados")} />
              </Field>
              <Field label="Número de empleados por jornada" required>
                <TextInput type="number" value={data.ambiental.empleadosPorJornada} onChange={setAmbiental("empleadosPorJornada")} />
              </Field>
              <Field label="¿Producción de olores?" required>
                <YesNo value={data.ambiental.olores} onChange={setAmbiental("olores")} />
              </Field>
              <Field label="¿Producción de gases o partículas?" required>
                <YesNo value={data.ambiental.gases} onChange={setAmbiental("gases")} />
              </Field>
              <Field label="¿Riesgos ocupacionales?" required>
                <YesNo value={data.ambiental.riesgosOcupacionales} onChange={setAmbiental("riesgosOcupacionales")} />
              </Field>
              <Field label="¿Proveedor de consumo de agua/combustibles?" required>
                <YesNo value={data.ambiental.proveedorConsumo} onChange={setAmbiental("proveedorConsumo")} />
              </Field>
              <Field label="¿Ruido y vibraciones?" required>
                <YesNo value={data.ambiental.ruido} onChange={setAmbiental("ruido")} />
              </Field>
              {data.ambiental.riesgosOcupacionales === "Sí" && (
                <Field label="Tipo de riesgo al que se expone la actividad" required>
                  <TextInput value={data.ambiental.tipoRiesgo} onChange={setAmbiental("tipoRiesgo")} />
                </Field>
              )}
              <Field label="Tratamiento de aguas residuales" required>
                <TextArea rows={2} value={data.ambiental.tratamientoAR} onChange={setAmbiental("tratamientoAR")} />
              </Field>
              <Field label="Uso de consumo de agua/combustibles/lubricantes" required>
                <TextArea rows={2} value={data.ambiental.usoConsumo} onChange={setAmbiental("usoConsumo")} />
              </Field>
              <Field label="Volumen de desechos sólidos" required>
                <TextInput value={data.ambiental.desechosSolidos} onChange={setAmbiental("desechosSolidos")} />
              </Field>
            </div>
          )}

          {/* STEP 4: seguridad */}
          {step === 4 && (
            <div className="grid gap-6">
              <Field label="Plan de mitigación" required hint="Resumen del Plan de Mitigación de Riesgos del instrumento ambiental">
                <TextArea rows={5} value={data.seguridad.planMitigacion} onChange={setSeguridad("planMitigacion")} />
              </Field>
              <Field label="Equipo de protección" required hint="Equipo de protección considerado para reducción de accidentes">
                <TextArea rows={5} value={data.seguridad.equipoProteccion} onChange={setSeguridad("equipoProteccion")} />
              </Field>
            </div>
          )}

          {/* STEP 5: adjuntos */}
          {step === 5 && (
            <div>
              <p className="mb-5 text-[13.5px] leading-relaxed" style={{ color: "#4A5A6A" }}>
                Máx. 100mb por archivo. Deben ser legibles y completos — un documento incompleto
                genera devolución.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {ADJUNTOS_LISTA.map((doc) => {
                  const loaded = adjuntos[doc];
                  return (
                    <div
                      key={doc}
                      className="flex items-center justify-between gap-3 rounded-sm border px-3 py-3"
                      style={{ borderColor: loaded ? GREEN : LINE }}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} style={{ color: loaded ? GREEN : "#8494A3" }} />
                        <span className="text-[12.5px]" style={{ color: INK }}>{doc}</span>
                      </div>
                      <button
                        onClick={() => setAdjuntos((a) => ({ ...a, [doc]: !a[doc] }))}
                        className="shrink-0 rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                        style={{ background: loaded ? GREEN : NAVY, color: "white" }}
                      >
                        {loaded ? "Cargado" : "Adjuntar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: coordenadas */}
          {step === 6 && (
            <div>
              <p className="mb-4 text-[13.5px] leading-relaxed" style={{ color: "#4A5A6A" }}>
                Se requieren al menos 4 puntos, todos en el mismo formato.
              </p>
              <div className="space-y-3">
                {coords.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3 rounded-sm border p-3"
                    style={{ borderColor: LINE }}
                  >
                    <Field label={`Tipo #${i + 1}`}>
                      <Select value={c.tipo} onChange={(v) => updateCoord(i, "tipo", v)} options={["Decimal", "Sexagesimal", "GTM", "UTM"]} />
                    </Field>
                    <Field label="Longitud">
                      <TextInput value={c.longitud} onChange={(v) => updateCoord(i, "longitud", v)} />
                    </Field>
                    <Field label="Latitud">
                      <TextInput value={c.latitud} onChange={(v) => updateCoord(i, "latitud", v)} />
                    </Field>
                    <button
                      onClick={() => setCoords((arr) => arr.filter((_, idx) => idx !== i))}
                      className="mb-2 rounded-sm p-2"
                      style={{ color: ORANGE }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addCoord}
                className="mt-4 flex items-center gap-1.5 rounded-sm px-3 py-2 text-[12.5px] font-bold uppercase tracking-wide text-white"
                style={{ background: NAVY }}
              >
                <Plus size={14} /> Agregar coordenada
              </button>
              <p className="mt-3 font-mono text-[11px]" style={{ color: coords.length >= 4 ? GREEN : ORANGE }}>
                {coords.length} / 4 mínimo requerido
              </p>
            </div>
          )}

          {/* STEP 7: contactos */}
          {step === 7 && (
            <div>
              <p className="mb-4 text-[13.5px] leading-relaxed" style={{ color: "#4A5A6A" }}>
                Un profesional puede tener más de un rol. Si no aplica, usá "NA" en el nombre.
              </p>
              <div className="space-y-4">
                {contactos.map((c, i) => (
                  <div key={i} className="rounded-sm border p-4" style={{ borderColor: LINE }}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold" style={{ color: NAVY }}>
                        CONTACTO {i + 1}
                      </span>
                      <button
                        onClick={() => setContactos((arr) => arr.filter((_, idx) => idx !== i))}
                        style={{ color: ORANGE }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Tipo">
                        <Select value={c.tipo} onChange={(v) => updateContacto(i, "tipo", v)} options={TIPOS_CONTACTO} />
                      </Field>
                      <Field label="Nombre">
                        <TextInput value={c.nombre} onChange={(v) => updateContacto(i, "nombre", v)} />
                      </Field>
                      <Field label="Dirección">
                        <TextInput value={c.direccion} onChange={(v) => updateContacto(i, "direccion", v)} />
                      </Field>
                      <Field label="Correo">
                        <TextInput type="email" value={c.correo} onChange={(v) => updateContacto(i, "correo", v)} />
                      </Field>
                      <Field label="Profesión">
                        <TextInput value={c.profesion} onChange={(v) => updateContacto(i, "profesion", v)} />
                      </Field>
                      <Field label="Teléfono">
                        <TextInput value={c.telefono} onChange={(v) => updateContacto(i, "telefono", v)} />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addContacto}
                className="mt-4 flex items-center gap-1.5 rounded-sm px-3 py-2 text-[12.5px] font-bold uppercase tracking-wide text-white"
                style={{ background: NAVY }}
              >
                <Plus size={14} /> Agregar contacto
              </button>
            </div>
          )}

          {/* STEP 8: revision */}
          {step === 8 && (
            <div>
              <p className="mb-5 text-[13.5px] leading-relaxed" style={{ color: "#4A5A6A" }}>
                Revisá el resumen antes de enviar. Una vez enviado, el expediente pasa a
                revisión/aprobación/corrección por cada institución.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard label="Proyecto" value={data.proyecto.nombre ?? "—"} />
                <SummaryCard label="Solicitante" value={data.solicitante.razonSocial ?? "—"} />
                <SummaryCard label="Coordenadas" value={`${coords.length} puntos`} ok={coords.length >= 4} />
                <SummaryCard label="Contactos" value={`${contactos.length} registrados`} ok={contactos.length > 0} />
                <SummaryCard
                  label="Adjuntos"
                  value={`${Object.values(adjuntos).filter(Boolean).length}/${ADJUNTOS_LISTA.length}`}
                  ok={Object.values(adjuntos).filter(Boolean).length === ADJUNTOS_LISTA.length}
                />
                <SummaryCard
                  label="Documentos previos"
                  value={`${Object.values(checked).filter(Boolean).length}/${DOCS_REQUERIDOS.length}`}
                  ok={Object.values(checked).filter(Boolean).length === DOCS_REQUERIDOS.length}
                />
              </div>

              <div className="mt-8 border-t pt-6" style={{ borderColor: LINE }}>
                <h2 className="mb-1 text-[15px] font-bold" style={{ color: NAVY }}>
                  Qué te van a pedir de verdad
                </h2>
                <p className="mb-4 text-[12.5px]" style={{ color: "#4A5A6A" }}>
                  Calculado en vivo por el motor de reglas, contra normativa real de la VAC y de tu municipalidad.
                </p>
                <RequisitosPanel form={data} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={copyJson}
                  className="flex items-center gap-2 rounded-sm border px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wide"
                  style={{ borderColor: NAVY, color: NAVY }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado" : "Copiar JSON del expediente"}
                </button>
                <button
                  className="flex items-center gap-2 rounded-sm px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white"
                  style={{ background: ORANGE }}
                >
                  <CheckCircle2 size={15} /> Enviar expediente
                </button>
              </div>

              <pre
                className="mt-6 max-h-64 overflow-auto rounded-sm border p-3 font-mono text-[10.5px] leading-relaxed"
                style={{ borderColor: LINE, color: "#4A5A6A", background: "#FAFCFD" }}
              >
                {JSON.stringify(fullPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* nav */}
          <div className="mt-8 flex items-center justify-between border-t pt-5" style={{ borderColor: LINE }}>
            <button
              onClick={goBack}
              disabled={step === 0}
              className="flex items-center gap-1.5 rounded-sm px-4 py-2 text-[12.5px] font-bold uppercase tracking-wide disabled:opacity-30"
              style={{ color: NAVY }}
            >
              <ChevronLeft size={15} /> Anterior
            </button>
            <span className="font-mono text-[11px]" style={{ color: "#8494A3" }}>
              Paso {step + 1} de {STEPS.length}
            </span>
            <button
              onClick={goNext}
              disabled={step === STEPS.length - 1}
              className="flex items-center gap-1.5 rounded-sm px-5 py-2 text-[12.5px] font-bold uppercase tracking-wide text-white disabled:opacity-30"
              style={{ background: NAVY }}
            >
              Siguiente <ChevronRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
