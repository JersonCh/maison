import { useStore } from "@nanostores/react";
import { $cart, openCart, openSearch, openMobileMenu } from "./cartStore";
import Icon from "@/components/ui/Icon";

export function CartButton() {
  const cart = useStore($cart);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <button
      className="bag-action"
      onClick={openCart}
      aria-label="Abrir carrito"
      type="button"
    >
      <Icon name="bag" />
      <span>{count}</span>
    </button>
  );
}

export function SearchButton() {
  return (
    <button
      onClick={openSearch}
      aria-label="Buscar"
      type="button"
    >
      <Icon name="search" />
    </button>
  );
}

export function MobileMenuButton() {
  return (
    <button
      className="mobile-icon"
      onClick={openMobileMenu}
      aria-label="Abrir menú"
      type="button"
    >
      <Icon name="menu" />
    </button>
  );
}
