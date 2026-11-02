import { useUnits } from '../hooks/useUnits'
import type { UnitFilter } from '../utils/units'

type Props = {
  value: UnitFilter
  onChange: (value: UnitFilter) => void
}

// Selector "¿de qué unidad?" que comparten Gastos, Pagos y Análisis.
// Si todavía no hay unidades cargadas, no se muestra
export function UnitFilterSelect({ value, onChange }: Props) {
  const { units } = useUnits()
  if (units.length === 0) return null

  return (
    <select
      value={String(value)}
      onChange={(e) => onChange(e.target.value === 'all' ? 'all' : e.target.value === 'general' ? 'general' : Number(e.target.value))}
      className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
      aria-label="Filtrar por unidad"
    >
      <option value="all">Todas las unidades</option>
      {units.map((u) => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
      <option value="general">Generales (sin unidad)</option>
    </select>
  )
}
