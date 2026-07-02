import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import { API_URL } from '../config'

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
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos', active: true },
  ]

  const cargarPedidos = () => {
    setLoading(true)
    setError('')
    api.get('/cotizaciones/pedidos/historial')
      .then(res => setPedidos(res.data))
      .catch(() => setError('Error al cargar el historial de pedidos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarPedidos() }, [])

  // ✅ handleExportar va aquí, FUERA del return
  const handleExportar = async (formato) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${API_URL}/reportes/historial/${formato}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `historial_pedidos.${formato === 'pdf' ? 'pdf' : 'xlsx'}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Error al exportar el reporte')
    }
  }

  const pedidosFiltrados = pedidos.filter(p =>
    p.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo="agricultor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Historial de Pedidos" />
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">

          {/* ✅ Header con botones de exportar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Historial de Pedidos</h2>
              <p className="text-sm text-on-surface-variant">Todas tus compras completadas en CultivaTech.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExportar('pdf')}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Exportar PDF
              </button>
              <button onClick={() => handleExportar('excel')}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-lg font-semibold text-sm hover:bg-green-800 transition-colors">
                <span className="material-symbols-outlined text-sm">table_view</span>
                Exportar Excel
              </button>
            </div>
          </div>

          {error && <div className="mb-4"><ErrorMessage mensaje={error} onRetry={cargarPedidos} /></div>}

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
            <LoadingSpinner texto="Cargando historial..." />
          ) : pedidos.length === 0 ? (
            <EmptyState
              icon="receipt_long"
              titulo="No tienes pedidos aún"
              descripcion="Cuando aceptes una cotización aparecerá aquí."
              accion="Ver Cotizaciones"
              onAccion={() => navigate('/cotizaciones')}
            />
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
                    {pedidosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-on-surface-variant">
                          No se encontraron pedidos con "{busqueda}"
                        </td>
                      </tr>
                    ) : pedidosFiltrados.map((p, i) => (
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