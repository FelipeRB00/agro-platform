import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import ConfirmDialog from '../components/ConfirmDialog'

const API_BASE = 'http://127.0.0.1:8001'

const categoriaBadge = {
  fertilizante: 'bg-green-100 text-green-800',
  semilla: 'bg-yellow-100 text-yellow-800',
  plaguicida: 'bg-red-100 text-red-800',
  herbicida: 'bg-orange-100 text-orange-800',
  fungicida: 'bg-purple-100 text-purple-800',
  insecticida: 'bg-pink-100 text-pink-800',
  herramienta: 'bg-blue-100 text-blue-800',
  otro: 'bg-gray-100 text-gray-700',
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

  // Estados de edición
  const [modalEditar, setModalEditar] = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)
  const [formEditar, setFormEditar] = useState({ precio_referencia: '', stock_disponible: '', ingrediente_activo: '' })
  const [guardandoEdit, setGuardandoEdit] = useState(false)
  const [errorEdit, setErrorEdit] = useState('')
  const [imagenEditar, setImagenEditar] = useState(null)
  const [previewEditar, setPreviewEditar] = useState(null)

  // Form añadir con nombre libre
  const [form, setForm] = useState({
    nombre_libre: '',
    categoria: 'fertilizante',
    precio_referencia: '',
    stock_disponible: '',
    ingrediente_activo: ''
  })
  const [imagen, setImagen] = useState(null)
  const [preview, setPreview] = useState(null)
  const [sugerencias, setSugerencias] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)

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
      .catch(() => { })
  }

  useEffect(() => { cargarDatos() }, [])

  const handleNombreChange = (valor) => {
    setForm({ ...form, nombre_libre: valor })
    if (valor.length >= 2) {
      const filtradas = insumos.filter(i =>
        i.nombre.toLowerCase().includes(valor.toLowerCase())
      )
      setSugerencias(filtradas.slice(0, 5))
      setMostrarSugerencias(filtradas.length > 0)
    } else {
      setMostrarSugerencias(false)
    }
  }

  const seleccionarSugerencia = (insumo) => {
    setForm({
      ...form,
      nombre_libre: insumo.nombre,
      categoria: insumo.categoria || 'fertilizante'
    })
    setMostrarSugerencias(false)
  }

  // Manejo de imagen (añadir)
  const handleImagenChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorModal('El archivo debe ser una imagen')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorModal('La imagen no debe superar los 5 MB')
      return
    }
    setImagen(file)
    setPreview(URL.createObjectURL(file))
  }

  // Manejo de imagen (editar)
  const handleImagenEditarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorEdit('El archivo debe ser una imagen')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorEdit('La imagen no debe superar los 5 MB')
      return
    }
    setImagenEditar(file)
    setPreviewEditar(URL.createObjectURL(file))
  }

  const subirImagen = async (catalogoId, archivo) => {
    const formData = new FormData()
    formData.append('file', archivo)
    return api.post(`/catalogo/${catalogoId}/imagen`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

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

  const eliminar = (id) => {
    const producto = productos.find(p => p.id === id)
    setDialog({
      abierto: true,
      titulo: 'Eliminar Producto',
      mensaje: `¿Estás seguro que deseas eliminar "${producto?.nombre}" de tu catálogo? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      confirmText: 'Sí, eliminar',
      onConfirm: async () => {
        setDialog(d => ({ ...d, abierto: false }))
        try {
          await api.delete(`/catalogo/${id}`)
          setProductos(productos.filter(p => p.id !== id))
        } catch (err) {
          setError(err.response?.data?.detail || 'Error al eliminar')
        }
      }
    })
  }

  const handleGuardar = async () => {
    if (!form.nombre_libre.trim() || !form.precio_referencia || !form.stock_disponible) {
      setErrorModal('Completa los campos obligatorios')
      return
    }
    setGuardando(true)
    setErrorModal('')
    try {
      const res = await api.post('/catalogo/', {
        nombre_libre: form.nombre_libre.trim(),
        categoria: form.categoria,
        precio_referencia: parseFloat(form.precio_referencia),
        stock_disponible: parseInt(form.stock_disponible),
        ingrediente_activo: form.ingrediente_activo.trim() || null
      })
      let productoFinal = res.data
      // Si hay imagen, subirla
      if (imagen) {
        const resImg = await subirImagen(res.data.id, imagen)
        productoFinal = resImg.data
      }
      setProductos([...productos, productoFinal])
      cerrarModal()
    } catch (err) {
      setErrorModal(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setErrorModal('')
    setMostrarSugerencias(false)
    setForm({ nombre_libre: '', categoria: 'fertilizante', precio_referencia: '', stock_disponible: '', ingrediente_activo: '' })
    setImagen(null)
    setPreview(null)
  }

  const abrirEditar = (producto) => {
    setProductoEditar(producto)
    setFormEditar({
      precio_referencia: producto.precio_referencia,
      stock_disponible: producto.stock_disponible,
      ingrediente_activo: producto.ingrediente_activo || ''
    })
    setImagenEditar(null)
    setPreviewEditar(null)
    setErrorEdit('')
    setModalEditar(true)
  }

  const [dialog, setDialog] = useState({
    abierto: false,
    titulo: '',
    mensaje: '',
    tipo: 'warning',
    confirmText: 'Confirmar',
    onConfirm: null
  })

  const handleGuardarEdicion = async () => {
    if (!formEditar.precio_referencia || formEditar.stock_disponible === '') {
      setErrorEdit('Completa todos los campos')
      return
    }
    setGuardandoEdit(true)
    setErrorEdit('')
    try {
      const res = await api.put(`/catalogo/${productoEditar.id}`, {
        precio_referencia: parseFloat(formEditar.precio_referencia),
        stock_disponible: parseInt(formEditar.stock_disponible),
        ingrediente_activo: formEditar.ingrediente_activo.trim() || null
      })
      let productoFinal = res.data
      // Si se seleccionó nueva imagen, subirla
      if (imagenEditar) {
        const resImg = await subirImagen(productoEditar.id, imagenEditar)
        productoFinal = resImg.data
      }
      setProductos(productos.map(p => p.id === productoEditar.id ? productoFinal : p))
      setModalEditar(false)
      setProductoEditar(null)
    } catch (err) {
      setErrorEdit(err.response?.data?.detail || 'Error al actualizar')
    } finally {
      setGuardandoEdit(false)
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
                          <div className="flex items-center gap-3">
                            {/* Miniatura de imagen */}
                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-outline-variant/20 flex items-center justify-center overflow-hidden shrink-0">
                              {p.imagen_url ? (
                                <img src={`${API_BASE}${p.imagen_url}`} alt={p.nombre}
                                  className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-outline text-xl">image</span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-on-surface">{p.nombre}</p>
                              {p.ingrediente_activo && (
                                <p className="text-xs text-on-surface-variant">{p.ingrediente_activo}</p>
                              )}
                              {p.unidad_medida && (
                                <p className="text-xs text-on-surface-variant">{p.unidad_medida}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${categoriaBadge[p.categoria] || 'bg-gray-100 text-gray-700'}`}>
                            {p.categoria || 'otro'}
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
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => abrirEditar(p)}
                              title="Editar producto"
                              className="text-outline hover:text-primary transition-colors p-1">
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button onClick={() => eliminar(p.id)}
                              className="text-outline hover:text-red-600 transition-colors p-1">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
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

      {/* Modal Añadir Producto */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-primary text-lg">Añadir Nuevo Producto</h3>
              <button onClick={cerrarModal}
                className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorModal && <ErrorMessage mensaje={errorModal} />}

              {/* Selector de imagen */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Imagen del Producto (opcional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 border border-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0">
                    {preview ? (
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-outline text-2xl">image</span>
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2.5 border border-dashed border-outline-variant rounded-lg text-sm text-on-surface-variant hover:border-secondary hover:bg-gray-50 transition-colors text-center">
                      <span className="material-symbols-outlined text-base align-middle mr-1">upload</span>
                      {imagen ? imagen.name.slice(0, 25) : 'Seleccionar imagen'}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">JPG, PNG o WEBP · Máx 5 MB</p>
              </div>

              {/* Campo de texto libre con autocompletado */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Nombre del Producto
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: Urea 46%, Glifosato, Semilla Maíz..."
                    value={form.nombre_libre}
                    onChange={e => handleNombreChange(e.target.value)}
                    onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary"
                  />
                  {mostrarSugerencias && (
                    <ul className="absolute z-50 w-full bg-white border border-outline-variant rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {sugerencias.map(s => (
                        <li key={s.id}
                          onMouseDown={() => seleccionarSugerencia(s)}
                          className="px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-outline-variant/20 last:border-0">
                          <span className="font-medium">{s.nombre}</span>
                          <span className="text-xs text-on-surface-variant capitalize bg-gray-100 px-2 py-0.5 rounded">
                            {s.categoria}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Escribe para ver sugerencias o ingresa un nombre propio
                </p>
              </div>

              {/* Ingrediente activo */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Ingrediente Activo (opcional)
                </label>
                <input type="text" placeholder="Ej: Glifosato 480 g/L, Mancozeb 80%..."
                  value={form.ingrediente_activo}
                  onChange={e => setForm({ ...form, ingrediente_activo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                <p className="text-xs text-on-surface-variant mt-1">
                  El componente químico principal del producto
                </p>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Categoría</label>
                <select value={form.categoria}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary appearance-none bg-white">
                  <option value="fertilizante">Fertilizante</option>
                  <option value="semilla">Semilla</option>
                  <option value="plaguicida">Plaguicida</option>
                  <option value="herbicida">Herbicida</option>
                  <option value="fungicida">Fungicida</option>
                  <option value="insecticida">Insecticida</option>
                  <option value="herramienta">Herramienta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Precio Referencial ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                    <input type="number" placeholder="0.00"
                      value={form.precio_referencia}
                      onChange={e => setForm({ ...form, precio_referencia: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Stock Disponible</label>
                  <input type="number" placeholder="0"
                    value={form.stock_disponible}
                    onChange={e => setForm({ ...form, stock_disponible: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant/30 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button onClick={cerrarModal}
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

      {/* Modal Editar*/}
      {modalEditar && productoEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-primary text-lg">Editar Producto</h3>
              <button onClick={() => setModalEditar(false)}
                className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorEdit && <ErrorMessage mensaje={errorEdit} />}

              <div className="bg-gray-50 rounded-lg p-3 border border-outline-variant/20">
                <p className="text-xs text-on-surface-variant">Producto</p>
                <p className="font-semibold text-on-surface">{productoEditar.nombre}</p>
                <span className="text-xs text-on-surface-variant capitalize">{productoEditar.categoria}</span>
              </div>

              {/* Imagen en edición */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Imagen del Producto</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 border border-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0">
                    {previewEditar ? (
                      <img src={previewEditar} alt="preview" className="w-full h-full object-cover" />
                    ) : productoEditar.imagen_url ? (
                      <img src={`${API_BASE}${productoEditar.imagen_url}`} alt={productoEditar.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-outline text-2xl">image</span>
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2.5 border border-dashed border-outline-variant rounded-lg text-sm text-on-surface-variant hover:border-secondary hover:bg-gray-50 transition-colors text-center">
                      <span className="material-symbols-outlined text-base align-middle mr-1">upload</span>
                      {imagenEditar ? 'Cambiar imagen' : 'Subir nueva imagen'}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImagenEditarChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Ingrediente activo */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Ingrediente Activo</label>
                <input type="text" placeholder="Ej: Glifosato 480 g/L"
                  value={formEditar.ingrediente_activo}
                  onChange={e => setFormEditar({ ...formEditar, ingrediente_activo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Precio Referencial ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                  <input type="number" min="1"
                    value={formEditar.precio_referencia}
                    onChange={e => setFormEditar({ ...formEditar, precio_referencia: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Stock Disponible</label>
                <input type="number" min="0"
                  value={formEditar.stock_disponible}
                  onChange={e => setFormEditar({ ...formEditar, stock_disponible: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant/30 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setModalEditar(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-primary border border-outline-variant hover:bg-gray-100">
                Cancelar
              </button>
              <button onClick={handleGuardarEdicion} disabled={guardandoEdit}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-60">
                {guardandoEdit ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de confirmación */}
      <ConfirmDialog
        abierto={dialog.abierto}
        titulo={dialog.titulo}
        mensaje={dialog.mensaje}
        tipo={dialog.tipo}
        confirmText={dialog.confirmText}
        cancelText="Cancelar"
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog(d => ({ ...d, abierto: false }))}
      />
    </div>
  )
}