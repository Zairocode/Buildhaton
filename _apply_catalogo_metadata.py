#!/usr/bin/env python3
"""One-shot helper: apply catalog metadata patches. Not part of runtime."""
import json
from pathlib import Path

ROOT = Path(__file__).parent
DOC_PATH = ROOT / "documentos.json"

# confianza: alta | media
PATCHES = {
    # --- correcciones a entradas ya pobladas ---
    "boleto-ornato": {
        "quien_emite": "Tesorería municipal (donde se pagó el arbitrio)",
        "consejo_formato": "Presentá el boleto de la municipalidad donde efectuaste el pago; no tiene que ser la misma donde tramitás.",
        "confianza": "alta",
        "fuente": "MUNIGUATE_guia_09F.pdf — requisito de presentar boleto de la muni del pago",
    },
    "solvencia-municipal": {
        "quien_emite": "Tesorería municipal (Muniguate y SCP) / Departamento de Catastro (Quetzaltenango)",
        "consejo_vencimiento": "Sacala de ultimo, cuando el resto del folder ya este armado -- es el documento que mas se vence mientras el expediente espera. Vigencia: 2 meses en capital y Pinula; 1 mes en Quetzaltenango (POT Art. 53).",
        "confianza": "alta",
        "fuente": "Guía 09-F; SCP obra mayor; POT Quetzaltenango Art. 53",
    },
    "cert-rgp": {
        "consejo_vencimiento": "Pedí una certificación nueva antes de armar el expediente. Vigencia: 6 meses capital, 3 meses Pinula y Quetzaltenango (Segundo Registro, POT Art. 148). Si el proyecto cruza municipalidades, usá el plazo más corto.",
        "confianza": "alta",
        "fuente": "Guía 09-F; comparativa-municipal; POT Quetzaltenango Art. 148",
    },
    "estudio-geotecnico-conred-xela": {
        "quien_emite": "CONRED (autorización de habitabilidad)",
        "consejo_formato": "El estudio geotécnico lo elabora un profesional colegiado; la autorización favorable de habitabilidad la emite CONRED.",
        "confianza": "alta",
        "fuente": "POT Quetzaltenango Art. 49",
    },
    # --- alta: emisor institucional ---
    "acta-notarial-asumiendo-responsabilidad": {
        "quien_emite": "Notario",
        "confianza": "alta",
        "fuente": "SCP_construccion_mayor.pdf",
    },
    "acta-notarial-de-compromiso-de": {
        "quien_emite": "Notario",
        "consejo_formato": "Usar el formato adjunto en los requisitos DGAC; compromiso de señalización por declaración jurada.",
        "confianza": "alta",
        "fuente": "VAC04 DGAC §10",
    },
    "autorizacion-del-delegado-de-derecho-de": {
        "quien_emite": "Delegado de Derecho de Vía, MOPT (Asesoría Jurídica de Caminos)",
        "confianza": "alta",
        "fuente": "SCP gran magnitud",
    },
    "carta-de-la-asociacion-de-vecinos": {
        "quien_emite": "Asociación de vecinos debidamente registrada",
        "confianza": "alta",
        "fuente": "SCP_construccion_mayor.pdf",
    },
    "certificacion-catastral-de-la-direccion": {
        "quien_emite": "Dirección de Catastro, Municipalidad de Santa Catarina Pinula",
        "confianza": "alta",
        "fuente": "SCP_construccion_mayor.pdf",
    },
    "certificado-de-calidad-del-agua-ag-178": {
        "quien_emite": "MSPAS",
        "consejo_vencimiento": "Si la fuente es pozo, presentalo dentro del plazo del AG 178-2009 tras la perforación; si no, el dictamen sanitario favorable se anula.",
        "confianza": "alta",
        "fuente": "VAC04 MSPAS §18; AG 178-2009",
    },
    "constancia-de-pago-del-ultimo-mes-del": {
        "quien_emite": "Proveedor municipal de agua potable",
        "confianza": "alta",
        "fuente": "SCP_construccion_mayor.pdf — rama agua municipal",
    },
    "constancia-del-abastecedor-garantizando": {
        "quien_emite": "Abastecedor del sistema de agua",
        "confianza": "alta",
        "fuente": "VAC04 MSPAS §19",
    },
    "consulta-a-se-obtiene-en-la-ventanilla": {
        "quien_emite": "Ventanilla Única Municipal (Municipalidad de Guatemala)",
        "consejo_formato": "Se proporciona en las instalaciones de la VUM; no tiene URL ni descarga.",
        "confianza": "alta",
        "fuente": "MUNIGUATE_guia_09F.pdf",
    },
    "dictamen-de-agua-y-saneamiento": {
        "quien_emite": "Empresa privada de agua y saneamiento",
        "confianza": "alta",
        "fuente": "SCP_construccion_mayor.pdf — rama empresa privada",
    },
    "dictamen-de-autorizacion-de-la-direccion": {
        "quien_emite": "Dirección de Agua y Saneamiento, Municipalidad de Santa Catarina Pinula",
        "confianza": "alta",
        "fuente": "SCP_construccion_mayor.pdf — rama pozo artesanal",
    },
    "dictamen-del-ign-con-banco-de-marca-mas": {
        "quien_emite": "Instituto Geográfico Nacional (IGN)",
        "confianza": "alta",
        "fuente": "VAC04 DGAC §7",
    },
    "dictamen-favorable-del-inab": {
        "quien_emite": "INAB",
        "confianza": "alta",
        "fuente": "MUNIGUATE_guia_09F (corte >10 m³); SCP guías",
    },
    "duplicado-del-recibo-de-pago-por": {
        "quien_emite": "EMPAGUA",
        "confianza": "alta",
        "fuente": "MUNIGUATE_guia_00F_01F.pdf",
    },
    "edicto-publicado-archivo-individual": {
        "quien_emite": "MARN (publicación en proceso del instrumento ambiental)",
        "consejo_formato": "Solo categorías ambientales A y B1; B2 queda exento.",
        "confianza": "alta",
        "fuente": "VAC04 MARN; matriz-requisitos.md",
    },
    "factura-electronica-dgac": {
        "quien_emite": "DGAC",
        "confianza": "alta",
        "fuente": "VAC04 DGAC §9",
    },
    "fianza-de-cumplimiento-a-favor-de-la": {
        "quien_emite": "Compañía afianzadora (a favor de la municipalidad)",
        "confianza": "alta",
        "fuente": "SCP gran magnitud; Código Municipal Art. 148",
    },
    "informacion-catastral-del-poligono": {
        "quien_emite": "Municipalidad del predio",
        "confianza": "alta",
        "fuente": "VAC04 MSPAS §4",
    },
    "pago-de-arancel-aa-011": {
        "quien_emite": "MSPAS (arancel código AA-011, AG 53-2022)",
        "confianza": "alta",
        "fuente": "VAC04 MSPAS §12",
    },
    "plan-de-aprovechamiento-forestal": {
        "quien_emite": "INAB",
        "confianza": "alta",
        "fuente": "VAC02 Anexo I",
    },
    "recibo-de-pago-de-tasa-q-350-00-por": {
        "quien_emite": "Tesorería Municipal de Guatemala",
        "confianza": "alta",
        "fuente": "MUNIGUATE_guia_09F.pdf — tasa EAP Q350",
    },
    "resolucion-del-area-de-salud-area-norte": {
        "quien_emite": "MSPAS — Área de Salud Norte",
        "confianza": "alta",
        "fuente": "SCP gran magnitud",
    },
    "resolucion-favorable-de-la-dgac": {
        "quien_emite": "DGAC",
        "confianza": "alta",
        "fuente": "MUNIGUATE_guia_00F; VAC04 DGAC",
    },
    "resolucion-favorable-del-marn-y-licencia": {
        "quien_emite": "MARN / DIGARN",
        "consejo_vencimiento": "Tras la resolución, la boleta de pago de licencia vence en 72 horas (VAC09).",
        "confianza": "alta",
        "fuente": "VAC04 MARN; VAC09; municipal-guatemala.md costura VAC↔muni",
    },
    "resolucion-final-del-estudio-de-cambio": {
        "quien_emite": "INAB",
        "confianza": "alta",
        "fuente": "SCP gran magnitud",
    },
    "planos-sellados-por-la-asociacion-de": {
        "quien_emite": "Asociación de vecinos debidamente registrada",
        "confianza": "alta",
        "fuente": "SCP_construccion_mayor.pdf",
    },
    "copia-de-planos-sellados-por-el": {
        "quien_emite": "Ministerio correspondiente (salida del trámite VAC)",
        "consejo_formato": "Copia de planos sellados al concluir MSPAS, MARN u otra institución en la VAC.",
        "confianza": "alta",
        "fuente": "municipal-guatemala.md — costura VAC↔muni",
    },
    # --- media: firmantes / elaboradores / plantillas ---
    "acta-de-declaracion-jurada-de": {
        "quien_emite": "Profesional estructural y ejecutor (formato VUM)",
        "consejo_formato": "Acta de declaración jurada NRD-1; incluir en planos los códigos AGIES aplicados.",
        "confianza": "media",
        "fuente": "MUNIGUATE_guia_00F — actas CONRED NRD-1",
    },
    "acta-de-declaracion-jurada-de-2": {
        "quien_emite": "Propietario y ejecutor (formato VUM)",
        "consejo_formato": "Acta de declaración jurada NRD-3 para edificaciones existentes.",
        "confianza": "media",
        "fuente": "MUNIGUATE_guia_00F — actas CONRED NRD-3",
    },
    "alternativa-acta-de-declaracion-jurada": {
        "quien_emite": "Propietario (formato VUM) + recepción MARN",
        "consejo_formato": "Válvula de escape: paralelizar trámite municipal si MARN aún no concluyó.",
        "confianza": "media",
        "fuente": "MUNIGUATE_guia_09F / 00F",
    },
    "alternativa-acta-de-declaracion-jurada-2": {
        "quien_emite": "Propietario (formato VUM) + recepción DGAC",
        "consejo_formato": "Válvula de escape: paralelizar trámite municipal si DGAC aún no concluyó.",
        "confianza": "media",
        "fuente": "MUNIGUATE_guia_00F",
    },
    "declaracion-jurada-del-propietario": {
        "quien_emite": "Propietario",
        "confianza": "media",
        "fuente": "SCP gran magnitud",
    },
    "carta-de-solicitud-al-director-general": {
        "quien_emite": "Solicitante (propietario o representante legal)",
        "confianza": "media",
        "fuente": "VAC04 DGAC §1",
    },
    "memorial-dirigido-al-alcalde-solicitando": {
        "quien_emite": "Solicitante",
        "confianza": "media",
        "fuente": "SCP gran magnitud",
    },
    "resolucion-favorable-del-mem-ministerio": {
        "quien_emite": "MEM (Ministerio de Energía y Minas)",
        "confianza": "media",
        "fuente": "MUNIGUATE_guia_00F — sin requisitos en VAC04",
    },
    "copia-digital-del-instrumento-ambiental": {
        "quien_emite": "Consultor ambiental (elabora); resolución MARN (emite)",
        "consejo_formato": "Misma copia digital del instrumento subido al expediente VAC.",
        "confianza": "media",
        "fuente": "municipal-guatemala.md costura VAC↔muni",
    },
    "estudio-de-cambio-de-uso-de-suelo": {
        "quien_emite": "Consultor (elabora); INAB autoriza",
        "consejo_formato": "Presentar con sello de recibido de INAB.",
        "confianza": "media",
        "fuente": "SCP gran magnitud",
    },
    "estudio-de-impacto-vial": {
        "quien_emite": "Profesional o consultor vial",
        "consejo_formato": "Obligatorio en gran magnitud SCP; en Xela lo define el Departamento de Vía Pública caso a caso (POT Art. 38, SIN_CONFIRMAR umbral).",
        "confianza": "media",
        "fuente": "SCP gran magnitud; quetzaltenango-pot.md",
    },
    "memoria-descriptiva-dct": {
        "quien_emite": "Profesional responsable (formato DCT de ventanilla)",
        "consejo_formato": "La guía de lineamientos DCT se entrega en la Ventanilla Única Municipal.",
        "confianza": "media",
        "fuente": "MUNIGUATE_guia_09F.pdf",
    },
    "formato-de-informacion": {
        "quien_emite": "CONRED (plantilla)",
        "consejo_formato": "Formato oficial NRD-2; lo completa el evaluador del proyecto.",
        "confianza": "media",
        "fuente": "VAC04 CONRED §1",
    },
    "formato-de-evaluacion-nrd2": {
        "quien_emite": "CONRED (plantilla)",
        "consejo_formato": "Formato de evaluación NRD-2.",
        "confianza": "media",
        "fuente": "VAC04 CONRED §2",
    },
    "formulario-de-solicitud-de-control-de": {
        "quien_emite": "DGAC (plantilla; lo firma el representante legal)",
        "confianza": "media",
        "fuente": "VAC04 DGAC §2",
    },
    "formulario-de-solicitud-fs-001-2022": {
        "quien_emite": "MSPAS (plantilla)",
        "consejo_formato": "Firma, huella y datos deben coincidir en toda la documentación del expediente.",
        "confianza": "media",
        "fuente": "VAC04 MSPAS §1",
    },
    "formulario-f02-version-3-todos-los-demas": {
        "quien_emite": "Municipalidad de Guatemala (plantilla F02 v3)",
        "confianza": "media",
        "fuente": "MUNIGUATE_guia_00F_01F.pdf",
    },
    "formulario-f08-version-actual-proyectos": {
        "quien_emite": "Municipalidad de Guatemala (plantilla F08)",
        "consejo_formato": "Sin borrones, tachones ni corrector.",
        "confianza": "media",
        "fuente": "MUNIGUATE_guia_09F.pdf",
    },
    "formulario-de-solicitud-de-la-direccion": {
        "quien_emite": "Dirección Municipal de Planificación, SCP (plantilla)",
        "confianza": "media",
        "fuente": "SCP guías de construcción",
    },
    "pronunciamientos-de-responsabilidad": {
        "quien_emite": "Profesional colegiado responsable",
        "consejo_formato": "Formato DRPSA-011-2022 del sitio MSPAS; firma, sello y timbre.",
        "confianza": "media",
        "fuente": "VAC04 MSPAS §11",
    },
    "libreta-topografica-firmada": {
        "quien_emite": "Profesional que elaboró la nivelación",
        "confianza": "media",
        "fuente": "VAC04 DGAC §6",
    },
    "plano-de-ubicacion-del-pozo-mecanico": {
        "quien_emite": "Profesional colegiado responsable",
        "consejo_formato": "Distancia radial no menor a 100 m respecto a pozos cercanos (SCP gran magnitud).",
        "confianza": "media",
        "fuente": "SCP gran magnitud; comparativa-municipal.md",
    },
    "planos-hidraulicos-autorizados-por": {
        "quien_emite": "Ingeniero Sanitario colegiado activo",
        "confianza": "media",
        "fuente": "SCP gran magnitud",
    },
    "redes-de-energia-electrica-e": {
        "quien_emite": "Profesional colegiado responsable",
        "consejo_formato": "Instalaciones subterráneas obligatorias en gran magnitud SCP.",
        "confianza": "media",
        "fuente": "SCP gran magnitud",
    },
    "localizacion-geografica-del-botadero-con": {
        "quien_emite": "Solicitante + propietario del botadero (autorización)",
        "confianza": "media",
        "fuente": "SCP obra mayor",
    },
    "presupuesto-por-renglones-de-la": {
        "quien_emite": "Solicitante o profesional responsable",
        "confianza": "media",
        "fuente": "SCP gran magnitud",
    },
    "cronograma-general-de-ejecucion-del": {
        "quien_emite": "Solicitante o profesional responsable",
        "confianza": "media",
        "fuente": "SCP gran magnitud",
    },
    "detalle-de-volumen-de-tierra-a-mover-en": {
        "quien_emite": "Profesional colegiado responsable",
        "confianza": "media",
        "fuente": "SCP obra mayor",
    },
    "medidas-de-mitigacion-para-impactos": {
        "quien_emite": "Profesional colegiado responsable",
        "confianza": "media",
        "fuente": "MUNIGUATE_guia_00F — movimiento de tierra >900 m³",
    },
    "cumplimiento-de-nrd-1-nrd-2-y-nrd-3": {
        "quien_emite": "Varía por norma (acta VUM, resolución CONRED, etc.)",
        "consejo_formato": "Gran magnitud SCP exige las tres normas; ver tratamiento distinto en Guía 00-F Muniguate.",
        "confianza": "media",
        "fuente": "SCP gran magnitud; municipal-guatemala.md actas CONRED",
    },
}

