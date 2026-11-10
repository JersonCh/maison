import React from "react";
import type { MarcaItem } from "./types";
import {
  descargarPlantillaExcel,
  descargarPlantillaCsv,
} from "@/lib/csvHelper";
import {
  UploadIcon,
  TableSheetIcon,
  DownloadArrowIcon,
  BookOpenIcon,
  ChevronDownIcon,
  InfoCircleIcon,
} from "./CsvIcons";

interface CsvUploadStepProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  procesarArchivo: (file: File) => void;
  marcas: MarcaItem[];
  mostrarGuia: boolean;
  setMostrarGuia: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CsvUploadStep({
  fileInputRef,
  isDragging,
  setIsDragging,
  handleDrop,
  procesarArchivo,
  marcas,
  mostrarGuia,
  setMostrarGuia,
}: CsvUploadStepProps) {
  return (
    <div>
      {/* ZONA DE CARGA ELEVADA */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? "1.5px solid var(--gold)" : "1px solid var(--line)",
          background: isDragging ? "rgba(240, 212, 126, 0.08)" : "var(--ivory)",
          borderRadius: "4px",
          padding: "44px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.25s ease",
          boxShadow: isDragging ? "0 8px 24px rgba(215, 173, 87, 0.15)" : "none",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          style={{ display: "none" }}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              procesarArchivo(e.target.files[0]);
            }
          }}
        />

        <span
          style={{
            display: "inline-block",
            fontSize: "10.5px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold-deep)",
            fontWeight: 600,
            marginBottom: "14px",
          }}
        >
          Área de Recepción de Archivo
        </span>

        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "1px solid var(--line)",
            background: "var(--white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            color: "var(--gold-deep)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          }}
        >
          <UploadIcon size={26} color="var(--gold-deep)" />
        </div>

        <h3
          style={{
            fontFamily: "var(--serif)",
            fontSize: "22px",
            fontWeight: 400,
            margin: "0 0 6px 0",
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
        >
          Arrastra tu catálogo en Excel (.xlsx) o CSV aquí
        </h3>

        <p style={{ color: "var(--muted)", fontSize: "13px", margin: "0 0 16px 0" }}>
          o haz clic para explorar los archivos de tu equipo
        </p>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.12em", padding: "2px 8px", borderRadius: "2px", border: "1px solid var(--line)", background: "var(--white)", color: "var(--muted)", fontWeight: 600 }}>XLSX</span>
          <span style={{ fontSize: "10px", letterSpacing: "0.12em", padding: "2px 8px", borderRadius: "2px", border: "1px solid var(--line)", background: "var(--white)", color: "var(--muted)", fontWeight: 600 }}>XLS</span>
          <span style={{ fontSize: "10px", letterSpacing: "0.12em", padding: "2px 8px", borderRadius: "2px", border: "1px solid var(--line)", background: "var(--white)", color: "var(--muted)", fontWeight: 600 }}>CSV</span>
          <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "4px" }}>Cualquier versión o idioma</span>
        </div>
      </div>

      {/* BLOQUE DE DESCARGA DE PLANTILLA OFICIAL ELEVADO */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px 24px",
          background: "var(--white)",
          borderRadius: "4px",
          border: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", maxWidth: "600px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--ivory)",
              border: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gold-deep)",
              flexShrink: 0,
              marginTop: "2px",
            }}
          >
            <TableSheetIcon size={19} color="var(--gold-deep)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
              <strong style={{ fontSize: "14px", color: "var(--ink)", letterSpacing: "0.01em" }}>
                Plantilla oficial de fragancias Maison
              </strong>
              <span
                style={{
                  border: "1px solid rgba(150, 108, 40, 0.35)",
                  background: "rgba(240, 212, 126, 0.15)",
                  color: "var(--gold-deep)",
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "2px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Recomendado
              </span>
            </div>
            <p style={{ fontSize: "12.5px", color: "var(--muted)", margin: 0, lineHeight: "1.55" }}>
              Formato oficial listo para editar en <strong>Excel (.xlsx)</strong> con columnas separadas (Casa, Fragancia, Línea, Precios y Decants) y hoja de referencia rápida.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-gold"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
              padding: "10px 20px",
              fontSize: "12.5px",
              letterSpacing: "0.04em",
            }}
            onClick={descargarPlantillaExcel}
          >
            <DownloadArrowIcon size={14} color="currentColor" />
            Descargar Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={descargarPlantillaCsv}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: "12px",
              cursor: "pointer",
              textDecoration: "underline",
              padding: "6px 8px",
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            o descargar copia en CSV (.csv)
          </button>
        </div>
      </div>

      {/* ACORDEÓN DE GUÍA DE ESPECIFICACIONES ELEVADO */}
      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
          onClick={() => setMostrarGuia(!mostrarGuia)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "13px 18px",
            background: "var(--ivory)",
            border: "1px solid var(--line)",
            borderRadius: mostrarGuia ? "4px 4px 0 0" : "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--ink)",
            transition: "background 0.2s ease",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BookOpenIcon size={15} color="var(--gold-deep)" />
            <span style={{ letterSpacing: "0.01em" }}>Guía de especificaciones y marcas registradas</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {mostrarGuia ? "Ocultar" : "Ver especificaciones"}
            </span>
            <ChevronDownIcon size={14} color="var(--muted)" rotated={mostrarGuia} />
          </div>
        </button>

        {mostrarGuia && (
          <div
            style={{
              border: "1px solid var(--line)",
              borderTop: 0,
              borderRadius: "0 0 4px 4px",
              padding: "20px 22px",
              background: "var(--ivory)",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "16px" }}>
              <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold-deep)", fontWeight: 600, marginBottom: "8px" }}>
                1. Casas y Marcas Registradas ({marcas.length} activas en la tienda)
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {marcas.map((m) => (
                  <span
                    key={m.id}
                    style={{
                      background: "var(--white)",
                      border: "1px solid var(--line)",
                      padding: "3px 9px",
                      borderRadius: "3px",
                      fontSize: "11.5px",
                      color: "var(--charcoal)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {m.nombre}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginTop: "10px",
                  padding: "10px 12px",
                  background: "var(--white)",
                  border: "1px solid var(--line)",
                  borderRadius: "3px",
                }}
              >
                <InfoCircleIcon size={14} color="var(--gold-deep)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.5" }}>
                  <strong style={{ color: "var(--ink)" }}>Tolerancia a erores y marcas nuevas:</strong> Si escribes con una pequeña falta tipográfica (ej. <i>Diioor</i> en lugar de <i>Dior</i>), el sistema te sugerirá la corrección en la previsualización. Si es una marca totalmente nueva, se registrará de forma automática.
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px" }}>
              <div style={{ background: "var(--white)", padding: "14px", border: "1px solid var(--line)", borderRadius: "3px" }}>
                <span style={{ display: "block", color: "var(--gold-deep)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: "6px" }}>
                  2. Líneas comerciales
                </span>
                <ul style={{ margin: 0, paddingLeft: "16px", color: "var(--charcoal)", fontSize: "12px", lineHeight: "1.6" }}>
                  <li><code>disenador</code> (lujo comercial)</li>
                  <li><code>arabe</code> (fragancias orientales)</li>
                  <li><code>nicho</code> (perfumería de autor)</li>
                </ul>
              </div>

              <div style={{ background: "var(--white)", padding: "14px", border: "1px solid var(--line)", borderRadius: "3px" }}>
                <span style={{ display: "block", color: "var(--gold-deep)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: "6px" }}>
                  3. Género
                </span>
                <ul style={{ margin: 0, paddingLeft: "16px", color: "var(--charcoal)", fontSize: "12px", lineHeight: "1.6" }}>
                  <li><code>Hombre</code> (o <code>H</code>, <code>masculino</code>)</li>
                  <li><code>Mujer</code> (o <code>M</code>, <code>femenino</code>)</li>
                  <li><code>Unisex</code> (o <code>U</code>, <code>ambos</code>)</li>
                </ul>
              </div>

              <div style={{ background: "var(--white)", padding: "14px", border: "1px solid var(--line)", borderRadius: "3px" }}>
                <span style={{ display: "block", color: "var(--gold-deep)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: "6px" }}>
                  4. Precios & Decants
                </span>
                <ul style={{ margin: 0, paddingLeft: "16px", color: "var(--charcoal)", fontSize: "12px", lineHeight: "1.6" }}>
                  <li>Frascos: <code>50</code>, <code>75</code>, <code>100</code>, <code>125</code>, <code>150</code> o <code>200ml</code> (al menos uno obligatorio).</li>
                  <li><code>3ml</code>, <code>5ml</code>, <code>10ml</code> decants opcionales.</li>
                </ul>
              </div>

              <div style={{ background: "var(--white)", padding: "14px", border: "1px solid var(--line)", borderRadius: "3px" }}>
                <span style={{ display: "block", color: "var(--gold-deep)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: "6px" }}>
                  5. Fotografías
                </span>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "12px", lineHeight: "1.5" }}>
                  No requiere URLs de imágenes. Cada producto se crea con la imagen por defecto y podrás adjuntar sus fotografías desde el panel.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

