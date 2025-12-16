-- DropForeignKey
ALTER TABLE "SaleDetail" DROP CONSTRAINT "SaleDetail_saleId_fkey";

-- AddForeignKey
ALTER TABLE "SaleDetail" ADD CONSTRAINT "SaleDetail_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
