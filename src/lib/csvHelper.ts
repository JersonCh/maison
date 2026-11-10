import * as XLSX from "xlsx";
import type { Gender, CommercialType } from "@/types/product";
import type { MarcaItem, ProductoAdminItem } from "@/types/database";

export interface FilaCsvRaw {
  marca: string;
  nombre: string;
  linea_comercial?: string;
  genero?: string;
  concentracion?: string;
  pais_origen?: string;
  ocasion_uso?: string;
  precio_50ml?: string | number;
  precio_75ml?: string | number;
  precio_100ml?: string | number;
  precio_125ml?: string | number;
  precio_150ml?: string | number;
  precio_200ml?: string | number;
  precio_decant_3ml?: string | number;
  precio_decant_5ml?: string | number;
  precio_decant_10ml?: string | number;
}

export interface FilaCsvProcesada {
  filaNumero: number;
  marca: string;
  nombre: string;
  linea_comercial: CommercialType;
  genero: Gender;
  concentracion: string;
  pais_origen: string;
  ocasion_uso: string;
  precio_50ml: number | null;
  precio_75ml: number | null;
  precio_100ml: number | null;
  precio_125ml: number | null;
  precio_150ml: number | null;
  precio_200ml: number | null;
  tiene_decants: boolean;
  precio_decant_3ml?: number | null;
  precio_decant_5ml?: number | null;
  precio_decant_10ml?: number | null;
  // Estado de validación
  esValido: boolean;
  esDuplicado: boolean;
  idProductoExistente?: number;
  marcaEsNueva: boolean;
  marcaSugerida?: string;
  errores: string[];
  advertencias: string[];
}

/**
 * Calcula la distancia de edición Levenshtein entre dos cadenas de texto.
 */
export function distanciaLevenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= bn; i++) matrix[i][0] = i;
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1,     // inserción
          matrix[i - 1][j] + 1,     // eliminación
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Busca si una marca ingresada contiene un error tipográfico cercano a una marca ya registrada.
 */
export function buscarMarcaMasCercana(
  nombreIngresado: string,
  marcasRegistradas: MarcaItem[],
): { marca: MarcaItem; distancia: number } | null {
  const limpio = nombreIngresado.trim().toLowerCase();
  if (limpio.length < 3) return null;

  let mejorCoincidencia: { marca: MarcaItem; distancia: number } | null = null;
  let menorDistancia = Infinity;

  for (const m of marcasRegistradas) {
    const regLimpio = m.nombre.trim().toLowerCase();
    if (regLimpio === limpio) return null; // Es una coincidencia exacta

    // Comparación sin espacios ni signos
    const s1 = limpio.replace(/[^a-z0-9]/g, "");
    const s2 = regLimpio.replace(/[^a-z0-9]/g, "");
    if (s1 === s2) {
      return { marca: m, distancia: 0 };
    }

    // Comparación comprimiendo letras repetidas consecutivas (ej: "diioor" -> "dior", "chanell" -> "chanel")
    const c1 = s1.replace(/(.)\1+/g, "$1");
    const c2 = s2.replace(/(.)\1+/g, "$1");
    if (c1 === c2) {
      return { marca: m, distancia: 1 };
    }

    const dist = distanciaLevenshtein(limpio, regLimpio);
    const umbralMaximo = regLimpio.length <= 5 ? 2 : Math.min(3, Math.floor(regLimpio.length * 0.4));

    if (dist <= umbralMaximo && dist < menorDistancia) {
      menorDistancia = dist;
      mejorCoincidencia = { marca: m, distancia: dist };
    }
  }

  return mejorCoincidencia;
}

/**
 * Normaliza valores de género reconociendo sinónimos, abreviaciones y erratas comunes.
 */
export function normalizarGenero(val?: unknown): Gender {
  if (!val) return "Unisex";
  const v = String(val).trim().toLowerCase();
  if (
    v.startsWith("h") ||
    v === "hombre" ||
    v === "ombre" ||
    v === "masculino" ||
    v === "masc" ||
    v === "man" ||
    v === "men" ||
    v === "caballero" ||
    v === "varon"
  ) {
    return "Hombre";
  }
  if (
    v.startsWith("m") ||
    v === "mujer" ||
    v === "femenino" ||
    v === "fem" ||
    v === "woman" ||
    v === "women" ||
    v === "dama"
  ) {
    return "Mujer";
  }
  return "Unisex";
}

/**
 * Normaliza la línea o colección comercial del perfume.
 */
