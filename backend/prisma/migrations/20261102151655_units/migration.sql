-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('PROPERTY', 'VEHICLE', 'OTHER');

-- CreateTable
CREATE TABLE "units" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UnitType" NOT NULL DEFAULT 'PROPERTY',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_units" (
    "expenseId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "share" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "expense_units_pkey" PRIMARY KEY ("expenseId","unitId")
);

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE INDEX "expense_units_unitId_idx" ON "expense_units"("unitId");

-- AddForeignKey
ALTER TABLE "expense_units" ADD CONSTRAINT "expense_units_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "fixed_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_units" ADD CONSTRAINT "expense_units_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
