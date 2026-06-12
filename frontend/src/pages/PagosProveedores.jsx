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
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState(null)
  const [marcando, setMarcando] = useState(null)
  const [filtro, setFiltro] = useState('todos') // todos, pendientes, pagados

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: 'group', label: 'Usuarios', path: '/admin/usuarios' },
    { icon: 'payments', label: 'Pagos', path: '/admin/pagos', active: true },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  const cargar = () => {
    api.get('/admin/pagos-proveedores')
      .then(res => setPagos(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const marcarPagado = async (comisionId) => {
    setMarcando(comisionId)
    try {
      await api.put(`/admin/pagos-proveedores/${comisionId}/marcar-pagado`)
      // Actualizar el estado local
      setPagos(pagos.map(p =>
        p.comision_id === comisionId
          ? { ...p, pagado: true, fecha_pago: new Date().toISOString() }
          : p
      ))
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al marcar el pago')
    } finally {
      setMarcando(null)
    }
  }

  // Filtrar pagos
  const pagosFiltrados = pagos.filter(p => {
    if (filtro === 'pendientes') return !p.pagado
    if (filtro === 'pagados') return p.pagado
    return true
  })

  // Totales (solo de los pendientes para "a transferir")
  const pendientes = pagos.filter(p => !p.pagado)
  const totalATransferir = pendientes.reduce((acc, p) => acc + p.monto_a_transferir, 0)
  const totalComisiones = pagos.reduce((acc, p) => acc + p.comision_plataforma, 0)
  const totalPagados = pagos.filter(p => p.pagado).length

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
            <h2 className="text-2xl font-bold text-on-surface">Pagos a Proveedores</h2>
            <p className="text-sm text-on-surface-variant">Transferencias pendientes por cada venta realizada.</p>
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
            <LoadingSpinner texto="Cargando pagos..." />
          ) : (
            <>
              {/* Resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white border border-[#dfe7da] rounded-2xl p-5 shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{fmt(totalATransferir)}</p>
                  <p className="text-xs font-semibold text-on-surface-variant mt-1">Pendiente de transferir</p>
                </div>
                <div className="bg-white border border-[#dfe7da] rounded-2xl p-5 shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">savings</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{fmt(totalComisiones)}</p>
                  <p className="text-xs font-semibold text-on-surface-variant mt-1">Comisiones de la plataforma</p>
                </div>
                <div className="bg-white border border-[#dfe7da] rounded-2xl p-5 shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">task_alt</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{totalPagados} / {pagos.length}</p>
                  <p className="text-xs font-semibold text-on-surface-variant mt-1">Pagos completados</p>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex gap-2">
                {[
                  { key: 'todos', label: 'Todos' },
                  { key: 'pendientes', label: 'Pendientes' },
                  { key: 'pagados', label: 'Pagados' },
                ].map(f => (
                  <button key={f.key} onClick={() => setFiltro(f.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                      ${filtro === f.key ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-[#dfe7da] hover:bg-gray-50'}`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Lista de pagos */}
              <div className="bg-white border border-[#dfe7da] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#dfe7da]">
                  <h3 className="font-bold text-on-surface text-lg">Detalle de Transferencias</h3>
                  <p className="text-xs text-on-surface-variant">Haz click en una fila para ver los datos bancarios</p>
                </div>

                {pagosFiltrados.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">payments</span>
                    <p className="text-sm text-on-surface-variant">No hay pagos en esta categoría</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#dfe7da]">
                    {pagosFiltrados.map(pago => (
                      <div key={pago.comision_id}>
                        {/* Fila principal */}
                        <div onClick={() => setExpandido(expandido === pago.comision_id ? null : pago.comision_id)}
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#f4f8f2]/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
                              {pago.proveedor?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-on-surface">{pago.proveedor}</p>
                                {pago.pagado && (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                    Pagado
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-on-surface-variant">
                                {new Date(pago.fecha).toLocaleDateString('es-CL')} · Venta {fmt(pago.monto_venta)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-on-surface-variant">A transferir</p>
                              <p className="font-bold text-primary">{fmt(pago.monto_a_transferir)}</p>
                            </div>
                            {pago.datos_completos ? (
                              <span className="material-symbols-outlined text-green-600">check_circle</span>
                            ) : (
                              <span className="material-symbols-outlined text-amber-500" title="Sin datos bancarios">warning</span>
                            )}
                            <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${expandido === pago.comision_id ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </div>
                        </div>

                        {/* Detalle expandido */}
                        {expandido === pago.comision_id && (
                          <div className="px-5 pb-5 bg-[#f4f8f2]/30">
                            {pago.datos_completos ? (
                              <div className="bg-white rounded-xl border border-[#dfe7da] p-5">
                                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Datos para transferencia</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                                  <div>
                                    <p className="text-xs text-on-surface-variant">Titular</p>
                                    <p className="font-semibold text-on-surface">{pago.datos_bancarios.nombre_titular || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-on-surface-variant">RUT</p>
                                    <p className="font-semibold text-on-surface">{pago.datos_bancarios.rut_titular || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-on-surface-variant">Banco</p>
                                    <p className="font-semibold text-on-surface">{pago.datos_bancarios.banco || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-on-surface-variant">Tipo de cuenta</p>
                                    <p className="font-semibold text-on-surface capitalize">{pago.datos_bancarios.tipo_cuenta || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-on-surface-variant">N° de cuenta</p>
                                    <p className="font-semibold text-on-surface">{pago.datos_bancarios.numero_cuenta || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-on-surface-variant">Monto exacto</p>
                                    <p className="font-bold text-primary">{fmt(pago.monto_a_transferir)}</p>
                                  </div>
                                </div>

                                {/* Botón marcar pagado o estado */}
                                {pago.pagado ? (
                                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                    <div>
                                      <p className="text-sm font-semibold text-green-700">Transferencia completada</p>
                                      {pago.fecha_pago && (
                                        <p className="text-xs text-green-600">
                                          Pagado el {new Date(pago.fecha_pago).toLocaleDateString('es-CL')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => marcarPagado(pago.comision_id)}
                                    disabled={marcando === pago.comision_id}
                                    className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    {marcando === pago.comision_id ? 'Procesando...' : 'Marcar como pagado'}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-600">warning</span>
                                <p className="text-sm text-amber-700">
                                  Este proveedor aún no ha registrado sus datos bancarios. No se puede transferir hasta que los complete.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
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