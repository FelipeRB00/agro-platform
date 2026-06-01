from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_token
from app.models.usuario import Usuario
from app.core.websocket_manager import manager

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/{usuario_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    usuario_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    # Verificar token
    try:
        payload = decode_token(token)
        token_user_id = int(payload.get("sub"))
        if token_user_id != usuario_id:
            await websocket.close(code=4001)
            return
    except Exception:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, usuario_id)
    try:
        # Enviar confirmación de conexión
        await websocket.send_json({
            "tipo": "conexion",
            "mensaje": "Conectado al servidor de notificaciones"
        })
        # Mantener conexión viva esperando mensajes
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"tipo": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, usuario_id)