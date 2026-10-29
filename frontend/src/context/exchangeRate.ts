import { createContext, useContext } from 'react'
import type { ExchangeRate } from '../types'

export type ExchangeRateContextValue = {
  rates: ExchangeRate[]          // todas las cotizaciones disponibles
  selectedType: string           // cuál usamos como referencia (ej. 'tarjeta')
  setSelectedType: (type: string) => void
  current: ExchangeRate | null   // la cotización elegida
  rate: number | null            // atajo: pesos por dólar (precio de venta), o null si no hay
  loading: boolean
  error: string | null
}

export const ExchangeRateContext = createContext<ExchangeRateContextValue | null>(null)

// Hook para leer la cotización desde cualquier componente, sin pasarla por props
export function useExchangeRate() {
  const ctx = useContext(ExchangeRateContext)
  if (!ctx) throw new Error('useExchangeRate tiene que usarse dentro de <ExchangeRateProvider>')
  return ctx
}
