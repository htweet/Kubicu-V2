import { b, doc } from './examples/build';
import { pageThemePresets } from './pageThemes';

/*
 * The one fixed reference page every Signature theme is judged on (D164): identity, links, a featured
 * action, a photo, products with prices, a quote, a sign-up form and socials. Switching themes changes
 * only the look — never this content or its order. All people, prices and links are fictional.
 */
export const themeReferencePage = doc(
  'themereference',
  'Amara Okoye Studio',
  'Handmade ceramics and pottery classes in Lagos.',
  pageThemePresets[0].theme,
  [
    b('tr_profile', 'profile', {
      name: 'Amara Okoye Studio',
      tagline: 'Handmade ceramics for slow mornings, and small pottery classes every weekend.',
      avatarUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/df66cb13-05ae-4179-a39e-eae805aa6b84.jpg',
      avatarAlt: 'Amara smiling against a warm wall',
      location: 'Yaba, Lagos',
    }, { align: 'center' }),
    b('tr_social', 'social', {
      items: [
        { id: 'tr_ig', platform: 'instagram', url: 'https://instagram.com/amaraokoye.example' },
        { id: 'tr_tt', platform: 'tiktok', url: 'https://tiktok.com/@amaraokoye.example' },
        { id: 'tr_yt', platform: 'youtube', url: 'https://youtube.com/@amaraokoye.example' },
      ],
    }, { align: 'center' }),
    b('tr_feature', 'link', { label: 'Book a Saturday wheel class', url: 'https://amaraokoye.example/classes', description: 'Small groups of six · all levels' }, { align: 'center', emphasis: 'featured' }),
    b('tr_shop', 'link', { label: 'Shop the spring collection', url: 'https://amaraokoye.example/shop', description: '' }, { align: 'center' }),
    b('tr_journal', 'link', { label: 'Read the studio journal', url: 'https://amaraokoye.example/journal', description: '' }, { align: 'center' }),
    b('tr_image', 'image', {
      url: 'https://cdn.magicpatterns.com/patterns/generated-images/43e71e50-b63a-4a2f-8a21-e99e84704b0e.jpg',
      alt: 'A bright studio with concrete, timber and tall windows',
      caption: 'The studio in Yaba — morning light, open on Saturdays.',
      aspect: '4:5',
    }),
    b('tr_grid', 'productGrid', {
      title: 'New this month',
      orderAction: 'whatsapp',
      whatsappPhone: '+234 802 555 0190',
      ctaLabel: 'Order',
      items: [
        { id: 'tr_p1', name: 'Speckled mug', priceNgn: 9500, imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/08d7b751-c878-472e-9107-7258feb7ebb6.jpg', imageAlt: 'Woven tote on a cream plinth', note: 'Stoneware', soldOut: false, url: '' },
        { id: 'tr_p2', name: 'Serving bowl', priceNgn: 22000, imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/72627bb6-2c3b-4f8a-9e63-fd2c538311d2.jpg', imageAlt: 'Tan object on a terracotta block', note: 'Glazed', soldOut: true, url: '' },
      ],
    }),
    b('tr_quote', 'testimonial', {
      quote: 'I came for one class and left with a new Saturday ritual. Amara is endlessly patient.',
      name: 'Kemi A.', role: 'Class student', source: 'Sample review', avatarUrl: '', avatarAlt: '', permission: true,
    }),
    b('tr_news', 'newsletter', { title: 'Studio letter', description: 'New pieces and class dates, once a month.', buttonLabel: 'Subscribe', consentText: 'One email a month. Unsubscribe anytime.' }),
  ],
);
