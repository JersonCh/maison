/**
 * Módulo de Base de Datos Cloudflare D1 de Maison des Parfums.
 * Arquitectura modular separada por dominios:
 * - config: Configuración comercial de tienda y banners.
 * - brands: Casas de perfumería y familias olfativas.
 * - productsAdmin: Gestión de productos en panel administrativo (CRUD).
 * - productsStore: Catálogo, fichas de detalle y fragancias relacionadas para frontend.
 * - importCsv: Importación y actualización masiva desde planillas Excel / CSV.
 * - utils: Normalización de slugs y tipos comerciales.
 * - common: Estructuras y valores por defecto para pirámides olfativas y características.
 */

export * from "./utils";
export * from "./common";
export * from "./config";
export * from "./brands";
export * from "./productsAdmin";
export * from "./productsStore";
export * from "./importCsv";

