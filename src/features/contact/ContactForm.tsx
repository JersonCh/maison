import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { getStorePhone } from "@/features/whatsapp/whatsapp";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState("Recomendación personalizada");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = getStorePhone();
    const text = `Hola Maison des Parfums,\nMi nombre es: ${name}\nContacto: ${contact}\nMotivo: ${type}\nMensaje: ${message || "Deseo recibir asesoría."}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <p>Déjanos tu consulta</p>

      <label>
        Nombre
        <input
          required
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label>
        Correo o teléfono
        <input
          required
          placeholder="Tu contacto"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </label>

      <label>
        ¿Qué estás buscando?
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Recomendación personalizada</option>
          <option>Consultar un producto</option>
          <option>Coordinar un pedido</option>
        </select>
      </label>

      <label>
        Mensaje
        <textarea
          rows={4}
          placeholder="Cuéntanos qué tipo de fragancia te gusta..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      <button type="submit" className="btn btn-gold full">
        Enviar consulta por WhatsApp <Icon name="arrow" />
      </button>

      {submitted && (
        <small style={{ color: "var(--gold)", display: "block", marginTop: "0.5rem" }}>
          ✓ Abriendo WhatsApp con tu consulta...
        </small>
      )}
    </form>
  );
}
