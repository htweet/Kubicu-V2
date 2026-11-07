/** Local Fulfilment (D96): book a rider for an order, track it, and confirm handover with the customer's code. */

export type DeliveryStatus = 'booked' | 'assigned' | 'picked_up' | 'delivered' | 'failed' | 'cancelled';

export type FailReason = 'unreachable' | 'wrong_address' | 'refused' | 'wrong_code' | 'held_customs' | 'returned_sender' | 'other';

export interface DeliveryEvent {
  id: string;
  at: string;
  label: string;
  /** Filled into `{name}` placeholders in the label when it's shown (D451), so the label stays translatable. */
  vars?: Record<string, string>;
}

/** Tracking steps after pickup for a parcel going abroad (D451). 4 = out for delivery in the buyer's country. */
export type CrossBorderStage = 0 | 1 | 2 | 3 | 4;

export interface Rider {
  name: string;
  phone: string;
  vehicle: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  partnerId: string;
  partnerName: string;
  feeNgn: number;
  etaLabel: string;
  /** When the rider should collect from you. */
  pickupAt: string;
  status: DeliveryStatus;
  rider?: Rider;
  /** 4-digit handover code the partner texts to the customer. */
  code: string;
  codeAttempts: number;
  failReason?: FailReason;
  failNote?: string;
  /** Order was paid into escrow: the code releases it. */
  escrow: boolean;
  events: DeliveryEvent[];
  createdAt: string;
  sample?: boolean;
  /** Parcel going to another country (D451): country codes and how far it has got after pickup. */
  crossBorder?: { from: string; to?: string; stage: CrossBorderStage };
}

export interface FulfilmentData {
  deliveries: Delivery[];
  pickupAddress: string;
  pickupPhone: string;
  /** Own riders saved for "Your own rider". */
  riders: Rider[];
}
