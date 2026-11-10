import type {
  ProductoAdminItem,
  DatosFormularioProducto,
} from "@/types/database";
import type { Gender } from "@/types/product";
import { asegurarMarca, asegurarFamiliaOlfativa } from "./brands";
import { normalizarTextoParaSlug, normalizarTipoComercial } from "./utils";

/**
 * Obtiene la lista de todos los productos para la tabla administrativa,
 * incluyendo sus 2 variantes (50ml y 100ml) y sus imágenes.
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
    const v50 = vars.find((v) => Math.round(v.tamano_ml) === 50 && v.tipo_presentacion === "frasco");
    const v100 = vars.find((v) => Math.round(v.tamano_ml) === 100 && v.tipo_presentacion === "frasco");
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
      precio_50ml: v50 ? Math.round(v50.precio_centimos / 100) : null,
      precio_100ml: v100 ? Math.round(v100.precio_centimos / 100) : null,
      precio_referencia_50ml: v50?.precio_referencia_centimos
        ? Math.round(v50.precio_referencia_centimos / 100)
        : null,
      imagenes: fotosRegistradas,
    };
  });
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
 * 3. Exactamente variantes requeridas: frascos (50ml y/o 100ml) + decants opcionales
 * 4. Imágenes en `imagenes_producto`
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
  // Obtener nombre de la marca para generar slug SEO limpio si no vino explícito
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

  // 3. Crear las variantes: frascos (50 ml y/o 100 ml) + decants opcionales
  const sentenciasVariantes: any[] = [];
  let predeterminadaAsignada = false;

  const precio50Num = Number(datos.precio_50ml || 0);
  const precio100Num = Number(datos.precio_100ml || 0);

  if (precio50Num > 0) {
    const precio50Centimos = Math.round(precio50Num * 100);
    const precioRef50Centimos = datos.precio_referencia_50ml
      ? Math.round(Number(datos.precio_referencia_50ml) * 100)
      : null;

    sentenciasVariantes.push(
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
    );
    predeterminadaAsignada = true;
  }

  if (precio100Num > 0) {
    const precio100Centimos = Math.round(precio100Num * 100);
    const esPredeterminada = predeterminadaAsignada ? 0 : 1;

    sentenciasVariantes.push(
      db
        .prepare(
          `INSERT INTO variantes_producto (
            producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
            es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
          ) VALUES (?, ?, 100, ?, NULL, ?, 0, 'venta_regular', 'frasco', 1)`,
        )
        .bind(
          productoId,
          `MDP-${productoId}-100ML`,
          precio100Centimos,
          esPredeterminada,
        ),
    );
  }

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

  // 5. Insertar imágenes provistas
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

  // 3. Actualizar variantes de frasco (50ml y/o 100ml)
  const precio50Num = Number(datos.precio_50ml || 0);
  const precio100Num = Number(datos.precio_100ml || 0);

  if (precio50Num > 0) {
    const precio50Centimos = Math.round(precio50Num * 100);
    const precioRef50Centimos = datos.precio_referencia_50ml
      ? Math.round(Number(datos.precio_referencia_50ml) * 100)
      : null;

    const res50 = await db
      .prepare(
        `UPDATE variantes_producto 
         SET precio_centimos = ?, precio_referencia_centimos = ?, tipo_presentacion = 'frasco', es_predeterminada = 1, activo = 1, updated_at = CURRENT_TIMESTAMP 
         WHERE producto_id = ? AND tamano_ml = 50 AND tipo_presentacion = 'frasco'`,
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
  } else {
    // Si no tiene precio de 50ml, retirar la variante de 50ml si existía
    await db
      .prepare("DELETE FROM variantes_producto WHERE producto_id = ? AND tamano_ml = 50 AND tipo_presentacion = 'frasco'")
      .bind(productoId)
      .run();
  }

  if (precio100Num > 0) {
    const precio100Centimos = Math.round(precio100Num * 100);
    const esPredeterminada100 = precio50Num > 0 ? 0 : 1;

    const res100 = await db
      .prepare(
        `UPDATE variantes_producto 
         SET precio_centimos = ?, tipo_presentacion = 'frasco', es_predeterminada = ?, activo = 1, updated_at = CURRENT_TIMESTAMP 
         WHERE producto_id = ? AND tamano_ml = 100 AND tipo_presentacion = 'frasco'`,
      )
      .bind(precio100Centimos, esPredeterminada100, productoId)
      .run();

    if (res100.meta.changes === 0) {
      await db
        .prepare(
          `INSERT INTO variantes_producto (
            producto_id, sku, tamano_ml, precio_centimos, precio_referencia_centimos, 
            es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
          ) VALUES (?, ?, 100, ?, NULL, ?, 0, 'venta_regular', 'frasco', 1)`,
        )
        .bind(productoId, `MDP-${productoId}-100ML`, precio100Centimos, esPredeterminada100)
        .run();
    }
  } else {
    // Si no tiene precio de 100ml, retirar la variante de 100ml si existía
    await db
      .prepare("DELETE FROM variantes_producto WHERE producto_id = ? AND tamano_ml = 100 AND tipo_presentacion = 'frasco'")
      .bind(productoId)
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

  // 4. Actualizar imágenes provistas
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
 * Si el producto tiene dependencias, se limpian ordenadamente en cascada.
 */
export async function archivarOEliminarProducto(
  db: D1Database,
  productoId: number,
): Promise<{ accion: "eliminado" | "archivado" }> {
  await db.batch([
    db.prepare("DELETE FROM imagenes_producto WHERE producto_id = ?").bind(productoId),
    db.prepare("DELETE FROM variantes_producto WHERE producto_id = ?").bind(productoId),
    db.prepare("DELETE FROM producto_categorias WHERE producto_id = ?").bind(productoId),
    db.prepare("DELETE FROM producto_familias_olfativas WHERE producto_id = ?").bind(productoId),
    db.prepare("DELETE FROM productos WHERE id = ?").bind(productoId),
  ]);

  return { accion: "eliminado" };
}

