import { useEffect } from 'react'

export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  tipo = 'warning',
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (abierto) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  if (!abierto) return null

  const config = {
    warning: {
      icon: 'warning',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
    danger: {
      icon: 'delete',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      btnClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
    info: {
      icon: 'info',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      btnClass: 'bg-primary hover:bg-primary/90 text-white',
    },
    success: {
      icon: 'check_circle',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      btnClass: 'bg-green-600 hover:bg-green-700 text-white',
    },
  }[tipo]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">

        {/* Contenido */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-2xl ${config.iconColor}`}>
                {config.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-on-surface text-lg mb-1">{titulo}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{mensaje}</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 bg-gray-50 border-t border-outline-variant/20 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-on-surface-variant border border-outline-variant hover:bg-gray-100 transition-colors">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${config.btnClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}