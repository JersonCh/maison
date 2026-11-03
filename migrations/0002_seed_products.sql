-- =============================================================================
-- MAISON DES PARFUMS - DATOS SEMILLA INICIALES
-- Migración: 0002_seed_products.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. MARCAS
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO marcas (id, nombre, slug, descripcion, activo) VALUES
(1, 'Maison Francis Kurkdjian', 'maison-francis-kurkdjian', 'Alta perfumería francesa creada por uno de los maestros perfumistas más aclamados.', 1),
(2, 'Dior', 'dior', 'Maison de alta costura y fragancias legendarias francesas.', 1),
(3, 'Carolina Herrera', 'carolina-herrera', 'Elegancia atemporal y sofisticación cosmopolita neoyorquina.', 1),
(4, 'Creed', 'creed', 'Herencia de perfumería real británica con ingredientes naturales seleccionados a mano.', 1),
(5, 'Tom Ford', 'tom-ford', 'Lujo provocador, suntuoso y audaz.', 1),
(6, 'Giorgio Armani', 'giorgio-armani', 'Belleza minimalista, sobria y de elegancia italiana impecable.', 1),
(7, 'Yves Saint Laurent', 'yves-saint-laurent', 'Espíritu rebelde, libre y de carácter cautivador.', 1),
(8, 'Parfums de Marly', 'parfums-de-marly', 'Esplendor ecuestre y opulencia de la corte francesa del siglo XVIII.', 1),
(9, 'Byredo', 'byredo', 'Perfumería nicho contemporánea de raíces suecas y memorias visuales.', 1),
(10, 'Chanel', 'chanel', 'El epítome de la sofisticación parisina y la distinción eterna.', 1),
(11, 'Lancôme', 'lancome', 'Celebración de la feminidad radiante y la gracia francesa.', 1),
(12, 'Versace', 'versace', 'Fuerza mitológica, sensualidad y magnetismo mediterráneo.', 1),
(13, 'Narciso Rodriguez', 'narciso-rodriguez', 'Maestría del almizcle moderno con siluetas olfativas puras.', 1),
(14, 'Le Labo', 'le-labo', 'Artesanía neoyorquina de perfumería lenta y formulación individual.', 1),
(15, 'Jean Paul Gaultier', 'jean-paul-gaultier', 'Seducción transgresora y carisma icónico.', 1),
(16, 'Valentino', 'valentino', 'Alta costura romana impregnada de actitud contemporánea.', 1),
(17, 'Jo Malone', 'jo-malone', 'Fragancias etéreas británicas diseñadas para ser combinadas.', 1),
(18, 'Hermès', 'hermes', 'Nobleza artesanal, poética botánica y pureza olfativa.', 1),
(19, 'Mugler', 'mugler', 'Creaciones visionarias, potentes y sobrenaturales.', 1),
(20, 'Diptyque', 'diptyque', 'Paisajes botánicos y narrativa poética del bulevar Saint-Germain.', 1);

