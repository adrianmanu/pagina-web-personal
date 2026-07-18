const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const TOKEN_KEY = 'stockflow_token';

export const DEMO_EMAIL = 'demo@stockflow.dev';
export const DEMO_PASSWORD = 'demo1234';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function resetDemoData(): void {
  clearToken();
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role?: string;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  membershipStatus?: string;
  membershipPlan?: string;
  canEmit?: boolean;
}

export interface MembershipStatus {
  plan: string;
  status: string;
  provider: string;
  canEmit: boolean;
  enforcementEnabled: boolean;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  message: string;
}

export interface MembershipBillingOption {
  periodMonths: number;
  periodDays: number;
  label: string;
  priceUsd: number;
  pricePerMonthUsd: number;
  savingsPercent: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  monthlyPriceUsd: number;
  benefits: string[];
  recommended: boolean;
  billingOptions: MembershipBillingOption[];
}

export interface CheckoutSession {
  provider: 'payphone' | 'stripe' | string;
  checkoutUrl: string | null;
  message: string;
  payphone?: {
    token: string;
    storeId: string;
    clientTransactionId: string;
    amount: number;
    amountWithoutTax: number;
    tax: number;
    currency: string;
    reference: string;
    responseUrl: string;
  } | null;
}

export interface PayPhoneConfirmResult {
  approved: boolean;
  transactionStatus: string;
  message: string;
  membership: MembershipStatus;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  inventoryValue: number;
  byCategory: { category: string; products: number; stock: number; value: number }[];
}

