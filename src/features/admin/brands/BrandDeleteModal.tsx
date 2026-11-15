import React from "react";
import type { MarcaAdminItem } from "@/types/database";
import Icon from "@/components/ui/Icon";

interface BrandDeleteModalProps {
  marcaAEliminar: MarcaAdminItem | null;
  marcas: MarcaAdminItem[];
  marcaDestinoId: number | "";
  setMarcaDestinoId: (v: number | "") => void;
  eliminando: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function BrandDeleteModal({
  marcaAEliminar,
  marcas,
  marcaDestinoId,
  setMarcaDestinoId,
  eliminando,
  onClose,
  onConfirm,
}: BrandDeleteModalProps) {
  if (!marcaAEliminar) return null;

  const tienePerfumes = marcaAEliminar.total_productos > 0;
  const botonDeshabilitado = eliminando || (tienePerfumes && !marcaDestinoId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* Backdrop con botón nativo accesible */}
      <button
        type="button"
        aria-label="Cerrar modal de eliminación"
        disabled={eliminando}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs border-none cursor-pointer"
      />

      {/* Contenedor del Modal */}
      <div className="relative z-10 w-full max-w-[520px] bg-white rounded shadow-2xl overflow-hidden border border-[var(--line)]">
        {/* Cabecera */}
        <div className="px-6 py-5 bg-[var(--ivory)] border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase tracking-wider font-semibold text-red-700 block">
              Gestión de Catálogo
            </span>
            <h3 className="font-serif text-xl text-[var(--ink)] font-normal m-0 mt-0.5">
              Retirar "{marcaAEliminar.nombre}"
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={eliminando}
            className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer p-1"
            aria-label="Cerrar modal de retiro"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {!tienePerfumes ? (
            <div>
              <p className="text-sm text-[var(--ink)] leading-relaxed mb-4">
                ¿Estás seguro de retirar <strong>"{marcaAEliminar.nombre}"</strong> del catálogo oficial?
              </p>
              <p className="text-xs text-[var(--muted)] m-0">
                Esta firma no cuenta con perfumes registrados, por lo que será retirada de forma permanente.
              </p>
            </div>
          ) : (
            <div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded mb-4 text-xs text-[var(--ink)] leading-relaxed">
                La firma <strong>"{marcaAEliminar.nombre}"</strong> tiene{" "}
                <strong>
                  {marcaAEliminar.total_productos}{" "}
                  {marcaAEliminar.total_productos === 1 ? "fragancia asociada" : "fragancias asociadas"}
                </strong>{" "}
                en el catálogo oficial.
              </div>

              <p className="text-xs text-[var(--ink)] font-medium mb-2.5">
                Para preservar el catálogo sin dejar perfumes huérfanos, selecciona la firma oficial a la que deseas transferir sus fragancias:
              </p>

              <div className="mb-5">
                <select
                  value={marcaDestinoId}
                  onChange={(e) => setMarcaDestinoId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2.5 text-xs border border-[var(--line)] rounded bg-white text-[var(--ink)] outline-none focus:border-[var(--gold)] cursor-pointer"
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
                <small className="text-[11px] text-[var(--muted)] block mt-1.5 leading-normal">
                  Ejemplo: Si "{marcaAEliminar.nombre}" fue un error tipográfico, puedes transferir sus perfumes a su firma oficial y la duplicada se eliminará limpiamente.
                </small>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-2.5 border-t border-[var(--line)] pt-4.5">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={eliminando}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={botonDeshabilitado}
              className={`px-4.5 py-2.5 rounded font-semibold text-xs text-white transition-opacity ${
                botonDeshabilitado
                  ? "bg-red-700/60 cursor-not-allowed"
                  : "bg-red-700 hover:bg-red-800 cursor-pointer"
              }`}
            >
              {eliminando
                ? "Procesando..."
                : tienePerfumes
                  ? "Transferir fragancias y retirar"
                  : "Retirar firma"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
