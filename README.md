# Nirbhaya 🛡️

### A World Without Fear — Women's Physical Safety & Digital Privacy Protection Platform

Nirbhaya is an integrated, privacy-conscious web safety application designed to help women identify potential risks, respond to physical emergencies, seek assistance from trusted contacts, and defend their digital privacy without compromising sensitive personal data.

---

## 🌟 Key Features

### 1. 🚨 Emergency SOS Assistance
- **Visible, High-Contrast SOS Button:** Instant activation with a 5-second countdown and synthesized audible alarm beeps.
- **Accidental Alert Cancellation:** Option to halt countdown or dismiss alerts with advice on informing contacts.
- **Direct Emergency Helplines:** 1-Tap dialing for Police (`112` / `100`), Women Helpline (`1091`), Women in Distress (`181`), and Cyber Crime (`1930`).
- **Multi-Channel Dispatch Links:** Automatically prepares 1-tap WhatsApp click-to-chat links and SMS carrier URIs populated with live GPS coordinates and Google Maps / OpenStreetMap links.
- **Delivery Transparency:** Honestly communicates alert status rather than falsely claiming background SMS delivery has succeeded.

### 2. 🧠 AI-Powered Threat & Harassment Analyzer
- **Machine Learning Classification:** Built using `scikit-learn` (TF-IDF vectorizer + balanced multi-class Logistic Regression).
- **Multi-Category Risk Assessment:** Categorizes messages into **Threat / Violence**, **Harassment / Blackmail**, **Phishing / Fraud**, or **Benign / Safe**.
- **Explainable Language Highlights:** Pinpoints the exact words and phrases contributing to the risk score and tags detected danger patterns (e.g., stalking presence, bodily harm, sextortion demands).
- **Actionable Safety Advice:** Step-by-step guidance on evidence preservation, contacting support helplines, and safe reporting.
- **Responsible AI Disclaimers:** Explicitly states that automated assessments are not infallible and never replace emergency services.

### 3. 🛡️ Digital Privacy & Phishing Checker
- **Static URL Inspector:** Safely parses and audits suspicious links without contacting or resolving the malicious destination server.
- **Domain Spoofing & Typosquatting:** Flags deceptive subdomains (e.g. `instagram.verify-account.xyz`), homoglyphs (`g00gle`, `paypa1`), raw IP hostnames, and high-risk TLDs.
- **Sensitive Credential Interceptor:** Identifies demands for OTPs, UPI PINs, banking passwords, and urgent threats of power or account disconnection.
- **Zero Credential Collection:** The tool never asks for, records, or transmits user passwords or private tokens.

### 4. 📍 Trusted Contacts & Live Location Hub
- **Explicit Permission-Based GPS:** Uses the browser Geolocation API only when authorized by the user.
- **Live Sharing Indicator:** Visible pulsating badge clearly shows when location tracking is active.
- **Interactive OpenStreetMap Embed:** Real-time visual map preview showing device coordinates and accuracy radius.
- **1-Click Share:** Instantly copy GPS coordinates link or share directly via WhatsApp with trusted contacts.

### 5. 📁 Identity Shield & Incident Evidence Vault
- **Interactive Fake Profile Diagnostic:** 5-point checklist identifying catfishing, stolen photos, altered handles, and impersonation attempts.
- **Local Incident Vault:** Voluntarily save timestamped incident records, platform names, offender handles, and evidence notes.
- **Dossier Export:** Export incident logs to a clean text file for submission to police or cyber cells.
- **Official Platform Reporting Guides:** Step-by-step reporting workflows for Instagram, WhatsApp, Telegram, X (Twitter), Facebook, and official Cybercrime portals (India 1930, US IC3, UK Action Fraud).

### 6. ✅ Personal Safety Checklist & Privacy Wipe
- **Interactive Safety Readiness Score:** Dynamic progress tracking across critical physical and digital security tasks.
- **Sovereign Privacy Control:** Dedicated **"Delete All My Stored Data"** button to permanently wipe all stored contacts and incident records from the local SQLite database.

### 7. 🔒 Quick Exit / Stealth Mode (Alt+Q)
- Instantly disguises the application into a harmless "Local Weather Forecast" screen if someone approaches or monitors the user's display.

---

## 🏗️ Technology Stack

- **Frontend:** HTML5, CSS3 (Modern responsive dark theme with CSS custom properties), Vanilla JavaScript (ES6+), W3C Web Audio API, W3C Geolocation API.
- **Backend:** Python 3.14+, Flask 3.1+ (RESTful API architecture).
- **Machine Learning & NLP:** `scikit-learn`, `numpy`, `joblib`.
- **Database:** SQLite 3 (local file-based storage for privacy).
- **Maps:** OpenStreetMap & Google Maps universal URL format.

---

## 📁 Project Structure

