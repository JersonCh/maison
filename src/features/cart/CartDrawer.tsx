import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  $cart,
  $isCartOpen,
  closeCart,
  updateCartQty,
  removeFromCart,
} from "./cartStore";
import type { Product } from "@/types/product";
import { buildCartWhatsAppUrl } from "@/features/whatsapp/whatsapp";
import { formatPrice } from "@/lib/formatters";
import Icon from "@/components/ui/Icon";
import type { CartLine } from "@/types/cart";

interface Props {
  phone?: string;
}

export default function CartDrawer({ phone }: Props) {
  const cart = useStore($cart);
  const isOpen = useStore($isCartOpen);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAllProducts(data))
      .catch(() => setAllProducts([]));
  }, []);

  const lines: CartLine[] = cart
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.id);
      if (!product) return null;
      const variant =
        product.variants.find((v) => v.size === item.size) ||
        product.variants[0];
      return {
        ...item,
        product,
        price: variant ? variant.price : 0,
      };
    })
    .filter((line): line is CartLine => line !== null);

  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleSendWhatsApp = () => {
    const url = buildCartWhatsAppUrl(lines, total, phone);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`} aria-label="Carrito de compras">
        <div className="cart-head">
          <div>
            <small>Tu selección</small>
            <h2>
              Carrito <span>({totalCount})</span>
            </h2>
          </div>
          <button onClick={closeCart} aria-label="Cerrar carrito" type="button">
            <Icon name="close" />
          </button>
        </div>

        {!lines.length ? (
          <div className="empty-cart">
            <Icon name="bag" size={42} />
            <h3>Tu carrito está vacío</h3>
            <p>Descubre aromas que harán inolvidable cada momento.</p>
            <button className="btn btn-gold" onClick={closeCart} type="button">
              Explorar perfumes
            </button>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {lines.map((line) => (
                <article key={`${line.id}-${line.size}`}>
                  <img src={line.product.image} alt={line.product.name} />
                  <div>
                    <small>{line.product.brand}</small>
                    <h3>{line.product.name}</h3>
                    <p>{line.size}</p>
                    <div className="cart-line-bottom">
                      <div className="qty">
                        <button
                          onClick={() => updateCartQty(line.id, line.size, -1)}
                          aria-label="Disminuir cantidad"
                          type="button"
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span>{line.qty}</span>
                        <button
                          onClick={() => updateCartQty(line.id, line.size, 1)}
                          aria-label="Aumentar cantidad"
                          type="button"
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <strong>{formatPrice(line.price * line.qty)}</strong>
                    </div>
                  </div>
                  <button
                    className="remove"
                    onClick={() => removeFromCart(line.id, line.size)}
                    aria-label="Eliminar producto"
                    type="button"
                  >
                    <Icon name="trash" size={17} />
                  </button>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p>El costo de envío se coordina por WhatsApp.</p>
              <button
                className="btn btn-gold full"
                onClick={handleSendWhatsApp}
                type="button"
              >
                <Icon name="whatsapp" size={18} /> Enviar pedido por WhatsApp
              </button>
              <button className="continue-link" onClick={closeCart} type="button">
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </aside>

      {isOpen && (
        <button
          className="scrim"
          onClick={closeCart}
          aria-label="Cerrar carrito"
          type="button"
        />
      )}
    </>
  );
}
