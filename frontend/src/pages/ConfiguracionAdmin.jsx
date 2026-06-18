import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import logo from '../assets/logo.png'

export default function ConfiguracionAdmin() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  // Perfil
  const [perfil, setPerfil] = useState({ nombre: '', telefono: '' })
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [msgPerfil, setMsgPerfil] = useState({ tipo: '', texto: '' })

  // Contraseña
  const [pass, setPass] = useState({ password_actual: '', password_nuevo: '', confirmar: '' })
  const [guardandoPass, setGuardandoPass] = useState(false)
  const [msgPass, setMsgPass] = useState({ tipo: '', texto: '' })

  // Datos bancarios
  const [banco, setBanco] = useState({
    banco: '', tipo_cuenta: 'corriente', numero_cuenta: '', rut_titular: '', nombre_titular: ''
  })
  const [guardandoBanco, setGuardandoBanco] = useState(false)
  const [msgBanco, setMsgBanco] = useState({ tipo: '', texto: '' })

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: 'group', label: 'Usuarios', path: '/admin/usuarios' },
    { icon: 'payments', label: 'Comisiones', path: '/admin/pagos' },
    { icon: 'settings', label: 'Configuración', path: '/admin/configuracion', active: true },
  ]

  useEffect(() => {
    Promise.all([
      api.get('/perfil/'),
      api.get('/perfil/datos-bancarios-admin')
    ])
      .then(([resP, resB]) => {
        setPerfil({ nombre: resP.data.nombre || '', telefono: resP.data.telefono || '' })
        setBanco({
          banco: resB.data.banco || '',
          tipo_cuenta: resB.data.tipo_cuenta || 'corriente',
          numero_cuenta: resB.data.numero_cuenta || '',
          rut_titular: resB.data.rut_titular || '',
          nombre_titular: resB.data.nombre_titular || ''
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const guardarPerfil = async () => {
    if (!perfil.nombre.trim()) {
      setMsgPerfil({ tipo: 'error', texto: 'El nombre no puede estar vacío' })
      return
    }
    setGuardandoPerfil(true)
    setMsgPerfil({ tipo: '', texto: '' })
    try {
      await api.put('/perfil/', { nombre: perfil.nombre, telefono: perfil.telefono })
      setMsgPerfil({ tipo: 'success', texto: 'Perfil actualizado correctamente' })
    } catch (err) {
      setMsgPerfil({ tipo: 'error', texto: err.response?.data?.detail || 'Error al guardar' })
    } finally {
      setGuardandoPerfil(false)
    }
  }

  const guardarPassword = async () => {
    if (!pass.password_actual || !pass.password_nuevo) {
      setMsgPass({ tipo: 'error', texto: 'Completa todos los campos' })
      return
    }
    if (pass.password_nuevo !== pass.confirmar) {
      setMsgPass({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden' })
      return
    }
    if (pass.password_nuevo.length < 6) {
      setMsgPass({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }
    setGuardandoPass(true)
    setMsgPass({ tipo: '', texto: '' })
    try {
      await api.put('/perfil/cambiar-password', {
        password_actual: pass.password_actual,
        password_nuevo: pass.password_nuevo
      })
      setMsgPass({ tipo: 'success', texto: 'Contraseña actualizada correctamente' })
      setPass({ password_actual: '', password_nuevo: '', confirmar: '' })
    } catch (err) {
      setMsgPass({ tipo: 'error', texto: err.response?.data?.detail || 'Error al cambiar contraseña' })
    } finally {
      setGuardandoPass(false)
    }
  }

  const guardarBanco = async () => {
    setGuardandoBanco(true)
    setMsgBanco({ tipo: '', texto: '' })
    try {
      await api.put('/perfil/datos-bancarios-admin', banco)
      setMsgBanco({ tipo: 'success', texto: 'Datos bancarios actualizados correctamente' })
    } catch (err) {
      setMsgBanco({ tipo: 'error', texto: err.response?.data?.detail || 'Error al guardar' })
    } finally {
      setGuardandoBanco(false)
    }
  }

  const Mensaje = ({ msg }) => {
    if (!msg.texto) return null
    return (
      <div className={`p-3 rounded-lg text-sm flex items-center gap-2 mb-4
        ${msg.tipo === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        <span className="material-symbols-outlined text-base">
          {msg.tipo === 'success' ? 'check_circle' : 'error'}
        </span>
        {msg.texto}
      </div>
    )
  }

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

        <nav className="flex-1 flex flex-col gap-1 mt-2">
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
            <h2 className="text-2xl font-bold text-on-surface">Configuración</h2>
            <p className="text-sm text-on-surface-variant">Administra tu perfil y la cuenta de cobro de comisiones.</p>
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

        <div className="p-8 max-w-3xl w-full mx-auto flex flex-col gap-6">

          {loading ? (
            <LoadingSpinner texto="Cargando configuración..." />
          ) : (
            <>
              {/* Sección Perfil */}
              <section className="bg-white border border-[#dfe7da] rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h3 className="font-bold text-on-surface text-lg">Perfil</h3>
                </div>
                <Mensaje msg={msgPerfil} />
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nombre</label>
                    <input type="text" value={perfil.nombre}
                      onChange={e => setPerfil({ ...perfil, nombre: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Teléfono</label>
                    <input type="text" value={perfil.telefono}
                      onChange={e => setPerfil({ ...perfil, telefono: e.target.value })}
                      placeholder="+56 9 ..."
                      className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                  </div>
                </div>
                <div className="flex justify-end mt-5">
                  <button onClick={guardarPerfil} disabled={guardandoPerfil}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-60">
                    {guardandoPerfil ? 'Guardando...' : 'Guardar Perfil'}
                  </button>
                </div>
              </section>

              {/* Sección Seguridad */}
              <section className="bg-white border border-[#dfe7da] rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  <h3 className="font-bold text-on-surface text-lg">Seguridad</h3>
                </div>
                <Mensaje msg={msgPass} />
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Contraseña actual</label>
                    <input type="password" value={pass.password_actual}
                      onChange={e => setPass({ ...pass, password_actual: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nueva contraseña</label>
                      <input type="password" value={pass.password_nuevo}
                        onChange={e => setPass({ ...pass, password_nuevo: e.target.value })}
                        className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Confirmar contraseña</label>
                      <input type="password" value={pass.confirmar}
                        onChange={e => setPass({ ...pass, confirmar: e.target.value })}
                        className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-5">
                  <button onClick={guardarPassword} disabled={guardandoPass}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-60">
                    {guardandoPass ? 'Guardando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </section>

              {/* Sección Datos de Cobro */}
              <section className="bg-white border border-[#dfe7da] rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                  <h3 className="font-bold text-on-surface text-lg">Datos de Cobro</h3>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">
                  Cuenta donde los proveedores depositan la comisión mensual.
                </p>
                <Mensaje msg={msgBanco} />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Banco</label>
                      <input type="text" value={banco.banco}
                        onChange={e => setBanco({ ...banco, banco: e.target.value })}
                        placeholder="Ej: Banco Estado"
                        className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Tipo de cuenta</label>
                      <select value={banco.tipo_cuenta}
                        onChange={e => setBanco({ ...banco, tipo_cuenta: e.target.value })}
                        className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary bg-white">
                        <option value="corriente">Cuenta Corriente</option>
                        <option value="vista">Cuenta Vista</option>
                        <option value="ahorro">Cuenta de Ahorro</option>
                        <option value="rut">Cuenta RUT</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Número de cuenta</label>
                    <input type="text" value={banco.numero_cuenta}
                      onChange={e => setBanco({ ...banco, numero_cuenta: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">RUT titular</label>
                      <input type="text" value={banco.rut_titular}
                        onChange={e => setBanco({ ...banco, rut_titular: e.target.value })}
                        placeholder="12.345.678-9"
                        className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nombre titular</label>
                      <input type="text" value={banco.nombre_titular}
                        onChange={e => setBanco({ ...banco, nombre_titular: e.target.value })}
                        className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-5">
                  <button onClick={guardarBanco} disabled={guardandoBanco}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-60">
                    {guardandoBanco ? 'Guardando...' : 'Guardar Datos de Cobro'}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}