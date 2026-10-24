import React, { useEffect, useMemo, useState } from 'react';
import { CheckIcon, TruckIcon, WalletIcon, CreditCardIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useMoney } from '../../hooks/useMoney';
import { useLocalStore } from '../../hooks/useLocalStore';
import { balances, isVerified } from '../../utils/money/store';
import { kitItems, kitPreviewDoc, type KitDetails } from '../../utils/domains/printKit';
import {
  deliveryZones,
  emptyPrintOrders,
  estimateArrival,
  nigerianStates,
  PRINT_PARTNER,
  printFinishes,
  printOrdersKey,
  printPrices,
  printRef,
  quote,
  zoneForState,
  type DeliveryZone,
  type OrderableItem,
  type PrintOrder,
  type PrintPayMethod } from
'../../utils/domains/printOrders';
import { formatNgn } from '../../utils/format';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';
import { SelectInput } from '../ui/SelectInput';
import { TextInput } from '../ui/TextInput';
import { cn } from '../../utils/cn';

type Step = 'options' | 'proof' | 'delivery' | 'pay';
const steps: {id: Step;label: string;}[] = [
{ id: 'options', label: 'What & how many' },
{ id: 'proof', label: 'Check the proof' },
{ id: 'delivery', label: 'Delivery' },
{ id: 'pay', label: 'Pay' }];

const orderable: OrderableItem[] = ['card', 'sticker', 'insert', 'hangtag', 'voucher', 'flyer', 'counter', 'stamp', 'label'];
const proofChecks = [
'The business name, phone number and wording are spelt correctly',
'I scanned the QR code with my phone and it opened the right page',
'I understand colours on paper can look slightly different from my screen'];


interface PrintOrderSheetProps {
  open: boolean;
  onClose: () => void;
  initialItem: OrderableItem;
  kit: KitDetails;
  qrUrl: string;
  qrLinkName: string;
  onPlaced: (o: PrintOrder) => void;
}

