from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sessions = relationship("Session", back_populates="user")
    trust_history = relationship("TrustHistory", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_token = Column(String, unique=True, index=True)
    ip_address = Column(String)
    user_agent = Column(String)
    device_fingerprint = Column(String)
    country = Column(String, nullable=True)
    isp = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_terminated = Column(Boolean, default=False)
    termination_reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="sessions")
    trust_scores = relationship("TrustScore", back_populates="session")
    events = relationship("BehaviorEvent", back_populates="session")

class TrustScore(Base):
    __tablename__ = "trust_scores"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    overall_score = Column(Float)
    behavioral_score = Column(Float)
    contextual_score = Column(Float)
    historical_score = Column(Float)
    session_stability_score = Column(Float)
    risk_level = Column(String)
    explanation = Column(JSON)
    action_taken = Column(String)
    computed_at = Column(DateTime(timezone=True), server_default=func.now())
    session = relationship("Session", back_populates="trust_scores")

class TrustHistory(Base):
    __tablename__ = "trust_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    average_trust = Column(Float)
    total_sessions = Column(Integer)
    flagged_sessions = Column(Integer)
    last_known_ip = Column(String)
    last_known_device = Column(String)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="trust_history")

class BehaviorEvent(Base):
    __tablename__ = "behavior_events"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    event_type = Column(String)
    event_data = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    session = relationship("Session", back_populates="events")
