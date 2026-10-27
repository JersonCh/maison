-- =============================================================================
-- MAISON DES PARFUMS - ESQUEMA DE BASE DE DATOS INICIAL (REVISIÓN AUDITADA)
-- Motor: SQLite / Cloudflare D1
-- Migración: 0001_initial_schema.sql
-- =============================================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- 1. CATÁLOGO BASE
-- -----------------------------------------------------------------------------

-- Marcas / Casas de Perfumería (ej. Dior, Tom Ford, Creed, MFK)
CREATE TABLE IF NOT EXISTS marcas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    logo_key TEXT,
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Perfumes / Productos principales
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marca_id INTEGER NOT NULL REFERENCES marcas(id) ON DELETE RESTRICT,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    genero TEXT NOT NULL CHECK(genero IN ('Hombre', 'Mujer', 'Unisex')),
    concentracion TEXT DEFAULT 'Eau de Parfum', -- EDP, EDT, Parfum, Extrait
    anio_lanzamiento INTEGER CHECK(anio_lanzamiento IS NULL OR anio_lanzamiento > 1900),
    pais_origen TEXT,                           -- Opcional, sin valor por defecto arbitrario
    ocasion_uso TEXT,                           -- 'Noche y eventos', 'Uso diario'
    meta_titulo TEXT,
    meta_descripcion TEXT,
    estado TEXT NOT NULL DEFAULT 'borrador' CHECK(estado IN ('borrador', 'publicado', 'archivado')),
    es_destacado INTEGER NOT NULL DEFAULT 0 CHECK(es_destacado IN (0, 1)),
    publicado_en TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Variantes de tamaño y presentación (tamano_ml admite decimales para decants/discovery sets)
CREATE TABLE IF NOT EXISTS variantes_producto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    tamano_ml REAL NOT NULL CHECK(tamano_ml > 0),             -- Admite 1.5, 2.5, 50, 100 ml
    precio_centimos INTEGER NOT NULL CHECK(precio_centimos >= 0),
    precio_referencia_centimos INTEGER CHECK(precio_referencia_centimos IS NULL OR precio_referencia_centimos >= 0),
    es_predeterminada INTEGER NOT NULL DEFAULT 0 CHECK(es_predeterminada IN (0, 1)),
    controla_stock INTEGER NOT NULL DEFAULT 0 CHECK(controla_stock IN (0, 1)), -- 0 por defecto hasta inicializar inventario
    modalidad_disponibilidad TEXT NOT NULL DEFAULT 'venta_regular' 
        CHECK(modalidad_disponibilidad IN ('venta_regular', 'bajo_pedido', 'preventa')),
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Categorías temáticas (ej. Perfumería Árabe, Nicho, Sets de Regalo)
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_key TEXT,
    orden INTEGER NOT NULL DEFAULT 0 CHECK(orden >= 0),
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1))
);

-- Relación N:M Productos - Categorías
CREATE TABLE IF NOT EXISTS producto_categorias (
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (producto_id, categoria_id)
);

-- Galería de imágenes múltiples por perfume (Cloudflare R2)
CREATE TABLE IF NOT EXISTS imagenes_producto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    variante_id INTEGER REFERENCES variantes_producto(id) ON DELETE SET NULL,
    clave_archivo TEXT NOT NULL,
    texto_alternativo TEXT,
    orden INTEGER NOT NULL DEFAULT 0 CHECK(orden >= 0),
    es_principal INTEGER NOT NULL DEFAULT 0 CHECK(es_principal IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Curaduría manual de fragancias afines ("También te puede gustar")
CREATE TABLE IF NOT EXISTS productos_relacionados (
    producto_origen_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    producto_relacionado_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL DEFAULT 0 CHECK(orden >= 0),
    PRIMARY KEY (producto_origen_id, producto_relacionado_id),
    CHECK (producto_origen_id <> producto_relacionado_id)
);

-- -----------------------------------------------------------------------------
-- 2. CONTENIDO ESPECIALIZADO DE PERFUMERÍA
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS familias_olfativas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS producto_familias_olfativas (
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    familia_olfativa_id INTEGER NOT NULL REFERENCES familias_olfativas(id) ON DELETE CASCADE,
    PRIMARY KEY (producto_id, familia_olfativa_id)
);

CREATE TABLE IF NOT EXISTS notas_aromaticas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    imagen_key TEXT
);

-- Pirámide Olfativa (Salida, Corazón y Fondo)
CREATE TABLE IF NOT EXISTS producto_notas (
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    nota_aromatica_id INTEGER NOT NULL REFERENCES notas_aromaticas(id) ON DELETE CASCADE,
    etapa TEXT NOT NULL CHECK(etapa IN ('salida', 'corazon', 'fondo')),
    PRIMARY KEY (producto_id, nota_aromatica_id, etapa)
);

