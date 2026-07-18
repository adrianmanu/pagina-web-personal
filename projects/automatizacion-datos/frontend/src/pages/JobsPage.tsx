import { useEffect, useState } from 'react';
import { api, type DataSource, type ExtractionJob } from '../api/client';

export function JobsPage() {
  const [jobs, setJobs] = useState<ExtractionJob[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [sourceId, setSourceId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.getJobs().then(setJobs);
    api.getDataSources().then(setSources);
  };

  useEffect(() => { load(); }, []);

  const runJob = async () => {
    setLoading(true);
    try {
      await api.runJob(sourceId ? Number(sourceId) : undefined);
      load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">ETL</p>
          <h1>Jobs de extracción</h1>
        </div>
      </header>

      <section className="panel run-panel">
        <h2>Ejecutar pipeline</h2>
        <div className="run-controls">
          <select value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
            <option value="">API por defecto (JSONPlaceholder)</option>
            {sources.filter((s) => s.is_active).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button type="button" className="btn btn--primary" onClick={runJob} disabled={loading}>
            {loading ? 'Ejecutando...' : 'Ejecutar ETL'}
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Historial</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Estado</th><th>Registros</th><th>Mensaje</th><th>Inicio</th></tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>#{job.id}</td>
                  <td><span className={`badge badge--${job.status}`}>{job.status}</span></td>
                  <td>{job.records_extracted}</td>
                  <td>{job.message}</td>
                  <td>{new Date(job.started_at).toLocaleString()}</td>
                </tr>
              ))}
              {!jobs.length && (
                <tr><td colSpan={5} className="muted">No hay jobs ejecutados aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
