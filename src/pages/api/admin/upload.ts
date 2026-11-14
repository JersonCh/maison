import type { APIRoute } from "astro";
import { slugify } from "@/lib/slug";

export const prerender = false;

const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // Límite estricto de seguridad de 1.5 MB por imagen
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

/**
 * POST /api/admin/upload
 * Endpoint para subir imágenes de fragancias directamente a Cloudflare R2.
 * Genera claves SEO-friendly bajo el prefijo 'perfumes/'.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const bucket = locals.runtime?.env?.BUCKET;
  if (!bucket) {
    return new Response(
      JSON.stringify({
        error: "El almacenamiento de imágenes no está disponible en este momento.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No se ha proporcionado un archivo de imagen válido." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return new Response(
        JSON.stringify({
          error: `Formato (${file.type}) no permitido. Se admiten únicamente WebP, JPG, PNG y AVIF.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: `La imagen supera el límite permitido de 1 MB (tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Parámetros contextuales para nombrado limpio y reconocible
    const nombrePerfumeRaw = String(formData.get("nombre_perfume") || "").trim();
    const slotRaw = String(formData.get("slot") || "").trim();

    // Normalizar nombre del archivo conservando extensión
    const extension = file.name.split(".").pop()?.toLowerCase() || "webp";

    // Si se envió un nombre de perfume real (descartando nombres genéricos temporales)
    let nombreBase = "";
    if (nombrePerfumeRaw && nombrePerfumeRaw !== "nuevo-perfume" && nombrePerfumeRaw.toLowerCase() !== "sin titulo") {
      nombreBase = slugify(nombrePerfumeRaw);
    }

    // Si aún no se había ingresado el nombre del perfume, usar el nombre original del archivo
    if (!nombreBase) {
      const nombreArchivoOriginal = file.name.substring(0, file.name.lastIndexOf(".")) || "fragancia";
      nombreBase = slugify(nombreArchivoOriginal) || "fragancia";
    }

    // Sufijo de la ranura (portada, caja, detalle)
    const slotSufijo = slotRaw ? `-${slugify(slotRaw)}` : "";
    // Identificador único corto (5 caracteres) para evitar colisiones y caché vieja si se reemplaza
    const shortId = Math.random().toString(36).substring(2, 7);

    const key = `perfumes/${nombreBase}${slotSufijo}-${shortId}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();

    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    const publicUrl = `/api/images/${key}`;

    return new Response(
      JSON.stringify({
        ok: true,
        url: publicUrl,
        key,
        size: file.size,
        contentType: file.type,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error al procesar subida de imagen:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al subir la imagen" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

/**
 * DELETE /api/admin/upload
 * Elimina permanentemente un archivo de imagen del almacenamiento mediante su URL o clave.
 */
export const DELETE: APIRoute = async ({ request, locals }) => {
  const bucket = locals.runtime?.env?.BUCKET;
  if (!bucket) {
    return new Response(
      JSON.stringify({
        error: "El servicio de almacenamiento no está disponible.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    let urlOCopia = String(body?.url || body?.key || "").trim();

    if (!urlOCopia) {
      return new Response(
        JSON.stringify({ error: "No se proporcionó la imagen a eliminar." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Extraer la clave si viene con prefijo /api/images/
    let key = urlOCopia;
    if (key.includes("/api/images/")) {
      key = key.split("/api/images/")[1];
    }
    key = key.replace(/^\/+/, "");

    // Validar que pertenezca a las carpetas autorizadas de la tienda
    if (!key.startsWith("perfumes/") && !key.startsWith("marcas/") && !key.startsWith("banners/")) {
      return new Response(
        JSON.stringify({ error: "Ruta de archivo no autorizada." }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    await bucket.delete(key);

    return new Response(
      JSON.stringify({ ok: true, mensaje: "Fotografía eliminada permanentemente." }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error al eliminar archivo:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al eliminar la imagen" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
