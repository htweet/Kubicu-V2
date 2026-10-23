/** Local Fulfilment (D96): book a rider for an order, track it, and confirm handover with the customer's code. */

export type DeliveryStatus = 'booked' | 'assigned' | 'picked_up' | 'delivered' | 'failed' | 'cancelled';

export type FailReason = 'unreachable' | 'wrong_address' | 'refused' | 'wrong_code' | 'other';

export interface DeliveryEvent {
  id: string;
  at: string;
  label: string;
}

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
}

export interface FulfilmentData {
  deliveries: Delivery[];
  pickupAddress: string;
  pickupPhone: string;
  /** Own riders saved for "Your own rider". */
  riders: Rider[];
}