from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # Diccionario: usuario_id -> lista de conexiones activas
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, usuario_id: int):
        await websocket.accept()
        if usuario_id not in self.active_connections:
            self.active_connections[usuario_id] = []
        self.active_connections[usuario_id].append(websocket)

    def disconnect(self, websocket: WebSocket, usuario_id: int):
        if usuario_id in self.active_connections:
            self.active_connections[usuario_id].remove(websocket)
            if not self.active_connections[usuario_id]:
                del self.active_connections[usuario_id]

    async def send_to_user(self, usuario_id: int, message: dict):
        """Envía mensaje a todas las conexiones activas de un usuario"""
        if usuario_id in self.active_connections:
            conexiones_caidas = []
            for connection in self.active_connections[usuario_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    conexiones_caidas.append(connection)
            # Limpiar conexiones caídas
            for c in conexiones_caidas:
                self.active_connections[usuario_id].remove(c)

    async def broadcast_to_users(self, usuario_ids: List[int], message: dict):
        """Envía mensaje a múltiples usuarios"""
        for uid in usuario_ids:
            await self.send_to_user(uid, message)

    def is_connected(self, usuario_id: int) -> bool:
        return usuario_id in self.active_connections and \
               len(self.active_connections[usuario_id]) > 0

# Instancia global
manager = ConnectionManager()