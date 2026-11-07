import {
  AlignLeftIcon,
  AtSignIcon,
  BanknoteIcon,
  CalendarIcon,
  CalendarRangeIcon,
  CheckSquareIcon,
  ListIcon,
  CircleDotIcon,
  ClockIcon,
  CreditCardIcon,
  EyeOffIcon,
  GaugeIcon,
  HashIcon,
  ImageIcon,
  MapPinIcon,
  PaperclipIcon,
  PenLineIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  StarIcon,
  TypeIcon,
  UserIcon,
  HeadingIcon,
  ListOrderedIcon,
  Grid3x3Icon,
  LinkIcon,
  CalendarClockIcon,
  LandmarkIcon,
  GlobeIcon,
  CalculatorIcon,
  type LucideIcon,
} from 'lucide-react';
import type { FormField, FormFieldType } from '../../types/forms';
import { uid } from '../id';

export const fieldTypeInfo: Record<FormFieldType, { label: string; icon: LucideIcon; group: 'Layout' | 'Text' | 'Choice' | 'Details' | 'Special' }> = {
  section: { label: 'Heading & text', icon: HeadingIcon, group: 'Layout' },
  name: { label: 'Name', icon: UserIcon, group: 'Text' },
  website: { label: 'Website or @handle', icon: LinkIcon, group: 'Text' },
  shortText: { label: 'Short text', icon: TypeIcon, group: 'Text' },
  longText: { label: 'Long text', icon: AlignLeftIcon, group: 'Text' },
  email: { label: 'Email', icon: AtSignIcon, group: 'Text' },
  phone: { label: 'Phone (+234)', icon: PhoneIcon, group: 'Text' },
  number: { label: 'Number', icon: HashIcon, group: 'Text' },
  amount: { label: '₦ amount', icon: BanknoteIcon, group: 'Text' },
  dropdown: { label: 'Dropdown', icon: ListIcon, group: 'Choice' },
  choice: { label: 'Multiple choice', icon: CircleDotIcon, group: 'Choice' },
  checkboxes: { label: 'Checkboxes', icon: CheckSquareIcon, group: 'Choice' },
  imageChoice: { label: 'Image choice', icon: ImageIcon, group: 'Choice' },
  rating: { label: 'Rating', icon: StarIcon, group: 'Choice' },
  scale: { label: 'Scale (0–10)', icon: GaugeIcon, group: 'Choice' },
  ranking: { label: 'Ranking', icon: ListOrderedIcon, group: 'Choice' },
  grid: { label: 'Grid', icon: Grid3x3Icon, group: 'Choice' },
  date: { label: 'Date', icon: CalendarIcon, group: 'Details' },
  dateRange: { label: 'Date range', icon: CalendarRangeIcon, group: 'Details' },
  time: { label: 'Time', icon: ClockIcon, group: 'Details' },
  address: { label: 'Address', icon: MapPinIcon, group: 'Details' },
  region: { label: 'Country & state', icon: GlobeIcon, group: 'Details' },
  bookingSlot: { label: 'Booking time', icon: CalendarClockIcon, group: 'Details' },
  file: { label: 'File upload', icon: PaperclipIcon, group: 'Details' },
  signature: { label: 'Signature', icon: PenLineIcon, group: 'Details' },
  products: { label: 'Product picker', icon: ShoppingBagIcon, group: 'Special' },
  calculated: { label: 'Calculated total', icon: CalculatorIcon, group: 'Special' },
  bank: { label: 'Bank details', icon: LandmarkIcon, group: 'Special' },
  consent: { label: 'Marketing consent', icon: ShieldCheckIcon, group: 'Special' },
  hidden: { label: 'Hidden attribution', icon: EyeOffIcon, group: 'Special' },
  payment: { label: 'Payment', icon: CreditCardIcon, group: 'Special' },
};

export const fieldGroups = ['Layout', 'Text', 'Choice', 'Details', 'Special'] as const;

/** Fields with a list of options typed one per line (Grid uses them as rows). */
export const listOptionTypes: FormFieldType[] = ['dropdown', 'choice', 'checkboxes', 'ranking', 'grid'];

/** Fields that hold no answer. */
export const displayOnlyTypes: FormFieldType[] = ['section'];

/** Answers that can feed a Calculated total or a Payment amount. */
export const numericTypes: FormFieldType[] = ['number', 'amount', 'products', 'scale', 'rating', 'calculated'];

/** Fields whose answer is one of a fixed list of options (rules can match an option). */
export const choiceTypes: FormFieldType[] = ['dropdown', 'choice', 'checkboxes', 'imageChoice'];

export const IMAGE_CHOICE_MAX = 12;
export const PRODUCT_PICK_MAX = 12;

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
    rule: null,
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
  if (type === 'name') base.label = 'Your name';
  if (type === 'dateRange') base.label = 'Which dates?';
  if (type === 'signature') {
    base.label = 'Signature';
    base.help = 'Draw with your finger or mouse, or type your full name.';
  }
  if (type === 'scale') {
    base.label = 'How likely are you to recommend us to a friend?';
    base.scale = { min: 0, max: 10, minLabel: 'Not likely', maxLabel: 'Very likely' };
  }
  if (type === 'imageChoice') {
    base.label = 'Which one do you like?';
    base.options = ['Option 1', 'Option 2', 'Option 3'];
    base.optionImages = ['', '', ''];
  }
  if (type === 'products') {
    base.label = 'What would you like?';
    base.products = [];
    base.maxQty = 10;
  }
  if (type === 'section') {
    base.label = 'About your order';
    base.help = 'A few details so we can get it right.';
  }
  if (type === 'website') base.label = 'Your website or Instagram';
  if (type === 'ranking') {
    base.label = 'Put these in order of importance';
    base.options = ['Price', 'Delivery speed', 'Quality'];
  }
  if (type === 'grid') {
    base.label = 'How did we do?';
    base.options = ['Quality', 'Delivery', 'Communication'];
    base.gridColumns = ['Poor', 'OK', 'Good', 'Great'];
  }
  if (type === 'region') base.label = 'Where are you?';
  if (type === 'bookingSlot') {
    base.label = 'Preferred time';
    base.help = 'We’ll confirm the time with you — choosing one doesn’t book it yet.';
  }
  if (type === 'bank') {
    base.label = 'Bank account for your refund';
    base.help = 'Only used for this request. We never ask for your PIN or card details.';
  }
  if (type === 'calculated') {
    base.label = 'Estimated total';
    base.calc = { fieldIds: [], multiplier: 1, unit: 'ngn' };
  }
  return { ...base, ...patch };
}
