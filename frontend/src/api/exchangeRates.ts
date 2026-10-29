import type { ExchangeRate } from '../types'
import { apiFetch } from './client'

export function getExchangeRates(signal?: AbortSignal) {
  return apiFetch<ExchangeRate[]>('/exchange-rates', { signal })
}
