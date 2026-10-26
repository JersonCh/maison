import { useState, useMemo, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { $estaBuscadorAbierto, cerrarBuscador } from "@/features/carrito/tiendaCarrito";
import { obtenerTodosLosProductos } from "@/data/productos";
import { formatearPrecio } from "@/lib/formateadores";
import Icono from "@/components/ui/Icono";

export default function ModalBuscador() {
  const estaAbierto = useStore($estaBuscadorAbierto);
  const [consulta, setConsulta] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const todosLosProductos = obtenerTodosLosProductos();

  useEffect(() => {
    if (estaAbierto) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setConsulta("");
    }
  }, [estaAbierto]);

  const sugerencias = useMemo(() => {
    if (!consulta.trim()) return [];
    const q = consulta.toLowerCase().trim();
    return todosLosProductos
      .filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [consulta, todosLosProductos]);

  return (
    <>
      <div
        className={`search-panel ${estaAbierto ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda de perfumes"
      >
        <div className="search-heading">
          <span>Buscar en Maison</span>
          <button onClick={cerrarBuscador} aria-label="Cerrar búsqueda" type="button">
            <Icono name="close" />
          </button>
        </div>

        <div className="search-field">
          <Icono name="search" />
          <input
            ref={inputRef}
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Busca por nombre o marca..."
          />
        </div>

        {consulta.trim() !== "" && (
          <div className="suggestions">
            <p>{sugerencias.length} sugerencias</p>
            {sugerencias.map((producto) => (
              <a
                key={producto.id}
                href={`/perfumes/${producto.slug}`}
                onClick={cerrarBuscador}
                className="suggestion-item"
              >
                <img src={producto.image} alt={producto.name} />
                <span>
                  <small>{producto.brand}</small>
                  {producto.name}
                </span>
                <strong>{formatearPrecio(producto.variants[0].price)}</strong>
              </a>
            ))}
            {!sugerencias.length && (
              <div className="no-suggestion">
                Sin coincidencias. Prueba con otra búsqueda.
              </div>
            )}
          </div>
        )}
      </div>

      {estaAbierto && (
        <button
          className="scrim"
          onClick={cerrarBuscador}
          aria-label="Cerrar búsqueda"
          type="button"
        />
      )}
    </>
  );
}

export const SearchModal = ModalBuscador;
