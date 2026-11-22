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
      hasDot: false,
    },
    {
      id: "disenador" as FiltroLinea,
      label: "Diseñador",
      count: metricas.disenador,
      hasDot: true,
    },
    {
      id: "arabe" as FiltroLinea,
      label: "Árabes",
      count: metricas.arabe,
      hasDot: true,
    },
    {
      id: "nicho" as FiltroLinea,
      label: "Nicho / Autor",
      count: metricas.nicho,
      hasDot: true,
    },
  ];

  return (
    <div className="brands-metrics-grid">
      {items.map((item) => {
        const isSelected = filtroLinea === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectFiltro(item.id)}
            className={`brand-metric-card brand-metric-card--${item.id}${isSelected ? " is-active" : ""}`}
          >
            {item.hasDot ? (
              <div className="brand-metric-header">
                <span className="brand-metric-dot" />
                <span className="brand-metric-label">{item.label}</span>
              </div>
            ) : (
              <span className="brand-metric-label">{item.label}</span>
            )}
            <div className="brand-metric-count">{item.count}</div>
          </button>
        );
      })}
    </div>
  );
}
