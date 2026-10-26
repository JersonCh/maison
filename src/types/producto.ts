export type Genero = "Hombre" | "Mujer" | "Unisex";

export interface VarianteProducto {
  size: string; // Tamaño / presentación (ej: "50 ml", "100 ml")
  price: number; // Precio en soles
}

export interface Producto {
  id: number;
  slug: string; // Identificador amigable para URL (ej: "baccarat-rouge-540")
  brand: string; // Marca (ej: "Dior", "Chanel")
  name: string; // Nombre del perfume
  gender: Genero; // Género
  family: string; // Familia olfativa (ej: "Ámbar floral")
  description: string; // Descripción del producto
  image: string; // Imagen principal
  gallery: string[]; // Galería de fotos
  variants: VarianteProducto[]; // Variantes de tamaño y precio
  oldPrice?: number; // Precio anterior de oferta
  stock: number; // Stock disponible en unidades
  featured?: boolean; // Producto destacado en inicio
  recent?: boolean; // Producto recién llegado / nuevo
  active?: boolean; // Estado activo en tienda
}

// Alias de retrocompatibilidad
export type Product = Producto;
export type Gender = Genero;
export type ProductVariant = VarianteProducto;
