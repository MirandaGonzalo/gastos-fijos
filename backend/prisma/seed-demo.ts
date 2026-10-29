// Datos de DEMO: gastos y 12 meses de pagos inventados, con aumentos realistas.
// Sirve para mostrar la app (capturas, presentaciones) sin exponer datos reales.
//
// ⚠️ BORRA todo lo que haya en la base antes de cargar. Por seguridad, solo corre
// si DATABASE_URL apunta a una base cuyo nombre contiene "demo".
//
//   npx ts-node --transpile-only prisma/seed-demo.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const url = process.env.DATABASE_URL ?? '';
if (!/demo/i.test(new URL(url.replace(/^postgresql/, 'http')).pathname)) {
  console.error(
    '✋ seed-demo solo corre contra una base "demo". DATABASE_URL apunta a otra base: no se tocó nada.',
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

// ── Números pseudoaleatorios con semilla: siempre genera los mismos datos ──
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(2026);
const noise = (pct: number) => 1 + (random() * 2 - 1) * pct; // ±pct

// ── Fechas ──
const pad = (n: number) => String(n).padStart(2, '0');
const today = new Date();
const periodOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
function addMonths(period: string, n: number) {
  const [y, m] = period.split('-').map(Number);
  return periodOf(new Date(y, m - 1 + n, 1));
}
function dueDateFor(period: string, day: number) {
  const [y, m] = period.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1, Math.min(day, last)));
}
const todayUtc = new Date(
  Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
);

const MONTHS = 12;
const current = periodOf(today);
const first = addMonths(current, -(MONTHS - 1));

