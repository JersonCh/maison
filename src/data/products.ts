import type { Gender, Product } from "@/types/product";
import { slugify } from "@/lib/slug";

export const images = {
    gold: "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85",
    black: "https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85",
    blue: "https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85",
    niche: "https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85",
    clean: "https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=900&q=85",
    pink: "https://images.unsplash.com/photo-1630573133526-8d090e0269af?auto=format&fit=crop&w=900&q=85",
    rose: "https://images.unsplash.com/photo-1708486235073-14879ff14c4c?auto=format&fit=crop&w=900&q=85",
    linen: "https://images.unsplash.com/photo-1678984633768-c4fd5a01732a?auto=format&fit=crop&w=900&q=85",
    sand: "https://images.unsplash.com/photo-1675317742083-95aef8e322ea?auto=format&fit=crop&w=900&q=85",
    sink: "https://images.unsplash.com/photo-1635796436337-50481b9fa2ad?auto=format&fit=crop&w=900&q=85",
};

export const heroImage =
    "https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=1800&q=90";

export const categoryImages: Record<Gender, string> = {
    Hombre: "https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85",
    Mujer: "https://images.unsplash.com/photo-1630573133526-8d090e0269af?auto=format&fit=crop&w=900&q=85",
    Unisex: "https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85",
};

const createProduct = (
    id: number,
    brand: string,
    name: string,
    gender: Gender,
    family: string,
    price: number,
    image: string,
    flags: Partial<Product> = {},
): Product => ({
    id,
    slug: slugify(name),
    brand,
    name,
    gender,
    family,
    image,
    gallery: [image, images.gold, images.clean],
    description:
        "Una composición refinada de gran presencia y excelente fijación. Seleccionada para quienes buscan una firma olfativa memorable, elegante y contemporánea.",
    variants: [
        { size: "50 ml", price },
        { size: "100 ml", price: price + 130 },
    ],
    stock: 8 + (id % 11),
    active: true,
    ...flags,
});

export const products: Product[] = [
    createProduct(1, "Maison Francis Kurkdjian", "Baccarat Rouge 540", "Unisex", "Ámbar floral", 1090, images.gold, { featured: true, oldPrice: 1190 }),
    createProduct(2, "Dior", "Sauvage Elixir", "Hombre", "Aromática especiada", 790, images.black, { featured: true }),
    createProduct(3, "Carolina Herrera", "Good Girl Blush", "Mujer", "Floral", 520, images.pink, { featured: true, oldPrice: 590 }),
    createProduct(4, "Creed", "Aventus", "Hombre", "Chipre frutal", 1250, images.blue, { featured: true }),
    createProduct(5, "Tom Ford", "Oud Wood", "Unisex", "Amaderada", 980, images.niche, { featured: true }),
    createProduct(6, "Giorgio Armani", "My Way", "Mujer", "Floral blanca", 490, images.rose, { recent: true }),
    createProduct(7, "Yves Saint Laurent", "Y Eau de Parfum", "Hombre", "Aromática", 560, images.sink, { recent: true }),
    createProduct(8, "Parfums de Marly", "Delina", "Mujer", "Floral frutal", 1190, images.linen, { recent: true }),
    createProduct(9, "Byredo", "Bal d'Afrique", "Unisex", "Amaderada", 970, images.clean, { recent: true }),
    createProduct(10, "Chanel", "Bleu de Chanel", "Hombre", "Amaderada aromática", 690, images.black, { oldPrice: 740 }),
    createProduct(11, "Lancôme", "La Vie Est Belle", "Mujer", "Gourmand", 460, images.pink),
    createProduct(12, "Versace", "Eros", "Hombre", "Oriental fresca", 390, images.blue),
    createProduct(13, "Narciso Rodriguez", "For Her", "Mujer", "Almizclada", 480, images.rose),
    createProduct(14, "Le Labo", "Santal 33", "Unisex", "Amaderada", 990, images.sand),
    createProduct(15, "Jean Paul Gaultier", "Le Male Le Parfum", "Hombre", "Oriental", 530, images.black),
    createProduct(16, "Valentino", "Donna Born in Roma", "Mujer", "Floral oriental", 510, images.linen),
    createProduct(17, "Jo Malone", "Wood Sage & Sea Salt", "Unisex", "Aromática marina", 690, images.clean),
    createProduct(18, "Hermès", "Terre d'Hermès", "Hombre", "Amaderada especiada", 570, images.sand),
    createProduct(19, "Mugler", "Alien Goddess", "Mujer", "Ámbar floral", 490, images.gold),
    createProduct(20, "Diptyque", "Philosykos", "Unisex", "Verde amaderada", 810, images.niche),
];

// Helper functions for data access
export function getAllProducts(): Product[] {
    return products.filter((p) => p.active !== false);
}

export function getProductBySlug(slug: string): Product | undefined {
    return products.find((p) => p.slug === slug);
}

export function getProductById(id: number): Product | undefined {
    return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
    return products.filter((p) => p.featured && p.active !== false);
}

export function getRecentProducts(): Product[] {
    return products.filter((p) => p.recent && p.active !== false);
}

export function getProductsByGender(gender: Gender): Product[] {
    return products.filter((p) => p.gender === gender && p.active !== false);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
    return products
        .filter((p) => p.id !== product.id && p.active !== false && (p.gender === product.gender || p.family === product.family))
        .slice(0, limit);
}
