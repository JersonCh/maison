import { useState, useEffect } from "react";
import type {
  ProductoAdminItem,
  MarcaItem,
  FamiliaOlfativaItem,
  DatosFormularioProducto,
} from "@/types/database";
import type { Gender, CommercialType } from "@/types/product";
import { slugify } from "@/lib/slug";
import Icon from "@/components/ui/Icon";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
  initialProduct?: ProductoAdminItem | null;
  marcasDisponibles: MarcaItem[];
  familiasDisponibles: FamiliaOlfativaItem[];
  onReloadMetadata?: () => Promise<void>;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
  marcasDisponibles,
  familiasDisponibles,
  onReloadMetadata,
}: Props) {
  const esEdicion = Boolean(initialProduct?.id);

  // Estados del formulario
  const [nombre, setNombre] = useState(initialProduct?.nombre || "");
  const [slug, setSlug] = useState(
    initialProduct?.slug || slugify(initialProduct?.nombre || ""),
  );
  const [slugEditado, setSlugEditado] = useState(
    initialProduct?.slug || slugify(initialProduct?.nombre || ""),
  );
  const [modoEditarSlug, setModoEditarSlug] = useState(false);
  const [slugPersonalizado, setSlugPersonalizado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [marcaId, setMarcaId] = useState<number>(
    initialProduct?.marca_id || marcasDisponibles[0]?.id || 1,
  );
  const [modoNuevaMarca, setModoNuevaMarca] = useState(false);
  const [nuevaMarca, setNuevaMarca] = useState("");

  const [tipoComercial, setTipoComercial] = useState<CommercialType>(
    initialProduct?.tipo_comercial || "disenador",
  );
  const [genero, setGenero] = useState<Gender>(initialProduct?.genero || "Unisex");
  const [concentracion, setConcentracion] = useState(
    initialProduct?.concentracion || "Eau de Parfum",
  );

  const [familiaId, setFamiliaId] = useState<number | null>(
    initialProduct?.familia_olfativa_id || familiasDisponibles[0]?.id || 1,
  );
  const [modoNuevaFamilia, setModoNuevaFamilia] = useState(false);
  const [nuevaFamilia, setNuevaFamilia] = useState("");

  const [descripcion, setDescripcion] = useState(initialProduct?.descripcion || "");
  const [paisOrigen, setPaisOrigen] = useState(initialProduct?.pais_origen || "Francia");
  const [ocasionUso, setOcasionUso] = useState(
    initialProduct?.ocasion_uso || "Noche y eventos de distinción",
  );

  // Precios en Soles (se multiplicarán por 100 para persistir en céntimos en D1)
  const [precio50ml, setPrecio50ml] = useState<number | "">(
    initialProduct?.precio_50ml ?? 490,
  );
  const [precio100ml, setPrecio100ml] = useState<number | "">(
    initialProduct?.precio_100ml ?? 620,
  );
  const [precioRef50ml, setPrecioRef50ml] = useState<number | "">(
    initialProduct?.precio_referencia_50ml ?? "",
  );

  // Presentaciones de Decants (5ml y 10ml)
  const [tieneDecants, setTieneDecants] = useState<boolean>(
    Boolean(
      initialProduct?.tiene_decants ||
        initialProduct?.precio_decant_5ml ||
        initialProduct?.precio_decant_10ml,
    ),
  );
  const [precioDecant5ml, setPrecioDecant5ml] = useState<number | "">(
    initialProduct?.precio_decant_5ml ?? "",
  );
  const [precioDecant10ml, setPrecioDecant10ml] = useState<number | "">(
    initialProduct?.precio_decant_10ml ?? "",
  );

  // Fotos: Portada obligatoria, caja y detalle opcionales
  const [fotoPortada, setFotoPortada] = useState(
    initialProduct?.imagenes[0] ||
    "https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85",
  );
  const [fotoCaja, setFotoCaja] = useState(initialProduct?.imagenes[1] || "");
  const [fotoDetalle, setFotoDetalle] = useState(initialProduct?.imagenes[2] || "");

  const [esDestacado, setEsDestacado] = useState(initialProduct?.es_destacado ?? false);
  const [activo, setActivo] = useState(initialProduct?.activo ?? true);

  // Navegación por pestañas (Opción B)
  const [activeTab, setActiveTab] = useState<"identidad" | "formatos" | "galeria">("identidad");

  const [guardando, setGuardando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState("");
  const [subiendoSlot, setSubiendoSlot] = useState<number | null>(null);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const manejarSubidaArchivo = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slotNumero: number,
    setter: (url: string) => void,
  ) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setErrorSubida(null);
    setSubiendoSlot(slotNumero);

    try {
      const formData = new FormData();
      formData.append("file", archivo);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al subir la imagen.");
      }

      setter(data.url);
    } catch (err: any) {
      console.error("Error al subir archivo a R2:", err);
      setErrorSubida(
        `Error en foto ${slotNumero}: ${err.message || "No se pudo subir la imagen."}`,
      );
    } finally {
      setSubiendoSlot(null);
      e.target.value = "";
    }
  };

  const irAFormatos = () => {
    setErrorValidacion("");
    if (!nombre.trim()) {
      setErrorValidacion("Ingresa el nombre de la fragancia antes de continuar.");
      return;
    }
    setActiveTab("formatos");
  };

  const irAGaleria = () => {
    setErrorValidacion("");
    if (!precio50ml || Number(precio50ml) <= 0) {
      setErrorValidacion("El precio para la presentación de 50 ml debe ser mayor a 0.");
      return;
    }
    if (!precio100ml || Number(precio100ml) <= 0) {
      setErrorValidacion("El precio para la presentación de 100 ml debe ser mayor a 0.");
      return;
    }
    if (tieneDecants && (!precioDecant5ml || Number(precioDecant5ml) <= 0)) {
      setErrorValidacion("Si habilitas decants, el precio de la muestra de 5 ml es obligatorio.");
      return;
    }
    setActiveTab("galeria");
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion("");

    if (!nombre.trim()) {
      setActiveTab("identidad");
      setErrorValidacion("El nombre de la fragancia es obligatorio.");
      return;
    }
    if (!precio50ml || Number(precio50ml) <= 0) {
      setActiveTab("formatos");
      setErrorValidacion("El precio para la presentación de 50 ml debe ser mayor a 0.");
      return;
    }
    if (!precio100ml || Number(precio100ml) <= 0) {
      setActiveTab("formatos");
      setErrorValidacion("El precio para la presentación de 100 ml debe ser mayor a 0.");
      return;
    }
    // Validar decants si están activados
    if (tieneDecants && (!precioDecant5ml || Number(precioDecant5ml) <= 0)) {
      setActiveTab("formatos");
      setErrorValidacion("Si habilitas decants, el precio de la muestra de 5 ml es obligatorio.");
      return;
    }
    if (!fotoPortada.trim()) {
      setActiveTab("galeria");
      setErrorValidacion("La foto de portada (Frasco principal) es obligatoria.");
      return;
    }

    setGuardando(true);

    try {
      const cargaUtil: DatosFormularioProducto & { id?: number } = {
        nombre: nombre.trim(),
        slug: slug.trim() || undefined,
        marca_id: modoNuevaMarca ? undefined : marcaId,
        nueva_marca: modoNuevaMarca ? nuevaMarca.trim() : undefined,
        tipo_comercial: tipoComercial,
        tiene_decants: tieneDecants,
        precio_decant_5ml: tieneDecants && precioDecant5ml !== "" ? Number(precioDecant5ml) : null,
        precio_decant_10ml: tieneDecants && precioDecant10ml !== "" ? Number(precioDecant10ml) : null,
        genero,
        concentracion,
        familia_olfativa_id: modoNuevaFamilia ? null : familiaId,
        nueva_familia: modoNuevaFamilia ? nuevaFamilia.trim() : undefined,
        descripcion: descripcion.trim(),
        pais_origen: paisOrigen.trim(),
        ocasion_uso: ocasionUso.trim(),
        precio_50ml: Number(precio50ml),
        precio_100ml: Number(precio100ml),
        precio_referencia_50ml: precioRef50ml !== "" ? Number(precioRef50ml) : null,
        es_destacado: esDestacado,
        activo,
        fotos: [fotoPortada.trim(), fotoCaja.trim(), fotoDetalle.trim()].filter(Boolean),
      };

      if (esEdicion && initialProduct?.id) {
        cargaUtil.id = initialProduct.id;
      }

      const metodo = esEdicion ? "PUT" : "POST";
      const respuesta = await fetch("/api/admin/products", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cargaUtil),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado?.error || "Error al procesar la solicitud.");
      }

      if (onReloadMetadata && (modoNuevaMarca || modoNuevaFamilia)) {
        await onReloadMetadata();
      }

      onSuccess(
        esEdicion
          ? `✓ Fragancia "${nombre}" guardada correctamente.`
          : `✓ Fragancia "${nombre}" creada exitosamente.`,
      );
      onClose();
    } catch (err: any) {
      setErrorValidacion(err.message || "Error al guardar el perfume.");
    } finally {
      setGuardando(false);
    }
  };

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(`https://maison.pe/perfumes/${slug}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin bloqueo si el portapapeles no tiene permisos
    }
  };

  const confirmarSlugEditado = () => {
    const normalizado = slugify(slugEditado);
    if (!normalizado) {
      setSlugEditado(slug);
      setModoEditarSlug(false);
      return;
    }
    setSlug(normalizado);
    setSlugPersonalizado(true);
    setModoEditarSlug(false);
  };

  const cancelarSlugEditado = () => {
    setSlugEditado(slug);
    setModoEditarSlug(false);
  };

  const manejarKeyDownSlug = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmarSlugEditado();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelarSlugEditado();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <form onSubmit={manejarEnvio}>
        <div className="modal-head">
          <div>
            <small>Catálogo</small>
            <h2>{esEdicion ? "Editar fragancia" : "Crear nueva fragancia"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            disabled={guardando}
          >
            <Icon name="close" />
          </button>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS (OPCIÓN B) */}
        <nav className="modal-tabs-nav" aria-label="Pestañas de edición">
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === "identidad" ? "active" : ""}`}
            onClick={() => setActiveTab("identidad")}
          >
            <span className="tab-num">1</span>
            <span>Identidad Olfativa</span>
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === "formatos" ? "active" : ""}`}
            onClick={() => setActiveTab("formatos")}
          >
            <span className="tab-num">2</span>
            <span>Formatos & Decants</span>
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === "galeria" ? "active" : ""}`}
            onClick={() => setActiveTab("galeria")}
          >
            <span className="tab-num">3</span>
            <span>Galería & Estado</span>
          </button>
        </nav>

        {errorValidacion && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fdf2f2",
              border: "1px solid #f8b4b4",
              borderRadius: "4px",
              color: "#9b1c1c",
              fontSize: "12px",
              marginBottom: "16px",
            }}
          >
            ⚠ {errorValidacion}
          </div>
        )}

        {/* 1. SECCIÓN: IDENTIDAD Y CASA DE PERFUMERÍA */}
        {activeTab === "identidad" && (
          <fieldset className="admin-fieldset">
            <legend className="admin-fieldset-legend">
              <span>Paso 1 · Identidad</span>
              Información de la Casa
            </legend>

            <div className="form-grid">
              <div>
                <label>
                  Nombre del perfume *
                  <input
                    required
                    placeholder="Ej. Baccarat Rouge 540"
                    value={nombre}
                    onChange={(e) => {
                      const nuevoNombre = e.target.value;
                      setNombre(nuevoNombre);
                      if (!esEdicion && !slugPersonalizado) {
                        const nuevoSlug = slugify(nuevoNombre);
                        setSlug(nuevoSlug);
                        setSlugEditado(nuevoSlug);
                      }
                    }}
                  />
                </label>

                {/* Visualizador de enlace permanente SEO (estilo WooCommerce / Shopify) */}
                <div className="permalink-box">
                  <div className="permalink-url-wrapper">
                    <span>Enlace permanente:&nbsp;</span>
                    <code>
                      https://maison.pe/perfumes/<strong>{slug || "nuevo-perfume"}</strong>
                    </code>
                  </div>

                  <div className="permalink-actions">
                    {esEdicion && !modoEditarSlug && (
                      <span className="permalink-badge">SEO Fijo</span>
                    )}

                    {!modoEditarSlug && (
                      <>
                        <button
                          type="button"
                          className="permalink-btn"
                          onClick={() => {
                            setSlugEditado(slug);
                            setModoEditarSlug(true);
                          }}
                        >
                          Editar URL
                        </button>

                        {esEdicion && slug && (
                          <>
                            <button
                              type="button"
                              className="permalink-btn"
                              onClick={copiarEnlace}
                            >
                              {copiado ? "¡Copiado!" : "Copiar"}
                            </button>
                            <a
                              href={`/perfumes/${slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="permalink-link"
                              title="Ver perfume en tienda (abre en nueva pestaña)"
                            >
                              Ver perfume ↗
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {modoEditarSlug && (
                    <>
                      <div className="permalink-edit-row">
                        <input
                          type="text"
                          autoFocus
                          value={slugEditado}
                          onChange={(e) => setSlugEditado(e.target.value)}
                          onKeyDown={manejarKeyDownSlug}
                          placeholder="nuevo-slug"
                        />
                        <button
                          type="button"
                          className="permalink-btn-confirm"
                          onClick={confirmarSlugEditado}
                        >
                          Aceptar
                        </button>
                        <button
                          type="button"
                          className="permalink-btn-cancel"
                          onClick={cancelarSlugEditado}
                        >
                          Cancelar
                        </button>
                      </div>
                      {esEdicion && (
                        <p className="permalink-warning">
                          ⚠ Modificar el enlace de un perfume ya publicado alterará su URL permanente en la tienda pública.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <label>
                  Casa de perfumería (Marca) *
                  {!modoNuevaMarca ? (
                    <select
                      value={marcaId}
                      onChange={(e) => {
                        const nuevoId = Number(e.target.value);
                        setMarcaId(nuevoId);
                        const marcaSelec = marcasDisponibles.find((m) => m.id === nuevoId);
                        if (marcaSelec?.tipo_comercial) {
                          setTipoComercial(marcaSelec.tipo_comercial);
                        }
                      }}
                    >
                      {marcasDisponibles.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      placeholder="Escribe la nueva casa (ej. Kilian Paris)"
                      value={nuevaMarca}
                      onChange={(e) => setNuevaMarca(e.target.value)}
                    />
                  )}
                </label>
                <button
                  type="button"
                  className="toggle-field-btn"
                  onClick={() => setModoNuevaMarca(!modoNuevaMarca)}
                >
                  {modoNuevaMarca ? "← Elegir marca existente" : "+ Crear nueva marca"}
                </button>
              </div>

              <label>
                Línea / Gama Comercial *
                <select
                  value={tipoComercial}
                  onChange={(e) => setTipoComercial(e.target.value as CommercialType)}
                >
                  <option value="disenador">Diseñador (Grandes firmas internacionales)</option>
                  <option value="arabe">Árabes (Tradición y fijación oriental)</option>
                  <option value="nicho">Nichos (Perfumería de autor y artística)</option>
                </select>
              </label>

              <label>
                Género olfativo *
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value as Gender)}
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                </select>
              </label>

              <label>
                Concentración *
                <select
                  value={concentracion}
                  onChange={(e) => setConcentracion(e.target.value)}
                >
                  <option value="Eau de Parfum">Eau de Parfum (EDP)</option>
                  <option value="Parfum">Parfum</option>
                  <option value="Extrait de Parfum">Extrait de Parfum</option>
                  <option value="Eau de Toilette">Eau de Toilette (EDT)</option>
                  <option value="Eau de Cologne">Eau de Cologne</option>
                </select>
              </label>

              <div>
                <label>
                  Familia olfativa
                  {!modoNuevaFamilia ? (
                    <select
                      value={familiaId || ""}
                      onChange={(e) => setFamiliaId(Number(e.target.value) || null)}
                    >
                      {familiasDisponibles.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      placeholder="Ej. Cuero oriental, Chipre especiado"
                      value={nuevaFamilia}
                      onChange={(e) => setNuevaFamilia(e.target.value)}
                    />
                  )}
                </label>
                <button
                  type="button"
                  className="toggle-field-btn"
                  onClick={() => setModoNuevaFamilia(!modoNuevaFamilia)}
                >
                  {modoNuevaFamilia
                    ? "← Elegir familia existente"
                    : "+ Crear nueva familia"}
                </button>
              </div>

              <label>
                País de origen
                <input
                  placeholder="Ej. Francia, Italia, España"
                  value={paisOrigen}
                  onChange={(e) => setPaisOrigen(e.target.value)}
                />
              </label>

              <label className="full-field">
                Ocasión de uso recomendada
                <input
                  placeholder="Ej. Noche, eventos exclusivos, climas templados"
                  value={ocasionUso}
                  onChange={(e) => setOcasionUso(e.target.value)}
                />
              </label>

              <label className="full-field">
                Descripción y narrativa olfativa
                <textarea
                  rows={3}
                  placeholder="Describe la composición, acordes dominantes y la atmósfera del perfume..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </label>
            </div>
          </fieldset>
        )}

        {/* 2. SECCIÓN: PRESENTACIONES Y PRECIOS EN SOLES */}
        {activeTab === "formatos" && (
          <fieldset className="admin-fieldset">
            <legend className="admin-fieldset-legend">
              <span>Paso 2 · Formatos</span>
              Presentaciones y Precios Oficiales (Soles)
            </legend>

            <div className="form-grid">
              <label>
                Precio 50 ml (S/) *
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Ej. 490"
                  value={precio50ml}
                  onChange={(e) =>
                    setPrecio50ml(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </label>

              <label>
                Precio 100 ml (S/) *
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Ej. 620"
                  value={precio100ml}
                  onChange={(e) =>
                    setPrecio100ml(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </label>

              <label className="full-field">
                Precio referencial / tachado (50 ml) (Opcional)
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej. 550 (se mostrará como precio anterior con descuento)"
                  value={precioRef50ml}
                  onChange={(e) =>
                    setPrecioRef50ml(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </label>

              {/* Presentaciones Fraccionadas (Decants) */}
              <div
                className="full-field"
                style={{
                  marginTop: "10px",
                  padding: "16px 18px",
                  background: "rgba(215, 173, 87, 0.05)",
                  border: "1px solid rgba(215, 173, 87, 0.25)",
                  borderRadius: "8px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ width: "18px", height: "18px", accentColor: "#d7ad57" }}
                    checked={tieneDecants}
                    onChange={(e) => setTieneDecants(e.target.checked)}
                  />
                  <span style={{ fontSize: "14px", color: "var(--foreground)" }}>
                    Habilitar venta fraccionada (Decants y muestras de viaje)
                  </span>
                </label>
                <p
                  style={{
                    margin: "6px 0 0 28px",
                    fontSize: "12px",
                    color: "var(--muted)",
                    lineHeight: 1.45,
                  }}
                >
                  Permite a los clientes adquirir muestras oficiales en atomizadores de viaje de 5 ml y 10 ml. Al activarse, este perfume aparecerá automáticamente en la sección <strong>Decants</strong> del catálogo público.
                </p>

                {tieneDecants && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      marginTop: "14px",
                      paddingLeft: "28px",
                    }}
                  >
                    <label>
                      Precio Decant 5 ml (S/) *
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required={tieneDecants}
                        placeholder="Ej. 45"
                        value={precioDecant5ml}
                        onChange={(e) =>
                          setPrecioDecant5ml(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </label>

                    <label>
                      Precio Decant 10 ml (S/) (Opcional)
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ej. 80"
                        value={precioDecant10ml}
                        onChange={(e) =>
                          setPrecioDecant10ml(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </fieldset>
        )}

        {/* 3. SECCIÓN: GALERÍA DE FRAGANCIA Y ESTADO */}
        {activeTab === "galeria" && (
          <>
            <fieldset className="admin-fieldset">
              <legend className="admin-fieldset-legend">
                <span>Paso 3 · Galería Visual</span>
                Galería de Fragancia (Portada obligatoria · Secundarias opcionales)
              </legend>

              <p style={{ margin: "0 0 10px 0", fontSize: "11px", color: "var(--muted)" }}>
                La foto de portada es indispensable para la tienda y el catálogo. La caja
                oficial y el detalle editorial son opcionales. Puedes subir imágenes a Cloudflare R2 o mantener una URL existente.
              </p>

              {errorSubida && <div className="photo-upload-error">⚠ {errorSubida}</div>}

              <div className="photo-slots-grid">
                {/* Foto 1: Portada (Obligatoria) */}
                <div className="photo-slot-card">
                  <div className="photo-slot-header">
                    <span className="photo-slot-title">1. Portada / Frasco *</span>
                    <span className="photo-slot-badge principal">Obligatoria</span>
                  </div>
                  <div className="photo-slot-preview">
                    {fotoPortada ? (
                      <img
                        src={fotoPortada}
                        alt="Vista previa portada"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/logo-no-fondo300.png";
                        }}
                      />
                    ) : (
                      <span className="photo-slot-empty">Sin imagen</span>
                    )}
                  </div>
                  <div className="photo-slot-actions">
                    <label className={`btn-upload-file ${subiendoSlot === 1 ? "uploading" : ""}`}>
                      {subiendoSlot === 1 ? "⏳ Subiendo..." : "📷 Subir archivo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        disabled={subiendoSlot !== null}
                        style={{ display: "none" }}
                        onChange={(e) => manejarSubidaArchivo(e, 1, setFotoPortada)}
                      />
                    </label>
                    {fotoPortada && (
                      <button
                        type="button"
                        className="btn-clear-photo"
                        onClick={() => setFotoPortada("")}
                        title="Limpiar campo"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="photo-slot-input">
                    <span className="photo-slot-url-label">URL de la imagen</span>
                    <input
                      required
                      placeholder="https://... o /api/images/..."
                      value={fotoPortada}
                      onChange={(e) => setFotoPortada(e.target.value)}
                    />
                  </div>
                </div>

                {/* Foto 2: Caja y Empaque (Opcional) */}
                <div className="photo-slot-card">
                  <div className="photo-slot-header">
                    <span className="photo-slot-title">2. Caja / Empaque</span>
                    <span className="photo-slot-badge">Opcional</span>
                  </div>
                  <div className="photo-slot-preview">
                    {fotoCaja ? (
                      <img
                        src={fotoCaja}
                        alt="Vista previa caja"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/logo-no-fondo300.png";
                        }}
                      />
                    ) : (
                      <span className="photo-slot-empty">Opcional (sin foto)</span>
                    )}
                  </div>
                  <div className="photo-slot-actions">
                    <label className={`btn-upload-file ${subiendoSlot === 2 ? "uploading" : ""}`}>
                      {subiendoSlot === 2 ? "⏳ Subiendo..." : "📷 Subir archivo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        disabled={subiendoSlot !== null}
                        style={{ display: "none" }}
                        onChange={(e) => manejarSubidaArchivo(e, 2, setFotoCaja)}
                      />
                    </label>
                    {fotoCaja && (
                      <button
                        type="button"
                        className="btn-clear-photo"
                        onClick={() => setFotoCaja("")}
                        title="Limpiar campo"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="photo-slot-input">
                    <span className="photo-slot-url-label">URL de la imagen</span>
                    <input
                      placeholder="https://... o /api/images/..."
                      value={fotoCaja}
                      onChange={(e) => setFotoCaja(e.target.value)}
                    />
                  </div>
                </div>

                {/* Foto 3: Detalle y Contexto (Opcional) */}
                <div className="photo-slot-card">
                  <div className="photo-slot-header">
                    <span className="photo-slot-title">3. Detalle / Contexto</span>
                    <span className="photo-slot-badge">Opcional</span>
                  </div>
                  <div className="photo-slot-preview">
                    {fotoDetalle ? (
                      <img
                        src={fotoDetalle}
                        alt="Vista previa detalle"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/logo-no-fondo300.png";
                        }}
                      />
                    ) : (
                      <span className="photo-slot-empty">Opcional (sin foto)</span>
                    )}
                  </div>
                  <div className="photo-slot-actions">
                    <label className={`btn-upload-file ${subiendoSlot === 3 ? "uploading" : ""}`}>
                      {subiendoSlot === 3 ? "⏳ Subiendo..." : "📷 Subir archivo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        disabled={subiendoSlot !== null}
                        style={{ display: "none" }}
                        onChange={(e) => manejarSubidaArchivo(e, 3, setFotoDetalle)}
                      />
                    </label>
                    {fotoDetalle && (
                      <button
                        type="button"
                        className="btn-clear-photo"
                        onClick={() => setFotoDetalle("")}
                        title="Limpiar campo"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="photo-slot-input">
                    <span className="photo-slot-url-label">URL de la imagen</span>
                    <input
                      placeholder="https://... o /api/images/..."
                      value={fotoDetalle}
                      onChange={(e) => setFotoDetalle(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* 4. SECCIÓN: VISIBILIDAD Y PUBLICACIÓN */}
            <fieldset className="admin-fieldset">
              <legend className="admin-fieldset-legend">
                <span>Paso 4 · Estado</span>
                Publicación en Catálogo
              </legend>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label className="check-row" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                  />
                  <span />
                  <strong>Perfume activo en catálogo y pedidos por WhatsApp</strong>
                </label>

                <label className="check-row" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={esDestacado}
                    onChange={(e) => setEsDestacado(e.target.checked)}
                  />
                  <span />
                  <strong>Destacar en la página de inicio (Selección Destacada)</strong>
                </label>
              </div>
            </fieldset>
          </>
        )}

        {/* ACCIONES DEL MODAL CON FLUJO DE PASOS */}
        <div className="modal-actions-split">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>

          <div className="modal-actions-right">
            {activeTab === "identidad" && (
              <button
                type="button"
                className="btn btn-gold"
                onClick={irAFormatos}
              >
                Siguiente: Formatos y Precios →
              </button>
            )}

            {activeTab === "formatos" && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setActiveTab("identidad")}
                >
                  ← Anterior: Identidad
                </button>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={irAGaleria}
                >
                  Siguiente: Galería →
                </button>
              </>
            )}

            {activeTab === "galeria" && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setActiveTab("formatos")}
                >
                  ← Anterior: Formatos
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando cambios..."
                    : esEdicion
                      ? "✓ Guardar cambios"
                      : "✓ Crear perfume"}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
