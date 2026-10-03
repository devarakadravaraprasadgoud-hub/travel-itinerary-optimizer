import unittest
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from data.presets import PRESET_DATASETS

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")

    def test_presets(self):
        res = self.client.get("/api/presets")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("presets", data)
        self.assertGreaterEqual(len(data["presets"]), 3)

    def test_preset_detail(self):
        res = self.client.get("/api/presets/europe")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("preset", data)
        self.assertEqual(len(data["preset"]["locations"]), 6)

    def test_optimize_endpoint(self):
        preset = PRESET_DATASETS["europe"]
        payload = {
            "locations": preset["locations"][:4], # First 4 cities
            "start_city_id": "paris",
            "trip_start_hour": 8.0,
            "max_trip_duration": 48.0,
            "algorithm": "all"
        }
        res = self.client.post(
            "/api/optimize",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("comparison", data)
        self.assertIn("explainability", data)
        self.assertIn("algorithms", data)

        # Check Branch and Bound results
        bb = data["algorithms"]["branch_and_bound"]
        self.assertIn("metrics", bb)
        self.assertIn("schedule", bb)
        self.assertTrue(bb["metrics"]["feasible"])

        # Check Dynamic Programming results
        dp = data["algorithms"]["dynamic_programming"]
        self.assertIn("metrics", dp)
        self.assertIn("dp_table", dp["metrics"])

if __name__ == "__main__":
    unittest.main()
