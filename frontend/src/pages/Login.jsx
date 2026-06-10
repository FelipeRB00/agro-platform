import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import logo from '../assets/logo.png'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data)
      const rol = res.data.rol
      if (rol === 'agricultor') navigate('/dashboard')
      else if (rol === 'proveedor') navigate('/proveedor/dashboard')
      else if (rol === 'admin') navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-[#f4f8f2]">

      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1a3a1a] via-[#2d6a2d] to-[#3d8b3d]">
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-[40px] border-white"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full border-[30px] border-white"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-white/20"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white text-center">
          <div className="w-44 h-44 rounded-full bg-white shadow-2xl flex items-center justify-center mb-8 p-4">
            <img src={logo} alt="CultivaTech" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold mb-3">CultivaTech</h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            La plataforma inteligente que conecta agricultores y proveedores para optimizar la compra de insumos agrícolas.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-md">
            {[
              { icon: 'insights', label: 'Predicción de precios' },
              { icon: 'handshake', label: 'Cotizaciones directas' },
              { icon: 'eco', label: 'Ahorro real' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <span className="text-xs text-white/70">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center p-3 border border-outline-variant/20">
              <img src={logo} alt="CultivaTech" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-primary mt-3">CultivaTech</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-on-surface mb-2">Bienvenido de vuelta</h2>
            <p className="text-on-surface-variant">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Correo electrónico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.cl"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-lg">{showPass ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}