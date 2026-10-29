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
  initialPage?: number;
}

const ITEMS_PER_PAGE = 9;

export default function CatalogBrowser({
  initialProducts,
  initialGender = "",
  initialBrand = "",
  initialQuery = "",
  initialPage = 1,
}: Props) {
  // Búsqueda inmediata en el input y búsqueda con debounce
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [search, setSearch] = useState(initialQuery);

  const [gender, setGender] = useState(initialGender);
  const [brand, setBrand] = useState(initialBrand);
  const [family, setFamily] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // 1. Cálculo dinámico de rango de precios a partir de los productos reales
  const { globalMinPrice, globalMaxPrice } = useMemo(() => {
    if (!initialProducts.length) return { globalMinPrice: 200, globalMaxPrice: 1500 };
    let min = Infinity;
    let max = -Infinity;
    for (const p of initialProducts) {
      for (const v of p.variants) {
        if (v.price < min) min = v.price;
        if (v.price > max) max = v.price;
      }
    }
    return {
      globalMinPrice: Math.max(0, Math.floor(min / 10) * 10),
      globalMaxPrice: Math.ceil(max / 10) * 10,
    };
  }, [initialProducts]);

  const [maxPrice, setMaxPrice] = useState(globalMaxPrice);

  // Inicializar maxPrice cuando se determine el globalMaxPrice
  useEffect(() => {
    setMaxPrice(globalMaxPrice);
  }, [globalMaxPrice]);

  // 2. Debounce para búsqueda (280ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 280);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // 3. Obtener presentaciones / mililitros disponibles dinámicamente
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    for (const p of initialProducts) {
      for (const v of p.variants) {
        if (v.size) sizes.add(v.size.trim());
      }
    }
    return Array.from(sizes).sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB;
    });
  }, [initialProducts]);

  // 4. Leer parámetros de URL al montar en el navegador
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paramGender = params.get("genero") || "";
    const paramBrand = params.get("marca") || "";
    const paramQuery = params.get("q") || "";
    const paramPage = parseInt(params.get("pagina") || params.get("page") || "1", 10);
    const paramSize = params.get("presentacion") || "";
    const paramMaxPrice = parseInt(params.get("precio_max") || "", 10);

    if (paramGender) setGender(paramGender);
    if (paramBrand) setBrand(paramBrand);
    if (paramQuery) {
      setSearchInput(paramQuery);
      setSearch(paramQuery);
    }
    if (!isNaN(paramPage) && paramPage >= 1) setCurrentPage(paramPage);
    if (paramSize) setSelectedSize(paramSize);
    if (!isNaN(paramMaxPrice) && paramMaxPrice > 0) setMaxPrice(paramMaxPrice);
  }, []);

  // 5. Sincronizar URL suavemente y actualizar enlace activo en cabecera
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (gender) params.set("genero", gender);
    if (brand) params.set("marca", brand);
    if (search) params.set("q", search);
    if (family) params.set("familia", family);
    if (selectedSize) params.set("presentacion", selectedSize);
    if (maxPrice < globalMaxPrice) params.set("precio_max", maxPrice.toString());
    if (currentPage > 1) params.set("pagina", currentPage.toString());

    const queryString = params.toString();
    const newRelativePath = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    window.history.replaceState(null, "", newRelativePath);

    // Sincronizar navegación superior
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
  }, [gender, brand, search, family, selectedSize, maxPrice, currentPage, globalMaxPrice]);

  const brands = useMemo(
    () => [...new Set(initialProducts.map((p) => p.brand))].sort(),
    [initialProducts],
  );

  const families = useMemo(
    () => [...new Set(initialProducts.map((p) => p.family))].sort(),
    [initialProducts],
  );

  // 6. Filtrado y ordenamiento de productos
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
      if (
        selectedSize &&
        !p.variants.some(
          (v) => v.size.trim().toLowerCase() === selectedSize.toLowerCase(),
        )
      ) {
        return false;
      }

      // Evaluar precio mínimo de variantes contra maxPrice
      const minProductPrice = Math.min(...p.variants.map((v) => v.price));
      if (minProductPrice > maxPrice) return false;

      // Disponibilidad
      if (available && p.active === false) return false;
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
  }, [initialProducts, search, gender, brand, family, selectedSize, maxPrice, available, sort]);

  // 7. Cálculo de paginación (9 productos por página)
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPages || nuevaPagina === currentPage) return;
    setCurrentPage(nuevaPagina);
    if (typeof window !== "undefined") {
      const targetElement = document.querySelector(".catalog-toolbar") || document.querySelector(".catalog-layout");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // 8. Reseteo y control de filtros
  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setGender("");
    setBrand("");
    setFamily("");
    setSelectedSize("");
    setMaxPrice(globalMaxPrice);
    setAvailable(false);
    setCurrentPage(1);
  };

  // Comprobar si existen filtros activos para mostrar la barra de chips
  const hasActiveFilters = Boolean(
    search ||
      gender ||
      brand ||
      family ||
      selectedSize ||
      maxPrice < globalMaxPrice ||
      available,
  );

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por perfume o marca"
          />
          {searchInput && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setCurrentPage(1);
              }}
              aria-label="Borrar búsqueda"
            >
              <Icon name="close" size={13} />
            </button>
          )}
        </div>

        <button
          className="filter-mobile"
          onClick={() => setFiltersOpen(true)}
          type="button"
        >
          <Icon name="filter" /> Filtros
          {hasActiveFilters && <span className="filter-dot-active" />}
        </button>

        <div className="sort">
          <span>Ordenar por</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="relevance">Relevancia</option>
            <option value="low">Menor precio</option>
            <option value="high">Mayor precio</option>
            <option value="recent">Más recientes</option>
          </select>
        </div>
      </div>

      <div className="catalog-layout">
        {/* Barra lateral de filtros */}
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

          {/* Filtro Género */}
          <div className="filter-group">
            <label>Género</label>
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          {/* Filtro Marca */}
          <div className="filter-group">
            <label>Marca</label>
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todas</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Familia Olfativa */}
          <div className="filter-group">
            <label>Familia olfativa</label>
            <select
              value={family}
              onChange={(e) => {
                setFamily(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todas</option>
              {families.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Precio Máximo Dinámico */}
          <div className="filter-group">
            <label>
              Precio máximo <strong>{formatPrice(maxPrice)}</strong>
            </label>
            <input
              type="range"
              min={globalMinPrice}
              max={globalMaxPrice}
              step="10"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setCurrentPage(1);
              }}
            />
            <div className="range-labels">
              <span>{formatPrice(globalMinPrice)}</span>
              <span>{formatPrice(globalMaxPrice)}</span>
            </div>
          </div>

          {/* Filtro Presentación / Mililitros funcional */}
          <div className="filter-group">
            <label>Presentación</label>
            <div className="size-pills">
              <button
                type="button"
                className={`size-pill ${selectedSize === "" ? "active" : ""}`}
                onClick={() => {
                  setSelectedSize("");
                  setCurrentPage(1);
                }}
              >
                Todas
              </button>
              {availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`size-pill ${selectedSize === s ? "active" : ""}`}
                  onClick={() => {
                    setSelectedSize(selectedSize === s ? "" : s);
                    setCurrentPage(1);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro Solo Disponibles */}
          <label className="check-row">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => {
                setAvailable(e.target.checked);
                setCurrentPage(1);
              }}
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

        {/* Zona de resultados */}
        <div className="catalog-results">
          {/* Barra de Chips de filtros activos */}
          {hasActiveFilters && (
            <div className="active-filters">
              <span className="active-filters-label">Filtros:</span>

              {gender && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => {
                    setGender("");
                    setCurrentPage(1);
                  }}
                >
                  {gender} <span className="remove-x">✕</span>
                </button>
              )}

              {brand && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => {
                    setBrand("");
                    setCurrentPage(1);
                  }}
                >
                  {brand} <span className="remove-x">✕</span>
                </button>
              )}

              {family && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => {
                    setFamily("");
                    setCurrentPage(1);
                  }}
                >
                  {family} <span className="remove-x">✕</span>
                </button>
              )}

              {selectedSize && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => {
                    setSelectedSize("");
                    setCurrentPage(1);
                  }}
                >
                  {selectedSize} <span className="remove-x">✕</span>
                </button>
              )}

              {maxPrice < globalMaxPrice && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => {
                    setMaxPrice(globalMaxPrice);
                    setCurrentPage(1);
                  }}
                >
                  Hasta {formatPrice(maxPrice)} <span className="remove-x">✕</span>
                </button>
              )}

              {search && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setCurrentPage(1);
                  }}
                >
                  "{search}" <span className="remove-x">✕</span>
                </button>
              )}

              {available && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => {
                    setAvailable(false);
                    setCurrentPage(1);
                  }}
                >
                  Disponibles <span className="remove-x">✕</span>
                </button>
              )}

              <button
                type="button"
                className="filter-clear-all"
                onClick={resetFilters}
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Contador de resultados */}
          <div className="result-count">
            {filtered.length > 0 ? (
              <>
                Mostrando <strong>{startIndex}–{endIndex}</strong> de{" "}
                <strong>{filtered.length}</strong> fragancias
                {totalPages > 1 && (
                  <span className="result-page-tag"> · Página {currentPage} de {totalPages}</span>
                )}
              </>
            ) : (
              "0 productos encontrados"
            )}
          </div>

          {paginatedProducts.length > 0 ? (
            <>
              {/* Grilla de productos (9 por página) */}
              <div className="product-grid catalog">
                {paginatedProducts.map((product) => {
                  const defaultVariant = product.variants[0];
                  const price = defaultVariant.price;
                  const discount = formatDiscount(price, product.oldPrice);
                  const productUrl = `/perfumes/${product.slug}`;

                  return (
                    <article className="product-card" key={product.id}>
                      <div className="product-photo">
                        {discount && (
                          <span className="sale-badge">{discount}</span>
                        )}
                        {product.recent && (
                          <span className="new-badge">Nuevo</span>
                        )}
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
                            // Pasamos el nombre real para el Toast
                            addToCart(
                              product.id,
                              defaultVariant.size,
                              1,
                              product.name,
                            );
                          }}
                          type="button"
                          aria-label={`Añadir ${product.name} al carrito`}
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
                          {product.oldPrice && (
                            <s>{formatPrice(product.oldPrice)}</s>
                          )}
                        </div>
                        <a className="detail-link" href={productUrl}>
                          Ver detalles <Icon name="arrow" size={16} />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <nav
                  className="pagination-container"
                  aria-label="Navegación de páginas del catálogo"
                >
                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage <= 1}
                      onClick={() => cambiarPagina(currentPage - 1)}
                      aria-label="Página anterior"
                    >
                      ← Anterior
                    </button>

                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                        (num) => (
                          <button
                            key={num}
                            type="button"
                            className={`pagination-num ${currentPage === num ? "active" : ""}`}
                            onClick={() => cambiarPagina(num)}
                            aria-label={`Ir a página ${num}`}
                            aria-current={currentPage === num ? "page" : undefined}
                          >
                            {num}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage >= totalPages}
                      onClick={() => cambiarPagina(currentPage + 1)}
                      aria-label="Página siguiente"
                    >
                      Siguiente →
                    </button>
                  </div>
                </nav>
              )}
            </>
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
