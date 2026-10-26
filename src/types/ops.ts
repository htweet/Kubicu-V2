import type { OpeningHours } from './page';

export type ServiceLocation = 'studio' | 'online' | 'customer';

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  priceNgn: number | null;
  /** Null = no deposit; full price is paid at the appointment. */
  depositNgn: number | null;
  /** D95: ask for the rest online before the appointment instead of at it. */
  balanceOnline?: boolean;
  /** Hours before the start the online balance is due. */
  balanceHoursBefore?: number;
  location: ServiceLocation;
  locationNote: string;
  bufferMin: number;
  active: boolean;
  sample?: boolean;
  /** Team members who do this service (D140). Empty or missing = anyone bookable. */
  staffIds?: string[];
  /** Group class (D198): seats per time. Missing or 1 = one-to-one. */
  capacity?: number;
}

export interface TimeOff {
  id: string;
  /** YYYY-MM-DD, inclusive, business time zone. */
  from: string;
  to: string;
  /** Only the owner sees this. */
  reason: string;
}

/** A team member customers can book (D140). Name and initials are copied so public pages can show them. */
export interface StaffHours {
  memberId: string;
  name: string;
  photo?: string | null;
  bookable: boolean;
  /** Null = follows the business hours. */
  weekly: OpeningHours[] | null;
  timeOff: TimeOff[];
  /** A connected calendar (CalendarConnection.id) that blocks only this person. */
  calendarId?: string | null;
}

export interface DateOverride {
  id: string;
  /** YYYY-MM-DD in the business time zone. */
  date: string;
  closed: boolean;
  open: string;
  close: string;
  note: string;
}

export interface Availability {
  timeZone: string;
  weekly: OpeningHours[];
  overrides: DateOverride[];
  minNoticeHours: number;
  maxPerDay: number;
  horizonDays: number;
  /** Free cancellation/reschedule until this many hours before. */
  cancelHours: number;
  policy: string;
  remindersOn: boolean;
  reminderHours: number;
  /** Connected Google / Outlook calendars (D137). Simulated two-way sync. */
  calendars?: CalendarConnection[];
  /** Per-person hours, time off and calendar (D140). Empty = the business is booked as one. */
  staff?: StaffHours[];
}

export interface BusyEvent {
  id: string;
  calendarId: string;
  /** Only the owner sees titles; visitors just see the time as unavailable. */
  title: string;
  start: string;
  end: string;
  /** Put there by KUBICU for a booking. */
  bookingId?: string;
}

export interface CalendarConnection {
  id: string;
  provider: 'google' | 'outlook';
  account: string;
  /** Team member whose calendar this is. */
  memberName: string;
  connectedAt: string;
  status: 'ok' | 'revoked';
  lastSyncedAt: string;
  calendars: {id: string;name: string;blocks: boolean;}[];
  /** Calendar new bookings are added to. */
  addTo: string;
  events: BusyEvent[];
  log: {at: string;text: string;}[];
}

export type BookingStatus = 'confirmed' | 'pending_deposit' | 'cancelled' | 'completed' | 'no_show';

export interface BookingEvent {
  id: string;
  at: string;
  label: string;
}

export interface Booking {
  id: string;
  ref: string;
  serviceId: string;
  serviceName: string;
  start: string;
  end: string;
  customer: {name: string;phone: string;email: string;};
  intake: string;
  status: BookingStatus;
  depositPaidNgn: number;
  priceNgn: number | null;
  /** D95: balance paid before the appointment (online or recorded by the seller). */
  balancePaidNgn?: number;
  balancePaidAt?: string;
  balancePaidHow?: 'online' | 'recorded';
  /** Copied from the service at booking so later service edits don't change the deal. */
  balanceOnline?: boolean;
  balanceHoursBefore?: number;
  /** Visitor’s own time zone at booking, for reminders. */
  customerTimeZone: string;
  events: BookingEvent[];
  sample?: boolean;
  /** Team member looking after this booking (D60). */
  assigneeId?: string | null;
  /** Public handle of the page or space it was booked on (D191) — e.g. a Booking page. */
  sourceHandle?: string;
}

export type ContactSource = 'order' | 'booking' | 'form' | 'newsletter' | 'import' | 'manual';
export type ConsentStatus = 'subscribed' | 'transactional' | 'unsubscribed';
export type ContactStage = 'new' | 'contacted' | 'won' | 'lost';

export interface ContactActivity {
  id: string;
  at: string;
  kind: ContactSource | 'note' | 'consent' | 'stage' | 'task' | 'merge';
  label: string;
}

export interface ContactTask {
  id: string;
  text: string;
  due: string | null;
  done: boolean;
  assigneeId?: string | null;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  sources: ContactSource[];
  consent: ConsentStatus;
  tags: string[];
  notes: {id: string;at: string;text: string;}[];
  tasks: ContactTask[];
  stage: ContactStage;
  activity: ContactActivity[];
  /** Order and booking ids already linked, so syncing never duplicates. */
  linked: string[];
  createdAt: string;
  sample?: boolean;
  /** Team member who owns the relationship (D60). */
  assigneeId?: string | null;
}

export type TriggerId =
'order_paid' |
'booking_created' |
'checkout_abandoned' |
'lead_submitted' |
'form_sent' |
'stock_low' |
'sub_started' |
'sub_failed' |
'sub_cancelled' |
'stage_due' |
'campaign_started' |
'campaign_ended' |
'contact_quiet';
export type ActionId = 'send_email' | 'send_whatsapp' | 'create_task' | 'add_tag' | 'notify_owner' | 'notify_member' | 'ai_draft' | 'send_report' | 'call_webhook';

export interface AutomationStep {
  id: string;
  kind: 'action' | 'delay';
  action?: ActionId;
  /** Message body, task text, tag name… */
  value: string;
  delayHours?: number;
  /** “Notify a team member” / “Create a follow-up”: who it goes to (D60). */
  memberId?: string | null;
}

export interface AutomationCondition {
  id: string;
  field: 'total_over' | 'source_is' | 'tag_is' | 'consent_subscribed';
  value: string;
}

export interface AutomationRunStep {
  label: string;
  status: 'done' | 'skipped' | 'failed' | 'waiting';
  detail: string;
}

export interface AutomationRun {
  id: string;
  at: string;
  test: boolean;
  status: 'succeeded' | 'failed' | 'skipped';
  subject: string;
  steps: AutomationRunStep[];
}

export interface Automation {
  id: string;
  name: string;
  recipeId: string | null;
  status: 'draft' | 'active' | 'paused';
  trigger: TriggerId;
  /** "Contact quiet for N days" (D125). */
  triggerDays?: number;
  /** "A form response arrives": one form, or null for any form (D195). */
  triggerFormId?: string | null;
  conditions: AutomationCondition[];
  steps: AutomationStep[];
  runs: AutomationRun[];
  updatedAt: string;
  /** When it was last switched on; only events after this start it (D141). */
  liveSince?: string;
  sample?: boolean;
}

export interface OpsData {
  services: Service[];
  availability: Availability;
  bookings: Booking[];
  contacts: Contact[];
  automations: Automation[];
  /** Workspace-wide stop for every automation. */
  automationsPaused: boolean;
  nextBookingRef: number;
  sampleSeeded: boolean;
  /** The sample group class was added once (D200); stays true after it's removed. */
  sampleClassSeeded?: boolean;
  /** Orders already turned into contacts, so deleted contacts aren’t recreated. */
  syncedOrderIds?: string[];
  /** Live-run keys already handled, so each campaign phase or quiet spell fires once (D137). */
  firedKeys?: string[];
}