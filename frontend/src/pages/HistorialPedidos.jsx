import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const pedidos = [
  { id: '#ORD-9021', fecha: '12 Oct 2026', proveedor: 'AgroInsumos S.A.', icon: 'agriculture', monto: '$65,250.00', estado: 'pagado' },
  { id: '#ORD-8944', fecha: '08 Oct 2026', proveedor: 'FertiCampo', icon: 'water_drop', monto: '$12,400.00', estado: 'enviado' },
  { id: '#ORD-8802', fecha: '01 Oct 2026', proveedor: 'Semillas del Sur', icon: 'spa', monto: '$70,600.00', estado: 'entregado' },
  { id: '#ORD-8710', fecha: '25 Sep 2026', proveedor: 'AgroTech Chile', icon: 'precision_manufacturing', monto: '$45,230.00', estado: 'pendiente' },
]

const estadoBadge = {
  pagado: 'bg-green-50 text-green-700 border border-green-200',
  enviado: 'bg-blue-50 text-blue-700 border border-blue-200',
  entregado: 'bg-gray-100 text-gray-700 border border-gray-200',
  pendiente: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  cancelado: 'bg-red-50 text-red-700 border border-red-200',
}

const estadoDot = {
  pagado: 'bg-green-500',
  enviado: 'bg-blue-500',
  entregado: 'bg-gray-400',
  pendiente: 'bg-yellow-500',
  cancelado: 'bg-red-500',
}

const estadoLabel = {
  pagado: 'Pagado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  pendiente: 'Pendiente',
  cancelado: 'Cancelado',
}

export default function HistorialPedidos() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Pedidos', path: '/pedidos', active: true },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  const pedidosFiltrados = pedidos.filter(p => {
    const matchBusqueda = p.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.id.toLowerCase().includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado
    return matchBusqueda && matchEstado
  })

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col p-6 h-screen w-64 fixed left-0 top-0 bg-white border-r border-outline-variant/30 z-30">
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
        <div className="mt-auto pt-6 border-t border-outline-variant/30">
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
          <h2 className="font-bold text-primary text-xl hidden md:block">Historial de Pedidos</h2>
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
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-sm text-on-secondary-container">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">

          {/* Title + Export */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Historial de Pedidos</h2>
              <p className="text-sm text-on-surface-variant">Revisa y gestiona tus compras recientes.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-secondary text-secondary rounded-lg hover:bg-secondary/5 transition-colors text-sm font-semibold bg-white">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              Exportar a PDF
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white/80 backdrop-blur-md border border-outline-variant/30 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-end shadow-sm">

            {/* Fecha */}
            <div className="w-full md:w-auto flex-1">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 ml-1">Rango de Fechas</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">calendar_today</span>
                <input type="text" placeholder="Seleccionar fechas"
                  defaultValue="01 Sep 2026 - 31 Oct 2026"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-secondary" />
              </div>
            </div>

            {/* Estado */}
            <div className="w-full md:w-48">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 ml-1">Estado del Pedido</label>
              <div className="relative">
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                  className="w-full pl-4 pr-8 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-secondary appearance-none cursor-pointer">
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-sm">expand_more</span>
              </div>
            </div>

            {/* Buscar */}
            <div className="w-full md:flex-1">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 ml-1">Buscar</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input type="text" placeholder="Buscar por proveedor o ID..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-secondary" />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-outline-variant/30">
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">ID Pedido</th>
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Fecha</th>
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Proveedor</th>
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant text-right">Monto Total</th>
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant text-center">Estado</th>
                    <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {pedidosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-on-surface-variant">
                        No se encontraron pedidos.
                      </td>
                    </tr>
                  ) : pedidosFiltrados.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-4 px-6 text-sm font-semibold text-on-surface">{p.id}</td>
                      <td className="py-4 px-6 text-sm text-on-surface-variant">{p.fecha}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-sm">{p.icon}</span>
                          </div>
                          <span className="text-sm text-on-surface">{p.proveedor}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-on-surface text-right">{p.monto}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${estadoBadge[p.estado]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${estadoDot[p.estado]}`}></span>
                          {estadoLabel[p.estado]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-outline hover:text-primary p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="bg-white border-t border-outline-variant/30 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                Mostrando 1 - {pedidosFiltrados.length} de {pedidos.length} pedidos
              </span>
              <div className="flex items-center gap-2">
                <button disabled className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-outline disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-semibold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-gray-50 text-xs">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-gray-50 text-xs">3</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-outline hover:bg-gray-50">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}