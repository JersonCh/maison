import React, { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ProductMediaCardProps {
  fotoPortada: string;
  setFotoPortada: (url: string) => void;
  fotoCaja: string;
  setFotoCaja: (url: string) => void;
  fotoDetalle: string;
  setFotoDetalle: (url: string) => void;
  subiendoSlot: number | null;
  errorSubida: string | null;
  manejarSubidaArchivo: (
    e: React.ChangeEvent<HTMLInputElement>,
    slotNumero: number,
    setter: (url: string) => void,
  ) => Promise<void>;
  onEliminarArchivo?: (url: string, setter: (url: string) => void) => Promise<void>;
}

export function ProductMediaCard({
  fotoPortada,
  setFotoPortada,
  fotoCaja,
  setFotoCaja,
  fotoDetalle,
  setFotoDetalle,
  subiendoSlot,
  errorSubida,
  manejarSubidaArchivo,
  onEliminarArchivo,
}: ProductMediaCardProps) {
  const [slotAEliminar, setSlotAEliminar] = useState<{
    titulo: string;
    url: string;
    setter: (url: string) => void;
  } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const solicitarEliminar = (
    titulo: string,
    url: string,
    setter: (url: string) => void,
  ) => {
    setSlotAEliminar({ titulo, url, setter });
  };

  const confirmarEliminar = async () => {
    if (!slotAEliminar) return;
    setEliminando(true);
    try {
      if (onEliminarArchivo) {
        await onEliminarArchivo(slotAEliminar.url, slotAEliminar.setter);
      } else {
        slotAEliminar.setter("");
      }
      setSlotAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <span className="card-badge">Imágenes</span>
          <h2 className="admin-card-title">Galería de fotos</h2>
        </div>
        <span className="admin-card-subtitle">
          Proporción recomendada: vertical 3:4 (ej. 900 × 1200 px).
        </span>
      </div>

      {errorSubida && <div className="photo-upload-error">⚠ {errorSubida}</div>}

      <div className="photo-slots-grid">
        {/* Foto 1: Portada (Obligatoria) */}
        <div className="photo-slot-card">
          <div className="photo-slot-header">
            <span className="photo-slot-title">1. Portada principal *</span>
            <span className="photo-slot-badge principal">Obligatoria</span>
          </div>
          <div className={`photo-slot-preview ${fotoPortada ? "has-photo" : ""}`}>
            {fotoPortada ? (
              <img
                src={fotoPortada}
                alt="Vista previa portada"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/imagenxdefecto.svg";
                }}
              />
            ) : (
              <label
                htmlFor="input-file-slot-1"
                className="photo-slot-empty-label"
                title="Hacer clic para subir fotografía"
              >
                <svg
                  className="photo-slot-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                <span className="photo-slot-empty">Sin fotografía (3:4)</span>
                <span className="photo-slot-hint">Clic para seleccionar</span>
              </label>
            )}
          </div>
          <div className="photo-slot-actions">
            <label
              htmlFor="input-file-slot-1"
              className={`btn-upload-file ${subiendoSlot === 1 ? "uploading" : ""}`}
            >
              {subiendoSlot === 1
                ? "Optimizando..."
                : fotoPortada
                  ? "Cambiar archivo"
                  : "Subir archivo"}
            </label>
            <input
              id="input-file-slot-1"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={subiendoSlot !== null}
              style={{ display: "none" }}
              onChange={(e) => manejarSubidaArchivo(e, 1, setFotoPortada)}
            />
            {fotoPortada && (
              <button
                type="button"
                className="btn-clear-photo"
                onClick={() => solicitarEliminar("Portada principal", fotoPortada, setFotoPortada)}
                title="Eliminar fotografía"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>

        {/* Foto 2: Caja y Empaque (Opcional) */}
        <div className="photo-slot-card">
          <div className="photo-slot-header">
            <span className="photo-slot-title">2. Caja o empaque</span>
            <span className="photo-slot-badge">Opcional</span>
          </div>
          <div className={`photo-slot-preview ${fotoCaja ? "has-photo" : ""}`}>
            {fotoCaja ? (
              <img
                src={fotoCaja}
                alt="Vista previa caja"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/imagenxdefecto.svg";
                }}
              />
            ) : (
              <label
                htmlFor="input-file-slot-2"
                className="photo-slot-empty-label"
                title="Hacer clic para subir fotografía"
              >
                <svg
                  className="photo-slot-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                <span className="photo-slot-empty">Opcional (sin foto)</span>
                <span className="photo-slot-hint">Clic para seleccionar</span>
              </label>
            )}
          </div>
          <div className="photo-slot-actions">
            <label
              htmlFor="input-file-slot-2"
              className={`btn-upload-file ${subiendoSlot === 2 ? "uploading" : ""}`}
            >
              {subiendoSlot === 2
                ? "Optimizando..."
                : fotoCaja
                  ? "Cambiar archivo"
                  : "Subir archivo"}
            </label>
            <input
              id="input-file-slot-2"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={subiendoSlot !== null}
              style={{ display: "none" }}
              onChange={(e) => manejarSubidaArchivo(e, 2, setFotoCaja)}
            />
            {fotoCaja && (
              <button
                type="button"
                className="btn-clear-photo"
                onClick={() => solicitarEliminar("Caja o empaque", fotoCaja, setFotoCaja)}
                title="Eliminar fotografía"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>

        {/* Foto 3: Detalle y Contexto (Opcional) */}
        <div className="photo-slot-card">
          <div className="photo-slot-header">
            <span className="photo-slot-title">3. Vista secundaria</span>
            <span className="photo-slot-badge">Opcional</span>
          </div>
          <div className={`photo-slot-preview ${fotoDetalle ? "has-photo" : ""}`}>
            {fotoDetalle ? (
              <img
                src={fotoDetalle}
                alt="Vista previa detalle"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/imagenxdefecto.svg";
                }}
              />
            ) : (
              <label
                htmlFor="input-file-slot-3"
                className="photo-slot-empty-label"
                title="Hacer clic para subir fotografía"
              >
                <svg
                  className="photo-slot-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                <span className="photo-slot-empty">Opcional (sin foto)</span>
                <span className="photo-slot-hint">Clic para seleccionar</span>
              </label>
            )}
          </div>
          <div className="photo-slot-actions">
            <label
              htmlFor="input-file-slot-3"
              className={`btn-upload-file ${subiendoSlot === 3 ? "uploading" : ""}`}
            >
              {subiendoSlot === 3
                ? "Optimizando..."
                : fotoDetalle
                  ? "Cambiar archivo"
                  : "Subir archivo"}
            </label>
            <input
              id="input-file-slot-3"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={subiendoSlot !== null}
              style={{ display: "none" }}
              onChange={(e) => manejarSubidaArchivo(e, 3, setFotoDetalle)}
            />
            {fotoDetalle && (
              <button
                type="button"
                className="btn-clear-photo"
                onClick={() => solicitarEliminar("Vista secundaria", fotoDetalle, setFotoDetalle)}
                title="Eliminar fotografía"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(slotAEliminar)}
        onClose={() => !eliminando && setSlotAEliminar(null)}
        onConfirm={confirmarEliminar}
        title="¿Eliminar fotografía?"
        subtitle="Galería de Fotos"
        message={
          <>
            ¿Realmente deseas eliminar la fotografía de{" "}
            <strong>{slotAEliminar?.titulo.toLowerCase() || "esta posición"}</strong>?
            <br />
            Esta acción eliminará el archivo por completo y no se podrá recuperar.
          </>
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={eliminando}
      />
    </section>
  );
}

