import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function useNotificaciones(onNotificacion) {
  const { usuario } = useAuth()
  const ws = useRef(null)
  const [conectado, setConectado] = useState(false)
  const reconnectTimeout = useRef(null)

  useEffect(() => {
    if (!usuario?.id) return

    const token = localStorage.getItem('token')
    if (!token) return

    const conectar = () => {
      const socket = new WebSocket(
        `ws://127.0.0.1:8001/ws/${usuario.id}?token=${token}`
      )

      socket.onopen = () => {
        setConectado(true)
        // Ping cada 30 segundos para mantener conexión viva
        const ping = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send('ping')
          }
        }, 30000)
        socket._ping = ping
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.tipo !== 'pong' && data.tipo !== 'conexion') {
            onNotificacion(data)
          }
        } catch {}
      }

      socket.onclose = () => {
        setConectado(false)
        clearInterval(socket._ping)
        // Reconectar tras 3 segundos
        reconnectTimeout.current = setTimeout(conectar, 3000)
      }

      socket.onerror = () => {
        socket.close()
      }

      ws.current = socket
    }

    conectar()

    return () => {
      clearTimeout(reconnectTimeout.current)
      if (ws.current) ws.current.close()
    }
  }, [usuario?.id])

  return { conectado }
}