"""
Flask Web Application for Nirbhaya:
A World Without Fear - Women's Physical Safety & Digital Privacy Protection Platform.
"""

import os
from flask import Flask, render_template, request, jsonify
from config import Config
import database
from ml_engine.classifier import get_classifier
from ml_engine.phishing_detector import PhishingDetector

app = Flask(__name__)
app.config.from_object(Config)

# Initialize database schema on startup
with app.app_context():
    database.init_db()

@app.route("/")
def index():
    """Renders the main Nirbhaya dashboard."""
    return render_template("index.html")

# --- Feature 1 & 4: Emergency SOS & Location Assistance ---
@app.route("/api/sos/trigger", methods=["POST"])
def trigger_sos():
    """
    Coordinates Emergency SOS alert generation.
    Formats emergency location payloads, maps links, and multi-channel
    dispatch options for trusted contacts. Respects delivery verification transparency.
    """
    data = request.get_json() or {}
    location = data.get("location")  # {"latitude": float, "longitude": float, "accuracy": float}
    custom_note = data.get("note", "").strip()

    contacts = database.get_contacts()
    
    # Construct emergency alert message
    base_msg = "EMERGENCY ALERT: I am in an unsafe situation and need immediate help!"
    if custom_note:
        base_msg += f" Note: {custom_note}"

    maps_link = None
    osm_link = None
    if location and "latitude" in location and "longitude" in location:
        lat = location["latitude"]
        lng = location["longitude"]
        accuracy = location.get("accuracy", "approximate")
        maps_link = f"https://maps.google.com/?q={lat},{lng}"
        osm_link = f"https://www.openstreetmap.org/?mlat={lat}&mlon={lng}#map=16/{lat}/{lng}"
        base_msg += f"\nMy current location (accuracy ±{accuracy}m):\nGoogle Maps: {maps_link}"

    # Prepare per-contact dispatch payloads
    prepared_dispatches = []
    for c in contacts:
        # Sanitize phone number for WhatsApp link
        phone_clean = "".join(filter(str.isdigit, c["phone"]))
        wa_url = f"https://wa.me/{phone_clean}?text={base_msg}" if c["notify_whatsapp"] and phone_clean else None
        sms_uri = f"sms:{c['phone']}?body={base_msg}" if c["notify_sms"] else None
        
        prepared_dispatches.append({
            "contact_id": c["id"],
            "name": c["name"],
            "phone": c["phone"],
            "relationship": c["relationship"],
            "whatsapp_dispatch_url": wa_url,
            "sms_dispatch_uri": sms_uri,
            "delivery_status": "Prepared (requires user confirmation via carrier network)"
        })

    return jsonify({
        "status": "sos_activated",
        "emergency_message": base_msg,
        "location_shared": bool(location),
        "location_links": {
            "google_maps": maps_link,
            "open_street_map": osm_link
        },
        "contacts_targeted": len(contacts),
        "dispatches": prepared_dispatches,
        "direct_emergency_numbers": Config.DEFAULT_HELPLINES,
        "compliance_note": (
            "Safety Notice: Web browsers cannot guarantee carrier SMS delivery without manual dispatch. "
            "Click the 1-Tap WhatsApp or SMS buttons, or use the direct phone dialers immediately."
        )
    })

@app.route("/api/sos/cancel", methods=["POST"])
def cancel_sos():
    """Provides accidental alert resolution advice."""
    return jsonify({
        "status": "sos_cancelled",
        "message": "Emergency alert sequence has been halted.",
        "follow_up_advice": "If you previously sent an alert, please send a quick follow-up message to your trusted contacts letting them know you are safe."
    })

# --- Feature 2: AI-Powered Threat and Harassment Detection ---
@app.route("/api/analyze-threat", methods=["POST"])
def analyze_threat():
    """
    Analyzes suspicious text using the scikit-learn ML model + heuristic explainability engine.
    """
    data = request.get_json() or {}
    text = data.get("text", "")
    
    classifier = get_classifier()
    result = classifier.analyze(text)
    return jsonify(result)

