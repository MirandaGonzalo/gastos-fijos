import { Link } from 'react-router'
import { useExchangeRate } from '../context/exchangeRate'
import { formatMoney } from '../utils/format'

// Nota al pie que explica a qué cotización se están convirtiendo los USD
export function RateNote({ prefix = 'Los montos en USD se convierten a' }: { prefix?: string }) {
  const { current, loading, error } = useExchangeRate()

  if (!current) {
    return (
      <p className="text-xs text-amber-400">
        {loading ? 'Cargando cotización del dólar...' : `Sin cotización del dólar${error ? ` (${error})` : ''}: los montos en USD no se suman.`}
      </p>
    )
  }

  const time = new Date(current.updatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
  return (
    <p className="text-xs text-gray-500">
      {prefix} {formatMoney(current.sell, 'ARS')} (dólar {current.name.toLowerCase()}, venta · {time}
      {error ? ', puede estar desactualizada' : ''}).{' '}
      <Link to="/configuracion" className="text-blue-400 hover:underline">Cambiar</Link>
    </p>
  )
}
