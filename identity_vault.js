/**
 * Nirbhaya - Digital Identity, Impersonation Shield & Incident Vault Module
 * Tagline: A World Without Fear
 * Helps users evaluate suspicious profiles, voluntary incident preservation,
 * and platform reporting workflows.
 */

function initIdentityVault() {
  const evaluateProfileBtn = document.getElementById("evaluateProfileBtn");
  const saveIncidentForm = document.getElementById("saveIncidentForm");
  const exportIncidentsBtn = document.getElementById("exportIncidentsBtn");

  if (evaluateProfileBtn) {
    evaluateProfileBtn.addEventListener("click", evaluateFakeProfile);
  }

  if (saveIncidentForm) {
    saveIncidentForm.addEventListener("submit", handleSaveIncident);
  }

  if (exportIncidentsBtn) {
    exportIncidentsBtn.addEventListener("click", exportIncidentsToFile);
  }

  loadIncidentVault();
}

function evaluateFakeProfile() {
  const c1 = document.getElementById("chkHandleVariation")?.checked;
  const c2 = document.getElementById("chkRecentAccount")?.checked;
  const c3 = document.getElementById("chkUrgentDm")?.checked;
  const c4 = document.getElementById("chkGenericPics")?.checked;
  const c5 = document.getElementById("chkRefuseCall")?.checked;

  let riskCount = 0;
  if (c1) riskCount++;
  if (c2) riskCount++;
  if (c3) riskCount++;
  if (c4) riskCount++;
  if (c5) riskCount++;

  const resultContainer = document.getElementById("profileEvaluationResult");
  if (!resultContainer) return;

  let badge = "Low Likelihood";
  let badgeColor = "#10b981";
  let explanation = "The account demonstrates normal profile characteristics based on selected items.";

  if (riskCount >= 4) {
    badge = "Extremely High Likelihood of Fake/Impersonator";
    badgeColor = "#ef4444";
    explanation = "Critical red flags present. This account strongly exhibits characteristics of an impersonation bot, catfish, or scammer.";
  } else if (riskCount >= 2) {
    badge = "Moderate Suspicion";
    badgeColor = "#f59e0b";
    explanation = "Several warning signs matched. Do not share any personal details, photos, or funds without independent verification.";
  }

  resultContainer.innerHTML = `
    <div style="background:#0f172a; border-left:4px solid ${badgeColor}; padding:14px; border-radius:6px; margin-top:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <strong style="color:${badgeColor}; font-size:1.05rem;">${badge} (${riskCount}/5 Flags)</strong>
      </div>
      <p style="font-size:0.88rem; color:#cbd5e1; margin-top:6px;">${explanation}</p>
      
      <div style="margin-top:12px; font-size:0.82rem; color:#94a3b8; border-top:1px solid #334155; padding-top:8px;">
        <strong>Recommended Next Steps:</strong><br>
        1. <strong>Reverse Image Search:</strong> Take a screenshot of the profile photo and search it on Google Lens or TinEye.<br>
        2. <strong>Direct Channel Verification:</strong> If this account claims to be a friend or family member, call them on their known phone number to verify.<br>
        3. <strong>Report Profile:</strong> Select 'Report' -> 'It's pretending to be someone I know' on the platform.<br>
        4. <strong>Privacy Notice:</strong> Nirbhaya does not make definitive legal determinations, but highlights established social engineering indicators.
      </div>
    </div>
  `;
}

async function loadIncidentVault() {
  const container = document.getElementById("incidentVaultList");
  if (!container) return;

  try {
    const res = await fetch("/api/incidents");
    const data = await res.json();
    const incidents = data.incidents || [];

    if (incidents.length === 0) {
      container.innerHTML = `<p style="color:#94a3b8; font-size:0.88rem; text-align:center; padding:16px;">No incidents recorded in your local vault.</p>`;
      return;
    }

    container.innerHTML = incidents.map(inc => `
      <div class="incident-item">
        <div class="incident-header">
          <span class="incident-title">${escapeHtml(inc.title)}</span>
          <span style="background:#7c3aed33; color:#c084fc; font-size:0.75rem; padding:2px 8px; border-radius:9999px;">
            ${escapeHtml(inc.category)}
          </span>
        </div>
        <div class="incident-meta">
          Platform: <strong>${escapeHtml(inc.platform)}</strong> | 
          Offender: <strong>${escapeHtml(inc.offender_handle || 'Unknown')}</strong> | 
          Date: <strong>${escapeHtml(inc.incident_date)}</strong>
        </div>
        <p style="font-size:0.88rem; color:#cbd5e1; margin-top:8px; line-height:1.4;">
          ${escapeHtml(inc.description)}
        </p>
        ${inc.evidence_notes ? `
          <div style="font-size:0.8rem; color:#94a3b8; margin-top:6px; background:#1e293b; padding:8px; border-radius:4px;">
            📁 <strong>Evidence Notes:</strong> ${escapeHtml(inc.evidence_notes)}
          </div>
        ` : ''}
        <div style="display:flex; justify-content:flex-end; margin-top:10px;">
          <button onclick="deleteIncidentRecord(${inc.id})" class="btn-danger" style="padding:3px 8px; font-size:0.75rem;">
            Remove Record
          </button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Load incidents error:", err);
  }
}

async function handleSaveIncident(e) {
  e.preventDefault();
  const title = document.getElementById("incidentTitle").value.trim();
  const category = document.getElementById("incidentCategory").value;
  const platform = document.getElementById("incidentPlatform").value;
  const offender_handle = document.getElementById("incidentOffender").value.trim();
  const incident_date = document.getElementById("incidentDate").value;
  const description = document.getElementById("incidentDesc").value.trim();
  const evidence_notes = document.getElementById("incidentEvidence").value.trim();

  if (!title || !incident_date || !description) {
    alert("Title, Date, and Description are required.");
    return;
  }

  try {
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, category, platform, offender_handle, incident_date, description, evidence_notes
      })
    });
    if (res.ok) {
      document.getElementById("saveIncidentForm").reset();
      loadIncidentVault();
      alert("Incident successfully saved to your local evidence vault.");
    }
  } catch (err) {
    console.error("Save incident error:", err);
  }
}

window.deleteIncidentRecord = async function(id) {
  if (!confirm("Permanently delete this incident record from your vault?")) return;
  try {
    await fetch(`/api/incidents/${id}`, { method: "DELETE" });
    loadIncidentVault();
  } catch (err) {
    console.error("Delete incident error:", err);
  }
};

async function exportIncidentsToFile() {
  try {
    const res = await fetch("/api/incidents");
    const data = await res.json();
    const incidents = data.incidents || [];

    if (incidents.length === 0) {
      alert("No incidents recorded to export.");
      return;
    }

    const exportText = `=====================================================
NIRBHAYA - INCIDENT EVIDENCE DOSSIER
A World Without Fear
Exported On: ${new Date().toLocaleString()}
Notice: This document contains voluntarily recorded user notes for legal/reporting reference.
=====================================================

` + incidents.map((inc, i) => `
[INCIDENT #${i + 1}]
Title: ${inc.title}
Category: ${inc.category}
Platform: ${inc.platform}
Offender Identifier: ${inc.offender_handle || 'Not Provided'}
Date of Occurrence: ${inc.incident_date}
Description:
${inc.description}

Preserved Evidence Notes:
${inc.evidence_notes || 'None'}
-----------------------------------------------------
`).join("\n");

    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Nirbhaya_Incident_Report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export error:", err);
  }
}

function escapeHtml(text) {
  if (!text) return "";
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

document.addEventListener("DOMContentLoaded", initIdentityVault);
