import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'

const fmt = (n) => '$' + (n || 0).toLocaleString('es-CL')

export default function PagoCotizacion() {
  const navigate = useNavigate()
  const { cotizacionId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagando, setPagando] = useState(false)
  const [pagado, setPagado] = useState(false)
  const [error, setError] = useState('')

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
  ]

  useEffect(() => {
    api.get(`/cotizaciones/${cotizacionId}/desglose-pago`)
      .then(res => setData(res.data))
      .catch(() => setError('No se pudo cargar el detalle de pago'))
      .finally(() => setLoading(false))
  }, [cotizacionId])

  const descargarComprobante = async () => {
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
    }
  }

  const confirmarPago = async () => {
    setPagando(true)
    // Simulación de procesamiento de pago
    setTimeout(async () => {
      setPagado(true)
      setPagando(false)
      await descargarComprobante()
    }, 1500)
  }

  if (loading) {
    return (
      <div className="bg-[#f4f8f2] min-h-screen flex">
        <Sidebar navItems={navItems} tipo="agricultor" />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <LoadingSpinner texto="Cargando detalle de pago..." />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-[#f4f8f2] min-h-screen flex">
        <Sidebar navItems={navItems} tipo="agricultor" />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">error_outline</span>
            <p className="text-on-surface-variant mb-4">{error || 'No se encontró la información'}</p>
            <button onClick={() => navigate('/pedidos')}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90">
              Ir a Pedidos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo="agricultor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Pago de Compra" />
        <main className="flex-1 p-5 md:p-8 max-w-4xl mx-auto w-full">

          {pagado ? (
            // Pantalla de éxito
            <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">¡Pago realizado con éxito!</h2>
              <p className="text-on-surface-variant mb-2">
                Tu compra con <span className="font-semibold">{data.proveedor}</span> se ha completado.
              </p>
              <p className="text-sm text-on-surface-variant mb-8">
                El comprobante se descargó automáticamente.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-on-surface-variant">Total pagado</span>
                  <span className="font-bold text-primary text-lg">{fmt(data.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Comprobante</span>
                  <span>CT-{String(cotizacionId).padStart(5, '0')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={descargarComprobante}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-semibold text-sm hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Descargar comprobante
                </button>
                <button onClick={() => navigate('/pedidos')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Ver mis pedidos
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : (
            // Pantalla de checkout
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-on-surface">Resumen de tu compra</h2>
                <p className="text-sm text-on-surface-variant">
                  Lista: <span className="font-semibold">{data.lista_titulo}</span> · Proveedor: <span className="font-semibold">{data.proveedor}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Detalle de items */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-outline-variant/30">
                    <h3 className="font-bold text-on-surface">Productos</h3>
                  </div>
                  <div className="divide-y divide-outline-variant/20">
                    {data.items.map((item, i) => (
                      <div key={i} className="p-5 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm text-on-surface">{item.nombre}</p>
                          <p className="text-xs text-on-surface-variant">
                            {fmt(item.precio_unitario)} × {item.cantidad}
                          </p>
                        </div>
                        <span className="font-semibold text-sm text-on-surface">{fmt(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desglose de pago */}
                <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 h-fit">
                  <h3 className="font-bold text-on-surface mb-4">Desglose</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Subtotal</span>
                      <span className="text-on-surface">{fmt(data.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">
                        Comisión ({data.comision_porcentaje}%)
                      </span>
                      <span className="text-on-surface">{fmt(data.comision_agricultor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">
                        IVA ({data.iva_porcentaje}%)
                      </span>
                      <span className="text-on-surface">{fmt(data.iva)}</span>
                    </div>
                    <div className="border-t border-outline-variant/30 pt-3 flex justify-between items-center">
                      <span className="font-bold text-on-surface">Total</span>
                      <span className="text-2xl font-bold text-primary">{fmt(data.total)}</span>
                    </div>
                  </div>

                  <button onClick={confirmarPago} disabled={pagando}
                    className="w-full mt-6 bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {pagando ? (
                      <>
                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">lock</span>
                        Confirmar y Pagar
                      </>
                    )}
                  </button>

                  <p className="text-xs text-on-surface-variant/70 text-center mt-3">
                    Pago simulado · Comprobante sin validez tributaria
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}