import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'

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

  // Estado del dialog
  const [dialog, setDialog] = useState({
    abierto: false,
    titulo: '',
    mensaje: '',
    tipo: 'info',
    confirmText: 'Confirmar',
    onConfirm: null
  })

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones', active: true },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
  ]

  const seleccionarLista = (lista) => {
    setListaSeleccionada(lista)
    setLoadingCotizaciones(true)
    setCotizaciones([])
    api.get(`/cotizaciones/por-lista/${lista.id}`)
      .then(res => setCotizaciones(res.data))
      .catch(() => { })
      .finally(() => setLoadingCotizaciones(false))
  }

  useEffect(() => {
    api.get('/listas/')
      .then(res => {
        const publicadas = res.data.filter(l =>
          l.estado === 'publicada' || l.estado === 'cerrada'
        )
        setListas(publicadas)
        if (listaId) {
          const lista = publicadas.find(l => l.id === listaId)
          if (lista) seleccionarLista(lista)
          else if (publicadas.length > 0) seleccionarLista(publicadas[0])
        } else if (publicadas.length > 0) {
          seleccionarLista(publicadas[0])
        }
      })
      .catch(() => { })
      .finally(() => setLoadingListas(false))
  }, [])

  const cerrarDialog = () => setDialog(d => ({ ...d, abierto: false }))

  // Ejecuta la aceptación
  const ejecutarAceptar = async (cotizacionId) => {
    setAceptando(cotizacionId)
    try {
      await api.put(`/cotizaciones/${cotizacionId}/aceptar`)
      setMensaje('✅ ¡Cotización aceptada! La lista ha sido cerrada.')

      const res = await api.get(`/cotizaciones/por-lista/${listaSeleccionada.id}`)
      setCotizaciones(res.data)

      setListas(
        listas.map(l =>
          l.id === listaSeleccionada.id ? { ...l, estado: 'cerrada' } : l
        )
      )
      setListaSeleccionada(prev => ({ ...prev, estado: 'cerrada' }))

      navigate(`/pago/${cotizacionId}`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al aceptar cotización')
    } finally {
      setAceptando(null)
    }
  }

  // Abre el dialog de confirmación
  const handleAceptar = (cotizacionId) => {
    setDialog({
      abierto: true,
      titulo: 'Aceptar Cotización',
      mensaje: 'Al aceptar esta cotización, las demás serán rechazadas automáticamente y serás dirigido a la pantalla de pago. ¿Deseas continuar?',
      tipo: 'success',
      confirmText: 'Sí, aceptar y pagar',
      onConfirm: () => {
        cerrarDialog()
        ejecutarAceptar(cotizacionId)
      }
    })
  }

  const totalCotizacion = (cot) => cot.items.reduce((acc, i) => acc + i.subtotal, 0)
  const mejorCotizacion = cotizaciones.length > 0
    ? cotizaciones.reduce((a, b) => totalCotizacion(a) < totalCotizacion(b) ? a : b)
    : null

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo="agricultor" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Cotizaciones" />
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">

          {mensaje && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined">check_circle</span>
              <span className="font-semibold">{mensaje}</span>
            </div>
          )}

          {loadingListas ? (
            <LoadingSpinner texto="Cargando cotizaciones..." />
          ) : listas.length === 0 ? (
            <EmptyState
              icon="request_quote"
              titulo="No hay listas publicadas"
              descripcion="Publica una lista de compras para empezar a recibir cotizaciones de proveedores."
              accion="Crear Lista"
              onAccion={() => navigate('/listas/nueva')}
            />
          ) : (
            <div className="flex flex-col md:flex-row gap-6">

              {/* Selector de listas */}
              <div className="w-full md:w-72 shrink-0">
                <h3 className="font-bold text-primary text-lg mb-4">Mis Listas</h3>
                <div className="flex flex-col gap-2">
                  {listas.map(lista => (
                    <button key={lista.id} onClick={() => seleccionarLista(lista)}
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
                          ${listaSeleccionada?.id === lista.id
                            ? 'bg-white/20 text-white'
                            : lista.estado === 'cerrada' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                          {lista.estado}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Panel cotizaciones */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-primary text-lg">
                    Cotizaciones: <span className="text-on-surface">{listaSeleccionada?.titulo}</span>
                  </h3>
                  <span className="text-sm text-on-surface-variant">{cotizaciones.length} cotización(es)</span>
                </div>

                {loadingCotizaciones ? (
                  <LoadingSpinner texto="Cargando cotizaciones..." />
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

                          {/* Nombre + estado (el estado ahora va al lado del nombre, no en la esquina) */}
                          <div className="mb-5 pr-28">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-on-surface text-lg">{cot.proveedor_nombre}</h4>
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoBadge[cot.estado]}`}>
                                {estadoLabel[cot.estado]}
                              </span>
                            </div>
                            {cot.nota && <p className="text-sm text-on-surface-variant italic mt-1">"{cot.nota}"</p>}
                          </div>

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
                                    <td className="py-2">
                                      <div className="flex items-center gap-2">
                                        {item.imagen_url && (
                                          <img src={`http://127.0.0.1:8001${item.imagen_url}`} alt={item.insumo_nombre}
                                            className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0" />
                                        )}
                                        <div>
                                          <p>{item.insumo_nombre}</p>
                                          {item.ingrediente_activo && (
                                            <p className="text-xs text-on-surface-variant">{item.ingrediente_activo}</p>
                                          )}
                                        </div>
                                      </div>
                                    </td>
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
                              <button onClick={() => handleAceptar(cot.id)}
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
                                Aceptada
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

      {/* Dialog de confirmación */}
      <ConfirmDialog
        abierto={dialog.abierto}
        titulo={dialog.titulo}
        mensaje={dialog.mensaje}
        tipo={dialog.tipo}
        confirmText={dialog.confirmText}
        cancelText="Cancelar"
        onConfirm={dialog.onConfirm}
        onCancel={cerrarDialog}
      />
    </div>
  )
}