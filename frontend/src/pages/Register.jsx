import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import logo from '../assets/logo.png'
import { validarRut, formatearRut, validarEmail, validarTelefono } from '../utils/validaciones'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    rut: '',
    telefono: '',
    password: '',
    rol: 'agricultor'
  })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validar todos los campos
    const nuevosErrores = {}
    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    }
    if (!validarEmail(form.email)) {
      nuevosErrores.email = 'Correo electrónico inválido'
    }
    if (!validarRut(form.rut)) {
      nuevosErrores.rut = 'RUT inválido (verifica el dígito verificador)'
    }
    if (!validarTelefono(form.telefono)) {
      nuevosErrores.telefono = 'Teléfono inválido (ej: +56 9 1234 5678)'
    }
    if (form.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setErrores({})
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      // Auto-login tras registro
      const res = await api.post('/auth/login', { email: form.email, password: form.password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('usuario', JSON.stringify(res.data))
      if (form.rol === 'agricultor') navigate('/dashboard')
      else navigate('/proveedor/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar la cuenta')
    } finally {
      setLoading(false)
    }
  }

  // Helper para clase de input según error
  const inputClass = (campo, extra = '') =>
    `w-full ${extra} py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all
    ${errores[campo]
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-outline-variant focus:border-primary focus:ring-primary/10'}`

  return (
    <div className="min-h-screen flex font-sans bg-[#f4f8f2]">

      {/* Panel izquierdo - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center p-4 border border-outline-variant/20 overflow-hidden">
              <img src={logo} alt="CultivaTech" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-primary mt-3">CultivaTech</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-on-surface mb-2">Crear cuenta</h2>
            <p className="text-on-surface-variant">Únete y empieza a optimizar tus compras</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Selector de rol */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Tipo de cuenta</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'agricultor', label: 'Agricultor', icon: 'agriculture' },
                  { value: 'proveedor', label: 'Proveedor', icon: 'store' },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setForm({ ...form, rol: opt.value })}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all
                      ${form.rol === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}>
                    <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                    <span className="text-sm font-semibold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                {form.rol === 'proveedor' ? 'Nombre de contacto' : 'Nombre completo'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
                <input type="text" placeholder="Juan Pérez"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className={inputClass('nombre', 'pl-11 pr-4')} />
              </div>
              {errores.nombre && <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>}
            </div>

            {/* Email y RUT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Correo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
                  <input type="email" placeholder="tu@correo.cl"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputClass('email', 'pl-11 pr-3')} />
                </div>
                {errores.email && <p className="text-xs text-red-500 mt-1">{errores.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">RUT</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">badge</span>
                  <input type="text" placeholder="12.345.678-9"
                    value={form.rut}
                    onChange={e => setForm({ ...form, rut: formatearRut(e.target.value) })}
                    maxLength={12}
                    className={inputClass('rut', 'pl-11 pr-3')} />
                </div>
                {errores.rut && <p className="text-xs text-red-500 mt-1">{errores.rut}</p>}
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Teléfono</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">phone</span>
                <input type="tel" placeholder="+56 9 1234 5678"
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  className={inputClass('telefono', 'pl-11 pr-4')} />
              </div>
              {errores.telefono && <p className="text-xs text-red-500 mt-1">{errores.telefono}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                <input type={showPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={inputClass('password', 'pl-11 pr-11')} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-lg">{showPass ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              {errores.password && <p className="text-xs text-red-500 mt-1">{errores.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-2">
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Panel derecho decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1a3a1a] via-[#2d6a2d] to-[#3d8b3d] order-1 lg:order-2">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[40px] border-white"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full border-[30px] border-white"></div>
          <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-white/20"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white text-center">
          <div className="w-44 h-44 rounded-full bg-white shadow-2xl flex items-center justify-center mb-8 p-6 overflow-hidden">
            <img src={logo} alt="CultivaTech" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Únete a CultivaTech</h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed mb-10">
            Toma decisiones de compra más inteligentes con datos reales y conexión directa con proveedores.
          </p>

          <div className="space-y-4 w-full max-w-sm text-left">
            {[
              'Compara cotizaciones de múltiples proveedores',
              'Recibe predicciones de precios con IA',
              'Gestiona tus compras desde un solo lugar',
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">check</span>
                </div>
                <span className="text-sm text-white/85">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}