/**
 * Revisión productos Miniland sin-clasificar
 * node --import tsx prisma/scripts/revision-miniland-sin-clasificar.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function main() {
  const total = await pool.query(`
    SELECT COUNT(*)::int AS n FROM "Product"
    WHERE LOWER(proveedor) = 'miniland' AND "categoryId" = 'sin-clasificar'
  `);
  console.log('=== Miniland sin-clasificar ===\n');
  console.log('Total:', total.rows[0].n, '\n');

  const muestras = await pool.query(`
    SELECT "sku_interno", LEFT(name, 55) AS name, LEFT(description, 80) AS desc_corta,
      subcategory, "precioBase"::float AS base, price::float AS price
    FROM "Product"
    WHERE LOWER(proveedor) = 'miniland' AND "categoryId" = 'sin-clasificar'
    ORDER BY RANDOM()
    LIMIT 25
  `);
  console.log('Muestra aleatoria (25):');
  console.table(muestras.rows);

  const keywords = await pool.query(`
    WITH p AS (
      SELECT lower(name || ' ' || COALESCE(description, '')) AS txt
      FROM "Product"
      WHERE LOWER(proveedor) = 'miniland' AND "categoryId" = 'sin-clasificar'
    )
    SELECT pat AS patron, COUNT(*)::int AS n FROM (
      SELECT CASE
        WHEN txt ~* 'muñec|doll|beb[eé]|biber|chupet|lactanc|humidific|termomet|vigilab|pañal|cuna|cambiador' THEN '01_puericultura_bebe'
        WHEN txt ~* 'puzzle|puzle|encaj|apil|bloque|construc|lego|geom|matemat|numero|letra|abaco|calcul' THEN '02_didactico_material_escolar'
        WHEN txt ~* 'figura|animal|dino|insect|granja|personaje' THEN '03_figuras_juego'
        WHEN txt ~* 'coche|vehiculo|camion|tractor|minimobil|garaje' THEN '04_vehiculos_juego'
        WHEN txt ~* 'pintura|plastilina|modelado|manualidad|arte|pasta blanda|arcilla' THEN '05_manualidades'
        WHEN txt ~* 'musica|instrument|xilof|maraca|piano' THEN '06_musica'
        WHEN txt ~* 'sensorial|psicomotric|equilibrio|coordin' THEN '07_psicomotricidad'
        WHEN txt ~* 'juego|juguete|ludico' THEN '08_juego_generico'
        WHEN txt ~* 'mochila|bolsa|accesorio|repuesto|recambio|tapa|pajita|base de' THEN '09_accesorio_repuesto'
        ELSE '10_otros_sin_patron_claro'
      END AS pat
      FROM p
    ) x
    GROUP BY 1 ORDER BY 1
  `);
  console.log('\nPatrones detectados en nombre+descripción:');
  console.table(keywords.rows);

  const propuesta = await pool.query(`
    WITH p AS (
      SELECT id, "sku_interno", name,
        lower(name || ' ' || COALESCE(description, '')) AS txt
      FROM "Product"
      WHERE LOWER(proveedor) = 'miniland' AND "categoryId" = 'sin-clasificar'
    ),
    clas AS (
      SELECT *,
        CASE
          WHEN txt ~* 'muñec|doll|beb[eé]|biber|chupet|lactanc|humidific|termomet|vigilab|pañal|cuna|cambiador' THEN 'bebe'
          WHEN txt ~* 'puzzle|puzle|encaj|apil|bloque|construc|lego|geom|matemat|numero|letra|abaco|calcul|didact|aprendiz|observacion|memoria|tarjeta' THEN 'material-escolar'
          WHEN txt ~* 'figura|animal|dino|insect|granja|personaje|coche|vehiculo|camion|tractor|minimobil|garaje|juego|juguete' THEN 'juguetes'
          WHEN txt ~* 'pintura|plastilina|modelado|manualidad|arte|pasta blanda|arcilla' THEN 'material-escolar'
          WHEN txt ~* 'musica|instrument|xilof|maraca|piano|sensorial|psicomotric|equilibrio|coordin' THEN 'material-escolar'
          WHEN txt ~* 'mochila|bolsa|accesorio|repuesto|recambio|tapa|pajita|base de' THEN 'excluir_accesorio'
          ELSE NULL
        END AS cat_propuesta,
        CASE
          WHEN txt ~* 'puzzle|puzle|encaj|apil|bloque|construc|memoria|tarjeta|abaco|calcul|geom|matemat' THEN 'Juguetes Educativos'
          WHEN txt ~* 'pintura|plastilina|modelado|manualidad|arte|pasta blanda|arcilla' THEN 'Manualidades'
          WHEN txt ~* 'musica|instrument|xilof|maraca|piano' THEN 'Material Didáctico'
          WHEN txt ~* 'sensorial|psicomotric|equilibrio|coordin' THEN 'Psicomotricidad'
          WHEN txt ~* 'figura|animal|dino|insect' THEN 'Figuras'
          WHEN txt ~* 'coche|vehiculo|camion|tractor|minimobil' THEN 'Vehiculos'
          WHEN txt ~* 'beb[eé]|biber|chupet|lactanc|humidific' THEN 'Puericultura'
          ELSE 'Miniland pendiente'
        END AS sub_propuesta
      FROM p
    )
    SELECT
      COALESCE(cat_propuesta, 'sin_propuesta') AS categoria,
      COUNT(*)::int AS n
    FROM clas
    GROUP BY 1 ORDER BY n DESC
  `);
  console.log('\nPropuesta auto-reclasificación:');
  console.table(propuesta.rows);

  const ejemplos = await pool.query(`
    WITH p AS (
      SELECT "sku_interno", LEFT(name, 50) AS name,
        lower(name || ' ' || COALESCE(description, '')) AS txt
      FROM "Product"
      WHERE LOWER(proveedor) = 'miniland' AND "categoryId" = 'sin-clasificar'
    )
    SELECT "sku_interno", name,
      CASE
        WHEN txt ~* 'puzzle|puzle|encaj|apil|bloque|construc|geom|matemat|abaco|calcul|memoria|tarjeta' THEN 'material-escolar → Juguetes Educativos'
        WHEN txt ~* 'pintura|plastilina|manualidad|pasta blanda|arcilla' THEN 'material-escolar → Manualidades'
        WHEN txt ~* 'musica|instrument|xilof|maraca' THEN 'material-escolar → Material Didáctico'
        WHEN txt ~* 'sensorial|psicomotric|equilibrio' THEN 'material-escolar → Psicomotricidad'
        WHEN txt ~* 'muñec|doll|beb[eé]|biber|chupet|humidific' THEN 'bebe (oculto)'
        WHEN txt ~* 'figura|animal|dino|coche|vehiculo|juego|juguete' THEN 'juguetes (oculto)'
        WHEN txt ~* 'repuesto|recambio|tapa|pajita|base de|accesorio' THEN 'accesorio/repuesto (¿excluir?)'
        ELSE 'revisar manual'
      END AS propuesta
    FROM p
    ORDER BY propuesta, name
    LIMIT 40
  `);
  console.log('\nEjemplos con propuesta (40):');
  console.table(ejemplos.rows);

  const precios = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE COALESCE("precioBase",0)=0 OR COALESCE(price,0)=0)::int AS sin_precio,
      COUNT(*) FILTER (WHERE COALESCE("precioBase",0)>0)::int AS con_precio
    FROM "Product"
    WHERE LOWER(proveedor)='miniland' AND "categoryId"='sin-clasificar'
  `);
  console.log('\nCon/sin precio:', precios.rows[0]);

  const mat = await pool.query(`
    SELECT "sku_interno", LEFT(name,55) AS name, "precioBase"::float AS base
    FROM "Product"
    WHERE LOWER(proveedor)='miniland' AND "categoryId"='sin-clasificar'
      AND lower(name||' '||COALESCE(description,'')) ~* 'puzzle|puzle|encaj|apil|bloque|construc|geom|matemat|abaco|calcul|memoria|tarjeta|pentomino|geoplan|pesas|figuras ensart|pasta blanda|manualidad|bandeja|clasificacion'
    ORDER BY name
  `);
  console.log('\nCandidatos material-escolar (' + mat.rows.length + '):');
  console.table(mat.rows);

  await pool.end();
}

main();
