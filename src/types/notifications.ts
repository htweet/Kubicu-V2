export type NotifArea = 'orders' | 'stock' | 'bookings' | 'audience' | 'pages' | 'team' | 'billing' | 'ai' | 'domains';

export type NotifEventId =
'order_paid' |
'order_pending' |
'dispute' |
'stock' |
'booking_today' |
'booking_cancelled' |
'lead_new' |
'task_due' |
'review_pending' |
'team_notice' |
'payment_failed' |
'renewal_soon' |
'trial_ending' |
'ai_low' |
'domain_status' |
'dealroom_result' |
'campaign_phase' |
'sub_new' |
'sub_failed' |
'sub_cancelled' |
'form_response';

export type NotifChannel = 'app' | 'email' | 'whatsapp';

export interface AppNotification {
  /** Stable for the same thing in the same state, so "read" sticks. */
  id: string;
  event: NotifEventId;
  area: NotifArea;
  /** Needs action vs. an update. */
  kind: 'action' | 'update';
  text: string;
  href: string;
  at: string;
  /** Team notices carry their own seen flag. */
  noticeId?: string;
}

/** One member's notification settings in one workspace (D66). */
export interface NotifPrefs {
  channels: Partial<Record<NotifEventId, Partial<Record<NotifChannel, boolean>>>>;
  digest: boolean;
  quietHours: {on: boolean;from: string;to: string;};
  read: string[];
}