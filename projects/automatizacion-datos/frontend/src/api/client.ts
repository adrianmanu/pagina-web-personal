// Cliente en modo demo: simula la API de automatización de datos (FastAPI + JWT)
// guardando todo en localStorage. El código real del backend está en
// projects/automatizacion-datos/backend (Python, FastAPI, SQLAlchemy).

const TOKEN_KEY = 'dataflow_token';
const USERS_KEY = 'dataflow_demo_users';
const SOURCES_KEY = 'dataflow_demo_sources';
const RECORDS_KEY = 'dataflow_demo_records';
const JOBS_KEY = 'dataflow_demo_jobs';
const COUNTER_KEY = 'dataflow_demo_counter';

export const DEMO_EMAIL = 'demo@dataflow.dev';
export const DEMO_PASSWORD = 'demo1234';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function resetDemoData(): void {
  [USERS_KEY, SOURCES_KEY, RECORDS_KEY, JOBS_KEY, COUNTER_KEY, TOKEN_KEY].forEach((key) =>
    localStorage.removeItem(key),
  );
}

export interface DataSource {
  id: number;
  name: string;
  api_url: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface SaleRecord {
  id: number;
  external_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  customer: string;
  total: number;
  extracted_at: string;
}

export interface ExtractionJob {
  id: number;
  data_source_id: number | null;
  status: string;
  records_extracted: number;
  message: string;
  started_at: string;
  finished_at: string | null;
}

export interface CustomerSummary {
  customer: string;
  total_orders: number;
  total_sales: number;
}

interface StoredUser {
  id: number;
  email: string;
  full_name: string;
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

function nextId(): number {
  const current = Number(localStorage.getItem(COUNTER_KEY) ?? '1000') + 1;
  localStorage.setItem(COUNTER_KEY, String(current));
  return current;
}

function delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Datos demo ───

function daysAgo(days: number, hours = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

const SEED_SOURCES: DataSource[] = [
  {
    id: 1,
    name: 'JSONPlaceholder (demo pública)',
    api_url: 'https://jsonplaceholder.typicode.com/posts',
    description: 'API pública de ejemplo para extracción de datos',
    is_active: true,
    created_at: daysAgo(12),
  },
  {
    id: 2,
    name: 'API Ventas Sucursal Norte',
    api_url: 'https://api.empresa.com/ventas/norte',
    description: 'Sistema de punto de venta de la sucursal norte',
    is_active: true,
    created_at: daysAgo(8),
  },
];

const PRODUCT_POOL = [
  { name: 'Plan Cloud Básico', price: 29 },
  { name: 'Plan Cloud Pro', price: 89 },
  { name: 'Licencia Analytics', price: 149 },
  { name: 'Soporte Premium', price: 199 },
  { name: 'Módulo Reportes', price: 59 },
  { name: 'Integración API', price: 120 },
  { name: 'Almacenamiento extra 1TB', price: 45 },
];

const CUSTOMER_POOL = [
  'Comercial Andina S.A.',
  'TechNova Solutions',
  'Distribuidora El Sol',
  'Grupo Meridiano',
  'Logística Pacífico',
  'Servicios Delta',
];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function makeRecord(id: number, extractedAt: string): SaleRecord {
  const product = PRODUCT_POOL[randomInt(PRODUCT_POOL.length)];
  const quantity = 1 + randomInt(8);
  return {
    id,
    external_id: 10_000 + id,
    product_name: product.name,
    quantity,
    unit_price: product.price,
    customer: CUSTOMER_POOL[randomInt(CUSTOMER_POOL.length)],
    total: Number((quantity * product.price).toFixed(2)),
    extracted_at: extractedAt,
  };
}

function ensureSeeded(): void {
  const users = load<StoredUser>(USERS_KEY);
  if (!users.some((user) => user.email === DEMO_EMAIL)) {
    users.push({ id: 1, email: DEMO_EMAIL, full_name: 'Usuario Demo', password: DEMO_PASSWORD });
    save(USERS_KEY, users);
  }
  if (!localStorage.getItem(SOURCES_KEY)) {
    save(SOURCES_KEY, SEED_SOURCES);
  }
  if (!localStorage.getItem(RECORDS_KEY)) {
    const records: SaleRecord[] = [];
    for (let i = 0; i < 14; i += 1) {
      records.push(makeRecord(100 + i, daysAgo(randomInt(10), randomInt(20))));
    }
    save(RECORDS_KEY, records);
  }
  if (!localStorage.getItem(JOBS_KEY)) {
    save(JOBS_KEY, [
      {
        id: 51,
        data_source_id: 1,
        status: 'completed',
        records_extracted: 8,
        message: 'Extracción completada correctamente',
        started_at: daysAgo(5),
        finished_at: daysAgo(5),
      },
      {
        id: 52,
        data_source_id: 2,
        status: 'completed',
        records_extracted: 6,
        message: 'Extracción completada correctamente',
        started_at: daysAgo(2),
        finished_at: daysAgo(2),
      },
    ] satisfies ExtractionJob[]);
  }
}

// ─── Helpers ───

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireSession(): StoredUser {
  ensureSeeded();
  const token = getToken();
  const user = load<StoredUser>(USERS_KEY).find((u) => String(u.id) === token);
  if (!user) throw new Error('Sesión expirada. Inicia sesión nuevamente.');
  return user;
}

function publicUser(user: StoredUser) {
  return { id: user.id, email: user.email, full_name: user.full_name };
}

function allRecords(): SaleRecord[] {
  return load<SaleRecord>(RECORDS_KEY).sort(
    (a, b) => new Date(b.extracted_at).getTime() - new Date(a.extracted_at).getTime(),
  );
}

// ─── API demo (misma interfaz que el backend FastAPI) ───

export const api = {
  async register(data: { email: string; password: string; full_name: string }) {
    await delay();
    ensureSeeded();
    const email = data.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) throw new Error('Correo electrónico inválido');
    if (data.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
    if (data.full_name.trim().length < 2) throw new Error('El nombre es obligatorio');

    const users = load<StoredUser>(USERS_KEY);
    if (users.some((user) => user.email === email)) {
      throw new Error('Ya existe una cuenta con ese correo');
    }
    const user: StoredUser = {
      id: nextId(),
      email,
      full_name: data.full_name.trim(),
      password: data.password,
    };
    save(USERS_KEY, [...users, user]);
    return publicUser(user);
  },

  async login(email: string, password: string) {
    await delay();
    ensureSeeded();
    const user = load<StoredUser>(USERS_KEY).find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    );
    if (!user) throw new Error('Credenciales inválidas');
    localStorage.setItem(TOKEN_KEY, String(user.id));
    return { access_token: String(user.id), token_type: 'bearer', user: publicUser(user) };
  },

  async me() {
    await delay();
    return publicUser(requireSession());
  },

  async getDataSources() {
    await delay();
    requireSession();
    return load<DataSource>(SOURCES_KEY);
  },

  async createDataSource(data: Partial<DataSource>): Promise<DataSource> {
    await delay();
    requireSession();
    if (!data.name?.trim()) throw new Error('El nombre es obligatorio');
    if (!data.api_url?.trim()) throw new Error('La URL de la API es obligatoria');
    const source: DataSource = {
      id: nextId(),
      name: data.name.trim(),
      api_url: data.api_url.trim(),
      description: data.description?.trim() ?? '',
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    save(SOURCES_KEY, [...load<DataSource>(SOURCES_KEY), source]);
    return source;
  },

  async updateDataSource(id: number, data: Partial<DataSource>): Promise<DataSource> {
    await delay();
    requireSession();
    const sources = load<DataSource>(SOURCES_KEY);
    const index = sources.findIndex((source) => source.id === id);
    if (index === -1) throw new Error('Fuente de datos no encontrada');
    const updated: DataSource = {
      ...sources[index],
      ...data,
      id,
      name: data.name?.trim() ?? sources[index].name,
      api_url: data.api_url?.trim() ?? sources[index].api_url,
    };
    sources[index] = updated;
    save(SOURCES_KEY, sources);
    return updated;
  },

  async deleteDataSource(id: number): Promise<void> {
    await delay();
    requireSession();
    const sources = load<DataSource>(SOURCES_KEY);
    const remaining = sources.filter((source) => source.id !== id);
    if (remaining.length === sources.length) throw new Error('Fuente de datos no encontrada');
    save(SOURCES_KEY, remaining);
  },

  async getRecords() {
    await delay();
    requireSession();
    return allRecords();
  },

  async createRecord(data: Omit<SaleRecord, 'id' | 'total' | 'extracted_at'>): Promise<SaleRecord> {
    await delay();
    requireSession();
    if (!data.product_name?.trim()) throw new Error('El producto es obligatorio');
    if (data.quantity <= 0) throw new Error('La cantidad debe ser mayor a cero');
    if (data.unit_price < 0) throw new Error('El precio no puede ser negativo');
    const record: SaleRecord = {
      ...data,
      id: nextId(),
      product_name: data.product_name.trim(),
      customer: data.customer.trim(),
      total: Number((data.quantity * data.unit_price).toFixed(2)),
      extracted_at: new Date().toISOString(),
    };
    save(RECORDS_KEY, [...load<SaleRecord>(RECORDS_KEY), record]);
    return record;
  },

  async updateRecord(id: number, data: Partial<SaleRecord>): Promise<SaleRecord> {
    await delay();
    requireSession();
    const records = load<SaleRecord>(RECORDS_KEY);
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) throw new Error('Registro no encontrado');
    const merged = { ...records[index], ...data, id };
    merged.total = Number((merged.quantity * merged.unit_price).toFixed(2));
    records[index] = merged;
    save(RECORDS_KEY, records);
    return merged;
  },

  async deleteRecord(id: number): Promise<void> {
    await delay();
    requireSession();
    const records = load<SaleRecord>(RECORDS_KEY);
    const remaining = records.filter((record) => record.id !== id);
    if (remaining.length === records.length) throw new Error('Registro no encontrado');
    save(RECORDS_KEY, remaining);
  },

  async getJobs() {
    await delay();
    requireSession();
    return load<ExtractionJob>(JOBS_KEY).sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );
  },

