/**
 * Fase 1+2: reclasificar Miniland sin-clasificar
 * - material-escolar → visible_web true
 * - bebe / juguetes → categoría correcta, ocultos
 * - accesorios/repuestos → sin-clasificar, ocultos
 *
 * node --import tsx prisma/scripts/reclasificar-miniland-sin-clasificar.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const TXT = `lower(COALESCE(name, '') || ' ' || COALESCE(description, ''))`;

const SQL = `
UPDATE "Product" AS p
SET
  "categoryId" = CASE
    WHEN ${TXT} ~* 'rep\\\\.|repuesto|recambio|deposito.*recambio|tapa chefy|tapa \\+ pajita|rep\\\\. tapa|mascarilla.*nebulizador|humidrop|bateria digitalk|cuchilla.*chefy|jarra de coccion|cesta chefy|cesta para potito|base de biberon'
      THEN 'sin-clasificar'
    WHEN ${TXT} ~* 'munec|muñec|mun bb|baby doll|soft body doll|mordedor|mordedores|ropa de punto|expositor doll|display.*doll|canastilla para muneco|bol y cuchara|fiambrera infantil|botella infantil|kiddie|snackbox|almuerzo|merienda|blw|beb[eé]|lactancia|biberon|chupete|humidificador|termometro|vigilabebes|cuna|cambiador|nebulizador|cepillo de dientes infantil'
      THEN 'bebe'
    WHEN ${TXT} ~* 'geoplan|pentomino|pesas de|abaco|soroban|tarjetas learning|figuras ensartables|bandeja.*clasificacion|translucent math|pasta blanda|puzzle|puzle|encaj|apil|bloque|construc|didactico|educativo|matematic|numero|letra|aprendizaje|memoria|observacion|learning bits|learning sequences'
      THEN 'material-escolar'
    WHEN ${TXT} ~* 'figura|animal|dino|insect|granja|coche|vehiculo|tractor|camion|minimobil|juego|juguete'
      THEN 'juguetes'
    ELSE p."categoryId"
  END,
  subcategory = CASE
    WHEN ${TXT} ~* 'rep\\\\.|repuesto|recambio|tapa chefy|tapa \\+ pajita|humidrop|bateria digitalk|cuchilla.*chefy|jarra de coccion|cesta chefy|cesta para potito'
      THEN 'Accesorios y repuestos'
    WHEN ${TXT} ~* 'munec|muñec|baby doll|soft body doll|mordedor|beb[eé]|biberon|chupete|humidificador|blw|fiambrera|botella infantil|kiddie'
      THEN 'Puericultura'
    WHEN ${TXT} ~* 'pasta blanda|manualidad|pintura|plastilina|modelado|arte'
      THEN 'Manualidades'
    WHEN ${TXT} ~* 'geoplan|pentomino|pesas|abaco|soroban|tarjetas learning|figuras ensartables|translucent math|learning bits|learning sequences'
      THEN 'Juguetes Educativos'
    WHEN ${TXT} ~* 'didactico|educativo|matematic|numero|letra|aprendizaje'
      THEN 'Material Didáctico'
    WHEN ${TXT} ~* 'figura|animal|dino|insect|granja'
      THEN 'Figuras'
    WHEN ${TXT} ~* 'coche|vehiculo|tractor|camion|minimobil'
      THEN 'Vehiculos'
    WHEN ${TXT} ~* 'juego|juguete|puzzle|puzle|encaj|apil|bloque|construc'
      THEN 'Educativos'
    ELSE p.subcategory
  END,
  visible_web = CASE
    WHEN ${TXT} ~* 'geoplan|pentomino|pesas de|abaco|soroban|tarjetas learning|figuras ensartables|bandeja.*clasificacion|translucent math|pasta blanda|puzzle|puzle|encaj|apil|bloque|construc|didactico|educativo|matematic|numero|letra|aprendizaje|memoria|observacion|learning bits|learning sequences'
      THEN true
    ELSE false
  END,
  "updatedAt" = NOW()
WHERE LOWER(p.proveedor) = 'miniland'
  AND p."categoryId" = 'sin-clasificar'
RETURNING p."sku_interno", p."categoryId", p.subcategory, p.visible_web;
`;

async function main() {
  const before = await pool.query(`
    SELECT "categoryId", COUNT(*)::int AS n
    FROM "Product"
    WHERE LOWER(proveedor) = 'miniland' AND "categoryId" = 'sin-clasificar'
    GROUP BY 1
  `);
  console.log('Antes sin-clasificar:', before.rows[0]?.n ?? 0);

  const res = await pool.query(SQL);
  console.log('Productos reclasificados:', res.rowCount);

  const summary = await pool.query(`
    SELECT "categoryId", visible_web, COUNT(*)::int AS n
    FROM "Product"
    WHERE LOWER(proveedor) = 'miniland'
    GROUP BY 1, 2
    ORDER BY 1, 2 DESC
  `);
  console.log('\nResumen Miniland tras reclasificación:');
  console.table(summary.rows);

  const restantes = await pool.query(`
    SELECT COUNT(*)::int AS n FROM "Product"
    WHERE LOWER(proveedor) = 'miniland' AND "categoryId" = 'sin-clasificar'
  `);
  console.log('\nSin-clasificar restantes:', restantes.rows[0].n);

  const nuevosVisibles = await pool.query(`
    SELECT COUNT(*)::int AS n FROM "Product"
    WHERE LOWER(proveedor) = 'miniland' AND visible_web = true
  `);
  console.log('Total visibles en web:', nuevosVisibles.rows[0].n);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
