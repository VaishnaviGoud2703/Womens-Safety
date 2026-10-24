/**
 * Nirbhaya Safety Copilot — Explainable, Personalized Safety Decision Assistant
 * Tagline: A World Without Fear
 *
 * Design Principles:
 * - 100% Client-Side Processing: Zero remote telemetry, zero persistent storage of sensitive answers.
 * - Transparent Decision Rules: Clear rule matrices without opaque or simulated black-box AI claims.
 * - Trauma-Informed Prioritization: Structured into Immediate Actions, Next Steps, and Long-Term Prevention.
 * - Explainable Rationale: Every single recommendation includes an explicit "Why am I seeing this advice?" breakdown.
 * - Deep Integration: Seamless cross-linking to Nirbhaya's existing SOS, Location, URL, and Vault modules.
 */

// ============================================================================
// 1. RULE-BASED DECISION MATRICES & KNOWLEDGE BASE
// ============================================================================

const COPILOT_SITUATIONS = {
  travel: {
    id: "travel",
    title: "Feeling Unsafe While Travelling",
    icon: "🚕",
    description: "Cab route deviation, unlit streets, public transit harassment, or isolated transit stops.",
    questions: [
      {
        id: "transport_mode",
        question: "How are you currently travelling?",
        options: [
          { value: "cab", label: "In a hired cab, taxi, or auto-rickshaw" },
          { value: "walking", label: "Walking on foot alone" },
          { value: "public_transit", label: "On a bus, train, or metro" }
        ]
      },
      {
        id: "environment",
        question: "What is your immediate environment like?",
        options: [
          { value: "isolated_night", label: "Late at night or isolated area with few people" },
          { value: "unfamiliar_route", label: "Driver is taking an unfamiliar or diverted route" },
          { value: "moderate_populated", label: "Daytime or moderately busy street" }
        ]
      },
      {
        id: "phone_status",
        question: "What is your current phone status?",
        options: [
          { value: "good_battery", label: "Healthy battery & active mobile network" },
          { value: "low_battery", label: "Low battery (under 20%) or spotty network" }
        ]
      }
    ]
  },
  online_harassment: {
    id: "online_harassment",
    title: "Persistent Online Harassment",
    icon: "💬",
    description: "Relentless DMs, cyberbullying, blackmail, non-consensual image threats, or abusive messages.",
    questions: [
      {
        id: "perpetrator_type",
        question: "Who is sending the harassment?",
        options: [
          { value: "anonymous", label: "Anonymous or newly created burner account" },
          { value: "known_person", label: "Known acquaintance, ex-partner, or colleague" },
          { value: "coordinated_group", label: "Multiple coordinating accounts or mass troll swarm" }
        ]
      },
      {
        id: "threat_nature",
        question: "What type of threats or behavior are occurring?",
        options: [
          { value: "sextortion", label: "Threatening to leak private photos, videos, or sextortion" },
          { value: "doxxing", label: "Threatening to publish phone number, address, or workplace" },
          { value: "verbal_abuse", label: "Severe verbal abuse, slurs, or continuous unwanted contact" }
        ]
      },
      {
        id: "past_response",
        question: "Have you responded or engaged with the harasser?",
        options: [
          { value: "no_response", label: "I have not responded / ignored so far" },
          { value: "responded_pleaded", label: "I responded, argued, or pleaded with them" }
        ]
      }
    ]
  },
  tracking_compromise: {
    id: "tracking_compromise",
    title: "Suspected Phone Tracking or Compromise",
    icon: "📱",
    description: "Unexpected location tracking, rapid battery drain, unrecognized logins, or stalkerware concerns.",
    questions: [
      {
        id: "symptom",
        question: "What specifically makes you suspicious?",
        options: [
          { value: "location_leaks", label: "Someone knows my exact location or schedule unexpectedly" },
          { value: "battery_behavior", label: "Phone overheats, battery drains rapidly, or unexpected camera/mic indicators" },
          { value: "unauthorized_logins", label: "Received unprompted 2FA SMS or saw unfamiliar active logins" }
        ]
      },
      {
        id: "physical_access",
        question: "Could someone have had physical access to your unlocked phone?",
        options: [
          { value: "yes_access", label: "Yes, someone (partner, roommate, acquaintance) had access" },
          { value: "no_access", label: "No, device has always been physically secured with me" },
          { value: "uncertain", label: "Uncertain / device was left unattended briefly" }
        ]
      },
      {
        id: "device_os",
        question: "What device operating system do you use?",
        options: [
          { value: "android", label: "Android Smartphone" },
          { value: "ios", label: "Apple iPhone (iOS)" }
        ]
      }
    ]
  },
  followed: {
    id: "followed",
    title: "Feeling Followed or Watched",
    icon: "🚶‍♀️",
    description: "A suspicious person trailing behind you, vehicle pacing your pace, or repeated sightings.",
    questions: [
      {
        id: "follower_type",
        question: "How is the person following you?",
        options: [
          { value: "on_foot", label: "Following on foot trailing behind" },
          { value: "in_vehicle", label: "Following in a car, motorcycle, or auto-rickshaw" },
          { value: "repeated_sightings", label: "Seen this person at multiple different locations today" }
        ]
      },
      {
        id: "surrounding_area",
        question: "What is your immediate environment?",
        options: [
          { value: "isolated", label: "Isolated, unlit, or quiet residential street" },
          { value: "near_shops", label: "Within 2-3 minutes of open commercial shops, stores, or restaurants" },
          { value: "near_home", label: "Very close to my own home / apartment gate" }
        ]
      },
      {
        id: "distance_urgency",
        question: "How close are they and what is their demeanor?",
        options: [
          { value: "close_pacing", label: "Closing distance or matching every turn I take" },
          { value: "distant_watching", label: "Keeping distance but noticeably watching and following" }
        ]
      }
    ]
  },
  deciding_next: {
    id: "deciding_next",
    title: "Need Help Deciding What to Do Next",
    icon: "🧭",
    description: "Unsure whether a situation warrants reporting, feeling unsettled, or seeking safe next steps.",
    questions: [
      {
        id: "timing",
        question: "When did the incident or concern occur?",
        options: [
          { value: "now", label: "Happening right now / today" },
          { value: "recent_days", label: "Happened in the past few days" },
          { value: "ongoing", label: "Ongoing situation that has been building over weeks" }
        ]
      },
      {
        id: "primary_nature",
        question: "What is the primary nature of the concern?",
        options: [
          { value: "interpersonal", label: "Workplace, academic, or interpersonal boundary violation" },
          { value: "digital_threat", label: "Suspicious online message, link, or unknown profile" },
          { value: "physical_safety", label: "Physical intimidation or uneasy gut feeling about a person" }
        ]
      },
      {
        id: "support_status",
        question: "Have you discussed this with anyone yet?",
        options: [
          { value: "kept_to_self", label: "Kept to myself so far; haven't told anyone" },
          { value: "told_friend", label: "Told a trusted friend or family member" }
        ]
      }
    ]
  }
};

