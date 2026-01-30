# Fix: Ropa Casual (textil) no aparecía en la web

## Causa raíz

1. **Menú/subcategorías no venían de Product:** El listado de subcategorías se construía desde `navigationStructure` (estático) y solo se mostraban las que tenían `count > 0` con un count que no usaba `published`. La fuente de verdad debe ser **Product** (categoryId + subcategory con published y visible_web).
2. **Category "textil" no existía en BD:** El seed crea `equipacion-textil`, no `textil`, por lo que `/textil` devolvía 404.
3. **Subcategorías sin grupos no listaban productos:** En "Ropa Casual" (grupos: []), la página solo mostraba "No hay grupos disponibles" y no hacía query de productos por subcategoría.

## Dónde Next construye todo

| Qué | Dónde |
|-----|--------|
| **Menú / listado de categorías** | `app/components/Navigation.tsx` → `MultiLevelNav` con `navigationStructure`. Las subcategorías visibles en cada categoría vienen de `getSubcategoriesForCategory` (ahora desde `getCategoryTree`). |
| **Subcategorías por categoría** | `app/[categoria]/page.tsx` → `getSubcategoriesForCategory()` → ahora usa **getCategoryTree(categoria)** (Product con published, visible_web, subcategory no nula). Fallback a nav estático + count. |
| **Árbol de categorías (fuente de verdad)** | `app/lib/categoryTree.ts` → **getCategoryTree(categoryId?)**. Query: `Product` con `published=true`, `visible_web=true`, `subcategory` no nula/vacía; DISTINCT (categoryId, subcategory); orden alfabético. |
| **API árbol** | `app/api/categories/tree/route.ts` → GET `?categoryId=textil` devuelve `{ categoryId, subcategories: { name, slug }[] }`. |
| **Página por categoría** | `app/[categoria]/page.tsx` → getCategory (con getOrCreateCategory para nav), getSubcategoriesForCategory (getCategoryTree + fallback). |
| **Página por subcategoría** | `app/[categoria]/[subcategory]/page.tsx` → Filtro: `categoryId`, `subcategory` (nombre resuelto desde slug vía mapping o getSubcategoryNameFromSlug), `published`, `visible_web`, `activo`. |
| **Queries Prisma productos** | `app/api/products/route.ts`, `app/api/categories/[slug]/products/route.ts`, `app/[categoria]/page.tsx` (getProducts), `app/[categoria]/[subcategory]/page.tsx` (getProductsForSubcategory): todos usan **published=true**, **visible_web=true** (y activo, name, sku_interno según ruta). |

## Cambios aplicados

1. **getCategoryTree()** en `app/lib/categoryTree.ts`: árbol desde Product (published, visible_web, subcategory no nula/vacía). `normalizeSubcategorySlug("Ropa Casual")` → `"ropa-casual"`. Logging temporal para textil/Ropa Casual.
2. **getSubcategoryNameFromSlug(categoryId, slug)** en el mismo archivo: resuelve slug a nombre (mapping estático primero; si no, busca en Product).
3. **API GET /api/categories/tree?categoryId=textil** en `app/api/categories/tree/route.ts`.
4. **app/[categoria]/page.tsx**: Subcategorías desde **getCategoryTree(categoria)**; si vacío, fallback a nav + count. Queries getProducts y getFilterOptions y productCount con **published: true**.
5. **app/[categoria]/[subcategory]/page.tsx**: Nombre de subcategoría con **getSubcategoryNameFromSlug** si el mapping no devuelve nada. Logging temporal para (textil, Ropa Casual) en getProductsForSubcategory.
6. **app/api/products/route.ts** y **app/api/categories/[slug]/products/route.ts** y **app/api/categories/[slug]/subcategories/route.ts**: añadido **published: true** en el where.
7. **Script de verificación:** `npm run verify:textil-casual` (prisma/verify-textil-casual.ts).

## Normalización de slugs

- **normalizeSubcategorySlug(name):** "Ropa Casual" → "ropa-casual" (minúsculas, espacios → guiones, sin acentos). No se modifican slugs existentes en Product; solo se usan para URLs y para resolver desde el árbol.

## Verificación (2–3 pasos)

1. **En local: menú incluye Textil > Ropa Casual**  
   - Ir a la home, abrir el menú de navegación y pasar por "Textil".  
   - Debe aparecer "Ropa Casual" (y el resto de subcategorías con productos).  
   - Opcional: `GET /api/categories/tree?categoryId=textil` debe devolver `subcategories` con `{ name: "Ropa Casual", slug: "ropa-casual" }`.

2. **En local: ruta /textil/ropa-casual muestra productos**  
   - Ir a `/textil` y hacer clic en "Ropa Casual", o ir directamente a `/textil/ropa-casual`.  
   - Debe mostrarse el listado de productos con `categoryId='textil'`, `subcategory='Ropa Casual'`, `published=true`, `visible_web=true`.  
   - En consola del servidor (dev) deberían aparecer logs tipo `[getCategoryTree] textil subcategories: N` y `[getProductsForSubcategory] textil / Ropa Casual products count: N`.

3. **Query equivalente en BD**  
   - Ejecutar (o usar `npm run verify:textil-casual`):  
     `SELECT COUNT(*) FROM "Product" WHERE proveedor='jim_sports' AND "categoryId"='textil' AND subcategory='Ropa Casual' AND published=true AND visible_web=true;`  
   - El número debe coincidir con los productos que se ven en `/textil/ropa-casual`.

## Archivos modificados

- `app/lib/categoryTree.ts` (nuevo)
- `app/api/categories/tree/route.ts` (nuevo)
- `app/[categoria]/page.tsx`
- `app/[categoria]/[subcategory]/page.tsx`
- `app/api/products/route.ts`
- `app/api/categories/[slug]/products/route.ts`
- `app/api/categories/[slug]/subcategories/route.ts`
- `docs/TEXTIL-ROPA-CASUAL-FIX.md` (este archivo)
