import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL no está definida en las variables de entorno');
  console.error('   Asegúrate de tener un archivo .env.local con DATABASE_URL');
  process.exit(1);
}

console.log('🔍 Verificando conexión a la base de datos...\n');
console.log('📋 Información de conexión:');
console.log(`   URL: ${connectionString.substring(0, 30)}...${connectionString.substring(connectionString.length - 20)}`);

// Extraer información de la URL
try {
  const url = new URL(connectionString);
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Database: ${url.pathname.substring(1)}`);
  console.log(`   User: ${url.username}`);
} catch (e) {
  console.log('   (No se pudo parsear la URL)');
}

console.log('\n🔌 Intentando conectar...');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verifyConnection() {
  try {
    // Test 1: Conexión básica
    console.log('   ✓ Probando conexión básica...');
    await pool.query('SELECT 1');
    console.log('   ✅ Conexión exitosa\n');

    // Test 2: Verificar tablas
    console.log('📊 Verificando estructura de la base de datos...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`   ✓ Tablas encontradas: ${tables.rows.length}`);
    tables.rows.forEach((row: any) => {
      console.log(`      - ${row.table_name}`);
    });
    console.log('');

    // Test 3: Contar productos
    console.log('📦 Verificando datos...');
    const productCount = await prisma.product.count();
    const publishedProducts = await prisma.product.count({
      where: { published: true },
    });
    const categoryCount = await prisma.category.count();
    
    console.log(`   ✓ Total de productos: ${productCount}`);
    console.log(`   ✓ Productos publicados: ${publishedProducts}`);
    console.log(`   ✓ Total de categorías: ${categoryCount}`);
    console.log('');

    // Test 4: Verificar algunos productos
    if (productCount > 0) {
      const sampleProducts = await prisma.product.findMany({
        take: 5,
        select: {
          name: true,
          slug: true,
          published: true,
          price: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      console.log('📝 Ejemplos de productos (últimos 5):');
      sampleProducts.forEach((p) => {
        console.log(`   ${p.published ? '✅' : '🚫'} ${p.name} - ${Number(p.price)}€`);
      });
    } else {
      console.log('   ⚠️  No hay productos en la base de datos');
      console.log('   💡 Ejecuta: npm run seed:final para poblar la base de datos');
    }

    console.log('\n✅ Verificación completada exitosamente!');
    console.log('\n💡 Para verificar en Vercel:');
    console.log('   1. Ve a tu proyecto en Vercel');
    console.log('   2. Settings > Environment Variables');
    console.log('   3. Verifica que DATABASE_URL tenga el mismo valor que localmente');
    console.log('   4. Asegúrate de que apunte a la misma base de datos Neon');
    
  } catch (error: any) {
    console.error('\n❌ ERROR al verificar la conexión:');
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Código: ${error.code || 'N/A'}`);
    
    if (error.message.includes('does not exist')) {
      console.error('\n💡 Posible solución: La base de datos no existe o la URL es incorrecta');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Posible solución: Credenciales incorrectas en DATABASE_URL');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Posible solución: Problema de conectividad o firewall');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verifyConnection().catch(console.error);
