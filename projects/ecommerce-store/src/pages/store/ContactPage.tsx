import { storeService } from '../../services/authService';

export function ContactPage() {
  const store = storeService.get();

  return (
    <div className="page contact">
      <h1>Contacto</h1>
      <div className="contact-grid">
        <div className="contact-card">
          <h2>Escríbenos</h2>
          <p><strong>Correo:</strong> {store.email}</p>
          <p><strong>Teléfono:</strong> {store.phone}</p>
          <p><strong>WhatsApp:</strong>{' '}
            <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer">
              Abrir chat
            </a>
          </p>
        </div>
        <div className="contact-card">
          <h2>Visítanos</h2>
          <p>{store.address}</p>
          <p>{store.hours}</p>
        </div>
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <h2>Formulario</h2>
          <label className="field">
            <span>Nombre</span>
            <input required />
          </label>
          <label className="field">
            <span>Correo</span>
            <input type="email" required />
          </label>
          <label className="field">
            <span>Mensaje</span>
            <textarea rows={4} required />
          </label>
          <button type="submit" className="btn btn--primary">Enviar (demo)</button>
        </form>
      </div>
    </div>
  );
}
