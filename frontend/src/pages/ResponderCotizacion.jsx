import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import logo from '../assets/logo.png'

export default function ResponderCotizacion() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const alerta = location.state?.alerta

  const [precios, setPrecios] = useState({})
  const [cantidades, setCantidades] = useState({})
  const [nota, setNota] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard' },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes', active: true },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  if (!alerta) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9ff]">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">No se encontró la solicitud.</p>
          <button onClick={() => navigate('/proveedor/solicitudes')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm">
            Volver a Solicitudes
          </button>
        </div>
      </div>
    )
  }

  const calcularTotal = () => {
    return alerta.items.reduce((acc, item) => {
      const precio = parseFloat(precios[item.id] || 0)
      const cantidad = parseFloat(cantidades[item.id] || item.cantidad)
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

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full p-4 w-64 z-50 bg-white border-r border-outline-variant/30">
        <div className="flex items-center gap-3 p-2 mb-6">
          <img src={logo} alt="CultivaTech" className="h-10 w-10 object-contain rounded-lg" />
          <div>
            <h1 className="font-bold text-primary text-base">CultivaTech</h1>
            <p className="text-xs text-on-surface-variant">Portal Proveedor</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {navItems.map(item => (
            <a key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all
                ${item.active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-outline-variant/30 px-2">
          <a onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-6 md:p-10 min-h-screen">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">
              Responder Solicitud
            </h1>
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start max-w-6xl">

          {/* Left - Detalles solicitud */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4 pb-6 border-b border-outline-variant/30 mb-6">
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-2xl font-bold text-on-secondary-container shrink-0">
                {alerta.agricultor_nombre?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">{alerta.agricultor_nombre}</h2>
                {alerta.agricultor_region && (
                  <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined" style={{fontSize:'18px'}}>location_on</span>
                    {alerta.agricultor_region}
                  </p>
                )}
              </div>
            </div>

            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Ítems Solicitados</h3>
            <div className="flex flex-col gap-3">
              {alerta.items.map(item => (
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
                  {item.nota && <p className="text-xs text-on-surface-variant mt-2 italic">"{item.nota}"</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Formulario */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-6 pb-4 border-b border-outline-variant/30">Tu Cotización</h2>

            <form onSubmit={handleEnviar} className="flex flex-col gap-5">
              {alerta.items.map(item => (
                <div key={item.id} className="p-5 border border-outline-variant/30 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <h4 className="font-semibold text-sm text-on-surface mb-4">{item.insumo_nombre}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Precio Unitario</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                        <input type="number" placeholder="0.00" required
                          value={precios[item.id] || ''}
                          onChange={e => setPrecios({ ...precios, [item.id]: e.target.value })}
                          className="w-full pl-8 pr-3 py-2.5 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Cantidad Disponible</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder={item.cantidad} required
                          value={cantidades[item.id] || ''}
                          onChange={e => setCantidades({ ...cantidades, [item.id]: e.target.value })}
                          className="w-full px-3 py-2.5 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-sm" />
                        <span className="text-xs text-on-surface-variant shrink-0">{item.unidad_medida}</span>
                      </div>
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
              ))}

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
  )
}