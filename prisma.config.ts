import path from 'node:path';
import { config } from 'dotenv';

// Cargar .env y .env.local desde la raíz del proyecto (por si el cwd no es el esperado)
const root = process.cwd();
config({ path: path.join(root, '.env') });
config({ path: path.join(root, '.env.local') });

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: env('DATABASE_URL')
  }
});