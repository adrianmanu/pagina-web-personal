export const API_URL = import.meta.env.VITE_API_URL ?? '';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function buildApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export async function downloadReport(path: string, filename: string): Promise<void> {
  const token = getToken();
  const response = await fetch(buildApiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const error = await response.json().catch(() => ({ detail: 'Error al exportar' }));
      throw new Error(typeof error.detail === 'string' ? error.detail : 'Error al exportar');
    }
    throw new Error(
      response.status === 404 || response.status === 405
        ? 'No se pudo exportar. Verifica que la API de Render esté configurada.'
        : `Error al exportar (${response.status})`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/html')) {
    throw new Error('La exportación devolvió HTML en lugar de datos. Revisa AUTOMATIZACION_API_URL.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      if (response.status === 404 || response.status === 405) {
        throw new Error(
          API_URL
            ? `API no responde correctamente (${response.status}). Verifica que Render esté activo.`
            : 'API no configurada. Define AUTOMATIZACION_API_URL en GitHub y vuelve a desplegar.',
        );
      }
      throw new Error(`Error de servidor (${response.status})`);
    }
    const error = await response.json().catch(() => ({ detail: 'Error de servidor' }));
    const detail = error.detail;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg : 'Error de servidor';
    throw new Error(message || 'Error de servidor');
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  register: (data: { email: string; password: string; full_name: string }) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: async (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) {
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json') && (response.status === 404 || response.status === 405)) {
        throw new Error(
          API_URL
            ? `API no responde correctamente (${response.status}). Verifica que Render esté activo.`
            : 'API no configurada. Define AUTOMATIZACION_API_URL en GitHub y vuelve a desplegar.',
        );
      }
      throw new Error('Credenciales inválidas');
    }
    return response.json();
  },

  me: () => request<{ id: number; email: string; full_name: string }>('/api/auth/me'),

  getDataSources: () => request<DataSource[]>('/api/data-sources'),
  createDataSource: (data: Partial<DataSource>) =>
    request<DataSource>('/api/data-sources', { method: 'POST', body: JSON.stringify(data) }),
  updateDataSource: (id: number, data: Partial<DataSource>) =>
    request<DataSource>(`/api/data-sources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDataSource: (id: number) =>
    request<void>(`/api/data-sources/${id}`, { method: 'DELETE' }),

  getRecords: () => request<SaleRecord[]>('/api/records'),
  createRecord: (data: Omit<SaleRecord, 'id' | 'total' | 'extracted_at'>) =>
    request<SaleRecord>('/api/records', { method: 'POST', body: JSON.stringify(data) }),
  updateRecord: (id: number, data: Partial<SaleRecord>) =>
    request<SaleRecord>(`/api/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRecord: (id: number) =>
    request<void>(`/api/records/${id}`, { method: 'DELETE' }),

  getJobs: () => request<ExtractionJob[]>('/api/jobs'),
  runJob: (data_source_id?: number) =>
    request<ExtractionJob>('/api/jobs/run', {
      method: 'POST',
      body: JSON.stringify({ data_source_id: data_source_id ?? null }),
    }),

  getSummary: () =>
    request<{ total_records: number; total_revenue: number; by_customer: CustomerSummary[] }>(
      '/api/reports/summary',
    ),
};

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
