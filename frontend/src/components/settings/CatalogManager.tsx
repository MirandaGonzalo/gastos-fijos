import { useState } from 'react'
import { catalogApi, type CatalogKind } from '../../api/catalogs'
import { useCatalog } from '../../hooks/useCatalog'
import type { CatalogItem } from '../../types'

type Props = {
  kind: CatalogKind
  title: string
  placeholder: string
}

const inputClass =
  'flex-1 min-w-0 rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-sm outline-none focus:border-blue-500'

// Lista administrable: agregar, renombrar en el lugar y borrar
export function CatalogManager({ kind, title, placeholder }: Props) {
  const { items, loading, error, reload } = useCatalog(kind)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  // Envuelve cada acción: limpia el error, ejecuta, recarga la lista y muestra el error si falla
  async function run(action: () => Promise<unknown>) {
    setActionError(null)
    try {
      await action()
      reload()
      return true
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Ocurrió un error')
      return false
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    if (await run(() => catalogApi.create(kind, newName.trim()))) setNewName('')
  }

  function startEdit(item: CatalogItem) {
    setEditingId(item.id)
    setEditName(item.name)
    setActionError(null)
  }

  async function saveEdit(id: number) {
    if (!editName.trim()) return
    if (await run(() => catalogApi.rename(kind, id, editName.trim()))) setEditingId(null)
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
      <h2 className="font-medium mb-3">{title}</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={placeholder} className={inputClass} />
        <button type="submit" className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
          Agregar
        </button>
      </form>

      {actionError && <p className="mb-3 text-sm text-red-400">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no hay ninguno.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-800">
          {items.map((item) =>
            editingId === item.id ? (
              <li key={item.id} className="flex gap-2 py-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(item.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                  className={inputClass}
                />
                <button onClick={() => saveEdit(item.id)} className="text-sm text-blue-400 hover:underline">Guardar</button>
                <button onClick={() => setEditingId(null)} className="text-sm text-gray-400 hover:underline">Cancelar</button>
              </li>
            ) : (
              <li key={item.id} className="flex items-center gap-2 py-2 text-sm">
                <span className="flex-1">{item.name}</span>
                <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-white">Editar</button>
                <button onClick={() => run(() => catalogApi.remove(kind, item.id))} className="text-gray-400 hover:text-red-400">
                  Borrar
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  )
}