PROFESIONAL_GENERICO = {
    "quien_emite": "Profesional colegiado responsable",
    "consejo_formato": "Firma, sello y timbre; avalado según DRPSA-011-2022 cuando aplique MSPAS.",
    "confianza": "media",
    "fuente": "VAC04 MSPAS reglas transversales",
}

PROFESIONAL_IDS = [
    "dos-juegos-de-planos-numerados-timbrados",
    "indicar-en-planos-estructurales-los",
    "informe-de-caracterizacion-de-afluentes",
    "informe-de-estimacion-de-efluentes-15",
    "informe-tecnico-descriptivo-de-la-ptar-a",
    "informes-de-caracterizacion-fisica",
    "manual-de-mantenimiento",
    "manual-de-mantenimiento-del-sistema",
    "manual-de-operacion",
    "manual-de-operacion-del-sistema",
    "memoria-de-diseno-estructural-y-estudio",
    "memoria-descriptiva-del-proyecto",
    "memoria-descriptiva-detallada-de-las",
    "memoria-descriptiva-y-planos-de-los",
    "memoria-fotografica-del-proyecto",
    "memorias-de-calculo-crecimiento",
    "memorias-detalladas-de-calculo-del",
    "plano-de-detalle-de-asientos-fijos",
    "plano-de-localizacion-con-coordenadas-a4",
    "plano-de-ubicacion-con-areas-libres-y",
    "planos-de-arquitectura-y-estabilizacion",
    "planos-de-elevacion-y-seccion-con-cota-0",
    "planos-de-elevaciones-y-secciones-de",
    "planos-de-planta-general-de-la-ptar-a1",
    "planos-de-planta-general-del-sistema-a1",
    "planos-de-ruta-de-evacuacion-y-salidas",
    "planos-firmados-sellados-y-timbrados-por",
    "planos-topograficos-con-curvas-de-nivel",
    "planta-de-techos",
]

