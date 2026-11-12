-- =============================================================================
-- MAISON DES PARFUMS - DATOS SEMILLA DEMOSTRATIVOS (D1 / SQLITE)
-- Archivo: 0002_seed.sql
-- Propósito: Población inicial de prueba (30 marcas, 32 perfumes, variantes,
--            decants, imágenes, familias olfativas y banners del Hero).
-- Nota: Este archivo puede omitirse en producción o limpiarse para un despliegue en blanco.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. FAMILIAS OLFATIVAS
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
-- 2. CATEGORÍAS COMERCIALES
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO categorias (id, nombre, slug, descripcion, orden, activo) VALUES
(1, 'Diseñador', 'disenador', 'Grandes casas y firmas internacionales de alta costura.', 1, 1),
(2, 'Árabes', 'arabes', 'Tradición oriental, acordes de oud, ámbar y fijación legendaria.', 2, 1),
(3, 'Nichos', 'nichos', 'Creaciones artesanales de autor e ingredientes excepcionales.', 3, 1),
(4, 'Decants', 'decants', 'Muestras de viaje y fracciones de perfumes 100% auténticos.', 4, 1);

-- -----------------------------------------------------------------------------
-- 3. MARCAS / CASAS DE PERFUMERÍA (30 CASAS CON SU PAÍS DE ORIGEN Y LÍNEA)
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO marcas (id, nombre, slug, pais_origen, tipo_comercial, activo) VALUES
-- Casas Nicho / Autor
(1, 'Maison Francis Kurkdjian', 'maison-francis-kurkdjian', 'Francia', 'nicho', 1),
(4, 'Creed', 'creed', 'Reino Unido', 'nicho', 1),
(5, 'Tom Ford', 'tom-ford', 'Estados Unidos', 'nicho', 1),
(8, 'Parfums de Marly', 'parfums-de-marly', 'Francia', 'nicho', 1),
(9, 'Byredo', 'byredo', 'Suecia', 'nicho', 1),
(14, 'Le Labo', 'le-labo', 'Estados Unidos', 'nicho', 1),
(17, 'Jo Malone', 'jo-malone', 'Reino Unido', 'nicho', 1),
(20, 'Diptyque', 'diptyque', 'Francia', 'nicho', 1),

-- Grandes Firmas de Diseñador
(2, 'Dior', 'dior', 'Francia', 'disenador', 1),
(3, 'Carolina Herrera', 'carolina-herrera', 'Estados Unidos', 'disenador', 1),
(6, 'Giorgio Armani', 'giorgio-armani', 'Italia', 'disenador', 1),
(7, 'Yves Saint Laurent', 'yves-saint-laurent', 'Francia', 'disenador', 1),
(10, 'Chanel', 'chanel', 'Francia', 'disenador', 1),
(11, 'Lancôme', 'lancome', 'Francia', 'disenador', 1),
(12, 'Versace', 'versace', 'Italia', 'disenador', 1),
(13, 'Narciso Rodriguez', 'narciso-rodriguez', 'Estados Unidos', 'disenador', 1),
(15, 'Jean Paul Gaultier', 'jean-paul-gaultier', 'Francia', 'disenador', 1),
(16, 'Valentino', 'valentino', 'Italia', 'disenador', 1),
(18, 'Hermès', 'hermes', 'Francia', 'disenador', 1),
(19, 'Mugler', 'mugler', 'Francia', 'disenador', 1),
(25, 'Paco Rabanne', 'paco-rabanne', 'España', 'disenador', 1),
(26, 'Dolce & Gabbana', 'dolce-gabbana', 'Italia', 'disenador', 1),
(27, 'Givenchy', 'givenchy', 'Francia', 'disenador', 1),
(28, 'Prada', 'prada', 'Italia', 'disenador', 1),
(29, 'Hugo Boss', 'hugo-boss', 'Alemania', 'disenador', 1),
(30, 'Montblanc', 'montblanc', 'Alemania', 'disenador', 1),

