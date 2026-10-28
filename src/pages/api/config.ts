import type { APIRoute } from "astro";
import {
  obtenerConfiguracionTienda,
  actualizarConfiguracionTienda,
} from "@/lib/db";

export const prerender = false;

/**
 * GET /api/config
 * Retorna todos los parámetros de configuración pública (WhatsApp, redes, horarios).
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Base de datos D1 no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const configuracion = await obtenerConfiguracionTienda(db);
    return new Response(JSON.stringify(configuracion), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al obtener la configuración" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * PUT /api/config
 * Actualiza los valores de configuración de la tienda desde el panel de administración.
 */
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: "Base de datos D1 no disponible" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const cuerpo = await request.json();
    if (!cuerpo || typeof cuerpo !== "object") {
      return new Response(
        JSON.stringify({ error: "Datos de configuración inválidos" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    await actualizarConfiguracionTienda(db, cuerpo);

    return new Response(
      JSON.stringify({
        exito: true,
        mensaje: "Configuración comercial guardada correctamente en Cloudflare D1",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al guardar la configuración en D1" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
