"""
Configuration module for Nirbhaya: A World Without Fear.
Defines security constants, helpline directories, model paths, and privacy policies.
"""
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "nirbhaya-ai-secure-dev-key-2026")
    DATABASE_PATH = os.path.join(BASE_DIR, "nirbhaya.db")
    MODEL_DIR = os.path.join(BASE_DIR, "ml_engine", "models")
    MODEL_PATH = os.path.join(MODEL_DIR, "threat_classifier.joblib")
    
    # Emergency helplines (International & India defaults, configurable by user)
    DEFAULT_HELPLINES = [
        {"name": "National Emergency Number", "number": "112", "desc": "All-in-one Police, Fire, Medical"},
        {"name": "Women Helpline (All India)", "number": "1091", "desc": "24/7 dedicated women safety helpline"},
        {"name": "Women in Distress Helpline", "number": "181", "desc": "National Commission for Women"},
        {"name": "Cyber Crime Reporting", "number": "1930", "desc": "National Cyber Crime reporting & financial fraud"},
        {"name": "Police Control Room", "number": "100", "desc": "Immediate law enforcement dispatch"},
        {"name": "Ambulance / Medical", "number": "108", "desc": "Emergency medical response"}
    ]
    
    # Official Cybercrime & reporting portals
    REPORTING_PORTALS = {
        "india_cybercrime": "https://cybercrime.gov.in",
        "ncw_india": "http://ncw.nic.in",
        "ic3_us": "https://www.ic3.gov",
        "action_fraud_uk": "https://www.actionfraud.police.uk"
    }
