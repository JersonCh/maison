import { useState, useRef } from "react";
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
  initialProduct?: ProductoAdminItem | null;
  marcasDisponibles: MarcaItem[];
  familiasDisponibles: FamiliaOlfativaItem[];
  onBack: () => void;
  onSuccess: (mensaje: string) => void;
  onReloadMetadata?: () => Promise<void>;
  onOpenImportCsv?: () => void;
}

const PAISES_ORIGEN_COMBO = [
  "Francia",
  "Italia",
  "Emiratos Árabes Unidos",
  "España",
  "Estados Unidos",
  "Reino Unido",
  "Alemania",
  "Suecia",
  "Suiza",
  "Omán",
];

const OCASIONES_USO_COMBO = [
  "Uso profesional diario y reuniones ejecutivas",
  "Uso diario refinado y citas especiales",
  "Noche, ocasiones especiales y eventos exclusivos",
  "Noche, fiesta y salidas nocturnas",
  "Día, clima cálido y reuniones sociales",
  "Noches frías y ocasiones de gala",
  "Día y noche, versatilidad total",
  "Día a día, viajes y momentos casuales",
  "Verano, frescura casual y paseos al aire libre",
  "Otoño e invierno, notas cálidas y maderas",
];

export default function ProductFormPage({
  initialProduct,
  marcasDisponibles,
  familiasDisponibles,
  onBack,
  onSuccess,
  onReloadMetadata,
  onOpenImportCsv,
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
  const inputNombreRef = useRef<HTMLInputElement>(null);
  const [mensajeExitoTemporal, setMensajeExitoTemporal] = useState<string | null>(null);
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
  const [modoPaisPersonalizado, setModoPaisPersonalizado] = useState(
    Boolean(
      initialProduct?.pais_origen &&
      !PAISES_ORIGEN_COMBO.includes(initialProduct.pais_origen),
    ),
  );
  const [ocasionUso, setOcasionUso] = useState(
    initialProduct?.ocasion_uso || "Uso profesional diario y reuniones ejecutivas",
  );
  const [modoOcasionPersonalizada, setModoOcasionPersonalizada] = useState(
    Boolean(
      initialProduct?.ocasion_uso &&
      !OCASIONES_USO_COMBO.includes(initialProduct.ocasion_uso),
    ),
  );

  // Precios en Soles
  const [precio50ml, setPrecio50ml] = useState<number | "">(
    initialProduct?.precio_50ml ?? 490,
  );
  const [precio100ml, setPrecio100ml] = useState<number | "">(
    initialProduct?.precio_100ml ?? 620,
  );
  const [precioRef50ml, setPrecioRef50ml] = useState<number | "">(
    initialProduct?.precio_referencia_50ml ?? "",
  );

  // Presentaciones de Decants (3ml, 5ml y 10ml)
  const [tieneDecants, setTieneDecants] = useState<boolean>(
    Boolean(
      initialProduct?.tiene_decants ||
      initialProduct?.precio_decant_3ml ||
      initialProduct?.precio_decant_5ml ||
      initialProduct?.precio_decant_10ml,
    ),
  );
  const [precioDecant3ml, setPrecioDecant3ml] = useState<number | "">(
    initialProduct?.precio_decant_3ml ?? "",
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

  const manejarEnvio = async (e?: React.FormEvent, continuarConOtro: boolean = false) => {
    if (e) e.preventDefault();
    setErrorValidacion("");
    setMensajeExitoTemporal(null);

    if (!nombre.trim()) {
      setErrorValidacion("El nombre de la fragancia es obligatorio.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!precio50ml || Number(precio50ml) <= 0) {
      setErrorValidacion("El precio para la presentación de 50 ml debe ser mayor a 0.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!precio100ml || Number(precio100ml) <= 0) {
      setErrorValidacion("El precio para la presentación de 100 ml debe ser mayor a 0.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (tieneDecants) {
      const p3 = Number(precioDecant3ml);
      const p5 = Number(precioDecant5ml);
      const p10 = Number(precioDecant10ml);
      if ((!p3 || p3 <= 0) && (!p5 || p5 <= 0) && (!p10 || p10 <= 0)) {
        setErrorValidacion(
          "Si habilitas decants, ingresa el precio para al menos una de las presentaciones (3 ml, 5 ml o 10 ml).",
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setGuardando(true);

    try {
      const fotosFinales = [
        fotoPortada.trim() || "/assets/logo-no-fondo300.png",
        fotoCaja.trim(),
        fotoDetalle.trim(),
      ].filter(Boolean);

      const cargaUtil: DatosFormularioProducto & { id?: number } = {
        nombre: nombre.trim(),
        slug: slug.trim() || undefined,
        marca_id: modoNuevaMarca ? undefined : marcaId,
        nueva_marca: modoNuevaMarca ? nuevaMarca.trim() : undefined,
        tipo_comercial: tipoComercial,
        tiene_decants: tieneDecants,
        precio_decant_3ml: tieneDecants && precioDecant3ml !== "" ? Number(precioDecant3ml) : null,
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
        fotos: fotosFinales,
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

      const nombreGuardado = nombre;

      if (continuarConOtro && !esEdicion) {
        // Notificar al dashboard para refrescar catálogo y mostrar Toast
        onSuccess(`✓ Fragancia "${nombreGuardado}" creada exitosamente.`);
        setMensajeExitoTemporal(`✓ "${nombreGuardado}" se guardó con éxito. Formulario listo para la siguiente fragancia.`);

        // Limpiar campos específicos del producto actual
        setNombre("");
        setSlug("");
        setSlugEditado("");
        setModoEditarSlug(false);
        setSlugPersonalizado(false);
        setDescripcion("");
        setFotoPortada("");
        setFotoCaja("");
        setFotoDetalle("");
        setEsDestacado(false);
        setModoNuevaMarca(false);
        setNuevaMarca("");

        // Mantiene Marca, Línea, Género, Concentración, País, Ocasión y Precios
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          inputNombreRef.current?.focus();
        }, 300);
      } else {
        onSuccess(
          esEdicion
            ? `✓ Fragancia "${nombreGuardado}" guardada correctamente.`
            : `✓ Fragancia "${nombreGuardado}" creada exitosamente.`,
        );
        onBack();
      }
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
      // Ignorar si el navegador restringe portapapeles
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

  const marcaActual = marcasDisponibles.find((m) => m.id === marcaId);

  return (
    <div className="product-page-container">
      {/* BARRA SUPERIOR EDITORIAL (STICKY) */}
      <header className="product-page-header">
        <div className="product-page-header-left">
          <button
            type="button"
            className="btn-back-link"
            onClick={onBack}
            disabled={guardando}
          >
            ← Volver a Perfumes
          </button>
          <div className="product-page-title-group">
            <span className="product-page-eyebrow">
              {esEdicion ? "Edición de Perfume" : "Nueva Fragancia"}
            </span>
            <h1 className="product-page-title">
              {nombre || (esEdicion ? "Sin título" : "Nueva creación olfativa")}
            </h1>
          </div>
        </div>

        <div className="product-page-header-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onBack}
            disabled={guardando}
          >
            Descartar
          </button>
          {!esEdicion && onOpenImportCsv && (
            <button
              type="button"
              className="btn btn-outline"
              style={{
                borderColor: "var(--gold)",
                color: "var(--ink)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--white)",
              }}
              onClick={onOpenImportCsv}
              title="Importar catálogo masivamente desde archivo Excel o CSV"
            >
              📥 Importar Excel / CSV
            </button>
          )}
          {!esEdicion && (
            <button
              type="button"
              className="btn btn-outline-gold"
              onClick={() => manejarEnvio(undefined, true)}
              disabled={guardando}
              title="Guarda esta fragancia y mantiene marca, país y precios para la siguiente"
            >
              + Guardar y añadir otro
            </button>
          )}
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => manejarEnvio(undefined, false)}
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : esEdicion
                ? "✓ Guardar cambios"
                : "✓ Publicar fragancia"}
          </button>
        </div>
      </header>

      {mensajeExitoTemporal && (
        <div className="product-page-alert-success">
          <Icon name="check" />
          <span>{mensajeExitoTemporal}</span>
          <button
            type="button"
            onClick={() => setMensajeExitoTemporal(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: 0,
              cursor: "pointer",
              color: "inherit",
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Cerrar mensaje"
          >
            <Icon name="close" />
          </button>
        </div>
      )}

      {errorValidacion && (
        <div className="product-page-alert-error">
          <Icon name="close" />
          <span>{errorValidacion}</span>
        </div>
      )}

      {/* DISPOSICIÓN EDITORIAL DE DOS COLUMNAS (SHOPIFY / MEDUSA STYLE) */}
      <div className="product-page-layout">
        {/* COLUMNA PRINCIPAL (IZQUIERDA - 68%) */}
        <div className="product-page-main">
          {/* CARD 1: IDENTIDAD OLFATIVA */}
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="card-badge">General</span>
                <h2 className="admin-card-title">Información del perfume</h2>
              </div>
              <span className="admin-card-subtitle">
                Datos principales y características
              </span>
            </div>

            <div className="form-grid">
              <div className="full-field">
                <label>
                  Nombre del perfume *
                  <input
                    ref={inputNombreRef}
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

                {/* Permalink SEO permanente */}
                <div className="permalink-box">
                  <div className="permalink-url-wrapper">
                    <span>Enlace permanente:&nbsp;</span>
                    <code>
                      https://maison.pe/perfumes/<strong>{slug || "nuevo-perfume"}</strong>
                    </code>
                  </div>

                  <div className="permalink-actions">
                    {esEdicion && !modoEditarSlug && (
                      <span className="permalink-badge">Enlace activo</span>
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
                              Ver en tienda ↗
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {modoEditarSlug && (
                    <div className="permalink-edit-row">
                      <input
                        type="text"
                        autoFocus
                        value={slugEditado}
                        onChange={(e) => setSlugEditado(e.target.value)}
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
                  <option value="Elixir">Elixir</option>
                  <option value="Eau de Toilette">Eau de Toilette (EDT)</option>
                  <option value="Eau de Cologne">Eau de Cologne</option>
                </select>
              </label>

              <div>
                <label>
                  País de origen (Procedencia)
                  {!modoPaisPersonalizado ? (
                    <select
                      value={PAISES_ORIGEN_COMBO.includes(paisOrigen) ? paisOrigen : "__otro__"}
                      onChange={(e) => {
                        if (e.target.value === "__otro__") {
                          setModoPaisPersonalizado(true);
                        } else {
                          setPaisOrigen(e.target.value);
                        }
                      }}
                    >
                      {PAISES_ORIGEN_COMBO.map((pais) => (
                        <option key={pais} value={pais}>
                          {pais}
                        </option>
                      ))}
                      <option value="__otro__">+ Otro país (escribir personalizado)...</option>
                    </select>
                  ) : (
                    <input
                      placeholder="Escribe el país de procedencia (ej. Japón)"
                      value={paisOrigen}
                      onChange={(e) => setPaisOrigen(e.target.value)}
                      autoFocus
                    />
                  )}
                </label>
                {modoPaisPersonalizado && (
                  <button
                    type="button"
                    className="toggle-field-btn"
                    onClick={() => {
                      setModoPaisPersonalizado(false);
                      setPaisOrigen(PAISES_ORIGEN_COMBO[0]);
                    }}
                  >
                    ← Elegir país de la lista
                  </button>
                )}
              </div>

              <div className="full-field">
                <label>
                  Ocasión de uso recomendada
                  {!modoOcasionPersonalizada ? (
                    <select
                      value={OCASIONES_USO_COMBO.includes(ocasionUso) ? ocasionUso : "__otro__"}
                      onChange={(e) => {
                        if (e.target.value === "__otro__") {
                          setModoOcasionPersonalizada(true);
                        } else {
                          setOcasionUso(e.target.value);
                        }
                      }}
                    >
                      {OCASIONES_USO_COMBO.map((ocasion) => (
                        <option key={ocasion} value={ocasion}>
                          {ocasion}
                        </option>
                      ))}
                      <option value="__otro__">+ Otra ocasión (escribir personalizada)...</option>
                    </select>
                  ) : (
                    <input
                      placeholder="Escribe la ocasión recomendada (ej. Cenas románticas y veladas íntimas)"
                      value={ocasionUso}
                      onChange={(e) => setOcasionUso(e.target.value)}
                      autoFocus
                    />
                  )}
                </label>
                {modoOcasionPersonalizada && (
                  <button
                    type="button"
                    className="toggle-field-btn"
                    onClick={() => {
                      setModoOcasionPersonalizada(false);
                      setOcasionUso(OCASIONES_USO_COMBO[0]);
                    }}
                  >
                    ← Elegir ocasión de la lista
                  </button>
                )}
              </div>

              <label className="full-field">
                Descripción y narrativa olfativa
                <textarea
                  rows={4}
                  placeholder="Describe la composición, acordes dominantes y la atmósfera del perfume..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </label>
            </div>
          </section>

          {/* CARD 2: FORMATOS Y PRECIOS */}
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="card-badge">Formatos</span>
                <h2 className="admin-card-title">Precios y presentaciones</h2>
              </div>
              <span className="admin-card-subtitle">
                Precios oficiales en Soles (S/)
              </span>
            </div>

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

              {/* Box destacado de Decants */}
              <div
                className="full-field"
                style={{
                  marginTop: "8px",
                  padding: "16px 20px",
                  background: "rgba(215, 173, 87, 0.05)",
                  border: "1px solid rgba(215, 173, 87, 0.25)",
                  borderRadius: "8px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
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
                    Habilitar venta en decants (3 ml, 5 ml y 10 ml)
                  </span>
                </label>

                {tieneDecants && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                      gap: "16px",
                      marginTop: "16px",
                      paddingLeft: "30px",
                    }}
                  >
                    <label>
                      Precio Decant 3 ml (S/)
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ej. 30"
                        value={precioDecant3ml}
                        onChange={(e) =>
                          setPrecioDecant3ml(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </label>

                    <label>
                      Precio Decant 5 ml (S/)
                      <input
                        type="number"
                        min="1"
                        step="1"
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
                      Precio Decant 10 ml (S/)
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
          </section>

          {/* CARD 3: GALERÍA VISUAL */}
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="card-badge">Imágenes</span>
                <h2 className="admin-card-title">Galería de fotos</h2>
              </div>
              <span className="admin-card-subtitle">
                Foto principal y vistas secundarias
              </span>
            </div>

            {errorSubida && <div className="photo-upload-error">⚠ {errorSubida}</div>}

            <div className="photo-slots-grid">
              {/* Foto 1: Portada (Obligatoria) */}
              <div className="photo-slot-card">
                <div className="photo-slot-header">
                  <span className="photo-slot-title">1. Portada principal *</span>
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
                  <span className="photo-slot-title">2. Caja o empaque</span>
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
                  <span className="photo-slot-title">3. Vista secundaria</span>
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
          </section>
        </div>

        {/* BARRA LATERAL (DERECHA - 32% STICKY) */}
        <aside className="product-page-sidebar">
          {/* CARD ESTADO Y PUBLICACIÓN */}
          <section className="admin-card sidebar-sticky-card">
            <h3 className="sidebar-card-title">Estado de Publicación</h3>

            <div className="sidebar-toggles">
              <label className="check-row" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                />
                <span />
                <div>
                  <strong style={{ display: "block", fontSize: "13px" }}>
                    {activo ? "Visible en catálogo" : "Borrador (Oculto)"}
                  </strong>
                  <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                    {activo
                      ? "Los clientes pueden comprarlo en tienda y WhatsApp."
                      : "No aparecerá en el catálogo público."}
                  </small>
                </div>
              </label>

              <label className="check-row" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={esDestacado}
                  onChange={(e) => setEsDestacado(e.target.checked)}
                />
                <span />
                <div>
                  <strong style={{ display: "block", fontSize: "13px" }}>
                    Selección Destacada
                  </strong>
                  <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                    Mostrar en la portada de la tienda.
                  </small>
                </div>
              </label>
            </div>

            <div className="sidebar-actions-btn-group">
              <button
                type="button"
                className="btn btn-gold"
                style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                onClick={() => manejarEnvio(undefined, false)}
                disabled={guardando}
              >
                {guardando
                  ? "Guardando cambios..."
                  : esEdicion
                    ? "✓ Guardar cambios"
                    : "✓ Publicar fragancia"}
              </button>
              {!esEdicion && (
                <button
                  type="button"
                  className="btn btn-outline-gold"
                  style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}
                  onClick={() => manejarEnvio(undefined, true)}
                  disabled={guardando}
                >
                  + Guardar y añadir otro
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center", marginTop: "6px" }}
                onClick={onBack}
                disabled={guardando}
              >
                Descartar cambios
              </button>
            </div>
          </section>

          {/* CARD VISTA PREVIA RÁPIDA */}
          <section className="admin-card">
            <h3 className="sidebar-card-title">Resumen de Ficha</h3>

            <div className="product-quick-summary">
              <div className="summary-thumb">
                {fotoPortada ? (
                  <img src={fotoPortada} alt={nombre} />
                ) : (
                  <div className="thumb-placeholder">Sin imagen</div>
                )}
              </div>
              <div className="summary-info">
                <span className="summary-brand">
                  {modoNuevaMarca ? nuevaMarca || "Nueva casa" : marcaActual?.nombre || "Marca"}
                </span>
                <strong className="summary-name">{nombre || "Nombre de fragancia"}</strong>
                <span className="summary-price">
                  {precio50ml ? `Desde S/ ${precio50ml}` : "Precio no definido"}
                </span>
                <span className="summary-line-badge">
                  {tipoComercial === "disenador"
                    ? "Diseñador"
                    : tipoComercial === "arabe"
                      ? "Árabe"
                      : "Nicho"}
                </span>
              </div>
            </div>

            {esEdicion && slug && (
              <a
                href={`/perfumes/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-view-live"
              >
                Ver ficha en la tienda pública ↗
              </a>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
