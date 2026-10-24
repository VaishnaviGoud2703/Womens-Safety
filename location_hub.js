/**
 * Nirbhaya - Location & Trusted Contacts Hub Module
 * Tagline: A World Without Fear
 * Explicit permission-based location sharing, live preview, contact management,
 * and dual-mode resilience (Flask API + Static GitHub Pages fallback).
 */

const CONTACTS_LOCAL_STORAGE_KEY = "nirbhaya_emergency_contacts";

const DEFAULT_DEMO_CONTACTS = [
  { id: 1, name: "Aanya Sharma", phone: "+919876543210", relationship: "Sister", email: "aanya@example.com", is_primary: 1, notify_sms: 1, notify_whatsapp: 1 },
  { id: 2, name: "Priya Patel", phone: "+919123456789", relationship: "Best Friend", email: "priya@example.com", is_primary: 0, notify_sms: 1, notify_whatsapp: 1 }
];

let watchId = null;
let currentCoords = null;

function initLocationHub() {
  const toggleBtn = document.getElementById("toggleLocationBtn");
  const copyBtn = document.getElementById("copyLocationLinkBtn");
  const shareWaBtn = document.getElementById("shareLocationWaBtn");
  const addContactForm = document.getElementById("addContactForm");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleLiveLocation);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      if (!currentCoords) {
        alert("Please start location sharing first to generate your link.");
        return;
      }
      const link = `https://maps.google.com/?q=${currentCoords.latitude},${currentCoords.longitude}`;
      navigator.clipboard.writeText(link).then(() => {
        alert("Location link copied to clipboard!");
      }).catch(() => {
        prompt("Copy this location link:", link);
      });
    });
  }

  if (shareWaBtn) {
    shareWaBtn.addEventListener("click", () => {
      if (!currentCoords) {
        alert("Please start location sharing first to share your location.");
        return;
      }
      const link = `https://maps.google.com/?q=${currentCoords.latitude},${currentCoords.longitude}`;
      const msg = encodeURIComponent(`Hi, I am sharing my live location with you for safety: ${link}`);
      window.open(`https://wa.me/?text=${msg}`, "_blank");
    });
  }

  if (addContactForm) {
    addContactForm.addEventListener("submit", handleAddContactSubmit);
  }

  // Load contacts
  loadEmergencyContacts();
}

function toggleLiveLocation() {
  const btn = document.getElementById("toggleLocationBtn");
  const statusBadge = document.getElementById("locationStatusBadge");
  const displayBox = document.getElementById("locationCoordsDisplay");
  const previewFrame = document.getElementById("mapPreviewFrame");

  if (watchId !== null) {
    // Stop sharing
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    currentCoords = null;

    btn.textContent = "Start Location Sharing";
    btn.className = "btn-primary";
    statusBadge.className = "location-status-badge inactive";
    statusBadge.innerHTML = `<span class="pulse-dot"></span> Location Sharing Off`;
    if (displayBox) {
      displayBox.innerHTML = "Location sharing is currently inactive. Tap start when you want trusted contacts to view your location.";
    }
    if (previewFrame) previewFrame.style.display = "none";
  } else {
    // Request permission & Start sharing
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your current browser.");
      return;
    }

    btn.textContent = "Requesting GPS Access...";
    btn.disabled = true;

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        btn.disabled = false;
        btn.textContent = "Stop Location Sharing";
        btn.className = "btn-danger";

        currentCoords = {
          latitude: pos.coords.latitude.toFixed(5),
          longitude: pos.coords.longitude.toFixed(5),
          accuracy: Math.round(pos.coords.accuracy)
        };

        statusBadge.className = "location-status-badge active";
        statusBadge.innerHTML = `<span class="pulse-dot pulsing"></span> Location Sharing Active`;

        const lat = currentCoords.latitude;
        const lng = currentCoords.longitude;
        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;

        if (displayBox) {
          displayBox.innerHTML = `
            <div style="font-size:0.88rem; line-height:1.5;">
              <strong style="color:var(--ivory-white);">Current GPS:</strong> ${lat}° N, ${lng}° E (±${currentCoords.accuracy}m accuracy)<br>
              <strong>Direct Link:</strong> <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" style="color:var(--gold-sheen); text-decoration:underline;">${mapsLink}</a>
            </div>
          `;
        }

        // OpenStreetMap embed iframe
        if (previewFrame) {
          const delta = 0.005;
          const bbox = `${parseFloat(lng) - delta},${parseFloat(lat) - delta},${parseFloat(lng) + delta},${parseFloat(lat) + delta}`;
          previewFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
          previewFrame.style.display = "block";
        }
      },
      (err) => {
        btn.disabled = false;
        btn.textContent = "Start Location Sharing";
        let errMsg = "Location access was denied or timed out. Please allow location permissions in your browser settings.";
        if (err.code === err.PERMISSION_DENIED) {
          errMsg = "Location permission was denied. Nirbhaya respects your choice; GPS coordinates will not be tracked.";
        }
        alert(errMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  }
}

