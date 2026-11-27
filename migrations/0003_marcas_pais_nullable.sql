-- =============================================================================
-- MAISON DES PARFUMS - MIGRACIÓN 0003
-- Propósito: Permitir que marcas.pais_origen sea nulable (NULL por defecto)
-- =============================================================================

PRAGMA foreign_keys = OFF;

CREATE TABLE marcas_nueva (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    pais_origen TEXT,
    tipo_comercial TEXT DEFAULT 'disenador' CHECK(tipo_comercial IN ('disenador', 'arabe', 'nicho')),
    logo_key TEXT,
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

INSERT INTO marcas_nueva (id, nombre, slug, pais_origen, tipo_comercial, logo_key, activo, created_at, updated_at)
SELECT id, nombre, slug, NULLIF(TRIM(pais_origen), ''), tipo_comercial, logo_key, activo, created_at, updated_at
FROM marcas;

DROP TABLE marcas;
ALTER TABLE marcas_nueva RENAME TO marcas;

CREATE TRIGGER IF NOT EXISTS trg_marcas_updated_at AFTER UPDATE ON marcas
BEGIN
    UPDATE marcas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

PRAGMA foreign_keys = ON;
