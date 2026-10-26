import { useStore } from "@nanostores/react";
import {
  $carrito,
  abrirCarrito,
  abrirBuscador,
  abrirMenuMovil,
} from "./tiendaCarrito";
import Icono from "@/components/ui/Icono";

export function BotonCarrito() {
  const carrito = useStore($carrito);
  const totalItems = carrito.reduce((suma, item) => suma + item.qty, 0);

  return (
    <button
      className="bag-action"
      onClick={abrirCarrito}
      aria-label="Abrir carrito"
      type="button"
    >
      <Icono name="bag" />
      <span>{totalItems}</span>
    </button>
  );
}

export function BotonBuscador() {
  return (
    <button
      onClick={abrirBuscador}
      aria-label="Buscar"
      type="button"
    >
      <Icono name="search" />
    </button>
  );
}

export function BotonMenuMovil() {
  return (
    <button
      className="mobile-icon"
      onClick={abrirMenuMovil}
      aria-label="Abrir menú"
      type="button"
    >
      <Icono name="menu" />
    </button>
  );
}

// Aliases para retrocompatibilidad
export const CartButton = BotonCarrito;
export const SearchButton = BotonBuscador;
export const MobileMenuButton = BotonMenuMovil;
