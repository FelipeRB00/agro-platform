import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import logo from '../assets/logo.png'

const fmt = (n) => '$' + (n || 0).toLocaleString('es-CL')

export default function DashboardAdmin() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [resumen, setResumen] = useState(null)
  const [porMes, setPorMes] = useState([])
  const [detalle, setDetalle] = useState([])
  const [loading, setLoading] = useState(true)

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', active: true },
    { icon: 'group', label: 'Usuarios', path: '/admin/usuarios' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  useEffect(() => {
    Promise.all([
      api.get('/admin/ingresos/resumen'),
      api.get('/admin/ingresos/por-mes'),
      api.get('/admin/ingresos/detalle'),
    ])
      .then(([r1, r2, r3]) => {
        setResumen(r1.data)
        setPorMes(r2.data)
        setDetalle(r3.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const maxMes = porMes.length ? Math.max(...porMes.map(m => m.comisiones)) : 0

  const stats = resumen ? [
    { label: 'Ingresos del Mes', value: fmt(resumen.ingresos_mes_actual), icon: 'trending_up', color: 'bg-green-100 text-green-700', sub: `${resumen.ventas_mes_actual} ventas este mes` },
    { label: 'Comisiones Totales', value: fmt(resumen.total_comisiones), icon: 'payments', color: 'bg-blue-100 text-blue-700', sub: 'Histórico acumulado' },
    { label: 'Ventas Totales', value: resumen.num_ventas, icon: 'receipt_long', color: 'bg-purple-100 text-purple-700', sub: fmt(resumen.total_ventas) + ' transado' },
    { label: 'IVA Recaudado', value: fmt(resumen.total_iva), icon: 'account_balance', color: 'bg-orange-100 text-orange-700', sub: '19% sobre ventas' },
  ] : []

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">

      {/* Sidebar Admin */}
      <aside className="bg-white h-screen w-64 fixed left-0 top-0 flex flex-col py-6 px-4 gap-4 border-r border-outline-variant/30 z-50">
        <div className="flex items-center gap-3 px-2 mb-2">
          <img src={logo} alt="CultivaTech" className="h-10 w-10 object-contain rounded-lg" />
          <div>
            <h1 className="font-bold text-primary text-base">CultivaTech</h1>
            <p className="text-xs text-on-surface-variant">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 mt-2">
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
          <a onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">

        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-[#f4f8f2]/90 backdrop-blur-md border-b border-outline-variant/20">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Dashboard de Ingresos</h2>
            <p className="text-sm text-on-surface-variant">Comisiones generadas por la plataforma.</p>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-sm text-on-secondary-container">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="font-semibold text-sm text-on-surface">{usuario?.nombre}</p>
              <p className="text-xs text-on-surface-variant">Administrador</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">

          {loading ? (
            <LoadingSpinner texto="Cargando estadísticas..." />
          ) : (
            <>
              {/* Tarjetas resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white border border-[#dfe7da] rounded-2xl p-5 shadow-sm">
                    <div className={`w-11 h-11 rounded-full ${s.color} flex items-center justify-center mb-3`}>
                      <span className="material-symbols-outlined">{s.icon}</span>
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{s.value}</p>
                    <p className="text-xs font-semibold text-on-surface-variant mt-1">{s.label}</p>
                    <p className="text-xs text-on-surface-variant/70 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Gráfico ingresos por mes */}
              <div className="bg-white border border-[#dfe7da] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">Ingresos por Mes</h3>
                    <p className="text-xs text-on-surface-variant">Comisiones recaudadas durante {new Date().getFullYear()}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary">bar_chart</span>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={porMes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} />
                    <Tooltip formatter={(value) => [fmt(value), 'Comisiones']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                    <Bar dataKey="comisiones" radius={[6, 6, 0, 0]}>
                      {porMes.map((entry, i) => (
                        <Cell key={i} fill={entry.comisiones === maxMes && maxMes > 0 ? '#1a3a1a' : '#4ade80'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Transacciones recientes */}
              <div className="bg-white border border-[#dfe7da] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#dfe7da]">
                  <h3 className="font-bold text-on-surface text-lg">Transacciones Recientes</h3>
                  <p className="text-xs text-on-surface-variant">Últimas ventas con comisión generada</p>
                </div>

                {detalle.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">receipt_long</span>
                    <p className="text-sm text-on-surface-variant">Aún no hay transacciones registradas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-[#f4f8f2] border-b border-[#dfe7da]">
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase">Fecha</th>
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase">Agricultor</th>
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase">Proveedor</th>
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase text-right">Venta</th>
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase text-right">Comisión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dfe7da]">
                        {detalle.map(d => (
                          <tr key={d.id} className="hover:bg-[#f4f8f2]/50 transition-colors">
                            <td className="py-3 px-5 text-sm text-on-surface-variant">
                              {new Date(d.fecha).toLocaleDateString('es-CL')}
                            </td>
                            <td className="py-3 px-5 text-sm text-on-surface">{d.agricultor}</td>
                            <td className="py-3 px-5 text-sm text-on-surface">{d.proveedor}</td>
                            <td className="py-3 px-5 text-sm text-on-surface text-right">{fmt(d.monto_venta)}</td>
                            <td className="py-3 px-5 text-sm font-semibold text-primary text-right">{fmt(d.comision_total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}