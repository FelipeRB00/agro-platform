import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8001/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000 // 10 segundos máximo
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
    if (error.response?.status === 401) {
      // Token expirado o inválido → limpiar sesión y redirigir
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }

    if (error.response?.status === 403) {
      window.location.href = '/login'
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        response: { data: { detail: 'El servidor tardó demasiado. Intenta nuevamente.' } }
      })
    }

    if (!error.response) {
      return Promise.reject({
        response: { data: { detail: 'No se pudo conectar al servidor. Verifica tu conexión.' } }
      })
    }

    return Promise.reject(error)
  }
)

export default api