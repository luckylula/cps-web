// Test script para verificar la configuración de Stripe
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '.env.local') });

console.log('='.repeat(60));
console.log('VERIFICACIÓN DE CONFIGURACIÓN DE STRIPE');
console.log('='.repeat(60));

const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const secretKey = process.env.STRIPE_SECRET_KEY;

console.log('\n📋 Variables de entorno:\n');

if (publicKey) {
  console.log('✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY está configurada');
  console.log(`   Valor: ${publicKey.substring(0, 20)}...`);
} else {
  console.log('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY NO está configurada');
}

if (secretKey) {
  console.log('✅ STRIPE_SECRET_KEY está configurada');
  console.log(`   Valor: ${secretKey.substring(0, 20)}...`);
} else {
  console.log('❌ STRIPE_SECRET_KEY NO está configurada');
}

console.log('\n' + '='.repeat(60));

if (!publicKey || !secretKey) {
  console.log('\n⚠️  ATENCIÓN: Faltan variables de entorno');
  console.log('Asegúrate de que el archivo .env.local existe y contiene:');
  console.log('  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
  console.log('  - STRIPE_SECRET_KEY=sk_test_...');
  console.log('\n💡 Si acabas de añadir las variables, reinicia el servidor.');
  process.exit(1);
} else {
  console.log('\n✅ Todas las variables de Stripe están configuradas correctamente');
  process.exit(0);
}
