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
    const promo10 = await prisma.coupon.upsert({
      where: { code: 'PROMO10' },
      update: {
        discountPercent: 10.00,
        isActive: true,
        expiresAt: null,
      },
      create: {
        code: 'PROMO10',
        discountPercent: 10.00,
        isActive: true,
        expiresAt: null,
      },
    });

    // Cupón curso 26/27: 10% descuento, un uso por email
    const cursCoupon = await prisma.coupon.upsert({
      where: { code: 'CURS26/27' },
      update: {
        discountPercent: 10.00,
        isActive: true,
        singleUsePerEmail: true,
        expiresAt: null,
      },
      create: {
        code: 'CURS26/27',
        discountPercent: 10.00,
        isActive: true,
        singleUsePerEmail: true,
        expiresAt: null,
      },
    });

    console.log('✅ Cupones creados/actualizados:');
    for (const coupon of [promo10, cursCoupon]) {
      console.log(`   Código: ${coupon.code}`);
      console.log(`   Descuento: ${coupon.discountPercent}%`);
      console.log(`   Activo: ${coupon.isActive ? 'Sí' : 'No'}`);
      console.log(`   Un uso por email: ${coupon.singleUsePerEmail ? 'Sí' : 'No'}`);
      console.log(`   Expira: ${coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Nunca'}`);
      console.log(`   ID: ${coupon.id}`);
      console.log('');
    }

    console.log('🎉 ¡Cupones listos para usar!');
    console.log('   Prueba en checkout: PROMO10 o CURS26/27 (mayúsculas/minúsculas indiferente)\n');

  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
