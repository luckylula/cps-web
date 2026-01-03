import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env.local
function loadEnvLocal() {
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.warn('No se pudo cargar .env.local, usando process.env');
    return {};
  }
}

const envLocal = loadEnvLocal();
const API_TOKEN = envLocal.ADMIN_API_TOKEN || process.env.ADMIN_API_TOKEN;
const API_URL = process.env.API_URL || 'http://localhost:3000';

if (!API_TOKEN) {
  console.error('❌ Error: ADMIN_API_TOKEN no encontrado en .env.local o variables de entorno');
  console.error('   Asegúrate de tener ADMIN_API_TOKEN configurado en tu .env.local');
  process.exit(1);
}

// Producto de prueba
const testProduct = {
  name: 'Producto de Prueba API',
  categorySlug: 'material-escolar',
  slug: 'producto-de-prueba-api',
  description: 'Este es un producto de prueba creado desde la API de administración',
  price: 19.99,
  stock: 10,
  subcategory: 'Psicomotricidad',
  published: true,
  featured: false,
  images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80'],
};

async function testAPI() {
  console.log('🧪 Probando API de administración de productos...\n');
  console.log('📦 Producto de prueba:');
  console.log(`   Nombre: ${testProduct.name}`);
  console.log(`   Categoría: ${testProduct.categorySlug}`);
  console.log(`   Precio: ${testProduct.price}€\n`);

  try {
    const response = await fetch(`${API_URL}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct),
    });

    const data = await response.json();

    console.log(`📊 Respuesta (${response.status} ${response.statusText}):\n`);
    
    if (response.ok) {
      console.log('✅ ¡Éxito! Producto creado/actualizado correctamente\n');
      console.log('📋 Detalles:');
      console.log(`   ID: ${data.results[0].product.id}`);
      console.log(`   Nombre: ${data.results[0].product.name}`);
      console.log(`   Slug: ${data.results[0].product.slug}`);
      console.log(`   Procesados: ${data.processed}`);
      console.log(`   Fallidos: ${data.failed}`);
    } else {
      console.log('❌ Error en la respuesta:\n');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error al conectar con la API:');
    console.error(`   ${error.message}\n`);
    console.error('💡 Asegúrate de que:');
    console.error('   1. El servidor Next.js está corriendo (npm run dev)');
    console.error('   2. La URL es correcta (http://localhost:3000)');
    console.error('   3. El token ADMIN_API_TOKEN está configurado correctamente');
    process.exit(1);
  }
}

testAPI();