-- Perfumería Árabe / Oriental
(21, 'Lattafa', 'lattafa', 'Emiratos Árabes Unidos', 'arabe', 1),
(22, 'Armaf', 'armaf', 'Emiratos Árabes Unidos', 'arabe', 1),
(23, 'Rasasi', 'rasasi', 'Emiratos Árabes Unidos', 'arabe', 1),
(24, 'Afnan', 'afnan', 'Emiratos Árabes Unidos', 'arabe', 1);

-- -----------------------------------------------------------------------------
-- 4. PRODUCTOS (32 PERFUMES PUBLICADOS)
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO productos (id, marca_id, nombre, slug, descripcion, genero, concentracion, anio_lanzamiento, pais_origen, ocasion_uso, meta_titulo, meta_descripcion, etiqueta_destacada, estado, es_destacado, publicado_en) VALUES
-- Selección 1-20
(1, 1, 'Baccarat Rouge 540', 'baccarat-rouge-540', 'Una alquimia poética donde las notas aéreas de jazmín y el brillo del azafrán transportan facetas minerales de ámbar gris y cedro recién cortado.', 'Unisex', 'Eau de Parfum', 2015, 'Francia', 'Noche, ocasiones especiales y eventos exclusivos', 'Baccarat Rouge 540 - MFK | Maison des Parfums', 'Compra Baccarat Rouge 540 original en Perú. Envío seguro y asesoría directa por WhatsApp.', 'mas_vendido', 'publicado', 1, CURRENT_TIMESTAMP),
(2, 2, 'Sauvage Elixir', 'sauvage-elixir', 'Una concentración extraordinaria impregnada de la emblemática frescura de Sauvage con un embriagador corazón de especias y una rica estela amaderada.', 'Hombre', 'Parfum', 2021, 'Francia', 'Noche y clima templado a frío', 'Sauvage Elixir - Dior | Maison des Parfums', 'Perfume Sauvage Elixir de Dior original. Notas especiadas y maderas ricas.', 'mas_vendido', 'publicado', 1, CURRENT_TIMESTAMP),
(3, 3, 'Good Girl Blush', 'good-girl-blush', 'Una explosión floral reinventada que contrasta una doble dosis de vainilla con el romanticismo de la peonía y el agua de rosas reciclada.', 'Mujer', 'Eau de Parfum', 2023, 'España', 'Uso diario refinado y citas especiales', 'Good Girl Blush - Carolina Herrera | Maison', 'Fragancia femenina Good Girl Blush original. Notas de vainilla y peonía.', 'nuevo', 'publicado', 1, CURRENT_TIMESTAMP),
(4, 4, 'Aventus', 'aventus', 'La fragancia masculina por excelencia. Celebra la fuerza, el poder y el éxito a través de una apertura de grosella negra y manzana con un fondo de abedul ahumado.', 'Hombre', 'Eau de Parfum', 2010, 'Francia', 'Eventos ejecutivos, citas y firmas personales', 'Aventus - Creed Original | Maison des Parfums', 'Adquiere Creed Aventus original en Perú. Garantía de autenticidad absoluta.', 'ninguna', 'publicado', 1, CURRENT_TIMESTAMP),
(5, 5, 'Oud Wood', 'oud-wood', 'Uno de los ingredientes más raros y costosos del arsenal de un perfumista: la madera de oud, envuelta en cardamomo, palo de rosa y sándalo humeante.', 'Unisex', 'Eau de Parfum', 2007, 'Estados Unidos', 'Noche y temporada de otoño-invierno', 'Oud Wood - Tom Ford | Maison des Parfums', 'Perfume nicho Oud Wood de Tom Ford. Maderas ahumadas y cardamomo exótico.', 'ninguna', 'publicado', 1, CURRENT_TIMESTAMP),
(6, 6, 'My Way', 'my-way', 'Un ramo floral blanco brillante y contemporáneo que invita a abrir horizontes y vivir encuentros auténticos alrededor del mundo.', 'Mujer', 'Eau de Parfum', 2020, 'Italia', 'Día, primavera y reuniones sociales', 'My Way - Giorgio Armani | Maison des Parfums', 'Perfume femenino My Way de Armani. Flores blancas luminosas y bergamota.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(7, 7, 'Y Eau de Parfum', 'y-eau-de-parfum', 'Una fragancia fougère audaz que contrasta la salvia aromática y el geranio vibrante con maderas de cedro profundas y sensual haba tonka.', 'Hombre', 'Eau de Parfum', 2018, 'Francia', 'Día y noche, versatilidad total', 'Y Eau de Parfum - YSL | Maison des Parfums', 'YSL Y Eau de Parfum para hombre. Proyección y elegancia moderna.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(8, 8, 'Delina', 'delina', 'Un bouquet floral sensual y radiante dominado por la rosa turca, el lirio de los valles y la peonía, realzado por notas aciduladas de lichi y ruibarbo.', 'Mujer', 'Eau de Parfum', 2017, 'Francia', 'Eventos sofisticados y tardes de primavera', 'Delina - Parfums de Marly | Maison des Parfums', 'Parfums de Marly Delina en Perú. Rosa turca y frutos jugosos.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(9, 9, 'Bal d''Afrique', 'bal-dafrique', 'Una carta de amor a la cultura y el arte africano de los años 20. Una combinación cálida y chispeante de caléndula africana, neroli y cedro marroquí.', 'Unisex', 'Eau de Parfum', 2009, 'Suecia', 'Día a día, viajes y momentos creativos', 'Bal d''Afrique - Byredo | Maison des Parfums', 'Fragancia de autor Byredo Bal d''Afrique original.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(10, 10, 'Bleu de Chanel', 'bleu-de-chanel', 'El elogio a la libertad masculina. Un aroma amaderado y aromático de estela cautivadora que desafía todo convencionalismo.', 'Hombre', 'Eau de Parfum', 2014, 'Francia', 'Uso profesional y reuniones distinguidas', 'Bleu de Chanel Eau de Parfum | Maison', 'Fragancia icónica Bleu de Chanel original garantizado.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(11, 11, 'La Vie Est Belle', 'la-vie-est-belle', 'Una declaración universal a la belleza de la vida encabezada por la nobleza del iris pallida, la flor de azahar y un goloso fondo de pachulí y praliné.', 'Mujer', 'Eau de Parfum', 2012, 'Francia', 'Ocasiones festivas y momentos entrañables', 'La Vie Est Belle - Lancôme | Maison', 'Perfume Lancôme La Vie Est Belle original en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(12, 12, 'Eros', 'eros', 'Sensualidad desbordante inspirada en la mitología griega. Acordes chispeantes de menta y manzana italiana sobre un lecho de haba tonka y cedro.', 'Hombre', 'Eau de Toilette', 2012, 'Italia', 'Noche, fiesta y salidas nocturnas', 'Eros - Versace para Hombre | Maison', 'Versace Eros original. Energía mediterránea y seducción.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(13, 13, 'For Her', 'for-her', 'Un tributo a la gracia interior femenina concebido en torno al corazón inconfundible del almizcle de Narciso, realzado por notas de osmanto y ámbar.', 'Mujer', 'Eau de Parfum', 2003, 'Estados Unidos', 'Estilo de oficina sofisticado y veladas íntimas', 'For Her - Narciso Rodriguez | Maison', 'Elegancia atemporal Narciso Rodriguez For Her original.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(14, 14, 'Santal 33', 'santal-33', 'La leyenda olfativa de Le Labo. Una composición embriagadora de cardamomo, iris, violeta y maderas ahumadas de sándalo australiano y cedro.', 'Unisex', 'Eau de Parfum', 2011, 'Estados Unidos', 'Firmas personales exclusivas y carácter urbano', 'Santal 33 - Le Labo | Maison des Parfums', 'Perfume de culto Le Labo Santal 33 original en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(15, 15, 'Le Male Le Parfum', 'le-male-le-parfum', 'Al mando de la seducción. Un aroma oriental y amaderado donde el cardamomo lidera un corazón distinguido de lavanda e iris con fondo de vainilla.', 'Hombre', 'Eau de Parfum', 2020, 'Francia', 'Noches frías y ocasiones de conquista', 'Le Male Le Parfum - Jean Paul Gaultier | Maison', 'Jean Paul Gaultier Le Male Le Parfum original.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(16, 16, 'Donna Born in Roma', 'donna-born-in-roma', 'Alta costura moderna en homenaje a las raíces romanas. Trío de jazmines enriquecido con vainilla bourbon y notas amaderadas contemporáneas.', 'Mujer', 'Eau de Parfum', 2019, 'Italia', 'Estilo urbano chic y celebraciones', 'Donna Born in Roma - Valentino | Maison', 'Perfume Valentino Donna Born in Roma original.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(17, 17, 'Wood Sage & Sea Salt', 'wood-sage-sea-salt', 'Escape a las costas británicas. El viento salado del mar se mezcla con la textura mineral de los acantilados y la calidez terrosa de la salvia.', 'Unisex', 'Cologne', 2014, 'Reino Unido', 'Mañanas frescas, fines de semana y descanso', 'Wood Sage & Sea Salt - Jo Malone | Maison', 'Jo Malone Wood Sage & Sea Salt original en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(18, 18, 'Terre d''Hermès', 'terre-dhermes', 'Un relato de alquimia entre el hombre y la tierra. La chispa vivaz de la naranja amarga y el pomelo combinada con pimienta, cedro y vetiver mineral.', 'Hombre', 'Eau de Toilette', 2006, 'Francia', 'Uso profesional diario y elegancia madura', 'Terre d''Hermès - Hermès | Maison', 'Perfume Terre d''Hermès original para hombre.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(19, 19, 'Alien Goddess', 'alien-goddess', 'Un manifiesto solar y resplandeciente. Esencia de bergamota italiana, jazmín grandiflorum radiante y una infusión reconfortante de vainilla bourbon.', 'Mujer', 'Eau de Parfum', 2021, 'Francia', 'Días soleados y eventos especiales', 'Alien Goddess - Mugler | Maison des Parfums', 'Perfume Mugler Alien Goddess original.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(20, 20, 'Philosykos', 'philosykos', 'Una oda al árbol de higuera en Grecia: la frescura verde de las hojas, la dulzura lechosa del fruto y la densidad de la corteza blanca.', 'Unisex', 'Eau de Toilette', 1996, 'Francia', 'Verano, paseos al aire libre y primavera', 'Philosykos - Diptyque | Maison des Parfums', 'Fragancia nicho Diptyque Philosykos original en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),

-- Selección Árabes (21-26)
(21, 21, 'Khamrah', 'khamrah', 'Una suntuosa oda a la calidez y el deleite oriental: dátiles, canela, nuez moscada y praliné sobre un lecho balsámico de vainilla y benjuí.', 'Unisex', 'Eau de Parfum', 2022, 'Emiratos Árabes Unidos', 'Noche, invierno y ocasiones especiales', 'Khamrah - Lattafa Original | Maison des Parfums', 'Perfume árabe Khamrah de Lattafa original en Perú. Dulzura gourmand especiada.', 'mas_vendido', 'publicado', 1, CURRENT_TIMESTAMP),
(22, 22, 'Club de Nuit Intense Man', 'club-de-nuit-intense-man', 'Un ícono de presencia y magnetismo masculino. Apertura cítrica vivaz con corazón de abedul ahumado, jazmín y fondo de almizcle y ámbar gris.', 'Hombre', 'Eau de Parfum', 2015, 'Emiratos Árabes Unidos', 'Uso diario ejecutivo, noche y eventos', 'Club de Nuit Intense Man - Armaf | Maison des Parfums', 'Armaf Club de Nuit Intense Man original garantizado en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(23, 23, 'Hawas for Him', 'hawas-for-him', 'La fuerza del espíritu aventurero. Fusión fresca y acuática de manzana, bergamota y ciruela entrelazada con cardamomo y ámbar gris.', 'Hombre', 'Eau de Parfum', 2015, 'Emiratos Árabes Unidos', 'Día, clima cálido y reuniones sociales', 'Hawas for Him - Rasasi | Maison des Parfums', 'Perfume árabe Rasasi Hawas for Him original en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(24, 21, 'Yara', 'yara', 'Una caricia tierna, cremosa y seductora dominada por acordes de heliotropo, orquídea tropical, mandarina jugosa y vainilla aterciopelada.', 'Mujer', 'Eau de Parfum', 2020, 'Emiratos Árabes Unidos', 'Uso diario sofisticado y citas', 'Yara - Lattafa Perfume Femenino | Maison', 'Fragancia árabe Yara de Lattafa original. Dulzura cremosa y elegante.', 'nuevo', 'publicado', 0, CURRENT_TIMESTAMP),
(25, 24, '9 PM', '9-pm', 'La esencia de la noche moderna. Manzana silvestre, lavanda y canela envueltas en un fondo cálido de pachulí, vainilla y ámbar envolvente.', 'Hombre', 'Eau de Parfum', 2020, 'Emiratos Árabes Unidos', 'Noche, citas y eventos festivos', '9 PM - Afnan Perfumes Original | Maison', 'Perfume para hombre 9 PM de Afnan en Perú. Proyección cautivadora.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(26, 21, 'Bade''e Al Oud', 'badee-al-oud', 'La gloria del oud en su máxima expresión. Azafrán misterioso, nuez moscada y lavanda sobre una imponente base de madera de oud y pachulí.', 'Unisex', 'Eau de Parfum', 2020, 'Emiratos Árabes Unidos', 'Noches frías y ocasiones de gala', 'Bade''e Al Oud (Oud for Glory) - Lattafa | Maison', 'Perfume árabe Bade''e Al Oud original. Misterio amaderado oriental.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),

-- Selección Diseñador Adicional (27-32)
(27, 25, '1 Million', '1-million', 'El lingote de oro de la perfumería mundial. Notas chispeantes de mandarina roja y menta sobre un corazón de canela especiada, cuero rubio y ámbar ketal.', 'Hombre', 'Eau de Toilette', 2008, 'Francia', 'Noche, fiesta y ocasiones de protagonismo', '1 Million - Paco Rabanne Original | Maison des Parfums', 'Perfume Paco Rabanne 1 Million original en Perú.', 'mas_vendido', 'publicado', 1, CURRENT_TIMESTAMP),
(28, 26, 'Light Blue', 'light-blue', 'La alegría de vivir bajo el sol del Mediterráneo. Manzana Granny Smith crujiente, cedro siciliano y un bouquet floral blanco de jazmín y rosa blanca.', 'Mujer', 'Eau de Toilette', 2001, 'Italia', 'Día, verano y frescura casual refinada', 'Light Blue - Dolce & Gabbana Original | Maison', 'Perfume Dolce & Gabbana Light Blue original en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(29, 27, 'Gentleman Reserve Privée', 'gentleman-reserve-privee', 'Inspirado en el refinamiento de los destilados más selectos. Iris empolvado, castaña tibia y absoluto de whisky escocés sobre madera de cedro.', 'Hombre', 'Eau de Parfum', 2022, 'Francia', 'Noche, clima templado a frío y eventos de etiqueta', 'Gentleman Reserve Privée - Givenchy | Maison', 'Fragancia Givenchy Gentleman Reserve Privée original en Perú.', 'nuevo', 'publicado', 0, CURRENT_TIMESTAMP),
(30, 28, 'Prada Paradoxe', 'prada-paradoxe', 'La reinvención de la feminidad floral moderna. Apertura de pera y bergamota con corazón de flor de azahar y una base cálida de ámbar y almizcle blanco.', 'Mujer', 'Eau de Parfum', 2022, 'Italia', 'Uso diario distinguido y salidas especiales', 'Prada Paradoxe - Perfume Femenino | Maison des Parfums', 'Perfume Prada Paradoxe original para mujer en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(31, 29, 'Boss Bottled', 'boss-bottled', 'El aroma del éxito contemporáneo. Apertura frutal de manzana y bergamota con corazón especiado de canela y clavo, reposando en maderas nobles.', 'Hombre', 'Eau de Toilette', 1998, 'Alemania', 'Uso profesional diario y reuniones ejecutivas', 'Boss Bottled - Hugo Boss Original | Maison des Parfums', 'Fragancia Hugo Boss Bottled original en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP),
(32, 30, 'Explorer', 'explorer', 'Una invitación al descubrimiento olfativo. Bergamota italiana vibrante entrelazada con vetiver puro de Haití y pachulí exclusivo de Indonesia.', 'Hombre', 'Eau de Parfum', 2019, 'Francia', 'Versatilidad total y firma personal ejecutiva', 'Explorer - Montblanc Original | Maison des Parfums', 'Perfume Montblanc Explorer para hombre original en Perú.', 'ninguna', 'publicado', 0, CURRENT_TIMESTAMP);

-- -----------------------------------------------------------------------------
-- 5. VARIANTES DE PRODUCTO (FRASCOS REGULARES Y DECANTS ARTESANALES)
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO variantes_producto (id, producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, tipo_presentacion, es_predeterminada, controla_stock, modalidad_disponibilidad, activo) VALUES
-- Frascos regulares productos 1 al 20 (50ml y 100ml)
(1, 1, 'MFK-BR540-50', 50, 109000, 119000, 'frasco', 1, 0, 'venta_regular', 1),
(2, 1, 'MFK-BR540-100', 100, 122000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(3, 2, 'DIOR-SE-50', 50, 79000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(4, 2, 'DIOR-SE-100', 100, 92000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(5, 3, 'CH-GGB-50', 50, 52000, 59000, 'frasco', 1, 0, 'venta_regular', 1),
(6, 3, 'CH-GGB-100', 100, 65000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(7, 4, 'CREED-AV-50', 50, 125000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(8, 4, 'CREED-AV-100', 100, 138000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(9, 5, 'TF-OW-50', 50, 98000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(10, 5, 'TF-OW-100', 100, 111000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(11, 6, 'ARM-MW-50', 50, 49000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(12, 6, 'ARM-MW-100', 100, 62000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(13, 7, 'YSL-YEDP-50', 50, 56000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(14, 7, 'YSL-YEDP-100', 100, 69000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(15, 8, 'PDM-DEL-50', 50, 119000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(16, 8, 'PDM-DEL-100', 100, 132000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(17, 9, 'BYR-BDA-50', 50, 97000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(18, 9, 'BYR-BDA-100', 100, 110000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(19, 10, 'CHA-BDC-50', 50, 69000, 74000, 'frasco', 1, 0, 'venta_regular', 1),
(20, 10, 'CHA-BDC-100', 100, 82000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(21, 11, 'LAN-LVEB-50', 50, 46000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(22, 11, 'LAN-LVEB-100', 100, 59000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(23, 12, 'VER-EROS-50', 50, 39000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(24, 12, 'VER-EROS-100', 100, 52000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(25, 13, 'NR-FH-50', 50, 48000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(26, 13, 'NR-FH-100', 100, 61000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(27, 14, 'LL-S33-50', 50, 99000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(28, 14, 'LL-S33-100', 100, 112000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(29, 15, 'JPG-LMLP-50', 50, 53000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(30, 15, 'JPG-LMLP-100', 100, 66000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(31, 16, 'VAL-DBIR-50', 50, 51000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(32, 16, 'VAL-DBIR-100', 100, 64000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(33, 17, 'JM-WSSS-50', 50, 69000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(34, 17, 'JM-WSSS-100', 100, 82000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(35, 18, 'HER-TDH-50', 50, 57000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(36, 18, 'HER-TDH-100', 100, 70000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(37, 19, 'MUG-AG-50', 50, 49000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(38, 19, 'MUG-AG-100', 100, 62000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(39, 20, 'DIP-PHIL-50', 50, 81000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(40, 20, 'DIP-PHIL-100', 100, 94000, NULL, 'frasco', 0, 0, 'venta_regular', 1),

-- Frascos regulares Árabes (21 al 26 - 100ml)
(41, 21, 'LAT-KHM-100', 100, 24000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(42, 22, 'ARM-CDNI-100', 100, 21000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(43, 23, 'RAS-HAW-100', 100, 28000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(44, 24, 'LAT-YAR-100', 100, 22000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(45, 25, 'AFN-9PM-100', 100, 23000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(46, 26, 'LAT-BAO-100', 100, 25000, NULL, 'frasco', 1, 0, 'venta_regular', 1),

-- Frascos regulares Diseñadores extra (27 al 32 - 50ml y 100ml)
(47, 27, 'PR-1M-50', 50, 48000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(48, 27, 'PR-1M-100', 100, 61000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(49, 28, 'DG-LB-50', 50, 46000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(50, 28, 'DG-LB-100', 100, 59000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(51, 29, 'GIV-GRP-50', 50, 56000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(52, 29, 'GIV-GRP-100', 100, 69000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(53, 30, 'PRA-PAR-50', 50, 52000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(54, 30, 'PRA-PAR-100', 100, 65000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(55, 31, 'HB-BB-50', 50, 44000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(56, 31, 'HB-BB-100', 100, 57000, NULL, 'frasco', 0, 0, 'venta_regular', 1),
(57, 32, 'MB-EXP-50', 50, 46000, NULL, 'frasco', 1, 0, 'venta_regular', 1),
(58, 32, 'MB-EXP-100', 100, 59000, NULL, 'frasco', 0, 0, 'venta_regular', 1),

-- Variantes de Decants (3ml, 5ml y 10ml)
(59, 1, 'DEC-BR540-3', 3, 6500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(60, 1, 'DEC-BR540-5', 5, 9500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(61, 1, 'DEC-BR540-10', 10, 17500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(62, 4, 'DEC-AV-3', 3, 7500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(63, 4, 'DEC-AV-5', 5, 11500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(64, 4, 'DEC-AV-10', 10, 21000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(65, 5, 'DEC-OW-3', 3, 6000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(66, 5, 'DEC-OW-5', 5, 9000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(67, 5, 'DEC-OW-10', 10, 16500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(68, 8, 'DEC-DEL-3', 3, 7000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(69, 8, 'DEC-DEL-5', 5, 11000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(70, 8, 'DEC-DEL-10', 10, 20000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(71, 14, 'DEC-S33-3', 3, 6500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(72, 14, 'DEC-S33-5', 5, 9500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(73, 14, 'DEC-S33-10', 10, 17000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(74, 2, 'DEC-SE-3', 3, 5000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(75, 2, 'DEC-SE-5', 5, 7500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(76, 2, 'DEC-SE-10', 10, 13500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(77, 27, 'DEC-1M-3', 3, 3200, NULL, 'decant', 0, 0, 'venta_regular', 1),
(78, 27, 'DEC-1M-5', 5, 4800, NULL, 'decant', 0, 0, 'venta_regular', 1),
(79, 27, 'DEC-1M-10', 10, 8500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(80, 29, 'DEC-GRP-3', 3, 3800, NULL, 'decant', 0, 0, 'venta_regular', 1),
(81, 29, 'DEC-GRP-5', 5, 5500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(82, 29, 'DEC-GRP-10', 10, 9500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(83, 30, 'DEC-PAR-3', 3, 3800, NULL, 'decant', 0, 0, 'venta_regular', 1),
(84, 30, 'DEC-PAR-5', 5, 5500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(85, 30, 'DEC-PAR-10', 10, 9500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(86, 32, 'DEC-EXP-3', 3, 3000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(87, 32, 'DEC-EXP-5', 5, 4500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(88, 32, 'DEC-EXP-10', 10, 8000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(89, 21, 'DEC-KHM-3', 3, 2500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(90, 21, 'DEC-KHM-5', 5, 3500, NULL, 'decant', 0, 0, 'venta_regular', 1),
(91, 21, 'DEC-KHM-10', 10, 6000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(92, 22, 'DEC-CDNI-3', 3, 2000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(93, 22, 'DEC-CDNI-5', 5, 3000, NULL, 'decant', 0, 0, 'venta_regular', 1),
(94, 22, 'DEC-CDNI-10', 10, 5500, NULL, 'decant', 0, 0, 'venta_regular', 1);

-- -----------------------------------------------------------------------------
-- 6. ASIGNACIÓN PRODUCTO - FAMILIAS OLFATIVAS
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
(18, 16), -- Terre d'Hermès: Verde amaderada
(19, 1),  -- Alien Goddess: Ámbar floral
(20, 16), -- Philosykos: Verde amaderada
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

-- -----------------------------------------------------------------------------
-- 7. ASIGNACIÓN PRODUCTO - CATEGORÍAS COMERCIALES
-- -----------------------------------------------------------------------------
-- Categoría 1: Diseñador
INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES
(2, 1), (3, 1), (6, 1), (7, 1), (10, 1), (11, 1), (12, 1), (13, 1), (15, 1), (16, 1), (18, 1), (19, 1),
(27, 1), (28, 1), (29, 1), (30, 1), (31, 1), (32, 1);

-- Categoría 2: Árabes
INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES
(21, 2), (22, 2), (23, 2), (24, 2), (25, 2), (26, 2);

-- Categoría 3: Nichos
INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES
(1, 3), (4, 3), (5, 3), (8, 3), (9, 3), (14, 3), (17, 3), (20, 3);

-- Categoría 4: Decants
INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES
(1, 4), (2, 4), (4, 4), (5, 4), (8, 4), (14, 4), (21, 4), (22, 4), (27, 4), (29, 4), (30, 4), (32, 4);

-- -----------------------------------------------------------------------------
-- 8. IMÁGENES DE PRODUCTOS
-- -----------------------------------------------------------------------------
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
(20, 'https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85', 'Diptyque Philosykos', 0, 1),
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

-- -----------------------------------------------------------------------------
-- 9. BANNERS Y CARRUSELES DE LA HOME
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO banners (id, ubicacion, titulo, subtitulo, descripcion, texto_boton, enlace_url, imagen_desktop_key, imagen_mobile_key, orden, activo) VALUES
(1, 'hero_home', 'Encuentra una fragancia que hable por ti', 'Fragancias originales · Selección exclusiva', 'Descubre aromas que trascienden el tiempo y convierten tu esencia en una firma inolvidable.', 'Explorar perfumes', '/perfumes', 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=1800&q=90', 'https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85', 0, 1),
(2, 'hero_home', 'El arte de la distinción olfativa', 'Casas de autor y alta perfumería europea', 'Descubre aromas que trascienden el tiempo y convierten tu esencia en una firma inolvidable.', 'Ver Novedades', '/perfumes', 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=1800&q=90', 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85', 1, 1),
(3, 'hero_home', 'Asesoría cercana y personalizada', 'Descubre notas creadas a la medida de tu estilo', 'Descubre aromas que trascienden el tiempo y convierten tu esencia en una firma inolvidable.', 'Hablar con un asesor', '/contacto', 'https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=1800&q=90', 'https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85', 2, 1),
(4, 'promo_mitad', 'Tu aroma habla antes que tú', 'Recibe asesoría personalizada y encuentra esa fragancia que realmente se siente tuya.', NULL, 'Hablar con un asesor', '/contacto', 'https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85', NULL, 0, 1);

