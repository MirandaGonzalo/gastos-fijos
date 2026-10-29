import type { PaymentMode } from '../types'

// Textos según la modalidad, en un solo lugar para que tabla, form y calendario digan lo mismo
export const PAYMENT_MODE_INFO: Record<PaymentMode, {
  label: string        // nombre de la modalidad
  dayLabel: string     // cómo se llama el día en un formulario
  dayPrefix: string    // para frases: "Se debita el 10" / "Vence el 10"
  description: string
}> = {
  AUTOMATIC: {
    label: 'Débito automático',
    dayLabel: 'Día de débito',
    dayPrefix: 'Se debita el',
    description: 'Se cobra solo ese día. Solo tenés que tener saldo.',
  },
  MANUAL: {
    label: 'Pago manual',
    dayLabel: 'Día de vencimiento',
    dayPrefix: 'Vence el',
    description: 'Lo pagás vos. Ese día es el último para hacerlo sin recargo.',
  },
}
