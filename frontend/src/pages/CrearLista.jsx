import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function CrearLista() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [items, setItems] = useState([])
  const [insumos, setInsumos] = useState([])
  const [form, setForm] = useState({ insumo_id: '', cantidad: '', unidad: 'kg', nota: '' })
  const [loading, setLoading] = useState(false)
  const [loadingInsumos, setLoadingInsumos] = useState(true)
  const [error, setError] = useState('')

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas', active: true },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  // Cargar insumos reales desde la API
  useEffect(() => {
    api.get('/insumos/')
      .then(res => setInsumos(res.data))
      .catch(() => setError('Error al cargar insumos'))
      .finally(() => setLoadingInsumos(false))
  }, [])

  const handleAddItem = () => {
    if (!form.insumo_id || !form.cantidad) return
    const insumo = insumos.find(i => i.id === parseInt(form.insumo_id))
    setItems([...items, { ...form, insumo, id: Date.now() }])
    setForm({ insumo_id: '', cantidad: '', unidad: 'kg', nota: '' })
  }

  const handleRemove = (id) => setItems(items.filter(i => i.id !== id))

  const handleSubmit = async (estado) => {
    if (!titulo || items.length === 0) {
      setError('Agrega un título y al menos un ítem')
      return
    }
    setLoading(true)
    setError('')
    try {
      const lista = await api.post('/listas/', {
        titulo,
        estado,
        items: items.map(i => ({
          insumo_id: parseInt(i.insumo_id),
          cantidad: parseFloat(i.cantidad),
          unidad_medida: i.unidad,
          nota: i.nota || null
        }))
      })

      // Si se publicó, alertar proveedores automáticamente
      if (estado === 'publicada') {
        await api.post(`/listas/${lista.data.id}/publicar`)
      }

      navigate('/listas')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar la lista')
    } finally {
      setLoading(false)
    }
  }

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
          <h2 className="font-bold text-primary text-xl hidden md:block">Nueva Lista de Compras</h2>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm text-primary">{usuario?.nombre}</p>
              <p className="text-xs text-on-surface-variant capitalize">{usuario?.rol}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-10 max-w-7xl mx-auto w-full">

          <div className="mb-6">
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline mb-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Volver al Dashboard
            </button>
            <h2 className="text-2xl font-bold text-on-surface">Nueva Lista de Compras</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Título */}
              <section className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                <label className="block text-sm font-semibold text-on-surface mb-2">Título de la Lista</label>
                <input type="text" placeholder="Ej: Insumos de temporada Otoño 2026"
                  value={titulo} onChange={e => setTitulo(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" />
              </section>

              {/* Agregar ítem */}
              <section className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                <h3 className="font-semibold text-on-surface text-lg mb-4 pb-4 border-b border-outline-variant/30">Añadir Ítems</h3>
                <div className="flex flex-col md:flex-row gap-4 items-end">

                  {/* Insumo */}
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Insumo</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-sm">search</span>
                      <select value={form.insumo_id} onChange={e => setForm({ ...form, insumo_id: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-secondary bg-white appearance-none">
                        <option value="">
                          {loadingInsumos ? 'Cargando insumos...' : 'Seleccionar insumo...'}
                        </option>
                        {insumos.map(i => (
                          <option key={i.id} value={i.id}>{i.nombre} ({i.categoria})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cantidad */}
                  <div className="w-full md:w-28">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Cantidad</label>
                    <input type="number" min="1" placeholder="0"
                      value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })}
                      className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary" />
                  </div>

                  {/* Unidad */}
                  <div className="w-full md:w-28">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Unidad</label>
                    <select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}
                      className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary bg-white">
                      <option value="kg">kg</option>
                      <option value="litro">Litros</option>
                      <option value="saco">Sacos</option>
                      <option value="unidad">Unidades</option>
                    </select>
                  </div>

                  {/* Botón */}
                  <button onClick={handleAddItem}
                    className="w-full md:w-auto bg-[#b7d6a8] text-[#2f4f2f] px-6 py-3 rounded-lg text-sm font-bold hover:bg-[#aed198] transition-colors flex items-center justify-center gap-2 border border-[#6c8c5a]/30 h-[46px] shrink-0">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Añadir
                  </button>
                </div>
              </section>

              {/* Tabla de ítems */}
              <section className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                <h3 className="font-semibold text-on-surface text-lg mb-4">Ítems Añadidos</h3>
                {items.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border border-dashed border-outline-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
                    <p className="text-sm text-on-surface-variant">Aún no hay ítems en esta lista.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/30">
                          <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant">Ítem</th>
                          <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant">Categoría</th>
                          <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant text-right">Cantidad</th>
                          <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant">Unidad</th>
                          <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.id} className="border-b border-outline-variant/30 hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm font-medium">{item.insumo?.nombre}</td>
                            <td className="py-4 px-4">
                              <span className="bg-[#b7d6a8]/20 text-[#1e3717] px-2 py-1 rounded text-xs font-semibold capitalize">
                                {item.insumo?.categoria}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-right font-semibold">{item.cantidad}</td>
                            <td className="py-4 px-4 text-sm text-outline">{item.unidad}</td>
                            <td className="py-4 px-4 text-center">
                              <button onClick={() => handleRemove(item.id)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors inline-flex">
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {/* Right - Resumen */}
            <div className="lg:col-span-4">
              <section className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm sticky top-24">
                <h3 className="font-semibold text-on-surface text-lg mb-4">Resumen</h3>
                <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
                  <span className="text-sm text-on-surface-variant">Total de ítems</span>
                  <span className="text-2xl font-bold text-primary">{items.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
                  <span className="text-sm text-on-surface-variant">Estado</span>
                  <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Borrador</span>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <button onClick={() => handleSubmit('publicada')} disabled={loading}
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 disabled:opacity-60">
                    <span className="material-symbols-outlined text-sm">send</span>
                    {loading ? 'Publicando...' : 'Publicar a Proveedores'}
                  </button>
                  <button onClick={() => handleSubmit('borrador')} disabled={loading}
                    className="w-full bg-transparent text-secondary border border-secondary py-3 px-6 rounded-lg text-sm font-bold hover:bg-secondary/10 transition-colors flex justify-center items-center gap-2">
                    <span className="material-symbols-outlined text-sm">save</span>
                    Guardar como Borrador
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}