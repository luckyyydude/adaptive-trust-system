from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.trust_engine import full_trust_evaluation
import json
import asyncio

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        self.active_connections.pop(session_id, None)

    async def send_trust_update(self, session_id: str, data: dict):
        ws = self.active_connections.get(session_id)
        if ws:
            await ws.send_text(json.dumps(data))

manager = ConnectionManager()

@router.websocket("/trust/{session_id}")
async def trust_websocket(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            result = full_trust_evaluation(data)
            await manager.send_trust_update(session_id, result)
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        await websocket.send_text(json.dumps({"error": str(e)}))
        manager.disconnect(session_id)
