import { useState, useEffect } from "react";
import type {
  ProductoAdminItem,
  MarcaItem,
  FamiliaOlfativaItem,
  DatosFormularioProducto,
} from "@/types/database";
import type { Gender } from "@/types/product";
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

  // Fotos: Portada obligatoria, caja y detalle opcionales
  const [fotoPortada, setFotoPortada] = useState(
    initialProduct?.imagenes[0] ||
      "https://images.unsplash.com/photo-1594036436267-2750a8ab2ae2?auto=format&fit=crop&w=900&q=85",
  );
  const [fotoCaja, setFotoCaja] = useState(initialProduct?.imagenes[1] || "");
  const [fotoDetalle, setFotoDetalle] = useState(initialProduct?.imagenes[2] || "");

  const [esDestacado, setEsDestacado] = useState(initialProduct?.es_destacado ?? false);
  const [activo, setActivo] = useState(initialProduct?.activo ?? true);

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

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion("");

    if (!nombre.trim()) {
      setErrorValidacion("El nombre de la fragancia es obligatorio.");
      return;
    }
    if (!precio50ml || Number(precio50ml) <= 0) {
      setErrorValidacion("El precio para la presentación de 50 ml debe ser mayor a 0.");
      return;
    }
    if (!precio100ml || Number(precio100ml) <= 0) {
      setErrorValidacion("El precio para la presentación de 100 ml debe ser mayor a 0.");
      return;
    }
    if (!fotoPortada.trim()) {
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
        throw new Error(resultado?.error || "Error al procesar la solicitud en D1.");
      }

      if (onReloadMetadata && (modoNuevaMarca || modoNuevaFamilia)) {
        await onReloadMetadata();
      }

      onSuccess(
        esEdicion
          ? `✓ "${nombre}" actualizado correctamente en Cloudflare D1.`
          : `✓ "${nombre}" creado exitosamente en Cloudflare D1.`,
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
            <small>Catálogo · Boutique Maison</small>
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

        {errorValidacion && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fdf2f2",
              border: "1px solid #f8b4b4",
              borderRadius: "4px",
              color: "#9b1c1c",
              fontSize: "10px",
              marginBottom: "16px",
            }}
          >
            ⚠ {errorValidacion}
          </div>
        )}

        {/* 1. SECCIÓN: IDENTIDAD Y CASA DE PERFUMERÍA */}
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
                            title="Ver en boutique (abre en nueva pestaña)"
                          >
                            Ver ↗
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
                    onChange={(e) => setMarcaId(Number(e.target.value))}
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

        {/* 2. SECCIÓN: PRESENTACIONES Y PRECIOS EN SOLES */}
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
          </div>
        </fieldset>

        {/* 3. SECCIÓN: GALERÍA DE FRAGANCIA */}
        <fieldset className="admin-fieldset">
          <legend className="admin-fieldset-legend">
            <span>Paso 3 · Curaduría Visual</span>
            Galería de Fragancia (Portada obligatoria · Secundarias opcionales)
          </legend>

          <p style={{ margin: "0 0 10px 0", fontSize: "9px", color: "var(--muted)" }}>
            La foto de portada es indispensable para la boutique y el catálogo. La caja
            oficial y el detalle editorial son opcionales y pueden añadirse ahora o más
            adelante. Puedes subir imágenes desde tu dispositivo o mantener/pegar una URL existente.
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
                      (e.target as HTMLImageElement).src = "/assets/maison-logo.jpeg";
                    }}
                  />
                ) : (
                  <span className="photo-slot-empty">Sin imagen</span>
                )}
              </div>
              <div className="photo-slot-actions">
                <label className={`btn-upload-file ${subiendoSlot === 1 ? "uploading" : ""}`}>
                  {subiendoSlot === 1 ? "⏳ Subiendo a R2..." : "📷 Subir archivo"}
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
                      (e.target as HTMLImageElement).src = "/assets/maison-logo.jpeg";
                    }}
                  />
                ) : (
                  <span className="photo-slot-empty">Opcional (sin foto)</span>
                )}
              </div>
              <div className="photo-slot-actions">
                <label className={`btn-upload-file ${subiendoSlot === 2 ? "uploading" : ""}`}>
                  {subiendoSlot === 2 ? "⏳ Subiendo a R2..." : "📷 Subir archivo"}
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
                      (e.target as HTMLImageElement).src = "/assets/maison-logo.jpeg";
                    }}
                  />
                ) : (
                  <span className="photo-slot-empty">Opcional (sin foto)</span>
                )}
              </div>
              <div className="photo-slot-actions">
                <label className={`btn-upload-file ${subiendoSlot === 3 ? "uploading" : ""}`}>
                  {subiendoSlot === 3 ? "⏳ Subiendo a R2..." : "📷 Subir archivo"}
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
            Publicación en Boutique
          </legend>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label className="check-row" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
              />
              <span />
              <strong>Perfume activo en catálogo y ventas por WhatsApp</strong>
            </label>

            <label className="check-row" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={esDestacado}
                onChange={(e) => setEsDestacado(e.target.checked)}
              />
              <span />
              <strong>Destacar en la página de inicio (Sección Curaduría)</strong>
            </label>
          </div>
        </fieldset>

        {/* ACCIONES DEL MODAL */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-gold" disabled={guardando}>
            {guardando
              ? "Guardando en Cloudflare D1..."
              : esEdicion
              ? "Actualizar en Cloudflare D1"
              : "Crear perfume en Cloudflare D1"}
          </button>
        </div>
      </form>
    </div>
  );
}
