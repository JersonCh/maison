import React, { useState, useMemo } from "react";
import type { MarcaAdminItem } from "@/types/database";
import type { CommercialType } from "@/types/product";
import Icon from "@/components/ui/Icon";
import { PAISES_ORIGEN_COMBO } from "./product-form/constants";
import type { FiltroLinea } from "./brands/types";
import BrandMetrics from "./brands/BrandMetrics";
import BrandCard from "./brands/BrandCard";
import BrandFormModal from "./brands/BrandFormModal";
import BrandDeleteModal from "./brands/BrandDeleteModal";

interface Props {
  marcas: MarcaAdminItem[];
  onRecargarMarcas: () => Promise<void>;
  onMostrarToast: (mensaje: string) => void;
  onFiltrarPorMarcaEnCatalogo?: (marcaNombre: string) => void;
}

export default function BrandsManagementPage({
  marcas,
  onRecargarMarcas,
  onMostrarToast,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroLinea, setFiltroLinea] = useState<FiltroLinea>("todas");

  // Estado del modal de crear / editar
  const [modalMarcaAbierto, setModalMarcaAbierto] = useState(false);
  const [marcaEnEdicion, setMarcaEnEdicion] = useState<MarcaAdminItem | null>(null);
  const [nombreForm, setNombreForm] = useState("");
  const [slugForm, setSlugForm] = useState("");
  const [lineaForm, setLineaForm] = useState<CommercialType>("disenador");
  const [paisOrigenForm, setPaisOrigenForm] = useState("");
  const [modoPaisPersonalizado, setModoPaisPersonalizado] = useState(false);
  const [activoForm, setActivoForm] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Estado del modal de eliminación / reasignación
  const [marcaAEliminar, setMarcaAEliminar] = useState<MarcaAdminItem | null>(null);
  const [marcaDestinoId, setMarcaDestinoId] = useState<number | "">("");
  const [eliminando, setEliminando] = useState(false);

  // Métricas
  const metricas = useMemo(() => {
    const total = marcas.length;
    const disenador = marcas.filter((m) => m.tipo_comercial === "disenador").length;
    const arabe = marcas.filter((m) => m.tipo_comercial === "arabe").length;
    const nicho = marcas.filter((m) => m.tipo_comercial === "nicho").length;
    return { total, disenador, arabe, nicho };
  }, [marcas]);

  // Filtrado de marcas
  const marcasFiltradas = useMemo(() => {
    return marcas.filter((m) => {
      const coincideBusqueda =
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.slug.toLowerCase().includes(busqueda.toLowerCase());

      const coincideLinea =
        filtroLinea === "todas" ? true : m.tipo_comercial === filtroLinea;

      return coincideBusqueda && coincideLinea;
    });
  }, [marcas, busqueda, filtroLinea]);

  // Abrir modal de creación
  const handleAbrirCrear = () => {
    setMarcaEnEdicion(null);
    setNombreForm("");
    setSlugForm("");
    setLineaForm("disenador");
    setPaisOrigenForm("");
    setModoPaisPersonalizado(false);
    setActivoForm(true);
    setErrorModal(null);
    setModalMarcaAbierto(true);
  };

  // Abrir modal de edición
  const handleAbrirEditar = (m: MarcaAdminItem) => {
    setMarcaEnEdicion(m);
    setNombreForm(m.nombre);
    setSlugForm(m.slug);
    setLineaForm(m.tipo_comercial);
    const pais = m.pais_origen?.trim() || "";
    setPaisOrigenForm(pais);
    setModoPaisPersonalizado(Boolean(pais) && !PAISES_ORIGEN_COMBO.includes(pais));
    setActivoForm(m.activo);
    setErrorModal(null);
    setModalMarcaAbierto(true);
  };

  // Guardar marca (crear o editar)
  const handleGuardarMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreForm.trim()) {
      setErrorModal("El nombre de la casa de perfumería es obligatorio.");
      return;
    }

    setGuardando(true);
    setErrorModal(null);

    try {
      const esEdicion = Boolean(marcaEnEdicion);
      const url = "/api/admin/brands";
      const method = esEdicion ? "PUT" : "POST";

      const payload = {
        id: marcaEnEdicion?.id,
        nombre: nombreForm.trim(),
        slug: slugForm.trim() || undefined,
        tipo_comercial: lineaForm,
        pais_origen: paisOrigenForm.trim() || null,
        activo: activoForm,
      };

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Error al procesar la solicitud.");
      }

      setModalMarcaAbierto(false);
      await onRecargarMarcas();
      onMostrarToast(data.mensaje || "Operación realizada con éxito.");
    } catch (err: any) {
      setErrorModal(err.message || "Error al comunicarse con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  // Alternar estado activo / pausado
  const handleAlternarEstado = async (m: MarcaAdminItem) => {
    const nuevoEstado = !m.activo;
    try {
      const resp = await fetch("/api/admin/brands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, activo: nuevoEstado }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "No se pudo actualizar el estado.");
      }

      await onRecargarMarcas();
      onMostrarToast(
        nuevoEstado
          ? `✓ Casa "${m.nombre}" activada en el catálogo.`
          : `Casa "${m.nombre}" puesta en pausa.`
      );
    } catch (err: any) {
      onMostrarToast(`⚠ ${err.message || "Error de conexión."}`);
    }
  };

  // Confirmar eliminación o transferencia
  const handleConfirmarEliminar = async () => {
    if (!marcaAEliminar) return;

    const totalProductos = Number(marcaAEliminar.total_productos ?? 0);
    if (totalProductos > 0 && !marcaDestinoId) {
      onMostrarToast("⚠ Debes seleccionar una firma de destino para transferir sus fragancias.");
      return;
    }

    setEliminando(true);

    try {
      const resp = await fetch("/api/admin/brands", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: marcaAEliminar.id,
          reasignar_a: marcaDestinoId ? Number(marcaDestinoId) : undefined,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Error al retirar la firma del catálogo.");
      }

      setMarcaAEliminar(null);
      setMarcaDestinoId("");
      await onRecargarMarcas();
      onMostrarToast(data.mensaje || "Casa de perfumería retirada con éxito.");
    } catch (err: any) {
      onMostrarToast(`⚠ ${err.message || "Error al procesar la solicitud."}`);
    } finally {
      setEliminando(false);
    }
  };

  const tabs = [
    { id: "todas" as FiltroLinea, label: `Todas (${metricas.total})` },
    { id: "disenador" as FiltroLinea, label: `Diseñador (${metricas.disenador})` },
    { id: "arabe" as FiltroLinea, label: `Árabe (${metricas.arabe})` },
    { id: "nicho" as FiltroLinea, label: `Nicho (${metricas.nicho})` },
  ];

  return (
    <div className="brands-page-container">
      {/* 1. BARRA SUPERIOR DE ACCIONES */}
      <div className="brands-top-bar">
        <p className="brands-top-desc">
          Gestión de marcas y clasificación por líneas comerciales del catálogo oficial.
        </p>

        <button
          type="button"
          className="btn btn-gold brands-create-btn"
          onClick={handleAbrirCrear}
        >
          <Icon name="plus" size={14} />
          Nueva Casa de Perfumería
        </button>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS */}
      <BrandMetrics
        metricas={metricas}
        filtroLinea={filtroLinea}
        onSelectFiltro={setFiltroLinea}
      />

      {/* 3. BARRA DE HERRAMIENTAS: BÚSQUEDA Y PESTAÑAS */}
      <div className="brands-toolbar">
        <div className="brands-search-wrap">
          <span className="brands-search-icon">
            <Icon name="search" size={15} />
          </span>
          <input
            type="search"
            placeholder="Buscar por nombre de casa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="brands-search-input"
          />
        </div>

        <div className="brands-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroLinea(tab.id)}
              className={`brands-tab-btn${filtroLinea === tab.id ? " is-active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. GRID DE TARJETAS DE CASAS DE PERFUMERÍA */}
      {marcasFiltradas.length === 0 ? (
        <div className="brands-empty">
          <p>
            No se encontraron casas de perfumería que coincidan con la búsqueda o filtro.
          </p>
          <button
            type="button"
            className="btn btn-outline brands-empty-btn"
            onClick={() => {
              setBusqueda("");
              setFiltroLinea("todas");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="brands-grid">
          {marcasFiltradas.map((m) => (
            <BrandCard
              key={m.id}
              marca={m}
              onAlternarEstado={handleAlternarEstado}
              onEditar={handleAbrirEditar}
              onSolicitarEliminar={(marca) => {
                setMarcaAEliminar(marca);
                setMarcaDestinoId("");
              }}
            />
          ))}
        </div>
      )}

      {/* 5. MODAL DE CREACIÓN / EDICIÓN DE CASA DE PERFUMERÍA */}
      <BrandFormModal
        isOpen={modalMarcaAbierto}
        onClose={() => setModalMarcaAbierto(false)}
        onSave={handleGuardarMarca}
        marcaEnEdicion={marcaEnEdicion}
        nombre={nombreForm}
        setNombre={setNombreForm}
        linea={lineaForm}
        setLinea={setLineaForm}
        paisOrigen={paisOrigenForm}
        setPaisOrigen={setPaisOrigenForm}
        modoPaisPersonalizado={modoPaisPersonalizado}
        setModoPaisPersonalizado={setModoPaisPersonalizado}
        activo={activoForm}
        setActivo={setActivoForm}
        guardando={guardando}
        error={errorModal}
      />

      {/* 6. MODAL DE ELIMINACIÓN Y REASIGNACIÓN */}
      <BrandDeleteModal
        marcaAEliminar={marcaAEliminar}
        marcas={marcas}
        marcaDestinoId={marcaDestinoId}
        setMarcaDestinoId={setMarcaDestinoId}
        eliminando={eliminando}
        onClose={() => setMarcaAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
      />
    </div>
  );
}
