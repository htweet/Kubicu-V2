import type { TimeZoneId } from '../components/ui/TimezoneSelect';

/** The person signed in — one per device in the prototype (D80). Separate from any workspace. */
export interface AccountProfile {
  name: string;
  /** What teammates see in comments, approvals and the activity log. Defaults to the first name. */
  displayName: string;
  email: string;
  phone: string;
  /** Small square photo as a data URL; null shows initials. */
  photo: string | null;
  jobTitle: string;
  bio: string;
}

export type LanguageId = 'en-NG' | 'en-GB' | 'pcm' | 'yo' | 'ha' | 'ig' | 'fr';
export type DateFormatId = 'dmy' | 'mdy' | 'iso';
export type StartPageId = 'overview' | 'spaces' | 'commerce' | 'canvas';
export type TextSizeId = 'default' | 'large';
export type MotionId = 'device' | 'reduce';

export interface AccountPrefs {
  language: LanguageId;
  timeZone: TimeZoneId;
  dateFormat: DateFormatId;
  startPage: StartPageId;
  textSize: TextSizeId;
  motion: MotionId;
}

export type TwoStepMethod = 'none' | 'app' | 'sms';

export interface AccountSecurity {
  passwordSetAt: string;
  twoStep: TwoStepMethod;
  twoStepSince: string | null;
  backupCodes: string[];
  /** Email me when there's a sign-in from a new device. */
  signInAlerts: boolean;
  /** D125: the last time a security change signed out other devices, shown as a confirmation. */
  lastSignOut?: {at: string;reason: 'password' | 'two_step_on' | 'two_step_off';devices: string[];seen?: boolean;} | null;
}

export interface AccountSession {
  id: string;
  device: string;
  browser: string;
  place: string;
  lastActiveAt: string;
  current: boolean;
}

export interface SignInEvent {
  id: string;
  at: string;
  device: string;
  place: string;
  outcome: 'ok' | 'wrong_password' | 'blocked_two_step';
}

export type LoginProvider = 'google' | 'apple';

export interface ConnectedLogin {
  provider: LoginProvider;
  email: string;
  connectedAt: string;
}

export interface DataExport {
  id: string;
  requestedAt: string;
  readyAt: string;
}

export interface AccountComms {
  productNews: boolean;
  tips: boolean;
  research: boolean;
}

export interface AccountData {
  profile: AccountProfile;
  emailVerified: boolean;
  /** A new address waiting for its verification link. */
  pendingEmail: string | null;
  phoneVerified: boolean;
  prefs: AccountPrefs;
  security: AccountSecurity;
  sessions: AccountSession[];
  signIns: SignInEvent[];
  connected: ConnectedLogin[];
  comms: AccountComms;
  exports: DataExport[];
  deletion: {requestedAt: string;scheduledFor: string;reason: string;} | null;
  createdAt: string;
}