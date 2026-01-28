-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tipo_producto" VARCHAR(100);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_tipo_producto_idx" ON "Product"("tipo_producto");
