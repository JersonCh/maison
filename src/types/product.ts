export type Gender = "Hombre" | "Mujer" | "Unisex";
export type CommercialType = "disenador" | "arabe" | "nicho";

export interface ProductVariant {
    size: string;
    price: number;
    isDecant?: boolean;
}

export interface Product {
    id: number;
    slug: string;
    brand: string;
    name: string;
    gender: Gender;
    family: string;
    commercialType?: CommercialType;
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
