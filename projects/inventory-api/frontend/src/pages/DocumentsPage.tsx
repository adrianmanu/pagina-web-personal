import { useEffect, useMemo, useState } from 'react';
import { api, type CreditNote, type DebitNote, type Invoice, type PurchaseSettlement, type Retention, type Waybill } from '../api';
import { PanelField } from '../components/ui/PanelField';

type DocType = 'Factura' | 'Nota de crédito' | 'Nota de débito' | 'Guía de remisión' | 'Liquidación de compra' | 'Retención';

interface IssuedDocument {
  key: string;
  type: DocType;
  id: number;
  documentNumber: string;
  reference?: string;
  detail: string;
  total: number;
  sriStatus?: string | null;
  createdAt: string;
}

function sriBadgeClass(status?: string | null) {
  if (!status) return 'badge';
  const normalized = status.toUpperCase();
  if (normalized === 'AUTORIZADO') return 'badge badge--success';
  if (normalized === 'ERROR' || normalized === 'NO AUTORIZADO') return 'badge badge--danger';
  if (normalized === 'DISABLED') return 'badge';
  return 'badge badge--warning';
}

function mapInvoices(invoices: Invoice[]): IssuedDocument[] {
  return invoices.map((inv) => ({
    key: `inv-${inv.id}`,
    type: 'Factura',
    id: inv.id,
    documentNumber: inv.sriDocumentNumber ?? `#${inv.id}`,
    detail: inv.customerName,
    total: inv.total,
    sriStatus: inv.sriStatus,
    createdAt: inv.createdAt,
  }));
}

function mapCreditNotes(notes: CreditNote[]): IssuedDocument[] {
  return notes.map((note) => ({
    key: `cn-${note.id}`,
    type: 'Nota de crédito',
    id: note.id,
    documentNumber: note.sriDocumentNumber ?? `#${note.id}`,
    reference: note.invoiceDocumentNumber ?? `#${note.invoiceId}`,
    detail: note.motivo,
    total: note.total,
    sriStatus: note.sriStatus,
    createdAt: note.createdAt,
  }));
}

function mapDebitNotes(notes: DebitNote[]): IssuedDocument[] {
  return notes.map((note) => ({
    key: `dn-${note.id}`,
    type: 'Nota de débito',
    id: note.id,
    documentNumber: note.sriDocumentNumber ?? `#${note.id}`,
    reference: note.invoiceDocumentNumber ?? `#${note.invoiceId}`,
    detail: note.items.map((item) => item.motivo).join(', '),
    total: note.total,
    sriStatus: note.sriStatus,
    createdAt: note.createdAt,
  }));
}

function mapWaybills(waybills: Waybill[]): IssuedDocument[] {
  return waybills.map((waybill) => ({
    key: `wb-${waybill.id}`,
    type: 'Guía de remisión',
    id: waybill.id,
    documentNumber: waybill.sriDocumentNumber ?? `#${waybill.id}`,
    reference: waybill.invoiceDocumentNumber ?? (waybill.invoiceId ? `#${waybill.invoiceId}` : undefined),
    detail: `${waybill.recipientName} · ${waybill.motivoTraslado}`,
    total: 0,
    sriStatus: waybill.sriStatus,
    createdAt: waybill.createdAt,
  }));
}

function mapPurchaseSettlements(settlements: PurchaseSettlement[]): IssuedDocument[] {
  return settlements.map((settlement) => ({
    key: `ps-${settlement.id}`,
    type: 'Liquidación de compra',
    id: settlement.id,
    documentNumber: settlement.sriDocumentNumber ?? `#${settlement.id}`,
    reference: settlement.supplierTaxId,
    detail: settlement.supplierName,
    total: settlement.total,
    sriStatus: settlement.sriStatus,
    createdAt: settlement.createdAt,
  }));
}

function mapRetentions(retentions: Retention[]): IssuedDocument[] {
  return retentions.map((retention) => ({
    key: `ret-${retention.id}`,
    type: 'Retención',
    id: retention.id,
    documentNumber: retention.sriDocumentNumber ?? `#${retention.id}`,
    reference: retention.supportDocumentNumber,
    detail: `${retention.supplierName} · ${retention.periodoFiscal}`,
    total: retention.totalRetained,
    sriStatus: retention.sriStatus,
    createdAt: retention.createdAt,
  }));
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<IssuedDocument[]>([]);
  const [filter, setFilter] = useState<'all' | DocType>('all');

  useEffect(() => {
    Promise.all([
      api.getInvoices(),
      api.getCreditNotes(),
      api.getDebitNotes(),
      api.getWaybills(),
      api.getPurchaseSettlements(),
      api.getRetentions(),
    ]).then(([invoices, creditNotes, debitNotes, waybills, settlements, retentions]) => {
        const merged = [
          ...mapInvoices(invoices),
          ...mapCreditNotes(creditNotes),
          ...mapDebitNotes(debitNotes),
          ...mapWaybills(waybills),
          ...mapPurchaseSettlements(settlements),
          ...mapRetentions(retentions),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDocuments(merged);
      },
    );
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? documents : documents.filter((doc) => doc.type === filter)),
    [documents, filter],
  );

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Ventas</p>
          <h1>Documentos emitidos</h1>
        </div>
      </header>

      <section className="panel form-panel">
        <div className="form-actions" style={{ marginBottom: 16 }}>
          <PanelField
            as="select"
            label="Filtrar por tipo"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            style={{ marginBottom: 0, maxWidth: 320 }}
          >
            <option value="all">Todos los tipos</option>
            <option value="Factura">Facturas</option>
            <option value="Nota de crédito">Notas de crédito</option>
            <option value="Nota de débito">Notas de débito</option>
            <option value="Guía de remisión">Guías de remisión</option>
            <option value="Liquidación de compra">Liquidaciones de compra</option>
            <option value="Retención">Retenciones</option>
          </PanelField>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nº SRI</th>
                <th>Referencia</th>
                <th>Detalle</th>
                <th>Total</th>
                <th>SRI</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.key}>
                  <td>{doc.type}</td>
                  <td className="mono">{doc.documentNumber}</td>
                  <td className="mono">{doc.reference ?? '—'}</td>
                  <td>{doc.detail}</td>
                  <td>{doc.type === 'Guía de remisión' ? '—' : `$${doc.total.toLocaleString()}`}</td>
                  <td>
                    <span className={sriBadgeClass(doc.sriStatus)}>{doc.sriStatus ?? '—'}</span>
                  </td>
                  <td>{new Date(doc.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="muted">No hay documentos emitidos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
