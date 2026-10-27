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
