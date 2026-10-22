import React, { useMemo, useState } from 'react';
import { ArrowLeftIcon, GlobeIcon } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { DnsRecordsTable } from './DnsRecordsTable';
import { useDomains } from '../../contexts/DomainsContext';
import { useTeam } from '../../contexts/TeamContext';
import type { CheckOutcome } from '../../types/domains';
import { cleanHost, dnsRecords, guessKind, hostError, randomToken, registrars, subLabel, type RegistrarId } from '../../utils/domains/dns';

interface Props {
  open: boolean;
  onClose: () => void;
  spaces: {id: string;label: string;}[];
}

export const outcomeOptions: {value: CheckOutcome;label: string;}[] = [
{ value: 'success', label: 'Records correct → goes live' },
{ value: 'wrong_record', label: 'A record doesn’t match' },
{ value: 'timeout', label: 'DNS hasn’t updated yet' }];


/** Two steps: which domain and space, then the records to add and a first check (D62). */
export function ConnectDomainDialog({ open, onClose, spaces }: Props) {
  const { data, addDomain, checkDomain } = useDomains();
  const team = useTeam();
  const [step, setStep] = useState<1 | 2>(1);
  const [input, setInput] = useState('');
  const [kind, setKind] = useState<'root' | 'subdomain'>('root');
  const [kindTouched, setKindTouched] = useState(false);
  const [spaceId, setSpaceId] = useState(spaces[0]?.id ?? 'main');
  const [registrar, setRegistrar] = useState<RegistrarId>('whogohost');
  const [outcome, setOutcome] = useState<CheckOutcome>('success');
  const [token] = useState(randomToken);
  const [tried, setTried] = useState(false);

  const host = cleanHost(input);
  const effectiveKind = kindTouched ? kind : host ? guessKind(host) : kind;
  const error = hostError(host, data);
  const kindError = effectiveKind === 'subdomain' && host && !subLabel(host) ? 'This looks like a root domain. Add the part before it, like shop.adaeze.com.' : undefined;
  const records = useMemo(() => dnsRecords({ host, kind: effectiveKind, token }), [host, effectiveKind, token]);
  const tip = registrars.find((r) => r.id === registrar)?.tip;

  const close = () => {
    onClose();
    window.setTimeout(() => {
      setStep(1);
      setInput('');
      setKindTouched(false);
      setTried(false);
    }, 200);
  };

  const next = () => {
    setTried(true);
    if (error || kindError) return;
    setStep(2);
  };

  const finish = () => {
    const id = addDomain({ host, kind: effectiveKind, spaceId, token });
    checkDomain(id, outcome);
    team.log('settings', `connected the domain ${host}`, '/app/domains');
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title={step === 1 ? 'Connect a domain' : `Add these records for ${host}`}
      description={step === 1 ? 'Use a domain you already own. You’ll add a few records where you bought it — about 5 minutes.' : 'At your domain registrar, add each record exactly as shown. Then check — we’ll take it from there.'}
      footer={
      step === 1 ?
      <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={next}>Continue</Button>
          </> :

      <>
            <Button variant="secondary" leadingIcon={ArrowLeftIcon} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={finish}>I’ve added them — check now</Button>
          </>

      }>
      
      {step === 1 ?
      <div className="flex flex-col gap-5">
          <TextInput
          id="dom-host"
          label="Your domain"
          placeholder="adaeze.com"
          leadingIcon={GlobeIcon}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          error={tried ? error : undefined}
          hint="Paste it any way you like — we’ll tidy it up." />
        
          <div className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-fg" id="dom-kind-label">
              Use it as
            </span>
            <Segmented<'root' | 'subdomain'>
            ariaLabel="Use it as"
            fullWidth
            value={effectiveKind}
            onChange={(v) => {
              setKind(v);
              setKindTouched(true);
            }}
            options={[
            { value: 'root', label: 'The whole domain' },
            { value: 'subdomain', label: 'A subdomain' }]
            } />
          
            <p className={tried && kindError ? 'text-caption text-danger' : 'text-caption text-fg-subtle'}>
              {tried && kindError ?
            kindError :
            effectiveKind === 'root' ?
            `${host || 'adaeze.com'} and www.${host || 'adaeze.com'} will show your page.` :
            `Only ${host || 'shop.adaeze.com'} shows your page — your other website and email stay as they are.`}
            </p>
          </div>
          <SelectInput id="dom-space" label="Which space it shows" value={spaceId} options={spaces.map((s) => ({ value: s.id, label: s.label }))} onChange={setSpaceId} hint="Your kub.icu link keeps working either way." />
        </div> :

      <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <SelectInput<RegistrarId> id="dom-registrar" label="Where did you buy it?" value={registrar} options={registrars.map((r) => ({ value: r.id, label: r.name }))} onChange={setRegistrar} />
            <p className="flex items-start gap-1.5 text-caption text-fg-muted">
              <span>{tip}</span>
              <IllustrativeTag note="Registrar steps are illustrative — menus differ and change over time." />
            </p>
          </div>
          <DnsRecordsTable records={records} />
          <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
            Changes usually show within an hour, sometimes up to 48 hours. You can close this — we’ll keep the records on the domain card.
            <IllustrativeTag note="Target addresses are examples until hosting is chosen (D62)." />
          </p>
          <div className="rounded-md border border-dashed border-line-strong p-3">
            <SelectInput<CheckOutcome> id="dom-outcome" label="Prototype: what the check finds" value={outcome} options={outcomeOptions} onChange={setOutcome} hint="Real DNS isn’t checked in this prototype." />
          </div>
        </div>
      }
    </Dialog>);

}