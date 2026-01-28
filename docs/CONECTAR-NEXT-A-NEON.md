# Cómo conectar Next.js a Neon (PostgreSQL)

Tu proyecto **cps_web** ya está preparado para usar PostgreSQL con Prisma. Para usar **Neon** solo necesitas la URL de conexión correcta.

## 1. Obtener la URL de Neon

1. Entra en [Neon](https://neon.tech) y inicia sesión.
2. Abre tu proyecto (o crea uno nuevo).
3. En el panel, ve a **Dashboard** → tu proyecto → **Connection details**.
4. Copia la **Connection string**. Suele tener esta forma:
   ```
   postgresql://usuario:contraseña@ep-xxxxx-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Para **Vercel / serverless**, usa la opción **Pooled connection** si Neon la ofrece (menos conexiones y mejor para serverless).

## 2. Configurar la variable en Next.js

### Local (desarrollo)

Crea o edita el archivo **`.env.local`** en la raíz del proyecto (junto a `package.json`):

```env
DATABASE_URL="postgresql://usuario:contraseña@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"
```

- Sustituye por tu connection string real.
- Es importante **`?sslmode=require`** para Neon.

### Producción (Vercel)

1. Vercel → tu proyecto **cps_web** → **Settings** → **Environment Variables**.
2. Añade (o edita) la variable:
   - **Name:** `DATABASE_URL`
   - **Value:** la misma connection string de Neon.
3. Marca **Production**, **Preview** y **Development** si quieres usarla en todos los entornos.
4. Guarda y haz un **Redeploy** para que los cambios apliquen.

## 3. Cómo lo usa tu proyecto

Tu app ya está conectada a la base de datos a través de:

| Archivo        | Uso |
|----------------|-----|
| `lib/prisma.ts` | Crea el cliente Prisma usando `DATABASE_URL` y el driver `pg` con el adaptador de Prisma para PostgreSQL. |
| `prisma/schema.prisma` | Define el `datasource` con `provider = "postgresql"` (sin URL en el schema; la URL se lee de `.env`). |

Prisma carga `DATABASE_URL` desde el entorno (`.env`, `.env.local`, o variables de Vercel). No hace falta cambiar código: **solo hace falta que `DATABASE_URL` apunte a tu base de datos en Neon**.

## 4. Comprobar la conexión

Desde la raíz del proyecto:

```bash
npm run verify:db
```

Si tienes el script configurado, verás si la conexión funciona y datos de ejemplo (productos, categorías). Si no, puedes probar con:

```bash
npx prisma db pull
```

(Con `DATABASE_URL` ya en `.env.local`). Si conecta, verás el schema sin errores.

## 5. Resumen

| Paso | Acción |
|------|--------|
| 1 | Obtener la **connection string** en el dashboard de Neon. |
| 2 | Ponerla en **`.env.local`** como `DATABASE_URL="..."`. |
| 3 | En **Vercel**, añadir la misma `DATABASE_URL` en Environment Variables y redeploy. |
| 4 | Opcional: ejecutar `npm run verify:db` o `npx prisma db pull` para verificar. |

No necesitas instalar nada extra: **Prisma + `pg` + `DATABASE_URL` de Neon** es suficiente para conectar Next.js a Neon.
