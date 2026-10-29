import { useState, useMemo, useEffect } from "react";
import type { ProductoAdminItem } from "@/types/database";
import Icon from "@/components/ui/Icon";

interface Props {
  products: ProductoAdminItem[];
  onEdit: (product: ProductoAdminItem) => void;
  onToggleActive: (id: number, currentActive: boolean) => Promise<void>;
  onDelete: (id: number, name: string) => Promise<void>;
  onAddNew: () => void;
}

const ITEMS_PER_PAGE = 8;

export default function ProductTable({
  products,
  onEdit,
  onToggleActive,
  onDelete,
  onAddNew,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGenero, setFiltroGenero] = useState<string>("todos");
  const [paginaActual, setPaginaActual] = useState(1);

  // Filtrado de productos
  const productosFiltrados = useMemo(() => {
    return products.filter((p) => {
      const coincideTexto =
        `${p.marca} ${p.nombre} ${p.familia_olfativa}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      const coincideGenero =
        filtroGenero === "todos" ||
        p.genero.toLowerCase() === filtroGenero.toLowerCase();

      return coincideTexto && coincideGenero;
    });
  }, [products, busqueda, filtroGenero]);

  // Cálculo de páginas
  const totalPaginas = Math.max(
    1,
    Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE),
  );

  // Reajustar página si queda fuera de rango al filtrar
  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  const inicio = (paginaActual - 1) * ITEMS_PER_PAGE + 1;
  const fin = Math.min(paginaActual * ITEMS_PER_PAGE, productosFiltrados.length);

  const productosPaginados = useMemo(() => {
    const start = (paginaActual - 1) * ITEMS_PER_PAGE;
    return productosFiltrados.slice(start, start + ITEMS_PER_PAGE);
  }, [productosFiltrados, paginaActual]);

  const cambiarPagina = (nuevaPagina: number) => {
    if (
      nuevaPagina < 1 ||
      nuevaPagina > totalPaginas ||
      nuevaPagina === paginaActual
    )
      return;
    setPaginaActual(nuevaPagina);
    if (typeof window !== "undefined") {
      const el = document.querySelector(".admin-tools");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="products-admin">
      <div className="admin-tools">
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flex: 1,
            maxWidth: "560px",
          }}
        >
          <div className="catalog-search" style={{ position: "relative", flex: 1 }}>
            <Icon name="search" />
            <input
              placeholder="Buscar por fragancia, casa o familia..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              style={{ paddingRight: "25px" }}
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setPaginaActual(1);
                }}
                style={{
                  position: "absolute",
                  right: "6px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: 0,
                  background: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "grid",
                  placeItems: "center",
                }}
                aria-label="Borrar búsqueda"
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>

          <select
            value={filtroGenero}
            onChange={(e) => {
              setFiltroGenero(e.target.value);
              setPaginaActual(1);
            }}
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
          <div
            style={{
              padding: "45px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "11px",
            }}
          >
            No se encontraron perfumes que coincidan con la búsqueda o filtro.
          </div>
        ) : (
          productosPaginados.map((p) => (
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
                    (e.target as HTMLImageElement).src =
                      "/assets/logo-no-fondo300.png";
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
                  <strong>100ml:</strong> S/{" "}
                  {p.precio_100ml.toLocaleString("es-PE")}
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

        {/* Paginación de la tabla */}
        {productosFiltrados.length > 0 && (
          <div className="admin-pagination">
            <div className="admin-pagination-info">
              Mostrando <strong>{inicio}–{fin}</strong> de{" "}
              <strong>{productosFiltrados.length}</strong> fragancias
              {totalPaginas > 1 && ` · Página ${paginaActual} de ${totalPaginas}`}
            </div>

            {totalPaginas > 1 && (
              <div className="admin-pagination-controls">
                <button
                  type="button"
                  className="admin-page-btn"
                  disabled={paginaActual <= 1}
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  aria-label="Página anterior"
                >
                  ← Anterior
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      type="button"
                      className={`admin-page-num ${paginaActual === num ? "active" : ""}`}
                      onClick={() => cambiarPagina(num)}
                      aria-label={`Página ${num}`}
                      aria-current={paginaActual === num ? "page" : undefined}
                    >
                      {num}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className="admin-page-btn"
                  disabled={paginaActual >= totalPaginas}
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  aria-label="Página siguiente"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
