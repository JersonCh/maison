import React from "react";
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
  paisOrigen: string;
  setPaisOrigen: (v: string) => void;
  modoPaisPersonalizado: boolean;
  setModoPaisPersonalizado: (v: boolean) => void;
  ocasionUso: string;
  setOcasionUso: (v: string) => void;
  modoOcasionPersonalizada: boolean;
  setModoOcasionPersonalizada: (v: boolean) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
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
}: ProductGeneralCardProps) {
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
  );
}

