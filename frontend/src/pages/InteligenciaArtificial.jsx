import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import logo from '../assets/logo.png'

const tendenciaConfig = {
  alza: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: 'trending_up', label: 'En alza' },
  baja: { color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: 'trending_down', label: 'En baja' },
  estable: { color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100', icon: 'trending_flat', label: 'Estable' },
  sin_datos: { color: 'text-gray-400', bg: 'bg-gray-50 border-gray-100', icon: 'help_outline', label: 'Sin datos' },
}

const confianzaBadge = {
  alta: 'bg-green-100 text-green-700',
  media: 'bg-yellow-100 text-yellow-700',
  baja: 'bg-gray-100 text-gray-600',
}

const categoriaBadge = {
  fertilizante: 'bg-green-100 text-green-800',
  semilla: 'bg-yellow-100 text-yellow-800',
  plaguicida: 'bg-red-100 text-red-800',
  otro: 'bg-gray-100 text-gray-700',
}

export default function InteligenciaArtificial() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [resumenPrecios, setResumenPrecios] = useState([])
  const [recomendaciones, setRecomendaciones] = useState([])
  const [prediccion, setPrediccion] = useState(null)
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null)
  const [diasPrediccion, setDiasPrediccion] = useState(30)
  const [loadingResumen, setLoadingResumen] = useState(true)
  const [loadingRec, setLoadingRec] = useState(true)
  const [loadingPrediccion, setLoadingPrediccion] = useState(false)
  const [tabActiva, setTabActiva] = useState('precios')
  const [alertas, setAlertas] = useState([])
  const [loadingAlertas, setLoadingAlertas] = useState(false)
  const [umbral, setUmbral] = useState(10)

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia', active: true },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
    { key: 'alertas', icon: 'notifications_active', label: 'Alertas de Precios' },
  ]

  useEffect(() => {
    api.get('/ia/resumen-precios')
      .then(res => setResumenPrecios(res.data))
      .catch(() => {})
      .finally(() => setLoadingResumen(false))

    api.get('/ia/recomendaciones')
      .then(res => setRecomendaciones(res.data))
      .catch(() => {})
      .finally(() => setLoadingRec(false))
  }, [])

  const handlePrediccion = async (insumo) => {
    setInsumoSeleccionado(insumo)
    setLoadingPrediccion(true)
    setPrediccion(null)
    try {
      const res = await api.get(`/ia/prediccion/${insumo.insumo_id}?dias=${diasPrediccion}`)
      setPrediccion(res.data)
    } catch {
      setPrediccion(null)
    } finally {
      setLoadingPrediccion(false)
    }
  }
  const cargarAlertas = async () => {
  setLoadingAlertas(true)
  try {
    const res = await api.get(`/ia/alertas-precios?umbral=${umbral}`)
    setAlertas(res.data)
  } catch {}
  finally { setLoadingAlertas(false) }
}