// State object: kept strictly in-memory during page session
let copilotState = {
  selectedSituation: null,
  answers: {},
  currentStep: 1 // 1: Situation, 2: Context Questions, 3: Action Plan, 4: Immediate Danger Triage
};

// ============================================================================
// 2. INITIALIZATION & DOM BINDINGS
// ============================================================================

function initSafetyCopilot() {
  renderSituationPicker();

  // Bind emergency danger banner
  const emergencyBannerBtn = document.getElementById("copilotEmergencyTriggerBtn");
  if (emergencyBannerBtn) {
    emergencyBannerBtn.addEventListener("click", triggerImmediateDangerMode);
  }

  // Bind Restart / Change buttons
  const restartBtn = document.getElementById("copilotRestartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", resetCopilot);
  }

  const changeAnswersBtn = document.getElementById("copilotChangeAnswersBtn");
  if (changeAnswersBtn) {
    changeAnswersBtn.addEventListener("click", returnToQuestions);
  }

  const copyPlanBtn = document.getElementById("copilotCopyPlanBtn");
  if (copyPlanBtn) {
    copyPlanBtn.addEventListener("click", copySafetyPlanToClipboard);
  }
}

// ============================================================================
// 3. STEP 1: SITUATION PICKER
// ============================================================================

function renderSituationPicker() {
  const container = document.getElementById("copilotSituationsGrid");
  if (!container) return;

  copilotState.currentStep = 1;
  updateStepperView(1);

  const situations = Object.values(COPILOT_SITUATIONS);
  container.innerHTML = situations.map(s => `
    <div class="copilot-situation-card" tabindex="0" role="button" aria-label="Select situation: ${escapeHtml(s.title)}" onclick="selectSituation('${s.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){ selectSituation('${s.id}'); }">
      <div class="situation-icon">${s.icon}</div>
      <div class="situation-title">${escapeHtml(s.title)}</div>
      <div class="situation-desc">${escapeHtml(s.desc || s.description)}</div>
      <span class="situation-cta">Select Situation →</span>
    </div>
  `).join("");

  showSection("copilotStepSituation");
}

function selectSituation(situationId) {
  const situation = COPILOT_SITUATIONS[situationId];
  if (!situation) return;

  copilotState.selectedSituation = situationId;
  copilotState.currentStep = 2;
  updateStepperView(2);
  renderQuestionsView(situation);
}

// ============================================================================
// 4. STEP 2: CONTEXT QUESTIONS
// ============================================================================

