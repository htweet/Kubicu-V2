import qrcode from 'qrcode-generator';
import { levelLabels, type TrustLevel } from './trustPassport';

/** What goes on the shareable Trust Passport card (D253). Only met, buyer-safe signals. */
export interface TrustCardContent {
  business: string;
  level: TrustLevel;
  score: number;
  showScore: boolean;
  /** Public wording of met signals, e.g. "12+ orders completed". */
  signals: string[];
  /** Public passport page — the QR code and printed link point here so anyone can check the card. */
  url: string;
  generatedAt: Date;
}

export const CARD_W = 1080;
export const CARD_H = 1350;

// Fixed light palette: the card is read inside WhatsApp chats and Status in light and dark mode,
// so it must not depend on the owner's theme. All text pairs pass 4.5:1 on their background.
const C = {
  paper: '#FFFFFF',
  band: '#0F172A',
  bandText: '#FFFFFF',
  bandMuted: '#CBD5E1',
  ink: '#0F172A',
  muted: '#475569',
  subtle: '#64748B',
  rule: '#E2E8F0',
  tint: '#F1F5F9',
  check: '#15803D',
};

const levelInk: Record<TrustLevel, string> = {
  starting: '#334155',
  building: '#1D4ED8',
  established: '#1D4ED8',
  trusted: '#15803D',
};

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** Draws the card and returns a PNG blob (1080 × 1350, 4:5 — fits WhatsApp chats, Status and Instagram). */
export async function renderTrustCard(c: TrustCardContent): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  const pad = 88;

  // Paper
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Top band: what this is
  const bandH = 150;
  ctx.fillStyle = C.band;
  ctx.fillRect(0, 0, CARD_W, bandH);
  drawShield(ctx, pad, 46, 58, C.bandText);
  ctx.fillStyle = C.bandText;
  ctx.font = `700 38px ${FONT}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('KUBICU Trust Passport', pad + 80, 88);
  ctx.fillStyle = C.bandMuted;
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText('Built only from records KUBICU checks', pad + 80, 122);

  // Business name (up to 2 lines)
  let y = bandH + 110;
  ctx.fillStyle = C.ink;
  ctx.font = `800 68px ${FONT}`;
  const nameLines = wrap(ctx, c.business, CARD_W - pad * 2, 2);
  for (const line of nameLines) {
    ctx.fillText(line, pad, y);
    y += 80;
  }

  // Level, then optional score
  y += 16;
  ctx.fillStyle = levelInk[c.level];
  ctx.font = `700 48px ${FONT}`;
  ctx.fillText(levelLabels[c.level], pad, y);

  // Rule
  y += 48;
  ctx.fillStyle = C.rule;
  ctx.fillRect(pad, y, CARD_W - pad * 2, 2);
  y += 70;

  // Signals met
  const qrBox = 300;
  const footerTop = CARD_H - qrBox - pad - 40;
  ctx.font = `600 34px ${FONT}`;
  if (c.signals.length === 0) {
    ctx.fillStyle = C.muted;
    ctx.font = `500 34px ${FONT}`;
    for (const line of wrap(ctx, 'New on KUBICU — checks appear here as they are met.', CARD_W - pad * 2, 2)) {
      ctx.fillText(line, pad, y);
      y += 48;
    }
  } else {
    for (const s of c.signals.slice(0, 6)) {
      ctx.font = `600 34px ${FONT}`;
      const lines = wrap(ctx, s, CARD_W - pad * 2 - 64, 2);
      if (y + (lines.length - 1) * 44 > footerTop - 20) break;
      drawCheck(ctx, pad, y - 30, 38, C.check);
      ctx.fillStyle = C.ink;
      lines.forEach((l, i) => ctx.fillText(l, pad + 64, y + i * 44));
      y += lines.length * 44 + 30;
    }
  }

  // Score: fills the open space between the checks and the footer (D272).
  if (c.showScore) {
    const spaceTop = y - 10;
    const spaceBottom = footerTop - 30;
    const room = spaceBottom - spaceTop;
    if (room >= 200) drawScoreBlock(ctx, c.score, levelInk[c.level], pad, spaceTop, CARD_W - pad * 2, room);
    else {
      // Long list of checks: no room for the large score, so it sits on its own line under the last check.
      ctx.fillStyle = C.ink;
      ctx.font = `700 40px ${FONT}`;
      ctx.fillText(`Trust score ${c.score}/100`, pad, Math.min(y + 10, spaceBottom));
    }
  }

  // Footer: QR + how to check
  const qrX = pad;
  const qrY = CARD_H - pad - qrBox;
  ctx.fillStyle = C.tint;
  roundRect(ctx, 0, qrY - 40, CARD_W, CARD_H - (qrY - 40), 0);
  ctx.fill();
  ctx.fillStyle = C.paper;
  roundRect(ctx, qrX, qrY, qrBox, qrBox, 20);
  ctx.fill();
  drawQr(ctx, c.url, qrX + 20, qrY + 20, qrBox - 40, C.ink);

  const tx = qrX + qrBox + 48;
  const tw = CARD_W - tx - pad;
  let ty = qrY + 70;
  ctx.fillStyle = C.ink;
  ctx.font = `700 38px ${FONT}`;
  ctx.fillText('Scan to check it’s real', tx, ty);
  ty += 54;
  ctx.fillStyle = C.muted;
  ctx.font = `500 28px ${FONT}`;
  for (const line of wrap(ctx, 'The live passport on KUBICU is the source of truth. If it doesn’t match this card, don’t rely on the card.', tw, 3)) {
    ctx.fillText(line, tx, ty);
    ty += 38;
  }
  ty += 14;
  ctx.fillStyle = C.ink;
  ctx.font = `600 26px ${FONT}`;
  ctx.fillText(fit(ctx, c.url.replace(/^https?:\/\//, ''), tw), tx, ty);
  ty += 36;
  ctx.fillStyle = C.subtle;
  ctx.font = `500 24px ${FONT}`;
  ctx.fillText(`Made ${c.generatedAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`, tx, ty);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'));
}

export function cardFileName(business: string): string {
  const slug = business.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'business';
  return `${slug}-trust-passport.png`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= max) line = test;
    else {
      if (line) lines.push(line);
      line = w;
    }
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(' ') !== lines.join(' ')) lines[maxLines - 1] = fit(ctx, lines[maxLines - 1] + '…', max);
  return lines.map((l) => fit(ctx, l, max));
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t.replace(/…$/, '')}…`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawQr(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const cell = size / n;
  ctx.fillStyle = color;
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      if (qr.isDark(r, col)) ctx.fillRect(Math.floor(x + col * cell), Math.floor(y + r * cell), Math.ceil(cell), Math.ceil(cell));
    }
  }
}

