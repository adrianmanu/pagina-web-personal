import { FormEvent, useEffect, useState } from 'react';
import { api, type BusinessProfile, type EmissionPoint } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { SriConnectionPanel } from '../components/settings/SriConnectionPanel';
import { PanelField } from '../components/ui/PanelField';
import { TaxIdField } from '../components/ui/TaxIdField';
import {
  type FieldErrors,
  hasFieldErrors,
  validateEmail,
  validateEmissionCode,
  validateRequired,
  validateRuc,
} from '../utils/validation';

type ProfileField = 'businessName' | 'ruc' | 'razonSocial' | 'direccion' | 'emailNotificaciones';
type PointField = 'establishmentCode' | 'emissionPointCode' | 'label';

export function SettingsPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [points, setPoints] = useState<EmissionPoint[]>([]);
  const [form, setForm] = useState({
    businessName: '',
    ruc: '',
    razonSocial: '',
    direccion: '',
    emailNotificaciones: '',
  });
  const [pointForm, setPointForm] = useState({
    establishmentCode: '001',
    emissionPointCode: '002',
    label: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileErrors, setProfileErrors] = useState<FieldErrors<ProfileField>>({});
  const [pointErrors, setPointErrors] = useState<FieldErrors<PointField>>({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.getBusinessProfile().then((data) => {
      setProfile(data);
      setForm({
        businessName: data.businessName,
        ruc: data.ruc,
        razonSocial: data.razonSocial,
        direccion: data.direccion ?? '',
        emailNotificaciones: data.emailNotificaciones ?? '',
      });
    });
    api.getEmissionPoints().then(setPoints);
  };

  useEffect(() => { load(); }, []);

  const validateProfile = () => {
    const errors: FieldErrors<ProfileField> = {
      businessName: validateRequired(form.businessName, 'El nombre comercial'),
      ruc: validateRuc(form.ruc),
      razonSocial: validateRequired(form.razonSocial, 'La razón social'),
      emailNotificaciones: validateEmail(form.emailNotificaciones),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<ProfileField>;
    setProfileErrors(filtered);
    return !hasFieldErrors(filtered);
  };

  const validatePoint = () => {
    const errors: FieldErrors<PointField> = {
      establishmentCode: validateEmissionCode(pointForm.establishmentCode, 'Establecimiento'),
      emissionPointCode: validateEmissionCode(pointForm.emissionPointCode, 'Punto de emisión'),
      label: validateRequired(pointForm.label, 'El nombre'),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<PointField>;
    setPointErrors(filtered);
    return !hasFieldErrors(filtered);
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateProfile()) return;

    setSaving(true);
    try {
      await api.saveBusinessProfile(form);
      setSuccess('Perfil de negocio actualizado.');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const addPoint = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validatePoint()) return;

    try {
      await api.createEmissionPoint(pointForm);
      setPointForm({ establishmentCode: '001', emissionPointCode: '002', label: '', address: '' });
      setPointErrors({});
      setSuccess('Punto de emisión agregado.');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear punto');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Configuración</h1>
        </div>
      </header>
      <FormAlerts error={error} success={success} />

      <div className="split">
        <form className="panel form-panel" onSubmit={saveProfile} noValidate>
          <h2>Datos del negocio</h2>
          <p className="muted">Cada cuenta StockFlow = un RUC. Multi-sucursal vía puntos de emisión.</p>

          <PanelField
            label="Nombre comercial"
            value={form.businessName}
            onChange={(e) => {
              setForm({ ...form, businessName: e.target.value });
              setProfileErrors((prev) => ({ ...prev, businessName: undefined }));
            }}
            error={profileErrors.businessName}
            required
          />
          <TaxIdField
            label="RUC"
            requireRuc
            value={form.ruc}
            onChange={(e) => {
              setForm({ ...form, ruc: e.target.value });
              setProfileErrors((prev) => ({ ...prev, ruc: undefined }));
            }}
            error={profileErrors.ruc}
            required
          />
          <PanelField
            label="Razón social"
            value={form.razonSocial}
            onChange={(e) => {
              setForm({ ...form, razonSocial: e.target.value });
              setProfileErrors((prev) => ({ ...prev, razonSocial: undefined }));
            }}
            error={profileErrors.razonSocial}
            required
          />
          <PanelField
            label="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />
          <PanelField
            label="Email notificaciones factura"
            type="email"
            value={form.emailNotificaciones}
            onChange={(e) => {
              setForm({ ...form, emailNotificaciones: e.target.value });
              setProfileErrors((prev) => ({ ...prev, emailNotificaciones: undefined }));
            }}
            error={profileErrors.emailNotificaciones}
          />
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          {profile && (
            <p className="muted" style={{ marginTop: 12 }}>
              Onboarding: {profile.onboardingCompleted ? 'completo' : `paso ${profile.onboardingStep}`}
            </p>
          )}
        </form>

        <section className="panel">
          <h2>Puntos de emisión</h2>
          <form className="form-panel" onSubmit={addPoint} noValidate style={{ marginBottom: 16 }}>
            <div className="form-row">
              <PanelField
                label="Estab."
                value={pointForm.establishmentCode}
                onChange={(e) => {
                  setPointForm({ ...pointForm, establishmentCode: e.target.value });
                  setPointErrors((prev) => ({ ...prev, establishmentCode: undefined }));
                }}
                error={pointErrors.establishmentCode}
                inputMode="numeric"
                maxLength={3}
                required
              />
              <PanelField
                label="Pto."
                value={pointForm.emissionPointCode}
                onChange={(e) => {
                  setPointForm({ ...pointForm, emissionPointCode: e.target.value });
                  setPointErrors((prev) => ({ ...prev, emissionPointCode: undefined }));
                }}
                error={pointErrors.emissionPointCode}
                inputMode="numeric"
                maxLength={3}
                required
              />
              <PanelField
                label="Nombre"
                value={pointForm.label}
                onChange={(e) => {
                  setPointForm({ ...pointForm, label: e.target.value });
                  setPointErrors((prev) => ({ ...prev, label: undefined }));
                }}
                error={pointErrors.label}
                required
              />
              <button type="submit" className="btn btn--ghost" style={{ alignSelf: 'end' }}>
                Agregar
              </button>
            </div>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Estab.</th><th>Pto.</th><th>Nombre</th><th></th></tr></thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.id}>
                    <td>{p.establishmentCode}</td>
                    <td>{p.emissionPointCode}</td>
                    <td>{p.label}{p.defaultPoint ? ' · principal' : ''}</td>
                    <td>
                      {!p.defaultPoint && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => {
                            if (!confirm('¿Eliminar este punto de emisión?')) return;
                            api.deleteEmissionPoint(p.id).then(load).catch((err) => {
                              setError(err instanceof Error ? err.message : 'No se pudo eliminar');
                            });
                          }}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!points.length && (
                  <tr>
                    <td colSpan={4} className="muted">Sin puntos de emisión configurados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Conexión SRI</h2>
        <p className="muted">Facturación electrónica — proveedor, certificado y verificación de conexión.</p>
        <SriConnectionPanel />
      </section>
    </div>
  );
}
