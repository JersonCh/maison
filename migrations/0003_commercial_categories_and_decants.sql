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

-- 4. Registrar marcas de alta perfumería árabe (IDs 21 a 24)
INSERT OR IGNORE INTO marcas (id, nombre, slug, descripcion, tipo_comercial, activo) VALUES
(21, 'Lattafa', 'lattafa', 'Perfumería oriental emiratí célebre por su rica opulencia y extraordinaria fijación.', 'arabe', 1),
(22, 'Armaf', 'armaf', 'Fragancias cosmopolitas inspiradas en la elegancia con estelas intensas y memorables.', 'arabe', 1),
(23, 'Rasasi', 'rasasi', 'Herencia de perfumería de Dubái con un balance impecable entre frescura y maderas nobles.', 'arabe', 1),
(24, 'Afnan', 'afnan', 'Composiciones orientales contemporáneas de calidad superior y proyección sofisticada.', 'arabe', 1);

-- 5. Registrar marcas de diseñador emblemáticas adicionales (IDs 25 a 30)
INSERT OR IGNORE INTO marcas (id, nombre, slug, descripcion, tipo_comercial, activo) VALUES
(25, 'Paco Rabanne', 'paco-rabanne', 'Audacia vanguardista, magnetismo y seducción metálica legendaria.', 'disenador', 1),
(26, 'Dolce & Gabbana', 'dolce-gabbana', 'Pasión mediterránea, frescura cítrica y sensualidad italiana inconfundible.', 'disenador', 1),
(27, 'Givenchy', 'givenchy', 'Alta costura y aristocracia francesa contemporánea con distinción cosmopolita.', 'disenador', 1),
(28, 'Prada', 'prada', 'Sofisticación intelectual, elegancia refinada y limpieza olfativa sublime.', 'disenador', 1),
(29, 'Hugo Boss', 'hugo-boss', 'Carácter ejecutivo contemporáneo, determinación y presencia impecable.', 'disenador', 1),
(30, 'Montblanc', 'montblanc', 'Espíritu de exploración noble, artesanía de precisión y masculinidad distinguida.', 'disenador', 1);

