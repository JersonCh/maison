import { useState, useMemo, useEffect } from "react";
import type { Product, Gender } from "@/types/product";
import { formatPrice, formatDiscount } from "@/lib/formatters";
import { addToCart } from "@/features/cart/cartStore";
import Icon from "@/components/ui/Icon";

interface Props {
  initialProducts: Product[];
  initialGender?: string;
  initialBrand?: string;
  initialQuery?: string;
}

export default function CatalogBrowser({
  initialProducts,
  initialGender = "",
  initialBrand = "",
  initialQuery = "",
}: Props) {
  const [search, setSearch] = useState(initialQuery);
  const [gender, setGender] = useState(initialGender);
  const [brand, setBrand] = useState(initialBrand);
  const [family, setFamily] = useState("");
  const [maxPrice, setMaxPrice] = useState(1500);
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Leer query params del navegador al montar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paramGender = params.get("genero") || "";
    const paramBrand = params.get("marca") || "";
    const paramQuery = params.get("q") || "";

    if (paramGender) setGender(paramGender);
    if (paramBrand) setBrand(paramBrand);
    if (paramQuery) setSearch(paramQuery);
  }, []);

  // Sincronizar URL suavemente y actualizar enlace activo en cabecera
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (gender) params.set("genero", gender);
    if (brand) params.set("marca", brand);
    if (search) params.set("q", search);

    const queryString = params.toString();
    const newRelativePath = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    window.history.replaceState(null, "", newRelativePath);

    // Mantener sincronizada la barra de navegación superior si cambia el género interactivamente
    const navLinks = document.querySelectorAll(".site-header nav a");
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const url = new URL(href, window.location.origin);
      const linkGender = url.searchParams.get("genero")?.toLowerCase() || "";
      const isPerfumesBase = href === "/perfumes";

      if (gender) {
        if (linkGender === gender.toLowerCase()) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      } else if (isPerfumesBase) {
        link.classList.add("active");
      }
    });
  }, [gender, brand, search]);

  const brands = useMemo(
    () => [...new Set(initialProducts.map((p) => p.brand))].sort(),
    [initialProducts],
  );

  const families = useMemo(
    () => [...new Set(initialProducts.map((p) => p.family))].sort(),
    [initialProducts],
  );

  const filtered = useMemo(() => {
    const result = initialProducts.filter((p) => {
      if (p.active === false) return false;
      if (
        search &&
        !`${p.brand} ${p.name}`.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (gender && p.gender !== gender) return false;
      if (brand && p.brand !== brand) return false;
      if (family && p.family !== family) return false;
      if (p.variants[0].price > maxPrice) return false;
      if (available && p.stock <= 0) return false;
      return true;
    });

    if (sort === "low") {
      result.sort((a, b) => a.variants[0].price - b.variants[0].price);
    } else if (sort === "high") {
      result.sort((a, b) => b.variants[0].price - a.variants[0].price);
    } else if (sort === "recent") {
      result.sort((a, b) => Number(b.recent) - Number(a.recent));
    }

    return result;
  }, [initialProducts, search, gender, brand, family, maxPrice, available, sort]);

  const resetFilters = () => {
    setSearch("");
    setGender("");
    setBrand("");
    setFamily("");
    setMaxPrice(1500);
    setAvailable(false);
  };

  const pageTitle = gender
    ? gender.toLowerCase() === "unisex"
      ? "Perfumes Unisex"
      : `Perfumes para ${gender.toLowerCase()}`
    : "Todos los perfumes";

  return (
    <main className="catalog-page">
      <div className="catalog-intro">
        <p className="eyebrow">Colección Maison</p>
        <h1>{pageTitle}</h1>
        <p>
          Explora nuestra selección de fragancias originales y encuentra el
          aroma que se convertirá en tu sello personal.
        </p>
      </div>

      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Icon name="search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por perfume o marca"
          />
        </div>

        <button
          className="filter-mobile"
          onClick={() => setFiltersOpen(true)}
          type="button"
        >
          <Icon name="filter" /> Filtros
        </button>

        <div className="sort">
          <span>Ordenar por</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="relevance">Relevancia</option>
            <option value="low">Menor precio</option>
            <option value="high">Mayor precio</option>
            <option value="recent">Más recientes</option>
          </select>
        </div>
      </div>

      <div className="catalog-layout">
        <aside className={`filters ${filtersOpen ? "open" : ""}`}>
          <div className="filter-title">
            <strong>Filtros</strong>
            <button onClick={resetFilters} type="button">
              Limpiar todo
            </button>
            <button
              className="filter-close"
              onClick={() => setFiltersOpen(false)}
              type="button"
              aria-label="Cerrar filtros"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="filter-group">
            <label>Género</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Marca</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="">Todas</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Familia olfativa</label>
            <select
              value={family}
              onChange={(e) => setFamily(e.target.value)}
            >
              <option value="">Todas</option>
              {families.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              Precio máximo <strong>{formatPrice(maxPrice)}</strong>
            </label>
            <input
              type="range"
              min="300"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>S/ 300</span>
              <span>S/ 1,500</span>
            </div>
          </div>

          <div className="filter-group">
            <label>Presentación</label>
            <div className="size-pills">
              <span>50 ml</span>
              <span>100 ml</span>
            </div>
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
            <span />
            Solo disponibles
          </label>

          <button
            onClick={() => setFiltersOpen(false)}
            className="btn btn-gold filter-apply full"
            type="button"
          >
            Ver {filtered.length} resultados
          </button>
        </aside>

        {filtersOpen && (
          <button
            className="filter-scrim"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
            type="button"
          />
        )}

        <div className="catalog-results">
          <div className="result-count">{filtered.length} productos</div>
          {filtered.length ? (
            <div className="product-grid catalog">
              {filtered.map((product) => {
                const defaultVariant = product.variants[0];
                const price = defaultVariant.price;
                const discount = formatDiscount(price, product.oldPrice);
                const productUrl = `/perfumes/${product.slug}`;

                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-photo">
                      {discount && <span className="sale-badge">{discount}</span>}
                      {product.recent && <span className="new-badge">Nuevo</span>}
                      <button
                        className="heart-btn"
                        aria-label="Agregar a favoritos"
                        type="button"
                      >
                        <Icon name="heart" />
                      </button>
                      <a
                        href={productUrl}
                        aria-label={`Ver detalles de ${product.brand} ${product.name}`}
                      >
                        <img
                          src={product.image}
                          alt={`${product.brand} ${product.name}`}
                          loading="lazy"
                          decoding="async"
                          width="450"
                          height="450"
                        />
                      </a>
                      <button
                        className="quick-add"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(product.id, defaultVariant.size, 1);
                        }}
                        type="button"
                        aria-label="Añadir al carrito"
                      >
                        <Icon name="bag" size={17} /> Añadir al carrito
                      </button>
                    </div>

                    <div className="product-copy">
                      <p className="brand">{product.brand}</p>
                      <h3>
                        <a href={productUrl}>{product.name}</a>
                      </h3>
                      <p className="meta">
                        {product.gender} · {defaultVariant.size}
                      </p>
                      <div className="price-row">
                        <strong>{formatPrice(price)}</strong>
                        {product.oldPrice && <s>{formatPrice(product.oldPrice)}</s>}
                      </div>
                      <a className="detail-link" href={productUrl}>
                        Ver detalles <Icon name="arrow" size={16} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="search" size={38} />
              <h3>No encontramos coincidencias</h3>
              <p>Prueba ajustando los filtros o realiza otra búsqueda.</p>
              <button
                className="btn btn-gold"
                onClick={resetFilters}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
