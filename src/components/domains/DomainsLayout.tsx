import React from 'react';
import { ModuleLayout } from '../shell/ModuleLayout';
import { useDomains } from '../../contexts/DomainsContext';

export function DomainsLayout() {
  const { data } = useDomains();
  const problems = data.domains.filter((d) => d.status === 'problem').length;
  return (
    <ModuleLayout
      label="Domains & QR"
      items={[
      { to: '/app/domains', label: 'Domains', end: true, badge: problems },
      { to: '/app/domains/qr', label: 'QR codes' },
      { to: '/app/domains/links', label: 'Campaign links' },
      { to: '/app/domains/redirects', label: 'Redirects' }]
      } />);


}