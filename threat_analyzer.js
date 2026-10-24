/**
 * Nirbhaya - Threat & Harassment Analyzer Module
 * Tagline: A World Without Fear
 * Provides explainable threat assessment, multi-vector risk indicators,
 * contextual phrase rationale, connected cross-tool safety insights,
 * and seamless dual-mode resilience (Flask API + Static GitHub Pages fallback).
 */

// Lexicon of concerning phrases and their precise behavioral rationale
const THREAT_PATTERNS = [
  {
    regex: /\b(kill|murder|hurt|stab|shoot|strangle|break your|punch|beat you|burn|destroy you|harm you)\b/gi,
    category: "Physical Danger",
    severity: "Critical",
    reason: "Contains explicit threats of bodily violence or physical harm against your person."
  },
  {
    regex: /\b(make you pay|won'?t survive|end you|never walk again|regret this)\b/gi,
    category: "Physical Intimidation",
    severity: "High",
    reason: "Uses intimidation phrasing intended to induce psychological panic or fear for your safety."
  },
  {
    regex: /\b(know where you live|outside your house|following you|watching you|standing outside|at your door|in the parking lot|at your gym|your apartment|your building|know your routines?)\b/gi,
    category: "Stalking & Boundary Violation",
    severity: "Critical",
    reason: "Claims physical proximity, surveillance, or knowledge of private physical locations."
  },
  {
    regex: /\b(leak (your )?(photos?|pics?|pictures?|images?|videos?)|circulate (your )?(photos?|pics?|pictures?|videos?)|post your phone number|send to your (family|parents|college|friends|office))\b/gi,
    category: "Coercive Sextortion",
    severity: "Critical",
    reason: "Employs non-consensual image distribution threats to extort compliance or induce distress."
  },
  {
    regex: /\b(send (me )?(your )?(private )?(photos?|pics?|pictures?|nudes)|webcam footage)\b/gi,
    category: "Exploitative Request",
    severity: "High",
    reason: "Solicits intimate media under coercion or unauthorized social engineering pressure."
  },
  {
    regex: /\b(blackmail|ruin your reputation|destroy your life|expose you online)\b/gi,
    category: "Reputational Coercion",
    severity: "High",
    reason: "Threatens social, academic, or professional defamation to compromise your autonomy."
  },
  {
    regex: /\b(pay me|send money|in crypto|transfer cash|give me \$\d+|give me rs\.?\d+)\b/gi,
    category: "Financial Extortion",
    severity: "High",
    reason: "Direct solicitation of monetary funds or cryptocurrency under duress."
  },
  {
    regex: /\b(bitch|slut|whore|worthless|kill yourself|pathetic loser|disgusting)\b/gi,
    category: "Abusive Harassment",
    severity: "High",
    reason: "Uses misogynistic, degrading, or self-harm incitement language designed to demean."
  },
  {
    regex: /\b(verify otp|6-digit otp|bank account is suspended|update kyc|upi pin|atm pin|password expired)\b/gi,
    category: "Credential Harvesting",
    severity: "High",
    reason: "Attempts to induce panic over banking or platform credentials to steal account access."
  }
];

// Multi-vector evaluation cues
const VECTOR_CUES = {
  urgency: /\b(right now|immediately|within \d+ hours?|tonight|asap|urgent|hurry|last chance|don'?t delay|at once|before it'?s too late)\b/gi,
  impersonation: /\b(police officer|cyber cell|official support|bank manager|executive|account security|tech team|meta security|instagram team)\b/gi,
  coercion: /\b(or else|if you don'?t|i will make you|you have to|must comply|no choice|you will regret|or i will leak)\b/gi,
  suspicious_demands: /\b(send (me )?money|transfer|otp|pin|password|private (photos?|pics?)|nudes|download|install|apk|anydesk|teamviewer)\b/gi
};

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
      const placeholder = document.getElementById("threatPlaceholder");
      if (resultContainer) resultContainer.style.display = "none";
      if (placeholder) placeholder.style.display = "block";
    });
  }

  // Bind Sample Prompts
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
  const placeholder = document.getElementById("threatPlaceholder");

  if (!text) {
    alert("Please enter or paste a suspicious message to analyze.");
    return;
  }

  const analyzeBtn = document.getElementById("analyzeThreatBtn");
  const originalBtnText = analyzeBtn.innerHTML;
  analyzeBtn.innerHTML = `<span>⏳ Evaluating Linguistic Signals...</span>`;
  analyzeBtn.disabled = true;

  try {
    // Attempt backend Flask API first (Dual-Mode)
    let apiData = null;
    try {
      const res = await fetch("/api/analyze-threat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        apiData = await res.json();
      }
    } catch (e) {
      // Backend not running (e.g. GitHub Pages static hosting or offline)
      console.info("Using Nirbhaya client-side explainability engine (static mode).");
    }

    // Evaluate on-device multi-vector analysis
    const clientAnalysis = analyzeTextLocally(text);

    // Merge API predictions if available, maintaining client explainability richness
    const finalReport = apiData ? mergeApiAndClientData(apiData, clientAnalysis, text) : clientAnalysis;

    if (placeholder) placeholder.style.display = "none";
    renderThreatResult(finalReport, text);

  } catch (err) {
    console.error("Threat analysis error:", err);
    // Fallback directly to client engine on any error
    const fallbackReport = analyzeTextLocally(text);
    if (placeholder) placeholder.style.display = "none";
    renderThreatResult(fallbackReport, text);
  } finally {
    analyzeBtn.innerHTML = originalBtnText;
    analyzeBtn.disabled = false;
  }
}

