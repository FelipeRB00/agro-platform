import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import logo from '../assets/logo.png'

const fmt = (n) => '$' + (n || 0).toLocaleString('es-CL')

export default function PagosProveedores() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [vista, setVista] = useState('resumen')  // resumen | detalle
  const [resumen, setResumen] = useState([])
  const [detalle, setDetalle] = useState([])
  const [loading, setLoading] = useState(true)
  const [marcando, setMarcando] = useState(null)
  const [filtroDetalle, setFiltroDetalle] = useState('todos')  // todos | pendientes | depositadas

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: 'group', label: 'Usuarios', path: '/admin/usuarios' },
    { icon: 'payments', label: 'Comisiones', path: '/admin/pagos', active: true },
    { icon: 'settings', label: 'Configuración', path: '/admin/configuracion' },
  ]

  const cargar = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/comisiones/resumen-proveedores'),
      api.get('/admin/comisiones/detalle')
    ])
      .then(([resR, resD]) => {
        setResumen(resR.data)
        setDetalle(resD.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  // Marcar todas las comisiones de un proveedor como depositadas
  const marcarProveedor = async (proveedorId) => {
    setMarcando('prov-' + proveedorId)
    try {
      await api.put(`/admin/comisiones/proveedor/${proveedorId}/marcar-todas-depositadas`)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al marcar las comisiones')
    } finally {
      setMarcando(null)
    }
  }

  // Marcar una transacción individual como depositada
  const marcarUna = async (comisionId) => {
    setMarcando(comisionId)
    try {
      await api.put(`/admin/comisiones/${comisionId}/marcar-depositada`)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al marcar la comisión')
    } finally {
      setMarcando(null)
    }
  }

  // Totales
  const totalAdeudado = resumen.reduce((acc, p) => acc + p.comision_adeudada, 0)
  const totalDepositado = resumen.reduce((acc, p) => acc + p.comision_depositada, 0)
  const totalVentas = resumen.reduce((acc, p) => acc + p.total_ventas, 0)

  // Filtrar detalle
  const detalleFiltrado = detalle.filter(d => {
    if (filtroDetalle === 'pendientes') return !d.comision_depositada
    if (filtroDetalle === 'depositadas') return d.comision_depositada
    return true
  })

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
            <h2 className="text-2xl font-bold text-on-surface">Comisiones por Cobrar</h2>
            <p className="text-sm text-on-surface-variant">Comisiones que los proveedores deben depositar a la plataforma.</p>
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
            <LoadingSpinner texto="Cargando comisiones..." />
          ) : (
            <>
              {/* Resumen de totales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white border border-[#dfe7da] rounded-2xl p-5 shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">pending_actions</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{fmt(totalAdeudado)}</p>
                  <p className="text-xs font-semibold text-on-surface-variant mt-1">Por cobrar (pendiente)</p>
                </div>
                <div className="bg-white border border-[#dfe7da] rounded-2xl p-5 shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">paid</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{fmt(totalDepositado)}</p>
                  <p className="text-xs font-semibold text-on-surface-variant mt-1">Ya depositado</p>
                </div>
                <div className="bg-white border border-[#dfe7da] rounded-2xl p-5 shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{fmt(totalVentas)}</p>
                  <p className="text-xs font-semibold text-on-surface-variant mt-1">Ventas totales gestionadas</p>
                </div>
              </div>

              {/* Tabs de vista */}
              <div className="flex gap-2">
                <button onClick={() => setVista('resumen')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                    ${vista === 'resumen' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-[#dfe7da] hover:bg-gray-50'}`}>
                  <span className="material-symbols-outlined text-sm">groups</span>
                  Resumen por Proveedor
                </button>
                <button onClick={() => setVista('detalle')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                    ${vista === 'detalle' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-[#dfe7da] hover:bg-gray-50'}`}>
                  <span className="material-symbols-outlined text-sm">receipt_long</span>
                  Detalle de Transacciones
                </button>
              </div>

              {/* VISTA RESUMEN POR PROVEEDOR */}
              {vista === 'resumen' && (
                <div className="bg-white border border-[#dfe7da] rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[#dfe7da]">
                    <h3 className="font-bold text-on-surface text-lg">Comisiones Adeudadas por Proveedor</h3>
                    <p className="text-xs text-on-surface-variant">Cada proveedor debe depositar el 5% de sus ventas a fin de mes</p>
                  </div>

                  {resumen.length === 0 ? (
                    <div className="p-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-outline mb-2">groups</span>
                      <p className="text-sm text-on-surface-variant">No hay comisiones registradas aún</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#dfe7da]">
                      {resumen.map(prov => (
                        <div key={prov.proveedor_id} className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                              {prov.proveedor?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface">{prov.proveedor}</p>
                              <p className="text-xs text-on-surface-variant">
                                {prov.num_ventas} venta(s) · {fmt(prov.total_ventas)} en ventas
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs text-on-surface-variant">Adeudado</p>
                              <p className={`font-bold text-lg ${prov.comision_adeudada > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                {fmt(prov.comision_adeudada)}
                              </p>
                            </div>

                            {prov.comision_adeudada > 0 ? (
                              <button onClick={() => marcarProveedor(prov.proveedor_id)}
                                disabled={marcando === 'prov-' + prov.proveedor_id}
                                className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">check</span>
                                {marcando === 'prov-' + prov.proveedor_id ? 'Procesando...' : 'Liquidar todo'}
                              </button>
                            ) : (
                              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Al día
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VISTA DETALLE DE TRANSACCIONES */}
              {vista === 'detalle' && (
                <>
                  {/* Filtros */}
                  <div className="flex gap-2">
                    {[
                      { key: 'todos', label: 'Todas' },
                      { key: 'pendientes', label: 'Pendientes' },
                      { key: 'depositadas', label: 'Depositadas' },
                    ].map(f => (
                      <button key={f.key} onClick={() => setFiltroDetalle(f.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                          ${filtroDetalle === f.key ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-[#dfe7da] hover:bg-gray-50'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white border border-[#dfe7da] rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-[#dfe7da]">
                            <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Fecha</th>
                            <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Proveedor</th>
                            <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Agricultor</th>
                            <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-right">Venta</th>
                            <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-right">Comisión (5%)</th>
                            <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-center">Método</th>
                            <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-center">Estado</th>
                            <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dfe7da]">
                          {detalleFiltrado.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="p-12 text-center text-on-surface-variant">
                                No hay transacciones en esta categoría
                              </td>
                            </tr>
                          ) : (
                            detalleFiltrado.map(d => (
                              <tr key={d.comision_id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-on-surface-variant">
                                  {new Date(d.fecha).toLocaleDateString('es-CL')}
                                </td>
                                <td className="p-4 font-semibold text-on-surface">{d.proveedor}</td>
                                <td className="p-4 text-on-surface-variant">{d.agricultor}</td>
                                <td className="p-4 text-right">{fmt(d.monto_venta)}</td>
                                <td className="p-4 text-right font-bold text-primary">{fmt(d.comision_total)}</td>
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
                                <td className="p-4 text-right">
                                  {!d.comision_depositada && (
                                    <button onClick={() => marcarUna(d.comision_id)}
                                      disabled={marcando === d.comision_id}
                                      className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60">
                                      {marcando === d.comision_id ? '...' : 'Marcar depositada'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}