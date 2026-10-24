/**
 * Nirbhaya - Digital Privacy & URL Risk Inspector Module
 * Tagline: A World Without Fear
 * Provides structural URL safety inspection, deceptive lookalike detection,
 * transparent disclosure of unperformed checks, scam message analysis,
 * and dual-mode resilience (Flask API + Static GitHub Pages fallback).
 */

// Known URL shortener domains
const KNOWN_SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "goo.gl",
  "ow.ly", "buff.ly", "rebrand.ly", "shorte.st", "bl.ink"
]);

// Suspicious Top-Level Domains frequently abused in phishing campaigns
const SUSPICIOUS_TLDS = new Set([
  "xyz", "top", "buzz", "tk", "ml", "ga", "cf", "gq", "work", "date",
  "click", "link", "party", "review", "country", "kim", "science", "cricket"
]);

// Common brands targeted for typosquatting / lookalikes
const TARGET_BRANDS = [
  "google", "gmail", "instagram", "facebook", "whatsapp", "apple", "netflix",
  "amazon", "paypal", "microsoft", "sbi", "hdfc", "icici", "paytm", "phonepe"
];

// Homoglyph lookalike character mappings
const HOMOGLYPH_SUBSTITUTIONS = {
  '1': 'l', '0': 'o', '5': 's', '8': 'b', 'vv': 'w', 'rn': 'm'
};

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

  resultBox.innerHTML = `
    <div style="text-align:center; padding:32px 20px; color:var(--text-secondary);">
      <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
      <strong>Inspecting structural security signals safely...</strong>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">No web requests are sent to the target destination.</p>
    </div>
  `;
  resultBox.style.display = "block";

  try {
    let apiData = null;
    try {
      const res = await fetch("/api/inspect-privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        apiData = await res.json();
      }
    } catch (e) {
      console.info("Using Nirbhaya client-side URL inspector (static mode).");
    }

    // Run client-side structural inspection
    let finalData = {};
    if (payload.url) {
      finalData.url_analysis = inspectUrlClientSide(payload.url);
      if (apiData?.url_analysis) {
        finalData.url_analysis = mergeUrlAnalysis(apiData.url_analysis, finalData.url_analysis);
      }
    }
    if (payload.text) {
      finalData.text_analysis = inspectTextClientSide(payload.text);
      if (apiData?.text_analysis) {
        finalData.text_analysis = { ...finalData.text_analysis, ...apiData.text_analysis };
      }
    }

    renderPrivacyResult(finalData);

  } catch (err) {
    console.error("Privacy check error:", err);
    // Safe client-side fallback
    const fallbackData = {};
    if (payload.url) fallbackData.url_analysis = inspectUrlClientSide(payload.url);
    if (payload.text) fallbackData.text_analysis = inspectTextClientSide(payload.text);
    renderPrivacyResult(fallbackData);
  }
}

/**
 * On-device client-side URL parser and security inspector.
 */