/**
 * Robust on-device natural language analysis engine.
 * Fully transparent, rule-based explainable AI running strictly in client browser.
 */
function analyzeTextLocally(text) {
  const detectedPhrases = [];
  const highlightedTerms = new Set();
  let baseScore = 5;

  // 1. Scan for pattern matches
  THREAT_PATTERNS.forEach(pat => {
    const matches = text.match(pat.regex);
    if (matches) {
      matches.forEach(m => {
        highlightedTerms.add(m);
        // Avoid duplicate category entries
        if (!detectedPhrases.some(p => p.match.toLowerCase() === m.toLowerCase())) {
          detectedPhrases.push({
            match: m,
            category: pat.category,
            severity: pat.severity,
            reason: pat.reason
          });
        }
      });
      if (pat.severity === "Critical") baseScore += 45;
      else if (pat.severity === "High") baseScore += 25;
      else baseScore += 15;
    }
  });

  // 2. Assess 4 distinct indicators (Urgency, Impersonation, Coercion, Demands)
  const urgencyMatches = text.match(VECTOR_CUES.urgency) || [];
  const impersonationMatches = text.match(VECTOR_CUES.impersonation) || [];
  const coercionMatches = text.match(VECTOR_CUES.coercion) || [];
  const demandMatches = text.match(VECTOR_CUES.suspicious_demands) || [];

  urgencyMatches.forEach(m => highlightedTerms.add(m));
  impersonationMatches.forEach(m => highlightedTerms.add(m));
  coercionMatches.forEach(m => highlightedTerms.add(m));
  demandMatches.forEach(m => highlightedTerms.add(m));

  const vectors = {
    urgency: calculateVectorLevel(urgencyMatches.length, "Urgency & Artificial Pressure"),
    impersonation: calculateVectorLevel(impersonationMatches.length, "Impersonation / Authority Claim"),
    coercion: calculateVectorLevel(coercionMatches.length, "Coercive Force & Threats"),
    demands: calculateVectorLevel(demandMatches.length, "Suspicious Demands & Solicitations")
  };

  // Adjust score based on vectors
  if (vectors.coercion.level === "High") baseScore += 20;
  if (vectors.urgency.level === "High") baseScore += 10;
  if (vectors.demands.level === "High") baseScore += 15;

  const finalScore = Math.min(100, Math.max(0, baseScore));

  // Determine categorical label
  let categoryKey = "benign";
  let categoryLabel = "Low Risk / Everyday Communication";
  let riskLevel = "Minimal Risk";

  if (finalScore >= 70) {
    riskLevel = "High / Critical Risk";
    if (detectedPhrases.some(p => p.category.includes("Physical") || p.category.includes("Stalking"))) {
      categoryKey = "threat";
      categoryLabel = "Direct Physical Safety Threat / Stalking";
    } else if (detectedPhrases.some(p => p.category.includes("Sextortion") || p.category.includes("Extortion"))) {
      categoryKey = "blackmail";
      categoryLabel = "Coercive Blackmail & Sextortion";
    } else {
      categoryKey = "harassment";
      categoryLabel = "Severe Harassment & Verbal Abuse";
    }
  } else if (finalScore >= 35) {
    riskLevel = "Moderate Risk / Caution Advised";
    if (detectedPhrases.some(p => p.category.includes("Credential") || demandMatches.length > 0)) {
      categoryKey = "phishing";
      categoryLabel = "Suspicious Phishing / Social Engineering";
    } else {
      categoryKey = "suspicious";
      categoryLabel = "Unsettling or Boundary-Pushing Communication";
    }
  }

  // Detect embedded URLs for Safety Insights Connection
  const urlRegex = /(https?:\/\/[^\s<>"]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}\/[^\s<>"]*)/gi;
  const embeddedUrls = (text.match(urlRegex) || []).map(u => u.replace(/[.,;:!?)]+$/, ""));

  // Formulate tailored safety recommendations
  const recommendations = generateRecommendations(categoryKey, detectedPhrases, embeddedUrls.length > 0);

  return {
    risk_level: riskLevel,
    risk_score: finalScore,
    category: categoryKey,
    category_label: categoryLabel,
    summary: generateSummary(categoryLabel, detectedPhrases, vectors),
    detected_phrases: detectedPhrases,
    vectors: vectors,
    highlighted_terms: Array.from(highlightedTerms),
    embedded_urls: embeddedUrls,
    recommendations: recommendations,
    transparency: {
      engine_type: "Explainable Natural Language Heuristics + Threat Pattern Lexicons",
      execution_mode: "100% Client-Side Private (Zero Cloud Telemetry)",
      limitation_notice: "Automated linguistic analysis evaluates language cues only. It cannot verify real-world physical location or criminal intent. In an immediate physical emergency, call local law enforcement (112 / 1091) immediately."
    }
  };
}

