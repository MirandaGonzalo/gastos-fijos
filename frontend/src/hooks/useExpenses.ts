import { useCallback, useEffect, useState } from 'react'
import type { FixedExpense } from '../types'
import { getExpenses } from '../api/expenses'

// Custom hook: encapsula "traer los gastos" con sus estados de carga y error
export function useExpenses() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    // Si el componente se desmonta antes de que llegue la respuesta, cancelamos el fetch
    const controller = new AbortController()

    getExpenses(controller.signal)
      .then((data) => {
        setExpenses(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Error desconocido')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort() // cleanup
  }, [reloadKey]) // se vuelve a ejecutar cuando cambia reloadKey

  const reload = useCallback(() => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  return { expenses, loading, error, reload }
}
