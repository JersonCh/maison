import { useMemo, useState } from "react";
import Icon from "./Icons";
import { Button, EmptyState, ProductCard, SectionTitle } from "./components";
import { categoryImages, heroImage, type Gender, type Product } from "./data";
import type { Route } from "./App";

type ShopActions = {
  products: Product[];
  viewProduct: (id: number) => void;
  addToCart: (id: number, size?: string, qty?: number) => void;
};

export function HomePage({ products, navigate, viewProduct, addToCart }: ShopActions & { navigate: (route: Route, gender?: string) => void }) {
  return (
    <main>
      <section className="hero">
        <img src={heroImage} alt="Perfume de lujo en una composición editorial oscura" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">Fragancias originales · Curaduría excepcional</p>
          <h1>Encuentra una fragancia<br />que hable por ti</h1>
          <p>Descubre aromas que trascienden el tiempo y convierten tu esencia en una firma inolvidable.</p>
          <Button onClick={() => navigate("catalog")}>Explorar perfumes <Icon name="arrow" /></Button>
        </div>
        <div className="hero-index"><span>01</span><i /><span>03</span></div>
      </section>

      <section className="category-section">
        <SectionTitle eyebrow="Encuentra tu esencia" title="Una fragancia para cada historia" copy="Colecciones elegidas para acompañar tu estilo, tu energía y cada uno de tus momentos." />
        <div className="category-grid">
          {(["Hombre", "Mujer", "Unisex"] as Gender[]).map((item) => (
            <button className="category-card" key={item} onClick={() => navigate("catalog", item)}>
              <img src={categoryImages[item]} alt={`Perfumes para ${item.toLowerCase()}`} />
              <span><small>Colección</small><strong>{item}</strong><i>Descubrir <Icon name="arrow" size={16} /></i></span>
            </button>
          ))}
        </div>
      </section>

      <section className="products-section">
        <div className="section-heading-row"><SectionTitle eyebrow="Selección Maison" title="Fragancias destacadas" /><button onClick={() => navigate("catalog")}>Ver toda la colección <Icon name="arrow" /></button></div>
        <div className="product-grid">{products.filter((p) => p.featured && p.active).map((product) => <ProductCard key={product.id} product={product} onDetail={() => viewProduct(product.id)} onAdd={() => addToCart(product.id)} />)}</div>
      </section>

      <section className="promo">
        <div className="promo-copy"><p>El arte de elegir bien</p><h2>Tu aroma habla<br />antes que tú</h2><span>Recibe asesoría personalizada y encuentra esa fragancia que realmente se siente tuya.</span><Button onClick={() => navigate("contact")} variant="outline">Hablar con un asesor <Icon name="arrow" /></Button></div>
        <div className="promo-image"><img src={categoryImages.Unisex} alt="Selección de perfumería nicho" /></div>
      </section>

      <section className="products-section new-section">
        <div className="section-heading-row"><SectionTitle eyebrow="Recién llegados" title="Nuevos ingresos" /><button onClick={() => navigate("catalog")}>Ver novedades <Icon name="arrow" /></button></div>
        <div className="product-grid four">{products.filter((p) => p.recent && p.active).map((product) => <ProductCard key={product.id} product={product} onDetail={() => viewProduct(product.id)} onAdd={() => addToCart(product.id)} />)}</div>
      </section>

      <section className="benefits">
        {[["01", "Atención personalizada", "Te escuchamos para recomendarte una fragancia según tu estilo y ocasión."], ["02", "Compra por WhatsApp", "Coordina tu pedido de forma directa, cercana y completamente segura."], ["03", "Curaduría experta", "Una selección de casas icónicas y perfumes con carácter excepcional."]].map((item) => <article key={item[0]}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p></article>)}
      </section>

      <section className="brand-story">
        <div className="story-monogram">M</div>
        <div><p className="eyebrow">Nuestra maison</p><h2>El perfume como<br />forma de expresión</h2></div>
        <div><p>Creemos que una fragancia no solo se lleva: se recuerda. En Maison des Parfums reunimos aromas con identidad para ayudarte a encontrar aquel que cuente tu historia.</p><button onClick={() => navigate("about")}>Conoce nuestra historia <Icon name="arrow" /></button></div>
      </section>
    </main>
  );
}

