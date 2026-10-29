import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { ExchangeRateProvider } from './ExchangeRateProvider'

export function Layout() {
  return (
    // El Provider envuelve todo: cualquier pantalla puede leer la cotización con useExchangeRate()
    <ExchangeRateProvider>
    <div className="h-screen flex bg-gray-900 text-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
    </ExchangeRateProvider>
  )
}
