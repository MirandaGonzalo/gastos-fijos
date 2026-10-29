import type { FixedExpense } from '../types'

export const expenses: FixedExpense[] = [
  { id: 1, name: 'Expensas', estimatedAmount: 178000, currency: 'ARS', paymentMode: 'AUTOMATIC', debitDay: 10, category: { id: 1, name: 'Servicios' }, paymentMethod: { id: 1, name: 'Manual' }, startPeriod: '2026-10', endPeriod: null, active: true, paidCount: 0 },  
  { id: 2, name: 'Luz', estimatedAmount: 100000, currency: 'ARS', paymentMode: 'AUTOMATIC', debitDay: 10, category: { id: 1, name: 'Servicios' }, paymentMethod: { id: 1, name: 'Manual' }, startPeriod: '2026-10', endPeriod: null, active: true, paidCount: 0 },  
  { id: 3, name: 'Internet', estimatedAmount: 33000, currency: 'ARS', paymentMode: 'AUTOMATIC', debitDay: 10, category: { id: 1, name: 'Servicios' }, paymentMethod: { id: 1, name: 'Manual' }, startPeriod: '2026-10', endPeriod: null, active: true, paidCount: 0 },  
  { id: 4, name: 'Osde', estimatedAmount: 53000, currency: 'ARS', paymentMode: 'AUTOMATIC', debitDay: 10, category: { id: 1, name: 'Servicios' }, paymentMethod: { id: 1, name: 'Manual' }, startPeriod: '2026-10', endPeriod: null, active: true, paidCount: 0 },  
  { id: 5, name: 'Claude', estimatedAmount: 20, currency: 'USD', paymentMode: 'AUTOMATIC', debitDay: 28, category: { id: 1, name: 'Subscripciones' }, paymentMethod: { id: 1, name: 'Manual' }, startPeriod: '2026-10', endPeriod: null, active: true, paidCount: 0 },  
]
