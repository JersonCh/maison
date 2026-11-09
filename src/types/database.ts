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
  tipo_presentacion?: "frasco" | "decant";
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
  tipo_comercial?: "disenador" | "arabe" | "nicho";
  familia_olfativa: string;
  imagen_principal: string;
  precio_minimo_centimos: number;
  precio_referencia_centimos: number | null;
  tamano_predeterminado_ml: number;
  es_destacado: boolean;
  tiene_decants?: boolean;
}

export interface ProductoDetalleCompleto {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  genero: Gender;
  concentracion: string;
  tipo_comercial?: "disenador" | "arabe" | "nicho";
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
    tipo_presentacion?: "frasco" | "decant";
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
  tipo_comercial?: "disenador" | "arabe" | "nicho";
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
  tipo_comercial?: "disenador" | "arabe" | "nicho";
  tiene_decants?: boolean;
  precio_decant_3ml?: number | null;
  precio_decant_5ml?: number | null;
  precio_decant_10ml?: number | null;
  genero: Gender;
  concentracion: string;
  familia_olfativa_id: number | null;
  familia_olfativa: string;
  descripcion: string;
  pais_origen: string | null;
  ocasion_uso: string | null;
  es_destacado: boolean;
  etiqueta_destacada?: "ninguna" | "nuevo" | "mas_vendido" | "edicion_limitada";
  activo: boolean;
  estado: "borrador" | "publicado" | "archivado";
  precio_50ml: number; // En Soles
  precio_100ml: number; // En Soles
  precio_referencia_50ml: number | null; // En Soles
  imagenes: string[]; // 1 a 3 fotos (portada obligatoria, caja y detalle opcionales)
  stock?: number;
}

/**
 * Carga útil para crear o actualizar un perfume en Cloudflare D1.
 * Admite de 1 a 3 fotos (Portada obligatoria, empaque y detalle opcionales).
 */
export interface DatosFormularioProducto {
  id?: number;
  nombre: string;
  slug?: string;
  marca_id?: number;
  nueva_marca?: string;
  tipo_comercial?: "disenador" | "arabe" | "nicho";
  tiene_decants?: boolean;
  precio_decant_3ml?: number | null;
  precio_decant_5ml?: number | null;
  precio_decant_10ml?: number | null;
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
  etiqueta_destacada?: "ninguna" | "nuevo" | "mas_vendido" | "edicion_limitada";
  activo: boolean;
  fotos: string[]; // [Foto 1: Portada obligatoria, Foto 2?: Caja opcional, Foto 3?: Detalle opcional]
  stock?: number;
}
