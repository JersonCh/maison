import React, { useState, useRef, useEffect } from "react";
import type { DatosFormularioProducto, MarcaItem } from "@/types/database";
import type { Gender, CommercialType } from "@/types/product";
import { slugify } from "@/lib/slug";
import { optimizarImagenParaWebP } from "@/lib/imageOptimization";
import {
  TAMANOS_FRASCO_ESTANDAR,
  obtenerPrecioMinimoFrasco,
  type CampoPrecioFrasco,
  type CampoPrecioReferenciaFrasco,
} from "@/lib/frascos";
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
  onNavigateToBrands,
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

  // Lista local reactiva de casas de perfumería
  const [listaMarcas, setListaMarcas] = useState<MarcaItem[]>(marcasDisponibles);

  useEffect(() => {
    if (marcasDisponibles && marcasDisponibles.length > 0) {
      setListaMarcas(marcasDisponibles);
      if (!marcaId && !esEdicion) {
        setMarcaId(marcasDisponibles[0].id);
      }
    }
  }, [marcasDisponibles]);

  const [marcaId, setMarcaId] = useState<number>(
    initialProduct?.marca_id || (marcasDisponibles.length > 0 ? marcasDisponibles[0].id : 0),
  );
  const [modoNuevaMarca, setModoNuevaMarca] = useState(false);
  const [nuevaMarca, setNuevaMarca] = useState("");

  const handleMarcaCreada = async (nueva: {
    id: number;
    nombre: string;
    tipo_comercial?: CommercialType;
    pais_origen?: string;
  }) => {
    setListaMarcas((prev) => {
      if (prev.some((m) => m.id === nueva.id)) return prev;
      const item: MarcaItem = {
        id: nueva.id,
        nombre: nueva.nombre,
        slug: slugify(nueva.nombre),
        tipo_comercial: nueva.tipo_comercial || "disenador",
        pais_origen: nueva.pais_origen || "Francia",
      };
      return [...prev, item].sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
    setMarcaId(nueva.id);
    if (nueva.tipo_comercial) setTipoComercial(nueva.tipo_comercial);
    if (nueva.pais_origen) setPaisOrigen(nueva.pais_origen);
    if (onReloadMetadata) {
      await onReloadMetadata();
    }
  };

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

  // Precios en Soles (50, 75, 100, 125, 150 y 200 ml; vacíos en creación para usar placeholders)
  const [preciosFrascos, setPreciosFrascos] = useState<
    Record<CampoPrecioFrasco, number | "">
  >(() => {
    const mapa = {} as Record<CampoPrecioFrasco, number | "">;
    for (const { field } of TAMANOS_FRASCO_ESTANDAR) {
      const val = initialProduct?.[field];
      mapa[field] = val && val > 0 ? val : "";
    }
    return mapa;
  });

  const actualizarPrecioFrasco = (field: CampoPrecioFrasco, value: number | "") => {
    setPreciosFrascos((prev) => ({ ...prev, [field]: value }));
  };

  const [preciosReferencia, setPreciosReferencia] = useState<
    Record<CampoPrecioReferenciaFrasco, number | "">
  >(() => {
    const mapa = {} as Record<CampoPrecioReferenciaFrasco, number | "">;
    for (const { refField } of TAMANOS_FRASCO_ESTANDAR) {
      const val = initialProduct?.[refField];
      mapa[refField] = val && val > 0 ? val : "";
    }
    return mapa;
  });

  const [referenciasHabilitadas, setReferenciasHabilitadas] = useState<
    Record<CampoPrecioReferenciaFrasco, boolean>
  >(() => {
    const mapa = {} as Record<CampoPrecioReferenciaFrasco, boolean>;
    for (const { refField } of TAMANOS_FRASCO_ESTANDAR) {
      const val = initialProduct?.[refField];
      mapa[refField] = Boolean(val && val > 0);
    }
    return mapa;
  });

  const toggleReferencia = (
    refField: CampoPrecioReferenciaFrasco,
    habilitada: boolean,
  ) => {
    setReferenciasHabilitadas((prev) => ({ ...prev, [refField]: habilitada }));
    if (!habilitada) {
      setPreciosReferencia((prev) => ({ ...prev, [refField]: "" }));
    }
  };

  const actualizarPrecioReferencia = (
    refField: CampoPrecioReferenciaFrasco,
    value: number | "",
  ) => {
    setPreciosReferencia((prev) => ({ ...prev, [refField]: value }));
  };

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
      // Optimizar y convertir automáticamente a WebP de alta definición (< 1 MB)
      const archivoOptimizado = await optimizarImagenParaWebP(archivo, {
        maxAncho: 900,
        maxAlto: 1200,
        calidadInicial: 0.85,
        maxBytes: 1024 * 1024, // 1 MB máximo garantizado
      });

      const formData = new FormData();
      formData.append("file", archivoOptimizado);

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

    if (!modoNuevaMarca && (!marcaId || !listaMarcas.some((m) => m.id === marcaId))) {
      setErrorValidacion("Debes seleccionar una casa de perfumería (marca).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (modoNuevaMarca && !nuevaMarca.trim()) {
      setErrorValidacion("Debes escribir el nombre de la nueva casa de perfumería.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const tieneAlgunFrasco = TAMANOS_FRASCO_ESTANDAR.some(
      ({ field }) => preciosFrascos[field] !== "" && Number(preciosFrascos[field]) > 0,
    );

    if (!tieneAlgunFrasco) {
      setErrorValidacion(
        "Debes ingresar el precio de al menos una presentación de frasco (50, 75, 100, 125, 150 o 200 ml).",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    for (const { ml, field, refField } of TAMANOS_FRASCO_ESTANDAR) {
      if (!referenciasHabilitadas[refField]) continue;
      const rawRef = preciosReferencia[refField];
      if (rawRef === "" || Number(rawRef) <= 0) continue;

      const precioNormal = Number(preciosFrascos[field] || 0);
      if (precioNormal <= 0) {
        setErrorValidacion(
          `Para asignar precio tachado a ${ml} ml, primero ingresa su precio de venta.`,
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (Number(rawRef) <= precioNormal) {
        setErrorValidacion(
          `El precio tachado de ${ml} ml debe ser mayor al precio normal (S/ ${precioNormal}).`,
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
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

      const cargaPrecios = {} as Record<CampoPrecioFrasco, number | null>;
      const cargaPreciosRef = {} as Record<CampoPrecioReferenciaFrasco, number | null>;
      for (const { field, refField } of TAMANOS_FRASCO_ESTANDAR) {
        const raw = preciosFrascos[field];
        const normal = raw !== "" && Number(raw) > 0 ? Number(raw) : null;
        cargaPrecios[field] = normal;

        const rawRef = preciosReferencia[refField];
        cargaPreciosRef[refField] =
          referenciasHabilitadas[refField] &&
          normal !== null &&
          rawRef !== "" &&
          Number(rawRef) > normal
            ? Number(rawRef)
            : null;
      }

      const cargaUtil: DatosFormularioProducto & { id?: number } = {
        nombre: nombre.trim(),
        slug: slug.trim() || undefined,
        marca_id: modoNuevaMarca ? undefined : (marcaId || undefined),
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
        ...cargaPrecios,
        ...cargaPreciosRef,
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

  const marcaActual = listaMarcas.find((m) => m.id === marcaId);

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
            marcasDisponibles={listaMarcas}
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
            onNavigateToBrands={onNavigateToBrands}
            onReloadMetadata={onReloadMetadata}
            onMarcaCreada={handleMarcaCreada}
          />

          {/* CARD 2: FORMATOS Y PRECIOS */}
          <ProductPricingCard
            preciosFrascos={preciosFrascos}
            onChangePrecioFrasco={actualizarPrecioFrasco}
            preciosReferencia={preciosReferencia}
            referenciasHabilitadas={referenciasHabilitadas}
            onToggleReferencia={toggleReferencia}
            onChangePrecioReferencia={actualizarPrecioReferencia}
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
          precioDesde={obtenerPrecioMinimoFrasco(preciosFrascos)}
          tipoComercial={tipoComercial}
          slug={slug}
        />
      </div>
    </div>
  );
}
