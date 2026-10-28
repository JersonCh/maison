export type Gender = "Hombre" | "Mujer" | "Unisex";

export interface ProductVariant {
    size: string;
    price: number;
}

export interface Product {
    id: number;
    slug: string;
    brand: string;
    name: string;
    gender: Gender;
    family: string;
    description: string;
    image: string;
    gallery: string[];
    variants: ProductVariant[];
    oldPrice?: number;
    stock?: number;
    featured?: boolean;
    recent?: boolean;
    active?: boolean;
}
