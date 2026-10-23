import {
  AlignLeftIcon,
  AtSignIcon,
  BanknoteIcon,
  CalendarIcon,
  CheckSquareIcon,
  ListIcon,
  CircleDotIcon,
  ClockIcon,
  CreditCardIcon,
  EyeOffIcon,
  HashIcon,
  MapPinIcon,
  PaperclipIcon,
  PhoneIcon,
  ShieldCheckIcon,
  StarIcon,
  TypeIcon,
  type LucideIcon } from
'lucide-react';
import type { FormField, FormFieldType } from '../../types/forms';
import { uid } from '../id';

export const fieldTypeInfo: Record<FormFieldType, {label: string;icon: LucideIcon;group: 'Text' | 'Choice' | 'Details' | 'Special';}> = {
  shortText: { label: 'Short text', icon: TypeIcon, group: 'Text' },
  longText: { label: 'Long text', icon: AlignLeftIcon, group: 'Text' },
  email: { label: 'Email', icon: AtSignIcon, group: 'Text' },
  phone: { label: 'Phone (+234)', icon: PhoneIcon, group: 'Text' },
  number: { label: 'Number', icon: HashIcon, group: 'Text' },
  amount: { label: '₦ amount', icon: BanknoteIcon, group: 'Text' },
  dropdown: { label: 'Dropdown', icon: ListIcon, group: 'Choice' },
  choice: { label: 'Multiple choice', icon: CircleDotIcon, group: 'Choice' },
  checkboxes: { label: 'Checkboxes', icon: CheckSquareIcon, group: 'Choice' },
  rating: { label: 'Rating', icon: StarIcon, group: 'Choice' },
  date: { label: 'Date', icon: CalendarIcon, group: 'Details' },
  time: { label: 'Time', icon: ClockIcon, group: 'Details' },
  address: { label: 'Address', icon: MapPinIcon, group: 'Details' },
  file: { label: 'File upload', icon: PaperclipIcon, group: 'Details' },
  consent: { label: 'Marketing consent', icon: ShieldCheckIcon, group: 'Special' },
  hidden: { label: 'Hidden attribution', icon: EyeOffIcon, group: 'Special' },
  payment: { label: 'Payment', icon: CreditCardIcon, group: 'Special' }
};

export const fieldGroups = ['Text', 'Choice', 'Details', 'Special'] as const;

export const choiceTypes: FormFieldType[] = ['dropdown', 'choice', 'checkboxes'];

export function makeField(type: FormFieldType, patch: Partial<FormField> = {}): FormField {
  const base: FormField = {
    id: uid('fld'),
    type,
    label: fieldTypeInfo[type].label,
    help: '',
    required: false,
    placeholder: '',
    options: choiceTypes.includes(type) ? ['Option 1', 'Option 2'] : [],
    maxLength: type === 'shortText' ? 120 : type === 'longText' ? 1000 : null,
    amountNgn: type === 'payment' ? 5000 : null,
    amountFromFieldId: null,
    hiddenSource: 'source',
    stepBreak: false,
    stepTitle: '',
    rule: null
  };
  if (type === 'consent') {
    base.label = 'Send me occasional updates and offers';
    base.help = 'Optional. You can unsubscribe at any time.';
  }
  if (type === 'payment') {
    base.label = 'Payment';
    base.required = true;
  }
  if (type === 'hidden') base.label = 'Where they came from';
  return { ...base, ...patch };
}