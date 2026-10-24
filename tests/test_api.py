"""
API Integration tests for Nirbhaya Flask backend.
"""
import unittest
import json
from app import app
import database

class TestSheShieldAPI(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        database.init_db()

    def test_index_route(self):
        # Even if index.html is being prepared, we will check response code
        response = self.client.get("/api/helplines")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("emergency_helplines", data)
        self.assertTrue(len(data["emergency_helplines"]) > 0)

    def test_threat_analysis_api(self):
        payload = {"text": "I know where you live. If you don't reply, you'll regret it."}
        response = self.client.post("/api/analyze-threat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["category"], "threat")
        self.assertGreaterEqual(data["risk_score"], 70)
        self.assertIn("disclaimer", data)

    def test_inspect_privacy_api(self):
        payload = {
            "text": "Your account is suspended. Send 6-digit OTP to verify.",
            "url": "http://192.168.1.1/login"
        }
        response = self.client.post("/api/inspect-privacy", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("url_analysis", data)
        self.assertIn("text_analysis", data)
        self.assertGreaterEqual(data["url_analysis"]["risk_score"], 40)

    def test_contacts_crud(self):
        # Create
        new_contact = {
            "name": "Maya Lin",
            "phone": "+919998887776",
            "relationship": "Colleague",
            "notify_sms": True,
            "notify_whatsapp": True
        }
        res = self.client.post("/api/contacts", json=new_contact)
        self.assertEqual(res.status_code, 201)
        contact_id = json.loads(res.data)["contact_id"]

        # Read
        res = self.client.get("/api/contacts")
        self.assertEqual(res.status_code, 200)
        contacts = json.loads(res.data)["contacts"]
        self.assertTrue(any(c["id"] == contact_id for c in contacts))

        # Delete
        res = self.client.delete(f"/api/contacts/{contact_id}")
        self.assertEqual(res.status_code, 200)

    def test_sos_trigger_api(self):
        payload = {
            "location": {
                "latitude": 17.3850,
                "longitude": 78.4867,
                "accuracy": 15
            },
            "note": "Cab driver took wrong route"
        }
        response = self.client.post("/api/sos/trigger", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "sos_activated")
        self.assertIn("Google Maps", data["emergency_message"])
        self.assertTrue(data["location_shared"])

if __name__ == "__main__":
    unittest.main()
