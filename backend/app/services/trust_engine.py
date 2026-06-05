import math
from typing import Dict, Any, List
from app.core.config import settings

SUSPICIOUS_ISPS = ["tor", "vpn", "proxy", "anonymous", "datacenter"]
SUSPICIOUS_COUNTRIES = ["XX", "T1"]

def compute_behavioral_score(
    click_frequency: float,
    navigation_events: int,
    time_on_page: float,
    inactivity_seconds: float
) -> float:
    score = 100.0
    # Penalize abnormally high click frequency (bot-like)
    if click_frequency > 10:
        score -= min(40, (click_frequency - 10) * 3)
    elif click_frequency < 0.1 and navigation_events > 5:
        score -= 20
    # Penalize very short time on page with many navigations
    if time_on_page < 2 and navigation_events > 10:
        score -= 30
    # Penalize long inactivity (trust degrades)
    if inactivity_seconds > 300:
        decay = min(40, (inactivity_seconds - 300) / 60 * 5)
        score -= decay
    return max(0.0, min(100.0, score))

def compute_contextual_score(
    ip_address: str,
    device_fingerprint: str,
    country: str,
    isp: str,
    login_hour: int,
    known_ip: str = "",
    known_device: str = "",
    known_country: str = ""
) -> float:
    score = 100.0
    # IP consistency
    if known_ip and ip_address != known_ip:
        score -= 15
    # Device consistency
    if known_device and device_fingerprint != known_device:
        score -= 20
    # Country consistency
    if known_country and country != known_country:
        score -= 25
    # Suspicious ISP
    isp_lower = isp.lower()
    if any(s in isp_lower for s in SUSPICIOUS_ISPS):
        score -= 30
    # Suspicious country
    if country in SUSPICIOUS_COUNTRIES:
        score -= 20
    # Unusual login hour (2am - 5am)
    if 2 <= login_hour <= 5:
        score -= 10
    return max(0.0, min(100.0, score))

def compute_historical_score(
    total_sessions: int,
    flagged_sessions: int,
    average_past_trust: float
) -> float:
    if total_sessions == 0:
        return 60.0  # neutral for new users
    flag_ratio = flagged_sessions / total_sessions
    base = average_past_trust
    penalty = flag_ratio * 40
    return max(0.0, min(100.0, base - penalty))

def compute_session_stability_score(
    session_age_seconds: float,
    event_count: int,
    is_new_device: bool
) -> float:
    score = 100.0
    # New device penalty
    if is_new_device:
        score -= 20
    # Very new session with many events (suspicious burst)
    if session_age_seconds < 30 and event_count > 20:
        score -= 35
    # Non-linear trust recovery for older stable sessions
    if session_age_seconds > 600:
        recovery = min(15, math.log(session_age_seconds / 60) * 3)
        score = min(100.0, score + recovery)
    return max(0.0, min(100.0, score))

def compute_overall_trust(
    behavioral: float,
    contextual: float,
    historical: float,
    session_stability: float
) -> float:
    w = settings.TRUST_WEIGHTS
    return (
        behavioral * w["behavioral"] +
        contextual * w["contextual"] +
        historical * w["historical"] +
        session_stability * w["session_stability"]
    )

def determine_risk_level(score: float) -> str:
    if score >= 80:
        return "LOW"
    elif score >= 50:
        return "MEDIUM"
    elif score >= 20:
        return "HIGH"
    return "CRITICAL"

def determine_action(score: float) -> str:
    if score >= settings.VERIFY_THRESHOLD:
        return "ALLOW"
    elif score >= settings.RESTRICT_THRESHOLD:
        return "REQUIRE_OTP"
    elif score >= settings.KILL_SWITCH_THRESHOLD:
        return "RESTRICT"
    return "TERMINATE"

