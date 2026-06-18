import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import ErrorMessage from '../components/ErrorMessage'

export default function ResponderCotizacion() {
  const navigate = useNavigate()
  const location = useLocation()
  const alerta = location.state?.alerta

  const [precios, setPrecios] = useState({})
  const [cantidades, setCantidades] = useState({})
  const [nota, setNota] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [catalogo, setCatalogo] = useState([])

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard' },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes', active: true },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  // Buscar producto en el catálogo por nombre del insumo
  const buscarEnCatalogo = (nombreInsumo) => {
    if (!nombreInsumo) return null
    return catalogo.find(c =>
      (c.nombre || '').toLowerCase() === nombreInsumo.toLowerCase()
    )
  }

  // Cargar catálogo del proveedor y pre-rellenar precios
  useEffect(() => {
    if (!alerta) return
    api.get('/catalogo/')
      .then(res => {
        setCatalogo(res.data)
        // Pre-rellenar precios con el precio de referencia del catálogo
        const preciosIniciales = {}
        alerta.items.forEach(item => {
          const prod = res.data.find(c =>
            (c.nombre || '').toLowerCase() === (item.insumo_nombre || '').toLowerCase()
          )
          if (prod && prod.precio_referencia) {
            preciosIniciales[item.id] = prod.precio_referencia
          }
        })
        setPrecios(preciosIniciales)
      })
      .catch(() => { })
  }, [alerta])

  if (!alerta) {
    return (
      <div className="bg-[#f9f9ff] min-h-screen flex">
        <Sidebar navItems={navItems} tipo="proveedor" />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">error_outline</span>
            <p className="text-on-surface-variant mb-4">No se encontró la solicitud.</p>
            <button onClick={() => navigate('/proveedor/solicitudes')}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
              Volver a Solicitudes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const calcularTotal = () => {
    return alerta.items.reduce((acc, item) => {
      const precio = parseFloat(precios[item.id] || 0)
      const cantidad = parseFloat(cantidades[item.id] || 0)
      return acc + (precio * cantidad)
    }, 0)
  }

  const handleEnviar = async (e) => {
    e.preventDefault()
    const incompletos = alerta.items.some(item => !precios[item.id] || !cantidades[item.id])
    if (incompletos) {
      setError('Completa el precio y cantidad para todos los ítems')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/cotizaciones/', {
        lista_id: alerta.lista_id,
        nota: nota || null,
        items: alerta.items.map(item => ({
          item_lista_id: item.id,
          precio_unitario: parseFloat(precios[item.id]),
          cantidad_ofrecida: parseFloat(cantidades[item.id])
        }))
      })
      await api.put(`/alertas/${alerta.alerta_id}/leer`)
      setEnviado(true)
      setTimeout(() => navigate('/proveedor/solicitudes'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar cotización')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#f9f9ff] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo="proveedor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Responder Cotización" />
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">

          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary mb-1">Responder Solicitud</h1>
              <p className="text-on-surface-variant">Lista: <span className="font-semibold">{alerta.titulo_lista}</span></p>
            </div>
            <button onClick={() => navigate('/proveedor/solicitudes')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-on-surface-variant rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
              <span className="material-symbols-outlined">arrow_back</span>
              Volver
            </button>
          </div>

          {enviado && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined">check_circle</span>
              <span className="font-semibold">¡Cotización enviada exitosamente! Redirigiendo...</span>
            </div>
          )}

          {error && <div className="mb-6"><ErrorMessage mensaje={error} /></div>}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

            {/* Detalles solicitud */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4 pb-6 border-b border-outline-variant/30 mb-6">
                <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center text-2xl font-bold text-on-secondary-container shrink-0">
                  {alerta.agricultor_nombre?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">{alerta.agricultor_nombre}</h2>
                  {alerta.agricultor_region && (
                    <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                      {alerta.agricultor_region}
                    </p>
                  )}
                </div>
              </div>

              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Ítems Solicitados</h3>
              <div className="flex flex-col gap-3">
                {alerta.items.map(item => {
                  const prod = buscarEnCatalogo(item.insumo_nombre)
                  return (
                    <div key={item.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-on-surface">{item.insumo_nombre}</h4>
                          <p className="text-xs text-on-surface-variant capitalize">{item.insumo_categoria}</p>
                        </div>
                        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-md text-sm font-bold shrink-0 ml-2">
                          {item.cantidad} {item.unidad_medida}
                        </span>
                      </div>
                      {/* Info del catálogo */}
                      {prod ? (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-3">
                            {prod.imagen_url && (
                              <img src={`http://127.0.0.1:8001${prod.imagen_url}`} alt={prod.nombre}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" />
                            )}
                            <div className="flex-1 text-xs space-y-0.5">
                              <div className="flex items-center gap-4">
                                <span className="text-on-surface-variant">
                                  Tu precio: <span className="font-semibold text-primary">${prod.precio_referencia.toLocaleString('es-CL')}</span>
                                </span>
                                <span className="text-on-surface-variant">
                                  Stock: <span className="font-semibold text-primary">{prod.stock_disponible}</span>
                                </span>
                              </div>
                              {prod.ingrediente_activo && (
                                <p className="text-on-surface-variant">
                                  Ingrediente activo: <span className="font-semibold">{prod.ingrediente_activo}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 pt-2 border-t border-gray-200 text-xs text-amber-600">
                          No tienes este producto en tu catálogo
                        </p>
                      )}
                      {item.nota && <p className="text-xs text-on-surface-variant mt-2 italic">"{item.nota}"</p>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Formulario cotización */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-6 pb-4 border-b border-outline-variant/30">Tu Cotización</h2>

              <form onSubmit={handleEnviar} className="flex flex-col gap-5">
                {alerta.items.map(item => {
                  const prod = buscarEnCatalogo(item.insumo_nombre)
                  const stock = prod ? prod.stock_disponible : null
                  const cantidadIngresada = parseFloat(cantidades[item.id] || 0)
                  const excedeStock = stock !== null && cantidadIngresada > stock

                  return (
                    <div key={item.id} className="p-5 border border-outline-variant/30 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                      <h4 className="font-semibold text-sm text-on-surface mb-4">{item.insumo_nombre}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                            Precio Unitario
                            {prod && (
                              <span className="ml-1 text-primary font-normal">(cat: ${prod.precio_referencia.toLocaleString('es-CL')})</span>
                            )}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                            <input type="number" placeholder="0.00" required min="0.01" step="0.01"
                              value={precios[item.id] || ''}
                              onChange={e => setPrecios({ ...precios, [item.id]: e.target.value })}
                              className="w-full pl-8 pr-3 py-2.5 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                            Cantidad Ofrecida
                            {stock !== null && (
                              <span className="ml-1 text-primary font-normal">(stock: {stock})</span>
                            )}
                          </label>
                          <div className="flex items-center gap-2">
                            <input type="number" placeholder={item.cantidad} required min="0.01" step="0.01"
                              value={cantidades[item.id] || ''}
                              onChange={e => setCantidades({ ...cantidades, [item.id]: e.target.value })}
                              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 outline-none text-sm
                                ${excedeStock
                                  ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                                  : 'border-outline-variant focus:ring-secondary/20 focus:border-secondary'}`} />
                            <span className="text-xs text-on-surface-variant shrink-0">{item.unidad_medida}</span>
                          </div>
                          {excedeStock && (
                            <p className="text-xs text-red-500 mt-1">Supera tu stock disponible ({stock})</p>
                          )}
                        </div>
                      </div>
                      {precios[item.id] && cantidades[item.id] && (
                        <div className="mt-3 text-right text-sm text-on-surface-variant">
                          Subtotal: <span className="font-bold text-primary">
                            ${(parseFloat(precios[item.id]) * parseFloat(cantidades[item.id])).toLocaleString('es-CL')}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {calcularTotal() > 0 && (
                  <div className="bg-secondary-container/20 border border-secondary-container rounded-lg p-4 flex justify-between items-center">
                    <span className="font-semibold text-on-surface">Total Estimado</span>
                    <span className="text-2xl font-bold text-primary">${calcularTotal().toLocaleString('es-CL')}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">Nota Opcional</label>
                  <textarea placeholder="Ej. El flete está incluido en el precio..."
                    value={nota} onChange={e => setNota(e.target.value)}
                    className="w-full p-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-sm h-24 resize-none" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-outline-variant/30">
                  <button type="button" onClick={() => navigate('/proveedor/solicitudes')}
                    className="px-6 py-3 border border-secondary text-secondary rounded-lg font-semibold text-sm hover:bg-secondary/5 transition-colors w-full sm:w-auto text-center">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading || enviado}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                    <span className="material-symbols-outlined">send</span>
                    {loading ? 'Enviando...' : 'Enviar Cotización'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}