import { useState, type FormEvent } from 'react';
import { Download, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useOrdersController, type StatusFilter } from '../../controllers/useOrdersController';
import type { Order, OrderItem, OrderStatus } from '../../models/Order';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, calcOrderTotal } from '../../models/Order';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/Toast';

const EMPTY_ITEM: OrderItem = { description: '', quantity: 1, unitPrice: 0 };

interface OrderFormState {
  customerId: string;
  status: OrderStatus;
  items: OrderItem[];
}

const EMPTY_FORM: OrderFormState = { customerId: '', status: 'pendiente', items: [{ ...EMPTY_ITEM }] };

export function OrdersPage() {
  const controller = useOrdersController();
  const { showToast } = useToast();

  const [editing, setEditing] = useState<Order | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OrderFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<Order | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, items: [{ ...EMPTY_ITEM }] });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (order: Order) => {
    setEditing(order);
    setForm({
      customerId: order.customerId,
      status: order.status,
      items: order.items.map((item) => ({ ...item })),
    });
    setFormError('');
    setShowForm(true);
  };

  const updateItem = (index: number, patch: Partial<OrderItem>) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const removeItem = (index: number) => {
    setForm((current) => ({
      ...current,
      items: current.items.length > 1 ? current.items.filter((_, i) => i !== index) : [{ ...EMPTY_ITEM }],
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    try {
      if (editing) {
        controller.updateOrder(editing.id, form);
        showToast('success', `Pedido ${editing.number} actualizado`);
      } else {
        const order = controller.createOrder(form);
        showToast('success', `Pedido ${order.number} creado`);
      }
      setShowForm(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el pedido');
    }
  };

  const handleStatusChange = (order: Order, status: OrderStatus) => {
    try {
      controller.changeStatus(order.id, status);
      showToast('success', `${order.number} → ${ORDER_STATUS_LABELS[status]}`);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'No se pudo cambiar el estado');
    }
  };

  const handleDelete = () => {
    if (!deleting) return;
    controller.removeOrder(deleting.id);
    showToast('success', `Pedido ${deleting.number} eliminado`);
    setDeleting(null);
  };

  const exportCsv = () => {
    const rows = [
      ['Número', 'Fecha', 'Cliente', 'Estado', 'Ítems', 'Total'],
      ...controller.orders.map((order) => [
        order.number,
        new Date(order.createdAt).toLocaleDateString(),
        controller.customersById.get(order.customerId) ?? '',
        ORDER_STATUS_LABELS[order.status],
        String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
        String(order.total),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pedidos.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const formTotal = calcOrderTotal(form.items);

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1>Pedidos</h1>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--ghost" onClick={exportCsv}>
            <Download size={15} /> Exportar CSV
          </button>
          <button type="button" className="btn btn--primary" onClick={openCreate}>
            <Plus size={15} /> Nuevo pedido
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="search">
          <Search size={15} />
          <input
            value={controller.search}
            onChange={(e) => controller.updateSearch(e.target.value)}
            placeholder="Buscar por número, cliente o ítem…"
          />
        </div>
        <select
          value={controller.statusFilter}
          onChange={(e) => controller.updateStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filtrar por estado"
        >
          <option value="todos">Todos los estados</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <span className="toolbar__count">{controller.totalOrders} pedidos</span>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Ítems</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {controller.orders.map((order) => (
                <tr key={order.id}>
                  <td className="mono">{order.number}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{controller.customersById.get(order.customerId) ?? '—'}</td>
                  <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td>${order.total.toLocaleString()}</td>
                  <td>
                    <div className="status-cell">
                      <StatusBadge status={order.status} />
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        aria-label={`Cambiar estado de ${order.number}`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {ORDER_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(order)} aria-label="Editar">
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => setDeleting(order)} aria-label="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!controller.orders.length && (
                <tr>
                  <td colSpan={7} className="muted">
                    No hay pedidos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={controller.page} totalPages={controller.totalPages} onPageChange={controller.setPage} />
      </div>

      {showForm && (
        <Modal title={editing ? `Editar ${editing.number}` : 'Nuevo pedido'} onClose={() => setShowForm(false)} wide>
          <form className="form" onSubmit={handleSubmit}>
            {formError && <div className="alert alert--error">{formError}</div>}

            <div className="form__row">
              <label>
                Cliente
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  required
                >
                  <option value="">Selecciona un cliente…</option>
                  {controller.customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} — {customer.company}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Estado
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <span className="form__subtitle">Ítems del pedido</span>
            {form.items.map((item, index) => (
              <div className="item-row" key={index}>
                <input
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  placeholder="Descripción del producto o servicio"
                  required
                />
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value)) })}
                  aria-label="Cantidad"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: Math.max(0, Number(e.target.value)) })}
                  aria-label="Precio unitario"
                />
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeItem(index)} aria-label="Quitar ítem">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setForm({ ...form, items: [...form.items, { ...EMPTY_ITEM }] })}
            >
              <Plus size={14} /> Agregar ítem
            </button>

            <div className="form__total">
              <span>Total</span>
              <strong>${formTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>

            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary">
                {editing ? 'Guardar cambios' : 'Crear pedido'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Eliminar pedido"
          message={`¿Eliminar el pedido ${deleting.number}? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
