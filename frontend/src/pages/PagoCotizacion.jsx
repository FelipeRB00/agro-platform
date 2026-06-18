import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'

const fmt = (n) => '$' + (n || 0).toLocaleString('es-CL')

export default function PagoCotizacion() {
  const navigate = useNavigate()
  const { cotizacionId } = useParams()
  const [params] = useSearchParams()
  const metodo = params.get('metodo') || 'contado'  // contado o credito

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagando, setPagando] = useState(false)
  const [redirigiendo, setRedirigiendo] = useState(false)
  const [pagado, setPagado] = useState(false)
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

  // Pago real con MercadoPago (solo contado)
  const pagarConMercadoPago = async () => {
    setRedirigiendo(true)
    setError('')
    try {
      const res = await api.post(`/pagos/crear-preferencia/${cotizacionId}`)
      window.location.href = res.data.init_point
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar el pago con MercadoPago')
      setRedirigiendo(false)
    }
  }

  // Confirmar (contado simulado o compromiso a crédito)
  const confirmarPago = async () => {
    setPagando(true)
    setTimeout(async () => {
      setPagado(true)
      setPagando(false)
      await descargarComprobante()
    }, 1500)
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
          <LoadingSpinner texto="Cargando detalle de pago..." />
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
        <Header titulo={esCredito ? 'Compra a Crédito' : 'Pago de Compra'} />
        <main className="flex-1 p-5 md:p-8 max-w-4xl mx-auto w-full">

          {pagado ? (
            // Pantalla de éxito
            <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-10 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${esCredito ? 'bg-blue-100' : 'bg-green-100'}`}>
                <span className={`material-symbols-outlined text-5xl ${esCredito ? 'text-blue-600' : 'text-green-600'}`}>
                  {esCredito ? 'event_available' : 'check_circle'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">
                {esCredito ? '¡Compra a crédito registrada!' : '¡Pago realizado con éxito!'}
              </h2>
              <p className="text-on-surface-variant mb-2">
                Tu compra con <span className="font-semibold">{data.proveedor}</span> {esCredito ? 'quedó registrada.' : 'se ha completado.'}
              </p>
              {esCredito && (
                <p className="text-sm text-blue-700 font-semibold mb-2">
                  Fecha de pago comprometida: {fechaVencimiento()}
                </p>
              )}
              <p className="text-sm text-on-surface-variant mb-8">
                El comprobante se descargó automáticamente.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-on-surface-variant">{esCredito ? 'Monto a pagar' : 'Total pagado'}</span>
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
                <h2 className="text-2xl font-bold text-on-surface">
                  {esCredito ? 'Confirmar compra a crédito' : 'Resumen de tu compra'}
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Lista: <span className="font-semibold">{data.lista_titulo}</span> · Proveedor: <span className="font-semibold">{data.proveedor}</span>
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              {/* Banner de crédito */}
              {esCredito && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600">schedule</span>
                  <div>
                    <p className="font-semibold text-blue-800">Compra a crédito ({data.dias_credito} días)</p>
                    <p className="text-sm text-blue-700">
                      No pagas ahora. Te comprometes a pagar al proveedor antes del <span className="font-semibold">{fechaVencimiento()}</span>.
                    </p>
                  </div>
                </div>
              )}

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

                {/* Desglose */}
                <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 h-fit">
                  <h3 className="font-bold text-on-surface mb-4">Desglose</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Subtotal</span>
                      <span className="text-on-surface">{fmt(data.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">
                        Comisión app ({data.comision_porcentaje}%)
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

                  {esCredito ? (
                    // CRÉDITO: confirmar compromiso
                    <>
                      <button onClick={confirmarPago} disabled={pagando}
                        className="w-full mt-6 bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {pagando ? (
                          <>
                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                            Registrando...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-lg">event_available</span>
                            Confirmar compra a crédito
                          </>
                        )}
                      </button>
                      <p className="text-xs text-on-surface-variant/70 text-center mt-3">
                        Se registrará tu compromiso de pago a {data.dias_credito} días
                      </p>
                    </>
                  ) : (
                    // CONTADO: pago normal
                    <>
                      <button onClick={pagarConMercadoPago} disabled={redirigiendo || pagando}
                        className="w-full mt-6 bg-[#009ee3] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#008fcc] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {redirigiendo ? (
                          <>
                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                            Redirigiendo...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-lg">credit_card</span>
                            Pagar con MercadoPago
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-outline-variant/30"></div>
                        <span className="text-xs text-on-surface-variant">o</span>
                        <div className="flex-1 h-px bg-outline-variant/30"></div>
                      </div>

                      <button onClick={confirmarPago} disabled={pagando || redirigiendo}
                        className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {pagando ? (
                          <>
                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-lg">receipt_long</span>
                            Generar comprobante interno
                          </>
                        )}
                      </button>

                      <p className="text-xs text-on-surface-variant/70 text-center mt-3">
                        Pago de prueba · Comprobante sin validez tributaria
                      </p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}