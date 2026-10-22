import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheckIcon, SwatchBookIcon } from 'lucide-react';
import { adminNavItems } from '../../data/adminNavigation';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

export function AdminPlannedArea() {
  const { area } = useParams();
  const navigate = useNavigate();
  const item = adminNavItems.find((i) => i.id === area);

  if (!item) {
    return (
      <div className="py-16">
        <EmptyState
          icon={SwatchBookIcon}
          title="That admin area doesn’t exist"
          description="It may have moved. Design system is available now."
          action={<Button onClick={() => navigate('/admin/design-system')}>Open design system</Button>} />
        
      </div>);

  }

  const Icon = item.icon;
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 md:px-10 md:py-16">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-raised text-fg-muted">
          <Icon size={18} aria-hidden />
        </span>
        <Badge tone="neutral">Planned · Batch 6</Badge>
      </div>
      <h1 className="mt-6 font-display text-title font-semibold text-fg">{item.label}</h1>
      <p className="mt-3 max-w-xl text-body text-fg-muted md:text-[17px] md:leading-relaxed">{item.summary}</p>
      <div className="mt-8 flex items-start gap-3 rounded-md bg-sunken px-4 py-3.5">
        <ShieldCheckIcon size={17} className="mt-0.5 shrink-0 text-action" aria-hidden />
        <p className="text-label text-fg">
          Every action here will be limited by staff role, confirmed when risky and recorded in the audit log. There is no single all-powerful admin role.
        </p>
      </div>
      <div className="mt-10">
        <Button leadingIcon={SwatchBookIcon} onClick={() => navigate('/admin/design-system')}>
          Go to design system
        </Button>
      </div>
      <p className="mt-6 text-caption text-fg-subtle">Nothing on this screen is functional yet.</p>
    </div>);

}