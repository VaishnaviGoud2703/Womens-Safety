# Nirbhaya — Hackathon Presentation

## An AI-Powered Women's Physical Safety & Digital Privacy Protection Platform
### Tagline: *A World Without Fear*

---

### Slide 1: Title & Overview
- **Project Name:** Nirbhaya
- **Tagline:** A World Without Fear (Integrating Real-Time Physical Safety Assistance & Intelligent Digital Privacy Protection)
- **Target Audience:** Women, students, solo travelers, and individuals navigating online harassment, cyberbullying, or stalking.
- **Core Mission:** Empower users to identify threats, request rapid emergency assistance, safeguard their digital privacy, and maintain full sovereign control over their sensitive data.

---

### Slide 2: The Dual-Front Problem Statement
Women face safety challenges simultaneously in both physical and digital environments:
1. **Physical Threats:**
   - Public harassment, stalking, unsafe rides/travel, intimidation, domestic danger.
   - Delay in contacting emergency response during high-stress crises.
2. **Digital Threats:**
   - Coercive cyberbullying, non-consensual image sharing threats (sextortion), doxxing.
   - Deceptive phishing attacks targeting OTPs, UPI PINs, and banking credentials.
   - Fake social media accounts, impersonation, and fraudulent romance scams.
3. **The Core Dilemma:**
   - SOS apps don't help with digital threats or blackmail.
   - Antivirus/cybersecurity software doesn't provide emergency dispatch or physical safety tools.
   - Users are forced to juggle disconnected, single-purpose apps.

---

### Slide 3: The Solution — Nirbhaya
**Nirbhaya ("A World Without Fear") bridges this gap with an integrated, user-centric safety platform:**
- **Emergency SOS Assistance:** 5-second countdown with synthesized audio alarms, instant GPS coordinate acquisition, and multi-channel 1-tap WhatsApp/SMS dispatch.
- **AI-Powered Threat & Harassment Analyzer:** Machine-learning text classification (scikit-learn TF-IDF + Logistic Regression) with explainable danger highlights and actionable safety recommendations.
- **Digital Privacy & URL Inspector:** Static heuristic security analysis of suspicious links (domain spoofing, homoglyphs, IP hostnames) and message bodies (OTP demands, fake urgency).
- **Trusted Contacts & Live Location Hub:** Explicit permission-based location sharing with visual pulse tracking and OpenStreetMap preview.
- **Identity Shield & Evidence Vault:** Interactive fake profile diagnostic checklist, local encrypted incident logging with dossier export, and official platform reporting workflows.
- **Quick Exit / Stealth Mode:** Instant disguise mode (Alt+Q / Esc twice) that disguises the screen into a harmless weather dashboard when someone approaches.

---

### Slide 4: System Architecture & Tech Stack

```
               [ User Device / Responsive Web Interface ]
                                   │
      ┌────────────────────────────┼───────────────────────────┐
      ▼                            ▼                           ▼
[ Emergency SOS Hub ]    [ AI Threat Analyzer ]    [ Privacy & URL Checker ]
 • 5s Sound Countdown     • Scikit-learn Pipeline   • Static URL Parser
 • Geolocation API        • TF-IDF Vectorizer       • Homoglyph Matcher
 • WhatsApp/SMS URIs      • Heuristic Rules Layer   • OTP / PIN Red Flags
      │                            │                           │
      └────────────────────────────┼───────────────────────────┘
                                   ▼
                   [ Flask Python REST API Server ]
                                   │
              ┌────────────────────┴───────────────────┐
              ▼                                        ▼
   [ SQLite Local Storage ]               [ Machine Learning Engine ]
    • Emergency Contacts                   • Logistic Regression Model
    • Incident Evidence Vault              • Threat/Harassment Weights
    • Personal Safety Checklist            • Instant Privacy Wipe API
```

- **Frontend:** Responsive HTML5, CSS3 (Glassmorphic dark safety palette), Vanilla ES6 JavaScript, Web Audio API, Geolocation API.
- **Backend:** Python 3, Flask REST API.
- **AI & NLP:** scikit-learn, NumPy, Joblib (Curated safety dataset).
- **Data Layer:** SQLite with full user data wipe functionality.

---

### Slide 5: Core Innovations

