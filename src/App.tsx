import { useEffect, useMemo, useState } from "react";
import Icon from "./Icons";
import { Button } from "./components";
import { initialProducts, type Product } from "./data";
import { AboutPage, AdminPage, CatalogPage, ContactPage, DetailPage, FaqPage, HomePage } from "./pages";

export type Route = "home" | "catalog" | "detail" | "about" | "contact" | "faq" | "admin";
export type CartItem = { id: number; size: string; qty: number };

const nav: { label: string; route: Route; gender?: string }[] = [
  { label: "Inicio", route: "home" },
  { label: "Perfumes", route: "catalog" },
  { label: "Hombre", route: "catalog", gender: "Hombre" },
  { label: "Mujer", route: "catalog", gender: "Mujer" },
  { label: "Unisex", route: "catalog", gender: "Unisex" },
  { label: "Nosotros", route: "about" },
  { label: "Contacto", route: "contact" },
];

export default function App() {
  const [route, setRoute] = useState<Route>("home");
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("maison-products");
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [selectedId, setSelectedId] = useState(1);
  const [gender, setGender] = useState("");
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("maison-cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    document.title = "Maison des Parfums | Perfumería en Perú";
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = "Perfumería premium con fragancias para hombre, mujer y unisex. Atención y pedidos personalizados por WhatsApp.";
  }, []);
  useEffect(() => localStorage.setItem("maison-cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("maison-products", JSON.stringify(products)), [products]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  }, [route, selectedId]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (next: Route, nextGender = "") => {
    setGender(nextGender);
    setRoute(next);
  };
  const viewProduct = (id: number) => {
    setSelectedId(id);
    setRoute("detail");
  };
  const addToCart = (id: number, size?: string, qty = 1) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const finalSize = size || product.variants[0].size;
    setCart((current) => {
      const match = current.find((item) => item.id === id && item.size === finalSize);
      return match
        ? current.map((item) => item === match ? { ...item, qty: item.qty + qty } : item)
        : [...current, { id, size: finalSize, qty }];
    });
    setToast(`${product.name} se añadió al carrito`);
  };
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const suggestions = useMemo(
    () => products.filter((product) => `${product.brand} ${product.name}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6),
    [products, query],
  );

  return (
    <div className="app-shell">
      {route !== "admin" && (
        <>
          <div className="announcement">Envíos coordinados a todo el Perú <span /> Asesoría personalizada por WhatsApp</div>
          <header className="site-header">
            <button className="mobile-icon" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><Icon name="menu" /></button>
            <button className="logo-button" onClick={() => navigate("home")} aria-label="Ir al inicio">
              <img src="/assets/maison-logo.jpeg" alt="Maison des Parfums" />
            </button>
            <nav>
              {nav.map((item) => (
                <button key={item.label} className={route === item.route && gender === (item.gender || "") ? "active" : ""} onClick={() => navigate(item.route, item.gender)}>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="header-actions">
              <button onClick={() => setSearchOpen(true)} aria-label="Buscar"><Icon name="search" /></button>
              <button className="user-action" onClick={() => navigate("admin")} aria-label="Panel administrativo"><Icon name="user" /></button>
              <button className="bag-action" onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
                <Icon name="bag" /><span>{cartCount}</span>
              </button>
            </div>
          </header>
        </>
      )}

      {route === "home" && <HomePage products={products} navigate={navigate} viewProduct={viewProduct} addToCart={addToCart} />}
      {route === "catalog" && <CatalogPage products={products} initialGender={gender} viewProduct={viewProduct} addToCart={addToCart} />}
      {route === "detail" && <DetailPage product={products.find((p) => p.id === selectedId) || products[0]} products={products} viewProduct={viewProduct} addToCart={addToCart} />}
      {route === "about" && <AboutPage navigate={navigate} />}
      {route === "contact" && <ContactPage />}
      {route === "faq" && <FaqPage />}
      {route === "admin" && <AdminPage products={products} setProducts={setProducts} exit={() => navigate("home")} />}

      {route !== "admin" && <Footer navigate={navigate} />}

      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div className="drawer-top">
          <img src="/assets/maison-logo.jpeg" alt="" />
          <button onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><Icon name="close" /></button>
        </div>
        {nav.map((item) => <button key={item.label} onClick={() => navigate(item.route, item.gender)}>{item.label}<Icon name="arrow" /></button>)}
        <button onClick={() => navigate("faq")}>Preguntas frecuentes<Icon name="arrow" /></button>
        <button onClick={() => navigate("admin")}>Acceso administrativo<Icon name="arrow" /></button>
      </div>
      {(menuOpen || cartOpen || searchOpen) && <button className="scrim" onClick={() => { setMenuOpen(false); setCartOpen(false); setSearchOpen(false); }} aria-label="Cerrar panel" />}

      <CartDrawer open={cartOpen} close={() => setCartOpen(false)} cart={cart} setCart={setCart} products={products} />

      <div className={`search-panel ${searchOpen ? "open" : ""}`}>
        <div className="search-heading">
          <span>Buscar en Maison</span>
          <button onClick={() => setSearchOpen(false)} aria-label="Cerrar búsqueda"><Icon name="close" /></button>
        </div>
        <div className="search-field"><Icon name="search" /><input autoFocus={searchOpen} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca por nombre o marca..." /></div>
        {query && (
          <div className="suggestions">
            <p>{suggestions.length} sugerencias</p>
            {suggestions.map((product) => (
              <button key={product.id} onClick={() => { viewProduct(product.id); setSearchOpen(false); setQuery(""); }}>
                <img src={product.image} alt="" />
                <span><small>{product.brand}</small>{product.name}</span>
                <strong>S/ {product.variants[0].price}</strong>
              </button>
            ))}
            {!suggestions.length && <div className="no-suggestion">Sin coincidencias. Prueba con otra búsqueda.</div>}
          </div>
        )}
      </div>
      {toast && <div className="toast"><Icon name="check" />{toast}</div>}
    </div>
  );
}

function CartDrawer({
  open, close, cart, setCart, products,
}: {
  open: boolean; close: () => void; cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; products: Product[];
}) {
  const lines = cart.map((item) => {
    const product = products.find((p) => p.id === item.id)!;
    const variant = product?.variants.find((v) => v.size === item.size);
    return { ...item, product, price: variant?.price || 0 };
  }).filter((line) => line.product);
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const update = (item: CartItem, delta: number) => setCart((current) => current.map((row) => row === item ? { ...row, qty: Math.max(1, row.qty + delta) } : row));
  const remove = (item: CartItem) => setCart((current) => current.filter((row) => row !== item));
  const message = `Hola Maison des Parfums, deseo solicitar:%0A${lines.map((line) => `• ${line.product.name} — ${line.size} x${line.qty} — S/ ${line.price * line.qty}`).join("%0A")}%0A%0ATotal: S/ ${total}`;
  const send = () => {
    const whatsapp = localStorage.getItem("maison-whatsapp");
    if (whatsapp) window.open(`https://wa.me/${whatsapp}?text=${message}`, "_blank");
    else window.alert(decodeURIComponent(message) + "\n\nConfigura el número desde el panel administrativo.");
  };
  return (
    <aside className={`cart-drawer ${open ? "open" : ""}`}>
      <div className="cart-head"><div><small>Tu selección</small><h2>Carrito <span>({cart.reduce((s, i) => s + i.qty, 0)})</span></h2></div><button onClick={close}><Icon name="close" /></button></div>
      {!lines.length ? (
        <div className="empty-cart"><Icon name="bag" size={42} /><h3>Tu carrito está vacío</h3><p>Descubre aromas que harán inolvidable cada momento.</p><Button onClick={close}>Explorar perfumes</Button></div>
      ) : (
        <>
          <div className="cart-lines">
            {lines.map((line) => (
              <article key={`${line.id}-${line.size}`}>
                <img src={line.product.image} alt="" />
                <div><small>{line.product.brand}</small><h3>{line.product.name}</h3><p>{line.size}</p>
                  <div className="cart-line-bottom">
                    <div className="qty"><button onClick={() => update(cart.find((i) => i.id === line.id && i.size === line.size)!, -1)}><Icon name="minus" size={14} /></button><span>{line.qty}</span><button onClick={() => update(cart.find((i) => i.id === line.id && i.size === line.size)!, 1)}><Icon name="plus" size={14} /></button></div>
                    <strong>S/ {line.price * line.qty}</strong>
                  </div>
                </div>
                <button className="remove" onClick={() => remove(cart.find((i) => i.id === line.id && i.size === line.size)!)} aria-label="Eliminar"><Icon name="trash" size={17} /></button>
              </article>
            ))}
          </div>
          <div className="cart-summary">
            <div><span>Subtotal</span><strong>S/ {total.toLocaleString("es-PE")}</strong></div>
            <p>El costo de envío se coordina por WhatsApp.</p>
            <Button onClick={send} className="full"><Icon name="whatsapp" /> Enviar pedido por WhatsApp</Button>
            <button className="continue-link" onClick={close}>Seguir comprando</button>
          </div>
        </>
      )}
    </aside>
  );
}

