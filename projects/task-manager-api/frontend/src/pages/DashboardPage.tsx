import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarClock } from 'lucide-react';
import { downloadExcel, downloadPdf, type ExportColumn } from '../utils/exportReports';
import { ExportMenu } from '../components/ui/ExportMenu';
import {
  api,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Task,
  type TaskStats,
} from '../api/client';

const TASKFLOW_THEME = { accentRgb: [6, 182, 212] as [number, number, number] };

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function DashboardPage() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error);
    api.getTasks().then(setTasks).catch(console.error);
  }, []);

  const exportSummary = (format: 'pdf' | 'excel') => {
    if (!stats) return;
    type SummaryRow = { metric: string; value: string };
    const rows: SummaryRow[] = [
      { metric: 'Tareas totales', value: String(stats.total) },
      { metric: 'Pendientes', value: String(stats.byStatus.pendiente) },
      { metric: 'En progreso', value: String(stats.byStatus.en_progreso) },
      { metric: 'Completadas', value: String(stats.byStatus.completada) },
      { metric: 'Vencidas', value: String(stats.overdue) },
      { metric: '% completado', value: `${stats.completionRate}%` },
    ];
    const columns: ExportColumn<SummaryRow>[] = [
      { header: 'Métrica', value: (row) => row.metric },
      { header: 'Valor', value: (row) => row.value },
    ];
    const meta = {
      title: 'Resumen de productividad — TaskFlow',
      subtitle: 'Indicadores del tablero de tareas',
      filenameBase: `resumen-taskflow-${new Date().toISOString().slice(0, 10)}`,
    };
    if (format === 'pdf') downloadPdf(meta, columns, rows, TASKFLOW_THEME);
    else downloadExcel(meta, columns, rows, 'Resumen');
  };

  const now = Date.now();
  const upcoming = tasks
    .filter((task) => task.status !== 'completada' && task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 6);

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Panel principal</p>
          <h1>Dashboard de tareas</h1>
        </div>
        <div className="header-actions">
          <ExportMenu onExport={exportSummary} disabled={!stats} />
          <Link to="/tablero" className="btn btn--primary">
            Ir al tablero <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Tareas totales</span>
          <strong>{stats?.total ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>Pendientes</span>
          <strong>{stats?.byStatus.pendiente ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>En progreso</span>
          <strong>{stats?.byStatus.en_progreso ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>Completadas</span>
          <strong>{stats?.byStatus.completada ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>Vencidas</span>
          <strong className={stats?.overdue ? 'kpi-danger' : ''}>{stats?.overdue ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>% completado</span>
          <strong>{stats?.completionRate ?? 0}%</strong>
        </article>
      </div>

      <section className="panel">
        <h2>
          <CalendarClock size={17} style={{ verticalAlign: '-3px', marginRight: 8 }} />
          Próximos vencimientos
        </h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha límite</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((task) => {
                const overdue = new Date(task.dueDate!).getTime() < now;
                return (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>
                      <span className={`badge priority-${task.priority}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </td>
                    <td>{STATUS_LABELS[task.status]}</td>
                    <td className={overdue ? 'due-overdue' : ''}>
                      {overdue && <AlertTriangle size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />}
                      {formatDate(task.dueDate!)}
                    </td>
                  </tr>
                );
              })}
              {!upcoming.length && (
                <tr>
                  <td colSpan={4} className="muted">
                    No hay tareas con fecha límite. Crea tareas desde el tablero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
