# Third-Party Attribution & Asset Licenses

Nirbhaya ("A World Without Fear") is built with open-source software, standards-based web APIs, and curated machine learning assets. This document discloses all third-party components, libraries, datasets, models, and design assets used in the application, along with their respective licensing terms.

---

## 1. Backend Libraries & Frameworks

| Library / Tool | Version | License | Purpose in Nirbhaya | Link / Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Flask** | 3.1.x | BSD-3-Clause | Lightweight web application server and RESTful API backend | [Flask Project](https://palletsprojects.com/p/flask/) |
| **scikit-learn** | 1.9.x | BSD-3-Clause | TF-IDF text vectorization, multi-class logistic regression classifier, pipeline orchestration | [scikit-learn.org](https://scikit-learn.org/) |
| **NumPy** | 2.x | BSD-3-Clause | Numerical arrays, probability distribution calculations | [numpy.org](https://numpy.org/) |
| **Joblib** | 1.6.x | BSD-3-Clause | Model persistence and fast serialization of machine learning pipelines | [joblib.readthedocs.io](https://joblib.readthedocs.io/) |
| **Python Standard Library (SQLite3, re, urllib)** | 3.14.x | PSF License | Database storage, regular expression heuristic matching, URL parsing | [python.org](https://www.python.org/) |

---

## 2. Machine Learning Models & Dataset

- **NLP Model Pipeline**:
  - Architecture: Sublinear Term Frequency-Inverse Document Frequency (`TfidfVectorizer`, n-gram range 1 to 2) coupled with a Class-Balanced `LogisticRegression` classifier calibrated for multi-class classification (`threat`, `harassment`, `phishing`, `benign`).
  - Model Persistence: Stored as serialized artifact `ml_engine/models/threat_classifier.joblib`.
  - License: MIT License (Project Created & Licensed by Nirbhaya Team).
- **Curated Safety Dataset (`ml_engine/dataset.py`)**:
  - Specifically designed and curated for women's safety scenarios, including physical violence threats, stalking cues, image-based sexual harassment / blackmail (sextortion), account suspension phishing, and benign conversations.
  - License: Creative Commons Attribution 4.0 International (CC BY 4.0).

---

## 3. Web APIs & Client-Side Technologies

| Technology | Standard / Organization | Purpose |
| :--- | :--- | :--- |
| **W3C Geolocation API** | W3C Standard | Retrieves browser-authorized device coordinates (latitude, longitude, accuracy) for emergency location sharing. |
| **W3C Web Audio API** | W3C Standard | Generates real-time synthesized countdown alarm tones (`OscillatorNode` / `GainNode`) without external audio dependencies. |
| **OpenStreetMap Tile Embed** | OpenStreetMap Foundation (ODbL License) | Displays lightweight, privacy-preserving map preview for active location sharing. |
| **WhatsApp Universal URI Scheme** | Meta / WhatsApp Specification | Formats click-to-chat emergency dispatch links (`https://wa.me/`) with pre-filled SOS messages. |
| **RFC 5724 (`sms:` URI scheme)** | IETF RFC 5724 | Initiates carrier native SMS composition with emergency text. |

---

## 4. UI Icons & Graphical Assets

- Vector SVG Icons: Custom lightweight SVG icons based on standard Feather/Lucide design patterns (MIT License).
- Typography: System default typography (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`) ensuring zero external web font tracking or remote HTTP calls.

---

## 5. Compliance & Responsible Use Statement

Nirbhaya adheres to responsible AI practices:
- All text processing and URL inspection is conducted locally within the application instance.
- No private messages or user passwords are ever sent to commercial external LLM providers or sold to third parties.
- Automated assessments are explicitly documented as assistive indicators rather than legal or law enforcement determinations.
