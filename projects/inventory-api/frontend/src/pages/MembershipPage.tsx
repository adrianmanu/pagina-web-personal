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

export function MembershipPage() {
  const { refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [billingProvider, setBillingProvider] = useState('manual');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = () => {
    api.getMembershipStatus().then(setStatus).catch((err) => {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el estado');
    });
    api.getMembershipPlans().then(setPlans).catch(() => {});
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

  const subscribe = async (planId: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.startMembershipCheckout(planId as 'STARTER' | 'PRO');
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
            Elige el plan según el tamaño de tu negocio. Pagas con PayPhone y usas StockFlow para inventario
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
          Los planes se cobran en <strong>períodos de 30 días</strong>, no como suscripción automática mensual.
          PayPhone en Ecuador funciona con <strong>pago único por período</strong>: pagas hoy y tu plan queda activo
          30 días. Cuando se acerque el vencimiento, renuevas con otro pago.
        </p>
        <ul className="muted" style={{ paddingLeft: 20, marginTop: 12 }}>
          <li>No hay débito automático a tu tarjeta cada mes.</li>
          <li>Tú decides cuándo renovar Starter o Pro.</li>
          <li>Plan anual con descuento: próximamente (contáctanos si lo necesitas ya).</li>
        </ul>
      </section>

      <h2 className="membership-plans-title">Planes de pago</h2>
      <div className="split membership-plans">
        {plans.map((plan) => (
          <section key={plan.id} className={`panel membership-plan ${plan.recommended ? 'membership-plan--featured' : ''}`}>
            {plan.recommended && <span className="badge badge--ok membership-plan__badge">Más popular</span>}
            <h3 className="membership-plan__name">{plan.name}</h3>
            <p className="muted membership-plan__tagline">{plan.description}</p>
            <p className="membership-plan__price">
              ${plan.priceUsd}
              <span className="membership-plan__interval"> / {plan.interval}</span>
            </p>
            <p className="muted membership-plan__billing">{plan.billingNote}</p>
            <p className="membership-plan__includes">
              <strong>Incluye:</strong>
            </p>
            <PlanBenefits items={plan.benefits} />
            <button
              type="button"
              className="btn btn--primary btn--full"
              disabled={loading || confirming || !paymentsEnabled}
              onClick={() => subscribe(plan.id)}
            >
              {loading ? 'Redirigiendo…' : `Pagar $${plan.priceUsd} — ${plan.periodDays} días`}
            </button>
          </section>
        ))}
      </div>

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
