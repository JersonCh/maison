import React from "react";
import type { ResultadoImportacionFinal } from "./types";
import { CheckIcon, AlertCircleIcon, CameraIcon } from "./CsvIcons";

interface CsvResultStepProps {
  resultadoFinal: ResultadoImportacionFinal;
}

export function CsvResultStep({ resultadoFinal }: CsvResultStepProps) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "1.5px solid var(--gold)",
          background: "var(--ivory)",
          color: "var(--gold-deep)",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 16px auto",
          boxShadow: "0 4px 16px rgba(150, 108, 40, 0.12)",
        }}
      >
        <CheckIcon size={26} color="var(--gold-deep)" />
      </div>

      <h3 style={{ fontFamily: "var(--serif)", fontSize: "24px", margin: "0 0 8px 0", color: "var(--ink)", fontWeight: 400 }}>
        ¡Lote de perfumes procesado con éxito!
      </h3>
      <p style={{ color: "var(--muted)", fontSize: "13.5px", margin: "0 0 24px 0" }}>
        Los registros se sincronizaron exitosamente con el catálogo oficial de la tienda.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          maxWidth: "500px",
          margin: "0 auto 28px auto",
        }}
      >
        <div style={{ padding: "16px", background: "rgba(70, 106, 77, 0.06)", border: "1px solid rgba(70, 106, 77, 0.25)", borderRadius: "4px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#2f4f35", fontWeight: 600, letterSpacing: "0.08em" }}>
            Nuevos creados
          </span>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#2f4f35", marginTop: "4px" }}>
            {resultadoFinal.creados}
          </div>
        </div>

        <div style={{ padding: "16px", background: "rgba(240, 212, 126, 0.15)", border: "1px solid rgba(150, 108, 40, 0.3)", borderRadius: "4px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--gold-deep)", fontWeight: 600, letterSpacing: "0.08em" }}>
            Actualizados
          </span>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--gold-deep)", marginTop: "4px" }}>
            {resultadoFinal.actualizados}
          </div>
        </div>

        <div style={{ padding: "16px", background: "var(--ivory)", border: "1px solid var(--line)", borderRadius: "4px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em" }}>
            Omitidos
          </span>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--charcoal)", marginTop: "4px" }}>
            {resultadoFinal.omitidos}
          </div>
        </div>
      </div>

      {resultadoFinal.errores.length > 0 && (
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto 24px auto",
            textAlign: "left",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "14px 18px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          <strong style={{ color: "#991b1b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <AlertCircleIcon size={14} color="#991b1b" />
            Observaciones durante la inserción:
          </strong>
          <ul style={{ margin: 0, paddingLeft: "18px", color: "#b91c1c" }}>
            {resultadoFinal.errores.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          maxWidth: "540px",
          margin: "0 auto",
          background: "var(--ivory)",
          border: "1px solid var(--line)",
          padding: "14px 18px",
          borderRadius: "4px",
          fontSize: "12.5px",
          color: "var(--muted)",
          lineHeight: "1.5",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          textAlign: "left",
        }}
      >
        <div style={{ marginTop: "2px", color: "var(--gold-deep)", flexShrink: 0 }}>
          <CameraIcon size={16} color="var(--gold-deep)" />
        </div>
        <div>
          <strong style={{ color: "var(--ink)" }}>Fotografías del producto:</strong> Cada fragancia se ha dado de alta con una imagen por defecto. Puedes abrir su ficha técnica desde el catálogo para adjuntar sus fotografías en alta resolución de frasco, caja y detalle.
        </div>
      </div>
    </div>
  );
}

