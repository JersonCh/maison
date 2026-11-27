import React from "react";
import type { MarcaItem } from "@/types/database";
import type { CommercialType } from "@/types/product";

interface ProductFormSidebarProps {
  activo: boolean;
  setActivo: (v: boolean) => void;
  esDestacado: boolean;
  setEsDestacado: (v: boolean) => void;
  guardando: boolean;
  esEdicion: boolean;
  onSave: (continuarConOtro: boolean) => void;
  onBack: () => void;
  fotoPortada: string;
  nombre: string;
  modoNuevaMarca: boolean;
  nuevaMarca: string;
  marcaActual?: MarcaItem;
  precioDesde: number;
  tipoComercial: CommercialType;
  slug: string;
}

function obtenerTextoBotonGuardar(
  guardando: boolean,
  esEdicion: boolean,
  activo: boolean,
): string {
  if (guardando) return "Guardando cambios...";
  if (esEdicion) return "✓ Guardar cambios";
  return activo ? "✓ Publicar fragancia" : "Guardar como borrador";
}

export function ProductFormSidebar({
  activo,
  setActivo,
  esDestacado,
  setEsDestacado,
  guardando,
  esEdicion,
  onSave,
  onBack,
  fotoPortada,
  nombre,
  modoNuevaMarca,
  nuevaMarca,
  marcaActual,
  precioDesde,
  tipoComercial,
  slug,
}: ProductFormSidebarProps) {
  const textoBotonGuardar = obtenerTextoBotonGuardar(guardando, esEdicion, activo);

  return (
    <aside className="product-page-sidebar">
      {/* CARD ESTADO Y PUBLICACIÓN */}
      <section className="admin-card sidebar-sticky-card">
        <h3 className="sidebar-card-title">Estado de Publicación</h3>

        <div className="sidebar-toggles" style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              cursor: "pointer",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border, #e7e2d8)",
              background: activo ? "rgba(215, 173, 87, 0.06)" : "transparent",
            }}
            aria-label={activo ? "Visible en catálogo" : "Borrador (Oculto)"}
          >
            <div>
              <strong style={{ display: "block", fontSize: "13px", color: "var(--ink)" }}>
                {activo ? "Visible en catálogo" : "Borrador (Oculto)"}
              </strong>
              <small style={{ color: "var(--muted)", fontSize: "11px", lineHeight: 1.35, display: "block", marginTop: "2px" }}>
                {activo
                  ? "Los clientes pueden comprarlo en tienda y WhatsApp."
                  : "No aparecerá en el catálogo público."}
              </small>
            </div>
            <span className="toggle-switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
              />
              <span className="toggle-slider" />
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              cursor: "pointer",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border, #e7e2d8)",
              background: esDestacado ? "rgba(215, 173, 87, 0.06)" : "transparent",
            }}
            aria-label="Selección Destacada"
          >
            <div>
              <strong style={{ display: "block", fontSize: "13px", color: "var(--ink)" }}>
                Selección Destacada
              </strong>
              <small style={{ color: "var(--muted)", fontSize: "11px", lineHeight: 1.35, display: "block", marginTop: "2px" }}>
                Mostrar en la portada de la tienda.
              </small>
            </div>
            <span className="toggle-switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={esDestacado}
                onChange={(e) => setEsDestacado(e.target.checked)}
              />
              <span className="toggle-slider" />
            </span>
          </label>
        </div>

        <div className="sidebar-actions-btn-group">
          <button
            type="button"
            className="btn btn-gold"
            style={{ width: "100%", justifyContent: "center", padding: "14px" }}
            onClick={() => onSave(false)}
            disabled={guardando}
          >
            {textoBotonGuardar}
          </button>
          {!esEdicion && (
            <button
              type="button"
              className="btn btn-outline-gold"
              style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}
              onClick={() => onSave(true)}
              disabled={guardando}
            >
              + Guardar y añadir otro
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "center", marginTop: "6px" }}
            onClick={onBack}
            disabled={guardando}
          >
            Descartar cambios
          </button>
        </div>
      </section>

      {/* CARD VISTA PREVIA RÁPIDA */}
      <section className="admin-card">
        <h3 className="sidebar-card-title">Resumen de Ficha</h3>

        <div className="product-quick-summary">
          <div className="summary-thumb">
            {fotoPortada ? (
              <img src={fotoPortada} alt={nombre} />
            ) : (
              <div className="thumb-placeholder">Sin imagen</div>
            )}
          </div>
          <div className="summary-info">
            <span className="summary-brand">
              {modoNuevaMarca ? nuevaMarca || "Nueva casa" : marcaActual?.nombre || "Marca"}
            </span>
            <strong className="summary-name">{nombre || "Nombre de fragancia"}</strong>
            <span className="summary-price">
              {precioDesde > 0 ? `Desde S/ ${precioDesde.toLocaleString("es-PE")}` : "Precio no definido"}
            </span>
            <span className="summary-line-badge">
              {tipoComercial === "disenador"
                ? "Diseñador"
                : tipoComercial === "arabe"
                  ? "Árabe"
                  : "Nicho"}
            </span>
          </div>
        </div>

        {esEdicion && slug && (
          <a
            href={`/perfumes/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-view-live"
          >
            Ver ficha en la tienda pública ↗
          </a>
        )}
      </section>
    </aside>
  );
}

