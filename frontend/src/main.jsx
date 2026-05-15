import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CrearLista from './pages/CrearLista'
import Cotizaciones from './pages/Cotizaciones'
import HistorialPedidos from './pages/HistorialPedidos'
import DashboardProveedor from './pages/DashboardProveedor'
import CatalogoProveedor from './pages/CatalogoProveedor'
import ResponderCotizacion from './pages/ResponderCotizacion'
import DashboardAdmin from './pages/DashboardAdmin'
import MisListas from './pages/MisListas'
import SolicitudesProveedor from './pages/SolicitudesProveedor'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/listas/nueva" element={<CrearLista />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/pedidos" element={<HistorialPedidos />} />
          <Route path="/proveedor/dashboard" element={<DashboardProveedor />} />
          <Route path="/proveedor/catalogo" element={<CatalogoProveedor />} />
          <Route path="/proveedor/cotizar" element={<ResponderCotizacion />} />
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/listas" element={<MisListas />} />
          <Route path="/proveedor/solicitudes" element={<SolicitudesProveedor />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)