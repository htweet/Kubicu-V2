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
  /** Online services (D225): which connected app makes each booking's meeting link. Missing = the seller sends their own. */
  meetingApp?: MeetingApp;
  /** D256: each booking arrives as a request the seller accepts or declines. */
  approval?: boolean;
  /** D256: the seller's own questions, asked in the booking sheet. Up to 5. */
  questions?: IntakeQuestion[];
}

/** One question a service asks when someone books (D256). */
export interface IntakeQuestion {
  id: string;
  label: string;
  kind: 'text' | 'choice' | 'yesno';
  /** Choice questions only: 2–6 options. */
  options: string[];
  required: boolean;
}

export type MeetingApp = 'google_meet' | 'zoom' | 'teams';

/** A connected video-call account (D225). Simulated sign-in; a real build uses each provider's OAuth and API. */
export interface MeetingConnection {
  id: string;
  app: MeetingApp;
  account: string;
  connectedAt: string;
  status: 'ok' | 'revoked';
}

export interface BookingMeeting {
  app: MeetingApp;
  url: string;
  /** Zoom passcode / Teams meeting ID, when the app has one. */
  code?: string;
  createdAt: string;
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
  /** Connected Google Meet, Zoom and Microsoft Teams accounts (D225). */
  meetings?: MeetingConnection[];
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

/** 'requested' (D256): waiting for the seller to accept. The time is held meanwhile. Declining cancels it. */
export type BookingStatus = 'requested' | 'confirmed' | 'pending_deposit' | 'cancelled' | 'completed' | 'no_show';

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
  /** Answers to the service's own questions, with the question copied so later edits don't change them (D256). */
  answers?: {question: string;answer: string;}[];
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
  /** Meeting made automatically for an online booking (D225). */
  meeting?: BookingMeeting;
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
  /** Values for the business's own contact fields, by field id (D259). */
  fields?: Record<string, string>;
  /** First channel, short link and page that brought them in (D268). A click alone never creates a contact. */
  attribution?: ContactAttribution;
  /** What they agreed to and when — kept apart from where they came from (D268). */
  consentRecord?: {at: string;wording: string;addedBy?: 'owner';};
}

export interface ContactAttribution {
  channel: import('./analytics').SourceId;
  /** Short-link slug, when they arrived through one. */
  campaign: string | null;
  /** Page handle they signed up on. */
  page: string | null;
  at: string;
  /** Filled in later by the business for contacts added before channels were recorded (D343). */
  addedBy?: 'owner';
}

/** A saved Audience filter (D268). Membership is worked out live, so people join and leave as they change. */
export interface SavedSegment {
  id: string;
  name: string;
  source: ContactSource | 'all';
  consent: ConsentStatus | 'all';
  tag: string;
  /** Short-link slug, or 'all'. */
  campaign: string;
  /** Extra conditions from the rule builder (D272). Combined with the filters above. */
  rules?: SegmentRule[];
  /** Whether a contact must meet all of the rules or any one of them. */
  match?: 'all' | 'any';
}

export type SegmentField = 'source' | 'consent' | 'tag' | 'campaign' | 'channel' | 'stage' | 'added' | 'email' | 'phone';
export type SegmentOp = 'is' | 'isNot' | 'within' | 'olderThan' | 'has' | 'missing';

/** One condition in a segment (D272), e.g. "Tag is VIP" or "Added within 30 days". */
export interface SegmentRule {
  id: string;
  field: SegmentField;
  op: SegmentOp;
  /** Option id, tag, slug or number of days. Unused for has/missing. */
  value: string;
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
  /** Audience and Automations settings (D259). Read through opsSettingsOf(). */
  settings?: Partial<OpsSettings>;
}

export type ContactFieldType = 'text' | 'number' | 'date' | 'choice';

/** A field of the business's own on every contact, e.g. "Dress size" or "Birthday" (D259). */
export interface ContactField {
  id: string;
  label: string;
  type: ContactFieldType;
  /** Choice fields only. */
  options: string[];
}

export interface OpsSettings {
  contactFields: ContactField[];
  /** Tags offered when tagging a contact and in the Audience tag filter. */
  savedTags: string[];
  /** Standard consent note for sign-up forms. */
  consentText: string;
  /** Automations hold customer messages written in these hours (business time zone). */
  quietHours: {on: boolean;from: string;to: string;};
  /** Channel a new "send a message" step starts with. */
  defaultChannel: 'send_whatsapp' | 'send_email';
  /** Saved Audience filters (D268). */
  segments: SavedSegment[];
}