function inspectUrlClientSide(rawUrl) {
  rawUrl = rawUrl.trim();
  let target = rawUrl;
  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    target = "https://" + rawUrl;
  }

  let parsed = null;
  try {
    parsed = new URL(target);
  } catch (e) {
    return {
      url: rawUrl,
      parsed_hostname: "malformed",
      verdict: "Malformed / Invalid URL Structure",
      verdict_badge: "danger",
      risk_score: 65,
      warning_flags: [{
        title: "Invalid URL Syntax",
        severity: "High",
        explanation: "The link cannot be parsed as a standard web URI. Scammers often use malformed characters to bypass scanners."
      }],
      lookalike_indicators: [],
      subdomain_indicators: [],
      positive_signals: [],
      unperformed_checks: getStandardUnperformedChecks(),
      recommendations: ["Do not attempt to load or open malformed links."]
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.replace(":", "").toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const parts = hostname.split(".");
  const tld = parts[parts.length - 1];

  const warningFlags = [];
  const lookalikeIndicators = [];
  const subdomainIndicators = [];
  const positiveSignals = [];
  let riskScore = 0;

  // 1. Protocol check
  if (protocol === "http") {
    warningFlags.push({
      title: "Insecure Protocol (Unencrypted HTTP)",
      severity: "Medium",
      explanation: "HTTP does not encrypt connection data. Passwords, PINs, or credentials can be intercepted in transit."
    });
    riskScore += 25;
  } else if (protocol === "https") {
    positiveSignals.push("Uses encrypted transport (HTTPS), though attackers can also register free SSL certificates.");
  }

  // 2. Raw IP address check
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipRegex.test(hostname)) {
    warningFlags.push({
      title: "Direct IP Address Hostname",
      severity: "High",
      explanation: `Points directly to a numerical IP address (${hostname}) rather than a legitimate domain. Standard services virtually never do this.`
    });
    riskScore += 45;
  }

  // 3. Known URL shortener
  if (KNOWN_SHORTENERS.has(hostname)) {
    warningFlags.push({
      title: "URL Shortener Masking Target",
      severity: "Medium",
      explanation: `Uses a redirect shortening service (${hostname}) that conceals the true landing page destination.`
    });
    riskScore += 30;
  }

  // 4. Suspicious TLD
  if (SUSPICIOUS_TLDS.has(tld)) {
    warningFlags.push({
      title: `Suspicious Top-Level Domain (.${tld})`,
      severity: "Medium",
      explanation: `The domain uses a TLD ('.${tld}') with disproportionately high abuse rates in malicious campaigns.`
    });
    riskScore += 30;
  }

  // 5. Lookalike & Brand Homoglyphs
  TARGET_BRANDS.forEach(brand => {
    // Check homoglyph variations like paypa1
    let normalizedHost = hostname;
    for (const [sub, orig] of Object.entries(HOMOGLYPH_SUBSTITUTIONS)) {
      normalizedHost = normalizedHost.split(sub).join(orig);
    }

    if (normalizedHost.includes(brand) && !hostname.includes(brand)) {
      lookalikeIndicators.push({
        title: `Lookalike Typosquatting of "${brand}"`,
        severity: "Critical",
        explanation: `The hostname appears to spoof '${brand}' using substitute characters (e.g. number 1 for letter l).`
      });
      riskScore += 40;
    }
  });

  // 6. Subdomain Spoofing
  TARGET_BRANDS.forEach(brand => {
    // If brand appears in subdomains but root domain is different
    const mainDomain = parts.slice(-2).join(".");
    if (hostname.includes(brand) && !mainDomain.startsWith(brand)) {
      subdomainIndicators.push({
        title: `Deceptive Brand Placement in Subdomain`,
        severity: "High",
        explanation: `The trusted brand name '${brand}' is placed in a prefix/subdomain, but the actual owning root domain is '${mainDomain}'.`
      });
      riskScore += 35;
    }
  });

  // 7. Structural anomalies (@ symbol, excessive dots)
  if (rawUrl.includes("@")) {
    subdomainIndicators.push({
      title: "Embedded Credentials / Deceptive UserInfo (@)",
      severity: "Critical",
      explanation: "Contains an '@' symbol in the URI structure, which browsers parse as credentials while ignoring preceding text."
    });
    riskScore += 50;
  }

  if (parts.length > 4) {
    subdomainIndicators.push({
      title: "Excessive Subdomain Depth",
      severity: "Medium",
      explanation: `Hostname contains ${parts.length} domain levels, frequently used in dynamic phishing infrastructure.`
    });
    riskScore += 20;
  }

  // 8. Suspicious path keywords
  if (/(verify|login|signin|update-kyc|otp|banking|password-reset)/i.test(pathname)) {
    warningFlags.push({
      title: "Credential Harvesting Path Keywords",
      severity: "Medium",
      explanation: `Path ('${pathname}') contains authentication-sensitive terms frequently simulated in phishing campaigns.`
    });
    riskScore += 20;
  }

  riskScore = Math.min(100, riskScore);

  // Determine truthful verdict
  let verdict = "Inconclusive / No High-Risk Structural Signals Detected (Not Guaranteed Safe)";
  let verdictBadge = "safe";

  if (riskScore >= 70) {
    verdict = "High Risk / Deceptive Structural Indicators Found";
    verdictBadge = "danger";
  } else if (riskScore >= 35) {
    verdict = "Suspicious / Potential Spoofing Cues Detected";
    verdictBadge = "warning";
  }

  const recommendations = [
    "Never enter passwords, OTP codes, or payment cards on unfamiliar web links.",
    "If this message claims to represent a service you use (bank, social app, courier), open their official app or website directly instead of tapping links.",
    "Carefully inspect the full browser URL bar before logging in on any page."
  ];

  if (riskScore >= 50) {
    recommendations.unshift("⚠️ DO NOT TAP OR VISIT THIS LINK. Delete or report the message.");
  }

  return {
    url: rawUrl,
    parsed_hostname: hostname,
    protocol: protocol,
    verdict: verdict,
    verdict_badge: verdictBadge,
    risk_score: riskScore,
    warning_flags: warningFlags,
    lookalike_indicators: lookalikeIndicators,
    subdomain_indicators: subdomainIndicators,
    positive_signals: positiveSignals,
    unperformed_checks: getStandardUnperformedChecks(),
    recommendations: recommendations,
    safe_view_disclaimer: "Nirbhaya inspects URL syntax and structure on your local device. It intentionally does not open the destination website or ping remote servers, ensuring your IP address remains hidden."
  };
}