function renderQuestionsView(situation) {
  const titleEl = document.getElementById("copilotQuestionsTitle");
  const descEl = document.getElementById("copilotQuestionsDesc");
  const formEl = document.getElementById("copilotQuestionsForm");

  if (titleEl) titleEl.textContent = `${situation.icon} ${situation.title}`;
  if (descEl) descEl.textContent = "Answer a few quick, optional questions to prioritize your immediate action plan. No names, passwords, or personal details are requested.";

  if (!formEl) return;

  formEl.innerHTML = situation.questions.map((q, idx) => {
    const savedVal = copilotState.answers[q.id] || "";
    const optionsHtml = q.options.map(opt => `
      <label class="copilot-option-pill ${savedVal === opt.value ? 'selected' : ''}">
        <input type="radio" name="${q.id}" value="${opt.value}" ${savedVal === opt.value ? 'checked' : ''} onchange="handleOptionSelect('${q.id}', '${opt.value}', this)">
        <span>${escapeHtml(opt.label)}</span>
      </label>
    `).join("");

    return `
      <div class="copilot-question-card">
        <div class="copilot-question-number">Question ${idx + 1} of ${situation.questions.length} (Optional)</div>
        <div class="copilot-question-text">${escapeHtml(q.question)}</div>
        <div class="copilot-options-group">
          ${optionsHtml}
        </div>
      </div>
    `;
  }).join("") + `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-top:24px; padding-top:16px; border-top:1px solid var(--lavender-border);">
      <button type="button" class="btn-secondary" onclick="renderSituationPicker()">
        ← Back to Situations
      </button>
      <div style="display:flex; gap:10px;">
        <button type="button" class="btn-secondary" onclick="generateActionPlan(true)" title="Skip questions and generate standard verified protocol">
          Skip & View Standard Plan
        </button>
        <button type="button" class="btn-primary" onclick="generateActionPlan(false)">
          Generate Personalized Safety Plan ➔
        </button>
      </div>
    </div>
  `;

  showSection("copilotStepQuestions");
  window.scrollTo({ top: document.getElementById("copilotTab")?.offsetTop || 0, behavior: "smooth" });
}

function handleOptionSelect(questionId, value, radioEl) {
  copilotState.answers[questionId] = value;
  // Update visually selected style
  const parentCard = radioEl.closest(".copilot-question-card");
  if (parentCard) {
    parentCard.querySelectorAll(".copilot-option-pill").forEach(p => p.classList.remove("selected"));
    radioEl.closest(".copilot-option-pill")?.classList.add("selected");
  }
}

// ============================================================================
// 5. STEP 3: PRIORITIZED ACTION PLAN GENERATOR (DECISION ENGINE)
// ============================================================================

function generateActionPlan(skipped = false) {
  copilotState.currentStep = 3;
  updateStepperView(3);

  const situationId = copilotState.selectedSituation || "travel";
  const answers = copilotState.answers || {};

  // Build the prioritized recommendations using situation-specific rules
  const plan = evaluateDecisionRules(situationId, answers, skipped);

  renderActionPlanView(plan);
}

/**
 * Deterministic On-Device Decision Rules Engine.
 * Formulates tailored Immediate, Next, and Long-Term steps with transparent rationale.
 */
