import { useState } from 'react';
import { Calendar, Send, Users } from 'lucide-react';
import { restaurant } from '../data/restaurant';
import { SectionHeading } from './SectionHeading';

export function Reservation() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = [
      'Hola, quisiera hacer una reserva:',
      `Nombre: ${form.name}`,
      `Teléfono: ${form.phone}`,
      `Fecha: ${form.date}`,
      `Hora: ${form.time}`,
      `Personas: ${form.guests}`,
      form.notes ? `Notas: ${form.notes}` : '',
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true);
  };

  return (
    <section className="section reservation page-section page-section--narrow">
      <SectionHeading
        label="Reserva"
        title="Reserva tu mesa"
        description="Completa el formulario y te redirigimos a WhatsApp para confirmar."
      />
      <form className="reservation-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nombre</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="field">
          <span>Teléfono / WhatsApp</span>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </label>
        <div className="field-row">
          <label className="field">
            <span><Calendar size={14} /> Fecha</span>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </label>
          <label className="field">
            <span>Hora</span>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
          </label>
        </div>
        <label className="field">
          <span><Users size={14} /> Número de personas</span>
          <select value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })}>
            {['1', '2', '3', '4', '5', '6', '7', '8+'].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Notas (opcional)</span>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Celebración, silla para niño, alergias..."
          />
        </label>
        <button type="submit" className="btn btn--primary btn--block">
          <Send size={16} /> Enviar reserva por WhatsApp
        </button>
        {sent && <p className="form-note">Se abrió WhatsApp con tu solicitud. Confirma el mensaje para enviar.</p>}
      </form>
    </section>
  );
}
