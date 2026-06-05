from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import trust, sessions, users, websocket
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Adaptive Trust-Based Decision System",
    description="Dynamic trust evaluation for digital platforms",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
app.include_router(trust.router, prefix="/api/trust", tags=["Trust"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])

@app.get("/")
def root():
    return {"message": "Adaptive Trust-Based Decision System API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