export interface InvoiceItem {
  id?: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: number;
  customerId?: number | null;
  finalConsumer: boolean;
  customerName: string;
  customerTaxId: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  createdAt: string;
  total: number;
  items: InvoiceItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilInvoiceId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface InvoiceInput {
  finalConsumer: boolean;
  customerId?: number;
  customerName?: string;
  customerTaxId?: string;
  customerEmail?: string;
  customerAddress?: string;
  items: { productId: number; quantity: number }[];
}

export interface Customer {
  id: number;
  name: string;
  taxId: string;
  idType: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  invoiceCount: number;
  totalInvoiced: number;
}

export interface CustomerInput {
  name: string;
  taxId: string;
  email?: string;
  address?: string;
  phone?: string;
}

export interface CreditNoteItem {
  invoiceItemId: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreditNote {
  id: number;
  invoiceId: number;
  invoiceDocumentNumber?: string | null;
  motivo: string;
  restockStock: boolean;
  createdAt: string;
  total: number;
  items: CreditNoteItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilCreditNoteId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface CreditNoteInput {
  invoiceId: number;
  motivo: string;
  restockStock: boolean;
  fullCredit: boolean;
  items?: { invoiceItemId: number; quantity: number }[];
}

export interface DebitNoteItem {
  id?: number;
  motivo: string;
  amount: number;
  subtotal: number;
}

export interface DebitNote {
  id: number;
  invoiceId: number;
  invoiceDocumentNumber?: string | null;
  createdAt: string;
  total: number;
  items: DebitNoteItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilDebitNoteId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface DebitNoteInput {
  invoiceId: number;
  items: { motivo: string; amount: number }[];
}

export interface WaybillItem {
  id?: number;
  productId?: number | null;
  productName: string;
  sku?: string | null;
  quantity: number;
}

export interface Waybill {
  id: number;
  invoiceId?: number | null;
  invoiceDocumentNumber?: string | null;
  createdAt: string;
  direccionPartida: string;
  motivoTraslado: string;
  ruta?: string | null;
  carrierName: string;
  carrierTaxId: string;
  carrierPlate: string;
  recipientName: string;
  recipientTaxId: string;
  recipientAddress: string;
  items: WaybillItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilWaybillId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface WaybillInput {
  invoiceId?: number | null;
  direccionPartida: string;
  motivoTraslado: string;
  ruta?: string;
  carrierName: string;
  carrierTaxId: string;
  carrierPlate: string;
  carrierEmail?: string;
  carrierAddress?: string;
  carrierPhone?: string;
  recipientName: string;
  recipientTaxId: string;
  recipientEmail?: string;
  recipientAddress: string;
  recipientPhone?: string;
  items: { productId?: number; description?: string; sku?: string; quantity: number }[];
}

export interface Supplier {
  id: number;
  name: string;
  taxId: string;
  idType: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  settlementCount: number;
  totalSettled: number;
}

export interface SupplierInput {
  name: string;
  taxId: string;
  email?: string;
  address?: string;
  phone?: string;
}

export interface PurchaseSettlementItem {
  id?: number;
  productId?: number | null;
  description: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseSettlement {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierTaxId: string;
  createdAt: string;
  total: number;
  items: PurchaseSettlementItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilPurchaseSettlementId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface PurchaseSettlementInput {
  supplierId: number;
  items: { productId?: number; description?: string; sku?: string; quantity: number; unitPrice: number }[];
}

export interface RetentionTaxCode {
  id: string;
  taxType: string;
  retentionCode: string;
  percentage: number;
  label: string;
}

export interface RetentionItem {
  id?: number;
  taxType: string;
  retentionCode: string;
  retentionLabel: string;
  percentage: number;
  taxableBase: number;
  retainedAmount: number;
}

export interface Retention {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierTaxId: string;
  receivedDocumentId?: number | null;
  receivedDocumentNumber?: string | null;
  createdAt: string;
  supportDocumentNumber: string;
  supportDocumentType: string;
  supportDocumentDate: string;
  periodoFiscal: string;
  totalRetained: number;
  items: RetentionItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilRetentionId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface RetentionInput {
  supplierId: number;
  receivedDocumentId?: number;
  supportDocumentNumber?: string;
  supportDocumentType?: string;
  supportDocumentDate?: string;
  items: { retentionCodeId: string; taxableBase: number }[];
}

export interface SustentoCode {
  code: string;
  label: string;
  category: string;
}

export interface ReceivedDocument {
  id: number;
  supplierId?: number | null;
  supplierName?: string | null;
  source: string;
  documentType: string;
  documentNumber: string;
  accessKey?: string | null;
  authorizationNumber?: string | null;
  issueDate: string;
  issuerName: string;
  issuerTaxId: string;
  subtotal?: number | null;
  iva?: number | null;
  total?: number | null;
  sustentoCode: string;
  sustentoLabel: string;
  sustentoCategory?: string | null;
  notes?: string | null;
  createdAt: string;
  hasXml: boolean;
}

export interface ReceivedDocumentInput {
  supplierId?: number;
  documentType: string;
  documentNumber: string;
  accessKey?: string;
  authorizationNumber?: string;
  issueDate: string;
  issuerName: string;
  issuerTaxId: string;
  subtotal?: number;
  iva?: number;
  total?: number;
  sustentoCode: string;
  notes?: string;
}

export interface ReceivedDocumentUploadInput {
  xml: string;
  sustentoCode?: string;
  notes?: string;
}

export interface AtsTotals {
  subtotal: number;
  iva: number;
  total: number;
  documentCount: number;
}

export interface AtsLine {
  section: string;
  documentType: string;
  documentNumber: string;
  partyName: string;
  partyTaxId: string;
  issueDate: string;
  sriStatus?: string | null;
  subtotal: number;
  iva: number;
  total: number;
  sustentoCode?: string | null;
  notes?: string | null;
}

export interface AtsValidation {
  level: string;
  message: string;
}

export interface AtsPreview {
  year: number;
  month: number;
  periodLabel: string;
  informantRuc: string;
  informantName: string;
  establishmentCode: string;
  totalVentas: number;
  purchases: AtsTotals;
  salesManual: AtsTotals;
  salesElectronic: AtsTotals;
  creditNotes: AtsTotals;
  retentionsIssued: AtsTotals;
  purchaseLines: AtsLine[];
  saleManualLines: AtsLine[];
  saleElectronicLines: AtsLine[];
  creditNoteLines: AtsLine[];
  retentionLines: AtsLine[];
  validations: AtsValidation[];
  readyToExport: boolean;
  exportFileName: string;
}

export interface ManualSaleInput {
  documentType: string;
  documentNumber: string;
  issueDate: string;
  customerName: string;
  customerTaxId: string;
  customerIdType?: string;
  subtotal?: number;
  iva?: number;
  total: number;
  notes?: string;
}

export interface ManualSaleDocument {
  id: number;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  customerName: string;
  customerTaxId: string;
  customerIdType: string;
  subtotal?: number | null;
  iva?: number | null;
  total?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface BusinessProfile {
  id: number;
  businessName: string;
  ruc: string;
  razonSocial: string;
  direccion?: string | null;
  emailNotificaciones?: string | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

export interface BusinessProfileInput {
  businessName: string;
  ruc: string;
  razonSocial: string;
  direccion?: string;
  emailNotificaciones?: string;
}

export interface EmissionPoint {
  id: number;
  establishmentCode: string;
  emissionPointCode: string;
  label: string;
  address?: string | null;
  defaultPoint: boolean;
}

export interface EmissionPointInput {
  establishmentCode: string;
  emissionPointCode: string;
  label: string;
  address?: string;
  defaultPoint?: boolean;
}

export interface ProformaItem {
  id?: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Proforma {
  id: number;
  status: string;
  createdAt: string;
  finalConsumer: boolean;
  customerName: string;
  customerTaxId?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  total: number;
  convertedInvoiceId?: number | null;
  notes?: string | null;
  items: ProformaItem[];
}

export interface ProformaInput {
  finalConsumer: boolean;
  customerId?: number;
  customerName?: string;
  customerTaxId?: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  items: { productId: number; quantity: number }[];
}

export interface SalesSummary {
  totalInvoices: number;
  itemsSold: number;
  totalRevenue: number;
}

export interface SriConfig {
  enabled: boolean;
  configured: boolean;
  provider?: string;
  ambiente: number;
  ruc: string;
  razonSocial: string;
  establecimientoCodigo: string;
  puntoEmision: string;
  agenteRetencion?: boolean;
  agenteRetencionResolucion?: string | null;
}

export interface SriCertificateStatus {
  valid: boolean;
  hasCertificate: boolean;
  ruc?: string | null;
  legalName?: string | null;
  expiresAt?: string | null;
  daysUntilExpiry?: number | null;
}

export interface SriCertificateUpload {
  hasCertificate: boolean;
  ruc?: string | null;
  legalName?: string | null;
  expiresAt?: string | null;
  created: boolean;
  message: string;
}

export interface SriConnectionVerify {
  ok: boolean;
  provider: string;
  ambiente: number;
  ruc: string;
  apiConfigured: boolean;
  hasCertificate: boolean;
  certificateValid: boolean;
  message: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail ?? data?.message ?? data?.error ?? `Error ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

function mapInvoice(raw: Invoice): Invoice {
  return {
    ...raw,
    items: raw.items.map((item) => ({
      ...item,
      subtotal: item.subtotal ?? item.unitPrice * item.quantity,
    })),
  };
}

function mapCreditNote(raw: CreditNote): CreditNote {
  return {
    ...raw,
    items: raw.items.map((item) => ({
      ...item,
      subtotal: item.subtotal ?? item.unitPrice * item.quantity,
    })),
  };
}

function mapDebitNote(raw: DebitNote): DebitNote {
  return {
    ...raw,
    items: raw.items.map((item) => ({
      ...item,
      subtotal: item.subtotal ?? item.amount,
    })),
  };
}

export const api = {
  async register(data: { email: string; password: string; fullName: string }) {
    return request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(email: string, password: string) {
    const result = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, result.accessToken);
    return result;
  },

  async me() {
    return request<User>('/api/auth/me');
  },

  async getProducts() {
    return request<Product[]>('/api/products');
  },

  async getSummary() {
    return request<InventorySummary>('/api/products/summary');
  },

  async createProduct(data: ProductInput) {
    return request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateProduct(id: number, data: ProductInput) {
    return request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async deleteProduct(id: number) {
    await request<void>(`/api/products/${id}`, { method: 'DELETE' });
  },

  async addStock(id: number, quantity: number) {
    return request<Product>(`/api/products/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  },

  async getInvoices() {
    const invoices = await request<Invoice[]>('/api/invoices');
    return invoices.map(mapInvoice);
  },

  async getSalesSummary() {
    return request<SalesSummary>('/api/invoices/summary');
  },

  async getSriConfig() {
    return request<SriConfig>('/api/invoices/sri/config');
  },

  async getSriConnectionConfig() {
    return request<SriConfig>('/api/settings/sri/config');
  },

  async getSriCertificateStatus() {
    return request<SriCertificateStatus>('/api/settings/sri/certificate/status');
  },

  async uploadSriCertificate(file: File, password: string) {
    const form = new FormData();
    form.append('file', file);
    form.append('password', password);
    return request<SriCertificateUpload>('/api/settings/sri/certificate', {
      method: 'POST',
      body: form,
    });
  },

  async verifySriConnection() {
    return request<SriConnectionVerify>('/api/settings/sri/verify', { method: 'POST' });
  },

  async createInvoice(data: InvoiceInput) {
    const invoice = await request<Invoice>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapInvoice(invoice);
  },

  async refreshInvoiceSri(id: number) {
    const invoice = await request<Invoice>(`/api/invoices/${id}/sri/refresh`, { method: 'POST' });
    return mapInvoice(invoice);
  },

  async reissueInvoiceSri(id: number) {
    const invoice = await request<Invoice>(`/api/invoices/${id}/sri/reissue`, { method: 'POST' });
    return mapInvoice(invoice);
  },

  async getCustomers() {
    return request<Customer[]>('/api/customers');
  },

  async searchCustomers(query: string) {
    return request<Customer[]>(`/api/customers?q=${encodeURIComponent(query)}`);
  },

  async getCustomer(id: number) {
    return request<Customer>(`/api/customers/${id}`);
  },

  async getCustomerInvoices(id: number) {
    const invoices = await request<Invoice[]>(`/api/customers/${id}/invoices`);
    return invoices.map(mapInvoice);
  },

  async createCustomer(data: CustomerInput) {
    return request<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateCustomer(id: number, data: CustomerInput) {
    return request<Customer>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async deleteCustomer(id: number) {
    await request<void>(`/api/customers/${id}`, { method: 'DELETE' });
  },

  async getCreditNotes() {
    const notes = await request<CreditNote[]>('/api/credit-notes');
    return notes.map(mapCreditNote);
  },

  async createCreditNote(data: CreditNoteInput) {
    const note = await request<CreditNote>('/api/credit-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapCreditNote(note);
  },

  async refreshCreditNoteSri(id: number) {
    const note = await request<CreditNote>(`/api/credit-notes/${id}/sri/refresh`, { method: 'POST' });
    return mapCreditNote(note);
  },

  async getDebitNotes() {
    const notes = await request<DebitNote[]>('/api/debit-notes');
    return notes.map(mapDebitNote);
  },

  async createDebitNote(data: DebitNoteInput) {
    const note = await request<DebitNote>('/api/debit-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapDebitNote(note);
  },

  async refreshDebitNoteSri(id: number) {
    const note = await request<DebitNote>(`/api/debit-notes/${id}/sri/refresh`, { method: 'POST' });
    return mapDebitNote(note);
  },

  async reissueDebitNoteSri(id: number) {
    const note = await request<DebitNote>(`/api/debit-notes/${id}/sri/reissue`, { method: 'POST' });
    return mapDebitNote(note);
  },

  async getWaybills() {
    return request<Waybill[]>('/api/waybills');
  },

  async createWaybill(data: WaybillInput) {
    return request<Waybill>('/api/waybills', { method: 'POST', body: JSON.stringify(data) });
  },

  async refreshWaybillSri(id: number) {
    return request<Waybill>(`/api/waybills/${id}/sri/refresh`, { method: 'POST' });
  },

  async reissueWaybillSri(id: number) {
    return request<Waybill>(`/api/waybills/${id}/sri/reissue`, { method: 'POST' });
  },

  async getSuppliers() {
    return request<Supplier[]>('/api/suppliers');
  },

  async searchSuppliers(query: string) {
    return request<Supplier[]>(`/api/suppliers?q=${encodeURIComponent(query)}`);
  },

  async getSupplier(id: number) {
    return request<Supplier>(`/api/suppliers/${id}`);
  },

  async createSupplier(data: SupplierInput) {
    return request<Supplier>('/api/suppliers', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateSupplier(id: number, data: SupplierInput) {
    return request<Supplier>(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async deleteSupplier(id: number) {
    await request<void>(`/api/suppliers/${id}`, { method: 'DELETE' });
  },

  async getPurchaseSettlements() {
    return request<PurchaseSettlement[]>('/api/purchase-settlements');
  },

  async createPurchaseSettlement(data: PurchaseSettlementInput) {
    return request<PurchaseSettlement>('/api/purchase-settlements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async refreshPurchaseSettlementSri(id: number) {
    return request<PurchaseSettlement>(`/api/purchase-settlements/${id}/sri/refresh`, { method: 'POST' });
  },

  async reissuePurchaseSettlementSri(id: number) {
    return request<PurchaseSettlement>(`/api/purchase-settlements/${id}/sri/reissue`, { method: 'POST' });
  },

  async getRetentionTaxCodes() {
    return request<RetentionTaxCode[]>('/api/retentions/tax-codes');
  },

  async getRetentions() {
    return request<Retention[]>('/api/retentions');
  },

  async createRetention(data: RetentionInput) {
    return request<Retention>('/api/retentions', { method: 'POST', body: JSON.stringify(data) });
  },

  async refreshRetentionSri(id: number) {
    return request<Retention>(`/api/retentions/${id}/sri/refresh`, { method: 'POST' });
  },

  async reissueRetentionSri(id: number) {
    return request<Retention>(`/api/retentions/${id}/sri/reissue`, { method: 'POST' });
  },

  async getSustentoCodes() {
    return request<SustentoCode[]>('/api/received-documents/sustento-codes');
  },

  async getReceivedDocuments(params?: {
    q?: string;
    documentType?: string;
    issuerTaxId?: string;
    from?: string;
    to?: string;
  }) {
    const search = new URLSearchParams();
    if (params?.q) search.set('q', params.q);
    if (params?.documentType) search.set('documentType', params.documentType);
    if (params?.issuerTaxId) search.set('issuerTaxId', params.issuerTaxId);
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    const query = search.toString();
    return request<ReceivedDocument[]>(`/api/received-documents${query ? `?${query}` : ''}`);
  },

  async createReceivedDocument(data: ReceivedDocumentInput) {
    return request<ReceivedDocument>('/api/received-documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async uploadReceivedDocumentXml(data: ReceivedDocumentUploadInput) {
    return request<ReceivedDocument>('/api/received-documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteReceivedDocument(id: number) {
    return request<void>(`/api/received-documents/${id}`, { method: 'DELETE' });
  },

  async getAtsPreview(year: number, month: number) {
    return request<AtsPreview>(`/api/ats/preview?year=${year}&month=${month}`);
  },

  async exportAts(year: number, month: number) {
    const token = getToken();
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${API_BASE}/api/ats/export?year=${year}&month=${month}`, { headers });
    if (!response.ok) {
      const text = await response.text();
      let message = `Error ${response.status}`;
      try {
        const data = JSON.parse(text);
        message = data.detail ?? data.message ?? message;
      } catch {
        if (text) message = text;
      }
      throw new Error(message);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const filename = match?.[1] ?? `AT${String(month).padStart(2, '0')}${year}.zip`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  },

  async getManualSales() {
    return request<ManualSaleDocument[]>('/api/ats/manual-sales');
  },

  async createManualSale(data: ManualSaleInput) {
    return request<ManualSaleDocument>('/api/ats/manual-sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteManualSale(id: number) {
    return request<void>(`/api/ats/manual-sales/${id}`, { method: 'DELETE' });
  },

  async getBusinessProfile() {
    return request<BusinessProfile>('/api/settings/business');
  },

  async saveBusinessProfile(data: BusinessProfileInput) {
    return request<BusinessProfile>('/api/settings/business', { method: 'PUT', body: JSON.stringify(data) });
  },

  async completeOnboarding() {
    return request<BusinessProfile>('/api/settings/onboarding/complete', { method: 'POST' });
  },

  async advanceOnboardingStep(step: number) {
    return request<BusinessProfile>('/api/settings/onboarding/step', {
      method: 'POST',
      body: JSON.stringify({ step }),
    });
  },

  async getEmissionPoints() {
    return request<EmissionPoint[]>('/api/settings/emission-points');
  },

  async createEmissionPoint(data: EmissionPointInput) {
    return request<EmissionPoint>('/api/settings/emission-points', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteEmissionPoint(id: number) {
    return request<void>(`/api/settings/emission-points/${id}`, { method: 'DELETE' });
  },

  async getProformas() {
    return request<Proforma[]>('/api/proformas');
  },

  async createProforma(data: ProformaInput) {
    return request<Proforma>('/api/proformas', { method: 'POST', body: JSON.stringify(data) });
  },

  async convertProforma(id: number) {
    return request<Proforma>(`/api/proformas/${id}/convert`, { method: 'POST' });
  },

  async deleteProforma(id: number) {
    return request<void>(`/api/proformas/${id}`, { method: 'DELETE' });
  },

  async getMembershipStatus() {
    return request<MembershipStatus>('/api/membership/status');
  },

  async getMembershipPlans() {
    return request<MembershipPlan[]>('/api/membership/plans');
  },

  async startMembershipCheckout(plan: 'STARTER' | 'PRO', periodMonths = 1) {
    return request<CheckoutSession>('/api/membership/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan, periodMonths }),
    });
  },

  async confirmPayPhonePayment(id: number, clientTxId: string) {
    return request<PayPhoneConfirmResult>('/api/membership/confirm', {
      method: 'POST',
      body: JSON.stringify({ id, clientTxId }),
    });
  },

  async getMembershipBillingProvider() {
    return request<{ provider: string; paymentsEnabled: boolean }>('/api/membership/billing-provider');
  },
};
