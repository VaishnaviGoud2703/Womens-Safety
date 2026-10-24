"""
Unit tests for Threat & Harassment Classifier.
"""
import unittest
from ml_engine.classifier import get_classifier

class TestThreatClassifier(unittest.TestCase):
    def setUp(self):
        self.classifier = get_classifier()

    def test_empty_input(self):
        result = self.classifier.analyze("")
        self.assertEqual(result["risk_level"], "None")
        self.assertEqual(result["risk_score"], 0)

    def test_explicit_threat_message(self):
        text = "I know where you live. If you don't reply, you'll regret it."
        result = self.classifier.analyze(text)
        self.assertEqual(result["category"], "threat")
        self.assertTrue("Threat" in result["risk_level"] or "High" in result["risk_level"])
        self.assertGreaterEqual(result["risk_score"], 70)
        self.assertTrue(len(result["recommendations"]) > 0)
        self.assertTrue(len(result["highlighted_terms"]) > 0)

    def test_harassment_blackmail(self):
        text = "Send me your private photos right now or I will leak your pictures to everyone."
        result = self.classifier.analyze(text)
        self.assertIn(result["category"], ["harassment", "threat"])
        self.assertGreaterEqual(result["risk_score"], 60)
        self.assertTrue(any(p["type"] == "Blackmail Coercion" for p in result["detected_patterns"]))

    def test_benign_message(self):
        text = "Hey! Are you reaching home safely? Let me know when you arrive."
        result = self.classifier.analyze(text)
        self.assertIn(result["category"], ["benign", "uncertain"])
        self.assertLess(result["risk_score"], 50)

if __name__ == "__main__":
    unittest.main()
