import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import './Login.css'

export default function Login() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="CultivaTech" />
        </div>

        <div className="login-tabs">
          <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Iniciar sesión
          </button>
          <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => navigate('/register')}>
            Registrarse
          </button>
        </div>

        <h2 className="login-title">Bienvenido de vuelta</h2>
        <p className="login-sub">Ingresa tus datos para continuar</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <label className="login-label">Correo electrónico</label>
          <input className="login-input" type="email" name="email"
            placeholder="correo@ejemplo.com" value={form.email} onChange={handleChange} required />

          <label className="login-label">Contraseña</label>
          <input className="login-input" type="password" name="password"
            placeholder="••••••••" value={form.password} onChange={handleChange} required />

          <p className="login-forgot">¿Olvidaste tu contraseña?</p>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-divider">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  )
}