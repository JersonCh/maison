import type { Producto } from "./producto";

export interface ItemCarrito {
  id: number;
  size: string; // Tamaño seleccionado (ej: "50 ml")
  qty: number; // Cantidad de unidades
}

export interface LineaCarrito extends ItemCarrito {
  producto: Producto;
  precio: number;
}

// Alias de retrocompatibilidad
export type CartItem = ItemCarrito;
export type CartLine = LineaCarrito;
