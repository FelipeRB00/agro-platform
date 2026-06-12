import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const REGIONES = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama',
  'Coquimbo', 'Valparaíso', 'Metropolitana', "O'Higgins",
  'Maule', 'Ñuble', 'Biobío', 'La Araucanía',
  'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
]

const BANCOS = [
  'Banco de Chile', 'BancoEstado', 'Banco Santander', 'Banco BCI',
  'Banco Itaú', 'Scotiabank', 'Banco Falabella', 'Banco Security',
  'Banco BICE', 'Banco Ripley', 'Banco Consorcio', 'Coopeuch'
]

export default function Perfil() {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()

  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [cambiandoPass, setCambiandoPass] = useState(false)
  const [tab, setTab] = useState('info')
  const [error, setError] = useState('')
  const [errorPass, setErrorPass] = useState('')
  const [exito, setExito] = useState('')
  const [exitoPass, setExitoPass] = useState('')

  const [formBasico, setFormBasico] = useState({ nombre: '', telefono: '' })
  const [formExtendido, setFormExtendido] = useState({})
  const [formPass, setFormPass] = useState({
    password_actual: '', password_nuevo: '', confirmar: ''
  })
  const [showPass, setShowPass] = useState(false)

  // Datos bancarios (solo proveedor)
  const [formBanco, setFormBanco] = useState({
    banco: '', tipo_cuenta: '', numero_cuenta: '', rut_titular: '', nombre_titular: ''
  })
  const [guardandoBanco, setGuardandoBanco] = useState(false)
  const [errorBanco, setErrorBanco] = useState('')
  const [exitoBanco, setExitoBanco] = useState('')

  const navItemsAgricultor = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: 'psychology', label: 'Análisis IA', path: '/ia' },
    { icon: 'history', label: 'Pedidos', path: '/pedidos' },
    { icon: 'person', label: 'Mi Perfil', path: '/perfil', active: true },
  ]

  const navItemsProveedor = [
    { icon: 'dashboard', label: 'Dashboard', path: '/proveedor/dashboard' },
    { icon: 'pending_actions', label: 'Solicitudes', path: '/proveedor/solicitudes' },
    { icon: 'inventory_2', label: 'Catálogo', path: '/proveedor/catalogo' },
    { icon: 'person', label: 'Mi Perfil', path: '/perfil', active: true },
  ]

  const navItems = usuario?.rol === 'proveedor' ? navItemsProveedor : navItemsAgricultor
  const tipo = usuario?.rol === 'proveedor' ? 'proveedor' : 'agricultor'
  const esProveedor = usuario?.rol === 'proveedor'

  useEffect(() => {
    api.get('/perfil/detalle')
      .then(res => {
        setPerfil(res.data)
        setFormBasico({
          nombre: res.data.nombre || '',
          telefono: res.data.telefono || ''
        })
        setFormExtendido(res.data.perfil_extendido || {})
      })
      .catch(() => setError('Error al cargar el perfil'))
      .finally(() => setLoading(false))

    // Si es proveedor, cargar datos bancarios
    if (usuario?.rol === 'proveedor') {
      api.get('/perfil/datos-bancarios')
        .then(res => {
          setFormBanco({
            banco: res.data.banco || '',
            tipo_cuenta: res.data.tipo_cuenta || '',
            numero_cuenta: res.data.numero_cuenta || '',
            rut_titular: res.data.rut_titular || '',
            nombre_titular: res.data.nombre_titular || ''
          })
        })
        .catch(() => {})
    }
  }, [])

  const handleGuardarBasico = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setExito('')
    try {
      const res = await api.put('/perfil/', {
        nombre: formBasico.nombre,
        telefono: formBasico.telefono
      })
      setExito('Información actualizada correctamente')
      login({ ...JSON.parse(localStorage.getItem('usuario') || '{}'), nombre: res.data.nombre, access_token: localStorage.getItem('token'), rol: res.data.rol })
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardarExtendido = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setExito('')
    try {
      await api.put('/perfil/detalle-extendido', formExtendido)
      setExito('Perfil actualizado correctamente')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardarBanco = async (e) => {
    e.preventDefault()
    setGuardandoBanco(true)
    setErrorBanco('')
    setExitoBanco('')
    try {
      await api.put('/perfil/datos-bancarios', formBanco)
      setExitoBanco('Datos bancarios guardados correctamente')
    } catch (err) {
      setErrorBanco(err.response?.data?.detail || 'Error al guardar los datos bancarios')
    } finally {
      setGuardandoBanco(false)
    }
  }

  const handleCambiarPass = async (e) => {
    e.preventDefault()
    setErrorPass('')
    setExitoPass('')
    if (formPass.password_nuevo !== formPass.confirmar) {
      setErrorPass('Las contraseñas nuevas no coinciden')
      return
    }
    setCambiandoPass(true)
    try {
      await api.put('/perfil/cambiar-password', {
        password_actual: formPass.password_actual,
        password_nuevo: formPass.password_nuevo
      })
      setExitoPass('Contraseña cambiada correctamente')
      setFormPass({ password_actual: '', password_nuevo: '', confirmar: '' })
    } catch (err) {
      setErrorPass(err.response?.data?.detail || 'Error al cambiar contraseña')
    } finally {
      setCambiandoPass(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary transition-all bg-white"
  const labelClass = "block text-xs font-semibold text-on-surface-variant mb-1"

  // Construir tabs dinámicamente (Datos de Pago solo para proveedor)
  const tabs = [
    { key: 'info', icon: 'person', label: 'Información Personal' },
    { key: 'detalle', icon: 'badge', label: esProveedor ? 'Datos Empresa' : 'Datos del Predio' },
    ...(esProveedor ? [{ key: 'pago', icon: 'account_balance', label: 'Datos de Pago' }] : []),
    { key: 'seguridad', icon: 'lock', label: 'Seguridad' },
  ]

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">
      <Sidebar navItems={navItems} tipo={tipo} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header titulo="Mi Perfil" />
        <main className="flex-1 p-5 md:p-8 max-w-4xl mx-auto w-full">

          {/* Avatar + nombre */}
          <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm mb-6 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">{usuario?.nombre}</h2>
              <p className="text-on-surface-variant text-sm capitalize">{usuario?.rol}</p>
              {perfil && (
                <p className="text-xs text-on-surface-variant mt-1">
                  Miembro desde {new Date(perfil.creado_en).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white border border-outline-variant/30 rounded-xl p-1.5 w-fit flex-wrap">
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setError(''); setExito('') }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${tab === t.key ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-gray-100'}`}>
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner texto="Cargando perfil..." />
          ) : (
            <>
              {/* Tab Información Personal */}
              {tab === 'info' && (
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                  <h3 className="font-bold text-primary text-lg mb-6 pb-4 border-b border-outline-variant/30">
                    Información Personal
                  </h3>

                  {error && <div className="mb-4"><ErrorMessage mensaje={error} /></div>}
                  {exito && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {exito}
                    </div>
                  )}

                  <form onSubmit={handleGuardarBasico} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Nombre completo</label>
                        <input type="text" required value={formBasico.nombre}
                          onChange={e => setFormBasico({ ...formBasico, nombre: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Teléfono</label>
                        <input type="tel" placeholder="+56 9 1234 5678"
                          value={formBasico.telefono}
                          onChange={e => setFormBasico({ ...formBasico, telefono: e.target.value })}
                          className={inputClass} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
                      <div>
                        <label className={labelClass}>Correo electrónico</label>
                        <input type="text" value={perfil?.email || ''} disabled
                          className={`${inputClass} bg-gray-50 text-on-surface-variant cursor-not-allowed`} />
                        <p className="text-xs text-on-surface-variant mt-1">No se puede modificar</p>
                      </div>
                      <div>
                        <label className={labelClass}>RUT</label>
                        <input type="text" value={perfil?.rut || ''} disabled
                          className={`${inputClass} bg-gray-50 text-on-surface-variant cursor-not-allowed`} />
                        <p className="text-xs text-on-surface-variant mt-1">No se puede modificar</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={guardando}
                        className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span>
                        {guardando ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab Datos Extendidos */}
              {tab === 'detalle' && (
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                  <h3 className="font-bold text-primary text-lg mb-6 pb-4 border-b border-outline-variant/30">
                    {esProveedor ? 'Datos de la Empresa' : 'Datos del Predio Agrícola'}
                  </h3>

                  {error && <div className="mb-4"><ErrorMessage mensaje={error} /></div>}
                  {exito && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {exito}
                    </div>
                  )}

                  <form onSubmit={handleGuardarExtendido} className="space-y-4">
                    {!esProveedor ? (
                      <>
                        <div>
                          <label className={labelClass}>Nombre del Predio</label>
                          <input type="text" placeholder="Ej: Fundo San Juan"
                            value={formExtendido.nombre_predio || ''}
                            onChange={e => setFormExtendido({ ...formExtendido, nombre_predio: e.target.value })}
                            className={inputClass} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Región</label>
                            <select value={formExtendido.region || ''}
                              onChange={e => setFormExtendido({ ...formExtendido, region: e.target.value })}
                              className={`${inputClass} appearance-none`}>
                              <option value="">Seleccionar región...</option>
                              {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Hectáreas</label>
                            <input type="number" min="0" step="0.1" placeholder="0.0"
                              value={formExtendido.hectareas || ''}
                              onChange={e => setFormExtendido({ ...formExtendido, hectareas: e.target.value })}
                              className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Tipo de Cultivo Principal</label>
                          <input type="text" placeholder="Ej: Trigo, Maíz, Viñas"
                            value={formExtendido.tipo_cultivo || ''}
                            onChange={e => setFormExtendido({ ...formExtendido, tipo_cultivo: e.target.value })}
                            className={inputClass} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className={labelClass}>Nombre de la Empresa</label>
                          <input type="text" placeholder="Ej: AgroInsumos S.A."
                            value={formExtendido.nombre_empresa || ''}
                            onChange={e => setFormExtendido({ ...formExtendido, nombre_empresa: e.target.value })}
                            className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Región</label>
                          <select value={formExtendido.region || ''}
                            onChange={e => setFormExtendido({ ...formExtendido, region: e.target.value })}
                            className={`${inputClass} appearance-none`}>
                            <option value="">Seleccionar región...</option>
                            {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Dirección</label>
                          <input type="text" placeholder="Ej: Av. Los Boldos 123, Talca"
                            value={formExtendido.direccion || ''}
                            onChange={e => setFormExtendido({ ...formExtendido, direccion: e.target.value })}
                            className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Descripción de la Empresa</label>
                          <textarea placeholder="Descripción breve de los productos y servicios que ofrece..."
                            value={formExtendido.descripcion || ''}
                            onChange={e => setFormExtendido({ ...formExtendido, descripcion: e.target.value })}
                            className={`${inputClass} h-24 resize-none`} />
                        </div>
                      </>
                    )}

                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={guardando}
                        className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span>
                        {guardando ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab Datos de Pago (solo proveedor) */}
              {tab === 'pago' && esProveedor && (
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                  <h3 className="font-bold text-primary text-lg mb-2 pb-4 border-b border-outline-variant/30">
                    Datos Bancarios
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-6">
                    Esta cuenta se usará para transferirte el dinero de tus ventas realizadas en la plataforma.
                  </p>

                  {errorBanco && <div className="mb-4"><ErrorMessage mensaje={errorBanco} /></div>}
                  {exitoBanco && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {exitoBanco}
                    </div>
                  )}

                  <form onSubmit={handleGuardarBanco} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Banco</label>
                        <select value={formBanco.banco}
                          onChange={e => setFormBanco({ ...formBanco, banco: e.target.value })}
                          className={`${inputClass} appearance-none`}>
                          <option value="">Seleccionar banco...</option>
                          {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Tipo de cuenta</label>
                        <select value={formBanco.tipo_cuenta}
                          onChange={e => setFormBanco({ ...formBanco, tipo_cuenta: e.target.value })}
                          className={`${inputClass} appearance-none`}>
                          <option value="">Seleccionar tipo...</option>
                          <option value="corriente">Cuenta Corriente</option>
                          <option value="vista">Cuenta Vista / RUT</option>
                          <option value="ahorro">Cuenta de Ahorro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Número de cuenta</label>
                      <input type="text" placeholder="Ej: 00012345678"
                        value={formBanco.numero_cuenta}
                        onChange={e => setFormBanco({ ...formBanco, numero_cuenta: e.target.value })}
                        className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Nombre del titular</label>
                        <input type="text" placeholder="Ej: Juan Pérez González"
                          value={formBanco.nombre_titular}
                          onChange={e => setFormBanco({ ...formBanco, nombre_titular: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>RUT del titular</label>
                        <input type="text" placeholder="Ej: 12.345.678-9"
                          value={formBanco.rut_titular}
                          onChange={e => setFormBanco({ ...formBanco, rut_titular: e.target.value })}
                          className={inputClass} />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-base mt-0.5">info</span>
                      <p className="text-xs text-blue-700">
                        Verifica que los datos sean correctos. La plataforma usará exactamente esta información para realizar las transferencias de tus ventas.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={guardandoBanco}
                        className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span>
                        {guardandoBanco ? 'Guardando...' : 'Guardar Datos Bancarios'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab Seguridad */}
              {tab === 'seguridad' && (
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                  <h3 className="font-bold text-primary text-lg mb-6 pb-4 border-b border-outline-variant/30">
                    Cambiar Contraseña
                  </h3>

                  {errorPass && <div className="mb-4"><ErrorMessage mensaje={errorPass} /></div>}
                  {exitoPass && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {exitoPass}
                    </div>
                  )}

                  <form onSubmit={handleCambiarPass} className="space-y-4 max-w-md">
                    <div>
                      <label className={labelClass}>Contraseña actual</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                        <input type={showPass ? 'text' : 'password'} required
                          placeholder="••••••••"
                          value={formPass.password_actual}
                          onChange={e => setFormPass({ ...formPass, password_actual: e.target.value })}
                          className="w-full pl-9 pr-10 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">{showPass ? 'visibility' : 'visibility_off'}</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Nueva contraseña</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">lock_reset</span>
                        <input type={showPass ? 'text' : 'password'} required
                          placeholder="Mínimo 6 caracteres"
                          value={formPass.password_nuevo}
                          onChange={e => setFormPass({ ...formPass, password_nuevo: e.target.value })}
                          className="w-full pl-9 pr-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Confirmar nueva contraseña</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">lock_reset</span>
                        <input type={showPass ? 'text' : 'password'} required
                          placeholder="Repite la nueva contraseña"
                          value={formPass.confirmar}
                          onChange={e => setFormPass({ ...formPass, confirmar: e.target.value })}
                          className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none transition-all
                            ${formPass.confirmar && formPass.password_nuevo !== formPass.confirmar
                              ? 'border-red-400 focus:border-red-400'
                              : 'border-outline-variant focus:border-secondary'}`} />
                      </div>
                      {formPass.confirmar && formPass.password_nuevo !== formPass.confirmar && (
                        <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={cambiandoPass}
                        className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">key</span>
                        {cambiandoPass ? 'Cambiando...' : 'Cambiar Contraseña'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}