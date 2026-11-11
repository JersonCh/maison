import type {
  MarcaItem,
  MarcaAdminItem,
  FamiliaOlfativaItem,
} from "@/types/database";
import type { CommercialType } from "@/types/product";
import { normalizarTextoParaSlug, normalizarTipoComercial } from "./utils";

/**
 * Obtiene la lista completa de marcas activas ordenadas alfabéticamente.
 */
export async function obtenerMarcasDisponibles(
  db: D1Database,
): Promise<MarcaItem[]> {
  const { results } = await db
    .prepare("SELECT id, nombre, slug, tipo_comercial FROM marcas WHERE activo = 1 ORDER BY nombre ASC")
    .all<any>();
  return results.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    slug: r.slug,
    tipo_comercial: normalizarTipoComercial(r.tipo_comercial),
  }));
}

/**
 * Obtiene la lista completa de marcas con el total de perfumes asociados
 * y su estado para el módulo de administración de Casas de Perfumería.
 */
export async function obtenerMarcasAdmin(
  db: D1Database,
): Promise<MarcaAdminItem[]> {
  const { results } = await db
    .prepare(
      `SELECT 
        m.id, 
        m.nombre, 
        m.slug, 
        m.descripcion, 
        m.tipo_comercial, 
        m.activo, 
        m.created_at,
        m.updated_at,
        COUNT(p.id) AS total_productos
      FROM marcas m
      LEFT JOIN productos p ON p.marca_id = m.id
      GROUP BY m.id
      ORDER BY m.nombre ASC`
    )
    .all<any>();

  return results.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    slug: r.slug,
    descripcion: r.descripcion || null,
    tipo_comercial: normalizarTipoComercial(r.tipo_comercial),
    activo: Boolean(r.activo),
    total_productos: Number(r.total_productos) || 0,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

/**
 * Registra una nueva casa de perfumería en el catálogo.
 */
export async function crearMarcaAdmin(
  db: D1Database,
  datos: {
    nombre: string;
    slug?: string;
    tipo_comercial: CommercialType;
    descripcion?: string;
  },
): Promise<number> {
  const nombreLimpio = datos.nombre.trim();
  if (!nombreLimpio) throw new Error("El nombre de la casa de perfumería es obligatorio.");

  const slugBase = datos.slug?.trim() || nombreLimpio;
  const slug = normalizarTextoParaSlug(slugBase);
  const tipoComercial = normalizarTipoComercial(datos.tipo_comercial);
  const descripcion = datos.descripcion?.trim() || null;

  const existente = await db
    .prepare("SELECT id, nombre FROM marcas WHERE LOWER(nombre) = LOWER(?) OR slug = ? LIMIT 1")
    .bind(nombreLimpio, slug)
    .first<{ id: number; nombre: string }>();

  if (existente) {
    throw new Error(`Ya existe una casa de perfumería registrada con el nombre "${existente.nombre}".`);
  }

  await db
    .prepare("INSERT INTO marcas (nombre, slug, tipo_comercial, descripcion, activo) VALUES (?, ?, ?, ?, 1)")
    .bind(nombreLimpio, slug, tipoComercial, descripcion)
    .run();

  const nueva = await db
    .prepare("SELECT last_insert_rowid() AS id")
    .first<{ id: number }>();

  return nueva?.id || 0;
}

/**
 * Actualiza los datos de una casa de perfumería existente.
 * Si cambia su línea comercial, sincroniza las categorías secundarias de sus fragancias.
 */
export async function actualizarMarcaAdmin(
  db: D1Database,
  id: number,
  datos: {
    nombre: string;
    slug?: string;
    tipo_comercial: CommercialType;
    descripcion?: string;
    activo?: boolean;
  },
): Promise<void> {
  const nombreLimpio = datos.nombre.trim();
  if (!nombreLimpio) throw new Error("El nombre de la casa de perfumería es obligatorio.");

  const slugBase = datos.slug?.trim() || nombreLimpio;
  const slug = normalizarTextoParaSlug(slugBase);
  const tipoComercial = normalizarTipoComercial(datos.tipo_comercial);
  const descripcion = datos.descripcion?.trim() || null;
  const activo = datos.activo !== undefined ? (datos.activo ? 1 : 0) : 1;

  const colision = await db
    .prepare("SELECT id, nombre FROM marcas WHERE (LOWER(nombre) = LOWER(?) OR slug = ?) AND id != ? LIMIT 1")
    .bind(nombreLimpio, slug, id)
    .first<{ id: number; nombre: string }>();

  if (colision) {
    throw new Error(`Ya existe otra casa de perfumería registrada con el nombre "${colision.nombre}".`);
  }

  const previa = await db
    .prepare("SELECT tipo_comercial FROM marcas WHERE id = ?")
    .bind(id)
    .first<{ tipo_comercial: string }>();

  await db
    .prepare("UPDATE marcas SET nombre = ?, slug = ?, tipo_comercial = ?, descripcion = ?, activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(nombreLimpio, slug, tipoComercial, descripcion, activo, id)
    .run();

  // Sincronizar categorías en lote si cambió la línea comercial
  if (previa && previa.tipo_comercial !== tipoComercial) {
    try {
      await db.batch([
        db.prepare(
          `DELETE FROM producto_categorias 
           WHERE producto_id IN (SELECT id FROM productos WHERE marca_id = ?)
             AND categoria_id IN (SELECT id FROM categorias WHERE slug IN ('disenador', 'arabe', 'nicho'))`
        ).bind(id),
        db.prepare(
          `INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id)
           SELECT p.id, c.id
           FROM productos p
           JOIN categorias c ON c.slug = ?
           WHERE p.marca_id = ?`
        ).bind(tipoComercial, id),
      ]);
    } catch (e) {
      console.warn("Aviso al sincronizar categorías:", e);
    }
  }
}

/**
 * Elimina una casa de perfumería. Si tiene perfumes asociados,
 * permite reasignarlos a otra marca destino para no dejar registros huérfanos.
 */
export async function eliminarMarcaAdmin(
  db: D1Database,
  id: number,
  reasignarAMarcaId?: number,
): Promise<{ totalReasignados: number }> {
  const conteo = await db
    .prepare("SELECT COUNT(*) AS total FROM productos WHERE marca_id = ?")
    .bind(id)
    .first<{ total: number }>();

  const totalProductos = conteo?.total || 0;

  if (totalProductos > 0) {
    if (!reasignarAMarcaId) {
      throw new Error(`Esta casa tiene ${totalProductos} ${totalProductos === 1 ? "fragancia asociada" : "fragancias asociadas"}. Selecciona otra casa para reasignar sus productos antes de eliminarla.`);
    }

    if (reasignarAMarcaId === id) {
      throw new Error("No puedes reasignar los perfumes a la misma casa que vas a retirar.");
    }

    const destino = await db
      .prepare("SELECT id, nombre, tipo_comercial FROM marcas WHERE id = ?")
      .bind(reasignarAMarcaId)
      .first<{ id: number; nombre: string; tipo_comercial: string }>();

    if (!destino) {
      throw new Error("La casa de destino seleccionada no existe en el catálogo.");
    }

    // Reasignación atómica y eliminación de la marca
    await db.batch([
      db.prepare("UPDATE productos SET marca_id = ? WHERE marca_id = ?").bind(destino.id, id),
      db.prepare(
        `DELETE FROM producto_categorias 
         WHERE producto_id IN (SELECT id FROM productos WHERE marca_id = ?)
           AND categoria_id IN (SELECT id FROM categorias WHERE slug IN ('disenador', 'arabe', 'nicho'))`
      ).bind(destino.id),
      db.prepare(
        `INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id)
         SELECT p.id, c.id
         FROM productos p
         JOIN categorias c ON c.slug = ?
         WHERE p.marca_id = ?`
      ).bind(destino.tipo_comercial, destino.id),
      db.prepare("DELETE FROM marcas WHERE id = ?").bind(id),
    ]);

    return { totalReasignados: totalProductos };
  }

  await db.prepare("DELETE FROM marcas WHERE id = ?").bind(id).run();
  return { totalReasignados: 0 };
}

/**
 * Alterna el estado activo/en pausa de una casa de perfumería.
 */
export async function alternarEstadoMarcaAdmin(
  db: D1Database,
  id: number,
  activo: boolean,
): Promise<void> {
  await db
    .prepare("UPDATE marcas SET activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(activo ? 1 : 0, id)
    .run();
}

/**
 * Obtiene la lista completa de familias olfativas registradas.
 */
export async function obtenerFamiliasOlfativasDisponibles(
  db: D1Database,
): Promise<FamiliaOlfativaItem[]> {
  const { results } = await db
    .prepare("SELECT id, nombre, slug FROM familias_olfativas ORDER BY nombre ASC")
    .all<FamiliaOlfativaItem>();
  return results;
}

/**
 * Garantiza que la marca exista en la base de datos.
 * Si el usuario escribió una nueva marca en el formulario, se crea y se retorna su ID generado.
 */
export async function asegurarMarca(
  db: D1Database,
  marcaId?: number,
  nuevaMarcaNombre?: string,
  tipoComercial?: string,
): Promise<number> {
  if (nuevaMarcaNombre && nuevaMarcaNombre.trim()) {
    const nombreLimpio = nuevaMarcaNombre.trim();
    const slug = normalizarTextoParaSlug(nombreLimpio);
    const tipoFinal = normalizarTipoComercial(tipoComercial);

    // Verificar si ya existe por nombre o slug
    const existente = await db
      .prepare("SELECT id FROM marcas WHERE LOWER(nombre) = LOWER(?) OR slug = ? LIMIT 1")
      .bind(nombreLimpio, slug)
      .first<{ id: number }>();

    if (existente) {
      if (tipoComercial) {
        try {
          await db
            .prepare("UPDATE marcas SET tipo_comercial = ? WHERE id = ?")
            .bind(tipoFinal, existente.id)
            .run();
        } catch { }
      }
      return existente.id;
    }

    // Crear la nueva marca con su clasificación
    await db
      .prepare("INSERT INTO marcas (nombre, slug, tipo_comercial, activo) VALUES (?, ?, ?, 1)")
      .bind(nombreLimpio, slug, tipoFinal)
      .run();

    const nueva = await db
      .prepare("SELECT last_insert_rowid() AS id")
      .first<{ id: number }>();

    return nueva?.id || 1;
  }

  // Si se seleccionó una marca existente y se especificó un tipo comercial, actualizarla
  if (marcaId && tipoComercial) {
    try {
      await db
        .prepare("UPDATE marcas SET tipo_comercial = ? WHERE id = ?")
        .bind(normalizarTipoComercial(tipoComercial), marcaId)
        .run();
    } catch { }
  }

  return marcaId || 1;
}

/**
 * Garantiza que la familia olfativa exista o se cree dinámicamente si es nueva.
 */
export async function asegurarFamiliaOlfativa(
  db: D1Database,
  familiaId?: number | null,
  nuevaFamiliaNombre?: string,
): Promise<number | null> {
  if (nuevaFamiliaNombre && nuevaFamiliaNombre.trim()) {
    const nombreLimpio = nuevaFamiliaNombre.trim();
    const slug = normalizarTextoParaSlug(nombreLimpio);

    const existente = await db
      .prepare("SELECT id FROM familias_olfativas WHERE LOWER(nombre) = LOWER(?) OR slug = ? LIMIT 1")
      .bind(nombreLimpio, slug)
      .first<{ id: number }>();

    if (existente) return existente.id;

    await db
      .prepare("INSERT INTO familias_olfativas (nombre, slug) VALUES (?, ?)")
      .bind(nombreLimpio, slug)
      .run();

    const nueva = await db
      .prepare("SELECT last_insert_rowid() AS id")
      .first<{ id: number }>();

    return nueva?.id || null;
  }

  return familiaId || null;
}

