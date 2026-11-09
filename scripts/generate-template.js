import XLSX from "xlsx";
import path from "node:path";
import fs from "node:fs";

// 1. Datos de la hoja "Productos"
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
    "Noche y eventos de gala",
    790,
    920,
    50,
    75,
    135,
  ],
  [
    "Lattafa",
    "Khamrah",
    "arabe",
    "Unisex",
    "Eau de Parfum",
    "Emiratos Árabes Unidos",
    "Noche e invierno",
    240,
    320,
    25,
    35,
    60,
  ],
  [
    "Tom Ford",
    "Oud Wood",
    "nicho",
    "Unisex",
    "Eau de Parfum",
    "Estados Unidos",
    "Otoño e invierno ejecutivo",
    980,
    1110,
    60,
    90,
    165,
  ],
  [
    "Carolina Herrera",
    "Good Girl Blush",
    "disenador",
    "Mujer",
    "Eau de Parfum",
    "España",
    "Uso diario refinado",
    520,
    650,
    "",
    "",
    "",
  ],
  [
    "Creed",
    "Aventus",
    "nicho",
    "Hombre",
    "Eau de Parfum",
    "Francia",
    "Alta dirección y eventos",
    1250,
    1450,
    80,
    120,
    210,
  ],
];

// Matriz completa
const datosProductos = [encabezados, ...filasEjemplo];

// Crear worksheet
const wsProductos = XLSX.utils.aoa_to_sheet(datosProductos);

// Ajustar anchos de columnas (ch = character width)
wsProductos["!cols"] = [
  { wch: 20 }, // marca
  { wch: 24 }, // nombre
  { wch: 18 }, // linea_comercial
  { wch: 14 }, // genero
  { wch: 18 }, // concentracion
  { wch: 24 }, // pais_origen
  { wch: 30 }, // ocasion_uso
  { wch: 14 }, // precio_50ml
  { wch: 14 }, // precio_100ml
  { wch: 18 }, // precio_decant_3ml
  { wch: 18 }, // precio_decant_5ml
  { wch: 18 }, // precio_decant_10ml
];

// 2. Hoja de instrucciones y guía de valores válidos
const datosGuia = [
  ["CAMPO", "OBLIGATORIO", "VALORES RECOMENDADOS", "DESCRIPCIÓN / EJEMPLOS"],
  ["marca", "SÍ", "Dior, Chanel, Tom Ford, Lattafa, Creed...", "Nombre de la casa de perfumería. Si es nueva, se creará automáticamente."],
  ["nombre", "SÍ", "Sauvage, Khamrah, Baccarat Rouge...", "Nombre oficial de la fragancia."],
  ["linea_comercial", "Opcional", "disenador, nicho, arabe", "Tipo de colección. Por defecto: disenador."],
  ["genero", "Opcional", "Hombre, Mujer, Unisex", "Público objetivo. Por defecto: Unisex."],
  ["concentracion", "Opcional", "Eau de Parfum, Parfum, Eau de Toilette, Extrait...", "Concentración aromática. Por defecto: Eau de Parfum."],
  ["pais_origen", "Opcional", "Francia, Italia, Emiratos Árabes Unidos, España...", "País de procedencia de la marca."],
  ["ocasion_uso", "Opcional", "Noche y eventos, Uso diario refinado, Otoño...", "Recomendación de uso en la tienda."],
  ["precio_50ml", "SÍ", "790, 240, 520...", "Precio regular en soles (S/) para la presentación de 50 ml."],
  ["precio_100ml", "SÍ", "920, 320, 650...", "Precio regular en soles (S/) para la presentación de 100 ml."],
  ["precio_decant_3ml", "Opcional", "50, 25, 60... (o dejar vacío)", "Precio de la muestra de 3 ml. Dejar vacío si no aplica."],
  ["precio_decant_5ml", "Opcional", "75, 35, 90... (o dejar vacío)", "Precio de la muestra de 5 ml. Dejar vacío si no aplica."],
  ["precio_decant_10ml", "Opcional", "135, 60, 165... (o dejar vacío)", "Precio de la muestra de 10 ml. Dejar vacío si no aplica."],
  [],
  ["NOTAS IMPORTANTES:"],
  ["1. No coloque símbolos monetarios (ej: escriba 790 en lugar de S/ 790)."],
  ["2. No requiere URLs de imágenes: el sistema asigna el emblema oficial y luego podrá subir fotos en alta resolución."],
  ["3. Si un perfume ya existe en la tienda, puede optar por omitirlo o actualizar sus precios."],
];

const wsGuia = XLSX.utils.aoa_to_sheet(datosGuia);
wsGuia["!cols"] = [
  { wch: 22 },
  { wch: 15 },
  { wch: 45 },
  { wch: 65 },
];

// Crear el libro
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, wsProductos, "Productos");
XLSX.utils.book_append_sheet(wb, wsGuia, "Guía_y_Valores");

const outputPath = path.resolve("public/plantillas/plantilla_productos_maison.xlsx");
XLSX.writeFile(wb, outputPath);
console.log(`✓ Plantilla Excel generada exitosamente en: ${outputPath}`);