1. **Hybrid AI & Heuristic Explainability:**
   - Rather than acting as a black-box model, Nirbhaya surfaces *why* a message is classified as dangerous (e.g. flagging specific stalking phrases, coercive demands, or OTP traps).
   - Combines a trained statistical ML classifier with a deterministic safety-rules fail-safe to prevent false negatives on severe physical threats.
2. **Safe URL & Phishing Inspector:**
   - Inspects deceptive links completely statically without issuing HTTP requests or executing remote code, protecting users from drive-by malware.
3. **Delivery Verification Transparency:**
   - Unlike deceptive apps that falsely promise "SMS sent secretly in background", Nirbhaya provides direct 1-tap carrier dispatches and clearly explains delivery verification status to avoid giving users a false sense of security.
4. **Camouflage / Quick Exit Feature:**
   - In situations of domestic surveillance or stalking, a single keystroke (`Alt+Q` or double `Esc`) disguises the app as a generic weather page.

---

### Slide 6: Privacy & Responsible AI Principles

- **No Data Hoarding:** Suspicious messages analyzed for threats are processed in-memory and are **never** logged to disk or uploaded to commercial cloud LLMs.
- **No Password Collection:** Nirbhaya never asks for or stores user passwords or financial tokens.
- **Clear Limitations Stated:** The system transparently informs users:
  > *"Automated analysis can make mistakes. The absence of detected threats does not guarantee safety. Always contact emergency services (112 / 1091) in immediate danger."*
- **Sovereign User Control:** A dedicated "Delete All My Data" button allows complete local database wiping at any time.

---

### Slide 7: Demonstration & Key Results

| Test Scenario | Input Example | Assessment Result | Key Action Recommended |
| :--- | :--- | :--- | :--- |
| **Physical Stalking** | *"I know where you live. If you don't reply, you'll regret it."* | **Severe Threat (90% Risk)** | Preserve timestamped screenshot, alert emergency contacts, call 112. |
| **Image Blackmail** | *"Send me private photos or I will leak your pictures."* | **Harassment / Blackmail (85% Risk)** | Do not comply with demands, preserve chat evidence, report to cyber cell. |
| **Phishing Scam** | *"Bank account suspended! Send 6-digit OTP: http://bit.ly/bank"* | **High Phishing Risk (85% Risk)** | Never disclose OTP, avoid clicking shortener link, call bank branch. |
| **Typosquatting URL**| `https://instagram.security-update.xyz/login` | **Dangerous (85% Risk)** | Flagged Brand Spoofing + High-Risk `.xyz` TLD. |
| **Benign Text** | *"Hey! Are you reaching home safely?"* | **Low Risk / Safe (5% Risk)** | Normal conversation recognized accurately. |

---

### Slide 8: Current Limitations

1. **Browser Sandboxing Constraints:** Web applications cannot silently send cellular SMS messages without user interaction or a third-party paid SMS gateway (e.g. Twilio). Nirbhaya handles this with direct WhatsApp and SMS carrier links.
2. **Language Coverage:** Current ML model is optimized for English safety communication; subtle code-mixed colloquial dialects require broader training data.
3. **No Definitive Account Verification:** Impersonation detection is advisory based on heuristic indicators and cannot query private internal Instagram/Facebook databases.

---

### Slide 9: Future Scope & Roadmap

1. **Multilingual NLP Support:** Expand threat classification to regional Indian languages (Hindi, Telugu, Tamil, Marathi) using multi-lingual fine-tuned models.
2. **Voice-Activated SOS:** Implement hands-free trigger phrases (e.g. "Nirbhaya Activate") via Web Speech Recognition API.
3. **Decentralized Offline Mesh Alerts:** Allow emergency beaconing via Bluetooth Low Energy (BLE) or WebRTC mesh when cellular internet is unavailable.
4. **Exif Metadata Scrubber:** Provide an automated image cleaner that strips GPS metadata and device serials before photos are posted online.

---

### Slide 10: Conclusion

**Nirbhaya** is not just an SOS button or a phishing scanner; it is a holistic, privacy-conscious digital bodyguard designed to protect women across both the physical streets and the digital highway.

By combining accessible AI, transparent explainability, and respect for user autonomy, Nirbhaya creates **A World Without Fear**—providing women with the tools they need to stay safe, informed, and in control.
