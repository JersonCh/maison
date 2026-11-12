import type {
  ProductoCatalogo,
  ProductoDetalleCompleto,
  PiramideOlfativa,
} from "@/types/database";
import type { Gender, Product, ProductVariant } from "@/types/product";
import { products as fallbackProducts } from "@/data/products";
import { normalizarTipoComercial } from "./utils";
import { caracteristicasPorDefecto } from "./common";

const piramideVacia: PiramideOlfativa = {
  salida: [],
  corazon: [],
  fondo: [],
};

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
      COALESCE(p.tipo_comercial, m.tipo_comercial) AS tipo_comercial,
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
        COALESCE(p.pais_origen, m.pais_origen, 'Francia') AS pais_origen,
        COALESCE(p.tipo_comercial, m.tipo_comercial) AS tipo_comercial,
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

  // Galería de imágenes en orden
  const { results: imagenes } = await db
    .prepare(
      `SELECT clave_archivo
       FROM imagenes_producto
       WHERE producto_id = ?
       ORDER BY es_principal DESC, orden ASC`,
    )
    .bind(producto.id)
    .all<{ clave_archivo: string }>();

  // Pirámide olfativa estructurada (3 fases: salida, corazón, fondo)
  const piramide: PiramideOlfativa = { salida: [], corazon: [], fondo: [] };
  try {
    const { results: notas } = await db
      .prepare(
        `SELECT n.nombre, pn.etapa
         FROM producto_notas pn
         JOIN notas_aromaticas n ON pn.nota_aromatica_id = n.id
         WHERE pn.producto_id = ?`,
      )
      .bind(producto.id)
      .all<{ nombre: string; etapa: "salida" | "corazon" | "fondo" }>();

    for (const n of notas) {
      if (n.etapa === "salida") piramide.salida.push(n.nombre);
      else if (n.etapa === "corazon") piramide.corazon.push(n.nombre);
      else if (n.etapa === "fondo") piramide.fondo.push(n.nombre);
    }
  } catch {
    // Si no existen registros o tablas de notas olfativas, se utilizan los fallbacks editoriales
  }

  // Si no existen notas reales cargadas en BD, se retorna la pirámide vacía
  // para que la interfaz oculte la sección editorial en lugar de mostrar notas genéricas.

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

/**
 * Obtiene todos los productos publicados desde Cloudflare D1 adaptados
 * al modelo de dominio `Product` que consume el frontend público.
 */
export async function obtenerProductosTienda(
  db?: D1Database,
): Promise<Product[]> {
  const esDev = Boolean(import.meta.env?.DEV);

  if (!db) {
    return esDev ? fallbackProducts : [];
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
          COALESCE(p.tipo_comercial, m.tipo_comercial) AS tipo_comercial,
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
      return esDev ? fallbackProducts : [];
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
      const oldPrice =
        !esDecant &&
        v.precio_referencia_centimos &&
        v.precio_referencia_centimos > v.precio_centimos
          ? Math.round(v.precio_referencia_centimos / 100)
          : undefined;

      mapaVariantes.get(v.producto_id)!.push({
        size: `${v.tamano_ml} ml${esDecant ? " (Decant)" : ""}`,
        price: Math.round(v.precio_centimos / 100),
        oldPrice,
        isDecant: esDecant,
      });

      if (oldPrice) {
        mapaPreciosReferencia.set(v.producto_id, oldPrice);
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
    if (esDev) {
      console.warn("No se pudieron consultar productos de D1 (usando catálogo de respaldo en DEV):", error);
      return fallbackProducts;
    }
    console.error("Error al consultar productos en Cloudflare D1:", error);
    return [];
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
    linea?: string;
    procedencia?: string;
  };
} | null> {
  const esDev = Boolean(import.meta.env?.DEV);

  if (!db) {
    if (esDev) {
      const fallback = fallbackProducts.find((p) => p.slug === slug);
      if (fallback) {
        return {
          producto: fallback,
          piramide: piramideVacia,
          caracteristicas: caracteristicasPorDefecto,
        };
      }
    }
    return null;
  }

  try {
    const detalleDb = await obtenerDetalleProductoPorSlug(db, slug);
    if (!detalleDb) {
      if (esDev) {
        const fallback = fallbackProducts.find((p) => p.slug === slug);
        if (fallback) {
          return {
            producto: fallback,
            piramide: piramideVacia,
            caracteristicas: caracteristicasPorDefecto,
          };
        }
      }
      return null;
    }

    const fotos = detalleDb.galeria_imagenes && detalleDb.galeria_imagenes.length > 0
      ? detalleDb.galeria_imagenes
      : ["/assets/imagenxdefecto.svg"];

    const variantes: ProductVariant[] = detalleDb.variantes.map((v) => {
      const esDecant = v.tipo_presentacion === "decant";
      const oldPrice =
        !esDecant &&
        v.precio_referencia_centimos &&
        v.precio_referencia_centimos > v.precio_centimos
          ? Math.round(v.precio_referencia_centimos / 100)
          : undefined;

      return {
        size: `${v.tamano_ml} ml${esDecant ? " (Decant)" : ""}`,
        price: Math.round(v.precio_centimos / 100),
        oldPrice,
        isDecant: esDecant,
      };
    });

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
      piramide: detalleDb.piramide_olfativa || piramideVacia,
      caracteristicas: {
        concentracion: detalleDb.concentracion || "Eau de Parfum",
        ocasion: detalleDb.ocasion_uso || "Día y noche",
        linea: detalleDb.tipo_comercial === "nicho" ? "Nicho / Autor" : detalleDb.tipo_comercial === "arabe" ? "Perfumería Árabe" : "Diseñador",
        procedencia: "Importado",
      },
    };
  } catch (error) {
    if (esDev) {
      console.warn("No se pudo obtener detalle de D1 para slug (usando producto de respaldo en DEV):", slug, error);
      const fallback = fallbackProducts.find((p) => p.slug === slug);
      if (fallback) {
        return {
          producto: fallback,
          piramide: piramideVacia,
          caracteristicas: caracteristicasPorDefecto,
        };
      }
    } else {
      console.error("Error al obtener detalle de producto en Cloudflare D1:", slug, error);
    }
    return null;
  }
}