function evaluateDecisionRules(situationId, answers, skipped) {
  const immediate = [];
  const nextSteps = [];
  const longTerm = [];

  // ===================== TRAVEL SITUATION =====================
  if (situationId === "travel") {
    const isCab = answers.transport_mode === "cab" || answers.environment === "unfamiliar_route";
    const isWalking = answers.transport_mode === "walking";
    const isLowBattery = answers.phone_status === "low_battery";

    if (isCab) {
      immediate.push({
        title: "Make an Audible Voice Call or Simulated Check-in",
        desc: "Place a real or simulated phone call on speaker or loud voice: 'Hi, I've shared my live trip tracking with you. The driver is approaching the main road now; I'll see you in 10 minutes.'",
        why: "Cab drivers and opportunistic offenders are significantly deterred when they know a third party is actively tracking the vehicle and expecting arrival shortly.",
        badge: "Deterrence",
        toolLink: { tab: "locationTab", text: "Open Live Location Sharing ➔" }
      });
      immediate.push({
        title: "Keep Windows Rolled Down Slightly & Door Unlocked",
        desc: "Ensure the rear door child-lock is not engaged if possible, and roll the window down 2-3 inches to maintain auditory contact with outside street sounds.",
        why: "Maintains an immediate communication channel with outside traffic and ensures you can call for bystander attention if necessary.",
        badge: "Physical Readiness"
      });
    } else if (isWalking) {
      immediate.push({
        title: "Head Immediately Toward a Well-Lit Commercial Venue",
        desc: "Veer toward an open convenience store, petrol pump, hotel lobby, pharmacy, or 24/7 restaurant. Do not hesitate to step inside and browse.",
        why: "Commercial venues have staff, lighting, and CCTV surveillance, immediately breaking the physical isolation that offenders seek.",
        badge: "De-isolation"
      });
      immediate.push({
        title: "Walk Firmly with Head Up & Avoid Headphones",
        desc: "Remove earbuds or headphones. Keep hands out of pockets and project situational awareness and purposeful movement.",
        why: "Attackers look for distracted targets unaware of their surroundings. Visible alertness discourages opportunistic approaches.",
        badge: "Body Language"
      });
    } else {
      // Public transit
      immediate.push({
        title: "Move Toward the Driver, Guard, or Populated Carriage",
        desc: "Relocate immediately to the front of the bus near the driver, or the women's coach / central section of the metro where station cameras point.",
        why: "Proximity to transit staff and witnesses acts as an immediate physical buffer against persistent harassment.",
        badge: "Witness Density"
      });
    }

    if (isLowBattery) {
      immediate.push({
        title: "Send a Static GPS Pin Before Battery Dies",
        desc: "Immediately copy your Google Maps location or text your current crossroads to a trusted contact before your phone shuts down.",
        why: "Ensures your last known physical location is preserved on a loved one's screen even if the device powers off.",
        badge: "Critical Battery"
      });
    } else {
      nextSteps.push({
        title: "Activate Nirbhaya Live Location Sharing",
        desc: "Stream your device's high-accuracy GPS coordinates to a trusted sister, friend, or partner via WhatsApp.",
        why: "Provides continuous real-time coordinate updates without requiring manual check-in texts.",
        toolLink: { tab: "locationTab", text: "Activate Location Hub ➔" },
        badge: "GPS Tracking"
      });
    }

    nextSteps.push({
      title: "Keep National Emergency (112) or Women Helpline (1091) on Screen",
      desc: "Open your phone's dialer with 112 or 1091 entered so you are a single touch away from connecting with law enforcement.",
      why: "In high-stress adrenaline moments, dialing numbers under panic is error-prone. Having the keypad pre-loaded saves critical seconds.",
      badge: "Emergency Dialer"
    });

    longTerm.push({
      title: "Audit Trusted Contacts & Enable Emergency Speed Dials",
      desc: "Configure 2-3 verified contacts in Nirbhaya's Contacts Hub and enable lock-screen emergency shortcut buttons on your phone.",
      why: "Guarantees rapid multi-channel SOS alerts during future transit commutes.",
      toolLink: { tab: "locationTab", text: "Manage Trusted Contacts ➔" },
      badge: "Prevention"
    });
  }

  // ===================== ONLINE HARASSMENT =====================
  else if (situationId === "online_harassment") {
    const isSextortion = answers.threat_nature === "sextortion";
    const isDoxxing = answers.threat_nature === "doxxing";
    const hasResponded = answers.past_response === "responded_pleaded";

    immediate.push({
      title: "Adopt Strict Non-Engagement (Do Not Argue or Plead)",
      desc: "Stop replying immediately. Do not apologize, plead, or negotiate under any circumstance.",
      why: "Extortionists and cyberbullies use your emotional distress to test compliance. Silence denies them emotional leverage and signals that extortion tactics are failing.",
      badge: "De-escalation"
    });

    immediate.push({
      title: "Preserve Full Uncompressed Evidence Before Blocking",
      desc: "Take full-screen screenshots showing the perpetrator's username/handle, profile URL, message timestamps, and specific threats.",
      why: "If the offender deletes their account or unsends messages, your local screenshots serve as the primary factual record for platform moderation and cybercrime filing.",
      badge: "Forensic Evidence",
      toolLink: { tab: "identityTab", text: "Preserve in Evidence Vault ➔" }
    });

    if (isSextortion) {
      nextSteps.push({
        title: "Register Image Hashes with StopNCII.org (Non-Consensual Image Protection)",
        desc: "StopNCII.org generates cryptographic hashes of intimate images on your device without uploading the photos, preventing them from being shared across Meta, TikTok, and participating platforms.",
        why: "Stops viral distribution proactively across major tech platforms without exposing your private media to third parties.",
        badge: "Image Protection"
      });
      nextSteps.push({
        title: "Report to National Cyber Crime Portal (1930 / cybercrime.gov.in)",
        desc: "File a formal complaint under cyber harassment / blackmail provisions on the national portal or call 1930.",
        why: "Law enforcement cyber cells can issue legal preservation notices to social media platforms to identify ISP and device footprints.",
        badge: "Legal Action"
      });
    } else if (isDoxxing) {
      nextSteps.push({
        title: "Report Doxxing Threats Under Platform Terms of Service",
        desc: "Use the platform's 'Threatening to share private personal information' reporting flow and request urgent expedited review.",
        why: "Platforms treat publishing home addresses or phone numbers as severe Terms of Service violations and typically issue hardware-level account bans.",
        badge: "Account Banning"
      });
    }

    nextSteps.push({
      title: "Harden Privacy Settings Across All Social Accounts",
      desc: "Switch Instagram and Facebook to Private. Restrict message requests from non-followers and hide follower/following lists.",
      why: "Prevents the harasser from identifying friends, family members, or colleagues to harass as secondary targets.",
      badge: "Account Lockdown"
    });

    longTerm.push({
      title: "Conduct a Digital Footprint & Privacy Audit",
      desc: "Search your name, phone number, and usernames in incognito search engines. Remove public phone numbers from Truecaller, LinkedIn, and social bios.",
      why: "Minimizes open-source intelligence (OSINT) avenues that harassers exploit for future stalking.",
      badge: "Digital Hygiene",
      toolLink: { tab: "checklistTab", text: "Complete Privacy Checklist ➔" }
    });
  }

  // ===================== TRACKING / COMPROMISE =====================
  else if (situationId === "tracking_compromise") {
    const isPhysicalAccess = answers.physical_access === "yes_access";
    const isAndroid = answers.device_os === "android";

    immediate.push({
      title: "Audit Active Native Location Sharing Features",
      desc: "Open Google Maps → tap your profile → 'Location Sharing'. On iPhone, open Find My → 'People' tab. Also check WhatsApp → Settings → Privacy → Live Location.",
      why: "Over 80% of interpersonal tracking occurs through legitimate built-in location-sharing features silently toggled on by someone with physical access to your device.",
      badge: "Built-in Features"
    });

    immediate.push({
      title: "Revoke All Active Web & Device Sessions",
      desc: "Using a separate safe device (or private browser window), log into Google, Apple ID, WhatsApp, and Instagram. Select 'Log out of all devices'.",
      why: "Terminating all active web sessions instantly invalidates remote authentication tokens and locks out unauthorized viewers.",
      badge: "Session Revocation"
    });

    if (isAndroid) {
      nextSteps.push({
        title: "Audit Android Device Admin & Accessibility Permissions",
        desc: "Go to Settings → Security → 'Device admin apps'. Then Settings → Accessibility → Check for unfamiliar services enabled.",
        why: "Commercial stalkerware tools require Device Administrator or Accessibility permissions to intercept screen contents and keystrokes.",
        badge: "Permission Audit"
      });
    } else {
      nextSteps.push({
        title: "Audit Apple ID Family Sharing & Unknown Profiles",
        desc: "Go to iPhone Settings → Apple ID (top name) → check 'Family Sharing' and 'Devices'. Check Settings → General → 'VPN & Device Management' for unknown profiles.",
        why: "Supervised device profiles or shared Apple ID iCloud sync can mirror iMessages and photos without installing third-party apps.",
        badge: "Profile Audit"
      });
    }

    nextSteps.push({
      title: "Update Screen Lock PIN to a Never-Used Code",
      desc: "Change your device unlock PIN/passcode to an alphanumeric code that someone close to you cannot guess (avoid birthdays, anniversaries, or phone digits).",
      why: "Prevents future physical re-access to your phone when left unattended or charging.",
      badge: "Device Security"
    });

    longTerm.push({
      title: "Enable Carrier SIM Lock PIN & Perform Clean Backup",
      desc: "Contact your mobile carrier or go to Settings → Cellular → 'SIM PIN' to prevent SIM swapping. Back up only photos and contacts, not unknown apps.",
      why: "Protects your phone number against unauthorized porting and ensures clean software restoration.",
      badge: "SIM Defense",
      toolLink: { tab: "checklistTab", text: "View SIM Security Checklist ➔" }
    });
  }

  // ===================== FEELING FOLLOWED =====================
  else if (situationId === "followed") {
    const isNearHome = answers.surrounding_area === "near_home";
    const isInVehicle = answers.follower_type === "in_vehicle";

    immediate.push({
      title: "DO NOT Go Directly to Your Home or Apartment",
      desc: "Avoid turning into your personal driveway, apartment building, or residential alleyway.",
      why: "Heading home reveals your exact residence address, building access code, and living situation to a stalker, escalating long-term vulnerability.",
      badge: "Critical Boundary"
    });

    immediate.push({
      title: "Execute a Deliberate Route Verification Check",
      desc: "Cross the street purposefully, or make three consecutive right turns around a square block while walking briskly.",
      why: "Confirms beyond statistical chance whether the individual is actively shadowing you, allowing you to react without hesitation.",
      badge: "Tracking Verification"
    });

    immediate.push({
      title: "Enter the Nearest Populated Public Establishment",
      desc: "Walk directly into an open pharmacy, bank ATM with a security guard, supermarket, cafe, or hotel reception.",
      why: "Commercial premises have staff, customers, lighting, and CCTV surveillance, which immediately disincentivizes pursuers from continuing pursuit.",
      badge: "Public Safety"
    });

    nextSteps.push({
      title: "Notify an Employee or Security Personnel Inside",
      desc: "Approach the counter calmly: 'I am being followed by an individual outside. Please allow me to stay here while I contact assistance.'",
      why: "Establishes immediate witness awareness and provides a safe indoor holding sanctuary while arranging transportation or police presence.",
      badge: "Witness Support"
    });

    nextSteps.push({
      title: "Call a Trusted Friend or 112 (Police) to Arrange Escort",
      desc: "Do not leave the safe venue alone on foot. Request a friend to pick you up or call 112 for a police patrol car escort.",
      why: "Leaves no physical window of vulnerability between the safe venue and your eventual transit home.",
      toolLink: { tab: "sosTab", text: "Open SOS Hub / Dial 112 ➔" },
      badge: "Safe Extraction"
    });

    longTerm.push({
      title: "Vary Daily Routine & Document Suspicious Identifiers",
      desc: "Record the person's approximate height, clothing, or vehicle license plate in Nirbhaya's Evidence Vault. Vary your transit arrival and departure times.",
      why: "Stalkers depend on predictable daily schedules. Disrupting routine patterns and logging descriptions establishes legal evidence for restraining orders.",
      toolLink: { tab: "identityTab", text: "Log Description in Evidence Vault ➔" },
      badge: "Routine Hardening"
    });
  }

  // ===================== DECIDING NEXT STEPS =====================
  else {
    immediate.push({
      title: "Validate Your Intuition Without Self-Doubt",
      desc: "Acknowledge your gut feeling. You do not need to prove physical harm before taking self-protective measures.",
      why: "Human intuition is a subconscious survival mechanism that synthesizes subtle behavioral red flags faster than rational explanation.",
      badge: "Intuitive Trust"
    });

    immediate.push({
      title: "Create a Contemporaneous Dated Record of Events",
      desc: "Write down the exact dates, times, locations, names or handles, and factual quotes of what occurred while memory is fresh.",
      why: "Stress causes memory degradation over time. A record created contemporaneously holds significantly higher credibility in legal or administrative inquiries.",
      toolLink: { tab: "identityTab", text: "Open Private Evidence Vault ➔" },
      badge: "Documentation"
    });

    nextSteps.push({
      title: "Establish a Confidential Out-of-Band Confidant",
      desc: "Share the situation with at least one trusted friend, family member, or mentor who will respect your confidentiality.",
      why: "Isolation amplifies fear and self-doubt. Involving an ally ensures someone else is aware and can assist in checking on your welfare.",
      badge: "Ally Network"
    });

    nextSteps.push({
      title: "Consult National Helplines for Anonymous Procedural Guidance",
      desc: "Call the Women Helpline (1091 / 181) or Cyber Crime Helpline (1930) for free, confidential guidance on your specific legal options.",
      why: "Helpline counselors clarify legal protections and reporting procedures without requiring you to commit to filing an official police FIR immediately.",
      badge: "Free Consultation"
    });

    longTerm.push({
      title: "Complete the Nirbhaya Personal Safety Readiness Checklist",
      desc: "Work through the 8 essential physical and digital security tasks to systematically eliminate vulnerabilities.",
      why: "Proactive security posture provides lasting peace of mind and resilience.",
      toolLink: { tab: "checklistTab", text: "Audit Safety Checklist ➔" },
      badge: "Readiness"
    });
  }

  return {
    situation: COPILOT_SITUATIONS[situationId],
    skipped: skipped,
    immediate: immediate,
    nextSteps: nextSteps,
    longTerm: longTerm
  };
}

