import { useState, useMemo, useEffect } from "react";
import type { ProductoAdminItem } from "@/types/database";
import Icon from "@/components/ui/Icon";

interface Props {
  products: ProductoAdminItem[];
  onEdit: (product: ProductoAdminItem) => void;
  onToggleActive: (id: number, currentActive: boolean) => Promise<void>;
  onDelete: (id: number, name: string) => Promise<void>;
  onAddNew: () => void;
  onOpenImportCsv?: () => void;
}

const ITEMS_PER_PAGE = 8;

export default function ProductTable({
  products,
  onEdit,
  onToggleActive,
  onDelete,
  onAddNew,
  onOpenImportCsv,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGenero, setFiltroGenero] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [paginaActual, setPaginaActual] = useState(1);

  // Filtrado de productos
  const productosFiltrados = useMemo(() => {
    return products.filter((p) => {
      const coincideTexto =
        `${p.marca} ${p.nombre}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      const coincideGenero =
        filtroGenero === "todos" ||
        p.genero.toLowerCase() === filtroGenero.toLowerCase();

      const coincideTipo =
        filtroTipo === "todos"
          ? true
          : filtroTipo === "decant"
            ? Boolean(
                p.tiene_decants ||
                  p.precio_decant_3ml ||
                  p.precio_decant_5ml ||
                  p.precio_decant_10ml,
              )
            : p.tipo_comercial === filtroTipo;

      return coincideTexto && coincideGenero && coincideTipo;
    });
  }, [products, busqueda, filtroGenero, filtroTipo]);

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
              padding: "10px 14px",
              fontSize: "13px",
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

          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value);
              setPaginaActual(1);
            }}
            style={{
              padding: "10px 14px",
              fontSize: "13px",
              border: "1px solid #dcdad3",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="todos">Todas las líneas</option>
            <option value="disenador">Diseñador</option>
            <option value="arabe">Árabes</option>
            <option value="nicho">Nichos</option>
            <option value="decant">✦ Con Decants</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {onOpenImportCsv && (
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
          <button type="button" className="btn btn-gold" onClick={onAddNew}>
            <Icon name="plus" /> Nueva fragancia
          </button>
        </div>
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
              fontSize: "14px",
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
                  src={p.imagenes[0] || "/assets/imagenxdefecto.svg"}
                  alt={p.nombre}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/assets/imagenxdefecto.svg";
                  }}
                />
                <b>
                  {p.nombre}
                  <small>
                    {p.marca} · {p.concentracion}
                  </small>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                    <span
                      style={{
                        fontSize: "9.5px",
                        letterSpacing: "0.05em",
                        padding: "1px 6px",
                        borderRadius: "3px",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        background:
                          p.tipo_comercial === "arabe"
                            ? "rgba(16, 185, 129, 0.12)"
                            : p.tipo_comercial === "nicho"
                              ? "rgba(147, 51, 234, 0.12)"
                              : "rgba(215, 173, 87, 0.15)",
                        color:
                          p.tipo_comercial === "arabe"
                            ? "#059669"
                            : p.tipo_comercial === "nicho"
                              ? "#7c3aed"
                              : "#9a7828",
                      }}
                    >
                      {p.tipo_comercial === "arabe" ? "Árabe" : p.tipo_comercial === "nicho" ? "Nicho" : "Diseñador"}
                    </span>
                    {p.tiene_decants && (
                      <span
                        style={{
                          fontSize: "9.5px",
                          padding: "1px 5px",
                          borderRadius: "3px",
                          fontWeight: 600,
                          background: "#f1f5f9",
                          color: "#475569",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        ✦ Decants
                      </span>
                    )}
                  </div>
                </b>
              </span>

              <span>{p.genero}</span>

              <span style={{ fontSize: "13px", lineHeight: "1.5" }}>
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
                {(p.precio_decant_3ml || p.precio_decant_5ml || p.precio_decant_10ml) && (
                  <div style={{ color: "#b48c36", fontSize: "11.5px", marginTop: "3px", fontWeight: 500 }}>
                    Decant: {[
                      p.precio_decant_3ml ? `3ml S/${p.precio_decant_3ml}` : null,
                      p.precio_decant_5ml ? `5ml S/${p.precio_decant_5ml}` : null,
                      p.precio_decant_10ml ? `10ml S/${p.precio_decant_10ml}` : null,
                    ].filter(Boolean).join(" · ")}
                  </div>
                )}
              </span>

              <span style={{ fontSize: "12.5px", color: "var(--gold-deep)", fontWeight: 500 }}>
                {p.imagenes.length === 1 && (p.imagenes[0].includes("logo-no-fondo300") || p.imagenes[0].includes("imagenxdefecto")) ? (
                  <span
                    style={{
                      fontSize: "10.5px",
                      color: "var(--gold-deep)",
                      background: "rgba(240, 212, 126, 0.15)",
                      border: "1px solid rgba(150, 108, 40, 0.3)",
                      padding: "2px 7px",
                      borderRadius: "3px",
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                    }}
                    title="Fragancia sin fotografías: pendiente de adjuntar fotos oficiales"
                  >
                    Foto pendiente
                  </span>
                ) : (
                  `${p.imagenes.length} ${p.imagenes.length === 1 ? "foto" : "fotos"}`
                )}
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