-- -----------------------------------------------------------------------------
-- 2. FAMILIAS OLFATIVAS
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO familias_olfativas (id, nombre, slug, descripcion) VALUES
(1, 'Ámbar floral', 'ambar-floral', 'Notas opulentas, resinosas y flores luminosas de gran estela.'),
(2, 'Aromática especiada', 'aromatica-especiada', 'Hierbas silvestres combinadas con pimientas, cardamomo y maderas.'),
(3, 'Floral', 'floral', 'Composiciones centradas en flores frescas, románticas y expresivas.'),
(4, 'Chipre frutal', 'chipre-frutal', 'Contraste entre frutas vibrantes, musgo de roble y maderas nobles.'),
(5, 'Amaderada', 'amaderada', 'Acordes profundos de cedro, sándalo, oud y vetiver.'),
(6, 'Floral blanca', 'floral-blanca', 'Jazmín, azahar y nardos de presencia elegante y luminosa.'),
(7, 'Aromática', 'aromatica', 'Lavanda, salvia y frescura verde revitalizante.'),
(8, 'Floral frutal', 'floral-frutal', 'Acordes jugosos entrelazados con pétalos de rosa y peonía.'),
(9, 'Amaderada aromática', 'amaderada-aromatica', 'Frescura cítrica y aromática sobre una base de maderas profundas.'),
(10, 'Gourmand', 'gourmand', 'Notas dulces apetitosas como praliné, vainilla y caramelo.'),
(11, 'Oriental fresca', 'oriental-fresca', 'Especias cálidas equilibradas con menta, manzana y notas cítricas.'),
(12, 'Almizclada', 'almizclada', 'Texturas aterciopeladas, íntimas y de sensación de segunda piel.'),
(13, 'Oriental', 'oriental', 'Bálsamos exóticos, cardamomo, haba tonka y resinas seductoras.'),
(14, 'Floral oriental', 'floral-oriental', 'Flores ricas envueltas en maderas dulces y toques avainillados.'),
(15, 'Aromática marina', 'aromatica-marina', 'Brisa de salvia costera, sal de mar y rocas minerales.'),
(16, 'Verde amaderada', 'verde-amaderada', 'Hojas de higuera verde, savia fresca y madera de higuero.');

