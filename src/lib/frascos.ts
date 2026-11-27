export const TAMANOS_FRASCO_ESTANDAR = [
  { ml: 50, field: "precio_50ml", refField: "precio_referencia_50ml", placeholder: "Ej. 490", frecuente: true },
  { ml: 55, field: "precio_55ml", refField: "precio_referencia_55ml", placeholder: "Ej. 480", frecuente: false },
  { ml: 75, field: "precio_75ml", refField: "precio_referencia_75ml", placeholder: "Ej. 520", frecuente: true },
  { ml: 80, field: "precio_80ml", refField: "precio_referencia_80ml", placeholder: "Ej. 540", frecuente: false },
  { ml: 90, field: "precio_90ml", refField: "precio_referencia_90ml", placeholder: "Ej. 580", frecuente: false },
  { ml: 100, field: "precio_100ml", refField: "precio_referencia_100ml", placeholder: "Ej. 620", frecuente: true },
  { ml: 105, field: "precio_105ml", refField: "precio_referencia_105ml", placeholder: "Ej. 640", frecuente: false },
  { ml: 118, field: "precio_118ml", refField: "precio_referencia_118ml", placeholder: "Ej. 660", frecuente: false },
  { ml: 120, field: "precio_120ml", refField: "precio_referencia_120ml", placeholder: "Ej. 670", frecuente: false },
  { ml: 125, field: "precio_125ml", refField: "precio_referencia_125ml", placeholder: "Ej. 680", frecuente: true },
  { ml: 150, field: "precio_150ml", refField: "precio_referencia_150ml", placeholder: "Ej. 850", frecuente: true },
  { ml: 200, field: "precio_200ml", refField: "precio_referencia_200ml", placeholder: "Ej. 920", frecuente: true },
  { ml: 240, field: "precio_240ml", refField: "precio_referencia_240ml", placeholder: "Ej. 1050", frecuente: false },
  { ml: 250, field: "precio_250ml", refField: "precio_referencia_250ml", placeholder: "Ej. 1100", frecuente: false },
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
