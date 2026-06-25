import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type MembershipPlan, type MembershipStatus } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { useAuth } from '../context/AuthContext';

const TRIAL_BENEFITS = [
  'Acceso completo durante 14 días',
  'Mismas funciones que un plan de pago',
  'Sin tarjeta ni compromiso',
  'Ideal para probar facturación SRI en ambiente de pruebas',
];

function PlanBenefits({ items }: { items: string[] }) {
  return (
    <ul className="membership-benefits">
      {items.map((item) => (
        <li key={item}>
          <span className="membership-benefits__check" aria-hidden>✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function formatUsd(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function PlanCard({
  plan,
  selectedPeriodMonths,
  onSelectPeriod,
  onSubscribe,
  loading,
  confirming,
  paymentsEnabled,
}: {
  plan: MembershipPlan;
  selectedPeriodMonths: number;
  onSelectPeriod: (months: number) => void;
  onSubscribe: () => void;
  loading: boolean;
  confirming: boolean;
  paymentsEnabled: boolean;
}) {
  const selected =
    plan.billingOptions.find((o) => o.periodMonths === selectedPeriodMonths) ?? plan.billingOptions[0];

  return (
    <section className={`panel membership-plan ${plan.recommended ? 'membership-plan--featured' : ''}`}>
      {plan.recommended && <span className="badge badge--ok membership-plan__badge">Más popular</span>}
      <h3 className="membership-plan__name">{plan.name}</h3>
      <p className="muted membership-plan__tagline">{plan.description}</p>

      <div className="membership-periods" role="tablist" aria-label={`Período de pago — ${plan.name}`}>
        {plan.billingOptions.map((option) => (
          <button
            key={option.periodMonths}
            type="button"
            role="tab"
            aria-selected={option.periodMonths === selectedPeriodMonths}
            className={`membership-periods__btn ${
              option.periodMonths === selectedPeriodMonths ? 'membership-periods__btn--active' : ''
            }`}
            onClick={() => onSelectPeriod(option.periodMonths)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="membership-plan__price">
        ${formatUsd(selected.priceUsd)}
        <span className="membership-plan__interval"> / {selected.label}</span>
      </p>

      {selected.savingsPercent > 0 && (
        <p className="membership-plan__savings">
          <span className="badge badge--ok">Ahorra {selected.savingsPercent}%</span>
          <span className="muted">
            {' '}
            ≈ ${formatUsd(selected.pricePerMonthUsd)}/mes
          </span>
        </p>
      )}

      <p className="muted membership-plan__billing">
        Un pago único activa <strong>{selected.periodDays} días</strong> de uso. Renuevas cuando quieras con PayPhone.
      </p>

      <p className="membership-plan__includes">
        <strong>Incluye:</strong>
      </p>
      <PlanBenefits items={plan.benefits} />
      <button
        type="button"
        className="btn btn--primary btn--full"
        disabled={loading || confirming || !paymentsEnabled}
        onClick={onSubscribe}
      >
        {loading
          ? 'Redirigiendo…'
          : `Pagar $${formatUsd(selected.priceUsd)} — ${selected.label}`}
      </button>
    </section>
  );
}

export function MembershipPage() {
  const { refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, number>>({});
  const [billingProvider, setBillingProvider] = useState('manual');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = () => {
    api.getMembershipStatus().then(setStatus).catch((err) => {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el estado');
    });
    api.getMembershipPlans().then((loaded) => {
      setPlans(loaded);
      setSelectedPeriods((prev) => {
        const next = { ...prev };
        for (const plan of loaded) {
          if (!next[plan.id]) {
            next[plan.id] = plan.billingOptions[0]?.periodMonths ?? 1;
          }
        }
        return next;
      });
    }).catch(() => {});
    api.getMembershipBillingProvider?.().then((r) => setBillingProvider(r.provider)).catch(() => {});
  };

  useEffect(() => {
    load();
    if (searchParams.get('success') === '1') {
      setSuccess('Pago recibido. Tu membresía se activará en unos segundos.');
      refreshUser().then(load);
    }
    if (searchParams.get('cancel') === '1') {
      setError('Checkout cancelado. Puedes intentar de nuevo cuando quieras.');
    }
  }, [searchParams, refreshUser]);

  useEffect(() => {
    const payphoneId = searchParams.get('id');
    const clientTxId = searchParams.get('clientTransactionId');
    if (!payphoneId || !clientTxId || confirming) {
      return;
    }

    setConfirming(true);
    setError('');
    api
      .confirmPayPhonePayment(Number(payphoneId), clientTxId)
      .then((result) => {
        if (result.approved) {
          setSuccess(result.message);
        } else {
          setError(result.message);
        }
        return refreshUser();
      })
      .then(load)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudo confirmar el pago');
      })
      .finally(() => {
        setConfirming(false);
        setSearchParams({}, { replace: true });
      });
  }, [searchParams, confirming, refreshUser, setSearchParams]);

  const subscribe = async (planId: string, periodMonths: number) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.startMembershipCheckout(planId as 'STARTER' | 'PRO', periodMonths);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setError(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el pago');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = status?.status ?? '—';
  const canEmit = status?.canEmit ?? true;
  const paymentsEnabled = billingProvider === 'payphone' || billingProvider === 'stripe';
  const onTrial = status?.status === 'TRIAL';

  return (
    <div className="membership-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">SaaS StockFlow</p>
          <h1>Membresía</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: 640 }}>
            Elige el plan y el período de pago. Pagas con PayPhone y usas StockFlow para inventario
            y facturación electrónica con el SRI.
          </p>
        </div>
      </header>

      <FormAlerts error={error} success={success} />

      {confirming && (
        <section className="panel" style={{ marginBottom: 24 }}>
          <p>Confirmando pago con PayPhone…</p>
        </section>
      )}

      {status && (
        <section className="panel" style={{ marginBottom: 24 }}>
          <h2>Tu situación hoy</h2>
          <p>
            Plan: <strong>{status.plan}</strong> · Estado:{' '}
            <span className={`badge ${canEmit ? 'badge--success' : 'badge--warning'}`}>{statusLabel}</span>
          </p>
          <p className="muted">{status.message}</p>
          {status.trialEndsAt && (
            <p className="muted">Prueba gratis hasta: {new Date(status.trialEndsAt).toLocaleString('es-EC')}</p>
          )}
          {status.currentPeriodEnd && (
            <p className="muted">Plan pagado vigente hasta: {new Date(status.currentPeriodEnd).toLocaleString('es-EC')}</p>
          )}
          {!canEmit && status.enforcementEnabled && (
            <p style={{ marginTop: 12 }}>
              No puedes emitir comprobantes SRI hasta activar un plan. Consultar inventario y datos sigue disponible.
            </p>
          )}
        </section>
      )}

      {onTrial && (
        <section className="panel membership-trial" style={{ marginBottom: 24 }}>
          <div className="membership-trial__header">
            <h2>Prueba gratis — 14 días</h2>
            <span className="badge badge--ok">Activo al registrarte</span>
          </div>
          <p className="muted">No necesitas pagar para empezar. Al crear tu cuenta ya tienes acceso completo.</p>
          <PlanBenefits items={TRIAL_BENEFITS} />
        </section>
      )}

      <section className="panel membership-billing-note" style={{ marginBottom: 24 }}>
        <h2>¿Cómo funciona el cobro?</h2>
        <p className="muted">
          PayPhone en Ecuador funciona con <strong>pago único por período</strong>: eliges 1 mes, 3 meses, 6 meses o
          1 año, pagas hoy y tu plan queda activo ese tiempo. No hay débito automático mensual.
        </p>
        <ul className="muted" style={{ paddingLeft: 20, marginTop: 12 }}>
          <li>Períodos más largos incluyen descuento (5%, 10% y 15% en 3, 6 y 12 meses).</li>
          <li>Tú decides cuándo renovar Starter o Pro.</li>
          <li>Al vencer, puedes elegir otro período al renovar.</li>
        </ul>
      </section>

      <h2 className="membership-plans-title">Planes de pago</h2>
      <div className="split membership-plans">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selectedPeriodMonths={selectedPeriods[plan.id] ?? 1}
            onSelectPeriod={(months) =>
              setSelectedPeriods((prev) => ({ ...prev, [plan.id]: months }))
            }
            onSubscribe={() => subscribe(plan.id, selectedPeriods[plan.id] ?? 1)}
            loading={loading}
            confirming={confirming}
            paymentsEnabled={paymentsEnabled}
          />
        ))}
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Tabla de precios</h2>
        <div className="membership-price-table-wrap">
          <table className="membership-price-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Starter</th>
                <th>Pro</th>
              </tr>
            </thead>
            <tbody>
              {(plans.find((p) => p.id === 'STARTER')?.billingOptions ?? []).map((option) => {
                const proOption = plans
                  .find((p) => p.id === 'PRO')
                  ?.billingOptions.find((o) => o.periodMonths === option.periodMonths);
                return (
                  <tr key={option.periodMonths}>
                    <td>
                      {option.label}
                      {option.savingsPercent > 0 && (
                        <span className="membership-price-table__save"> −{option.savingsPercent}%</span>
                      )}
                    </td>
                    <td>${formatUsd(option.priceUsd)}</td>
                    <td>${formatUsd(proOption?.priceUsd ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Comparación rápida</h2>
        <div className="membership-compare muted">
          <p>
            <strong>Starter</strong> — Si vendes productos o servicios y necesitas facturar legalmente con el SRI.
          </p>
          <p>
            <strong>Pro</strong> — Si además declaras ATS, manejas varios usuarios o necesitas liquidaciones de compra
            y soporte más rápido.
          </p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Pago con PayPhone (Ecuador)</h2>
        <p className="muted">
          Aceptamos tarjeta de crédito o débito ecuatoriana. El dinero va a la cuenta PayPhone del comercio
          configurado en el servidor.
        </p>
        {!paymentsEnabled && (
          <p className="error-text" style={{ marginTop: 8 }}>
            Pagos no habilitados en este servidor. Configura PayPhone en el archivo <code>.env</code> del backend.
          </p>
        )}
      </section>
    </div>
  );
}
