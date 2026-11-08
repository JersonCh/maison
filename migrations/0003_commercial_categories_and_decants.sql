-- =============================================================================
-- MAISON DES PARFUMS - MIGRACIÓN 0003: CATEGORÍAS COMERCIALES Y DECANTS
-- Motor: SQLite / Cloudflare D1
-- =============================================================================

-- 1. Agregar columna de clasificación a marcas (con valor por defecto seguro)
ALTER TABLE marcas ADD COLUMN tipo_comercial TEXT DEFAULT 'disenador' CHECK(tipo_comercial IN ('disenador', 'arabe', 'nicho'));

-- 2. Clasificar casas de autor y nicho existentes
UPDATE marcas SET tipo_comercial = 'nicho' WHERE id IN (1, 4, 5, 8, 9, 14, 17, 20);

-- 3. Clasificar casas de diseñador existentes
UPDATE marcas SET tipo_comercial = 'disenador' WHERE id IN (2, 3, 6, 7, 10, 11, 12, 13, 15, 16, 18, 19);

-- 4. Registrar marcas de alta perfumería árabe
INSERT OR IGNORE INTO marcas (id, nombre, slug, descripcion, tipo_comercial, activo) VALUES
(21, 'Lattafa', 'lattafa', 'Perfumería oriental emiratí célebre por su rica opulencia y extraordinaria fijación.', 'arabe', 1),
(22, 'Armaf', 'armaf', 'Fragancias cosmopolitas inspiradas en la elegancia con estelas intensas y memorables.', 'arabe', 1),
(23, 'Rasasi', 'rasasi', 'Herencia de perfumería de Dubái con un balance impecable entre frescura y maderas nobles.', 'arabe', 1),
(24, 'Afnan', 'afnan', 'Composiciones orientales contemporáneas de calidad superior y proyección sofisticada.', 'arabe', 1);