for doc_id in PROFESIONAL_IDS:
    if doc_id not in PATCHES:
        PATCHES[doc_id] = dict(PROFESIONAL_GENERICO)


def main():
    docs = json.loads(DOC_PATH.read_text(encoding="utf-8"))
    meta_path = ROOT.parent / "docs" / "catalogo-documentos-meta.json"
    meta = {}

    for doc in docs:
        doc_id = doc["id"]
        if doc_id in PATCHES:
            patch = PATCHES[doc_id]
            for key in ("quien_emite", "consejo_vencimiento", "consejo_formato"):
                if key in patch and patch[key] is not None:
                    doc[key] = patch[key]
            meta[doc_id] = {
                "nombre": doc["nombre"],
                "categoria": doc["categoria"],
                "quien_emite": doc.get("quien_emite"),
                "consejo_vencimiento": doc.get("consejo_vencimiento"),
                "consejo_formato": doc.get("consejo_formato"),
                "confianza": patch.get("confianza", "alta"),
                "fuente": patch.get("fuente"),
            }
        elif doc.get("quien_emite"):
            meta[doc_id] = {
                "nombre": doc["nombre"],
                "categoria": doc["categoria"],
                "quien_emite": doc.get("quien_emite"),
                "consejo_vencimiento": doc.get("consejo_vencimiento"),
                "consejo_formato": doc.get("consejo_formato"),
                "confianza": "alta",
                "fuente": "Validado en sesión anterior (Xela POT / guías)",
            }

    DOC_PATH.write_text(json.dumps(docs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {len(PATCHES)} entries; meta for {len(meta)} docs -> {meta_path}")


if __name__ == "__main__":
    main()
