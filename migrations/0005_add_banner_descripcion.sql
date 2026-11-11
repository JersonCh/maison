-- Migración 0005: Agregar columna descripción a la tabla banners para textos editoriales del Hero
ALTER TABLE banners ADD COLUMN descripcion TEXT;

-- Actualizar descripciones por defecto de las diapositivas del Hero Home
UPDATE banners
SET descripcion = 'Descubre aromas que trascienden el tiempo y convierten tu esencia en una firma inolvidable.'
WHERE ubicacion = 'hero_home' AND descripcion IS NULL;

