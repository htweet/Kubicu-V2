/** Floating "Ask me anything" bar (D374): [English, Naijá, Yorùbá, Hausa, Igbo]. DRAFTS — need a native speaker's check. */
export const askBarRows: [string, string, string, string, string][] = [
  ['Ask me anything', 'Ask me anything', 'Bi mí ní ohunkóhun', 'Tambaye ni komai', 'Jụọ m ihe ọ bụla'],
  ['Ask KUBICU Copilot', 'Ask KUBICU Copilot', 'Bi KUBICU Copilot', 'Tambayi KUBICU Copilot', 'Jụọ KUBICU Copilot'],
  ['Minimise', 'Make am small', 'Dín kù', 'Rage', 'Belata'],
  ['Listening…', 'I dey listen…', 'Mo ń gbọ́…', 'Ina saurara…', 'Ana m ege ntị…'],
  ['Speak your question', 'Talk your question', 'Sọ ìbéèrè rẹ', 'Faɗi tambayarka', 'Kwuo ajụjụ gị'],
  ['Stop listening', 'Stop to listen', 'Dá gbígbọ́ dúró', 'Daina saurara', 'Kwụsị ige ntị'],
  ['Send to Copilot', 'Send am give Copilot', 'Fi ránṣẹ́ sí Copilot', 'Aika zuwa Copilot', 'Ziga na Copilot'],
  ['Open Copilot', 'Open Copilot', 'Ṣí Copilot', 'Buɗe Copilot', 'Mepee Copilot'],
];

const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(askBarRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const askBarPcm = column(1);
export const askBarYo = column(2);
export const askBarHa = column(3);
export const askBarIg = column(4);