-- -----------------------------------------------------------------------------
-- 3. PRODUCTOS
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO productos (id, marca_id, nombre, slug, descripcion, genero, concentracion, anio_lanzamiento, pais_origen, ocasion_uso, meta_titulo, meta_descripcion, estado, es_destacado, publicado_en) VALUES
(1, 1, 'Baccarat Rouge 540', 'baccarat-rouge-540', 'Una alquimia poética donde las notas aéreas de jazmín y el brillo del azafrán transportan facetas minerales de ámbar gris y cedro recién cortado.', 'Unisex', 'Eau de Parfum', 2015, 'Francia', 'Noche, ocasiones especiales y eventos exclusivos', 'Baccarat Rouge 540 - MFK | Maison des Parfums', 'Compra Baccarat Rouge 540 original en Perú. Envío seguro y asesoría directa por WhatsApp.', 'publicado', 1, CURRENT_TIMESTAMP),
(2, 2, 'Sauvage Elixir', 'sauvage-elixir', 'Una concentración extraordinaria impregnada de la emblemática frescura de Sauvage con un embriagador corazón de especias y una rica estela amaderada.', 'Hombre', 'Parfum', 2021, 'Francia', 'Noche y clima templado a frío', 'Sauvage Elixir - Dior | Maison des Parfums', 'Perfume Sauvage Elixir de Dior original. Notas especiadas y maderas ricas.', 'publicado', 1, CURRENT_TIMESTAMP),
(3, 3, 'Good Girl Blush', 'good-girl-blush', 'Una explosión floral reinventada que contrasta una doble dosis de vainilla con el romanticismo de la peonía y el agua de rosas reciclada.', 'Mujer', 'Eau de Parfum', 2023, 'España', 'Uso diario refinado y citas especiales', 'Good Girl Blush - Carolina Herrera | Maison', 'Fragancia femenina Good Girl Blush original. Notas de vainilla y peonía.', 'publicado', 1, CURRENT_TIMESTAMP),
(4, 4, 'Aventus', 'aventus', 'La fragancia masculina por excelencia. Celebra la fuerza, el poder y el éxito a través de una apertura de grosella negra y manzana con un fondo de abedul ahumado.', 'Hombre', 'Eau de Parfum', 2010, 'Francia', 'Eventos ejecutivos, citas y firmas personales', 'Aventus - Creed Original | Maison des Parfums', 'Adquiere Creed Aventus original en Perú. Garantía de autenticidad absoluta.', 'publicado', 1, CURRENT_TIMESTAMP),
(5, 5, 'Oud Wood', 'oud-wood', 'Uno de los ingredientes más raros y costosos del arsenal de un perfumista: la madera de oud, envuelta en cardamomo, palo de rosa y sándalo humeante.', 'Unisex', 'Eau de Parfum', 2007, 'Estados Unidos', 'Noche y temporada de otoño-invierno', 'Oud Wood - Tom Ford | Maison des Parfums', 'Perfume nicho Oud Wood de Tom Ford. Maderas ahumadas y cardamomo exótico.', 'publicado', 1, CURRENT_TIMESTAMP),
(6, 6, 'My Way', 'my-way', 'Un ramo floral blanco brillante y contemporáneo que invita a abrir horizontes y vivir encuentros auténticos alrededor del mundo.', 'Mujer', 'Eau de Parfum', 2020, 'Italia', 'Día, primavera y reuniones sociales', 'My Way - Giorgio Armani | Maison des Parfums', 'Perfume femenino My Way de Armani. Flores blancas luminosas y bergamota.', 'publicado', 0, CURRENT_TIMESTAMP),
(7, 7, 'Y Eau de Parfum', 'y-eau-de-parfum', 'Una fragancia fougère audaz que contrasta la salvia aromática y el geranio vibrante con maderas de cedro profundas y sensual haba tonka.', 'Hombre', 'Eau de Parfum', 2018, 'Francia', 'Día y noche, versatilidad total', 'Y Eau de Parfum - YSL | Maison des Parfums', 'YSL Y Eau de Parfum para hombre. Proyección y elegancia moderna.', 'publicado', 0, CURRENT_TIMESTAMP),
(8, 8, 'Delina', 'delina', 'Un bouquet floral sensual y radiante dominado por la rosa turca, el lirio de los valles y la peonía, realzado por notas aciduladas de lichi y ruibarbo.', 'Mujer', 'Eau de Parfum', 2017, 'Francia', 'Eventos sofisticados y tardes de primavera', 'Delina - Parfums de Marly | Maison des Parfums', 'Parfums de Marly Delina en Perú. Rosa turca y frutos jugosos.', 'publicado', 0, CURRENT_TIMESTAMP),
(9, 9, 'Bal d''Afrique', 'bal-dafrique', 'Una carta de amor a la cultura y el arte africano de los años 20. Una combinación cálida y chispeante de caléndula africana, neroli y cedro marroquí.', 'Unisex', 'Eau de Parfum', 2009, 'Suecia', 'Día a día, viajes y momentos creativos', 'Bal d''Afrique - Byredo | Maison des Parfums', 'Fragancia de autor Byredo Bal d''Afrique original.', 'publicado', 0, CURRENT_TIMESTAMP),
(10, 10, 'Bleu de Chanel', 'bleu-de-chanel', 'El elogio a la libertad masculina. Un aroma amaderado y aromático de estela cautivadora que desafía todo convencionalismo.', 'Hombre', 'Eau de Parfum', 2014, 'Francia', 'Uso profesional y reuniones distinguidas', 'Bleu de Chanel Eau de Parfum | Maison', 'Fragancia icónica Bleu de Chanel original garantizado.', 'publicado', 0, CURRENT_TIMESTAMP),
(11, 11, 'La Vie Est Belle', 'la-vie-est-belle', 'Una declaración universal a la belleza de la vida encabezada por la nobleza del iris pallida, la flor de azahar y un goloso fondo de pachulí y praliné.', 'Mujer', 'Eau de Parfum', 2012, 'Francia', 'Ocasiones festivas y momentos entrañables', 'La Vie Est Belle - Lancôme | Maison', 'Perfume Lancôme La Vie Est Belle original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(12, 12, 'Eros', 'eros', 'Sensualidad desbordante inspirada en la mitología griega. Acordes chispeantes de menta y manzana italiana sobre un lecho de haba tonka y cedro.', 'Hombre', 'Eau de Toilette', 2012, 'Italia', 'Noche, fiesta y salidas nocturnas', 'Eros - Versace para Hombre | Maison', 'Versace Eros original. Energía mediterránea y seducción.', 'publicado', 0, CURRENT_TIMESTAMP),
(13, 13, 'For Her', 'for-her', 'Un tributo a la gracia interior femenina concebido en torno al corazón inconfundible del almizcle de Narciso, realzado por notas de osmanto y ámbar.', 'Mujer', 'Eau de Parfum', 2003, 'Estados Unidos', 'Estilo de oficina sofisticado y veladas íntimas', 'For Her - Narciso Rodriguez | Maison', 'Elegancia atemporal Narciso Rodriguez For Her original.', 'publicado', 0, CURRENT_TIMESTAMP),
(14, 14, 'Santal 33', 'santal-33', 'La leyenda olfativa de Le Labo. Una composición embriagadora de cardamomo, iris, violeta y maderas ahumadas de sándalo australiano y cedro.', 'Unisex', 'Eau de Parfum', 2011, 'Estados Unidos', 'Firmas personales exclusivas y carácter urbano', 'Santal 33 - Le Labo | Maison des Parfums', 'Perfume de culto Le Labo Santal 33 original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(15, 15, 'Le Male Le Parfum', 'le-male-le-parfum', 'Al mando de la seducción. Un aroma oriental y amaderado donde el cardamomo lidera un corazón distinguido de lavanda e iris con fondo de vainilla.', 'Hombre', 'Eau de Parfum', 2020, 'Francia', 'Noches frías y ocasiones de conquista', 'Le Male Le Parfum - Jean Paul Gaultier | Maison', 'Jean Paul Gaultier Le Male Le Parfum original.', 'publicado', 0, CURRENT_TIMESTAMP),
(16, 16, 'Donna Born in Roma', 'donna-born-in-roma', 'Alta costura moderna en homenaje a las raíces romanas. Trío de jazmines enriquecido con vainilla bourbon y notas amaderadas contemporáneas.', 'Mujer', 'Eau de Parfum', 2019, 'Italia', 'Estilo urbano chic y celebraciones', 'Donna Born in Roma - Valentino | Maison', 'Perfume Valentino Donna Born in Roma original.', 'publicado', 0, CURRENT_TIMESTAMP),
(17, 17, 'Wood Sage & Sea Salt', 'wood-sage-sea-salt', 'Escape a las costas británicas. El viento salado del mar se mezcla con la textura mineral de los acantilados y la calidez terrosa de la salvia.', 'Unisex', 'Cologne', 2014, 'Reino Unido', 'Mañanas frescas, fines de semana y descanso', 'Wood Sage & Sea Salt - Jo Malone | Maison', 'Jo Malone Wood Sage & Sea Salt original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP),
(18, 18, 'Terre d''Hermès', 'terre-dhermes', 'Un relato de alquimia entre el hombre y la tierra. La chispa vivaz de la naranja amarga y el pomelo combinada con pimienta, cedro y vetiver mineral.', 'Hombre', 'Eau de Toilette', 2006, 'Francia', 'Uso profesional diario y elegancia madura', 'Terre d''Hermès - Hermès | Maison', 'Perfume Terre d''Hermès original para hombre.', 'publicado', 0, CURRENT_TIMESTAMP),
(19, 19, 'Alien Goddess', 'alien-goddess', 'Un manifiesto solar y resplandeciente. Esencia de bergamota italiana, jazmín grandiflorum radiante y una infusión reconfortante de vainilla bourbon.', 'Mujer', 'Eau de Parfum', 2021, 'Francia', 'Días soleados y eventos especiales', 'Alien Goddess - Mugler | Maison des Parfums', 'Perfume Mugler Alien Goddess original.', 'publicado', 0, CURRENT_TIMESTAMP),
(20, 20, 'Philosykos', 'philosykos', 'Una oda al árbol de higuera en Grecia: la frescura verde de las hojas, la dulzura lechosa del fruto y la densidad de la corteza blanca.', 'Unisex', 'Eau de Toilette', 1996, 'Francia', 'Verano, paseos al aire libre y primavera', 'Philosykos - Diptyque | Maison des Parfums', 'Fragancia nicho Diptyque Philosykos original en Perú.', 'publicado', 0, CURRENT_TIMESTAMP);

-- -----------------------------------------------------------------------------
-- 4. VARIANTES DE PRESENTACIÓN Y PRECIOS EN CÉNTIMOS
-- -----------------------------------------------------------------------------
-- Precios: S/ 1090.00 = 109000 céntimos. Variante 100ml = precio 50ml + 13000 céntimos.
INSERT OR IGNORE INTO variantes_producto (id, producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, activo) VALUES
(1, 1, 'MFK-BR540-50', 50, 109000, 119000, 1, 0, 'venta_regular', 1),
(2, 1, 'MFK-BR540-100', 100, 122000, NULL, 0, 0, 'venta_regular', 1),
(3, 2, 'DIOR-SE-50', 50, 79000, NULL, 1, 0, 'venta_regular', 1),
(4, 2, 'DIOR-SE-100', 100, 92000, NULL, 0, 0, 'venta_regular', 1),
(5, 3, 'CH-GGB-50', 50, 52000, 59000, 1, 0, 'venta_regular', 1),
(6, 3, 'CH-GGB-100', 100, 65000, NULL, 0, 0, 'venta_regular', 1),
(7, 4, 'CREED-AV-50', 50, 125000, NULL, 1, 0, 'venta_regular', 1),
(8, 4, 'CREED-AV-100', 100, 138000, NULL, 0, 0, 'venta_regular', 1),
(9, 5, 'TF-OW-50', 50, 98000, NULL, 1, 0, 'venta_regular', 1),
(10, 5, 'TF-OW-100', 100, 111000, NULL, 0, 0, 'venta_regular', 1),
(11, 6, 'ARM-MW-50', 50, 49000, NULL, 1, 0, 'venta_regular', 1),
(12, 6, 'ARM-MW-100', 100, 62000, NULL, 0, 0, 'venta_regular', 1),
(13, 7, 'YSL-YEDP-50', 50, 56000, NULL, 1, 0, 'venta_regular', 1),
(14, 7, 'YSL-YEDP-100', 100, 69000, NULL, 0, 0, 'venta_regular', 1),
(15, 8, 'PDM-DEL-50', 50, 119000, NULL, 1, 0, 'venta_regular', 1),
(16, 8, 'PDM-DEL-100', 100, 132000, NULL, 0, 0, 'venta_regular', 1),
(17, 9, 'BYR-BDA-50', 50, 97000, NULL, 1, 0, 'venta_regular', 1),
(18, 9, 'BYR-BDA-100', 100, 110000, NULL, 0, 0, 'venta_regular', 1),
(19, 10, 'CHA-BDC-50', 50, 69000, 74000, 1, 0, 'venta_regular', 1),
(20, 10, 'CHA-BDC-100', 100, 82000, NULL, 0, 0, 'venta_regular', 1),
(21, 11, 'LAN-LVEB-50', 50, 46000, NULL, 1, 0, 'venta_regular', 1),
(22, 11, 'LAN-LVEB-100', 100, 59000, NULL, 0, 0, 'venta_regular', 1),
(23, 12, 'VER-EROS-50', 50, 39000, NULL, 1, 0, 'venta_regular', 1),
(24, 12, 'VER-EROS-100', 100, 52000, NULL, 0, 0, 'venta_regular', 1),
(25, 13, 'NR-FH-50', 50, 48000, NULL, 1, 0, 'venta_regular', 1),
(26, 13, 'NR-FH-100', 100, 61000, NULL, 0, 0, 'venta_regular', 1),
(27, 14, 'LL-S33-50', 50, 99000, NULL, 1, 0, 'venta_regular', 1),
(28, 14, 'LL-S33-100', 100, 112000, NULL, 0, 0, 'venta_regular', 1),
(29, 15, 'JPG-LMLP-50', 50, 53000, NULL, 1, 0, 'venta_regular', 1),
(30, 15, 'JPG-LMLP-100', 100, 66000, NULL, 0, 0, 'venta_regular', 1),
(31, 16, 'VAL-DBIR-50', 50, 51000, NULL, 1, 0, 'venta_regular', 1),
(32, 16, 'VAL-DBIR-100', 100, 64000, NULL, 0, 0, 'venta_regular', 1),
(33, 17, 'JM-WSSS-50', 50, 69000, NULL, 1, 0, 'venta_regular', 1),
(34, 17, 'JM-WSSS-100', 100, 82000, NULL, 0, 0, 'venta_regular', 1),
(35, 18, 'HER-TDH-50', 50, 57000, NULL, 1, 0, 'venta_regular', 1),
(36, 18, 'HER-TDH-100', 100, 70000, NULL, 0, 0, 'venta_regular', 1),
(37, 19, 'MUG-AG-50', 50, 49000, NULL, 1, 0, 'venta_regular', 1),
(38, 19, 'MUG-AG-100', 100, 62000, NULL, 0, 0, 'venta_regular', 1),
(39, 20, 'DIP-PHIL-50', 50, 81000, NULL, 1, 0, 'venta_regular', 1),
(40, 20, 'DIP-PHIL-100', 100, 94000, NULL, 0, 0, 'venta_regular', 1);

-- -----------------------------------------------------------------------------
-- 5. RELACIÓN PRODUCTOS - FAMILIAS OLFATIVAS
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO producto_familias_olfativas (producto_id, familia_olfativa_id) VALUES
(1, 1),   -- Baccarat: Ámbar floral
(2, 2),   -- Sauvage Elixir: Aromática especiada
(3, 3),   -- Good Girl: Floral
(4, 4),   -- Aventus: Chipre frutal
(5, 5),   -- Oud Wood: Amaderada
(6, 6),   -- My Way: Floral blanca
(7, 7),   -- Y: Aromática
(8, 8),   -- Delina: Floral frutal
(9, 5),   -- Bal d'Afrique: Amaderada
(10, 9),  -- Bleu de Chanel: Amaderada aromática
(11, 10), -- La Vie Est Belle: Gourmand
(12, 11), -- Eros: Oriental fresca
(13, 12), -- For Her: Almizclada
(14, 5),  -- Santal 33: Amaderada
(15, 13), -- Le Male Le Parfum: Oriental
(16, 14), -- Donna Born in Roma: Floral oriental
(17, 15), -- Wood Sage: Aromática marina
(18, 16), -- Terre d'Hermès: Amaderada especiada
(19, 1),  -- Alien Goddess: Ámbar floral
(20, 16); -- Philosykos: Verde amaderada

-- -----------------------------------------------------------------------------
-- 6. IMÁGENES INICIALES DE PRODUCTOS (3 FOTOS POR PERFUME)
-- -----------------------------------------------------------------------------
-- Fotos principales de alta calidad
INSERT OR IGNORE INTO imagenes_producto (producto_id, clave_archivo, texto_alternativo, orden, es_principal) VALUES
(1, 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85', 'Maison Francis Kurkdjian Baccarat Rouge 540', 0, 1),
(1, 'https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=900&q=85', 'Baccarat Rouge 540 Frasco y Caja', 1, 0),
(1, 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 'Baccarat Rouge 540 Detalle Editorial', 2, 0),

(2, 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 'Dior Sauvage Elixir', 0, 1),
(2, 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85', 'Sauvage Elixir Presentación', 1, 0),
(2, 'https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=900&q=85', 'Sauvage Elixir Detalle', 2, 0),

(3, 'https://images.unsplash.com/photo-1630573133526-8d090e0269af?auto=format&fit=crop&w=900&q=85', 'Carolina Herrera Good Girl Blush', 0, 1),
(3, 'https://images.unsplash.com/photo-1708486235073-14879ff14c4c?auto=format&fit=crop&w=900&q=85', 'Good Girl Blush Tacón Rosa', 1, 0),
(3, 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85', 'Good Girl Blush Detalle', 2, 0),

(4, 'https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85', 'Creed Aventus Frasco Oficial', 0, 1),
(4, 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 'Creed Aventus Empaque', 1, 0),
(4, 'https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=900&q=85', 'Creed Aventus Detalle de atomizador', 2, 0),

(5, 'https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85', 'Tom Ford Oud Wood Frasco', 0, 1),
(5, 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85', 'Tom Ford Oud Wood Caja', 1, 0),
(5, 'https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=900&q=85', 'Tom Ford Oud Wood Contexto', 2, 0),

(6, 'https://images.unsplash.com/photo-1708486235073-14879ff14c4c?auto=format&fit=crop&w=900&q=85', 'Giorgio Armani My Way Frasco', 0, 1),
(7, 'https://images.unsplash.com/photo-1635796436337-50481b9fa2ad?auto=format&fit=crop&w=900&q=85', 'YSL Y Eau de Parfum Frasco', 0, 1),
(8, 'https://images.unsplash.com/photo-1678984633768-c4fd5a01732a?auto=format&fit=crop&w=900&q=85', 'Parfums de Marly Delina Frasco', 0, 1),
(9, 'https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=900&q=85', 'Byredo Bal d''Afrique Frasco', 0, 1),
(10, 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 'Bleu de Chanel Frasco', 0, 1),
(11, 'https://images.unsplash.com/photo-1630573133526-8d090e0269af?auto=format&fit=crop&w=900&q=85', 'Lancôme La Vie Est Belle', 0, 1),
(12, 'https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85', 'Versace Eros Frasco Azul', 0, 1),
(13, 'https://images.unsplash.com/photo-1708486235073-14879ff14c4c?auto=format&fit=crop&w=900&q=85', 'Narciso Rodriguez For Her', 0, 1),
(14, 'https://images.unsplash.com/photo-1675317742083-95aef8e322ea?auto=format&fit=crop&w=900&q=85', 'Le Labo Santal 33 Frasco', 0, 1),
(15, 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 'Jean Paul Gaultier Le Male Le Parfum', 0, 1),
(16, 'https://images.unsplash.com/photo-1678984633768-c4fd5a01732a?auto=format&fit=crop&w=900&q=85', 'Valentino Donna Born in Roma', 0, 1),
(17, 'https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=900&q=85', 'Jo Malone Wood Sage & Sea Salt', 0, 1),
(18, 'https://images.unsplash.com/photo-1675317742083-95aef8e322ea?auto=format&fit=crop&w=900&q=85', 'Hermès Terre d''Hermès', 0, 1),
(19, 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85', 'Mugler Alien Goddess', 0, 1),
(20, 'https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85', 'Diptyque Philosykos', 0, 1);

-- -----------------------------------------------------------------------------
-- 7. BANNERS Y CARRUSELES DE LA HOME
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO banners (id, ubicacion, titulo, subtitulo, texto_boton, enlace_url, imagen_desktop_key, imagen_mobile_key, orden, activo) VALUES
(1, 'hero_home', 'Encuentra una fragancia que hable por ti', 'Fragancias originales · Selección exclusiva', 'Explorar perfumes', '/perfumes', 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=1800&q=90', 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 0, 1),
(2, 'hero_home', 'El arte de la distinción olfativa', 'Casas de autor y alta perfumería europea', 'Ver Novedades', '/perfumes', 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=1800&q=90', 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85', 1, 1),
(3, 'hero_home', 'Asesoría cercana y personalizada', 'Descubre notas creadas a la medida de tu estilo', 'Hablar con un asesor', '/contacto', 'https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=1800&q=90', 'https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85', 2, 1),
(4, 'promo_mitad', 'Tu aroma habla antes que tú', 'Recibe asesoría personalizada y encuentra esa fragancia que realmente se siente tuya.', 'Hablar con un asesor', '/contacto', 'https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85', NULL, 0, 1);
