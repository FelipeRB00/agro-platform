import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const alertas = [
  { inicial: 'J', nombre: 'Juan Pérez', zona: 'Zona Norte', tiempo: 'Hace 15 min', producto: 'Urea 46%', cantidad: '50 Ton' },
  { inicial: 'M', nombre: 'María Gómez', zona: 'Valle Central', tiempo: 'Hace 1 hora', producto: 'Semilla Maíz Híbrido', cantidad: '200 Sacos' },
  { inicial: 'C', nombre: 'Carlos Ruiz', zona: 'Región Sur', tiempo: 'Hace 3 horas', producto: 'Fosfato Diamónico', cantidad: '15 Ton' },
  { inicial: 'A', nombre: 'Ana Silva', zona: 'Llanos Occidentales', tiempo: 'Hace 5 horas', producto: 'Fertilizante NPK 15-15-15', cantidad: '30 Ton' },
]

const metrics = [
  { icon: 'notifications_active', label: 'Nuevas Alertas', value: '8', bg: 'bg-red-100', text: 'text-red-700', glow: 'bg-red-100/30' },
  { icon: 'request_quote', label: 'Cotizaciones Activas', value: '14', bg: 'bg-secondary-container', text: 'text-on-secondary-container', glow: 'bg-secondary-container/30' },
  { icon: 'inventory_2', label: 'Productos en Catálogo', value: '156', bg: 'bg-gray-100', text: 'text-on-surface', glow: 'bg-gray-100/30' },
]

export default function DashboardProveedor() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard', active: true },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes' },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  return (
    <div className="bg-[#f9f9ff] text-on-surface font-sans min-h-screen flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full p-4 w-64 z-50 border-r border-outline-variant/30 bg-white">
        <div className="flex items-center gap-3 p-2 mb-6">
          <img src={logo} alt="CultivaTech" className="h-10 w-10 object-contain rounded-lg" />
          <div>
            <h1 className="font-bold text-primary text-base">CultivaTech</h1>
            <p className="text-xs text-on-surface-variant">Portal Proveedor</p>
          </div>
        </div>

        <button onClick={() => navigate('/proveedor/cotizar')}
          className="mx-2 mb-6 bg-primary text-white font-semibold text-sm py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined">add</span>
          Nueva Cotización
        </button>

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
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-40 flex justify-between items-center px-6 h-16 w-full bg-white/80 backdrop-blur-md border-b border-outline-variant/30">
          <div className="relative w-full max-w-md hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input type="text" placeholder="Buscar solicitudes..."
              className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all outline-none" />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm text-primary">{usuario?.nombre}</p>
                <p className="text-xs text-on-surface-variant">Proveedor</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-bold text-sm text-on-secondary-container">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-1">Resumen Operativo</h2>
            <p className="text-on-surface-variant">Monitorea tus alertas y cotizaciones en tiempo real.</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {metrics.map((m, i) => (
              <div key={i} className="bg-white border border-outline-variant/30 rounded-xl p-6 relative overflow-hidden group hover:border-secondary/40 transition-all duration-300 shadow-sm">
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${m.glow} rounded-full blur-2xl`}></div>
                <div className={`p-3 ${m.bg} ${m.text} rounded-lg w-fit mb-4 relative z-10`}>
                  <span className="material-symbols-outlined">{m.icon}</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 relative z-10">{m.label}</p>
                <p className="text-5xl font-bold text-on-surface relative z-10">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Alertas */}
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary">Alertas de Compra</h3>
            <button className="text-sm font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1">
              Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {alertas.map((a, i) => (
              <div key={i} className="bg-white border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 shadow-sm">
                <div>
                  {/* Agricultor info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-on-surface-variant font-bold text-lg">
                        {a.inicial}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-on-surface">{a.nombre}</h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{fontSize: '14px'}}>location_on</span>
                          {a.zona}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant bg-gray-100 py-1 px-2 rounded-md">{a.tiempo}</span>
                  </div>

                  {/* Producto */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Producto Solicitado</p>
                    <div className="flex justify-between items-end">
                      <p className="text-xl font-bold text-primary">{a.producto}</p>
                      <span className="bg-green-50 text-green-800 text-xs font-semibold py-1 px-3 rounded-full border border-green-200">
                        {a.cantidad}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => navigate('/proveedor/cotizar')}
                    className="bg-primary text-white font-semibold text-sm py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    Responder
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}