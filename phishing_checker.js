/**
 * Nirbhaya - Digital Privacy & Phishing Checker Module
 * Tagline: A World Without Fear
 * Inspects URLs and messages without opening untrusted web targets.
 */

function initPhishingChecker() {
  const checkUrlBtn = document.getElementById("checkUrlBtn");
  const checkMsgBtn = document.getElementById("checkPhishMsgBtn");
  const urlInput = document.getElementById("phishUrlInput");
  const msgInput = document.getElementById("phishMsgInput");

  if (checkUrlBtn) {
    checkUrlBtn.addEventListener("click", () => {
      const url = urlInput?.value.trim();
      if (!url) {
        alert("Please enter a URL to inspect.");
        return;
      }
      runPrivacyInspection({ url });
    });
  }

  if (checkMsgBtn) {
    checkMsgBtn.addEventListener("click", () => {
      const text = msgInput?.value.trim();
      if (!text) {
        alert("Please enter a suspicious message to inspect.");
        return;
      }
      runPrivacyInspection({ text });
    });
  }

  // Preset chips for URL
  document.querySelectorAll(".url-sample-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const sample = chip.getAttribute("data-sample");
      if (urlInput && sample) {
        urlInput.value = sample;
        runPrivacyInspection({ url: sample });
      }
    });
  });

  // Preset chips for Phishing message
  document.querySelectorAll(".phish-sample-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const sample = chip.getAttribute("data-sample");
      if (msgInput && sample) {
        msgInput.value = sample;
        runPrivacyInspection({ text: sample });
      }
    });
  });
}

async function runPrivacyInspection(payload) {
  const resultBox = document.getElementById("phishingResultContainer");
  if (!resultBox) return;

  resultBox.innerHTML = `<div style="text-align:center; padding:20px; color:#94a3b8;">🔍 Inspecting target structure safely...</div>`;
  resultBox.style.display = "block";

  try {
    const res = await fetch("/api/inspect-privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    renderPrivacyResult(data);
  } catch (err) {
    console.error("Privacy check error:", err);
    resultBox.innerHTML = `<p style="color:#ef4444;">Inspection error occurred. Please verify your connection.</p>`;
  }
}

function renderPrivacyResult(data) {
  const resultBox = document.getElementById("phishingResultContainer");
  if (!resultBox) return;

  let contentHtml = "";

  // 1. URL Analysis View
  if (data.url_analysis) {
    const u = data.url_analysis;
    let badgeColor = "#10b981";
    if (u.risk_score >= 70) badgeColor = "#ef4444";
    else if (u.risk_score >= 35) badgeColor = "#f59e0b";

    const flagsHtml = (u.warning_flags || []).map(f => `
      <div style="background:#0f172a; border-left:3px solid #ef4444; padding:10px; margin-bottom:8px; border-radius:4px;">
        <strong style="color:#fca5a5;">${f.title} (${f.severity} Severity)</strong>
        <p style="font-size:0.85rem; color:#cbd5e1; margin-top:2px;">${f.explanation}</p>
      </div>
    `).join("");

    const recsHtml = (u.recommendations || []).map(r => `<li>${r}</li>`).join("");

    contentHtml += `
      <div style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
          <div>
            <h4 style="font-size:1.15rem; color:#f8fafc;">URL Security Assessment</h4>
            <span style="font-size:0.85rem; color:#94a3b8; word-break:break-all;">Target: ${u.url}</span>
          </div>
          <div style="background:${badgeColor}22; border:1px solid ${badgeColor}; color:${badgeColor}; padding:6px 14px; border-radius:9999px; font-weight:700; font-size:0.85rem;">
            Risk Score: ${u.risk_score}% • ${u.verdict}
          </div>
        </div>

        <h5 style="font-size:0.9rem; color:#94a3b8; margin:14px 0 8px;">WARNING SIGNS IDENTIFIED:</h5>
        ${flagsHtml || '<p style="color:#6ee7b7; font-size:0.88rem;">No obvious structural anomalies detected.</p>'}

        <h5 style="font-size:0.9rem; color:#f472b6; margin:16px 0 8px;">SAFETY RECOMMENDATIONS:</h5>
        <ul class="recs-list">${recsHtml}</ul>

        <p style="font-size:0.75rem; color:#64748b; margin-top:12px;">🛡️ ${u.safe_view_disclaimer}</p>
      </div>
    `;
  }

  // 2. Text Analysis View
  if (data.text_analysis) {
    const t = data.text_analysis;
    let badgeColor = "#10b981";
    if (t.risk_score >= 70) badgeColor = "#ef4444";
    else if (t.risk_score >= 35) badgeColor = "#f59e0b";

    const indicatorsHtml = (t.sensitive_indicators || []).map(ind => `
      <div style="background:#0f172a; border-left:3px solid #f59e0b; padding:10px; margin-bottom:8px; border-radius:4px;">
        <strong style="color:#fbbf24;">⚠️ ${ind.title}</strong>
        <p style="font-size:0.85rem; color:#cbd5e1; margin-top:2px;">
          Matched patterns: <em>"${ind.matched_snippets.join('", "')}"</em>
        </p>
      </div>
    `).join("");

    const recsHtml = (t.recommendations || []).map(r => `<li>${r}</li>`).join("");

    contentHtml += `
      <div style="margin-top:20px; padding-top:16px; border-top:1px solid #334155;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
          <h4 style="font-size:1.15rem; color:#f8fafc;">Message & Sensitive Data Inspection</h4>
          <div style="background:${badgeColor}22; border:1px solid ${badgeColor}; color:${badgeColor}; padding:6px 14px; border-radius:9999px; font-weight:700; font-size:0.85rem;">
            Risk Score: ${t.risk_score}% • ${t.verdict}
          </div>
        </div>

        <h5 style="font-size:0.9rem; color:#94a3b8; margin:14px 0 8px;">DETECTED RED FLAGS:</h5>
        ${indicatorsHtml || '<p style="color:#6ee7b7; font-size:0.88rem;">No explicit OTP, PIN, or credential harvesting phrases found.</p>'}

        <h5 style="font-size:0.9rem; color:#f472b6; margin:16px 0 8px;">SAFETY ADVICE:</h5>
        <ul class="recs-list">${recsHtml}</ul>

        <div class="disclaimer-banner" style="margin-top:14px;">
          <span>ℹ️</span>
          <span>${t.disclaimer}</span>
        </div>
      </div>
    `;
  }

  resultBox.innerHTML = contentHtml;
  resultBox.scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", initPhishingChecker);
