import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, type SriCertificateStatus, type SriConfig, type SriConnectionVerify } from '../../api';
import { FormAlerts } from '../ui/FormAlerts';
import { PanelField } from '../ui/PanelField';

interface SriConnectionPanelProps {
  onVerified?: () => void;
  showContinue?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
}

export function SriConnectionPanel({
  onVerified,
  showContinue = false,
  onContinue,
  continueLabel = 'Continuar',
}: SriConnectionPanelProps) {
  const [config, setConfig] = useState<SriConfig | null>(null);
  const [certStatus, setCertStatus] = useState<SriCertificateStatus | null>(null);
  const [verifyResult, setVerifyResult] = useState<SriConnectionVerify | null>(null);
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const cfg = await api.getSriConnectionConfig();
      setConfig(cfg);
      if (cfg.provider === 'factuplan' && cfg.configured) {
        try {
          const status = await api.getSriCertificateStatus();
          setCertStatus(status);
        } catch {
          setCertStatus(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración SRI');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    setSuccess('');
    setVerifyResult(null);
    try {
      const result = await api.verifySriConnection();
      setVerifyResult(result);
      if (result.ok) {
        setSuccess(result.message);
        onVerified?.();
      } else {
        setError(result.message);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar conexión');
    } finally {
      setVerifying(false);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Seleccione el archivo .p12 de su firma electrónica');
      return;
    }
    if (!password.trim()) {
      setError('Ingrese la contraseña del certificado');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const result = await api.uploadSriCertificate(file, password.trim());
      setSuccess(result.message);
      setPassword('');
      setFile(null);
      await load();
      await handleVerify();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el certificado');
    } finally {
      setUploading(false);
    }
  };

  const ambienteLabel = config?.ambiente === 1 ? 'Pruebas (TESTING)' : 'Producción';
  const isFactuplan = config?.provider === 'factuplan';
  const canContinue = verifyResult?.ok || (isFactuplan && config?.configured && config.ambiente === 1);

  return (
    <div className="sri-connection-panel">
      <FormAlerts error={error} success={success} />

      {loading && <p className="muted">Cargando configuración SRI…</p>}

      {config && (
        <>
          <div className="sri-status-grid" style={{ marginBottom: 16 }}>
            <p><strong>Proveedor:</strong> {config.provider ?? 'datil'}</p>
            <p><strong>Ambiente:</strong> {ambienteLabel}</p>
            <p><strong>RUC:</strong> {config.ruc || '—'}</p>
            <p><strong>Estado API:</strong>{' '}
              {config.enabled && config.configured
                ? <span className="badge badge--ok">Configurado</span>
                : <span className="badge badge--warning">Pendiente</span>}
            </p>
          </div>

          {isFactuplan && (
            <>
              {certStatus && (
                <p className="muted" style={{ marginBottom: 12 }}>
                  Certificado: {certStatus.hasCertificate
                    ? certStatus.valid
                      ? `válido${certStatus.expiresAt ? ` — vence ${certStatus.expiresAt}` : ''}`
                      : 'cargado pero no válido'
                    : 'sin cargar'}
                </p>
              )}

              <form onSubmit={handleUpload} noValidate style={{ marginBottom: 16 }}>
                <p className="muted" style={{ marginBottom: 8 }}>
                  Suba su firma electrónica (.p12) para emitir en <strong>producción</strong> (API key{' '}
                  <code>ak_live_*</code>). En <strong>pruebas</strong> (<code>ak_test_*</code>) no hace falta:
                  use «Verificar conexión SRI» y continúe.
                </p>
                <label className="panel-field">
                  <span className="panel-field__label">Archivo .p12 / .pfx</span>
                  <input
                    type="file"
                    accept=".p12,.pfx"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <PanelField
                  label="Contraseña del certificado"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
                <button type="submit" className="btn btn--ghost btn--full" disabled={uploading} style={{ marginBottom: 8 }}>
                  {uploading ? 'Subiendo…' : 'Subir certificado'}
                </button>
              </form>
            </>
          )}

          {!isFactuplan && (
            <p className="muted" style={{ marginBottom: 16 }}>
              El servidor usa Datil. La configuración se realiza en el archivo <code>.env</code> del backend.
            </p>
          )}

          <button
            type="button"
            className="btn btn--primary btn--full"
            onClick={handleVerify}
            disabled={verifying || !config.configured}
            style={{ marginBottom: 8 }}
          >
            {verifying ? 'Verificando…' : 'Verificar conexión SRI'}
          </button>

          {verifyResult && (
            <p className={verifyResult.ok ? 'success-text' : 'error-text'} style={{ fontSize: 14 }}>
              {verifyResult.message}
            </p>
          )}

          {showContinue && onContinue && (
            <button
              type="button"
              className="btn btn--ghost btn--full"
              style={{ marginTop: 8 }}
              onClick={onContinue}
              disabled={!canContinue}
            >
              {continueLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
