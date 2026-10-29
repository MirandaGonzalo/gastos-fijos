import { CatalogManager } from '../components/settings/CatalogManager'
import { ExchangeRateSettings } from '../components/settings/ExchangeRateSettings'

export function SettingsPage() {
  return (
    <div className="p-6 overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-1">Configuración</h1>
      <p className="text-sm text-gray-400 mb-6">
        Categorías y medios de pago (solo se pueden borrar si ningún gasto los usa) y la cotización del dólar de referencia.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
        <CatalogManager kind="categories" title="Categorías" placeholder="Nueva categoría" />
        <CatalogManager kind="payment-methods" title="Medios de pago" placeholder="Nuevo medio de pago" />
        <ExchangeRateSettings />
      </div>
    </div>
  )
}
