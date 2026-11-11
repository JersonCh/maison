import React, { useEffect } from "react";
import Icon from "./Icon";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  subtitle?: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle = "Gestión de Catálogo",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";
  const badgeColor = isDanger ? "#b91c1c" : variant === "warning" ? "#966c28" : "var(--muted)";
  const confirmBtnBg = isDanger ? "#b91c1c" : variant === "warning" ? "#966c28" : "var(--ink)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(5, 6, 5, 0.75)",
        backdropFilter: "blur(6px)",
        padding: "20px",
        animation: "fadeInConfirm 0.15s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <style>{`
        @keyframes fadeInConfirm {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleInConfirm {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spinConfirm {
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          width: "min(480px, 100%)",
          background: "var(--white)",
          borderRadius: "4px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          animation: "scaleInConfirm 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            padding: "18px 24px",
            background: "var(--ivory)",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <small
              style={{
                color: badgeColor,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontSize: "10.5px",
                fontWeight: 600,
                display: "block",
              }}
            >
              {subtitle}
            </small>
            <h3
              id="confirm-modal-title"
              style={{
                margin: "4px 0 0 0",
                fontFamily: "var(--serif)",
                fontSize: "20px",
                color: "var(--ink)",
                fontWeight: 400,
                lineHeight: "1.25",
              }}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cerrar modal"
            style={{
              border: 0,
              background: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              color: "var(--muted)",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isLoading ? 0.4 : 1,
              transition: "color 0.15s ease",
            }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: "22px 24px" }}>
          {typeof message === "string" ? (
            <p
              style={{
                margin: 0,
                fontSize: "13.5px",
                color: "var(--ink)",
                lineHeight: "1.6",
              }}
            >
              {message}
            </p>
          ) : (
            message
          )}

          {/* Botones de acción */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              borderTop: "1px solid var(--line)",
              paddingTop: "18px",
              marginTop: "22px",
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isLoading}
              style={{
                background: "transparent",
                padding: "8px 16px",
                fontSize: "12.5px",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                background: confirmBtnBg,
                color: "#ffffff",
                border: "none",
                padding: "9px 18px",
                borderRadius: "3px",
                fontWeight: 600,
                fontSize: "12.5px",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "opacity 0.15s ease, background-color 0.15s ease",
              }}
            >
              {isLoading && (
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTopColor: "#ffffff",
                    borderRadius: "50%",
                    animation: "spinConfirm 0.8s linear infinite",
                  }}
                />
              )}
              {isLoading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

