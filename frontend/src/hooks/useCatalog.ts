import { useCallback, useEffect, useState } from 'react'
import type { CatalogItem } from '../types'
import { catalogApi, type CatalogKind } from '../api/catalogs'

// Mismo patrón que useExpenses, pero recibe qué catálogo traer
export function useCatalog(kind: CatalogKind) {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    catalogApi
      .list(kind, controller.signal)
      .then((data) => {
        setItems(data)
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
  }, [kind, reloadKey]) // si cambia el catálogo pedido, vuelve a buscar

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  return { items, loading, error, reload }
}
