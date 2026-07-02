import axios from 'axios'
import { API_URL } from '../config'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000 // 15 segundos máximo (producción puede ser más lenta)
})

// Interceptor de request - agrega token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de response - maneja errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = window.location.pathname
    const enAuth = path === '/login' || path === '/register'

    // Token expirado o inválido → cerrar sesión (solo si NO estamos en login/register)
    if (error.response?.status === 401 && !enAuth) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        response: { data: { detail: 'El servidor tardó demasiado. Intenta nuevamente.' } }
      })
    }

    // Sin conexión al servidor
    if (!error.response) {
      return Promise.reject({
        response: { data: { detail: 'No se pudo conectar al servidor. Verifica tu conexión.' } }
      })
    }

    return Promise.reject(error)
  }
)

export default api