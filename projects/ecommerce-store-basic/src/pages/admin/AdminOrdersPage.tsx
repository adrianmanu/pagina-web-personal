import { useEffect, useMemo, useState } from 'react';
import { orderService } from '../../services/orderService';
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from '../../models/types';
import { formatPrice } from '../../components/ui/ProductImage';
import { Pagination } from '../../components/ui/Pagination';
import { paginate } from '../../utils/pagination';

export function AdminOrdersPage() {
  const [refresh, setRefresh] = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const list = orderService.list();
    if (statusFilter === 'all') return list;
    return list.filter((o) => o.status === statusFilter);
  }, [refresh, statusFilter]);

  const paged = useMemo(() => paginate(filtered, page), [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const updateStatus = (id: string, status: OrderStatus) => {
    orderService.updateStatus(id, status);
    setRefresh((r) => r + 1);
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1>Pedidos</h1>
        <p>Marca cada pedido como nuevo o atendido</p>
      </header>

      <div className="list-toolbar">
        <label className="field field--inline">
          <span>Filtrar por estado</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          >
            <option value="all">Todos</option>
            {ORDER_STATUS_FLOW.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </label>
        <span className="muted">{filtered.length} pedidos</span>
      </div>

      <div className="orders-list">
        {paged.items.map((o) => (
          <article key={o.id} className="order-card">
            <div className="order-card__head">
              <div>
                <strong>{o.orderNumber}</strong>
                <p className="muted">{o.customerName} · {new Date(o.createdAt).toLocaleString('es-EC')}</p>
              </div>
              <strong>{formatPrice(o.total)}</strong>
            </div>
            <ul className="order-items-mini">
              {o.items.map((item, i) => (
                <li key={i}>{item.quantity}× {item.productName}</li>
              ))}
            </ul>
            <p className="muted">{o.address} · {o.customerPhone}</p>
            <div className="status-row">
              <span>Estado:</span>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}>
                {ORDER_STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="muted">No hay pedidos con ese estado.</p>
        )}
      </div>

      <Pagination
        page={paged.page}
        totalPages={paged.totalPages}
        total={paged.total}
        onPageChange={setPage}
      />
    </div>
  );
}
