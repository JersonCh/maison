import type { APIRoute } from "astro";
import { obtenerProductosBoutique } from "@/lib/db";

export const prerender = false;

/**
 * GET /api/products
 * Retorna la lista de perfumes desde Cloudflare D1 adaptada para el frontend.
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

    const productos = await obtenerProductosBoutique(db);

    return new Response(JSON.stringify(productos), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al consultar los perfumes" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
