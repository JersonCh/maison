/**
 * Formats a numeric price into Peruvian Soles currency string (e.g., S/ 1,090).
 */
export function formatPrice(price: number): string {
    return `S/ ${price.toLocaleString("es-PE")}`;
}

/**
 * Calculates and formats discount percentage (e.g., -15%).
 */
export function formatDiscount(price: number, oldPrice?: number): string | null {
    if (!oldPrice || oldPrice <= price) return null;
    const percentage = Math.round((1 - price / oldPrice) * 100);
    return `-${percentage}%`;
}