// ============================================================================
// 6. STEP 3: ACTION PLAN RENDERING
// ============================================================================

function renderActionPlanView(plan) {
  const container = document.getElementById("copilotPlanContainer");
  if (!container) return;

  const sit = plan.situation;

  // Build Tier HTML
  const immediateHtml = plan.immediate.map((item, i) => renderRecommendationCard(item, "urgent", i + 1)).join("");
  const nextHtml = plan.nextSteps.map((item, i) => renderRecommendationCard(item, "next", i + 1)).join("");
  const longTermHtml = plan.longTerm.map((item, i) => renderRecommendationCard(item, "longterm", i + 1)).join("");

  container.innerHTML = `
    <!-- Plan Header -->
    <div class="copilot-plan-header">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px;">
        <div>
          <span class="copilot-plan-tag">Personalized Decision Plan</span>
          <h3 class="copilot-plan-title">${sit.icon} Safety Protocol: ${escapeHtml(sit.title)}</h3>
          <p class="copilot-plan-subtitle">
            Prioritized tactical steps based on verified personal protection and digital safety standards.
          </p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-secondary" onclick="returnToQuestions()" style="font-size:0.82rem; padding:6px 14px;">
            ✏️ Change My Answers
          </button>
          <button class="btn-secondary" onclick="resetCopilot()" style="font-size:0.82rem; padding:6px 14px;">
            🔄 Start Again
          </button>
          <button class="btn-primary" onclick="copySafetyPlanToClipboard()" style="font-size:0.82rem; padding:6px 16px;">
            📋 Copy Safety Plan
          </button>
        </div>
      </div>
    </div>

    <!-- TIER 1: IMMEDIATE ACTIONS -->
    <div class="copilot-tier-block urgent">
      <div class="copilot-tier-header">
        <span class="copilot-tier-icon">⚡</span>
        <div>
          <h4 class="copilot-tier-title">Tier 1: Immediate Actions (Right Now)</h4>
          <span class="copilot-tier-desc">Immediate actions to break vulnerability, secure physical distance, and stop escalation.</span>
        </div>
      </div>
      <div class="copilot-recs-grid">
        ${immediateHtml}
      </div>
    </div>

    <!-- TIER 2: NEXT STEPS -->
    <div class="copilot-tier-block next">
      <div class="copilot-tier-header">
        <span class="copilot-tier-icon">🛡️</span>
        <div>
          <h4 class="copilot-tier-title">Tier 2: Next Steps (Within 1-2 Hours)</h4>
          <span class="copilot-tier-desc">Coordination with allies, forensic evidence logging, and account lockdown.</span>
        </div>
      </div>
      <div class="copilot-recs-grid">
        ${nextHtml}
      </div>
    </div>

    <!-- TIER 3: LONGER-TERM PREVENTION -->
    <div class="copilot-tier-block longterm">
      <div class="copilot-tier-header">
        <span class="copilot-tier-icon">🌱</span>
        <div>
          <h4 class="copilot-tier-title">Tier 3: Longer-Term Prevention & Hardening</h4>
          <span class="copilot-tier-desc">Systemic boundary enforcement, privacy hygiene, and routine diversification.</span>
        </div>
      </div>
      <div class="copilot-recs-grid">
        ${longTermHtml}
      </div>
    </div>

    <!-- Transparent Engine & Ethical Disclosures -->
    <div class="copilot-disclosures-card">
      <strong style="color:var(--gold-sheen);">🧭 Transparent Decision Engine & Ethical Disclosures:</strong>
      <ul style="margin-top:8px; padding-left:18px; line-height:1.6; font-size:0.82rem; color:var(--text-secondary);">
        <li><strong>On-Device Deterministic Logic:</strong> This decision assistant runs 100% locally in your web browser. No responses, queries, or locations are transmitted to remote cloud databases or third parties.</li>
        <li><strong>No False AI Claims:</strong> Recommendations are mapped through transparent, evidence-based crisis response matrices and digital security best practices. The architecture is structured for modular future model integrations.</li>
        <li><strong>Emergency Disclaimer:</strong> Safety Copilot provides guidance and structure; it is not a legal guarantee of personal safety. If you believe your physical safety is in immediate jeopardy, do not delay calling emergency law enforcement (112 / 1091).</li>
      </ul>
    </div>
  `;

  showSection("copilotStepPlan");
  window.scrollTo({ top: document.getElementById("copilotTab")?.offsetTop || 0, behavior: "smooth" });
}

