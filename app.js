/**
 * Nirbhaya - Core Application Controller
 * Tagline: A World Without Fear
 * Handles Navigation Tabs, Stealth / Quick Exit mode, Safety Checklist,
 * Privacy Data Wipe, and Global Helplines.
 */

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

  // Bind Quick Exit button
  const quickExitBtn = document.getElementById("quickExitBtn");
  const exitStealthBtn = document.getElementById("exitStealthBtn");
  const stealthScreen = document.getElementById("stealthScreen");

  if (quickExitBtn) {
    quickExitBtn.addEventListener("click", toggleStealthMode);
  }

  if (exitStealthBtn) {
    exitStealthBtn.addEventListener("click", toggleStealthMode);
  }

  // Quick exit hotkey: pressing Escape key 3 times or Alt+Q
  let escapeCount = 0;
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      escapeCount++;
      if (escapeCount >= 2) {
        toggleStealthMode();
        escapeCount = 0;
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

async function loadChecklist() {
  const container = document.getElementById("safetyChecklistContainer");
  const progressFill = document.getElementById("checklistProgressBarFill");
  const scoreText = document.getElementById("safetyScoreText");
  if (!container) return;

  try {
    const res = await fetch("/api/checklist");
    const data = await res.json();
    const items = data.checklist || [];

    const completedCount = items.filter(i => i.completed).length;
    const totalCount = items.length || 1;
    const percentage = Math.round((completedCount / totalCount) * 100);

    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (scoreText) scoreText.textContent = `${percentage}% Safety Readiness Score`;

    container.innerHTML = items.map(item => `
      <div class="checklist-item ${item.completed ? 'completed' : ''}" onclick="toggleChecklistTask('${item.task_key}', ${!item.completed})">
        <input type="checkbox" ${item.completed ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" onclick="event.stopPropagation(); toggleChecklistTask('${item.task_key}', this.checked)">
        <div style="flex:1;">
          <div class="item-text" style="font-weight:600; font-size:0.92rem;">${item.title}</div>
          <span style="font-size:0.75rem; color:#94a3b8;">Category: ${item.category}</span>
        </div>
        <div>
          ${item.completed ? '<span style="color:#10b981; font-size:1.1rem;">✓</span>' : '<span style="color:#64748b; font-size:0.9rem;">○</span>'}
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Checklist error:", err);
  }
}

window.toggleChecklistTask = async function(taskKey, nextStatus) {
  try {
    await fetch("/api/checklist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_key: taskKey, completed: nextStatus })
    });
    loadChecklist();
  } catch (err) {
    console.error("Toggle checklist error:", err);
  }
};

async function handleWipeAllData() {
  if (!confirm("⚠️ PRIVACY DATA WIPE:\nThis will permanently delete all saved emergency contacts, incident records, and reset your safety checklist.\n\nAre you sure you want to proceed?")) {
    return;
  }

  try {
    const res = await fetch("/api/privacy/wipe-data", { method: "POST" });
    if (res.ok) {
      alert("All user data has been permanently cleared from local storage.");
      window.location.reload();
    }
  } catch (err) {
    console.error("Data wipe error:", err);
  }
}

async function loadHelplines() {
  try {
    const res = await fetch("/api/helplines");
    const data = await res.json();
    const helplines = data.emergency_helplines || [];

    const listContainer = document.getElementById("helplinesOverviewList");
    if (listContainer) {
      listContainer.innerHTML = helplines.map(h => `
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${h.name}</strong><br>
            <span style="font-size:0.8rem; color:#94a3b8;">${h.desc}</span>
          </div>
          <a href="tel:${h.number}" class="dial-chip" style="font-size:0.9rem; padding:6px 14px; text-decoration:none;">
            📞 ${h.number}
          </a>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("Load helplines error:", err);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