/**
 * Loads emergency contacts from API or localStorage fallback.
 */
async function loadEmergencyContacts() {
  const container = document.getElementById("contactsListContainer");
  if (!container) return;

  let contacts = [];

  // Try API first
  try {
    const res = await fetch("/api/contacts");
    if (res.ok) {
      const data = await res.json();
      contacts = data.contacts || [];
      localStorage.setItem(CONTACTS_LOCAL_STORAGE_KEY, JSON.stringify(contacts));
    } else {
      throw new Error("Non-200 API response");
    }
  } catch (err) {
    // Fallback to localStorage
    const saved = localStorage.getItem(CONTACTS_LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        contacts = JSON.parse(saved);
      } catch (e) {
        contacts = [];
      }
    }
    // Initialize defaults if empty
    if (contacts.length === 0) {
      contacts = DEFAULT_DEMO_CONTACTS;
      localStorage.setItem(CONTACTS_LOCAL_STORAGE_KEY, JSON.stringify(contacts));
    }
  }

  if (contacts.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">No emergency contacts added yet. Add trusted contacts above.</td></tr>`;
    return;
  }

  container.innerHTML = contacts.map(c => `
    <tr>
      <td>
        <strong style="color:var(--ivory-white);">${escapeHtml(c.name)}</strong>
        ${c.is_primary ? '<span style="background:rgba(212,175,55,0.18); color:var(--gold-sheen); border:1px solid var(--gold-border); font-size:0.7rem; padding:2px 8px; border-radius:9999px; margin-left:6px; font-weight:600;">Primary</span>' : ''}<br>
        <span style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(c.relationship || 'Trusted Contact')}</span>
      </td>
      <td style="color:var(--ivory-soft); font-family:monospace; font-size:0.85rem;">${escapeHtml(c.phone)}</td>
      <td>
        ${c.notify_whatsapp ? '<span title="WhatsApp Broadcast Enabled" style="margin-right:8px; font-size:0.8rem; background:rgba(37,211,102,0.15); color:#4ade80; border:1px solid rgba(37,211,102,0.3); padding:2px 6px; border-radius:4px;">WA</span>' : ''}
        ${c.notify_sms ? '<span title="SMS Broadcast Enabled" style="font-size:0.8rem; background:rgba(203,182,224,0.15); color:var(--lavender-light); border:1px solid var(--lavender-border); padding:2px 6px; border-radius:4px;">SMS</span>' : ''}
      </td>
      <td>
        <a href="tel:${escapeHtml(c.phone)}" class="dial-chip" style="font-size:0.78rem; text-decoration:none;">
          📞 Call
        </a>
      </td>
      <td style="text-align:right;">
        <button onclick="deleteContact(${c.id})" class="btn-danger" style="padding:4px 10px; font-size:0.76rem;">
          Delete
        </button>
      </td>
    </tr>
  `).join("");
}

/**
 * Handles adding new contacts.
 */
async function handleAddContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contactName")?.value.trim();
  const phone = document.getElementById("contactPhone")?.value.trim();
  const relationship = document.getElementById("contactRelation")?.value.trim() || "Trusted Contact";
  const email = document.getElementById("contactEmail")?.value.trim() || "";
  const is_primary = document.getElementById("contactIsPrimary")?.checked ? 1 : 0;
  const notify_sms = document.getElementById("contactNotifySms")?.checked ? 1 : 0;
  const notify_whatsapp = document.getElementById("contactNotifyWa")?.checked ? 1 : 0;

  if (!name || !phone) {
    alert("Name and phone number are required.");
    return;
  }

  const payload = {
    name, phone, relationship, email, is_primary, notify_sms, notify_whatsapp
  };

  // Try API first
  try {
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Static mode
  }

  // Update localStorage
  const saved = localStorage.getItem(CONTACTS_LOCAL_STORAGE_KEY);
  let contacts = saved ? JSON.parse(saved) : [];

  if (is_primary) {
    contacts.forEach(c => c.is_primary = 0);
  }

  contacts.push({
    ...payload,
    id: Date.now()
  });

  localStorage.setItem(CONTACTS_LOCAL_STORAGE_KEY, JSON.stringify(contacts));

  document.getElementById("addContactForm")?.reset();
  loadEmergencyContacts();
  alert("Emergency contact added successfully!");
}

/**
 * Handles contact deletion.
 */
window.deleteContact = async function(id) {
  if (!confirm("Are you sure you want to remove this trusted contact?")) return;

  try {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
  } catch (err) {
    // Static mode
  }

  const saved = localStorage.getItem(CONTACTS_LOCAL_STORAGE_KEY);
  if (saved) {
    let contacts = JSON.parse(saved);
    contacts = contacts.filter(c => c.id !== id);
    localStorage.setItem(CONTACTS_LOCAL_STORAGE_KEY, JSON.stringify(contacts));
  }

  loadEmergencyContacts();
};

function escapeHtml(text) {
  if (!text) return "";
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

document.addEventListener("DOMContentLoaded", initLocationHub);
