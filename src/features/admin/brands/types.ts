import type { CommercialType } from "@/types/product";

export type FiltroLinea = "todas" | "disenador" | "arabe" | "nicho";

export interface BadgeLinea {
  label: string;
  className: string;
  dotColor: string;
}

export function getBadgeLinea(tipo: CommercialType): BadgeLinea {
  switch (tipo) {
    case "arabe":
      return {
        label: "Árabe",
        className: "bg-emerald-50 text-emerald-800 border border-emerald-300",
        dotColor: "#2f4f35",
      };
    case "nicho":
      return {
        label: "Nicho / Autor",
        className: "bg-purple-50 text-purple-800 border border-purple-300",
        dotColor: "#6b21a8",
      };
    case "disenador":
    default:
      return {
        label: "Diseñador",
        className: "bg-amber-50 text-amber-900 border border-amber-300",
        dotColor: "var(--gold-deep)",
      };
  }
}
