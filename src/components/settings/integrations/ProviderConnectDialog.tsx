import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import type { ProviderDef } from '../../../data/providers';
import { fieldErrors, testConnection, type SimulatedOutcome } from '../../../utils/providers/adapters';
import { useProviders } from '../../../hooks/useProviders';
import { Dialog } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { TextInput } from '../../ui/TextInput';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { InlineAlert } from '../../ui/InlineAlert';

interface Props {
  def: ProviderDef | null;
  onClose: () => void;
  /** Extra fields that belong to the screen, e.g. the business name on Payments. */
  extra?: React.ReactNode;
  /** Blocks Connect until the extra fields are filled. */
  extraValid?: boolean;
  /** Runs after a successful (simulated) connection. */
  onConnected?: (def: ProviderDef) => void;
}

type Phase = 'form' | 'working' | 'done' | 'failed';

/** Enter test credentials for one provider, check their shape, then simulate the connection (D192). */
export function ProviderConnectDialog({ def, onClose, extra, extraValid = true, onConnected }: Props) {
  const providers = useProviders();
  const [values, setValues] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [message, setMessage] = useState('');
  const [outcome, setOutcome] = useState<SimulatedOutcome>('success');

  useEffect(() => {
    if (!def) return;
    setValues(providers.data.connections[def.id]?.values ?? {});
    setTried(false);
    setPhase('form');
    setOutcome('success');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def?.id]);

  if (!def) return <Dialog open={false} onClose={onClose} title="" />;
  const errors = fieldErrors(def, values);
  const invalid = Object.keys(errors).length > 0 || !extraValid;

  const submit = async () => {
    setTried(true);
    if (invalid) return;
    setPhase('working');
    const r = await testConnection(def, outcome);
    setMessage(r.message);
    providers.log(def.id, 'Connect', r.ok, r.message);
    if (!r.ok) return setPhase('failed');
    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
    providers.connect(def.id, clean, r.message);
    onConnected?.(def);
    setPhase('done');
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={phase === 'done' ? `${def.name} connected` : phase === 'failed' ? 'Couldn’t connect' : `Connect ${def.name}`}
      description={phase === 'form' || phase === 'working' ? def.whereToFind : undefined}
      footer={
        phase === 'done' || phase === 'failed' ? (
          <>
            {phase === 'failed' && (
              <Button variant="secondary" onClick={() => setPhase('form')}>
                Try again
              </Button>
            )}
            <Button onClick={onClose}>Done</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} loading={phase === 'working'}>
              Connect
            </Button>
          </>
        )
      }
    >
      {phase === 'done' ? (
        <p className="flex items-start gap-2 text-label text-fg-muted">
          <CheckCircle2Icon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
          {message}
        </p>
      ) : phase === 'failed' ? (
        <p className="flex items-start gap-2 text-label text-fg-muted">
          <XCircleIcon size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden />
          {message}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <InlineAlert tone="warning" title="Test keys only">
            Keys are saved in this browser for the prototype and every call is simulated. Never paste live keys.
          </InlineAlert>
          {extra}
          {def.fields.map((f) => (
            <TextInput
              key={f.key}
              id={`prov-${def.id}-${f.key}`}
              label={f.label}
              optional={f.optional}
              type={f.secret ? 'password' : 'text'}
              autoComplete="off"
              spellCheck={false}
              placeholder={f.placeholder}
              hint={f.hint}
              value={values[f.key] ?? ''}
              error={tried ? errors[f.key] : undefined}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          ))}
          <div className="rounded-md border border-dashed border-line-strong p-3">
            <Field id={`prov-${def.id}-sim`} label="Prototype: what the provider says">
              <Segmented<SimulatedOutcome>
                ariaLabel="Simulated result"
                value={outcome}
                onChange={setOutcome}
                options={[
                  { value: 'success', label: 'Accepts' },
                  { value: 'rejected', label: 'Rejects keys' },
                  { value: 'down', label: 'No response' },
                ]}
              />
            </Field>
          </div>
        </div>
      )}
    </Dialog>
  );
}
