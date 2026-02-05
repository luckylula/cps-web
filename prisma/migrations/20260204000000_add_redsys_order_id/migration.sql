-- AlterTable
ALTER TABLE "Order" ADD COLUMN "redsysOrderId" VARCHAR(12);

-- CreateIndex
CREATE UNIQUE INDEX "Order_redsysOrderId_key" ON "Order"("redsysOrderId");
