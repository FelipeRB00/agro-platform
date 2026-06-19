import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardProveedor() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [loading, setLoading] = useState(true)

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard', active: true },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes' },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo' },
    { icon: 'account_balance_wallet', label: 'Mis Comisiones', path: '/proveedor/comisiones' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  useEffect(() => {
    Promise.all([
      api.get('/alertas/'),
      api.get('/catalogo/')
    ]).then(([alertasRes, catRes]) => {
      setAlertas(alertasRes.data)
      setCatalogo(catRes.data)
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  const nuevas = alertas.filter(a => !a.leida).length

  const navItemsConBadge = navItems.map(item =>
    item.label === 'Solicitudes' ? { ...item, badge: nuevas } : item
  )

  const metrics = [
    { icon: 'notifications_active', label: 'Nuevas Alertas', value: nuevas, bg: 'bg-red-100', text: 'text-red-700' },
    { icon: 'inventory_2', label: 'Productos en Catálogo', value: catalogo.length, bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
    { icon: 'check_circle', label: 'Productos Activos', value: catalogo.filter(c => c.activo).length, bg: 'bg-gray-100', text: 'text-primary' },
  ]

  return (
    <div className="bg-[#f9f9ff] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItemsConBadge} tipo="proveedor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Dashboard Proveedor" />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-1">
              ¡Hola, {usuario?.nombre?.split(' ')[0]}! 👋
            </h2>
            <p className="text-on-surface-variant">Resumen de tu actividad como proveedor.</p>
          </div>

          {loading ? (
            <LoadingSpinner texto="Cargando dashboard..." />
          ) : (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {metrics.map((m, i) => (
                  <div key={i} className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">{m.label}</p>
                        <p className="text-5xl font-bold text-primary">{m.value}</p>
                      </div>
                      <div className={`${m.bg} ${m.text} p-3 rounded-full`}>
                        <span className="material-symbols-outlined">{m.icon}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alertas recientes */}
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary">Solicitudes Recientes</h3>
                <button onClick={() => navigate('/proveedor/solicitudes')}
                  className="text-sm font-semibold text-secondary hover:underline flex items-center gap-1">
                  Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {alertas.length === 0 ? (
                <div className="bg-white rounded-xl border border-outline-variant/30 p-10 text-center">
                  <span className="material-symbols-outlined text-5xl text-outline mb-3 block">notifications_none</span>
                  <p className="text-sm text-on-surface-variant">No hay solicitudes aún. Agrega productos a tu catálogo para empezar a recibir alertas.</p>
                  <button onClick={() => navigate('/proveedor/catalogo')}
                    className="mt-4 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                    Ir al Catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {alertas.slice(0, 4).map((alerta, i) => (
                    <div key={i} className={`bg-white border rounded-xl p-6 shadow-sm transition-all hover:shadow-md
                      ${!alerta.leida ? 'border-primary/30' : 'border-outline-variant/30'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container">
                            {alerta.agricultor_nombre?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-on-surface">{alerta.agricultor_nombre}</h4>
                            <p className="text-xs text-on-surface-variant">{new Date(alerta.creado_en).toLocaleDateString('es-CL')}</p>
                          </div>
                        </div>
                        {!alerta.leida && <span className="w-2 h-2 bg-red-500 rounded-full mt-1"></span>}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                        <p className="text-xs font-semibold text-on-surface-variant mb-2">{alerta.titulo_lista}</p>
                        {alerta.items.slice(0, 2).map((item, j) => (
                          <div key={j} className="flex justify-between items-center text-sm">
                            <span className="text-on-surface">{item.insumo_nombre}</span>
                            <span className="font-semibold text-primary">{item.cantidad} {item.unidad_medida}</span>
                          </div>
                        ))}
                        {alerta.items.length > 2 && (
                          <p className="text-xs text-on-surface-variant mt-1">+{alerta.items.length - 2} más...</p>
                        )}
                      </div>

                      <button onClick={() => navigate('/proveedor/cotizar', { state: { alerta } })}
                        className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">send</span>
                        {alerta.leida ? 'Ver Cotización' : 'Responder'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}