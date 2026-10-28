import type { APIRoute } from "astro";
import {
  obtenerMarcasDisponibles,
  obtenerFamiliasOlfativasDisponibles,
} from "@/lib/db";

export const prerender = false;

/**
 * GET /api/admin/metadata
 * Retorna las marcas y familias olfativas disponibles desde Cloudflare D1
 * para alimentar los selectores del formulario de creación y edición.
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

    const [marcas, familias] = await Promise.all([
      obtenerMarcasDisponibles(db),
      obtenerFamiliasOlfativasDisponibles(db),
    ]);

    return new Response(JSON.stringify({ marcas, familias }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error al obtener metadatos de D1:", error);
    return new Response(
      JSON.stringify({ error: "Error al consultar metadatos" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
