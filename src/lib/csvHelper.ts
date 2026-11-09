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
  precio_50ml: string;
  precio_100ml: string;
  precio_decant_3ml?: string;
  precio_decant_5ml?: string;
  precio_decant_10ml?: string;
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
  precio_50ml: number;
  precio_100ml: number;
  tiene_decants: boolean;
  precio_decant_3ml?: number | null;
  precio_decant_5ml?: number | null;
  precio_decant_10ml?: number | null;
  // Estado de validación
  esValido: boolean;
  esDuplicado: boolean;
  idProductoExistente?: number;
  marcaEsNueva: boolean;
  errores: string[];
  advertencias: string[];
}

/**
 * Normaliza valores de género reconociendo sinónimos y variaciones comunes.
 */
export function normalizarGenero(val?: string): Gender {
  if (!val) return "Unisex";
  const v = val.trim().toLowerCase();
  if (v.startsWith("h") || v === "hombre" || v === "masculino" || v === "man" || v === "men") {
    return "Hombre";
  }
  if (v.startsWith("m") || v === "mujer" || v === "femenino" || v === "woman" || v === "women") {
    return "Mujer";
  }
  return "Unisex";
}

/**
 * Normaliza la línea/gama comercial del perfume.
 */
export function normalizarLineaComercial(val?: string, marca?: string): CommercialType {
  if (val) {
    const v = val.trim().toLowerCase();
    if (v.includes("arabe") || v.includes("árabe") || v.includes("oriental")) return "arabe";
    if (v.includes("nicho") || v.includes("autor")) return "nicho";
    if (v.includes("disenador") || v.includes("diseñador") || v.includes("comercial")) return "disenador";
  }
  return "disenador";
}

/**
 * Normaliza un precio escrito en texto (soporta "S/ 490", "490,00", "490.50").
 */
