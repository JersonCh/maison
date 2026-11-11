import type { Gender, CommercialType, Product, ProductVariant } from "@/types/product";
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
    commercialType: CommercialType = "disenador",
    decantPrices?: { decant3ml?: number; decant5ml?: number; decant10ml?: number },
): Product => {
    const variants: ProductVariant[] = [];
    if (decantPrices?.decant3ml) {
        variants.push({ size: "3 ml (Decant)", price: decantPrices.decant3ml, isDecant: true });
    }
    if (decantPrices?.decant5ml) {
        variants.push({ size: "5 ml (Decant)", price: decantPrices.decant5ml, isDecant: true });
    }
    if (decantPrices?.decant10ml) {
        variants.push({ size: "10 ml (Decant)", price: decantPrices.decant10ml, isDecant: true });
    }
    variants.push(
        { size: "50 ml", price, isDecant: false },
        { size: "100 ml", price: price + 130, isDecant: false }
    );

    return {
        id,
        slug: slugify(name),
        brand,
        name,
        gender,
        family,
        commercialType,
        image,
        gallery: [image, images.gold, images.clean],
        description:
            "Una composición refinada de gran presencia y excelente fijación. Seleccionada para quienes buscan una firma olfativa memorable, elegante y contemporánea.",
        variants,
        stock: 8 + (id % 11),
        active: true,
        ...flags,
    };
};

export const products: Product[] = [
    // --- NICHOS Y ALTA PERFUMERÍA DE AUTOR ---
    createProduct(1, "Maison Francis Kurkdjian", "Baccarat Rouge 540", "Unisex", "Ámbar floral", 1090, images.gold, { featured: true, oldPrice: 1190 }, "nicho", { decant5ml: 95, decant10ml: 175 }),
    createProduct(4, "Creed", "Aventus", "Hombre", "Chipre frutal", 1250, images.blue, { featured: true }, "nicho", { decant5ml: 115, decant10ml: 210 }),
    createProduct(5, "Tom Ford", "Oud Wood", "Unisex", "Amaderada", 980, images.niche, { featured: true }, "nicho", { decant5ml: 90, decant10ml: 165 }),
    createProduct(8, "Parfums de Marly", "Delina", "Mujer", "Floral frutal", 1190, images.linen, { recent: true }, "nicho", { decant5ml: 110, decant10ml: 200 }),
    createProduct(9, "Byredo", "Bal d'Afrique", "Unisex", "Amaderada", 970, images.clean, { recent: true }, "nicho", { decant5ml: 85, decant10ml: 155 }),
    createProduct(14, "Le Labo", "Santal 33", "Unisex", "Amaderada", 990, images.sand, {}, "nicho", { decant5ml: 95, decant10ml: 170 }),
    createProduct(17, "Jo Malone", "Wood Sage & Sea Salt", "Unisex", "Aromática marina", 690, images.clean, {}, "nicho"),
    createProduct(20, "Diptyque", "Philosykos", "Unisex", "Verde amaderada", 810, images.niche, {}, "nicho"),

    // --- DISEÑADOR (GRANDES CASAS INTERNACIONALES) ---
    createProduct(2, "Dior", "Sauvage Elixir", "Hombre", "Aromática especiada", 790, images.black, { featured: true }, "disenador", { decant5ml: 75, decant10ml: 135 }),
    createProduct(3, "Carolina Herrera", "Good Girl Blush", "Mujer", "Floral", 520, images.pink, { featured: true, oldPrice: 590 }, "disenador", { decant5ml: 55, decant10ml: 95 }),
    createProduct(6, "Giorgio Armani", "My Way", "Mujer", "Floral blanca", 490, images.rose, { recent: true }, "disenador"),
    createProduct(7, "Yves Saint Laurent", "Y Eau de Parfum", "Hombre", "Aromática", 560, images.sink, { recent: true }, "disenador", { decant5ml: 55, decant10ml: 95 }),
    createProduct(10, "Chanel", "Bleu de Chanel", "Hombre", "Amaderada aromática", 690, images.black, { oldPrice: 740 }, "disenador", { decant5ml: 65, decant10ml: 115 }),
    createProduct(11, "Lancôme", "La Vie Est Belle", "Mujer", "Gourmand", 460, images.pink, {}, "disenador"),
    createProduct(12, "Versace", "Eros", "Hombre", "Oriental fresca", 390, images.blue, {}, "disenador", { decant5ml: 45, decant10ml: 80 }),
    createProduct(13, "Narciso Rodriguez", "For Her", "Mujer", "Almizclada", 480, images.rose, {}, "disenador"),
    createProduct(15, "Jean Paul Gaultier", "Le Male Le Parfum", "Hombre", "Oriental", 530, images.black, {}, "disenador"),
    createProduct(16, "Valentino", "Donna Born in Roma", "Mujer", "Floral oriental", 510, images.linen, {}, "disenador"),
    createProduct(18, "Hermès", "Terre d'Hermès", "Hombre", "Amaderada especiada", 570, images.sand, {}, "disenador"),
    createProduct(19, "Mugler", "Alien Goddess", "Mujer", "Ámbar floral", 490, images.gold, {}, "disenador"),

    // --- PERFUMERÍA ÁRABE Y ORIENTAL ---
    createProduct(21, "Lattafa", "Khamrah", "Unisex", "Gourmand especiada", 240, images.gold, { featured: true }, "arabe", { decant5ml: 35, decant10ml: 60 }),
    createProduct(22, "Armaf", "Club de Nuit Intense Man", "Hombre", "Cítrica amaderada", 210, images.black, { recent: true }, "arabe", { decant5ml: 30, decant10ml: 55 }),
    createProduct(23, "Rasasi", "Hawas for Him", "Hombre", "Acuática aromática", 280, images.blue, {}, "arabe", { decant5ml: 38, decant10ml: 68 }),
    createProduct(24, "Lattafa", "Yara", "Mujer", "Gourmand floral", 220, images.pink, {}, "arabe", { decant5ml: 32, decant10ml: 58 }),
    createProduct(25, "Afnan", "9 PM", "Hombre", "Ámbar especiada", 230, images.sand, {}, "arabe", { decant5ml: 32, decant10ml: 58 }),
    createProduct(26, "Lattafa", "Bade'e Al Oud", "Unisex", "Amaderada oriental", 250, images.niche, {}, "arabe", { decant5ml: 35, decant10ml: 62 }),
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
