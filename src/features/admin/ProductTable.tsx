import { useState } from "react";
import type { ProductoAdminItem } from "@/types/database";
import Icon from "@/components/ui/Icon";

interface Props {
  products: ProductoAdminItem[];
  onEdit: (product: ProductoAdminItem) => void;
  onToggleActive: (id: number, currentActive: boolean) => Promise<void>;
  onDelete: (id: number, name: string) => Promise<void>;
  onAddNew: () => void;
}

export default function ProductTable({
  products,
  onEdit,
  onToggleActive,
  onDelete,
  onAddNew,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGenero, setFiltroGenero] = useState<string>("todos");

  const productosFiltrados = products.filter((p) => {
    const coincideTexto =
      `${p.marca} ${p.nombre} ${p.familia_olfativa}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());

    const coincideGenero =
      filtroGenero === "todos" || p.genero.toLowerCase() === filtroGenero.toLowerCase();

    return coincideTexto && coincideGenero;
  });

  return (
    <div className="products-admin">
      <div className="admin-tools">
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, maxWidth: "560px" }}>
          <div className="catalog-search" style={{ flex: 1 }}>
            <Icon name="search" />
            <input
              placeholder="Buscar por fragancia, casa de perfumería o familia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            value={filtroGenero}
            onChange={(e) => setFiltroGenero(e.target.value)}
            style={{
              padding: "9px 12px",
              fontSize: "9px",
              border: "1px solid #dcdad3",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="todos">Todos los géneros</option>
            <option value="unisex">Unisex</option>
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
          </select>
        </div>

        <button type="button" className="btn btn-gold" onClick={onAddNew}>
          <Icon name="plus" /> Nueva fragancia
        </button>
      </div>

      <div className="admin-table">
        <div
          className="table-row table-head"
          style={{ gridTemplateColumns: "2.2fr .8fr 1.2fr .6fr .7fr .8fr" }}
        >
          <span>Fragancia</span>
          <span>Género</span>
          <span>Presentaciones (S/)</span>
          <span>Fotos</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {productosFiltrados.length === 0 ? (
          <div style={{ padding: "35px", textAlign: "center", color: "var(--muted)", fontSize: "11px" }}>
            No se encontraron perfumes que coincidan con la búsqueda.
          </div>
        ) : (
          productosFiltrados.map((p) => (
            <div
              className="table-row"
              key={p.id}
              style={{ gridTemplateColumns: "2.2fr .8fr 1.2fr .6fr .7fr .8fr" }}
            >
              <span className="table-product">
                <img
                  src={p.imagenes[0] || "/assets/logo-no-fondo300.png"}
                  alt={p.nombre}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/logo-no-fondo300.png";
                  }}
                />
                <b>
                  {p.nombre}
                  <small>
                    {p.marca} · {p.concentracion}
                  </small>
                </b>
              </span>

              <span>{p.genero}</span>

              <span style={{ fontSize: "8.5px" }}>
                <div>
                  <strong>50ml:</strong> S/ {p.precio_50ml.toLocaleString("es-PE")}
                  {p.precio_referencia_50ml && (
                    <del style={{ color: "#999", marginLeft: "4px" }}>
                      S/ {p.precio_referencia_50ml.toLocaleString("es-PE")}
                    </del>
                  )}
                </div>
                <div>
                  <strong>100ml:</strong> S/ {p.precio_100ml.toLocaleString("es-PE")}
                </div>
              </span>

              <span style={{ fontSize: "8px", color: "var(--gold)" }}>
                {p.imagenes.length} {p.imagenes.length === 1 ? "foto" : "fotos"}
              </span>

              <span>
                <i className={p.activo ? "status-on" : "status-off"}>
                  {p.activo ? "Activo" : "Borrador"}
                </i>
              </span>

              <span className="table-actions">
                <button
                  onClick={() => onEdit(p)}
                  aria-label="Editar fragancia"
                  title="Editar fragancia"
                  type="button"
                >
                  <Icon name="edit" />
                </button>

                <button
                  onClick={() => onToggleActive(p.id, p.activo)}
                  aria-label="Alternar visibilidad en tienda"
                  title={p.activo ? "Desactivar" : "Activar"}
                  type="button"
                >
                  <Icon name="eye" />
                </button>

                <button
                  onClick={() => onDelete(p.id, p.nombre)}
                  aria-label="Eliminar o archivar fragancia"
                  title="Eliminar o archivar"
                  type="button"
                >
                  <Icon name="trash" />
                </button>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
