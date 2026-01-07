-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "apellidos" TEXT,
ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "codigoPostal" TEXT,
ADD COLUMN     "direccionCompleta" TEXT,
ADD COLUMN     "nifCif" TEXT,
ADD COLUMN     "nombre" TEXT,
ADD COLUMN     "piso" TEXT,
ADD COLUMN     "provincia" TEXT,
ALTER COLUMN "nombreCompleto" DROP NOT NULL,
ALTER COLUMN "direccion" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Order_codigoPostal_idx" ON "Order"("codigoPostal");
