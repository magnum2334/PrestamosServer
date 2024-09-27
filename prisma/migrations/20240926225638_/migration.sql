/*
  Warnings:

  - You are about to drop the column `interes` on the `Pago` table. All the data in the column will be lost.
  - Added the required column `fecha` to the `Pago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frecuencia` to the `Prestamo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interes` to the `Prestamo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pago" DROP COLUMN "interes",
ADD COLUMN     "fecha" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Prestamo" ADD COLUMN     "frecuencia" TEXT NOT NULL,
ADD COLUMN     "interes" INTEGER NOT NULL;
