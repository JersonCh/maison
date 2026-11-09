import type { APIRoute } from "astro";
import {
  obtenerMarcasAdmin,
  crearMarcaAdmin,
  actualizarMarcaAdmin,
  eliminarMarcaAdmin,
  alternarEstadoMarcaAdmin,
} from "@/lib/db";
import type { CommercialType } from "@/types/product";

export const prerender = false;

/**
 * GET /api/admin/brands
 * Retorna el catálogo completo de casas de perfumería con sus métricas y total de fragancias.
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

    const marcas = await obtenerMarcasAdmin(db);

    const metricas = {
      total: marcas.length,
      disenador: marcas.filter((m) => m.tipo_comercial === "disenador").length,
      arabe: marcas.filter((m) => m.tipo_comercial === "arabe").length,
      nicho: marcas.filter((m) => m.tipo_comercial === "nicho").length,
      activas: marcas.filter((m) => m.activo).length,
    };

    return new Response(JSON.stringify({ marcas, metricas }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Error al obtener casas de perfumería:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al consultar las casas de perfumería" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * POST /api/admin/brands
 * Registra una nueva casa de perfumería.
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

    const payload = await request.json();
    const nombre = String(payload?.nombre || "").trim();
    const slug = payload?.slug ? String(payload.slug).trim() : undefined;
    const tipoComercial = (payload?.tipo_comercial || "disenador") as CommercialType;
    const descripcion = payload?.descripcion ? String(payload.descripcion).trim() : undefined;

    if (!nombre) {
      return new Response(
        JSON.stringify({ error: "El nombre de la casa de perfumería es obligatorio." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const id = await crearMarcaAdmin(db, {
      nombre,
      slug,
      tipo_comercial: tipoComercial,
      descripcion,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        id,
        mensaje: `La casa "${nombre}" se ha registrado exitosamente en el catálogo.`,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error al registrar casa de perfumería:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al crear la casa de perfumería" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * PUT /api/admin/brands
 * Actualiza una casa de perfumería existente.
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
    const id = Number(payload?.id);
    const nombre = String(payload?.nombre || "").trim();
    const slug = payload?.slug ? String(payload.slug).trim() : undefined;
    const tipoComercial = (payload?.tipo_comercial || "disenador") as CommercialType;
    const descripcion = payload?.descripcion !== undefined ? String(payload.descripcion).trim() : undefined;
    const activo = payload?.activo !== undefined ? Boolean(payload.activo) : undefined;

    if (!id || isNaN(id)) {
      return new Response(
        JSON.stringify({ error: "ID de casa de perfumería no válido." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!nombre) {
      return new Response(
        JSON.stringify({ error: "El nombre de la casa de perfumería es obligatorio." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    await actualizarMarcaAdmin(db, id, {
      nombre,
      slug,
      tipo_comercial: tipoComercial,
      descripcion,
      activo,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: `La firma "${nombre}" fue actualizada exitosamente.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error al actualizar casa de perfumería:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al actualizar la firma" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * PATCH /api/admin/brands
 * Alterna el estado activo / pausado de una casa de perfumería.
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

    const payload = await request.json();
    const id = Number(payload?.id);
    const activo = Boolean(payload?.activo);

    if (!id || isNaN(id)) {
      return new Response(
        JSON.stringify({ error: "ID de firma no válido." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    await alternarEstadoMarcaAdmin(db, id, activo);

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: `La casa ha sido ${activo ? "activada" : "pausada"} en el catálogo.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error al alternar estado de firma:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al alternar el estado" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * DELETE /api/admin/brands
 * Elimina una casa de perfumería. Si tiene perfumes asociados, permite reasignarlos
 * a otra marca de destino para preservar la integridad del catálogo.
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
    let reasignarA: number | undefined = undefined;

    const urlId = url.searchParams.get("id");
    const urlReasignar = url.searchParams.get("reasignar_a");

    if (urlId) {
      id = Number(urlId);
      if (urlReasignar) reasignarA = Number(urlReasignar);
    } else {
      const cuerpo = await request.json().catch(() => ({}));
      id = Number(cuerpo?.id);
      if (cuerpo?.reasignar_a) reasignarA = Number(cuerpo.reasignar_a);
    }

    if (!id || isNaN(id)) {
      return new Response(
        JSON.stringify({ error: "ID de casa de perfumería no válido." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { totalReasignados } = await eliminarMarcaAdmin(db, id, reasignarA);

    let mensaje = "Casa de perfumería retirada del catálogo exitosamente.";
    if (totalReasignados > 0) {
      mensaje = `Casa retirada exitosamente. ${totalReasignados} ${
        totalReasignados === 1 ? "fragancia fue transferida" : "fragancias fueron transferidas"
      } a la firma destino.`;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        totalReasignados,
        mensaje,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error al retirar casa de perfumería:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al retirar la firma del catálogo" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
};

