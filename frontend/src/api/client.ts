const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3100'

// Error con el status HTTP y el mensaje que devolvió el back
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Wrapper de fetch: arma la URL, manda/recibe JSON y convierte errores HTTP en excepciones
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (!res.ok) {
    // NestJS devuelve { message: string | string[] } en los errores
    const body = await res.json().catch(() => null)
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new ApiError(res.status, message ?? `Error ${res.status}`)
  }

  // 204 No Content (ej. DELETE): no hay body que parsear
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}
