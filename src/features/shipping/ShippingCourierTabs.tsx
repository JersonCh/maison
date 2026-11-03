import { useState } from "react";
import Icon from "@/components/ui/Icon";

type Courier = "shalom" | "olva";

export default function ShippingCourierTabs() {
  const [activeCourier, setActiveCourier] = useState<Courier>("shalom");

  return (
    <div className="courier-interactive-card">
      <div className="courier-tabs-nav" role="tablist" aria-label="Operadores de envío">
        <button
          type="button"
          role="tab"
          aria-selected={activeCourier === "shalom"}
          className={`courier-tab-btn ${activeCourier === "shalom" ? "active" : ""}`}
          onClick={() => setActiveCourier("shalom")}
        >
          <span className="courier-logo-badge shalom">Shalom</span>
          <span className="courier-tab-label">Recojo en Agencia</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeCourier === "olva"}
          className={`courier-tab-btn ${activeCourier === "olva" ? "active" : ""}`}
          onClick={() => setActiveCourier("olva")}
        >
          <span className="courier-logo-badge olva">Olva Courier</span>
          <span className="courier-tab-label">Entrega a Domicilio</span>
        </button>
      </div>

      <div className="courier-tab-content">
        {activeCourier === "shalom" ? (
          <div className="courier-panel fade-in" key="shalom">
            <div className="courier-header-row">
              <div>
                <span className="courier-badge-tag">Más económico · Retiro personal</span>
                <h3 className="courier-title">Shalom Empresarial</h3>
              </div>
              <span className="courier-speed">24 a 48 hrs aprox.</span>
            </div>

            <p className="courier-description">
              La alternativa preferida para quienes cuentan con una agencia Shalom cercana y desean 
              ahorro y rapidez en la entrega.
            </p>

            <div className="courier-specs-grid">
              <div className="spec-box">
                <span className="spec-label">Modalidad de entrega</span>
                <strong className="spec-val">Retiro en agencia oficial</strong>
                <p className="spec-note">Presentas tu DNI físico original y el código de seguridad recibido por SMS.</p>
              </div>

              <div className="spec-box">
                <span className="spec-label">Cálculo de cobro</span>
                <strong className="spec-val">Por tamaño de caja</strong>
                <p className="spec-note">Tarifa base por caja pequeña estándar (cubre de 1 a 2 perfumes embalados).</p>
              </div>

              <div className="spec-box">
                <span className="spec-label">Pago del flete</span>
                <strong className="spec-val">Pago en Destino disponible</strong>
                <p className="spec-note">Puedes abonar el costo del envío directamente en ventanilla al retirar.</p>
              </div>

              <div className="spec-box">
                <span className="spec-label">Rastreo de encomienda</span>
                <strong className="spec-val">Guía de remisión oficial</strong>
                <p className="spec-note">Seguimiento en tiempo real ingresando tu número de guía en shalom.pe.</p>
              </div>
            </div>

            <div className="courier-footer-tip">
              <Icon name="check" size={16} />
              <span>Cobertura en todas las capitales de departamento y principales provincias del país.</span>
            </div>
          </div>
        ) : (
          <div className="courier-panel fade-in" key="olva">
            <div className="courier-header-row">
              <div>
                <span className="courier-badge-tag">Comodidad total · Puerta a puerta</span>
                <h3 className="courier-title">Olva Courier</h3>
              </div>
              <span className="courier-speed">48 a 72 hrs hábiles</span>
            </div>

            <p className="courier-description">
              Ideal si prefieres recibir tu fragancia directamente en tu hogar, oficina o negocio 
              en cualquier distrito de Lima y provincias.
            </p>

            <div className="courier-specs-grid">
              <div className="spec-box">
                <span className="spec-label">Modalidad de entrega</span>
                <strong className="spec-val">Directo a tu domicilio</strong>
                <p className="spec-note">Entrega personal o a un tercero mayor de edad presentando su documento de identidad.</p>
              </div>

              <div className="spec-box">
                <span className="spec-label">Cálculo de cobro</span>
                <strong className="spec-val">Por peso (hasta 1 kg base)</strong>
                <p className="spec-note">Un perfume con empaque de alta seguridad encaja dentro del rango base de 1 kg.</p>
              </div>

              <div className="spec-box">
                <span className="spec-label">Pago del flete</span>
                <strong className="spec-val">Prepagado en origen</strong>
                <p className="spec-note">El valor exacto del flete se cancela previamente junto con el pedido.</p>
              </div>

              <div className="spec-box">
                <span className="spec-label">Rastreo de encomienda</span>
                <strong className="spec-val">Número de remito web</strong>
                <p className="spec-note">Rastreo detallado desde la web de olvacourier.com hasta la puerta de tu casa.</p>
              </div>
            </div>

            <div className="courier-footer-tip">
              <Icon name="check" size={16} />
              <span>También disponible en modalidad recojo en tienda Olva si así lo solicitas.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
