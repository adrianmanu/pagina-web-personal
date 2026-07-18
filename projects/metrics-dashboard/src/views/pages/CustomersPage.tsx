import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { downloadExcel, downloadPdf, type ExportColumn } from '../../utils/exportReports';
import { useCustomersController } from '../../controllers/useCustomersController';
import type { Customer, CustomerInput, CustomerWithStats } from '../../models/Customer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExportMenu } from '../components/ExportMenu';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

const EMPTY_FORM: CustomerInput = {
  name: '',
  email: '',
  company: '',
  phone: '',
  city: '',
  status: 'activo',
};

const METRIX_THEME = { accentRgb: [99, 102, 241] as [number, number, number] };

const CUSTOMER_COLUMNS: ExportColumn<CustomerWithStats>[] = [
  { header: 'Nombre', value: (c) => c.name },
  { header: 'Correo', value: (c) => c.email },
  { header: 'Empresa', value: (c) => c.company },
  { header: 'Ciudad', value: (c) => c.city },
  { header: 'Estado', value: (c) => c.status },
  { header: 'Pedidos', value: (c) => c.orderCount },
  { header: 'Total gastado', value: (c) => c.totalSpent },
];

export function CustomersPage() {
  const controller = useCustomersController();
  const { showToast } = useToast();

  const [editing, setEditing] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CustomerInput>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<CustomerWithStats | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      email: customer.email,
      company: customer.company,
      phone: customer.phone,
      city: customer.city,
      status: customer.status,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    try {
      if (editing) {
        controller.updateCustomer(editing.id, form);
        showToast('success', 'Cliente actualizado');
      } else {
        controller.createCustomer(form);
        showToast('success', 'Cliente creado');
      }
      setShowForm(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el cliente');
    }
  };

  const handleDelete = () => {
    if (!deleting) return;
    try {
      controller.removeCustomer(deleting.id);
      showToast('success', `Cliente ${deleting.name} eliminado`);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'No se pudo eliminar');
    }
    setDeleting(null);
  };

  const exportCustomers = (format: 'pdf' | 'excel') => {
    if (!controller.customers.length) {
      showToast('error', 'No hay clientes para exportar');
      return;
    }
    const meta = {
      title: 'Reporte de clientes — Metrix',
      subtitle: `${controller.customers.length} clientes registrados`,
      filenameBase: `clientes-metrix-${new Date().toISOString().slice(0, 10)}`,
    };
    if (format === 'pdf') downloadPdf(meta, CUSTOMER_COLUMNS, controller.customers, METRIX_THEME);
    else downloadExcel(meta, CUSTOMER_COLUMNS, controller.customers, 'Clientes');
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1>Clientes</h1>
        </div>
        <div className="page-header__actions">
          <ExportMenu onExport={exportCustomers} disabled={!controller.customers.length} />
          <button type="button" className="btn btn--primary" onClick={openCreate}>
            <Plus size={15} /> Nuevo cliente
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="search">
          <Search size={15} />
          <input
            value={controller.search}
            onChange={(e) => controller.setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo, empresa o ciudad…"
          />
        </div>
        <span className="toolbar__count">
          {controller.customers.length} de {controller.totalCustomers} clientes
        </span>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Ciudad</th>
                <th>Teléfono</th>
                <th>Pedidos</th>
                <th>Total comprado</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {controller.customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="cell-stacked">
                      <strong>{customer.name}</strong>
                      <small>{customer.email}</small>
                    </div>
                  </td>
                  <td>{customer.company}</td>
                  <td>{customer.city}</td>
                  <td className="mono">{customer.phone}</td>
                  <td>{customer.orderCount}</td>
                  <td>${customer.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td>
                    <span className={`status-badge status-badge--${customer.status === 'activo' ? 'entregado' : 'cancelado'}`}>
                      {customer.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(customer)} aria-label="Editar">
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm btn--danger-text"
                      onClick={() => setDeleting(customer)}
                      aria-label="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!controller.customers.length && (
                <tr>
                  <td colSpan={8} className="muted">
                    No hay clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title={editing ? `Editar a ${editing.name}` : 'Nuevo cliente'} onClose={() => setShowForm(false)}>
          <form className="form" onSubmit={handleSubmit}>
            {formError && <div className="alert alert--error">{formError}</div>}

            <label>
              Nombre completo
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="María López"
                required
                minLength={3}
              />
            </label>
            <label>
              Correo electrónico
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="maria@empresa.com"
                required
              />
            </label>
            <div className="form__row">
              <label>
                Empresa
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Empresa S.A."
                  required
                />
              </label>
              <label>
                Ciudad
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Quito"
                  required
                />
              </label>
            </div>
            <div className="form__row">
              <label>
                Teléfono
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+593 99 123 4567"
                  required
                />
              </label>
              <label>
                Estado
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CustomerInput['status'] })}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
            </div>

            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary">
                {editing ? 'Guardar cambios' : 'Crear cliente'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Eliminar cliente"
          message={
            deleting.orderCount > 0
              ? `${deleting.name} tiene ${deleting.orderCount} pedidos asociados y no podrá eliminarse.`
              : `¿Eliminar a ${deleting.name}? Esta acción no se puede deshacer.`
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
