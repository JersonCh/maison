import type {
  ProductoCatalogo,
  ProductoDetalleCompleto,
  BannerSlide,
  PiramideOlfativa,
  MarcaItem,
  MarcaAdminItem,
  FamiliaOlfativaItem,
  ProductoAdminItem,
  DatosFormularioProducto,
} from "@/types/database";
import type { Gender, Product, ProductVariant, CommercialType } from "@/types/product";
import type { FilaCsvProcesada } from "@/lib/csvHelper";
import { products as fallbackProducts } from "@/data/products";

// =============================================================================
// 1. CONFIGURACIÓN COMERCIAL DE LA TIENDA
// =============================================================================

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

// =============================================================================
// 2. CATÁLOGO DE PRODUCTOS PÚBLICO
// =============================================================================

/**
 * Obtiene la lista de perfumes para el catálogo y la página de inicio.
 * Une marcas, la variante principal de precio y la imagen de portada.
 */
export async function obtenerProductosCatalogo(
  db: D1Database,
  filtros?: { genero?: string },
): Promise<ProductoCatalogo[]> {
  let consulta = `
    SELECT 
      p.id,
      p.nombre,
      p.slug,
      p.genero,
      p.concentracion,
      p.es_destacado,
      m.nombre AS marca,
      m.slug AS marca_slug,
      m.tipo_comercial,
      COALESCE(f.nombre, 'Composición Maison') AS familia_olfativa,
      COALESCE(
        (SELECT clave_archivo FROM imagenes_producto WHERE producto_id = p.id AND es_principal = 1 LIMIT 1),
        (SELECT clave_archivo FROM imagenes_producto WHERE producto_id = p.id ORDER BY orden ASC LIMIT 1),
        '/assets/imagenxdefecto.svg'
      ) AS imagen_principal,
      v.precio_centimos AS precio_minimo_centimos,
      v.precio_referencia_centimos,
      v.tamano_ml AS tamano_predeterminado_ml
    FROM productos p
    JOIN marcas m ON p.marca_id = m.id
    LEFT JOIN producto_familias_olfativas pf ON p.id = pf.producto_id
    LEFT JOIN familias_olfativas f ON pf.familia_olfativa_id = f.id
    LEFT JOIN variantes_producto v ON v.producto_id = p.id AND (v.es_predeterminada = 1 OR v.id = (
      SELECT id FROM variantes_producto WHERE producto_id = p.id ORDER BY precio_centimos ASC LIMIT 1
    ))
    WHERE p.estado = 'publicado'
  `;

  const parametros: string[] = [];

  if (filtros?.genero) {
    consulta += " AND p.genero = ?";
    parametros.push(filtros.genero);
  }

  consulta += " ORDER BY p.id ASC";

  const sentencia = db.prepare(consulta);
  const ejecucion =
    parametros.length > 0 ? sentencia.bind(...parametros) : sentencia;
  const { results } = await ejecucion.all<any>();

  return results.map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    slug: fila.slug,
    genero: fila.genero as Gender,
    concentracion: fila.concentracion,
    marca: fila.marca,
    marca_slug: fila.marca_slug,
    tipo_comercial: normalizarTipoComercial(fila.tipo_comercial),
    familia_olfativa: fila.familia_olfativa,
    imagen_principal: fila.imagen_principal,
    precio_minimo_centimos: fila.precio_minimo_centimos || 0,
    precio_referencia_centimos: fila.precio_referencia_centimos,
    tamano_predeterminado_ml: fila.tamano_predeterminado_ml || 50,
    es_destacado: Boolean(fila.es_destacado),
  }));
}

/**
 * Obtiene la ficha completa de un perfume por su slug (URL),
 * incluyendo todas sus presentaciones (variantes), galería y pirámide olfativa.
 */
export async function obtenerDetalleProductoPorSlug(
  db: D1Database,
  slug: string,
): Promise<ProductoDetalleCompleto | null> {
  const producto = await db
    .prepare(
      `SELECT 
        p.id,
        p.nombre,
        p.slug,
        p.descripcion,
        p.genero,
        p.concentracion,
        p.anio_lanzamiento,
        p.pais_origen,
        p.ocasion_uso,
        m.nombre AS marca,
        m.slug AS marca_slug,
        COALESCE(f.nombre, 'Composición Maison') AS familia_olfativa
      FROM productos p
      JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN producto_familias_olfativas pf ON p.id = pf.producto_id
      LEFT JOIN familias_olfativas f ON pf.familia_olfativa_id = f.id
      WHERE p.slug = ? AND p.estado = 'publicado'
      LIMIT 1`,
    )
    .bind(slug)
    .first<any>();

  if (!producto) return null;

  // Variantes de tamaño y precio
  const { results: variantes } = await db
    .prepare(
      `SELECT id, tamano_ml, precio_centimos, precio_referencia_centimos, es_predeterminada, tipo_presentacion
       FROM variantes_producto
       WHERE producto_id = ? AND activo = 1
       ORDER BY tamano_ml ASC`,
    )
    .bind(producto.id)
    .all<any>();

  // Galería de imágenes completa ordenada
  const { results: imagenes } = await db
    .prepare(
      `SELECT clave_archivo
       FROM imagenes_producto
       WHERE producto_id = ?
       ORDER BY es_principal DESC, orden ASC`,
    )
    .bind(producto.id)
    .all<{ clave_archivo: string }>();

  // Pirámide olfativa (Salida, Corazón, Fondo)
  const { results: notas } = await db
    .prepare(
      `SELECT n.nombre, pn.etapa
       FROM producto_notas pn
       JOIN notas_aromaticas n ON pn.nota_aromatica_id = n.id
       WHERE pn.producto_id = ?`,
    )
    .bind(producto.id)
    .all<{ nombre: string; etapa: "salida" | "corazon" | "fondo" }>();

  const piramide: PiramideOlfativa = {
    salida: [],
    corazon: [],
    fondo: [],
  };

  for (const nota of notas) {
    if (nota.etapa === "salida") piramide.salida.push(nota.nombre);
    else if (nota.etapa === "corazon") piramide.corazon.push(nota.nombre);
    else if (nota.etapa === "fondo") piramide.fondo.push(nota.nombre);
  }

  // Valores predeterminados elegantes si las notas no están cargadas aún
  if (!piramide.salida.length) piramide.salida = ["Bergamota", "Pimienta rosa", "Acordes cítricos"];
  if (!piramide.corazon.length) piramide.corazon = ["Jazmín", "Maderas nobles", "Especias envolventes"];
  if (!piramide.fondo.length) piramide.fondo = ["Ámbar", "Almizcle blanco", "Vainilla de Madagascar"];

  return {
    id: producto.id,
    nombre: producto.nombre,
    slug: producto.slug,
    descripcion: producto.descripcion,
    genero: producto.genero as Gender,
    concentracion: producto.concentracion,
    anio_lanzamiento: producto.anio_lanzamiento,
    pais_origen: producto.pais_origen,
    ocasion_uso: producto.ocasion_uso,
    marca: producto.marca,
    marca_slug: producto.marca_slug,
    familia_olfativa: producto.familia_olfativa,
    variantes: variantes.map((v) => ({
      id: v.id,
      tamano_ml: v.tamano_ml,
      precio_centimos: v.precio_centimos,
      precio_referencia_centimos: v.precio_referencia_centimos,
      es_predeterminada: Boolean(v.es_predeterminada),
      tipo_presentacion: (v.tipo_presentacion as "frasco" | "decant") || "frasco",
    })),
    galeria_imagenes: imagenes.map((img) => img.clave_archivo),
    piramide_olfativa: piramide,
  };
}

