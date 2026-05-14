import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import logo from '../assets/logo.png'

export default function Register() {
  const [form, setForm] = useState({
    nombre: '', email: '', rut: '', telefono: '',
    password: '', confirmar_password: '', rol: 'agricultor'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmar_password) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', {
        nombre: form.nombre,
        email: form.email,
        rut: form.rut,
        telefono: form.telefono,
        password: form.password,
        rol: form.rol
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-white text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-secondary transition-all text-sm placeholder:text-outline/50"
  const labelClass = "block text-xs font-semibold text-on-surface-variant mb-1.5 ml-1"

  return (
    <div className="bg-[#e8f0e0] min-h-screen flex items-center justify-center font-sans antialiased text-on-surface py-8">
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
              onClick={() => navigate('/login')}
              className="flex-1 py-4 text-center border-b-2 border-transparent text-on-surface-variant hover:text-primary font-semibold text-sm tracking-wide transition-colors"
            >
              Iniciar Sesión
            </button>
            <button className="flex-1 py-4 text-center border-b-2 border-primary text-primary font-semibold text-sm tracking-wide transition-colors">
              Registrarse
            </button>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-on-surface mb-2">Crear cuenta</h1>
              <p className="text-on-surface-variant text-sm">Completa tus datos para comenzar</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Nombre */}
              <div>
                <label className={labelClass} htmlFor="nombre">Nombre completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">person</span>
                  </div>
                  <input id="nombre" name="nombre" type="text" required
                    placeholder="Juan Pérez"
                    value={form.nombre} onChange={handleChange}
                    className={inputClass} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass} htmlFor="email">Correo electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">mail</span>
                  </div>
                  <input id="email" name="email" type="email" required
                    placeholder="tu@empresa.com"
                    value={form.email} onChange={handleChange}
                    className={inputClass} />
                </div>
              </div>

              {/* RUT */}
              <div>
                <label className={labelClass} htmlFor="rut">RUT</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">badge</span>
                  </div>
                  <input id="rut" name="rut" type="text" required
                    placeholder="12.345.678-9"
                    value={form.rut} onChange={handleChange}
                    className={inputClass} />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className={labelClass} htmlFor="telefono">Teléfono</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">phone</span>
                  </div>
                  <input id="telefono" name="telefono" type="tel"
                    placeholder="+56 9 1234 5678"
                    value={form.telefono} onChange={handleChange}
                    className={inputClass} />
                </div>
              </div>

              {/* Rol */}
              <div>
                <label className={labelClass} htmlFor="rol">Tipo de cuenta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">group</span>
                  </div>
                  <select id="rol" name="rol"
                    value={form.rol} onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-white text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-secondary transition-all text-sm">
                    <option value="agricultor">Agricultor / Empresa Agrícola</option>
                    <option value="proveedor">Proveedor de Insumos</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelClass} htmlFor="password">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </div>
                  <input id="password" name="password"
                    type={showPassword ? 'text' : 'password'} required
                    placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-outline-variant rounded-lg bg-white text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-secondary transition-all text-sm placeholder:text-outline/50" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirmar Password */}
              <div>
                <label className={labelClass} htmlFor="confirmar_password">Confirmar contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </div>
                  <input id="confirmar_password" name="confirmar_password"
                    type={showPassword ? 'text' : 'password'} required
                    placeholder="••••••••"
                    value={form.confirmar_password} onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-white text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-secondary transition-all text-sm placeholder:text-outline/50" />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-lg font-semibold text-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
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