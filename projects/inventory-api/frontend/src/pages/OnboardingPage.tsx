import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SriConnectionPanel } from '../components/settings/SriConnectionPanel';
import { api } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';
import { TaxIdField } from '../components/ui/TaxIdField';
import { useAuth } from '../context/AuthContext';
import {
  type FieldErrors,
  hasFieldErrors,
  validateEmail,
  validateEmissionCode,
  validateRequired,
  validateRuc,
} from '../utils/validation';

type ProfileField = 'businessName' | 'ruc' | 'razonSocial' | 'direccion' | 'emailNotificaciones';
type EmissionField = 'establishmentCode' | 'emissionPointCode' | 'label' | 'address';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    businessName: '',
    ruc: '',
    razonSocial: '',
    direccion: '',
    emailNotificaciones: '',
  });
  const [emission, setEmission] = useState({
    establishmentCode: '001',
    emissionPointCode: '002',
    label: 'Principal',
    address: '',
  });
  const [error, setError] = useState('');
  const [profileErrors, setProfileErrors] = useState<FieldErrors<ProfileField>>({});
  const [emissionErrors, setEmissionErrors] = useState<FieldErrors<EmissionField>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getBusinessProfile().then((data) => {
      setProfile({
        businessName: data.businessName,
        ruc: data.ruc,
        razonSocial: data.razonSocial,
        direccion: data.direccion ?? '',
        emailNotificaciones: data.emailNotificaciones ?? '',
      });
      if (data.onboardingStep > 0) setStep(Math.min(4, data.onboardingStep + 1));
    }).catch(() => {});
    api.getSriConfig().then((cfg) => {
      if (cfg.ruc) setProfile((p) => ({ ...p, ruc: cfg.ruc, razonSocial: cfg.razonSocial || p.razonSocial }));
      if (cfg.establecimientoCodigo) {
        setEmission((e) => ({
          ...e,
          establishmentCode: cfg.establecimientoCodigo,
          emissionPointCode: cfg.puntoEmision,
        }));
      }
    }).catch(() => {});
  }, []);

  const validateProfile = () => {
    const errors: FieldErrors<ProfileField> = {
      businessName: validateRequired(profile.businessName, 'El nombre comercial'),
      ruc: validateRuc(profile.ruc),
      razonSocial: validateRequired(profile.razonSocial, 'La razón social'),
      emailNotificaciones: validateEmail(profile.emailNotificaciones),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<ProfileField>;
    setProfileErrors(filtered);
    return !hasFieldErrors(filtered);
  };

  const validateEmission = () => {
    const errors: FieldErrors<EmissionField> = {
      establishmentCode: validateEmissionCode(emission.establishmentCode, 'Establecimiento'),
      emissionPointCode: validateEmissionCode(emission.emissionPointCode, 'Punto de emisión'),
      label: validateRequired(emission.label, 'La etiqueta'),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<EmissionField>;
    setEmissionErrors(filtered);
    return !hasFieldErrors(filtered);
  };

  const saveBusiness = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateProfile()) return;

    setSaving(true);
    try {
      await api.saveBusinessProfile(profile);
      await api.advanceOnboardingStep(1);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const saveEmission = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmission()) return;

    setSaving(true);
    try {
      await api.createEmissionPoint({ ...emission, defaultPoint: true });
      await api.advanceOnboardingStep(2);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el punto de emisión');
    } finally {
      setSaving(false);
    }
  };

  const completeAndGo = async (path: string) => {
    setSaving(true);
    setError('');
    try {
      await api.completeOnboarding();
      await refreshUser();
      navigate(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el onboarding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout
      title="Configura tu negocio"
      subtitle={`Paso ${step} de 4 — datos de tu empresa, punto de emisión y conexión SRI para facturar electrónicamente.`}
      footer={<p className="muted">Asistente inicial de StockFlow · solo la primera vez</p>}
    >
      <FormAlerts error={error} />

      {step === 1 && (
        <form className="auth-form" onSubmit={saveBusiness} noValidate>
          <PanelField
            label="Nombre comercial"
            value={profile.businessName}
            onChange={(e) => {
              setProfile({ ...profile, businessName: e.target.value });
              setProfileErrors((prev) => ({ ...prev, businessName: undefined }));
            }}
            error={profileErrors.businessName}
            required
          />
          <TaxIdField
            label="RUC"
            requireRuc
            value={profile.ruc}
            onChange={(e) => {
              setProfile({ ...profile, ruc: e.target.value });
              setProfileErrors((prev) => ({ ...prev, ruc: undefined }));
            }}
            error={profileErrors.ruc}
            required
          />
          <PanelField
            label="Razón social"
            value={profile.razonSocial}
            onChange={(e) => {
              setProfile({ ...profile, razonSocial: e.target.value });
              setProfileErrors((prev) => ({ ...prev, razonSocial: undefined }));
            }}
            error={profileErrors.razonSocial}
            required
          />
          <PanelField
            label="Dirección"
            value={profile.direccion}
            onChange={(e) => setProfile({ ...profile, direccion: e.target.value })}
          />
          <PanelField
            label="Email notificaciones"
            type="email"
            value={profile.emailNotificaciones}
            onChange={(e) => {
              setProfile({ ...profile, emailNotificaciones: e.target.value });
              setProfileErrors((prev) => ({ ...prev, emailNotificaciones: undefined }));
            }}
            error={profileErrors.emailNotificaciones}
          />
          <button type="submit" className="btn btn--primary btn--full" disabled={saving}>
            {saving ? 'Guardando…' : 'Continuar'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="auth-form" onSubmit={saveEmission} noValidate>
          <PanelField
            label="Establecimiento"
            value={emission.establishmentCode}
            onChange={(e) => {
              setEmission({ ...emission, establishmentCode: e.target.value });
              setEmissionErrors((prev) => ({ ...prev, establishmentCode: undefined }));
            }}
            error={emissionErrors.establishmentCode}
            hint="3 dígitos según registro SRI (ej. 001)"
            inputMode="numeric"
            maxLength={3}
            required
          />
          <PanelField
            label="Punto de emisión"
            value={emission.emissionPointCode}
            onChange={(e) => {
              setEmission({ ...emission, emissionPointCode: e.target.value });
              setEmissionErrors((prev) => ({ ...prev, emissionPointCode: undefined }));
            }}
            error={emissionErrors.emissionPointCode}
            hint="3 dígitos (ej. 002)"
            inputMode="numeric"
            maxLength={3}
            required
          />
          <PanelField
            label="Etiqueta"
            value={emission.label}
            onChange={(e) => {
              setEmission({ ...emission, label: e.target.value });
              setEmissionErrors((prev) => ({ ...prev, label: undefined }));
            }}
            error={emissionErrors.label}
            required
          />
          <PanelField
            label="Dirección sucursal"
            value={emission.address}
            onChange={(e) => setEmission({ ...emission, address: e.target.value })}
          />
          <button type="submit" className="btn btn--primary btn--full" disabled={saving}>
            {saving ? 'Guardando…' : 'Continuar'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="auth-form">
          <p>Conecta tu negocio con el SRI vía Factuplan. El servidor ya tiene la API key; solo falta verificar y, si quieres emitir, subir tu firma electrónica.</p>
          <SriConnectionPanel
            showContinue
            continueLabel="Conexión verificada — continuar"
            onContinue={async () => {
              try {
                await api.advanceOnboardingStep(3);
                setStep(4);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'No se pudo avanzar');
              }
            }}
          />
        </div>
      )}

      {step === 4 && (
        <div className="auth-form">
          <p>¡Listo! Ya puedes crear productos, proformas y facturas electrónicas.</p>
          <button
            type="button"
            className="btn btn--primary btn--full"
            onClick={() => completeAndGo('/dashboard')}
            disabled={saving}
          >
            {saving ? 'Finalizando…' : 'Ir al panel'}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--full"
            style={{ marginTop: 8 }}
            onClick={() => completeAndGo('/productos')}
            disabled={saving}
          >
            Crear primer producto
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
