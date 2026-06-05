from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import SessionCreate, SessionOut
from app.models.models import Session as SessionModel, BehaviorEvent
from typing import List
import uuid

router = APIRouter()

@router.post("/create", response_model=SessionOut)
def create_session(data: SessionCreate, db: Session = Depends(get_db)):
    session = SessionModel(
        user_id=data.user_id,
        session_token=str(uuid.uuid4()),
        ip_address=data.ip_address,
        user_agent=data.user_agent,
        device_fingerprint=data.device_fingerprint,
        country=data.country,
        isp=data.isp,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/{session_id}", response_model=dict)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": session.id,
        "user_id": session.user_id,
        "session_token": session.session_token,
        "ip_address": session.ip_address,
        "is_active": session.is_active,
        "is_terminated": session.is_terminated,
        "termination_reason": session.termination_reason,
        "created_at": session.created_at.isoformat(),
    }

@router.get("/user/{user_id}", response_model=List[dict])
def get_user_sessions(user_id: int, db: Session = Depends(get_db)):
    sessions = db.query(SessionModel).filter(SessionModel.user_id == user_id).order_by(SessionModel.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "session_token": s.session_token,
            "ip_address": s.ip_address,
            "is_active": s.is_active,
            "is_terminated": s.is_terminated,
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]

@router.post("/event")
def log_event(event: dict, db: Session = Depends(get_db)):
    session_id = event.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    be = BehaviorEvent(
        session_id=session_id,
        event_type=event.get("event_type", "generic"),
        event_data=event.get("event_data", {}),
    )
    db.add(be)
    db.commit()
    return {"message": "Event logged"}

@router.post("/{session_id}/terminate")
def terminate_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_terminated = True
    session.is_active = False
    session.termination_reason = "Manual termination"
    db.commit()
    return {"message": "Session terminated"}
