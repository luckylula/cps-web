import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper function to create or get category
async function getOrCreateCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  return await prisma.category.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      description: data.description,
      image: data.image,
    },
    create: data,
  });
}

async function main() {
  console.log('🌱 Iniciando seed básico...\n');

  // ============================================
  // CREAR CATEGORÍAS PRINCIPALES
  // ============================================
  // Estas categorías coinciden exactamente con app/page.tsx

  const materialEscolar = await getOrCreateCategory({
    name: 'Material Escolar',
    slug: 'material-escolar',
    description: 'Artículos que te permiten enseñar y crear un entorno de aprendizaje deportivo.',
  });

  const deporteIndividual = await getOrCreateCategory({
    name: 'Deporte Individual',
    slug: 'deporte-individual',
    description: 'Accede a una variedad de material para tu deporte y supérate a ti mismo.',
  });

  const deportesColectivos = await getOrCreateCategory({
    name: 'Deportes Colectivos',
    slug: 'deportes-colectivos',
    description: 'Cada deporte cuenta con su equipación. Encuentra material para entrenar y practicar deportes en equipo.',
  });

  const materialComplementario = await getOrCreateCategory({
    name: 'Material Deportivo Complementario',
    slug: 'material-complementario',
    description: 'Imprescindibles para tus instalaciones deportivas y ejercitar tu cuerpo.',
  });

  const equipacionTextil = await getOrCreateCategory({
    name: 'Equipación Textil',
    slug: 'equipacion-textil',
    description: 'Equipación completa para todas tus necesidades deportivas.',
  });

  console.log('✅ Categorías principales creadas');

  // ============================================
  // CREAR PRODUCTOS DE PRUEBA
  // ============================================

  // Productos para Material Escolar
  const productosMaterialEscolar = [
    {
      name: 'Ladrillo con soporte para pica y aro',
      slug: 'ladrillo-con-soporte-para-pica-y-aro',
      description: 'Ladrillo de psicomotricidad con soporte integrado para pica y aro. Ideal para ejercicios de equilibrio y coordinación.',
      price: 45.90,
      stock: 50,
      categoryId: materialEscolar.id,
      published: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80'],
    },
    {
      name: 'Trampolín escolar',
      slug: 'trampolin-escolar',
      description: 'Trampolín de psicomotricidad seguro y resistente para uso escolar. Perfecto para desarrollo motor.',
      price: 189.00,
      stock: 25,
      categoryId: materialEscolar.id,
      published: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
    },
  ];

  // Productos para Deporte Individual
  const productosDeporteIndividual = [
    {
      name: 'Raqueta de tenis mesa P900',
      slug: 'raqueta-tenis-mesa-p900',
      description: 'Raqueta profesional de tenis de mesa P900. Ideal para competición y entrenamiento.',
      price: 35.50,
      stock: 40,
      categoryId: deporteIndividual.id,
      published: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&q=80'],
    },
    {
      name: 'Esterilla yoga 6mm',
      slug: 'esterilla-yoga-6mm',
      description: 'Esterilla de yoga de 6mm de grosor. Antideslizante y cómoda para todas las prácticas.',
      price: 28.90,
      stock: 60,
      categoryId: deporteIndividual.id,
      published: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80'],
    },
  ];

  // Productos para Deportes Colectivos
  const productosDeportesColectivos = [
    {
      name: 'Balón de fútbol TPU',
      slug: 'balon-futbol-tpu',
      description: 'Balón de fútbol profesional TPU. Resistente y duradero para entrenamientos y partidos.',
      price: 24.99,
      stock: 80,
      categoryId: deportesColectivos.id,
      published: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80'],
    },
    {
      name: 'Balón Cuero Rox Dunk',
      slug: 'balon-cuero-rox-dunk',
      description: 'Balón de baloncesto profesional de cuero. Tamaño reglamentario para competición.',
      price: 39.99,
      stock: 45,
      categoryId: deportesColectivos.id,
      published: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80'],
    },
  ];

  // Productos para Material Complementario
  const productosMaterialComplementario = [
    {
      name: 'Conos de señalización',
      slug: 'conos-senalizacion',
      description: 'Conos de señalización para entrenamiento deportivo. Altamente visibles y resistentes.',
      price: 12.50,
      stock: 100,
      categoryId: materialComplementario.id,
      published: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'],
    },
    {
      name: 'Balón Medicinal Soft 3kg',
      slug: 'balon-medicinal-soft-3kg',
      description: 'Balón medicinal de 3kg con superficie suave. Ideal para entrenamiento funcional.',
      price: 32.00,
      stock: 30,
      categoryId: materialComplementario.id,
      published: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
    },
  ];

  // Productos para Equipación Textil
  const productosEquipacionTextil = [
    {
      name: 'Camiseta blanca económica - marcaje a una tinta',
      slug: 'camiseta-blanca-economica',
      description: 'Camiseta blanca económica con posibilidad de marcaje personalizado. Disponible en múltiples tallas.',
      price: 3.35,
      stock: 200,
      categoryId: equipacionTextil.id,
      published: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
    },
    {
      name: 'Camiseta Técnica blanca - marcaje a una tinta',
      slug: 'camiseta-tecnica-blanca',
      description: 'Camiseta técnica blanca de alta calidad. Transpirable y cómoda para competición.',
      price: 4.15,
      stock: 150,
      categoryId: equipacionTextil.id,
      published: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
    },
  ];

  // Crear todos los productos
  await prisma.product.createMany({
    data: [
      ...productosMaterialEscolar,
      ...productosDeporteIndividual,
      ...productosDeportesColectivos,
      ...productosMaterialComplementario,
      ...productosEquipacionTextil,
    ],
    skipDuplicates: true,
  });

  console.log('✅ Productos de prueba creados:');
  console.log(`   - Material Escolar: ${productosMaterialEscolar.length} productos`);
  console.log(`   - Deporte Individual: ${productosDeporteIndividual.length} productos`);
  console.log(`   - Deportes Colectivos: ${productosDeportesColectivos.length} productos`);
  console.log(`   - Material Complementario: ${productosMaterialComplementario.length} productos`);
  console.log(`   - Equipación Textil: ${productosEquipacionTextil.length} productos`);
  console.log(`\n📊 Total: ${productosMaterialEscolar.length + productosDeporteIndividual.length + productosDeportesColectivos.length + productosMaterialComplementario.length + productosEquipacionTextil.length} productos`);
  console.log('\n📝 Nota: Para poblar la base de datos completa, ejecuta: npm run seed:complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
