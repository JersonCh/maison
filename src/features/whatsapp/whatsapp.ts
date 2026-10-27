import type { CartLine } from "@/types/cart";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";

export const DEFAULT_WHATSAPP_NUMBER = "51999999999";

/**
 * Returns the configured WhatsApp commercial number.
 */
export function getStorePhone(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("maison-whatsapp");
    if (saved && saved.trim().length >= 8) {
      return saved.trim().replace(/\D/g, "");
    }
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

/**
 * Formats cart order message.
 */
export function buildCartMessage(lines: CartLine[], total: number): string {
  const itemsText = lines
    .map(
      (line) =>
        `• ${line.product.name} — ${line.size} x${line.qty} — ${formatPrice(line.price * line.qty)}`,
    )
    .join("\n");

  return `Hola Maison des Parfums, deseo solicitar:\n${itemsText}\n\nTotal: ${formatPrice(total)}`;
}

/**
 * Builds the URL to open WhatsApp with the cart contents.
 */
export function buildCartWhatsAppUrl(lines: CartLine[], total: number, phone?: string): string {
  const targetPhone = phone || getStorePhone();
  const rawMessage = buildCartMessage(lines, total);
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(rawMessage)}`;
}

/**
 * Builds the URL to consult about a specific perfume and size.
 */
export function buildProductInquiryWhatsAppUrl(
  product: Product,
  size?: string,
  phone?: string,
): string {
  const targetPhone = phone || getStorePhone();
  const sizeText = size ? ` ${size}` : "";
  const rawMessage = `Hola Maison des Parfums, deseo consultar por el perfume ${product.brand} - ${product.name}${sizeText}. ¿Tienen disponibilidad?`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(rawMessage)}`;
}
