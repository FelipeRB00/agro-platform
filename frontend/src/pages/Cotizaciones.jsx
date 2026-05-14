import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const lista = {
  numero: '4092',
  estado: 'Comparando',
  fecha_entrega: '15 Oct 2026',
  items: [
    { nombre: 'Urea 46%', desc: 'Fertilizante Granulado', cantidad: '50 Ton' },
    { nombre: 'Semillas de Maíz', desc: 'Híbrido DK-72', cantidad: '200 Bolsas' },
    { nombre: 'Glifosato 48%', desc: 'Herbicida Líquido', cantidad: '500 Litros' },
  ]
}

const cotizaciones = [
  {
    id: 1,
    proveedor: 'AgroInsumos S.A.',
    ubicacion: 'Zona Norte, a 45km',
    estado: 'aceptada',
    mejor: true,
    total: '$65,250.00',
    items: [
      { nombre: 'Urea 46%', precio: '$520.00', subtotal: '$26,000.00' },
      { nombre: 'Semillas de Maíz', precio: '$180.00', subtotal: '$36,000.00' },
      { nombre: 'Glifosato 48%', precio: '$6.50', subtotal: '$3,250.00' },
    ]
  },
  {
    id: 2,
    proveedor: 'FertiCampo',
    ubicacion: 'Zona Centro, a 12km',
    estado: 'pendiente',
    mejor: false,
    total: '$67,150.00',
    items: [
      { nombre: 'Urea 46%', precio: '$535.00', subtotal: '$26,750.00' },
      { nombre: 'Semillas de Maíz', precio: '$185.00', subtotal: '$37,000.00' },
      { nombre: 'Glifosato 48%', precio: '$6.80', subtotal: '$3,400.00' },
    ]
  },
  {
    id: 3,
    proveedor: 'Semillas del Sur',
    ubicacion: 'Zona Sur, a 120km',
    estado: 'rechazada',
    mejor: false,
    total: '$70,600.00',
    items: [
      { nombre: 'Urea 46%', precio: '$560.00', subtotal: '$28,000.00' },
      { nombre: 'Semillas de Maíz', precio: '$195.00', subtotal: '$39,000.00' },
      { nombre: 'Glifosato 48%', precio: '$7.20', subtotal: '$3,600.00' },
    ]
  }
]

const estadoBadge = {
  aceptada: 'bg-green-100 text-green-800',
  pendiente: 'bg-gray-100 text-gray-700',
  rechazada: 'bg-red-100 text-red-700',
}

const estadoLabel = {
  aceptada: 'Aceptada',
  pendiente: 'Pendiente',
  rechazada: 'Rechazada',
}

export default function Cotizaciones() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/dashboard' },
    { icon: 'shopping_cart', label: 'Mis Listas', path: '/listas' },
    { icon: 'request_quote', label: 'Cotizaciones', path: '/cotizaciones', active: true },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
  ]

  return (
    <div className="bg-[#f4f8f2] text-on-surface font-sans min-h-screen flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col p-6 h-screen w-64 fixed left-0 top-0 bg-white border-r border-outline-variant/30 z-30">
        <div className="mb-8 flex items-center gap-3">
          <img src={logo} alt="CultivaTech" className="h-10 w-10 object-contain rounded-lg" />
          <div>
            <h1 className="font-bold text-primary text-base">CultivaTech</h1>
            <p className="text-xs text-on-surface-variant">Gestión Agrícola</p>
          </div>
        </div>
        <button onClick={() => navigate('/listas/nueva')}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold text-sm mb-6 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Nueva Lista
        </button>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <a key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all
                ${item.active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-outline-variant/30">
          <a onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* Header */}
        <header className="flex justify-between items-center h-16 px-6 bg-white/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-20">
          <h2 className="font-bold text-primary text-xl hidden md:block">Cotizaciones</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-full relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm text-primary">{usuario?.nombre}</p>
                <p className="text-xs text-on-surface-variant capitalize">{usuario?.rol}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-sm text-on-secondary-container">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6">

          {/* Left - Detalles lista */}
          <section className="w-full md:w-1/3">
            <div className="bg-white rounded-xl p-6 border border-outline-variant/30 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-primary text-xl">Detalles de la Lista</h3>
                <span className="bg-secondary-container text-on-secondary-container text-xs font-semibold px-3 py-1 rounded-full">
                  Lista #{lista.numero}
                </span>
              </div>

              <div className="space-y-4">
                {lista.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-outline-variant/30 last:border-0">
                    <div>
                      <p className="font-semibold text-sm text-on-surface">{item.nombre}</p>
                      <p className="text-xs text-on-surface-variant">{item.desc}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary bg-gray-100 px-3 py-1 rounded-md">{item.cantidad}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Estado</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-white bg-primary px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">compare_arrows</span>
                    {lista.estado}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Entrega requerida</span>
                  <span className="text-sm font-semibold text-on-surface">{lista.fecha_entrega}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right - Cotizaciones */}
          <section className="w-full md:w-2/3 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary text-xl">Cotizaciones Recibidas</h3>
              <span className="text-sm text-on-surface-variant">{cotizaciones.length} cotizaciones</span>
            </div>

            {cotizaciones.map(cot => (
              <article key={cot.id}
                className={`bg-white rounded-xl p-6 border shadow-sm relative overflow-hidden transition-all
                  ${cot.mejor ? 'border-2 border-primary/30 shadow-md' : 'border-outline-variant/30'}
                  ${cot.estado === 'rechazada' ? 'opacity-60' : ''}`}>

                {cot.mejor && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-bl-xl flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Mejor Precio
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-semibold text-on-surface text-lg">{cot.proveedor}</h4>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {cot.ubicacion}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoBadge[cot.estado]}`}>
                    {estadoLabel[cot.estado]}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-on-surface-variant border-b border-outline-variant/30">
                        <th className="pb-2 font-semibold">Ítem</th>
                        <th className="pb-2 font-semibold text-right">Precio Unit.</th>
                        <th className="pb-2 font-semibold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cot.items.map((item, i) => (
                        <tr key={i} className="border-b border-outline-variant/10 last:border-0">
                          <td className="py-3">{item.nombre}</td>
                          <td className="py-3 text-right">{item.precio}</td>
                          <td className="py-3 text-right font-semibold">{item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-on-surface-variant">Total Estimado</p>
                    <p className={`text-2xl font-bold ${cot.mejor ? 'text-primary' : 'text-on-surface'}`}>
                      {cot.total} <span className="text-sm font-normal text-on-surface-variant">CLP</span>
                    </p>
                  </div>

                  {cot.estado === 'aceptada' && (
                    <button disabled className="bg-gray-100 text-gray-500 font-semibold text-sm py-3 px-6 rounded-lg flex items-center gap-2 cursor-not-allowed opacity-70">
                      <span className="material-symbols-outlined text-sm">task_alt</span>
                      Cotización Aceptada
                    </button>
                  )}
                  {cot.estado === 'pendiente' && (
                    <button className="bg-primary text-white font-semibold text-sm py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
                      Aceptar Cotización
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}