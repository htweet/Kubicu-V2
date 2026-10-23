/** Service OS (D89): quote → invoice → job for service businesses. */

export interface ServiceClient {
  name: string;
  phone: string;
  email: string;
}

export interface LineItem {
  id: string;
  label: string;
  qty: number;
  unitNgn: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined';

/** What makes a payment stage due (D95). */
export type MilestoneTrigger = 'accept' | 'step' | 'date' | 'done';

/** One payment stage the seller defines, e.g. "Trial session — 20% when the trial step is ticked". */
export interface Milestone {
  id: string;
  label: string;
  /** Whole percent of the quote total; stages add up to 100. */
  pct: number;
  trigger: MilestoneTrigger;
  /** For 'step': the job checklist step that makes it due. */
  stepLabel?: string;
  /** For 'date': YYYY-MM-DD. */
  date?: string;
  /** Set once the stage has been requested (invoiced). */
  invoiceId?: string;
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  stages: {label: string;pct: number;trigger: Exclude<MilestoneTrigger, 'date'>;stepLabel?: string;}[];
  builtIn?: boolean;
}

export interface Quote {
  id: string;
  number: string;
  title: string;
  client: ServiceClient;
  items: LineItem[];
  /** 0 = no deposit; otherwise the share invoiced first when accepted. */
  depositPct: number;
  /** When set (and non-empty), the client pays in these stages instead of deposit + balance (D95). */
  milestones?: Milestone[];
  /** YYYY-MM-DD */
  validUntil: string;
  note: string;
  status: QuoteStatus;
  createdAt: string;
  sentAt?: string;
  decidedAt?: string;
  /** Name the client typed when accepting. */
  acceptedBy?: string;
  declineReason?: string;
  invoiceIds: string[];
  jobId?: string;
  sample?: boolean;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void';
export type PaymentMethod = 'transfer' | 'cash' | 'card' | 'online';

export interface InvoicePayment {
  id: string;
  amountNgn: number;
  method: PaymentMethod;
  at: string;
  /** Online payments through the client's pay link. */
  receipt?: string;
  payerName?: string;
}

export interface Invoice {
  id: string;
  number: string;
  title: string;
  client: ServiceClient;
  items: LineItem[];
  quoteId?: string;
  /** The payment stage this invoice requests (D95). */
  milestoneId?: string;
  /** YYYY-MM-DD */
  dueDate: string;
  status: InvoiceStatus;
  payments: InvoicePayment[];
  createdAt: string;
  sample?: boolean;
}

export type JobStatus = 'scheduled' | 'in_progress' | 'waiting' | 'done';

export interface Job {
  id: string;
  title: string;
  client: ServiceClient;
  quoteId?: string;
  status: JobStatus;
  /** YYYY-MM-DD */
  dueDate: string;
  checklist: {id: string;label: string;done: boolean;}[];
  updates: {id: string;at: string;text: string;}[];
  createdAt: string;
  sample?: boolean;
}

export interface ServiceOsData {
  quotes: Quote[];
  invoices: Invoice[];
  jobs: Job[];
  counters: {quote: number;invoice: number;};
  /** The seller's own saved stage templates (built-ins live in code). */
  milestoneTemplates: MilestoneTemplate[];
  seeded: boolean;
}