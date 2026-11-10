import React from "react";

interface ProductPricingCardProps {
  precio50ml: number | "";
  setPrecio50ml: (v: number | "") => void;
  precio100ml: number | "";
  setPrecio100ml: (v: number | "") => void;
  precioRef50ml: number | "";
  setPrecioRef50ml: (v: number | "") => void;
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
  precio50ml,
  setPrecio50ml,
  precio100ml,
  setPrecio100ml,
  precioRef50ml,
  setPrecioRef50ml,
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
          Precios oficiales en Soles (S/)
        </span>
      </div>

      <div className="form-grid">
        <label>
          Precio 50 ml (S/)
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Ej. 490 (opcional si tiene 100 ml)"
            value={precio50ml}
            onChange={(e) =>
              setPrecio50ml(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </label>

        <label>
          Precio 100 ml (S/)
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Ej. 620 (opcional si tiene 50 ml)"
            value={precio100ml}
            onChange={(e) =>
              setPrecio100ml(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </label>

        <label className="full-field">
          Precio referencial / tachado (50 ml) (Opcional)
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Ej. 550 (se mostrará como precio anterior con descuento)"
            value={precioRef50ml}
            onChange={(e) =>
              setPrecioRef50ml(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </label>

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

