import XLSX from "xlsx";
import path from "node:path";
import { execSync } from "node:child_process";

// 1. Datos de la hoja "Productos"
// Soporta los 6 tamaños estándar de frascos en alta perfumería + decants
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

// Filas de ejemplo que ilustran flexibilidad total:
// Cada perfume solo llena los frascos que tiene (no requiere todas las medidas).
const filasEjemplo = [
  [
    "Dior",
    "Sauvage Elixir",
    "disenador",
    "Hombre",
    "Parfum",
    "Francia",
    "Noche y eventos de gala",
    "",     // 50ml (no viene en 50ml, viene en 60ml/100ml o solo 100ml)
    "",     // 75ml
    920,    // 100ml
    "",     // 125ml
    "",     // 150ml
    "",     // 200ml
    50,     // decant 3ml
    75,     // decant 5ml
    135,    // decant 10ml
  ],
  [
    "Parfums de Marly",
    "Layton",
    "nicho",
    "Unisex",
    "Eau de Parfum",
    "Francia",
    "Otoño, invierno y exclusividad",
    "",     // 50ml
    980,    // 75ml (medida insignia de Parfums de Marly)
    "",     // 100ml
    1350,   // 125ml (medida grande de Parfums de Marly)
    "",     // 150ml
    "",     // 200ml
    65,     // decant 3ml
    95,     // decant 5ml
    175,    // decant 10ml
  ],
  [
    "Jean Paul Gaultier",
    "Le Male Elixir",
    "disenador",
    "Hombre",
    "Parfum",
    "Francia",
    "Noche, fiesta y magnetismo",
    "",     // 50ml
    520,    // 75ml (medida clásica JPG)
    "",     // 100ml
    680,    // 125ml (medida grande JPG)
    "",     // 150ml
    "",     // 200ml
    35,     // decant 3ml
    55,     // decant 5ml
    95,     // decant 10ml
  ],
  [
    "Bleu de Chanel",
    "Eau de Parfum",
    "disenador",
    "Hombre",
    "Eau de Parfum",
    "Francia",
    "Versatilidad total ejecutiva",
    580,    // 50ml
    "",     // 75ml
    740,    // 100ml
    "",     // 125ml
    920,    // 150ml (medida icónica de Chanel)
    "",     // 200ml
    "",     // sin decants
    "",
    "",
  ],
  [
    "Giorgio Armani",
    "Acqua Di Gio",
    "disenador",
    "Hombre",
    "Eau de Toilette",
    "Italia",
    "Día, frescura marina y verano",
    "",     // 50ml
    "",     // 75ml
    560,    // 100ml
    "",     // 125ml
    "",     // 150ml
    820,    // 200ml (presentación gigante)
    "",     // sin decants
    "",
    "",
  ],
  [
    "Lattafa",
    "Khamrah",
    "arabe",
    "Unisex",
    "Eau de Parfum",
    "Emiratos Árabes Unidos",
    "Noche e invierno gourmand",
    "",     // 50ml
    "",     // 75ml
    280,    // 100ml (única presentación de frasco)
    "",     // 125ml
    "",     // 150ml
    "",     // 200ml
    25,     // decant 3ml
    35,     // decant 5ml
    60,     // decant 10ml
  ],
];

// Matriz completa
const datosProductos = [encabezados, ...filasEjemplo];

// Crear worksheet
const wsProductos = XLSX.utils.aoa_to_sheet(datosProductos);

// Ajustar anchos de columnas
wsProductos["!cols"] = [
  { wch: 22 }, // marca
  { wch: 24 }, // nombre
  { wch: 18 }, // linea_comercial
  { wch: 14 }, // genero
  { wch: 18 }, // concentracion
  { wch: 24 }, // pais_origen
  { wch: 30 }, // ocasion_uso
  { wch: 14 }, // precio_50ml
  { wch: 14 }, // precio_75ml
  { wch: 14 }, // precio_100ml
  { wch: 14 }, // precio_125ml
  { wch: 14 }, // precio_150ml
  { wch: 14 }, // precio_200ml
  { wch: 18 }, // precio_decant_3ml
  { wch: 18 }, // precio_decant_5ml
  { wch: 18 }, // precio_decant_10ml
];

