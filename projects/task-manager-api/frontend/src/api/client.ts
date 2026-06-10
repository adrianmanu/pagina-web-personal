// Cliente en modo demo: simula la Task Manager API (Node.js + Express + JWT)
// guardando todo en localStorage. El código real del backend está en
// projects/task-manager-api/src y puede ejecutarse localmente con npm run dev.

const TOKEN_KEY = 'taskflow_token';
const USERS_KEY = 'taskflow_demo_users';
const TASKS_KEY = 'taskflow_demo_tasks';

export const DEMO_EMAIL = 'demo@taskflow.dev';
export const DEMO_PASSWORD = 'demo1234';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function resetDemoData(): void {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';
export type TaskPriority = 'alta' | 'media' | 'baja';

export const TASK_STATUSES: TaskStatus[] = ['pendiente', 'en_progreso', 'completada'];
export const TASK_PRIORITIES: TaskPriority[] = ['alta', 'media', 'baja'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completada: 'Completada',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  overdue: number;
  completionRate: number;
}

export interface TaskFilters {
  search?: string;
  priority?: TaskPriority | '';
}

interface StoredUser extends User {
  password: string;
}

// ─── Almacenamiento ───

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 150));
}

// ─── Datos demo ───

const DEMO_USER_ID = 'demo-user';

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function seedTasks(): Task[] {
  const seed: Array<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = [
    {
      title: 'Preparar presentación del sprint',
      description: 'Resumir avances, métricas y bloqueos para la reunión con el equipo.',
      status: 'pendiente',
      priority: 'alta',
      dueDate: daysFromNow(2),
    },
    {
      title: 'Revisar pull requests pendientes',
      description: 'Dar feedback a los PR del módulo de autenticación.',
      status: 'pendiente',
      priority: 'media',
      dueDate: daysFromNow(1),
    },
    {
      title: 'Actualizar documentación de la API',
      description: 'Agregar los nuevos endpoints de estadísticas al README.',
      status: 'pendiente',
      priority: 'baja',
      dueDate: null,
    },
    {
      title: 'Corregir bug en el filtro de fechas',
      description: 'El filtro no incluye el último día del rango seleccionado.',
      status: 'pendiente',
      priority: 'alta',
      dueDate: daysFromNow(-1),
    },
    {
      title: 'Implementar exportación a CSV',
      description: 'Permitir descargar el listado de tareas en formato CSV.',
      status: 'en_progreso',
      priority: 'media',
      dueDate: daysFromNow(4),
    },
    {
      title: 'Optimizar consultas del dashboard',
      description: 'Reducir el tiempo de carga agregando índices y caché.',
      status: 'en_progreso',
      priority: 'alta',
      dueDate: daysFromNow(3),
    },
    {
      title: 'Configurar pipeline CI/CD',
      description: 'GitHub Actions con build, tests y despliegue automático.',
      status: 'completada',
      priority: 'alta',
      dueDate: daysFromNow(-5),
    },
    {
      title: 'Diseñar esquema de base de datos',
      description: 'Modelo entidad-relación para usuarios y tareas.',
      status: 'completada',
      priority: 'media',
      dueDate: daysFromNow(-8),
    },
    {
      title: 'Configurar entorno de desarrollo',
      description: 'Node.js, TypeScript, ESLint y estructura del proyecto.',
      status: 'completada',
      priority: 'baja',
      dueDate: null,
    },
  ];

  const now = Date.now();
  return seed.map((task, index) => ({
    ...task,
    id: `seed-${index}`,
    userId: DEMO_USER_ID,
    createdAt: new Date(now - (seed.length - index) * 86_400_000).toISOString(),
    updatedAt: new Date(now - (seed.length - index) * 43_200_000).toISOString(),
  }));
}

function ensureSeeded(): void {
  const users = load<StoredUser>(USERS_KEY);
  if (!users.some((user) => user.id === DEMO_USER_ID)) {
    users.push({
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      fullName: 'Usuario Demo',
      password: DEMO_PASSWORD,
    });
    save(USERS_KEY, users);
  }

  const tasks = load<Task>(TASKS_KEY);
  if (!tasks.some((task) => task.userId === DEMO_USER_ID)) {
    save(TASKS_KEY, [...tasks, ...seedTasks()]);
  }
}

// ─── Helpers de sesión ───

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user: StoredUser): User {
  return { id: user.id, email: user.email, fullName: user.fullName };
}

function currentUser(): StoredUser {
  ensureSeeded();
  const token = getToken();
  const user = load<StoredUser>(USERS_KEY).find((u) => u.id === token);
  if (!user) throw new Error('Sesión expirada. Inicia sesión nuevamente.');
  return user;
}

