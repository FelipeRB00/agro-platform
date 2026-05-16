import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import logo from '../assets/logo.png'

const estadoBadge = {
  borrador: 'bg-yellow-100 text-yellow-700',
  publicada: 'bg-green-100 text-green-700',
  cerrada: 'bg-gray-100 text-gray-600',
}

const estadoIcon = {
  borrador: 'edit_note',
  publicada: 'send',
  cerrada: 'task_alt',
}

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard', active: true },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  useEffect(() => {
    api.get('/listas/resumen')
      .then(res => setResumen(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = resumen ? [
    {
      icon: 'list_alt',
      label: 'Total de Listas',
      value: resumen.total_listas,
      color: 'bg-secondary-container text-on-secondary-container',
      action: () => navigate('/listas')
    },
    {
      icon: 'send',
      label: 'Listas Publicadas',
      value: resumen.listas_activas,
      color: 'bg-green-100 text-green-700',
      action: () => navigate('/listas')
    },
    {
      icon: 'pending_actions',
      label: 'Cotizaciones Pendientes',
      value: resumen.cotizaciones_pendientes,
      color: resumen.cotizaciones_pendientes > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600',
      action: () => navigate('/cotizaciones'),
      alert: resumen.cotizaciones_pendientes > 0
    },
    {
      icon: 'psychology',
      label: 'Análisis IA',
      value: '→',
      color: 'bg-primary-container text-white',
      dark: true,
      action: () => navigate('/ia')
    },
  ] : []

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col p-6 h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-white border-r border-outline-variant/30 z-30">
        <div className="mb-8 flex items-center gap-3">
          <img src={logo} alt="CultivaTech" className="h-10 w-10 object-contain rounded-lg" />
          <div>
            <h1 className="font-bold text-primary text-base">CultivaTech</h1>
            <p className="text-xs text-on-surface-variant">Gestión Agrícola</p>
          </div>
        </div>

        <button onClick={() => navigate('/listas/nueva')}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold text-sm mb-6 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Nueva Lista
        </button>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <a key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all
                ${item.active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/30 space-y-1">
          <a onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* Header */}
        <header className="flex justify-between items-center h-16 px-6 bg-white/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-20">
          <h2 className="font-bold text-primary text-xl hidden md:block">Dashboard</h2>
          <div className="md:hidden flex items-center gap-2">
            <img src={logo} alt="CultivaTech" className="h-8 w-8 object-contain" />
            <span className="font-bold text-primary">CultivaTech</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-full relative">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm text-primary">{usuario?.nombre}</p>
                <p className="text-xs text-on-surface-variant capitalize">{usuario?.rol}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-10 max-w-7xl mx-auto w-full">

          {/* Bienvenida */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface">
              ¡Hola, {usuario?.nombre?.split(' ')[0]}! 👋
            </h2>
            <p className="text-on-surface-variant mt-1">Aquí tienes un resumen de tu actividad en CultivaTech.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((card, i) => (
                  <button key={i} onClick={card.action}
                    className={`${card.dark ? 'bg-primary-container' : 'bg-white'} p-6 rounded-xl border border-[#dfe7da] hover:shadow-md transition-all text-left relative overflow-hidden group`}>
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className={`material-symbols-outlined text-5xl ${card.dark ? 'text-white' : 'text-primary'}`}>{card.icon}</span>
                    </div>
                    <div className={`p-2 rounded-lg w-fit mb-4 ${card.color}`}>
                      <span className="material-symbols-outlined">{card.icon}</span>
                    </div>
                    {card.alert && (
                      <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                    <p className={`text-sm mb-1 ${card.dark ? 'text-green-200' : 'text-on-surface-variant'}`}>{card.label}</p>
                    <h3 className={`text-4xl font-bold ${card.dark ? 'text-white' : 'text-on-surface'}`}>{card.value}</h3>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Actividad reciente */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#dfe7da] overflow-hidden">
                  <div className="p-6 border-b border-[#dfe7da] flex justify-between items-center">
                    <h3 className="font-semibold text-primary text-lg">Actividad Reciente</h3>
                    <button onClick={() => navigate('/listas')}
                      className="text-sm font-semibold text-secondary hover:underline">
                      Ver todo
                    </button>
                  </div>
                  {resumen?.actividad_reciente?.length === 0 ? (
                    <div className="p-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-outline mb-2 block">history</span>
                      <p className="text-sm text-on-surface-variant">No hay actividad reciente.</p>
                      <button onClick={() => navigate('/listas/nueva')}
                        className="mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                        Crear primera lista
                      </button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#dfe7da]">
                      {resumen.actividad_reciente.map((item, i) => (
                        <li key={i} className="flex gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => navigate('/listas')}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${estadoBadge[item.estado]}`}>
                            <span className="material-symbols-outlined text-xl">{estadoIcon[item.estado]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-on-surface truncate">{item.titulo}</p>
                            <p className="text-xs text-on-surface-variant">{item.items} ítem(s)</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${estadoBadge[item.estado]}`}>
                              {item.estado}
                            </span>
                            <p className="text-xs text-on-surface-variant mt-1">
                              {new Date(item.fecha).toLocaleDateString('es-CL')}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Acciones rápidas */}
                <div className="bg-white rounded-xl border border-[#dfe7da] p-6">
                  <h3 className="font-semibold text-primary text-lg mb-4">Acciones Rápidas</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: 'add_shopping_cart', label: 'Nueva Lista de Compras', desc: 'Crea y publica a proveedores', path: '/listas/nueva', color: 'bg-primary text-white hover:bg-primary/90' },
                      { icon: 'request_quote', label: 'Ver Cotizaciones', desc: 'Revisa ofertas de proveedores', path: '/cotizaciones', color: 'bg-secondary-container text-on-secondary-container hover:bg-green-200' },
                      { icon: 'psychology', label: 'Análisis con IA', desc: 'Predicción de precios', path: '/ia', color: 'bg-gray-100 text-on-surface hover:bg-gray-200' },
                      { icon: 'history', label: 'Historial de Pedidos', desc: 'Revisa tus compras anteriores', path: '/pedidos', color: 'bg-gray-100 text-on-surface hover:bg-gray-200' },
                    ].map((accion, i) => (
                      <button key={i} onClick={() => navigate(accion.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${accion.color}`}>
                        <span className="material-symbols-outlined shrink-0">{accion.icon}</span>
                        <div>
                          <p className="font-semibold text-sm">{accion.label}</p>
                          <p className="text-xs opacity-70">{accion.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="py-4 mt-auto bg-white border-t border-outline-variant/20 flex justify-between items-center px-10">
          <span className="font-bold text-primary text-sm">CultivaTech</span>
          <span className="text-xs text-on-surface-variant">© 2026 CultivaTech Agricultural Solutions</span>
        </footer>
      </div>
    </div>
  )
}