```
She-Sheild/
├── app.py                      # Flask web application & REST API routes
├── config.py                   # App configuration & helpline directories
├── database.py                 # SQLite database layer with full privacy wipe
├── requirements.txt            # Python dependencies
├── ml_engine/
│   ├── __init__.py
│   ├── dataset.py              # Curated safety dataset (threats, harassment, scams)
│   ├── trainer.py              # Model training script (TF-IDF + Logistic Regression)
│   ├── classifier.py           # Hybrid AI classifier & explainability engine
│   ├── phishing_detector.py    # URL & digital privacy inspector
│   └── models/
│       └── threat_classifier.joblib # Serialized scikit-learn model
├── static/
│   ├── css/
│   │   └── style.css           # Responsive design, theme variables, stealth mode
│   └── js/
│       ├── app.js              # Tab controller, stealth mode, checklist, helplines
│       ├── sos.js              # Emergency countdown, sound alarm, GPS dispatch
│       ├── threat_analyzer.js  # AI message analysis & explainability UI
│       ├── phishing_checker.js # URL & privacy inspector UI
│       ├── location_hub.js     # Geolocation & emergency contact management
│       └── identity_vault.js   # Fake profile diagnostic & incident vault
├── templates/
│   └── index.html              # Responsive single-page safety dashboard
├── tests/
│   ├── __init__.py
│   ├── test_classifier.py      # Unit tests for threat & harassment classifier
│   ├── test_phishing.py        # Unit tests for URL and phishing detector
│   └── test_api.py             # Integration tests for Flask endpoints
├── test_cases.json             # Structured demonstration test cases for judges
├── ATTRIBUTION.md              # Third-party licenses, models, and asset citations
├── PRESENTATION.md             # Complete hackathon slide deck and project pitch
└── README.md                   # Installation, documentation, and user guide
```

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Modern web browser (Chrome, Safari, Firefox, Edge)

### 1. Clone or Open Workspace
```bash
cd She-Sheild
```

### 2. Install Dependencies
```bash
python3 -m pip install -r requirements.txt
```

### 3. (Optional) Retrain or Verify the Machine Learning Model
The model comes pre-trained and serialized in `ml_engine/models/threat_classifier.joblib`. To retrain:
```bash
python3 -m ml_engine.trainer
```

### 4. Run the Test Suite
Verify that all 13 unit and integration tests pass:
```bash
python3 -m unittest discover tests
```

### 5. Launch the Web Application
```bash
python3 app.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🧪 Demonstration & Test Cases

The application includes interactive preset buttons for judges and evaluators. You can also run the following test cases manually:

### Test Case 1: Physical Threat & Stalking
- **Navigation:** Click **AI Threat Analyzer** tab.
- **Input Text:**
  ```text
  I know where you live. If you don't reply, you'll regret it.
  ```
- **Click:** "Analyze Message Risk".
- **Expected Output:**
  - **Risk Score:** ~90% (Severe / Immediate Threat).
  - **Category:** Threatening / Coercive Language.
  - **Highlighted Words:** `know where you live`, `regret`.
  - **Patterns Detected:** Stalking Presence, Physical Violence.
  - **Action Advice:** Immediate evidence preservation, alerting trusted contacts, direct helpline dialing (112 / 1091).

### Test Case 2: Sextortion & Harassment
- **Navigation:** Click **AI Threat Analyzer** tab.
- **Input Text:**
  ```text
  Send me your private photos right now or I will leak your pictures to everyone.
  ```
- **Expected Output:**
  - **Risk Score:** 85% (High Risk).
  - **Category:** Harassment / Cyberbullying / Blackmail.
  - **Patterns Detected:** Blackmail Coercion.
  - **Action Advice:** Do not pay or send photos, preserve screenshots, report to platform moderation.

### Test Case 3: Deceptive URL & Typosquatting
- **Navigation:** Click **Privacy & URL Checker** tab.
- **Input URL:**
  ```text
  https://instagram.security-update.xyz/verify-account
  ```
- **Click:** "Inspect URL Safety".
- **Expected Output:**
  - **Risk Score:** 80% (Dangerous / High Phishing Likelihood).
  - **Warning Flags:** Brand Spoofing (mimicking Instagram on a non-Instagram root domain) and High-Risk TLD (`.xyz`).

### Test Case 4: Emergency SOS Countdown & Cancellation
- **Navigation:** Click **Emergency SOS** tab.
- **Action:** Tap the large red **SOS** button.
- **Observation:** Notice the 5-second countdown with audible synthesizer beeps.
- **Action:** Tap **Cancel Emergency Alert**.
- **Expected Output:** Sound halts, alert sequence cancelled cleanly.

### Test Case 5: Quick Exit / Stealth Mode
- **Action:** Press `Alt+Q` or click the **Quick Exit** button in the top bar.
- **Expected Output:** The entire screen instantly transforms into a benign "Local Weather Service" forecast. Press `Alt+Q` again to restore the safety dashboard.

---

## 🔒 Responsible AI & Privacy Commitments

1. **Local & Ephemeral Processing:** Text submitted to the AI Threat Analyzer is analyzed in-memory and is never stored in server logs or forwarded to external third parties.
2. **Transparent AI Limitations:** AI models provide probabilistic assessments, not legal certainties. The UI explicitly cautions users that the absence of flagged words does not guarantee complete safety.
3. **User Data Sovereignty:** All contacts and incident notes remain solely in the user's local instance. The safety checklist includes a one-click data wipe tool to guarantee compliance with privacy principles.

---

## 📄 Documentation & Deliverables

- **Third-Party Attribution:** See [`ATTRIBUTION.md`](ATTRIBUTION.md) for library licenses and data source citations.
- **Presentation Deck:** See [`PRESENTATION.md`](PRESENTATION.md) for problem, solution, innovation, and roadmap slides.
- **Machine-Readable Test Cases:** See [`test_cases.json`](test_cases.json).

---

## 📜 License
Developed for the Women's Safety & Digital Privacy Hackathon. Released under the MIT License.
