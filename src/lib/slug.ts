/**
 * Convierte un texto en un slug amigable para URLs limpias y SEO.
 * Ejemplo: "Baccarat Rouge 540" -> "baccarat-rouge-540"
 */
export function crearSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar tildes y diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Alias
export const slugify = crearSlug;
