import { addToCart } from "@/features/cart/cartStore";
import Icon from "@/components/ui/Icon";

export default function QuickAddButton({
  productId,
  size,
}: {
  productId: number;
  size: string;
}) {
  return (
    <button
      className="quick-add"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(productId, size, 1);
      }}
      type="button"
      aria-label="Añadir al carrito"
    >
      <Icon name="bag" size={17} /> Añadir al carrito
    </button>
  );
}
