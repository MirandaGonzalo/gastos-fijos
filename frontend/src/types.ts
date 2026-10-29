export type Currency = 'ARS' | 'USD'

// Ítem de un catálogo administrable (categoría o medio de pago)
export type CatalogItem = {
  id: number
  name: string
}

// AUTOMATIC: la fecha es cuándo se debita solo. MANUAL: la fecha es el vencimiento
export type PaymentMode = 'AUTOMATIC' | 'MANUAL'

// Plantilla del gasto: qué es, cuándo se debita y cuánto se estima
export type FixedExpense = {
  id: number
  name: string            // "Internet", "Alquiler"
  estimatedAmount: number // monto estimado; cada mes se ajusta al real
  currency: Currency
  paymentMode: PaymentMode
  debitDay: number        // 1 a 31: día de débito o de vencimiento, según paymentMode
  category: CatalogItem
  paymentMethod: CatalogItem
  startPeriod: string     // "2026-10": primer mes en que aplica
  endPeriod: string | null // último mes, o null si es indefinido
  active: boolean
  paidCount: number       // cargos pagados: si es > 0, no se puede eliminar
}

export type ChargeStatus = 'PENDING' | 'PAID'

// Un cargo mensual: el gasto aplicado a un mes concreto
export type MonthlyCharge = {
  id: number
  period: string          // "2026-10"
  dueDate: string         // "2026-10-10"
  amount: number          // monto real de ese mes, en su moneda
  exchangeRate: number | null // solo USD: pesos por dólar al que se pagó
  amountArs: number | null    // costo en pesos (null si es USD sin cotización todavía)
  status: ChargeStatus
  paidAt: string | null
  expense: Pick<FixedExpense, 'id' | 'name' | 'category' | 'paymentMethod' | 'currency' | 'paymentMode' | 'debitDay'>
}

// Cotización de un tipo de dólar (oficial, tarjeta, bolsa/MEP, blue...)
export type ExchangeRate = {
  type: string
  name: string
  buy: number | null
  sell: number
  updatedAt: string
}
