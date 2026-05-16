export default function LoadingSpinner({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-on-surface-variant">{texto}</p>
    </div>
  )
}