export function CatalogPage({ products, initialGender, viewProduct, addToCart }: ShopActions & { initialGender: string }) {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState(initialGender);
  const [brand, setBrand] = useState("");
  const [family, setFamily] = useState("");
  const [maxPrice, setMaxPrice] = useState(1500);
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const families = [...new Set(products.map((p) => p.family))].sort();
  const filtered = useMemo(() => {
    const result = products.filter((p) => p.active !== false && (!search || `${p.brand} ${p.name}`.toLowerCase().includes(search.toLowerCase())) && (!gender || p.gender === gender) && (!brand || p.brand === brand) && (!family || p.family === family) && p.variants[0].price <= maxPrice && (!available || p.stock > 0));
    if (sort === "low") result.sort((a, b) => a.variants[0].price - b.variants[0].price);
    if (sort === "high") result.sort((a, b) => b.variants[0].price - a.variants[0].price);
    if (sort === "recent") result.sort((a, b) => Number(b.recent) - Number(a.recent));
    return result;
  }, [products, search, gender, brand, family, maxPrice, available, sort]);
  const reset = () => { setSearch(""); setGender(""); setBrand(""); setFamily(""); setMaxPrice(1500); setAvailable(false); };
  return (
    <main className="catalog-page">
      <div className="catalog-intro"><p className="eyebrow">Colección Maison</p><h1>{gender ? `Perfumes para ${gender.toLowerCase()}` : "Todos los perfumes"}</h1><p>Explora nuestra selección de fragancias originales y encuentra el aroma que se convertirá en tu sello personal.</p></div>
      <div className="catalog-toolbar">
        <div className="catalog-search"><Icon name="search" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por perfume o marca" /></div>
        <button className="filter-mobile" onClick={() => setFiltersOpen(true)}><Icon name="filter" /> Filtros</button>
        <div className="sort"><span>Ordenar por</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="relevance">Relevancia</option><option value="low">Menor precio</option><option value="high">Mayor precio</option><option value="recent">Más recientes</option></select></div>
      </div>
      <div className="catalog-layout">
        <aside className={`filters ${filtersOpen ? "open" : ""}`}>
          <div className="filter-title"><strong>Filtros</strong><button onClick={reset}>Limpiar todo</button><button className="filter-close" onClick={() => setFiltersOpen(false)}><Icon name="close" /></button></div>
          <FilterSelect title="Género" value={gender} onChange={setGender} items={["Hombre", "Mujer", "Unisex"]} />
          <FilterSelect title="Marca" value={brand} onChange={setBrand} items={brands} />
          <FilterSelect title="Familia olfativa" value={family} onChange={setFamily} items={families} />
          <div className="filter-group"><label>Precio máximo <strong>S/ {maxPrice}</strong></label><input type="range" min="300" max="1500" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} /><div className="range-labels"><span>S/ 300</span><span>S/ 1,500</span></div></div>
          <div className="filter-group"><label>Presentación</label><div className="size-pills"><span>50 ml</span><span>100 ml</span></div></div>
          <label className="check-row"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /><span />Solo disponibles</label>
          <Button onClick={() => setFiltersOpen(false)} className="filter-apply">Ver {filtered.length} resultados</Button>
        </aside>
        {filtersOpen && <button className="filter-scrim" onClick={() => setFiltersOpen(false)} />}
        <div className="catalog-results"><div className="result-count">{filtered.length} productos</div>{filtered.length ? <div className="product-grid catalog">{filtered.map((product) => <ProductCard key={product.id} product={product} onDetail={() => viewProduct(product.id)} onAdd={() => addToCart(product.id)} />)}</div> : <EmptyState onReset={reset} />}</div>
      </div>
    </main>
  );
}

