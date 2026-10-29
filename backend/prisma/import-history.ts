// Importa el historial de pagos de meses anteriores.
//
//   Modo prueba (no toca nada, muestra qué haría):  npx ts-node prisma/import-history.ts
//   Aplicar los cambios:                            npx ts-node prisma/import-history.ts --apply
//
// Se puede correr varias veces: si un pago ya existe, lo actualiza en vez de duplicarlo.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

type Mode = 'AUTOMATIC' | 'MANUAL';

// ─────────────────────────────────────────────────────────────────────────────
// 1) Datos de cada gasto. Solo se usan si el gasto NO existe todavía en la base.
//    Si ya existe (se busca por nombre), se respeta lo que tenga cargado.
//    ⚠️ Revisá los marcados con "REVISAR": son suposiciones.
// ─────────────────────────────────────────────────────────────────────────────
const EXPENSES: Record<
  string,
  {
    category: string;
    paymentMethod: string;
    paymentMode: Mode;
    debitDay: number;
    currency: 'ARS' | 'USD';
  }
> = {
  'Disney+': {
    category: 'Suscripciones',
    paymentMethod: 'Visa',
    paymentMode: 'AUTOMATIC',
    debitDay: 15,
    currency: 'ARS',
  }, // REVISAR día y medio de pago
  Expensas: {
    category: 'Vivienda',
    paymentMethod: 'Transferencia',
    paymentMode: 'MANUAL',
    debitDay: 10,
    currency: 'ARS',
  }, // REVISAR
  Internet: {
    category: 'Servicios',
    paymentMethod: 'Visa',
    paymentMode: 'AUTOMATIC',
    debitDay: 10,
    currency: 'ARS',
  }, // REVISAR
  Gimnasio: {
    category: 'Salud',
    paymentMethod: 'Transferencia',
    paymentMode: 'MANUAL',
    debitDay: 10,
    currency: 'ARS',
  }, // REVISAR
  Luz: {
    category: 'Servicios',
    paymentMethod: 'Transferencia',
    paymentMode: 'MANUAL',
    debitDay: 15,
    currency: 'ARS',
  }, // REVISAR
  Osde: {
    category: 'Salud',
    paymentMethod: 'Cuenta bancaria',
    paymentMode: 'AUTOMATIC',
    debitDay: 10,
    currency: 'ARS',
  }, // REVISAR
  Claude: {
    category: 'Suscripciones',
    paymentMethod: 'Visa',
    paymentMode: 'AUTOMATIC',
    debitDay: 28,
    currency: 'USD',
  }, // REVISAR
};

// ─────────────────────────────────────────────────────────────────────────────
// 2) Cotización a la que pagaste los cargos en USD (pesos por dólar).
//    Si no la sabés, dejala en null: el pago queda registrado pero sin costo en pesos.
// ─────────────────────────────────────────────────────────────────────────────
const USD_RATES: Record<string, number | null> = {
  'Claude 2026-09': 1525, // US$ 20 = $ 30.500
  'Claude 2026-10': 1525, // US$ 20 = $ 30.500
};

// ─────────────────────────────────────────────────────────────────────────────
// 3) Pagos realizados (monto real de cada mes). Todos se marcan como PAGADOS.
// ─────────────────────────────────────────────────────────────────────────────
const PAYMENTS: Record<string, Record<string, number>> = {
  '2026-07': { 'Disney+': 24000, Expensas: 177460 },
  '2026-08': {
    Internet: 30313,
    Gimnasio: 50860,
    'Disney+': 24000,
    Luz: 79420,
    Expensas: 196845,
  },
  '2026-09': {
    Expensas: 181561,
    Osde: 50712,
    Gimnasio: 51800,
    Internet: 30954,
    Luz: 95991,
    'Disney+': 24000,
    Claude: 20,
  },
  '2026-10': {
    Luz: 85457,
    Osde: 51713,
    Gimnasio: 52900,
    Internet: 31577,
    Expensas: 177269,
    Claude: 20,
  },
};

// ─────────────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// "Disney +", "disney+", "DISNEY+" -> "disney"
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

