-- Alinea la BD con prisma/schema.prisma (opcional; el workflow v5 usa sku_interno).
-- Ejecutar solo si no hay duplicados proveedor+ref_proveedor.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_unique_proveedor_ref'
  ) THEN
    ALTER TABLE "Product"
      ADD CONSTRAINT product_unique_proveedor_ref UNIQUE (proveedor, ref_proveedor);
  END IF;
END $$;
