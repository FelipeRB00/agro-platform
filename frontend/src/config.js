// Configuración central de URLs del backend.
// En desarrollo usa localhost; en producción (Vercel) usa la variable VITE_API_URL.

// URL base del backend SIN el /api/v1 (para imágenes y websockets)
export const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'

// URL de la API REST (con el /api/v1)
export const API_URL = `${API_BASE}/api/v1`

// URL para WebSockets (ws:// o wss:// según el protocolo)
export const WS_BASE = API_BASE.replace('http://', 'ws://').replace('https://', 'wss://')