// Índice del mes dentro de la demo: 0 = primer mes, 11 = mes actual
function monthIndex(period: string) {
  const [y1, m1] = first.split('-').map(Number);
  const [y2, m2] = period.split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

type Profile =
  | { kind: 'inflation'; monthly: number; noise?: number } // sube un poco todos los meses
  | { kind: 'steps'; every: number; jump: number }; // sube de golpe cada N meses (alquiler, abonos)

type DemoExpense = {
  name: string;
  category: string;
  method: string;
  mode: 'AUTOMATIC' | 'MANUAL';
  day: number;
  currency: 'ARS' | 'USD';
  base: number; // monto del primer mes
  profile: Profile;
  season?: 'summer' | 'winter'; // luz en verano, gas en invierno
  startOffset?: number; // empieza N meses después del inicio
  endOffset?: number; // termina N meses antes del mes actual (gasto dado de baja)
};

const EXPENSES: DemoExpense[] = [
  {
    name: 'Alquiler',
    category: 'Vivienda',
    method: 'Transferencia',
    mode: 'MANUAL',
    day: 5,
    currency: 'ARS',
    base: 420000,
    profile: { kind: 'steps', every: 4, jump: 0.14 },
  },
  {
    name: 'Expensas',
    category: 'Vivienda',
    method: 'Transferencia',
    mode: 'MANUAL',
    day: 10,
    currency: 'ARS',
    base: 105000,
    profile: { kind: 'inflation', monthly: 0.025, noise: 0.03 },
  },
  {
    name: 'Luz',
    category: 'Servicios',
    method: 'Visa',
    mode: 'MANUAL',
    day: 15,
    currency: 'ARS',
    base: 42000,
    profile: { kind: 'inflation', monthly: 0.03, noise: 0.05 },
    season: 'summer',
  },
  {
    name: 'Gas',
    category: 'Servicios',
    method: 'Transferencia',
    mode: 'MANUAL',
    day: 18,
    currency: 'ARS',
    base: 16000,
    profile: { kind: 'inflation', monthly: 0.035, noise: 0.04 },
    season: 'winter',
  },
  {
    name: 'Agua',
    category: 'Servicios',
    method: 'Transferencia',
    mode: 'MANUAL',
    day: 20,
    currency: 'ARS',
    base: 12500,
    profile: { kind: 'inflation', monthly: 0.03, noise: 0.02 },
  },
  {
    name: 'Internet',
    category: 'Servicios',
    method: 'Visa',
    mode: 'AUTOMATIC',
    day: 8,
    currency: 'ARS',
    base: 24500,
    profile: { kind: 'steps', every: 3, jump: 0.09 },
  },
  {
    name: 'Celular',
    category: 'Servicios',
    method: 'Mastercard',
    mode: 'AUTOMATIC',
    day: 12,
    currency: 'ARS',
    base: 16800,
    profile: { kind: 'steps', every: 2, jump: 0.07 },
  },
  {
    name: 'Prepaga',
    category: 'Salud',
    method: 'Cuenta bancaria',
    mode: 'AUTOMATIC',
    day: 3,
    currency: 'ARS',
    base: 82000,
    profile: { kind: 'inflation', monthly: 0.027 },
  },
  {
    name: 'Gimnasio',
    category: 'Salud',
    method: 'Efectivo',
    mode: 'MANUAL',
    day: 10,
    currency: 'ARS',
    base: 36000,
    profile: { kind: 'steps', every: 6, jump: 0.18 },
  },
  {
    name: 'Streaming',
    category: 'Suscripciones',
    method: 'Visa',
    mode: 'AUTOMATIC',
    day: 22,
    currency: 'ARS',
    base: 11500,
    profile: { kind: 'steps', every: 6, jump: 0.22 },
  },
  {
    name: 'Música',
    category: 'Suscripciones',
    method: 'Mastercard',
    mode: 'AUTOMATIC',
    day: 17,
    currency: 'ARS',
    base: 4200,
    profile: { kind: 'steps', every: 5, jump: 0.15 },
  },
  {
    name: 'Asistente de IA',
    category: 'Suscripciones',
    method: 'Visa',
    mode: 'AUTOMATIC',
    day: 28,
    currency: 'USD',
    base: 20,
    profile: { kind: 'steps', every: 99, jump: 0 },
  },
  {
    name: 'Servidor VPS',
    category: 'Suscripciones',
    method: 'Visa',
    mode: 'AUTOMATIC',
    day: 1,
    currency: 'USD',
    base: 6,
    profile: { kind: 'steps', every: 99, jump: 0 },
    startOffset: 6,
  },
  {
    name: 'Seguro del auto',
    category: 'Transporte',
    method: 'Visa',
    mode: 'AUTOMATIC',
    day: 25,
    currency: 'ARS',
    base: 52000,
    profile: { kind: 'inflation', monthly: 0.03, noise: 0.01 },
  },
  {
    name: 'Diario digital',
    category: 'Suscripciones',
    method: 'Mastercard',
    mode: 'AUTOMATIC',
    day: 9,
    currency: 'ARS',
    base: 3900,
    profile: { kind: 'steps', every: 4, jump: 0.12 },
    endOffset: 3,
  },
];

// Cotización del dólar a la que "se compró" cada mes: sube ~1,8% mensual con algo de ruido
const rateFor = (i: number) =>
  Math.round(1180 * Math.pow(1.018, i) * noise(0.02));

function amountFor(e: DemoExpense, i: number, period: string): number {
  if (e.currency === 'USD') return e.base;
  let value = e.base;
  if (e.profile.kind === 'inflation') {
    value *= Math.pow(1 + e.profile.monthly, i) * noise(e.profile.noise ?? 0);
  } else {
    value *= Math.pow(1 + e.profile.jump, Math.floor(i / e.profile.every));
  }
  const month = Number(period.slice(5, 7));
  if (e.season === 'summer' && [12, 1, 2].includes(month)) value *= 1.35;
  if (e.season === 'winter' && [6, 7, 8].includes(month)) value *= 1.7;
  return Math.round(value / 10) * 10; // redondeo a $10
}

async function main() {
  console.log(`Cargando datos de demo: ${first} a ${current}...`);

  // Empezar de cero (el orden importa por las claves foráneas)
  await prisma.monthlyCharge.deleteMany();
  await prisma.fixedExpense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.paymentMethod.deleteMany();

  const categoryIds = new Map<string, number>();
  for (const name of [...new Set(EXPENSES.map((e) => e.category))]) {
    categoryIds.set(
      name,
      (await prisma.category.create({ data: { name } })).id,
    );
  }
  const methodIds = new Map<string, number>();
  for (const name of [...new Set(EXPENSES.map((e) => e.method))]) {
    methodIds.set(
      name,
      (await prisma.paymentMethod.create({ data: { name } })).id,
    );
  }

  let charges = 0;
  for (const e of EXPENSES) {
    const startPeriod = addMonths(first, e.startOffset ?? 0);
    const endPeriod = e.endOffset ? addMonths(current, -e.endOffset) : null;

    const periods: string[] = [];
    for (
      let p = startPeriod;
      p <= current && (!endPeriod || p <= endPeriod);
      p = addMonths(p, 1)
    )
      periods.push(p);

    const amounts = periods.map((p) => amountFor(e, monthIndex(p), p));

    const expense = await prisma.fixedExpense.create({
      data: {
        name: e.name,
        estimatedAmount: amounts[amounts.length - 1],
        currency: e.currency,
        paymentMode: e.mode,
        debitDay: e.day,
        categoryId: categoryIds.get(e.category)!,
        paymentMethodId: methodIds.get(e.method)!,
        startPeriod,
        endPeriod,
        active: endPeriod === null,
      },
    });

    for (const [k, period] of periods.entries()) {
      const i = monthIndex(period);
      const dueDate = dueDateFor(period, e.day);
      const isLastMonth = period === addMonths(current, -1);

      // Pagado si ya pasó la fecha... salvo dos casos para mostrar alertas en la demo:
      //  - el gas del mes pasado quedó vencido sin pagar
      //  - el débito de internet de este mes todavía no se confirmó
      let paid = dueDate < todayUtc;
      if (e.name === 'Gas' && isLastMonth) paid = false;
      if (e.name === 'Internet' && period === current) paid = false;

      const paidAt = new Date(dueDate);
      if (e.mode === 'MANUAL')
        paidAt.setUTCDate(paidAt.getUTCDate() - Math.floor(random() * 4)); // se pagó unos días antes

      await prisma.monthlyCharge.create({
        data: {
          expenseId: expense.id,
          period,
          dueDate,
          amount: amounts[k],
          exchangeRate: e.currency === 'USD' && paid ? rateFor(i) : null,
          status: paid ? 'PAID' : 'PENDING',
          paidAt: paid ? paidAt : null,
        },
      });
      charges++;
    }
  }

  console.log(
    `✔ Demo lista: ${EXPENSES.length} gastos y ${charges} cargos mensuales.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
