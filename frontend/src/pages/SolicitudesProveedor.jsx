import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import logo from '../assets/logo.png'

export default function SolicitudesProveedor() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard' },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes', active: true },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  useEffect(() => {
    api.get('/alertas/')
      .then(res => setAlertas(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const alertasFiltradas = alertas.filter(a => {
    if (filtro === 'nuevas') return !a.leida
    if (filtro === 'leidas') return a.leida
    return true
  })

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
              {item.label === 'Solicitudes' && alertas.filter(a => !a.leida).length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alertas.filter(a => !a.leida).length}
                </span>
              )}
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
      <main className="flex-1 md:ml-64 p-6 md:p-10 max-w-7xl mx-auto w-full">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary mb-1">Solicitudes de Compra</h2>
          <p className="text-on-surface-variant">Agricultores que necesitan tus productos.</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          {[
            { key: 'todas', label: 'Todas' },
            { key: 'nuevas', label: `Nuevas (${alertas.filter(a => !a.leida).length})` },
            { key: 'leidas', label: 'Respondidas' },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                ${filtro === f.key ? 'bg-primary text-white' : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-gray-50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : alertasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">notifications_none</span>
            <h3 className="text-lg font-semibold text-on-surface mb-2">No hay solicitudes</h3>
            <p className="text-sm text-on-surface-variant">Cuando un agricultor publique una lista con tus productos, aparecerá aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {alertasFiltradas.map(alerta => (
              <div key={alerta.alerta_id}
                className={`bg-white border rounded-xl p-6 shadow-sm transition-all hover:shadow-md
                  ${!alerta.leida ? 'border-primary/30 bg-green-50/30' : 'border-outline-variant/30'}`}>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container">
                      {alerta.agricultor_nombre?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-on-surface">{alerta.agricultor_nombre}</h4>
                      {alerta.agricultor_region && (
                        <p className="text-xs text-on-surface-variant">{alerta.agricultor_region}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!alerta.leida && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                    <span className="text-xs text-on-surface-variant">
                      {new Date(alerta.creado_en).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    {alerta.titulo_lista}
                  </p>
                  <div className="flex flex-col gap-2">
                    {alerta.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm text-on-surface">{item.insumo_nombre}</span>
                        <span className="text-sm font-semibold text-primary bg-white px-2 py-0.5 rounded border border-outline-variant/30">
                          {item.cantidad} {item.unidad_medida}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/proveedor/cotizar', { state: { alerta } })}
                  className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">send</span>
                  {alerta.leida ? 'Ver / Modificar Cotización' : 'Responder Solicitud'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}