export function normalizarLineaComercial(val?: unknown, marca?: string): CommercialType {
  if (val) {
    const v = String(val).trim().toLowerCase();
    if (v.includes("arabe") || v.includes("árabe") || v.includes("oriental") || v.includes("dubai")) {
      return "arabe";
    }
    if (v.includes("nicho") || v.includes("autor") || v.includes("niche") || v.includes("exclusivo")) {
      return "nicho";
    }
    if (v.includes("disenador") || v.includes("diseñador") || v.includes("comercial") || v.includes("designer")) {
      return "disenador";
    }
  }
  return "disenador";
}

/**
 * Normaliza un precio numérico o textual (soporta números nativos de Excel, "S/ 490", "490,00", "490.50").
 */
export function normalizarPrecio(val?: unknown): number | null {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "number") {
    return isNaN(val) || val < 0 ? null : Math.round(val * 100) / 100;
  }
  const str = String(val).trim();
  if (!str) return null;
  const limpio = str.replace(/[^\d.,]/g, "").replace(",", ".");
  const num = parseFloat(limpio);
  return isNaN(num) || num < 0 ? null : Math.round(num * 100) / 100;
}

/**
 * Detecta el delimitador de CSV (, o ;) típico en Excel hispanohablante.
 */
export function detectarDelimitador(contenido: string): string {
  const primeraLinea = contenido.split(/\r?\n/)[0] || "";
  const comas = (primeraLinea.match(/,/g) || []).length;
  const puntosYComas = (primeraLinea.match(/;/g) || []).length;
  return puntosYComas > comas ? ";" : ",";
}

/**
 * Parser de CSV nativo que maneja campos con comillas y comas internas.
 */
export function parsearLineasCsv(texto: string, delimitador: string): string[][] {
  const lineas: string[][] = [];
  const filasRaw = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);

  for (const fila of filasRaw) {
    const regex = new RegExp(`(?:^|${delimitador})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimitador}]*))`, "g");
    const valores: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(fila)) !== null) {
      let valor = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      valores.push(valor !== undefined ? valor.trim() : "");
      if (regex.lastIndex === fila.length && fila.endsWith(delimitador)) {
        valores.push("");
      }
    }
    if (valores.length > 0) {
      lineas.push(valores);
    }
  }

  return lineas;
}

/**
 * Lee y convierte un ArrayBuffer de un archivo Excel (.xlsx o .xls) a una matriz de celdas.
 */
export function parsearArchivoExcel(buffer: ArrayBuffer): string[][] {
  const data = new Uint8Array(buffer);
  const wb = XLSX.read(data, { type: "array" });
  if (!wb.SheetNames.length) return [];

  // Ignorar hojas informativas como Guía_y_Valores y priorizar la hoja de productos
  let sheetName = wb.SheetNames.find((name) => {
    const lower = name.toLowerCase();
    return (
      (lower.includes("producto") || lower.includes("perfume") || lower.includes("catalogo") || lower.includes("catálogo")) &&
      !lower.includes("guia") &&
      !lower.includes("guía") &&
      !lower.includes("valor")
    );
  });

  if (!sheetName) {
    // Buscar la primera hoja que no sea guía y que tenga columnas típicas (marca / nombre)
    sheetName = wb.SheetNames.find((name) => {
      const lower = name.toLowerCase();
      if (lower.includes("guia") || lower.includes("guía") || lower.includes("instruccion")) {
        return false;
      }
      const ws = wb.Sheets[name];
      const preview = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      const primeraFila = (preview[0] || []).map((c) => String(c || "").toLowerCase().trim());
      return primeraFila.some((h) => h.includes("marca")) && primeraFila.some((h) => h.includes("nombre"));
    });
  }

  if (!sheetName) {
    sheetName = wb.SheetNames[0];
  }

  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];
  return rows.map((row) =>
    Array.isArray(row)
      ? row.map((cell) => (cell !== undefined && cell !== null ? String(cell).trim() : ""))
      : [],
  );
}

/**
 * Función núcleo que procesa cualquier matriz de celdas (provenga de Excel o CSV),
 * validando reglas de negocio, detectando duplicados y aplicando corrección inteligente de marcas.
 */
