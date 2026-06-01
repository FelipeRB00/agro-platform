import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import NotificacionesToast from './components/NotificacionesToast'

import Login from './pages/Login'
import Register from './pages/Register'
import Perfil from './pages/Perfil'

// Agricultor
import Dashboard from './pages/Dashboard'
import CrearLista from './pages/CrearLista'
import MisListas from './pages/MisListas'
import Cotizaciones from './pages/Cotizaciones'
import HistorialPedidos from './pages/HistorialPedidos'
import InteligenciaArtificial from './pages/InteligenciaArtificial'

// Proveedor
import DashboardProveedor from './pages/DashboardProveedor'
import SolicitudesProveedor from './pages/SolicitudesProveedor'
import CatalogoProveedor from './pages/CatalogoProveedor'
import ResponderCotizacion from './pages/ResponderCotizacion'

// Admin
import DashboardAdmin from './pages/DashboardAdmin'

import './index.css'

function HomeRedirect() {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" />
  if (usuario.rol === 'agricultor') return <Navigate to="/dashboard" />
  if (usuario.rol === 'proveedor') return <Navigate to="/proveedor/dashboard" />
  if (usuario.rol === 'admin') return <Navigate to="/admin/dashboard" />
  return <Navigate to="/login" />
}

// ✅ Componente wrapper que incluye las notificaciones globales
function AppContent() {
  const { usuario } = useAuth()
  return (
    <>
      {usuario && <NotificacionesToast />}
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Agricultor */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['agricultor']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/listas" element={
          <ProtectedRoute roles={['agricultor']}>
            <MisListas />
          </ProtectedRoute>
        } />
        <Route path="/listas/nueva" element={
          <ProtectedRoute roles={['agricultor']}>
            <CrearLista />
          </ProtectedRoute>
        } />
        <Route path="/cotizaciones" element={
          <ProtectedRoute roles={['agricultor']}>
            <Cotizaciones />
          </ProtectedRoute>
        } />
        <Route path="/pedidos" element={
          <ProtectedRoute roles={['agricultor']}>
            <HistorialPedidos />
          </ProtectedRoute>
        } />
        <Route path="/ia" element={
          <ProtectedRoute roles={['agricultor']}>
            <InteligenciaArtificial />
          </ProtectedRoute>
        } />

        {/* Proveedor */}
        <Route path="/proveedor/dashboard" element={
          <ProtectedRoute roles={['proveedor']}>
            <DashboardProveedor />
          </ProtectedRoute>
        } />
        <Route path="/proveedor/solicitudes" element={
          <ProtectedRoute roles={['proveedor']}>
            <SolicitudesProveedor />
          </ProtectedRoute>
        } />
        <Route path="/proveedor/catalogo" element={
          <ProtectedRoute roles={['proveedor']}>
            <CatalogoProveedor />
          </ProtectedRoute>
        } />
        <Route path="/proveedor/cotizar" element={
          <ProtectedRoute roles={['proveedor']}>
            <ResponderCotizacion />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <DashboardAdmin />
          </ProtectedRoute>
        } />

        {/* Perfil */}
        <Route path="/perfil" element={
          <ProtectedRoute roles={['agricultor', 'proveedor']}>
            <Perfil />
          </ProtectedRoute>
        } />

        {/* Ruta desconocida */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)