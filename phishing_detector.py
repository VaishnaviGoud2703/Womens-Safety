"""
Digital Privacy & Phishing Detection Engine for Nirbhaya: A World Without Fear.
Inspects suspicious text and URLs for credential harvesting, domain spoofing,
homoglyphs, insecure protocols, and social engineering patterns.
Never executes or visits suspicious links; purely parses and analyzes safely.
"""

import re
from urllib.parse import urlparse

# Suspicious Top-Level Domains frequently abused in phishing campaigns
SUSPICIOUS_TLDS = {
    "xyz", "top", "buzz", "tk", "ml", "ga", "cf", "gq", "work", "date",
    "click", "link", "party", "review", "country", "kim", "science", "cricket"
}

# Known URL Shortener domains that mask destinations
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "goo.gl",
    "ow.ly", "buff.ly", "rebrand.ly", "shorte.st"
}

# Sensitive credential cues
SENSITIVE_PATTERNS = {
    "otp_request": (
        r"\b(one[ -]?time[ -]?password|otp|verification code|security code|6[ -]?digit code)\b",
        "Request for One-Time Password (OTP) or Verification Code"
    ),
    "pin_password": (
        r"\b(upi pin|atm pin|mpin|password|passcode|secret pin|login credentials)\b",
        "Solicitation of PIN, MPIN, or Password"
    ),
    "financial_urgency": (
        r"\b(account (is |will be )?suspended|account (is |will be )?blocked|electricity (will be )?disconnected|power cut|kyc expired|update kyc|lottery prize|tax refund)\b",
        "Manufactured Urgency / Account Suspension Pressure"
    ),
    "remote_access_malware": (
        r"\b(anydesk|teamviewer|quicksupport|rustdesk|screen share|install this app|apk file)\b",
        "Attempt to install Remote Desktop / Screen Sharing Software"
    ),
    "card_banking_info": (
        r"\b(cvv|card expiry|credit card number|debit card number|bank account number|netbanking)\b",
        "Direct Banking or Payment Card Details Solicitation"
    )
}

# Common targeted brand names for typosquatting / spoofing detection
TARGET_BRANDS = [
    "google", "gmail", "instagram", "facebook", "whatsapp", "apple", "netflix",
    "amazon", "paypal", "microsoft", "sbi", "hdfc", "icici", "paytm", "phonepe"
]