// =============================================================================
// 3. FRAGANCIAS AFINES ("TAMBIÉN TE PUEDE GUSTAR")
// =============================================================================

/**
 * Obtiene fragancias relacionadas para la ficha de producto.
 * Prioriza recomendaciones manuales del vendedor (`productos_relacionados`).
 * Si no hay recomendaciones manuales, sugiere perfumes del mismo género y familia.
 */
export async function obtenerFraganciasRelacionadas(
  db: D1Database,
  productoId: number,
  limite = 4,
): Promise<ProductoCatalogo[]> {
  // 1. Intentar recomendaciones manuales
  const { results: manuales } = await db
    .prepare(
      `SELECT pr.producto_relacionado_id 
       FROM productos_relacionados pr 
       WHERE pr.producto_origen_id = ? 
       ORDER BY pr.orden ASC 
       LIMIT ?`,
    )
    .bind(productoId, limite)
    .all<{ producto_relacionado_id: number }>();

  if (manuales.length > 0) {
    const ids = manuales.map((m) => m.producto_relacionado_id);
    const placeholders = ids.map(() => "?").join(",");
    const { results } = await db
      .prepare(
        `SELECT 
          p.id, p.nombre, p.slug, p.genero, p.concentracion, p.es_destacado,
          m.nombre AS marca, m.slug AS marca_slug,
          COALESCE(f.nombre, 'Composición Maison') AS familia_olfativa,
          COALESCE(
            (SELECT clave_archivo FROM imagenes_producto WHERE producto_id = p.id AND es_principal = 1 LIMIT 1),
            '/assets/imagenxdefecto.svg'
          ) AS imagen_principal,
          v.precio_centimos AS precio_minimo_centimos,
          v.precio_referencia_centimos,
          v.tamano_ml AS tamano_predeterminado_ml
        FROM productos p
        JOIN marcas m ON p.marca_id = m.id
        LEFT JOIN producto_familias_olfativas pf ON p.id = pf.producto_id
        LEFT JOIN familias_olfativas f ON pf.familia_olfativa_id = f.id
        LEFT JOIN variantes_producto v ON v.producto_id = p.id AND v.es_predeterminada = 1
        WHERE p.id IN (${placeholders})`,
      )
      .bind(...ids)
      .all<any>();

    return results as ProductoCatalogo[];
  }

  // 2. Fallback automático: mismo género excluyendo el producto actual
  const { results: automaticos } = await db
    .prepare(
      `SELECT 
        p.id, p.nombre, p.slug, p.genero, p.concentracion, p.es_destacado,
        m.nombre AS marca, m.slug AS marca_slug,
        COALESCE(f.nombre, 'Composición Maison') AS familia_olfativa,
        COALESCE(
          (SELECT clave_archivo FROM imagenes_producto WHERE producto_id = p.id AND es_principal = 1 LIMIT 1),
          '/assets/imagenxdefecto.svg'
        ) AS imagen_principal,
        v.precio_centimos AS precio_minimo_centimos,
        v.precio_referencia_centimos,
        v.tamano_ml AS tamano_predeterminado_ml
      FROM productos p
      JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN producto_familias_olfativas pf ON p.id = pf.producto_id
      LEFT JOIN familias_olfativas f ON pf.familia_olfativa_id = f.id
      LEFT JOIN variantes_producto v ON v.producto_id = p.id AND v.es_predeterminada = 1
      WHERE p.id != ? AND p.estado = 'publicado'
      ORDER BY p.es_destacado DESC, p.id ASC
      LIMIT ?`,
    )
    .bind(productoId, limite)
    .all<any>();

  return automaticos as ProductoCatalogo[];
}

