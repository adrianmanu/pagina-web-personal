import { FormEvent, Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type CreditNote } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { SriStatusBadge } from '../components/ui/SriStatusBadge';

function ridePdfUrl(note: CreditNote) {
  if (note.sriRidePdfUrl) return note.sriRidePdfUrl;
  if (note.datilCreditNoteId) return `https://app.datil.co/ver/${note.datilCreditNoteId}/pdf`;
  return null;
}

export function CreditNotesPage() {
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);

  const load = () => api.getCreditNotes().then(setNotes);
  useEffect(() => { load(); }, []);

  const refreshSri = async (id: number) => {
    setRefreshingId(id);
    setError('');
    try {
      await api.refreshCreditNoteSri(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado SRI');
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Ventas</p>
          <h1>Notas de crédito</h1>
        </div>
      </header>

      <FormAlerts error={error} />

      <section className="panel">
        <div className="alert alert--warning" role="status" style={{ marginBottom: 16 }}>
          Emite notas de crédito desde Facturación sobre una factura <strong>AUTORIZADA</strong> con cliente identificado.
          No aplica a consumidor final.
        </div>
        <p className="muted" style={{ marginBottom: 16 }}>
          <Link to="/facturacion">Ir a Facturación →</Link>
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nº SRI</th>
                <th>Factura</th>
                <th>Motivo</th>
                <th>Total</th>
                <th>SRI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <Fragment key={note.id}>
                  <tr>
                    <td>{note.id}</td>
                    <td className="mono">{note.sriDocumentNumber ?? '—'}</td>
                    <td className="mono">{note.invoiceDocumentNumber ?? `#${note.invoiceId}`}</td>
                    <td>{note.motivo}</td>
                    <td>${note.total.toLocaleString()}</td>
                    <td>
                      <SriStatusBadge status={note.sriStatus} />
                    </td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                      >
                        {expandedId === note.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === note.id && (
                    <tr className="invoice-detail-row">
                      <td colSpan={7}>
                        <div className="invoice-detail-header">
                          <div>
                            <p className="invoice-detail-title">
                              NC #{note.id}
                              {note.sriDocumentNumber && (
                                <span className="invoice-detail-sri-number">{note.sriDocumentNumber}</span>
                              )}
                            </p>
                            <p className="muted">
                              Factura {note.invoiceDocumentNumber ?? note.invoiceId}
                              {note.restockStock ? ' · Stock reintegrado' : ''}
                            </p>
                          </div>
                          <div className="invoice-sri-actions">
                            {note.sriStatus && note.sriStatus !== 'AUTORIZADO' && note.sriStatus !== 'DISABLED' && (
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                disabled={refreshingId === note.id}
                                onClick={() => refreshSri(note.id)}
                              >
                                <RefreshCw size={14} />
                                {refreshingId === note.id ? 'Consultando…' : 'Actualizar SRI'}
                              </button>
                            )}
                            {note.sriStatus === 'AUTORIZADO' && ridePdfUrl(note) && (
                              <a
                                className="btn btn--ghost btn--sm"
                                href={ridePdfUrl(note)!}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink size={14} /> Ver RIDE (PDF)
                              </a>
                            )}
                          </div>
                        </div>
                        {note.sriErrorMessage && (
                          <p className="invoice-sri-error"><strong>Error SRI:</strong> {note.sriErrorMessage}</p>
                        )}
                        <table className="invoice-detail">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {note.items.map((item, i) => (
                              <tr key={i}>
                                <td>{item.productName}</td>
                                <td>{item.quantity}</td>
                                <td>${item.unitPrice.toLocaleString()}</td>
                                <td>${item.subtotal.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!notes.length && (
                <tr>
                  <td colSpan={7} className="muted">Aún no hay notas de crédito.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
