import React, { useState, useRef, useMemo } from "react";
import {
  procesarContenidoCsv,
  procesarBufferExcel,
  type FilaCsvProcesada,
} from "@/lib/csvHelper";
import {
  type CsvModalProps,
  type FiltroVistaPreview,
  type ResultadoImportacionFinal,
  CloseIcon,
  AlertCircleIcon,
  ModalErrorBoundary,
  CsvUploadStep,
  CsvPreviewStep,
  CsvResultStep,
  CsvModalFooter,
} from "./csv";

/* =============================================================================
   COMPONENTE PRINCIPAL DE IMPORTACIÓN MASIVA (ORQUESTADOR)
   ============================================================================= */

function CsvImportModalContent({
  marcas = [],
  productos = [],
  isOpen,
  onClose,
  onSuccess,
}: CsvModalProps) {
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
  const [resultadoFinal, setResultadoFinal] = useState<ResultadoImportacionFinal | null>(null);

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

  // Corrección en tiempo real de la casa de perfumería desde la previsualización
  const corregirMarcaFila = (filaNumero: number, nuevaMarca: string) => {
    setFilas((prev) =>
      prev.map((f) => {
        if (f.filaNumero !== filaNumero) return f;

        const marcaLimpia = nuevaMarca.trim();
        const marcaEncontrada = marcas.find(
          (m) => m.nombre.trim().toLowerCase() === marcaLimpia.toLowerCase(),
        );

        const marcaFinal = marcaEncontrada ? marcaEncontrada.nombre : marcaLimpia;
        const marcaEsNueva = !marcaEncontrada;

        // Limpiar advertencia de errata
        const advertenciasLimpias = f.advertencias.filter(
          (adv) => !adv.includes("Posible errata"),
        );

        // Sincronizar línea comercial si la casa registrada tiene una asociada
        const nuevaLinea = marcaEncontrada?.tipo_comercial || f.linea_comercial;

        // Comprobar si se convirtió en duplicado de un perfume ya registrado
        const clave = `${marcaFinal.toLowerCase()}|${f.nombre.trim().toLowerCase()}`;
        const prodExistente = productos.find(
          (p) => `${p.marca.trim().toLowerCase()}|${p.nombre.trim().toLowerCase()}` === clave,
        );
        const esDuplicado = Boolean(prodExistente);

        if (esDuplicado && !advertenciasLimpias.some((a) => a.includes("Ya registrada"))) {
          advertenciasLimpias.push(`Ya registrada en el catálogo oficial (ID #${prodExistente!.id}).`);
        }

        return {
          ...f,
          marca: marcaFinal,
          linea_comercial: nuevaLinea,
          marcaEsNueva,
          marcaSugerida: undefined,
          esDuplicado,
          idProductoExistente: prodExistente?.id,
          advertencias: advertenciasLimpias,
        };
      }),
    );
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
          {paso === 1 && (
            <CsvUploadStep
              fileInputRef={fileInputRef}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              handleDrop={handleDrop}
              procesarArchivo={procesarArchivo}
              marcas={marcas}
              mostrarGuia={mostrarGuia}
              setMostrarGuia={setMostrarGuia}
            />
          )}

          {paso === 2 && (
            <CsvPreviewStep
              nombreArchivo={nombreArchivo}
              tamanoArchivo={tamanoArchivo}
              reiniciarModal={reiniciarModal}
              filtroVista={filtroVista}
              setFiltroVista={setFiltroVista}
              resumen={resumen}
              modoDuplicados={modoDuplicados}
              setModoDuplicados={setModoDuplicados}
              filasFiltradas={filasFiltradas}
              marcas={marcas}
              corregirMarcaFila={corregirMarcaFila}
            />
          )}

          {paso === 3 && resultadoFinal && (
            <CsvResultStep resultadoFinal={resultadoFinal} />
          )}
        </div>

        {/* PIE DE ACCIONES */}
        <CsvModalFooter
          paso={paso}
          onClose={onClose}
          onVolverAPaso1={() => setPaso(1)}
          importando={importando}
          cantidadAImportar={cantidadAImportar}
          onEjecutarImportacion={ejecutarImportacion}
          onCerrarYFinalizar={handleCerrarYFinalizar}
        />
      </div>
    </div>
  );
}

export default function CsvImportModal(props: CsvModalProps) {
  if (!props.isOpen) return null;

  return (
    <ModalErrorBoundary onClose={props.onClose}>
      <CsvImportModalContent {...props} />
    </ModalErrorBoundary>
  );
}
