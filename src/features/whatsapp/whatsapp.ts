import type { CartLine } from "@/types/cart";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";

export const DEFAULT_WHATSAPP_NUMBER = "51954159831";

/**
 * Normaliza y formatea el número de WhatsApp para wa.me.
 * Si es un número peruano de 9 dígitos (ej. 910292249), antepone automáticamente el código de país 51.
 */
export function normalizarTelefonoWhatsApp(phone?: string | null): string {
  if (!phone) return DEFAULT_WHATSAPP_NUMBER;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return DEFAULT_WHATSAPP_NUMBER;
  if (digits.length === 9 && digits.startsWith("9")) {
    return `51${digits}`;
  }
  return digits;
}

/**
 * Retorna el número de WhatsApp comercial configurado en D1 (leído del cache local o predeterminado).
 */
export function getStorePhone(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("maison-whatsapp");
    if (saved && saved.trim().length >= 8) {
      return normalizarTelefonoWhatsApp(saved);
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
  const targetPhone = normalizarTelefonoWhatsApp(phone || getStorePhone());
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
  const targetPhone = normalizarTelefonoWhatsApp(phone || getStorePhone());
  const sizeText = size ? ` ${size}` : "";
  const rawMessage = `Hola Maison des Parfums, deseo consultar por el perfume ${product.brand} - ${product.name}${sizeText}. ¿Tienen disponibilidad?`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(rawMessage)}`;
}
