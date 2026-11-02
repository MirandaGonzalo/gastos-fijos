import type { Unit, UnitType } from '../types'
import { apiFetch } from './client'

export type UnitInput = { name: string; type: UnitType; description?: string }

export const unitsApi = {
  list: (signal?: AbortSignal) => apiFetch<Unit[]>('/units', { signal }),
  create: (data: UnitInput) => apiFetch<Unit>('/units', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<UnitInput>) =>
    apiFetch<Unit>(`/units/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: number) => apiFetch<void>(`/units/${id}`, { method: 'DELETE' }),
}