function renderRecommendationCard(item, tierClass, index) {
  const toolLinkHtml = item.toolLink ? `
    <button class="copilot-tool-link-btn" onclick="switchTab('${item.toolLink.tab}')">
      ${escapeHtml(item.toolLink.text)}
    </button>
  ` : '';

  return `
    <div class="copilot-rec-card ${tierClass}">
      <div class="copilot-rec-top">
        <span class="copilot-rec-badge">${escapeHtml(item.badge || 'Action')}</span>
        <span class="copilot-rec-index">Step ${index}</span>
      </div>
      <h5 class="copilot-rec-title">${escapeHtml(item.title)}</h5>
      <p class="copilot-rec-desc">${escapeHtml(item.desc)}</p>

      <!-- Explainability: Why am I seeing this advice? -->
      <div class="why-advice-box">
        <div class="why-advice-header" onclick="toggleWhyAdvice(this)" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){ toggleWhyAdvice(this); }">
          <span>💡 <strong>Why am I seeing this advice?</strong></span>
          <span class="why-toggle-arrow">▾</span>
        </div>
        <div class="why-advice-content">
          ${escapeHtml(item.why)}
        </div>
      </div>

      ${toolLinkHtml}
    </div>
  `;
}

window.toggleWhyAdvice = function(headerEl) {
  const box = headerEl.closest(".why-advice-box");
  if (!box) return;
  box.classList.toggle("open");
};

