import type { FiltroLinea } from "./types";

interface BrandMetricsProps {
  metricas: {
    total: number;
    disenador: number;
    arabe: number;
    nicho: number;
  };
  filtroLinea: FiltroLinea;
  onSelectFiltro: (filtro: FiltroLinea) => void;
}

export default function BrandMetrics({
  metricas,
  filtroLinea,
  onSelectFiltro,
}: BrandMetricsProps) {
  const items = [
    {
      id: "todas" as FiltroLinea,
      label: "Total Casas",
      count: metricas.total,
      activeClass: "bg-[var(--ivory)] border-[var(--gold)]",
      dotColor: "",
    },
    {
      id: "disenador" as FiltroLinea,
      label: "Diseñador",
      count: metricas.disenador,
      activeClass: "bg-amber-50/60 border-[var(--gold-deep)] text-[var(--gold-deep)]",
      dotColor: "bg-[var(--gold-deep)]",
    },
    {
      id: "arabe" as FiltroLinea,
      label: "Árabes",
      count: metricas.arabe,
      activeClass: "bg-emerald-50/60 border-emerald-700 text-emerald-800",
      dotColor: "bg-emerald-800",
    },
    {
      id: "nicho" as FiltroLinea,
      label: "Nicho / Autor",
      count: metricas.nicho,
      activeClass: "bg-purple-50/60 border-purple-600 text-purple-900",
      dotColor: "bg-purple-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
      {items.map((item) => {
        const isSelected = filtroLinea === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectFiltro(item.id)}
            className={`p-4 md:py-4 md:px-5 rounded border transition-all text-left cursor-pointer ${
              isSelected
                ? item.activeClass
                : "bg-white border-[var(--line)] hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {item.dotColor && (
                <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
              )}
              <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                {item.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-[var(--ink)] mt-1">
              {item.count}
            </div>
          </button>
        );
      })}
    </div>
  );
}
