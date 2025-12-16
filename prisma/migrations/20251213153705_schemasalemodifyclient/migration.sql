/*
  Warnings:

  - Added the required column `metodoPago` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nit` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observaciones` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "metodoPago" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "nit" TEXT NOT NULL,
ADD COLUMN     "observaciones" TEXT NOT NULL;
