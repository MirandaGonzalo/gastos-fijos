-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- AlterTable
ALTER TABLE "fixed_expenses" ADD COLUMN     "paymentMode" "PaymentMode" NOT NULL DEFAULT 'AUTOMATIC';
