// Datos iniciales: categorías y medios de pago por defecto.
// Correr con: npx prisma db seed  (se puede correr varias veces, no duplica)
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const categories = [
  'Servicios',
  'Vivienda',
  'Salud',
  'Suscripciones',
  'Transporte',
  'Educación',
];
const paymentMethods = [
  'Cuenta bancaria',
  'Visa',
  'Mastercard',
  'Transferencia',
  'Efectivo',
];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  for (const name of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(
    `Seed OK: ${categories.length} categorías, ${paymentMethods.length} medios de pago`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
