import type { MarcaItem, ProductoAdminItem } from "@/types/database";
import type { FilaCsvProcesada } from "@/lib/csvHelper";

export interface CsvModalProps {
  marcas?: MarcaItem[];
  productos?: ProductoAdminItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

export type FiltroVistaPreview = "todos" | "validos" | "duplicados" | "errores";

export interface ResultadoImportacionFinal {
  creados: number;
  actualizados: number;
  omitidos: number;
  errores: string[];
}

export type { FilaCsvProcesada, MarcaItem, ProductoAdminItem };

