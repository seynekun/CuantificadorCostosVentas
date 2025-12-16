/*
  Warnings:

  - You are about to drop the column `unitId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Unit` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tipoUnidad` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_unitId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "unitId",
ADD COLUMN     "tipoUnidad" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Unit";
