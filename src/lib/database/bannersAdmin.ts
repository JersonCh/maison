import type { BannerSlide } from "@/types/database";

export interface BannerAdminItem extends BannerSlide {
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Obtiene todas las diapositivas de banners para administración (incluyendo inactivas)
 * ordenadas por posición ascendente.
 */
export async function obtenerTodosLosBannersAdmin(
  db: D1Database,
  ubicacion: string = "hero_home"
): Promise<BannerAdminItem[]> {
  try {
    const { results } = await db
      .prepare(
        `SELECT id, ubicacion, titulo, subtitulo, descripcion, texto_boton, enlace_url,
                imagen_desktop_key AS imagen_desktop,
                imagen_mobile_key AS imagen_mobile,
                orden, activo, created_at, updated_at
         FROM banners
         WHERE ubicacion = ?
         ORDER BY orden ASC, id ASC`
      )
      .bind(ubicacion)
      .all<any>();

    return results.map((r) => ({
      id: r.id,
      ubicacion: r.ubicacion,
      titulo: r.titulo,
      subtitulo: r.subtitulo,
      descripcion: r.descripcion,
      texto_boton: r.texto_boton,
      enlace_url: r.enlace_url,
      imagen_desktop: r.imagen_desktop,
      imagen_mobile: r.imagen_mobile,
      orden: Number(r.orden) || 0,
      activo: Boolean(r.activo),
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  } catch (error) {
    console.error("Error al obtener banners de administración:", error);
    return [];
  }
}

/**
 * Registra una nueva diapositiva en la base de datos.
 */
export async function crearBannerAdmin(
  db: D1Database,
  banner: {
    ubicacion?: string;
    titulo: string;
    subtitulo?: string | null;
    descripcion?: string | null;
    texto_boton?: string | null;
    enlace_url?: string | null;
    imagen_desktop: string;
    imagen_mobile?: string | null;
    orden?: number;
    activo?: boolean;
  }
): Promise<{ id: number }> {
  const ubicacion = banner.ubicacion || "hero_home";

  let orden = banner.orden;
  if (orden === undefined) {
    const maxOrdenRow = await db
      .prepare(`SELECT MAX(orden) as max_orden FROM banners WHERE ubicacion = ?`)
      .bind(ubicacion)
      .first<{ max_orden: number | null }>();
    orden = (maxOrdenRow?.max_orden ?? -1) + 1;
  }

  const res = await db
    .prepare(
      `INSERT INTO banners (
        ubicacion, titulo, subtitulo, descripcion, texto_boton, enlace_url,
        imagen_desktop_key, imagen_mobile_key, orden, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      ubicacion,
      banner.titulo.trim(),
      banner.subtitulo?.trim() || null,
      banner.descripcion?.trim() || null,
      banner.texto_boton?.trim() || null,
      banner.enlace_url?.trim() || null,
      banner.imagen_desktop.trim(),
      banner.imagen_mobile?.trim() || null,
      orden,
      banner.activo ?? true ? 1 : 0
    )
    .run();

  const id = Number(res.meta.last_row_id);
  return { id };
}

/**
 * Actualiza los datos de una diapositiva existente.
 */
export async function actualizarBannerAdmin(
  db: D1Database,
  id: number,
  banner: {
    titulo?: string;
    subtitulo?: string | null;
    descripcion?: string | null;
    texto_boton?: string | null;
    enlace_url?: string | null;
    imagen_desktop?: string;
    imagen_mobile?: string | null;
    orden?: number;
    activo?: boolean;
  }
): Promise<boolean> {
  const campos: string[] = [];
  const valores: any[] = [];

  if (banner.titulo !== undefined) {
    campos.push("titulo = ?");
    valores.push(banner.titulo.trim());
  }
  if (banner.subtitulo !== undefined) {
    campos.push("subtitulo = ?");
    valores.push(banner.subtitulo?.trim() || null);
  }
  if (banner.descripcion !== undefined) {
    campos.push("descripcion = ?");
    valores.push(banner.descripcion?.trim() || null);
  }
  if (banner.texto_boton !== undefined) {
    campos.push("texto_boton = ?");
    valores.push(banner.texto_boton?.trim() || null);
  }
  if (banner.enlace_url !== undefined) {
    campos.push("enlace_url = ?");
    valores.push(banner.enlace_url?.trim() || null);
  }
  if (banner.imagen_desktop !== undefined) {
    campos.push("imagen_desktop_key = ?");
    valores.push(banner.imagen_desktop.trim());
  }
  if (banner.imagen_mobile !== undefined) {
    campos.push("imagen_mobile_key = ?");
    valores.push(banner.imagen_mobile?.trim() || null);
  }
  if (banner.orden !== undefined) {
    campos.push("orden = ?");
    valores.push(banner.orden);
  }
  if (banner.activo !== undefined) {
    campos.push("activo = ?");
    valores.push(banner.activo ? 1 : 0);
  }

  if (campos.length === 0) return true;

  campos.push("updated_at = CURRENT_TIMESTAMP");
  valores.push(id);

  const query = `UPDATE banners SET ${campos.join(", ")} WHERE id = ?`;
  const res = await db.prepare(query).bind(...valores).run();
  return (res.meta.changes ?? 0) > 0;
}

/**
 * Alterna el estado activo/inactivo de una diapositiva.
 */
export async function alternarEstadoBannerAdmin(
  db: D1Database,
  id: number,
  activo: boolean
): Promise<boolean> {
  const res = await db
    .prepare("UPDATE banners SET activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(activo ? 1 : 0, id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/**
 * Reordena una lista de diapositivas en una sola transacción batch.
 */
export async function actualizarOrdenBannersAdmin(
  db: D1Database,
  ordenes: { id: number; orden: number }[]
): Promise<boolean> {
  const stmts = ordenes.map(({ id, orden }) =>
    db
      .prepare("UPDATE banners SET orden = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(orden, id)
  );
  await db.batch(stmts);
  return true;
}

/**
 * Elimina una diapositiva de la base de datos.
 */
export async function eliminarBannerAdmin(
  db: D1Database,
  id: number
): Promise<boolean> {
  const res = await db
    .prepare("DELETE FROM banners WHERE id = ?")
    .bind(id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

