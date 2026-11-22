import React, { useEffect } from "react";
import type { MarcaAdminItem } from "@/types/database";
import type { CommercialType } from "@/types/product";
import Icon from "@/components/ui/Icon";
import { PAISES_ORIGEN_COMBO } from "../product-form/constants";

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  marcaEnEdicion: MarcaAdminItem | null;
  nombre: string;
  setNombre: (v: string) => void;
  linea: CommercialType;
  setLinea: (v: CommercialType) => void;
  paisOrigen: string;
  setPaisOrigen: (v: string) => void;
  modoPaisPersonalizado: boolean;
  setModoPaisPersonalizado: (v: boolean) => void;
  activo: boolean;
  setActivo: (v: boolean) => void;
  guardando: boolean;
  error: string | null;
}

export default function BrandFormModal({
  isOpen,
  onClose,
  onSave,
  marcaEnEdicion,
  nombre,
  setNombre,
  linea,
  setLinea,
  paisOrigen,
  setPaisOrigen,
  modoPaisPersonalizado,
  setModoPaisPersonalizado,
  activo,
  setActivo,
  guardando,
  error,
}: BrandFormModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !guardando) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, guardando, onClose]);

  if (!isOpen) return null;

  return (
    <div className="brand-modal-overlay">
      <button
        type="button"
        aria-label="Cerrar modal de casa de perfumería"
        disabled={guardando}
        onClick={onClose}
        className="brand-modal-backdrop"
      />

      <div className="brand-modal-dialog">
        {/* Cabecera del modal */}
        <div className="brand-modal-head">
          <div>
            <small className="brand-modal-eyebrow">
              {marcaEnEdicion ? "Modificar Registro" : "Nuevo Registro"}
            </small>
            <h2 className="brand-modal-title">
              {marcaEnEdicion
                ? `Editar Casa: ${marcaEnEdicion.nombre}`
                : "Registrar Casa de Perfumería"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="brand-modal-close"
            aria-label="Cerrar formulario"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {error && <div className="brand-modal-error">{error}</div>}

        {/* Formulario */}
        <form onSubmit={onSave} className="brand-modal-body">
          {/* Campo Nombre */}
          <div className="brand-field">
            <label htmlFor="input-nombre-firma" className="brand-label">
              Nombre oficial de la firma *
            </label>
            <input
              id="input-nombre-firma"
              type="text"
              required
              placeholder="Ej. Parfums de Marly, Tom Ford, Lattafa"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="brand-input"
            />
          </div>

          {/* Selector de Línea Comercial */}
          <div className="brand-field">
            <span className="brand-label brand-label--group">
              Línea Comercial de la Casa *
            </span>
            <div className="brand-line-grid">
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
                const seleccionado = linea === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setLinea(opt.id)}
                    className={`brand-line-option${seleccionado ? " is-selected" : ""}`}
                  >
                    <strong className="brand-line-option-title">
                      {opt.titulo}
                    </strong>
                    <span className="brand-line-option-sub">
                      {opt.subtitulo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* País de Procedencia de la Casa */}
          <div className="brand-field">
            <label
              htmlFor={
                modoPaisPersonalizado
                  ? "input-pais-personalizado"
                  : "select-pais-origen"
              }
              className="brand-label"
            >
              País de origen (Procedencia de la firma) *
            </label>
            {!modoPaisPersonalizado ? (
              <select
                id="select-pais-origen"
                value={
                  PAISES_ORIGEN_COMBO.includes(paisOrigen)
                    ? paisOrigen
                    : "__otro__"
                }
                onChange={(e) => {
                  if (e.target.value === "__otro__") {
                    setModoPaisPersonalizado(true);
                    setPaisOrigen("");
                  } else {
                    setPaisOrigen(e.target.value);
                  }
                }}
                className="brand-select"
              >
                {PAISES_ORIGEN_COMBO.map((pais) => (
                  <option key={pais} value={pais}>
                    {pais}
                  </option>
                ))}
                <option value="__otro__">
                  + Otro país (escribir personalizado)...
                </option>
              </select>
            ) : (
              <div>
                <input
                  id="input-pais-personalizado"
                  type="text"
                  required
                  placeholder="Escribe el país de procedencia (ej. Japón, Suiza, Omán)"
                  value={paisOrigen}
                  onChange={(e) => setPaisOrigen(e.target.value)}
                  className="brand-input brand-input--custom-country"
                />
                <button
                  type="button"
                  onClick={() => {
                    setModoPaisPersonalizado(false);
                    setPaisOrigen("Francia");
                  }}
                  className="brand-country-back"
                >
                  ← Elegir país de la lista
                </button>
              </div>
            )}
          </div>

          {/* Estado Activo */}
          <div className="brand-field--checkbox">
            <label
              htmlFor="checkbox-activo-marca"
              className="brand-checkbox-label"
            >
              <input
                id="checkbox-activo-marca"
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
              />
              <span>
                <strong>Activa para venta en tienda</strong> (visible en
                selectores y filtros del catálogo)
              </span>
            </label>
          </div>

          {/* Botones de acción del modal */}
          <div className="brand-modal-actions">
            <button
              type="button"
              className="btn btn-outline brand-modal-cancel"
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-gold brand-modal-submit"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : marcaEnEdicion
                  ? "Guardar cambios"
                  : "Registrar firma"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
