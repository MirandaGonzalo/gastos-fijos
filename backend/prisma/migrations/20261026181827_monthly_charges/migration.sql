/*
  Warnings:

  - You are about to drop the column `amount` on the `fixed_expenses` table. All the data in the column will be lost.
  - Added the required column `estimatedAmount` to the `fixed_expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startPeriod` to the `fixed_expenses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "fixed_expenses" DROP COLUMN "amount",
ADD COLUMN     "endPeriod" TEXT,
ADD COLUMN     "estimatedAmount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "startPeriod" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "monthly_charges" (
    "id" SERIAL NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_charges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monthly_charges_period_idx" ON "monthly_charges"("period");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_charges_expenseId_period_key" ON "monthly_charges"("expenseId", "period");

-- AddForeignKey
ALTER TABLE "monthly_charges" ADD CONSTRAINT "monthly_charges_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "fixed_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
