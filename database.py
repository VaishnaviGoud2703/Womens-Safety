"""
Database layer for Nirbhaya: A World Without Fear.
Provides local SQLite storage for trusted emergency contacts, voluntary incident logs,
and safety checklist state. Implements complete data wipe capability for privacy.
"""
import sqlite3
import os
from datetime import datetime
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Emergency Contacts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS emergency_contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            relationship TEXT DEFAULT 'Trusted Contact',
            email TEXT DEFAULT '',
            is_primary INTEGER DEFAULT 0,
            notify_sms INTEGER DEFAULT 1,
            notify_whatsapp INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Incident Vault table (voluntary records saved by user for evidence)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incident_vault (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            platform TEXT DEFAULT 'Unknown',
            offender_handle TEXT DEFAULT '',
            description TEXT NOT NULL,
            incident_date TEXT NOT NULL,
            evidence_notes TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Personal Safety Checklist table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS safety_checklist (
            task_key TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Populate default checklist tasks if empty
    cursor.execute("SELECT COUNT(*) FROM safety_checklist")
    if cursor.fetchone()[0] == 0:
        default_tasks = [
            ("add_emergency_contacts", "Add at least 2 trusted emergency contacts", "Physical Safety", 0),
            ("test_location_share", "Test location sharing link with a trusted contact", "Physical Safety", 0),
            ("save_helpline_numbers", "Save local Women Helpline (1091 / 112) on speed dial", "Physical Safety", 0),
            ("enable_two_factor_auth", "Enable Two-Factor Authentication (2FA) on primary email & socials", "Digital Privacy", 0),
            ("audit_app_permissions", "Review smartphone location and microphone permissions", "Digital Privacy", 0),
            ("check_suspicious_logins", "Check active login sessions on Google, Instagram, and WhatsApp", "Digital Privacy", 0),
            ("review_social_privacy", "Set social media profiles to private or restrict unknown message requests", "Digital Privacy", 0),
            ("secure_sim_and_pin", "Set up a SIM card lock PIN to protect against SIM swap fraud", "Digital Privacy", 0)
        ]
        cursor.executemany(
            "INSERT INTO safety_checklist (task_key, title, category, completed) VALUES (?, ?, ?, ?)",
            default_tasks
        )

    # Populate a couple of sample contacts if none exist so the app is immediately usable in demos
    cursor.execute("SELECT COUNT(*) FROM emergency_contacts")
    if cursor.fetchone()[0] == 0:
        sample_contacts = [
            ("Aanya Sharma", "+919876543210", "Sister", "aanya@example.com", 1, 1, 1),
            ("Priya Patel", "+919123456789", "Best Friend", "priya@example.com", 0, 1, 1)
        ]
        cursor.executemany(
            "INSERT INTO emergency_contacts (name, phone, relationship, email, is_primary, notify_sms, notify_whatsapp) VALUES (?, ?, ?, ?, ?, ?, ?)",
            sample_contacts
        )
        
    conn.commit()
    conn.close()

# --- Emergency Contact Operations ---
def get_contacts():
    conn = get_db_connection()
    contacts = conn.execute("SELECT * FROM emergency_contacts ORDER BY is_primary DESC, id ASC").fetchall()
    conn.close()
    return [dict(c) for c in contacts]

def add_contact(name, phone, relationship, email="", is_primary=0, notify_sms=1, notify_whatsapp=1):
    conn = get_db_connection()
    cursor = conn.cursor()
    if is_primary:
        cursor.execute("UPDATE emergency_contacts SET is_primary = 0")
    cursor.execute("""
        INSERT INTO emergency_contacts (name, phone, relationship, email, is_primary, notify_sms, notify_whatsapp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (name, phone, relationship, email, 1 if is_primary else 0, 1 if notify_sms else 0, 1 if notify_whatsapp else 0))
    contact_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return contact_id

def delete_contact(contact_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM emergency_contacts WHERE id = ?", (contact_id,))
    conn.commit()
    conn.close()
    return True

# --- Incident Vault Operations ---
def get_incidents():
    conn = get_db_connection()
    incidents = conn.execute("SELECT * FROM incident_vault ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(i) for i in incidents]

def add_incident(title, category, platform, offender_handle, description, incident_date, evidence_notes=""):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO incident_vault (title, category, platform, offender_handle, description, incident_date, evidence_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (title, category, platform, offender_handle, description, incident_date, evidence_notes))
    incident_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return incident_id

def delete_incident(incident_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM incident_vault WHERE id = ?", (incident_id,))
    conn.commit()
    conn.close()
    return True

# --- Safety Checklist Operations ---
def get_checklist():
    conn = get_db_connection()
    items = conn.execute("SELECT * FROM safety_checklist ORDER BY category, task_key").fetchall()
    conn.close()
    return [dict(item) for item in items]

def toggle_checklist(task_key, completed):
    conn = get_db_connection()
    conn.execute(
        "UPDATE safety_checklist SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE task_key = ?",
        (1 if completed else 0, task_key)
    )
    conn.commit()
    conn.close()
    return True

# --- Privacy Data Wipe ---
def wipe_all_user_data():
    """Wipes all stored personal data (contacts, incidents) to honor privacy rights."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM emergency_contacts")
    cursor.execute("DELETE FROM incident_vault")
    cursor.execute("UPDATE safety_checklist SET completed = 0")
    conn.commit()
    conn.close()
    return True