function getStandardUnperformedChecks() {
  return [
    { title: "Live DNS Resolution", reason: "Omitted to prevent signaling your device's IP to attacker infrastructure." },
    { title: "SSL / TLS Certificate Chain", reason: "Cannot be verified statically without initiating network handshake." },
    { title: "Target Page HTML & JavaScript Execution", reason: "Deliberately skipped to shield your browser against drive-by malware." },
    { title: "External Threat Reputation Blacklists", reason: "Bypassed on static deploy to uphold total zero-tracking privacy." }
  ];
}

function mergeUrlAnalysis(apiData, clientData) {
  return {
    ...clientData,
    risk_score: Math.max(apiData.risk_score || 0, clientData.risk_score),
    warning_flags: clientData.warning_flags.length > 0 ? clientData.warning_flags : (apiData.warning_flags || [])
  };
}

/**
 * On-device client-side text privacy & scam inspector.
 */
function inspectTextClientSide(text) {
  const SENSITIVE_PATTERNS = [
    {
      regex: /\b(one[ -]?time[ -]?password|otp|verification code|security code|6[ -]?digit code)\b/gi,
      title: "Request for One-Time Password (OTP) or Verification Code",
      severity: "Critical",
      explanation: "Banks and legitimate services will NEVER call or text asking you to forward your OTP."
    },
    {
      regex: /\b(upi pin|atm pin|mpin|password|passcode|secret pin|login credentials)\b/gi,
      title: "Solicitation of PIN, MPIN, or Passwords",
      severity: "Critical",
      explanation: "A PIN is strictly for debiting funds or unlocking accounts; sharing it grants direct financial access."
    },
    {
      regex: /\b(account (is |will be )?suspended|account (is |will be )?blocked|electricity (will be )?disconnected|power cut|kyc expired|update kyc|lottery prize|tax refund)\b/gi,
      title: "Manufactured Urgency / Account Suspension Pressure",
      severity: "High",
      explanation: "Classic psychological social engineering designed to prevent you from calmly verifying the claim."
    },
    {
      regex: /\b(anydesk|teamviewer|quicksupport|rustdesk|screen share|install this app|apk file)\b/gi,
      title: "Solicitation to Install Remote Access Tools or APKs",
      severity: "Critical",
      explanation: "Installing remote access software allows attackers to mirror your screen and intercept financial SMS."
    }
  ];

  const indicators = [];
  let riskScore = 0;

  SENSITIVE_PATTERNS.forEach(pat => {
    const matches = text.match(pat.regex);
    if (matches) {
      indicators.push({
        title: pat.title,
        severity: pat.severity,
        explanation: pat.explanation,
        matched_snippets: Array.from(new Set(matches))
      });
      riskScore += pat.severity === "Critical" ? 35 : 20;
    }
  });

  riskScore = Math.min(100, riskScore);

  let verdict = "No Obvious Sensitive Credential Solicitations Detected";
  let badge = "safe";

  if (riskScore >= 70) {
    verdict = "Severe Social Engineering / Credential Harvesting Alert";
    badge = "danger";
  } else if (riskScore >= 35) {
    verdict = "Suspicious Communication / High Vigilance Required";
    badge = "warning";
  }

  const recs = [];
  if (indicators.some(i => i.title.includes("OTP"))) {
    recs.push("CRITICAL: Legitimate organizations never request you to forward OTPs.");
  }
  if (indicators.some(i => i.title.includes("Remote Access"))) {
    recs.push("CRITICAL: NEVER install AnyDesk, TeamViewer, or APK links sent by unverified contacts.");
  }
  if (indicators.some(i => i.title.includes("Urgency"))) {
    recs.push("Urgency is a psychological trap. Calmly call your bank using the phone number on your card.");
  }
  if (recs.length === 0) {
    recs.push("Always verify unfamiliar requests through established official contact numbers.");
  }

  return {
    text_provided: true,
    verdict: verdict,
    badge: badge,
    risk_score: riskScore,
    sensitive_indicators: indicators,
    recommendations: recs,
    disclaimer: "Linguistic inspection detects known deception patterns. Attackers continuously adapt, so always verify through official channels."
  };
}

