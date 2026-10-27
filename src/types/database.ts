import type { Gender } from "./product";

export interface VarianteDb {
  id: number;
  producto_id: number;
  sku: string | null;
  tamano_ml: number;
  precio_centimos: number;
  precio_referencia_centimos: number | null;
  es_predeterminada: number;
  controla_stock: number;
  modalidad_disponibilidad: string;
  activo: number;
}

export interface ImagenDb {
  id: number;
  producto_id: number;
  variante_id: number | null;
  clave_archivo: string;
  texto_alternativo: string | null;
  orden: number;
  es_principal: number;
}

export interface NotaOlfativa {
  nombre: string;
  etapa: "salida" | "corazon" | "fondo";
}

export interface PiramideOlfativa {
  salida: string[];
  corazon: string[];
  fondo: string[];
}

export interface ProductoCatalogo {
  id: number;
  nombre: string;
  slug: string;
  genero: Gender;
  concentracion: string;
  marca: string;
  marca_slug: string;
  familia_olfativa: string;
  imagen_principal: string;
  precio_minimo_centimos: number;
  precio_referencia_centimos: number | null;
  tamano_predeterminado_ml: number;
  es_destacado: boolean;
}

export interface ProductoDetalleCompleto {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  genero: Gender;
  concentracion: string;
  anio_lanzamiento: number | null;
  pais_origen: string | null;
  ocasion_uso: string | null;
  marca: string;
  marca_slug: string;
  familia_olfativa: string;
  variantes: {
    id: number;
    tamano_ml: number;
    precio_centimos: number;
    precio_referencia_centimos: number | null;
    es_predeterminada: boolean;
  }[];
  galeria_imagenes: string[];
  piramide_olfativa: PiramideOlfativa;
}

export interface BannerSlide {
  id: number;
  ubicacion: string;
  titulo: string | null;
  subtitulo: string | null;
  texto_boton: string | null;
  enlace_url: string | null;
  imagen_desktop: string;
  imagen_mobile: string | null;
  orden: number;
}

// =============================================================================
// METADATOS Y FORMULARIO ADMINISTRATIVO
// =============================================================================

export interface MarcaItem {
  id: number;
  nombre: string;
  slug: string;
}

export interface FamiliaOlfativaItem {
  id: number;
  nombre: string;
  slug: string;
}

/**
 * Representación completa de un producto para la tabla y edición en el panel administrativo.
 */
export interface ProductoAdminItem {
  id: number;
  nombre: string;
  slug: string;
  marca_id: number;
  marca: string;
  genero: Gender;
  concentracion: string;
  familia_olfativa_id: number | null;
  familia_olfativa: string;
  descripcion: string;
  pais_origen: string | null;
  ocasion_uso: string | null;
  es_destacado: boolean;
  activo: boolean;
  estado: "borrador" | "publicado" | "archivado";
  precio_50ml: number; // En Soles
  precio_100ml: number; // En Soles
  precio_referencia_50ml: number | null; // En Soles
  imagenes: [string, string, string]; // Exactamente 3 fotos: [Portada/Frasco, Caja/Empaque, Detalle/Contexto]
  stock: number;
}

/**
 * Carga útil para crear o actualizar un perfume en Cloudflare D1.
 * Asegura la regla de negocio de exactamente 3 imágenes y presentaciones de 50ml y 100ml.
 */
export interface DatosFormularioProducto {
  nombre: string;
  marca_id?: number;
  nueva_marca?: string;
  genero: Gender;
  concentracion: string;
  familia_olfativa_id?: number | null;
  nueva_familia?: string;
  descripcion: string;
  pais_origen?: string;
  ocasion_uso?: string;
  precio_50ml: number; // En Soles (se persiste multiplicado por 100 en céntimos)
  precio_100ml: number; // En Soles
  precio_referencia_50ml?: number | null; // En Soles
  es_destacado: boolean;
  activo: boolean;
  fotos: [string, string, string]; // [Foto 1: Portada, Foto 2: Caja, Foto 3: Detalle]
  stock?: number;
}