-- -----------------------------------------------------------------------------
-- 3. COLECCIONES COMERCIALES Y BANNERS (CARRUSELES MULTIDIAPOSITIVA)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS colecciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_key TEXT,
    tipo_presentacion TEXT NOT NULL DEFAULT 'carrusel' CHECK(tipo_presentacion IN ('carrusel', 'grilla')),
    orden INTEGER NOT NULL DEFAULT 0 CHECK(orden >= 0),
    estado TEXT NOT NULL DEFAULT 'publicado' CHECK(estado IN ('borrador', 'publicado', 'archivado')),
    publicado_en TEXT
);

CREATE TABLE IF NOT EXISTS coleccion_productos (
    coleccion_id INTEGER NOT NULL REFERENCES colecciones(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL DEFAULT 0 CHECK(orden >= 0),
    PRIMARY KEY (coleccion_id, producto_id)
);

CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ubicacion TEXT NOT NULL,              -- 'hero_home', 'promo_mitad', 'barra_anuncio'
    titulo TEXT,
    subtitulo TEXT,
    texto_boton TEXT,
    enlace_url TEXT,
    imagen_desktop_key TEXT NOT NULL,     -- Imagen PC (R2)
    imagen_mobile_key TEXT,               -- Imagen Smartphone (R2)
    orden INTEGER NOT NULL DEFAULT 0 CHECK(orden >= 0),
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- -----------------------------------------------------------------------------
-- 4. INVENTARIO Y MOVIMIENTOS HISTÓRICOS (PROTEGIDOS CONTRA BORRADO)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS almacenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    ubicacion TEXT,
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1))
);

-- Existencias reales (ON DELETE RESTRICT para evitar inconsistencias contables)
CREATE TABLE IF NOT EXISTS inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    variante_id INTEGER NOT NULL REFERENCES variantes_producto(id) ON DELETE RESTRICT,
    almacen_id INTEGER NOT NULL REFERENCES almacenes(id) ON DELETE RESTRICT,
    cantidad_disponible INTEGER NOT NULL DEFAULT 0 CHECK(cantidad_disponible >= 0),
    cantidad_reservada INTEGER NOT NULL DEFAULT 0 CHECK(cantidad_reservada >= 0),
    cantidad_minima INTEGER NOT NULL DEFAULT 0 CHECK(cantidad_minima >= 0),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UNIQUE(variante_id, almacen_id)
);

