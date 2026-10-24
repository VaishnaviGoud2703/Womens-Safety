/**
 * Nirbhaya - Core Application Controller
 * Tagline: A World Without Fear
 * Navigation tabs, stealth camouflage mode, safety readiness checklist,
 * complete privacy data wipe, and emergency helpline directory.
 */

const CHECKLIST_LOCAL_STORAGE_KEY = "nirbhaya_safety_checklist";

const DEFAULT_CHECKLIST_TASKS = [
  { task_key: "add_emergency_contacts", title: "Add at least 2 trusted emergency contacts", category: "Physical Safety", completed: false },
  { task_key: "test_location_share", title: "Test location sharing link with a trusted contact", category: "Physical Safety", completed: false },
  { task_key: "save_helpline_numbers", title: "Save local Women Helpline (1091 / 112) on speed dial", category: "Physical Safety", completed: false },
  { task_key: "enable_two_factor_auth", title: "Enable Two-Factor Authentication (2FA) on primary email & socials", category: "Digital Privacy", completed: false },
  { task_key: "audit_app_permissions", title: "Review smartphone location and background microphone permissions", category: "Digital Privacy", completed: false },
  { task_key: "check_suspicious_logins", title: "Audit active login sessions on Google, Instagram, and WhatsApp", category: "Digital Privacy", completed: false },
  { task_key: "review_social_privacy", title: "Set social media profiles to private or restrict unknown message requests", category: "Digital Privacy", completed: false },
  { task_key: "secure_sim_and_pin", title: "Set up a SIM card lock PIN to protect against SIM-swap fraud", category: "Digital Privacy", completed: false }
];

const DEFAULT_HELPLINES = [
  { name: "National Emergency Number", number: "112", desc: "All-in-one Police, Fire, Medical" },
  { name: "Women Helpline (All India)", number: "1091", desc: "24/7 dedicated women safety helpline" },
  { name: "Women in Distress Helpline", number: "181", desc: "National Commission for Women" },
  { name: "Cyber Crime Reporting", number: "1930", desc: "National Cyber Crime reporting & financial fraud" },
  { name: "Police Control Room", number: "100", desc: "Immediate law enforcement dispatch" },
  { name: "Ambulance / Medical", number: "108", desc: "Emergency medical response" }
];

window.switchTab = function(targetTabId) {
  // Update nav buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    if (btn.getAttribute("data-tab") === targetTabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update tab panels
  document.querySelectorAll(".tab-panel").forEach(panel => {
    if (panel.id === targetTabId) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
};

function initApp() {
  // Bind Nav buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId) window.switchTab(tabId);
    });
  });

  // Bind Quick Exit buttons
  const quickExitBtn = document.getElementById("quickExitBtn");
  const exitStealthBtn = document.getElementById("exitStealthBtn");

  if (quickExitBtn) {
    quickExitBtn.addEventListener("click", toggleStealthMode);
  }

  if (exitStealthBtn) {
    exitStealthBtn.addEventListener("click", toggleStealthMode);
  }

  // Quick exit hotkey: pressing Escape twice or Alt+Q
  let escapeCount = 0;
  let escapeTimer = null;
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      escapeCount++;
      if (escapeTimer) clearTimeout(escapeTimer);
      if (escapeCount >= 2) {
        toggleStealthMode();
        escapeCount = 0;
      } else {
        escapeTimer = setTimeout(() => { escapeCount = 0; }, 1200);
      }
    } else if (e.altKey && (e.key === "q" || e.key === "Q")) {
      toggleStealthMode();
    }
  });

  // Bind Wipe Data Button
  const wipeDataBtn = document.getElementById("wipeDataBtn");
  if (wipeDataBtn) {
    wipeDataBtn.addEventListener("click", handleWipeAllData);
  }

  // Load Checklist & Helplines
  loadChecklist();
  loadHelplines();
}

function toggleStealthMode() {
  const stealthScreen = document.getElementById("stealthScreen");
  if (!stealthScreen) return;

  const isActive = stealthScreen.classList.contains("active");
  if (isActive) {
    stealthScreen.classList.remove("active");
    document.title = "Nirbhaya - A World Without Fear";
  } else {
    stealthScreen.classList.add("active");
    document.title = "Local Weather - Weekly Forecast";
  }
}

/**
 * Loads Safety Checklist from API or localStorage.
 */
