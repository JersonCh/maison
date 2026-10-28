import type { APIRoute } from "astro";

export const prerender = false;

/**
 * GET /api/images/[...path]
 * Sirve imágenes de alta calidad directamente desde Cloudflare R2
 * con cabeceras de caché inmutable (1 año) y soporte para Content-Type y ETag.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  const path = params.path;
  if (!path) {
    return new Response("Ruta de imagen no especificada", { status: 400 });
  }

  const bucket = locals.runtime?.env?.BUCKET;
  if (!bucket) {
    return new Response("Almacenamiento de imágenes no disponible", { status: 503 });
  }

  try {
    const object = await bucket.get(path);
    if (!object) {
      return new Response("Imagen no encontrada", { status: 404 });
    }

    const headers = new Headers();
    const contentType = object.httpMetadata?.contentType || "image/jpeg";
    headers.set("Content-Type", contentType);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    const arrayBuffer = await object.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error(`Error al servir imagen R2 [${path}]:`, error);
    return new Response("Error al recuperar la imagen", { status: 500 });
  }
};
