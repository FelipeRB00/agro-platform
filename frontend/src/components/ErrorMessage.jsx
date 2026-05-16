export default function ErrorMessage({ mensaje, onRetry }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">error</span>
        <span className="text-sm">{mensaje}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="text-xs font-semibold underline underline-offset-2 hover:text-red-900 transition-colors">
          Reintentar
        </button>
      )}
    </div>
  )
}