/** A ring gauge with the score inside, and a plain explanation beside it. */
function drawScoreBlock(ctx: CanvasRenderingContext2D, score: number, accent: string, x: number, top: number, width: number, room: number) {
  const d = Math.min(room - 20, 300);
  const r = d / 2;
  const cy = top + room / 2;
  const cx = x + r;
  const line = Math.max(18, d * 0.085);
  const pct = Math.max(0, Math.min(100, score)) / 100;

  ctx.lineCap = 'round';
  ctx.lineWidth = line;
  ctx.strokeStyle = C.rule;
  ctx.beginPath();
  ctx.arc(cx, cy, r - line / 2, 0, Math.PI * 2);
  ctx.stroke();
  if (pct > 0) {
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, r - line / 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = C.ink;
  ctx.font = `800 ${Math.round(d * 0.34)}px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(String(score), cx, cy - d * 0.04);
  ctx.fillStyle = C.subtle;
  ctx.font = `600 ${Math.round(d * 0.1)}px ${FONT}`;
  ctx.fillText('out of 100', cx, cy + d * 0.22);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  const tx = x + d + 56;
  const tw = width - d - 56;
  let ty = cy - 46;
  ctx.fillStyle = C.ink;
  ctx.font = `700 44px ${FONT}`;
  ctx.fillText('Trust score', tx, ty);
  ty += 52;
  ctx.fillStyle = C.muted;
  ctx.font = `500 28px ${FONT}`;
  for (const l of wrap(ctx, 'Worked out only from records KUBICU has checked.', tw, 2)) {
    ctx.fillText(l, tx, ty);
    ty += 38;
  }
}

function drawCheck(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = s * 0.12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + s * 0.28, y + s * 0.52);
  ctx.lineTo(x + s * 0.44, y + s * 0.67);
  ctx.lineTo(x + s * 0.73, y + s * 0.36);
  ctx.stroke();
}

function drawShield(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.08;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + s / 2, y + s * 0.04);
  ctx.lineTo(x + s * 0.9, y + s * 0.2);
  ctx.quadraticCurveTo(x + s * 0.9, y + s * 0.78, x + s / 2, y + s * 0.96);
  ctx.quadraticCurveTo(x + s * 0.1, y + s * 0.78, x + s * 0.1, y + s * 0.2);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.32, y + s * 0.5);
  ctx.lineTo(x + s * 0.46, y + s * 0.64);
  ctx.lineTo(x + s * 0.7, y + s * 0.38);
  ctx.stroke();
}