-- 6. Registrar fragancias árabes en la base de datos (IDs 21 a 26)
INSERT OR IGNORE INTO productos (id, marca_id, nombre, slug, descripcion, genero, concentracion, anio_lanzamiento, pais_origen, ocasion_uso, meta_titulo, meta_descripcion, estado, es_destacado, publicado_en) VALUES
(21, 21, 'Khamrah', 'khamrah', 'Una suntuosa oda a la calidez y el deleite oriental: dátiles, canela, nuez moscada y praliné sobre un lecho balsámico de vainilla y benjuí.', 'Unisex', 'Eau de Parfum', 2022, 'Emiratos Árabes Unidos', 'Noche, invierno y ocasiones especiales', 'Khamrah - Lattafa Original | Maison des Parfums', 'Perfume árabe Khamrah de Lattafa original en Perú. Dulzura gourmand especiada.', 'publicado', 1, CURRENT_TIMESTAMP),
(22, 22, 'Club de Nuit Intense Man', 'club-de-nuit-intense-man', 'Un ícono de presencia y magnetismo masculino. Apertura cítrica vivaz con corazón de abedul ahumado, jazmín y fondo de almizcle y ámbar gris.', 'Hombre', 'Eau de Parfum', 2015, 'Emiratos Árabes Unidos', 'Uso diario ejecutivo, noche y eventos', 'Club de Nuit Intense Man - Armaf | Maison des Parfums', 'Armaf Club de Nuit Intense Man original garantizado en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(23, 23, 'Hawas for Him', 'hawas-for-him', 'La fuerza del espíritu aventurero. Fusión fresca y acuática de manzana, bergamota y ciruela entrelazada con cardamomo y ámbar gris.', 'Hombre', 'Eau de Parfum', 2015, 'Emiratos Árabes Unidos', 'Día, clima cálido y reuniones sociales', 'Hawas for Him - Rasasi | Maison des Parfums', 'Perfume árabe Rasasi Hawas for Him original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(24, 21, 'Yara', 'yara', 'Una caricia tierna, cremosa y seductora dominada por acordes de heliotropo, orquídea tropical, mandarina jugosa y vainilla aterciopelada.', 'Mujer', 'Eau de Parfum', 2020, 'Emiratos Árabes Unidos', 'Uso diario sofisticado y citas', 'Yara - Lattafa Perfume Femenino | Maison', 'Fragancia árabe Yara de Lattafa original. Dulzura cremosa y elegante.', 'publicado', 0, CURRENT_TIMESTAMP),
(25, 24, '9 PM', '9-pm', 'La esencia de la noche moderna. Manzana silvestre, lavanda y canela envueltas en un fondo cálido de pachulí, vainilla y ámbar envolvente.', 'Hombre', 'Eau de Parfum', 2020, 'Emiratos Árabes Unidos', 'Noche, citas y eventos festivos', '9 PM - Afnan Perfumes Original | Maison', 'Perfume para hombre 9 PM de Afnan en Perú. Proyección cautivadora.', 'publicado', 0, CURRENT_TIMESTAMP),
(26, 21, 'Bade''e Al Oud', 'badee-al-oud', 'La gloria del oud en su máxima expresión. Azafrán misterioso, nuez moscada y lavanda sobre una imponente base de madera de oud y pachulí.', 'Unisex', 'Eau de Parfum', 2020, 'Emiratos Árabes Unidos', 'Noches frías y ocasiones de gala', 'Bade''e Al Oud (Oud for Glory) - Lattafa | Maison', 'Perfume árabe Bade''e Al Oud original. Misterio amaderado oriental.', 'publicado', 0, CURRENT_TIMESTAMP);

-- 7. Registrar fragancias adicionales de diseñador (IDs 27 a 32)
INSERT OR IGNORE INTO productos (id, marca_id, nombre, slug, descripcion, genero, concentracion, anio_lanzamiento, pais_origen, ocasion_uso, meta_titulo, meta_descripcion, estado, es_destacado, publicado_en) VALUES
(27, 25, '1 Million', '1-million', 'El lingote de oro de la perfumería mundial. Notas chispeantes de mandarina roja y menta sobre un corazón de canela especiada, cuero rubio y ámbar ketal.', 'Hombre', 'Eau de Toilette', 2008, 'Francia', 'Noche, fiesta y ocasiones de protagonismo', '1 Million - Paco Rabanne Original | Maison des Parfums', 'Perfume Paco Rabanne 1 Million original en Perú.', 'publicado', 1, CURRENT_TIMESTAMP),
(28, 26, 'Light Blue', 'light-blue', 'La alegría de vivir bajo el sol del Mediterráneo. Manzana Granny Smith crujiente, cedro siciliano y un bouquet floral blanco de jazmín y rosa blanca.', 'Mujer', 'Eau de Toilette', 2001, 'Italia', 'Día, verano y frescura casual refinada', 'Light Blue - Dolce & Gabbana Original | Maison', 'Perfume Dolce & Gabbana Light Blue original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(29, 27, 'Gentleman Reserve Privée', 'gentleman-reserve-privee', 'Inspirado en el refinamiento de los destilados más selectos. Iris empolvado, castaña tibia y absoluto de whisky escocés sobre madera de cedro.', 'Hombre', 'Eau de Parfum', 2022, 'Francia', 'Noche, clima templado a frío y eventos de etiqueta', 'Gentleman Reserve Privée - Givenchy | Maison', 'Fragancia Givenchy Gentleman Reserve Privée original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(30, 28, 'Prada Paradoxe', 'prada-paradoxe', 'La reinvención de la feminidad floral moderna. Apertura de pera y bergamota con corazón de flor de azahar y una base cálida de ámbar y almizcle blanco.', 'Mujer', 'Eau de Parfum', 2022, 'Italia', 'Uso diario distinguido y salidas especiales', 'Prada Paradoxe - Perfume Femenino | Maison des Parfums', 'Perfume Prada Paradoxe original para mujer en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(31, 29, 'Boss Bottled', 'boss-bottled', 'El aroma del éxito contemporáneo. Apertura frutal de manzana y bergamota con corazón especiado de canela y clavo, reposando en maderas nobles.', 'Hombre', 'Eau de Toilette', 1998, 'Alemania', 'Uso profesional diario y reuniones ejecutivas', 'Boss Bottled - Hugo Boss Original | Maison des Parfums', 'Fragancia Hugo Boss Bottled original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(32, 30, 'Explorer', 'explorer', 'Una invitación al descubrimiento olfativo. Bergamota italiana vibrante entrelazada con vetiver puro de Haití y pachulí exclusivo de Indonesia.', 'Hombre', 'Eau de Parfum', 2019, 'Francia', 'Versatilidad total y firma personal ejecutiva', 'Explorer - Montblanc Original | Maison des Parfums', 'Perfume Montblanc Explorer para hombre original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP);

-- 8. Asignar familias olfativas
INSERT OR IGNORE INTO producto_familias_olfativas (producto_id, familia_olfativa_id) VALUES
(21, 10), -- Khamrah: Gourmand
(22, 9),  -- Club de Nuit: Amaderada aromática
(23, 15), -- Hawas: Aromática marina
(24, 10), -- Yara: Gourmand
(25, 13), -- 9 PM: Oriental
(26, 5),  -- Bade'e Al Oud: Amaderada
(27, 11), -- 1 Million: Oriental fresca
(28, 8),  -- Light Blue: Floral frutal
(29, 13), -- Gentleman Reserve Privée: Oriental
(30, 3),  -- Prada Paradoxe: Floral
(31, 2),  -- Boss Bottled: Aromática especiada
(32, 9);  -- Explorer: Amaderada aromática

-- 9. Registrar imágenes de alta resolución
INSERT OR IGNORE INTO imagenes_producto (producto_id, clave_archivo, texto_alternativo, orden, es_principal) VALUES
(21, 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85', 'Lattafa Khamrah Frasco Oficial', 0, 1),
(22, 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 'Armaf Club de Nuit Intense Man', 0, 1),
(23, 'https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85', 'Rasasi Hawas for Him', 0, 1),
(24, 'https://images.unsplash.com/photo-1630573133526-8d090e0269af?auto=format&fit=crop&w=900&q=85', 'Lattafa Yara Frasco Rosa', 0, 1),
(25, 'https://images.unsplash.com/photo-1675317742083-95aef8e322ea?auto=format&fit=crop&w=900&q=85', 'Afnan 9 PM', 0, 1),
(26, 'https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85', 'Lattafa Bade''e Al Oud', 0, 1),
(27, 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 'Paco Rabanne 1 Million', 0, 1),
(28, 'https://images.unsplash.com/photo-1708486235073-14879ff14c4c?auto=format&fit=crop&w=900&q=85', 'Dolce & Gabbana Light Blue', 0, 1),
(29, 'https://images.unsplash.com/photo-1675317742083-95aef8e322ea?auto=format&fit=crop&w=900&q=85', 'Givenchy Gentleman Reserve Privée', 0, 1),
(30, 'https://images.unsplash.com/photo-1630573133526-8d090e0269af?auto=format&fit=crop&w=900&q=85', 'Prada Paradoxe Frasco', 0, 1),
(31, 'https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=900&q=85', 'Hugo Boss Boss Bottled', 0, 1),
(32, 'https://images.unsplash.com/photo-1635796436337-50481b9fa2ad?auto=format&fit=crop&w=900&q=85', 'Montblanc Explorer Frasco', 0, 1);

-- 10. Frascos regulares (50ml / 100ml)
INSERT OR IGNORE INTO variantes_producto (producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, activo) VALUES
-- Árabes
(21, 'LAT-KHM-100', 100, 24000, 1, 0, 'venta_regular', 1),
(22, 'ARM-CDNI-100', 100, 21000, 1, 0, 'venta_regular', 1),
(23, 'RAS-HAW-100', 100, 28000, 1, 0, 'venta_regular', 1),
(24, 'LAT-YAR-100', 100, 22000, 1, 0, 'venta_regular', 1),
(25, 'AFN-9PM-100', 100, 23000, 1, 0, 'venta_regular', 1),
(26, 'LAT-BAO-100', 100, 25000, 1, 0, 'venta_regular', 1),
-- Diseñadores adicionales
(27, 'PR-1M-50', 50, 48000, 1, 0, 'venta_regular', 1),
(27, 'PR-1M-100', 100, 61000, 0, 0, 'venta_regular', 1),
(28, 'DG-LB-50', 50, 46000, 1, 0, 'venta_regular', 1),
(28, 'DG-LB-100', 100, 59000, 0, 0, 'venta_regular', 1),
(29, 'GIV-GRP-50', 50, 56000, 1, 0, 'venta_regular', 1),
(29, 'GIV-GRP-100', 100, 69000, 0, 0, 'venta_regular', 1),
(30, 'PRA-PAR-50', 50, 52000, 1, 0, 'venta_regular', 1),
(30, 'PRA-PAR-100', 100, 65000, 0, 0, 'venta_regular', 1),
(31, 'HB-BB-50', 50, 44000, 1, 0, 'venta_regular', 1),
(31, 'HB-BB-100', 100, 57000, 0, 0, 'venta_regular', 1),
(32, 'MB-EXP-50', 50, 46000, 1, 0, 'venta_regular', 1),
(32, 'MB-EXP-100', 100, 59000, 0, 0, 'venta_regular', 1);

-- 11. Registrar variantes de DECANTS (3 ml, 5 ml y 10 ml)
INSERT OR IGNORE INTO variantes_producto (producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, activo) VALUES
-- Nicho
(1, 'DEC-BR540-3', 3, 6500, 0, 0, 'venta_regular', 1),
(1, 'DEC-BR540-5', 5, 9500, 0, 0, 'venta_regular', 1),
(1, 'DEC-BR540-10', 10, 17500, 0, 0, 'venta_regular', 1),
(4, 'DEC-AV-3', 3, 7500, 0, 0, 'venta_regular', 1),
(4, 'DEC-AV-5', 5, 11500, 0, 0, 'venta_regular', 1),
(4, 'DEC-AV-10', 10, 21000, 0, 0, 'venta_regular', 1),
(5, 'DEC-OW-3', 3, 6000, 0, 0, 'venta_regular', 1),
(5, 'DEC-OW-5', 5, 9000, 0, 0, 'venta_regular', 1),
(5, 'DEC-OW-10', 10, 16500, 0, 0, 'venta_regular', 1),
(8, 'DEC-DEL-3', 3, 7000, 0, 0, 'venta_regular', 1),
(8, 'DEC-DEL-5', 5, 11000, 0, 0, 'venta_regular', 1),
(8, 'DEC-DEL-10', 10, 20000, 0, 0, 'venta_regular', 1),
(14, 'DEC-S33-3', 3, 6500, 0, 0, 'venta_regular', 1),
(14, 'DEC-S33-5', 5, 9500, 0, 0, 'venta_regular', 1),
(14, 'DEC-S33-10', 10, 17000, 0, 0, 'venta_regular', 1),
-- Diseñador
(2, 'DEC-SE-3', 3, 5000, 0, 0, 'venta_regular', 1),
(2, 'DEC-SE-5', 5, 7500, 0, 0, 'venta_regular', 1),
(2, 'DEC-SE-10', 10, 13500, 0, 0, 'venta_regular', 1),
(27, 'DEC-1M-3', 3, 3200, 0, 0, 'venta_regular', 1),
(27, 'DEC-1M-5', 5, 4800, 0, 0, 'venta_regular', 1),
(27, 'DEC-1M-10', 10, 8500, 0, 0, 'venta_regular', 1),
(29, 'DEC-GRP-3', 3, 3800, 0, 0, 'venta_regular', 1),
(29, 'DEC-GRP-5', 5, 5500, 0, 0, 'venta_regular', 1),
(29, 'DEC-GRP-10', 10, 9500, 0, 0, 'venta_regular', 1),
(30, 'DEC-PAR-3', 3, 3800, 0, 0, 'venta_regular', 1),
(30, 'DEC-PAR-5', 5, 5500, 0, 0, 'venta_regular', 1),
(30, 'DEC-PAR-10', 10, 9500, 0, 0, 'venta_regular', 1),
(32, 'DEC-EXP-3', 3, 3000, 0, 0, 'venta_regular', 1),
(32, 'DEC-EXP-5', 5, 4500, 0, 0, 'venta_regular', 1),
(32, 'DEC-EXP-10', 10, 8000, 0, 0, 'venta_regular', 1),
-- Árabes
(21, 'DEC-KHM-3', 3, 2500, 0, 0, 'venta_regular', 1),
(21, 'DEC-KHM-5', 5, 3500, 0, 0, 'venta_regular', 1),
(21, 'DEC-KHM-10', 10, 6000, 0, 0, 'venta_regular', 1),
(22, 'DEC-CDNI-3', 3, 2000, 0, 0, 'venta_regular', 1),
(22, 'DEC-CDNI-5', 5, 3000, 0, 0, 'venta_regular', 1),
(22, 'DEC-CDNI-10', 10, 5500, 0, 0, 'venta_regular', 1);

-- 12. Población de categorías temáticas y asignación en producto_categorias
INSERT OR IGNORE INTO categorias (id, nombre, slug, descripcion, orden, activo) VALUES
(1, 'Diseñador', 'disenador', 'Grandes casas y firmas internacionales de alta costura.', 1, 1),
(2, 'Árabes', 'arabes', 'Tradición oriental, acordes de oud, ámbar y fijación legendaria.', 2, 1),
(3, 'Nichos', 'nichos', 'Creaciones artesanales de autor e ingredientes excepcionales.', 3, 1),
(4, 'Decants', 'decants', 'Muestras de viaje y fracciones de perfumes 100% auténticos.', 4, 1);

-- Asignación N:M de categorías a productos
-- Diseñadores:
INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES
(2, 1), (3, 1), (6, 1), (7, 1), (10, 1), (11, 1), (12, 1), (13, 1), (15, 1), (16, 1), (18, 1), (19, 1), (27, 1), (28, 1), (29, 1), (30, 1), (31, 1), (32, 1);

-- Árabes:
INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES
(21, 2), (22, 2), (23, 2), (24, 2), (25, 2), (26, 2);

-- Nichos:
INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES
(1, 3), (4, 3), (5, 3), (8, 3), (9, 3), (14, 3), (17, 3), (20, 3);

-- Decants:
INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES
(1, 4), (2, 4), (4, 4), (5, 4), (8, 4), (14, 4), (21, 4), (22, 4), (27, 4), (29, 4), (30, 4), (32, 4);
