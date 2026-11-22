import type { MarcaAdminItem } from "@/types/database";
import Icon from "@/components/ui/Icon";
import { getBadgeLinea } from "./types";

interface BrandCardProps {
  marca: MarcaAdminItem;
  onAlternarEstado: (m: MarcaAdminItem) => void;
  onEditar: (m: MarcaAdminItem) => void;
  onSolicitarEliminar: (m: MarcaAdminItem) => void;
}

export default function BrandCard({
  marca,
  onAlternarEstado,
  onEditar,
  onSolicitarEliminar,
}: BrandCardProps) {
  const badge = getBadgeLinea(marca.tipo_comercial);
  const iniciales = marca.nombre.slice(0, 2).toUpperCase();
  const totalProductos = Number(marca.total_productos ?? 0);

  return (
    <article className="brand-card">
      <div>
        {/* Encabezado de la tarjeta: Monograma, Nombre y Badge */}
        <div className="brand-card-head">
          <div className="brand-card-identity">
            <div className="brand-card-monogram">{iniciales}</div>

            <div>
              <strong className="brand-card-name">{marca.nombre}</strong>
              <span className="brand-card-slug">slug: {marca.slug}</span>
            </div>
          </div>

          <span className={`brand-badge ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* País de procedencia */}
        <p className="brand-card-origin">
          Origen: {marca.pais_origen || "Francia"}
        </p>

        {/* Contador de perfumes vinculados */}
        <div
          className={`brand-card-count${totalProductos > 0 ? " has-products" : ""}`}
        >
          <span className="brand-card-count-dot" />
          <span>
            {totalProductos === 1
              ? "1 fragancia registrada en catálogo"
              : `${totalProductos} fragancias registradas en catálogo`}
          </span>
        </div>
      </div>

      {/* Pie de acciones de la tarjeta */}
      <div className="brand-card-footer">
        <button
          type="button"
          onClick={() => onAlternarEstado(marca)}
          className={`brand-status-btn${marca.activo ? " is-active" : ""}`}
          title={
            marca.activo
              ? "Pausar firma en la tienda"
              : "Activar firma en la tienda"
          }
        >
          <span className="brand-status-dot" />
          {marca.activo ? "Activa" : "Pausada"}
        </button>

        <div className="brand-card-actions">
          <button
            type="button"
            onClick={() => onEditar(marca)}
            className="brand-action-edit"
            title="Editar firma"
          >
            <Icon name="edit" size={13} />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onSolicitarEliminar(marca)}
            className="brand-action-delete"
            title="Eliminar o reasignar firma"
            aria-label={`Retirar casa ${marca.nombre}`}
          >
            <Icon name="trash" size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
