/**
 * Nirbhaya - Location & Trusted Contacts Hub Module
 * Tagline: A World Without Fear
 * Permission-based location retrieval, live sharing status, and contact management.
 */

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

  // Load existing contacts
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
    if (displayBox) displayBox.innerHTML = "Location sharing is currently inactive. Tap start when you want trusted contacts to view your location.";
    if (previewFrame) previewFrame.style.display = "none";
  } else {
    // Request permission & Start sharing
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
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
            <div style="font-size:0.9rem;">
              <strong>Current GPS:</strong> ${lat}° N, ${lng}° E (±${currentCoords.accuracy} meters)<br>
              <strong>Direct Link:</strong> <a href="${mapsLink}" target="_blank" style="color:#c084fc;">${mapsLink}</a>
            </div>
          `;
        }

        // Update OpenStreetMap embed iframe
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
        alert("Location access was denied or timed out. Please allow location permissions in your browser.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  }
}

async function loadEmergencyContacts() {
  const container = document.getElementById("contactsListContainer");
  if (!container) return;

  try {
    const res = await fetch("/api/contacts");
    const data = await res.json();
    const contacts = data.contacts || [];

    if (contacts.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:16px;">No emergency contacts added yet.</td></tr>`;
      return;
    }

    container.innerHTML = contacts.map(c => `
      <tr>
        <td>
          <strong>${c.name}</strong> ${c.is_primary ? '<span style="background:#7c3aed; color:white; font-size:0.7rem; padding:2px 6px; border-radius:4px; margin-left:4px;">Primary</span>' : ''}<br>
          <span style="font-size:0.8rem; color:#94a3b8;">${c.relationship}</span>
        </td>
        <td>${c.phone}</td>
        <td>
          ${c.notify_whatsapp ? '<span title="WhatsApp Alert Enabled" style="margin-right:6px;">📱 WA</span>' : ''}
          ${c.notify_sms ? '<span title="SMS Alert Enabled">✉️ SMS</span>' : ''}
        </td>
        <td>
          <a href="tel:${c.phone}" class="dial-chip" style="font-size:0.75rem; text-decoration:none;">📞 Call</a>
        </td>
        <td style="text-align:right;">
          <button onclick="deleteContact(${c.id})" class="btn-danger" style="padding:4px 8px; font-size:0.75rem;">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Load contacts error:", err);
  }
}

async function handleAddContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contactName").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const relationship = document.getElementById("contactRelation").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const is_primary = document.getElementById("contactIsPrimary").checked;
  const notify_sms = document.getElementById("contactNotifySms").checked;
  const notify_whatsapp = document.getElementById("contactNotifyWa").checked;

  if (!name || !phone) {
    alert("Name and phone number are required.");
    return;
  }

  try {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, phone, relationship, email, is_primary, notify_sms, notify_whatsapp
      })
    });
    if (res.ok) {
      document.getElementById("addContactForm").reset();
      loadEmergencyContacts();
      alert("Emergency contact added successfully!");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add contact.");
    }
  } catch (err) {
    console.error("Add contact error:", err);
  }
}

window.deleteContact = async function(id) {
  if (!confirm("Are you sure you want to remove this trusted contact?")) return;
  try {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    loadEmergencyContacts();
  } catch (err) {
    console.error("Delete contact error:", err);
  }
};

document.addEventListener("DOMContentLoaded", initLocationHub);
