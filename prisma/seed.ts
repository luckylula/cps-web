import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Crear categorías
  const futbol = await prisma.category.create({
    data: {
      name: 'Fútbol',
      slug: 'futbol',
      description: 'Equipamiento completo para fútbol',
    },
  });

  const baloncesto = await prisma.category.create({
    data: {
      name: 'Baloncesto',
      slug: 'baloncesto',
      description: 'Todo para baloncesto',
    },
  });

  const running = await prisma.category.create({
    data: {
      name: 'Running',
      slug: 'running',
      description: 'Calzado y ropa para correr',
    },
  });

  // Crear productos
  await prisma.product.createMany({
    data: [
      {
        name: 'Balón Nike Strike',
        slug: 'balon-nike-strike',
        description: 'Balón oficial de fútbol Nike Strike. Perfecto para entrenamientos y partidos.',
        price: 24.99,
        stock: 50,
        categoryId: futbol.id,
        published: true,
        featured: true,
        images: ['https://placehold.co/400x400/4F46E5/FFFFFF/png?text=Balon+Nike'],
      },
      {
        name: 'Zapatillas Adidas Ultraboost',
        slug: 'zapatillas-adidas-ultraboost',
        description: 'Zapatillas de running Adidas Ultraboost. Máxima comodidad y rendimiento.',
        price: 149.99,
        stock: 30,
        categoryId: running.id,
        published: true,
        featured: true,
        images: ['https://placehold.co/400x400/059669/FFFFFF/png?text=Ultraboost'],
      },
      {
        name: 'Balón Spalding NBA',
        slug: 'balon-spalding-nba',
        description: 'Balón oficial NBA Spalding. Tamaño reglamentario.',
        price: 39.99,
        stock: 25,
        categoryId: baloncesto.id,
        published: true,
        featured: false,
        images: ['https://placehold.co/400x400/DC2626/FFFFFF/png?text=NBA'],
      },
    ],
  });

  console.log('✅ Seed completado: 3 categorías y 3 productos creados');
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