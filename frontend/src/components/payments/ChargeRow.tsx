import { useState } from 'react'
import type { MonthlyCharge } from '../../types'
import { updateCharge } from '../../api/charges'
import { getChargeStatus, TONE_CLASSES } from '../../utils/chargeStatus'
import { daysFromToday, formatWeekday, parseDate, todayIso } from '../../utils/dates'
import { formatMoney } from '../../utils/format'
import { PAYMENT_MODE_INFO } from '../../utils/paymentMode'
import { useExchangeRate } from '../../context/exchangeRate'

type Mode = 'view' | 'pay' | 'adjust'

type Props = {
  charge: MonthlyCharge
  onUpdated: (charge: MonthlyCharge) => void
}

const inputClass =
  'rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-sm outline-none focus:border-blue-500'

export function ChargeRow({ charge, onUpdated }: Props) {
  const [mode, setMode] = useState<Mode>('view')
  const [amount, setAmount] = useState('')
  const [paidAt, setPaidAt] = useState('')
  const [exchangeRate, setExchangeRate] = useState('')
  const { rate: currentRate } = useExchangeRate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = getChargeStatus(charge)
  const isPaid = charge.status === 'PAID'
  const isAutomatic = charge.expense.paymentMode === 'AUTOMATIC'
  const isUsd = charge.expense.currency === 'USD'

  function openForm(next: Mode) {
    setAmount(String(charge.amount))
    // Débito automático ya pasado: por defecto, se pagó el día del débito
    const defaultDate = isAutomatic && daysFromToday(charge.dueDate) < 0 ? charge.dueDate : todayIso()
    setPaidAt(charge.paidAt ? charge.paidAt.slice(0, 10) : defaultDate)
    // Cotización: la que se usó si ya estaba pagado; si no, la actual como punto de partida
    setExchangeRate(String(charge.exchangeRate ?? currentRate ?? ''))
    setError(null)
    setMode(next)
  }

  async function save(data: Parameters<typeof updateCharge>[1]) {
    setSaving(true)
    setError(null)
    try {
      onUpdated(await updateCharge(charge.id, data))
      setMode('view')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return setError('Ingresá un monto mayor a 0')
    if (mode === 'adjust') return save({ amount: value })
    if (isUsd) {
      const rateValue = Number(exchangeRate)
      if (!rateValue || rateValue <= 0) return setError('Ingresá la cotización a la que compraste los dólares')
      return save({ amount: value, paid: true, paidAt, exchangeRate: rateValue })
    }
    return save({ amount: value, paid: true, paidAt })
  }

  const day = parseDate(charge.dueDate).getDate()

  return (
    <li className="py-3">
      <div className="flex items-center gap-4">
        {/* Fecha */}
        <div className="w-12 shrink-0 text-center">
          <div className="text-xl font-semibold leading-none">{day}</div>
          <div className="text-xs text-gray-500">{formatWeekday(charge.dueDate)}</div>
        </div>

        {/* Qué es */}
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium">{charge.expense.name}</p>
          <p className="truncate text-xs text-gray-500">
            {charge.expense.category.name} · {PAYMENT_MODE_INFO[charge.expense.paymentMode].label} ·{' '}
            {charge.expense.paymentMethod.name}
          </p>
        </div>

        {/* Estado */}
        <span className={`hidden sm:inline-block shrink-0 rounded px-2 py-0.5 text-xs ${TONE_CLASSES[status.tone]}`}>
          {status.label}
        </span>

        {/* Monto (y su equivalente en pesos si es USD) */}
        <div className="w-36 shrink-0 text-right">
          <span className={`block font-medium ${isPaid ? 'text-gray-400' : ''}`}>
            {formatMoney(charge.amount, charge.expense.currency)}
          </span>
          {isUsd && (
            <span className="block text-xs text-gray-500">
              {charge.amountArs !== null && charge.exchangeRate
                ? `${formatMoney(charge.amountArs, 'ARS')} a ${formatMoney(charge.exchangeRate, 'ARS')}`
                : currentRate
                  ? `≈ ${formatMoney(charge.amount * currentRate, 'ARS')}`
                  : 'sin cotización'}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="w-40 shrink-0 flex justify-end gap-2 text-sm">
          {mode === 'view' &&
            (isPaid ? (
              <>
                <button onClick={() => openForm('pay')} className="text-gray-400 hover:text-white">Editar</button>
                <button onClick={() => save({ paid: false })} disabled={saving} className="text-gray-400 hover:text-red-400">
                  Deshacer
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openForm('adjust')} className="text-gray-400 hover:text-white">Ajustar</button>
                <button
                  onClick={() => openForm('pay')}
                  className="rounded-lg bg-blue-600 px-3 py-1 font-medium text-white hover:bg-blue-500"
                >
                  {isAutomatic ? 'Confirmar' : 'Pagar'}
                </button>
              </>
            ))}
        </div>
      </div>

      {/* Estado en mobile, debajo */}
      <span className={`sm:hidden mt-2 ml-16 inline-block rounded px-2 py-0.5 text-xs ${TONE_CLASSES[status.tone]}`}>
        {status.label}
      </span>

      {/* Formulario inline para pagar / ajustar */}
      {mode !== 'view' && (
        <form onSubmit={handleSubmit} className="mt-3 ml-16 flex flex-wrap items-end gap-3 rounded-lg bg-gray-800/40 p-3">
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            {mode === 'adjust' ? 'Monto real de este mes' : 'Monto pagado'} ({charge.expense.currency})
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              className={`${inputClass} w-40`}
            />
          </label>
          {mode === 'pay' && isUsd && (
            <label className="flex flex-col gap-1 text-xs text-gray-400">
              Cotización a la que compraste (ARS por USD)
              <input
                type="number"
                min="0"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className={`${inputClass} w-40`}
              />
            </label>
          )}
          {mode === 'pay' && isUsd && Number(amount) > 0 && Number(exchangeRate) > 0 && (
            <p className="self-center text-sm text-gray-300">
              = {formatMoney(Number(amount) * Number(exchangeRate), 'ARS')}
            </p>
          )}
          {mode === 'pay' && (
            <label className="flex flex-col gap-1 text-xs text-gray-400">
              {isAutomatic ? 'Fecha del débito' : 'Fecha de pago'}
              <input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className={inputClass} />
            </label>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setMode('view')} className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-800">
              Cancelar
            </button>
          </div>
          {error && <p className="w-full text-xs text-red-400">{error}</p>}
        </form>
      )}
      {mode === 'view' && error && <p className="mt-2 ml-16 text-xs text-red-400">{error}</p>}
    </li>
  )
}