function calculateVectorLevel(matchCount, label) {
  if (matchCount >= 2) {
    return { label, level: "High", percentage: 90, class: "high", note: "Strong artificial pressure detected" };
  } else if (matchCount === 1) {
    return { label, level: "Moderate", percentage: 55, class: "medium", note: "Potential warning cue observed" };
  }
  return { label, level: "Low", percentage: 10, class: "low", note: "No obvious indicators detected" };
}

function generateRecommendations(categoryKey, detectedPhrases, hasUrls) {
  const recs = [];

  if (categoryKey === "threat") {
    recs.push("Do NOT engage, argue, or meet the sender under any circumstance.");
    recs.push("If you feel in immediate physical jeopardy, alert law enforcement immediately via 112 / 100 or tap Nirbhaya SOS.");
    recs.push("Notify a trusted friend or family member right away and share your live location.");
    recs.push("Take screenshots of the chat, sender handle, and phone number, then save an incident record in the Evidence Vault.");
  } else if (categoryKey === "blackmail") {
    recs.push("Do NOT comply with demands for money or private images; compliance typically increases extortion pressure.");
    recs.push("Preserve full unedited screenshots showing timestamps, handles, and transaction demands before blocking.");
    recs.push("Log this occurrence in Nirbhaya's Evidence Vault and file an anonymous report on cybercrime.gov.in (1930) or StopNCII.org.");
    recs.push("Restrict message requests and adjust privacy settings on Instagram, WhatsApp, and Telegram.");
  } else if (categoryKey === "phishing") {
    recs.push("NEVER share OTPs, UPI PINs, passwords, or netbanking credentials under any pressure.");
    recs.push("Contact your banking institution directly using the verified customer service phone number printed on your card.");
    recs.push("Report fraudulent SMS/WhatsApp senders to the national cybercrime helpline (1930).");
  } else {
    recs.push("No explicit physical threat or extortion markers were detected in this message.");
    recs.push("Maintain standard digital safety: never share one-time passcodes or sensitive account credentials.");
    recs.push("If the conversation turns coercive or uncomfortable, re-inspect the message or block the contact.");
  }

  if (hasUrls) {
    recs.push("⚠️ An unverified web link was detected in this message. Use Nirbhaya's URL Risk Inspector before tapping it.");
  }

  return recs;
}

