import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const stats = [
  { icon: 'group', label: 'Total Usuarios', value: '12,482', trend: '+14% este mes', bg: 'bg-secondary-container', text: 'text-on-secondary-container', dark: false },
  { icon: 'storefront', label: 'Total Proveedores', value: '843', trend: '+5% este mes', bg: 'bg-gray-100', text: 'text-primary', dark: false },
  { icon: 'agriculture', label: 'Total Agricultores', value: '11,532', trend: '+18% este mes', bg: 'bg-green-100', text: 'text-primary', dark: false },
  { icon: 'payments', label: 'Ingresos Plataforma', value: '$2.4M', trend: '+22% este mes', bg: 'bg-primary-container', text: 'text-white', dark: true },
]

const meses = [
  { mes: 'Ene', altura: '30%' },
  { mes: 'Feb', altura: '45%' },
  { mes: 'Mar', altura: '40%' },
  { mes: 'Abr', altura: '60%' },
  { mes: 'May', altura: '55%' },
  { mes: 'Jun', altura: '80%', actual: true },
]

const salud = [
  { icon: 'cloud_done', bg: 'bg-secondary-container', text: 'text-secondary', titulo: 'Estado API', desc: 'Todos los servicios operativos. 99.99% uptime esta semana.' },
  { icon: 'security', bg: 'bg-red-100', text: 'text-red-700', titulo: 'Alertas de Seguridad', desc: '2 intentos de login bloqueados desde IPs inusuales.' },
  { icon: 'update', bg: 'bg-gray-100', text: 'text-gray-600', titulo: 'Actualizaciones Pendientes', desc: 'Mantenimiento programado para el Domingo 2 AM UTC.' },
]

const usuarios = [
  { iniciales: 'MR', nombre: 'Marcus Reynolds', email: 'm.reynolds@agritech.com', rol: 'admin', fecha: '24 Oct 2026' },
  { iniciales: 'SV', nombre: 'Sarah Vance Supply Co.', email: 'contact@vancesupply.com', rol: 'proveedor', fecha: '23 Oct 2026' },
  { iniciales: 'JD', nombre: 'John Deere Farms', email: 'j.deere@valleyfarms.net', rol: 'agricultor', fecha: '22 Oct 2026' },
  { iniciales: 'EW', nombre: 'Elena Woods', email: 'elena.w@greenpastures.com', rol: 'agricultor', fecha: '21 Oct 2026' },
]

const rolBadge = {
  admin: 'bg-red-100 text-red-700',
  proveedor: 'bg-gray-200 text-gray-700',
  agricultor: 'bg-green-100 text-primary',
}

const rolLabel = { admin: 'Admin', proveedor: 'Proveedor', agricultor: 'Agricultor' }

