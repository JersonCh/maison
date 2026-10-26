import type { Genero, Producto } from "@/types/producto";
import { crearSlug } from "@/lib/slug";

export const imagenes = {
  oro: "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=900&q=85",
  negro: "https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85",
  azul: "https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85",
  nicho: "https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85",
  limpio: "https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=900&q=85",
  rosa: "https://images.unsplash.com/photo-1630573133526-8d090e0269af?auto=format&fit=crop&w=900&q=85",
  rosado: "https://images.unsplash.com/photo-1708486235073-14879ff14c4c?auto=format&fit=crop&w=900&q=85",
  lino: "https://images.unsplash.com/photo-1678984633768-c4fd5a01732a?auto=format&fit=crop&w=900&q=85",
  arena: "https://images.unsplash.com/photo-1675317742083-95aef8e322ea?auto=format&fit=crop&w=900&q=85",
  lavabo: "https://images.unsplash.com/photo-1635796436337-50481b9fa2ad?auto=format&fit=crop&w=900&q=85",
};

export const imagenHero =
  "https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=1800&q=90";

export const imagenesCategorias: Record<Genero, string> = {
  Hombre: "https://images.unsplash.com/photo-1705936118918-870095881e61?auto=format&fit=crop&w=900&q=85",
  Mujer: "https://images.unsplash.com/photo-1630573133526-8d090e0269af?auto=format&fit=crop&w=900&q=85",
  Unisex: "https://images.unsplash.com/photo-1672848700906-2b8ca62639e4?auto=format&fit=crop&w=900&q=85",
};

// Aliases para mantener compatibilidad
export const images = imagenes;
export const heroImage = imagenHero;
export const categoryImages = imagenesCategorias;

const fabricarProducto = (
  id: number,
  marca: string,
  nombre: string,
  genero: Genero,
  familia: string,
  precio: number,
  imagen: string,
  propiedadesExtra: Partial<Producto> = {},
): Producto => ({
  id,
  slug: crearSlug(nombre),
  brand: marca,
  name: nombre,
  gender: genero,
  family: familia,
  image: imagen,
  gallery: [imagen, imagenes.oro, imagenes.limpio],
  description:
    "Una composición refinada de gran presencia y excelente fijación. Seleccionada para quienes buscan una firma olfativa memorable, elegante y contemporánea.",
  variants: [
    { size: "50 ml", price: precio },
    { size: "100 ml", price: precio + 130 },
  ],
  stock: 8 + (id % 11),
  active: true,
  ...propiedadesExtra,
});

export const productos: Producto[] = [
  fabricarProducto(1, "Maison Francis Kurkdjian", "Baccarat Rouge 540", "Unisex", "Ámbar floral", 1090, imagenes.oro, { featured: true, oldPrice: 1190 }),
  fabricarProducto(2, "Dior", "Sauvage Elixir", "Hombre", "Aromática especiada", 790, imagenes.negro, { featured: true }),
  fabricarProducto(3, "Carolina Herrera", "Good Girl Blush", "Mujer", "Floral", 520, imagenes.rosa, { featured: true, oldPrice: 590 }),
  fabricarProducto(4, "Creed", "Aventus", "Hombre", "Chipre frutal", 1250, imagenes.azul, { featured: true }),
  fabricarProducto(5, "Tom Ford", "Oud Wood", "Unisex", "Amaderada", 980, imagenes.nicho, { featured: true }),
  fabricarProducto(6, "Giorgio Armani", "My Way", "Mujer", "Floral blanca", 490, imagenes.rosado, { recent: true }),
  fabricarProducto(7, "Yves Saint Laurent", "Y Eau de Parfum", "Hombre", "Aromática", 560, imagenes.lavabo, { recent: true }),
  fabricarProducto(8, "Parfums de Marly", "Delina", "Mujer", "Floral frutal", 1190, imagenes.lino, { recent: true }),
  fabricarProducto(9, "Byredo", "Bal d'Afrique", "Unisex", "Amaderada", 970, imagenes.limpio, { recent: true }),
  fabricarProducto(10, "Chanel", "Bleu de Chanel", "Hombre", "Amaderada aromática", 690, imagenes.negro, { oldPrice: 740 }),
  fabricarProducto(11, "Lancôme", "La Vie Est Belle", "Mujer", "Gourmand", 460, imagenes.rosa),
  fabricarProducto(12, "Versace", "Eros", "Hombre", "Oriental fresca", 390, imagenes.azul),
  fabricarProducto(13, "Narciso Rodriguez", "For Her", "Mujer", "Almizclada", 480, imagenes.rosado),
  fabricarProducto(14, "Le Labo", "Santal 33", "Unisex", "Amaderada", 990, imagenes.arena),
  fabricarProducto(15, "Jean Paul Gaultier", "Le Male Le Parfum", "Hombre", "Oriental", 530, imagenes.negro),
  fabricarProducto(16, "Valentino", "Donna Born in Roma", "Mujer", "Floral oriental", 510, imagenes.lino),
  fabricarProducto(17, "Jo Malone", "Wood Sage & Sea Salt", "Unisex", "Aromática marina", 690, imagenes.limpio),
  fabricarProducto(18, "Hermès", "Terre d'Hermès", "Hombre", "Amaderada especiada", 570, imagenes.arena),
  fabricarProducto(19, "Mugler", "Alien Goddess", "Mujer", "Ámbar floral", 490, imagenes.oro),
  fabricarProducto(20, "Diptyque", "Philosykos", "Unisex", "Verde amaderada", 810, imagenes.nicho),
];

// Funciones de acceso al catálogo en español
export function obtenerTodosLosProductos(): Producto[] {
  return productos.filter((p) => p.active !== false);
}

export function obtenerProductoPorSlug(slug: string): Producto | undefined {
  return productos.find((p) => p.slug === slug);
}

export function obtenerProductoPorId(id: number): Producto | undefined {
  return productos.find((p) => p.id === id);
}

export function obtenerProductosDestacados(): Producto[] {
  return productos.filter((p) => p.featured && p.active !== false);
}

export function obtenerProductosRecientes(): Producto[] {
  return productos.filter((p) => p.recent && p.active !== false);
}

export function obtenerProductosPorGenero(genero: Genero): Producto[] {
  return productos.filter((p) => p.gender === genero && p.active !== false);
}

export function obtenerProductosRelacionados(producto: Producto, limite = 4): Producto[] {
  return productos
    .filter((p) => p.id !== producto.id && p.active !== false && (p.gender === producto.gender || p.family === producto.family))
    .slice(0, limite);
}

// Alias de retrocompatibilidad
export const products = productos;
export const getAllProducts = obtenerTodosLosProductos;
export const getProductBySlug = obtenerProductoPorSlug;
export const getProductById = obtenerProductoPorId;
export const getFeaturedProducts = obtenerProductosDestacados;
export const getRecentProducts = obtenerProductosRecientes;
export const getProductsByGender = obtenerProductosPorGenero;
export const getRelatedProducts = obtenerProductosRelacionados;
