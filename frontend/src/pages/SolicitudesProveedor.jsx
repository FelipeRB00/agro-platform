import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function SolicitudesProveedor() {
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
    if (filtro === 'respondidas') return a.leida
    return true
  })

  const nuevas = alertas.filter(a => !a.leida).length

  const navItemsConBadge = navItems.map(item =>
    item.label === 'Solicitudes' ? { ...item, badge: nuevas } : item
  )

  return (
    <div className="bg-[#f9f9ff] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItemsConBadge} tipo="proveedor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Solicitudes de Compra" />
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-1">Solicitudes de Compra</h2>
            <p className="text-on-surface-variant text-sm">Agricultores que necesitan tus productos.</p>
          </div>

          {/* Filtros */}
          <div className="flex gap-3 mb-6">
            {[
              { key: 'todas', label: 'Todas' },
              { key: 'nuevas', label: `Nuevas (${nuevas})` },
              { key: 'respondidas', label: 'Respondidas' },
            ].map(f => (
              <button key={f.key} onClick={() => setFiltro(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${filtro === f.key ? 'bg-primary text-white' : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-gray-50'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner texto="Cargando solicitudes..." />
          ) : alertasFiltradas.length === 0 ? (
            <EmptyState
              icon="notifications_none"
              titulo="No hay solicitudes"
              descripcion="Cuando un agricultor publique una lista con tus productos, aparecerá aquí."
            />
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
                      {!alerta.leida && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
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

                  <button onClick={() => navigate('/proveedor/cotizar', { state: { alerta } })}
                    className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">send</span>
                    {alerta.leida ? 'Ver Cotización' : 'Responder Solicitud'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}