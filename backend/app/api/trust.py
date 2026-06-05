from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import TrustEvaluationRequest, TrustScoreOut
from app.models.models import TrustScore, TrustHistory, Session as SessionModel, User
from app.services.trust_engine import full_trust_evaluation
from typing import List
from datetime import datetime

router = APIRouter()

@router.post("/evaluate", response_model=dict)
def evaluate_trust(req: TrustEvaluationRequest, db: Session = Depends(get_db)):
    db_session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    history = db.query(TrustHistory).filter(TrustHistory.user_id == req.user_id).first()

    data = req.dict()
    if history:
        data["known_ip"] = history.last_known_ip or ""
        data["known_device"] = history.last_known_device or ""
        data["known_country"] = ""
        data["total_sessions"] = history.total_sessions
        data["flagged_sessions"] = history.flagged_sessions
        data["average_past_trust"] = history.average_trust
    else:
        data["known_ip"] = ""
        data["known_device"] = ""
        data["known_country"] = ""
        data["total_sessions"] = 0
        data["flagged_sessions"] = 0
        data["average_past_trust"] = 70.0

    session_age = (datetime.utcnow() - db_session.created_at.replace(tzinfo=None)).total_seconds()
    data["session_age_seconds"] = session_age
    data["event_count"] = len(db_session.events)

    result = full_trust_evaluation(data)

    trust_record = TrustScore(
        session_id=req.session_id,
        user_id=req.user_id,
        overall_score=result["overall_score"],
        behavioral_score=result["behavioral_score"],
        contextual_score=result["contextual_score"],
        historical_score=result["historical_score"],
        session_stability_score=result["session_stability_score"],
        risk_level=result["risk_level"],
        explanation=result["explanation"],
        action_taken=result["action_taken"],
    )
    db.add(trust_record)

    # Apply kill switch
    if result["action_taken"] == "TERMINATE":
        db_session.is_terminated = True
        db_session.is_active = False
        db_session.termination_reason = "Kill switch triggered: trust score critical"
        user = db.query(User).filter(User.id == req.user_id).first()
        if user:
            user.is_locked = True

    # Update history
    if not history:
        history = TrustHistory(
            user_id=req.user_id,
            average_trust=result["overall_score"],
            total_sessions=1,
            flagged_sessions=1 if result["risk_level"] in ["HIGH", "CRITICAL"] else 0,
            last_known_ip=req.ip_address,
            last_known_device=req.device_fingerprint,
        )
        db.add(history)
    else:
        history.total_sessions += 1
        if result["risk_level"] in ["HIGH", "CRITICAL"]:
            history.flagged_sessions += 1
        history.average_trust = (history.average_trust * (history.total_sessions - 1) + result["overall_score"]) / history.total_sessions
        history.last_known_ip = req.ip_address
        history.last_known_device = req.device_fingerprint

    db.commit()
    return result

@router.get("/history/{user_id}", response_model=List[dict])
def get_trust_history(user_id: int, db: Session = Depends(get_db)):
    scores = db.query(TrustScore).filter(TrustScore.user_id == user_id).order_by(TrustScore.computed_at.desc()).limit(50).all()
    return [
        {
            "overall_score": s.overall_score,
            "behavioral_score": s.behavioral_score,
            "contextual_score": s.contextual_score,
            "historical_score": s.historical_score,
            "session_stability_score": s.session_stability_score,
            "risk_level": s.risk_level,
            "action_taken": s.action_taken,
            "explanation": s.explanation,
            "computed_at": s.computed_at.isoformat(),
        }
        for s in scores
    ]

@router.get("/latest/{session_id}", response_model=dict)
def get_latest_trust(session_id: int, db: Session = Depends(get_db)):
    score = db.query(TrustScore).filter(TrustScore.session_id == session_id).order_by(TrustScore.computed_at.desc()).first()
    if not score:
        raise HTTPException(status_code=404, detail="No trust score found for session")
    return {
        "overall_score": score.overall_score,
        "behavioral_score": score.behavioral_score,
        "contextual_score": score.contextual_score,
        "historical_score": score.historical_score,
        "session_stability_score": score.session_stability_score,
        "risk_level": score.risk_level,
        "action_taken": score.action_taken,
        "explanation": score.explanation,
        "computed_at": score.computed_at.isoformat(),
    }