function FilterSelect({ title, value, onChange, items }: { title: string; value: string; onChange: (value: string) => void; items: string[] }) {
  return <div className="filter-group"><label>{title}</label><select value={value} onChange={(e) => onChange(e.target.value)}><option value="">Todos</option>{items.map((item) => <option key={item}>{item}</option>)}</select></div>;
}

export function DetailPage({ product, products, viewProduct, addToCart }: ShopActions & { product: Product }) {
  const [image, setImage] = useState(product.image);
  const [size, setSize] = useState(product.variants[0].size);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.size === size) || product.variants[0];
  const related = products.filter((p) => p.id !== product.id && (p.gender === product.gender || p.family === product.family)).slice(0, 4);
  return (
    <main className="detail-page">
      <div className="breadcrumbs">Inicio <span>/</span> Perfumes <span>/</span> {product.brand} <span>/</span> <b>{product.name}</b></div>
      <section className="detail-grid">
        <div className="gallery"><div className="thumbs">{product.gallery.map((item, i) => <button className={image === item ? "active" : ""} onClick={() => setImage(item)} key={`${item}-${i}`}><img src={item} alt="" /></button>)}</div><div className="main-image"><span>Original garantizado</span><img src={image} alt={`${product.brand} ${product.name}`} /></div></div>
        <div className="detail-copy">
          <p className="brand">{product.brand}</p><h1>{product.name}</h1><p className="detail-type">Eau de Parfum · {product.gender}</p>
          <div className="detail-price">S/ {variant.price.toLocaleString("es-PE")}</div>
          <p className="detail-description">{product.description}</p>
          <div className="stock"><i /><span>Disponible</span> · {product.stock} unidades</div>
          <div className="option-block"><div><label>Presentación</label><span>Selecciona una opción</span></div><div className="variant-pills">{product.variants.map((item) => <button key={item.size} className={size === item.size ? "active" : ""} onClick={() => setSize(item.size)}>{item.size}<small>S/ {item.price}</small></button>)}</div></div>
          <div className="purchase-row"><div className="qty large"><button onClick={() => setQty(Math.max(1, qty - 1))}><Icon name="minus" /></button><span>{qty}</span><button onClick={() => setQty(qty + 1)}><Icon name="plus" /></button></div><Button onClick={() => addToCart(product.id, size, qty)} className="full"><Icon name="bag" /> Añadir al carrito</Button></div>
          <Button variant="outline" className="full whatsapp-btn" onClick={() => window.alert(`Hola, deseo consultar por ${product.name} ${size}.`)}><Icon name="whatsapp" /> Consultar por WhatsApp</Button>
          <div className="detail-assurances"><span><Icon name="check" /> Producto original</span><span><Icon name="check" /> Asesoría personalizada</span></div>
        </div>
      </section>
      <section className="notes-section"><SectionTitle eyebrow="Composición" title="Notas olfativas" /><div className="notes-grid"><article><span>01</span><h3>Salida</h3><p>Bergamota, pimienta rosa y acordes cítricos.</p></article><article><span>02</span><h3>Corazón</h3><p>Jazmín, maderas nobles y especias envolventes.</p></article><article><span>03</span><h3>Fondo</h3><p>Ámbar, almizcle blanco y vainilla de Madagascar.</p></article></div></section>
      <section className="characteristics"><div><p className="eyebrow">El carácter</p><h2>Una estela que deja huella</h2><p>Creada para acompañar momentos especiales y elevar lo cotidiano con una presencia distinguida.</p></div><dl><div><dt>Familia olfativa</dt><dd>{product.family}</dd></div><div><dt>Concentración</dt><dd>Eau de Parfum</dd></div><div><dt>Ocasión</dt><dd>Día y noche</dd></div><div><dt>Procedencia</dt><dd>Importado</dd></div></dl></section>
      <section className="products-section related"><SectionTitle eyebrow="También te puede gustar" title="Descubre fragancias afines" /><div className="product-grid four">{related.map((item) => <ProductCard key={item.id} product={item} onDetail={() => viewProduct(item.id)} onAdd={() => addToCart(item.id)} />)}</div></section>
    </main>
  );
}