export function procesarMatrizFilas(
  matriz: string[][],
  productosActuales: ProductoAdminItem[],
  marcasActuales: MarcaItem[],
): {
  filas: FilaCsvProcesada[];
  resumen: {
    total: number;
    validos: number;
    duplicados: number;
    conErrores: number;
  };
} {
  // Filtrar filas totalmente vacías
  const filasNoVacias = matriz.filter((fila) => fila.some((celda) => celda && String(celda).trim().length > 0));

  if (filasNoVacias.length < 2) {
    return {
      filas: [],
      resumen: { total: 0, validos: 0, duplicados: 0, conErrores: 0 },
    };
  }

  // 1. Mapear encabezados dinámicamente
  const cabeceras = filasNoVacias[0].map((h) =>
    String(h)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .trim(),
  );

  const idxMarca = cabeceras.findIndex((c) => c.includes("marca") || c.includes("casa"));
  const idxNombre = cabeceras.findIndex((c) => c.includes("nombre") || c.includes("perfume") || c.includes("fragancia"));
  const idxLinea = cabeceras.findIndex((c) => c.includes("linea") || c.includes("tipo") || c.includes("gama"));
  const idxGenero = cabeceras.findIndex((c) => c.includes("genero") || c.includes("sexo"));
  const idxConcentracion = cabeceras.findIndex((c) => c.includes("concentracion"));
  const idxPais = cabeceras.findIndex((c) => c.includes("pais") || c.includes("procedencia") || c.includes("origen"));
  const idxOcasion = cabeceras.findIndex((c) => c.includes("ocasion") || c.includes("uso"));
  const idxP50 = cabeceras.findIndex((c) => c === "precio_50ml" || c === "50ml" || c === "precio_50" || (c.includes("50") && !c.includes("150")));
  const idxP75 = cabeceras.findIndex((c) => c.includes("75"));
  const idxP100 = cabeceras.findIndex((c) => c.includes("100"));
  const idxP125 = cabeceras.findIndex((c) => c.includes("125"));
  const idxP150 = cabeceras.findIndex((c) => c.includes("150"));
  const idxP200 = cabeceras.findIndex((c) => c.includes("200"));
  const idxDec3 = cabeceras.findIndex((c) => c.includes("decant_3") || c.includes("dec_3") || c.includes("3ml"));
  const idxDec5 = cabeceras.findIndex((c) => c.includes("decant_5") || c.includes("dec_5") || c.includes("5ml"));
  const idxDec10 = cabeceras.findIndex((c) => c.includes("decant_10") || c.includes("dec_10") || c.includes("10ml"));

  // Mapa de productos existentes en la base de datos para detección de duplicados
  const mapaProductosExistentes = new Map<string, number>();
  for (const p of productosActuales) {
    const clave = `${p.marca.trim().toLowerCase()}|${p.nombre.trim().toLowerCase()}`;
    mapaProductosExistentes.set(clave, p.id);
  }

  const marcasRegistradasLower = new Set(marcasActuales.map((m) => m.nombre.trim().toLowerCase()));
  const mapaMarcasPorNombreExacto = new Map<string, MarcaItem>();
  for (const m of marcasActuales) {
    mapaMarcasPorNombreExacto.set(m.nombre.trim().toLowerCase(), m);
  }

  const clavesEnArchivo = new Set<string>();
  const filasResultado: FilaCsvProcesada[] = [];

  for (let i = 1; i < filasNoVacias.length; i++) {
    const col = filasNoVacias[i];
    const filaNumero = i + 1;
    const errores: string[] = [];
    const advertencias: string[] = [];

    const marcaRaw = idxMarca !== -1 ? col[idxMarca] || "" : col[0] || "";
    const nombreRaw = idxNombre !== -1 ? col[idxNombre] || "" : col[1] || "";
    const lineaRaw = idxLinea !== -1 ? col[idxLinea] || "" : "";
    const generoRaw = idxGenero !== -1 ? col[idxGenero] || "" : "";
    const concRaw = idxConcentracion !== -1 ? col[idxConcentracion] || "" : "";
    const paisRaw = idxPais !== -1 ? col[idxPais] || "" : "";
    const ocasionRaw = idxOcasion !== -1 ? col[idxOcasion] || "" : "";
    const p50Raw = idxP50 !== -1 ? col[idxP50] || "" : "";
    const p75Raw = idxP75 !== -1 ? col[idxP75] || "" : "";
    const p100Raw = idxP100 !== -1 ? col[idxP100] || "" : "";
    const p125Raw = idxP125 !== -1 ? col[idxP125] || "" : "";
    const p150Raw = idxP150 !== -1 ? col[idxP150] || "" : "";
    const p200Raw = idxP200 !== -1 ? col[idxP200] || "" : "";
    const dec3Raw = idxDec3 !== -1 ? col[idxDec3] || "" : "";
    const dec5Raw = idxDec5 !== -1 ? col[idxDec5] || "" : "";
    const dec10Raw = idxDec10 !== -1 ? col[idxDec10] || "" : "";

    // 1. Validar campos obligatorios
    let marca = String(marcaRaw).trim();
    const nombre = String(nombreRaw).trim();

    if (!marca) {
      errores.push("Falta el nombre de la Marca.");
    }
    if (!nombre) {
      errores.push("Falta el nombre del Perfume.");
    }

    const precio50 = normalizarPrecio(p50Raw);
    const precio75 = normalizarPrecio(p75Raw);
    const precio100 = normalizarPrecio(p100Raw);
    const precio125 = normalizarPrecio(p125Raw);
    const precio150 = normalizarPrecio(p150Raw);
    const precio200 = normalizarPrecio(p200Raw);

    const tiene50 = precio50 !== null && precio50 > 0;
    const tiene75 = precio75 !== null && precio75 > 0;
    const tiene100 = precio100 !== null && precio100 > 0;
    const tiene125 = precio125 !== null && precio125 > 0;
    const tiene150 = precio150 !== null && precio150 > 0;
    const tiene200 = precio200 !== null && precio200 > 0;

    const tieneFrasco = tiene50 || tiene75 || tiene100 || tiene125 || tiene150 || tiene200;

    if (!tieneFrasco) {
      errores.push("Debes ingresar al menos una presentación de frasco (50, 75, 100, 125, 150 o 200 ml).");
    }

    const pDec3 = normalizarPrecio(dec3Raw);
    const pDec5 = normalizarPrecio(dec5Raw);
    const pDec10 = normalizarPrecio(dec10Raw);
    const tieneDecants = Boolean(
      (pDec3 !== null && pDec3 > 0) ||
      (pDec5 !== null && pDec5 > 0) ||
      (pDec10 !== null && pDec10 > 0),
    );

    // 2. Normalización con defaults elegantes
    const genero = normalizarGenero(generoRaw);
    const linea_comercial = normalizarLineaComercial(lineaRaw, marca);
    const concentracion = String(concRaw).trim() || "Eau de Parfum";
    const pais_origen = String(paisRaw).trim() || (linea_comercial === "arabe" ? "Emiratos Árabes Unidos" : "Francia");
    const ocasion_uso = String(ocasionRaw).trim() || "Uso distinguido y reuniones ejecutivas";

    // 3. Verificación de marca y detección de erratas (ej: Diioor -> Dior)
    let marcaEsNueva = !marcasRegistradasLower.has(marca.toLowerCase());
    let marcaSugerida: string | undefined = undefined;

    if (marcaEsNueva && marca) {
      const coincidenciaCercana = buscarMarcaMasCercana(marca, marcasActuales);
      if (coincidenciaCercana) {
        if (coincidenciaCercana.distancia === 0) {
          // Coincidencia exacta sin signos/espacios
          marca = coincidenciaCercana.marca.nombre;
          marcaEsNueva = false;
        } else {
          marcaSugerida = coincidenciaCercana.marca.nombre;
          advertencias.push(
            `Posible errata en "${marca}". ¿Quisiste decir "${coincidenciaCercana.marca.nombre}"? Si no, se creará una marca nueva.`,
          );
        }
      } else {
        advertencias.push(`Marca "${marca}" es nueva: se registrará en el catálogo automáticamente.`);
      }
    }

    // 4. Detección de duplicados
    const clave = `${marca.toLowerCase()}|${nombre.toLowerCase()}`;
    const idExistente = mapaProductosExistentes.get(clave);
    let esDuplicado = Boolean(idExistente);

    if (clavesEnArchivo.has(clave)) {
      esDuplicado = true;
      advertencias.push("Esta fragancia aparece repetida en el mismo archivo.");
    } else {
      clavesEnArchivo.add(clave);
    }

    if (idExistente) {
      advertencias.push(`Ya registrada en el catálogo oficial (ID #${idExistente}).`);
    }

    filasResultado.push({
      filaNumero,
      marca,
      nombre,
      linea_comercial,
      genero,
      concentracion,
      pais_origen,
      ocasion_uso,
      precio_50ml: tiene50 ? precio50 : null,
      precio_75ml: tiene75 ? precio75 : null,
      precio_100ml: tiene100 ? precio100 : null,
      precio_125ml: tiene125 ? precio125 : null,
      precio_150ml: tiene150 ? precio150 : null,
      precio_200ml: tiene200 ? precio200 : null,
      tiene_decants: tieneDecants,
      precio_decant_3ml: pDec3,
      precio_decant_5ml: pDec5,
      precio_decant_10ml: pDec10,
      esValido: errores.length === 0,
      esDuplicado,
      idProductoExistente: idExistente,
      marcaEsNueva,
      marcaSugerida,
      errores,
      advertencias,
    });
  }

  const validos = filasResultado.filter((f) => f.esValido && !f.esDuplicado).length;
  const duplicados = filasResultado.filter((f) => f.esValido && f.esDuplicado).length;
  const conErrores = filasResultado.filter((f) => !f.esValido).length;

  return {
    filas: filasResultado,
    resumen: {
      total: filasResultado.length,
      validos,
      duplicados,
      conErrores,
    },
  };
}

