import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function Sidebar({ navItems, tipo = 'agricultor' }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const irA = (path) => {
    navigate(path)
    setAbierto(false) // cerrar menú móvil al navegar
  }

  const subtitulo = tipo === 'agricultor'
    ? 'Gestión Agrícola'
    : tipo === 'proveedor' ? 'Portal Proveedor' : 'Admin Portal'

  // Contenido del sidebar (reutilizado en desktop y móvil)
  const contenido = (
    <>
      <div className="mb-8 flex items-center gap-3">
        <img src={logo} alt="CultivaTech" className="h-10 w-10 object-contain rounded-lg" />
        <div>
          <h1 className="font-bold text-primary text-base">CultivaTech</h1>
          <p className="text-xs text-on-surface-variant capitalize">{subtitulo}</p>
        </div>
      </div>

      {tipo === 'agricultor' && (
        <button onClick={() => irA('/listas/nueva')}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold text-sm mb-6 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Nueva Lista
        </button>
      )}

      {tipo === 'proveedor' && (
        <button onClick={() => irA('/proveedor/cotizar')}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold text-sm mb-6 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">request_quote</span>
          Nueva Cotización
        </button>
      )}

      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <a key={item.label} onClick={() => irA(item.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all
              ${item.active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-gray-100'}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
            {item.badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-outline-variant/30 space-y-1">
        <a onClick={() => irA('/perfil')}
          className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
          <span className="material-symbols-outlined">person</span>
          Mi Perfil
        </a>
        <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
          <span className="material-symbols-outlined">support_agent</span>
          Soporte
        </a>
        <a onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
          <span className="material-symbols-outlined">logout</span>
          Cerrar sesión
        </a>
      </div>
    </>
  )

  return (
    <>
      {/* Botón hamburguesa - solo móvil */}
      <button onClick={() => setAbierto(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-11 h-11 bg-white border border-outline-variant/30 rounded-lg shadow-sm flex items-center justify-center text-on-surface">
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Sidebar desktop - siempre visible */}
      <aside className="hidden md:flex flex-col p-6 h-screen w-64 fixed left-0 top-0 bg-white border-r border-outline-variant/30 z-30 overflow-y-auto">
        {contenido}
      </aside>

      {/* Sidebar móvil - overlay deslizable */}
      {abierto && (
        <>
          {/* Backdrop oscuro */}
          <div onClick={() => setAbierto(false)}
            className="md:hidden fixed inset-0 bg-black/40 z-40"></div>

          {/* Panel deslizable */}
          <aside className="md:hidden fixed left-0 top-0 h-screen w-72 max-w-[80vw] bg-white border-r border-outline-variant/30 z-50 p-6 flex flex-col overflow-y-auto animate-slide-in-left">
            {/* Botón cerrar */}
            <button onClick={() => setAbierto(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-gray-100 rounded-lg">
              <span className="material-symbols-outlined">close</span>
            </button>
            {contenido}
          </aside>
        </>
      )}
    </>
  )
}