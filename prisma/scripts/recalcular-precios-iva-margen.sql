-- =============================================================================
-- RECALCULAR PRECIOS EN NEON — IVA antes del margen
-- =============================================================================
--
-- Fórmula correcta:
--   precioConIVA  = precioBase × 1.21
--   precioFinal   = precioConIVA × margenMultiplicador
--
-- Márgenes (según precio base SIN IVA):
--   < 50 €  → ×1.50
--   < 100 € → ×1.47
--   < 200 € → ×1.43
--   < 400 € → ×1.38
--   ≥ 400 € → ×1.30
--
-- Miniland: redondeo al alza a 0,50 € (CEIL(precio × 2) / 2)
-- Jim Sports / Made for Sport: redondeo a 2 decimales
--
-- SEGURO: solo UPDATE en "Product". No hay DELETE ni TRUNCATE.
-- Recomendación: ejecutar primero las consultas SELECT (pasos 1-3),
--                 revisar resultados, y luego el UPDATE (paso 4).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- PASO 0 — Ejemplos teóricos (sin tocar la BD)
-- -----------------------------------------------------------------------------
/*
  Precio base │ Margen │ ANTES (base × margen) │ DESPUÉS (base × 1.21 × margen)
  ------------│--------│-----------------------│--------------------------------
       30 €   │  1.50  │  45,00 €              │  54,45 €  (Miniland → 54,50 €)
       80 €   │  1.47  │ 117,60 €              │ 142,30 €
      150 €   │  1.43  │ 214,50 €              │ 259,55 €
      500 €   │  1.30  │ 650,00 €              │ 786,50 €
*/


-- -----------------------------------------------------------------------------
-- PASO 1 — Vista previa: ejemplos reales antes / después (20 por proveedor)
-- -----------------------------------------------------------------------------
WITH base AS (
  SELECT
    p.id,
    p.name,
    p.proveedor,
    p."sku_interno",
    p."precioBase"                          AS precio_base,
    p.price                                 AS precio_actual,
    CASE
      WHEN p."precioBase" <  50 THEN 1.50
      WHEN p."precioBase" < 100 THEN 1.47
      WHEN p."precioBase" < 200 THEN 1.43
      WHEN p."precioBase" < 400 THEN 1.38
      ELSE 1.30
    END                                     AS margen,
    ROUND((p."precioBase" * 1.21)::numeric, 2) AS precio_con_iva
  FROM "Product" p
  WHERE p."precioBase" IS NOT NULL
    AND p."precioBase" > 0
),
calculado AS (
  SELECT
    b.*,
    ROUND((b.precio_base * b.margen)::numeric, 2) AS precio_incorrecto,
    CASE
      WHEN LOWER(COALESCE(b.proveedor, '')) = 'miniland' THEN
        CEIL((b.precio_con_iva * b.margen)::numeric * 2) / 2
      ELSE
        ROUND((b.precio_con_iva * b.margen)::numeric, 2)
    END AS precio_nuevo
  FROM base b
),
ranked AS (
  SELECT
    c.*,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(c.proveedor, '(sin proveedor)')
      ORDER BY c.precio_base
    ) AS rn
  FROM calculado c
  WHERE c.precio_actual IS DISTINCT FROM c.precio_nuevo
)
SELECT
  proveedor,
  "sku_interno",
  LEFT(name, 50)              AS nombre,
  precio_base,
  margen,
  precio_con_iva,
  precio_actual               AS precio_antes,
  precio_incorrecto           AS formula_vieja,
  precio_nuevo                AS precio_despues,
  precio_nuevo - precio_actual AS diferencia
FROM ranked
WHERE rn <= 20
ORDER BY proveedor, precio_base;


