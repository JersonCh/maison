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
  onFiltrarPorMarcaEnCatalogo,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroLinea, setFiltroLinea] = useState<FiltroLinea>("todas");

  // Estado del modal de crear / editar
  const [modalMarcaAbierto, setModalMarcaAbierto] = useState(false);
  const [marcaEnEdicion, setMarcaEnEdicion] = useState<MarcaAdminItem | null>(null);
  const [nombreForm, setNombreForm] = useState("");
  const [slugForm, setSlugForm] = useState("");
  const [lineaForm, setLineaForm] = useState<CommercialType>("disenador");
  const [paisOrigenForm, setPaisOrigenForm] = useState("Francia");
  const [modoPaisPersonalizado, setModoPaisPersonalizado] = useState(false);
  const [activoForm, setActivoForm] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Estado del modal de eliminación / reasignación
  const [marcaAEliminar, setMarcaAEliminar] = useState<MarcaAdminItem | null>(null);
  const [marcaDestinoId, setMarcaDestinoId] = useState<number | "">("");
  const [eliminando, setEliminando] = useState(false);

  // Métricas calculadas
  const metricas = useMemo(() => {
    const total = marcas.length;
    const disenador = marcas.filter((m) => m.tipo_comercial === "disenador").length;
    const arabe = marcas.filter((m) => m.tipo_comercial === "arabe").length;
    const nicho = marcas.filter((m) => m.tipo_comercial === "nicho").length;
    return { total, disenador, arabe, nicho };
  }, [marcas]);

  // Filtrado reactivo de marcas
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

  // Manejo de creación
  const handleAbrirCrear = () => {
    setMarcaEnEdicion(null);
    setNombreForm("");
    setSlugForm("");
    setLineaForm("disenador");
    setPaisOrigenForm("Francia");
    setModoPaisPersonalizado(false);
    setActivoForm(true);
    setErrorModal(null);
    setModalMarcaAbierto(true);
  };

  // Manejo de edición
  const handleAbrirEditar = (m: MarcaAdminItem) => {
    setMarcaEnEdicion(m);
    setNombreForm(m.nombre);
    setSlugForm(m.slug);
    setLineaForm(m.tipo_comercial);
    const pais = m.pais_origen || "Francia";
    setPaisOrigenForm(pais);
    setModoPaisPersonalizado(!PAISES_ORIGEN_COMBO.includes(pais));
    setActivoForm(m.activo);
    setErrorModal(null);
    setModalMarcaAbierto(true);
  };

  // Guardar marca
  const handleGuardarMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreForm.trim()) {
      setErrorModal("El nombre de la casa de perfumería es obligatorio.");
      return;
    }

    setGuardando(true);
    setErrorModal(null);

    try {
      const url = "/api/admin/brands";
      const method = marcaEnEdicion ? "PUT" : "POST";
      const body = {
        id: marcaEnEdicion?.id,
        nombre: nombreForm.trim(),
        tipo_comercial: lineaForm,
        pais_origen: paisOrigenForm.trim() || "Francia",
        activo: activoForm,
      };

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setErrorModal(data.error || "Ocurrió un error al guardar la firma.");
        setGuardando(false);
        return;
      }

      onMostrarToast(
        marcaEnEdicion
          ? `Firma "${nombreForm}" actualizada correctamente.`
          : `Casa de perfumería "${nombreForm}" registrada en catálogo.`
      );

      setModalMarcaAbierto(false);
      await onRecargarMarcas();
    } catch {
      setErrorModal("Error de red al intentar contactar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  // Alternar estado activo / pausado
  const handleAlternarEstado = async (m: MarcaAdminItem) => {
    try {
      const resp = await fetch("/api/admin/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: m.id,
          nombre: m.nombre,
          tipo_comercial: m.tipo_comercial,
          pais_origen: m.pais_origen,
          activo: !m.activo,
        }),
      });

      if (!resp.ok) {
        onMostrarToast("No se pudo cambiar el estado de la firma.");
        return;
      }

      onMostrarToast(
        !m.activo
          ? `✓ Firma "${m.nombre}" activada en el catálogo.`
          : `⏸ Firma "${m.nombre}" pausada en el catálogo.`
      );
      await onRecargarMarcas();
    } catch {
      onMostrarToast("Error de conexión al actualizar estado.");
    }
  };

  // Confirmar eliminación o reasignación
  const handleConfirmarEliminar = async () => {
    if (!marcaAEliminar) return;

    if (marcaAEliminar.total_productos > 0 && !marcaDestinoId) {
      onMostrarToast("Selecciona una firma de destino para reasignar los perfumes.");
      return;
    }

    setEliminando(true);

    try {
      const resp = await fetch("/api/admin/brands", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: marcaAEliminar.id,
          marca_destino_id: marcaDestinoId || undefined,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        onMostrarToast(data.error || "Error al retirar la firma.");
        setEliminando(false);
        return;
      }

      onMostrarToast(
        data.productos_reasignados > 0
          ? `✓ Firma retirada. Se reasignaron ${data.productos_reasignados} perfumes correctamente.`
          : `✓ Firma "${marcaAEliminar.nombre}" retirada del catálogo.`
      );

      setMarcaAEliminar(null);
      await onRecargarMarcas();
    } catch {
      onMostrarToast("Error de conexión al eliminar la firma.");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="w-full">
      {/* 1. Encabezado */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5 border-b border-[var(--line)]">
        <div>
          <span className="text-[10.5px] uppercase tracking-widest font-semibold text-[var(--gold-deep)] block mb-1">
            Gestión de Casas de Perfumería
          </span>
          <h1 className="font-serif text-2xl text-[var(--ink)] font-normal m-0 tracking-tight">
            Firmas Oficiales del Catálogo
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 mb-0">
            Administra las firmas, su línea comercial (Diseñador, Árabe o Nicho) y país de procedencia.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-gold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          onClick={handleAbrirCrear}
        >
          <Icon name="plus" size={15} />
          <span>Registrar nueva firma</span>
        </button>
      </header>

      {/* 2. Tarjetas de Métricas */}
      <BrandMetrics
        metricas={metricas}
        filtroLinea={filtroLinea}
        onSelectFiltro={setFiltroLinea}
      />

      {/* 3. Barra de herramientas: Búsqueda y Pestañas */}
      <div className="bg-white border border-[var(--line)] rounded p-3 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[260px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
            <Icon name="search" size={15} />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre oficial o slug de la firma..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs border border-[var(--line)] rounded bg-[var(--ivory)] text-[var(--ink)] outline-none focus:border-[var(--gold)]"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer text-sm p-1"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(
            [
              { id: "todas", label: "Todas" },
              { id: "disenador", label: "Diseñador" },
              { id: "arabe", label: "Árabes" },
              { id: "nicho", label: "Nicho / Autor" },
            ] as const
          ).map((tab) => {
            const isSelected = filtroLinea === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFiltroLinea(tab.id)}
                className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-[var(--gold)] text-white font-semibold"
                    : "bg-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Cuadrícula de Casas de Perfumería */}
      {marcasFiltradas.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[var(--line)] rounded">
          <div className="w-12 h-12 rounded-full bg-[var(--ivory)] border border-[var(--line)] flex items-center justify-center text-[var(--gold-deep)] mx-auto mb-3.5">
            <Icon name="search" size={20} />
          </div>
          <h3 className="font-serif text-lg text-[var(--ink)] font-normal m-0 mb-1.5">
            No se encontraron firmas registradas
          </h3>
          <p className="text-xs text-[var(--muted)] m-0 mb-4 max-w-md mx-auto">
            {busqueda
              ? `No hay casas que coincidan con "${busqueda}". Prueba con otro término.`
              : "No hay casas registradas en esta línea comercial."}
          </p>
          <button
            type="button"
            className="btn btn-outline text-xs cursor-pointer"
            onClick={() => {
              setBusqueda("");
              setFiltroLinea("todas");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* 5. Modal de Creación / Edición */}
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

      {/* 6. Modal de Eliminación y Reasignación */}
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
