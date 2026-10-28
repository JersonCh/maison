import { useState } from "react";
import type { Product } from "@/types/product";
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
  const [selectedSize, setSelectedSize] = useState(product.variants[0].size);
  const [qty, setQty] = useState(1);

  const activeVariant =
    product.variants.find((v) => v.size === selectedSize) || product.variants[0];

  const handleAddToCart = () => {
    addToCart(product.id, selectedSize, qty);
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

        {/* Variantes de tamaño */}
        <div className="option-block">
          <div>
            <label>Presentación</label>
            <span>Selecciona una opción</span>
          </div>
          <div className="variant-pills">
            {product.variants.map((v) => (
              <button
                type="button"
                key={v.size}
                className={selectedSize === v.size ? "active" : ""}
                onClick={() => setSelectedSize(v.size)}
              >
                {v.size}
                <small>{formatPrice(v.price)}</small>
              </button>
            ))}
          </div>
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
          <Icon name="whatsapp" /> Consultar por WhatsApp
        </button>

        {/* Garantías */}
        <div className="detail-assurances">
          <span>
            <Icon name="check" /> Producto original
          </span>
          <span>
            <Icon name="check" /> Asesoría personalizada
          </span>
        </div>
      </div>
    </section>
  );
}
