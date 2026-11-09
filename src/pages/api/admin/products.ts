import type { APIRoute } from "astro";
import {
  obtenerProductosParaAdmin,
  crearNuevoProductoEnDb,
  actualizarProductoEnDb,
  alternarEstadoActivoProducto,
  archivarOEliminarProducto,
} from "@/lib/db";
import type { DatosFormularioProducto } from "@/types/database";

export const prerender = false;

/**
 * GET /api/admin/products
 * Lista todos los perfumes con sus variantes y 3 imágenes para el panel administrativo.
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de datos no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const productos = await obtenerProductosParaAdmin(db);
    return new Response(JSON.stringify(productos), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error al obtener productos para admin:", error);
    return new Response(
      JSON.stringify({ error: "Error al consultar los productos" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * POST /api/admin/products
 * Crea un nuevo perfume en Cloudflare D1 garantizando:
 * - 2 variantes (50ml y 100ml en céntimos)
 * - Exactamente 3 imágenes (Portada, Caja, Detalle)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de datos no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const datos: DatosFormularioProducto = await request.json();

    // Validaciones de negocio y arquitectura limpia
    if (!datos.nombre || !datos.nombre.trim()) {
      return new Response(
        JSON.stringify({ error: "El nombre del perfume es obligatorio." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const tiene50Post = Boolean(datos.precio_50ml && Number(datos.precio_50ml) > 0);
    const tiene100Post = Boolean(datos.precio_100ml && Number(datos.precio_100ml) > 0);

    if (!tiene50Post && !tiene100Post) {
      return new Response(
        JSON.stringify({ error: "Debes ingresar al menos una presentación de frasco (50 ml o 100 ml)." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }



    // Regla de imágenes: Si no se proporcionan fotos, se asigna el emblema oficial por defecto
    const fotosValidas = Array.isArray(datos.fotos)
      ? datos.fotos.map((f) => (typeof f === "string" ? f.trim() : "")).filter(Boolean)
      : [];

    datos.fotos = fotosValidas.length > 0 ? fotosValidas : ["/assets/imagenxdefecto.svg"];

    const nuevoId = await crearNuevoProductoEnDb(db, datos);

    return new Response(
      JSON.stringify({
        ok: true,
        id: nuevoId,
        mensaje: "Perfume creado exitosamente",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error al crear producto en D1:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al registrar el producto" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * PUT /api/admin/products
 * Actualiza un perfume existente en Cloudflare D1.
 */
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de datos no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const payload = await request.json();
    const id = Number(payload.id);

    if (!id || isNaN(id)) {
      return new Response(
        JSON.stringify({ error: "El ID del producto a actualizar es inválido." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const datos: DatosFormularioProducto = payload;

    if (!datos.nombre || !datos.nombre.trim()) {
      return new Response(
        JSON.stringify({ error: "El nombre del perfume es obligatorio." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const tiene50Post = Boolean(datos.precio_50ml && Number(datos.precio_50ml) > 0);
    const tiene100Post = Boolean(datos.precio_100ml && Number(datos.precio_100ml) > 0);

    if (!tiene50Post && !tiene100Post) {
      return new Response(
        JSON.stringify({ error: "Debes ingresar al menos una presentación de frasco (50 ml o 100 ml)." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }


    // Regla de imágenes: Si no se proporcionan fotos, se asigna el emblema oficial por defecto
    const fotosValidas = Array.isArray(datos.fotos)
      ? datos.fotos.map((f) => (typeof f === "string" ? f.trim() : "")).filter(Boolean)
      : [];

    datos.fotos = fotosValidas.length > 0 ? fotosValidas : ["/assets/imagenxdefecto.svg"];

    await actualizarProductoEnDb(db, id, datos);

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: "Perfume actualizado exitosamente",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error al actualizar producto en D1:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al actualizar el producto" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * PATCH /api/admin/products
 * Alterna el estado activo / inactivo de un perfume.
 */
export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de datos no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const { id, activo } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: "El ID del producto es requerido." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    await alternarEstadoActivoProducto(db, Number(id), Boolean(activo));

    return new Response(
      JSON.stringify({ ok: true, mensaje: "Estado actualizado correctamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el estado del producto" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * DELETE /api/admin/products
 * Elimina o archiva el producto respetando las restricciones de integridad.
 */
export const DELETE: APIRoute = async ({ request, url, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de datos no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    let id: number | null = null;
    const urlId = url.searchParams.get("id");
    if (urlId) {
      id = Number(urlId);
    } else {
      const cuerpo = await request.json().catch(() => ({}));
      id = Number(cuerpo?.id);
    }

    if (!id || isNaN(id)) {
      return new Response(
        JSON.stringify({ error: "ID de producto inválido para eliminación." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const resultado = await archivarOEliminarProducto(db, id);

    return new Response(
      JSON.stringify({
        ok: true,
        accion: resultado.accion,
        mensaje: "Fragancia eliminada del catálogo correctamente.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error al eliminar o archivar producto:", error);
    return new Response(
      JSON.stringify({ error: "Error al procesar la eliminación" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