/**
 * Procesa y valida el contenido de un archivo CSV plano.
 */
export function procesarContenidoCsv(
  contenido: string,
  productosActuales: ProductoAdminItem[],
  marcasActuales: MarcaItem[],
) {
  const delimitador = detectarDelimitador(contenido);
  const matriz = parsearLineasCsv(contenido, delimitador);
  return procesarMatrizFilas(matriz, productosActuales, marcasActuales);
}

/**
 * Procesa y valida un archivo Excel (.xlsx o .xls) desde su buffer binario.
 */
export function procesarBufferExcel(
  buffer: ArrayBuffer,
  productosActuales: ProductoAdminItem[],
  marcasActuales: MarcaItem[],
) {
  const matriz = parsearArchivoExcel(buffer);
  return procesarMatrizFilas(matriz, productosActuales, marcasActuales);
}

/**
 * Descarga la plantilla oficial en formato Excel (.xlsx).
 * Utiliza el archivo estático pre-generado de alta fidelidad ubicado en /plantillas.
 */
export function descargarPlantillaExcel(): void {
  const a = document.createElement("a");
  a.href = "/plantillas/plantilla_productos_maison.xlsx";
  a.setAttribute("download", "plantilla_productos_maison.xlsx");
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) {
      a.parentNode.removeChild(a);
    }
  }, 1000);
}

