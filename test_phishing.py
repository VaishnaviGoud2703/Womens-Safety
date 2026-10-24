"""
Unit tests for Phishing and URL detector.
"""
import unittest
from ml_engine.phishing_detector import PhishingDetector

class TestPhishingDetector(unittest.TestCase):
    def test_suspicious_url_ip_address(self):
        url = "http://192.168.1.1/login.php"
        result = PhishingDetector.inspect_url(url)
        self.assertGreaterEqual(result["risk_score"], 45)
        self.assertIn("danger", result["verdict_badge"].lower())
        flag_titles = [f["title"] for f in result["warning_flags"]]
        self.assertTrue(any("IP Address" in t for t in flag_titles))

    def test_brand_spoofing_subdomain(self):
        url = "https://instagram.security-update.xyz/verify-account"
        result = PhishingDetector.inspect_url(url)
        self.assertGreaterEqual(result["risk_score"], 50)
        flag_titles = [f["title"] for f in result["warning_flags"]]
        self.assertTrue(any("Brand Spoofing" in t for t in flag_titles))
        self.assertTrue(any("High-Risk TLD" in t for t in flag_titles))

    def test_otp_sensitive_text(self):
        text = "URGENT: Your SBI bank account is suspended. Send 6-digit OTP to verify immediately."
        result = PhishingDetector.inspect_text_and_privacy(text)
        self.assertGreaterEqual(result["risk_score"], 35)
        self.assertTrue(any(i["indicator"] == "otp_request" for i in result["sensitive_indicators"]))
        self.assertTrue(any(i["indicator"] == "financial_urgency" for i in result["sensitive_indicators"]))

    def test_benign_text(self):
        text = "Hi Sarah, can you email me the notes from today's lecture when you have time?"
        result = PhishingDetector.inspect_text_and_privacy(text)
        self.assertLess(result["risk_score"], 30)

if __name__ == "__main__":
    unittest.main()
