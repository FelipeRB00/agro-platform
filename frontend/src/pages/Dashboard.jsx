import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const cards = [
    { icon: 'payments', label: 'Gasto total del mes', value: '$45,230', badge: '↑ 12%', color: 'bg-secondary-container/50 text-secondary' },
    { icon: 'list_alt', label: 'Listas de compras activas', value: '8', color: 'bg-[#b7d6a8]/20 text-secondary' },
    { icon: 'pending_actions', label: 'Cotizaciones pendientes', value: '3', color: 'bg-[#b7d6a8]/20 text-secondary', alert: true },
    { icon: 'notifications_active', label: 'Alertas de precios', value: '5', color: 'bg-red-100 text-red-600' },
  ]

  const actividad = [
    { icon: 'mark_email_unread', color: 'bg-secondary-container text-secondary', titulo: 'Nueva cotización recibida', desc: 'Proveedor: AgroInsumos SA.', tiempo: 'Hace 2 horas' },
    { icon: 'check_circle', color: 'bg-[#b7d6a8]/30 text-[#2f4f2f]', titulo: 'Lista de fertilizantes pagada', desc: 'Transacción aprobada ($12,400)', tiempo: 'Ayer' },
    { icon: 'warning', color: 'bg-red-100 text-red-600', titulo: 'Alerta de precio: Urea', desc: 'El precio superó el umbral configurado.', tiempo: 'Ayer' },
    { icon: 'inventory', color: 'bg-gray-100 text-gray-600', titulo: 'Inventario actualizado', desc: 'Semillas de maíz ingresadas.', tiempo: 'Hace 2 días' },
  ]

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard', active: true },
    { icon: 'shopping_cart', label: 'Compras', path: '/compras' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'list_alt', label: 'Mis Listas', path: '/listas' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

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

        <button
          onClick={() => navigate('/listas/nueva')}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold text-sm mb-6 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Nueva Lista
        </button>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <a key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all
                ${item.active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/30 space-y-1">
          <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined">support_agent</span>
            Soporte
          </a>
          <a onClick={handleLogout}
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
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
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

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card) => (
              <div key={card.label} className="bg-white p-6 rounded-xl border border-[#dfe7da] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                  {card.badge && (
                    <span className="text-xs font-semibold text-primary bg-green-100 px-2 py-1 rounded">{card.badge}</span>
                  )}
                  {card.alert && <span className="w-2 h-2 rounded-full bg-red-500 mt-2"></span>}
                </div>
                <p className="text-sm text-on-surface-variant mb-1">{card.label}</p>
                <h3 className="text-3xl font-bold text-primary">{card.value}</h3>
              </div>
            ))}
          </div>

          {/* Chart + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#dfe7da] p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-primary text-lg">Tendencia de Gastos (6 Meses)</h3>
                <button className="px-3 py-1.5 border border-secondary text-secondary rounded-lg text-xs font-semibold hover:bg-secondary/10 transition-colors">
                  Exportar
                </button>
              </div>
              <div className="relative min-h-[300px] border border-dashed border-outline-variant rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-between py-8 px-10 opacity-20">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-outline"></div>)}
                </div>
                <svg className="absolute inset-0 w-full h-full px-10 py-8" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2f4f2f" stopOpacity="1" />
                      <stop offset="100%" stopColor="#f4f8f2" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q20,70 40,50 T60,60 T80,30 T100,20" fill="none" stroke="#2f4f2f" strokeWidth="2" />
                  <path d="M0,80 Q20,70 40,50 T60,60 T80,30 T100,20 L100,100 L0,100 Z" fill="url(#grad)" opacity="0.2" />
                  {[[0,80],[20,65],[40,50],[60,60],[80,30],[100,20]].map(([cx,cy],i) => (
                    <circle key={i} cx={cx} cy={cy} r="1.5" fill="#2f4f2f" />
                  ))}
                </svg>
                <div className="absolute bottom-2 w-full flex justify-between px-10 text-xs text-on-surface-variant">
                  {['Ene','Feb','Mar','Abr','May','Jun'].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-xl border border-[#dfe7da] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-[#dfe7da]">
                <h3 className="font-semibold text-primary text-lg">Actividad Reciente</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-1">
                  {actividad.map((item, i) => (
                    <li key={i} className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg cursor-pointer border-b border-[#dfe7da] last:border-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-on-surface">{item.titulo}</p>
                        <p className="text-xs text-on-surface-variant">{item.desc}</p>
                        <span className="text-xs text-outline mt-1 block">{item.tiempo}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border-t border-[#dfe7da] text-center">
                <button className="text-sm font-semibold text-primary hover:underline underline-offset-4">
                  Ver toda la actividad
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 mt-auto bg-white border-t border-outline-variant/20 flex justify-between items-center px-10">
          <span className="font-bold text-primary text-sm">CultivaTech</span>
          <span className="text-xs text-on-surface-variant">© 2024 CultivaTech Agricultural Solutions</span>
          <div className="flex gap-4 text-xs text-on-surface-variant">
            <a href="#" className="hover:text-primary">Privacidad</a>
            <a href="#" className="hover:text-primary">Términos</a>
          </div>
        </footer>
      </div>
    </div>
  )
}