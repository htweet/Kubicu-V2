import type { UiLang } from './translations';

/** Messages KUBICU itself sends (D135). Drafts in every language need native review, like the app's translations. */
export interface PlatformMessage {
  id: string;
  name: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  /** {placeholders} are filled when sent. */
  text: Record<UiLang, string>;
}

export const platformMessages: PlatformMessage[] = [
{
  id: 'receipt',
  name: 'Order receipt',
  channel: 'WhatsApp',
  text: {
    en: 'Thank you, {name}! {business} has your order #{order} for {amount}. Track it here: {link}',
    pcm: 'Thank you, {name}! {business} don collect your order #{order} wey be {amount}. Follow am here: {link}',
    yo: 'Ẹ ṣé, {name}! {business} ti gba ìbéèrè rẹ #{order} fún {amount}. Tẹ̀lé e níbí: {link}',
    ha: 'Na gode, {name}! {business} ta karɓi odarka #{order} ta {amount}. Bi ta nan: {link}',
    ig: 'Daalụ, {name}! {business} enwetala ihe i nyere iwu #{order} maka {amount}. Soro ya ebe a: {link}'
  }
},
{
  id: 'booking_reminder',
  name: 'Booking reminder (24 hours before)',
  channel: 'WhatsApp',
  text: {
    en: 'Reminder: {service} with {business} tomorrow at {time}. Need to change it? {link}',
    pcm: 'Reminder: {service} with {business} tomorrow by {time}. You wan change am? {link}',
    yo: 'Ìrántí: {service} pẹ̀lú {business} lọ́la ní {time}. Ṣé o fẹ́ yí i padà? {link}',
    ha: 'Tunatarwa: {service} tare da {business} gobe da {time}. Kana son canzawa? {link}',
    ig: 'Ncheta: {service} na {business} echi n’elekere {time}. Ị chọrọ ịgbanwe ya? {link}'
  }
},
{
  id: 'security_new_device',
  name: 'New sign-in',
  channel: 'Email',
  text: {
    en: 'Someone signed in to your KUBICU account from {device} in {place}. If this wasn’t you, change your password now: {link}',
    pcm: 'Person enter your KUBICU account from {device} for {place}. If no be you, change your password now: {link}',
    yo: 'Ẹnìkan wọlé sí àkọọ́lẹ̀ KUBICU rẹ láti {device} ní {place}. Bí kì í bá ṣe ìwọ, yí ọ̀rọ̀ aṣínà rẹ padà báyìí: {link}',
    ha: 'Wani ya shiga asusunka na KUBICU daga {device} a {place}. Idan ba kai ba ne, canza kalmar sirrinka yanzu: {link}',
    ig: 'Mmadụ banyere n’akaụntụ KUBICU gị site na {device} na {place}. Ọ bụrụ na ọ bụghị gị, gbanwee paswọọdụ gị ugbu a: {link}'
  }
},
{
  id: 'two_step_code',
  name: 'Two-step code',
  channel: 'SMS',
  text: {
    en: 'Your KUBICU code is {code}. It expires in 10 minutes. Never share it — KUBICU will never ask for it.',
    pcm: 'Your KUBICU code na {code}. E go expire for 10 minutes. No give anybody — KUBICU no go ever ask you for am.',
    yo: 'Kóòdù KUBICU rẹ ni {code}. Yóò parí ní ìṣẹ́jú mẹ́wàá. Má ṣe fi han ẹnikẹ́ni — KUBICU kò ní béèrè rẹ̀ láé.',
    ha: 'Lambar KUBICU ɗinka ita ce {code}. Za ta ƙare cikin mintuna 10. Kada ka ba kowa — KUBICU ba za ta taɓa nema ba.',
    ig: 'Koodu KUBICU gị bụ {code}. Ọ ga-agwụ n’ime nkeji 10. Ekesala ya onye ọ bụla — KUBICU agaghị arịọ ya.'
  }
}];


export const messageLangs: {value: UiLang;label: string;}[] = [
{ value: 'en', label: 'English' },
{ value: 'pcm', label: 'Naijá' },
{ value: 'yo', label: 'Yorùbá' },
{ value: 'ha', label: 'Hausa' },
{ value: 'ig', label: 'Igbo' }];