/**
 * Nirbhaya - Threat & Harassment Analyzer Module
 * Tagline: A World Without Fear
 * Connects frontend UI to machine learning classification & explainability engine.
 */

function initThreatAnalyzer() {
  const analyzeBtn = document.getElementById("analyzeThreatBtn");
  const clearBtn = document.getElementById("clearThreatBtn");
  const inputElem = document.getElementById("threatInputText");

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", runThreatAnalysis);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (inputElem) inputElem.value = "";
      const resultContainer = document.getElementById("threatResultContainer");
      if (resultContainer) resultContainer.style.display = "none";
    });
  }

  // Bind Sample Chips
  document.querySelectorAll(".threat-sample-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const text = chip.getAttribute("data-sample");
      if (inputElem && text) {
        inputElem.value = text;
        runThreatAnalysis();
      }
    });
  });
}

async function runThreatAnalysis() {
  const inputElem = document.getElementById("threatInputText");
  const text = inputElem?.value.trim();
  const resultContainer = document.getElementById("threatResultContainer");

  if (!text) {
    alert("Please enter or paste a suspicious message to analyze.");
    return;
  }

  // Show loading spinner/state
  const analyzeBtn = document.getElementById("analyzeThreatBtn");
  const originalBtnText = analyzeBtn.innerHTML;
  analyzeBtn.innerHTML = `<span>⏳ Analyzing with AI...</span>`;
  analyzeBtn.disabled = true;

  try {
    const res = await fetch("/api/analyze-threat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    renderThreatResult(data, text);
  } catch (err) {
    console.error("Threat analysis error:", err);
    alert("Error communicating with AI service. Please try again.");
  } finally {
    analyzeBtn.innerHTML = originalBtnText;
    analyzeBtn.disabled = false;
  }
}

function renderThreatResult(data, originalText) {
  const container = document.getElementById("threatResultContainer");
  if (!container) return;

  // Determine badge styling
  let badgeClass = "safe";
  if (data.risk_score >= 70) badgeClass = "danger";
  else if (data.risk_score >= 35) badgeClass = "warning";

  // Build pattern tags
  let patternTagsHtml = "";
  if (data.detected_patterns && data.detected_patterns.length > 0) {
    patternTagsHtml = data.detected_patterns.map(p => `
      <span class="warning-pattern-pill">
        ⚠️ ${p.type}: "${p.match}"
      </span>
    `).join("");
  } else {
    patternTagsHtml = `<span style="color:#94a3b8; font-size:0.85rem;">No explicit threat keywords flagged.</span>`;
  }

  // Highlight terms in original text
  let highlightedText = escapeHtml(originalText);
  if (data.highlighted_terms && data.highlighted_terms.length > 0) {
    // Sort by longest first to avoid partial replacements
    const sortedTerms = [...data.highlighted_terms].sort((a, b) => b.length - a.length);
    sortedTerms.forEach(term => {
      const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
      highlightedText = highlightedText.replace(regex, `<mark class="hl-danger">$1</mark>`);
    });
  }

  // Build Recommendations list
  const recsHtml = (data.recommendations || []).map(r => `
    <li>${r}</li>
  `).join("");

  // Build ML Probabilities view
  const probEntries = Object.entries(data.analysis_details?.all_probabilities || {})
    .map(([k, v]) => `<span style="margin-right:12px;"><strong>${k.toUpperCase()}:</strong> ${v}%</span>`)
    .join("");

  container.innerHTML = `
    <div class="score-gauge-container">
      <div class="score-badge-circle ${badgeClass}">
        <span>${data.risk_score}%</span>
        <span style="font-size:0.6rem; text-transform:uppercase;">Risk</span>
      </div>
      <div class="score-details">
        <h4>${data.category_label}</h4>
        <p><strong>Assessment:</strong> ${data.risk_level}</p>
        <p style="margin-top:4px; font-size:0.85rem; color:#cbd5e1;">${data.summary}</p>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <h5 style="font-size:0.88rem; color:#94a3b8; margin-bottom:6px;">DETECTED LANGUAGE PATTERNS:</h5>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${patternTagsHtml}
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <h5 style="font-size:0.88rem; color:#94a3b8; margin-bottom:6px;">KEYWORD & CONTEXT HIGHLIGHTS:</h5>
      <div class="highlight-box">
        ${highlightedText}
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <h5 style="font-size:0.88rem; color:#f472b6; margin-bottom:6px;">RECOMMENDED SAFETY ACTIONS:</h5>
      <ul class="recs-list">
        ${recsHtml}
      </ul>
    </div>

    <!-- AI & Rule Transparency Card -->
    <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:12px; margin-top:16px; font-size:0.82rem; color:#94a3b8;">
      <strong style="color:#c084fc;">AI & Heuristic Processing Breakdown:</strong><br>
      • Architecture: ${data.analysis_details?.processing_type}<br>
      • ML Pipeline Confidence: ${data.analysis_details?.ml_confidence}%<br>
      • Model Class Distribution: ${probEntries}<br>
      • Safety Rule Overrides: ${data.analysis_details?.rule_overrides_applied ? "Active (High-Severity Safe Fallback)" : "None (ML Concurred)"}
    </div>

    <div class="disclaimer-banner">
      <span>ℹ️</span>
      <span>${data.disclaimer}</span>
    </div>
  `;

  container.style.display = "block";
  container.scrollIntoView({ behavior: "smooth" });
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

document.addEventListener("DOMContentLoaded", initThreatAnalyzer);
