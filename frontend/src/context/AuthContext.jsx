import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const data = localStorage.getItem('usuario')
    return data ? JSON.parse(data) : null
  })

  const login = (data) => {
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('usuario', JSON.stringify({ nombre: data.nombre, rol: data.rol }))
    setUsuario({ nombre: data.nombre, rol: data.rol })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)