import { useStore } from "@nanostores/react";
import {
  $estaMenuMovilAbierto,
  cerrarMenuMovil,
  $mensajeToast,
} from "@/features/carrito/tiendaCarrito";
import Icono from "@/components/ui/Icono";

const enlacesNavegacion = [
  { etiqueta: "Inicio", enlace: "/" },
  { etiqueta: "Perfumes", enlace: "/perfumes" },
  { etiqueta: "Hombre", enlace: "/perfumes?genero=Hombre" },
  { etiqueta: "Mujer", enlace: "/perfumes?genero=Mujer" },
  { etiqueta: "Unisex", enlace: "/perfumes?genero=Unisex" },
  { etiqueta: "Nosotros", enlace: "/nosotros" },
  { etiqueta: "Contacto", enlace: "/contacto" },
  { etiqueta: "Preguntas frecuentes", enlace: "/faq" },
  { etiqueta: "Acceso administrativo", enlace: "/admin" },
];

export default function CajonMovil() {
  const estaAbierto = useStore($estaMenuMovilAbierto);
  const toast = useStore($mensajeToast);

  return (
    <>
      <div className={`mobile-drawer ${estaAbierto ? "open" : ""}`}>
        <div className="drawer-top">
          <img src="/assets/maison-logo.jpeg" alt="Maison des Parfums" />
          <button
            onClick={cerrarMenuMovil}
            aria-label="Cerrar menú"
            type="button"
          >
            <Icono name="close" />
          </button>
        </div>
        {enlacesNavegacion.map((item) => (
          <a
            key={item.etiqueta}
            href={item.enlace}
            onClick={cerrarMenuMovil}
            className="mobile-drawer-link"
          >
            {item.etiqueta}
            <Icono name="arrow" />
          </a>
        ))}
      </div>

      {estaAbierto && (
        <button
          className="scrim"
          onClick={cerrarMenuMovil}
          aria-label="Cerrar menú"
          type="button"
        />
      )}

      {toast && (
        <div className="toast">
          <Icono name="check" />
          {toast}
        </div>
      )}
    </>
  );
}

export const MobileDrawer = CajonMovil;
