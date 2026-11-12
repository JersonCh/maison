import React, { useState } from "react";
import type { MarcaItem } from "@/types/database";
import type { Gender, CommercialType } from "@/types/product";
import { slugify } from "@/lib/slug";
import { PAISES_ORIGEN_COMBO, OCASIONES_USO_COMBO } from "./constants";

interface ProductGeneralCardProps {
  inputNombreRef: React.RefObject<HTMLInputElement | null>;
  esEdicion: boolean;
  nombre: string;
  setNombre: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  slugEditado: string;
  setSlugEditado: (v: string) => void;
  modoEditarSlug: boolean;
  setModoEditarSlug: (v: boolean) => void;
  slugPersonalizado: boolean;
  copiado: boolean;
  copiarEnlace: () => Promise<void>;
  confirmarSlugEditado: () => void;
  cancelarSlugEditado: () => void;
  marcaId: number;
  setMarcaId: (id: number) => void;
  marcasDisponibles: MarcaItem[];
  modoNuevaMarca: boolean;
  setModoNuevaMarca: (v: boolean) => void;
  nuevaMarca: string;
  setNuevaMarca: (v: string) => void;
  tipoComercial: CommercialType;
  setTipoComercial: (v: CommercialType) => void;
  genero: Gender;
  setGenero: (v: Gender) => void;
  concentracion: string;
  setConcentracion: (v: string) => void;
  paisOrigen?: string;
  setPaisOrigen?: (v: string) => void;
  modoPaisPersonalizado?: boolean;
  setModoPaisPersonalizado?: (v: boolean) => void;
  ocasionUso: string;
  setOcasionUso: (v: string) => void;
  modoOcasionPersonalizada: boolean;
  setModoOcasionPersonalizada: (v: boolean) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
  onNavigateToBrands?: () => void;
  onReloadMetadata?: () => Promise<void>;
}

