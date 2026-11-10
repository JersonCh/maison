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

/**
 * Resuelve el precio referencial/tachado correspondiente a una variante específica.
 */
export function getVariantOldPrice(
    product: { variants: { oldPrice?: number }[]; oldPrice?: number },
    variant?: { price: number; oldPrice?: number; isDecant?: boolean; size?: string },
): number | undefined {
    if (!variant) return undefined;
    const isDecant = Boolean(
        variant.isDecant || variant.size?.toLowerCase().includes("decant"),
    );
    if (isDecant) return undefined;

    if (variant.oldPrice && variant.oldPrice > variant.price) {
        return variant.oldPrice;
    }

    const hasPerVariantRefs = product.variants.some((v) => v.oldPrice !== undefined);
    if (!hasPerVariantRefs && product.oldPrice && product.oldPrice > variant.price) {
        return product.oldPrice;
    }

    return undefined;
}