function Footer({ navigate }: { navigate: (route: Route, gender?: string) => void }) {
  return (
    <footer>
      <div className="footer-main">
        <div className="footer-brand"><img src="/assets/maison-logo.jpeg" alt="Maison des Parfums" /><p>Fragancias originales seleccionadas para convertir cada presencia en un recuerdo.</p><div className="socials"><span>IG</span><span>FB</span><span>TT</span></div></div>
        <div><h3>Explora</h3><button onClick={() => navigate("catalog")}>Todos los perfumes</button><button onClick={() => navigate("catalog", "Hombre")}>Hombre</button><button onClick={() => navigate("catalog", "Mujer")}>Mujer</button><button onClick={() => navigate("catalog", "Unisex")}>Unisex</button></div>
        <div><h3>Maison</h3><button onClick={() => navigate("about")}>Nosotros</button><button onClick={() => navigate("contact")}>Contacto</button><button onClick={() => navigate("faq")}>Preguntas frecuentes</button><button onClick={() => navigate("admin")}>Administración</button></div>
        <div><h3>Atención</h3><p>Escríbenos por WhatsApp</p><p>Lunes a sábado<br />Horario configurable</p><p>Perú</p></div>
      </div>
      <div className="footer-bottom"><span>© 2025 Maison des Parfums</span><span>Experiencia de compra por WhatsApp · Sin pagos online</span></div>
    </footer>
  );
}
