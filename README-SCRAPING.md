# Guía de Scraping y Actualización de Base de Datos

Este documento explica cómo realizar una actualización profunda de la base de datos extrayendo productos de la web antigua.

## Proceso Completo

### Paso 1: Ejecutar el Scraping

El script de scraping extrae todos los productos de la web antigua (`https://www.cpsmaterialdeportivo.com/`) y los guarda en un archivo JSON.

```bash
npm run scrape
```

Este comando:
- Navega por todas las categorías principales
- Extrae información de cada producto:
  - Nombre
  - Precio (con y sin IVA calculado)
  - Descripción completa
  - Imágenes (URLs de alta calidad)
  - Variantes (color, talla, medidas) si existen
  - Productos relacionados
  - Categoría y subcategoría
- Guarda todos los datos en `scraped-products.json`

**Nota:** El proceso puede tardar varios minutos dependiendo del número de productos.

### Paso 2: Actualizar la Base de Datos

Una vez completado el scraping, ejecuta el seed final para actualizar la base de datos:

```bash
npm run seed:final
```

Este comando:
1. **Limpia productos de prueba**: Elimina productos que contengan palabras como 'joe biden', 'popo', 'xxxxx', 'soy la mejor', etc.
2. **Lee el archivo JSON** generado por el scraping
3. **Crea/actualiza categorías** necesarias
4. **Procesa cada producto**:
   - Genera slugs únicos automáticamente
   - Usa `upsert` para no duplicar productos (actualiza si existe, crea si no)
   - Asigna categorías y subcategorías correctamente
   - Publica todos los productos extraídos (`published: true`)
5. **Muestra un resumen completo**:
   - Productos creados
   - Productos actualizados
   - Productos omitidos (con errores)
   - Errores encontrados (si los hay)

## Estructura de Datos Extraídos

Cada producto incluye:

```typescript
{
  name: string;              // Nombre del producto
  slug: string;              // Slug único generado
  price: number;             // Precio con IVA
  priceWithoutIVA?: number;  // Precio sin IVA (calculado)
  description: string;       // Descripción completa
  images: string[];          // Array de URLs de imágenes
  category: string;         // Slug de categoría
  subcategory?: string;      // Nombre de subcategoría
  variants?: {              // Variantes del producto
    color?: string[];
    size?: string[];
    measures?: string[];
  };
  relatedProducts?: string[]; // Slugs de productos relacionados
  stock?: number;            // Stock (si está disponible)
}
```

## Características Especiales

### Generación de Slugs Únicos
- Los slugs se generan automáticamente desde el nombre del producto
- Si un slug ya existe, se añade un sufijo numérico (`-1`, `-2`, etc.)
- Garantiza que no haya duplicados

### Manejo de Variantes
- Si un producto tiene variantes (color, talla, medidas), se guardan en la descripción
- Las variantes se pueden extraer posteriormente para gestión avanzada
- Se muestran en la descripción como texto legible

### Limpieza Automática
- Elimina productos de prueba automáticamente
- Busca palabras clave en los nombres de productos
- No afecta a productos reales

### Actualización Inteligente
- Usa `upsert` para evitar duplicados
- Actualiza productos existentes si el slug coincide
- Crea nuevos productos si no existen

## Solución de Problemas

### Error: "No se puede leer scraped-products.json"
- Asegúrate de ejecutar `npm run scrape` primero
- Verifica que el archivo se haya generado correctamente

### Error: "Categoría no encontrada"
- El script crea automáticamente las categorías principales
- Si falta una subcategoría, se puede añadir manualmente al mapeo

### Productos sin precio
- Algunos productos pueden no tener precio visible en la web
- Se guardan con precio 0 y se pueden actualizar manualmente después

### Imágenes no encontradas
- Si un producto no tiene imágenes, se guarda con array vacío
- Se pueden añadir manualmente después

## Notas Importantes

1. **Tiempo de ejecución**: El scraping puede tardar 30-60 minutos dependiendo del número de productos
2. **Rate limiting**: El script incluye pausas entre requests para no sobrecargar el servidor
3. **Datos incompletos**: Algunos productos pueden tener datos incompletos (precio, imágenes, etc.)
4. **Revisión manual**: Se recomienda revisar los productos después del seed para verificar datos críticos

## Comandos Disponibles

- `npm run scrape` - Ejecuta el scraping de productos
- `npm run seed:final` - Actualiza la base de datos con productos extraídos
- `npm run seed` - Seed básico (no usar para actualización masiva)
- `npm run seed:complete` - Seed completo con datos de prueba
