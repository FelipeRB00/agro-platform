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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)