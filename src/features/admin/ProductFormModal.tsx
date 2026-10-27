import { useState, useEffect } from "react";
import type {
  ProductoAdminItem,
  MarcaItem,
  FamiliaOlfativaItem,
  DatosFormularioProducto,
} from "@/types/database";
import type { Gender } from "@/types/product";
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
  if (!isOpen) return null;

  const esEdicion = Boolean(initialProduct?.id);

  // Estados del formulario
  const [nombre, setNombre] = useState(initialProduct?.nombre || "");
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
            <label>
              Nombre del perfume *
              <input
                required
                placeholder="Ej. Baccarat Rouge 540"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </label>

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
            adelante.
          </p>

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
              <div className="photo-slot-input">
                <input
                  required
                  placeholder="URL imagen portada (obligatoria)..."
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
              <div className="photo-slot-input">
                <input
                  placeholder="URL imagen empaque (opcional)..."
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
              <div className="photo-slot-input">
                <input
                  placeholder="URL imagen detalle (opcional)..."
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
