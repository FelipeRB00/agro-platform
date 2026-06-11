import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import logo from '../assets/logo.png'

const rolBadge = {
  admin: 'bg-red-100 text-red-700',
  proveedor: 'bg-gray-200 text-gray-700',
  agricultor: 'bg-green-100 text-primary',
}

const rolLabel = { admin: 'Admin', proveedor: 'Proveedor', agricultor: 'Agricultor' }

export default function Usuarios() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formUsuario, setFormUsuario] = useState({
    nombre: '', email: '', rut: '', telefono: '', password: '', rol: 'agricultor'
  })
  const [creando, setCreando] = useState(false)
  const [errorModal, setErrorModal] = useState('')

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: 'group', label: 'Usuarios', path: '/admin/usuarios', active: true },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  const cargarDatos = () => {
    setLoading(true)
    setError('')
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/usuarios')
    ]).then(([statsRes, usersRes]) => {
      setStats(statsRes.data)
      setUsuarios(usersRes.data)
    }).catch(() => setError('Error al cargar datos del panel'))
    .finally(() => setLoading(false))
  }

  useEffect(() => { cargarDatos() }, [])

  const toggleActivo = async (id, activo) => {
    try {
      await api.put(`/admin/usuarios/${id}`, { activo: !activo })
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, activo: !activo } : u))
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al actualizar')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return
    try {
      await api.delete(`/admin/usuarios/${id}`)
      setUsuarios(usuarios.filter(u => u.id !== id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar')
    }
  }

  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    setCreando(true)
    setErrorModal('')
    try {
      await api.post('/auth/register', formUsuario)
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/usuarios')
      ])
      setStats(statsRes.data)
      setUsuarios(usersRes.data)
      setFormUsuario({ nombre: '', email: '', rut: '', telefono: '', password: '', rol: 'agricultor' })
      setModalAbierto(false)
    } catch (err) {
      setErrorModal(err.response?.data?.detail || 'Error al crear usuario')
    } finally {
      setCreando(false)
    }
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.rut.includes(busqueda)
    const matchRol = filtroRol === 'todos' || u.rol === filtroRol
    return matchBusqueda && matchRol
  })

  const statCards = stats ? [
    { icon: 'group', label: 'Total Usuarios', value: stats.total_usuarios, bg: 'bg-secondary-container', text: 'text-on-secondary-container', dark: false },
    { icon: 'storefront', label: 'Proveedores', value: stats.total_proveedores, bg: 'bg-gray-100', text: 'text-primary', dark: false },
    { icon: 'agriculture', label: 'Agricultores', value: stats.total_agricultores, bg: 'bg-green-100', text: 'text-primary', dark: false },
    { icon: 'verified_user', label: 'Usuarios Activos', value: stats.usuarios_activos, bg: 'bg-primary-container', text: 'text-white', dark: true },
  ] : []

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">

      {/* Sidebar Admin */}
      <aside className="bg-white h-screen w-64 fixed left-0 top-0 flex flex-col py-6 px-4 gap-4 border-r border-outline-variant/30 z-50">
        <div className="flex items-center gap-3 px-2 mb-2">
          <img src={logo} alt="CultivaTech" className="h-10 w-10 object-contain rounded-lg" />
          <div>
            <h1 className="font-bold text-primary text-base">CultivaTech</h1>
            <p className="text-xs text-on-surface-variant">Admin Portal</p>
          </div>
        </div>

        <button onClick={() => setModalAbierto(true)}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
          <span className="material-symbols-outlined">person_add</span>
          Crear Usuario
        </button>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(item => (
            <a key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all
                ${item.active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-1">
          <a onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">

        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-[#f4f8f2]/90 backdrop-blur-md border-b border-outline-variant/20">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Gestión de Usuarios</h2>
            <p className="text-sm text-on-surface-variant">Administra los usuarios de la plataforma.</p>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-sm text-on-secondary-container">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="font-semibold text-sm text-on-surface">{usuario?.nombre}</p>
              <p className="text-xs text-on-surface-variant">Administrador</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">

          {error && <ErrorMessage mensaje={error} onRetry={cargarDatos} />}

          {loading ? (
            <LoadingSpinner texto="Cargando usuarios..." />
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((s, i) => (
                  <div key={i} className={`${s.dark ? 'bg-primary-container' : 'bg-white'} rounded-2xl border border-[#dfe7da] p-6 hover:shadow-lg transition-all relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className={`material-symbols-outlined text-6xl ${s.dark ? 'text-white' : 'text-primary'}`}>{s.icon}</span>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center mb-4`}>
                      <span className={`material-symbols-outlined ${s.text}`}>{s.icon}</span>
                    </div>
                    <p className={`text-xs font-semibold mb-1 ${s.dark ? 'text-green-200' : 'text-on-surface-variant'}`}>{s.label}</p>
                    <h3 className={`text-4xl font-bold ${s.dark ? 'text-white' : 'text-on-surface'}`}>{s.value}</h3>
                  </div>
                ))}
              </div>

              {/* Tabla usuarios */}
              <div className="bg-white rounded-2xl border border-[#dfe7da] overflow-hidden">
                <div className="p-6 border-b border-[#dfe7da] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-on-surface">Listado de Usuarios</h3>
                  <div className="flex gap-3 flex-wrap">
                    <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}
                      className="px-3 py-2 border border-[#dfe7da] rounded-lg text-sm focus:outline-none focus:border-secondary bg-white">
                      <option value="todos">Todos los roles</option>
                      <option value="agricultor">Agricultores</option>
                      <option value="proveedor">Proveedores</option>
                      <option value="admin">Admins</option>
                    </select>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                      <input type="text" placeholder="Buscar usuarios..."
                        value={busqueda} onChange={e => setBusqueda(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-[#dfe7da] rounded-lg text-sm w-56 focus:outline-none focus:border-secondary" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f4f8f2] border-b border-[#dfe7da]">
                        <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Nombre</th>
                        <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Email</th>
                        <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">RUT</th>
                        <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Rol</th>
                        <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Estado</th>
                        <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant">Registro</th>
                        <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfe7da]">
                      {usuariosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-sm text-on-surface-variant">
                            No se encontraron usuarios.
                          </td>
                        </tr>
                      ) : usuariosFiltrados.map(u => (
                        <tr key={u.id} className="hover:bg-[#f4f8f2]/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold shrink-0">
                                {u.nombre.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-on-surface">{u.nombre}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-on-surface-variant">{u.email}</td>
                          <td className="py-4 px-6 text-sm text-on-surface-variant">{u.rut}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${rolBadge[u.rol]}`}>
                              {rolLabel[u.rol]}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={u.activo}
                                onChange={() => toggleActivo(u.id, u.activo)} />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </td>
                          <td className="py-4 px-6 text-sm text-on-surface-variant">
                            {new Date(u.creado_en).toLocaleDateString('es-CL')}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button onClick={() => eliminar(u.id)}
                              className="text-on-surface-variant hover:text-red-600 transition-colors p-1">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-[#dfe7da] bg-white flex justify-between items-center">
                  <p className="text-xs text-on-surface-variant">
                    Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal Crear Usuario */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-outline-variant/30">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-bold text-primary text-lg">Crear Nuevo Usuario</h3>
              <button onClick={() => { setModalAbierto(false); setErrorModal('') }}
                className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCrearUsuario}>
              <div className="p-6 space-y-4">
                {errorModal && <ErrorMessage mensaje={errorModal} />}
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nombre completo</label>
                  <input type="text" required placeholder="Juan Pérez"
                    value={formUsuario.nombre}
                    onChange={e => setFormUsuario({ ...formUsuario, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Correo electrónico</label>
                  <input type="email" required placeholder="correo@ejemplo.com"
                    value={formUsuario.email}
                    onChange={e => setFormUsuario({ ...formUsuario, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">RUT</label>
                    <input type="text" required placeholder="12.345.678-9"
                      value={formUsuario.rut}
                      onChange={e => setFormUsuario({ ...formUsuario, rut: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Teléfono</label>
                    <input type="tel" placeholder="+56 9 1234 5678"
                      value={formUsuario.telefono}
                      onChange={e => setFormUsuario({ ...formUsuario, telefono: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Rol</label>
                  <select value={formUsuario.rol}
                    onChange={e => setFormUsuario({ ...formUsuario, rol: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary appearance-none bg-white">
                    <option value="agricultor">Agricultor</option>
                    <option value="proveedor">Proveedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Contraseña temporal</label>
                  <input type="password" required placeholder="Mínimo 6 caracteres"
                    value={formUsuario.password}
                    onChange={e => setFormUsuario({ ...formUsuario, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-outline-variant/30 bg-gray-50 flex justify-end gap-3">
                <button type="button"
                  onClick={() => { setModalAbierto(false); setErrorModal('') }}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-primary border border-outline-variant hover:bg-gray-100">
                  Cancelar
                </button>
                <button type="submit" disabled={creando}
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  {creando ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}