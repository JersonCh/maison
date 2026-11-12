import React, { useState, useMemo } from "react";
import type { MarcaAdminItem } from "@/types/database";
import type { CommercialType } from "@/types/product";
import Icon from "@/components/ui/Icon";
import { PAISES_ORIGEN_COMBO } from "./product-form/constants";

interface Props {
  marcas: MarcaAdminItem[];
  onRecargarMarcas: () => Promise<void>;
  onMostrarToast: (mensaje: string) => void;
  onFiltrarPorMarcaEnCatalogo?: (marcaNombre: string) => void;
}

type FiltroLinea = "todas" | "disenador" | "arabe" | "nicho";

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
    setPaisOrigenForm("Francia");
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
    const pais = m.pais_origen || "Francia";
    setPaisOrigenForm(pais);
    setModoPaisPersonalizado(!PAISES_ORIGEN_COMBO.includes(pais));
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
        pais_origen: paisOrigenForm.trim() || "Francia",
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

    if (marcaAEliminar.total_productos > 0 && !marcaDestinoId) {
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

  // Helper para generar el estilo del badge de línea comercial
  const getBadgeLinea = (tipo: CommercialType) => {
    switch (tipo) {
      case "arabe":
        return {
          bg: "rgba(70, 106, 77, 0.08)",
          border: "1px solid rgba(70, 106, 77, 0.25)",
          color: "#2f4f35",
          label: "Árabe",
        };
      case "nicho":
        return {
          bg: "rgba(147, 51, 234, 0.08)",
          border: "1px solid rgba(147, 51, 234, 0.25)",
          color: "#6b21a8",
          label: "Nicho",
        };
      case "disenador":
      default:
        return {
          bg: "rgba(240, 212, 126, 0.18)",
          border: "1px solid rgba(150, 108, 40, 0.3)",
          color: "var(--gold-deep)",
          label: "Diseñador",
        };
    }
  };

  return (
    <div className="brands-page-container" style={{ paddingTop: "28px" }}>
      {/* 1. BARRA SUPERIOR DE ACCIONES */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "26px",
        }}
      >
        <p style={{ margin: 0, color: "var(--muted)", fontSize: "13.5px" }}>
          Gestión de marcas y clasificación por líneas comerciales del catálogo oficial.
        </p>

        <button
          type="button"
          className="btn btn-gold"
          onClick={handleAbrirCrear}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            fontWeight: 600,
            fontSize: "12.5px",
            letterSpacing: "0.03em",
          }}
        >
          <Icon name="plus" size={14} />
          Nueva Casa de Perfumería
        </button>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        <div
          onClick={() => setFiltroLinea("todas")}
          style={{
            padding: "16px 20px",
            background: filtroLinea === "todas" ? "var(--ivory)" : "var(--white)",
            border: `1px solid ${filtroLinea === "todas" ? "var(--gold)" : "var(--line)"}`,
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <span
            style={{
              fontSize: "10.5px",
              textTransform: "uppercase",
              color: "var(--muted)",
              letterSpacing: "0.12em",
              fontWeight: 600,
              display: "block",
            }}
          >
            Total Casas
          </span>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--ink)", marginTop: "4px" }}>
            {metricas.total}
          </div>
        </div>

        <div
          onClick={() => setFiltroLinea("disenador")}
          style={{
            padding: "16px 20px",
            background: filtroLinea === "disenador" ? "rgba(240, 212, 126, 0.15)" : "var(--white)",
            border: `1px solid ${filtroLinea === "disenador" ? "var(--gold-deep)" : "var(--line)"}`,
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--gold-deep)",
              }}
            />
            <span
              style={{
                fontSize: "10.5px",
                textTransform: "uppercase",
                color: "var(--gold-deep)",
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              Diseñador
            </span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--gold-deep)", marginTop: "4px" }}>
            {metricas.disenador}
          </div>
        </div>

        <div
          onClick={() => setFiltroLinea("arabe")}
          style={{
            padding: "16px 20px",
            background: filtroLinea === "arabe" ? "rgba(70, 106, 77, 0.08)" : "var(--white)",
            border: `1px solid ${filtroLinea === "arabe" ? "#466a4d" : "var(--line)"}`,
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#2f4f35",
              }}
            />
            <span
              style={{
                fontSize: "10.5px",
                textTransform: "uppercase",
                color: "#2f4f35",
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              Árabes
            </span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "#2f4f35", marginTop: "4px" }}>
            {metricas.arabe}
          </div>
        </div>

        <div
          onClick={() => setFiltroLinea("nicho")}
          style={{
            padding: "16px 20px",
            background: filtroLinea === "nicho" ? "rgba(147, 51, 234, 0.08)" : "var(--white)",
            border: `1px solid ${filtroLinea === "nicho" ? "#7c3aed" : "var(--line)"}`,
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#6b21a8",
              }}
            />
            <span
              style={{
                fontSize: "10.5px",
                textTransform: "uppercase",
                color: "#6b21a8",
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              Nicho / Autor
            </span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "#6b21a8", marginTop: "4px" }}>
            {metricas.nicho}
          </div>
        </div>
      </div>

      {/* 3. BARRA DE HERRAMIENTAS: BÚSQUEDA Y PESTAÑAS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          padding: "14px 18px",
          background: "var(--ivory)",
          border: "1px solid var(--line)",
          borderRadius: "4px",
          marginBottom: "24px",
        }}
      >
        {/* Campo de búsqueda minimalista */}
        <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <Icon name="search" size={15} />
          </span>
          <input
            type="search"
            placeholder="Buscar por nombre de casa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              fontSize: "13px",
              border: "1px solid var(--line)",
              borderRadius: "3px",
              background: "var(--white)",
              color: "var(--ink)",
              outline: "none",
            }}
          />
        </div>

        {/* Pestañas de filtrado */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {(
            [
              { id: "todas", label: `Todas (${metricas.total})` },
              { id: "disenador", label: `Diseñador (${metricas.disenador})` },
              { id: "arabe", label: `Árabe (${metricas.arabe})` },
              { id: "nicho", label: `Nicho (${metricas.nicho})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroLinea(tab.id)}
              style={{
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: filtroLinea === tab.id ? 600 : 500,
                border: "1px solid",
                borderColor: filtroLinea === tab.id ? "var(--gold)" : "var(--line)",
                background: filtroLinea === tab.id ? "var(--white)" : "transparent",
                color: filtroLinea === tab.id ? "var(--ink)" : "var(--muted)",
                borderRadius: "3px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. GRID DE TARJETAS DE CASAS DE PERFUMERÍA */}
      {marcasFiltradas.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            color: "var(--muted)",
          }}
        >
          <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
            No se encontraron casas de perfumería que coincidan con la búsqueda o filtro.
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setBusqueda("");
              setFiltroLinea("todas");
            }}
            style={{ fontSize: "12px" }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {marcasFiltradas.map((m) => {
            const badge = getBadgeLinea(m.tipo_comercial);
            const iniciales = m.nombre.slice(0, 2).toUpperCase();

            return (
              <div
                key={m.id}
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--line)",
                  borderRadius: "4px",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
                }}
              >
                <div>
                  {/* Encabezado de la tarjeta: Monograma, Nombre y Badge */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "4px",
                          background: "var(--ivory)",
                          border: "1px solid var(--line)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--serif)",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--gold-deep)",
                          flexShrink: 0,
                        }}
                      >
                        {iniciales}
                      </div>

                      <div>
                        <strong
                          style={{
                            fontFamily: "var(--serif)",
                            fontSize: "17px",
                            color: "var(--ink)",
                            fontWeight: 600,
                            display: "block",
                            lineHeight: "1.2",
                          }}
                        >
                          {m.nombre}
                        </strong>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                          slug: {m.slug}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "2px",
                        letterSpacing: "0.04em",
                        background: badge.bg,
                        border: badge.border,
                        color: badge.color,
                        flexShrink: 0,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* País de procedencia */}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      lineHeight: "1.45",
                      margin: "0 0 12px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>📍</span>
                    <span>{m.pais_origen || "Francia"}</span>
                  </p>

                  {/* Contador de perfumes vinculados */}
                  <div
                    style={{
                      fontSize: "12px",
                      color: m.total_productos > 0 ? "var(--ink)" : "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "14px",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: m.total_productos > 0 ? "var(--gold-deep)" : "#9ca3af",
                      }}
                    />
                    <span>
                      {m.total_productos === 1
                        ? "1 fragancia registrada en catálogo"
                        : `${m.total_productos} fragancias registradas en catálogo`}
                    </span>
                  </div>
                </div>

                {/* Pie de acciones de la tarjeta */}
                <div
                  style={{
                    paddingTop: "12px",
                    borderTop: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Interruptor de estado Activa / Pausada */}
                  <button
                    type="button"
                    onClick={() => handleAlternarEstado(m)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: "4px 0",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "11.5px",
                      cursor: "pointer",
                      color: m.activo ? "#2f4f35" : "var(--muted)",
                      fontWeight: 600,
                    }}
                    title={m.activo ? "Pausar firma en la tienda" : "Activar firma en la tienda"}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: m.activo ? "#10b981" : "#9ca3af",
                      }}
                    />
                    {m.activo ? "Activa" : "Pausada"}
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => handleAbrirEditar(m)}
                      style={{
                        background: "var(--white)",
                        border: "1px solid var(--line)",
                        borderRadius: "3px",
                        padding: "6px 10px",
                        fontSize: "11.5px",
                        color: "var(--charcoal)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--gold)";
                        e.currentTarget.style.color = "var(--gold-deep)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--line)";
                        e.currentTarget.style.color = "var(--charcoal)";
                      }}
                      title="Editar firma"
                    >
                      <Icon name="edit" size={13} />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMarcaAEliminar(m);
                        setMarcaDestinoId("");
                      }}
                      style={{
                        background: "var(--white)",
                        border: "1px solid var(--line)",
                        borderRadius: "3px",
                        padding: "6px 9px",
                        fontSize: "11.5px",
                        color: "var(--muted)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#ef4444";
                        e.currentTarget.style.color = "#dc2626";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--line)";
                        e.currentTarget.style.color = "var(--muted)";
                      }}
                      title="Eliminar o reasignar firma"
                      aria-label={`Retirar casa ${m.nombre}`}
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

      {/* 5. MODAL DE CREACIÓN / EDICIÓN DE CASA DE PERFUMERÍA */}
      {modalMarcaAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(5, 6, 5, 0.75)",
            backdropFilter: "blur(5px)",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !guardando) {
              setModalMarcaAbierto(false);
            }
          }}
        >
          <div
            style={{
              width: "min(560px, 100%)",
              background: "var(--white)",
              borderRadius: "4px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              overflow: "hidden",
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
                  }}
                >
                  {marcaEnEdicion ? "Modificar Registro" : "Nuevo Registro"}
                </small>
                <h2
                  style={{
                    margin: "2px 0 0 0",
                    fontFamily: "var(--serif)",
                    fontSize: "21px",
                    color: "var(--ink)",
                    fontWeight: 400,
                  }}
                >
                  {marcaEnEdicion ? `Editar Casa: ${marcaEnEdicion.nombre}` : "Registrar Casa de Perfumería"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalMarcaAbierto(false)}
                disabled={guardando}
                style={{
                  border: 0,
                  background: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: "4px",
                }}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {errorModal && (
              <div
                style={{
                  padding: "10px 26px",
                  background: "#fef2f2",
                  borderBottom: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: "12.5px",
                }}
              >
                {errorModal}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleGuardarMarca} style={{ padding: "24px 26px" }}>
              {/* Campo Nombre */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--ink)", marginBottom: "6px" }}>
                  Nombre oficial de la firma *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Parfums de Marly, Tom Ford, Lattafa"
                  value={nombreForm}
                  onChange={(e) => setNombreForm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "13.5px",
                    border: "1px solid var(--line)",
                    borderRadius: "3px",
                    background: "var(--white)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Selector de Línea Comercial */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--ink)", marginBottom: "8px" }}>
                  Línea Comercial de la Casa *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {(
                    [
                      {
                        id: "disenador",
                        titulo: "Diseñador",
                        subtitulo: "Lujo comercial y moda global",
                      },
                      {
                        id: "arabe",
                        titulo: "Árabe",
                        subtitulo: "Tradición y fijación oriental",
                      },
                      {
                        id: "nicho",
                        titulo: "Nicho / Autor",
                        subtitulo: "Exclusiva de autor",
                      },
                    ] as const
                  ).map((opt) => {
                    const seleccionado = lineaForm === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setLineaForm(opt.id)}
                        style={{
                          border: `1.5px solid ${seleccionado ? "var(--gold)" : "var(--line)"}`,
                          background: seleccionado ? "var(--ivory)" : "var(--white)",
                          borderRadius: "4px",
                          padding: "10px 12px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "12.5px",
                            color: seleccionado ? "var(--gold-deep)" : "var(--ink)",
                            display: "block",
                            marginBottom: "2px",
                          }}
                        >
                          {opt.titulo}
                        </strong>
                        <span style={{ fontSize: "10.5px", color: "var(--muted)", lineHeight: "1.3", display: "block" }}>
                          {opt.subtitulo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* País de Procedencia de la Casa */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--ink)", marginBottom: "6px" }}>
                  País de origen (Procedencia de la firma) *
                </label>
                {!modoPaisPersonalizado ? (
                  <select
                    value={PAISES_ORIGEN_COMBO.includes(paisOrigenForm) ? paisOrigenForm : "__otro__"}
                    onChange={(e) => {
                      if (e.target.value === "__otro__") {
                        setModoPaisPersonalizado(true);
                        setPaisOrigenForm("");
                      } else {
                        setPaisOrigenForm(e.target.value);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "13.5px",
                      border: "1px solid var(--line)",
                      borderRadius: "3px",
                      background: "var(--white)",
                      color: "var(--ink)",
                      outline: "none",
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
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Escribe el país de procedencia (ej. Japón, Suiza, Omán)"
                      value={paisOrigenForm}
                      onChange={(e) => setPaisOrigenForm(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: "13.5px",
                        border: "1px solid var(--line)",
                        borderRadius: "3px",
                        background: "var(--white)",
                        color: "var(--ink)",
                        outline: "none",
                        marginBottom: "6px",
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setModoPaisPersonalizado(false);
                        setPaisOrigenForm("Francia");
                      }}
                      style={{
                        border: 0,
                        background: "none",
                        color: "var(--gold-deep)",
                        fontSize: "11.5px",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      ← Elegir país de la lista
                    </button>
                  </div>
                )}
              </div>

              {/* Estado Activo */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12.5px", color: "var(--ink)" }}>
                  <input
                    type="checkbox"
                    checked={activoForm}
                    onChange={(e) => setActivoForm(e.target.checked)}
                    style={{ width: "auto", margin: 0 }}
                  />
                  <span>
                    <strong>Activa para venta en tienda</strong> (visible en selectores y filtros del catálogo)
                  </span>
                </label>
              </div>

              {/* Botones de acción del modal */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--line)", paddingTop: "18px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalMarcaAbierto(false)}
                  disabled={guardando}
                  style={{ background: "transparent" }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={guardando}
                  style={{ minWidth: "150px" }}
                >
                  {guardando ? "Guardando..." : marcaEnEdicion ? "Guardar cambios" : "Registrar firma"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL DE ELIMINACIÓN Y REASIGNACIÓN (SOLUCIÓN DE ERRATAS) */}
      {marcaAEliminar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(5, 6, 5, 0.75)",
            backdropFilter: "blur(5px)",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !eliminando) {
              setMarcaAEliminar(null);
            }
          }}
        >
          <div
            style={{
              width: "min(520px, 100%)",
              background: "var(--white)",
              borderRadius: "4px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                background: "var(--ivory)",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <small style={{ color: "#b91c1c", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "10.5px", fontWeight: 600 }}>
                  Gestión de Catálogo
                </small>
                <h3 style={{ margin: "2px 0 0 0", fontFamily: "var(--serif)", fontSize: "20px", color: "var(--ink)", fontWeight: 400 }}>
                  Retirar "{marcaAEliminar.nombre}"
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMarcaAEliminar(null)}
                disabled={eliminando}
                style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {marcaAEliminar.total_productos === 0 ? (
                <div>
                  <p style={{ margin: "0 0 18px 0", fontSize: "13.5px", color: "var(--ink)", lineHeight: "1.5" }}>
                    ¿Estás seguro de retirar <strong>"{marcaAEliminar.nombre}"</strong> del catálogo oficial?
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                    Esta firma no cuenta con perfumes registrados, por lo que será retirada de forma permanente.
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "rgba(240, 212, 126, 0.15)",
                      border: "1px solid rgba(150, 108, 40, 0.3)",
                      borderRadius: "4px",
                      marginBottom: "18px",
                      fontSize: "12.5px",
                      color: "var(--ink)",
                      lineHeight: "1.5",
                    }}
                  >
                    La firma <strong>"{marcaAEliminar.nombre}"</strong> tiene{" "}
                    <strong>
                      {marcaAEliminar.total_productos}{" "}
                      {marcaAEliminar.total_productos === 1 ? "fragancia asociada" : "fragancias asociadas"}
                    </strong>{" "}
                    en el catálogo oficial.
                  </div>

                  <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--ink)", fontWeight: 500 }}>
                    Para preservar el catálogo sin dejar perfumes huérfanos, selecciona la firma oficial a la que deseas transferir sus fragancias:
                  </p>

                  <div style={{ marginBottom: "20px" }}>
                    <select
                      value={marcaDestinoId}
                      onChange={(e) => setMarcaDestinoId(e.target.value ? Number(e.target.value) : "")}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: "13px",
                        border: "1px solid var(--line)",
                        borderRadius: "3px",
                        background: "var(--white)",
                        color: "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Selecciona la casa de perfumería destino...</option>
                      {marcas
                        .filter((m) => m.id !== marcaAEliminar.id)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nombre} ({m.tipo_comercial}) — {m.total_productos} perfumes actuales
                          </option>
                        ))}
                    </select>
                    <small style={{ color: "var(--muted)", fontSize: "11px", display: "block", marginTop: "6px" }}>
                      Ejemplo: Si "{marcaAEliminar.nombre}" fue un error tipográfico, puedes transferir sus perfumes a su firma oficial y la duplicada se eliminará limpiamente.
                    </small>
                  </div>
                </div>
              )}

              {/* Botones de acción del modal de eliminación */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--line)", paddingTop: "18px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setMarcaAEliminar(null)}
                  disabled={eliminando}
                  style={{ background: "transparent" }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmarEliminar}
                  disabled={eliminando || (marcaAEliminar.total_productos > 0 && !marcaDestinoId)}
                  style={{
                    background: "#b91c1c",
                    color: "#ffffff",
                    border: "none",
                    padding: "9px 18px",
                    borderRadius: "3px",
                    fontWeight: 600,
                    fontSize: "12.5px",
                    cursor: eliminando || (marcaAEliminar.total_productos > 0 && !marcaDestinoId) ? "not-allowed" : "pointer",
                    opacity: eliminando || (marcaAEliminar.total_productos > 0 && !marcaDestinoId) ? 0.6 : 1,
                  }}
                >
                  {eliminando
                    ? "Procesando..."
                    : marcaAEliminar.total_productos > 0
                      ? "Transferir fragancias y retirar"
                      : "Retirar firma"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

