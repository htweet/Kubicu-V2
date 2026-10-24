import React, { useState } from 'react';
import { toast } from 'sonner';
import { UploadIcon } from 'lucide-react';
import type { LegalDoc } from '../../../types/legal';
import type { PolicyRelease } from '../../../types/admin';
import { allLegalDocs } from '../../../data/legal';
import { audit, staffActor, useAdminStore } from '../../../utils/admin/store';
import { uid } from '../../../utils/id';
import { formatRelative } from '../../../utils/format';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { SelectInput } from '../../ui/SelectInput';
import { TextArea } from '../../ui/TextArea';
import { TextInput } from '../../ui/TextInput';
import { ReasonDialog } from '../ReasonDialog';

const reacceptLabel: Record<PolicyRelease['reaccept'], string> = { none: 'Notice only', paid: 'Paid workspaces must agree again', all: 'Everyone must agree again' };

const newer = (a: string, b: string) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0);
  }
  return false;
};

/** Policy versions with "Publish new version" (D135). Publishing posts a notice to every workspace. */
export function PolicyReleasesCard() {
  const [store, setStore] = useAdminStore();
  const [doc, setDoc] = useState<LegalDoc | null>(null);
  const [version, setVersion] = useState('');
  const [summary, setSummary] = useState('');
  const [reaccept, setReaccept] = useState<PolicyRelease['reaccept']>('none');
  const [errors, setErrors] = useState<{version?: string;summary?: string;}>({});

  const currentVersion = (d: LegalDoc) => store.policyReleases[d.slug]?.[0]?.version ?? String(d.version);

  const open = (d: LegalDoc) => {
    const cur = currentVersion(d).split('.').map(Number);
    setVersion(`${cur[0]}.${(cur[1] ?? 0) + 1}`);
    setSummary('');
    setReaccept('none');
    setErrors({});
    setDoc(d);
  };

  const publish = (reason: string) => {
    if (!doc) return;
    const e: typeof errors = {};
    if (!/^\d+(\.\d+){0,2}$/.test(version)) e.version = 'Use numbers like 2.1.';else
    if (!newer(version, currentVersion(doc))) e.version = `Must be newer than ${currentVersion(doc)}.`;
    if (summary.trim().length < 20) e.summary = 'Explain the change in a sentence or two — customers read this.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const at = new Date().toISOString();
    const release: PolicyRelease = { version, publishedAt: at, by: staffActor(store), summary: summary.trim(), reaccept };
    setStore((s) =>
    audit(
      {
        ...s,
        policyReleases: { ...s.policyReleases, [doc.slug]: [release, ...(s.policyReleases[doc.slug] ?? [])] },
        announcements: [{ id: uid('ann'), title: `${doc.title} updated to version ${version}`, body: `${summary.trim()}${reaccept !== 'none' ? ` ${reaccept === 'all' ? 'Everyone' : 'Paid workspaces'} will be asked to agree to the new version.` : ''}`, tone: reaccept === 'none' ? 'info' : 'warning', audience: 'all', active: true, createdAt: at }, ...s.announcements]
      },
      { area: 'localisation', action: `Published ${doc.title} v${version} (${reacceptLabel[reaccept].toLowerCase()})`, target: doc.title, reason }
    )
    );
    toast.success(`${doc.title} v${version} published`, { description: 'A notice now shows to every workspace. It can be switched off in Announcements.' });
    setDoc(null);
  };

  return (
    <>
      <Card id="policies" title="Policy versions" description="Publishing a new version posts a notice to every workspace and records who must agree again." body="flush">
        <ul className="divide-y divide-line">
          {allLegalDocs.map((d) => {
            const last = store.policyReleases[d.slug]?.[0];
            return (
              <li key={d.slug} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-4 md:px-6">
                <span className="min-w-0 flex-1">
                  <a href={`/about/${d.slug}`} target="_blank" rel="noreferrer" className="text-label font-medium text-fg hover:underline">
                    {d.title}
                  </a>
                  <span className="block text-caption tabular-nums text-fg-subtle">
                    v{currentVersion(d)} · {last ? `published ${formatRelative(last.publishedAt)} by ${last.by.split(' ·')[0]}` : d.updated}
                  </span>
                  {last && last.reaccept !== 'none' &&
                  <Badge tone="warning" className="mt-1">
                      {reacceptLabel[last.reaccept]}
                    </Badge>
                  }
                </span>
                <Button size="sm" variant="tertiary" leadingIcon={UploadIcon} onClick={() => open(d)}>
                  New version
                </Button>
              </li>);

          })}
        </ul>
      </Card>

      <ReasonDialog open={!!doc} onClose={() => setDoc(null)} onConfirm={publish} title={`Publish ${doc?.title ?? ''}`} description="The wording itself ships with a release after legal review. This records the version, tells customers what changed and who must agree again." confirmLabel="Publish version">
        <TextInput id="policy-version" label="Version" value={version} error={errors.version} onChange={(e) => setVersion(e.target.value.replace(/[^\d.]/g, ''))} fieldClassName="w-32" />
        <TextArea id="policy-summary" label="What changed (customers see this)" rows={3} value={summary} error={errors.summary} placeholder="e.g. We now explain how pay-on-delivery refunds work and how long they take." onChange={(e) => setSummary(e.target.value)} />
        <SelectInput<PolicyRelease['reaccept']>
          id="policy-reaccept"
          label="Who must agree again"
          value={reaccept}
          onChange={setReaccept}
          options={[
          { value: 'none', label: 'Nobody — notice only' },
          { value: 'paid', label: 'Paid workspaces' },
          { value: 'all', label: 'Everyone' }]
          } />
        
      </ReasonDialog>
    </>);

}