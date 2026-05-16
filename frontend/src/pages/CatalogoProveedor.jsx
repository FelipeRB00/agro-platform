import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

const categoriaBadge = {
  fertilizante: 'bg-green-100 text-green-800',
  semilla: 'bg-yellow-100 text-yellow-800',
  plaguicida: 'bg-red-100 text-red-800',
  herramienta: 'bg-blue-100 text-blue-800',
}

export default function CatalogoProveedor() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [insumos, setInsumos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errorModal, setErrorModal] = useState('')
  const [form, setForm] = useState({ insumo_id: '', precio_referencia: '', stock_disponible: '' })

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard' },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes' },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo', active: true },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  const cargarDatos = () => {
    setLoading(true)
    setError('')
    api.get('/catalogo/')
      .then(res => setProductos(res.data))
      .catch(() => setError('Error al cargar el catálogo'))
      .finally(() => setLoading(false))

    api.get('/insumos/')
      .then(res => setInsumos(res.data))
      .catch(() => {})
  }

  useEffect(() => { cargarDatos() }, [])

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  )

  const toggleActivo = async (id, activo) => {
    try {
      const res = await api.put(`/catalogo/${id}`, { activo: !activo })
      setProductos(productos.map(p => p.id === id ? { ...p, activo: res.data.activo } : p))
    } catch {
      alert('Error al actualizar estado')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto del catálogo?')) return
    try {
      await api.delete(`/catalogo/${id}`)
      setProductos(productos.filter(p => p.id !== id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar')
    }
  }

  const handleGuardar = async () => {
    if (!form.insumo_id || !form.precio_referencia || !form.stock_disponible) {
      setErrorModal('Completa todos los campos')
      return
    }
    setGuardando(true)
    setErrorModal('')
    try {
      const res = await api.post('/catalogo/', {
        insumo_id: parseInt(form.insumo_id),
        precio_referencia: parseFloat(form.precio_referencia),
        stock_disponible: parseInt(form.stock_disponible)
      })
      setProductos([...productos, res.data])
      setForm({ insumo_id: '', precio_referencia: '', stock_disponible: '' })
      setModalAbierto(false)
    } catch (err) {
      setErrorModal(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="bg-[#f9f9ff] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo="proveedor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Gestión de Catálogo" />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-primary">Gestión de Catálogo</h2>
              <p className="text-on-surface-variant mt-1">Administra tu inventario de productos agrícolas.</p>
            </div>
            <button onClick={() => setModalAbierto(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
              <span className="material-symbols-outlined">add</span>
              Añadir Producto
            </button>
          </div>

          {error && <div className="mb-6"><ErrorMessage mensaje={error} onRetry={cargarDatos} /></div>}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Total Productos', value: productos.length, icon: 'inventory', bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
              { label: 'Productos Activos', value: productos.filter(p => p.activo).length, icon: 'check_circle', bg: 'bg-green-100', text: 'text-primary' },
              { label: 'Inactivos', value: productos.filter(p => !p.activo).length, icon: 'pause_circle', bg: 'bg-gray-100', text: 'text-gray-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-5xl font-bold text-primary">{s.value}</p>
                  </div>
                  <div className={`${s.bg} ${s.text} p-3 rounded-full`}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-bold text-primary text-lg">Inventario Actual</h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input type="text" placeholder="Buscar producto..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary w-64" />
              </div>
            </div>

            {loading ? (
              <LoadingSpinner texto="Cargando catálogo..." />
            ) : productosFiltrados.length === 0 && productos.length === 0 ? (
              <EmptyState
                icon="inventory_2"
                titulo="No hay productos en tu catálogo"
                descripcion="Añade productos para que los agricultores puedan encontrarte."
                accion="Añadir Producto"
                onAccion={() => setModalAbierto(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-outline-variant/30">
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Producto</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Categoría</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Precio Ref.</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Stock</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase">Estado</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {productosFiltrados.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-sm text-on-surface">{p.nombre}</p>
                          <p className="text-xs text-on-surface-variant">{p.unidad_medida}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${categoriaBadge[p.categoria] || 'bg-gray-100 text-gray-700'}`}>
                            {p.categoria}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-semibold">${p.precio_referencia.toLocaleString('es-CL')}</td>
                        <td className="p-4 text-sm">{p.stock_disponible} {p.unidad_medida}</td>
                        <td className="p-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={p.activo}
                              onChange={() => toggleActivo(p.id, p.activo)} />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => eliminar(p.id)}
                            className="text-outline hover:text-red-600 transition-colors p-1">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-outline-variant/30">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-bold text-primary text-lg">Añadir Nuevo Producto</h3>
              <button onClick={() => { setModalAbierto(false); setErrorModal('') }}
                className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {errorModal && <ErrorMessage mensaje={errorModal} />}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Insumo</label>
                <select value={form.insumo_id} onChange={e => setForm({ ...form, insumo_id: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary appearance-none">
                  <option value="">Seleccionar insumo...</option>
                  {insumos.map(i => (
                    <option key={i.id} value={i.id}>{i.nombre} ({i.categoria})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Precio Referencial ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                    <input type="number" placeholder="0.00"
                      value={form.precio_referencia}
                      onChange={e => setForm({ ...form, precio_referencia: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Stock Disponible</label>
                  <input type="number" placeholder="0"
                    value={form.stock_disponible}
                    onChange={e => setForm({ ...form, stock_disponible: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/30 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => { setModalAbierto(false); setErrorModal('') }}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-primary border border-outline-variant hover:bg-gray-100">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-60">
                {guardando ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}