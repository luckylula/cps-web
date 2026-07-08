-- CreateTable
CREATE TABLE "StockAlert" (
    "id" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockAlert_productId_active_idx" ON "StockAlert"("productId", "active");

-- CreateIndex
CREATE INDEX "StockAlert_email_active_idx" ON "StockAlert"("email", "active");

-- CreateIndex
CREATE UNIQUE INDEX "stockalert_product_email_active_unique" ON "StockAlert"("productId", "email", "active");

-- AddForeignKey
ALTER TABLE "StockAlert" ADD CONSTRAINT "StockAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
