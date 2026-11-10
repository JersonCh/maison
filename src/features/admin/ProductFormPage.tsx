import React, { useState, useRef } from "react";
import type { DatosFormularioProducto } from "@/types/database";
import type { Gender, CommercialType } from "@/types/product";
import { slugify } from "@/lib/slug";
import Icon from "@/components/ui/Icon";
import {
  type ProductFormProps,
  PAISES_ORIGEN_COMBO,
  OCASIONES_USO_COMBO,
  ProductFormHeader,
  ProductGeneralCard,
  ProductPricingCard,
  ProductMediaCard,
  ProductFormSidebar,
} from "./product-form";

export default function ProductFormPage({
  initialProduct,
  marcasDisponibles,
  familiasDisponibles,
  onBack,
  onSuccess,
  onReloadMetadata,
  onOpenImportCsv,
}: ProductFormProps) {
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
    initialProduct?.precio_50ml && initialProduct.precio_50ml > 0
      ? initialProduct.precio_50ml
      : esEdicion ? "" : 490,
  );
  const [precio100ml, setPrecio100ml] = useState<number | "">(
    initialProduct?.precio_100ml && initialProduct.precio_100ml > 0
      ? initialProduct.precio_100ml
      : esEdicion ? "" : 620,
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

    const tiene50 = precio50ml !== "" && Number(precio50ml) > 0;
    const tiene100 = precio100ml !== "" && Number(precio100ml) > 0;

    if (!tiene50 && !tiene100) {
      setErrorValidacion("Debes ingresar el precio de al menos una presentación de frasco (50 ml o 100 ml).");
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
        fotoPortada.trim() || "/assets/imagenxdefecto.svg",
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
        precio_50ml: tiene50 ? Number(precio50ml) : null,
        precio_100ml: tiene100 ? Number(precio100ml) : null,
        precio_referencia_50ml: tiene50 && precioRef50ml !== "" ? Number(precioRef50ml) : null,
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
      <ProductFormHeader
        onBack={onBack}
        guardando={guardando}
        esEdicion={esEdicion}
        nombre={nombre}
        onOpenImportCsv={onOpenImportCsv}
        onSave={(continuarConOtro) => manejarEnvio(undefined, continuarConOtro)}
      />

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
          <ProductGeneralCard
            inputNombreRef={inputNombreRef}
            esEdicion={esEdicion}
            nombre={nombre}
            setNombre={setNombre}
            slug={slug}
            setSlug={setSlug}
            slugEditado={slugEditado}
            setSlugEditado={setSlugEditado}
            modoEditarSlug={modoEditarSlug}
            setModoEditarSlug={setModoEditarSlug}
            slugPersonalizado={slugPersonalizado}
            copiado={copiado}
            copiarEnlace={copiarEnlace}
            confirmarSlugEditado={confirmarSlugEditado}
            cancelarSlugEditado={cancelarSlugEditado}
            marcaId={marcaId}
            setMarcaId={setMarcaId}
            marcasDisponibles={marcasDisponibles}
            modoNuevaMarca={modoNuevaMarca}
            setModoNuevaMarca={setModoNuevaMarca}
            nuevaMarca={nuevaMarca}
            setNuevaMarca={setNuevaMarca}
            tipoComercial={tipoComercial}
            setTipoComercial={setTipoComercial}
            genero={genero}
            setGenero={setGenero}
            concentracion={concentracion}
            setConcentracion={setConcentracion}
            paisOrigen={paisOrigen}
            setPaisOrigen={setPaisOrigen}
            modoPaisPersonalizado={modoPaisPersonalizado}
            setModoPaisPersonalizado={setModoPaisPersonalizado}
            ocasionUso={ocasionUso}
            setOcasionUso={setOcasionUso}
            modoOcasionPersonalizada={modoOcasionPersonalizada}
            setModoOcasionPersonalizada={setModoOcasionPersonalizada}
            descripcion={descripcion}
            setDescripcion={setDescripcion}
          />

          {/* CARD 2: FORMATOS Y PRECIOS */}
          <ProductPricingCard
            precio50ml={precio50ml}
            setPrecio50ml={setPrecio50ml}
            precio100ml={precio100ml}
            setPrecio100ml={setPrecio100ml}
            precioRef50ml={precioRef50ml}
            setPrecioRef50ml={setPrecioRef50ml}
            tieneDecants={tieneDecants}
            setTieneDecants={setTieneDecants}
            precioDecant3ml={precioDecant3ml}
            setPrecioDecant3ml={setPrecioDecant3ml}
            precioDecant5ml={precioDecant5ml}
            setPrecioDecant5ml={setPrecioDecant5ml}
            precioDecant10ml={precioDecant10ml}
            setPrecioDecant10ml={setPrecioDecant10ml}
          />

          {/* CARD 3: GALERÍA VISUAL */}
          <ProductMediaCard
            fotoPortada={fotoPortada}
            setFotoPortada={setFotoPortada}
            fotoCaja={fotoCaja}
            setFotoCaja={setFotoCaja}
            fotoDetalle={fotoDetalle}
            setFotoDetalle={setFotoDetalle}
            subiendoSlot={subiendoSlot}
            errorSubida={errorSubida}
            manejarSubidaArchivo={manejarSubidaArchivo}
          />
        </div>

        {/* BARRA LATERAL (DERECHA - 32% STICKY) */}
        <ProductFormSidebar
          activo={activo}
          setActivo={setActivo}
          esDestacado={esDestacado}
          setEsDestacado={setEsDestacado}
          guardando={guardando}
          esEdicion={esEdicion}
          onSave={(continuarConOtro) => manejarEnvio(undefined, continuarConOtro)}
          onBack={onBack}
          fotoPortada={fotoPortada}
          nombre={nombre}
          modoNuevaMarca={modoNuevaMarca}
          nuevaMarca={nuevaMarca}
          marcaActual={marcaActual}
          precio50ml={precio50ml}
          tipoComercial={tipoComercial}
          slug={slug}
        />
      </div>
    </div>
  );
}
