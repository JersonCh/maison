import type { LineaCarrito } from "@/types/carrito";
import type { Producto } from "@/types/producto";
import { formatearPrecio } from "@/lib/formateadores";

export const NUMERO_WHATSAPP_POR_DEFECTO = "51999999999";
export const DEFAULT_WHATSAPP_NUMBER = NUMERO_WHATSAPP_POR_DEFECTO;

/**
 * Obtiene el número comercial configurado para atención y pedidos.
 */
export function obtenerTelefonoTienda(): string {
  if (typeof window !== "undefined") {
    const guardado = localStorage.getItem("maison-whatsapp");
    if (guardado && guardado.trim().length >= 8) {
      return guardado.trim().replace(/\D/g, "");
    }
  }
  return NUMERO_WHATSAPP_POR_DEFECTO;
}

/**
 * Construye el mensaje legible del pedido con el desglose de productos y total.
 */
export function construirMensajeCarrito(lineas: LineaCarrito[], total: number): string {
  const detalleProductos = lineas
    .map(
      (linea) =>
        `• ${linea.producto.name} — ${linea.size} x${linea.qty} — ${formatearPrecio(linea.precio * linea.qty)}`,
    )
    .join("\n");

  return `Hola Maison des Parfums, deseo solicitar:\n${detalleProductos}\n\nTotal: ${formatearPrecio(total)}`;
}

/**
 * Genera el enlace directo a WhatsApp (wa.me) con el pedido preformateado.
 */
export function construirUrlWhatsAppCarrito(
  lineas: LineaCarrito[],
  total: number,
  telefono?: string,
): string {
  const telefonoDestino = telefono || obtenerTelefonoTienda();
  const mensaje = construirMensajeCarrito(lineas, total);
  return `https://wa.me/${telefonoDestino}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Genera el enlace a WhatsApp para consultar por un perfume en específico.
 */
export function construirUrlWhatsAppConsultaProducto(
  producto: Producto,
  tamano?: string,
  telefono?: string,
): string {
  const telefonoDestino = telefono || obtenerTelefonoTienda();
  const textoTamano = tamano ? ` ${tamano}` : "";
  const mensaje = `Hola Maison des Parfums, deseo consultar por el perfume ${producto.brand} - ${producto.name}${textoTamano}. ¿Tienen disponibilidad?`;
  return `https://wa.me/${telefonoDestino}?text=${encodeURIComponent(mensaje)}`;
}

// Alias de retrocompatibilidad
export const getStorePhone = obtenerTelefonoTienda;
export const buildCartMessage = construirMensajeCarrito;
export const buildCartWhatsAppUrl = construirUrlWhatsAppCarrito;
export const buildProductInquiryWhatsAppUrl = construirUrlWhatsAppConsultaProducto;
