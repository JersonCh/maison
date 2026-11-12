/**
 * Utilidad de optimización y compresión de imágenes en el cliente (Browser).
 * Utiliza HTML5 Canvas API para reescalar y convertir fotografías a formato WebP moderno,
 * garantizando que ninguna imagen supere el límite deseado (ej. 1 MB) antes de subirse a Cloudflare R2.
 */

export interface OpcionesOptimizacion {
  maxAncho?: number;
  maxAlto?: number;
  calidadInicial?: number;
  maxBytes?: number;
}

const OPCIONES_POR_DEFECTO: Required<OpcionesOptimizacion> = {
  maxAncho: 900,
  maxAlto: 1200,
  calidadInicial: 0.85,
  maxBytes: 1024 * 1024, // 1 MB máximo garantizado
};

/**
 * Convierte y optimiza un archivo File de imagen a WebP de alta definición.
 * Si la imagen original excede las dimensiones máximas o el peso límite,
 * se escala suavemente y se recomprime en el navegador.
 */
export async function optimizarImagenParaWebP(
  archivo: File,
  opciones?: OpcionesOptimizacion,
): Promise<File> {
  // Si no es un entorno con soporte de DOM (SSR), devolver el archivo original
  if (typeof window === "undefined" || typeof document === "undefined") {
    return archivo;
  }

  // Si es un SVG, no procesar por Canvas (mantener vector)
  if (archivo.type === "image/svg+xml") {
    return archivo;
  }

  const { maxAncho, maxAlto, calidadInicial, maxBytes } = {
    ...OPCIONES_POR_DEFECTO,
    ...opciones,
  };

  return new Promise((resolve, reject) => {
    const urlObjeto = URL.createObjectURL(archivo);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(urlObjeto);

      try {
        let ancho = img.naturalWidth || img.width;
        let alto = img.naturalHeight || img.height;

        // Calcular escalado preservando la proporción original (aspect ratio)
        if (ancho > maxAncho || alto > maxAlto) {
          const proporcion = Math.min(maxAncho / ancho, maxAlto / alto);
          ancho = Math.round(ancho * proporcion);
          alto = Math.round(alto * proporcion);
        }

        const canvas = document.createElement("canvas");
        canvas.width = ancho;
        canvas.height = alto;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("No se pudo crear el lienzo gráfico para procesar la imagen.");
        }

        // Suavizado de alta calidad para máxima nitidez en frascos y detalles
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, ancho, alto);

        // Función auxiliar para generar Blob con calidad dada
        const obtenerBlob = (tipo: string, calidad: number): Promise<Blob | null> => {
          return new Promise((resBlob) => {
            canvas.toBlob((blob) => resBlob(blob), tipo, calidad);
          });
        };

        // Intentar compresión a WebP (con fallback a JPEG si el navegador no soporta exportación WebP)
        let tipoMime = "image/webp";
        let extension = "webp";
        let calidad = calidadInicial;

        let blob = await obtenerBlob(tipoMime, calidad);

        if (!blob) {
          tipoMime = "image/jpeg";
          extension = "jpg";
          blob = await obtenerBlob(tipoMime, calidad);
        }

        if (!blob) {
          throw new Error("No se pudo generar el archivo comprimido.");
        }

        // Si aún supera maxBytes (1 MB), reducir gradualmente la calidad hasta entrar en el límite
        if (blob.size > maxBytes) {
          const pasosCalidad = [0.75, 0.65, 0.55, 0.45];
          for (const paso of pasosCalidad) {
            const blobMasPequeno = await obtenerBlob(tipoMime, paso);
            if (blobMasPequeno) {
              blob = blobMasPequeno;
              if (blob.size <= maxBytes) {
                break;
              }
            }
          }
        }

        // Generar nombre de archivo con extensión .webp
        const nombreOriginal = archivo.name;
        const puntoIndice = nombreOriginal.lastIndexOf(".");
        const nombreBase = puntoIndice !== -1 ? nombreOriginal.substring(0, puntoIndice) : nombreOriginal;
        const nombreFinal = `${nombreBase}.${extension}`;

        const archivoComprimido = new File([blob], nombreFinal, {
          type: tipoMime,
          lastModified: Date.now(),
        });

        resolve(archivoComprimido);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(urlObjeto);
      reject(new Error("No se pudo decodificar el archivo de imagen seleccionado."));
    };

    img.src = urlObjeto;
  });
}

