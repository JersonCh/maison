import Icon from "@/components/ui/Icon";

interface ProductFormHeaderProps {
  onBack: () => void;
  guardando: boolean;
  esEdicion: boolean;
  nombre: string;
  onOpenImportCsv?: () => void;
  onSave: (continuarConOtro: boolean) => void;
}

export function ProductFormHeader({
  onBack,
  guardando,
  esEdicion,
  nombre,
  onOpenImportCsv,
  onSave,
}: ProductFormHeaderProps) {
  return (
    <header className="product-page-header">
      <div className="product-page-header-left">
        <button
          type="button"
          className="btn-back-link"
          onClick={onBack}
          disabled={guardando}
        >
          ← Volver a Perfumes
        </button>
        <div className="product-page-title-group">
          <span className="product-page-eyebrow">
            {esEdicion ? "Edición de Perfume" : "Nueva Fragancia"}
          </span>
          <h1 className="product-page-title">
            {nombre || (esEdicion ? "Sin título" : "Nueva creación olfativa")}
          </h1>
        </div>
      </div>

      <div className="product-page-header-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onBack}
          disabled={guardando}
        >
          Descartar
        </button>
        {!esEdicion && onOpenImportCsv && (
          <button
            type="button"
            className="btn btn-outline"
            style={{
              borderColor: "var(--gold)",
              color: "var(--ink)",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              background: "var(--white)",
            }}
            onClick={onOpenImportCsv}
            title="Importar catálogo masivamente desde archivo Excel o CSV"
          >
            <Icon name="upload" size={15} />
            <span>Importar Excel / CSV</span>
          </button>
        )}
        {!esEdicion && (
          <button
            type="button"
            className="btn btn-outline-gold"
            onClick={() => onSave(true)}
            disabled={guardando}
            title="Guarda esta fragancia y mantiene marca, país y precios para la siguiente"
          >
            + Guardar y añadir otro
          </button>
        )}
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => onSave(false)}
          disabled={guardando}
        >
          {guardando
            ? "Guardando..."
            : esEdicion
              ? "✓ Guardar cambios"
              : "✓ Publicar fragancia"}
        </button>
      </div>
    </header>
  );
}