# --- Feature 3: Digital Privacy and Phishing Detection ---
@app.route("/api/inspect-privacy", methods=["POST"])
def inspect_privacy():
    """
    Inspects suspicious URLs and/or message bodies for phishing and credential theft risks.
    """
    data = request.get_json() or {}
    raw_text = data.get("text", "").strip()
    raw_url = data.get("url", "").strip()

    response = {}
    if raw_url:
        response["url_analysis"] = PhishingDetector.inspect_url(raw_url)
    if raw_text:
        response["text_analysis"] = PhishingDetector.inspect_text_and_privacy(raw_text)
    
    if not raw_url and not raw_text:
        return jsonify({"error": "Please provide either a message text or a URL to inspect."}), 400

    return jsonify(response)

# --- Feature 4: Emergency Contacts Management ---
@app.route("/api/contacts", methods=["GET", "POST"])
def handle_contacts():
    if request.method == "GET":
        contacts = database.get_contacts()
        return jsonify({"contacts": contacts})
    
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    relationship = data.get("relationship", "Trusted Contact").strip()
    email = data.get("email", "").strip()
    is_primary = data.get("is_primary", False)
    notify_sms = data.get("notify_sms", True)
    notify_whatsapp = data.get("notify_whatsapp", True)

    if not name or not phone:
        return jsonify({"error": "Name and phone number are required."}), 400

    contact_id = database.add_contact(
        name=name,
        phone=phone,
        relationship=relationship,
        email=email,
        is_primary=is_primary,
        notify_sms=notify_sms,
        notify_whatsapp=notify_whatsapp
    )
    return jsonify({"success": True, "contact_id": contact_id}), 201

@app.route("/api/contacts/<int:contact_id>", methods=["DELETE"])
def delete_contact(contact_id):
    database.delete_contact(contact_id)
    return jsonify({"success": True, "message": "Contact deleted successfully."})

# --- Feature 5: Incident Vault (Voluntary Evidence Locker) ---
@app.route("/api/incidents", methods=["GET", "POST"])
def handle_incidents():
    if request.method == "GET":
        incidents = database.get_incidents()
        return jsonify({"incidents": incidents})

    data = request.get_json() or {}
    title = data.get("title", "").strip()
    category = data.get("category", "Online Harassment").strip()
    platform = data.get("platform", "Unknown").strip()
    offender_handle = data.get("offender_handle", "").strip()
    description = data.get("description", "").strip()
    incident_date = data.get("incident_date", "").strip()
    evidence_notes = data.get("evidence_notes", "").strip()

    if not title or not description or not incident_date:
        return jsonify({"error": "Title, date, and description are required."}), 400

    incident_id = database.add_incident(
        title=title,
        category=category,
        platform=platform,
        offender_handle=offender_handle,
        description=description,
        incident_date=incident_date,
        evidence_notes=evidence_notes
    )
    return jsonify({"success": True, "incident_id": incident_id}), 201

@app.route("/api/incidents/<int:incident_id>", methods=["DELETE"])
def delete_incident(incident_id):
    database.delete_incident(incident_id)
    return jsonify({"success": True, "message": "Incident record deleted."})

# --- Feature 6: Personal Safety Checklist ---
@app.route("/api/checklist", methods=["GET"])
def get_checklist():
    items = database.get_checklist()
    return jsonify({"checklist": items})

@app.route("/api/checklist/toggle", methods=["POST"])
def toggle_checklist():
    data = request.get_json() or {}
    task_key = data.get("task_key")
    completed = data.get("completed", False)
    if not task_key:
        return jsonify({"error": "task_key is required"}), 400
    database.toggle_checklist(task_key, completed)
    return jsonify({"success": True})

# --- Privacy Data Wipe ---
@app.route("/api/privacy/wipe-data", methods=["POST"])
def wipe_data():
    """Wipes all locally stored contacts, incidents, and checklist data."""
    database.wipe_all_user_data()
    return jsonify({"success": True, "message": "All stored user data has been permanently cleared."})

# --- Static Helplines ---
@app.route("/api/helplines", methods=["GET"])
def get_helplines():
    return jsonify({
        "emergency_helplines": Config.DEFAULT_HELPLINES,
        "reporting_portals": Config.REPORTING_PORTALS
    })

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
