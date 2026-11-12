import type {
  ProductoAdminItem,
  MarcaItem,
  FamiliaOlfativaItem,
} from "@/types/database";

export interface ProductFormProps {
  initialProduct?: ProductoAdminItem | null;
  marcasDisponibles: MarcaItem[];
  familiasDisponibles: FamiliaOlfativaItem[];
  onBack: () => void;
  onSuccess: (mensaje: string) => void;
  onReloadMetadata?: () => Promise<void>;
  onOpenImportCsv?: () => void;
  onNavigateToBrands?: () => void;
}

