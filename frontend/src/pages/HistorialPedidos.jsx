import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import logo from '../assets/logo.png'

const estadoBadge = {
  entregado: 'bg-green-50 text-green-700 border border-green-200',
  enviado: 'bg-blue-50 text-blue-700 border border-blue-200',
  pendiente: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  cancelado: 'bg-red-50 text-red-700 border border-red-200',
}

const estadoDot = {
  entregado: 'bg-green-500',
  enviado: 'bg-blue-500',
  pendiente: 'bg-yellow-500',
  cancelado: 'bg-red-500',
}

export default function HistorialPedidos() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos', active: true },
  ]

  useEffect(() => {
    api.get('/cotizaciones/pedidos/historial')
      .then(res => setPedidos(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pedidosFiltrados = pedidos.filter(p =>
    p.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  )

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
          <h2 className="font-bold text-primary text-xl">Historial de Pedidos</h2>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm text-primary">{usuario?.nombre}</p>
              <p className="text-xs text-on-surface-variant capitalize">{usuario?.rol}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-sm text-on-secondary-container">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Historial de Pedidos</h2>
              <p className="text-sm text-on-surface-variant">Todas tus compras completadas en CultivaTech.</p>
            </div>
          </div>

          {/* Buscar */}
          <div className="bg-white border border-outline-variant/30 p-4 rounded-xl mb-6 shadow-sm">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input type="text" placeholder="Buscar por proveedor, lista o ID..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : pedidosFiltrados.length === 0 && pedidos.length === 0 ? (
            <div className="bg-white rounded-xl border border-outline-variant/30 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-outline mb-3 block">receipt_long</span>
              <h3 className="font-semibold text-on-surface mb-2">No tienes pedidos aún</h3>
              <p className="text-sm text-on-surface-variant mb-4">Cuando aceptes una cotización aparecerá aquí.</p>
              <button onClick={() => navigate('/cotizaciones')}
                className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                Ver Cotizaciones
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-outline-variant/30">
                      <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">ID</th>
                      <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Lista</th>
                      <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Proveedor</th>
                      <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Fecha</th>
                      <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant text-right">Total</th>
                      <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {pedidosFiltrados.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-semibold text-on-surface">{p.id}</td>
                        <td className="py-4 px-6 text-sm text-on-surface">{p.titulo}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded bg-secondary-container flex items-center justify-center text-on-secondary-container text-xs font-bold">
                              {p.proveedor.charAt(0)}
                            </div>
                            <span className="text-sm text-on-surface">{p.proveedor}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-on-surface-variant">
                          {new Date(p.fecha).toLocaleDateString('es-CL')}
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-on-surface text-right">
                          ${p.total.toLocaleString('es-CL')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${estadoBadge[p.estado]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${estadoDot[p.estado]}`}></span>
                            Entregado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-outline-variant/30 bg-white flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">
                  Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}