import { useCallback, useEffect, useState } from 'react'
import type { MonthlyCharge } from '../types'
import { getCharges } from '../api/charges'

type Result = {
  key: string // a qué pedido corresponde esta respuesta
  charges: MonthlyCharge[]
  error: string | null
}

// Cargos de un mes, o de un rango de meses (from..to)
export function useCharges(from: string, to: string = from) {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<Result>({ key: '', charges: [], error: null })

  // Identifica el pedido actual: cambia al cambiar de mes o al recargar
  const requestKey = `${from}:${to}#${reloadKey}`

  useEffect(() => {
    const controller = new AbortController()

    getCharges(from, to, controller.signal)
      .then((charges) => setResult({ key: requestKey, charges, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const error = err instanceof Error ? err.message : 'Error desconocido'
        setResult({ key: requestKey, charges: [], error })
      })

    return () => controller.abort()
  }, [from, to, requestKey])

  // Estado derivado: está cargando si la última respuesta no es del pedido actual.
  // Así no hace falta un setLoading(true) dentro del efecto
  const loading = result.key !== requestKey

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  // Después de un PATCH, reemplaza ese cargo en la lista sin volver a pedir todo
  const replaceCharge = useCallback((updated: MonthlyCharge) => {
    setResult((prev) => ({
      ...prev,
      charges: prev.charges.map((c) => (c.id === updated.id ? updated : c)),
    }))
  }, [])

  return {
    charges: loading ? [] : result.charges,
    error: loading ? null : result.error,
    loading,
    reload,
    replaceCharge,
  }
}
