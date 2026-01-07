import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrateOrderAddresses() {
  console.log('='.repeat(60));
  console.log('MIGRACIÓN DE DATOS LEGACY DE PEDIDOS');
  console.log('='.repeat(60));

  try {
    // Obtener todos los pedidos que tienen nombreCompleto pero no tienen nombre
    const ordersToMigrate = await prisma.order.findMany({
      where: {
        nombre: null,
      },
    });

    console.log(`\n📦 Pedidos a migrar: ${ordersToMigrate.length}\n`);

    if (ordersToMigrate.length === 0) {
      console.log('✅ No hay pedidos para migrar\n');
      return;
    }

    let migrated = 0;
    let errors = 0;

    for (const order of ordersToMigrate) {
      try {
        // Separar nombreCompleto en nombre y apellidos
        const nombreCompleto = order.nombreCompleto || '';
        const parts = nombreCompleto.trim().split(' ');
        const nombre = parts[0] || 'Usuario';
        const apellidos = parts.slice(1).join(' ') || 'Legacy';

        // Mover direccion a direccionCompleta
        const direccionCompleta = order.direccion || '';

        // Actualizar el pedido
        await prisma.order.update({
          where: { id: order.id },
          data: {
            nombre,
            apellidos,
            direccionCompleta,
            // Valores por defecto para campos requeridos nuevos
            direccion: 'Dirección legacy',
            codigoPostal: '00000',
            ciudad: 'Por actualizar',
            provincia: 'Por actualizar',
          },
        });

        console.log(`✅ Migrado pedido ${order.orderNumber}: ${nombreCompleto} → ${nombre} ${apellidos}`);
        migrated++;
      } catch (error: any) {
        console.error(`❌ Error migrando pedido ${order.orderNumber}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Pedidos migrados: ${migrated}`);
    if (errors > 0) {
      console.log(`❌ Errores: ${errors}`);
    }
    console.log('='.repeat(60) + '\n');
  } catch (error: any) {
    console.error('❌ Error general:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateOrderAddresses()
  .then(() => {
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
