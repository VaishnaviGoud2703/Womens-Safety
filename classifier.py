"""
Threat and Harassment Classification Engine for Nirbhaya: A World Without Fear.
Combines machine learning (TF-IDF + Logistic Regression) with explainable pattern matching,
danger factor extraction, risk scoring, and actionable safety recommendations.
"""

import os
import re
import joblib
from config import Config

# Threat indicator lexicons for explainability and safety fail-safes
DANGER_PATTERNS = {
    "physical_violence": [
        r"\b(kill|murder|hurt|stab|shoot|strangle|break your|punch|beat you|burn|destroy you|harm you)\b",
        r"\b(make you pay|won'?t survive|end you|never walk again)\b"
    ],
    "stalking_presence": [
        r"\b(know where you live|outside your house|following you|watching you|standing outside|at your door)\b",
        r"\b(know your routines?|bus you take|seen you today|saw what you were wearing|track you down)\b",
        r"\b(in the parking lot|at your gym|your apartment|your building)\b"
    ],
    "blackmail_coercion": [
        r"\b(leak (your )?(photos?|pics?|pictures?|images?|videos?)|send (me )?(your )?(private )?(photos?|pics?|pictures?|nudes)|post your phone number)\b",
        r"\b(circulate (your )?(photos?|pics?|pictures?|videos?)|send to your (family|parents|college|friends|office))\b",
        r"\b(blackmail|destroy your life|ruin your reputation|expose you online)\b",
        r"\b(pay me|send money|in crypto|webcam footage)\b"
    ],
    "severe_harassment": [
        r"\b(bitch|slut|whore|worthless|kill yourself|pathetic loser|disgusting)\b",
        r"\b(new sim cards?|created (fake )?accounts?|stop ignoring me|answer (my )?(call|message))\b"
    ],
    "phishing_urgency": [
        r"\b(verify otp|6-digit otp|bank account is suspended|update kyc|upi pin|atm pin)\b",
        r"\b(password expired|lottery winner|claim your prize|click link to verify)\b"
    ]
}

