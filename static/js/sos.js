/**
 * Nirbhaya - Emergency SOS Module
 * Tagline: A World Without Fear
 * Handles countdown, sound alarm synthesis, Geolocation acquisition,
 * and multi-channel emergency alert dispatch.
 */

let countdownTimer = null;
let countdownRemaining = 5;
let audioContext = null;

// Sound synthesizer using Web Audio API (no external MP3 required)
function playBeep(freq = 880, duration = 0.2) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context not allowed without interaction:", e);
  }
}

function initSOSModule() {
  const sosBtn = document.getElementById("sosBigBtn");
  const cancelBtn = document.getElementById("cancelSosBtn");
  const headerSosBtn = document.getElementById("headerSosBtn");

  if (sosBtn) {
    sosBtn.addEventListener("click", startSOSCountdown);
  }
  if (headerSosBtn) {
    headerSosBtn.addEventListener("click", () => {
      // Switch to SOS tab and start countdown
      if (window.switchTab) window.switchTab("sosTab");
      startSOSCountdown();
    });
  }
  if (cancelBtn) {
    cancelBtn.addEventListener("click", cancelSOSCountdown);
  }
}

function startSOSCountdown() {
  const overlay = document.getElementById("countdownOverlay");
  const numElem = document.getElementById("countdownNumber");
  const resultBox = document.getElementById("sosResultBox");

  if (resultBox) resultBox.classList.remove("active");
  countdownRemaining = 5;
  if (numElem) numElem.textContent = countdownRemaining;
  if (overlay) overlay.classList.add("active");

  playBeep(660, 0.2);

  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    countdownRemaining--;
    if (numElem) numElem.textContent = countdownRemaining;
    playBeep(880, 0.2);

    if (countdownRemaining <= 0) {
      clearInterval(countdownTimer);
      if (overlay) overlay.classList.remove("active");
      executeEmergencyAlert();
    }
  }, 1000);
}

function cancelSOSCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  const overlay = document.getElementById("countdownOverlay");
  if (overlay) overlay.classList.remove("active");
  playBeep(440, 0.3);

  fetch("/api/sos/cancel", { method: "POST" })
    .then(r => r.json())
    .then(data => {
      alert(data.message || "SOS Cancelled.");
    })
    .catch(() => alert("SOS Cancelled."));
}

async function executeEmergencyAlert() {
  const resultBox = document.getElementById("sosResultBox");
  const attachGps = document.getElementById("attachGpsCheck")?.checked ?? true;
  const customNote = document.getElementById("sosCustomNote")?.value || "";

  let locationPayload = null;

  if (attachGps && navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 10000
        });
      });
      locationPayload = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy)
      };
    } catch (err) {
      console.warn("Location permission denied or timed out:", err.message);
    }
  }

  // Trigger Backend SOS alert preparation
  try {
    const res = await fetch("/api/sos/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: locationPayload,
        note: customNote
      })
    });
    const data = await res.json();
    renderSOSResult(data);
  } catch (err) {
    console.error("SOS trigger error:", err);
    alert("Network error triggering SOS. Please dial 112 directly.");
  }
}

function renderSOSResult(data) {
  const resultBox = document.getElementById("sosResultBox");
  if (!resultBox) return;

  let dispatchesHtml = "";
  if (data.dispatches && data.dispatches.length > 0) {
    dispatchesHtml = data.dispatches.map(d => `
      <div style="background:#0f172a; padding:12px; border-radius:8px; margin-bottom:10px; border:1px solid #334155;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <strong>${d.name}</strong> (${d.relationship})<br>
            <span style="font-size:0.85rem; color:#94a3b8;">${d.phone}</span>
          </div>
          <div style="display:flex; gap:8px;">
            ${d.whatsapp_dispatch_url ? `<a href="${d.whatsapp_dispatch_url}" target="_blank" class="btn-primary" style="background:#25D366; padding:6px 12px; font-size:0.8rem; text-decoration:none;">📱 WhatsApp Alert</a>` : ''}
            ${d.sms_dispatch_uri ? `<a href="${d.sms_dispatch_uri}" class="btn-secondary" style="padding:6px 12px; font-size:0.8rem; text-decoration:none;">✉️ SMS Alert</a>` : ''}
          </div>
        </div>
      </div>
    `).join("");
  } else {
    dispatchesHtml = `<p style="color:#f87171;">No trusted emergency contacts configured yet. Please configure them in the Contacts tab.</p>`;
  }

  let mapLinkHtml = "";
  if (data.location_links?.google_maps) {
    mapLinkHtml = `
      <p style="margin: 10px 0;">
        📍 <strong>Location Included:</strong> 
        <a href="${data.location_links.google_maps}" target="_blank" style="color:#c084fc;">Open in Google Maps</a> |
        <a href="${data.location_links.open_street_map}" target="_blank" style="color:#c084fc;">OpenStreetMap</a>
      </p>
    `;
  }

  resultBox.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
      <span style="font-size:1.6rem;">🚨</span>
      <h3 style="color:#f87171; font-size:1.3rem;">Emergency Protocol Activated</h3>
    </div>
    <p style="font-size:0.9rem; margin-bottom:12px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); padding:10px; border-radius:6px; color:#fca5a5;">
      ${data.compliance_note}
    </p>
    ${mapLinkHtml}
    
    <h4 style="margin:16px 0 8px; font-size:1rem;">1-Tap Emergency Broadcast to Trusted Contacts:</h4>
    ${dispatchesHtml}

    <div style="margin-top:18px; padding-top:14px; border-top:1px solid #334155; display:flex; gap:10px; flex-wrap:wrap;">
      <a href="tel:112" class="btn-danger" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
        📞 Call Police (112)
      </a>
      <a href="tel:1091" class="btn-danger" style="background:#e11d48; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
        🛡️ Call Women Helpline (1091)
      </a>
      <button onclick="document.getElementById('sosResultBox').classList.remove('active')" class="btn-secondary">
        Dismiss Notice
      </button>
    </div>
  `;

  resultBox.classList.add("active");
  resultBox.scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", initSOSModule);
