/**
 * Capa de acceso a datos para Cloudflare D1 en Maison des Parfums.
 * Re-exporta la arquitectura modular por dominios implementada en `@/lib/database`:
 * - Configuración de tienda y banners (`./database/config`)
 * - Casas de perfumería y familias olfativas (`./database/brands`)
 * - Gestión de productos para administración (`./database/productsAdmin`)
 * - Catálogo y detalle público para clientes (`./database/productsStore`)
 * - Importación masiva desde Excel / CSV (`./database/importCsv`)
 */

export * from "./database/index";