class ThreatClassifier:
    def __init__(self, model_path=None):
        self.model_path = model_path or Config.MODEL_PATH
        self.pipeline = None
        self._load_model()

    def _load_model(self):
        """Loads serialized model or retrains if missing."""
        if os.path.exists(self.model_path):
            try:
                self.pipeline = joblib.load(self.model_path)
            except Exception as e:
                print(f"Error loading model from {self.model_path}: {e}. Retraining...")
                self._retrain()
        else:
            self._retrain()

    def _retrain(self):
        from ml_engine.trainer import train_and_save_model
        self.pipeline = train_and_save_model(self.model_path)

    def analyze(self, text: str) -> dict:
        """
        Analyzes input message text and returns comprehensive risk assessment,
        category, confidence score, detected warning signs, language highlights,
        safety actions, and responsible AI disclosures.
        """
        if not text or not text.strip():
            return {
                "risk_level": "None",
                "risk_score": 0,
                "category": "empty",
                "category_label": "No Text Provided",
                "summary": "Please enter or paste a message to analyze.",
                "detected_patterns": [],
                "highlighted_terms": [],
                "recommendations": [],
                "analysis_details": {
                    "ml_predicted_category": "none",
                    "ml_confidence": 0.0,
                    "rule_overrides_applied": False,
                    "processing_type": "None"
                },
                "disclaimer": "Automated analysis can make mistakes. Always prioritize your personal safety."
            }

        cleaned_text = text.strip()
        lower_text = cleaned_text.lower()

        # 1. Rule-based Pattern Extraction for Explainability
        detected_patterns = []
        highlighted_terms = set()

        for category_key, patterns in DANGER_PATTERNS.items():
            for pat in patterns:
                matches = re.finditer(pat, lower_text, re.IGNORECASE)
                for m in matches:
                    matched_str = m.group(0)
                    highlighted_terms.add(matched_str)
                    readable_category = category_key.replace("_", " ").title()
                    if readable_category not in [p["type"] for p in detected_patterns]:
                        detected_patterns.append({
                            "type": readable_category,
                            "match": matched_str,
                            "severity": "High" if category_key in ["physical_violence", "stalking_presence", "blackmail_coercion"] else "Medium"
                        })

        # 2. Machine Learning Pipeline Inference
        try:
            probabilities = self.pipeline.predict_proba([cleaned_text])[0]
            classes = self.pipeline.classes_
            prob_dict = {cls_name: float(prob) for cls_name, prob in zip(classes, probabilities)}
            predicted_label = self.pipeline.predict([cleaned_text])[0]
            ml_confidence = prob_dict.get(predicted_label, 0.0)
        except Exception as e:
            # Fallback if ML inference encounters unexpected error
            predicted_label = "benign"
            ml_confidence = 0.5
            prob_dict = {"benign": 0.5, "threat": 0.2, "harassment": 0.2, "phishing": 0.1}

        # 3. Hybrid Synthesis: ML prediction + Safety Rules
        # Safety Fail-Safe: If severe physical harm or stalking cues are detected,
        # elevate category to threat even if ML confidence was borderline.
        rule_override = False
        final_category = predicted_label
        
        has_violence = any(p["type"] == "Physical Violence" for p in detected_patterns)
        has_stalking = any(p["type"] == "Stalking Presence" for p in detected_patterns)
        has_blackmail = any(p["type"] == "Blackmail Coercion" for p in detected_patterns)
        has_phish = any(p["type"] == "Phishing Urgency" for p in detected_patterns)

        if has_violence or has_stalking:
            final_category = "threat"
            rule_override = (predicted_label != "threat")
        elif has_blackmail:
            final_category = "harassment"
            rule_override = (predicted_label not in ["threat", "harassment"])
        elif has_phish and final_category == "benign":
            final_category = "phishing"
            rule_override = True

        # Calculate normalized risk score (0 to 100)
        if final_category == "threat":
            base_score = 75
            boost = (20 if has_violence else 0) + (15 if has_stalking else 0)
            risk_score = min(100, int(base_score + boost * (ml_confidence or 0.8)))
            risk_level = "Severe / Immediate Threat" if risk_score >= 85 else "High Risk"
            category_label = "Threatening / Coercive Language"
        elif final_category == "harassment":
            base_score = 60
            boost = 25 if has_blackmail else 15
            risk_score = min(90, int(base_score + boost * (ml_confidence or 0.7)))
            risk_level = "High Risk" if has_blackmail else "Moderate Risk"
            category_label = "Harassment / Cyberbullying / Blackmail"
        elif final_category == "phishing":
            risk_score = min(85, int(50 + 40 * ml_confidence))
            risk_level = "Moderate to High Risk"
            category_label = "Phishing / Social Engineering Scam"
        else:
            # Benign / Low Risk
            threat_prob = prob_dict.get("threat", 0.0) + prob_dict.get("harassment", 0.0)
            if threat_prob > 0.35:
                risk_score = int(threat_prob * 100)
                risk_level = "Uncertain / Low to Moderate Risk"
                category_label = "Uncertain / Requires Caution"
            else:
                risk_score = max(5, int(threat_prob * 100))
                risk_level = "Low Risk / Likely Safe"
                category_label = "Benign Communication"

        # 4. Contextual Safety Recommendations
        recommendations = []
        if final_category == "threat":
            recommendations = [
                "Preserve the message immediately: take screenshots showing the sender's username, phone number, and timestamp.",
                "Do NOT provoke, argue, or meet the sender alone under any circumstance.",
                "If you feel in imminent physical danger, immediately call 112 / 100 or tap the SOS button to alert emergency services.",
                "Alert your trusted emergency contacts and inform someone you live or work with about this situation.",
                "File an official complaint with local law enforcement or the National Cybercrime Portal (cybercrime.gov.in / 1930)."
            ]
        elif final_category == "harassment":
            recommendations = [
                "Take full screenshots of the chat, sender profile, and any associated handles before taking further action.",
                "Do not comply with demands for money, photos, or private information; compliance rarely stops blackmail.",
                "Block the sender across all social channels and report their profile to platform moderation.",
                "Enable strict privacy controls and restrict message requests from unknown accounts.",
                "Reach out to the Women Helpline (1091 / 181) or local cyber safety cells for confidential counseling."
            ]
        elif final_category == "phishing":
            recommendations = [
                "Never click links, scan QR codes, or download attachments sent from unexpected sources.",
                "Never share OTPs, UPI PINs, passwords, or banking credentials under any pressure.",
                "Contact the institution (bank, platform, utility provider) directly via their official app or website.",
                "Report the phishing attempt to national cybercrime helplines (1930 in India / IC3)."
            ]
        else:
            recommendations = [
                "No overt threat or harassment patterns were detected in this sample.",
                "Maintain healthy digital hygiene: never share passwords or sensitive credentials even in private chats.",
                "If this conversation evolves or feels uncomfortable later, don't hesitate to re-analyze or speak to a trusted friend."
            ]

        # 5. Extract additional salient tokens from text for UI highlighting
        additional_tokens = [w for w in re.findall(r"\b\w{4,}\b", lower_text) 
                             if w in ["regret", "police", "destroy", "kidnap", "weapon", "house", "address", "money", "photos", "nudes", "reputation"]]
        for t in additional_tokens:
            highlighted_terms.add(t)

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "category": final_category,
            "category_label": category_label,
            "summary": self._generate_summary(final_category, risk_level, detected_patterns),
            "detected_patterns": detected_patterns,
            "highlighted_terms": list(highlighted_terms),
            "recommendations": recommendations,
            "analysis_details": {
                "ml_predicted_category": predicted_label,
                "ml_confidence": round(ml_confidence * 100, 1),
                "all_probabilities": {k: round(v * 100, 1) for k, v in prob_dict.items()},
                "rule_overrides_applied": rule_override,
                "processing_type": "Hybrid (scikit-learn ML Classifier + Safety Heuristic Rules)"
            },
            "disclaimer": (
                "Responsible AI Disclosure: This automated assessment provides guidance based on language patterns "
                "and does not guarantee absolute safety or replace professional law enforcement judgment. "
                "The absence of detected threats does not confirm safety. In an emergency, always call local emergency services."
            )
        }

    def _generate_summary(self, category: str, risk_level: str, detected_patterns: list) -> str:
        if category == "threat":
            cues = ", ".join([p["type"].lower() for p in detected_patterns]) if detected_patterns else "coercive language"
            return f"High risk identified ({risk_level}). The text contains explicit threat or intimidation markers indicating {cues}."
        elif category == "harassment":
            return f"Harassment indicators detected ({risk_level}). The text contains patterns typical of abusive communication, blackmail, or cyberbullying."
        elif category == "phishing":
            return f"Phishing / Scam indicators identified ({risk_level}). The message attempts to elicit urgency, sensitive credentials, or unauthorized actions."
        return "Low risk detected. The message does not exhibit clear indicators of threat, harassment, or phishing."

# Global singleton classifier instance
classifier_instance = None

def get_classifier():
    global classifier_instance
    if classifier_instance is None:
        classifier_instance = ThreatClassifier()
    return classifier_instance
