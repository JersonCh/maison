import React, { useState, useEffect } from "react";

export default function CommercialSettingsPage() {
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
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

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
    void cargarConfiguracion();
  }, []);

  const guardarCambios = async () => {
    setGuardando(true);
    setMensajeExito("");
    setMensajeError("");
    try {
      const cargaUtil = {
        whatsapp_pedidos: phone.trim(),
        instagram_url: instagram.trim(),
        facebook_url: facebook.trim(),
        tiktok_url: tiktok.trim(),
        horario_comercial: horario.trim(),
        email_contacto: email.trim(),
        anuncio_superior_texto: anuncioTexto.trim(),
        anuncio_superior_activo: anuncioActivo ? "1" : "0",
      };

      const respuesta = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cargaUtil),
      });

      if (respuesta.ok) {
        localStorage.setItem("maison-whatsapp", phone.trim());
        setMensajeExito("Configuración comercial guardada correctamente.");
      } else {
        setMensajeError("No se pudo guardar la configuración.");
      }
    } catch (error) {
      setMensajeError("Error de conexión al guardar los datos.");
    } finally {
      setGuardando(false);
      setTimeout(() => {
        setMensajeExito("");
        setMensajeError("");
      }, 4500);
    }
  };

  const insertarSeparadorAnuncio = () => {
    setAnuncioTexto((prev) => `${prev.trim()} · `);
  };

  const previewParts = (anuncioTexto || "").split(" · ").filter(Boolean);

  // Normalizar enlace para botón de prueba
  const normalizarUrl = (url: string, base: string) => {
    if (!url) return "";
    const limpia = url.trim();
    if (limpia.startsWith("http://") || limpia.startsWith("https://")) return limpia;
    if (limpia.startsWith("@")) return `${base}/${limpia.substring(1)}`;
    return `${base}/${limpia}`;
  };

  const enlaceWhatsappPrueba = phone
    ? `https://wa.me/${phone.startsWith("51") ? phone : `51${phone}`}`
    : "";

  return (
    <div className="commercial-settings-container">
      {/* BARRA SUPERIOR: DESCRIPCIÓN Y BOTÓN DE GUARDADO */}
      <div className="commercial-settings-topbar">
        <p className="commercial-settings-desc">
          Gestiona los canales oficiales de contacto, redes sociales y la marquesina de anuncios de la tienda.
        </p>

        <div className="commercial-settings-header-actions">
          {mensajeExito && (
            <span className="settings-toast-inline success">
              ✓ {mensajeExito}
            </span>
          )}
          {mensajeError && (
            <span className="settings-toast-inline error">
              ⚠ {mensajeError}
            </span>
          )}
          <button
            type="button"
            className="btn btn-gold btn-save-settings"
            onClick={guardarCambios}
            disabled={guardando}
          >
            {guardando ? (
              <>
                <span className="spinner-mini" /> Guardando...
              </>
            ) : (
              <>
                <svg aria-hidden="true" focusable="false" className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>

      <div className="commercial-settings-cards-stack">
        {/* ============================================================== */}
        {/* 1. BARRA DE ANUNCIOS SUPERIOR */}
        {/* ============================================================== */}
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="card-badge">Cabecera de la tienda</span>
              <h2 className="admin-card-title">Barra de anuncios superior</h2>
              <span className="admin-card-subtitle">
                Marquesina destacada visible en la parte más alta de la tienda (sobre el menú y el logotipo).
              </span>
            </div>

            {/* SWITCH ELEGANTE */}
            <div className="settings-switch-wrapper">
              <span className="settings-switch-label">
                {anuncioActivo ? "Barra activa" : "Barra desactivada"}
              </span>
              <label className="toggle-switch" aria-label="Activar o desactivar barra de anuncios">
                <input
                  type="checkbox"
                  checked={anuncioActivo}
                  onChange={(e) => setAnuncioActivo(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {anuncioActivo ? (
            <div className="announcement-card-body">
              <div className="form-group">
                <div className="label-with-action">
                  <label htmlFor="input-anuncio-texto">
                    Texto del anuncio
                  </label>
                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={insertarSeparadorAnuncio}
                    title="Añadir separador de frases"
                  >
                    + Insertar separador <strong>« · »</strong>
                  </button>
                </div>

                <div className="input-with-icon-wrapper">
                  <span className="input-icon-prefix">📢</span>
                  <input
                    id="input-anuncio-texto"
                    type="text"
                    className="settings-text-input"
                    value={anuncioTexto}
                    onChange={(e) => setAnuncioTexto(e.target.value)}
                    placeholder="Ej. Despachos los jueves a todo el Perú por Shalom y Olva Courier · Fragancias 100% originales"
                  />
                </div>
              </div>

              {/* RECOMENDACIÓN EDITORIAL */}
              <div className="settings-tip-box">
                <div className="tip-icon">💡</div>
                <div className="tip-content">
                  <strong>Formato recomendado:</strong> Separa cada frase con el punto medio <code> · </code>.
                  En computadoras se exhiben todas las frases rotando suavemente; en teléfonos móviles se prioriza
                  la primera frase para mantener una cabecera limpia y estilizada.
                </div>
              </div>

              {/* VISTA PREVIA EN VIVO */}
              <div className="announcement-preview-block">
                <span className="preview-label">
                  Vista previa en vivo (como se ve en la tienda)
                </span>
                <div className="announcement-preview-ribbon">
                  {previewParts.length > 0 ? (
                    previewParts.map((part, idx, arr) => (
                      <span key={idx} className="ribbon-phrase">
                        {part}
                        {idx < arr.length - 1 && <span className="ribbon-dot" />}
                      </span>
                    ))
                  ) : (
                    <span className="ribbon-empty">Escribe un anuncio arriba para previsualizarlo aquí</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="settings-disabled-notice">
              <svg aria-hidden="true" focusable="false" className="notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.772M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <div>
                <strong>La barra de anuncios está desactivada</strong>
                <p>La tienda mostrará directamente la barra de navegación y el logotipo en la cabecera sin marquesina promocional.</p>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* 2. CANALES DE ATENCIÓN DIRECTA */}
        {/* ============================================================== */}
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="card-badge">Atención al cliente</span>
              <h2 className="admin-card-title">Canales de Contacto Directo</h2>
              <span className="admin-card-subtitle">
                Medios principales para recepción de pedidos, consultas de disponibilidad y soporte personalizado.
              </span>
            </div>
          </div>

          <div className="settings-grid-2">
            {/* WHATSAPP */}
            <div className="form-group">
              <div className="label-with-action">
                <label htmlFor="input-whatsapp">
                  WhatsApp Oficial para Pedidos *
                </label>
                {enlaceWhatsappPrueba && (
                  <a
                    href={enlaceWhatsappPrueba}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-text-action"
                    title="Abrir chat en nueva pestaña"
                  >
                    Probar chat ↗
                  </a>
                )}
              </div>
              <div className="input-phone-group">
                <span className="phone-prefix-badge">
                  🇵🇪 +51
                </span>
                <input
                  id="input-whatsapp"
                  type="text"
                  className="settings-text-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="954159831"
                  maxLength={11}
                />
              </div>
              <span className="settings-field-hint">
                Los botones de «Comprar por WhatsApp» en el catálogo y carrito abrirán conversación con este número.
              </span>
            </div>

            {/* CORREO ELECTRÓNICO */}
            <div className="form-group">
              <label htmlFor="input-email">
                Correo Electrónico de Contacto
              </label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon-prefix">
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input
                  id="input-email"
                  type="email"
                  className="settings-text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contacto@maisondesparfums.pe"
                />
              </div>
              <span className="settings-field-hint">
                Mostrado en la página de contacto y en el pie de página de la tienda.
              </span>
            </div>

            {/* HORARIO DE ATENCIÓN */}
            <div className="form-group full-column">
              <label htmlFor="input-horario">
                Horario Comercial de Atención
              </label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon-prefix">
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <input
                  id="input-horario"
                  type="text"
                  className="settings-text-input"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  placeholder="Ej. Lunes a sábado · 10:00 am - 8:00 pm"
                />
              </div>
              <div className="quick-suggestions-row">
                <span className="suggestions-label">Sugerencias rápidas:</span>
                <button
                  type="button"
                  className="btn-suggestion-pill"
                  onClick={() => setHorario("Lunes a sábado · 10:00 am - 8:00 pm")}
                >
                  Lunes a sábado · 10:00 am - 8:00 pm
                </button>
                <button
                  type="button"
                  className="btn-suggestion-pill"
                  onClick={() => setHorario("Lunes a domingo · 9:00 am - 9:00 pm")}
                >
                  Lunes a domingo · 9:00 am - 9:00 pm
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. REDES SOCIALES OFICIALES */}
        {/* ============================================================== */}
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="card-badge">Comunidad y Redes</span>
              <h2 className="admin-card-title">Redes Sociales Oficiales</h2>
              <span className="admin-card-subtitle">
                Enlaces a los perfiles oficiales de la tienda mostrados en la cabecera, menú móvil y pie de página.
              </span>
            </div>
          </div>

          <div className="settings-grid-3">
            {/* INSTAGRAM */}
            <div className="social-channel-card">
              <div className="social-channel-header">
                <div className="social-brand-info">
                  <span className="social-icon-box instagram">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="social-title">Instagram</h3>
                    <span className="social-subtitle">Perfil fotográfico</span>
                  </div>
                </div>
                {instagram && (
                  <a
                    href={normalizarUrl(instagram, "https://instagram.com")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-social-visit"
                    title="Visitar perfil de Instagram"
                  >
                    Ver ↗
                  </a>
                )}
              </div>

              <div className="social-input-wrapper">
                <span className="social-input-prefix">instagram.com/</span>
                <input
                  type="text"
                  className="social-input"
                  value={instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "")}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setInstagram(val ? `https://www.instagram.com/${val.replace(/^@/, "")}` : "");
                  }}
                  placeholder="maisondesparfums.pe"
                />
              </div>
            </div>

            {/* FACEBOOK */}
            <div className="social-channel-card">
              <div className="social-channel-header">
                <div className="social-brand-info">
                  <span className="social-icon-box facebook">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="social-title">Facebook</h3>
                    <span className="social-subtitle">Página oficial</span>
                  </div>
                </div>
                {facebook && (
                  <a
                    href={normalizarUrl(facebook, "https://facebook.com")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-social-visit"
                    title="Visitar página de Facebook"
                  >
                    Ver ↗
                  </a>
                )}
              </div>

              <div className="social-input-wrapper">
                <span className="social-input-prefix">facebook.com/</span>
                <input
                  type="text"
                  className="social-input"
                  value={facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//i, "")}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setFacebook(val ? (val.startsWith("http") ? val : `https://www.facebook.com/${val}`) : "");
                  }}
                  placeholder="maisondesparfums"
                />
              </div>
            </div>

            {/* TIKTOK */}
            <div className="social-channel-card">
              <div className="social-channel-header">
                <div className="social-brand-info">
                  <span className="social-icon-box tiktok">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.33-6.32V8.9a8.16 8.16 0 0 0 4.75 1.51V6.96a4.85 4.85 0 0 1-.84-.27z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="social-title">TikTok</h3>
                    <span className="social-subtitle">Videos y tendencias</span>
                  </div>
                </div>
                {tiktok && (
                  <a
                    href={normalizarUrl(tiktok, "https://tiktok.com")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-social-visit"
                    title="Visitar perfil de TikTok"
                  >
                    Ver ↗
                  </a>
                )}
              </div>

              <div className="social-input-wrapper">
                <span className="social-input-prefix">tiktok.com/@</span>
                <input
                  type="text"
                  className="social-input"
                  value={tiktok.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "").replace(/^@/, "")}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setTiktok(val ? `https://www.tiktok.com/@${val.replace(/^@/, "")}` : "");
                  }}
                  placeholder="maisondesparfums.pe"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* BARRA INFERIOR DE ACCIÓN */}
      <div className="commercial-settings-footer-bar">
        <div className="footer-bar-info">
          <span className="status-dot-live" />
          <span>Los cambios guardados se reflejan inmediatamente en la tienda pública sin demoras.</span>
        </div>

        <div className="footer-bar-actions">
          {mensajeExito && (
            <span className="settings-toast-inline success">
              ✓ {mensajeExito}
            </span>
          )}
          {mensajeError && (
            <span className="settings-toast-inline error">
              ⚠ {mensajeError}
            </span>
          )}
          <button
            type="button"
            className="btn btn-gold btn-save-settings"
            onClick={guardarCambios}
            disabled={guardando}
          >
            {guardando ? "Guardando cambios..." : "Guardar configuración comercial"}
          </button>
        </div>
      </div>
    </div>
  );
}
