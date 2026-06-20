interface FormAlertsProps {
  error?: string;
  success?: string;
}

export function FormAlerts({ error, success }: FormAlertsProps) {
  return (
    <>
      {error && <div className="alert alert--error" role="alert">{error}</div>}
      {success && <div className="alert alert--success" role="status">{success}</div>}
    </>
  );
}
