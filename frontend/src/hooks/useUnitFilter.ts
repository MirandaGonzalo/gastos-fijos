import { useSearchParams } from 'react-router'
import { parseUnitFilter, unitFilterToParam, type UnitFilter } from '../utils/units'

// El filtro de unidad vive en la URL (?unidad=3), igual que el mes o el período:
// se mantiene al recargar y al compartir el link, sin pisar los otros parámetros
export function useUnitFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const unitFilter = parseUnitFilter(searchParams.get('unidad'))

  function setUnitFilter(filter: UnitFilter) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      const value = unitFilterToParam(filter)
      if (value === null) next.delete('unidad')
      else next.set('unidad', value)
      return next
    })
  }

  return { unitFilter, setUnitFilter }
}
