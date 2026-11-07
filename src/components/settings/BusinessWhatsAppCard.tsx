import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckIcon, MessageCircleIcon, PlugZapIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { Card } from '../ui/layout/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PhoneInput } from '../ui/PhoneInput';
import { InlineAlert } from '../ui/InlineAlert';
import { isValidPhone } from '../../utils/validation';
import { phoneIssueIn } from '../../utils/phone';
import { whatsappLink } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';
import { AccountStateAlert } from '../account/AccountStates';
import { useAccountSave, SaveStatus } from '../accountMode/useAccountSave';

const usedBy = ['WhatsApp buttons', 'Menus and products set to “Order on WhatsApp”', 'Your shop', 'Contact buttons', 'Booking pages (when there are no free times)', 'Order and booking status pages'];

/**
 * Settings → Business → WhatsApp (D214). One number, entered once; every WhatsApp button uses it
 * unless that block has its own. Chat buttons need no API — only automatic messages do.
 */
export function BusinessWhatsAppCard() {
  const { t: tr } = useT();
  const { current, update } = useWorkspace();
  const can = useTeam().can('commerce.settings');
  const saved = current.whatsapp ?? '';
  const [value, setValue] = useState(saved);
  const [tried, setTried] = useState(false);
  useEffect(() => setValue(saved), [saved]);

  const trimmed = value.trim();
  const error = trimmed && !isValidPhone(trimmed) ? phoneIssueIn(tr, trimmed) ?? tr('Phone number looks incomplete') : '';
  const dirty = trimmed !== saved;

  // Account mode (D545): saved to the server first; on failure the saved number stays and the reason shows.
  const server = useAccountSave();
  const save = async () => {
    setTried(true);
    if (error) return;
    if (server.active) {
      const outcome = await server.run({ action: 'settings.save', refusal: tr('You need permission to change business settings.') });
      if (outcome !== 'ok') {
        if (outcome !== 'cancelled') setValue(saved);
        return;
      }
    }
    update(current.id, { whatsapp: trimmed });
    toast.success(tr(trimmed ? 'Business WhatsApp number saved' : 'Business WhatsApp number removed'), {
      description: tr(trimmed ? 'Every WhatsApp button without its own number now uses it.' : 'Buttons without their own number won’t show a WhatsApp link.'),
    });
  };

  return (
    <Card id="whatsapp" title="Business WhatsApp number" description="Set it once. Every WhatsApp button, menu, product, shop and booking page uses it — you don’t type it again." emphasis="primary">
      <div className="flex flex-col gap-6">
        {!can.allowed && (
          <InlineAlert tone="info" title="You can’t change this">
            {can.reason}
          </InlineAlert>
        )}
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="sm:w-80">
            <PhoneInput id="ws-whatsapp" label="WhatsApp number" value={value} disabled={!can.allowed} error={tried && error ? error : undefined} onChange={setValue} />
          </div>
          <div className="flex gap-2 sm:pt-7">
            <Button type="submit" loading={server.busy} disabled={!can.allowed || !dirty}>
              Save
            </Button>
            {saved && isValidPhone(saved) && (
              <Button variant="secondary" onClick={() => window.open(whatsappLink(saved, ''), '_blank', 'noopener')}>
                Test the link
              </Button>
            )}
          </div>
        </form>
        {server.active && <SaveStatus state={server.state} className="-mt-4" />}
        {server.screenFailure && <AccountStateAlert failure={server.screenFailure} />}

        <div>
          <p className="text-label font-medium text-fg">{tr('Used by')}</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {usedBy.map((u) => (
              <li key={u} className="flex items-start gap-2 text-label text-fg-muted">
                <CheckIcon size={15} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
                {tr(u)}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-caption text-fg-subtle">{tr('A block can still use a different number (a branch line, say) — type it in that block and it overrides this one there only.')}</p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
          <section className="flex flex-col gap-2 bg-surface p-4" aria-labelledby="wa-buttons">
            <div className="flex items-center justify-between gap-3">
              <h3 id="wa-buttons" className="flex items-center gap-2 text-label font-semibold text-fg">
                <MessageCircleIcon size={16} aria-hidden /> {tr('Chat buttons')}
              </h3>
              <Badge tone={saved ? 'success' : 'neutral'} dot>
                {saved ? 'On' : 'Add a number'}
              </Badge>
            </div>
            <p className="text-caption text-fg-muted">{tr('Opens WhatsApp with your number and a ready-typed message. Works with the normal WhatsApp or WhatsApp Business app — no API, account approval or connection needed.')}</p>
          </section>
          <section className="flex flex-col gap-2 bg-surface p-4" aria-labelledby="wa-auto">
            <div className="flex items-center justify-between gap-3">
              <h3 id="wa-auto" className="flex items-center gap-2 text-label font-semibold text-fg">
                <PlugZapIcon size={16} aria-hidden /> {tr('Automatic messages & inbox')}
              </h3>
              <Badge tone="neutral">Optional</Badge>
            </div>
            <p className="text-caption text-fg-muted">{tr('Order and booking updates, auto-replies and a shared inbox. WhatsApp only allows these through the WhatsApp Business API, via a Meta-approved partner.')}</p>
            <Link to="/app/whatsapp" className="mt-auto text-caption font-semibold text-fg underline underline-offset-2">
              {tr('Set up in the WhatsApp app')}
            </Link>
          </section>
        </div>
      </div>
    </Card>
  );
}
