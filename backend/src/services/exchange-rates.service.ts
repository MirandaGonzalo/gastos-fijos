import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ExchangeRateDto } from '../dto/exchange-rate.dto';

const CACHE_MS = 10 * 60 * 1000; // 10 minutos: no hace falta pegarle a la API en cada request

type RawRate = {
  casa?: unknown;
  nombre?: unknown;
  compra?: unknown;
  venta?: unknown;
  fechaActualizacion?: unknown;
};

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private cache: { data: ExchangeRateDto[]; expiresAt: number } | null = null;

  async findAll(): Promise<ExchangeRateDto[]> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.data;

    const url = process.env.DOLAR_API_URL ?? 'https://dolarapi.com/v1/dolares';
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = this.parse(await res.json());
      if (data.length === 0)
        throw new Error('respuesta sin cotizaciones válidas');

      this.cache = { data, expiresAt: Date.now() + CACHE_MS };
      return data;
    } catch (err) {
      this.logger.warn(`No se pudo obtener la cotización: ${String(err)}`);
      // Si la API falla pero hay datos viejos, mejor eso que nada
      if (this.cache) return this.cache.data;
      throw new BadGatewayException(
        'No se pudo obtener la cotización del dólar',
      );
    }
  }

  // Valida la respuesta externa: nunca confiar en la forma de una API de terceros
  private parse(body: unknown): ExchangeRateDto[] {
    if (!Array.isArray(body)) return [];
    return (body as RawRate[])
      .filter(
        (r) =>
          typeof r.casa === 'string' &&
          typeof r.venta === 'number' &&
          r.venta > 0,
      )
      .map((r) => ({
        type: r.casa as string,
        name: typeof r.nombre === 'string' ? r.nombre : (r.casa as string),
        buy: typeof r.compra === 'number' ? r.compra : null,
        sell: r.venta as number,
        updatedAt:
          typeof r.fechaActualizacion === 'string'
            ? r.fechaActualizacion
            : new Date().toISOString(),
      }));
  }
}
