import type { APIRoute } from "astro";
import { slugify } from "@/lib/slug";

export const prerender = false;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // Límite de 5 MB por imagen
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
        error: "El almacenamiento Cloudflare R2 no está disponible en este entorno.",
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
          error: `La imagen supera el límite de 5 MB (tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Normalizar nombre del archivo conservando extensión
    const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
    const nombreLimpio = file.name.substring(0, file.name.lastIndexOf(".")) || "fragancia";
    const slugArchivo = slugify(nombreLimpio) || "perfume";
    const timestamp = Date.now();
    const key = `perfumes/${timestamp}-${slugArchivo}.${extension}`;

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
    console.error("Error al procesar subida a R2:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Error al subir la imagen a Cloudflare R2" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