def generate_explanation(
    behavioral: float,
    contextual: float,
    historical: float,
    session_stability: float,
    overall: float,
    ip_changed: bool,
    device_changed: bool,
    country_changed: bool,
    suspicious_isp: bool,
    unusual_hour: bool,
    high_click_rate: bool,
    long_inactivity: bool,
) -> Dict[str, Any]:
    positives = []
    negatives = []

    if behavioral >= 75:
        positives.append("Normal interaction pattern")
    if contextual >= 75:
        positives.append("Trusted device and network")
    if historical >= 75:
        positives.append("Strong session history")
    if session_stability >= 75:
        positives.append("Stable session")
    if not ip_changed:
        positives.append("Consistent IP address")
    if not device_changed:
        positives.append("Recognized device")

    if ip_changed:
        negatives.append("New IP address detected")
    if device_changed:
        negatives.append("Unrecognized device")
    if country_changed:
        negatives.append("Login from new country")
    if suspicious_isp:
        negatives.append("Suspicious network (VPN/Proxy)")
    if unusual_hour:
        negatives.append("Unusual login time")
    if high_click_rate:
        negatives.append("Abnormal click frequency")
    if long_inactivity:
        negatives.append("Extended inactivity detected")

    suggestion = ""
    if overall < 80 and overall >= 50:
        suggestion = "Complete OTP verification to restore full access."
    elif overall < 50 and overall >= 20:
        suggestion = "Re-authenticate and verify your identity to continue."
    elif overall < 20:
        suggestion = "Session has been terminated due to extreme risk. Contact support."

    return {
        "positives": positives,
        "negatives": negatives,
        "suggestion": suggestion,
        "scores": {
            "behavioral": round(behavioral, 1),
            "contextual": round(contextual, 1),
            "historical": round(historical, 1),
            "session_stability": round(session_stability, 1),
        }
    }

def full_trust_evaluation(data: Dict[str, Any]) -> Dict[str, Any]:
    behavioral = compute_behavioral_score(
        click_frequency=data.get("click_frequency", 1.0),
        navigation_events=data.get("navigation_events", 5),
        time_on_page=data.get("time_on_page", 60.0),
        inactivity_seconds=data.get("inactivity_seconds", 0.0),
    )

    ip_changed = data.get("known_ip", "") != "" and data.get("ip_address", "") != data.get("known_ip", "")
    device_changed = data.get("known_device", "") != "" and data.get("device_fingerprint", "") != data.get("known_device", "")
    country_changed = data.get("known_country", "") != "" and data.get("country", "") != data.get("known_country", "")
    suspicious_isp = any(s in data.get("isp", "").lower() for s in SUSPICIOUS_ISPS)
    unusual_hour = 2 <= data.get("login_hour", 12) <= 5
    high_click_rate = data.get("click_frequency", 1.0) > 10
    long_inactivity = data.get("inactivity_seconds", 0.0) > 300

    contextual = compute_contextual_score(
        ip_address=data.get("ip_address", ""),
        device_fingerprint=data.get("device_fingerprint", ""),
        country=data.get("country", ""),
        isp=data.get("isp", ""),
        login_hour=data.get("login_hour", 12),
        known_ip=data.get("known_ip", ""),
        known_device=data.get("known_device", ""),
        known_country=data.get("known_country", ""),
    )

    historical = compute_historical_score(
        total_sessions=data.get("total_sessions", 0),
        flagged_sessions=data.get("flagged_sessions", 0),
        average_past_trust=data.get("average_past_trust", 70.0),
    )

    session_stability = compute_session_stability_score(
        session_age_seconds=data.get("session_age_seconds", 0.0),
        event_count=data.get("event_count", 0),
        is_new_device=device_changed,
    )

    overall = compute_overall_trust(behavioral, contextual, historical, session_stability)
    risk_level = determine_risk_level(overall)
    action = determine_action(overall)

    explanation = generate_explanation(
        behavioral, contextual, historical, session_stability, overall,
        ip_changed, device_changed, country_changed,
        suspicious_isp, unusual_hour, high_click_rate, long_inactivity
    )

    return {
        "overall_score": round(overall, 2),
        "behavioral_score": round(behavioral, 2),
        "contextual_score": round(contextual, 2),
        "historical_score": round(historical, 2),
        "session_stability_score": round(session_stability, 2),
        "risk_level": risk_level,
        "action_taken": action,
        "explanation": explanation,
    }
