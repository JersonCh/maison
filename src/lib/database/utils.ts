import type { CommercialType } from "@/types/product";

/**
 * Función utilitaria para normalizar títulos y generar slugs legibles y URL-friendly.
 */
export function normalizarTextoParaSlug(texto: string): string {
  let s = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
  while (s.startsWith("-")) s = s.slice(1);
  while (s.endsWith("-")) s = s.slice(0, -1);
  return s;
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