export function AboutPage({ navigate }: { navigate: (route: Route) => void }) {
  return <main className="editorial-page"><section className="editorial-hero"><p className="eyebrow">Nuestra historia</p><h1>El lujo de encontrar<br />tu propia esencia</h1><p>Maison des Parfums nace de una convicción: el perfume más especial no es el más conocido, sino el que se siente auténticamente tuyo.</p></section><section className="editorial-split"><img src={categoryImages.Unisex} alt="Curaduría de fragancias" /><div><SectionTitle eyebrow="Curaduría con propósito" title="Más que perfumes, memorias" /><p>Seleccionamos fragancias originales de casas reconocidas y propuestas de autor. Cada recomendación parte de escuchar tus gustos, entender tu estilo y acompañarte sin prisa.</p><p>Nuestra experiencia es cercana, informada y honesta. Porque elegir un perfume debería sentirse tan especial como usarlo.</p><Button onClick={() => navigate("contact")}>Conversa con nosotros <Icon name="arrow" /></Button></div></section></main>;
}

export function ContactPage() {
  return <main className="contact-page"><div><SectionTitle eyebrow="Estamos para ayudarte" title="Conversemos sobre tu próxima fragancia" copy="Solicita una recomendación, consulta disponibilidad o coordina tu pedido. No publicamos datos empresariales hasta que sean configurados." /><div className="contact-cards"><article><Icon name="whatsapp" /><h3>WhatsApp</h3><p>Número pendiente de configuración.</p><span>Respuesta personalizada</span></article><article><span className="at">@</span><h3>Redes sociales</h3><p>Perfiles pendientes de configuración.</p><span>Instagram · Facebook · TikTok</span></article></div></div><form className="contact-form" onSubmit={(e) => { e.preventDefault(); window.alert("Recibimos tu consulta de demostración."); }}><p>Déjanos tu consulta</p><label>Nombre<input required placeholder="Tu nombre" /></label><label>Correo o teléfono<input required placeholder="Tu contacto" /></label><label>¿Qué estás buscando?<select><option>Recomendación personalizada</option><option>Consultar un producto</option><option>Coordinar un pedido</option></select></label><label>Mensaje<textarea rows={4} placeholder="Cuéntanos qué tipo de fragancia te gusta..." /></label><Button type="submit">Enviar consulta <Icon name="arrow" /></Button></form></main>;
}

export function FaqPage() {
  const [open, setOpen] = useState(0);
  const faqs = [["¿Todos los perfumes son originales?", "Sí. La propuesta de Maison se basa en una selección de fragancias originales y procedencia verificable."], ["¿Cómo realizo mi pedido?", "Añade tus productos al carrito y envía el resumen por WhatsApp. Un asesor confirmará disponibilidad, entrega y forma de coordinación."], ["¿Hacen envíos a todo el Perú?", "La cobertura, costo y tiempos se coordinan directamente según la ubicación del cliente."], ["¿Puedo recibir asesoría para elegir?", "Claro. Puedes contarnos tus aromas favoritos, ocasión y presupuesto para recibir opciones personalizadas."], ["¿Qué métodos de pago aceptan?", "La tienda no procesa pagos online. Los métodos disponibles se informan y coordinan por WhatsApp."]];
  return <main className="faq-page"><SectionTitle eyebrow="Ayuda Maison" title="Preguntas frecuentes" copy="Todo lo que necesitas saber antes de elegir tu próxima fragancia." /><div className="faq-list">{faqs.map((faq, index) => <article key={faq[0]} className={open === index ? "open" : ""}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{faq[0]}</strong><Icon name={open === index ? "minus" : "plus"} /></button><p>{faq[1]}</p></article>)}</div></main>;
}

