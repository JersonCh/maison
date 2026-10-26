import { useStore } from "@nanostores/react";
import {
  $carrito,
  $estaCarritoAbierto,
  cerrarCarrito,
  actualizarCantidadCarrito,
  eliminarDelCarrito,
} from "./tiendaCarrito";
import { obtenerTodosLosProductos } from "@/data/productos";
import { construirUrlWhatsAppCarrito } from "@/features/whatsapp/whatsapp";
import { formatearPrecio } from "@/lib/formateadores";
import Icono from "@/components/ui/Icono";
import type { LineaCarrito } from "@/types/carrito";

export default function CajonCarrito() {
  const carrito = useStore($carrito);
  const estaAbierto = useStore($estaCarritoAbierto);
  const todosLosProductos = obtenerTodosLosProductos();

  const lineas: LineaCarrito[] = carrito
    .map((item) => {
      const producto = todosLosProductos.find((p) => p.id === item.id);
      if (!producto) return null;
      const variante =
        producto.variants.find((v) => v.size === item.size) ||
        producto.variants[0];
      return {
        ...item,
        producto,
        precio: variante ? variante.price : 0,
      };
    })
    .filter((linea): linea is LineaCarrito => linea !== null);

  const total = lineas.reduce((suma, linea) => suma + linea.precio * linea.qty, 0);
  const cantidadTotal = carrito.reduce((suma, item) => suma + item.qty, 0);

  const manejarEnvioWhatsApp = () => {
    const url = construirUrlWhatsAppCarrito(lineas, total);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <aside
        className={`cart-drawer ${estaAbierto ? "open" : ""}`}
        aria-label="Carrito de compras"
      >
        <div className="cart-head">
          <div>
            <small>Tu selección</small>
            <h2>
              Carrito <span>({cantidadTotal})</span>
            </h2>
          </div>
          <button
            onClick={cerrarCarrito}
            aria-label="Cerrar carrito"
            type="button"
          >
            <Icono name="close" />
          </button>
        </div>

        {!lineas.length ? (
          <div className="empty-cart">
            <Icono name="bag" size={42} />
            <h3>Tu carrito está vacío</h3>
            <p>Descubre aromas que harán inolvidable cada momento.</p>
            <button
              className="btn btn-gold"
              onClick={cerrarCarrito}
              type="button"
            >
              Explorar perfumes
            </button>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {lineas.map((linea) => (
                <article key={`${linea.id}-${linea.size}`}>
                  <img
                    src={linea.producto.image}
                    alt={linea.producto.name}
                  />
                  <div>
                    <small>{linea.producto.brand}</small>
                    <h3>{linea.producto.name}</h3>
                    <p>{linea.size}</p>
                    <div className="cart-line-bottom">
                      <div className="qty">
                        <button
                          onClick={() =>
                            actualizarCantidadCarrito(linea.id, linea.size, -1)
                          }
                          aria-label="Disminuir cantidad"
                          type="button"
                        >
                          <Icono name="minus" size={14} />
                        </button>
                        <span>{linea.qty}</span>
                        <button
                          onClick={() =>
                            actualizarCantidadCarrito(linea.id, linea.size, 1)
                          }
                          aria-label="Aumentar cantidad"
                          type="button"
                        >
                          <Icono name="plus" size={14} />
                        </button>
                      </div>
                      <strong>{formatearPrecio(linea.precio * linea.qty)}</strong>
                    </div>
                  </div>
                  <button
                    className="remove"
                    onClick={() => eliminarDelCarrito(linea.id, linea.size)}
                    aria-label="Eliminar producto"
                    type="button"
                  >
                    <Icono name="trash" size={17} />
                  </button>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatearPrecio(total)}</strong>
              </div>
              <p>El costo de envío se coordina por WhatsApp.</p>
              <button
                className="btn btn-gold full"
                onClick={manejarEnvioWhatsApp}
                type="button"
              >
                <Icono name="whatsapp" /> Enviar pedido por WhatsApp
              </button>
              <button
                className="continue-link"
                onClick={cerrarCarrito}
                type="button"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </aside>

      {estaAbierto && (
        <button
          className="scrim"
          onClick={cerrarCarrito}
          aria-label="Cerrar carrito"
          type="button"
        />
      )}
    </>
  );
}

export const CartDrawer = CajonCarrito;