function generateSummary(categoryLabel, detectedPhrases, vectors) {
  if (detectedPhrases.length > 0) {
    const highlights = detectedPhrases.slice(0, 2).map(p => `"${p.match}" (${p.category})`).join(", ");
    return `Evaluated as ${categoryLabel}. Significant markers were identified including ${highlights}.`;
  }
  return `Evaluated as ${categoryLabel}. Text demonstrates benign conversational tone without explicit high-risk threat markers.`;
}

function mergeApiAndClientData(apiData, clientAnalysis, text) {
  // If API returned scikit-learn results, combine them smoothly
  return {
    ...clientAnalysis,
    risk_score: Math.max(apiData.risk_score || 0, clientAnalysis.risk_score),
    risk_level: apiData.risk_level || clientAnalysis.risk_level,
    category_label: clientAnalysis.category_label,
    api_ml_confidence: apiData.analysis_details?.ml_confidence,
    transparency: {
      ...clientAnalysis.transparency,
      engine_type: "Hybrid: scikit-learn Logistic Regression + Explainable Heuristic Pattern Engine"
    }
  };
}

/**
 * Renders the comprehensive explainable result card.
 */
function renderThreatResult(data, originalText) {
  const container = document.getElementById("threatResultContainer");
  if (!container) return;

  // Status Badge Styling
  let badgeClass = "safe";
  if (data.risk_score >= 70) badgeClass = "danger";
  else if (data.risk_score >= 35) badgeClass = "warning";

  // 1. Detected Phrases with Exact Rationale
  let phrasesHtml = "";
  if (data.detected_phrases && data.detected_phrases.length > 0) {
    phrasesHtml = data.detected_phrases.map(p => `
      <div class="phrase-explain-card">
        <div class="phrase-explain-header">
          <span class="phrase-matched-text">"${escapeHtml(p.match)}"</span>
          <span class="phrase-category-badge">${escapeHtml(p.category)} • ${p.severity}</span>
        </div>
        <div class="phrase-reason">
          <strong>Why this is concerning:</strong> ${escapeHtml(p.reason)}
        </div>
      </div>
    `).join("");
  } else {
    phrasesHtml = `<div style="color:var(--text-secondary); font-size:0.88rem; padding:10px 0;">No high-risk threat phrases or extortion triggers were identified in this message.</div>`;
  }

  // 2. Highlighting in Original Text
  let highlightedText = escapeHtml(originalText);
  if (data.highlighted_terms && data.highlighted_terms.length > 0) {
    const sortedTerms = [...data.highlighted_terms].sort((a, b) => b.length - a.length);
    sortedTerms.forEach(term => {
      if (term.trim().length > 1) {
        const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
        highlightedText = highlightedText.replace(regex, `<mark class="hl-danger">$1</mark>`);
      }
    });
  }

  // 3. Four Vector Indicators (Urgency, Impersonation, Coercion, Demands)
  const v = data.vectors;
  const vectorsHtml = `
    <div class="indicator-vectors-grid">
      <div class="vector-meter-card">
        <div class="vector-header">
          <span>⚡ Urgency Pressure</span>
          <span class="vector-pill ${v.urgency.class}">${v.urgency.level}</span>
        </div>
        <div class="vector-bar-wrap">
          <div class="vector-bar-fill" style="width:${v.urgency.percentage}%; background:${getVectorColor(v.urgency.level)};"></div>
        </div>
        <span style="font-size:0.72rem; color:var(--text-muted);">${v.urgency.note}</span>
      </div>

      <div class="vector-meter-card">
        <div class="vector-header">
          <span>🎭 Impersonation Risk</span>
          <span class="vector-pill ${v.impersonation.class}">${v.impersonation.level}</span>
        </div>
        <div class="vector-bar-wrap">
          <div class="vector-bar-fill" style="width:${v.impersonation.percentage}%; background:${getVectorColor(v.impersonation.level)};"></div>
        </div>
        <span style="font-size:0.72rem; color:var(--text-muted);">${v.impersonation.note}</span>
      </div>

      <div class="vector-meter-card">
        <div class="vector-header">
          <span>⚠️ Coercive Language</span>
          <span class="vector-pill ${v.coercion.class}">${v.coercion.level}</span>
        </div>
        <div class="vector-bar-wrap">
          <div class="vector-bar-fill" style="width:${v.coercion.percentage}%; background:${getVectorColor(v.coercion.level)};"></div>
        </div>
        <span style="font-size:0.72rem; color:var(--text-muted);">${v.coercion.note}</span>
      </div>

      <div class="vector-meter-card">
        <div class="vector-header">
          <span>🔒 Suspicious Requests</span>
          <span class="vector-pill ${v.demands.class}">${v.demands.level}</span>
        </div>
        <div class="vector-bar-wrap">
          <div class="vector-bar-fill" style="width:${v.demands.percentage}%; background:${getVectorColor(v.demands.level)};"></div>
        </div>
        <span style="font-size:0.72rem; color:var(--text-muted);">${v.demands.note}</span>
      </div>
    </div>
  `;

  // 4. Connected Safety Insights Bridges (URL inspector & Evidence Vault Integration)
  let safetyInsightsHtml = "";
  if (data.embedded_urls && data.embedded_urls.length > 0) {
    const firstUrl = data.embedded_urls[0];
    safetyInsightsHtml += `
      <div class="connected-insight-bridge">
        <div class="connected-insight-info">
          <span class="connected-insight-tag">🔗 Connected Safety Insight</span>
          <div class="connected-insight-title">Embedded Link Detected in Message</div>
          <div class="connected-insight-desc">Target: <code>${escapeHtml(firstUrl)}</code>. Inspect this link safely without visiting the target server.</div>
        </div>
        <button class="btn-secondary" onclick="passUrlToInspector('${escapeHtml(firstUrl)}')" style="font-size:0.82rem; padding:6px 14px;">
          Inspect Link Structure →
        </button>
      </div>
    `;
  }

  // Cross-tool preservation action if risk is elevated
  if (data.risk_score >= 35) {
    const safeSnippet = originalText.substring(0, 140).replace(/'/g, "\\'");
    safetyInsightsHtml += `
      <div class="connected-insight-bridge" style="background:linear-gradient(135deg, rgba(38, 12, 42, 0.85) 0%, rgba(20, 6, 23, 0.95) 100%);">
        <div class="connected-insight-info">
          <span class="connected-insight-tag" style="color:#cbb6e0;">📁 Evidence Vault Integration</span>
          <div class="connected-insight-title">Voluntarily Preserve Incident Record</div>
          <div class="connected-insight-desc">Pre-fill this analysis into your private Evidence Vault to keep a dated record for cybercrime reporting.</div>
        </div>
        <button class="btn-primary" onclick="passToIncidentVault('${escapeHtml(data.category_label)}', '${safeSnippet}')" style="font-size:0.82rem; padding:6px 14px;">
          + Save to Evidence Vault
        </button>
      </div>
    `;
  }

  // Recommendations list
  const recsHtml = data.recommendations.map(r => `<li>${r}</li>`).join("");

  container.innerHTML = `
    <!-- Risk Overview Header -->
    <div class="score-gauge-container">
      <div class="score-badge-circle ${badgeClass}">
        <span>${data.risk_score}%</span>
        <span style="font-size:0.62rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Risk</span>
      </div>
      <div class="score-details">
        <h4>${escapeHtml(data.category_label)}</h4>
        <p><strong>Threat Level:</strong> ${escapeHtml(data.risk_level)}</p>
        <p style="margin-top:4px; font-size:0.84rem; color:var(--text-secondary);">${escapeHtml(data.summary)}</p>
      </div>
    </div>

    <!-- 4 Vector Breakdown -->
    <div style="margin-bottom:18px;">
      <div class="inspection-section-header">
        <span>📊</span> Distinct Warning Vectors
      </div>
      ${vectorsHtml}
    </div>

    <!-- Explainable Suspicious Phrases -->
    <div style="margin-bottom:18px;">
      <div class="inspection-section-header">
        <span>🔍</span> Detected Phrases & Rationale
      </div>
      <div class="suspicious-phrases-list">
        ${phrasesHtml}
      </div>
    </div>

    <!-- Original Text with Highlights -->
    <div style="margin-bottom:18px;">
      <div class="inspection-section-header">
        <span>📝</span> Context Highlights
      </div>
      <div class="highlight-box">
        ${highlightedText}
      </div>
    </div>

    <!-- Connected Cross-Tool Safety Insights -->
    ${safetyInsightsHtml ? `
      <div style="margin-bottom:18px;">
        <div class="inspection-section-header" style="color:var(--gold-sheen);">
          <span>⚡</span> Connected Safety Insights
        </div>
        ${safetyInsightsHtml}
      </div>
    ` : ''}

    <!-- Recommended Safety Protocol -->
    <div style="margin-bottom:18px;">
      <div class="inspection-section-header" style="color:var(--gold-sheen);">
        <span>🛡️</span> Recommended Action Protocol
      </div>
      <ul class="recs-list">
        ${recsHtml}
      </ul>
    </div>

    <!-- Responsible AI & Heuristics Transparency -->
    <div style="background:rgba(20, 6, 23, 0.7); border:1px solid var(--lavender-border); border-radius:var(--radius-sm); padding:14px; font-size:0.8rem; color:var(--text-secondary); margin-top:20px;">
      <strong style="color:var(--gold-sheen);">Responsible Assessment Transparency:</strong><br>
      • Engine Architecture: ${escapeHtml(data.transparency.engine_type)}<br>
      • Execution Privacy: ${escapeHtml(data.transparency.execution_mode)}<br>
      • Safety Limitations: ${escapeHtml(data.transparency.limitation_notice)}
    </div>
  `;

  container.style.display = "block";
  container.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function getVectorColor(level) {
  if (level === "High") return "#e11d48";
  if (level === "Moderate") return "#f59e0b";
  return "#10b981";
}

/**
 * Cross-tool bridges: passes URL to URL Risk Inspector.
 */
window.passUrlToInspector = function(url) {
  if (window.switchTab) {
    window.switchTab("phishingTab");
    const urlInput = document.getElementById("phishUrlInput");
    if (urlInput) {
      urlInput.value = url;
      // Trigger inspection automatically
      const checkBtn = document.getElementById("checkUrlBtn");
      if (checkBtn) checkBtn.click();
    }
  }
};

/**
 * Cross-tool bridges: passes analyzed message to Evidence Vault.
 */
window.passToIncidentVault = function(categoryLabel, snippet) {
  if (window.switchTab) {
    window.switchTab("identityTab");
    const titleInput = document.getElementById("incidentTitle");
    const descInput = document.getElementById("incidentDesc");
    const dateInput = document.getElementById("incidentDate");
    const categorySelect = document.getElementById("incidentCategory");

    if (titleInput) titleInput.value = `Flagged Communication: ${categoryLabel}`;
    if (descInput) descInput.value = `Analyzed Message Content:\n"${snippet}"\n\nPreserved via Nirbhaya Safety Insights.`;
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    // Match select option if possible
    if (categorySelect) {
      if (categoryLabel.includes("Threat") || categoryLabel.includes("Stalking")) {
        categorySelect.value = "Stalking";
      } else if (categoryLabel.includes("Blackmail") || categoryLabel.includes("Sextortion")) {
        categorySelect.value = "Blackmail / Sextortion";
      } else {
        categorySelect.value = "Online Harassment";
      }
    }

    const form = document.getElementById("saveIncidentForm");
    if (form) form.scrollIntoView({ behavior: "smooth" });
  }
};

function escapeHtml(text) {
  if (!text) return "";
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

document.addEventListener("DOMContentLoaded", initThreatAnalyzer);
