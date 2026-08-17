"""Catalogo de documentos: identidad del documento, separada de quien lo pide.

reglas.json ya no repite el mismo documento como texto suelto en cada regla que lo pide:
referencia un id de este catalogo (`documentos.json`) y solo agrega lo que cambia segun
la regla (vigencia, formato exigido, redaccion exacta). Este modulo es el que sabe
resolver esa referencia, y el que sirve para agregar la proxima municipalidad sin
releer 100 entradas a mano: `sugerir()` busca, por solape de palabras, que documento ya
catalogado se parece a un requisito nuevo, y cuando ninguno calza lo dice — la
sugerencia semantica.

`python motor/catalogo.py` corre el self-check.
`python motor/catalogo.py "texto de un requisito nuevo"` imprime sugerencias.
"""
import json
import pathlib
import re
import sys
import unicodedata

CATALOGO = {
    d["id"]: d
    for d in json.loads((pathlib.Path(__file__).parent / "documentos.json").read_text(encoding="utf-8"))
}

STOPWORDS = {
    "de", "del", "la", "el", "los", "las", "en", "por", "para", "con", "y", "o", "a",
    "un", "una", "al", "su", "sus", "que", "se", "es",
}


def _tokens(texto):
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii").lower()
    palabras = re.findall(r"[a-z0-9]+", t)
    return {p for p in palabras if p not in STOPWORDS and len(p) > 2}


def resuelve(item):
    """Normaliza una entrada de `exige` (string suelto o referencia al catalogo) a un
    dict con al menos `texto`. Si referencia un documento del catalogo, agrega
    documento_id/categoria/vigencia_meses/extensiones_validas/consejo_* cuando existan.
    """
    if isinstance(item, str):
        return {"texto": item, "documento_id": None}

    doc = CATALOGO.get(item["documento"], {})
    resuelto = {
        "texto": item.get("detalle") or doc.get("nombre"),
        "documento_id": item.get("documento"),
        "categoria": doc.get("categoria"),
        "quien_emite": doc.get("quien_emite"),
        "vigencia_meses": item.get("vigencia_meses"),
        "extensiones_validas": item.get("extensiones_validas"),
        "consejo_vencimiento": doc.get("consejo_vencimiento"),
        "consejo_formato": doc.get("consejo_formato"),
    }
    return resuelto


def sugerir(texto, top=5):
    """Ids de catalogo mas parecidos a `texto` por solape de palabras contra el nombre
    y los alias de cada entrada. Pensado para correr requisito por requisito cuando se
    transcribe la guia de una municipalidad nueva: si el score es alto, reusa ese id
    (con su propio vigencia_meses/detalle); si no, da de alta un documento nuevo.
    Devuelve una lista de (id, score, nombre) ordenada de mayor a menor score.
    """
    objetivo = _tokens(texto)
    if not objetivo:
        return []

    resultados = []
    for doc in CATALOGO.values():
        candidatos = {doc["nombre"], *doc.get("alias", [])}
        mejor = 0.0
        for c in candidatos:
            ct = _tokens(c)
            if not ct:
                continue
            score = len(objetivo & ct) / len(objetivo | ct)
            mejor = max(mejor, score)
        if mejor > 0:
            resultados.append((doc["id"], round(mejor, 3), doc["nombre"]))

    resultados.sort(key=lambda r: -r[1])
    return resultados[:top]


def demo():
    # El caso que motiva sugerir(): dos jurisdicciones piden el mismo documento con
    # redaccion distinta. Alimentando la redaccion de Pinula, cert-rgp debe salir primero
    # aunque el texto no coincida con el de la capital (que fue el que quedo como 'nombre').
    resultado = sugerir("Certificación del Registro General de la Propiedad, máximo 3 MESES de emisión")
    assert resultado, "sugerir() no debe devolver vacio para un texto que ya esta en el catalogo"
    assert resultado[0][0] == "cert-rgp", resultado

    # Un texto sin relacion con nada del catalogo no debe forzar un match alto.
    ajeno = sugerir("Permiso de tala de bambú ornamental en zona costera protegida")
    assert not ajeno or ajeno[0][1] < 0.3, ajeno

    # resuelve() es tolerante a un string suelto (aviso, o algo que no se migro).
    r = resuelve("ALERTA: fuera del alcance de la Guía 09-F")
    assert r["texto"] == "ALERTA: fuera del alcance de la Guía 09-F" and r["documento_id"] is None

    # resuelve() de una referencia real trae la vigencia especifica de ESA ocurrencia,
    # no un valor generico del catalogo (6 meses capital, no el de Pinula).
    r = resuelve({"documento": "cert-rgp", "detalle": "texto de prueba", "vigencia_meses": 6})
    assert r["vigencia_meses"] == 6 and r["documento_id"] == "cert-rgp" and r["categoria"] == "registral"

    print(f"self-check OK — {len(CATALOGO)} documentos en el catalogo\n")
    ejemplo = sugerir("Certificación del Registro de la Propiedad del inmueble")
    print("sugerir('Certificación del Registro de la Propiedad del inmueble'):")
    for did, score, nombre in ejemplo:
        print(f"  {score:.3f}  {did:30} {nombre[:60]}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        texto = " ".join(sys.argv[1:])
        for did, score, nombre in sugerir(texto):
            print(f"{score:.3f}  {did:30} {nombre}")
    else:
        demo()
