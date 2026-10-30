/**
 * Website contact form (D338). Shown in the visitor's language; tickets are filed with the English topic.
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const contactFormRows: [string, string, string, string, string][] = [
['Send a message', 'Send message', 'Fi ìfiránṣẹ́ ránṣẹ́', 'Aika saƙo', 'Ziga ozi'],
['Your name', 'Your name', 'Orúkọ rẹ', 'Sunanka', 'Aha gị'],
['Email', 'Email', 'Ímeèlì', 'Imel', 'Email'],
['We reply here within 1 working day.', 'We go reply here inside 1 working day.', 'A ó fèsì síbí láàárín ọjọ́ iṣẹ́ kan.', 'Za mu amsa a nan cikin kwanan aiki 1.', 'Anyị ga-aza ebe a n’ime otu ụbọchị ọrụ.'],
['What’s it about?', 'Wetin e concern?', 'Kí ló jẹ mọ́?', 'Game da me ne?', 'Gịnị ka ọ bụ maka ya?'],
['A question before signing up', 'Question before I sign up', 'Ìbéèrè kí n tó forúkọsílẹ̀', 'Tambaya kafin yin rajista', 'Ajụjụ tupu m debanye aha'],
['My account or billing', 'My account or billing', 'Àkáǹtì mi tàbí ìsanwó', 'Asusuna ko biyan kuɗi', 'Akaụntụ m ma ọ bụ ụgwọ'],
['Selling and payouts', 'Selling and payouts', 'Títà àti gbígba owó', 'Sayarwa da karɓar kuɗi', 'Ire ahịa na nnata ego'],
['My page or domain', 'My page or domain', 'Ojú-ìwé mi tàbí àgbègbè', 'Shafina ko yanki', 'Ibe m ma ọ bụ ngalaba'],
['Partnerships', 'Partnerships', 'Ìbáṣepọ̀', 'Haɗin gwiwa', 'Mmekọrịta'],
['Press', 'Press', 'Ìròyìn', '’Yan jarida', 'Ndị nta akụkọ'],
['Legal, privacy or security', 'Legal, privacy or security', 'Òfin, àṣírí tàbí ààbò', 'Shari’a, sirri ko tsaro', 'Iwu, nzuzo ma ọ bụ nchekwa'],
['Your KUBICU link', 'Your KUBICU link', 'Ìjápọ̀ KUBICU rẹ', 'Hanyar KUBICU ɗinka', 'Njikọ KUBICU gị'],
['So we can find your account faster.', 'So we fit find your account quick.', 'Kí a lè rí àkáǹtì rẹ kíákíá.', 'Don mu sami asusunka da sauri.', 'Ka anyị nwee ike ịchọta akaụntụ gị ngwa ngwa.'],
['WhatsApp number', 'WhatsApp number', 'Nọ́mbà WhatsApp', 'Lambar WhatsApp', 'Nọmba WhatsApp'],
['If you’d rather we reply on WhatsApp.', 'If you prefer make we reply for WhatsApp.', 'Bí o bá fẹ́ kí a fèsì lórí WhatsApp.', 'Idan ka fi son mu amsa a WhatsApp.', 'Ọ bụrụ na ị chọrọ ka anyị zaa na WhatsApp.'],
['Message', 'Message', 'Ìfiránṣẹ́', 'Saƙo', 'Ozi'],
['Send message', 'Send message', 'Fi ìfiránṣẹ́ ránṣẹ́', 'Aika saƙo', 'Ziga ozi'],
['Message sent', 'Message don send', 'A ti fi ìfiránṣẹ́ ránṣẹ́', 'An aika saƙo', 'Ezigala ozi'],
['Thanks — a person on our team will reply within 1 working day (Monday–Friday, 9am–6pm WAT).', 'Thanks — person for our team go reply inside 1 working day (Monday–Friday, 9am–6pm WAT).', 'O ṣé — ẹnìkan nínú ẹgbẹ́ wa yóò fèsì láàárín ọjọ́ iṣẹ́ kan (Ọjọ́ Ajé–Ọjọ́ Ẹtì, 9 òwúrọ̀–6 ìrọ̀lẹ́ WAT).', 'Na gode — wani a ƙungiyarmu zai amsa cikin kwanan aiki 1 (Litinin–Juma’a, 9 na safe–6 na yamma WAT).', 'Daalụ — otu onye n’otu anyị ga-aza n’ime otu ụbọchị ọrụ (Mọnde–Fraịde, 9 ụtụtụ–6 mgbede WAT).'],
['We use your details only to reply. See our privacy policy at kub.icu/about/privacy.', 'We dey use your details only to reply. See our privacy policy for kub.icu/about/privacy.', 'A ń lo àlàyé rẹ láti fèsì nìkan. Wo ìlànà àṣírí wa ní kub.icu/about/privacy.', 'Muna amfani da bayananka ne kawai don amsawa. Duba manufar sirrinmu a kub.icu/about/privacy.', 'Anyị na-eji nkọwa gị naanị iji zaa. Lee iwu nzuzo anyị na kub.icu/about/privacy.']];


const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(contactFormRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const contactFormPcm = column(1);
export const contactFormYo = column(2);
export const contactFormHa = column(3);
export const contactFormIg = column(4);