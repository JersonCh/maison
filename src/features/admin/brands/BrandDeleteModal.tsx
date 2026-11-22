import { useEffect } from "react";
import type { MarcaAdminItem } from "@/types/database";
import Icon from "@/components/ui/Icon";

interface BrandDeleteModalProps {
  marcaAEliminar: MarcaAdminItem | null;
  marcas: MarcaAdminItem[];
  marcaDestinoId: number | "";
  setMarcaDestinoId: (v: number | "") => void;
  eliminando: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function BrandDeleteModal({
  marcaAEliminar,
  marcas,
  marcaDestinoId,
  setMarcaDestinoId,
  eliminando,
  onClose,
  onConfirm,
}: BrandDeleteModalProps) {
  useEffect(() => {
    if (!marcaAEliminar) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !eliminando) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [marcaAEliminar, eliminando, onClose]);

  if (!marcaAEliminar) return null;

  const totalProductos = Number(marcaAEliminar.total_productos ?? 0);
  const tienePerfumes = totalProductos > 0;
  const botonDeshabilitado = eliminando || (tienePerfumes && !marcaDestinoId);

  return (
    <div className="brand-modal-overlay">
      <button
        type="button"
        aria-label="Cerrar modal de eliminación"
        disabled={eliminando}
        onClick={onClose}
        className="brand-modal-backdrop"
      />

      <div className="brand-modal-dialog brand-modal-dialog--delete">
        <div className="brand-modal-head">
          <div>
            <small className="brand-modal-eyebrow brand-modal-eyebrow--danger">
              Gestión de Catálogo
            </small>
            <h3 className="brand-modal-title">
              Retirar "{marcaAEliminar.nombre}"
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={eliminando}
            className="brand-modal-close"
            aria-label="Cerrar modal de retiro"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="brand-modal-body">
          {!tienePerfumes ? (
            <div>
              <p className="brand-delete-text">
                ¿Estás seguro de retirar{" "}
                <strong>"{marcaAEliminar.nombre}"</strong> del catálogo oficial?
              </p>
              <p className="brand-delete-muted">
                Esta firma no cuenta con perfumes registrados, por lo que será
                retirada de forma permanente.
              </p>
            </div>
          ) : (
            <div>
              <div className="brand-delete-warning">
                La firma <strong>"{marcaAEliminar.nombre}"</strong> tiene{" "}
                <strong>
                  {totalProductos}{" "}
                  {totalProductos === 1
                    ? "fragancia asociada"
                    : "fragancias asociadas"}
                </strong>{" "}
                en el catálogo oficial.
              </div>

              <p className="brand-delete-prompt">
                Para preservar el catálogo sin dejar perfumes huérfanos,
                selecciona la firma oficial a la que deseas transferir sus
                fragancias:
              </p>

              <div className="brand-delete-select-wrap">
                <select
                  id="select-marca-destino"
                  aria-label="Seleccionar firma destino"
                  value={marcaDestinoId}
                  onChange={(e) =>
                    setMarcaDestinoId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="brand-select"
                >
                  <option value="">
                    Selecciona la casa de perfumería destino...
                  </option>
                  {marcas
                    .filter((m) => m.id !== marcaAEliminar.id)
                    .map((m) => {
                      const cant = Number(m.total_productos ?? 0);
                      return (
                        <option key={m.id} value={m.id}>
                          {m.nombre} ({m.tipo_comercial}) — {cant} perfumes
                          actuales
                        </option>
                      );
                    })}
                </select>
                <small className="brand-delete-hint">
                  Ejemplo: Si "{marcaAEliminar.nombre}" fue un error tipográfico,
                  puedes transferir sus perfumes a su firma oficial y la
                  duplicada se eliminará limpiamente.
                </small>
              </div>
            </div>
          )}

          {/* Botones de acción del modal de eliminación */}
          <div className="brand-modal-actions">
            <button
              type="button"
              className="btn btn-outline brand-modal-cancel"
              onClick={onClose}
              disabled={eliminando}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={botonDeshabilitado}
              className="brand-btn-danger"
            >
              {eliminando
                ? "Procesando..."
                : tienePerfumes
                  ? "Transferir fragancias y retirar"
                  : "Retirar firma"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
