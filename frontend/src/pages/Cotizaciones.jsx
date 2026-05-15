import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import logo from '../assets/logo.png'

const estadoBadge = {
  aceptada: 'bg-green-100 text-green-800',
  pendiente: 'bg-gray-100 text-gray-700',
  rechazada: 'bg-red-100 text-red-700',
}

const estadoLabel = {
  aceptada: 'Aceptada',
  pendiente: 'Pendiente',
  rechazada: 'Rechazada',
}

export default function Cotizaciones() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const listaId = location.state?.lista_id

  const [listas, setListas] = useState([])
  const [listaSeleccionada, setListaSeleccionada] = useState(null)
  const [cotizaciones, setCotizaciones] = useState([])
  const [loadingListas, setLoadingListas] = useState(true)
  const [loadingCotizaciones, setLoadingCotizaciones] = useState(false)
  const [aceptando, setAceptando] = useState(null)
  const [mensaje, setMensaje] = useState('')

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones', active: true },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  // Cargar listas publicadas
  useEffect(() => {
    api.get('/listas/')
      .then(res => {
        const publicadas = res.data.filter(l => l.estado === 'publicada' || l.estado === 'cerrada')
        setListas(publicadas)
        // Si viene con lista_id desde navegación, seleccionarla
        if (listaId) {
          const lista = publicadas.find(l => l.id === listaId)
          if (lista) seleccionarLista(lista)
        } else if (publicadas.length > 0) {
          seleccionarLista(publicadas[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoadingListas(false))
  }, [])

  const seleccionarLista = (lista) => {
    setListaSeleccionada(lista)
    setLoadingCotizaciones(true)
    setCotizaciones([])
    api.get(`/cotizaciones/por-lista/${lista.id}`)
      .then(res => setCotizaciones(res.data))
      .catch(() => {})
      .finally(() => setLoadingCotizaciones(false))
  }

  const handleAceptar = async (cotizacionId) => {
    if (!confirm('¿Aceptar esta cotización? Las demás serán rechazadas automáticamente.')) return
    setAceptando(cotizacionId)
    try {
      await api.put(`/cotizaciones/${cotizacionId}/aceptar`)
      setMensaje('✅ ¡Cotización aceptada! La lista ha sido cerrada.')
      // Recargar cotizaciones
      const res = await api.get(`/cotizaciones/por-lista/${listaSeleccionada.id}`)
      setCotizaciones(res.data)
      // Actualizar estado de lista
      setListas(listas.map(l => l.id === listaSeleccionada.id ? { ...l, estado: 'cerrada' } : l))
      setListaSeleccionada(prev => ({ ...prev, estado: 'cerrada' }))
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al aceptar cotización')
    } finally {
      setAceptando(null)
    }
  }

  const totalCotizacion = (cot) => cot.items.reduce((acc, i) => acc + i.subtotal, 0)
  const mejorCotizacion = cotizaciones.length > 0
    ? cotizaciones.reduce((a, b) => totalCotizacion(a) < totalCotizacion(b) ? a : b)
    : null

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
          <h2 className="font-bold text-primary text-xl hidden md:block">Cotizaciones</h2>
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

          {mensaje && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined">check_circle</span>
              <span className="font-semibold">{mensaje}</span>
            </div>
          )}

          {loadingListas ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : listas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">request_quote</span>
              <h3 className="text-lg font-semibold text-on-surface mb-2">No hay listas publicadas</h3>
              <p className="text-sm text-on-surface-variant mb-6">Publica una lista de compras para recibir cotizaciones.</p>
              <button onClick={() => navigate('/listas/nueva')}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined">add</span>
                Crear Lista
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">

              {/* Left - Selector de listas */}
              <div className="w-full md:w-72 shrink-0">
                <h3 className="font-bold text-primary text-lg mb-4">Mis Listas</h3>
                <div className="flex flex-col gap-2">
                  {listas.map(lista => (
                    <button key={lista.id}
                      onClick={() => seleccionarLista(lista)}
                      className={`w-full text-left p-4 rounded-xl border transition-all
                        ${listaSeleccionada?.id === lista.id
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-white border-outline-variant/30 hover:border-primary/30 hover:shadow-sm'}`}>
                      <p className={`font-semibold text-sm truncate ${listaSeleccionada?.id === lista.id ? 'text-white' : 'text-on-surface'}`}>
                        {lista.titulo}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${listaSeleccionada?.id === lista.id ? 'text-green-200' : 'text-on-surface-variant'}`}>
                          {lista.items?.length || 0} ítem(s)
                        </p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize
                          ${lista.estado === 'cerrada'
                            ? listaSeleccionada?.id === lista.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                            : listaSeleccionada?.id === lista.id ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                          {lista.estado}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right - Cotizaciones */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-primary text-lg">
                    Cotizaciones para: <span className="text-on-surface">{listaSeleccionada?.titulo}</span>
                  </h3>
                  <span className="text-sm text-on-surface-variant">{cotizaciones.length} cotización(es)</span>
                </div>

                {loadingCotizaciones ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : cotizaciones.length === 0 ? (
                  <div className="bg-white rounded-xl border border-outline-variant/30 p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3 block">hourglass_empty</span>
                    <h4 className="font-semibold text-on-surface mb-2">Esperando cotizaciones</h4>
                    <p className="text-sm text-on-surface-variant">Los proveedores recibirán una notificación y enviarán sus ofertas pronto.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {cotizaciones.map(cot => {
                      const total = totalCotizacion(cot)
                      const esMejor = mejorCotizacion?.id === cot.id && cot.estado !== 'rechazada'
                      return (
                        <article key={cot.id}
                          className={`bg-white rounded-xl p-6 border shadow-sm relative overflow-hidden transition-all
                            ${esMejor ? 'border-2 border-primary/40 shadow-md' : 'border-outline-variant/30'}
                            ${cot.estado === 'rechazada' ? 'opacity-60' : ''}`}>

                          {esMejor && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-bl-xl flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">star</span>
                              Mejor Precio
                            </div>
                          )}

                          <div className="flex justify-between items-start mb-5">
                            <div>
                              <h4 className="font-bold text-on-surface text-lg">{cot.proveedor_nombre}</h4>
                              {cot.nota && (
                                <p className="text-sm text-on-surface-variant italic mt-1">"{cot.nota}"</p>
                              )}
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoBadge[cot.estado]}`}>
                              {estadoLabel[cot.estado]}
                            </span>
                          </div>

                          {/* Tabla de items */}
                          <div className="bg-gray-50 rounded-lg p-4 mb-5">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="text-on-surface-variant border-b border-outline-variant/30">
                                  <th className="pb-2 font-semibold">Ítem</th>
                                  <th className="pb-2 font-semibold text-right">Precio Unit.</th>
                                  <th className="pb-2 font-semibold text-right">Cantidad</th>
                                  <th className="pb-2 font-semibold text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cot.items.map((item, i) => (
                                  <tr key={i} className="border-b border-outline-variant/10 last:border-0">
                                    <td className="py-2">{item.insumo_nombre}</td>
                                    <td className="py-2 text-right">${item.precio_unitario.toLocaleString('es-CL')}</td>
                                    <td className="py-2 text-right">{item.cantidad_ofrecida}</td>
                                    <td className="py-2 text-right font-semibold">${item.subtotal.toLocaleString('es-CL')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-on-surface-variant">Total Estimado</p>
                              <p className={`text-2xl font-bold ${esMejor ? 'text-primary' : 'text-on-surface'}`}>
                                ${total.toLocaleString('es-CL')}
                                <span className="text-sm font-normal text-on-surface-variant ml-1">CLP</span>
                              </p>
                            </div>

                            {cot.estado === 'pendiente' && listaSeleccionada?.estado !== 'cerrada' && (
                              <button
                                onClick={() => handleAceptar(cot.id)}
                                disabled={aceptando === cot.id}
                                className="bg-primary text-white font-semibold text-sm py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60">
                                {aceptando === cot.id ? 'Aceptando...' : 'Aceptar Cotización'}
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                              </button>
                            )}

                            {cot.estado === 'aceptada' && (
                              <button disabled
                                className="bg-gray-100 text-gray-500 font-semibold text-sm py-3 px-6 rounded-lg flex items-center gap-2 cursor-not-allowed">
                                <span className="material-symbols-outlined text-sm">task_alt</span>
                                Cotización Aceptada
                              </button>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}