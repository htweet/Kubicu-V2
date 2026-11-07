import type { SourceId } from './analytics';

/** Forms add-on (D79). */
export type FormFieldType =
  | 'shortText'
  | 'longText'
  | 'email'
  | 'phone'
  | 'number'
  | 'amount'
  | 'dropdown'
  | 'choice'
  | 'checkboxes'
  | 'date'
  | 'time'
  | 'file'
  | 'address'
  | 'rating'
  | 'consent'
  | 'hidden'
  | 'payment'
  // D193 — richer fields
  | 'name'
  | 'dateRange'
  | 'signature'
  | 'scale'
  | 'imageChoice'
  | 'products'
  // D194 — the remaining eight
  | 'section'
  | 'ranking'
  | 'grid'
  | 'website'
  | 'bookingSlot'
  | 'bank'
  | 'region'
  | 'calculated';

/** Calculated total: adds up earlier answers, then multiplies. */
export interface FormCalc {
  fieldIds: string[];
  multiplier: number;
  unit: 'ngn' | 'number';
}

/** A product offered in a Product picker field: a copy of name and price taken from Commerce when the form is saved. */
export interface FormProductPick {
  id: string;
  name: string;
  priceNgn: number;
  imageUrl: string;
  imageAlt: string;
}

export interface FormScale {
  min: 0 | 1;
  max: 5 | 10;
  minLabel: string;
  maxLabel: string;
}

export interface FieldRule {
  /** Show this field only when another field's answer matches. */
  fieldId: string;
  op: 'is' | 'isNot' | 'contains' | 'answered';
  value: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  help: string;
  required: boolean;
  placeholder: string;
  options: string[];
  maxLength: number | null;
  /** Payment field: fixed amount in ₦, or taken from an amount field. */
  amountNgn: number | null;
  amountFromFieldId: string | null;
  /** Hidden attribution field: which value to capture. */
  hiddenSource: 'source' | 'campaign' | 'page';
  /** Starts a new step before this field. */
  stepBreak: boolean;
  stepTitle: string;
  rule: FieldRule | null;
  /** Image choice: one image (data URL or address) per option, in the same order. */
  optionImages?: string[];
  /** Scale: range and the words at each end. */
  scale?: FormScale;
  /** Product picker: the products offered, and the most of each one person can pick. */
  products?: FormProductPick[];
  maxQty?: number;
  /** Grid: the answer choices across the top (rows are `options`). */
  gridColumns?: string[];
  /** Booking slot: which Bookings service's free times to offer. */
  serviceId?: string;
  calc?: FormCalc;
}

export type FormStatus = 'draft' | 'live' | 'closed';

export interface FormSettings {
  submitLabel: string;
  successTitle: string;
  successText: string;
  redirectUrl: string;
  closeAt: string | null;
  maxResponses: number | null;
  /** Minimum seconds before a submission is accepted (spam). */
  minFillSeconds: number;
  /** Per-visitor submissions allowed per day on this device. */
  perVisitorLimit: number;
  privacyNote: string;
  assigneeId: string | null;
  /** Email sent to the person who filled in the form, through the connected email provider (D195). */
  confirmation?: FormConfirmation;
}

export interface FormConfirmation {
  enabled: boolean;
  subject: string;
  /** Supports {first_name}, {name}, {form} and {answers}. */
  body: string;
}

/** What happened to the confirmation email for one response (D195). Sending is simulated. */
export interface SubmissionEmail {
  status: 'sent' | 'not_connected' | 'no_address';
  providerName?: string;
  to: string;
  subject: string;
  body: string;
  at: string;
}

export interface FormDef {
  id: string;
  name: string;
  description: string;
  status: FormStatus;
  fields: FormField[];
  settings: FormSettings;
  templateId: string | null;
  createdAt: string;
  updatedAt: string;
  sample?: boolean;
}

export type SubmissionStatus = 'new' | 'read' | 'archived';

export interface FormSubmission {
  id: string;
  formId: string;
  answers: Record<string, string | string[]>;
  source: SourceId | null;
  pageHandle: string | null;
  payment: { amountNgn: number; status: 'paid' | 'test'; reference: string } | null;
  status: SubmissionStatus;
  assigneeId: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  marketingConsent: boolean;
  createdAt: string;
  sample?: boolean;
  /** Confirmation email outcome, when the form sends one (D195). */
  email?: SubmissionEmail;
  /** Commerce order created from this response's product picks (D195). */
  orderId?: string;
  orderNumber?: number;
  /** Booking created from this response's booking time (D195). */
  bookingId?: string;
  bookingRef?: string;
}

export interface FormsData {
  forms: FormDef[];
  submissions: FormSubmission[];
}
