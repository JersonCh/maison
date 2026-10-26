import { agregarAlCarrito } from "@/features/carrito/tiendaCarrito";
import Icono from "@/components/ui/Icono";

export default function BotonAgregarRapido({
  idProducto,
  tamano,
  productId,
  size,
}: {
  idProducto?: number;
  tamano?: string;
  productId?: number;
  size?: string;
}) {
  const idFinal = idProducto || productId || 0;
  const tamanoFinal = tamano || size || "50 ml";

  return (
    <button
      className="quick-add"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        agregarAlCarrito(idFinal, tamanoFinal, 1);
      }}
      type="button"
      aria-label="Añadir al carrito"
    >
      <Icono name="bag" size={17} /> Añadir al carrito
    </button>
  );
}

export const QuickAddButton = BotonAgregarRapido;