async function loadChecklist() {
  const container = document.getElementById("safetyChecklistContainer");
  const progressFill = document.getElementById("checklistProgressBarFill");
  const scoreText = document.getElementById("safetyScoreText");
  if (!container) return;

  let items = [];

  // Try API first
  try {
    const res = await fetch("/api/checklist");
    if (res.ok) {
      const data = await res.json();
      items = data.checklist || [];
      localStorage.setItem(CHECKLIST_LOCAL_STORAGE_KEY, JSON.stringify(items));
    } else {
      throw new Error("Non-200 API response");
    }
  } catch (err) {
    // Fallback to localStorage
    const saved = localStorage.getItem(CHECKLIST_LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        items = [];
      }
    }
    if (items.length === 0) {
      items = DEFAULT_CHECKLIST_TASKS;
      localStorage.setItem(CHECKLIST_LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  }

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length || 1;
  const percentage = Math.round((completedCount / totalCount) * 100);

  if (progressFill) progressFill.style.width = `${percentage}%`;
  if (scoreText) scoreText.textContent = `${percentage}% Safety Readiness (${completedCount}/${totalCount} Completed)`;

  container.innerHTML = items.map(item => `
    <div class="checklist-item ${item.completed ? 'completed' : ''}" onclick="toggleChecklistTask('${escapeHtml(item.task_key)}', ${!item.completed})">
      <input type="checkbox" ${item.completed ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" onclick="event.stopPropagation(); toggleChecklistTask('${escapeHtml(item.task_key)}', this.checked)">
      <div style="flex:1;">
        <div class="item-text" style="font-weight:600; font-size:0.92rem; color:var(--ivory-white);">${escapeHtml(item.title)}</div>
        <span style="font-size:0.75rem; color:var(--lavender-muted);">Category: ${escapeHtml(item.category)}</span>
      </div>
      <div>
        ${item.completed ? '<span style="color:#10b981; font-size:1.15rem; font-weight:700;">✓</span>' : '<span style="color:var(--text-muted); font-size:1rem;">○</span>'}
      </div>
    </div>
  `).join("");
}

/**
 * Toggles a checklist task state.
 */
window.toggleChecklistTask = async function(taskKey, nextStatus) {
  // Update API
  try {
    await fetch("/api/checklist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_key: taskKey, completed: Boolean(nextStatus) })
    });
  } catch (err) {
    // Static mode
  }

  // Update localStorage
  const saved = localStorage.getItem(CHECKLIST_LOCAL_STORAGE_KEY);
  let items = saved ? JSON.parse(saved) : DEFAULT_CHECKLIST_TASKS;
  const target = items.find(i => i.task_key === taskKey);
  if (target) {
    target.completed = Boolean(nextStatus);
  }
  localStorage.setItem(CHECKLIST_LOCAL_STORAGE_KEY, JSON.stringify(items));

  loadChecklist();
};

/**
 * Permanent Privacy Data Wipe.
 */
async function handleWipeAllData() {
  if (!confirm("⚠️ PERMANENT PRIVACY DATA WIPE:\nThis will permanently delete all saved emergency contacts, incident records, and reset your safety checklist on this device.\n\nAre you sure you want to proceed?")) {
    return;
  }

  // Call API wipe if running Flask
  try {
    await fetch("/api/privacy/wipe-data", { method: "POST" });
  } catch (err) {
    // Static mode
  }

  // Erase localStorage keys
  localStorage.removeItem("nirbhaya_emergency_contacts");
  localStorage.removeItem("nirbhaya_incident_vault");
  localStorage.removeItem(CHECKLIST_LOCAL_STORAGE_KEY);

  alert("All user data, contacts, and evidence logs have been permanently erased from this device.");
  window.location.reload();
}

/**
 * Loads 24/7 Helplines Overview.
 */
async function loadHelplines() {
  const listContainer = document.getElementById("helplinesOverviewList");
  if (!listContainer) return;

  let helplines = [];

  try {
    const res = await fetch("/api/helplines");
    if (res.ok) {
      const data = await res.json();
      helplines = data.emergency_helplines || [];
    } else {
      throw new Error("Non-200 API response");
    }
  } catch (err) {
    helplines = DEFAULT_HELPLINES;
  }

  listContainer.innerHTML = helplines.map(h => `
    <div style="background:rgba(20, 6, 23, 0.7); border:1px solid var(--lavender-border); border-radius:var(--radius-sm); padding:12px 16px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <div>
        <strong style="color:var(--ivory-white); font-size:0.92rem;">${escapeHtml(h.name)}</strong><br>
        <span style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(h.desc)}</span>
      </div>
      <a href="tel:${escapeHtml(h.number)}" class="dial-chip" style="font-size:0.86rem; padding:6px 14px; text-decoration:none;">
        📞 ${escapeHtml(h.number)}
      </a>
    </div>
  `).join("");
}

function escapeHtml(text) {
  if (!text) return "";
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

document.addEventListener("DOMContentLoaded", initApp);