-- -----------------------------------------------------------------------------
-- PASO 2 — Resumen por proveedor (cuántos productos cambiarían)
-- -----------------------------------------------------------------------------
WITH calculado AS (
  SELECT
    p.id,
    p.proveedor,
    p.price AS precio_actual,
    CASE
      WHEN LOWER(COALESCE(p.proveedor, '')) = 'miniland' THEN
        CEIL((
          p."precioBase" * 1.21 *
          CASE
            WHEN p."precioBase" <  50 THEN 1.50
            WHEN p."precioBase" < 100 THEN 1.47
            WHEN p."precioBase" < 200 THEN 1.43
            WHEN p."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric * 2) / 2
      ELSE
        ROUND((
          p."precioBase" * 1.21 *
          CASE
            WHEN p."precioBase" <  50 THEN 1.50
            WHEN p."precioBase" < 100 THEN 1.47
            WHEN p."precioBase" < 200 THEN 1.43
            WHEN p."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric, 2)
    END AS precio_nuevo
  FROM "Product" p
  WHERE p."precioBase" IS NOT NULL
    AND p."precioBase" > 0
)
SELECT
  COALESCE(proveedor, '(sin proveedor)')     AS proveedor,
  COUNT(*)                                     AS total_con_precio_base,
  COUNT(*) FILTER (WHERE precio_actual IS DISTINCT FROM precio_nuevo)
                                               AS productos_a_actualizar,
  COUNT(*) FILTER (WHERE precio_actual IS NOT DISTINCT FROM precio_nuevo)
                                               AS ya_correctos,
  ROUND(AVG(precio_actual)::numeric, 2)       AS precio_medio_antes,
  ROUND(AVG(precio_nuevo)::numeric, 2)         AS precio_medio_despues
FROM calculado
GROUP BY proveedor
ORDER BY proveedor;


-- -----------------------------------------------------------------------------
-- PASO 3 — Muestra global rápida (totales)
-- -----------------------------------------------------------------------------
WITH calculado AS (
  SELECT
    p.price AS precio_actual,
    CASE
      WHEN LOWER(COALESCE(p.proveedor, '')) = 'miniland' THEN
        CEIL((
          p."precioBase" * 1.21 *
          CASE
            WHEN p."precioBase" <  50 THEN 1.50
            WHEN p."precioBase" < 100 THEN 1.47
            WHEN p."precioBase" < 200 THEN 1.43
            WHEN p."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric * 2) / 2
      ELSE
        ROUND((
          p."precioBase" * 1.21 *
          CASE
            WHEN p."precioBase" <  50 THEN 1.50
            WHEN p."precioBase" < 100 THEN 1.47
            WHEN p."precioBase" < 200 THEN 1.43
            WHEN p."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric, 2)
    END AS precio_nuevo
  FROM "Product" p
  WHERE p."precioBase" IS NOT NULL
    AND p."precioBase" > 0
)
SELECT
  COUNT(*)                                                     AS total_productos,
  COUNT(*) FILTER (WHERE precio_actual IS DISTINCT FROM precio_nuevo)
                                                               AS a_actualizar,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE precio_actual IS DISTINCT FROM precio_nuevo)
    / NULLIF(COUNT(*), 0),
    1
  )                                                            AS pct_cambio
FROM calculado;


-- =============================================================================
-- PASO 4 — UPDATE (ejecutar solo tras revisar pasos 1-3)
-- =============================================================================
-- Descomenta el bloque completo (BEGIN … COMMIT) para aplicar los cambios.
-- Si algo no cuadra: usa ROLLBACK en lugar de COMMIT.

/*
BEGIN;

UPDATE "Product" AS p
SET
  price      = c.precio_nuevo,
  "updatedAt" = NOW()
FROM (
  SELECT
    p2.id,
    CASE
      WHEN LOWER(COALESCE(p2.proveedor, '')) = 'miniland' THEN
        CEIL((
          p2."precioBase" * 1.21 *
          CASE
            WHEN p2."precioBase" <  50 THEN 1.50
            WHEN p2."precioBase" < 100 THEN 1.47
            WHEN p2."precioBase" < 200 THEN 1.43
            WHEN p2."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric * 2) / 2
      ELSE
        ROUND((
          p2."precioBase" * 1.21 *
          CASE
            WHEN p2."precioBase" <  50 THEN 1.50
            WHEN p2."precioBase" < 100 THEN 1.47
            WHEN p2."precioBase" < 200 THEN 1.43
            WHEN p2."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric, 2)
    END AS precio_nuevo
  FROM "Product" p2
  WHERE p2."precioBase" IS NOT NULL
    AND p2."precioBase" > 0
) AS c
WHERE p.id = c.id
  AND p.price IS DISTINCT FROM c.precio_nuevo;

COMMIT;
*/


-- -----------------------------------------------------------------------------
-- PASO 5 — Verificación post-UPDATE (opcional)
-- -----------------------------------------------------------------------------
/*
WITH ok AS (
  SELECT
    p.id,
    p.proveedor,
    p."precioBase",
    p.price,
    CASE
      WHEN LOWER(COALESCE(p.proveedor, '')) = 'miniland' THEN
        CEIL((
          p."precioBase" * 1.21 *
          CASE
            WHEN p."precioBase" <  50 THEN 1.50
            WHEN p."precioBase" < 100 THEN 1.47
            WHEN p."precioBase" < 200 THEN 1.43
            WHEN p."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric * 2) / 2
      ELSE
        ROUND((
          p."precioBase" * 1.21 *
          CASE
            WHEN p."precioBase" <  50 THEN 1.50
            WHEN p."precioBase" < 100 THEN 1.47
            WHEN p."precioBase" < 200 THEN 1.43
            WHEN p."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric, 2)
    END AS esperado
  FROM "Product" p
  WHERE p."precioBase" IS NOT NULL AND p."precioBase" > 0
)
SELECT COUNT(*) AS productos_con_precio_incorrecto
FROM ok
WHERE price IS DISTINCT FROM esperado;
-- Resultado esperado: 0
*/
