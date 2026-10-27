import { useState, useEffect } from "react";
import type { Product, Gender } from "@/types/product";
import Icon from "@/components/ui/Icon";

interface Props {
  initialProducts: Product[];
}

export default function AdminDashboard({ initialProducts }: Props) {
  const [logged, setLogged] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [section, setSection] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [saved, setSaved] = useState("");

  if (!logged) {
    return (
      <main className="admin-login">
        <div className="login-brand">
          <img src="/assets/maison-logo.jpeg" alt="Maison des Parfums" />
          <p>Gestión de boutique</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLogged(true);
          }}
        >
          <span>Acceso administrativo</span>
          <h1>Bienvenido</h1>
          <p>Ingresa al panel demostrativo para gestionar el catálogo.</p>
          <label>
            Correo
            <input type="email" defaultValue="admin@maison.pe" />
          </label>
          <label>
            Contraseña
            <input type="password" defaultValue="demo1234" />
          </label>
          <button type="submit" className="btn btn-gold full">
            Ingresar al panel
          </button>
          <small>Demo: utiliza cualquier credencial</small>
          <a href="/" style={{ color: "var(--champagne)", textAlign: "center", textDecoration: "none" }}>
            ← Volver a la tienda
          </a>
        </form>
      </main>
    );
  }

  const visible = products.filter((p) =>
    `${p.brand} ${p.name}`.toLowerCase().includes(search.toLowerCase()),
  );

  const saveProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setProducts((all) =>
      all.some((p) => p.id === editing.id)
        ? all.map((p) => (p.id === editing.id ? editing : p))
        : [editing, ...all],
    );
    setEditing(null);
    setSaved("Cambios guardados correctamente");
    window.setTimeout(() => setSaved(""), 2500);
  };

  const menu = [
    ["dashboard", "Inicio"],
    ["products", "Productos"],
    ["brands", "Marcas y categorías"],
    ["banners", "Banners y destacados"],
    ["settings", "Configuración"],
  ];

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <img src="/assets/maison-logo.jpeg" alt="" />
        <span>Panel administrativo</span>
        <nav>
          {menu.map((item) => (
            <button
              className={section === item[0] ? "active" : ""}
              key={item[0]}
              onClick={() => setSection(item[0])}
              type="button"
            >
              <i />
              {item[1]}
            </button>
          ))}
        </nav>
        <a href="/" className="exit-admin" style={{ textDecoration: "none" }}>
          <Icon name="arrow" /> Ver tienda
        </a>
      </aside>

      <section className="admin-content">
        <header>
          <div>
            <p>Maison des Parfums</p>
            <h1>{menu.find((item) => item[0] === section)?.[1]}</h1>
          </div>
          <div className="admin-user">
            <span>AD</span>
            <p>
              Administrador<small>Cuenta demo</small>
            </p>
          </div>
        </header>

        {section === "dashboard" && (
          <>
            <div className="stat-grid">
              <Stat label="Total productos" value={products.length} note="+4 este mes" />
              <Stat label="Categorías" value={3} note="Hombre, Mujer, Unisex" />
              <Stat
                label="Marcas"
                value={new Set(products.map((p) => p.brand)).size}
                note="Catálogo activo"
              />
              <Stat
                label="Disponibles"
                value={products.filter((p) => p.active).length}
                note={`${products.filter((p) => !p.active).length} desactivados`}
              />
            </div>

            <div className="admin-panels">
              <article>
                <div className="panel-head">
                  <h2>Productos recientes</h2>
                  <button onClick={() => setSection("products")} type="button">
                    Ver todos
                  </button>
                </div>
                {products.slice(0, 5).map((p) => (
                  <div className="mini-product" key={p.id}>
                    <img src={p.image} alt="" />
                    <span>
                      <b>{p.name}</b>
                      <small>{p.brand}</small>
                    </span>
                    <strong>S/ {p.variants[0].price}</strong>
                    <i className={p.active ? "on" : ""}>
                      {p.active ? "Activo" : "Inactivo"}
                    </i>
                  </div>
                ))}
              </article>

              <article className="stock-panel">
                <div className="panel-head">
                  <h2>Resumen de stock</h2>
                </div>
                <div className="stock-visual">
                  <span>{products.reduce((s, p) => s + p.stock, 0)}</span>
                  <small>unidades</small>
                </div>
                <p>
                  <i />
                  Stock saludable <strong>84%</strong>
                </p>
                <p>
                  <i />
                  Stock bajo <strong>16%</strong>
                </p>
              </article>
            </div>
          </>
        )}

        {section === "products" && (
          <div className="products-admin">
            <div className="admin-tools">
              <div className="catalog-search">
                <Icon name="search" />
                <input
                  placeholder="Buscar producto o marca"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() =>
                  setEditing({
                    ...products[0],
                    id: Date.now(),
                    name: "",
                    brand: "",
                    slug: `nuevo-${Date.now()}`,
                    image: products[0].image,
                  })
                }
              >
                <Icon name="plus" /> Nuevo producto
              </button>
            </div>

            <div className="admin-table">
              <div className="table-row table-head">
                <span>Producto</span>
                <span>Categoría</span>
                <span>Precio</span>
                <span>Stock</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {visible.map((p) => (
                <div className="table-row" key={p.id}>
                  <span className="table-product">
                    <img src={p.image} alt="" />
                    <b>
                      {p.name}
                      <small>{p.brand}</small>
                    </b>
                  </span>
                  <span>{p.gender}</span>
                  <span>S/ {p.variants[0].price}</span>
                  <span>{p.stock} uds.</span>
                  <span>
                    <i className={p.active ? "status-on" : "status-off"}>
                      {p.active ? "Activo" : "Inactivo"}
                    </i>
                  </span>
                  <span className="table-actions">
                    <button
                      onClick={() => setEditing(p)}
                      aria-label="Editar"
                      type="button"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      onClick={() =>
                        setProducts((all) =>
                          all.map((item) =>
                            item.id === p.id ? { ...item, active: !item.active } : item,
                          ),
                        )
                      }
                      aria-label="Alternar visibilidad"
                      type="button"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar este producto?")) {
                          setProducts((all) => all.filter((item) => item.id !== p.id));
                        }
                      }}
                      aria-label="Eliminar"
                      type="button"
                    >
                      <Icon name="trash" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === "brands" && (
          <div className="admin-placeholder">
            <header>
              <small className="eyebrow">Administración</small>
              <h2>Marcas y categorías</h2>
              <p>Organiza las casas de perfumería y las colecciones visibles en la tienda.</p>
            </header>
            <div>
              {[...new Set(products.map((p) => p.brand))].slice(0, 8).map((item) => (
                <article key={item}>
                  <span>{item.slice(0, 2).toUpperCase()}</span>
                  <strong>{item}</strong>
                  <button type="button">
                    Gestionar <Icon name="arrow" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {section === "banners" && (
          <div className="admin-placeholder">
            <header>
              <small className="eyebrow">Administración</small>
              <h2>Banners y destacados</h2>
              <p>Gestiona el orden visual de promociones, novedades y productos destacados.</p>
            </header>
            <div>
              {[
                "Hero principal — Activo",
                "Asesoría personalizada — Activo",
                "Nuevos ingresos — Activo",
              ].map((item) => (
                <article key={item}>
                  <span>{item.slice(0, 2).toUpperCase()}</span>
                  <strong>{item}</strong>
                  <button type="button">
                    Gestionar <Icon name="arrow" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {section === "settings" && <SettingsSection />}
      </section>

      {editing && (
        <div className="admin-modal">
          <form onSubmit={saveProduct}>
            <div className="modal-head">
              <div>
                <small>Catálogo</small>
                <h2>
                  {products.some((p) => p.id === editing.id)
                    ? "Editar producto"
                    : "Crear producto"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Cerrar modal"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="form-grid">
              <label>
                Nombre
                <input
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </label>
              <label>
                Marca
                <input
                  required
                  value={editing.brand}
                  onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                />
              </label>
              <label>
                Categoría
                <select
                  value={editing.gender}
                  onChange={(e) =>
                    setEditing({ ...editing, gender: e.target.value as Gender })
                  }
                >
                  <option>Hombre</option>
                  <option>Mujer</option>
                  <option>Unisex</option>
                </select>
              </label>
              <label>
                Familia olfativa
                <input
                  value={editing.family}
                  onChange={(e) => setEditing({ ...editing, family: e.target.value })}
                />
              </label>
              <label>
                Precio 50 ml
                <input
                  type="number"
                  value={editing.variants[0].price}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      variants: [
                        { ...editing.variants[0], price: Number(e.target.value) },
                        ...editing.variants.slice(1),
                      ],
                    })
                  }
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  value={editing.stock}
                  onChange={(e) =>
                    setEditing({ ...editing, stock: Number(e.target.value) })
                  }
                />
              </label>
              <label className="full-field">
                Descripción
                <textarea
                  rows={4}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </label>
              <label className="check-row full-field">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) =>
                    setEditing({ ...editing, active: e.target.checked })
                  }
                />
                <span />
                Producto activo
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-gold">
                Guardar producto
              </button>
            </div>
          </form>
        </div>
      )}

      {saved && (
        <div className="toast">
          <Icon name="check" /> {saved}
        </div>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  );
}

function SettingsSection() {
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [horario, setHorario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar configuración real desde Cloudflare D1 al montar
  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const respuesta = await fetch("/api/config");
        if (respuesta.ok) {
          const datos = await respuesta.json();
          if (datos.whatsapp_pedidos) setPhone(datos.whatsapp_pedidos);
          if (datos.instagram_url) setInstagram(datos.instagram_url);
          if (datos.facebook_url) setFacebook(datos.facebook_url);
          if (datos.horario_comercial) setHorario(datos.horario_comercial);
        }
      } catch (error) {
        console.error("Error al cargar configuración de D1:", error);
      }
    }
    cargarConfiguracion();
  }, []);

  const guardarCambios = async () => {
    setGuardando(true);
    setMensaje("");
    try {
      const cargaUtil = {
        whatsapp_pedidos: phone,
        instagram_url: instagram,
        facebook_url: facebook,
        horario_comercial: horario,
      };

      const respuesta = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cargaUtil),
      });

      if (respuesta.ok) {
        // También guardar en localStorage para respaldo instantáneo en el navegador
        localStorage.setItem("maison-whatsapp", phone);
        setMensaje("✓ Configuración guardada correctamente en Cloudflare D1.");
      } else {
        setMensaje("⚠ Error al guardar en la base de datos.");
      }
    } catch (error) {
      setMensaje("⚠ Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(""), 3500);
    }
  };

  return (
    <div className="settings-card">
      <header>
        <small className="eyebrow">Canales de atención</small>
        <h2>Configuración comercial</h2>
        <p>Configura el número oficial de WhatsApp y canales de la tienda (Persistido en D1).</p>
      </header>

      <label>
        Número de WhatsApp
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          placeholder="Ej. 51999999999"
        />
      </label>

      <label>
        Instagram
        <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="URL o @usuario de Instagram"
        />
      </label>

      <label>
        Facebook
        <input
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="URL del perfil de Facebook"
        />
      </label>

      <label>
        Horario comercial
        <input
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          placeholder="Ej. Lunes a sábado · 10:00 am - 8:00 pm"
        />
      </label>

      <button
        type="button"
        className="btn btn-gold"
        onClick={guardarCambios}
        disabled={guardando}
      >
        {guardando ? "Guardando en D1..." : "Guardar configuración"}
      </button>

      {mensaje && (
        <p style={{ marginTop: "1rem", color: "var(--gold)", fontWeight: 500 }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
