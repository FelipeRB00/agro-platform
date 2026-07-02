import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import { API_URL } from '../config'

const fmt = (n) => '$' + (n || 0).toLocaleString('es-CL')

export default function PagoCotizacion() {
  const navigate = useNavigate()
  const { cotizacionId } = useParams()
  const [params] = useSearchParams()
  const metodo = params.get('metodo') || 'contado'  // contado o credito

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [generada, setGenerada] = useState(false)
  const [error, setError] = useState('')

  const esCredito = metodo === 'credito'

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
      .catch(() => setError('No se pudo cargar el detalle de la orden'))
      .finally(() => setLoading(false))
  }, [cotizacionId])

  const descargarOrden = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${API_URL}/reportes/comprobante/${cotizacionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orden_compra_OC-${String(cotizacionId).padStart(5, '0')}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Error al descargar la orden de compra')
    }
  }

  // Generar la orden de compra
  const generarOrden = async () => {
    setGenerando(true)
    setTimeout(async () => {
      setGenerada(true)
      setGenerando(false)
      await descargarOrden()
    }, 1200)
  }

  // Calcular fecha de vencimiento (para crédito)
  const fechaVencimiento = () => {
    if (!esCredito || !data?.dias_credito) return null
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + data.dias_credito)
    return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="bg-[#f4f8f2] min-h-screen flex">
        <Sidebar navItems={navItems} tipo="agricultor" />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <LoadingSpinner texto="Cargando orden de compra..." />
        </div>
      </div>
    )
  }

  if (error && !data) {
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
        <Header titulo="Orden de Compra" />
        <main className="flex-1 p-5 md:p-8 max-w-4xl mx-auto w-full">

          {generada ? (
            // Pantalla de éxito
            <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl text-green-600">task</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">¡Orden de compra generada!</h2>
              <p className="text-on-surface-variant mb-2">
                Tu orden con <span className="font-semibold">{data.proveedor}</span> quedó registrada.
              </p>
              <p className="text-sm text-on-surface-variant mb-1">
                Método de pago: <span className="font-semibold">{esCredito ? `Crédito a ${data.dias_credito} días` : 'Contado'}</span>
              </p>
              {esCredito && (
                <p className="text-sm text-blue-700 font-semibold mb-2">
                  Compromiso de pago: {fechaVencimiento()}
                </p>
              )}
              <p className="text-sm text-on-surface-variant mb-8">
                La orden se descargó automáticamente. El pago se gestiona a través del sistema de la empresa.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-on-surface-variant">Total de la orden</span>
                  <span className="font-bold text-primary text-lg">{fmt(data.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>N° de orden</span>
                  <span>OC-{String(cotizacionId).padStart(5, '0')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={descargarOrden}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-semibold text-sm hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Descargar orden
                </button>
                <button onClick={() => navigate('/pedidos')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Ver mis pedidos
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : (
            // Pantalla de revisión de la orden
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-on-surface">Revisa tu orden de compra</h2>
                <p className="text-sm text-on-surface-variant">
                  Lista: <span className="font-semibold">{data.lista_titulo}</span> · Proveedor: <span className="font-semibold">{data.proveedor}</span>
                </p>
              </div>

              {/* Banner del método de pago */}
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border
                ${esCredito ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                <span className={`material-symbols-outlined ${esCredito ? 'text-blue-600' : 'text-green-600'}`}>
                  {esCredito ? 'schedule' : 'payments'}
                </span>
                <div>
                  <p className={`font-semibold ${esCredito ? 'text-blue-800' : 'text-green-800'}`}>
                    {esCredito ? `Pago a crédito (${data.dias_credito} días)` : 'Pago al contado'}
                  </p>
                  <p className={`text-sm ${esCredito ? 'text-blue-700' : 'text-green-700'}`}>
                    {esCredito
                      ? `Compromiso de pago antes del ${fechaVencimiento()}. Quedará estipulado en la orden.`
                      : 'El pago se realiza directamente al proveedor según el método de la empresa.'}
                  </p>
                </div>
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

                {/* Resumen */}
                <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 h-fit">
                  <h3 className="font-bold text-on-surface mb-4">Resumen</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Subtotal</span>
                      <span className="text-on-surface">{fmt(data.subtotal)}</span>
                    </div>
                    <div className="border-t border-outline-variant/30 pt-3 flex justify-between items-center">
                      <span className="font-bold text-on-surface">Total orden</span>
                      <span className="text-2xl font-bold text-primary">{fmt(data.total)}</span>
                    </div>
                  </div>

                  <button onClick={generarOrden} disabled={generando}
                    className="w-full mt-6 bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {generando ? (
                      <>
                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                        Generando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">receipt_long</span>
                        Generar Orden de Compra
                      </>
                    )}
                  </button>

                  <p className="text-xs text-on-surface-variant/70 text-center mt-3">
                    El pago se gestiona a través del sistema de la empresa
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