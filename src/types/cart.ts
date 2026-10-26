import type { Product } from "./product";

export interface CartItem {
  id: number;
  size: string;
  qty: number;
}

export interface CartLine extends CartItem {
  product: Product;
  price: number;
}
