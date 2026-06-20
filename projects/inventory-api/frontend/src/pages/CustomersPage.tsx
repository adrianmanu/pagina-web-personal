import { FormEvent, Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { api, type Customer, type Invoice } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';
import { TaxIdField } from '../components/ui/TaxIdField';
import {
  type FieldErrors,
  hasFieldErrors,
  validateEmail,
  validateRequired,
  validateTaxId,
} from '../utils/validation';

const emptyForm = { name: '', taxId: '', email: '', address: '', phone: '' };
type CustomerField = keyof typeof emptyForm;

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<CustomerField>>({});
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const load = () => api.getCustomers().then(setCustomers);
  useEffect(() => { load(); }, []);

  const updateField = (field: CustomerField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError('');
  };

  const validateForm = () => {
    const errors: FieldErrors<CustomerField> = {
      name: validateRequired(form.name, 'El nombre'),
      taxId: validateTaxId(form.taxId),
      email: validateEmail(form.email),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<CustomerField>;
    setFieldErrors(filtered);
    return !hasFieldErrors(filtered);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingId) {
        await api.updateCustomer(editingId, form);
        setSuccess('Cliente actualizado.');
      } else {
        await api.createCustomer(form);
        setSuccess('Cliente creado.');
      }
      setForm(emptyForm);
      setEditingId(null);
      setFieldErrors({});
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      taxId: customer.taxId,
      email: customer.email ?? '',
      address: customer.address ?? '',
      phone: customer.phone ?? '',
    });
    setFieldErrors({});
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    setError('');
    try {
      await api.deleteCustomer(id);
      if (expandedId === id) setExpandedId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el cliente');
    }
  };

  const toggleHistory = async (customerId: number) => {
    if (expandedId === customerId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(customerId);
    setLoadingInvoices(true);
    try {
      const history = await api.getCustomerInvoices(customerId);
      setInvoices(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el historial');
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Ventas</p>
          <h1>Clientes</h1>
        </div>
      </header>

      <div className="split">
        <form className="panel form-panel" onSubmit={handleSubmit} noValidate>
          <h2>{editingId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <FormAlerts error={error} success={success} />

          <PanelField
            label="Nombre o razón social"
            name="name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Juan Pérez / Empresa S.A."
            error={fieldErrors.name}
            required
          />
          <TaxIdField
            value={form.taxId}
            onChange={(e) => updateField('taxId', e.target.value)}
            error={fieldErrors.taxId}
            required
          />
          <PanelField
            label="Correo (opcional)"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="cliente@correo.com"
            error={fieldErrors.email}
          />
          <PanelField
            label="Dirección (opcional)"
            name="address"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Av. Amazonas, Quito"
          />
          <PanelField
            label="Teléfono (opcional)"
            name="phone"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="0999999999"
            inputMode="tel"
          />

          <div className="form-actions">
            {editingId && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setFieldErrors({});
                }}
              >
                Cancelar
              </button>
            )}
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>

        <section className="panel">
          <h2>Catálogo</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Identificación</th>
                  <th>Facturas</th>
                  <th>Total facturado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <Fragment key={customer.id}>
                    <tr>
                      <td>
                        <span className="customer-name-cell">
                          <User size={14} /> {customer.name}
                        </span>
                      </td>
                      <td className="mono">
                        {customer.taxId}
                        <span className="badge" style={{ marginLeft: 8 }}>{customer.idType}</span>
                      </td>
                      <td>{customer.invoiceCount}</td>
                      <td>${customer.totalInvoiced.toLocaleString()}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => toggleHistory(customer.id)}
                          aria-label="Ver historial"
                        >
                          {expandedId === customer.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleEdit(customer)}>
                          Editar
                        </button>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleDelete(customer.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                    {expandedId === customer.id && (
                      <tr className="invoice-detail-row">
                        <td colSpan={5}>
                          <h3 className="invoice-detail-title">Historial de facturas</h3>
                          {loadingInvoices ? (
                            <p className="muted">Cargando…</p>
                          ) : invoices.length ? (
                            <table className="invoice-detail">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Nº SRI</th>
                                  <th>Fecha</th>
                                  <th>Total</th>
                                  <th>SRI</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoices.map((invoice) => (
                                  <tr key={invoice.id}>
                                    <td>{invoice.id}</td>
                                    <td className="mono">{invoice.sriDocumentNumber ?? '—'}</td>
                                    <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                    <td>${invoice.total.toLocaleString()}</td>
                                    <td>{invoice.sriStatus ?? '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="muted">Sin facturas para este cliente.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {!customers.length && (
                  <tr>
                    <td colSpan={5} className="muted">
                      Aún no hay clientes. Crea el primero desde el formulario.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
