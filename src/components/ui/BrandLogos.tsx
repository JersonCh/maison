import React from "react";

export type BrandName =
  | "shalom"
  | "olva"
  | "yape"
  | "plin"
  | "bcp"
  | "bbva"
  | "interbank"
  | "visa";

interface BrandLogoProps {
  name: BrandName;
  className?: string;
  height?: number;
}

export default function BrandLogo({ name, className = "", height = 36 }: BrandLogoProps) {
  // Mapeo a las imágenes reales 120x60 subidas en public/assets/payments/
  const realLogos: Record<string, { src: string; alt: string }> = {
    bbva: { src: "/assets/payments/bbva.png", alt: "BBVA" },
    bcp: { src: "/assets/payments/bcp.png", alt: "BCP" },
    interbank: { src: "/assets/payments/interbank.png", alt: "Interbank" },
    olva: { src: "/assets/payments/olva.png", alt: "Olva Courier" },
    plin: { src: "/assets/payments/plin.png", alt: "Plin" },
    shalom: { src: "/assets/payments/shalom.png", alt: "Shalom" },
    yape: { src: "/assets/payments/yape.png", alt: "Yape" },
  };

  if (realLogos[name]) {
    const item = realLogos[name];
    return (
      <img
        src={item.src}
        alt={item.alt}
        className={`brand-logo-img brand-${name} ${className}`}
        style={{
          height: `${height}px`,
          width: "auto",
          maxWidth: "100%",
          borderRadius: "4px",
          display: "inline-block",
          objectFit: "contain",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // Fallbacks estilizados para Visa y Shalom mientras se suban sus archivos
  if (name === "visa") {
    return (
      <div
        className={`brand-logo-fallback brand-visa ${className}`}
        style={{
          height: `${height}px`,
          width: `${Math.round(height * 2)}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1F71",
          borderRadius: "4px",
          color: "#FFFFFF",
          fontFamily: "'Arial Black', Arial, sans-serif",
          fontSize: `${Math.round(height * 0.44)}px`,
          fontStyle: "italic",
          fontWeight: 900,
          letterSpacing: "1px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
        }}
      >
        VISA
      </div>
    );
  }

  if (name === "shalom") {
    return (
      <div
        className={`brand-logo-fallback brand-shalom ${className}`}
        style={{
          height: `${height}px`,
          padding: `0 ${Math.round(height * 0.35)}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#D32F2F",
          borderRadius: "4px",
          color: "#FFFFFF",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: `${Math.round(height * 0.4)}px`,
          fontWeight: 900,
          letterSpacing: "1px",
          gap: "6px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
        }}
      >
        <span style={{ color: "#FFD54F" }}>▶</span> SHALOM
      </div>
    );
  }

  return null;
}
