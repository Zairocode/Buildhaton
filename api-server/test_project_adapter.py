import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import stored_project_to_engine_document


class StoredProjectAdapterTests(unittest.TestCase):
    def test_demo_json_is_converted_to_engine_document(self):
        data = json.loads(Path(__file__).resolve().parents[1].joinpath("demo.json").read_text(encoding="utf-8"))
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


if __name__ == "__main__":
    unittest.main()