// Mismo cálculo que el back: si el día no existe en el mes, el último día
function dueDateFor(period: string, debitDay: number): Date {
  const [y, m] = period.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1, Math.min(debitDay, lastDay)));
}

async function main() {
  console.log(
    APPLY
      ? '>>> APLICANDO CAMBIOS\n'
      : '>>> MODO PRUEBA (no se guarda nada). Agregá --apply para aplicar.\n',
  );

  const existing = await prisma.fixedExpense.findMany();
  const periods = Object.keys(PAYMENTS).sort();

  for (const name of Object.keys(EXPENSES)) {
    const months = periods.filter((p) => PAYMENTS[p][name] !== undefined);
    if (months.length === 0) continue;
    const firstPeriod = months[0];
    const lastAmount = PAYMENTS[months[months.length - 1]][name];
    const config = EXPENSES[name];

    // ¿Ya existe en la base?
    let expense = existing.find((e) => normalize(e.name) === normalize(name));

    if (expense) {
      const moveStart = firstPeriod < expense.startPeriod;
      console.log(
        `• ${name}: ya existe (id ${expense.id}, día ${expense.debitDay}, ${expense.currency})` +
          (moveStart
            ? ` → "Desde" pasa de ${expense.startPeriod} a ${firstPeriod}`
            : ''),
      );
      if (APPLY && moveStart) {
        expense = await prisma.fixedExpense.update({
          where: { id: expense.id },
          data: { startPeriod: firstPeriod },
        });
      }
    } else {
      console.log(
        `• ${name}: NO existe → se crea (${config.category}, ${config.paymentMode === 'AUTOMATIC' ? 'débito automático' : 'pago manual'} día ${config.debitDay}, ${config.paymentMethod}, ${config.currency}, desde ${firstPeriod}, estimado ${lastAmount})`,
      );
      if (APPLY) {
        const category = await prisma.category.upsert({
          where: { name: config.category },
          update: {},
          create: { name: config.category },
        });
        const paymentMethod = await prisma.paymentMethod.upsert({
          where: { name: config.paymentMethod },
          update: {},
          create: { name: config.paymentMethod },
        });
        expense = await prisma.fixedExpense.create({
          data: {
            name,
            estimatedAmount: lastAmount,
            currency: config.currency,
            paymentMode: config.paymentMode,
            debitDay: config.debitDay,
            categoryId: category.id,
            paymentMethodId: paymentMethod.id,
            startPeriod: firstPeriod,
          },
        });
      }
    }

    // Pagos de cada mes
    const debitDay = expense?.debitDay ?? config.debitDay;
    const currency = expense?.currency ?? config.currency;
    for (const period of months) {
      const amount = PAYMENTS[period][name];
      const dueDate = dueDateFor(period, debitDay);
      const exchangeRate =
        currency === 'USD' ? (USD_RATES[`${name} ${period}`] ?? null) : null;
      console.log(
        `    ${period}: ${currency === 'USD' ? 'US$' : '$'} ${amount.toLocaleString('es-AR')} pagado` +
          (currency === 'USD'
            ? exchangeRate
              ? ` a $${exchangeRate}`
              : ' (sin cotización)'
            : ''),
      );
      if (APPLY && expense) {
        const data = {
          amount,
          exchangeRate,
          dueDate,
          status: 'PAID' as const,
          paidAt: dueDate,
        };
        await prisma.monthlyCharge.upsert({
          where: { expenseId_period: { expenseId: expense.id, period } },
          update: data,
          create: { ...data, expenseId: expense.id, period },
        });
      }
    }
  }

  // Gastos de la base que no aparecen en el historial (solo informativo)
  const unknown = existing.filter(
    (e) =>
      !Object.keys(EXPENSES).some((n) => normalize(n) === normalize(e.name)),
  );
  if (unknown.length > 0) {
    console.log(
      `\nEn la base hay otros gastos sin historial cargado: ${unknown.map((e) => e.name).join(', ')}`,
    );
  }

  console.log(
    APPLY
      ? '\n✔ Historial importado.'
      : '\nNada se guardó. Si está todo bien, corré de nuevo con --apply',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
