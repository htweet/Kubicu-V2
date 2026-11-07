import type { CoreModule } from '../types/marketplace';

/** Where each core module lives, for the "Works with" row on extensions (D231). */
export const coreModules: Record<CoreModule, { label: string; href: string }> = {
  orders: { label: 'Orders', href: '/app/commerce/orders' },
  products: { label: 'Products', href: '/app/commerce/products' },
  checkout: { label: 'Checkout', href: '/app/commerce/settings' },
  storefront: { label: 'Storefront', href: '/app/commerce/storefront' },
  paymentLinks: { label: 'Payment links', href: '/app/commerce/payment-links' },
  reports: { label: 'Sales report', href: '/app/commerce/reports' },
  wallet: { label: 'Wallet', href: '/app/commerce/wallet' },
  pages: { label: 'Pages', href: '/app/spaces' },
  bookings: { label: 'Bookings', href: '/app/bookings' },
  audience: { label: 'Audience', href: '/app/audience' },
  automations: { label: 'Automations', href: '/app/automations' },
  analytics: { label: 'Analytics', href: '/app/analytics' },
  notifications: { label: 'Notifications', href: '/app/settings/notifications' },
  forms: { label: 'Forms', href: '/app/forms' },
  campaignLinks: { label: 'Short links', href: '/app/links' },
  quotes: { label: 'Quotes & jobs', href: '/app/services' },
  proof: { label: 'Proof of work', href: '/app/proof' },
  settings: { label: 'Settings', href: '/app/settings' },
};
