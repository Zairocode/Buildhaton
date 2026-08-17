import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import _as_number, stored_project_to_engine_document

DEMO_JSON = Path(__file__).resolve().parents[1].joinpath("demo.json")


class StoredProjectAdapterTests(unittest.TestCase):
    @unittest.skipUnless(DEMO_JSON.exists(), "demo.json no esta en el repo")
    def test_demo_json_is_converted_to_engine_document(self):
        data = json.loads(DEMO_JSON.read_text(encoding="utf-8"))
        data["municipalidad"] = "muniguate"

        project = stored_project_to_engine_document(data)

        self.assertEqual(project["municipalidad"], "muniguate")
        self.assertEqual(project["tipo_solicitud"], "Plaza Comercial")
        self.assertEqual(project["area_construccion_m2"], 160.0)
        self.assertEqual(project["altura_m"], 500.0)
        self.assertTrue(project["uso_publico"])
        self.assertEqual(project["categoria_ambiental"], "B1")
        self.assertTrue(project["abastecimiento_agua_consumo_humano"])
        self.assertTrue(project["cercano_area_bosque"])

    def test_flat_engine_document_is_accepted_without_changes(self):
        project = {
            "municipalidad": "scp",
            "tipo_solicitud": "condominio",
            "area_construccion_m2": 450,
            "altura_m": 8,
            "uso_publico": False,
        }

        self.assertEqual(stored_project_to_engine_document(project), project)


class NumeroTests(unittest.TestCase):
    """El area decide que guia municipal aplica (30 / 200 / 700 m2). Si el
    parseo se come una unidad, el expediente entero sale por la rama equivocada."""

    def test_no_se_traga_la_unidad(self):
        # "m2" aportaba un 2 al final: 700 -> 7002, justo sobre el umbral.
        self.assertEqual(_as_number("700 m2"), 700.0)
        self.assertEqual(_as_number("18,500 m2"), 18500.0)
        self.assertEqual(_as_number("200 metros cuadrados"), 200.0)

    def test_formatos_usuales(self):
        self.assertEqual(_as_number("Q15,000.00"), 15000.0)
        self.assertEqual(_as_number("15.2000"), 15.2)
        self.assertEqual(_as_number("-90.4869"), -90.4869)
        self.assertEqual(_as_number(42), 42.0)

    def test_sin_numero(self):
        for v in ("", None, "   ", "sin dato"):
            self.assertIsNone(_as_number(v))


if __name__ == "__main__":
    unittest.main()
