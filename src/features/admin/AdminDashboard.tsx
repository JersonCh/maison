import { useState, useEffect, useCallback } from "react";
import type {
  ProductoAdminItem,
  MarcaItem,
  MarcaAdminItem,
  FamiliaOlfativaItem,
} from "@/types/database";
import Icon from "@/components/ui/Icon";
import { obtenerPrecioMinimoFrasco } from "@/lib/frascos";
import ProductTable from "./ProductTable";
import ProductFormPage from "./ProductFormPage";
import CsvImportModal from "./CsvImportModal";
import BrandsManagementPage from "./BrandsManagementPage";
import BannersManagementPage from "./BannersManagementPage";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Props {
  initialProducts?: any[];
}

export default function AdminDashboard({ }: Props) {
  const [logged, setLogged] = useState(true);
  const [section, setSection] = useState("dashboard");
  const [cargando, setCargando] = useState(false);

  // Datos en vivo desde la base de datos
  const [productos, setProductos] = useState<ProductoAdminItem[]>([]);
  const [marcas, setMarcas] = useState<MarcaItem[]>([]);
  const [marcasAdmin, setMarcasAdmin] = useState<MarcaAdminItem[]>([]);
  const [familias, setFamilias] = useState<FamiliaOlfativaItem[]>([]);

  // Estados de vista de producto (Página dedicada - Opción A)
  const [vistaProducto, setVistaProducto] = useState<"tabla" | "formulario">("tabla");
  const [productoEnEdicion, setProductoEnEdicion] = useState<ProductoAdminItem | null>(null);

  // Modal de importación masiva CSV
  const [mostrarModalCsv, setMostrarModalCsv] = useState(false);

  // Modal de confirmación para eliminar fragancia
  const [productoAEliminar, setProductoAEliminar] = useState<{ id: number; nombre: string } | null>(null);
  const [eliminandoProducto, setEliminandoProducto] = useState(false);

  // Notificación tipo toast
  const [toastMensaje, setToastMensaje] = useState("");

  const mostrarToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    window.setTimeout(() => setToastMensaje(""), 3500);
  };

  // Cargar casas de perfumería con métricas completas
  const cargarMarcas = useCallback(async () => {
    try {
      const resp = await fetch("/api/admin/brands");
      if (resp.ok) {
        const datos = await resp.json();
        if (datos.marcas) {
          setMarcasAdmin(datos.marcas);
          setMarcas(datos.marcas);
        }
      }
    } catch (error) {
      console.error("Error al cargar casas de perfumería:", error);
    }
  }, []);

  // Cargar metadatos secundarios (familias olfativas)
  const cargarMetadatos = useCallback(async () => {
    try {
      const resp = await fetch("/api/admin/metadata");
      if (resp.ok) {
        const datos = await resp.json();
        if (datos.familias) setFamilias(datos.familias);
      }
    } catch (error) {
      console.error("Error al cargar metadatos:", error);
    }
  }, []);

  // Cargar lista completa de productos
  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const resp = await fetch("/api/admin/products");
      if (resp.ok) {
        const lista = await resp.json();
        setProductos(lista);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (logged) {
      cargarMarcas();
      cargarMetadatos();
      cargarProductos();
    }
  }, [logged, cargarMarcas, cargarMetadatos, cargarProductos]);

  // Manejadores de acciones del CRUD
  const manejarAbrirCreacion = () => {
    setProductoEnEdicion(null);
    setVistaProducto("formulario");
  };

  const manejarAbrirEdicion = (producto: ProductoAdminItem) => {
    setProductoEnEdicion(producto);
    setVistaProducto("formulario");
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

  const solicitarEliminarProducto = async (id: number, nombre: string) => {
    setProductoAEliminar({ id, nombre });
  };

  const ejecutarEliminarProducto = async () => {
    if (!productoAEliminar) return;

    setEliminandoProducto(true);
    try {
      const resp = await fetch(`/api/admin/products?id=${productoAEliminar.id}`, {
        method: "DELETE",
      });

      const resultado = await resp.json();

      if (resp.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== productoAEliminar.id));
        mostrarToast(`✓ ${resultado.mensaje || "Fragancia eliminada correctamente."}`);
        setProductoAEliminar(null);
      } else {
        mostrarToast(`⚠ ${resultado.error || "Error al eliminar la fragancia."}`);
      }
    } catch (error) {
      mostrarToast("⚠ Error de comunicación con el servidor.");
    } finally {
      setEliminandoProducto(false);
    }
  };

  // Pantalla de acceso / login
  if (!logged) {
    return (
      <main className="admin-login">
        <div className="login-brand">
          <img src="/assets/brand/logo-no-fondo300.png" alt="Maison des Parfums" />
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
    ["brands", "Casas de Perfumería"],
    ["banners", "Banners y Carruseles"],
    ["settings", "Configuración Comercial"],
  ];

  return (
    <main className="admin-shell">
      {/* BARRA LATERAL */}
      <aside className="admin-sidebar">
        <img src="/assets/brand/logo-no-fondo300.png" alt="Maison des Parfums" />
        <span>Panel Administrativo</span>
        <nav>
          {menu.map((item) => (
            <button
              className={section === item[0] ? "active" : ""}
              key={item[0]}
              onClick={() => {
                if (item[0] === "banners") {
                  // Desactivado temporalmente a solicitud: permanece en la misma pantalla sin acción
                  return;
                }
                setSection(item[0]);
                setVistaProducto("tabla");
              }}
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
        {!(section === "products" && vistaProducto === "formulario") && (
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
        )}

        {/* 1. SECCIÓN DASHBOARD */}
        {section === "dashboard" && (
          <>
            <div className="stat-grid">
              <Stat
                label="Total perfumes"
                value={productos.length}
                note={`${productos.filter((p) => p.activo).length} activos`}
              />
              <Stat label="Casas de Perfumería" value={marcas.length} note="Marcas registradas" />
              <Stat
                label="Con Decants"
                value={
                  productos.filter(
                    (p) =>
                      p.tiene_decants ||
                      p.precio_decant_3ml ||
                      p.precio_decant_5ml ||
                      p.precio_decant_10ml,
                  ).length
                }
                note="Muestras disponibles"
              />
              <Stat
                label="Destacados en Home"
                value={productos.filter((p) => p.es_destacado).length}
                note="Selección destacada"
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
                      src={p.imagenes[0] || "/assets/imagenxdefecto.svg"}
                      alt={p.nombre}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/imagenxdefecto.svg";
                      }}
                    />
                    <span>
                      <b>{p.nombre}</b>
                      <small>{p.marca}</small>
                    </span>
                    <strong>S/ {obtenerPrecioMinimoFrasco(p).toLocaleString("es-PE")}</strong>
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

        {/* 2. SECCIÓN PRODUCTOS / CATÁLOGO (CRUD COMPLETO CON PÁGINA DEDICADA) */}
        {section === "products" && (
          vistaProducto === "formulario" ? (
            <ProductFormPage
              key={productoEnEdicion?.id ?? "nuevo"}
              initialProduct={productoEnEdicion}
              marcasDisponibles={marcas}
              familiasDisponibles={familias}
              onBack={() => {
                setVistaProducto("tabla");
                setProductoEnEdicion(null);
              }}
              onSuccess={(mensaje) => {
                mostrarToast(mensaje);
                cargarProductos();
              }}
              onReloadMetadata={cargarMetadatos}
              onOpenImportCsv={() => setMostrarModalCsv(true)}
              onNavigateToBrands={() => setSection("brands")}
            />
          ) : (
            <ProductTable
              products={productos}
              onEdit={manejarAbrirEdicion}
              onToggleActive={manejarAlternarVisibilidad}
              onDelete={solicitarEliminarProducto}
              onAddNew={manejarAbrirCreacion}
              onOpenImportCsv={() => setMostrarModalCsv(true)}
            />
          )
        )}

        {/* 3. SECCIÓN MARCAS / CASAS DE PERFUMERÍA */}
        {section === "brands" && (
          <BrandsManagementPage
            marcas={marcasAdmin}
            onRecargarMarcas={async () => {
              await cargarMarcas();
              await cargarProductos();
            }}
            onMostrarToast={mostrarToast}
          />
        )}

        {/* 4. SECCIÓN BANNERS */}
        {section === "banners" && (
          <BannersManagementPage onMostrarToast={mostrarToast} />
        )}

        {/* 5. SECCIÓN CONFIGURACIÓN COMERCIAL */}
        {section === "settings" && <SettingsSection />}
      </section>

      {/* MODAL DE IMPORTACIÓN MASIVA CSV */}
      <CsvImportModal
        marcas={marcas}
        productos={productos}
        isOpen={mostrarModalCsv}
        onClose={() => setMostrarModalCsv(false)}
        onSuccess={(mensaje) => {
          mostrarToast(mensaje);
          cargarProductos();
          cargarMetadatos();
        }}
      />

      {/* MODAL REUTILIZABLE DE CONFIRMACIÓN (ELIMINAR FRAGANCIA) */}
      <ConfirmModal
        isOpen={Boolean(productoAEliminar)}
        onClose={() => !eliminandoProducto && setProductoAEliminar(null)}
        onConfirm={ejecutarEliminarProducto}
        title="¿Eliminar fragancia definitivamente?"
        subtitle="Gestión de Catálogo"
        confirmText="Eliminar fragancia"
        cancelText="Cancelar"
        variant="danger"
        isLoading={eliminandoProducto}
        message={
          productoAEliminar ? (
            <div>
              <p
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "14px",
                  color: "var(--ink)",
                  lineHeight: "1.5",
                }}
              >
                ¿Estás seguro de retirar <strong>"{productoAEliminar.nombre}"</strong> del catálogo oficial?
              </p>
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(185, 28, 28, 0.08)",
                  border: "1px solid rgba(185, 28, 28, 0.22)",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "#991b1b",
                  lineHeight: "1.5",
                }}
              >
                Esta acción eliminará el perfume, sus presentaciones y sus opciones de decants de forma permanente.
              </div>
            </div>
          ) : null
        }
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
  const [email, setEmail] = useState("");

  // Barra de anuncios superior
  const [anuncioTexto, setAnuncioTexto] = useState(
    "🚚 Despachos los jueves a todo el Perú por Shalom y Olva Courier · Fragancias 100% originales"
  );
  const [anuncioActivo, setAnuncioActivo] = useState(true);

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
          if (datos.email_contacto) setEmail(datos.email_contacto);
          if (datos.anuncio_superior_texto) setAnuncioTexto(datos.anuncio_superior_texto);
          if (datos.anuncio_superior_activo !== undefined) {
            setAnuncioActivo(datos.anuncio_superior_activo !== "0");
          }
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
        email_contacto: email,
        anuncio_superior_texto: anuncioTexto,
        anuncio_superior_activo: anuncioActivo ? "1" : "0",
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

  const previewParts = (anuncioTexto || "").split(" · ");

  return (
    <div className="settings-card">
      {/* 1. BARRA DE ANUNCIOS SUPERIOR */}
      <header>
        <small className="eyebrow">Cabecera de la tienda</small>
        <h2>Barra de anuncios superior</h2>
        <p>Controla el mensaje destacado visible en la parte más alta de la tienda (sobre el menú y el logotipo).</p>
      </header>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--line)",
          borderRadius: "4px",
          padding: "22px 24px",
          marginTop: "16px",
          marginBottom: "40px",
        }}
      >
        <label
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            margin: "0 0 16px 0",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink)",
          }}
        >
          <input
            type="checkbox"
            checked={anuncioActivo}
            onChange={(e) => setAnuncioActivo(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "var(--gold)", cursor: "pointer" }}
          />
          Mostrar barra de anuncios en la cabecera
        </label>

        {anuncioActivo ? (
          <>
            <label style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0 8px 0" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink)" }}>
                Texto del anuncio (Usa « · » para separar frases)
              </span>
              <input
                type="text"
                value={anuncioTexto}
                onChange={(e) => setAnuncioTexto(e.target.value)}
                placeholder="Ej. 🚚 Despachos los jueves a todo el Perú por Shalom y Olva Courier · Fragancias 100% originales"
                style={{ width: "100%", padding: "11px 14px", fontSize: "13.5px" }}
              />
            </label>
            <p style={{ fontSize: "12.5px", color: "var(--muted)", margin: "6px 0 16px 0", lineHeight: 1.5 }}>
              💡 <strong>Tip de diseño:</strong> Separa las frases con <code> · </code> (espacio, punto medio, espacio). En computadoras se muestran todas las frases con puntos de separación; en teléfonos móviles se muestra prioritariamente la primera frase para mantener el diseño limpio.
            </p>

            {/* VISTA PREVIA EN VIVO */}
            <div style={{ marginTop: "16px" }}>
              <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Vista previa en vivo:
              </span>
              <div
                style={{
                  background: "var(--gold)",
                  color: "var(--ink)",
                  minHeight: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "6px 16px",
                  borderRadius: "2px",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  overflow: "hidden",
                  textAlign: "center",
                  flexWrap: "wrap",
                }}
              >
                {previewParts.map((part, idx, arr) => (
                  <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
                    {part}
                    {idx < arr.length - 1 && (
                      <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--ink)", display: "inline-block" }} />
                    )}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: "8px 0 0 0", fontStyle: "italic" }}>
            ⚠ La barra de anuncios está desactivada y no se mostrará a los visitantes en la tienda web.
          </p>
        )}
      </div>

      {/* 2. CANALES DE ATENCIÓN Y CONTACTO */}
      <header>
        <small className="eyebrow">Canales de atención</small>
        <h2>Canales de contacto y redes</h2>
        <p>Configura el número oficial de WhatsApp para recepción de pedidos y redes sociales.</p>
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

      <label>
        Correo electrónico de contacto
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ej. contacto@maisondesparfums.pe"
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