// ============================================================================
// 7. IMMEDIATE DANGER ESCALATION TRIAGE
// ============================================================================

function triggerImmediateDangerMode() {
  copilotState.currentStep = 4;
  updateStepperView(4);

  const container = document.getElementById("copilotDangerTriageContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="copilot-danger-card">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
        <span style="font-size:2.4rem;">🚨</span>
        <div>
          <h3 style="color:#fda4af; font-size:1.45rem; font-family:var(--font-serif); margin:0;">Immediate Physical Danger Protocol</h3>
          <span style="font-size:0.84rem; color:var(--lavender-muted);">High-Priority Triage & Instant Emergency Connections</span>
        </div>
      </div>

      <div class="copilot-danger-notice">
        <strong>⚠️ Crucial Notice:</strong> Selecting this option presents urgent on-screen guidance and direct phone links. 
        <em>It does not silently dispatch emergency responders.</em> Tap the red dialer buttons below to immediately call local authorities.
      </div>

      <!-- Tactical Immediate Rules -->
      <div style="margin:20px 0;">
        <h4 style="font-size:1.05rem; color:var(--ivory-white); margin-bottom:10px;">Immediate Survival Priorities:</h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
          
          <div class="danger-priority-box">
            <strong>1. Break Isolation Immediately</strong>
            <p>Move toward crowds, well-lit spaces, or enter any open business (store, pharmacy, restaurant, hotel). Do not go home or into dark stairwells.</p>
          </div>

          <div class="danger-priority-box">
            <strong>2. Call for Visible Bystander Help</strong>
            <p>If someone is physically confronting you, shout loudly and specifically: 'Call the police! This person is harassing me!' Specific shouts attract bystanders faster than general screams.</p>
          </div>

          <div class="danger-priority-box">
            <strong>3. Stream Your Coordinates</strong>
            <p>If safe to touch your phone, trigger Nirbhaya SOS or open Live Location Sharing to stream GPS to trusted contacts.</p>
          </div>

        </div>
      </div>

      <!-- Direct Emergency Connections -->
      <div style="background:rgba(20,6,23,0.85); border:1px solid var(--danger-border); border-radius:var(--radius-md); padding:18px; margin-top:20px;">
        <h4 style="font-size:1rem; color:#fda4af; margin-bottom:12px;">Instant Emergency Dialers & Hub Access:</h4>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <a href="tel:112" class="btn-danger" style="text-decoration:none; padding:12px 22px; font-size:0.95rem;">
            📞 Call Police (112)
          </a>
          <a href="tel:1091" class="btn-danger" style="background:linear-gradient(135deg, #9f1239 0%, #be123c 100%); text-decoration:none; padding:12px 22px; font-size:0.95rem;">
            🛡️ Call Women Helpline (1091)
          </a>
          <button class="btn-secondary" onclick="switchTab('sosTab')" style="border-color:#f43f5e; color:#fda4af;">
            🚨 Jump to Nirbhaya SOS Hub ➔
          </button>
          <button class="btn-secondary" onclick="switchTab('locationTab')" style="border-color:var(--gold-border); color:var(--gold-sheen);">
            📍 Jump to Live Location Hub ➔
          </button>
        </div>
      </div>

      <!-- Return option -->
      <div style="margin-top:22px; padding-top:14px; border-top:1px solid var(--lavender-border); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.8rem; color:var(--text-muted);">If physical crisis has stabilized, you may return to the structured Copilot planner.</span>
        <button class="btn-secondary" onclick="returnFromDangerMode()">
          ← Return to Safety Copilot
        </button>
      </div>
    </div>
  `;

  showSection("copilotStepDanger");
  window.scrollTo({ top: document.getElementById("copilotTab")?.offsetTop || 0, behavior: "smooth" });
}

function returnFromDangerMode() {
  if (copilotState.selectedSituation) {
    if (Object.keys(copilotState.answers).length > 0) {
      generateActionPlan(false);
    } else {
      selectSituation(copilotState.selectedSituation);
    }
  } else {
    renderSituationPicker();
  }
}

// ============================================================================
// 8. NAVIGATION, RESET & COPY CONTROLS
// ============================================================================

function returnToQuestions() {
  const sit = COPILOT_SITUATIONS[copilotState.selectedSituation];
  if (sit) {
    copilotState.currentStep = 2;
    updateStepperView(2);
    renderQuestionsView(sit);
  } else {
    renderSituationPicker();
  }
}

function resetCopilot() {
  copilotState.selectedSituation = null;
  copilotState.answers = {};
  copilotState.currentStep = 1;
  renderSituationPicker();
}

function showSection(sectionId) {
  const sections = ["copilotStepSituation", "copilotStepQuestions", "copilotStepPlan", "copilotStepDanger"];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === sectionId) {
        el.style.display = "block";
        el.classList.add("active");
      } else {
        el.style.display = "none";
        el.classList.remove("active");
      }
    }
  });
}

function updateStepperView(step) {
  const stepper = document.getElementById("copilotStepper");
  if (!stepper) return;

  const stepItems = stepper.querySelectorAll(".copilot-step-badge");
  stepItems.forEach((badge, idx) => {
    const stepNum = idx + 1;
    badge.classList.remove("active", "completed");
    if (stepNum === step) {
      badge.classList.add("active");
    } else if (stepNum < step && step <= 3) {
      badge.classList.add("completed");
    }
  });
}

/**
 * Copies the full generated safety plan to the clipboard for offline reading.
 */
function copySafetyPlanToClipboard() {
  const sit = COPILOT_SITUATIONS[copilotState.selectedSituation];
  if (!sit) {
    alert("No active safety plan to copy.");
    return;
  }

  const plan = evaluateDecisionRules(copilotState.selectedSituation, copilotState.answers, false);

  let text = `========================================================================\n`;
  text += `NIRBHAYA SAFETY COPILOT — PERSONALIZED ACTION PLAN\n`;
  text += `Situation: ${sit.title}\n`;
  text += `Generated On: ${new Date().toLocaleString()}\n`;
  text += `Confidential & On-Device Guidance\n`;
  text += `========================================================================\n\n`;

  text += `[TIER 1: IMMEDIATE ACTIONS (RIGHT NOW)]\n`;
  plan.immediate.forEach((item, i) => {
    text += `${i + 1}. ${item.title.toUpperCase()}\n`;
    text += `   Action: ${item.desc}\n`;
    text += `   Why: ${item.why}\n\n`;
  });

  text += `[TIER 2: NEXT STEPS (WITHIN 1-2 HOURS)]\n`;
  plan.nextSteps.forEach((item, i) => {
    text += `${i + 1}. ${item.title.toUpperCase()}\n`;
    text += `   Action: ${item.desc}\n`;
    text += `   Why: ${item.why}\n\n`;
  });

  text += `[TIER 3: LONGER-TERM PREVENTION]\n`;
  plan.longTerm.forEach((item, i) => {
    text += `${i + 1}. ${item.title.toUpperCase()}\n`;
    text += `   Action: ${item.desc}\n`;
    text += `   Why: ${item.why}\n\n`;
  });

  text += `========================================================================\n`;
  text += `DISCLAIMER: This guidance provides structured decision assistance based\n`;
  text += `on personal safety best practices. It does not replace emergency law\n`;
  text += `enforcement. In an immediate physical emergency, call 112 or 1091.\n`;
  text += `========================================================================\n`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert("✓ Safety Plan successfully copied to clipboard for offline reference.");
    }).catch(() => {
      prompt("Copy your Safety Plan from this box:", text);
    });
  } else {
    prompt("Copy your Safety Plan from this box:", text);
  }
}

function escapeHtml(text) {
  if (!text) return "";
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

document.addEventListener("DOMContentLoaded", initSafetyCopilot);