  async runJob(data_source_id?: number): Promise<ExtractionJob> {
    requireSession();
    // Simula el tiempo de ejecución del pipeline ETL
    await delay(900);

    const extracted = 4 + randomInt(6);
    const startedAt = new Date().toISOString();
    const records = load<SaleRecord>(RECORDS_KEY);
    for (let i = 0; i < extracted; i += 1) {
      records.push(makeRecord(nextId(), new Date().toISOString()));
    }
    save(RECORDS_KEY, records);

    const job: ExtractionJob = {
      id: nextId(),
      data_source_id: data_source_id ?? null,
      status: 'completed',
      records_extracted: extracted,
      message: 'Extracción completada correctamente',
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    };
    save(JOBS_KEY, [...load<ExtractionJob>(JOBS_KEY), job]);
    return job;
  },

  async getSummary() {
    await delay();
    requireSession();
    const records = allRecords();
    const byCustomerMap = new Map<string, { total_orders: number; total_sales: number }>();
    for (const record of records) {
      const entry = byCustomerMap.get(record.customer) ?? { total_orders: 0, total_sales: 0 };
      entry.total_orders += 1;
      entry.total_sales += record.total;
      byCustomerMap.set(record.customer, entry);
    }
    return {
      total_records: records.length,
      total_revenue: Number(records.reduce((sum, r) => sum + r.total, 0).toFixed(2)),
      by_customer: [...byCustomerMap.entries()]
        .map(([customer, data]) => ({
          customer,
          total_orders: data.total_orders,
          total_sales: Number(data.total_sales.toFixed(2)),
        }))
        .sort((a, b) => b.total_sales - a.total_sales),
    };
  },
};
