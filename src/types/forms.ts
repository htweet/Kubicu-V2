import type { SourceId } from './analytics';

/** Forms add-on (D79). */
export type FormFieldType =
'shortText' |
'longText' |
'email' |
'phone' |
'number' |
'amount' |
'dropdown' |
'choice' |
'checkboxes' |
'date' |
'time' |
'file' |
'address' |
'rating' |
'consent' |
'hidden' |
'payment';

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
  payment: {amountNgn: number;status: 'paid' | 'test';reference: string;} | null;
  status: SubmissionStatus;
  assigneeId: string | null;
  contactName: string;
  contactEmail: string;
  marketingConsent: boolean;
  createdAt: string;
  sample?: boolean;
}

export interface FormsData {
  forms: FormDef[];
  submissions: FormSubmission[];
}