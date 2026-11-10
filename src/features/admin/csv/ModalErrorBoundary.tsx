import React from "react";
import { AlertCircleIcon } from "./CsvIcons";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ModalErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose: () => void },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[CsvImportModal ErrorBoundary caught]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(5, 6, 5, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              color: "#1a1a1a",
              padding: "28px",
              borderRadius: "4px",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <AlertCircleIcon size={20} color="#b91c1c" />
              <h3 style={{ color: "#b91c1c", margin: 0, fontSize: "17px", fontFamily: "var(--serif)" }}>
                Error al inicializar la ventana de importación
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
              Ocurrió un error inesperado al renderizar el componente:
            </p>
            <pre style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "3px", fontSize: "12px", overflowX: "auto" }}>
              {this.state.error?.message || "Error desconocido"}
            </pre>
            <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onClose();
                }}
              >
                Cerrar ventana
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

