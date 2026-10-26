import type { ShopAddMode, ShopCardStyle, ShopCollectionsStyle, ShopFeaturedStyle, ShopHeaderStyle, ShopLook, ShopProductPageStyle } from '../../types/commerce';

/** The parts a look sets. Changing any of them afterwards marks the look "Customised" (D196). */
export interface ShopParts {
  header: ShopHeaderStyle;
  featuredStyle: ShopFeaturedStyle;
  collectionsStyle: ShopCollectionsStyle;
  cardStyle: ShopCardStyle;
  columns: 2 | 3 | 4;
  imageShape: 'portrait' | 'square' | 'landscape';
  productPage: ShopProductPageStyle;
  stickyBuy: boolean;
  addMode: ShopAddMode;
}

export interface ShopLookDef {
  id: ShopLook;
  name: string;
  /** Who it suits, in one line. */
  forWho: string;
  description: string;
  parts: ShopParts;
}

export const shopLooks: ShopLookDef[] = [
{
  id: 'classic',
  name: 'Classic grid',
  forWho: 'Any shop',
  description: 'Title and banner, then an even grid of product cards.',
  parts: { header: 'banner', featuredStyle: 'none', collectionsStyle: 'chips', cardStyle: 'standard', columns: 4, imageShape: 'portrait', productPage: 'side', stickyBuy: false, addMode: 'page' }
},
{
  id: 'boutique',
  name: 'Boutique',
  forWho: 'Fashion and lifestyle',
  description: 'A large banner, one big featured piece beside two smaller ones, then an airy grid.',
  parts: { header: 'banner', featuredStyle: 'hero', collectionsStyle: 'tabs', cardStyle: 'minimal', columns: 3, imageShape: 'portrait', productPage: 'stacked', stickyBuy: false, addMode: 'page' }
},
{
  id: 'catalogue',
  name: 'Catalogue',
  forWho: 'Many items: food, parts, groceries',
  description: 'A price list grouped under each collection: name and short description on the left, price and Add on the right.',
  parts: { header: 'title', featuredStyle: 'none', collectionsStyle: 'side', cardStyle: 'pricelist', columns: 2, imageShape: 'square', productPage: 'side', stickyBuy: false, addMode: 'button' }
},
{
  id: 'lookbook',
  name: 'Lookbook',
  forWho: 'Art, photography, jewellery',
  description: 'Big photos with the name and price laid over them. Very little text.',
  parts: { header: 'split', featuredStyle: 'none', collectionsStyle: 'chips', cardStyle: 'overlay', columns: 3, imageShape: 'portrait', productPage: 'full', stickyBuy: false, addMode: 'page' }
},
{
  id: 'quick',
  name: 'Quick order',
  forWho: 'Market sellers and repeat orders',
  description: 'A tight list with plus and minus on every item, and the cart always one tap away.',
  parts: { header: 'title', featuredStyle: 'none', collectionsStyle: 'chips', cardStyle: 'row', columns: 2, imageShape: 'square', productPage: 'side', stickyBuy: true, addMode: 'stepper' }
},
{
  id: 'spotlight',
  name: 'Spotlight',
  forWho: 'Shops with 1–5 products',
  description: 'One product up front with its photo, story and buy button, the rest below.',
  parts: { header: 'none', featuredStyle: 'spotlight', collectionsStyle: 'chips', cardStyle: 'standard', columns: 3, imageShape: 'square', productPage: 'stacked', stickyBuy: true, addMode: 'page' }
}];


export const PART_KEYS: (keyof ShopParts)[] = ['header', 'featuredStyle', 'collectionsStyle', 'cardStyle', 'columns', 'imageShape', 'productPage', 'stickyBuy', 'addMode'];

export function lookDef(id: ShopLook): ShopLookDef {
  return shopLooks.find((l) => l.id === id) ?? shopLooks[0];
}

/** The parts differ from the chosen look's own. */
export function isCustomised(config: ShopParts & {look: ShopLook;}): boolean {
  const base = lookDef(config.look).parts;
  return PART_KEYS.some((k) => base[k] !== config[k]);
}

export const partLabels = {
  header: { banner: 'Banner and title', title: 'Title only', split: 'Photo beside title', none: 'None' } as Record<ShopHeaderStyle, string>,
  featuredStyle: { none: 'None', row: 'A row', hero: 'One big + two small', spotlight: 'One product up front' } as Record<ShopFeaturedStyle, string>,
  collectionsStyle: { chips: 'Chips', tabs: 'Tabs', side: 'Side list on desktop' } as Record<ShopCollectionsStyle, string>,
  cardStyle: { standard: 'Standard', minimal: 'Minimal', overlay: 'Text over photo', row: 'List row', pricelist: 'Price list' } as Record<ShopCardStyle, string>,
  productPage: { side: 'Photos beside details', stacked: 'Stacked photos', full: 'Full-width photo' } as Record<ShopProductPageStyle, string>,
  addMode: { page: 'From the product page', button: 'Add button on each item', stepper: '+ and − on each item' } as Record<ShopAddMode, string>
};