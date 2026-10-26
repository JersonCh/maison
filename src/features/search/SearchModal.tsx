import { useState, useMemo, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { $isSearchOpen, closeSearch } from "@/features/cart/cartStore";
import { getAllProducts } from "@/data/products";
import { formatPrice } from "@/lib/formatters";
import Icon from "@/components/ui/Icon";

export default function SearchModal() {
  const isOpen = useStore($isSearchOpen);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const products = getAllProducts();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products
      .filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, products]);

  return (
    <>
      <div
        className={`search-panel ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda de perfumes"
      >
        <div className="search-heading">
          <span>Buscar en Maison</span>
          <button onClick={closeSearch} aria-label="Cerrar búsqueda" type="button">
            <Icon name="close" />
          </button>
        </div>

        <div className="search-field">
          <Icon name="search" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca por nombre o marca..."
          />
        </div>

        {query.trim() !== "" && (
          <div className="suggestions">
            <p>{suggestions.length} sugerencias</p>
            {suggestions.map((product) => (
              <a
                key={product.id}
                href={`/perfumes/${product.slug}`}
                onClick={closeSearch}
                className="suggestion-item"
              >
                <img src={product.image} alt={product.name} />
                <span>
                  <small>{product.brand}</small>
                  {product.name}
                </span>
                <strong>{formatPrice(product.variants[0].price)}</strong>
              </a>
            ))}
            {!suggestions.length && (
              <div className="no-suggestion">
                Sin coincidencias. Prueba con otra búsqueda.
              </div>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <button
          className="scrim"
          onClick={closeSearch}
          aria-label="Cerrar búsqueda"
          type="button"
        />
      )}
    </>
  );
}
