import type {
  ProductoCatalogo,
  ProductoDetalleCompleto,
  BannerSlide,
  PiramideOlfativa,
} from "@/types/database";
import type { Gender } from "@/types/product";

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
  const { results } = await db
    .prepare("SELECT clave, valor FROM configuracion_tienda")
    .all<{ clave: string; valor: string }>();

  const configuracion: Record<string, string> = {};
  for (const fila of results) {
    configuracion[fila.clave] = fila.valor;
  }
  return configuracion;
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
      COALESCE(f.nombre, 'Composición Maison') AS familia_olfativa,
      COALESCE(
        (SELECT clave_archivo FROM imagenes_producto WHERE producto_id = p.id AND es_principal = 1 LIMIT 1),
        (SELECT clave_archivo FROM imagenes_producto WHERE producto_id = p.id ORDER BY orden ASC LIMIT 1),
        '/assets/maison-logo.jpeg'
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
      `SELECT id, tamano_ml, precio_centimos, precio_referencia_centimos, es_predeterminada
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
            '/assets/maison-logo.jpeg'
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
          '/assets/maison-logo.jpeg'
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
}
