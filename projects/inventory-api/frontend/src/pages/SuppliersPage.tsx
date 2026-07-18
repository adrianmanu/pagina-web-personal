import { FormEvent, useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import { api, type Supplier } from '../api';
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
type SupplierField = keyof typeof emptyForm;

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SupplierField>>({});
  const [saving, setSaving] = useState(false);

  const load = () => api.getSuppliers().then(setSuppliers);
  useEffect(() => { load(); }, []);

  const updateField = (field: SupplierField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError('');
  };

  const validateForm = () => {
    const errors: FieldErrors<SupplierField> = {
      name: validateRequired(form.name, 'El nombre'),
      taxId: validateTaxId(form.taxId),
      email: validateEmail(form.email),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<SupplierField>;
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
        await api.updateSupplier(editingId, form);
        setSuccess('Proveedor actualizado.');
      } else {
        await api.createSupplier(form);
        setSuccess('Proveedor creado.');
      }
      setForm(emptyForm);
      setEditingId(null);
      setFieldErrors({});
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el proveedor');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name,
      taxId: supplier.taxId,
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      phone: supplier.phone ?? '',
    });
    setFieldErrors({});
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    setError('');
    try {
      await api.deleteSupplier(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el proveedor');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Compras</p>
          <h1>Proveedores</h1>
        </div>
      </header>

      <div className="split">
        <form className="panel form-panel" onSubmit={handleSubmit} noValidate>
          <h2>{editingId ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
          <p className="muted" style={{ marginBottom: 12 }}>
            Para liquidaciones de compra a proveedores sin RUC o régimen simplificado (cédula).
          </p>
          <FormAlerts error={error} success={success} />

          <PanelField
            label="Nombre o razón social"
            name="name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
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
            error={fieldErrors.email}
          />
          <PanelField
            label="Dirección (opcional)"
            name="address"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
          <PanelField
            label="Teléfono (opcional)"
            name="phone"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
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
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear proveedor'}
            </button>
          </div>
        </form>

        <section className="panel">
          <h2>Catálogo</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Identificación</th>
                  <th>Contacto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <span className="customer-name-cell">
                        <Truck size={14} /> {supplier.name}
                      </span>
                    </td>
                    <td className="mono">
                      {supplier.taxId}
                      <span className="badge" style={{ marginLeft: 8 }}>{supplier.idType}</span>
                    </td>
                    <td>{supplier.email ?? supplier.phone ?? '—'}</td>
                    <td className="actions">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleEdit(supplier)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleDelete(supplier.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {!suppliers.length && (
                  <tr>
                    <td colSpan={4} className="muted">
                      Aún no hay proveedores registrados.
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