-- 5. Registrar fragancias árabes en el catálogo
INSERT OR IGNORE INTO productos (id, marca_id, nombre, slug, descripcion, genero, concentracion, anio_lanzamiento, pais_origen, ocasion_uso, meta_titulo, meta_descripcion, estado, es_destacado, publicado_en) VALUES
(21, 21, 'Khamrah', 'khamrah', 'Una suntuosa oda a la calidez y el deleite oriental: dátiles, canela, nuez moscada y praliné sobre un lecho balsámico de vainilla y benjuí.', 'Unisex', 'Eau de Parfum', 2022, 'Emiratos Árabes Unidos', 'Noche, invierno y ocasiones especiales', 'Khamrah - Lattafa Original | Maison des Parfums', 'Perfume árabe Khamrah de Lattafa original en Perú. Dulzura gourmand especiada.', 'publicado', 1, CURRENT_TIMESTAMP),
(22, 22, 'Club de Nuit Intense Man', 'club-de-nuit-intense-man', 'Un ícono de presencia y magnetismo masculino. Apertura cítrica vivaz con corazón de abedul ahumado, jazmín y fondo de almizcle y ámbar gris.', 'Hombre', 'Eau de Parfum', 2015, 'Emiratos Árabes Unidos', 'Uso diario ejecutivo, noche y eventos', 'Club de Nuit Intense Man - Armaf | Maison des Parfums', 'Armaf Club de Nuit Intense Man original garantizado en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(23, 23, 'Hawas for Him', 'hawas-for-him', 'La fuerza del espíritu aventurero. Fusión fresca y acuática de manzana, bergamota y ciruela entrelazada con cardamomo y ámbar gris.', 'Hombre', 'Eau de Parfum', 2015, 'Emiratos Árabes Unidos', 'Día, clima cálido y reuniones sociales', 'Hawas for Him - Rasasi | Maison des Parfums', 'Perfume árabe Rasasi Hawas for Him original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(24, 21, 'Yara', 'yara', 'Una caricia tierna, cremosa y seductora dominada por acordes de heliotropo, orquídea tropical, mandarina jugosa y vainilla aterciopelada.', 'Mujer', 'Eau de Parfum', 2020, 'Emiratos Árabes Unidos', 'Uso diario sofisticado y citas', 'Yara - Lattafa Perfume Femenino | Maison', 'Fragancia árabe Yara de Lattafa original. Dulzura cremosa y elegante.', 'publicado', 0, CURRENT_TIMESTAMP),
(25, 24, '9 PM', '9-pm', 'La esencia de la noche moderna. Manzana silvestre, lavanda y canela envueltas en un fondo cálido de pachulí, vainilla y ámbar envolvente.', 'Hombre', 'Eau de Parfum', 2020, 'Emiratos Árabes Unidos', 'Noche, citas y eventos festivos', '9 PM - Afnan Perfumes Original | Maison', 'Perfume para hombre 9 PM de Afnan en Perú. Proyección cautivadora.', 'publicado', 0, CURRENT_TIMESTAMP),
(26, 21, 'Bade''e Al Oud', 'badee-al-oud', 'La gloria del oud en su máxima expresión. Azafrán misterioso, nuez moscada y lavanda sobre una imponente base de madera de oud y pachulí.', 'Unisex', 'Eau de Parfum', 2020, 'Emiratos Árabes Unidos', 'Noches frías y ocasiones de gala', 'Bade''e Al Oud (Oud for Glory) - Lattafa | Maison', 'Perfume árabe Bade''e Al Oud original. Misterio amaderado oriental.', 'publicado', 0, CURRENT_TIMESTAMP);

-- 6. Asignar familias olfativas a las nuevas fragancias árabes
INSERT OR IGNORE INTO producto_familias_olfativas (producto_id, familia_olfativa_id) VALUES
(21, 10), -- Khamrah: Gourmand
(22, 9),  -- Club de Nuit: Amaderada aromática
(23, 15), -- Hawas: Aromática marina
(24, 10), -- Yara: Gourmand
(25, 13), -- 9 PM: Oriental
(26, 5);  -- Bade'e Al Oud: Amaderada

-- 7. Registrar imágenes oficiales para las nuevas fragancias
INSERT OR IGNORE INTO imagenes_producto (producto_id, clave_archivo, texto_alternativo, orden, es_principal) VALUES
(21, 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85', 'Lattafa Khamrah Frasco Oficial', 0, 1),
(22, 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 'Armaf Club de Nuit Intense Man', 0, 1),
(23, 'https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85', 'Rasasi Hawas for Him', 0, 1),
(24, 'https://images.unsplash.com/photo-1630573133526-8d090e0269af?auto=format&fit=crop&w=900&q=85', 'Lattafa Yara Frasco Rosa', 0, 1),
(25, 'https://images.unsplash.com/photo-1675317742083-95aef8e322ea?auto=format&fit=crop&w=900&q=85', 'Afnan 9 PM', 0, 1),
(26, 'https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85', 'Lattafa Bade''e Al Oud', 0, 1);

-- 8. Frascos regulares para las fragancias árabes (100ml)
INSERT OR IGNORE INTO variantes_producto (producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, activo) VALUES
(21, 'LAT-KHM-100', 100, 24000, 1, 0, 'venta_regular', 1),
(22, 'ARM-CDNI-100', 100, 21000, 1, 0, 'venta_regular', 1),
(23, 'RAS-HAW-100', 100, 28000, 1, 0, 'venta_regular', 1),
(24, 'LAT-YAR-100', 100, 22000, 1, 0, 'venta_regular', 1),
(25, 'AFN-9PM-100', 100, 23000, 1, 0, 'venta_regular', 1),
(26, 'LAT-BAO-100', 100, 25000, 1, 0, 'venta_regular', 1);

-- 9. Registrar variantes de DECANTS (5 ml y 10 ml) para fragancias icónicas
INSERT OR IGNORE INTO variantes_producto (producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, activo) VALUES
-- Baccarat Rouge 540 (MFK)
(1, 'DEC-BR540-5', 5, 9500, 0, 0, 'venta_regular', 1),
(1, 'DEC-BR540-10', 10, 17500, 0, 0, 'venta_regular', 1),
-- Sauvage Elixir (Dior)
(2, 'DEC-SE-5', 5, 7500, 0, 0, 'venta_regular', 1),
(2, 'DEC-SE-10', 10, 13500, 0, 0, 'venta_regular', 1),
-- Aventus (Creed)
(4, 'DEC-AV-5', 5, 11500, 0, 0, 'venta_regular', 1),
(4, 'DEC-AV-10', 10, 21000, 0, 0, 'venta_regular', 1),
-- Oud Wood (Tom Ford)
(5, 'DEC-OW-5', 5, 9000, 0, 0, 'venta_regular', 1),
(5, 'DEC-OW-10', 10, 16500, 0, 0, 'venta_regular', 1),
-- Delina (Parfums de Marly)
(8, 'DEC-DEL-5', 5, 11000, 0, 0, 'venta_regular', 1),
(8, 'DEC-DEL-10', 10, 20000, 0, 0, 'venta_regular', 1),
-- Santal 33 (Le Labo)
(14, 'DEC-S33-5', 5, 9500, 0, 0, 'venta_regular', 1),
(14, 'DEC-S33-10', 10, 17000, 0, 0, 'venta_regular', 1),
-- Khamrah (Lattafa)
(21, 'DEC-KHM-5', 5, 3500, 0, 0, 'venta_regular', 1),
(21, 'DEC-KHM-10', 10, 6000, 0, 0, 'venta_regular', 1),
-- Club de Nuit (Armaf)
(22, 'DEC-CDNI-5', 5, 3000, 0, 0, 'venta_regular', 1),
(22, 'DEC-CDNI-10', 10, 5500, 0, 0, 'venta_regular', 1);

-- 10. Población de categorías comerciales
INSERT OR IGNORE INTO categorias (id, nombre, slug, descripcion, orden, activo) VALUES
(1, 'Diseñador', 'disenador', 'Grandes casas y firmas internacionales de alta costura.', 1, 1),
(2, 'Árabes', 'arabes', 'Tradición oriental, acordes de oud, ámbar y fijación legendaria.', 2, 1),
(3, 'Nichos', 'nichos', 'Creaciones artesanales de autor e ingredientes excepcionales.', 3, 1),
(4, 'Decants', 'decants', 'Muestras de viaje y fracciones de perfumes 100% auténticos.', 4, 1);
