-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" TEXT;

-- CreateIndex
CREATE INDEX "Order_paymentMethod_idx" ON "Order"("paymentMethod");
