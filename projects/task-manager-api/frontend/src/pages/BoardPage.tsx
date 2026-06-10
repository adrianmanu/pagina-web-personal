import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { downloadExcel, downloadPdf, type ExportColumn } from '../utils/exportReports';
import { ExportMenu } from '../components/ui/ExportMenu';
import {
  api,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../api/client';

interface TaskFormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

const EMPTY_FORM: TaskFormState = {
  title: '',
  description: '',
  status: 'pendiente',
  priority: 'media',
  dueDate: '',
};

const TASKFLOW_THEME = { accentRgb: [6, 182, 212] as [number, number, number] };

const TASK_COLUMNS: ExportColumn<Task>[] = [
  { header: 'Título', value: (task) => task.title },
  { header: 'Estado', value: (task) => STATUS_LABELS[task.status] },
  { header: 'Prioridad', value: (task) => PRIORITY_LABELS[task.priority] },
  {
    header: 'Fecha límite',
    value: (task) => (task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'),
  },
  { header: 'Descripción', value: (task) => task.description || '—' },
];

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : '';
}

export function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api
      .getTasks({ search, priority: priorityFilter })
      .then(setTasks)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar las tareas'));
  }, [search, priorityFilter]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const openCreate = (status: TaskStatus) => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, status });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: toDateInput(task.dueDate),
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
      };
      if (editing) {
        await api.updateTask(editing.id, payload);
      } else {
        await api.createTask(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar la tarea');
    } finally {
      setSaving(false);
    }
  };

  const move = async (task: Task, direction: -1 | 1) => {
    const index = TASK_STATUSES.indexOf(task.status);
    const next = TASK_STATUSES[index + direction];
    if (!next) return;
    try {
      await api.changeStatus(task.id, next);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo mover la tarea');
    }
  };

  const remove = async (task: Task) => {
    if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
    try {
      await api.deleteTask(task.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la tarea');
    }
  };

  const exportTasks = (format: 'pdf' | 'excel') => {
    if (!tasks.length) {
      setError('No hay tareas para exportar.');
      return;
    }
    const meta = {
      title: 'Reporte de tareas — TaskFlow',
      subtitle: `${tasks.length} tareas en el tablero`,
      filenameBase: `tareas-taskflow-${new Date().toISOString().slice(0, 10)}`,
    };
    if (format === 'pdf') downloadPdf(meta, TASK_COLUMNS, tasks, TASKFLOW_THEME);
    else downloadExcel(meta, TASK_COLUMNS, tasks, 'Tareas');
  };

  const now = Date.now();

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Organización</p>
          <h1>Tablero de tareas</h1>
        </div>
        <div className="header-actions">
          <ExportMenu onExport={exportTasks} disabled={!tasks.length} />
          <button type="button" className="btn btn--primary" onClick={() => openCreate('pendiente')}>
            <Plus size={16} /> Nueva tarea
          </button>
        </div>
      </header>

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="board-toolbar">
        <div className="board-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tareas…"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
          aria-label="Filtrar por prioridad"
        >
          <option value="">Todas las prioridades</option>
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>

      <div className="board">
        {TASK_STATUSES.map((status, columnIndex) => {
          const columnTasks = tasks.filter((task) => task.status === status);
          return (
            <section key={status} className={`board-column board-column--${status}`}>
              <header className="board-column__head">
                <h2>{STATUS_LABELS[status]}</h2>
                <span className="board-column__count">{columnTasks.length}</span>
              </header>

              <div className="board-column__cards">
                {columnTasks.map((task) => {
                  const overdue =
                    task.status !== 'completada' &&
                    task.dueDate &&
                    new Date(task.dueDate).getTime() < now;
                  return (
                    <article key={task.id} className="task-card">
                      <div className="task-card__top">
                        <span className={`badge priority-${task.priority}`}>
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                        <div className="task-card__actions">
                          <button type="button" onClick={() => openEdit(task)} aria-label="Editar">
                            <Pencil size={13} />
                          </button>
                          <button type="button" onClick={() => remove(task)} aria-label="Eliminar">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}

                      <div className="task-card__bottom">
                        {task.dueDate ? (
                          <span className={`task-card__due ${overdue ? 'due-overdue' : ''}`}>
                            {overdue ? <AlertTriangle size={12} /> : <CalendarClock size={12} />}
                            {new Date(task.dueDate).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        ) : (
                          <span />
                        )}
                        <div className="task-card__move">
                          <button
                            type="button"
                            disabled={columnIndex === 0}
                            onClick={() => move(task, -1)}
                            aria-label="Mover a la columna anterior"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={columnIndex === TASK_STATUSES.length - 1}
                            onClick={() => move(task, 1)}
                            aria-label="Mover a la siguiente columna"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {!columnTasks.length && <p className="board-column__empty">Sin tareas</p>}
              </div>

              <button type="button" className="board-column__add" onClick={() => openCreate(status)}>
                <Plus size={14} /> Agregar tarea
              </button>
            </section>
          );
        })}
      </div>

      {showForm && (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" role="dialog" aria-modal="true">
            <header className="modal__header">
              <h2>{editing ? 'Editar tarea' : 'Nueva tarea'}</h2>
              <button type="button" className="modal__close" onClick={() => setShowForm(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form className="modal__form" onSubmit={handleSubmit}>
              {formError && <div className="alert alert--error">{formError}</div>}

              <label>
                Título
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Preparar presentación del sprint"
                  required
                  minLength={3}
                />
              </label>

              <label>
                Descripción (opcional)
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detalles, contexto o subtareas…"
                  rows={3}
                />
              </label>

              <div className="modal__row">
                <label>
                  Estado
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Prioridad
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                  >
                    {TASK_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Fecha límite (opcional)
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </label>

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
