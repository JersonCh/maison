-- =============================================================================
-- MAISON DES PARFUMS - MIGRACIÓN 0004: ESTÁNDARES DE CATÁLOGO Y PRESENTACIONES
-- Motor: SQLite / Cloudflare D1
-- =============================================================================

-- 1. Diferenciación formal de tipos de presentación en variantes de producto
-- Permite distinguir de forma explícita frascos regulares de decants artesanales,
-- eliminando heurísticas frágiles basadas en el tamaño en mililitros.
ALTER TABLE variantes_producto ADD COLUMN tipo_presentacion TEXT NOT NULL DEFAULT 'frasco' 
    CHECK(tipo_presentacion IN ('frasco', 'decant'));

-- 2. Clasificar las variantes existentes de decants (3ml, 5ml, 10ml con SKU de decant)
UPDATE variantes_producto 
SET tipo_presentacion = 'decant' 
WHERE sku LIKE 'DEC-%' OR (tamano_ml IN (3, 5, 10) AND es_predeterminada = 0 AND tamano_ml < 30);

-- 3. Agregar columna para etiquetas comerciales y novedades a productos
-- Reemplaza reglas arbitrarias en código (ej. index < 4) por control de catálogo
ALTER TABLE productos ADD COLUMN etiqueta_destacada TEXT DEFAULT 'ninguna' 
    CHECK(etiqueta_destacada IN ('ninguna', 'nuevo', 'mas_vendido', 'edicion_limitada'));

-- 4. Índice para acelerar consultas por tipo de presentación
CREATE INDEX IF NOT EXISTS idx_variantes_tipo_presentacion ON variantes_producto(producto_id, tipo_presentacion);

