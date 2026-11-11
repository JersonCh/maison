export const TAMANOS_FRASCO_ESTANDAR = [
  { ml: 50, field: "precio_50ml", refField: "precio_referencia_50ml", placeholder: "Ej. 490" },
  { ml: 75, field: "precio_75ml", refField: "precio_referencia_75ml", placeholder: "Ej. 520" },
  { ml: 100, field: "precio_100ml", refField: "precio_referencia_100ml", placeholder: "Ej. 620" },
  { ml: 125, field: "precio_125ml", refField: "precio_referencia_125ml", placeholder: "Ej. 680" },
  { ml: 150, field: "precio_150ml", refField: "precio_referencia_150ml", placeholder: "Ej. 850" },
  { ml: 200, field: "precio_200ml", refField: "precio_referencia_200ml", placeholder: "Ej. 920" },
] as const;

export type CampoPrecioFrasco = (typeof TAMANOS_FRASCO_ESTANDAR)[number]["field"];
export type CampoPrecioReferenciaFrasco = (typeof TAMANOS_FRASCO_ESTANDAR)[number]["refField"];

/**
 * Retorna el menor precio positivo disponible entre las presentaciones de frasco,
 * o 0 si todavía no hay ninguno definido.
 */
export function obtenerPrecioMinimoFrasco(
  precios: Partial<Record<CampoPrecioFrasco, number | "" | null | undefined>>,
): number {
  let minimo = Infinity;
  for (const { field } of TAMANOS_FRASCO_ESTANDAR) {
    const val = Number(precios[field] || 0);
    if (val > 0 && val < minimo) {
      minimo = val;
    }
  }
  return minimo === Infinity ? 0 : minimo;
}
