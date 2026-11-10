import type { CommercialType } from "@/types/product";

/**
 * Función utilitaria para normalizar títulos y generar slugs legibles y URL-friendly.
 */
export function normalizarTextoParaSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normaliza el tipo comercial obtenido de la base de datos (marcas.tipo_comercial).
 * Todo proviene 100% de la base de datos sin lógica ni marcas hardcodeadas.
 */
export function normalizarTipoComercial(tipoDb?: string | null): CommercialType {
  if (tipoDb === "arabe" || tipoDb === "nicho" || tipoDb === "disenador") {
    return tipoDb as CommercialType;
  }
  return "disenador";
}