export function ProductGeneralCard({
  inputNombreRef,
  esEdicion,
  nombre,
  setNombre,
  slug,
  setSlug,
  slugEditado,
  setSlugEditado,
  modoEditarSlug,
  setModoEditarSlug,
  slugPersonalizado,
  copiado,
  copiarEnlace,
  confirmarSlugEditado,
  cancelarSlugEditado,
  marcaId,
  setMarcaId,
  marcasDisponibles,
  modoNuevaMarca,
  setModoNuevaMarca,
  nuevaMarca,
  setNuevaMarca,
  tipoComercial,
  setTipoComercial,
  genero,
  setGenero,
  concentracion,
  setConcentracion,
  paisOrigen,
  setPaisOrigen,
  modoPaisPersonalizado,
  setModoPaisPersonalizado,
  ocasionUso,
  setOcasionUso,
  modoOcasionPersonalizada,
  setModoOcasionPersonalizada,
  descripcion,
  setDescripcion,
  onNavigateToBrands,
  onReloadMetadata,
}: ProductGeneralCardProps) {
  const [modalNuevaMarcaAbierto, setModalNuevaMarcaAbierto] = useState(false);
  const [nombreNuevaMarca, setNombreNuevaMarca] = useState("");
  const [lineaNuevaMarca, setLineaNuevaMarca] = useState<CommercialType>("disenador");
  const [paisNuevaMarca, setPaisNuevaMarca] = useState("Francia");
  const [guardandoNuevaMarca, setGuardandoNuevaMarca] = useState(false);
  const [errorNuevaMarca, setErrorNuevaMarca] = useState<string | null>(null);

  const handleCrearMarcaRapida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevaMarca.trim()) {
      setErrorNuevaMarca("El nombre de la firma es obligatorio.");
      return;
    }
    setGuardandoNuevaMarca(true);
    setErrorNuevaMarca(null);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreNuevaMarca.trim(),
          tipo_comercial: lineaNuevaMarca,
          pais_origen: paisNuevaMarca,
          activo: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar la firma");
      if (onReloadMetadata) {
        await onReloadMetadata();
      }
      setMarcaId(data.id);
      setTipoComercial(lineaNuevaMarca);
      setModalNuevaMarcaAbierto(false);
      setNombreNuevaMarca("");
      setPaisNuevaMarca("Francia");
    } catch (err: any) {
      setErrorNuevaMarca(err.message || "Error al comunicarse con el servidor");
    } finally {
      setGuardandoNuevaMarca(false);
    }
  };
  return (
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

        {/* FILA: CASA DE PERFUMERÍA Y LÍNEA COMERCIAL (ALINEACIÓN PERFECTA) */}
        <div className="full-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "24px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", minHeight: "22px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink)" }}>
                Casa de perfumería (Marca) *
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setErrorNuevaMarca(null);
                    setNombreNuevaMarca("");
                    setLineaNuevaMarca("disenador");
                    setModalNuevaMarcaAbierto(true);
                  }}
                  style={{
                    border: 0,
                    background: "none",
                    color: "var(--gold-deep)",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: 0,
                  }}
                  title="Registrar nueva firma de perfumería"
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "rgba(180, 142, 84, 0.15)",
                      color: "var(--gold-deep)",
                      fontSize: "12px",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    +
                  </span>
                  <span>Nueva firma</span>
                </button>

                {onNavigateToBrands && (
                  <button
                    type="button"
                    onClick={onNavigateToBrands}
                    style={{
                      border: 0,
                      background: "none",
                      color: "var(--muted)",
                      fontSize: "11px",
                      cursor: "pointer",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                    title="Ir al gestor oficial de casas de perfumería"
                  >
                    <span>Gestionar</span>
                    <span style={{ fontSize: "10px" }}>↗</span>
                  </button>
                )}
              </div>
            </div>

            <select
              value={marcaId || ""}
              onChange={(e) => {
                const nuevoId = Number(e.target.value);
                setMarcaId(nuevoId);
                const marcaSelec = marcasDisponibles.find((m) => m.id === nuevoId);
                if (marcaSelec?.tipo_comercial) {
                  setTipoComercial(marcaSelec.tipo_comercial);
                }
                if (marcaSelec?.pais_origen && setPaisOrigen) {
                  setPaisOrigen(marcaSelec.pais_origen);
                }
              }}
            >
              <option value="">
                {marcasDisponibles.length > 0
                  ? "-- Selecciona una casa de perfumería --"
                  : "-- No hay firmas registradas (crea una con +) --"}
              </option>
              {marcasDisponibles.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} {m.pais_origen ? `(${m.pais_origen})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", minHeight: "22px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink)" }}>
                Línea / Gama Comercial *
              </span>
            </div>
            <select
              value={tipoComercial}
              onChange={(e) => setTipoComercial(e.target.value as CommercialType)}
            >
              <option value="disenador">Diseñador (Grandes firmas internacionales)</option>
              <option value="arabe">Árabes (Tradición y fijación oriental)</option>
              <option value="nicho">Nichos (Perfumería de autor y artística)</option>
            </select>
          </div>
        </div>

        {/* FILA: GÉNERO OLFATIVO Y CONCENTRACIÓN (SIMETRÍA ABSOLUTA) */}
        <div className="full-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <label style={{ margin: 0 }}>
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

          <label style={{ margin: 0 }}>
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

      {/* MODAL RÁPIDO PARA CREAR NUEVA MARCA */}
      {modalNuevaMarcaAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => !guardandoNuevaMarca && setModalNuevaMarcaAbierto(false)}
        >
          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--line)",
              borderRadius: "6px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid var(--line)",
                background: "var(--ivory)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--gold-deep)",
                    display: "block",
                  }}
                >
                  Nuevo registro
                </span>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  Registrar Casa de Perfumería
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevaMarcaAbierto(false)}
                disabled={guardandoNuevaMarca}
                style={{
                  border: 0,
                  background: "none",
                  fontSize: "20px",
                  color: "var(--muted)",
                  cursor: "pointer",
                  padding: "4px 8px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearMarcaRapida} style={{ padding: "20px 22px" }}>
              {errorNuevaMarca && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "12px",
                    borderRadius: "4px",
                    marginBottom: "16px",
                  }}
                >
                  {errorNuevaMarca}
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: "var(--ink)",
                    marginBottom: "6px",
                  }}
                >
                  Nombre oficial de la firma *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Parfums de Marly, Tom Ford, Lattafa"
                  value={nombreNuevaMarca}
                  onChange={(e) => setNombreNuevaMarca(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "13.5px",
                    border: "1px solid var(--line)",
                    borderRadius: "4px",
                    background: "var(--white)",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: "var(--ink)",
                    marginBottom: "8px",
                  }}
                >
                  Línea Comercial de la Casa *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {(
                    [
                      { id: "disenador", label: "Diseñador" },
                      { id: "arabe", label: "Árabe" },
                      { id: "nicho", label: "Nicho / Autor" },
                    ] as const
                  ).map((opt) => {
                    const sel = lineaNuevaMarca === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setLineaNuevaMarca(opt.id)}
                        style={{
                          border: `1.5px solid ${sel ? "var(--gold)" : "var(--line)"}`,
                          background: sel ? "var(--ivory)" : "var(--white)",
                          borderRadius: "4px",
                          padding: "8px 10px",
                          cursor: "pointer",
                          textAlign: "center",
                          fontSize: "12px",
                          fontWeight: sel ? 600 : 400,
                          color: sel ? "var(--ink)" : "var(--muted)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {opt.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: "var(--ink)",
                    marginBottom: "6px",
                  }}
                >
                  País de origen (Procedencia de la firma) *
                </label>
                <select
                  value={paisNuevaMarca}
                  onChange={(e) => setPaisNuevaMarca(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "13.5px",
                    border: "1px solid var(--line)",
                    borderRadius: "4px",
                    background: "var(--white)",
                    outline: "none",
                  }}
                >
                  {PAISES_ORIGEN_COMBO.map((pais) => (
                    <option key={pais} value={pais}>
                      📍 {pais}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--line)",
                  paddingTop: "16px",
                }}
              >
                {onNavigateToBrands ? (
                  <button
                    type="button"
                    onClick={() => {
                      setModalNuevaMarcaAbierto(false);
                      onNavigateToBrands();
                    }}
                    style={{
                      border: 0,
                      background: "none",
                      color: "var(--muted)",
                      fontSize: "11.5px",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Ir al gestor de marcas ↗
                  </button>
                ) : <span />}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setModalNuevaMarcaAbierto(false)}
                    disabled={guardandoNuevaMarca}
                    style={{
                      padding: "8px 16px",
                      background: "transparent",
                      border: "1px solid var(--line)",
                      borderRadius: "4px",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      color: "var(--charcoal)",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoNuevaMarca}
                    style={{
                      padding: "8px 18px",
                      background: "var(--gold)",
                      border: "1px solid var(--gold)",
                      borderRadius: "4px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    {guardandoNuevaMarca ? "Guardando..." : "Registrar firma"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

