import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function Configuracion() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [prefs, setPrefs] = useState({
    notif_nueva_cotizacion: true,
    notif_nueva_solicitud: true,
    notif_cotizacion_aceptada: true,
    notif_email: false,
  })
  const [guardado, setGuardado] = useState(false)

  const navItemsAgricultor = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion', active: true },
  ]

  const navItemsProveedor = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard' },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes' },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion', active: true },
  ]

  const navItems = usuario?.rol === 'proveedor' ? navItemsProveedor : navItemsAgricultor
  const tipo = usuario?.rol === 'proveedor' ? 'proveedor' : 'agricultor'

  useEffect(() => {
    const saved = localStorage.getItem('cultivatech_prefs')
    if (saved) setPrefs(JSON.parse(saved))
  }, [])

  const handleGuardar = () => {
    localStorage.setItem('cultivatech_prefs', JSON.stringify(prefs))
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  const Toggle = ({ label, descripcion, value, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-outline-variant/20 last:border-0">
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{descripcion}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
        <input type="checkbox" className="sr-only peer" checked={value} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  )

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo={tipo} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Configuración" />
        <main className="flex-1 p-5 md:p-8 max-w-3xl mx-auto w-full">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface">Configuración</h2>
            <p className="text-sm text-on-surface-variant">Personaliza tu experiencia en CultivaTech.</p>
          </div>

          {guardado && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span className="font-semibold text-sm">Preferencias guardadas correctamente</span>
            </div>
          )}

          {/* Notificaciones en tiempo real */}
          <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">notifications</span>
              </div>
              <div>
                <h3 className="font-bold text-primary">Notificaciones en Tiempo Real</h3>
                <p className="text-xs text-on-surface-variant">Alertas que aparecen mientras usas la plataforma</p>
              </div>
            </div>

            {usuario?.rol === 'agricultor' && (
              <Toggle
                label="Nueva cotización recibida"
                descripcion="Notificación cuando un proveedor responde tu lista de compra"
                value={prefs.notif_nueva_cotizacion}
                onChange={e => setPrefs({ ...prefs, notif_nueva_cotizacion: e.target.checked })}
              />
            )}

            {usuario?.rol === 'proveedor' && (
              <Toggle
                label="Nueva solicitud de compra"
                descripcion="Notificación cuando un agricultor publica una lista con tus productos"
                value={prefs.notif_nueva_solicitud}
                onChange={e => setPrefs({ ...prefs, notif_nueva_solicitud: e.target.checked })}
              />
            )}

            <Toggle
              label="Cotización aceptada"
              descripcion="Notificación cuando tu cotización es aceptada o rechazada"
              value={prefs.notif_cotizacion_aceptada}
              onChange={e => setPrefs({ ...prefs, notif_cotizacion_aceptada: e.target.checked })}
            />
          </div>

          {/* Cuenta */}
          <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">manage_accounts</span>
              </div>
              <div>
                <h3 className="font-bold text-primary">Cuenta</h3>
                <p className="text-xs text-on-surface-variant">Información de tu cuenta actual</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Nombre', value: usuario?.nombre },
                { label: 'Rol', value: usuario?.rol, capitalize: true },
                { label: 'Correo', value: usuario?.email },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <span className="text-sm text-on-surface-variant">{item.label}</span>
                  <span className={`text-sm font-semibold text-on-surface ${item.capitalize ? 'capitalize' : ''}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/20 flex gap-3">
              <button onClick={() => navigate('/perfil')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
                Editar Perfil
              </button>
              <button onClick={() => navigate('/perfil')}
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                <span className="material-symbols-outlined text-sm">lock</span>
                Cambiar Contraseña
              </button>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end">
            <button onClick={handleGuardar}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">save</span>
              Guardar Preferencias
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}