/**
 * Descarga una copia alternativa en formato CSV con codificación UTF-8 BOM.
 */
export function descargarPlantillaCsv(): void {
  const encabezados = [
    "marca",
    "nombre",
    "linea_comercial",
    "genero",
    "concentracion",
    "pais_origen",
    "ocasion_uso",
    "precio_50ml",
    "precio_75ml",
    "precio_100ml",
    "precio_125ml",
    "precio_150ml",
    "precio_200ml",
    "precio_decant_3ml",
    "precio_decant_5ml",
    "precio_decant_10ml",
  ];

  const filasEjemplo = [
    ["Dior", "Sauvage Elixir", "disenador", "Hombre", "Parfum", "Francia", "Noche y eventos de gala", "", "", "920", "", "", "", "50", "75", "135"],
    ["Parfums de Marly", "Layton", "nicho", "Unisex", "Eau de Parfum", "Francia", "Otoño e invierno", "", "980", "", "1350", "", "", "65", "95", "175"],
    ["Jean Paul Gaultier", "Le Male Elixir", "disenador", "Hombre", "Parfum", "Francia", "Noche y fiesta", "", "520", "", "680", "", "", "35", "55", "95"],
    ["Bleu de Chanel", "Eau de Parfum", "disenador", "Hombre", "Eau de Parfum", "Francia", "Versatilidad total", "580", "", "740", "", "920", "", "", "", ""],
    ["Giorgio Armani", "Acqua Di Gio", "disenador", "Hombre", "Eau de Toilette", "Italia", "Verano y frescura", "", "", "560", "", "", "820", "", "", ""],
    ["Lattafa", "Khamrah", "arabe", "Unisex", "Eau de Parfum", "Emiratos Árabes Unidos", "Noche e invierno", "", "", "280", "", "", "", "25", "35", "60"],
  ];

  const csvLineas = [
    encabezados.join(","),
    ...filasEjemplo.map((fila) => fila.map((campo) => `"${campo.replace(/"/g, '""')}"`).join(",")),
  ];

  const contenidoBlob = "\uFEFF" + csvLineas.join("\r\n");
  const blob = new Blob([contenidoBlob], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", "plantilla_productos_maison.csv");
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) {
      a.parentNode.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 1000);
}
