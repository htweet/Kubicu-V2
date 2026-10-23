/** Simulated courier partners for Local Fulfilment (D96). Rates and names are examples until partners are chosen. */
export interface DeliveryPartner {
  id: string;
  name: string;
  /** Short line under the name. */
  tagline: string;
  baseNgn: number;
  sameDay: boolean;
  /** Our own rider: no partner fee, you enter the rider's details. */
  own?: boolean;
}

export const deliveryPartners: DeliveryPartner[] = [
{ id: 'swiftrun', name: 'SwiftRun Logistics', tagline: 'Bikes · same day if booked before 2pm', baseNgn: 2000, sameDay: true },
{ id: 'kobo', name: 'Kobo Dispatch', tagline: 'Bikes and vans · next day, cheaper', baseNgn: 1500, sameDay: false },
{ id: 'own', name: 'Your own rider', tagline: 'No partner fee · you add the rider', baseNgn: 0, sameDay: true, own: true }];


/** Address areas that change the price. Matched by keyword in the delivery address. */
export const deliveryAreas: {id: string;label: string;keywords: string[];extraNgn: number;bikesOnly?: boolean;outOfRange?: boolean;}[] = [
{ id: 'island', label: 'Lagos Island', keywords: ['island', 'lekki', 'ikoyi', 'victoria island', 'v.i', 'ajah', 'oniru'], extraNgn: 500 },
{ id: 'outer', label: 'Ikorodu & Epe', keywords: ['ikorodu', 'epe', 'badagry'], extraNgn: 1500 },
{ id: 'interstate', label: 'Outside Lagos', keywords: ['abuja', 'ibadan', 'port harcourt', 'enugu', 'kano', 'benin', 'abeokuta'], extraNgn: 0, outOfRange: true }];


export const SIMULATED_RIDERS = [
{ name: 'Musa Abdullahi', phone: '0803 410 2291', vehicle: 'Bike · LSR 482 KJ' },
{ name: 'Chinedu Okeke', phone: '0812 337 9054', vehicle: 'Bike · KTU 115 AA' },
{ name: 'Yusuf Bello', phone: '0706 221 8830', vehicle: 'Van · APP 903 XY' }];