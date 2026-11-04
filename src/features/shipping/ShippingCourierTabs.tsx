import { useState } from "react";
import Icon from "@/components/ui/Icon";
import BrandLogo from "@/components/ui/BrandLogos";

type Courier = "shalom" | "olva";

export default function ShippingCourierTabs() {
  const [activeCourier, setActiveCourier] = useState<Courier>("shalom");

  return (
    <div className="courier-interactive-card">
      {/* Header Selector con logos oficiales */}
      <div className="courier-tabs-nav" role="tablist" aria-label="Operadores de envío">
        <button
          type="button"
          role="tab"
          aria-selected={activeCourier === "shalom"}
          className={`courier-tab-btn ${activeCourier === "shalom" ? "active" : ""}`}
          onClick={() => setActiveCourier("shalom")}
        >
          <div className="tab-logo-wrap">
            <BrandLogo name="shalom" height={30} />
          </div>
          <div className="tab-text-wrap">
            <span className="courier-tab-title">Shalom</span>
            <span className="courier-tab-sub">Recojo en Agencia</span>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeCourier === "olva"}
          className={`courier-tab-btn ${activeCourier === "olva" ? "active" : ""}`}
          onClick={() => setActiveCourier("olva")}
        >
          <div className="tab-logo-wrap">
            <BrandLogo name="olva" height={30} />
          </div>
          <div className="tab-text-wrap">
            <span className="courier-tab-title">Olva Courier</span>
            <span className="courier-tab-sub">Entrega a Domicilio · Puerta a puerta</span>
          </div>
        </button>
      </div>

      <div className="courier-tab-content">
        {activeCourier === "shalom" ? (
          <div className="courier-panel fade-in" key="shalom">
            <div className="courier-panel-header">
              <div className="courier-title-group">
                <BrandLogo name="shalom" height={34} />
                <div>
                  <span className="courier-highlight-pill">Cobertura en agencia a nivel nacional</span>
                  <h3>Servicio de Encomienda en Agencia</h3>
                </div>
              </div>
              <div className="courier-time-badge">
                <Icon name="clock" size={15} />
                <span>24 a 48 hrs aprox.</span>
              </div>
            </div>

            <p className="courier-lead">
              Es la opción predilecta de nuestros clientes por su rapidez y economía. Retiras tu fragancia en la agencia oficial Shalom más cercana a tu distrito o provincia en todo el Perú.
            </p>

            <div className="courier-features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="box" size={18} />
                </div>
                <div>
                  <span className="feature-title">Tarifa por caja estándar</span>
                  <p className="feature-desc">
                    El costo base se calcula por volumen de caja pequeña (protege con holgura de 1 a 2 perfumes embalados).
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="check" size={18} />
                </div>
                <div>
                  <span className="feature-title">Opción Pago en Destino</span>
                  <p className="feature-desc">
                    Puedes abonar el importe del flete de envío en ventanilla al momento de recoger tu paquete en la agencia.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="user" size={18} />
                </div>
                <div>
                  <span className="feature-title">Retiro seguro con DNI y clave</span>
                  <p className="feature-desc">
                    Solo el titular con su documento de identidad y el código único de seguridad enviado por SMS puede recoger el paquete.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="truck" size={18} />
                </div>
                <div>
                  <span className="feature-title">Rastreo web en tiempo real</span>
                  <p className="feature-desc">
                    Te entregamos la fotografía de tu guía oficial para monitorear el estado exacto en <em>shalom.pe</em>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="courier-panel fade-in" key="olva">
            <div className="courier-panel-header">
              <div className="courier-title-group">
                <BrandLogo name="olva" height={34} />
                <div>
                  <span className="courier-highlight-pill">Comodidad y seguridad sin salir de casa</span>
                  <h3>Servicio de Entrega Puerta a Puerta</h3>
                </div>
              </div>
              <div className="courier-time-badge">
                <Icon name="clock" size={15} />
                <span>48 a 72 hrs hábiles</span>
              </div>
            </div>

            <p className="courier-lead">
              La alternativa ideal si buscas comodidad absoluta. El repartidor de Olva Courier entrega tu fragancia en la dirección exacta de tu casa, edificio u oficina en cualquier parte del país.
            </p>

            <div className="courier-features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="box" size={18} />
                </div>
                <div>
                  <span className="feature-title">Tarifa por peso (hasta 1 kg)</span>
                  <p className="feature-desc">
                    Un perfume con su estuche y doble amortiguación entra en el rango mínimo base de hasta 1 kg de Olva.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="check" size={18} />
                </div>
                <div>
                  <span className="feature-title">Prepagado en origen</span>
                  <p className="feature-desc">
                    El costo de envío se cancela junto con el perfume antes de despachar, sin pagos adicionales al recibir.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="user" size={18} />
                </div>
                <div>
                  <span className="feature-title">Recepción en domicilio</span>
                  <p className="feature-desc">
                    Puede recibir el titular o cualquier persona autorizada en la dirección de entrega presentando DNI.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="truck" size={18} />
                </div>
                <div>
                  <span className="feature-title">Número de remito Olva</span>
                  <p className="feature-desc">
                    Seguimiento paso a paso desde el centro logístico hasta tu puerta en <em>olvacourier.com</em>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
