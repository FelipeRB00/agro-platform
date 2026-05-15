import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const estadoBadge = {
  borrador: 'bg-yellow-100 text-yellow-700',
  publicada: 'bg-green-100 text-green-700',
  cerrada: 'bg-gray-100 text-gray-600',
}

export default function MisListas() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [listas, setListas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas', active: true },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  useEffect(() => {
    api.get('/listas/')
      .then(res => setListas(res.data))
      .catch(() => setError('Error al cargar las listas'))
      .finally(() => setLoading(false))
  }, [])

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta lista?')) return
    try {
      await api.delete(`/listas/${id}`)
      setListas(listas.filter(l => l.id !== id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar')
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
        <button onClick={() => navigate('/listas/nueva')}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold text-sm mb-6 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Nueva Lista
        </button>
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
          <h2 className="font-bold text-primary text-xl">Mis Listas de Compras</h2>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm text-primary">{usuario?.nombre}</p>
              <p className="text-xs text-on-surface-variant capitalize">{usuario?.rol}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-sm text-on-secondary-container">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-on-surface-variant">Cargando listas...</p>
              </div>
            </div>
          ) : listas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">list_alt</span>
              <h3 className="text-lg font-semibold text-on-surface mb-2">No tienes listas aún</h3>
              <p className="text-sm text-on-surface-variant mb-6">Crea tu primera lista de compras para comenzar.</p>
              <button onClick={() => navigate('/listas/nueva')}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined">add</span>
                Crear Lista
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listas.map(lista => (
                <div key={lista.id} className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-on-surface text-base">{lista.titulo}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${estadoBadge[lista.estado]}`}>
                      {lista.estado}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-4">
                    {lista.items?.length || 0} ítem(s) · {new Date(lista.creado_en).toLocaleDateString('es-CL')}
                  </p>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant/30">
                    <button onClick={() => navigate(`/listas/${lista.id}`)}
                      className="flex-1 py-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors text-center">
                      Ver detalle
                    </button>
                    {lista.estado === 'borrador' && (
                      <button onClick={() => handleEliminar(lista.id)}
                        className="p-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
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