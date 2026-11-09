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
              borderRadius: "6px",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <h3 style={{ color: "#b91c1c", marginTop: 0, fontSize: "18px" }}>
              ⚠️ Error al inicializar el modal de importación
            </h3>
            <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
              Ocurrió un error inesperado al renderizar el componente:
            </p>
            <pre style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "4px", fontSize: "12px", overflowX: "auto" }}>
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
  };

  const handleCerrarYFinalizar = () => {
    if (resultadoFinal) {
      onSuccess(
        `✓ Importación completada: ${resultadoFinal.creados} fragancias registradas, ${resultadoFinal.actualizados} actualizadas.`
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
            padding: "24px 30px",
            margin: 0,
            background: "var(--ivory)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div>
            <small style={{ color: "var(--gold-deep)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Gestión Masiva de Catálogo
            </small>
            <h2 style={{ margin: "4px 0 0 0", fontFamily: "var(--serif)", fontSize: "24px", color: "var(--ink)" }}>
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
            style={{ fontSize: "22px", cursor: "pointer", color: "var(--muted)", border: 0, background: "none" }}
          >
            ✕
          </button>
        </div>

        {/* MENSAJE DE ERROR GLOBAL */}
        {errorGlobal && (
          <div
            style={{
              padding: "12px 30px",
              background: "#fee2e2",
              color: "#b91c1c",
              fontSize: "13px",
              borderBottom: "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <span>{errorGlobal}</span>
          </div>
        )}

        {/* CUERPO DEL MODAL SEGÚN EL PASO */}
        <div style={{ padding: "28px 30px", overflowY: "auto", flex: 1 }}>
          {/* PASO 1: SUBIR ARCHIVO Y PLANTILLAS */}
          {paso === 1 && (
            <div>
              {/* ZONA DE CARGA */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--gold)",
                  background: "#faf8f5",
                  borderRadius: "6px",
                  padding: "45px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
                <div style={{ fontSize: "42px", marginBottom: "12px" }}>📊</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "21px", margin: "0 0 6px 0", color: "var(--ink)" }}>
                  Arrastra tu archivo Excel (.xlsx) o CSV aquí o haz clic para seleccionarlo
                </h3>
                <p style={{ color: "var(--muted)", fontSize: "13.5px", margin: 0 }}>
                  Compatible con hojas de cálculo <strong>Excel (.xlsx / .xls)</strong> y archivos <strong>CSV</strong> generados en cualquier sistema o idioma
                </p>
              </div>

              {/* BLOQUE DE DESCARGA DE PLANTILLA OFICIAL */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "18px 22px",
                  background: "var(--ivory)",
                  borderRadius: "4px",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div style={{ maxWidth: "580px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "16px" }}>📗</span>
                    <strong style={{ fontSize: "14px", color: "var(--ink)" }}>
                      Plantilla oficial de perfumería Maison
                    </strong>
                    <span
                      style={{
                        background: "#ecfdf5",
                        color: "#065f46",
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontWeight: 600,
                      }}
                    >
                      Recomendado
                    </span>
                  </div>
                  <span style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: "1.5", display: "block" }}>
                    Descarga el formato en <strong>Excel (.xlsx)</strong> listo para editar con columnas divididas automáticamente (A: Marca, B: Fragancia, etc.), ejemplos de lujo y pestaña de guía rápida.
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-gold"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 600,
                      padding: "10px 18px",
                    }}
                    onClick={descargarPlantillaExcel}
                  >
                    📥 Descargar Excel (.xlsx)
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{
                      borderColor: "var(--line)",
                      color: "var(--muted)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12.5px",
                    }}
                    onClick={descargarPlantillaCsv}
                  >
                    Descargar CSV (.csv)
                  </button>
                </div>
              </div>

              {/* ACORDEÓN DE GUÍA DE VALORES PERMITIDOS */}
              <div style={{ marginTop: "22px" }}>
                <button
                  type="button"
                  onClick={() => setMostrarGuia(!mostrarGuia)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    📖 Guía de marcas registradas y reglas de importación
                  </span>
                  <span>{mostrarGuia ? "▲" : "▼"}</span>
                </button>

                {mostrarGuia && (
                  <div
                    style={{
                      border: "1px solid var(--line)",
                      borderTop: 0,
                      borderRadius: "0 0 4px 4px",
                      padding: "20px 22px",
                      background: "#fafafa",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      <strong style={{ display: "block", color: "var(--gold-deep)", marginBottom: "6px" }}>
                        1. Casas y Marcas registradas ({marcas.length} activas en la tienda)
                      </strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {marcas.map((m) => (
                          <span
                            key={m.id}
                            style={{
                              background: "var(--white)",
                              border: "1px solid var(--line)",
                              padding: "2px 8px",
                              borderRadius: "3px",
                              fontSize: "11.5px",
                              color: "var(--ink)",
                            }}
                          >
                            {m.nombre}
                          </span>
                        ))}
                      </div>
                      <small style={{ color: "var(--muted)", display: "block", marginTop: "6px" }}>
                        ℹ️ <strong>Tolerancia a erratas y marcas nuevas:</strong> Si escribes con una pequeña falta tipográfica (ej. <i>Diioor</i> en lugar de <i>Dior</i>), el sistema te avisará en la previsualización. Si es una marca totalmente nueva, se registrará de forma automática.
                      </small>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "16px" }}>
                      <div>
                        <strong style={{ display: "block", color: "var(--gold-deep)", marginBottom: "4px" }}>
                          2. Líneas comerciales
                        </strong>
                        <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--ink)" }}>
                          <li><code>disenador</code> (por defecto para marcas de diseñador o lujo comercial)</li>
                          <li><code>arabe</code> (fragancias orientales y casas árabes)</li>
                          <li><code>nicho</code> (casas de perfumería exclusiva de autor)</li>
                        </ul>
                      </div>

                      <div>
                        <strong style={{ display: "block", color: "var(--gold-deep)", marginBottom: "4px" }}>
                          3. Género
                        </strong>
                        <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--ink)" }}>
                          <li><code>Hombre</code> (o <code>H</code>, <code>masculino</code>, <code>caballero</code>)</li>
                          <li><code>Mujer</code> (o <code>M</code>, <code>femenino</code>, <code>dama</code>)</li>
                          <li><code>Unisex</code> (o <code>U</code>, <code>ambos</code>)</li>
                        </ul>
                      </div>

                      <div>
                        <strong style={{ display: "block", color: "var(--gold-deep)", marginBottom: "4px" }}>
                          4. Precios & Decants
                        </strong>
                        <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--ink)" }}>
                          <li><code>precio_50ml</code> y <code>precio_100ml</code> son obligatorios (ej: <code>790</code> o <code>790.00</code>).</li>
                          <li><code>precio_decant_3ml</code>, <code>5ml</code>, <code>10ml</code> son opcionales (dejar vacío si no ofrece decants).</li>
                        </ul>
                      </div>

                      <div>
                        <strong style={{ display: "block", color: "var(--gold-deep)", marginBottom: "4px" }}>
                          5. Fotografías de las fragancias
                        </strong>
                        <p style={{ margin: 0, color: "var(--muted)", fontSize: "12.5px" }}>
                          <strong>No requiere enlaces de imágenes.</strong> Cada fragancia se registra con el emblema de la casa y podrás adjuntar sus fotografías en alta resolución directamente desde el panel al editar el producto.
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
                  <span style={{ fontSize: "22px" }}>
                    {nombreArchivo.toLowerCase().endsWith(".csv") ? "📄" : "📊"}
                  </span>
                  <div>
                    <strong style={{ color: "var(--ink)", fontSize: "14px" }}>{nombreArchivo}</strong>
                    <span style={{ color: "var(--muted)", fontSize: "12px", marginLeft: "8px" }}>({tamanoArchivo})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={reiniciarModal}
                  style={{
                    border: "1px solid var(--line)",
                    background: "var(--white)",
                    padding: "6px 14px",
                    borderRadius: "3px",
                    fontSize: "12px",
                    cursor: "pointer",
                    color: "var(--ink)",
                    fontWeight: 500,
                  }}
                >
                  🔄 Cambiar archivo
                </button>
              </div>

              {/* TARJETAS DE CONTADORES */}
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
                  }}
                >
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.05em" }}>
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
                    background: filtroVista === "validos" ? "#ecfdf5" : "var(--white)",
                    border: `1px solid ${filtroVista === "validos" ? "#10b981" : "var(--line)"}`,
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#047857", letterSpacing: "0.05em" }}>
                    ✓ Listos para crear
                  </span>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "#065f46", marginTop: "2px" }}>
                    {resumen.validos}
                  </div>
                </div>

                <div
                  onClick={() => setFiltroVista("duplicados")}
                  style={{
                    padding: "12px 16px",
                    background: filtroVista === "duplicados" ? "#fffbeb" : "var(--white)",
                    border: `1px solid ${filtroVista === "duplicados" ? "#f59e0b" : "var(--line)"}`,
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#b45309", letterSpacing: "0.05em" }}>
                    ⚠️ Ya en catálogo
                  </span>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "#92400e", marginTop: "2px" }}>
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
                  }}
                >
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.05em" }}>
                    ✕ Con errores
                  </span>
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
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "4px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "13px", color: "#92400e", display: "block" }}>
                      Se encontraron {resumen.duplicados} fragancias que ya existen en el catálogo:
                    </strong>
                    <span style={{ fontSize: "12px", color: "#78350f" }}>
                      Elige qué hacer con los productos existentes durante la importación.
                    </span>
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
                      <span><strong>Omitir</strong> (no tocar los existentes)</span>
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
                        let badgeBg = "#d1fae5";
                        let badgeColor = "#065f46";
                        let badgeText = "Válido";

                        if (!f.esValido) {
                          badgeBg = "#fee2e2";
                          badgeColor = "#991b1b";
                          badgeText = "Error";
                        } else if (f.esDuplicado) {
                          badgeBg = "#fef3c7";
                          badgeColor = "#92400e";
                          badgeText = modoDuplicados === "actualizar" ? "Actualizar" : "Duplicado";
                        } else if (f.marcaEsNueva) {
                          badgeBg = "#e0e7ff";
                          badgeColor = "#3730a3";
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
                                  borderRadius: "3px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  background: badgeBg,
                                  color: badgeColor,
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
                                    background: "#fef3c7",
                                    color: "#92400e",
                                    padding: "1px 5px",
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
                                <div key={i} style={{ color: "#dc2626", fontSize: "11px", fontWeight: 500 }}>
                                  ✕ {err}
                                </div>
                              ))}
                              {f.advertencias.map((adv, i) => (
                                <div key={i} style={{ color: "#d97706", fontSize: "11px" }}>
                                  ⚠️ {adv}
                                </div>
                              ))}
                              {f.esValido && f.advertencias.length === 0 && (
                                <span style={{ color: "#059669", fontSize: "11px" }}>✓ Formato correcto</span>
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

          {/* PASO 3: RESULTADO FINAL */}
          {paso === 3 && resultadoFinal && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#d1fae5",
                  color: "#059669",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "30px",
                  margin: "0 auto 16px auto",
                }}
              >
                ✓
              </div>

              <h3 style={{ fontFamily: "var(--serif)", fontSize: "24px", margin: "0 0 8px 0", color: "var(--ink)" }}>
                ¡Lote de perfumes procesado con éxito!
              </h3>
              <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 24px 0" }}>
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
                <div style={{ padding: "16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "4px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#166534", fontWeight: 600 }}>
                    Nuevos creados
                  </span>
                  <div style={{ fontSize: "28px", fontWeight: 700, color: "#15803d", marginTop: "4px" }}>
                    {resultadoFinal.creados}
                  </div>
                </div>

                <div style={{ padding: "16px", background: "#fefce8", border: "1px solid #fef08a", borderRadius: "4px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#854d0e", fontWeight: 600 }}>
                    Actualizados
                  </span>
                  <div style={{ fontSize: "28px", fontWeight: 700, color: "#a16207", marginTop: "4px" }}>
                    {resultadoFinal.actualizados}
                  </div>
                </div>

                <div style={{ padding: "16px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#4b5563", fontWeight: 600 }}>
                    Omitidos
                  </span>
                  <div style={{ fontSize: "28px", fontWeight: 700, color: "#374151", marginTop: "4px" }}>
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
                  <strong style={{ color: "#991b1b", display: "block", marginBottom: "6px" }}>
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
                  maxWidth: "520px",
                  margin: "0 auto",
                  background: "var(--ivory)",
                  border: "1px solid var(--line)",
                  padding: "14px 18px",
                  borderRadius: "4px",
                  fontSize: "12.5px",
                  color: "var(--muted)",
                  lineHeight: "1.5",
                }}
              >
                📸 <strong>Fotografías del producto:</strong> Cada fragancia se ha dado de alta con el emblema oficial. Puedes abrir su ficha técnica desde el catálogo para adjuntar sus fotografías en alta resolución de frasco, caja y detalle.
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
                style={{ background: "transparent" }}
              >
                ← Volver a cargar archivo
              </button>

              <button
                type="button"
                className="btn btn-gold"
                disabled={cantidadAImportar === 0 || importando}
                onClick={ejecutarImportacion}
                style={{ minWidth: "220px" }}
              >
                {importando ? (
                  <span>⏳ Guardando en el catálogo...</span>
                ) : (
                  <span>
                    ✓ Confirmar e importar {cantidadAImportar}{" "}
                    {cantidadAImportar === 1 ? "fragancia" : "fragancias"}
                  </span>
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
