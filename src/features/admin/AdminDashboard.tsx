import { useState, useEffect, useCallback } from "react";
import type {
  ProductoAdminItem,
  MarcaItem,
  FamiliaOlfativaItem,
} from "@/types/database";
import Icon from "@/components/ui/Icon";
import ProductTable from "./ProductTable";
import ProductFormModal from "./ProductFormModal";

interface Props {
  initialProducts?: any[];
}

export default function AdminDashboard({}: Props) {
  const [logged, setLogged] = useState(false);
  const [section, setSection] = useState("dashboard");
  const [cargando, setCargando] = useState(false);

  // Datos en vivo desde Cloudflare D1
  const [productos, setProductos] = useState<ProductoAdminItem[]>([]);
  const [marcas, setMarcas] = useState<MarcaItem[]>([]);
  const [familias, setFamilias] = useState<FamiliaOlfativaItem[]>([]);

  // Estados del modal de producto
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState<ProductoAdminItem | null>(null);

  // Notificación tipo toast
  const [toastMensaje, setToastMensaje] = useState("");

  const mostrarToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    window.setTimeout(() => setToastMensaje(""), 3500);
  };

  // Cargar metadatos (marcas y familias olfativas) desde Cloudflare D1
  const cargarMetadatos = useCallback(async () => {
    try {
      const resp = await fetch("/api/admin/metadata");
      if (resp.ok) {
        const datos = await resp.json();
        if (datos.marcas) setMarcas(datos.marcas);
        if (datos.familias) setFamilias(datos.familias);
      }
    } catch (error) {
      console.error("Error al cargar metadatos de D1:", error);
    }
  }, []);

  // Cargar lista completa de productos desde Cloudflare D1
  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const resp = await fetch("/api/admin/products");
      if (resp.ok) {
        const lista = await resp.json();
        setProductos(lista);
      }
    } catch (error) {
      console.error("Error al cargar productos de D1:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (logged) {
      cargarMetadatos();
      cargarProductos();
    }
  }, [logged, cargarMetadatos, cargarProductos]);

  // Manejadores de acciones del CRUD
  const manejarAbrirCreacion = () => {
    setProductoEnEdicion(null);
    setModalAbierto(true);
  };

  const manejarAbrirEdicion = (producto: ProductoAdminItem) => {
    setProductoEnEdicion(producto);
    setModalAbierto(true);
  };

  const manejarAlternarVisibilidad = async (id: number, actualActivo: boolean) => {
    try {
      const nuevoEstado = !actualActivo;
      const resp = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, activo: nuevoEstado }),
      });

      if (resp.ok) {
        setProductos((prev) =>
          prev.map((item) => (item.id === id ? { ...item, activo: nuevoEstado } : item)),
        );
        mostrarToast(
          nuevoEstado
            ? "✓ Fragancia activada en el catálogo."
            : "✓ Fragancia cambiada a borrador (inactiva).",
        );
      } else {
        mostrarToast("⚠ No se pudo actualizar el estado de la fragancia.");
      }
    } catch (error) {
      mostrarToast("⚠ Error de conexión al actualizar estado.");
    }
  };

  const manejarEliminarOArchivar = async (id: number, nombre: string) => {
    const confirmar = window.confirm(
      `¿Deseas retirar "${nombre}" del catálogo oficial?\nSi el perfume tiene historial de pedidos, se archivará automáticamente para preservar los registros.`,
    );

    if (!confirmar) return;

    try {
      const resp = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      const resultado = await resp.json();

      if (resp.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== id));
        mostrarToast(`✓ ${resultado.mensaje || "Producto retirado correctamente."}`);
      } else {
        mostrarToast(`⚠ ${resultado.error || "Error al retirar el producto."}`);
      }
    } catch (error) {
      mostrarToast("⚠ Error de comunicación con el servidor.");
    }
  };

  // Pantalla de acceso / login
  if (!logged) {
    return (
      <main className="admin-login">
        <div className="login-brand">
          <img src="/assets/maison-logo.jpeg" alt="Maison des Parfums" />
          <p>Gestión de la tienda</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLogged(true);
          }}
        >
          <span>Acceso administrativo</span>
          <h1>Bienvenido</h1>
          <p>Ingresa al panel de administración de Maison des Parfums.</p>
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
          <small>Credenciales administrativas oficiales</small>
          <a
            href="/"
            style={{
              color: "var(--champagne)",
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            ← Volver a la tienda
          </a>
        </form>
      </main>
    );
  }

  const menu = [
    ["dashboard", "Inicio"],
    ["products", "Productos y Catálogo"],
    ["brands", "Marcas y Familias"],
    ["banners", "Banners y Carruseles"],
    ["settings", "Configuración Comercial"],
  ];

  return (
    <main className="admin-shell">
      {/* BARRA LATERAL */}
      <aside className="admin-sidebar">
        <img src="/assets/maison-logo.jpeg" alt="Maison des Parfums" />
        <span>Panel Administrativo</span>
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

      {/* CONTENIDO PRINCIPAL */}
      <section className="admin-content">
        <header>
          <div>
            <p>Maison des Parfums · Panel de Control</p>
            <h1>{menu.find((item) => item[0] === section)?.[1]}</h1>
          </div>
          <div className="admin-user">
            <span>AD</span>
            <p>
              Administrador<small>Maison des Parfums</small>
            </p>
          </div>
        </header>

        {/* 1. SECCIÓN DASHBOARD */}
        {section === "dashboard" && (
          <>
            <div className="stat-grid">
              <Stat
                label="Total perfumes"
                value={productos.length}
                note={`${productos.filter((p) => p.activo).length} activos`}
              />
              <Stat label="Casas de Perfumería" value={marcas.length} note="Catálogo curado" />
              <Stat
                label="Familias olfativas"
                value={familias.length}
                note="Composiciones"
              />
              <Stat
                label="Destacados en Home"
                value={productos.filter((p) => p.es_destacado).length}
                note="Curaduría principal"
              />
            </div>

            <div className="admin-panels">
              <article>
                <div className="panel-head">
                  <h2>Últimas fragancias añadidas</h2>
                  <button onClick={() => setSection("products")} type="button">
                    Ver catálogo completo
                  </button>
                </div>
                {productos.slice(0, 5).map((p) => (
                  <div className="mini-product" key={p.id}>
                    <img
                      src={p.imagenes[0] || "/assets/maison-logo.jpeg"}
                      alt={p.nombre}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/maison-logo.jpeg";
                      }}
                    />
                    <span>
                      <b>{p.nombre}</b>
                      <small>{p.marca}</small>
                    </span>
                    <strong>S/ {p.precio_50ml.toLocaleString("es-PE")}</strong>
                    <i className={p.activo ? "on" : ""}>
                      {p.activo ? "Activo" : "Borrador"}
                    </i>
                  </div>
                ))}
              </article>

              <article className="stock-panel">
                <div className="panel-head">
                  <h2>Resumen de Catálogo</h2>
                </div>
                <div className="stock-visual">
                  <span>{productos.length}</span>
                  <small>perfumes</small>
                </div>
                <p>
                  <i />
                  Perfumes publicados:{" "}
                  <strong>{productos.filter((p) => p.activo).length}</strong>
                </p>
                <p>
                  <i />
                  Borradores / Inactivos:{" "}
                  <strong>{productos.filter((p) => !p.activo).length}</strong>
                </p>
              </article>
            </div>
          </>
        )}

        {/* 2. SECCIÓN PRODUCTOS / CATÁLOGO (CRUD COMPLETO) */}
        {section === "products" && (
          <ProductTable
            products={productos}
            onEdit={manejarAbrirEdicion}
            onToggleActive={manejarAlternarVisibilidad}
            onDelete={manejarEliminarOArchivar}
            onAddNew={manejarAbrirCreacion}
          />
        )}

        {/* 3. SECCIÓN MARCAS Y FAMILIAS */}
        {section === "brands" && (
          <div className="admin-placeholder">
            <header>
              <small className="eyebrow">Catálogo · Clasificaciones</small>
              <h2>Casas de Perfumería y Familias</h2>
              <p>Casas de perfumería y clasificaciones olfativas del catálogo.</p>
            </header>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "25px" }}>
              {marcas.slice(0, 12).map((m) => (
                <article key={m.id}>
                  <span>{m.nombre.slice(0, 2).toUpperCase()}</span>
                  <strong>{m.nombre}</strong>
                  <span style={{ fontSize: "8px", color: "var(--muted)" }}>Activa</span>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* 4. SECCIÓN BANNERS */}
        {section === "banners" && (
          <div className="admin-placeholder">
            <header>
              <small className="eyebrow">Visual merchandising</small>
              <h2>Banners y carruseles</h2>
              <p>Control visual de diapositivas del hero y promociones intermedias.</p>
            </header>
            <div>
              {[
                "Hero Home · Diapositiva 1 (Baccarat Rouge 540) — Activo",
                "Hero Home · Diapositiva 2 (Distinción Olfativa) — Activo",
                "Hero Home · Diapositiva 3 (Asesoría Personalizada) — Activo",
                "Promo Mitad · Tu aroma habla antes que tú — Activo",
              ].map((item) => (
                <article key={item}>
                  <span>HD</span>
                  <strong>{item}</strong>
                  <span style={{ fontSize: "8px", color: "var(--gold)" }}>Activo</span>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* 5. SECCIÓN CONFIGURACIÓN COMERCIAL */}
        {section === "settings" && <SettingsSection />}
      </section>

      {/* MODAL RESPONSABILIDAD ÚNICA: CREACIÓN / EDICIÓN */}
      <ProductFormModal
        key={productoEnEdicion?.id ?? "nuevo"}
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setProductoEnEdicion(null);
        }}
        onSuccess={(mensaje) => {
          mostrarToast(mensaje);
          cargarProductos();
        }}
        initialProduct={productoEnEdicion}
        marcasDisponibles={marcas}
        familiasDisponibles={familias}
        onReloadMetadata={cargarMetadatos}
      />

      {/* TOAST DE FEEDBACK VISUAL */}
      {toastMensaje && (
        <div className="toast">
          <Icon name="check" /> {toastMensaje}
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
  const [tiktok, setTiktok] = useState("");
  const [horario, setHorario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar configuración real desde la base de datos al montar
  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const respuesta = await fetch("/api/config");
        if (respuesta.ok) {
          const datos = await respuesta.json();
          if (datos.whatsapp_pedidos) setPhone(datos.whatsapp_pedidos);
          if (datos.instagram_url) setInstagram(datos.instagram_url);
          if (datos.facebook_url) setFacebook(datos.facebook_url);
          if (datos.tiktok_url) setTiktok(datos.tiktok_url);
          if (datos.horario_comercial) setHorario(datos.horario_comercial);
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error);
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
        tiktok_url: tiktok,
        horario_comercial: horario,
      };

      const respuesta = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cargaUtil),
      });

      if (respuesta.ok) {
        localStorage.setItem("maison-whatsapp", phone);
        setMensaje("✓ Configuración comercial guardada correctamente.");
      } else {
        setMensaje("⚠ No se pudo guardar la configuración.");
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
        <p>Configura el número oficial de WhatsApp y canales de atención de la tienda.</p>
      </header>

      <label>
        Número de WhatsApp para pedidos
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          placeholder="Ej. 51999999999"
        />
      </label>

      <label>
        Instagram oficial
        <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="URL o @usuario de Instagram"
        />
      </label>

      <label>
        Facebook oficial
        <input
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="URL del perfil de Facebook"
        />
      </label>

      <label>
        TikTok oficial
        <input
          value={tiktok}
          onChange={(e) => setTiktok(e.target.value)}
          placeholder="URL o @usuario de TikTok"
        />
      </label>

      <label>
        Horario comercial de atención
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
        {guardando ? "Guardando cambios..." : "Guardar configuración"}
      </button>

      {mensaje && (
        <p style={{ marginTop: "1rem", color: "var(--gold)", fontWeight: 500 }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
