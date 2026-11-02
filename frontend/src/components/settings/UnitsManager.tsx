import { useState } from 'react'
import { unitsApi, type UnitInput } from '../../api/units'
import { useUnits } from '../../hooks/useUnits'
import type { Unit, UnitType } from '../../types'
import { UNIT_TYPE_LABEL } from '../../utils/units'

const inputClass =
  'min-w-0 rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-sm outline-none focus:border-blue-500'

const emptyForm: UnitInput = { name: '', type: 'PROPERTY', description: '' }

// Alta, edición y baja de unidades (propiedades, vehículos, etc.)
export function UnitsManager() {
  const { units, loading, error, reload } = useUnits()
  const [form, setForm] = useState<UnitInput>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<UnitInput>(emptyForm)
  const [actionError, setActionError] = useState<string | null>(null)

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

  // Manda solo lo que tiene contenido (la descripción vacía no se envía)
  const clean = (f: UnitInput): UnitInput => ({
    name: f.name.trim(),
    type: f.type,
    ...(f.description?.trim() ? { description: f.description.trim() } : {}),
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (await run(() => unitsApi.create(clean(form)))) setForm(emptyForm)
  }

  function startEdit(unit: Unit) {
    setEditingId(unit.id)
    setEditForm({ name: unit.name, type: unit.type, description: unit.description ?? '' })
    setActionError(null)
  }

  async function saveEdit(id: number) {
    if (!editForm.name.trim()) return
    if (await run(() => unitsApi.update(id, clean(editForm)))) setEditingId(null)
  }

  const typeSelect = (value: UnitType, onChange: (t: UnitType) => void) => (
    <select value={value} onChange={(e) => onChange(e.target.value as UnitType)} className={inputClass}>
      {(Object.keys(UNIT_TYPE_LABEL) as UnitType[]).map((t) => (
        <option key={t} value={t}>{UNIT_TYPE_LABEL[t]}</option>
      ))}
    </select>
  )

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950/40 p-4 lg:col-span-2">
      <h2 className="font-medium">Unidades</h2>
      <p className="mb-3 text-xs text-gray-400">
        Propiedades, vehículos o lo que quieras: después asignás cada gasto a una o varias, con un reparto.
      </p>

      <form onSubmit={handleAdd} className="mb-4 grid grid-cols-1 sm:grid-cols-[1fr_9rem_1fr_auto] gap-2">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre (ej. Depto centro)" className={inputClass} />
        {typeSelect(form.type, (type) => setForm({ ...form, type }))}
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Dirección o patente (opcional)" className={inputClass} />
        <button type="submit" className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
          Agregar
        </button>
      </form>

      {actionError && <p className="mb-3 text-sm text-red-400">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : units.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no hay unidades. Los gastos sin unidad cuentan como generales.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-800">
          {units.map((u) =>
            editingId === u.id ? (
              <li key={u.id} className="grid grid-cols-1 sm:grid-cols-[1fr_9rem_1fr_auto] gap-2 py-2">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} autoFocus className={inputClass} />
                {typeSelect(editForm.type, (type) => setEditForm({ ...editForm, type }))}
                <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputClass} />
                <div className="flex gap-3 text-sm">
                  <button onClick={() => saveEdit(u.id)} className="text-blue-400 hover:underline">Guardar</button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:underline">Cancelar</button>
                </div>
              </li>
            ) : (
              <li key={u.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                <span className="font-medium">{u.name}</span>
                <span className="rounded bg-gray-700/50 px-1.5 py-0.5 text-xs text-gray-300">{UNIT_TYPE_LABEL[u.type]}</span>
                {u.description && <span className="text-gray-500">{u.description}</span>}
                <span className="ml-auto text-xs text-gray-500">
                  {u.expenseCount} {u.expenseCount === 1 ? 'gasto' : 'gastos'}
                </span>
                <button onClick={() => startEdit(u)} className="text-gray-400 hover:text-white">Editar</button>
                <button onClick={() => run(() => unitsApi.remove(u.id))} className="text-gray-400 hover:text-red-400">Borrar</button>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  )
}
