import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function PagoResultado() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const status = params.get('status')
  const cotizacionId = params.get('cotizacion')
  const [descargando, setDescargando] = useState(false)

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
  ]

  const descargarComprobante = async () => {
    setDescargando(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `http://127.0.0.1:8001/api/v1/reportes/comprobante/${cotizacionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `comprobante_CT-${String(cotizacionId).padStart(5, '0')}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Error al descargar el comprobante')
    } finally {
      setDescargando(false)
    }
  }

  // Configuración visual según el estado
  const config = {
    success: {
      icon: 'check_circle',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      titulo: '¡Pago aprobado!',
      mensaje: 'Tu pago se procesó correctamente a través de MercadoPago.',
      mostrarComprobante: true
    },
    pending: {
      icon: 'schedule',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      titulo: 'Pago pendiente',
      mensaje: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
      mostrarComprobante: false
    },
    failure: {
      icon: 'cancel',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titulo: 'Pago no completado',
      mensaje: 'El pago no se pudo procesar. Puedes intentarlo nuevamente.',
      mostrarComprobante: false
    }
  }

  const c = config[status] || config.failure

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo="agricultor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Resultado del Pago" />
        <main className="flex-1 p-5 md:p-8 max-w-2xl mx-auto w-full flex items-center justify-center">

          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-10 text-center w-full">
            <div className={`w-20 h-20 rounded-full ${c.iconBg} flex items-center justify-center mx-auto mb-6`}>
              <span className={`material-symbols-outlined text-5xl ${c.iconColor}`}>{c.icon}</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">{c.titulo}</h2>
            <p className="text-on-surface-variant mb-8">{c.mensaje}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {c.mostrarComprobante && (
                <button onClick={descargarComprobante} disabled={descargando}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-semibold text-sm hover:bg-primary/5 transition-colors disabled:opacity-60">
                  <span className="material-symbols-outlined text-sm">download</span>
                  {descargando ? 'Descargando...' : 'Descargar comprobante'}
                </button>
              )}

              {status === 'failure' && (
                <button onClick={() => navigate(`/pago/${cotizacionId}`)}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-semibold text-sm hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Intentar de nuevo
                </button>
              )}

              <button onClick={() => navigate('/pedidos')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                Ver mis pedidos
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}