import { useCallback, useEffect, useState } from 'react'
import type { Unit } from '../types'
import { unitsApi } from '../api/units'

// Mismo patrón que useCatalog: datos + carga + error + recargar
export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    unitsApi
      .list(controller.signal)
      .then((data) => {
        setUnits(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Error desconocido')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  return { units, loading, error, reload }
}