// 2. Hoja de instrucciones y guía de valores válidos
const datosGuia = [
  ["CAMPO", "OBLIGATORIO", "VALORES RECOMENDADOS", "DESCRIPCIÓN / REGLAS"],
  ["marca", "SÍ", "Dior, Chanel, Tom Ford, Lattafa, Creed, JPG...", "Nombre de la casa de perfumería. Si es nueva, se creará automáticamente."],
  ["nombre", "SÍ", "Sauvage, Khamrah, Layton, Le Male Elixir...", "Nombre oficial de la fragancia."],
  ["linea_comercial", "Opcional", "disenador, nicho, arabe", "Tipo de colección comercial. Por defecto: disenador."],
  ["genero", "Opcional", "Hombre, Mujer, Unisex", "Público objetivo. Por defecto: Unisex."],
  ["concentracion", "Opcional", "Eau de Parfum, Parfum, Extrait, Eau de Toilette...", "Concentración aromática. Por defecto: Eau de Parfum."],
  ["pais_origen", "Opcional", "Francia, Italia, Emiratos Árabes Unidos, España...", "País de procedencia de la marca."],
  ["ocasion_uso", "Opcional", "Noche y eventos, Uso diario refinado, Otoño...", "Recomendación de uso en la tienda."],
  ["precio_50ml", "Flexible (*)", "Ej: 490 (dejar vacío si no aplica)", "Precio en Soles (S/) para presentación de 50 ml."],
  ["precio_75ml", "Flexible (*)", "Ej: 520 o 980 (dejar vacío si no aplica)", "Precio en Soles (S/) para presentación de 75 ml (Parfums de Marly, JPG, Creed)."],
  ["precio_100ml", "Flexible (*)", "Ej: 620 o 740 (dejar vacío si no aplica)", "Precio en Soles (S/) para presentación de 100 ml."],
  ["precio_125ml", "Flexible (*)", "Ej: 680 o 1350 (dejar vacío si no aplica)", "Precio en Soles (S/) para presentación de 125 ml (JPG, Parfums de Marly, Ralph Lauren)."],
  ["precio_150ml", "Flexible (*)", "Ej: 920 (dejar vacío si no aplica)", "Precio en Soles (S/) para presentación de 150 ml (Chanel, Dior)."],
  ["precio_200ml", "Flexible (*)", "Ej: 820 (dejar vacío si no aplica)", "Precio en Soles (S/) para presentación gigante de 200 ml."],
  ["precio_decant_3ml", "Opcional", "Ej: 35 (dejar vacío si no se vende decant)", "Precio de la muestra de 3 ml. 100% opcional."],
  ["precio_decant_5ml", "Opcional", "Ej: 55 (dejar vacío si no se vende decant)", "Precio de la muestra de 5 ml. 100% opcional."],
  ["precio_decant_10ml", "Opcional", "Ej: 95 (dejar vacío si no se vende decant)", "Precio de la muestra de 10 ml. 100% opcional."],
  [],
  ["(*) REGLA CLAVE DE PRESENTACIONES DE FRASCOS:"],
  ["• Cada perfume solo requiere al menos UNA presentación de frasco con precio (ej: solo 75ml, solo 100ml, o 75ml y 125ml)."],
  ["• NO es necesario que tenga todos los tamaños: deja vacías las celdas de los tamaños que no venda."],
  [],
  ["NOTAS GENERALES:"],
  ["1. No coloques símbolos monetarios (ej: escriba 520 en lugar de S/ 520)."],
  ["2. No requiere URLs de imágenes: el sistema asigna la silueta por defecto y luego podrá subir fotos desde el panel."],
  ["3. Si un perfume ya existe en el catálogo, puedes elegir 'Omitir' o 'Actualizar precios' al subir el archivo."],
];

const wsGuia = XLSX.utils.aoa_to_sheet(datosGuia);
wsGuia["!cols"] = [
  { wch: 22 },
  { wch: 15 },
  { wch: 45 },
  { wch: 75 },
];

// Crear el libro
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, wsProductos, "Productos");
XLSX.utils.book_append_sheet(wb, wsGuia, "Guía_y_Valores");

const outputPath = path.resolve("public/plantillas/plantilla_productos_maison.xlsx");
XLSX.writeFile(wb, outputPath);
console.log(`✓ Plantilla base Excel generada exitosamente en: ${outputPath}`);

// Aplicar estilos enriquecidos (negrita en cabeceras y auto-ajuste) vía PowerShell
try {
  execSync("powershell -ExecutionPolicy Bypass -File scripts/format-excel.ps1", { stdio: "inherit" });
  console.log("✓ Estilos con negrita aplicados a la plantilla oficial.");
} catch (e) {
  console.warn("Nota: No se pudo ejecutar el script de formato COM, pero el archivo XLSX es válido.");
}
