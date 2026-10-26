import type { ReactNode } from "react";
import Icon from "./Icons";
import type { Product } from "./data";

export function Button({
  children,
  onClick,
  variant = "gold",
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "gold" | "dark" | "outline" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn btn-${variant} ${className}`}>
      {children}
    </button>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  light,
  copy,
}: {
  eyebrow: string;
  title: string;
  light?: boolean;
  copy?: string;
}) {
  return (
    <div className={`section-title ${light ? "light" : ""}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

export function ProductCard({
  product,
  onDetail,
  onAdd,
}: {
  product: Product;
  onDetail: () => void;
  onAdd: () => void;
}) {
  const price = product.variants[0].price;
  return (
    <article className="product-card">
      <div className="product-photo">
        {product.oldPrice && <span className="sale-badge">-{Math.round((1 - price / product.oldPrice) * 100)}%</span>}
        {product.recent && <span className="new-badge">Nuevo</span>}
        <button className="heart-btn" aria-label="Agregar a favoritos"><Icon name="heart" /></button>
        <img src={product.image} alt={`${product.brand} ${product.name}`} loading="lazy" />
        <button className="quick-add" onClick={onAdd}><Icon name="bag" size={17} /> Añadir al carrito</button>
      </div>
      <div className="product-copy">
        <p className="brand">{product.brand}</p>
        <h3>{product.name}</h3>
        <p className="meta">{product.gender} · {product.variants[0].size}</p>
        <div className="price-row">
          <strong>S/ {price.toLocaleString("es-PE")}</strong>
          {product.oldPrice && <s>S/ {product.oldPrice.toLocaleString("es-PE")}</s>}
        </div>
        <button className="detail-link" onClick={onDetail}>Ver detalles <Icon name="arrow" size={16} /></button>
      </div>
    </article>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty-state">
      <span className="empty-mark">M</span>
      <h3>No encontramos esa fragancia</h3>
      <p>Prueba con otro nombre o ajusta los filtros seleccionados.</p>
      <Button onClick={onReset} variant="dark">Limpiar filtros</Button>
    </div>
  );
}
