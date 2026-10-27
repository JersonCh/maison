import type { APIRoute } from "astro";
import { obtenerProductosCatalogo } from "@/lib/db";

export const prerender = false;

/**
 * GET /api/products
 * Retorna la lista de perfumes desde Cloudflare D1 con filtros opcionales.
 * Query params: ?genero=Hombre
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Base de datos D1 no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const genero = url.searchParams.get("genero") || undefined;
    const productos = await obtenerProductosCatalogo(db, { genero });

    return new Response(JSON.stringify(productos), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al consultar los perfumes en D1" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
