import React from "react";

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
}: ProductMediaCardProps) {
  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <span className="card-badge">Imágenes</span>
          <h2 className="admin-card-title">Galería de fotos</h2>
        </div>
        <span className="admin-card-subtitle">
          Proporción recomendada: vertical 3:4 (ej. 900 × 1200 px). Las imágenes se optimizan automáticamente a WebP (&lt; 1 MB).
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
          <div className="photo-slot-preview">
            {fotoPortada ? (
              <img
                src={fotoPortada}
                alt="Vista previa portada"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/imagenxdefecto.svg";
                }}
              />
            ) : (
              <span className="photo-slot-empty">Sin imagen</span>
            )}
          </div>
          <div className="photo-slot-actions">
            <label className={`btn-upload-file ${subiendoSlot === 1 ? "uploading" : ""}`}>
              {subiendoSlot === 1 ? "Optimizando..." : "Subir archivo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={subiendoSlot !== null}
                style={{ display: "none" }}
                onChange={(e) => manejarSubidaArchivo(e, 1, setFotoPortada)}
              />
            </label>
            {fotoPortada && (
              <button
                type="button"
                className="btn-clear-photo"
                onClick={() => setFotoPortada("")}
                title="Limpiar campo"
              >
                Quitar
              </button>
            )}
          </div>
          <div className="photo-slot-input">
            <span className="photo-slot-url-label">URL de la imagen</span>
            <input
              required
              placeholder="https://... o /api/images/..."
              value={fotoPortada}
              onChange={(e) => setFotoPortada(e.target.value)}
            />
          </div>
        </div>

        {/* Foto 2: Caja y Empaque (Opcional) */}
        <div className="photo-slot-card">
          <div className="photo-slot-header">
            <span className="photo-slot-title">2. Caja o empaque</span>
            <span className="photo-slot-badge">Opcional</span>
          </div>
          <div className="photo-slot-preview">
            {fotoCaja ? (
              <img
                src={fotoCaja}
                alt="Vista previa caja"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/imagenxdefecto.svg";
                }}
              />
            ) : (
              <span className="photo-slot-empty">Opcional (sin foto)</span>
            )}
          </div>
          <div className="photo-slot-actions">
            <label className={`btn-upload-file ${subiendoSlot === 2 ? "uploading" : ""}`}>
              {subiendoSlot === 2 ? "Optimizando..." : "Subir archivo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={subiendoSlot !== null}
                style={{ display: "none" }}
                onChange={(e) => manejarSubidaArchivo(e, 2, setFotoCaja)}
              />
            </label>
            {fotoCaja && (
              <button
                type="button"
                className="btn-clear-photo"
                onClick={() => setFotoCaja("")}
                title="Limpiar campo"
              >
                Quitar
              </button>
            )}
          </div>
          <div className="photo-slot-input">
            <span className="photo-slot-url-label">URL de la imagen</span>
            <input
              placeholder="https://... o /api/images/..."
              value={fotoCaja}
              onChange={(e) => setFotoCaja(e.target.value)}
            />
          </div>
        </div>

        {/* Foto 3: Detalle y Contexto (Opcional) */}
        <div className="photo-slot-card">
          <div className="photo-slot-header">
            <span className="photo-slot-title">3. Vista secundaria</span>
            <span className="photo-slot-badge">Opcional</span>
          </div>
          <div className="photo-slot-preview">
            {fotoDetalle ? (
              <img
                src={fotoDetalle}
                alt="Vista previa detalle"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/imagenxdefecto.svg";
                }}
              />
            ) : (
              <span className="photo-slot-empty">Opcional (sin foto)</span>
            )}
          </div>
          <div className="photo-slot-actions">
            <label className={`btn-upload-file ${subiendoSlot === 3 ? "uploading" : ""}`}>
              {subiendoSlot === 3 ? "Optimizando..." : "Subir archivo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={subiendoSlot !== null}
                style={{ display: "none" }}
                onChange={(e) => manejarSubidaArchivo(e, 3, setFotoDetalle)}
              />
            </label>
            {fotoDetalle && (
              <button
                type="button"
                className="btn-clear-photo"
                onClick={() => setFotoDetalle("")}
                title="Limpiar campo"
              >
                Quitar
              </button>
            )}
          </div>
          <div className="photo-slot-input">
            <span className="photo-slot-url-label">URL de la imagen</span>
            <input
              placeholder="https://... o /api/images/..."
              value={fotoDetalle}
              onChange={(e) => setFotoDetalle(e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

