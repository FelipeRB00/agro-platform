import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'

const fmt = (n) => '$' + (n || 0).toLocaleString('es-CL')

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [resumen, setResumen] = useState(null)
  const [porMes, setPorMes] = useState([])
  const [detalle, setDetalle] = useState([])
  const [loading, setLoading] = useState(true)

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', active: true },
    { icon: 'group', label: 'Usuarios', path: '/admin/usuarios' },
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

  // Mes con más ingresos para resaltar en el gráfico
  const maxMes = porMes.length ? Math.max(...porMes.map(m => m.comisiones)) : 0

  const stats = resumen ? [
    {
      label: 'Ingresos del Mes',
      value: fmt(resumen.ingresos_mes_actual),
      icon: 'trending_up',
      color: 'bg-green-100 text-green-700',
      sub: `${resumen.ventas_mes_actual} ventas este mes`
    },
    {
      label: 'Comisiones Totales',
      value: fmt(resumen.total_comisiones),
      icon: 'payments',
      color: 'bg-blue-100 text-blue-700',
      sub: 'Histórico acumulado'
    },
    {
      label: 'Ventas Totales',
      value: resumen.num_ventas,
      icon: 'receipt_long',
      color: 'bg-purple-100 text-purple-700',
      sub: fmt(resumen.total_ventas) + ' transado'
    },
    {
      label: 'IVA Recaudado',
      value: fmt(resumen.total_iva),
      icon: 'account_balance',
      color: 'bg-orange-100 text-orange-700',
      sub: '19% sobre ventas'
    },
  ] : []

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo="admin" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Panel de Administración" />
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface">Dashboard de Ingresos</h2>
            <p className="text-sm text-on-surface-variant">Comisiones generadas por la plataforma CultivaTech.</p>
          </div>

          {loading ? (
            <LoadingSpinner texto="Cargando estadísticas..." />
          ) : (
            <>
              {/* Tarjetas de resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-full ${s.color} flex items-center justify-center`}>
                        <span className="material-symbols-outlined">{s.icon}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{s.value}</p>
                    <p className="text-xs font-semibold text-on-surface-variant mt-1">{s.label}</p>
                    <p className="text-xs text-on-surface-variant/70 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Gráfico de ingresos por mes */}
              <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm mb-8">
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
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`}
                    />
                    <Tooltip
                      formatter={(value) => [fmt(value), 'Comisiones']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px'
                      }}
                    />
                    <Bar dataKey="comisiones" radius={[6, 6, 0, 0]}>
                      {porMes.map((entry, i) => (
                        <Cell key={i} fill={entry.comisiones === maxMes && maxMes > 0 ? '#1a3a1a' : '#4ade80'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tabla de transacciones recientes */}
              <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-outline-variant/30">
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
                        <tr className="bg-gray-50 border-b border-outline-variant/30">
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase">Fecha</th>
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase">Agricultor</th>
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase">Proveedor</th>
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase text-right">Venta</th>
                          <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase text-right">Comisión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {detalle.map(d => (
                          <tr key={d.id} className="hover:bg-gray-50 transition-colors">
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
        </main>
      </div>
    </div>
  )
}