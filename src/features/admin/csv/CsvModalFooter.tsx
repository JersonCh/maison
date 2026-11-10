import React from "react";
import { ArrowLeftIcon, SpinnerIcon, CheckIcon } from "./CsvIcons";

interface CsvModalFooterProps {
  paso: 1 | 2 | 3;
  onClose: () => void;
  onVolverAPaso1: () => void;
  importando: boolean;
  cantidadAImportar: number;
  onEjecutarImportacion: () => void;
  onCerrarYFinalizar: () => void;
}

export function CsvModalFooter({
  paso,
  onClose,
  onVolverAPaso1,
  importando,
  cantidadAImportar,
  onEjecutarImportacion,
  onCerrarYFinalizar,
}: CsvModalFooterProps) {
  return (
    <div
      style={{
        padding: "18px 30px",
        background: "var(--ivory)",
        borderTop: "1px solid var(--line)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {paso === 1 && (
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            style={{ background: "transparent" }}
          >
            Cancelar
          </button>
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            Selecciona un archivo <code>.xlsx</code> o <code>.csv</code> para continuar
          </span>
        </>
      )}

      {paso === 2 && (
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onVolverAPaso1}
            disabled={importando}
            style={{ background: "transparent", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeftIcon size={13} color="currentColor" />
            Volver a cargar archivo
          </button>

          <button
            type="button"
            className="btn btn-gold"
            disabled={cantidadAImportar === 0 || importando}
            onClick={onEjecutarImportacion}
            style={{ minWidth: "220px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {importando ? (
              <>
                <SpinnerIcon size={14} color="currentColor" />
                <span>Guardando en el catálogo...</span>
              </>
            ) : (
              <>
                <CheckIcon size={14} color="currentColor" />
                <span>
                  Confirmar e importar {cantidadAImportar}{" "}
                  {cantidadAImportar === 1 ? "fragancia" : "fragancias"}
                </span>
              </>
            )}
          </button>
        </>
      )}

      {paso === 3 && (
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-gold"
            onClick={onCerrarYFinalizar}
            style={{ minWidth: "180px" }}
          >
            Cerrar y ver en catálogo
          </button>
        </div>
      )}
    </div>
  );
}

