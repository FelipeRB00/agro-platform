import { useAuth } from '../context/AuthContext'

export default function Header({ titulo }) {
  const { usuario } = useAuth()

  return (
    <header className="flex justify-between items-center h-16 px-6 bg-white/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-20">
      <h2 className="font-bold text-primary text-xl hidden md:block">{titulo}</h2>
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-full relative">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm text-primary">{usuario?.nombre}</p>
            <p className="text-xs text-on-surface-variant capitalize">{usuario?.rol}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-sm text-on-secondary-container">
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}