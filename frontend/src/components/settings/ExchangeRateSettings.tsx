import { useExchangeRate } from '../../context/exchangeRate'
import { formatMoney } from '../../utils/format'

export function ExchangeRateSettings() {
  const { rates, selectedType, setSelectedType, loading, error } = useExchangeRate()

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
      <h2 className="font-medium">Cotización del dólar</h2>
      <p className="mb-3 text-xs text-gray-400">
        Se usa para convertir a pesos los gastos en USD que todavía no pagaste. Al pagar, cargás la cotización real a la que compraste.
      </p>

      {error && <p className="mb-2 text-sm text-amber-400">No se pudo actualizar: {error}</p>}
      {loading && rates.length === 0 ? (
        <p className="text-sm text-gray-400">Cargando cotizaciones...</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rates.map((r) => (
            <li key={r.type}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                  r.type === selectedType ? 'border-blue-500 bg-blue-500/10' : 'border-transparent hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="exchangeRateType"
                  checked={r.type === selectedType}
                  onChange={() => setSelectedType(r.type)}
                  className="accent-blue-600"
                />
                <span className="flex-1">{r.name}</span>
                <span className="text-xs text-gray-500">compra {r.buy ? formatMoney(r.buy, 'ARS') : '—'}</span>
                <span className="w-28 text-right font-medium">venta {formatMoney(r.sell, 'ARS')}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
