/*
  Warnings:

  - You are about to drop the column `category` on the `fixed_expenses` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `fixed_expenses` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `fixed_expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethodId` to the `fixed_expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fixed_expenses" DROP COLUMN "category",
DROP COLUMN "paymentMethod",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "paymentMethodId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_name_key" ON "payment_methods"("name");

-- AddForeignKey
ALTER TABLE "fixed_expenses" ADD CONSTRAINT "fixed_expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_expenses" ADD CONSTRAINT "fixed_expenses_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
