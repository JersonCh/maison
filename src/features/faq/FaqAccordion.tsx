import { useState } from "react";
import Icon from "@/components/ui/Icon";

const faqs = [
  [
    "¿Todos los perfumes son originales?",
    "Sí. La propuesta de Maison des Parfums se basa estrictamente en fragancias 100% originales con procedencia verificable y garantía de autenticidad.",
  ],
  [
    "¿Cómo realizo mi pedido?",
    "Añade tus fragancias favoritas al carrito y pulsa 'Enviar pedido por WhatsApp'. Se abrirá una conversación con un asesor que confirmará el stock, coordinará la entrega y facilitará los detalles de pago.",
  ],
  [
    "¿Hacen envíos a todo el Perú?",
    "Sí. Realizamos envíos a Lima Metropolitana y a todas las provincias del Perú. La cobertura, costos y tiempos exactos de entrega se coordinan directamente según tu ubicación.",
  ],
  [
    "¿Puedo recibir asesoría para elegir?",
    "Por supuesto. Nuestros asesores pueden recomendarte opciones personalizadas según tus familias olfativas preferidas, ocasión de uso, notas deseadas o presupuesto.",
  ],
  [
    "¿Qué métodos de pago aceptan?",
    "La tienda no procesa pagos online para mayor cercanía y seguridad. Aceptamos transferencias bancarias, Yape, Plin y contra entrega previa coordinación directa.",
  ],
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="faq-list">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <article key={faq[0]} className={isOpen ? "open" : ""}>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{faq[0]}</strong>
              <Icon name={isOpen ? "minus" : "plus"} />
            </button>
            <p>{faq[1]}</p>
          </article>
        );
      })}
    </div>
  );
}
