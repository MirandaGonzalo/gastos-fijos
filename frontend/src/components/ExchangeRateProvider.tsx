import { useEffect, useState } from 'react'
import { getExchangeRates } from '../api/exchangeRates'
import { ExchangeRateContext } from '../context/exchangeRate'
import type { ExchangeRate } from '../types'

const TYPE_KEY = 'gastos.exchangeRateType'
const LAST_RATES_KEY = 'gastos.lastExchangeRates'
const DEFAULT_TYPE = 'tarjeta'

// localStorage puede fallar (modo privado, permisos): siempre con try/catch
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sin storage seguimos funcionando, solo no recordamos
  }
}

// Pide las cotizaciones una vez y las comparte con toda la app vía Context
export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
  // Arranca con las últimas cotizaciones conocidas, para no mostrar todo vacío mientras carga
  const [rates, setRates] = useState<ExchangeRate[]>(() => readStorage(LAST_RATES_KEY, []))
  const [selectedType, setSelectedTypeState] = useState<string>(() => readStorage(TYPE_KEY, DEFAULT_TYPE))
  const [status, setStatus] = useState<{ loading: boolean; error: string | null }>({ loading: true, error: null })

  useEffect(() => {
    const controller = new AbortController()
    getExchangeRates(controller.signal)
      .then((data) => {
        setRates(data)
        writeStorage(LAST_RATES_KEY, data)
        setStatus({ loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setStatus({ loading: false, error: err instanceof Error ? err.message : 'Error desconocido' })
      })
    return () => controller.abort()
  }, [])

  function setSelectedType(type: string) {
    setSelectedTypeState(type)
    writeStorage(TYPE_KEY, type)
  }

  const current = rates.find((r) => r.type === selectedType) ?? null

  return (
    <ExchangeRateContext.Provider
      value={{
        rates,
        selectedType,
        setSelectedType,
        current,
        rate: current?.sell ?? null,
        loading: status.loading,
        error: status.error,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  )
}
