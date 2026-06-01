import { useState, useCallback } from 'react'
import { useNotificaciones } from '../hooks/useNotificaciones'
import { useNavigate } from 'react-router-dom'

const iconos = {
  nueva_solicitud: 'pending_actions',
  nueva_cotizacion: 'request_quote',
  cotizacion_aceptada: 'task_alt',
  conexion: 'wifi',
}

const colores = {
  nueva_solicitud: 'border-blue-400 bg-blue-50',
  nueva_cotizacion: 'border-green-400 bg-green-50',
  cotizacion_aceptada: 'border-primary bg-green-50',
}

export default function NotificacionesToast() {
  const [notificaciones, setNotificaciones] = useState([])
  const navigate = useNavigate()

  const handleNotificacion = useCallback((data) => {
    const id = Date.now()
    setNotificaciones(prev => [...prev, { ...data, id }])
    // Auto-eliminar tras 5 segundos
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const { conectado } = useNotificaciones(handleNotificacion)

  const handleClick = (notif) => {
    if (notif.tipo === 'nueva_solicitud') navigate('/proveedor/solicitudes')
    if (notif.tipo === 'nueva_cotizacion') navigate('/cotizaciones')
    eliminar(notif.id)
  }

  const eliminar = (id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id))
  }

  return (
    <>
      {/* Indicador de conexión (pequeño punto) */}
      {conectado && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 bg-white border border-outline-variant/30 rounded-full px-3 py-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-on-surface-variant font-medium">En vivo</span>
        </div>
      )}

      {/* Toast de notificaciones */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full">
        {notificaciones.map(notif => (
          <div key={notif.id}
            onClick={() => handleClick(notif)}
            className={`bg-white border-l-4 rounded-xl shadow-lg p-4 cursor-pointer
              hover:shadow-xl transition-all animate-slide-in
              ${colores[notif.tipo] || 'border-gray-400 bg-gray-50'}`}>
            <div className="flex items-start gap-3">
              <span className={`material-symbols-outlined text-xl shrink-0 ${
                notif.tipo === 'nueva_cotizacion' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {iconos[notif.tipo] || 'notifications'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface">
                  {notif.tipo === 'nueva_solicitud' && 'Nueva Solicitud'}
                  {notif.tipo === 'nueva_cotizacion' && 'Nueva Cotización'}
                  {notif.tipo === 'cotizacion_aceptada' && '¡Cotización Aceptada!'}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                  {notif.mensaje}
                </p>
                <p className="text-xs text-primary font-semibold mt-1">
                  Click para ver →
                </p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); eliminar(notif.id) }}
                className="text-on-surface-variant hover:text-on-surface shrink-0">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}