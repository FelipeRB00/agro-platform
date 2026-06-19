import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'

const fmt = (n) => '$' + (n || 0).toLocaleString('es-CL')

export default function MisComisiones() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')  // todos | pendientes | depositadas

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard' },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes' },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo' },
    { icon: 'account_balance_wallet', label: 'Mis Comisiones', path: '/proveedor/comisiones', active: true },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  useEffect(() => {
    api.get('/cotizaciones/mis-comisiones')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const detalleFiltrado = (data?.detalle || []).filter(d => {
    if (filtro === 'pendientes') return !d.comision_depositada
    if (filtro === 'depositadas') return d.comision_depositada
    return true
  })

  if (loading) {
    return (
      <div className="bg-[#f9f9ff] min-h-screen flex">
        <Sidebar navItems={navItems} tipo="proveedor" />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <LoadingSpinner texto="Cargando comisiones..." />
        </div>
      </div>
    )
  }

  const datosCobro = data?.datos_cobro_admin

  return (
    <div className="bg-[#f9f9ff] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo="proveedor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Mis Comisiones" />
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary">Mis Comisiones</h2>
            <p className="text-on-surface-variant mt-1">
              Comisión del {data?.porcentaje_comision || 3}% sobre tus ventas que debes depositar a la plataforma a fin de mes.
            </p>
          </div>

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">{fmt(data?.total_adeudado)}</p>
              <p className="text-xs font-semibold text-on-surface-variant mt-1">Por depositar</p>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined">paid</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{fmt(data?.total_depositado)}</p>
              <p className="text-xs font-semibold text-on-surface-variant mt-1">Ya depositado</p>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <p className="text-3xl font-bold text-on-surface">{fmt(data?.total_ventas)}</p>
              <p className="text-xs font-semibold text-on-surface-variant mt-1">Total en ventas ({data?.num_ventas})</p>
            </div>
          </div>

          {/* Datos de cobro del admin */}
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] rounded-2xl p-6 shadow-sm mb-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined">account_balance</span>
              <h3 className="font-bold text-lg">Cuenta para Depósito de Comisiones</h3>
            </div>

            {datosCobro && datosCobro.completos ? (
              <>
                <p className="text-green-100 text-sm mb-4">
                  Deposita el monto pendiente ({fmt(data?.total_adeudado)}) a la siguiente cuenta:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/10 rounded-xl p-5">
                  <div>
                    <p className="text-xs text-green-200">Titular</p>
                    <p className="font-semibold">{datosCobro.nombre_titular || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-200">RUT</p>
                    <p className="font-semibold">{datosCobro.rut_titular || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-200">Banco</p>
                    <p className="font-semibold">{datosCobro.banco || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-200">Tipo de cuenta</p>
                    <p className="font-semibold capitalize">{datosCobro.tipo_cuenta || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-200">N° de cuenta</p>
                    <p className="font-semibold">{datosCobro.numero_cuenta || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-200">Email de confirmación</p>
                    <p className="font-semibold">{datosCobro.email || '—'}</p>
                  </div>
                </div>
                <p className="text-xs text-green-200 mt-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Envía el comprobante de transferencia al email del administrador.
                </p>
              </>
            ) : (
              <div className="bg-white/10 rounded-xl p-5 flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-300">warning</span>
                <p className="text-sm text-green-100">
                  El administrador aún no ha registrado los datos de la cuenta de cobro.
                  Contáctalo para coordinar el depósito de comisiones.
                </p>
              </div>
            )}
          </div>

          {/* Detalle de comisiones */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-on-surface text-lg">Detalle de Comisiones</h3>
              <div className="flex gap-2">
                {[
                  { key: 'todos', label: 'Todas' },
                  { key: 'pendientes', label: 'Pendientes' },
                  { key: 'depositadas', label: 'Depositadas' },
                ].map(f => (
                  <button key={f.key} onClick={() => setFiltro(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                      ${filtro === f.key ? 'bg-primary text-white' : 'bg-gray-100 text-on-surface-variant hover:bg-gray-200'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-outline-variant/30">
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Fecha</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Agricultor</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-right">Venta</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-right">Comisión (3%)</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-center">Método</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {detalleFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-on-surface-variant">
                        No hay comisiones en esta categoría
                      </td>
                    </tr>
                  ) : (
                    detalleFiltrado.map(d => (
                      <tr key={d.comision_id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-on-surface-variant">
                          {new Date(d.fecha).toLocaleDateString('es-CL')}
                        </td>
                        <td className="p-4 text-on-surface">{d.agricultor}</td>
                        <td className="p-4 text-right">{fmt(d.monto_venta)}</td>
                        <td className="p-4 text-right font-bold text-primary">{fmt(d.comision)}</td>
                        <td className="p-4 text-center">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize
                            ${d.metodo_pago === 'credito' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {d.metodo_pago === 'credito' ? 'Crédito' : 'Contado'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {d.comision_depositada ? (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Depositada
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                              Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}