-- Bitácora inmutable de movimientos
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    variante_id INTEGER NOT NULL REFERENCES variantes_producto(id) ON DELETE RESTRICT,
    almacen_id INTEGER NOT NULL REFERENCES almacenes(id) ON DELETE RESTRICT,
    tipo TEXT NOT NULL CHECK(tipo IN ('ENTRADA', 'SALIDA_VENTA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'RESERVA', 'LIBERACION')),
    cantidad INTEGER NOT NULL CHECK(cantidad > 0),
    motivo TEXT,
    usuario_admin_id INTEGER REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    referencia TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- -----------------------------------------------------------------------------
-- 5. GESTIÓN DE PEDIDOS Y CONSULTAS WHATSAPP
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_pedido TEXT NOT NULL UNIQUE,   -- ej. 'MDP-1001'
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    cliente_direccion TEXT,
    ciudad TEXT DEFAULT 'Lima',
    subtotal_centimos INTEGER NOT NULL CHECK(subtotal_centimos >= 0),
    costo_envio_centimos INTEGER NOT NULL DEFAULT 0 CHECK(costo_envio_centimos >= 0),
    total_centimos INTEGER NOT NULL CHECK(total_centimos >= 0),
    estado TEXT NOT NULL DEFAULT 'pendiente_whatsapp' 
        CHECK(estado IN ('pendiente_whatsapp', 'confirmado', 'pagado', 'enviado', 'entregado', 'cancelado')),
    metodo_pago_coordinado TEXT,
    notas_cliente TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS pedido_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    variante_id INTEGER REFERENCES variantes_producto(id) ON DELETE RESTRICT, -- Preserva trazabilidad de variante vendida
    producto_nombre_historico TEXT NOT NULL,
    tamano_ml_historico REAL NOT NULL,
    precio_unitario_centimos INTEGER NOT NULL CHECK(precio_unitario_centimos >= 0),
    cantidad INTEGER NOT NULL CHECK(cantidad > 0)
);

-- -----------------------------------------------------------------------------
-- 6. CONFIGURACIÓN COMERCIAL Y ADMINISTRACIÓN
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS configuracion_tienda (
    clave TEXT PRIMARY KEY,
    valor TEXT,
    descripcion TEXT,
    categoria TEXT NOT NULL DEFAULT 'general',
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS usuarios_admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    correo TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    hash_contrasena TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'editor' CHECK(rol IN ('superadmin', 'administrador', 'editor')),
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS sesiones_admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_admin_id INTEGER NOT NULL REFERENCES usuarios_admin(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expira_en TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS historial_admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_admin_id INTEGER REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    accion TEXT NOT NULL,
    tipo_entidad TEXT NOT NULL,
    entidad_id INTEGER,
    detalles TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- -----------------------------------------------------------------------------
-- 7. ÍNDICES OPTIMIZADOS (SIN REDUNDANCIAS Y CON COBERTURA INVERSA)
-- -----------------------------------------------------------------------------

-- Filtros frecuentes de catálogo
CREATE INDEX IF NOT EXISTS idx_productos_marca ON productos(marca_id);
CREATE INDEX IF NOT EXISTS idx_productos_genero ON productos(genero);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON productos(estado);
CREATE INDEX IF NOT EXISTS idx_variantes_producto ON variantes_producto(producto_id);

-- Índices inversos en tablas intermedias para acelerar filtros de catálogo
CREATE INDEX IF NOT EXISTS idx_producto_categorias_cat ON producto_categorias(categoria_id);
CREATE INDEX IF NOT EXISTS idx_producto_familias_fam ON producto_familias_olfativas(familia_olfativa_id);
CREATE INDEX IF NOT EXISTS idx_producto_notas_nota ON producto_notas(nota_aromatica_id);
CREATE INDEX IF NOT EXISTS idx_coleccion_productos_prod ON coleccion_productos(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_relacionados_rel ON productos_relacionados(producto_relacionado_id);

-- Banners y carruseles
CREATE INDEX IF NOT EXISTS idx_banners_ubicacion ON banners(ubicacion, orden, activo);

-- Pedidos e inventario
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_movimientos_inv_fecha ON movimientos_inventario(created_at);

-- ÍNDICE ÚNICO PARCIAL: Garantiza que un producto tenga a lo sumo UNA imagen principal
CREATE UNIQUE INDEX IF NOT EXISTS idx_producto_imagen_principal 
ON imagenes_producto(producto_id) WHERE es_principal = 1;

-- -----------------------------------------------------------------------------
-- 8. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE updated_at
-- -----------------------------------------------------------------------------

CREATE TRIGGER IF NOT EXISTS trg_marcas_updated_at AFTER UPDATE ON marcas
BEGIN
    UPDATE marcas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_productos_updated_at AFTER UPDATE ON productos
BEGIN
    UPDATE productos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_variantes_updated_at AFTER UPDATE ON variantes_producto
BEGIN
    UPDATE variantes_producto SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_banners_updated_at AFTER UPDATE ON banners
BEGIN
    UPDATE banners SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_inventario_updated_at AFTER UPDATE ON inventario
BEGIN
    UPDATE inventario SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_pedidos_updated_at AFTER UPDATE ON pedidos
BEGIN
    UPDATE pedidos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_configuracion_updated_at AFTER UPDATE ON configuracion_tienda
BEGIN
    UPDATE configuracion_tienda SET updated_at = CURRENT_TIMESTAMP WHERE clave = NEW.clave;
END;

-- -----------------------------------------------------------------------------
-- 9. VALORES INICIALES POR DEFECTO PARA CONFIGURACIÓN COMERCIAL
-- -----------------------------------------------------------------------------

INSERT OR IGNORE INTO configuracion_tienda (clave, valor, descripcion, categoria) VALUES
('whatsapp_pedidos', '51999999999', 'Número de WhatsApp que recibe las órdenes de compra', 'contacto'),
('whatsapp_mensaje_intro', 'Hola Maison des Parfums, deseo solicitar el siguiente pedido:', 'Encabezado del mensaje de compra', 'contacto'),
('instagram_url', 'https://instagram.com/maisondesparfums', 'Enlace al perfil de Instagram', 'redes'),
('facebook_url', 'https://facebook.com/maisondesparfums', 'Enlace al perfil de Facebook', 'redes'),
('tiktok_url', 'https://tiktok.com/@maisondesparfums', 'Enlace al canal de TikTok', 'redes'),
('horario_comercial', 'Lunes a sábado · 10:00 am - 8:00 pm', 'Horario de atención al cliente', 'contacto'),
('anuncio_superior_texto', 'Fragancias 100% Originales · Envíos a todo el Perú · Atención personalizada por WhatsApp', 'Texto de la barra de anuncios superior', 'anuncios'),
('anuncio_superior_activo', '1', '1: visible, 0: oculto', 'anuncios');

-- Almacén principal por defecto
INSERT OR IGNORE INTO almacenes (id, nombre, ubicacion, activo) VALUES
(1, 'Boutique Principal Lima', 'Lima, Perú', 1);
