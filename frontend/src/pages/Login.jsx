import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function Login() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (  
<div className="bg-[#e8f0e0] min-h-screen flex items-center justify-center font-sans antialiased text-on-surface">
      <main className="w-full max-w-md px-5 md:px-0">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="CultivaTech Logo" className="h-40 w-auto object-contain" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-outline-variant/30">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-4 text-center border-b-2 font-semibold text-sm tracking-wide transition-colors
                ${tab === 'login' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 py-4 text-center border-b-2 border-transparent text-on-surface-variant hover:text-primary font-semibold text-sm tracking-wide transition-colors"
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-on-surface mb-2">Bienvenido de nuevo</h1>
              <p className="text-on-surface-variant">Ingresa tus credenciales para acceder a tu cuenta.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 ml-1" htmlFor="email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">mail</span>
                  </div>
                  <input
                    id="email" name="email" type="email" required
                    placeholder="tu@empresa.com"
                    value={form.email} onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-white text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-secondary transition-all text-sm placeholder:text-outline/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="password">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs font-semibold text-secondary hover:text-primary transition-colors underline underline-offset-2">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </div>
                  <input
                    id="password" name="password" type={showPassword ? 'text' : 'password'} required
                    placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-outline-variant rounded-lg bg-white text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-secondary transition-all text-sm placeholder:text-outline/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox"
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 text-on-surface-variant text-sm cursor-pointer">
                  Mantener sesión iniciada
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-lg font-semibold text-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-outline text-xs font-semibold">O continuar con</span>
              </div>
            </div>

            {/* Google */}
            <div className="mt-6">
              <button type="button"
                className="w-full flex items-center justify-center py-2.5 px-4 border border-outline-variant rounded-lg bg-white text-on-surface-variant text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center flex justify-center space-x-6">
          <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Privacidad</a>
          <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Términos</a>
          <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Soporte</a>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-outline-variant">© 2024 CultivaTech. Todos los derechos reservados.</p>
        </div>
      </main>
    </div>
  )
}