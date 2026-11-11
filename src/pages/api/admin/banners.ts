import type { APIRoute } from "astro";
import {
  obtenerTodosLosBannersAdmin,
  crearBannerAdmin,
  actualizarBannerAdmin,
  alternarEstadoBannerAdmin,
  actualizarOrdenBannersAdmin,
  eliminarBannerAdmin,
} from "@/lib/database/bannersAdmin";

export const prerender = false;

/**
 * GET /api/admin/banners
 * Retorna las diapositivas del carrusel para el gestor administrativo.
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de base de datos no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const ubicacion = url.searchParams.get("ubicacion") || "hero_home";
    const banners = await obtenerTodosLosBannersAdmin(db, ubicacion);

    return new Response(JSON.stringify({ banners }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Error al obtener banners:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al obtener banners" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * POST /api/admin/banners
 * Crea una nueva diapositiva.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de base de datos no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const {
      ubicacion = "hero_home",
      titulo,
      subtitulo,
      descripcion,
      texto_boton,
      enlace_url,
      imagen_desktop,
      imagen_mobile,
      orden,
      activo,
    } = body;

    if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
      return new Response(
        JSON.stringify({ error: "El título principal de la diapositiva es obligatorio." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!imagen_desktop || typeof imagen_desktop !== "string" || !imagen_desktop.trim()) {
      return new Response(
        JSON.stringify({ error: "La imagen para pantalla de escritorio es obligatoria." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resultado = await crearBannerAdmin(db, {
      ubicacion,
      titulo,
      subtitulo,
      descripcion,
      texto_boton,
      enlace_url,
      imagen_desktop,
      imagen_mobile,
      orden: typeof orden === "number" ? orden : undefined,
      activo: activo !== false,
    });

    return new Response(
      JSON.stringify({
        mensaje: "Diapositiva registrada exitosamente en el catálogo.",
        id: resultado.id,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error al crear banner:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al registrar la diapositiva" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * PUT /api/admin/banners
 * Modifica una diapositiva existente, actualiza su estado o reordena.
 */
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de base de datos no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();

    // 1. Caso: Reordenar diapositivas
    if (body.action === "reorder" && Array.isArray(body.ordenes)) {
      await actualizarOrdenBannersAdmin(db, body.ordenes);
      return new Response(
        JSON.stringify({ mensaje: "Orden de diapositivas actualizado correctamente." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Caso: Alternar estado activo / inactivo
    if (body.action === "toggle" && body.id) {
      const exito = await alternarEstadoBannerAdmin(db, Number(body.id), Boolean(body.activo));
      if (!exito) {
        return new Response(
          JSON.stringify({ error: "No se encontró la diapositiva solicitada." }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          mensaje: body.activo
            ? "Diapositiva activada en la portada."
            : "Diapositiva pausada del carrusel.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Caso: Edición completa
    const id = Number(body.id);
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID de diapositiva no válido." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (body.titulo !== undefined && (!body.titulo || !body.titulo.trim())) {
      return new Response(
        JSON.stringify({ error: "El título de la diapositiva no puede estar vacío." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (body.imagen_desktop !== undefined && (!body.imagen_desktop || !body.imagen_desktop.trim())) {
      return new Response(
        JSON.stringify({ error: "La imagen para escritorio no puede estar vacía." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const exito = await actualizarBannerAdmin(db, id, {
      titulo: body.titulo,
      subtitulo: body.subtitulo,
      descripcion: body.descripcion,
      texto_boton: body.texto_boton,
      enlace_url: body.enlace_url,
      imagen_desktop: body.imagen_desktop,
      imagen_mobile: body.imagen_mobile,
      orden: typeof body.orden === "number" ? body.orden : undefined,
      activo: body.activo !== undefined ? Boolean(body.activo) : undefined,
    });

    if (!exito) {
      return new Response(
        JSON.stringify({ error: "No se pudo actualizar la diapositiva." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ mensaje: "Diapositiva actualizada correctamente." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error al actualizar banner:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al actualizar la diapositiva" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * DELETE /api/admin/banners?id=123
 * Elimina una diapositiva permanentemente.
 */
export const DELETE: APIRoute = async ({ url, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de base de datos no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const idParam = url.searchParams.get("id");
    const id = Number(idParam);

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID de diapositiva no proporcionado o inválido." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const exito = await eliminarBannerAdmin(db, id);

    if (!exito) {
      return new Response(
        JSON.stringify({ error: "No se encontró la diapositiva a eliminar." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ mensaje: "Diapositiva retirada del catálogo oficial." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error al eliminar banner:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al eliminar la diapositiva" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