export default function DashboardAdmin() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', active: true },
    { icon: 'group', label: 'Usuarios', path: '/admin/usuarios' },
    { icon: 'storefront', label: 'Proveedores', path: '/admin/proveedores' },
    { icon: 'agriculture', label: 'Agricultores', path: '/admin/agricultores' },
    { icon: 'payments', label: 'Transacciones', path: '/admin/transacciones' },
  ]

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">

      {/* Sidebar */}
      <aside className="bg-white h-screen w-64 fixed left-0 top-0 flex flex-col py-6 px-4 gap-4 border-r border-outline-variant/30 z-50">
        <div className="flex items-center gap-3 px-2 mb-4">
          <img src={logo} alt="CultivaTech" className="h-10 w-10 object-contain rounded-lg" />
          <div>
            <h1 className="font-bold text-primary text-base">CultivaTech</h1>
            <p className="text-xs text-on-surface-variant">Admin Portal</p>
          </div>
        </div>

        <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mb-2 transition-colors">
          <span className="material-symbols-outlined">add</span>
          Generar Reporte
        </button>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(item => (
            <a key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all
                ${item.active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-1">
          <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            Configuración
          </a>
          <a onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-[#f4f8f2]/90 backdrop-blur-md border-b border-outline-variant/20">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Admin Dashboard</h2>
            <p className="text-sm text-on-surface-variant">Vista general y métricas de la plataforma.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-sm text-on-secondary-container">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm text-on-surface">{usuario?.nombre}</p>
                <p className="text-xs text-on-surface-variant capitalize">Administrador</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s, i) => (
              <div key={i} className={`${s.dark ? 'bg-primary-container' : 'bg-white'} rounded-2xl border border-[#dfe7da] p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className={`material-symbols-outlined text-6xl ${s.dark ? 'text-white' : 'text-primary'}`}>{s.icon}</span>
                </div>
                <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center mb-4`}>
                  <span className={`material-symbols-outlined ${s.text}`}>{s.icon}</span>
                </div>
                <p className={`text-xs font-semibold mb-1 ${s.dark ? 'text-green-200' : 'text-on-surface-variant'}`}>{s.label}</p>
                <h3 className={`text-4xl font-bold ${s.dark ? 'text-white' : 'text-on-surface'}`}>{s.value}</h3>
                <div className={`flex items-center gap-1 mt-3 ${s.dark ? 'text-green-200' : 'text-primary'} text-xs font-semibold`}>
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  {s.trend}
                </div>
              </div>
            ))}
          </div>

          {/* Chart + System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dfe7da] p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Volumen de Transacciones</h3>
                  <p className="text-sm text-on-surface-variant">Tendencia mensual en la plataforma (CLP)</p>
                </div>
                <div className="flex gap-2 bg-[#f4f8f2] p-1 rounded-lg border border-[#dfe7da]">
                  <button className="px-4 py-1.5 rounded-md text-xs font-semibold bg-white shadow-sm text-primary">Mensual</button>
                  <button className="px-4 py-1.5 rounded-md text-xs font-semibold text-on-surface-variant hover:text-primary">Trimestral</button>
                </div>
              </div>
              <div className="flex-1 min-h-[250px] relative mt-4 flex items-end gap-4">
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-on-surface-variant text-xs pb-8 opacity-60">
                  <span>$3M</span><span>$2M</span><span>$1M</span><span>0</span>
                </div>
                <div className="absolute left-10 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                  {[0,1,2,3].map(i => <div key={i} className="w-full border-t border-dashed border-[#dfe7da]"></div>)}
                </div>
                <div className="flex-1 flex justify-around items-end h-full ml-10 relative z-10 pb-px">
                  {meses.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                      <div
                        className={`w-10 rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${m.actual ? 'bg-primary shadow-lg' : 'bg-[#b7d6a8]'}`}
                        style={{ height: m.altura }}>
                      </div>
                      <span className={`text-xs font-semibold ${m.actual ? 'text-primary' : 'text-on-surface-variant'}`}>{m.mes}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-2xl border border-[#dfe7da] p-6">
              <h3 className="text-lg font-bold text-on-surface mb-6">Estado del Sistema</h3>
              <div className="flex flex-col gap-5">
                {salud.map((s, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined ${s.text}`}>{s.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-on-surface">{s.titulo}</h4>
                      <p className="text-sm text-on-surface-variant mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-[#dfe7da]">
                <button className="w-full bg-[#f4f8f2] border border-secondary text-secondary hover:bg-green-50 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                  Ver Logs Completos
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-[#dfe7da] overflow-hidden">
            <div className="p-6 border-b border-[#dfe7da] flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">Registros Recientes de Usuarios</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                  <input type="text" placeholder="Buscar usuarios..."
                    className="pl-9 pr-4 py-2 border border-[#dfe7da] rounded-lg text-sm w-56 focus:outline-none focus:border-secondary" />
                </div>
                <button className="px-4 py-2 border border-[#dfe7da] rounded-lg flex items-center gap-2 hover:bg-[#f4f8f2] transition-colors text-sm text-on-surface-variant font-semibold">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filtrar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f4f8f2] border-b border-[#dfe7da]">
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Nombre</th>
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Email</th>
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Rol</th>
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Fecha Registro</th>
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfe7da]">
                  {usuarios.map((u, i) => (
                    <tr key={i} className="hover:bg-[#f4f8f2]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
                            {u.iniciales}
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{u.nombre}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-on-surface-variant">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${rolBadge[u.rol]}`}>
                          {rolLabel[u.rol]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-on-surface-variant">{u.fecha}</td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#dfe7da] bg-white flex justify-between items-center">
              <p className="text-xs text-on-surface-variant">Mostrando 1 a 4 de 12,482 entradas</p>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1 border border-[#dfe7da] rounded-md text-xs text-on-surface-variant disabled:opacity-50">Anterior</button>
                <button className="px-3 py-1 border border-[#dfe7da] rounded-md text-xs text-on-surface-variant hover:bg-[#f4f8f2]">Siguiente</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}