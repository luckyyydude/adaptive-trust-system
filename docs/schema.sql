-- Adaptive Trust-Based Decision System — PostgreSQL Schema
-- Run this if you prefer manual setup over SQLAlchemy auto-create

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR UNIQUE NOT NULL,
    ip_address VARCHAR,
    user_agent TEXT,
    device_fingerprint VARCHAR,
    country VARCHAR,
    isp VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    is_terminated BOOLEAN DEFAULT FALSE,
    termination_reason VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trust_scores (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    user_id INTEGER REFERENCES users(id),
    overall_score FLOAT,
    behavioral_score FLOAT,
    contextual_score FLOAT,
    historical_score FLOAT,
    session_stability_score FLOAT,
    risk_level VARCHAR,
    explanation JSONB,
    action_taken VARCHAR,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trust_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    average_trust FLOAT,
    total_sessions INTEGER DEFAULT 0,
    flagged_sessions INTEGER DEFAULT 0,
    last_known_ip VARCHAR,
    last_known_device VARCHAR,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE behavior_events (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    event_type VARCHAR,
    event_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trust_scores_user ON trust_scores(user_id);
CREATE INDEX idx_trust_scores_session ON trust_scores(session_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_behavior_session ON behavior_events(session_id);
