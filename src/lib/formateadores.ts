/**
 * Formatea un valor numérico a moneda peruana (soles, S/).
 * Ejemplo: 1090 -> "S/ 1,090"
 */
export function formatearPrecio(precio: number): string {
  return `S/ ${precio.toLocaleString("es-PE")}`;
}

/**
 * Calcula y formatea el porcentaje de descuento si existe precio anterior.
 * Ejemplo: (520, 590) -> "-12%"
 */
export function formatearDescuento(precio: number, precioAnterior?: number): string | null {
  if (!precioAnterior || precioAnterior <= precio) return null;
  const porcentaje = Math.round((1 - precio / precioAnterior) * 100);
  return `-${porcentaje}%`;
}

// Alias de retrocompatibilidad
export const formatPrice = formatearPrecio;
export const formatDiscount = formatearDescuento;
