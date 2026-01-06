import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🎫 Iniciando seed de cupones...\n');

  try {
    // Crear cupón de prueba PROMO10
    const coupon = await prisma.coupon.upsert({
      where: { code: 'PROMO10' },
      update: {
        discountPercent: 10.00,
        isActive: true,
        expiresAt: null, // Sin fecha de expiración
      },
      create: {
        code: 'PROMO10',
        discountPercent: 10.00,
        isActive: true,
        expiresAt: null, // Sin fecha de expiración
      },
    });

    console.log('✅ Cupón creado exitosamente:');
    console.log(`   Código: ${coupon.code}`);
    console.log(`   Descuento: ${coupon.discountPercent}%`);
    console.log(`   Activo: ${coupon.isActive ? 'Sí' : 'No'}`);
    console.log(`   Expira: ${coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Nunca'}`);
    console.log(`   ID: ${coupon.id}`);
    console.log('\n🎉 ¡Cupón listo para usar!');
    console.log('   Puedes probarlo en el checkout con el código: PROMO10\n');

  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
