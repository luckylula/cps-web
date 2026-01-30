# Fix: Ropa Casual (textil) no aparecía en la web

## 1. Dónde se construye el listado

| Qué | Dónde |
|-----|--------|
| **Subcategorías visibles en /textil** | `app/[categoria]/page.tsx` → `getSubcategoriesForCategory(categoria)`. Solo se muestran subcategorías con `hasProducts === true` (count > 0). |
| **Conteo por subcategoría** | Mismo archivo: `prisma.product.count({ where: { categoryId, subcategory, visible_web, activo } })`. No usaba `published`. |
| **Categoría existe** | `getCategory(categoria)` → `prisma.category.findUnique({ where: { slug } })`. Si no existe → `notFound()` (404). |
| **Productos en subcategoría sin grupos** | `app/[categoria]/[subcategory]/page.tsx`: si `grupos.length === 0` solo se mostraba el mensaje "No hay grupos disponibles" y no se listaban productos. |
| **Productos API** | `app/api/products/route.ts`: where con `visible_web`, `activo`, filtro `sku_interno` (OR null / not endsWith '-BASE'). No filtra por `published`. |
| **Estructura / mega menú** | `app/api/categories/[slug]/structure/route.ts`: agrupa por `grupo`; subcategorías sin grupo quedan en "Sin clasificar". |

## 2. Filtros que excluían textil / Ropa Casual

### Causa 1: Category "textil" no existía en BD
- **Archivo:** `app/[categoria]/page.tsx`
- **Qué pasa:** `getCategory("textil")` hace `findUnique({ where: { slug: "textil" } })`. El seed solo crea `equipacion-textil`, no `textil`.
- **Efecto:** `category === null` → `notFound()` → 404 en `/textil`. Nunca se llega a pintar subcategorías ni productos.

### Causa 2: Subcategorías solo se muestran si tienen productos (count > 0)
- **Archivo:** `app/[categoria]/page.tsx`, `getSubcategoriesForCategory`
- **Filtro usado en el count:**  
  `where: { categoryId: categoriaSlug, subcategory: subcategoryName, visible_web: true, activo: true }`  
  No se usaba `published: true` (consistente con otros listados que sí lo usan en [grupo]).

### Causa 3: Subcategoría sin grupos (Ropa Casual) no mostraba productos
- **Archivo:** `app/[categoria]/[subcategory]/page.tsx`
- **Qué pasa:** Para "Ropa Casual", `navigationStructure` tiene `grupos: []`. `getGroupsForSubcategory` devuelve `[]`.
- **Efecto:** Se renderiza "No hay grupos disponibles en esta subcategoría" y no se hace ninguna query de productos por subcategoría. Aunque en BD haya productos con `subcategory = "Ropa Casual"`, no se listan.

### No era el problema
- No hay `where: { grupo: { not: null } }` en las rutas que definen subcategorías o listado de categoría/subcategoría.
- No hay `categoryId: "deportes"` hardcodeado para el listado de categorías.
- `app/api/products/route.ts` no exige variantes con price/stock; filtra por producto (sku_interno, visible_web, activo).

## 3. Cambios aplicados (mínimos)

1. **Asegurar que exista la categoría "textil" (y otras del nav):**  
   En `app/[categoria]/page.tsx` y `app/[categoria]/[subcategory]/page.tsx`, si `getCategory(slug)` devuelve `null` y el `slug` está en `navigationStructure`, se hace upsert de la categoría (id/slug/name desde `getCategoryName`) para no depender del seed.
2. **Incluir `published: true` en el count de subcategorías** en `getSubcategoriesForCategory` para alinearlo con [grupo] y metadata.
3. **Subcategoría sin grupos → listar productos:**  
   En `app/[categoria]/[subcategory]/page.tsx`, cuando `groups.length === 0`, se obtienen productos con `categoryId`, `subcategory`, `published`, `visible_web`, `activo` y el mismo filtro de `sku_interno` que en [grupo], y se muestran en grid con `ProductCard`.
4. **Logs temporales:**  
   `console.debug` en `getSubcategoriesForCategory` para categoria `textil` y subcategoría "Ropa Casual" (count antes/después).
5. **Script de verificación:**  
   `prisma/verify-textil-casual.ts` hace count de productos con `categoryId === "textil"`, `subcategory === "Ropa Casual"`, `published && visible_web` y opcionalmente por `ref_proveedor` de ejemplo.

## 4. Cómo comprobar

- Ejecutar: `npm run verify:textil-casual` (o `node --import tsx prisma/verify-textil-casual.ts`).
- Abrir `/textil`: debe cargar la categoría y verse "Ropa Casual" en el grid de subcategorías.
- Abrir `/textil/ropa-casual`: debe mostrarse el listado de productos de esa subcategoría.
