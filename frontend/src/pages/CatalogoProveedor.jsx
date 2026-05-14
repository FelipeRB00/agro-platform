import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const productosIniciales = [
  { id: 1, nombre: 'NitroMax Plus', unidad: 'Saco 50kg', categoria: 'Fertilizantes', precio: 45.00, stock: '1,250 kg', activo: true, icon: 'eco', iconBg: 'bg-green-100', iconColor: 'text-green-800' },
  { id: 2, nombre: 'Semilla Maíz Híbrido', unidad: 'Bolsa 20kg', categoria: 'Semillas', precio: 120.00, stock: '450 kg', activo: true, icon: 'grass', iconBg: 'bg-secondary-container', iconColor: 'text-on-secondary-container' },
  { id: 3, nombre: 'HerbiKill 360', unidad: 'Galón 4L', categoria: 'Herbicidas', precio: 35.50, stock: '12 L', activo: false, icon: 'water_drop', iconBg: 'bg-blue-100', iconColor: 'text-blue-800', stockBajo: true },
]

const categoriaBadge = {
  'Fertilizantes': 'bg-green-100 text-green-800',
  'Semillas': 'bg-yellow-100 text-yellow-800',
  'Herbicidas': 'bg-blue-100 text-blue-800',
  'Fungicidas': 'bg-purple-100 text-purple-800',
  'Plaguicidas': 'bg-red-100 text-red-800',
}

export default function CatalogoProveedor() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [productos, setProductos] = useState(productosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState({ nombre: '', categoria: 'Fertilizantes', unidad: 'kg', precio: '', stock: '' })

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard' },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes' },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo', active: true },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  )

  const toggleActivo = (id) => {
    setProductos(productos.map(p => p.id === id ? { ...p, activo: !p.activo } : p))
  }

  const eliminar = (id) => {
    setProductos(productos.filter(p => p.id !== id))
  }

  const handleGuardar = () => {
    if (!form.nombre || !form.precio || !form.stock) return
    const nuevo = {
      id: Date.now(),
      nombre: form.nombre,
      unidad: form.unidad,
      categoria: form.categoria,
      precio: parseFloat(form.precio),
      stock: `${form.stock} ${form.unidad}`,
      activo: true,
      icon: 'inventory',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-700'
    }
    setProductos([...productos, nuevo])
    setForm({ nombre: '', categoria: 'Fertilizantes', unidad: 'kg', precio: '', stock: '' })
    setModalAbierto(false)
  }

  return (
    <div className="bg-[#f9f9ff] text-on-surface font-sans min-h-screen flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full p-4 w-64 z-50 bg-white border-r border-outline-variant/30">
        <div className="flex items-center gap-3 p-2 mb-6">
          <img src={logo} alt="CultivaTech" className="h-10 w-10 object-contain rounded-lg" />
          <div>
            <h1 className="font-bold text-primary text-base">CultivaTech</h1>
            <p className="text-xs text-on-surface-variant">Portal Proveedor</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {navItems.map(item => (
            <a key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all
                ${item.active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-outline-variant/30 px-2">
          <a onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-6 md:p-10 max-w-7xl mx-auto w-full">

        {/* Header */}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total Productos', value: productos.length, icon: 'inventory', bg: 'bg-secondary-container', text: 'text-on-secondary-container', glow: 'bg-secondary-container/30' },
            { label: 'Stock Bajo', value: productos.filter(p => p.stockBajo).length, icon: 'warning', bg: 'bg-red-100', text: 'text-red-700', glow: 'bg-red-100/30' },
            { label: 'Productos Activos', value: productos.filter(p => p.activo).length, icon: 'check_circle', bg: 'bg-gray-100', text: 'text-primary', glow: 'bg-gray-100/30' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className={`absolute -right-6 -top-6 ${s.glow} w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500`}></div>
              <div className="flex justify-between items-center relative z-10">
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
                className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-secondary w-64 transition-all" />
            </div>
          </div>

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
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${p.iconBg} rounded-lg flex items-center justify-center ${p.iconColor}`}>
                          <span className="material-symbols-outlined text-sm">{p.icon}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface">{p.nombre}</p>
                          <p className="text-xs text-on-surface-variant">{p.unidad}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoriaBadge[p.categoria] || 'bg-gray-100 text-gray-700'}`}>
                        {p.categoria}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-on-surface">${p.precio.toFixed(2)}</td>
                    <td className={`p-4 text-sm font-semibold ${p.stockBajo ? 'text-red-600' : 'text-on-surface'}`}>
                      {p.stock}
                      {p.stockBajo && <span className="ml-1 text-xs">⚠️</span>}
                    </td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={p.activo} onChange={() => toggleActivo(p.id)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-outline hover:text-primary transition-colors p-1">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button onClick={() => eliminar(p.id)} className="text-outline hover:text-red-600 transition-colors p-1 ml-2">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-outline-variant/30 bg-gray-50 flex justify-between items-center">
            <span className="text-xs text-on-surface-variant">Mostrando {productosFiltrados.length} de {productos.length} productos</span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 border border-outline-variant rounded text-on-surface-variant text-sm disabled:opacity-50">Anterior</button>
              <button className="px-3 py-1 border border-outline-variant rounded text-on-surface-variant hover:bg-gray-100 text-sm">Siguiente</button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-outline-variant/30">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-bold text-primary text-lg">Añadir Nuevo Producto</h3>
              <button onClick={() => setModalAbierto(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nombre del Producto</label>
                <input type="text" placeholder="Ej. Fungicida CopperMax"
                  value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Categoría</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary appearance-none">
                    <option>Fertilizantes</option>
                    <option>Semillas</option>
                    <option>Herbicidas</option>
                    <option>Fungicidas</option>
                    <option>Plaguicidas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Unidad de Medida</label>
                  <select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary appearance-none">
                    <option value="kg">kg (Kilogramos)</option>
                    <option value="L">L (Litros)</option>
                    <option value="Saco">Saco</option>
                    <option value="Bolsa">Bolsa</option>
                    <option value="Unidad">Unidad</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Precio Referencial ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                    <input type="number" placeholder="0.00"
                      value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Stock Inicial</label>
                  <input type="number" placeholder="0"
                    value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary transition-all" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/30 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setModalAbierto(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-primary border border-outline-variant hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button onClick={handleGuardar}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm">
                Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}