/** Order prints from the partner print shop: options → proof → delivery → pay (D114). Partner simulated. */
export function PrintOrderSheet({ open, onClose, initialItem, kit, qrUrl, qrLinkName, onPlaced }: PrintOrderSheetProps) {
  const { current } = useWorkspace();
  const team = useTeam();
  const canWallet = useCan('payouts.manage');
  const money = useMoney(current.id);
  const store = useLocalStore(printOrdersKey(current.id), emptyPrintOrders);

  const [step, setStep] = useState<Step>('options');
  const [item, setItem] = useState<OrderableItem>(initialItem);
  const [qty, setQty] = useState(printPrices[initialItem][0].qty);
  const [finish, setFinish] = useState(printFinishes[initialItem][0].id);
  const [ticks, setTicks] = useState<boolean[]>([false, false, false]);
  const [zone, setZone] = useState<DeliveryZone>('lagos');
  const [r, setR] = useState({ name: current.ownerName || '', phone: kit.phone, address: '', landmark: '', state: 'Lagos' });
  const [method, setMethod] = useState<PrintPayMethod>('card');
  const [cardOutcome, setCardOutcome] = useState<'success' | 'declined'>('success');
  const [tried, setTried] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep('options');
    setItem(initialItem);
    setQty(printPrices[initialItem][0].qty);
    setFinish(printFinishes[initialItem][0].id);
    setTicks([false, false, false]);
    setTried(false);
    setPaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pickItem = (i: OrderableItem) => {
    setItem(i);
    setQty(printPrices[i][0].qty);
    setFinish(printFinishes[i][0].id);
    setTicks([false, false, false]);
  };

  const ds = item === 'card' && kit.cardBack;
  const q = quote(item, qty, finish, zone, ds);
  const eta = useMemo(() => estimateArrival(zone), [zone]);
  const spec = kitItems.find((k) => k.id === item)!;
  const verified = isVerified(money.data);
  const available = balances(money.data).available;
  const walletBlock = !canWallet.allowed ? canWallet.reason || 'Only the Owner can pay from the wallet.' : !verified ? 'Finish business verification to pay from your wallet.' : available < q.totalNgn ? `Your wallet has ${formatNgn(available)} available.` : null;

  const digits = r.phone.replace(/\D/g, '');
  const phoneOk = /^0[789][01]\d{8}$/.test(digits) || /^234[789][01]\d{8}$/.test(digits);
  const deliveryErrors = {
    name: r.name.trim() ? '' : 'Who should receive it?',
    phone: phoneOk ? '' : 'Enter a Nigerian mobile number, e.g. 0803 123 4567',
    address: zone === 'pickup' || r.address.trim().length >= 8 ? '' : 'Add the street address'
  };
  const deliveryValid = !Object.values(deliveryErrors).some(Boolean);
  const idx = steps.findIndex((s) => s.id === step);

  const next = () => {
    setTried(true);
    if (step === 'proof' && ticks.some((t) => !t)) return;
    if (step === 'delivery' && !deliveryValid) return;
    setTried(false);
    setStep(steps[idx + 1].id);
  };

  const pay = () => {
    if (method === 'wallet' && walletBlock) return toast.error('Can’t pay from the wallet', { description: walletBlock });
    setPaying(true);
    window.setTimeout(() => {
      if (method === 'card' && cardOutcome === 'declined') {
        setPaying(false);
        toast.error('Card declined', { description: 'Nothing was charged. Try another card or pay from your wallet.' });
        return;
      }
      const at = new Date().toISOString();
      const order: PrintOrder = {
        id: uid('pord'),
        ref: printRef(),
        item,
        quantity: qty,
        finish: printFinishes[item].find((f) => f.id === finish)?.label ?? finish,
        details: kit,
        qrLinkName,
        qrUrl,
        zone,
        recipient: { ...r, address: zone === 'pickup' ? '' : r.address.trim(), landmark: r.landmark.trim() },
        subtotalNgn: q.subtotalNgn,
        deliveryNgn: q.deliveryNgn,
        totalNgn: q.totalNgn,
        payMethod: method,
        placedAt: at,
        placedBy: team.me.name,
        skipped: 0
      };
      if (method === 'wallet') money.update((m) => ({ ...m, ledger: [{ id: uid('led'), at, kind: 'purchase', amountNgn: -q.totalNgn, state: 'available', label: `Prints · ${order.ref}` }, ...m.ledger] }));
      store.update((d) => ({ ...d, orders: [order, ...d.orders] }));
      team.log('pages', `ordered ${qty} ${spec.label.toLowerCase()} from the print shop (${formatNgn(q.totalNgn)})`, '/app/domains/kit');
      setPaying(false);
      toast.success(`Print order ${order.ref} placed`, { description: `${PRINT_PARTNER} starts printing within the hour. Test mode.` });
      onPlaced(order);
    }, 700);
  };

  const scale = Math.min(1, 300 / (spec.widthMm * 3.78), 260 / (spec.heightMm * 3.78));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      title="Order prints"
      description={`Printed and delivered by ${PRINT_PARTNER} · Partner simulated · Test mode`}
      footer={
      <div className="flex w-full items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-caption text-fg-subtle">Total</p>
            <p className="text-heading font-semibold tabular-nums text-fg">{formatNgn(step === 'options' || step === 'proof' ? q.subtotalNgn : q.totalNgn)}</p>
          </div>
          <div className="flex gap-2">
            {idx > 0 &&
          <Button variant="tertiary" onClick={() => setStep(steps[idx - 1].id)} disabled={paying}>
                Back
              </Button>
          }
            {step === 'pay' ?
          <Button leadingIcon={method === 'wallet' ? WalletIcon : CreditCardIcon} loading={paying} disabled={method === 'wallet' && !!walletBlock} onClick={pay}>
                Pay {formatNgn(q.totalNgn)}
              </Button> :

          <Button onClick={next}>Continue</Button>
          }
          </div>
        </div>
      }>
      
      <div className="flex flex-col gap-6 px-5 py-5 md:px-6">
        <ol className="grid grid-cols-4 gap-2" aria-label="Steps">
          {steps.map((s, i) =>
          <li key={s.id} aria-current={i === idx ? 'step' : undefined} className="flex flex-col gap-1.5">
              <span className={cn('h-1 rounded-full', i <= idx ? 'bg-action' : 'bg-line')} />
              <span className={cn('text-caption', i === idx ? 'font-semibold text-fg' : 'text-fg-subtle')}>{s.label}</span>
            </li>
          )}
        </ol>

        {step === 'options' &&
        <>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-label font-semibold text-fg">What to print</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {orderable.map((i) => {
                const k = kitItems.find((x) => x.id === i)!;
                return (
                  <ChoiceCard key={i} name="po-item" checked={item === i} onChange={() => pickItem(i)} title={k.label} detail={`From ${formatNgn(printPrices[i][0].ngn)}`} />);

              })}
              </div>
              <p className="text-caption text-fg-subtle">Receipt footers print on your own receipt printer, so they aren’t ordered here.</p>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-label font-semibold text-fg">How many</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {printPrices[item].map((p) => {
                const tq = quote(item, p.qty, finish, 'pickup', ds);
                return <ChoiceCard key={p.qty} name="po-qty" checked={qty === p.qty} onChange={() => setQty(p.qty)} title={p.qty.toLocaleString('en-NG')} detail={`${formatNgn(tq.subtotalNgn)} · ₦${Math.round(tq.unitNgn).toLocaleString('en-NG')} each`} />;
              })}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-label font-semibold text-fg">Paper</legend>
              <div className="flex flex-col gap-2">
                {printFinishes[item].map((f) =>
              <ChoiceCard key={f.id} name="po-finish" checked={finish === f.id} onChange={() => setFinish(f.id)} title={f.label} detail={f.upliftPct ? `${f.detail} · +${f.upliftPct}%` : f.detail} row />
              )}
              </div>
            </fieldset>
          </>
        }

        {step === 'proof' &&
        <>
            <div className="dot-stage flex items-center justify-center rounded-lg border border-line px-4 py-8">
              <div style={{ width: spec.widthMm * 3.78 * scale, height: spec.heightMm * 3.78 * scale }} className="shadow-lg">
                <iframe
                title={`${spec.label} proof`}
                srcDoc={kitPreviewDoc(item, kit, qrUrl)}
                style={{ width: spec.widthMm * 3.78, height: spec.heightMm * 3.78, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0, background: item === 'sticker' ? 'transparent' : '#fff' }}
                tabIndex={-1} />
              
              </div>
            </div>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-label">
              <dt className="text-fg-subtle">Item</dt>
              <dd className="text-fg">
                {qty.toLocaleString('en-NG')} × {spec.label} · {spec.widthMm} × {spec.heightMm} mm
              </dd>
              {ds &&
            <>
                  <dt className="text-fg-subtle">Sides</dt>
                  <dd className="text-fg">Double-sided — back as designed (+30%)</dd>
                </>
            }
              <dt className="text-fg-subtle">Paper</dt>
              <dd className="text-fg">{printFinishes[item].find((f) => f.id === finish)?.label}</dd>
              <dt className="text-fg-subtle">QR code</dt>
              <dd className="text-fg">{qrLinkName}</dd>
            </dl>
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-2 text-label font-semibold text-fg">Before it goes to print</legend>
              {proofChecks.map((c, i) =>
            <label key={c} className="flex min-h-[40px] cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-label text-fg hover:bg-sunken">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--action))]" checked={ticks[i]} onChange={(e) => setTicks(ticks.map((t, j) => j === i ? e.target.checked : t))} />
                  {c}
                </label>
            )}
              {tried && ticks.some((t) => !t) && <p role="alert" className="px-2 text-caption text-danger">Tick each check — prints can’t be changed once printing starts.</p>}
            </fieldset>
          </>
        }

        {step === 'delivery' &&
        <>
            <fieldset>
              <legend className="mb-2 text-label font-semibold text-fg">How it reaches you</legend>
              <div className="flex flex-col gap-2">
                {deliveryZones.map((z) =>
              <ChoiceCard key={z.id} name="po-zone" checked={zone === z.id} onChange={() => setZone(z.id)} title={z.label} detail={z.detail} aside={z.ngn ? formatNgn(z.ngn) : 'Free'} row />
              )}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="po-name" label="Receiver’s name" value={r.name} maxLength={60} error={tried ? deliveryErrors.name || undefined : undefined} onChange={(e) => setR({ ...r, name: e.target.value })} />
              <TextInput id="po-phone" label="Phone (the rider calls this)" type="tel" inputMode="tel" value={r.phone} error={tried ? deliveryErrors.phone || undefined : undefined} onChange={(e) => setR({ ...r, phone: e.target.value })} />
            </div>
            {zone !== 'pickup' &&
          <>
                <SelectInput<string>
              id="po-state"
              label="State"
              value={r.state}
              options={nigerianStates.map((s) => ({ value: s, label: s }))}
              onChange={(s) => {
                setR({ ...r, state: s });
                setZone(zoneForState(s));
              }}
              hint="Sets the delivery fee for you." />
            
                <TextInput id="po-address" label="Street address" placeholder="e.g. 14 Adeola Odeku Street, Victoria Island" value={r.address} maxLength={140} error={tried ? deliveryErrors.address || undefined : undefined} onChange={(e) => setR({ ...r, address: e.target.value })} />
                <TextInput id="po-landmark" label="Nearest landmark" optional placeholder="e.g. Opposite Mobil filling station" value={r.landmark} maxLength={80} onChange={(e) => setR({ ...r, landmark: e.target.value })} hint="Helps the rider find you faster." />
              </>
          }
            <InlineAlert tone="info" title={zone === 'pickup' ? 'Ready to pick up' : 'Estimated arrival'}>
              {zone === 'pickup' ? 'About ' : ''}
              {eta.earliest.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
              {eta.latest.getTime() !== eta.earliest.getTime() ? ` – ${eta.latest.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}` : ''}. Printing takes 2 working days; weekends and public holidays don’t count.
            </InlineAlert>
          </>
        }

        {step === 'pay' &&
        <>
            <dl className="flex flex-col divide-y divide-line border-y border-line text-label">
              <Row label={`${qty.toLocaleString('en-NG')} × ${spec.label}`} value={formatNgn(q.subtotalNgn)} />
              <Row label={deliveryZones.find((z) => z.id === zone)!.label} value={q.deliveryNgn ? formatNgn(q.deliveryNgn) : 'Free'} />
              <Row label="Total" value={formatNgn(q.totalNgn)} strong />
            </dl>
            <fieldset>
              <legend className="mb-2 text-label font-semibold text-fg">Pay with</legend>
              <div className="flex flex-col gap-2">
                <ChoiceCard name="po-pay" checked={method === 'wallet'} onChange={() => setMethod('wallet')} title="KUBICU wallet" detail={walletBlock ?? `${formatNgn(available)} available`} disabled={!!walletBlock} row />
                <ChoiceCard name="po-pay" checked={method === 'card'} onChange={() => setMethod('card')} title="Card" detail="Test card — choose what happens below" row />
              </div>
            </fieldset>
            {method === 'card' &&
          <fieldset className="rounded-md border border-dashed border-line-strong p-3">
                <legend className="px-1 text-caption font-medium text-fg-muted">Test card — choose what happens</legend>
                <div className="flex flex-wrap gap-4">
                  {(['success', 'declined'] as const).map((o) =>
              <label key={o} className="flex min-h-[32px] cursor-pointer items-center gap-2 text-label text-fg">
                      <input type="radio" name="po-card" className="h-4 w-4 accent-[rgb(var(--action))]" checked={cardOutcome === o} onChange={() => setCardOutcome(o)} />
                      {o === 'success' ? 'Payment goes through' : 'Card is declined'}
                    </label>
              )}
                </div>
              </fieldset>
          }
            <p className="flex items-start gap-2 text-caption text-fg-muted">
              <TruckIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
              You can cancel for a full refund until printing starts (about an hour after you pay).
            </p>
          </>
        }
      </div>
    </Sheet>);

}