class PhishingDetector:
    @staticmethod
    def inspect_url(raw_url: str) -> dict:
        """
        Performs static heuristic security inspection on a URL.
        Does not issue network requests or resolve DNS.
        """
        raw_url = raw_url.strip()
        if not raw_url:
            return {"error": "Empty URL provided."}

        # Normalize URL scheme if missing for parsing
        parse_target = raw_url
        if not (raw_url.startswith("http://") or raw_url.startswith("https://")):
            parse_target = "https://" + raw_url

        try:
            parsed = urlparse(parse_target)
            hostname = (parsed.hostname or "").lower()
            path = (parsed.path or "").lower()
            query = (parsed.query or "").lower()
            scheme = (parsed.scheme or "").lower()
        except Exception as e:
            return {
                "url": raw_url,
                "verdict": "Invalid URL",
                "risk_score": 50,
                "warning_flags": ["Malformed URL structure"],
                "recommendations": ["Do not click or interact with malformed web links."]
            }

        warning_flags = []
        positive_signals = []
        risk_score = 0

        # Check 1: Insecure HTTP Protocol
        if scheme == "http":
            warning_flags.append({
                "severity": "Medium",
                "title": "Insecure Protocol (HTTP)",
                "explanation": "This site does not use HTTPS encryption. Any passwords or personal details entered can be intercepted."
            })
            risk_score += 25
        elif scheme == "https":
            positive_signals.append("Uses encrypted connection (HTTPS), though phishing sites can also acquire free HTTPS certificates.")

        # Check 2: Direct IP Address in Hostname
        ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
        if re.match(ip_pattern, hostname):
            warning_flags.append({
                "severity": "High",
                "title": "Direct IP Address Hostname",
                "explanation": f"The link uses a raw IP address ({hostname}) rather than a verified domain name. Legitimate services virtually never do this."
            })
            risk_score += 45

        # Check 3: Known URL Shortener
        if hostname in URL_SHORTENERS:
            warning_flags.append({
                "severity": "Medium",
                "title": "URL Shortener Masking Destination",
                "explanation": f"Uses a URL shortener ({hostname}) to disguise the actual target website destination."
            })
            risk_score += 30

        # Check 4: Suspicious TLD
        tld = hostname.split(".")[-1] if "." in hostname else ""
        if tld in SUSPICIOUS_TLDS:
            warning_flags.append({
                "severity": "High",
                "title": f"High-Risk TLD (.{tld})",
                "explanation": f"The domain uses the '.{tld}' top-level extension, which has a very high incidence of deceptive phishing campaigns."
            })
            risk_score += 35

        # Check 5: Deceptive Brand Subdomain Spoofing
        # e.g., 'instagram.security-alerts.com' or 'paypal-verification.net'
        for brand in TARGET_BRANDS:
            if brand in hostname:
                parts = hostname.split(".")
                # Check if brand is not the main second-level domain
                main_domain = ".".join(parts[-2:]) if len(parts) >= 2 else hostname
                if brand not in main_domain:
                    warning_flags.append({
                        "severity": "High",
                        "title": f"Brand Spoofing ({brand.capitalize()})",
                        "explanation": f"The domain mimics '{brand.capitalize()}' in subdomains or prefix paths, but the root domain is actually '{main_domain}'."
                    })
                    risk_score += 45
                    break

        # Check 6: Typosquatting / Homoglyph Cues
        homoglyph_patterns = [
            (r"g00gle", "google"), (r"paypa[l1i]", "paypal"), (r"inst[a@]gr[a@]am", "instagram"),
            (r"faceb00k", "facebook"), (r"micr0soft", "microsoft"), (r"amaz0n", "amazon")
        ]
        for pattern, brand in homoglyph_patterns:
            if re.search(pattern, hostname) and brand not in hostname:
                warning_flags.append({
                    "severity": "Severe",
                    "title": f"Lookalike Typosquatting ({brand.capitalize()})",
                    "explanation": f"Hostname uses lookalike characters (homoglyphs) to trick you into believing it is {brand.capitalize()}."
                })
                risk_score += 50
                break

        # Check 7: Credential Harvesting Keywords in Path or Query
        harvest_keywords = ["login", "signin", "verify", "account", "banking", "wallet", "kyc", "security", "update-password", "otp"]
        detected_keywords = [kw for kw in harvest_keywords if kw in path or kw in query]
        if detected_keywords:
            warning_flags.append({
                "severity": "Medium",
                "title": "Credential Harvest Keywords",
                "explanation": f"URL path contains authentication-sensitive keywords: {', '.join(detected_keywords)}."
            })
            risk_score += 20

        # Check 8: Excessive Subdomains / Hyphens
        if hostname.count(".") > 3 or hostname.count("-") > 3:
            warning_flags.append({
                "severity": "Medium",
                "title": "Complex Obfuscated Domain",
                "explanation": "Domain contains an unusually high number of hyphens or subdomains, a hallmark of evasion techniques."
            })
            risk_score += 20

        # Check 9: @ Symbol in URL (userinfo spoofing)
        if "@" in raw_url:
            warning_flags.append({
                "severity": "Severe",
                "title": "UserInfo URL Spoofing Trick",
                "explanation": "URL contains an '@' character, often used by attackers to mask the real destination server in modern browsers."
            })
            risk_score += 50

        # Normalize Risk Level
        risk_score = min(100, risk_score)
        if risk_score >= 70:
            verdict = "Dangerous / High Phishing Likelihood"
            verdict_badge = "danger"
        elif risk_score >= 35:
            verdict = "Suspicious / Exercise Caution"
            verdict_badge = "warning"
        elif risk_score > 0:
            verdict = "Low Risk / Minor Warnings"
            verdict_badge = "info"
        else:
            verdict = "Likely Safe / No Obvious Flags"
            verdict_badge = "safe"

        recommendations = [
            "Never type passwords, OTPs, or credit card numbers into an unverified webpage.",
            "If this claims to be from a bank, social media app, or service you use, open the official app directly rather than tapping links.",
            "Check the exact browser address bar domain before proceeding."
        ]
        if risk_score >= 50:
            recommendations.insert(0, "DO NOT CLICK OR PROCEED TO THIS URL. Close or delete the message.")

        return {
            "url": raw_url,
            "parsed_hostname": hostname,
            "verdict": verdict,
            "verdict_badge": verdict_badge,
            "risk_score": risk_score,
            "warning_flags": warning_flags,
            "positive_signals": positive_signals,
            "recommendations": recommendations,
            "safe_view_disclaimer": "Nirbhaya parses URL structure safely without contacting the target server or transmitting user telemetry."
        }

    @staticmethod
    def inspect_text_and_privacy(text: str) -> dict:
        """
        Inspects message body for social engineering tricks, OTP interception,
        financial extortion, and extracts embedded URLs for security analysis.
        """
        if not text or not text.strip():
            return {
                "text_provided": False,
                "sensitive_indicators": [],
                "urls_found": [],
                "risk_score": 0,
                "verdict": "No text provided"
            }

        cleaned = text.strip()
        lower = cleaned.lower()
        sensitive_indicators = []
        risk_score = 0

        # 1. Inspect sensitive cues
        for key, (pattern, description) in SENSITIVE_PATTERNS.items():
            matches = list(re.finditer(pattern, lower, re.IGNORECASE))
            if matches:
                matched_phrases = list(set([m.group(0) for m in matches]))
                severity = "Severe" if key in ["otp_request", "pin_password", "remote_access_malware"] else "High"
                sensitive_indicators.append({
                    "indicator": key,
                    "title": description,
                    "matched_snippets": matched_phrases,
                    "severity": severity
                })
                risk_score += 35 if severity == "Severe" else 20

        # 2. Extract and inspect embedded URLs
        url_regex = r"(https?://[^\s<>\"'{}|\\^`]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/[^\s<>\"'{}|\\^`]*)"
        found_urls = re.findall(url_regex, cleaned)
        url_inspections = []

        for raw_url in set(found_urls):
            # Exclude trailing punctuation
            clean_url = raw_url.rstrip(".,;:!?)")
            url_res = PhishingDetector.inspect_url(clean_url)
            url_inspections.append(url_res)
            risk_score += int(url_res.get("risk_score", 0) * 0.4)

        risk_score = min(100, risk_score)

        if risk_score >= 70:
            verdict = "High Phishing & Social Engineering Threat"
            badge = "danger"
        elif risk_score >= 35:
            verdict = "Suspicious Communication / Caution Required"
            badge = "warning"
        elif risk_score > 0:
            verdict = "Low Risk / Minor Alerts"
            badge = "info"
        else:
            verdict = "No Obvious Phishing Patterns Detected"
            badge = "safe"

        # Actionable recommendations
        recs = []
        if any(ind["indicator"] == "otp_request" for ind in sensitive_indicators):
            recs.append("CRITICAL: Legitimate organizations (banks, Instagram, Google) will NEVER ask you to forward or disclose an OTP.")
        if any(ind["indicator"] == "remote_access_malware" for ind in sensitive_indicators):
            recs.append("CRITICAL: NEVER install AnyDesk, TeamViewer, or APK files requested by someone contacting you via phone or SMS.")
        if any(ind["indicator"] == "financial_urgency" for ind in sensitive_indicators):
            recs.append("Urgency is a classic psychological trap. Verify directly by calling your bank's official number on the back of your card.")
        if url_inspections:
            recs.append("Embedded links detected. Avoid tapping them on your mobile device.")
        if not recs:
            recs.append("Remember to keep your passwords unique and enable multi-factor authentication (2FA).")

        return {
            "text_provided": True,
            "verdict": verdict,
            "badge": badge,
            "risk_score": risk_score,
            "sensitive_indicators": sensitive_indicators,
            "urls_inspected": url_inspections,
            "recommendations": recs,
            "disclaimer": "Analysis identifies known deceptive patterns. Scammers continuously adapt, so always verify through official trusted channels."
        }
