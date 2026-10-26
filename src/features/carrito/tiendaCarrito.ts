import { atom } from "nanostores";
import type { ItemCarrito } from "@/types/carrito";
import { obtenerProductoPorId } from "@/data/productos";

const CLAVE_STORAGE = "maison-cart";

function obtenerCarritoInicial(): ItemCarrito[] {
  if (typeof window === "undefined") return [];
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
}

// Estados globales con Nano Stores
export const $carrito = atom<ItemCarrito[]>(obtenerCarritoInicial());
export const $estaCarritoAbierto = atom<boolean>(false);
export const $estaBuscadorAbierto = atom<boolean>(false);
export const $estaMenuMovilAbierto = atom<boolean>(false);
export const $mensajeToast = atom<string>("");

// Sincronización automática con localStorage
if (typeof window !== "undefined") {
  $carrito.subscribe((items) => {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
    } catch {
      // Ignorar errores de almacenamiento local
    }
  });
}

// Acciones de apertura y cierre de paneles
export function abrirCarrito(): void {
  $estaCarritoAbierto.set(true);
  $estaBuscadorAbierto.set(false);
  $estaMenuMovilAbierto.set(false);
}

export function cerrarCarrito(): void {
  $estaCarritoAbierto.set(false);
}

export function abrirBuscador(): void {
  $estaBuscadorAbierto.set(true);
  $estaCarritoAbierto.set(false);
  $estaMenuMovilAbierto.set(false);
}

export function cerrarBuscador(): void {
  $estaBuscadorAbierto.set(false);
}

export function abrirMenuMovil(): void {
  $estaMenuMovilAbierto.set(true);
  $estaCarritoAbierto.set(false);
  $estaBuscadorAbierto.set(false);
}

export function cerrarMenuMovil(): void {
  $estaMenuMovilAbierto.set(false);
}

export function mostrarNotificacion(mensaje: string): void {
  $mensajeToast.set(mensaje);
  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      if ($mensajeToast.get() === mensaje) {
        $mensajeToast.set("");
      }
    }, 2600);
  }
}

// Acciones de mutación del carrito
export function agregarAlCarrito(id: number, tamano?: string, cantidad = 1): void {
  const producto = obtenerProductoPorId(id);
  if (!producto) return;
  const tamanoFinal = tamano || producto.variants[0].size;

  const actual = $carrito.get();
  const indiceExistente = actual.findIndex(
    (item) => item.id === id && item.size === tamanoFinal,
  );

  if (indiceExistente > -1) {
    const actualizado = [...actual];
    actualizado[indiceExistente] = {
      ...actualizado[indiceExistente],
      qty: actualizado[indiceExistente].qty + cantidad,
    };
    $carrito.set(actualizado);
  } else {
    $carrito.set([...actual, { id, size: tamanoFinal, qty: cantidad }]);
  }

  mostrarNotificacion(`${producto.name} se añadió al carrito`);
}

export function actualizarCantidadCarrito(id: number, tamano: string, incremento: number): void {
  const actual = $carrito.get();
  const actualizado = actual.map((item) => {
    if (item.id === id && item.size === tamano) {
      const nuevaCantidad = Math.max(1, item.qty + incremento);
      return { ...item, qty: nuevaCantidad };
    }
    return item;
  });
  $carrito.set(actualizado);
}

export function eliminarDelCarrito(id: number, tamano: string): void {
  const actual = $carrito.get();
  $carrito.set(actual.filter((item) => !(item.id === id && item.size === tamano)));
}

export function vaciarCarrito(): void {
  $carrito.set([]);
}

// Aliases de retrocompatibilidad
export const $cart = $carrito;
export const $isCartOpen = $estaCarritoAbierto;
export const $isSearchOpen = $estaBuscadorAbierto;
export const $isMobileMenuOpen = $estaMenuMovilAbierto;
export const $toastMessage = $mensajeToast;

export const addToCart = agregarAlCarrito;
export const updateCartQty = actualizarCantidadCarrito;
export const removeFromCart = eliminarDelCarrito;
export const clearCart = vaciarCarrito;
export const openCart = abrirCarrito;
export const closeCart = cerrarCarrito;
export const openSearch = abrirBuscador;
export const closeSearch = cerrarBuscador;
export const openMobileMenu = abrirMenuMovil;
export const closeMobileMenu = cerrarMenuMovil;
export const showToast = mostrarNotificacion;
