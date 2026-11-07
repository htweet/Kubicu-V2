import type { CountryCode } from '../types/country';

/** Simulated courier partners for Local Fulfilment (D96). Rates and names are examples until partners are chosen. */
export interface DeliveryPartner {
  id: string;
  name: string;
  /** Short line under the name. */
  tagline: string;
  /** Base fee in the country's own currency (field name kept from naira-only days). */
  baseNgn: number;
  sameDay: boolean;
  /** Our own rider: no partner fee, you enter the rider's details. */
  own?: boolean;
}

export interface DeliveryArea {
  id: string;
  label: string;
  keywords: string[];
  extraNgn: number;
  bikesOnly?: boolean;
  outOfRange?: boolean;
}

export interface SimRider {
  name: string;
  phone: string;
  vehicle: string;
}

/** Everything delivery needs for one country's main city (D355). All simulated, example fees. */
export interface CountryDelivery {
  /** The area quotes assume when no keyword matches. */
  homeArea: string;
  partners: DeliveryPartner[];
  areas: DeliveryArea[];
  riders: SimRider[];
}

const own: DeliveryPartner = { id: 'own', name: 'Your own rider', tagline: 'No partner fee · you add the rider', baseNgn: 0, sameDay: true, own: true };

export const deliveryByCountry: Record<CountryCode, CountryDelivery> = {
  NG: {
    homeArea: 'Lagos Mainland',
    partners: [
      { id: 'swiftrun', name: 'SwiftRun Logistics', tagline: 'Bikes · same day if booked before 2pm', baseNgn: 2000, sameDay: true },
      { id: 'kobo', name: 'Kobo Dispatch', tagline: 'Bikes and vans · next day, cheaper', baseNgn: 1500, sameDay: false },
      own,
    ],
    areas: [
      { id: 'island', label: 'Lagos Island', keywords: ['island', 'lekki', 'ikoyi', 'victoria island', 'v.i', 'ajah', 'oniru'], extraNgn: 500 },
      { id: 'outer', label: 'Ikorodu & Epe', keywords: ['ikorodu', 'epe', 'badagry'], extraNgn: 1500 },
      { id: 'interstate', label: 'Outside Lagos', keywords: ['abuja', 'ibadan', 'port harcourt', 'enugu', 'kano', 'benin', 'abeokuta'], extraNgn: 0, outOfRange: true },
    ],
    riders: [
      { name: 'Musa Abdullahi', phone: '0803 410 2291', vehicle: 'Bike · LSR 482 KJ' },
      { name: 'Chinedu Okeke', phone: '0812 337 9054', vehicle: 'Bike · KTU 115 AA' },
      { name: 'Yusuf Bello', phone: '0706 221 8830', vehicle: 'Van · APP 903 XY' },
    ],
  },
  KE: {
    homeArea: 'Nairobi CBD & Westlands',
    partners: [
      { id: 'boda-express', name: 'Boda Express', tagline: 'Motorbikes · same day if booked before 2pm', baseNgn: 250, sameDay: true },
      { id: 'jiji-vans', name: 'Jiji Vans', tagline: 'Vans · next day, for bigger parcels', baseNgn: 400, sameDay: false },
      own,
    ],
    areas: [
      { id: 'outer-nbo', label: 'Outer Nairobi', keywords: ['karen', 'rongai', 'kitengela', 'ruiru', 'juja', 'syokimau', 'ngong'], extraNgn: 150 },
      { id: 'upcountry', label: 'Outside Nairobi', keywords: ['mombasa', 'kisumu', 'nakuru', 'eldoret', 'nyeri', 'thika'], extraNgn: 0, outOfRange: true },
    ],
    riders: [
      { name: 'Brian Otieno', phone: '0712 448 210', vehicle: 'Motorbike · KMFA 214Q' },
      { name: 'Wanjiru Kamau', phone: '0722 309 115', vehicle: 'Motorbike · KMEZ 870L' },
      { name: 'Hassan Ali', phone: '0733 562 018', vehicle: 'Van · KCX 412B' },
    ],
  },
  GH: {
    homeArea: 'Central Accra',
    partners: [
      { id: 'okada-go', name: 'OkadaGo Dispatch', tagline: 'Motorbikes · same day if booked before 2pm', baseNgn: 25, sameDay: true },
      { id: 'coast-cargo', name: 'Coast Cargo', tagline: 'Vans · next day, cheaper', baseNgn: 20, sameDay: false },
      own,
    ],
    areas: [
      { id: 'tema', label: 'Tema & Kasoa', keywords: ['tema', 'kasoa', 'ashaiman', 'spintex', 'madina', 'adenta'], extraNgn: 10 },
      { id: 'out-accra', label: 'Outside Greater Accra', keywords: ['kumasi', 'takoradi', 'cape coast', 'tamale', 'ho'], extraNgn: 0, outOfRange: true },
    ],
    riders: [
      { name: 'Kwame Mensah', phone: '024 418 2290', vehicle: 'Motorbike · GR 4821-21' },
      { name: 'Akosua Boateng', phone: '055 330 1874', vehicle: 'Motorbike · GN 1157-22' },
      { name: 'Ibrahim Issah', phone: '020 671 4402', vehicle: 'Van · GE 903-19' },
    ],
  },
  ZA: {
    homeArea: 'Johannesburg & Sandton',
    partners: [
      { id: 'jozi-courier', name: 'Jozi Courier', tagline: 'Bikes · same day if booked before 2pm', baseNgn: 75, sameDay: true },
      { id: 'veld-freight', name: 'Veld Freight', tagline: 'Vans · next day, cheaper', baseNgn: 60, sameDay: false },
      own,
    ],
    areas: [
      { id: 'east-rand', label: 'East Rand & Soweto', keywords: ['soweto', 'germiston', 'benoni', 'boksburg', 'kempton', 'midrand'], extraNgn: 30 },
      { id: 'out-gp', label: 'Outside Gauteng', keywords: ['cape town', 'durban', 'pretoria', 'bloemfontein', 'gqeberha', 'port elizabeth'], extraNgn: 0, outOfRange: true },
    ],
    riders: [
      { name: 'Thabo Nkosi', phone: '082 441 2290', vehicle: 'Bike · JHB 482 GP' },
      { name: 'Lerato Dlamini', phone: '073 330 9054', vehicle: 'Bike · FTU 115 GP' },
      { name: 'Pieter van Wyk', phone: '061 221 8830', vehicle: 'Van · CPT 903 GP' },
    ],
  },
};

/** Nigeria's set, kept under the old names for anything that hasn't moved to the country table. */
export const deliveryPartners: DeliveryPartner[] = deliveryByCountry.NG.partners;
export const deliveryAreas: DeliveryArea[] = deliveryByCountry.NG.areas;
export const SIMULATED_RIDERS = deliveryByCountry.NG.riders;