export function AdminPage({ products, setProducts, exit }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; exit: () => void }) {
  const [logged, setLogged] = useState(false);
  const [section, setSection] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [saved, setSaved] = useState("");
  if (!logged) return <main className="admin-login"><div className="login-brand"><img src="/assets/maison-logo.jpeg" alt="Maison des Parfums" /><p>Gestión de boutique</p></div><form onSubmit={(e) => { e.preventDefault(); setLogged(true); }}><span>Acceso administrativo</span><h1>Bienvenido</h1><p>Ingresa al panel demostrativo para gestionar el catálogo.</p><label>Correo<input type="email" defaultValue="admin@maison.pe" /></label><label>Contraseña<input type="password" defaultValue="demo1234" /></label><Button type="submit" className="full">Ingresar al panel</Button><small>Demo: utiliza cualquier credencial</small><button type="button" onClick={exit}>← Volver a la tienda</button></form></main>;
  const visible = products.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(search.toLowerCase()));
  const saveProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setProducts((all) => all.some((p) => p.id === editing.id) ? all.map((p) => p.id === editing.id ? editing : p) : [editing, ...all]);
    setEditing(null);
    setSaved("Cambios guardados correctamente");
    window.setTimeout(() => setSaved(""), 2500);
  };
  const menu = [["dashboard", "Inicio"], ["products", "Productos"], ["brands", "Marcas y categorías"], ["banners", "Banners y destacados"], ["settings", "Configuración"]];
  return <main className="admin-shell">
    <aside className="admin-sidebar"><img src="/assets/maison-logo.jpeg" alt="" /><span>Panel administrativo</span><nav>{menu.map((item) => <button className={section === item[0] ? "active" : ""} key={item[0]} onClick={() => setSection(item[0])}><i />{item[1]}</button>)}</nav><button className="exit-admin" onClick={exit}><Icon name="arrow" /> Ver tienda</button></aside>
    <section className="admin-content">
      <header><div><p>Maison des Parfums</p><h1>{menu.find((item) => item[0] === section)?.[1]}</h1></div><div className="admin-user"><span>AD</span><p>Administrador<small>Cuenta demo</small></p></div></header>
      {section === "dashboard" && <><div className="stat-grid"><Stat label="Total productos" value={products.length} note="+4 este mes" /><Stat label="Categorías" value={3} note="Hombre, Mujer, Unisex" /><Stat label="Marcas" value={new Set(products.map((p) => p.brand)).size} note="Catálogo activo" /><Stat label="Disponibles" value={products.filter((p) => p.active).length} note={`${products.filter((p) => !p.active).length} desactivados`} /></div><div className="admin-panels"><article><div className="panel-head"><h2>Productos recientes</h2><button onClick={() => setSection("products")}>Ver todos</button></div>{products.slice(0, 5).map((p) => <div className="mini-product" key={p.id}><img src={p.image} alt="" /><span><b>{p.name}</b><small>{p.brand}</small></span><strong>S/ {p.variants[0].price}</strong><i className={p.active ? "on" : ""}>{p.active ? "Activo" : "Inactivo"}</i></div>)}</article><article className="stock-panel"><div className="panel-head"><h2>Resumen de stock</h2></div><div className="stock-visual"><span>{products.reduce((s, p) => s + p.stock, 0)}</span><small>unidades</small></div><p><i />Stock saludable <strong>84%</strong></p><p><i />Stock bajo <strong>16%</strong></p></article></div></>}
      {section === "products" && <div className="products-admin"><div className="admin-tools"><div className="catalog-search"><Icon name="search" /><input placeholder="Buscar producto o marca" value={search} onChange={(e) => setSearch(e.target.value)} /></div><Button onClick={() => setEditing({ ...products[0], id: Date.now(), name: "", brand: "", image: products[0].image })}><Icon name="plus" /> Nuevo producto</Button></div><div className="admin-table"><div className="table-row table-head"><span>Producto</span><span>Categoría</span><span>Precio</span><span>Stock</span><span>Estado</span><span>Acciones</span></div>{visible.map((p) => <div className="table-row" key={p.id}><span className="table-product"><img src={p.image} alt="" /><b>{p.name}<small>{p.brand}</small></b></span><span>{p.gender}</span><span>S/ {p.variants[0].price}</span><span>{p.stock} uds.</span><span><i className={p.active ? "status-on" : "status-off"}>{p.active ? "Activo" : "Inactivo"}</i></span><span className="table-actions"><button onClick={() => setEditing(p)}><Icon name="edit" /></button><button onClick={() => setProducts((all) => all.map((item) => item.id === p.id ? { ...item, active: !item.active } : item))}><Icon name="eye" /></button><button onClick={() => confirm("¿Eliminar este producto?") && setProducts((all) => all.filter((item) => item.id !== p.id))}><Icon name="trash" /></button></span></div>)}</div></div>}
      {section === "brands" && <AdminPlaceholder title="Marcas y categorías" text="Organiza las casas de perfumería y las colecciones visibles en la tienda." items={[...new Set(products.map((p) => p.brand))].slice(0, 8)} />}
      {section === "banners" && <AdminPlaceholder title="Banners y destacados" text="Gestiona el orden visual de promociones, novedades y productos destacados." items={["Hero principal — Activo", "Asesoría personalizada — Activo", "Nuevos ingresos — Activo"]} />}
      {section === "settings" && <Settings />}
    </section>
    {editing && <div className="admin-modal"><form onSubmit={saveProduct}><div className="modal-head"><div><small>Catálogo</small><h2>{products.some((p) => p.id === editing.id) ? "Editar producto" : "Crear producto"}</h2></div><button type="button" onClick={() => setEditing(null)}><Icon name="close" /></button></div><div className="form-grid"><label>Nombre<input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label><label>Marca<input required value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} /></label><label>Categoría<select value={editing.gender} onChange={(e) => setEditing({ ...editing, gender: e.target.value as Gender })}><option>Hombre</option><option>Mujer</option><option>Unisex</option></select></label><label>Familia olfativa<input value={editing.family} onChange={(e) => setEditing({ ...editing, family: e.target.value })} /></label><label>Precio 50 ml<input type="number" value={editing.variants[0].price} onChange={(e) => setEditing({ ...editing, variants: [{ ...editing.variants[0], price: Number(e.target.value) }, ...editing.variants.slice(1)] })} /></label><label>Stock<input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></label><label className="full-field">Descripción<textarea rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label><label className="check-row full-field"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /><span />Producto activo</label></div><div className="modal-actions"><Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit">Guardar producto</Button></div></form></div>}
    {saved && <div className="toast"><Icon name="check" />{saved}</div>}
  </main>;
}