/**
 * Renders the enhanced URL and message privacy assessment results.
 */
function renderPrivacyResult(data) {
  const resultBox = document.getElementById("phishingResultContainer");
  if (!resultBox) return;

  let contentHtml = "";

  // 1. URL Analysis Section
  if (data.url_analysis) {
    const u = data.url_analysis;
    let badgeColor = "#10b981";
    let badgeClass = "safe";
    if (u.risk_score >= 70) {
      badgeColor = "#ef4444";
      badgeClass = "danger";
    } else if (u.risk_score >= 35) {
      badgeColor = "#f59e0b";
      badgeClass = "warning";
    }

    // Lookalike section
    let lookalikeHtml = "";
    if (u.lookalike_indicators && u.lookalike_indicators.length > 0) {
      lookalikeHtml = u.lookalike_indicators.map(item => `
        <div style="background:rgba(225,29,72,0.12); border-left:3px solid #e11d48; padding:10px 14px; margin-bottom:8px; border-radius:0 6px 6px 0;">
          <strong style="color:#fda4af; font-size:0.9rem;">⚠️ ${escapeHtml(item.title)}</strong>
          <p style="font-size:0.84rem; color:var(--text-secondary); margin-top:2px;">${escapeHtml(item.explanation)}</p>
        </div>
      `).join("");
    }

    // Subdomain section
    let subdomainHtml = "";
    if (u.subdomain_indicators && u.subdomain_indicators.length > 0) {
      subdomainHtml = u.subdomain_indicators.map(item => `
        <div style="background:rgba(245,158,11,0.12); border-left:3px solid #f59e0b; padding:10px 14px; margin-bottom:8px; border-radius:0 6px 6px 0;">
          <strong style="color:#fde68a; font-size:0.9rem;">⚠️ ${escapeHtml(item.title)}</strong>
          <p style="font-size:0.84rem; color:var(--text-secondary); margin-top:2px;">${escapeHtml(item.explanation)}</p>
        </div>
      `).join("");
    }

    // General Warning flags
    const flagsHtml = (u.warning_flags || []).map(f => `
      <div style="background:rgba(26,7,30,0.75); border-left:3px solid #e11d48; border:1px solid var(--lavender-border); border-left-width:3px; border-left-color:#e11d48; padding:10px 14px; margin-bottom:8px; border-radius:0 6px 6px 0;">
        <strong style="color:#fca5a5; font-size:0.9rem;">${escapeHtml(f.title)} (${f.severity} Severity)</strong>
        <p style="font-size:0.84rem; color:var(--text-secondary); margin-top:2px;">${escapeHtml(f.explanation)}</p>
      </div>
    `).join("");

    // Unperformed checks list (Crucial transparency requirement)
    const unperformedHtml = (u.unperformed_checks || []).map(chk => `
      <li><strong>${escapeHtml(chk.title)}:</strong> ${escapeHtml(chk.reason)}</li>
    `).join("");

    // Recommendations
    const recsHtml = (u.recommendations || []).map(r => `<li>${r}</li>`).join("");

    contentHtml += `
      <div class="url-inspection-layout">
        <!-- Header & Verdict Banner -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding-bottom:14px; border-bottom:1px solid var(--lavender-border);">
          <div>
            <h4 style="font-size:1.3rem; color:var(--ivory-white); font-family:var(--font-serif);">URL Security Assessment</h4>
            <span style="font-size:0.85rem; color:var(--lavender-muted); word-break:break-all;">Target: <code>${escapeHtml(u.url)}</code></span>
          </div>
          <div style="background:${badgeColor}22; border:1px solid ${badgeColor}; color:${badgeColor}; padding:6px 16px; border-radius:9999px; font-weight:700; font-size:0.85rem;">
            Risk Score: ${u.risk_score}% • ${escapeHtml(u.verdict)}
          </div>
        </div>

        ${lookalikeHtml ? `
          <div>
            <div class="inspection-section-header" style="color:#fda4af;">
              <span>🕵️</span> Suspicious Lookalike & Homoglyph Patterns
            </div>
            ${lookalikeHtml}
          </div>
        ` : ''}

        ${subdomainHtml ? `
          <div>
            <div class="inspection-section-header" style="color:#fde68a;">
              <span>🌐</span> Misleading Subdomains & URL Structures
            </div>
            ${subdomainHtml}
          </div>
        ` : ''}

        <div>
          <div class="inspection-section-header">
            <span>⚠️</span> Warning Signals Actually Detected
          </div>
          ${flagsHtml || '<p style="color:#6ee7b7; font-size:0.88rem; background:rgba(16,185,129,0.08); padding:10px 14px; border-radius:6px; border:1px solid rgba(16,185,129,0.25);">No overt high-risk structural anomalies (IP hostname, known malicious TLD, or deceptive parameters) detected.</p>'}
        </div>

        <!-- Mandatory Transparent Disclosure: Unperformed Checks -->
        <div>
          <div class="inspection-section-header" style="color:var(--text-muted);">
            <span>🛡️</span> Technical Inspection Scope & Unperformed Checks
          </div>
          <div class="unperformed-checks-card">
            <p><strong>Privacy Architecture Notice:</strong> Nirbhaya inspects URL syntax and structural cues only. To protect your privacy and avoid triggering remote logging, the following checks were <em>intentionally not performed</em>:</p>
            <ul class="unperformed-checks-list" style="margin-top:8px;">
              ${unperformedHtml}
            </ul>
            <p style="margin-top:8px; font-size:0.78rem; color:#fde68a;">
              ⚠️ <strong>Critical Safety Rule:</strong> Never assume a website is safe simply because no structural flags were identified. Modern phishing sites can obtain valid HTTPS certificates and host clean domain names.
            </p>
          </div>
        </div>

        <!-- Verification Steps -->
        <div>
          <div class="inspection-section-header" style="color:var(--gold-sheen);">
            <span>📋</span> Recommended Verification Steps
          </div>
          <ul class="recs-list">${recsHtml}</ul>
        </div>
      </div>
    `;
  }

  // 2. Message Analysis Section
  if (data.text_analysis) {
    const t = data.text_analysis;
    let badgeColor = "#10b981";
    if (t.risk_score >= 70) badgeColor = "#ef4444";
    else if (t.risk_score >= 35) badgeColor = "#f59e0b";

    const indicatorsHtml = (t.sensitive_indicators || []).map(ind => `
      <div style="background:rgba(26,7,30,0.75); border-left:3px solid #f59e0b; padding:10px 14px; margin-bottom:8px; border-radius:0 6px 6px 0;">
        <strong style="color:#fbbf24; font-size:0.9rem;">⚠️ ${escapeHtml(ind.title)}</strong>
        <p style="font-size:0.84rem; color:var(--text-secondary); margin-top:3px;">${escapeHtml(ind.explanation)}</p>
        <span style="font-size:0.75rem; color:var(--text-muted);">Matched keywords: <em>"${ind.matched_snippets.map(escapeHtml).join('", "')}"</em></span>
      </div>
    `).join("");

    const recsHtml = (t.recommendations || []).map(r => `<li>${r}</li>`).join("");

    contentHtml += `
      <div style="margin-top:28px; padding-top:20px; border-top:1px solid var(--lavender-border);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
          <h4 style="font-size:1.25rem; color:var(--ivory-white); font-family:var(--font-serif);">Message Privacy & Sensitive Data Inspection</h4>
          <div style="background:${badgeColor}22; border:1px solid ${badgeColor}; color:${badgeColor}; padding:5px 14px; border-radius:9999px; font-weight:700; font-size:0.82rem;">
            Risk Score: ${t.risk_score}% • ${escapeHtml(t.verdict)}
          </div>
        </div>

        <div class="inspection-section-header">
          <span>🚩</span> Detected Red Flags
        </div>
        ${indicatorsHtml || '<p style="color:#6ee7b7; font-size:0.88rem; background:rgba(16,185,129,0.08); padding:10px 14px; border-radius:6px;">No explicit OTP, PIN, password, or remote-desktop harvesting terms found.</p>'}

        <div class="inspection-section-header" style="color:var(--gold-sheen); margin-top:16px;">
          <span>🛡️</span> Safety Guidance
        </div>
        <ul class="recs-list">${recsHtml}</ul>
      </div>
    `;
  }

  resultBox.innerHTML = contentHtml;
  resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function escapeHtml(text) {
  if (!text) return "";
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

document.addEventListener("DOMContentLoaded", initPhishingChecker);