function ChoiceCard({ name, checked, onChange, title, detail, aside, row, disabled }: {name: string;checked: boolean;onChange: () => void;title: string;detail: string;aside?: string;row?: boolean;disabled?: boolean;}) {
  return (
    <label
      className={cn(
        'relative flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus',
        row ? 'items-center' : 'flex-col',
        checked ? 'border-action bg-action-soft' : 'border-line bg-raised hover:border-line-strong',
        disabled && 'cursor-not-allowed opacity-60 hover:border-line'
      )}>
      
      <input type="radio" name={name} className="sr-only" checked={checked} disabled={disabled} onChange={onChange} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-label font-semibold text-fg">
          {title}
          {checked && <CheckIcon size={14} className="text-action" aria-hidden />}
        </span>
        <span className="mt-0.5 block text-caption text-fg-muted">{detail}</span>
      </span>
      {aside && <span className="shrink-0 text-label font-semibold tabular-nums text-fg">{aside}</span>}
    </label>);

}

function Row({ label, value, strong }: {label: string;value: string;strong?: boolean;}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={strong ? 'font-semibold text-fg' : 'text-fg-muted'}>{label}</dt>
      <dd className={cn('tabular-nums', strong ? 'font-semibold text-fg' : 'text-fg')}>{value}</dd>
    </div>);

}