import type { FilaCsvProcesada } from "@/lib/csvHelper";
import { asegurarMarca } from "./brands";
import { generarSlugUnico } from "./productsAdmin";

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
        if (fila.precio_50ml && fila.precio_50ml > 0) {
          const p50Cent = Math.round(fila.precio_50ml * 100);
          const res50 = await db
            .prepare(
              `UPDATE variantes_producto 
               SET precio_centimos = ?, tipo_presentacion = 'frasco', activo = 1, updated_at = CURRENT_TIMESTAMP 
               WHERE producto_id = ? AND tamano_ml = 50 AND tipo_presentacion = 'frasco'`,
            )
            .bind(p50Cent, id)
            .run();

          if (res50.meta.changes === 0) {
            await db
              .prepare(
                `INSERT INTO variantes_producto (
                  producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
                ) VALUES (?, ?, 50, ?, 1, 0, 'venta_regular', 'frasco', 1)`,
              )
              .bind(id, `MDP-${id}-50ML`, p50Cent)
              .run();
          }
        }

        if (fila.precio_100ml && fila.precio_100ml > 0) {
          const p100Cent = Math.round(fila.precio_100ml * 100);
          const res100 = await db
            .prepare(
              `UPDATE variantes_producto 
               SET precio_centimos = ?, tipo_presentacion = 'frasco', activo = 1, updated_at = CURRENT_TIMESTAMP 
               WHERE producto_id = ? AND tamano_ml = 100 AND tipo_presentacion = 'frasco'`,
            )
            .bind(p100Cent, id)
            .run();

          if (res100.meta.changes === 0) {
            await db
              .prepare(
                `INSERT INTO variantes_producto (
                  producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
                ) VALUES (?, ?, 100, ?, 0, 0, 'venta_regular', 'frasco', 1)`,
              )
              .bind(id, `MDP-${id}-100ML`, p100Cent)
              .run();
          }
        }

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

      // 3. Crear variantes de frasco (50 ml y/o 100 ml)
      const batchVariantes: any[] = [];
      let predeterminadaAsignada = false;

      if (fila.precio_50ml && fila.precio_50ml > 0) {
        const p50Cent = Math.round(fila.precio_50ml * 100);
        batchVariantes.push(
          db
            .prepare(
              `INSERT INTO variantes_producto (
                producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
              ) VALUES (?, ?, 50, ?, 1, 0, 'venta_regular', 'frasco', 1)`,
            )
            .bind(nuevoId, `MDP-${nuevoId}-50ML`, p50Cent),
        );
        predeterminadaAsignada = true;
      }

      if (fila.precio_100ml && fila.precio_100ml > 0) {
        const p100Cent = Math.round(fila.precio_100ml * 100);
        const esPredeterminada = predeterminadaAsignada ? 0 : 1;
        batchVariantes.push(
          db
            .prepare(
              `INSERT INTO variantes_producto (
                producto_id, sku, tamano_ml, precio_centimos, es_predeterminada, controla_stock, modalidad_disponibilidad, tipo_presentacion, activo
              ) VALUES (?, ?, 100, ?, ?, 0, 'venta_regular', 'frasco', 1)`,
            )
            .bind(nuevoId, `MDP-${nuevoId}-100ML`, p100Cent, esPredeterminada),
        );
      }

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

      // 4. Asociación de categorías comerciales dinámicamente por slug
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

      // 5. Imagen de portada inicial por defecto
      await db
        .prepare(
          `INSERT INTO imagenes_producto (producto_id, clave_archivo, texto_alternativo, orden, es_principal)
           VALUES (?, ?, ?, 0, 1)`,
        )
        .bind(nuevoId, "/assets/imagenxdefecto.svg", `${fila.marca} ${fila.nombre} - Foto inicial`)
        .run();

      creados++;
    } catch (err: any) {
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

