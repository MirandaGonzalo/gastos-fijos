import type { CatalogItem } from '../types'
import { apiFetch } from './client'

export type CatalogKind = 'categories' | 'payment-methods'

// Las dos tablas tienen la misma API, así que un solo set de funciones sirve para ambas
export const catalogApi = {
  list: (kind: CatalogKind, signal?: AbortSignal) =>
    apiFetch<CatalogItem[]>(`/${kind}`, { signal }),

  create: (kind: CatalogKind, name: string) =>
    apiFetch<CatalogItem>(`/${kind}`, { method: 'POST', body: JSON.stringify({ name }) }),

  rename: (kind: CatalogKind, id: number, name: string) =>
    apiFetch<CatalogItem>(`/${kind}/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),

  remove: (kind: CatalogKind, id: number) =>
    apiFetch<void>(`/${kind}/${id}`, { method: 'DELETE' }),
}
