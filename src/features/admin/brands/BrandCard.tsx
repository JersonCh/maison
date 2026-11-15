import type { MarcaAdminItem } from "@/types/database";
import Icon from "@/components/ui/Icon";
import { getBadgeLinea } from "./types";

interface BrandCardProps {
  marca: MarcaAdminItem;
  onAlternarEstado: (m: MarcaAdminItem) => void;
  onEditar: (m: MarcaAdminItem) => void;
  onSolicitarEliminar: (m: MarcaAdminItem) => void;
}

export default function BrandCard({
  marca,
  onAlternarEstado,
  onEditar,
  onSolicitarEliminar,
}: BrandCardProps) {
  const badge = getBadgeLinea(marca.tipo_comercial);
  const iniciales = marca.nombre.slice(0, 2).toUpperCase();

  return (
    <article className="bg-white border border-[var(--line)] rounded p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:border-[var(--gold)] hover:shadow-md">
      <div>
        {/* Encabezado: Monograma, Nombre y Badge */}
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9.5 h-9.5 rounded bg-[var(--ivory)] border border-[var(--line)] flex items-center justify-center font-serif text-sm font-semibold text-[var(--gold-deep)] shrink-0">
              {iniciales}
            </div>

            <div>
              <strong className="font-serif text-base text-[var(--ink)] font-semibold block leading-tight">
                {marca.nombre}
              </strong>
              <span className="text-[11px] text-[var(--muted)]">
                slug: {marca.slug}
              </span>
            </div>
          </div>

          <span
            className={`text-[10.5px] font-semibold px-2 py-0.5 rounded tracking-wide shrink-0 ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        {/* País de procedencia */}
        <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">
          Origen: {marca.pais_origen || "Francia"}
        </p>

        {/* Contador de perfumes vinculados */}
        <div
          className={`text-xs flex items-center gap-1.5 mb-3.5 ${
            marca.total_productos > 0 ? "text-[var(--ink)]" : "text-[var(--muted)]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              marca.total_productos > 0 ? "bg-[var(--gold-deep)]" : "bg-neutral-400"
            }`}
          />
          <span>
            {marca.total_productos === 1
              ? "1 fragancia registrada en catálogo"
              : `${marca.total_productos} fragancias registradas en catálogo`}
          </span>
        </div>
      </div>

      {/* Pie de acciones de la tarjeta */}
      <footer className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
        {/* Interruptor de estado Activa / Pausada */}
        <button
          type="button"
          onClick={() => onAlternarEstado(marca)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold py-1 cursor-pointer bg-transparent border-none ${
            marca.activo ? "text-emerald-800" : "text-[var(--muted)]"
          }`}
          title={
            marca.activo
              ? "Pausar firma en la tienda"
              : "Activar firma en la tienda"
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              marca.activo ? "bg-emerald-500" : "bg-neutral-400"
            }`}
          />
          {marca.activo ? "Activa" : "Pausada"}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEditar(marca)}
            className="bg-white border border-[var(--line)] rounded px-2.5 py-1 text-xs text-neutral-700 hover:border-[var(--gold)] hover:text-[var(--gold-deep)] inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Editar firma"
          >
            <Icon name="edit" size={13} />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onSolicitarEliminar(marca)}
            className="bg-white border border-[var(--line)] rounded p-1.5 text-xs text-[var(--muted)] hover:border-red-400 hover:text-red-600 inline-flex items-center transition-colors cursor-pointer"
            title="Eliminar o reasignar firma"
            aria-label={`Retirar casa ${marca.nombre}`}
          >
            <Icon name="trash" size={13} />
          </button>
        </div>
      </footer>
    </article>
  );
}
