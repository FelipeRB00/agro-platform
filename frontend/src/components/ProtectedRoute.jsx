import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/login" />

  if (roles && !roles.includes(usuario.rol)) {
    // Redirigir al dashboard correcto según rol
    if (usuario.rol === 'agricultor') return <Navigate to="/dashboard" />
    if (usuario.rol === 'proveedor') return <Navigate to="/proveedor/dashboard" />
    if (usuario.rol === 'admin') return <Navigate to="/admin/dashboard" />
  }

  return children
}