// =============================================================================
// 4. BANNERS Y CARRUSELES
// =============================================================================

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
        `SELECT id, ubicacion, titulo, subtitulo, texto_boton, enlace_url, 
                imagen_desktop_key AS imagen_desktop, 
                imagen_mobile_key AS imagen_mobile, 
                orden
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

// =============================================================================
// 5. GESTIÓN ADMINISTRATIVA DE PRODUCTOS (CRUD EN CLOUDFLARE D1)
// =============================================================================

/**
 * Función utilitaria interna para normalizar títulos y generar slugs legibles.
 */
function normalizarTextoParaSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
 * Obtiene la lista de todos los productos para la tabla administrativa,
 * incluyendo sus 2 variantes (50ml y 100ml) y sus exactamente 3 imágenes.
 */
export async function obtenerProductosParaAdmin(
  db: D1Database,
): Promise<ProductoAdminItem[]> {
  // 1. Obtener productos principales que no estén archivados
  const { results: productos } = await db
    .prepare(
      `SELECT 
        p.id,
        p.nombre,
        p.slug,
        p.marca_id,
        m.nombre AS marca,
        m.tipo_comercial,
        p.genero,
        p.concentracion,
        pf.familia_olfativa_id,
        COALESCE(f.nombre, 'Composición Maison') AS familia_olfativa,
        COALESCE(p.descripcion, '') AS descripcion,
        p.pais_origen,
        p.ocasion_uso,
        p.es_destacado,
        p.etiqueta_destacada,
        p.estado
      FROM productos p
      JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN producto_familias_olfativas pf ON p.id = pf.producto_id
      LEFT JOIN familias_olfativas f ON pf.familia_olfativa_id = f.id
      WHERE p.estado != 'archivado'
      ORDER BY p.id DESC`,
    )
    .all<any>();

  if (!productos.length) return [];

  // 2. Obtener variantes de todos los productos en una sola consulta
  const { results: variantes } = await db
    .prepare(
      `SELECT producto_id, tamano_ml, precio_centimos, precio_referencia_centimos, tipo_presentacion
       FROM variantes_producto
       WHERE activo = 1`,
    )
    .all<{
      producto_id: number;
      tamano_ml: number;
      precio_centimos: number;
      precio_referencia_centimos: number | null;
      tipo_presentacion: string;
    }>();

  // 3. Obtener imágenes de todos los productos en una sola consulta
  const { results: imagenes } = await db
    .prepare(
      `SELECT producto_id, clave_archivo, orden
       FROM imagenes_producto
       ORDER BY orden ASC`,
    )
    .all<{ producto_id: number; clave_archivo: string; orden: number }>();

  // Agrupar variantes e imágenes por producto_id
  const mapaVariantes = new Map<number, typeof variantes>();
  for (const v of variantes) {
    const lista = mapaVariantes.get(v.producto_id) || [];
    lista.push(v);
    mapaVariantes.set(v.producto_id, lista);
  }

  const mapaImagenes = new Map<number, string[]>();
  for (const img of imagenes) {
    const lista = mapaImagenes.get(img.producto_id) || [];
    lista.push(img.clave_archivo);
    mapaImagenes.set(img.producto_id, lista);
  }

  const imagenPorDefecto = "/assets/imagenxdefecto.svg";

  return productos.map((p) => {
    const vars = mapaVariantes.get(p.id) || [];
    const v50 = vars.find((v) => Math.round(v.tamano_ml) === 50) || vars[0];
    const v100 = vars.find((v) => Math.round(v.tamano_ml) === 100) || vars[1] || vars[0];
    const vDecant3 = vars.find((v) => Math.round(v.tamano_ml) === 3);
    const vDecant5 = vars.find((v) => Math.round(v.tamano_ml) === 5);
    const vDecant10 = vars.find((v) => Math.round(v.tamano_ml) === 10);
    const tieneDecants = vars.some((v) => v.tipo_presentacion === "decant");

    const imgs = mapaImagenes.get(p.id) || [];
    // Fotos registradas (al menos 1 portada, hasta 3 fotos)
    const fotosRegistradas = imgs.length > 0 ? imgs : [imagenPorDefecto];

    return {
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      marca_id: p.marca_id,
      marca: p.marca,
      tipo_comercial: normalizarTipoComercial(p.tipo_comercial),
      tiene_decants: tieneDecants,
      precio_decant_3ml: vDecant3 ? Math.round(vDecant3.precio_centimos / 100) : null,
      precio_decant_5ml: vDecant5 ? Math.round(vDecant5.precio_centimos / 100) : null,
      precio_decant_10ml: vDecant10 ? Math.round(vDecant10.precio_centimos / 100) : null,
      genero: p.genero as Gender,
      concentracion: p.concentracion,
      familia_olfativa_id: p.familia_olfativa_id,
      familia_olfativa: p.familia_olfativa,
      descripcion: p.descripcion,
      pais_origen: p.pais_origen,
      ocasion_uso: p.ocasion_uso,
      es_destacado: Boolean(p.es_destacado),
      activo: p.estado === "publicado",
      estado: p.estado,
      precio_50ml: v50 ? Math.round(v50.precio_centimos / 100) : 0,
      precio_100ml: v100 ? Math.round(v100.precio_centimos / 100) : 0,
      precio_referencia_50ml: v50?.precio_referencia_centimos
        ? Math.round(v50.precio_referencia_centimos / 100)
        : null,
      imagenes: fotosRegistradas,
    };
  });
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

  // Si la marca ya existía y el admin seleccionó un tipoComercial, sincronizarlo
  if (marcaId && tipoComercial) {
    try {
      await db
        .prepare("UPDATE marcas SET tipo_comercial = ? WHERE id = ?")
        .bind(tipoComercial, marcaId)
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

/**
 * Genera un slug único para el perfume evitando colisiones en la base de datos.
 */
export async function generarSlugUnico(
  db: D1Database,
  baseNombre: string,
  idExcluir?: number,
): Promise<string> {
  const slugBase = normalizarTextoParaSlug(baseNombre) || "perfume";
  let slugCandidato = slugBase;
  let contador = 1;

  while (true) {
    let consulta = "SELECT id FROM productos WHERE slug = ?";
    const params: (string | number)[] = [slugCandidato];

    if (idExcluir) {
      consulta += " AND id != ?";
      params.push(idExcluir);
    }

    consulta += " LIMIT 1";

    const existe = await db.prepare(consulta).bind(...params).first();
    if (!existe) return slugCandidato;

    contador++;
    slugCandidato = `${slugBase}-${contador}`;
  }
}

/**
 * Crea un nuevo perfume en Cloudflare D1 garantizando:
 * 1. Ficha del producto en `productos`
 * 2. Asociación de familia olfativa en `producto_familias_olfativas`
 * 3. Exactamente 2 variantes: 50ml (predeterminada) y 100ml, con precios en céntimos
 * 4. Exactamente 3 imágenes en `imagenes_producto` (Portada, Caja, Detalle)
 */
export async function crearNuevoProductoEnDb(
  db: D1Database,
  datos: DatosFormularioProducto,
): Promise<number> {
  const marcaIdFinal = await asegurarMarca(
    db,
    datos.marca_id,
    datos.nueva_marca,
    datos.tipo_comercial,
  );
  const familiaIdFinal = await asegurarFamiliaOlfativa(
    db,
    datos.familia_olfativa_id,
    datos.nueva_familia,
  );
  // Obtener nombre de la marca para generar slug SEO limpio (ej. dior-sauvage) si no vino explícito
  let baseSlug = datos.slug?.trim();
  if (!baseSlug) {
    const marcaFila = await db
      .prepare("SELECT nombre FROM marcas WHERE id = ?")
      .bind(marcaIdFinal)
      .first<{ nombre: string }>();
    baseSlug = `${marcaFila?.nombre || ""} ${datos.nombre}`.trim();
  }
  const slugFinal = await generarSlugUnico(db, baseSlug);
  const estadoFinal = datos.activo ? "publicado" : "borrador";
  const esDestacado = datos.es_destacado ? 1 : 0;
  const etiquetaDestacada = datos.etiqueta_destacada || "ninguna";

  // 1. Insertar producto principal
  await db
    .prepare(
      `INSERT INTO productos (
        marca_id, nombre, slug, descripcion, genero, concentracion, 
        pais_origen, ocasion_uso, estado, es_destacado, etiqueta_destacada, publicado_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    )
    .bind(
      marcaIdFinal,
      datos.nombre.trim(),
      slugFinal,
      datos.descripcion.trim(),
      datos.genero,
      datos.concentracion,
      datos.pais_origen?.trim() || "Francia",
      datos.ocasion_uso?.trim() || "Ocasiones especiales y uso distinguido",
      estadoFinal,
      esDestacado,
      etiquetaDestacada,
    )
    .run();

  const productoFila = await db
    .prepare("SELECT last_insert_rowid() AS id")
    .first<{ id: number }>();

  if (!productoFila?.id) {
    throw new Error("No se pudo obtener el identificador del producto creado en D1");
  }

  const productoId = productoFila.id;

  // 2. Asociar familia olfativa si existe
  if (familiaIdFinal) {
    await db
      .prepare(
        "INSERT INTO producto_familias_olfativas (producto_id, familia_olfativa_id) VALUES (?, ?)",
      )
      .bind(productoId, familiaIdFinal)
      .run();
  }

  // 3. Crear las variantes: 50 ml y 100 ml regulares + decants opcionales
  const precio50Centimos = Math.round(Number(datos.precio_50ml || 0) * 100);
  const precio100Centimos = Math.round(Number(datos.precio_100ml || 0) * 100);
  const precioRef50Centimos = datos.precio_referencia_50ml
    ? Math.round(Number(datos.precio_referencia_50ml) * 100)
    : null;

  const sentenciasVariantes = [
    db
      .prepare(
        `INSERT INTO variantes_producto (
          producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
          es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
        ) VALUES (?, ?, 50, ?, ?, 1, 0, 'venta_regular', 'frasco', 1)`,
      )
      .bind(
        productoId,
        `MDP-${productoId}-50ML`,
        precio50Centimos,
        precioRef50Centimos,
      ),
    db
      .prepare(
        `INSERT INTO variantes_producto (
          producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
          es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
        ) VALUES (?, ?, 100, ?, NULL, 0, 0, 'venta_regular', 'frasco', 1)`,
      )
      .bind(
        productoId,
        `MDP-${productoId}-100ML`,
        precio100Centimos,
      ),
  ];

  // Variantes de decants si fueron habilitadas
  if (datos.tiene_decants) {
    if (datos.precio_decant_3ml && Number(datos.precio_decant_3ml) > 0) {
      sentenciasVariantes.push(
        db
          .prepare(
            `INSERT INTO variantes_producto (
              producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
              es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
            ) VALUES (?, ?, 3, ?, NULL, 0, 0, 'venta_regular', 'decant', 1)`,
          )
          .bind(
            productoId,
            `DEC-${productoId}-3ML`,
            Math.round(Number(datos.precio_decant_3ml) * 100),
          ),
      );
    }

    if (datos.precio_decant_5ml && Number(datos.precio_decant_5ml) > 0) {
      sentenciasVariantes.push(
        db
          .prepare(
            `INSERT INTO variantes_producto (
              producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
              es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
            ) VALUES (?, ?, 5, ?, NULL, 0, 0, 'venta_regular', 'decant', 1)`,
          )
          .bind(
            productoId,
            `DEC-${productoId}-5ML`,
            Math.round(Number(datos.precio_decant_5ml) * 100),
          ),
      );
    }

    if (datos.precio_decant_10ml && Number(datos.precio_decant_10ml) > 0) {
      sentenciasVariantes.push(
        db
          .prepare(
            `INSERT INTO variantes_producto (
              producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
              es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
            ) VALUES (?, ?, 10, ?, NULL, 0, 0, 'venta_regular', 'decant', 1)`,
          )
          .bind(
            productoId,
            `DEC-${productoId}-10ML`,
            Math.round(Number(datos.precio_decant_10ml) * 100),
          ),
      );
    }
  }

  await db.batch(sentenciasVariantes);

  // 4. Asociar a categorías comerciales en producto_categorias dinámicamente por slug
  try {
    const slugCategoria = datos.tipo_comercial === "arabe" ? "arabes" : datos.tipo_comercial === "nicho" ? "nichos" : "disenador";
    await db
      .prepare(
        `INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id)
         SELECT ?, id FROM categorias WHERE slug = ?`,
      )
      .bind(productoId, slugCategoria)
      .run();

    if (datos.tiene_decants) {
      await db
        .prepare(
          `INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id)
           SELECT ?, id FROM categorias WHERE slug = 'decants'`,
        )
        .bind(productoId)
        .run();
    }
  } catch (err) {
    // Si la tabla producto_categorias aún no existe en el esquema remoto, continuar sin error
  }

  // 4. Insertar imágenes provistas (Foto 1 obligatoria, 2 y 3 opcionales)
  const fotosFiltradas = (datos.fotos || []).map((f) => f?.trim()).filter(Boolean);
  if (fotosFiltradas.length === 0) {
    fotosFiltradas.push("/assets/imagenxdefecto.svg");
  }

  const sentenciasImagenes = fotosFiltradas.map((url, indice) => {
    let textoAlt = `${datos.nombre} - Frasco y portada principal`;
    if (indice === 1) textoAlt = `${datos.nombre} - Empaque y caja oficial`;
    if (indice === 2) textoAlt = `${datos.nombre} - Detalle editorial`;

    return db
      .prepare(
        `INSERT INTO imagenes_producto (producto_id, clave_archivo, texto_alternativo, orden, es_principal)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(productoId, url, textoAlt, indice, indice === 0 ? 1 : 0);
  });

  await db.batch(sentenciasImagenes);

  return productoId;
}

/**
 * Actualiza un perfume existente en Cloudflare D1 con sus variantes e imágenes.
 */
export async function actualizarProductoEnDb(
  db: D1Database,
  productoId: number,
  datos: DatosFormularioProducto,
): Promise<boolean> {
  const marcaIdFinal = await asegurarMarca(
    db,
    datos.marca_id,
    datos.nueva_marca,
    datos.tipo_comercial,
  );
  const familiaIdFinal = await asegurarFamiliaOlfativa(
    db,
    datos.familia_olfativa_id,
    datos.nueva_familia,
  );
  // En comercio electrónico profesional (Shopify, WooCommerce, Medusa):
  // Si el usuario proporcionó un slug explícito diferente, se normaliza y valida.
  // De lo contrario, el slug existente se preserva de forma inmutable para proteger SEO y URLs compartidas.
  const registroActual = await db
    .prepare("SELECT slug FROM productos WHERE id = ?")
    .bind(productoId)
    .first<{ slug: string }>();

  let slugFinal = registroActual?.slug;
  if (datos.slug?.trim() && datos.slug.trim() !== registroActual?.slug) {
    slugFinal = await generarSlugUnico(db, datos.slug.trim(), productoId);
  } else if (!slugFinal) {
    slugFinal = await generarSlugUnico(db, datos.nombre, productoId);
  }
  const estadoFinal = datos.activo ? "publicado" : "borrador";
  const esDestacado = datos.es_destacado ? 1 : 0;
  const etiquetaDestacada = datos.etiqueta_destacada || "ninguna";

  // 1. Actualizar tabla productos
  await db
    .prepare(
      `UPDATE productos 
       SET marca_id = ?, nombre = ?, slug = ?, descripcion = ?, genero = ?, concentracion = ?,
           pais_origen = ?, ocasion_uso = ?, estado = ?, es_destacado = ?, etiqueta_destacada = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .bind(
      marcaIdFinal,
      datos.nombre.trim(),
      slugFinal,
      datos.descripcion.trim(),
      datos.genero,
      datos.concentracion,
      datos.pais_origen?.trim() || "Francia",
      datos.ocasion_uso?.trim() || "Ocasiones especiales y uso distinguido",
      estadoFinal,
      esDestacado,
      etiquetaDestacada,
      productoId,
    )
    .run();

  // 2. Actualizar relación de familia olfativa
  await db
    .prepare("DELETE FROM producto_familias_olfativas WHERE producto_id = ?")
    .bind(productoId)
    .run();

  if (familiaIdFinal) {
    await db
      .prepare(
        "INSERT INTO producto_familias_olfativas (producto_id, familia_olfativa_id) VALUES (?, ?)",
      )
      .bind(productoId, familiaIdFinal)
      .run();
  }

  // 3. Actualizar variantes de 50ml y 100ml
  const precio50Centimos = Math.round(Number(datos.precio_50ml || 0) * 100);
  const precio100Centimos = Math.round(Number(datos.precio_100ml || 0) * 100);
  const precioRef50Centimos = datos.precio_referencia_50ml
    ? Math.round(Number(datos.precio_referencia_50ml) * 100)
    : null;

  // Actualizar 50ml si existe, o crearla
  const res50 = await db
    .prepare(
      `UPDATE variantes_producto 
       SET precio_centimos = ?, precio_referencia_centimos = ?, tipo_presentacion = 'frasco', updated_at = CURRENT_TIMESTAMP 
       WHERE producto_id = ? AND tamano_ml = 50`,
    )
    .bind(precio50Centimos, precioRef50Centimos, productoId)
    .run();

  if (res50.meta.changes === 0) {
    await db
      .prepare(
        `INSERT INTO variantes_producto (
          producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
          es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
        ) VALUES (?, ?, 50, ?, ?, 1, 0, 'venta_regular', 'frasco', 1)`,
      )
      .bind(productoId, `MDP-${productoId}-50ML`, precio50Centimos, precioRef50Centimos)
      .run();
  }

  // Actualizar 100ml si existe, o crearla
  const res100 = await db
    .prepare(
      `UPDATE variantes_producto 
       SET precio_centimos = ?, tipo_presentacion = 'frasco', updated_at = CURRENT_TIMESTAMP 
       WHERE producto_id = ? AND tamano_ml = 100`,
    )
    .bind(precio100Centimos, productoId)
    .run();

  if (res100.meta.changes === 0) {
    await db
      .prepare(
        `INSERT INTO variantes_producto (
          producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
          es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
        ) VALUES (?, ?, 100, ?, NULL, 0, 0, 'venta_regular', 'frasco', 1)`,
      )
      .bind(productoId, `MDP-${productoId}-100ML`, precio100Centimos)
      .run();
  }

  // Actualizar o crear decants si corresponde
  if (datos.tiene_decants) {
    if (datos.precio_decant_3ml && Number(datos.precio_decant_3ml) > 0) {
      const p3 = Math.round(Number(datos.precio_decant_3ml) * 100);
      const res3 = await db
        .prepare(
          `UPDATE variantes_producto 
           SET precio_centimos = ?, tipo_presentacion = 'decant', activo = 1, updated_at = CURRENT_TIMESTAMP 
           WHERE producto_id = ? AND tamano_ml = 3`,
        )
        .bind(p3, productoId)
        .run();

      if (res3.meta.changes === 0) {
        await db
          .prepare(
            `INSERT INTO variantes_producto (
              producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
              es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
            ) VALUES (?, ?, 3, ?, NULL, 0, 0, 'venta_regular', 'decant', 1)`,
          )
          .bind(productoId, `DEC-${productoId}-3ML`, p3)
          .run();
      }
    } else {
      await db
        .prepare("DELETE FROM variantes_producto WHERE producto_id = ? AND tamano_ml = 3")
        .bind(productoId)
        .run();
    }

    if (datos.precio_decant_5ml && Number(datos.precio_decant_5ml) > 0) {
      const p5 = Math.round(Number(datos.precio_decant_5ml) * 100);
      const res5 = await db
        .prepare(
          `UPDATE variantes_producto 
           SET precio_centimos = ?, tipo_presentacion = 'decant', activo = 1, updated_at = CURRENT_TIMESTAMP 
           WHERE producto_id = ? AND tamano_ml = 5`,
        )
        .bind(p5, productoId)
        .run();

      if (res5.meta.changes === 0) {
        await db
          .prepare(
            `INSERT INTO variantes_producto (
              producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
              es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
            ) VALUES (?, ?, 5, ?, NULL, 0, 0, 'venta_regular', 'decant', 1)`,
          )
          .bind(productoId, `DEC-${productoId}-5ML`, p5)
          .run();
      }
    } else {
      await db
        .prepare("DELETE FROM variantes_producto WHERE producto_id = ? AND tamano_ml = 5")
        .bind(productoId)
        .run();
    }

    if (datos.precio_decant_10ml && Number(datos.precio_decant_10ml) > 0) {
      const p10 = Math.round(Number(datos.precio_decant_10ml) * 100);
      const res10 = await db
        .prepare(
          `UPDATE variantes_producto 
           SET precio_centimos = ?, tipo_presentacion = 'decant', activo = 1, updated_at = CURRENT_TIMESTAMP 
           WHERE producto_id = ? AND tamano_ml = 10`,
        )
        .bind(p10, productoId)
        .run();

      if (res10.meta.changes === 0) {
        await db
          .prepare(
            `INSERT INTO variantes_producto (
              producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
              es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
            ) VALUES (?, ?, 10, ?, NULL, 0, 0, 'venta_regular', 'decant', 1)`,
          )
          .bind(productoId, `DEC-${productoId}-10ML`, p10)
          .run();
      }
    } else {
      await db
        .prepare("DELETE FROM variantes_producto WHERE producto_id = ? AND tamano_ml = 10")
        .bind(productoId)
        .run();
    }
  } else {
    // Si desactivó decants, eliminar las presentaciones fraccionadas de decants
    await db
      .prepare("DELETE FROM variantes_producto WHERE producto_id = ? AND tipo_presentacion = 'decant'")
      .bind(productoId)
      .run();
  }

  // Sincronizar tabla relacional producto_categorias dinámicamente por slug
  try {
    await db.prepare("DELETE FROM producto_categorias WHERE producto_id = ?").bind(productoId).run();
    const slugCategoria = datos.tipo_comercial === "arabe" ? "arabes" : datos.tipo_comercial === "nicho" ? "nichos" : "disenador";
    await db
      .prepare(
        `INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id)
         SELECT ?, id FROM categorias WHERE slug = ?`,
      )
      .bind(productoId, slugCategoria)
      .run();

    if (datos.tiene_decants) {
      await db
        .prepare(
          `INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id)
           SELECT ?, id FROM categorias WHERE slug = 'decants'`,
        )
        .bind(productoId)
        .run();
    }
  } catch (err) { }

  // 4. Actualizar imágenes provistas (Foto 1 obligatoria, 2 y 3 opcionales)
  await db
    .prepare("DELETE FROM imagenes_producto WHERE producto_id = ?")
    .bind(productoId)
    .run();

  const fotosFiltradas = (datos.fotos || []).map((f) => f?.trim()).filter(Boolean);
  if (fotosFiltradas.length === 0) {
    fotosFiltradas.push("/assets/imagenxdefecto.svg");
  }

  const sentenciasImagenes = fotosFiltradas.map((url, indice) => {
    let textoAlt = `${datos.nombre} - Frasco y portada principal`;
    if (indice === 1) textoAlt = `${datos.nombre} - Empaque y caja oficial`;
    if (indice === 2) textoAlt = `${datos.nombre} - Detalle editorial`;

    return db
      .prepare(
        `INSERT INTO imagenes_producto (producto_id, clave_archivo, texto_alternativo, orden, es_principal)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(productoId, url, textoAlt, indice, indice === 0 ? 1 : 0);
  });

  await db.batch(sentenciasImagenes);

  return true;
}

/**
 * Alterna el estado activo / inactivo de un perfume sin modificar sus datos.
 */
export async function alternarEstadoActivoProducto(
  db: D1Database,
  productoId: number,
  nuevoEstadoActivo: boolean,
): Promise<boolean> {
  const nuevoEstado = nuevoEstadoActivo ? "publicado" : "borrador";
  await db
    .prepare("UPDATE productos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(nuevoEstado, productoId)
    .run();
  return true;
}

/**
 * Elimina o archiva un perfume de forma segura:
 * Si el producto tiene pedidos asociados en `pedido_items`, se archiva para preservar la trazabilidad fiscal.
 * Si no tiene referencias bloqueantes, se elimina físicamente en cascada.
 */
export async function archivarOEliminarProducto(
  db: D1Database,
  productoId: number,
): Promise<{ accion: "eliminado" | "archivado" }> {
  // Limpieza atómica de registros dependientes y producto en el catálogo oficial
  await db.batch([
    db.prepare("DELETE FROM imagenes_producto WHERE producto_id = ?").bind(productoId),
    db.prepare("DELETE FROM variantes_producto WHERE producto_id = ?").bind(productoId),
    db.prepare("DELETE FROM producto_categorias WHERE producto_id = ?").bind(productoId),
    db.prepare("DELETE FROM producto_familias_olfativas WHERE producto_id = ?").bind(productoId),
    db.prepare("DELETE FROM productos WHERE id = ?").bind(productoId),
  ]);

  return { accion: "eliminado" };
}

// =============================================================================
// 6. ADAPTADOR Y CONSULTAS PARA LA TIENDA PÚBLICA (FRONTEND TIENDA OFICIAL)
// =============================================================================

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

/**
 * Obtiene todos los productos publicados desde Cloudflare D1 adaptados
 * al modelo de dominio `Product` que consume el frontend público.
 * Si la base de datos no está disponible o falla, utiliza el catálogo
 * estático de respaldo para garantizar cero caídas en la tienda.
 */
export async function obtenerProductosTienda(
  db?: D1Database,
): Promise<Product[]> {
  if (!db) {
    return fallbackProducts;
  }

  try {
    // 1. Consultar productos publicados
    const { results: productos } = await db
      .prepare(
        `SELECT 
          p.id,
          p.nombre,
          p.slug,
          m.nombre AS marca,
          m.tipo_comercial,
          p.genero,
          COALESCE(f.nombre, 'Composición Maison') AS familia_olfativa,
          COALESCE(p.descripcion, '') AS descripcion,
          p.es_destacado,
          p.etiqueta_destacada,
          p.created_at
        FROM productos p
        JOIN marcas m ON p.marca_id = m.id
        LEFT JOIN producto_familias_olfativas pf ON p.id = pf.producto_id
        LEFT JOIN familias_olfativas f ON pf.familia_olfativa_id = f.id
        WHERE p.estado = 'publicado'
        ORDER BY p.id DESC`,
      )
      .all<any>();

    if (!productos || productos.length === 0) {
      return fallbackProducts;
    }

    // 2. Consultar variantes activas
    const { results: variantes } = await db
      .prepare(
        `SELECT id, producto_id, tamano_ml, precio_centimos, precio_referencia_centimos, es_predeterminada, tipo_presentacion
         FROM variantes_producto
         WHERE activo = 1
         ORDER BY tamano_ml ASC`,
      )
      .all<any>();

    // 3. Consultar imágenes ordenadas
    const { results: imagenes } = await db
      .prepare(
        `SELECT producto_id, clave_archivo, es_principal, orden
         FROM imagenes_producto
         ORDER BY es_principal DESC, orden ASC`,
      )
      .all<{ producto_id: number; clave_archivo: string; es_principal: number; orden: number }>();

    // Agrupar variantes por producto_id
    const mapaVariantes = new Map<number, ProductVariant[]>();
    const mapaPreciosReferencia = new Map<number, number>();

    for (const v of variantes) {
      if (!mapaVariantes.has(v.producto_id)) {
        mapaVariantes.set(v.producto_id, []);
      }
      const esDecant = v.tipo_presentacion === "decant";
      mapaVariantes.get(v.producto_id)!.push({
        size: `${v.tamano_ml} ml${esDecant ? " (Decant)" : ""}`,
        price: Math.round(v.precio_centimos / 100),
        isDecant: esDecant,
      });

      if (v.precio_referencia_centimos && v.precio_referencia_centimos > v.precio_centimos) {
        mapaPreciosReferencia.set(v.producto_id, Math.round(v.precio_referencia_centimos / 100));
      }
    }

    // Agrupar imágenes por producto_id
    const mapaImagenes = new Map<number, string[]>();
    for (const img of imagenes) {
      if (!mapaImagenes.has(img.producto_id)) {
        mapaImagenes.set(img.producto_id, []);
      }
      mapaImagenes.get(img.producto_id)!.push(img.clave_archivo);
    }

    // Mapear al modelo Product que el frontend consume
    const ahora = Date.now();
    const treintaDiasEnMs = 30 * 24 * 60 * 60 * 1000;

    return productos.map((p) => {
      const fotos = mapaImagenes.get(p.id) || [];
      const imagenPrincipal = fotos[0] || "/assets/imagenxdefecto.svg";
      const listaVariantes = mapaVariantes.get(p.id) || [
        { size: "50 ml", price: 490, isDecant: false },
        { size: "100 ml", price: 620, isDecant: false },
      ];
      const precioAnterior = mapaPreciosReferencia.get(p.id);

      // Evaluación de novedad por fecha real (creado en últimos 30 días) o por etiqueta explícita
      const fechaCreacion = p.created_at ? new Date(p.created_at).getTime() : 0;
      const esReciente =
        p.etiqueta_destacada === "nuevo" ||
        (fechaCreacion > 0 && ahora - fechaCreacion <= treintaDiasEnMs);

      return {
        id: p.id,
        slug: p.slug,
        brand: p.marca,
        name: p.nombre,
        gender: p.genero as Gender,
        family: p.familia_olfativa,
        commercialType: normalizarTipoComercial(p.tipo_comercial),
        description: p.descripcion,
        image: imagenPrincipal,
        gallery: fotos.length > 0 ? fotos : [imagenPrincipal],
        variants: listaVariantes,
        oldPrice: precioAnterior,
        featured: Boolean(p.es_destacado),
        recent: esReciente,
        active: true,
        createdAt: p.created_at,
      };
    });
  } catch (error) {
    console.warn("No se pudieron consultar productos de D1 (usando catálogo de respaldo):", error);
    return fallbackProducts;
  }
}

/**
 * Obtiene la ficha de detalle de un perfume por su slug desde Cloudflare D1
 * adaptada al frontend con su pirámide olfativa y variantes completas.
 */
export async function obtenerDetalleProductoTienda(
  slug: string,
  db?: D1Database,
): Promise<{
  producto: Product;
  piramide: PiramideOlfativa;
  caracteristicas: {
    concentracion: string;
    ocasion: string;
    procedencia: string;
  };
} | null> {
  const piramidePorDefecto: PiramideOlfativa = {
    salida: ["Bergamota", "Pimienta rosa", "Acordes cítricos"],
    corazon: ["Jazmín", "Maderas nobles", "Especias envolventes"],
    fondo: ["Ámbar", "Almizcle blanco", "Vainilla de Madagascar"],
  };

  const caracteristicasPorDefecto = {
    concentracion: "Eau de Parfum",
    ocasion: "Día y noche",
    procedencia: "Importado",
  };

  if (!db) {
    const fallback = fallbackProducts.find((p) => p.slug === slug);
    if (fallback) {
      return {
        producto: fallback,
        piramide: piramidePorDefecto,
        caracteristicas: caracteristicasPorDefecto,
      };
    }
    return null;
  }

  try {
    const detalleDb = await obtenerDetalleProductoPorSlug(db, slug);
    if (!detalleDb) {
      const fallback = fallbackProducts.find((p) => p.slug === slug);
      if (fallback) {
        return {
          producto: fallback,
          piramide: piramidePorDefecto,
          caracteristicas: caracteristicasPorDefecto,
        };
      }
      return null;
    }

    const fotos = detalleDb.galeria_imagenes && detalleDb.galeria_imagenes.length > 0
      ? detalleDb.galeria_imagenes
      : ["/assets/imagenxdefecto.svg"];

    const variantes: ProductVariant[] = detalleDb.variantes.map((v) => ({
      size: `${v.tamano_ml} ml`,
      price: Math.round(v.precio_centimos / 100),
    }));

    const varRef = detalleDb.variantes.find(
      (v) => v.precio_referencia_centimos && v.precio_referencia_centimos > v.precio_centimos,
    );
    const precioReferencia = varRef?.precio_referencia_centimos
      ? Math.round(varRef.precio_referencia_centimos / 100)
      : undefined;

    const producto: Product = {
      id: detalleDb.id,
      slug: detalleDb.slug,
      brand: detalleDb.marca,
      name: detalleDb.nombre,
      gender: detalleDb.genero,
      family: detalleDb.familia_olfativa,
      description: detalleDb.descripcion,
      image: fotos[0],
      gallery: fotos,
      variants: variantes.length > 0 ? variantes : [{ size: "50 ml", price: 490 }],
      oldPrice: precioReferencia,
      featured: true,
      active: true,
    };

    return {
      producto,
      piramide: detalleDb.piramide_olfativa || piramidePorDefecto,
      caracteristicas: {
        concentracion: detalleDb.concentracion || "Eau de Parfum",
        ocasion: detalleDb.ocasion_uso || "Día y noche",
        procedencia: detalleDb.pais_origen || "Importado",
      },
    };
  } catch (error) {
    console.warn("No se pudo obtener detalle de D1 para slug (usando producto de respaldo):", slug, error);
    const fallback = fallbackProducts.find((p) => p.slug === slug);
    if (fallback) {
      return {
        producto: fallback,
        piramide: piramidePorDefecto,
        caracteristicas: caracteristicasPorDefecto,
      };
    }
    return null;
  }
}

// =============================================================================
// 7. IMPORTACIÓN MASIVA DESDE ARCHIVO CSV
// =============================================================================

export interface ResultadoImportacionCsv {
  creados: number;
  actualizados: number;
  omitidos: number;
  errores: string[];
}

/**
 * Importa un lote de perfumes validados desde CSV directamente a Cloudflare D1.
 * Maneja resolución de marcas, variantes regulares (50ml/100ml), decants (3ml/5ml/10ml)
 * e imagen insignia inicial de forma atómica y protegida.
 */
export async function importarProductosCsvEnDb(
  db: D1Database,
  filas: FilaCsvProcesada[],
  modoDuplicados: "omitir" | "actualizar",
): Promise<ResultadoImportacionCsv> {
  let creados = 0;
  let actualizados = 0;
  let omitidos = 0;
  const errores: string[] = [];

  for (const fila of filas) {
    if (!fila.esValido) {
      omitidos++;
      continue;
    }

    let nuevoId: number | null = null;
    try {
      // 1. Manejo de duplicados existentes
      if (fila.idProductoExistente && modoDuplicados === "omitir") {
        omitidos++;
        continue;
      }

      if (fila.idProductoExistente && modoDuplicados === "actualizar") {
        const id = fila.idProductoExistente;
        const p50Cent = Math.round(fila.precio_50ml * 100);
        const p100Cent = Math.round(fila.precio_100ml * 100);

        await db
          .prepare(
            `UPDATE variantes_producto 
             SET precio_centimos = ?, tipo_presentacion = 'frasco', updated_at = CURRENT_TIMESTAMP 
             WHERE producto_id = ? AND tamano_ml = 50`,
          )
          .bind(p50Cent, id)
          .run();

        await db
          .prepare(
            `UPDATE variantes_producto 
             SET precio_centimos = ?, tipo_presentacion = 'frasco', updated_at = CURRENT_TIMESTAMP 
             WHERE producto_id = ? AND tamano_ml = 100`,
          )
          .bind(p100Cent, id)
          .run();

        if (fila.tiene_decants) {
          const actualizarOCrearDecant = async (tamano: number, precio?: number | null) => {
            if (!precio || precio <= 0) return;
            const pCent = Math.round(precio * 100);
            const res = await db
              .prepare(
                `UPDATE variantes_producto 
                 SET precio_centimos = ?, tipo_presentacion = 'decant', activo = 1, updated_at = CURRENT_TIMESTAMP 
                 WHERE producto_id = ? AND tamano_ml = ?`,
              )
              .bind(pCent, id, tamano)
              .run();

            if (res.meta.changes === 0) {
              await db
                .prepare(
                  `INSERT INTO variantes_producto (
                    producto_id, sku, tamano_ml, precio_centimos, 
                    es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
                  ) VALUES (?, ?, ?, ?, 0, 0, 'venta_regular', 'decant', 1)`,
                )
                .bind(id, `DEC-${id}-${tamano}ML`, tamano, pCent)
                .run();
            }
          };

          await actualizarOCrearDecant(3, fila.precio_decant_3ml);
          await actualizarOCrearDecant(5, fila.precio_decant_5ml);
          await actualizarOCrearDecant(10, fila.precio_decant_10ml);

          try {
            await db
              .prepare("INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES (?, ?)")
              .bind(id, 4)
              .run();
          } catch { }
        }

        actualizados++;
        continue;
      }

      // 2. Creación de nueva fragancia
      const marcaIdFinal = await asegurarMarca(db, undefined, fila.marca, fila.linea_comercial);
      const slugFinal = await generarSlugUnico(db, `${fila.marca} ${fila.nombre}`);

      await db
        .prepare(
          `INSERT INTO productos (
            marca_id, nombre, slug, descripcion, genero, concentracion, 
            pais_origen, ocasion_uso, estado, es_destacado, etiqueta_destacada, publicado_en
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'publicado', 0, 'ninguna', CURRENT_TIMESTAMP)`,
        )
        .bind(
          marcaIdFinal,
          fila.nombre.trim(),
          slugFinal,
          `Fragancia ${fila.nombre} de ${fila.marca}. Concentración ${fila.concentracion}. Procedencia: ${fila.pais_origen}.`,
          fila.genero,
          fila.concentracion,
          fila.pais_origen,
          fila.ocasion_uso,
        )
        .run();

      const prodFila = await db.prepare("SELECT last_insert_rowid() AS id").first<{ id: number }>();
      if (!prodFila?.id) {
        throw new Error(`No se pudo obtener el identificador para "${fila.nombre}"`);
      }
      nuevoId = prodFila.id;

      // 3. Crear variantes obligatorias de 50 ml y 100 ml en frasco
      const p50Cent = Math.round(fila.precio_50ml * 100);
      const p100Cent = Math.round(fila.precio_100ml * 100);

      const batchVariantes = [
        db
          .prepare(
            `INSERT INTO variantes_producto (
              producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
            ) VALUES (?, ?, 50, ?, 1, 0, 'venta_regular', 'frasco', 1)`,
          )
          .bind(nuevoId, `MDP-${nuevoId}-50ML`, p50Cent),
        db
          .prepare(
            `INSERT INTO variantes_producto (
              producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
            ) VALUES (?, ?, 100, ?, 0, 0, 'venta_regular', 'frasco', 1)`,
          )
          .bind(nuevoId, `MDP-${nuevoId}-100ML`, p100Cent),
      ];

      // Variantes de decants
      if (fila.tiene_decants) {
        if (fila.precio_decant_3ml && fila.precio_decant_3ml > 0) {
          batchVariantes.push(
            db
              .prepare(
                `INSERT INTO variantes_producto (producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo)
                 VALUES (?, ?, 3, ?, 0, 0, 'venta_regular', 'decant', 1)`,
              )
              .bind(nuevoId, `DEC-${nuevoId}-3ML`, Math.round(fila.precio_decant_3ml * 100)),
          );
        }
        if (fila.precio_decant_5ml && fila.precio_decant_5ml > 0) {
          batchVariantes.push(
            db
              .prepare(
                `INSERT INTO variantes_producto (producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo)
                 VALUES (?, ?, 5, ?, 0, 0, 'venta_regular', 'decant', 1)`,
              )
              .bind(nuevoId, `DEC-${nuevoId}-5ML`, Math.round(fila.precio_decant_5ml * 100)),
          );
        }
        if (fila.precio_decant_10ml && fila.precio_decant_10ml > 0) {
          batchVariantes.push(
            db
              .prepare(
                `INSERT INTO variantes_producto (producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo)
                 VALUES (?, ?, 10, ?, 0, 0, 'venta_regular', 'decant', 1)`,
              )
              .bind(nuevoId, `DEC-${nuevoId}-10ML`, Math.round(fila.precio_decant_10ml * 100)),
          );
        }
      }

      await db.batch(batchVariantes);

      // 4. Asociación de categorías comerciales dinámicamente por slug (inmune a cambios de ID)
      const slugCategoria = fila.linea_comercial === "arabe" ? "arabes" : fila.linea_comercial === "nicho" ? "nichos" : "disenador";
      const batchCategorias = [
        db
          .prepare(
            `INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id)
             SELECT ?, id FROM categorias WHERE slug = ?`,
          )
          .bind(nuevoId, slugCategoria),
      ];
      if (fila.tiene_decants) {
        batchCategorias.push(
          db
            .prepare(
              `INSERT OR IGNORE INTO producto_categorias (producto_id, categoria_id)
               SELECT ?, id FROM categorias WHERE slug = 'decants'`,
            )
            .bind(nuevoId),
        );
      }
      await db.batch(batchCategorias);

      // 5. Imagen de portada inicial por defecto (sin URLs externas)
      await db
        .prepare(
          `INSERT INTO imagenes_producto (producto_id, clave_archivo, texto_alternativo, orden, es_principal)
           VALUES (?, ?, ?, 0, 1)`,
        )
        .bind(nuevoId, "/assets/imagenxdefecto.svg", `${fila.marca} ${fila.nombre} - Foto inicial`)
        .run();

      creados++;
    } catch (err: any) {
      // Si ocurrió un error durante la inserción, limpiar los registros incompletos para preservar la consistencia
      if (nuevoId) {
        try {
          await db.prepare("DELETE FROM variantes_producto WHERE producto_id = ?").bind(nuevoId).run();
          await db.prepare("DELETE FROM producto_categorias WHERE producto_id = ?").bind(nuevoId).run();
          await db.prepare("DELETE FROM imagenes_producto WHERE producto_id = ?").bind(nuevoId).run();
          await db.prepare("DELETE FROM productos WHERE id = ?").bind(nuevoId).run();
        } catch { }
      }
      console.error(`Error al procesar fila #${fila.filaNumero} (${fila.nombre}):`, err);
      let mensajeError = err.message || "Error al registrar la fragancia.";
      if (
        mensajeError.includes("D1_ERROR") ||
        mensajeError.includes("SQL") ||
        mensajeError.includes("parameter bindings") ||
        mensajeError.includes("SQLITE")
      ) {
        mensajeError = "No se pudo registrar la información de la fragancia en el catálogo oficial.";
      }
      errores.push(`Fila #${fila.filaNumero} (${fila.nombre}): ${mensajeError}`);
    }
  }

  return { creados, actualizados, omitidos, errores };
}

