import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import ErrorMessage from '../components/ErrorMessage'

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

export default function CrearLista() {
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [items, setItems] = useState([])
  const [insumos, setInsumos] = useState([])
  const [form, setForm] = useState({ insumo_id: '', cantidad: '', unidad: 'kg', nota: '' })
  const [loading, setLoading] = useState(false)
  const [loadingInsumos, setLoadingInsumos] = useState(true)
  const [error, setError] = useState('')

  // Buscador con autocompletado
  const [busquedaInsumo, setBusquedaInsumo] = useState('')
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null)
  const [sugerencias, setSugerencias] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas', active: true },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
  ]

  useEffect(() => {
    api.get('/insumos/')
      .then(res => setInsumos(res.data))
      .catch(() => setError('Error al cargar insumos'))
      .finally(() => setLoadingInsumos(false))
  }, [])

  // Buscar insumos al escribir
  const handleBusquedaChange = (valor) => {
    setBusquedaInsumo(valor)
    setInsumoSeleccionado(null)
    setForm({ ...form, insumo_id: '' })
    if (valor.length >= 2) {
      const filtradas = insumos.filter(i =>
        i.nombre.toLowerCase().includes(valor.toLowerCase()) ||
        (i.ingrediente_activo && i.ingrediente_activo.toLowerCase().includes(valor.toLowerCase()))
      )
      setSugerencias(filtradas.slice(0, 8))
      setMostrarSugerencias(filtradas.length > 0)
    } else {
      setMostrarSugerencias(false)
      setSugerencias([])
    }
  }

  const seleccionarInsumo = (insumo) => {
    setInsumoSeleccionado(insumo)
    setBusquedaInsumo(insumo.nombre)
    setForm({ ...form, insumo_id: insumo.id.toString() })
    setMostrarSugerencias(false)
  }

  const handleAddItem = () => {
    if (!insumoSeleccionado || !form.cantidad) return
    const yaExiste = items.find(i => i.insumo_id === insumoSeleccionado.id.toString())
    if (yaExiste) {
      setError('Este insumo ya está en la lista')
      return
    }
    setError('')
    setItems([...items, {
      insumo_id: insumoSeleccionado.id.toString(),
      cantidad: form.cantidad,
      unidad: form.unidad,
      nota: form.nota,
      insumo: insumoSeleccionado,
      id: Date.now()
    }])
    // Limpiar
    setForm({ insumo_id: '', cantidad: '', unidad: 'kg', nota: '' })
    setBusquedaInsumo('')
    setInsumoSeleccionado(null)
  }

  const handleRemove = (id) => setItems(items.filter(i => i.id !== id))

  const handleSubmit = async (estado) => {
    if (!titulo.trim()) {
      setError('El título no puede estar vacío')
      return
    }
    if (items.length === 0) {
      setError('Agrega al menos un ítem a la lista')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/listas/', {
        titulo: titulo.trim(),
        estado: 'borrador',
        items: items.map(i => ({
          insumo_id: parseInt(i.insumo_id),
          cantidad: parseFloat(i.cantidad),
          unidad_medida: i.unidad,
          nota: i.nota || null
        }))
      })

      if (estado === 'publicada') {
        await api.post(`/listas/${res.data.id}/publicar`)
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
      <Sidebar navItems={navItems} tipo="agricultor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Nueva Lista de Compras" />
        <main className="flex-1 p-5 md:p-10 max-w-7xl mx-auto w-full">

          <div className="mb-6">
            <button onClick={() => navigate('/listas')}
              className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline mb-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Volver a Mis Listas
            </button>
            <h2 className="text-2xl font-bold text-on-surface">Nueva Lista de Compras</h2>
          </div>

          {error && <div className="mb-4"><ErrorMessage mensaje={error} /></div>}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Título */}
              <section className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Título de la Lista <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="Ej: Insumos temporada Otoño 2026"
                  value={titulo} onChange={e => setTitulo(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" />
              </section>

              {/* Agregar ítem */}
              <section className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                <h3 className="font-semibold text-on-surface text-lg mb-4 pb-4 border-b border-outline-variant/30">
                  Añadir Ítems
                </h3>

                <div className="flex flex-col gap-4">
                  {/* Buscador de insumo */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      Buscar Insumo {!loadingInsumos && <span className="text-on-surface-variant/60">({insumos.length} disponibles)</span>}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                      <input
                        type="text"
                        placeholder={loadingInsumos ? 'Cargando insumos...' : 'Escribe el nombre o ingrediente activo...'}
                        value={busquedaInsumo}
                        onChange={e => handleBusquedaChange(e.target.value)}
                        onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                        onFocus={() => busquedaInsumo.length >= 2 && sugerencias.length > 0 && setMostrarSugerencias(true)}
                        disabled={loadingInsumos}
                        className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary"
                      />
                      {insumoSeleccionado && (
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-green-600">check_circle</span>
                      )}
                    </div>

                    {/* Lista de sugerencias */}
                    {mostrarSugerencias && (
                      <ul className="absolute z-50 w-full bg-white border border-outline-variant rounded-lg shadow-lg mt-1 max-h-72 overflow-y-auto">
                        {sugerencias.map(s => (
                          <li key={s.id}
                            onMouseDown={() => seleccionarInsumo(s)}
                            className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer border-b border-outline-variant/20 last:border-0">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-on-surface truncate">{s.nombre}</p>
                                {s.ingrediente_activo && (
                                  <p className="text-xs text-on-surface-variant truncate flex items-center gap-1 mt-0.5">
                                    <span className="material-symbols-outlined" style={{fontSize: '14px'}}>science</span>
                                    {s.ingrediente_activo}
                                  </p>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${categoriaBadge[s.categoria] || 'bg-gray-100 text-gray-700'}`}>
                                {s.categoria}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Mostrar ingrediente activo del seleccionado */}
                  {insumoSeleccionado?.ingrediente_activo && (
                    <div className="bg-secondary-container/20 border border-secondary-container rounded-lg p-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">science</span>
                      <p className="text-sm text-on-surface">
                        Ingrediente activo: <span className="font-semibold">{insumoSeleccionado.ingrediente_activo}</span>
                      </p>
                    </div>
                  )}

                  {/* Cantidad, unidad y botón */}
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Cantidad</label>
                      <input type="number" min="0.01" step="0.01" placeholder="0"
                        value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary" />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Unidad</label>
                      <select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary bg-white">
                        <option value="kg">kg</option>
                        <option value="litro">Litros</option>
                        <option value="saco">Sacos</option>
                        <option value="unidad">Unidades</option>
                      </select>
                    </div>
                    <button onClick={handleAddItem}
                      disabled={!insumoSeleccionado || !form.cantidad}
                      className="w-full md:w-auto bg-[#b7d6a8] text-[#2f4f2f] px-6 py-3 rounded-lg text-sm font-bold hover:bg-[#aed198] transition-colors flex items-center justify-center gap-2 h-[46px] shrink-0 disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">add</span>
                      Añadir
                    </button>
                  </div>
                </div>
              </section>

              {/* Tabla ítems */}
              <section className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                <h3 className="font-semibold text-on-surface text-lg mb-4">
                  Ítems Añadidos
                  {items.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-on-surface-variant">({items.length})</span>
                  )}
                </h3>
                {items.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border border-dashed border-outline-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
                    <p className="text-sm text-on-surface-variant">Aún no hay ítems. Busca un insumo arriba.</p>
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
                            <td className="py-4 px-4">
                              <p className="text-sm font-medium">{item.insumo?.nombre}</p>
                              {item.insumo?.ingrediente_activo && (
                                <p className="text-xs text-on-surface-variant">{item.insumo.ingrediente_activo}</p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${categoriaBadge[item.insumo?.categoria] || 'bg-gray-100 text-gray-700'}`}>
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
                    className="w-full bg-transparent text-secondary border border-secondary py-3 px-6 rounded-lg text-sm font-bold hover:bg-secondary/10 transition-colors flex justify-center items-center gap-2 disabled:opacity-60">
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