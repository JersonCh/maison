import React, { useState, useRef, useMemo } from "react";
import type { MarcaItem, ProductoAdminItem } from "@/types/database";
import {
  procesarContenidoCsv,
  procesarBufferExcel,
  descargarPlantillaExcel,
  descargarPlantillaCsv,
  type FilaCsvProcesada,
} from "@/lib/csvHelper";

interface Props {
  marcas?: MarcaItem[];
  productos?: ProductoAdminItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

type FiltroVistaPreview = "todos" | "validos" | "duplicados" | "errores";

/* =============================================================================
   ICONOS SVG MINIMALISTAS - ESTÉTICA ALTA PERFUMERÍA MAISON
   ============================================================================= */

function UploadIcon({ size = 26, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16.5v2.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" />
      <polyline points="16 8 12 4 8 8" />
      <line x1="12" y1="4" x2="12" y2="16" />
    </svg>
  );
}

function TableSheetIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 9v12" />
    </svg>
  );
}

function DownloadArrowIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function BookOpenIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ChevronDownIcon({ size = 13, color = "currentColor", rotated = false }: { size?: number; color?: string; rotated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function InfoCircleIcon({ size = 14, color = "currentColor", style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CheckIcon({ size = 16, color = "currentColor", style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertCircleIcon({ size = 15, color = "currentColor", style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RefreshIcon({ size = 13, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function CameraIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function CloseIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function FileTextIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function SpinnerIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: "spinModal 0.9s linear infinite" }}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function ArrowLeftIcon({ size = 13, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

/* =============================================================================
   ERROR BOUNDARY
   ============================================================================= */

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ModalErrorBoundary extends React.Component<{ children: React.ReactNode; onClose: () => void }, ErrorBoundaryState> {
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

/* =============================================================================
   COMPONENTE PRINCIPAL DE IMPORTACIÓN MASIVA
   ============================================================================= */

function CsvImportModalContent({
  marcas = [],
  productos = [],
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [tamanoArchivo, setTamanoArchivo] = useState("");
  const [filas, setFilas] = useState<FilaCsvProcesada[]>([]);
  const [modoDuplicados, setModoDuplicados] = useState<"omitir" | "actualizar">("omitir");
  const [filtroVista, setFiltroVista] = useState<FiltroVistaPreview>("todos");
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const [importando, setImportando] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  // Resultado de la importación
  const [resultadoFinal, setResultadoFinal] = useState<{
    creados: number;
    actualizados: number;
    omitidos: number;
    errores: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Manejo de lectura de archivo (Excel .xlsx / .xls o .csv)
  const procesarArchivo = (file: File) => {
    const ext = file.name.toLowerCase();
    const esExcel = ext.endsWith(".xlsx") || ext.endsWith(".xls");
    const esCsv = ext.endsWith(".csv");

    if (!esExcel && !esCsv) {
      setErrorGlobal("Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv) válido.");
      return;
    }

    setErrorGlobal(null);
    setNombreArchivo(file.name);
    setTamanoArchivo(`${(file.size / 1024).toFixed(1)} KB`);

    if (esExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const resultado = procesarBufferExcel(buffer, productos, marcas);

          if (resultado.filas.length === 0) {
            setErrorGlobal("El archivo Excel no contiene filas con fragancias o las cabeceras no coinciden con la plantilla.");
            return;
          }

          setFilas(resultado.filas);
          setPaso(2);
        } catch (err: any) {
          setErrorGlobal(err.message || "Error al procesar la hoja de cálculo de Excel.");
        }
      };
      reader.onerror = () => {
        setErrorGlobal("Error al leer el archivo Excel desde el dispositivo.");
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const contenido = (e.target?.result as string) || "";
          const resultado = procesarContenidoCsv(contenido, productos, marcas);

          if (resultado.filas.length === 0) {
            setErrorGlobal("El archivo CSV no contiene registros o el formato de columnas no coincide.");
            return;
          }

          setFilas(resultado.filas);
          setPaso(2);
        } catch (err: any) {
          setErrorGlobal(err.message || "Error al procesar el archivo CSV.");
        }
      };
      reader.onerror = () => {
        setErrorGlobal("Error al leer el archivo CSV desde el dispositivo.");
      };
      reader.readAsText(file, "UTF-8");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarArchivo(e.dataTransfer.files[0]);
    }
  };

  // Contadores
  const resumen = useMemo(() => {
    const total = filas.length;
    const validos = filas.filter((f) => f.esValido && !f.esDuplicado).length;
    const duplicados = filas.filter((f) => f.esValido && f.esDuplicado).length;
    const errores = filas.filter((f) => !f.esValido).length;
    return { total, validos, duplicados, errores };
  }, [filas]);

  // Filtrado para la previsualización interactiva
  const filasFiltradas = useMemo(() => {
    switch (filtroVista) {
      case "validos":
        return filas.filter((f) => f.esValido && !f.esDuplicado);
      case "duplicados":
        return filas.filter((f) => f.esValido && f.esDuplicado);
      case "errores":
        return filas.filter((f) => !f.esValido);
      default:
        return filas;
    }
  }, [filas, filtroVista]);

  // Cuántos productos se van a procesar según el modo de duplicados
  const cantidadAImportar = useMemo(() => {
    if (modoDuplicados === "actualizar") {
      return filas.filter((f) => f.esValido).length;
    }
    return filas.filter((f) => f.esValido && !f.esDuplicado).length;
  }, [filas, modoDuplicados]);

  // Ejecución de la importación
  const ejecutarImportacion = async () => {
    if (cantidadAImportar === 0) return;
    setImportando(true);
    setErrorGlobal(null);

    try {
      const resp = await fetch("/api/admin/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productos: filas,
          modoDuplicados,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Error al importar el archivo.");
      }

      setResultadoFinal(data.resultado);
      setPaso(3);
    } catch (err: any) {
      setErrorGlobal(err.message || "Error al comunicarse con el servidor.");
    } finally {
      setImportando(false);
    }
  };

  const reiniciarModal = () => {
    setPaso(1);
    setNombreArchivo("");
    setTamanoArchivo("");
    setFilas([]);
    setModoDuplicados("omitir");
    setFiltroVista("todos");
    setResultadoFinal(null);
    setErrorGlobal(null);
    setIsDragging(false);
  };

  const handleCerrarYFinalizar = () => {
    if (resultadoFinal) {
      onSuccess(
        `Importación completada: ${resultadoFinal.creados} fragancias registradas, ${resultadoFinal.actualizados} actualizadas.`
      );
    }
    reiniciarModal();
    onClose();
  };

  return (
    <div
      className="admin-modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "auto",
        padding: "20px",
        background: "rgba(5, 6, 5, 0.78)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !importando) {
          onClose();
        }
      }}
    >
      <style>{`
        @keyframes spinModal {
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="csv-modal-card"
        style={{
          width: "min(1100px, 100%)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--white)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
          borderRadius: "4px",
          overflow: "hidden",
          margin: "auto",
        }}
      >
        {/* CABECERA */}
        <div
          className="modal-head"
          style={{
            padding: "22px 30px",
            margin: 0,
            background: "var(--ivory)",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <small style={{ color: "var(--gold-deep)", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "11px", fontWeight: 600 }}>
              Gestión Masiva de Catálogo
            </small>
            <h2 style={{ margin: "4px 0 0 0", fontFamily: "var(--serif)", fontSize: "23px", color: "var(--ink)", fontWeight: 400 }}>
              {paso === 1 && "Importar Fragancias desde Excel o CSV"}
              {paso === 2 && "Previsualización y Validación de Fragancias"}
              {paso === 3 && "Resultado de la Importación"}
            </h2>
          </div>

          <button
            type="button"
            onClick={paso === 3 ? handleCerrarYFinalizar : onClose}
            disabled={importando}
            aria-label="Cerrar modal"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              cursor: "pointer",
              color: "var(--muted)",
              border: "1px solid transparent",
              background: "transparent",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--ink)";
              e.currentTarget.style.borderColor = "var(--line)";
              e.currentTarget.style.background = "var(--white)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--muted)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* MENSAJE DE ERROR GLOBAL */}
        {errorGlobal && (
          <div
            style={{
              padding: "12px 30px",
              background: "#fef2f2",
              color: "#991b1b",
              fontSize: "13px",
              borderBottom: "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertCircleIcon size={16} color="#b91c1c" />
            <span>{errorGlobal}</span>
          </div>
        )}

        {/* CUERPO DEL MODAL SEGÚN EL PASO */}
        <div style={{ padding: "28px 30px", overflowY: "auto", flex: 1 }}>
          {/* PASO 1: SUBIR ARCHIVO Y PLANTILLAS */}
          {paso === 1 && (
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
                          <strong style={{ color: "var(--ink)" }}>Tolerancia a erratas y marcas nuevas:</strong> Si escribes con una pequeña falta tipográfica (ej. <i>Diioor</i> en lugar de <i>Dior</i>), el sistema te sugerirá la corrección en la previsualización. Si es una marca totalmente nueva, se registrará de forma automática.
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
                          <li><code>precio_50ml</code> y <code>100ml</code> obligatorios (ej. <code>790</code>).</li>
                          <li><code>3ml</code>, <code>5ml</code>, <code>10ml</code> decants opcionales.</li>
                        </ul>
                      </div>

                      <div style={{ background: "var(--white)", padding: "14px", border: "1px solid var(--line)", borderRadius: "3px" }}>
                        <span style={{ display: "block", color: "var(--gold-deep)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: "6px" }}>
                          5. Fotografías
                        </span>
                        <p style={{ margin: 0, color: "var(--muted)", fontSize: "12px", lineHeight: "1.5" }}>
                          No requiere URLs de imágenes. Cada fragancia se da de alta con el emblema de la casa y podrás adjuntar sus fotografías oficiales desde el panel.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 2: PREVISUALIZACIÓN INTERACTIVA */}
          {paso === 2 && (
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
                      <th style={{ padding: "10px 12px", width: "130px" }}>Precios (50/100ml)</th>
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
                              <span style={{ color: "var(--muted)", fontSize: "11px" }}>{f.marca || "—"}</span>
                              {f.marcaSugerida && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "10.5px",
                                    background: "rgba(240, 212, 126, 0.2)",
                                    color: "var(--gold-deep)",
                                    border: "1px solid rgba(150, 108, 40, 0.25)",
                                    padding: "1px 6px",
                                    borderRadius: "2px",
                                    marginTop: "2px",
                                  }}
                                >
                                  ¿Sugerencia: {f.marcaSugerida}?
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "9px 12px", textTransform: "capitalize" }}>
                              {f.linea_comercial}
                            </td>
                            <td style={{ padding: "9px 12px" }}>{f.genero}</td>
                            <td style={{ padding: "9px 12px" }}>
                              <div style={{ fontWeight: 600, color: "var(--ink)" }}>
                                50ml: S/ {f.precio_50ml || 0}
                              </div>
                              <div style={{ color: "var(--muted)" }}>
                                100ml: S/ {f.precio_100ml || 0}
                              </div>
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
          )}

          {/* PASO 3: RESULTADO FINAL ELEVADO */}
          {paso === 3 && resultadoFinal && (
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
          )}
        </div>

        {/* PIE DE ACCIONES */}
        <div
          style={{
            padding: "18px 30px",
            background: "var(--ivory)",
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {paso === 1 && (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                style={{ background: "transparent" }}
              >
                Cancelar
              </button>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                Selecciona un archivo <code>.xlsx</code> o <code>.csv</code> para continuar
              </span>
            </>
          )}

          {paso === 2 && (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPaso(1)}
                disabled={importando}
                style={{ background: "transparent", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <ArrowLeftIcon size={13} color="currentColor" />
                Volver a cargar archivo
              </button>

              <button
                type="button"
                className="btn btn-gold"
                disabled={cantidadAImportar === 0 || importando}
                onClick={ejecutarImportacion}
                style={{ minWidth: "220px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {importando ? (
                  <>
                    <SpinnerIcon size={14} color="currentColor" />
                    <span>Guardando en el catálogo...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon size={14} color="currentColor" />
                    <span>
                      Confirmar e importar {cantidadAImportar}{" "}
                      {cantidadAImportar === 1 ? "fragancia" : "fragancias"}
                    </span>
                  </>
                )}
              </button>
            </>
          )}

          {paso === 3 && (
            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-gold"
                onClick={handleCerrarYFinalizar}
                style={{ minWidth: "180px" }}
              >
                Cerrar y ver en catálogo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CsvImportModal(props: Props) {
  if (!props.isOpen) return null;

  return (
    <ModalErrorBoundary onClose={props.onClose}>
      <CsvImportModalContent {...props} />
    </ModalErrorBoundary>
  );
}
