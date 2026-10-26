import { atom } from "nanostores";
import type { CartItem } from "@/types/cart";
import { getProductById } from "@/data/products";

const STORAGE_KEY = "maison-cart";

function getInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export const $cart = atom<CartItem[]>(getInitialCart());
export const $isCartOpen = atom<boolean>(false);
export const $isSearchOpen = atom<boolean>(false);
export const $isMobileMenuOpen = atom<boolean>(false);
export const $toastMessage = atom<string>("");

// Subscribe to update localStorage whenever cart changes
if (typeof window !== "undefined") {
  $cart.subscribe((items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  });
}

export function openCart(): void {
  $isCartOpen.set(true);
  $isSearchOpen.set(false);
  $isMobileMenuOpen.set(false);
}

export function closeCart(): void {
  $isCartOpen.set(false);
}

export function openSearch(): void {
  $isSearchOpen.set(true);
  $isCartOpen.set(false);
  $isMobileMenuOpen.set(false);
}

export function closeSearch(): void {
  $isSearchOpen.set(false);
}

export function openMobileMenu(): void {
  $isMobileMenuOpen.set(true);
  $isCartOpen.set(false);
  $isSearchOpen.set(false);
}

export function closeMobileMenu(): void {
  $isMobileMenuOpen.set(false);
}

export function showToast(message: string): void {
  $toastMessage.set(message);
  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      if ($toastMessage.get() === message) {
        $toastMessage.set("");
      }
    }, 2600);
  }
}

export function addToCart(id: number, size?: string, qty = 1): void {
  const product = getProductById(id);
  if (!product) return;
  const finalSize = size || product.variants[0].size;

  const current = $cart.get();
  const matchIndex = current.findIndex(
    (item) => item.id === id && item.size === finalSize,
  );

  if (matchIndex > -1) {
    const updated = [...current];
    updated[matchIndex] = {
      ...updated[matchIndex],
      qty: updated[matchIndex].qty + qty,
    };
    $cart.set(updated);
  } else {
    $cart.set([...current, { id, size: finalSize, qty }]);
  }

  showToast(`${product.name} se añadió al carrito`);
}

export function updateCartQty(id: number, size: string, delta: number): void {
  const current = $cart.get();
  const updated = current
    .map((item) => {
      if (item.id === id && item.size === size) {
        const nextQty = Math.max(1, item.qty + delta);
        return { ...item, qty: nextQty };
      }
      return item;
    });
  $cart.set(updated);
}

export function removeFromCart(id: number, size: string): void {
  const current = $cart.get();
  $cart.set(current.filter((item) => !(item.id === id && item.size === size)));
}

export function clearCart(): void {
  $cart.set([]);
}
