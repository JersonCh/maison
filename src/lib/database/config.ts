import type { BannerSlide } from "@/types/database";

/**
 * Obtiene todos los parámetros de configuración de la tienda como un objeto clave-valor.
 * Ejemplo: { whatsapp_pedidos: '51999999999', instagram_url: '...' }
 */
export async function obtenerConfiguracionTienda(
  db: D1Database,
): Promise<Record<string, string>> {
  try {
    const { results } = await db
      .prepare("SELECT clave, valor FROM configuracion_tienda")
      .all<{ clave: string; valor: string }>();

    const configuracion: Record<string, string> = {};
    for (const fila of results) {
      configuracion[fila.clave] = fila.valor;
    }
    return configuracion;
  } catch (error) {
    console.warn("No se pudo obtener configuracion_tienda de D1 (usando valores por defecto):", error);
    return {};
  }
}

/**
 * Actualiza uno o varios parámetros de configuración comercial en la base de datos.
 */
export async function actualizarConfiguracionTienda(
  db: D1Database,
  nuevosValores: Record<string, string>,
): Promise<boolean> {
  const sentencias = Object.entries(nuevosValores).map(([clave, valor]) =>
    db
      .prepare(
        `INSERT INTO configuracion_tienda (clave, valor) 
         VALUES (?, ?) 
         ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(clave, valor),
  );

  await db.batch(sentencias);
  return true;
}

/**
 * Obtiene los slides activos de un carrusel o banner según su ubicación ('hero_home', 'promo_mitad').
 * Ordenados por la columna `orden` ascendente.
 */
export async function obtenerBannersPorUbicacion(
  db: D1Database,
  ubicacion: string,
): Promise<BannerSlide[]> {
  try {
    const { results } = await db
      .prepare(
        `SELECT id, ubicacion, titulo, subtitulo, descripcion, texto_boton, enlace_url, 
                imagen_desktop_key AS imagen_desktop, 
                imagen_mobile_key AS imagen_mobile, 
                orden, activo
         FROM banners
         WHERE ubicacion = ? AND activo = 1
         ORDER BY orden ASC`,
      )
      .bind(ubicacion)
      .all<BannerSlide>();

    return results;
  } catch (error) {
    console.warn("No se pudo obtener banners de D1 (usando banners editoriales de respaldo):", error);
    return [];
  }
}

