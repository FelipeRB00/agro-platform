import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

const estadoBadge = {
  borrador: 'bg-yellow-100 text-yellow-700',
  publicada: 'bg-green-100 text-green-700',
  cerrada: 'bg-gray-100 text-gray-600',
}

export default function MisListas() {
  const navigate = useNavigate()
  const [listas, setListas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas', active: true },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
  ]

  const cargarListas = () => {
    setLoading(true)
    setError('')
    api.get('/listas/')
      .then(res => setListas(res.data))
      .catch(() => setError('Error al cargar las listas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarListas() }, [])

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta lista?')) return
    try {
      await api.delete(`/listas/${id}`)
      setListas(listas.filter(l => l.id !== id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar')
    }
  }

  const handlePublicar = async (id) => {
    try {
      await api.post(`/listas/${id}/publicar`)
      setListas(listas.map(l => l.id === id ? { ...l, estado: 'publicada' } : l))
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al publicar')
    }
  }

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo="agricultor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Mis Listas de Compras" />
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Mis Listas</h2>
              <p className="text-sm text-on-surface-variant">{listas.length} lista(s) creadas</p>
            </div>
            <button onClick={() => navigate('/listas/nueva')}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              Nueva Lista
            </button>
          </div>

          {error && <ErrorMessage mensaje={error} onRetry={cargarListas} />}

          {loading ? (
            <LoadingSpinner texto="Cargando tus listas..." />
          ) : listas.length === 0 ? (
            <EmptyState
              icon="list_alt"
              titulo="No tienes listas aún"
              descripcion="Crea tu primera lista de compras y publícala para recibir cotizaciones de proveedores."
              accion="Crear Lista"
              onAccion={() => navigate('/listas/nueva')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listas.map(lista => (
                <div key={lista.id} className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-on-surface text-base truncate pr-2">{lista.titulo}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize shrink-0 ${estadoBadge[lista.estado]}`}>
                      {lista.estado}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant mb-4">
                    {lista.items?.length || 0} ítem(s) · {new Date(lista.creado_en).toLocaleDateString('es-CL')}
                  </p>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant/30">
                    {lista.estado === 'borrador' && (
                      <>
                        <button onClick={() => handlePublicar(lista.id)}
                          className="flex-1 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors text-center">
                          Publicar
                        </button>
                        <button onClick={() => handleEliminar(lista.id)}
                          className="p-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </>
                    )}
                    {lista.estado === 'publicada' && (
                      <button onClick={() => navigate('/cotizaciones', { state: { lista_id: lista.id } })}
                        className="flex-1 py-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors text-center">
                        Ver Cotizaciones
                      </button>
                    )}
                    {lista.estado === 'cerrada' && (
                      <button onClick={() => navigate('/cotizaciones', { state: { lista_id: lista.id } })}
                        className="flex-1 py-2 text-sm font-semibold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-gray-50 transition-colors text-center">
                        Ver Resumen
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}