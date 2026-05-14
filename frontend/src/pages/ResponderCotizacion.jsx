import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const solicitud = {
  id: 'REQ-8294',
  agricultor: 'Carlos Mendoza',
  ubicacion: 'Finca La Esperanza, Región del Maule',
  badge: 'Cliente Frecuente',
  items: [
    { id: 1, nombre: 'Urea 46% Granulada', desc: 'Fertilizante nitrogenado estándar.', cantidad: '50', unidad: 'Toneladas', fecha: '15 Oct 2026' },
    { id: 2, nombre: 'Semilla de Maíz Híbrido Blanco', desc: 'Sacos de 20kg. Alta resistencia a sequía.', cantidad: '200', unidad: 'Bolsas', fecha: '20 Oct 2026' },
  ]
}

export default function ResponderCotizacion() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [precios, setPrecios] = useState({ 1: '', 2: '' })
  const [cantidades, setCantidades] = useState({ 1: '', 2: '' })
  const [nota, setNota] = useState('')
  const [enviado, setEnviado] = useState(false)

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard' },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes', active: true },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  const calcularTotal = () => {
    return solicitud.items.reduce((acc, item) => {
      const precio = parseFloat(precios[item.id] || 0)
      const cantidad = parseFloat(cantidades[item.id] || item.cantidad)
      return acc + (precio * cantidad)
    }, 0)
  }

  const handleEnviar = (e) => {
    e.preventDefault()
    setEnviado(true)
    setTimeout(() => navigate('/proveedor/dashboard'), 2000)
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
      <main className="flex-1 md:ml-64 p-6 md:p-10 min-h-screen">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">
              Responder Cotización #{solicitud.id}
            </h1>
            <p className="text-on-surface-variant">Revisa los detalles y envía tu mejor oferta.</p>
          </div>
          <button onClick={() => navigate('/proveedor/dashboard')}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-on-surface-variant rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
            <span className="material-symbols-outlined">arrow_back</span>
            Volver
          </button>
        </div>

        {/* Success message */}
        {enviado && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-semibold">¡Cotización enviada exitosamente! Redirigiendo...</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start max-w-6xl">

          {/* Left - Solicitud del Agricultor */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col gap-6">

            {/* Agricultor info */}
            <div className="flex items-start gap-4 pb-6 border-b border-outline-variant/30">
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-2xl font-bold text-on-secondary-container shrink-0">
                {solicitud.agricultor.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">{solicitud.agricultor}</h2>
                <div className="flex items-center gap-1 mt-1 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined" style={{fontSize: '18px'}}>location_on</span>
                  {solicitud.ubicacion}
                </div>
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                  {solicitud.badge}
                </span>
              </div>
            </div>

            {/* Items solicitados */}
            <div>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Artículos Solicitados</h3>
              <div className="flex flex-col gap-4">
                {solicitud.items.map(item => (
                  <div key={item.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-on-surface">{item.nombre}</h4>
                        <p className="text-sm text-on-surface-variant">{item.desc}</p>
                      </div>
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-md text-sm font-bold shrink-0 ml-2">
                        {item.cantidad} {item.unidad}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>calendar_today</span>
                      Fecha requerida: {item.fecha}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Formulario de cotización */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-6 pb-4 border-b border-outline-variant/30">Tu Cotización</h2>

            <form onSubmit={handleEnviar} className="flex flex-col gap-6">

              {/* Items a cotizar */}
              {solicitud.items.map(item => (
                <div key={item.id} className="p-5 border border-outline-variant/30 rounded-lg bg-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <h4 className="font-semibold text-sm text-on-surface mb-4">Cotizar: {item.nombre}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        Precio Unitario (por {item.unidad.slice(0, -1)})
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                        <input type="number" placeholder="0.00" required
                          value={precios[item.id]}
                          onChange={e => setPrecios({ ...precios, [item.id]: e.target.value })}
                          className="w-full pl-8 pr-3 py-2.5 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Cantidad Disponible</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder={item.cantidad} required
                          value={cantidades[item.id]}
                          onChange={e => setCantidades({ ...cantidades, [item.id]: e.target.value })}
                          className="w-full px-3 py-2.5 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-sm" />
                        <span className="text-sm text-on-surface-variant shrink-0">{item.unidad}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal preview */}
                  {precios[item.id] && cantidades[item.id] && (
                    <div className="mt-3 text-right text-sm text-on-surface-variant">
                      Subtotal: <span className="font-bold text-primary">
                        ${(parseFloat(precios[item.id]) * parseFloat(cantidades[item.id])).toLocaleString('es-CL')}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Total */}
              {calcularTotal() > 0 && (
                <div className="bg-secondary-container/20 border border-secondary-container rounded-lg p-4 flex justify-between items-center">
                  <span className="font-semibold text-on-surface">Total Estimado</span>
                  <span className="text-2xl font-bold text-primary">${calcularTotal().toLocaleString('es-CL')}</span>
                </div>
              )}

              {/* Nota */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                  Nota Opcional para el Agricultor
                </label>
                <textarea placeholder="Ej. El flete está incluido en el precio unitario..."
                  value={nota} onChange={e => setNota(e.target.value)}
                  className="w-full p-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-sm h-24 resize-none" />
              </div>

              {/* Logística */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-on-surface">Opciones de Logística</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">El agricultor ha solicitado entrega en finca. Asegúrate de incluir estos costos si aplican.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-outline-variant/30">
                <button type="button"
                  className="px-6 py-3 border border-secondary text-secondary rounded-lg font-semibold text-sm hover:bg-secondary/5 transition-colors w-full sm:w-auto text-center">
                  Guardar Borrador
                </button>
                <button type="submit" disabled={enviado}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                  <span className="material-symbols-outlined">send</span>
                  Enviar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}