useEffect(() => {
  if (tabActiva === 'alertas') cargarAlertas()
}, [tabActiva, umbral])

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
          <h2 className="font-bold text-primary text-xl hidden md:block">Análisis con IA</h2>
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

          {/* Hero */}
          <div className="bg-primary rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <span className="material-symbols-outlined" style={{fontSize: '200px'}}>psychology</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                <span className="text-sm font-semibold text-green-200">Inteligencia Artificial</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">Análisis Predictivo de Precios</h2>
              <p className="text-green-100 text-sm">
                Usa modelos de Machine Learning para predecir tendencias de precios y optimizar tus compras.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white border border-outline-variant/30 rounded-xl p-1.5 w-fit">
            {[
              { key: 'precios', icon: 'show_chart', label: 'Predicción de Precios' },
              { key: 'recomendaciones', icon: 'recommend', label: 'Recomendaciones' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setTabActiva(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${tabActiva === tab.key ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-gray-100'}`}>
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Precios */}
          {tabActiva === 'precios' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Lista de insumos */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-primary text-lg">Insumos Disponibles</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">Predecir a</span>
                    <select value={diasPrediccion} onChange={e => setDiasPrediccion(parseInt(e.target.value))}
                      className="border border-outline-variant rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-secondary bg-white">
                      <option value={7}>7 días</option>
                      <option value={30}>30 días</option>
                      <option value={60}>60 días</option>
                      <option value={90}>90 días</option>
                    </select>
                  </div>
                </div>

                {loadingResumen ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : resumenPrecios.length === 0 ? (
                  <div className="bg-white rounded-xl border border-outline-variant/30 p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2 block">inventory_2</span>
                    <p className="text-sm text-on-surface-variant">No hay insumos con precios disponibles.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {resumenPrecios.map(insumo => (
                      <button key={insumo.insumo_id}
                        onClick={() => handlePrediccion(insumo)}
                        className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-md
                          ${insumoSeleccionado?.insumo_id === insumo.insumo_id ? 'border-primary shadow-md' : 'border-outline-variant/30'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm text-on-surface">{insumo.nombre}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${categoriaBadge[insumo.categoria] || 'bg-gray-100 text-gray-700'}`}>
                              {insumo.categoria}
                            </span>
                          </div>
                          <span className="text-xs text-on-surface-variant bg-gray-100 px-2 py-1 rounded">
                            {insumo.num_proveedores} proveedor(es)
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="text-center">
                            <p className="text-xs text-on-surface-variant">Mínimo</p>
                            <p className="text-sm font-bold text-green-700">${insumo.precio_min.toLocaleString('es-CL')}</p>
                          </div>
                          <div className="text-center border-x border-outline-variant/20">
                            <p className="text-xs text-on-surface-variant">Promedio</p>
                            <p className="text-sm font-bold text-primary">${insumo.precio_promedio.toLocaleString('es-CL')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-on-surface-variant">Máximo</p>
                            <p className="text-sm font-bold text-red-600">${insumo.precio_max.toLocaleString('es-CL')}</p>
                          </div>
                        </div>
                        <p className="text-xs text-primary font-semibold mt-3 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">auto_awesome</span>
                          Click para predecir precio
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Panel de predicción */}
              <div className="sticky top-24">
                {!insumoSeleccionado ? (
                  <div className="bg-white rounded-xl border border-dashed border-outline-variant p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3 block">auto_graph</span>
                    <h4 className="font-semibold text-on-surface mb-2">Selecciona un insumo</h4>
                    <p className="text-sm text-on-surface-variant">Haz click en un insumo de la izquierda para ver la predicción de precios.</p>
                  </div>
                ) : loadingPrediccion ? (
                  <div className="bg-white rounded-xl border border-outline-variant/30 p-12 text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-on-surface-variant">Analizando datos con IA...</p>
                  </div>
                ) : prediccion ? (
                  <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-bold text-primary text-lg">{prediccion.insumo_nombre}</h3>
                        <p className="text-xs text-on-surface-variant mt-1">{prediccion.mensaje}</p>
                      </div>
                      {prediccion.confianza && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${confianzaBadge[prediccion.confianza]}`}>
                          Confianza {prediccion.confianza}
                        </span>
                      )}
                    </div>

                    {/* Precio actual vs predicho */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 text-center border border-outline-variant/20">
                        <p className="text-xs text-on-surface-variant mb-1">Precio Actual</p>
                        <p className="text-2xl font-bold text-on-surface">
                          ${prediccion.precio_actual_promedio?.toLocaleString('es-CL') || 'N/A'}
                        </p>
                      </div>
                      <div className={`rounded-lg p-4 text-center border ${tendenciaConfig[prediccion.tendencia]?.bg || 'bg-gray-50 border-gray-100'}`}>
                        <p className="text-xs text-on-surface-variant mb-1">Predicción {diasPrediccion}d</p>
                        <p className={`text-2xl font-bold ${tendenciaConfig[prediccion.tendencia]?.color || 'text-on-surface'}`}>
                          ${prediccion.precio_predicho?.toLocaleString('es-CL') || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Tendencia */}
                    {prediccion.tendencia !== 'sin_datos' && (
                      <div className={`flex items-center gap-3 p-4 rounded-lg border mb-6 ${tendenciaConfig[prediccion.tendencia]?.bg}`}>
                        <span className={`material-symbols-outlined text-2xl ${tendenciaConfig[prediccion.tendencia]?.color}`}>
                          {tendenciaConfig[prediccion.tendencia]?.icon}
                        </span>
                        <div>
                          <p className={`font-bold ${tendenciaConfig[prediccion.tendencia]?.color}`}>
                            Tendencia: {tendenciaConfig[prediccion.tendencia]?.label}
                          </p>
                          <p className="text-sm text-on-surface-variant">
                            Variación estimada: <span className={`font-semibold ${prediccion.variacion_porcentual > 0 ? 'text-red-600' : prediccion.variacion_porcentual < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                              {prediccion.variacion_porcentual > 0 ? '+' : ''}{prediccion.variacion_porcentual}%
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Histórico */}
                    {prediccion.datos_historicos?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-on-surface mb-3">Historial de Precios</h4>
                        <div className="bg-gray-50 rounded-lg p-3 border border-outline-variant/20">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-on-surface-variant border-b border-outline-variant/20">
                                <th className="pb-2 text-left font-semibold">Fecha</th>
                                <th className="pb-2 text-right font-semibold">Precio</th>
                              </tr>
                            </thead>
                            <tbody>
                              {prediccion.datos_historicos.map((d, i) => (
                                <tr key={i} className="border-b border-outline-variant/10 last:border-0">
                                  <td className="py-1.5 text-on-surface-variant">{d.fecha}</td>
                                  <td className="py-1.5 text-right font-semibold text-on-surface">${d.precio.toLocaleString('es-CL')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Recomendación de acción */}
                    <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-sm">lightbulb</span>
                        Recomendación IA
                      </p>
                      <p className="text-sm text-on-surface">
                        {prediccion.tendencia === 'alza' && '⚠️ Se prevé un aumento de precios. Considera comprar pronto para ahorrar.'}
                        {prediccion.tendencia === 'baja' && '✅ Se prevé una baja de precios. Puedes esperar para obtener mejor precio.'}
                        {prediccion.tendencia === 'estable' && '📊 Los precios se mantienen estables. Compra cuando lo necesites.'}
                        {prediccion.tendencia === 'sin_datos' && '📈 Agrega más datos históricos para obtener predicciones más precisas.'}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Tab Recomendaciones */}
          {tabActiva === 'recomendaciones' && (
            <div>
              <div className="mb-6">
                <h3 className="font-bold text-primary text-lg mb-1">Insumos Recomendados para Ti</h3>
                <p className="text-sm text-on-surface-variant">Basado en tu historial y el comportamiento de otros agricultores.</p>
              </div>

              {loadingRec ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : recomendaciones.length === 0 ? (
                <div className="bg-white rounded-xl border border-outline-variant/30 p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-outline mb-3 block">recommend</span>
                  <h4 className="font-semibold text-on-surface mb-2">Sin recomendaciones aún</h4>
                  <p className="text-sm text-on-surface-variant mb-4">Crea y publica listas de compras para recibir recomendaciones personalizadas.</p>
                  <button onClick={() => navigate('/listas/nueva')}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                    Crear Lista
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recomendaciones.map((rec, i) => (
                    <div key={i} className="bg-white rounded-xl border border-outline-variant/30 p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${categoriaBadge[rec.categoria] || 'bg-gray-100 text-gray-700'}`}>
                          {rec.categoria}
                        </span>
                        {rec.popularidad > 0 && (
                          <span className="text-xs text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">people</span>
                            {rec.popularidad}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-on-surface mb-1">{rec.nombre}</h4>
                      <p className="text-xs text-on-surface-variant mb-4">{rec.razon}</p>

                      <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
                        <div>
                          {rec.precio_promedio ? (
                            <p className="text-sm font-bold text-primary">${rec.precio_promedio.toLocaleString('es-CL')}</p>
                          ) : (
                            <p className="text-xs text-on-surface-variant">Sin precio ref.</p>
                          )}
                          <p className="text-xs text-on-surface-variant">{rec.num_proveedores} proveedor(es)</p>
                        </div>
                        <button onClick={() => navigate('/listas/nueva')}
                          className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-colors">
                          Agregar a lista
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Tab Alertas */}
{tabActiva === 'alertas' && (
  <div>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h3 className="font-bold text-primary text-lg mb-1">Alertas Inteligentes de Precios</h3>
        <p className="text-sm text-on-surface-variant">Precios que varían significativamente respecto a su promedio histórico.</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-on-surface-variant">Umbral de variación:</span>
        <select value={umbral} onChange={e => setUmbral(parseInt(e.target.value))}
          className="border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-secondary bg-white">
          <option value={5}>5%</option>
          <option value={10}>10%</option>
          <option value={15}>15%</option>
          <option value={20}>20%</option>
        </select>
      </div>
    </div>

    {loadingAlertas ? (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    ) : alertas.length === 0 ? (
      <div className="bg-white rounded-xl border border-outline-variant/30 p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-green-500 mb-3 block">check_circle</span>
        <h4 className="font-semibold text-on-surface mb-2">Sin alertas activas</h4>
        <p className="text-sm text-on-surface-variant">
          No hay precios con variaciones mayores al {umbral}% respecto a su promedio histórico.
        </p>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {alertas.map((alerta, i) => (
          <div key={i}
            className={`bg-white rounded-xl border p-5 shadow-sm flex flex-col md:flex-row justify-between gap-4
              ${alerta.tipo_alerta === 'alza' ? 'border-red-200' : 'border-green-200'}`}>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0
                ${alerta.tipo_alerta === 'alza' ? 'bg-red-100' : 'bg-green-100'}`}>
                <span className={`material-symbols-outlined text-xl
                  ${alerta.tipo_alerta === 'alza' ? 'text-red-600' : 'text-green-600'}`}>
                  {alerta.tipo_alerta === 'alza' ? 'trending_up' : 'trending_down'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-on-surface">{alerta.insumo_nombre}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${alerta.severidad === 'alta' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {alerta.severidad === 'alta' ? '🔴 Alta' : '🟡 Media'}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mb-1">Proveedor: {alerta.proveedor_nombre}</p>
                <p className="text-sm text-on-surface">{alerta.mensaje}</p>
              </div>
            </div>

            <div className="flex gap-6 shrink-0 md:text-right">
              <div>
                <p className="text-xs text-on-surface-variant">Precio actual</p>
                <p className={`text-xl font-bold ${alerta.tipo_alerta === 'alza' ? 'text-red-600' : 'text-green-600'}`}>
                  ${alerta.precio_actual.toLocaleString('es-CL')}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Promedio histórico</p>
                <p className="text-xl font-bold text-on-surface">
                  ${alerta.precio_promedio_historico.toLocaleString('es-CL')}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Variación</p>
                <p className={`text-xl font-bold ${alerta.tipo_alerta === 'alza' ? 'text-red-600' : 'text-green-600'}`}>
                  {alerta.variacion_porcentual > 0 ? '+' : ''}{alerta.variacion_porcentual}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
          )}
        </main>
      </div>
    </div>
  )
}