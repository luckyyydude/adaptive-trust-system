from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_locked: bool
    created_at: datetime
    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    user_id: int
    ip_address: str
    user_agent: str
    device_fingerprint: str
    country: Optional[str] = None
    isp: Optional[str] = None

class SessionOut(BaseModel):
    id: int
    user_id: int
    session_token: str
    ip_address: str
    is_active: bool
    is_terminated: bool
    created_at: datetime
    class Config:
        from_attributes = True

class BehaviorEventCreate(BaseModel):
    session_id: int
    event_type: str
    event_data: Dict[str, Any]

class TrustScoreOut(BaseModel):
    session_id: int
    user_id: int
    overall_score: float
    behavioral_score: float
    contextual_score: float
    historical_score: float
    session_stability_score: float
    risk_level: str
    explanation: Dict[str, Any]
    action_taken: str
    computed_at: datetime
    class Config:
        from_attributes = True

class TrustEvaluationRequest(BaseModel):
    session_id: int
    user_id: int
    click_frequency: Optional[float] = 0.0
    navigation_events: Optional[int] = 0
    time_on_page: Optional[float] = 0.0
    ip_address: Optional[str] = ""
    device_fingerprint: Optional[str] = ""
    country: Optional[str] = ""
    isp: Optional[str] = ""
    login_hour: Optional[int] = 12
    inactivity_seconds: Optional[float] = 0.0

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
