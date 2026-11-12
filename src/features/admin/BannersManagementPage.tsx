import React, { useState, useEffect, useMemo, useRef } from "react";
import type { BannerAdminItem } from "@/lib/database/bannersAdmin";
import Icon from "@/components/ui/Icon";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { optimizarImagenParaWebP } from "@/lib/imageOptimization";

interface Props {
  onMostrarToast: (mensaje: string) => void;
}

export default function BannersManagementPage({ onMostrarToast }: Props) {
  const [banners, setBanners] = useState<BannerAdminItem[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modal de edición / creación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [bannerEnEdicion, setBannerEnEdicion] = useState<BannerAdminItem | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Formulario
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [textoBoton, setTextoBoton] = useState("Ver Novedades");
  const [enlaceUrl, setEnlaceUrl] = useState("/perfumes");
  const [imagenDesktop, setImagenDesktop] = useState("");
  const [imagenMobile, setImagenMobile] = useState("");
  const [activo, setActivo] = useState(true);

  // Estados de carga de imagen
  const [subiendoDesktop, setSubiendoDesktop] = useState(false);
  const [subiendoMobile, setSubiendoMobile] = useState(false);
  const inputDesktopRef = useRef<HTMLInputElement>(null);
  const inputMobileRef = useRef<HTMLInputElement>(null);

  // Modal de confirmación para eliminar
  const [bannerAEliminar, setBannerAEliminar] = useState<BannerAdminItem | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar banners desde la API
  const cargarBanners = async () => {
    try {
      setCargando(true);
      const resp = await fetch("/api/admin/banners?ubicacion=hero_home");
      if (resp.ok) {
        const data = await resp.json();
        setBanners(data.banners || []);
      } else {
        onMostrarToast("⚠ No se pudieron cargar las diapositivas.");
      }
    } catch (err) {
      onMostrarToast("⚠ Error de comunicación al consultar el carrusel.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarBanners();
  }, []);

  // Métricas
  const totalBanners = banners.length;
  const bannersActivos = useMemo(() => banners.filter((b) => b.activo).length, [banners]);
  const bannersInactivos = totalBanners - bannersActivos;

  // Abrir modal para crear
  const handleAbrirCrear = () => {
    setBannerEnEdicion(null);
    setTitulo("");
    setSubtitulo("Casas de autor y alta perfumería europea");
    setDescripcion("Descubre aromas que trascienden el tiempo y convierten tu esencia en una firma inolvidable.");
    setTextoBoton("Explorar catálogo");
    setEnlaceUrl("/perfumes");
    setImagenDesktop("");
    setImagenMobile("");
    setActivo(true);
    setErrorModal(null);
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const handleAbrirEditar = (b: BannerAdminItem) => {
    setBannerEnEdicion(b);
    setTitulo(b.titulo || "");
    setSubtitulo(b.subtitulo || "");
    setDescripcion(b.descripcion || "");
    setTextoBoton(b.texto_boton || "Explorar catálogo");
    setEnlaceUrl(b.enlace_url || "/perfumes");
    setImagenDesktop(b.imagen_desktop || "");
    setImagenMobile(b.imagen_mobile || "");
    setActivo(b.activo);
    setErrorModal(null);
    setModalAbierto(true);
  };

  // Subir imagen a Cloudflare R2
  const handleSubirArchivo = async (
    file: File,
    destino: "desktop" | "mobile"
  ) => {
    const setSubiendo = destino === "desktop" ? setSubiendoDesktop : setSubiendoMobile;
    setSubiendo(true);
    setErrorModal(null);

    try {
      // Optimizar banner automáticamente antes de enviar a R2 (< 1 MB)
      const archivoOptimizado = await optimizarImagenParaWebP(file, {
        maxAncho: destino === "desktop" ? 1920 : 1080,
        maxAlto: destino === "desktop" ? 1080 : 1440,
        calidadInicial: 0.85,
        maxBytes: 1024 * 1024,
      });

      const formData = new FormData();
      formData.append("file", archivoOptimizado);

      const resp = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "No se pudo subir la imagen.");
      }

      if (destino === "desktop") {
        setImagenDesktop(data.url);
      } else {
        setImagenMobile(data.url);
      }
      onMostrarToast("✓ Fotografía cargada exitosamente a R2.");
    } catch (err: any) {
      setErrorModal(err.message || "Error al subir la fotografía.");
    } finally {
      setSubiendo(false);
    }
  };

  // Guardar diapositiva (Crear o Actualizar)
  const handleGuardarBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setErrorModal("El título principal de la diapositiva es obligatorio.");
      return;
    }

    if (!imagenDesktop.trim()) {
      setErrorModal("Debes proporcionar una imagen panorámica para la versión de escritorio.");
      return;
    }

    setGuardando(true);
    setErrorModal(null);

    try {
      const esEdicion = Boolean(bannerEnEdicion);
      const url = "/api/admin/banners";
      const method = esEdicion ? "PUT" : "POST";

      const payload = {
        id: bannerEnEdicion?.id,
        ubicacion: "hero_home",
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim() || null,
        descripcion: descripcion.trim() || null,
        texto_boton: textoBoton.trim() || null,
        enlace_url: enlaceUrl.trim() || null,
        imagen_desktop: imagenDesktop.trim(),
        imagen_mobile: imagenMobile.trim() || null,
        activo,
      };

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Error al guardar la diapositiva.");
      }

      onMostrarToast(
        esEdicion
          ? "✓ Diapositiva actualizada correctamente."
          : "✓ Nueva diapositiva añadida al carrusel."
      );
      setModalAbierto(false);
      await cargarBanners();
    } catch (err: any) {
      setErrorModal(err.message || "Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  // Alternar estado activo / inactivo
  const handleAlternarEstado = async (b: BannerAdminItem) => {
    const nuevoEstado = !b.activo;
    try {
      const resp = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          id: b.id,
          activo: nuevoEstado,
        }),
      });

      if (resp.ok) {
        setBanners((prev) =>
          prev.map((item) => (item.id === b.id ? { ...item, activo: nuevoEstado } : item))
        );
        onMostrarToast(
          nuevoEstado
            ? `✓ "${b.titulo}" activada en la portada.`
            : `✓ "${b.titulo}" pausada de la portada.`
        );
      } else {
        onMostrarToast("⚠ No se pudo cambiar el estado de la diapositiva.");
      }
    } catch {
      onMostrarToast("⚠ Error de comunicación con el servidor.");
    }
  };

  // Reordenar diapositivas (subir / bajar)
  const handleMoverOrden = async (index: number, direccion: "arriba" | "abajo") => {
    if (direccion === "arriba" && index === 0) return;
    if (direccion === "abajo" && index === banners.length - 1) return;

    const nuevoIndex = direccion === "arriba" ? index - 1 : index + 1;
    const nuevaLista = [...banners];
    const [elemento] = nuevaLista.splice(index, 1);
    nuevaLista.splice(nuevoIndex, 0, elemento);

    // Reasignar orden 0, 1, 2...
    const ordenes = nuevaLista.map((item, idx) => ({ id: item.id, orden: idx }));
    setBanners(nuevaLista.map((item, idx) => ({ ...item, orden: idx })));

    try {
      const resp = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          ordenes,
        }),
      });

      if (resp.ok) {
        onMostrarToast("✓ Orden de diapositivas actualizado en portada.");
      } else {
        onMostrarToast("⚠ Error al guardar el nuevo orden.");
        await cargarBanners();
      }
    } catch {
      onMostrarToast("⚠ Error de comunicación al reordenar.");
      await cargarBanners();
    }
  };

  // Confirmar eliminación definitiva
  const handleConfirmarEliminar = async () => {
    if (!bannerAEliminar) return;
    setEliminando(true);

    try {
      const resp = await fetch(`/api/admin/banners?id=${bannerAEliminar.id}`, {
        method: "DELETE",
      });

      const data = await resp.json();

      if (resp.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== bannerAEliminar.id));
        onMostrarToast("✓ Diapositiva retirada del catálogo oficial.");
        setBannerAEliminar(null);
      } else {
        onMostrarToast(`⚠ ${data.error || "Error al eliminar la diapositiva."}`);
      }
    } catch {
      onMostrarToast("⚠ Error de conexión al eliminar.");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="admin-banners-view" style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* 1. ENCABEZADO EDITORIAL DE SECCIÓN */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "28px",
          paddingBottom: "22px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <small
            style={{
              color: "var(--gold-deep)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontSize: "11px",
              fontWeight: 600,
              display: "block",
              marginBottom: "4px",
            }}
          >
            Visual Merchandising · Portada
          </small>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--serif)",
              fontSize: "30px",
              color: "var(--ink)",
              fontWeight: 400,
            }}
          >
            Banners y Carrusel Hero
          </h2>
          <p
            style={{
              margin: "6px 0 0 0",
              color: "var(--muted)",
              fontSize: "13.5px",
              maxWidth: "680px",
              lineHeight: "1.5",
            }}
          >
            Controla las diapositivas de apertura de la tienda: fotografías de autor,
            epígrafes editoriales, frases de impacto y enlaces de campaña en la página de inicio.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-gold"
          onClick={handleAbrirCrear}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "11px 22px",
            fontSize: "13px",
            boxShadow: "0 4px 14px rgba(150, 108, 40, 0.25)",
          }}
        >
          <Icon name="plus" size={15} />
          Nueva Diapositiva
        </button>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            padding: "18px 20px",
          }}
        >
          <small style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: "10.5px", letterSpacing: "0.1em" }}>
            Total de diapositivas
          </small>
          <div style={{ fontFamily: "var(--serif)", fontSize: "28px", color: "var(--ink)", marginTop: "4px" }}>
            {totalBanners}
          </div>
          <small style={{ color: "var(--muted)", fontSize: "11.5px" }}>En catálogo de banners</small>
        </div>

        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            padding: "18px 20px",
          }}
        >
          <small style={{ color: "#166534", textTransform: "uppercase", fontSize: "10.5px", letterSpacing: "0.1em" }}>
            En rotación (Portada)
          </small>
          <div style={{ fontFamily: "var(--serif)", fontSize: "28px", color: "#166534", marginTop: "4px" }}>
            {bannersActivos}
          </div>
          <small style={{ color: "var(--muted)", fontSize: "11.5px" }}>Visibles para el cliente</small>
        </div>

        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            padding: "18px 20px",
          }}
        >
          <small style={{ color: "var(--gold-deep)", textTransform: "uppercase", fontSize: "10.5px", letterSpacing: "0.1em" }}>
            En reserva (Pausadas)
          </small>
          <div style={{ fontFamily: "var(--serif)", fontSize: "28px", color: "var(--gold-deep)", marginTop: "4px" }}>
            {bannersInactivos}
          </div>
          <small style={{ color: "var(--muted)", fontSize: "11.5px" }}>Campañas estacionales</small>
        </div>
      </div>

      {/* 3. LISTADO EDITORIAL DE DIAPOSITIVAS */}
      {cargando ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "2px solid var(--line)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              margin: "0 auto 14px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "13.5px" }}>
            Cargando la narrativa visual de portada...
          </p>
        </div>
      ) : banners.length === 0 ? (
        <div
          style={{
            padding: "60px 24px",
            textAlign: "center",
            background: "var(--white)",
            border: "1px dashed var(--line)",
            borderRadius: "4px",
          }}
        >
          <h3 style={{ fontFamily: "var(--serif)", fontSize: "22px", color: "var(--ink)", margin: "0 0 8px 0" }}>
            Sin diapositivas registradas
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "13.5px", maxWidth: "460px", margin: "0 auto 20px", lineHeight: "1.5" }}>
            Comienza añadiendo la primera diapositiva de apertura con fotografía de alta fidelidad, título y llamada a la acción.
          </p>
          <button type="button" className="btn btn-gold" onClick={handleAbrirCrear}>
            Crear primera diapositiva
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {banners.map((b, index) => {
            const esPrimera = index === 0;
            const esUltima = index === banners.length - 1;

            return (
              <div
                key={b.id}
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--line)",
                  borderRadius: "4px",
                  boxShadow: "0 4px 18px rgba(10, 11, 10, 0.04)",
                  overflow: "hidden",
                  display: "grid",
                  gridTemplateColumns: "340px 1fr auto",
                  gap: "24px",
                  alignItems: "center",
                  padding: "20px",
                  opacity: b.activo ? 1 : 0.65,
                  transition: "opacity 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* A. Miniatura Editorial Tipo Lookbook */}
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "16 / 9",
                    borderRadius: "3px",
                    overflow: "hidden",
                    background: "var(--ink)",
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <img
                    src={b.imagen_desktop}
                    alt={b.titulo || "Diapositiva"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "brightness(0.9)",
                    }}
                  />

                  {/* Sombra editorial degradada que replica la tienda */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to right, rgba(5,6,5,0.78) 0%, rgba(5,6,5,0.3) 65%, transparent 100%)",
                    }}
                  />

                  {/* Badge de orden sobre la miniatura */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      background: "rgba(5, 6, 5, 0.8)",
                      backdropFilter: "blur(4px)",
                      color: "var(--gold)",
                      padding: "3px 8px",
                      borderRadius: "2px",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                    }}
                  >
                    POSICIÓN {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Textos simulados sobre la miniatura */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      right: "12px",
                      pointerEvents: "none",
                    }}
                  >
                    {b.subtitulo && (
                      <span
                        style={{
                          display: "block",
                          color: "var(--gold)",
                          fontSize: "8.5px",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          marginBottom: "2px",
                        }}
                      >
                        {b.subtitulo}
                      </span>
                    )}
                    <strong
                      style={{
                        display: "block",
                        color: "#ffffff",
                        fontFamily: "var(--serif)",
                        fontSize: "12px",
                        fontWeight: 400,
                        lineHeight: "1.2",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {b.titulo}
                    </strong>
                  </div>
                </div>

                {/* B. Detalles de Contenido y Campaña */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 9px",
                        borderRadius: "2px",
                        fontSize: "10.5px",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        background: b.activo ? "rgba(22, 101, 52, 0.12)" : "rgba(100, 100, 100, 0.12)",
                        color: b.activo ? "#166534" : "var(--muted)",
                        border: b.activo ? "1px solid rgba(22, 101, 52, 0.25)" : "1px solid var(--line)",
                      }}
                    >
                      {b.activo ? "En rotación · Portada" : "Pausada · Fuera de rotación"}
                    </span>

                    {b.imagen_mobile && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "2px",
                          fontSize: "10px",
                          color: "var(--gold-deep)",
                          background: "rgba(212, 175, 55, 0.1)",
                          border: "1px solid rgba(212, 175, 55, 0.2)",
                        }}
                      >
                        Encuadre móvil adaptado
                      </span>
                    )}
                  </div>

                  {b.subtitulo && (
                    <small
                      style={{
                        color: "var(--gold-deep)",
                        fontSize: "11px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      {b.subtitulo}
                    </small>
                  )}

                  <h3
                    style={{
                      margin: "0 0 6px 0",
                      fontFamily: "var(--serif)",
                      fontSize: "20px",
                      color: "var(--ink)",
                      fontWeight: 400,
                    }}
                  >
                    {b.titulo}
                  </h3>

                  {b.descripcion && (
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        color: "var(--muted)",
                        fontSize: "12.5px",
                        lineHeight: "1.5",
                        maxWidth: "600px",
                      }}
                    >
                      {b.descripcion}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      fontSize: "12px",
                      color: "var(--muted)",
                    }}
                  >
                    <span>
                      <strong>Botón:</strong> {b.texto_boton || "Sin botón"}
                    </span>
                    <span>·</span>
                    <span>
                      <strong>Destino:</strong>{" "}
                      <code
                        style={{
                          background: "var(--ivory)",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontSize: "11px",
                          color: "var(--ink)",
                          border: "1px solid var(--line)",
                        }}
                      >
                        {b.enlace_url || "/perfumes"}
                      </code>
                    </span>
                  </div>
                </div>

                {/* C. Controles Editoriales de Acción */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "10px",
                    borderLeft: "1px solid var(--line)",
                    paddingLeft: "20px",
                  }}
                >
                  {/* Selector rápido Activo / Ocultar */}
                  <button
                    type="button"
                    onClick={() => handleAlternarEstado(b)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--line)",
                      padding: "6px 12px",
                      borderRadius: "3px",
                      fontSize: "11.5px",
                      cursor: "pointer",
                      color: b.activo ? "var(--ink)" : "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                    title={b.activo ? "Pausar de la portada" : "Activar en la portada"}
                  >
                    <Icon name="eye" size={13} />
                    {b.activo ? "Pausar" : "Activar"}
                  </button>

                  {/* Botones de Orden */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => handleMoverOrden(index, "arriba")}
                      disabled={esPrimera}
                      style={{
                        background: "var(--ivory)",
                        border: "1px solid var(--line)",
                        width: "32px",
                        height: "30px",
                        borderRadius: "3px",
                        cursor: esPrimera ? "not-allowed" : "pointer",
                        opacity: esPrimera ? 0.35 : 1,
                        fontSize: "12px",
                        color: "var(--ink)",
                      }}
                      title="Mover hacia arriba"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoverOrden(index, "abajo")}
                      disabled={esUltima}
                      style={{
                        background: "var(--ivory)",
                        border: "1px solid var(--line)",
                        width: "32px",
                        height: "30px",
                        borderRadius: "3px",
                        cursor: esUltima ? "not-allowed" : "pointer",
                        opacity: esUltima ? 0.35 : 1,
                        fontSize: "12px",
                        color: "var(--ink)",
                      }}
                      title="Mover hacia abajo"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Botones de Editar y Eliminar */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleAbrirEditar(b)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "11.5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Icon name="edit" size={13} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => setBannerAEliminar(b)}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--line)",
                        padding: "6px 10px",
                        borderRadius: "3px",
                        cursor: "pointer",
                        color: "#b91c1c",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Retirar diapositiva"
                      aria-label="Retirar diapositiva"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL EDITORIAL DE CREACIÓN / EDICIÓN */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(5, 6, 5, 0.78)",
            backdropFilter: "blur(6px)",
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !guardando) {
              setModalAbierto(false);
            }
          }}
        >
          <div
            style={{
              width: "min(760px, 100%)",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              background: "var(--white)",
              borderRadius: "4px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
              overflow: "hidden",
              margin: "auto",
            }}
          >
            {/* Cabecera del modal */}
            <div
              style={{
                padding: "20px 26px",
                background: "var(--ivory)",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <small
                  style={{
                    color: "var(--gold-deep)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontSize: "10.5px",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  Curaduría Visual
                </small>
                <h3
                  style={{
                    margin: "2px 0 0 0",
                    fontFamily: "var(--serif)",
                    fontSize: "22px",
                    color: "var(--ink)",
                    fontWeight: 400,
                  }}
                >
                  {bannerEnEdicion ? "Editar Diapositiva Hero" : "Nueva Diapositiva Hero"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                disabled={guardando}
                style={{
                  border: 0,
                  background: "none",
                  cursor: guardando ? "not-allowed" : "pointer",
                  color: "var(--muted)",
                  padding: "6px",
                }}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarBanner} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "26px", display: "flex", flexDirection: "column", gap: "22px", flex: 1 }}>
                {errorModal && (
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "rgba(185, 28, 28, 0.08)",
                      border: "1px solid rgba(185, 28, 28, 0.25)",
                      borderRadius: "3px",
                      color: "#b91c1c",
                      fontSize: "13px",
                      lineHeight: "1.4",
                    }}
                  >
                    {errorModal}
                  </div>
                )}

                {/* Previsualización en vivo */}
                <div
                  style={{
                    borderRadius: "4px",
                    border: "1px solid var(--line)",
                    overflow: "hidden",
                    background: "var(--ivory)",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "rgba(10, 11, 10, 0.03)",
                      borderBottom: "1px solid var(--line)",
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      fontWeight: 600,
                    }}
                  >
                    Previsualización en tiempo real (Portada)
                  </div>
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "21 / 9",
                      background: "var(--ink)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      padding: "24px 30px",
                    }}
                  >
                    {imagenDesktop ? (
                      <img
                        src={imagenDesktop}
                        alt="Preview"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "brightness(0.9)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255, 255, 255, 0.3)",
                          fontSize: "12px",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        [ Fotografía no seleccionada ]
                      </div>
                    )}

                    {/* Sombra degradada idéntica a la home */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to right, rgba(5,6,5,0.85) 0%, rgba(5,6,5,0.4) 60%, transparent 100%)",
                      }}
                    />

                    {/* Contenido en vivo */}
                    <div style={{ position: "relative", zIndex: 2, maxWidth: "440px" }}>
                      {subtitulo && (
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            color: "var(--gold)",
                            fontSize: "10px",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            fontWeight: 600,
                          }}
                        >
                          {subtitulo}
                        </p>
                      )}
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          fontFamily: "var(--serif)",
                          fontSize: "22px",
                          color: "#ffffff",
                          fontWeight: 400,
                          lineHeight: "1.2",
                        }}
                      >
                        {titulo || "Título de la fragancia"}
                      </h4>
                      {descripcion && (
                        <p
                          style={{
                            margin: "0 0 14px 0",
                            color: "rgba(255, 255, 255, 0.82)",
                            fontSize: "11.5px",
                            lineHeight: "1.5",
                          }}
                        >
                          {descripcion}
                        </p>
                      )}
                      {textoBoton && (
                        <span
                          className="btn btn-gold"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "11px",
                            padding: "6px 14px",
                            pointerEvents: "none",
                          }}
                        >
                          {textoBoton} →
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bloque 1: Textos Editoriales */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink)" }}>
                      Subtítulo / Epígrafe
                    </span>
                    <input
                      type="text"
                      value={subtitulo}
                      onChange={(e) => setSubtitulo(e.target.value)}
                      placeholder="Ej. CASAS DE AUTOR Y ALTA PERFUMERÍA EUROPEA"
                      style={{
                        padding: "10px 12px",
                        border: "1px solid var(--line)",
                        borderRadius: "3px",
                        fontSize: "13px",
                        background: "var(--ivory)",
                        color: "var(--ink)",
                      }}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink)" }}>
                      Título Principal *
                    </span>
                    <input
                      type="text"
                      required
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej. El arte de la distinción olfativa"
                      style={{
                        padding: "10px 12px",
                        border: "1px solid var(--line)",
                        borderRadius: "3px",
                        fontSize: "13px",
                        background: "var(--ivory)",
                        color: "var(--ink)",
                      }}
                    />
                  </label>
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink)" }}>
                    Frase Descriptiva
                  </span>
                  <textarea
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej. Descubre aromas que trascienden el tiempo y convierten tu esencia en una firma inolvidable."
                    style={{
                      padding: "10px 12px",
                      border: "1px solid var(--line)",
                      borderRadius: "3px",
                      fontSize: "13px",
                      background: "var(--ivory)",
                      color: "var(--ink)",
                      resize: "vertical",
                    }}
                  />
                </label>

                {/* Bloque 2: Llamada a la Acción (Botón y Enlace) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink)" }}>
                      Texto del Botón
                    </span>
                    <input
                      type="text"
                      value={textoBoton}
                      onChange={(e) => setTextoBoton(e.target.value)}
                      placeholder="Ej. Ver Novedades"
                      style={{
                        padding: "10px 12px",
                        border: "1px solid var(--line)",
                        borderRadius: "3px",
                        fontSize: "13px",
                        background: "var(--ivory)",
                        color: "var(--ink)",
                      }}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink)" }}>
                      Enlace de Destino (URL)
                    </span>
                    <input
                      type="text"
                      value={enlaceUrl}
                      onChange={(e) => setEnlaceUrl(e.target.value)}
                      placeholder="Ej. /perfumes o /contacto"
                      style={{
                        padding: "10px 12px",
                        border: "1px solid var(--line)",
                        borderRadius: "3px",
                        fontSize: "13px",
                        background: "var(--ivory)",
                        color: "var(--ink)",
                      }}
                    />
                  </label>
                </div>

                {/* Bloque 3: Fotografías y Almacenamiento R2 */}
                <div
                  style={{
                    padding: "18px 20px",
                    background: "var(--ivory)",
                    border: "1px solid var(--line)",
                    borderRadius: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--gold-deep)",
                      display: "block",
                      marginBottom: "12px",
                    }}
                  >
                    Fotografías del Slide (Cloudflare R2 / URL Externa)
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Imagen Escritorio */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                          Fotografía Panorámica (Escritorio / Laptops) *
                        </span>
                        <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                          Recomendado: 1920 × 1080 px (WebP o JPG)
                        </small>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text"
                          required
                          value={imagenDesktop}
                          onChange={(e) => setImagenDesktop(e.target.value)}
                          placeholder="Pega la URL de la imagen o sube un archivo..."
                          style={{
                            flex: 1,
                            padding: "9px 12px",
                            border: "1px solid var(--line)",
                            borderRadius: "3px",
                            fontSize: "12.5px",
                            background: "var(--white)",
                            color: "var(--ink)",
                          }}
                        />

                        <input
                          type="file"
                          ref={inputDesktopRef}
                          accept="image/webp,image/jpeg,image/png,image/avif"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSubirArchivo(file, "desktop");
                          }}
                        />

                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => inputDesktopRef.current?.click()}
                          disabled={subiendoDesktop}
                          style={{
                            whiteSpace: "nowrap",
                            padding: "9px 14px",
                            fontSize: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Icon name="upload" size={13} />
                          {subiendoDesktop ? "Subiendo..." : "Cargar archivo"}
                        </button>
                      </div>
                    </div>

                    {/* Imagen Móvil */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                          Fotografía Vertical Móvil (Opcional)
                        </span>
                        <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                          Recomendado: 1080 × 1350 px. Si se omite, se adapta la de escritorio.
                        </small>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text"
                          value={imagenMobile}
                          onChange={(e) => setImagenMobile(e.target.value)}
                          placeholder="Opcional: URL de encuadre móvil vertical..."
                          style={{
                            flex: 1,
                            padding: "9px 12px",
                            border: "1px solid var(--line)",
                            borderRadius: "3px",
                            fontSize: "12.5px",
                            background: "var(--white)",
                            color: "var(--ink)",
                          }}
                        />

                        <input
                          type="file"
                          ref={inputMobileRef}
                          accept="image/webp,image/jpeg,image/png,image/avif"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSubirArchivo(file, "mobile");
                          }}
                        />

                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => inputMobileRef.current?.click()}
                          disabled={subiendoMobile}
                          style={{
                            whiteSpace: "nowrap",
                            padding: "9px 14px",
                            fontSize: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Icon name="upload" size={13} />
                          {subiendoMobile ? "Subiendo..." : "Cargar archivo"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloque 4: Publicación en Portada */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    padding: "10px 14px",
                    background: "var(--ivory)",
                    borderRadius: "3px",
                    border: "1px solid var(--line)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--gold)", cursor: "pointer" }}
                  />
                  <div>
                    <strong style={{ fontSize: "12.5px", color: "var(--ink)", display: "block" }}>
                      Publicar inmediatamente en el carrusel de portada
                    </strong>
                    <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                      Si se desmarca, se guardará como diapositiva en reserva para ser activada posteriormente.
                    </small>
                  </div>
                </label>
              </div>

              {/* Botones de acción del pie */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  padding: "16px 26px",
                  background: "var(--ivory)",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardando}
                  style={{ background: "transparent", fontSize: "12.5px" }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={guardando}
                  style={{
                    fontSize: "12.5px",
                    padding: "9px 20px",
                    minWidth: "150px",
                  }}
                >
                  {guardando ? "Guardando cambios..." : bannerEnEdicion ? "Actualizar diapositiva" : "Crear diapositiva"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL DE CONFIRMACIÓN REUTILIZABLE PARA ELIMINAR */}
      <ConfirmModal
        isOpen={Boolean(bannerAEliminar)}
        onClose={() => !eliminando && setBannerAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        title="¿Retirar diapositiva del carrusel?"
        subtitle="Visual Merchandising"
        confirmText="Retirar diapositiva"
        cancelText="Cancelar"
        variant="danger"
        isLoading={eliminando}
        message={
          bannerAEliminar ? (
            <div>
              <p style={{ margin: "0 0 12px 0", fontSize: "13.5px", color: "var(--ink)", lineHeight: "1.5" }}>
                ¿Estás seguro de eliminar la diapositiva <strong>"{bannerAEliminar.titulo}"</strong> de la portada?
              </p>
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(185, 28, 28, 0.08)",
                  border: "1px solid rgba(185, 28, 28, 0.2)",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "#991b1b",
                  lineHeight: "1.5",
                }}
              >
                Esta acción retirará la fotografía y los textos de la página de inicio de forma permanente.
              </div>
            </div>
          ) : null
        }
      />
    </div>
  );
}

