import type { APIRoute } from "astro";
import { importarProductosCsvEnDb } from "@/lib/db";
import type { FilaCsvProcesada } from "@/lib/csvHelper";

export const prerender = false;

/**
 * POST /api/admin/import-csv
 * Importa por lotes productos validados desde el archivo CSV hacia Cloudflare D1.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Servicio de base de datos no disponible." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await request.json();
    const productos: FilaCsvProcesada[] = body.productos;
    const modoDuplicados: "omitir" | "actualizar" = body.modoDuplicados === "actualizar" ? "actualizar" : "omitir";

    if (!Array.isArray(productos) || productos.length === 0) {
      return new Response(
        JSON.stringify({ error: "No se proporcionó ningún producto válido para importar." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const resultado = await importarProductosCsvEnDb(db, productos, modoDuplicados);

    return new Response(
      JSON.stringify({
        ok: true,
        resultado,
        mensaje: `Importación completada: ${resultado.creados} creados, ${resultado.actualizados} actualizados, ${resultado.omitidos} omitidos.`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error en importación CSV:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Error interno al procesar el archivo CSV.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
