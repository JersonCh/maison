import { useStore } from "@nanostores/react";
import {
    $isMobileMenuOpen,
    closeMobileMenu,
    $toastMessage,
} from "@/features/cart/cartStore";
import Icon from "@/components/ui/Icon";

const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Perfumes", href: "/perfumes" },
    { label: "Hombre", href: "/perfumes?genero=Hombre" },
    { label: "Mujer", href: "/perfumes?genero=Mujer" },
    { label: "Unisex", href: "/perfumes?genero=Unisex" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
    { label: "Preguntas frecuentes", href: "/faq" },
    { label: "Acceso administrativo", href: "/admin" },
];

export default function MobileDrawer() {
    const isOpen = useStore($isMobileMenuOpen);
    const toast = useStore($toastMessage);

    return (
        <>
            <div className={`mobile-drawer ${isOpen ? "open" : ""}`}>
                <div className="drawer-top">
                    <img src="/assets/logo-no-fondo300.png" alt="Maison des Parfums" />
                    <button
                        onClick={closeMobileMenu}
                        aria-label="Cerrar menú"
                        type="button"
                    >
                        <Icon name="close" />
                    </button>
                </div>
                {navLinks.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="mobile-drawer-link"
                    >
                        {item.label}
                        <Icon name="arrow" />
                    </a>
                ))}
            </div>

            {isOpen && (
                <button
                    className="scrim"
                    onClick={closeMobileMenu}
                    aria-label="Cerrar menú"
                    type="button"
                />
            )}

            {toast && (
                <div className="toast">
                    <Icon name="check" />
                    {toast}
                </div>
            )}
        </>
    );
}
