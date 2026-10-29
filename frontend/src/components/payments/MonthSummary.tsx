import type { MonthlyCharge } from '../../types'
import { formatMoney } from '../../utils/format'
import { useExchangeRate } from '../../context/exchangeRate'
import { chargeToArs } from '../../utils/stats'

export function MonthSummary({ charges }: { charges: MonthlyCharge[] }) {
  const { rate } = useExchangeRate()
  const toArs = (c: MonthlyCharge) => chargeToArs(c, rate)
  const total = charges.reduce((acc, c) => acc + toArs(c), 0)
  const paid = charges.filter((c) => c.status === 'PAID').reduce((acc, c) => acc + toArs(c), 0)
  const paidCount = charges.filter((c) => c.status === 'PAID').length
  const percent = total > 0 ? Math.round((paid / total) * 100) : 0

  const stats = [
    { label: 'Total del mes', value: total },
    { label: 'Pagado', value: paid },
    { label: 'Falta pagar', value: total - paid },
  ]

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight">{formatMoney(s.value, 'ARS')}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-800">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {paidCount} de {charges.length} pagados · {percent}% del total
      </p>
    </section>
  )
}