export function normalizarPrecio(val?: string): number | null {
  if (!val) return null;
  const limpio = val
    .replace(/[^\d.,]/g, "")
    .replace(",", ".");
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
 * Parser de CSV nativo que maneja campos con comillas y saltos.
 */
export function parsearLineasCsv(texto: string, delimitador: string): string[][] {
  const lineas: string[][] = [];
  const filasRaw = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);

  for (const fila of filasRaw) {
    const regex = new RegExp(`(?:^|${delimitador})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimitador}]*))`, "g");
    const valores: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(fila)) !== null) {
      // Si fue campo entre comillas, des-escapar comillas dobles
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
 * Procesa y valida el contenido completo de un archivo CSV frente al catálogo actual.
 */
export function procesarContenidoCsv(
  contenido: string,
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
  const delimitador = detectarDelimitador(contenido);
  const matriz = parsearLineasCsv(contenido, delimitador);

  if (matriz.length < 2) {
    return {
      filas: [],
      resumen: { total: 0, validos: 0, duplicados: 0, conErrores: 0 },
    };
  }

  // 1. Mapear encabezados
  const cabeceras = matriz[0].map((h) =>
    h
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
  const idxP50 = cabeceras.findIndex((c) => c.includes("50"));
  const idxP100 = cabeceras.findIndex((c) => c.includes("100"));
  const idxDec3 = cabeceras.findIndex((c) => c.includes("decant_3") || c.includes("dec_3") || c.includes("3ml"));
  const idxDec5 = cabeceras.findIndex((c) => c.includes("decant_5") || c.includes("dec_5") || c.includes("5ml"));
  const idxDec10 = cabeceras.findIndex((c) => c.includes("decant_10") || c.includes("dec_10") || c.includes("10ml"));

  // Conjunto de claves existentes en la base de datos para detección de duplicados
  const mapaProductosExistentes = new Map<string, number>();
  for (const p of productosActuales) {
    const clave = `${p.marca.trim().toLowerCase()}|${p.nombre.trim().toLowerCase()}`;
    mapaProductosExistentes.set(clave, p.id);
  }

  const marcasRegistradasLower = new Set(marcasActuales.map((m) => m.nombre.trim().toLowerCase()));
  const clavesEnCsv = new Set<string>();
  const filasResultado: FilaCsvProcesada[] = [];

  for (let i = 1; i < matriz.length; i++) {
    const col = matriz[i];
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
    const p100Raw = idxP100 !== -1 ? col[idxP100] || "" : "";
    const dec3Raw = idxDec3 !== -1 ? col[idxDec3] || "" : "";
    const dec5Raw = idxDec5 !== -1 ? col[idxDec5] || "" : "";
    const dec10Raw = idxDec10 !== -1 ? col[idxDec10] || "" : "";

    // Validar campos obligatorios
    if (!marcaRaw.trim()) {
      errores.push("Falta el nombre de la Marca.");
    }
    if (!nombreRaw.trim()) {
      errores.push("Falta el nombre del Perfume.");
    }

    const precio50 = normalizarPrecio(p50Raw);
    if (precio50 === null || precio50 <= 0) {
      errores.push("Precio de 50 ml inválido o vacío.");
    }

    const precio100 = normalizarPrecio(p100Raw);
    if (precio100 === null || precio100 <= 0) {
      errores.push("Precio de 100 ml inválido o vacío.");
    }

    const pDec3 = normalizarPrecio(dec3Raw);
    const pDec5 = normalizarPrecio(dec5Raw);
    const pDec10 = normalizarPrecio(dec10Raw);
    const tieneDecants = Boolean(
      (pDec3 !== null && pDec3 > 0) ||
      (pDec5 !== null && pDec5 > 0) ||
      (pDec10 !== null && pDec10 > 0)
    );

    // Normalizaciones con valores elegantes por defecto
    const marca = marcaRaw.trim();
    const nombre = nombreRaw.trim();
    const genero = normalizarGenero(generoRaw);
    const linea_comercial = normalizarLineaComercial(lineaRaw, marca);
    const concentracion = concRaw.trim() || "Eau de Parfum";
    const pais_origen = paisRaw.trim() || (linea_comercial === "arabe" ? "Emiratos Árabes Unidos" : "Francia");
    const ocasion_uso = ocasionRaw.trim() || "Uso profesional diario y reuniones ejecutivas";

    // Validar marca
    const marcaEsNueva = !marcasRegistradasLower.has(marca.toLowerCase());
    if (marcaEsNueva && marca) {
      advertencias.push(`Marca "${marca}" no existe aún: se creará automáticamente como "${linea_comercial}".`);
    }

    // Detección de duplicados
    const clave = `${marca.toLowerCase()}|${nombre.toLowerCase()}`;
    const idExistente = mapaProductosExistentes.get(clave);
    let esDuplicado = Boolean(idExistente);

    if (clavesEnCsv.has(clave)) {
      esDuplicado = true;
      advertencias.push("Esta fragancia aparece repetida en este mismo archivo CSV.");
    } else {
      clavesEnCsv.add(clave);
    }

    if (idExistente) {
      advertencias.push(`Ya está registrada en la tienda (ID #${idExistente}).`);
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
      precio_50ml: precio50 || 0,
      precio_100ml: precio100 || 0,
      tiene_decants: tieneDecants,
      precio_decant_3ml: pDec3,
      precio_decant_5ml: pDec5,
      precio_decant_10ml: pDec10,
      esValido: errores.length === 0,
      esDuplicado,
      idProductoExistente: idExistente,
      marcaEsNueva,
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
 * Genera y descarga en el navegador una plantilla CSV limpia con codificación UTF-8 BOM.
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
    "precio_100ml",
    "precio_decant_3ml",
    "precio_decant_5ml",
    "precio_decant_10ml",
  ];

  const filasEjemplo = [
    [
      "Dior",
      "Sauvage Elixir",
      "disenador",
      "Hombre",
      "Parfum",
      "Francia",
      "Noche y eventos",
      "790",
      "920",
      "50",
      "75",
      "135",
    ],
    [
      "Lattafa",
      "Khamrah",
      "arabe",
      "Unisex",
      "Eau de Parfum",
      "Emiratos Árabes Unidos",
      "Noche e invierno",
      "240",
      "320",
      "25",
      "35",
      "60",
    ],
    [
      "Tom Ford",
      "Oud Wood",
      "nicho",
      "Unisex",
      "Eau de Parfum",
      "Estados Unidos",
      "Otoño e invierno",
      "980",
      "1110",
      "60",
      "90",
      "165",
    ],
    [
      "Carolina Herrera",
      "Good Girl Blush",
      "disenador",
      "Mujer",
      "Eau de Parfum",
      "España",
      "Uso diario refinado",
      "520",
      "650",
      "",
      "",
      "",
    ],
  ];

  const csvLineas = [
    encabezados.join(","),
    ...filasEjemplo.map((fila) => fila.map((campo) => `"${campo.replace(/"/g, '""')}"`).join(",")),
  ];

  // \uFEFF es el BOM de UTF-8 que hace que Excel abra el archivo con tildes y caracteres perfectos
  const contenidoBlob = "\uFEFF" + csvLineas.join("\r\n");
  const blob = new Blob([contenidoBlob], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_productos_maison.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
