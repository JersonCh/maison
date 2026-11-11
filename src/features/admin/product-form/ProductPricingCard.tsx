import React from "react";
import {
  TAMANOS_FRASCO_ESTANDAR,
  type CampoPrecioFrasco,
  type CampoPrecioReferenciaFrasco,
} from "@/lib/frascos";

interface ProductPricingCardProps {
  preciosFrascos: Record<CampoPrecioFrasco, number | "">;
  onChangePrecioFrasco: (field: CampoPrecioFrasco, value: number | "") => void;
  preciosReferencia: Record<CampoPrecioReferenciaFrasco, number | "">;
  referenciasHabilitadas: Record<CampoPrecioReferenciaFrasco, boolean>;
  onToggleReferencia: (refField: CampoPrecioReferenciaFrasco, habilitada: boolean) => void;
  onChangePrecioReferencia: (refField: CampoPrecioReferenciaFrasco, value: number | "") => void;
  tieneDecants: boolean;
  setTieneDecants: (v: boolean) => void;
  precioDecant3ml: number | "";
  setPrecioDecant3ml: (v: number | "") => void;
  precioDecant5ml: number | "";
  setPrecioDecant5ml: (v: number | "") => void;
  precioDecant10ml: number | "";
  setPrecioDecant10ml: (v: number | "") => void;
}

export function ProductPricingCard({
  preciosFrascos,
  onChangePrecioFrasco,
  preciosReferencia,
  referenciasHabilitadas,
  onToggleReferencia,
  onChangePrecioReferencia,
  tieneDecants,
  setTieneDecants,
  precioDecant3ml,
  setPrecioDecant3ml,
  precioDecant5ml,
  setPrecioDecant5ml,
  precioDecant10ml,
  setPrecioDecant10ml,
}: ProductPricingCardProps) {
  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <span className="card-badge">Formatos</span>
          <h2 className="admin-card-title">Precios y presentaciones</h2>
        </div>
        <span className="admin-card-subtitle">
          Precios en Soles (S/) · Completa solo los tamaños que vendes (mínimo 1 frasco)
        </span>
      </div>

      <div className="form-grid">
        {TAMANOS_FRASCO_ESTANDAR.map(({ ml, field, refField, placeholder }) => {
          const refActiva = Boolean(referenciasHabilitadas[refField]);
          const precioNormal = Number(preciosFrascos[field] || 0);
          const refVal = Number(preciosReferencia[refField] || 0);
          const descuentoPct =
            refActiva && precioNormal > 0 && refVal > precioNormal
              ? Math.round((1 - precioNormal / refVal) * 100)
              : null;

          return (
            <div key={ml} style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <label htmlFor={`precio-frasco-${ml}`} style={{ margin: 0 }}>
                  Precio {ml} ml (S/)
                </label>
                <label
                  style={{
                    display: "inline-flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "6px",
                    margin: 0,
                    cursor: "pointer",
                    fontSize: "11px",
                    color: refActiva ? "var(--gold-deep)" : "var(--muted)",
                    fontWeight: refActiva ? 600 : 400,
                  }}
                >
                  <input
                    type="checkbox"
                    style={{
                      width: "15px",
                      height: "15px",
                      padding: 0,
                      margin: 0,
                      accentColor: "#d7ad57",
                      cursor: "pointer",
                    }}
                    checked={refActiva}
                    onChange={(e) => onToggleReferencia(refField, e.target.checked)}
                  />
                  Precio tachado
                </label>
              </div>

              <input
                id={`precio-frasco-${ml}`}
                type="number"
                min="1"
                step="1"
                placeholder={`${placeholder} (opcional)`}
                value={preciosFrascos[field]}
                onChange={(e) =>
                  onChangePrecioFrasco(
                    field,
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />

              {refActiva && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "10px 12px",
                    background: "rgba(215, 173, 87, 0.06)",
                    border: "1px dashed rgba(215, 173, 87, 0.45)",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                      fontSize: "11px",
                    }}
                  >
                    <span style={{ color: "var(--muted)", fontWeight: 500 }}>
                      Precio anterior / tachado ({ml} ml)
                    </span>
                    {descuentoPct && descuentoPct > 0 ? (
                      <span
                        style={{
                          background: "var(--ink)",
                          color: "var(--white)",
                          padding: "1px 6px",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        -{descuentoPct}% OFF
                      </span>
                    ) : null}
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder={
                      precioNormal > 0
                        ? `Mayor a S/ ${precioNormal}`
                        : "Ej. precio antes de descuento"
                    }
                    value={preciosReferencia[refField]}
                    onChange={(e) =>
                      onChangePrecioReferencia(
                        refField,
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                  {refVal > 0 && precioNormal <= 0 && (
                    <small
                      style={{
                        display: "block",
                        color: "#b91c1c",
                        fontSize: "10.5px",
                        marginTop: "4px",
                      }}
                    >
                      Ingresa primero el precio normal de {ml} ml.
                    </small>
                  )}
                  {refVal > 0 && precioNormal > 0 && refVal <= precioNormal && (
                    <small
                      style={{
                        display: "block",
                        color: "#b91c1c",
                        fontSize: "10.5px",
                        marginTop: "4px",
                      }}
                    >
                      Debe ser mayor al precio normal (S/ {precioNormal}).
                    </small>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Box destacado de Decants */}
        <div
          className="full-field"
          style={{
            marginTop: "8px",
            padding: "16px 20px",
            background: "rgba(215, 173, 87, 0.05)",
            border: "1px solid rgba(215, 173, 87, 0.25)",
            borderRadius: "8px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              fontWeight: 600,
              margin: 0,
            }}
          >
            <input
              type="checkbox"
              style={{ width: "18px", height: "18px", accentColor: "#d7ad57" }}
              checked={tieneDecants}
              onChange={(e) => setTieneDecants(e.target.checked)}
            />
            <span style={{ fontSize: "14px", color: "var(--foreground)" }}>
              Habilitar venta en decants (3 ml, 5 ml y 10 ml)
            </span>
          </label>

          {tieneDecants && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "16px",
                marginTop: "16px",
                paddingLeft: "30px",
              }}
            >
              <label>
                Precio Decant 3 ml (S/)
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej. 30"
                  value={precioDecant3ml}
                  onChange={(e) =>
                    setPrecioDecant3ml(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </label>

              <label>
                Precio Decant 5 ml (S/)
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej. 45"
                  value={precioDecant5ml}
                  onChange={(e) =>
                    setPrecioDecant5ml(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </label>

              <label>
                Precio Decant 10 ml (S/)
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej. 80"
                  value={precioDecant10ml}
                  onChange={(e) =>
                    setPrecioDecant10ml(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

