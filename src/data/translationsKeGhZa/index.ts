import type { Dict } from './build';
import { frame } from './frame';
import { appFrame } from './appFrame';
import { accountAuth } from './accountAuth';
import { checkoutStatus } from './checkoutStatus';
import { commerce } from './commerce';
import { commerceDetail } from './commerceDetail';
import { commerceMoney } from './commerceMoney';
import { trackingWallet } from './trackingWallet';
import { commerceTabs1 } from './commerceTabs1';
import { commerceTabs2 } from './commerceTabs2';
import { commerceTabs3 } from './commerceTabs3';

/**
 * Every Kiswahili, Twi and isiZulu pass, merged (D356). Add each new pass file here; later files win on overlap.
 * Missing phrases fall back to English, so each pass can ship on its own.
 */
// Earlier entries are overridden by later ones: screen-specific passes first, the shared frame last.
const passes = [commerceTabs3, commerceTabs2, commerceTabs1, trackingWallet, commerceMoney, commerceDetail, commerce, checkoutStatus, accountAuth, appFrame, frame];

const merge = (lang: 'sw' | 'tw' | 'zu'): Dict => Object.assign({}, ...passes.map((p) => p[lang]));

export const swDict = merge('sw');
export const twDict = merge('tw');
export const zuDict = merge('zu');