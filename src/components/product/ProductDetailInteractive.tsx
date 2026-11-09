import { useState } from "react";
import type { Product, ProductVariant } from "@/types/product";
import { addToCart } from "@/features/cart/cartStore";
import { buildProductInquiryWhatsAppUrl } from "@/features/whatsapp/whatsapp";
import { formatPrice } from "@/lib/formatters";
import Icon from "@/components/ui/Icon";

interface Props {
  product: Product;
  phone?: string;
}

export default function ProductDetailInteractive({ product, phone }: Props) {
  const [selectedImage, setSelectedImage] = useState(product.image);

  // Clasificación de variantes: frascos regulares vs decants
  const frascos = product.variants.filter(
    (v) => !Boolean(v.isDecant || v.size.toLowerCase().includes("decant")),
  );
  const decants = product.variants.filter((v) =>
    Boolean(v.isDecant || v.size.toLowerCase().includes("decant")),
  );

  // Variante predeterminada: preferir frasco de 100ml o 50ml si existe
  const defaultVariant =
    frascos.find((v) => v.size.includes("100")) ||
    frascos.find((v) => v.size.includes("50")) ||
    frascos[0] ||
    decants[0] ||
    product.variants[0];

  const [selectedSize, setSelectedSize] = useState(
    defaultVariant?.size || "100 ml",
  );
  const [qty, setQty] = useState(1);

  const activeVariant: ProductVariant =
    product.variants.find((v) => v.size === selectedSize) ||
    product.variants.find(
      (v) =>
        v.size.replace(/\s*\(decant\)/i, "").trim() ===
        selectedSize.replace(/\s*\(decant\)/i, "").trim(),
    ) ||
    defaultVariant || { size: "100 ml", price: 0 };

  const handleAddToCart = () => {
    addToCart(product.id, selectedSize, qty, product.name);
  };

  const handleWhatsAppInquiry = () => {
    const url = buildProductInquiryWhatsAppUrl(product, selectedSize, phone);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="detail-grid">
      {/* Galería de imágenes */}
      <div className="gallery">
        <div className="thumbs">
          {product.gallery.map((img, i) => (
            <button
              type="button"
              className={selectedImage === img ? "active" : ""}
              onClick={() => setSelectedImage(img)}
              key={`${img}-${i}`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <img
                src={img}
                alt=""
                width="80"
                height="80"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
        <div className="main-image">
          <span>Original garantizado</span>
          <img
            src={selectedImage}
            alt={`${product.brand} ${product.name}`}
            width="600"
            height="600"
            decoding="async"
          />
        </div>
      </div>

      {/* Información y acciones */}
      <div className="detail-copy">
        <p className="brand">{product.brand}</p>
        <h1>{product.name}</h1>
        <p className="detail-type">Eau de Parfum · {product.gender}</p>

        <div className="detail-price">{formatPrice(activeVariant.price)}</div>
        <p className="detail-description">{product.description}</p>

        <div className="stock">
          <i />
          <span>Disponible</span>
        </div>

        {/* Variantes de presentación */}
        <div className="option-block">
          {/* Fila 1: Frascos completos */}
          {frascos.length > 0 && (
            <div className="presentation-row">
              <div className="option-header">
                <label>{decants.length > 0 ? "Frasco" : "Presentación"}</label>
                <span>Caja sellada</span>
              </div>
              <div className="variant-pills">
                {frascos.map((v) => {
                  const isSelected = selectedSize === v.size;
                  const displaySize = v.size.replace(/\s*\(decant\)/i, "").trim();
                  return (
                    <button
                      type="button"
                      key={v.size}
                      className={isSelected ? "active" : ""}
                      onClick={() => setSelectedSize(v.size)}
                    >
                      {displaySize}
                      <small>{formatPrice(v.price)}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fila 2: Decants (SOLO si el perfume tiene decants registrados) */}
          {decants.length > 0 && (
            <div className={`presentation-row ${frascos.length > 0 ? "decants-group" : ""}`}>
              <div className="option-header">
                <label>Decants</label>
                <span>Atomizador de vidrio</span>
              </div>
              <div className="variant-pills">
                {decants.map((v) => {
                  const isSelected = selectedSize === v.size;
                  const cleanSize = v.size.replace(/\s*\(decant\)/i, "").trim();
                  return (
                    <button
                      type="button"
                      key={v.size}
                      className={isSelected ? "active" : ""}
                      onClick={() => setSelectedSize(v.size)}
                    >
                      Decant {cleanSize}
                      <small>{formatPrice(v.price)}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selector de cantidad y Agregar al carrito */}
        <div className="purchase-row">
          <div className="qty large">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              aria-label="Disminuir cantidad"
            >
              <Icon name="minus" />
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              aria-label="Aumentar cantidad"
            >
              <Icon name="plus" />
            </button>
          </div>
          <button
            type="button"
            className="btn btn-gold full"
            onClick={handleAddToCart}
          >
            <Icon name="bag" /> Añadir al carrito
          </button>
        </div>

        {/* Botón WhatsApp */}
        <button
          type="button"
          className="btn btn-outline full whatsapp-btn"
          onClick={handleWhatsAppInquiry}
        >
          <Icon name="whatsapp" size={18} /> Consultar por WhatsApp
        </button>

        {/* Garantías */}
        <div className="detail-assurances">
          <span>
            <Icon name="check" /> Producto original
          </span>
          <span>
            <Icon name="check" size={14} /> Asesoría personalizada
          </span>
          <a href="/envios" className="assurance-shipping-link">
            <Icon name="truck" size={14} /> Envíos los jueves a todo el Perú ↗
          </a>
        </div>
      </div>
    </section>
  );
}