function Stat({ label, value, note }: { label: string; value: number; note: string }) { return <article className="stat-card"><p>{label}</p><strong>{value}</strong><span>{note}</span></article>; }
function AdminPlaceholder({ title, text, items }: { title: string; text: string; items: string[] }) { return <div className="admin-placeholder"><SectionTitle eyebrow="Administración" title={title} copy={text} /><div>{items.map((item) => <article key={item}><span>{item.slice(0, 2).toUpperCase()}</span><strong>{item}</strong><button>Gestionar <Icon name="arrow" /></button></article>)}</div></div>; }
function Settings() {
  const [phone, setPhone] = useState(localStorage.getItem("maison-whatsapp") || "");
  return <div className="settings-card"><SectionTitle eyebrow="Canales de atención" title="Configuración comercial" copy="Completa estos datos antes de publicar. No incluimos información empresarial inventada." /><label>Número de WhatsApp<input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="Ej. 51999999999" /></label><label>Instagram<input placeholder="@usuario" /></label><label>Facebook<input placeholder="URL del perfil" /></label><label>Horario comercial<input placeholder="Ej. Lunes a sábado..." /></label><Button onClick={() => { localStorage.setItem("maison-whatsapp", phone); window.alert("Configuración guardada."); }}>Guardar configuración</Button></div>;
}
