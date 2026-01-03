# Base de Datos de Productos CPS Material Deportivo

Este proyecto incluye una base de datos completa con todos los productos extraídos del sitio web original [cpsmaterialdeportivo.com](https://www.cpsmaterialdeportivo.com/).

## Estructura de la Base de Datos

La base de datos utiliza Prisma ORM con PostgreSQL y está organizada en las siguientes categorías principales:

### 1. Material Escolar
- **Psicomotricidad** (40 productos)
- **Figuras espuma** (22 productos)
- **Balones de uso escolar** (28 productos)
- **Juegos alternativos** (23 productos)
- **Juegos en Educación infantil** (6 productos)
- **Malabares** (6 productos)
- **Material foam** (28 productos)
- **Colchonetas** (16 productos)
- **Educación musical** (28 productos)

### 2. Deporte Individual
- **Tenis de Mesa** (9 productos)
- **Tenis** (19 productos)
- **Padel** (5 productos)
- **Badminton** (10 productos)
- **Atletismo** (16 productos)
- **Gimnasia Rítmica** (12 productos)
- **Piscina** (28 productos)
- **Yoga** (14 productos)
- **Pilates** (9 productos)

### 3. Deportes Colectivos
- **Fútbol / Fútbol Sala** (17 productos)
- **Baloncesto** (11 productos)
- **Balonmano** (9 productos)
- **Voleibol / Voley Playa** (13 productos)
- **Waterpolo** (8 productos)
- **Rugby** (9 productos)
- **Hockey** (11 productos)
- **Béisbol** (12 productos)

### 4. Material Deportivo Complementario
- **Complemento de balones** (19 productos)
- **Balones medicinales** (3 productos)
- **Material Entrenamiento** (19 productos)
- **Preparación física** (20 productos)
- **Material Polivalente** (8 productos)

### 5. Equipación Textil
- **Equipación Textil** (6 productos con variantes de precio según cantidad)

## Instalación y Uso

### Requisitos Previos
- PostgreSQL instalado y configurado
- Variables de entorno configuradas (`.env` con `DATABASE_URL`)

### Ejecutar el Seed Completo

Para poblar la base de datos con todos los productos:

```bash
npm run seed:complete
```

Este comando creará:
- Todas las categorías principales y subcategorías
- Todos los productos extraídos del sitio web original
- Relaciones entre productos y categorías

### Ejecutar el Seed Básico

Para un seed básico con datos de ejemplo:

```bash
npm run seed
```

## Esquema de la Base de Datos

### Modelo Category
```prisma
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  image       String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Modelo Product
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  images      String[]
  stock       Int      @default(0)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  published   Boolean  @default(false)
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Notas Importantes

1. **Precios**: Los productos se crean con precio 0 inicialmente. Los precios deben actualizarse según el catálogo oficial.

2. **Stock**: El stock inicial es 0. Debe actualizarse según el inventario real.

3. **Imágenes**: Las imágenes se inicializan como arrays vacíos. Deben agregarse las URLs de las imágenes reales.

4. **Slugs**: Los slugs se generan automáticamente a partir de los nombres de los productos, normalizando caracteres especiales y espacios.

5. **Equipación Textil**: Los productos de equipación textil tienen precios variables según la cantidad (50, 100, 200, 500 unidades). Esto debe manejarse en la lógica de negocio de la aplicación.

## Actualización de Datos

Para actualizar los productos desde el sitio web original:

1. Navegar a cada página de categoría en [cpsmaterialdeportivo.com](https://www.cpsmaterialdeportivo.com/)
2. Extraer los nuevos productos
3. Actualizar el archivo `prisma/seed-complete.ts`
4. Ejecutar `npm run seed:complete` (considerar usar `skipDuplicates: true` para no duplicar)

## Estadísticas

- **Total de categorías principales**: 5
- **Total de subcategorías**: 33
- **Total de productos**: ~500+ productos

Todos los productos han sido extraídos directamente del sitio web oficial para garantizar la precisión y completitud de los datos.
