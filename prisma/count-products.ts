import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { prisma } from '../lib/prisma';

async function main() {
  const total = await prisma.product.count();
  const published = await prisma.product.count({ where: { published: true } });
  const visible = await prisma.product.count({
    where: { visible_web: true, activo: true },
  });
  console.log('Total products:', total);
  console.log('Published:', published);
  console.log('Visible (visible_web + activo):', visible);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