function userTasks(userId: string): Task[] {
  return load<Task>(TASKS_KEY)
    .filter((task) => task.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function validateTaskInput(data: TaskInput, partial = false): void {
  if (!partial || data.title !== undefined) {
    if ((data.title ?? '').trim().length < 3) {
      throw new Error('El título debe tener al menos 3 caracteres');
    }
  }
  if (data.status && !TASK_STATUSES.includes(data.status)) throw new Error('Estado inválido');
  if (data.priority && !TASK_PRIORITIES.includes(data.priority)) throw new Error('Prioridad inválida');
}

function normalizeDueDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Fecha límite inválida');
  return date.toISOString();
}

// ─── API demo (misma interfaz que el backend real) ───

export const api = {
  async register(data: { email: string; password: string; fullName: string }) {
    await delay();
    ensureSeeded();
    const email = data.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) throw new Error('Correo electrónico inválido');
    if (data.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');
    if (data.fullName.trim().length < 3) throw new Error('El nombre debe tener al menos 3 caracteres');

    const users = load<StoredUser>(USERS_KEY);
    if (users.some((user) => user.email === email)) {
      throw new Error('Ya existe una cuenta con ese correo');
    }

    const user: StoredUser = {
      id: generateId(),
      email,
      fullName: data.fullName.trim(),
      password: data.password,
    };
    save(USERS_KEY, [...users, user]);
    return { accessToken: user.id, user: publicUser(user) };
  },

  async login(email: string, password: string) {
    await delay();
    ensureSeeded();
    const user = load<StoredUser>(USERS_KEY).find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    );
    if (!user) throw new Error('Credenciales incorrectas');
    return { accessToken: user.id, user: publicUser(user) };
  },

  async me() {
    await delay();
    return publicUser(currentUser());
  },

  async getTasks(filters: TaskFilters = {}) {
    await delay();
    const user = currentUser();
    let result = userTasks(user.id);
    if (filters.priority) result = result.filter((task) => task.priority === filters.priority);
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query),
      );
    }
    return result;
  },

  async getStats(): Promise<TaskStats> {
    await delay();
    const user = currentUser();
    const all = userTasks(user.id);
    const now = Date.now();

    const byStatus = Object.fromEntries(
      TASK_STATUSES.map((status) => [status, all.filter((task) => task.status === status).length]),
    ) as Record<TaskStatus, number>;

    const overdue = all.filter(
      (task) =>
        task.status !== 'completada' && task.dueDate && new Date(task.dueDate).getTime() < now,
    ).length;

    return {
      total: all.length,
      byStatus,
      overdue,
      completionRate: all.length ? Math.round((byStatus.completada / all.length) * 100) : 0,
    };
  },

  async createTask(data: TaskInput): Promise<Task> {
    await delay();
    const user = currentUser();
    validateTaskInput(data);
    const now = new Date().toISOString();
    const task: Task = {
      id: generateId(),
      userId: user.id,
      title: (data.title ?? '').trim(),
      description: data.description?.trim() ?? '',
      status: data.status ?? 'pendiente',
      priority: data.priority ?? 'media',
      dueDate: normalizeDueDate(data.dueDate),
      createdAt: now,
      updatedAt: now,
    };
    save(TASKS_KEY, [...load<Task>(TASKS_KEY), task]);
    return task;
  },

  async updateTask(id: string, data: TaskInput): Promise<Task> {
    await delay();
    const user = currentUser();
    validateTaskInput(data, true);
    const tasks = load<Task>(TASKS_KEY);
    const index = tasks.findIndex((task) => task.id === id && task.userId === user.id);
    if (index === -1) throw new Error('Tarea no encontrada');

    const current = tasks[index];
    const updated: Task = {
      ...current,
      title: data.title !== undefined ? data.title.trim() : current.title,
      description: data.description !== undefined ? data.description.trim() : current.description,
      status: data.status ?? current.status,
      priority: data.priority ?? current.priority,
      dueDate: data.dueDate !== undefined ? normalizeDueDate(data.dueDate) : current.dueDate,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = updated;
    save(TASKS_KEY, tasks);
    return updated;
  },

  async changeStatus(id: string, status: TaskStatus): Promise<Task> {
    return api.updateTask(id, { status });
  },

  async deleteTask(id: string): Promise<void> {
    await delay();
    const user = currentUser();
    const tasks = load<Task>(TASKS_KEY);
    const remaining = tasks.filter((task) => !(task.id === id && task.userId === user.id));
    if (remaining.length === tasks.length) throw new Error('Tarea no encontrada');
    save(TASKS_KEY, remaining);
  },
};
