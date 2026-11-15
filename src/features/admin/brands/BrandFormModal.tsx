import React from "react";
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* Backdrop con botón nativo accesible */}
      <button
        type="button"
        aria-label="Cerrar modal de casa de perfumería"
        disabled={guardando}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs border-none cursor-pointer"
      />

      {/* Contenedor del Modal */}
      <div className="relative z-10 w-full max-w-[560px] bg-white rounded shadow-2xl overflow-hidden border border-[var(--line)]">
        {/* Cabecera */}
        <div className="px-6 py-5 bg-[var(--ivory)] border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--gold-deep)] block">
              {marcaEnEdicion ? "Edición de Firma" : "Registro de Firma"}
            </span>
            <h3 className="font-serif text-xl text-[var(--ink)] font-normal m-0 mt-0.5">
              {marcaEnEdicion ? `Editar "${marcaEnEdicion.nombre}"` : "Nueva Casa de Perfumería"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer p-1"
            aria-label="Cerrar formulario"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Mensaje de error si existe */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs leading-relaxed">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={onSave} className="p-6">
          {/* Campo Nombre */}
          <div className="mb-4.5">
            <label
              htmlFor="input-nombre-firma"
              className="block text-xs font-semibold text-[var(--ink)] mb-1.5"
            >
              Nombre oficial de la firma *
            </label>
            <input
              id="input-nombre-firma"
              type="text"
              required
              placeholder="Ej. Parfums de Marly, Tom Ford, Lattafa"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--line)] rounded bg-white text-[var(--ink)] outline-none focus:border-[var(--gold)]"
            />
          </div>

          {/* Selector de Línea Comercial */}
          <div className="mb-4.5">
            <span className="block text-xs font-semibold text-[var(--ink)] mb-2">
              Línea Comercial de la Casa *
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { id: "disenador", titulo: "Diseñador", subtitulo: "Lujo comercial y moda global" },
                  { id: "arabe", titulo: "Árabe", subtitulo: "Tradición y fijación oriental" },
                  { id: "nicho", titulo: "Nicho / Autor", subtitulo: "Exclusiva de autor" },
                ] as const
              ).map((opt) => {
                const seleccionado = linea === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setLinea(opt.id)}
                    className={`p-2.5 rounded border transition-all text-left cursor-pointer ${
                      seleccionado
                        ? "bg-[var(--ivory)] border-[var(--gold)]"
                        : "bg-white border-[var(--line)] hover:border-neutral-300"
                    }`}
                  >
                    <strong
                      className={`text-xs block mb-0.5 ${
                        seleccionado ? "text-[var(--gold-deep)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {opt.titulo}
                    </strong>
                    <span className="text-[10px] text-[var(--muted)] leading-tight block">
                      {opt.subtitulo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* País de Procedencia de la Casa */}
          <div className="mb-4.5">
            <label
              htmlFor={modoPaisPersonalizado ? "input-pais-personalizado" : "select-pais-origen"}
              className="block text-xs font-semibold text-[var(--ink)] mb-1.5"
            >
              País de origen (Procedencia de la firma) *
            </label>
            {!modoPaisPersonalizado ? (
              <select
                id="select-pais-origen"
                value={PAISES_ORIGEN_COMBO.includes(paisOrigen) ? paisOrigen : "__otro__"}
                onChange={(e) => {
                  if (e.target.value === "__otro__") {
                    setModoPaisPersonalizado(true);
                    setPaisOrigen("");
                  } else {
                    setPaisOrigen(e.target.value);
                  }
                }}
                className="w-full px-3 py-2.5 text-sm border border-[var(--line)] rounded bg-white text-[var(--ink)] outline-none focus:border-[var(--gold)]"
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
                  id="input-pais-personalizado"
                  type="text"
                  required
                  placeholder="Escribe el país de procedencia (ej. Japón, Suiza, Omán)"
                  value={paisOrigen}
                  onChange={(e) => setPaisOrigen(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[var(--line)] rounded bg-white text-[var(--ink)] outline-none focus:border-[var(--gold)] mb-1.5"
                />
                <button
                  type="button"
                  onClick={() => {
                    setModoPaisPersonalizado(false);
                    setPaisOrigen("Francia");
                  }}
                  className="text-xs text-[var(--gold-deep)] underline cursor-pointer hover:text-amber-800"
                >
                  ← Elegir país de la lista
                </button>
              </div>
            )}
          </div>

          {/* Interruptor de Visibilidad */}
          <div className="mb-6">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 accent-[var(--gold)] cursor-pointer"
              />
              <span className="text-xs text-[var(--ink)]">
                Firma activa y visible en los filtros de la tienda pública
              </span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2.5 border-t border-[var(--line)] pt-4.5">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-gold min-w-[150px]"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : marcaEnEdicion ? "Guardar cambios" : "Registrar firma"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
