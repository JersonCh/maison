import React from "react";
import type { MarcaItem, FilaCsvProcesada, FiltroVistaPreview } from "./types";
import {
  FileTextIcon,
  TableSheetIcon,
  RefreshIcon,
  CheckIcon,
  AlertCircleIcon,
  CloseIcon,
} from "./CsvIcons";

interface CsvPreviewStepProps {
  nombreArchivo: string;
  tamanoArchivo: string;
  reiniciarModal: () => void;
  filtroVista: FiltroVistaPreview;
  setFiltroVista: (v: FiltroVistaPreview) => void;
  resumen: {
    total: number;
    validos: number;
    duplicados: number;
    errores: number;
  };
  modoDuplicados: "omitir" | "actualizar";
  setModoDuplicados: (m: "omitir" | "actualizar") => void;
  filasFiltradas: FilaCsvProcesada[];
  marcas: MarcaItem[];
  corregirMarcaFila: (filaNumero: number, nuevaMarca: string) => void;
}

export function CsvPreviewStep({
  nombreArchivo,
  tamanoArchivo,
  reiniciarModal,
  filtroVista,
  setFiltroVista,
  resumen,
  modoDuplicados,
  setModoDuplicados,
  filasFiltradas,
  marcas,
  corregirMarcaFila,
}: CsvPreviewStepProps) {
  return (
    <div>
      {/* BARRA SUPERIOR DE RESUMEN DEL ARCHIVO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--ivory)",
          border: "1px solid var(--line)",
          padding: "12px 18px",
          borderRadius: "4px",
          marginBottom: "18px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--white)",
              border: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gold-deep)",
            }}
          >
            {nombreArchivo.toLowerCase().endsWith(".csv") ? (
              <FileTextIcon size={16} color="var(--gold-deep)" />
            ) : (
              <TableSheetIcon size={16} color="var(--gold-deep)" />
            )}
          </div>
          <div>
            <strong style={{ color: "var(--ink)", fontSize: "13.5px" }}>{nombreArchivo}</strong>
            <span style={{ color: "var(--muted)", fontSize: "11.5px", marginLeft: "8px" }}>({tamanoArchivo})</span>
          </div>
        </div>

        <button
          type="button"
          onClick={reiniciarModal}
          style={{
            border: "1px solid var(--line)",
            background: "var(--white)",
            padding: "6px 12px",
            borderRadius: "3px",
            fontSize: "11.5px",
            cursor: "pointer",
            color: "var(--charcoal)",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--gold)";
            e.currentTarget.style.color = "var(--gold-deep)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--line)";
            e.currentTarget.style.color = "var(--charcoal)";
          }}
        >
          <RefreshIcon size={12} color="currentColor" />
          Cambiar archivo
        </button>
      </div>

      {/* TARJETAS DE CONTADORES ELEVADAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          onClick={() => setFiltroVista("todos")}
          style={{
            padding: "12px 16px",
            background: filtroVista === "todos" ? "#f5f3ef" : "var(--white)",
            border: `1px solid ${filtroVista === "todos" ? "var(--gold)" : "var(--line)"}`,
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.08em", fontWeight: 600 }}>
            Total detectados
          </span>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--ink)", marginTop: "2px" }}>
            {resumen.total}
          </div>
        </div>

        <div
          onClick={() => setFiltroVista("validos")}
          style={{
            padding: "12px 16px",
            background: filtroVista === "validos" ? "rgba(70, 106, 77, 0.08)" : "var(--white)",
            border: `1px solid ${filtroVista === "validos" ? "#466a4d" : "var(--line)"}`,
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <CheckIcon size={12} color="#2f4f35" />
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#2f4f35", letterSpacing: "0.08em", fontWeight: 600 }}>
              Listos para crear
            </span>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#2f4f35", marginTop: "2px" }}>
            {resumen.validos}
          </div>
        </div>

        <div
          onClick={() => setFiltroVista("duplicados")}
          style={{
            padding: "12px 16px",
            background: filtroVista === "duplicados" ? "rgba(240, 212, 126, 0.15)" : "var(--white)",
            border: `1px solid ${filtroVista === "duplicados" ? "var(--gold-deep)" : "var(--line)"}`,
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <AlertCircleIcon size={12} color="var(--gold-deep)" />
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--gold-deep)", letterSpacing: "0.08em", fontWeight: 600 }}>
              Ya en catálogo
            </span>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--gold-deep)", marginTop: "2px" }}>
            {resumen.duplicados}
          </div>
        </div>

        <div
          onClick={() => setFiltroVista("errores")}
          style={{
            padding: "12px 16px",
            background: filtroVista === "errores" ? "#fef2f2" : "var(--white)",
            border: `1px solid ${filtroVista === "errores" ? "#ef4444" : "var(--line)"}`,
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <CloseIcon size={11} color="#991b1b" />
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#991b1b", letterSpacing: "0.08em", fontWeight: 600 }}>
              Con observaciones
            </span>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#991b1b", marginTop: "2px" }}>
            {resumen.errores}
          </div>
        </div>
      </div>

      {/* CONFIGURACIÓN DE DUPLICADOS */}
      {resumen.duplicados > 0 && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(240, 212, 126, 0.12)",
            border: "1px solid rgba(150, 108, 40, 0.3)",
            borderRadius: "4px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircleIcon size={16} color="var(--gold-deep)" />
            <div>
              <strong style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>
                Se encontraron {resumen.duplicados} fragancias que ya existen en el catálogo:
              </strong>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                Elige qué acción tomar con los productos coincidentes.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", margin: 0, textTransform: "none", letterSpacing: "normal" }}>
              <input
                type="radio"
                name="modoDuplicados"
                checked={modoDuplicados === "omitir"}
                onChange={() => setModoDuplicados("omitir")}
                style={{ width: "auto", margin: 0 }}
              />
              <span><strong>Omitir</strong> (conservar datos actuales)</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", margin: 0, textTransform: "none", letterSpacing: "normal" }}>
              <input
                type="radio"
                name="modoDuplicados"
                checked={modoDuplicados === "actualizar"}
                onChange={() => setModoDuplicados("actualizar")}
                style={{ width: "auto", margin: 0 }}
              />
              <span><strong>Actualizar precios</strong> (50ml, 100ml y decants)</span>
            </label>
          </div>
        </div>
      )}

      {/* TABLA DE PREVISUALIZACIÓN */}
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: "4px",
          overflow: "hidden",
          maxHeight: "360px",
          overflowY: "auto",
          background: "var(--white)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
          <thead style={{ background: "var(--ivory)", position: "sticky", top: 0, zIndex: 2 }}>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <th style={{ padding: "10px 12px", width: "45px" }}>Fila</th>
              <th style={{ padding: "10px 12px", width: "110px" }}>Estado</th>
              <th style={{ padding: "10px 12px" }}>Marca & Fragancia</th>
              <th style={{ padding: "10px 12px", width: "90px" }}>Línea</th>
              <th style={{ padding: "10px 12px", width: "80px" }}>Género</th>
              <th style={{ padding: "10px 12px", width: "130px" }}>Precios Frascos</th>
              <th style={{ padding: "10px 12px", width: "120px" }}>Decants</th>
              <th style={{ padding: "10px 12px" }}>Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            {filasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
                  No hay fragancias en este filtro.
                </td>
              </tr>
            ) : (
              filasFiltradas.map((f) => {
                let badgeBg = "rgba(70, 106, 77, 0.1)";
                let badgeColor = "#2f4f35";
                let badgeBorder = "1px solid rgba(70, 106, 77, 0.25)";
                let badgeText = "Válido";

                if (!f.esValido) {
                  badgeBg = "#fee2e2";
                  badgeColor = "#991b1b";
                  badgeBorder = "1px solid #fecaca";
                  badgeText = "Error";
                } else if (f.esDuplicado) {
                  badgeBg = "rgba(240, 212, 126, 0.2)";
                  badgeColor = "var(--gold-deep)";
                  badgeBorder = "1px solid rgba(150, 108, 40, 0.3)";
                  badgeText = modoDuplicados === "actualizar" ? "Actualizar" : "Duplicado";
                } else if (f.marcaEsNueva) {
                  badgeBg = "var(--ivory)";
                  badgeColor = "var(--gold-deep)";
                  badgeBorder = "1px solid var(--gold)";
                  badgeText = "+ Marca nueva";
                }

                return (
                  <tr
                    key={f.filaNumero}
                    style={{
                      borderBottom: "1px solid #f0eee6",
                      background: !f.esValido ? "#fffafa" : f.esDuplicado ? "#fffdf5" : "inherit",
                    }}
                  >
                    <td style={{ padding: "9px 12px", color: "var(--muted)", fontWeight: 600 }}>
                      #{f.filaNumero}
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "2px",
                          fontSize: "10.5px",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          background: badgeBg,
                          color: badgeColor,
                          border: badgeBorder,
                        }}
                      >
                        {badgeText}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <strong style={{ color: "var(--ink)", display: "block" }}>{f.nombre || "—"}</strong>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "3px" }}>
                        <span style={{ color: "var(--charcoal)", fontSize: "11.5px", fontWeight: 500 }}>
                          {f.marca || "—"}
                        </span>

                        {f.marcaSugerida && (
                          <button
                            type="button"
                            onClick={() => corregirMarcaFila(f.filaNumero, f.marcaSugerida!)}
                            title={`Haz clic para cambiar "${f.marca}" por la casa oficial "${f.marcaSugerida}"`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              fontSize: "11px",
                              fontWeight: 600,
                              background: "rgba(215, 173, 87, 0.16)",
                              color: "var(--gold-deep)",
                              border: "1px solid var(--gold)",
                              padding: "1px 7px",
                              borderRadius: "3px",
                              cursor: "pointer",
                            }}
                          >
                            ✓ Usar "{f.marcaSugerida}"
                          </button>
                        )}

                        <select
                          value={marcas.some((m) => m.nombre.toLowerCase() === f.marca.toLowerCase()) ? f.marca : "__cambiar__"}
                          onChange={(e) => {
                            if (e.target.value !== "__cambiar__") {
                              corregirMarcaFila(f.filaNumero, e.target.value);
                            }
                          }}
                          style={{
                            fontSize: "10.5px",
                            padding: "1px 4px",
                            border: "1px solid #d5d3cb",
                            borderRadius: "3px",
                            background: "#fff",
                            color: "#666",
                            cursor: "pointer",
                            maxWidth: "115px",
                          }}
                          title="O selecciona otra casa registrada"
                        >
                          <option value="__cambiar__">Cambiar casa...</option>
                          {marcas.map((m) => (
                            <option key={m.id} value={m.nombre}>
                              {m.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td style={{ padding: "9px 12px", textTransform: "capitalize" }}>
                      {f.linea_comercial}
                    </td>
                    <td style={{ padding: "9px 12px" }}>{f.genero}</td>
                    <td style={{ padding: "9px 12px" }}>
                      {[
                        f.precio_50ml && f.precio_50ml > 0 ? `50ml: S/ ${f.precio_50ml}` : null,
                        f.precio_75ml && f.precio_75ml > 0 ? `75ml: S/ ${f.precio_75ml}` : null,
                        f.precio_100ml && f.precio_100ml > 0 ? `100ml: S/ ${f.precio_100ml}` : null,
                        f.precio_125ml && f.precio_125ml > 0 ? `125ml: S/ ${f.precio_125ml}` : null,
                        f.precio_150ml && f.precio_150ml > 0 ? `150ml: S/ ${f.precio_150ml}` : null,
                        f.precio_200ml && f.precio_200ml > 0 ? `200ml: S/ ${f.precio_200ml}` : null,
                      ]
                        .filter(Boolean)
                        .map((texto, i) => (
                          <div key={i} style={{ fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>
                            {texto}
                          </div>
                        ))}
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      {f.tiene_decants ? (
                        <span style={{ color: "var(--gold-deep)", fontSize: "11px", fontWeight: 600 }}>
                          {[
                            f.precio_decant_3ml ? `3ml: S/${f.precio_decant_3ml}` : null,
                            f.precio_decant_5ml ? `5ml: S/${f.precio_decant_5ml}` : null,
                            f.precio_decant_10ml ? `10ml: S/${f.precio_decant_10ml}` : null,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      {f.errores.map((err, i) => (
                        <div key={i} style={{ color: "#dc2626", fontSize: "11px", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                          <CloseIcon size={10} color="#dc2626" />
                          <span>{err}</span>
                        </div>
                      ))}
                      {f.advertencias.map((adv, i) => (
                        <div key={i} style={{ color: "#d97706", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <AlertCircleIcon size={11} color="#d97706" />
                          <span>{adv}</span>
                        </div>
                      ))}
                      {f.esValido && f.advertencias.length === 0 && (
                        <span style={{ color: "#2f4f35", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckIcon size={12} color="#2f4f35" /> Formato correcto
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

