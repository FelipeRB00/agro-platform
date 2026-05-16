export default function EmptyState({ icon, titulo, descripcion, accion, onAccion }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="material-symbols-outlined text-6xl text-outline mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-on-surface mb-2">{titulo}</h3>
      {descripcion && <p className="text-sm text-on-surface-variant mb-6 max-w-sm">{descripcion}</p>}
      {accion && onAccion && (
        <button onClick={onAccion}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          {accion}
        </button>
      )}
    </div>
  )
}