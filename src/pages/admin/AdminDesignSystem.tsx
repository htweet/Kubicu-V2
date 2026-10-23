import React from 'react';
import { PageHeader } from '../../components/shell/PageHeader';
import { DsSection } from '../../components/design-system/DsSection';
import { AppearancePolicyPanel } from '../../components/design-system/AppearancePolicyPanel';
import { ColorTokens } from '../../components/design-system/ColorTokens';
import { Foundations } from '../../components/design-system/Foundations';
import { ControlGallery } from '../../components/design-system/ControlGallery';
import { FeedbackGallery } from '../../components/design-system/FeedbackGallery';
import { DataGallery } from '../../components/design-system/DataGallery';
import { AccessibilityRules } from '../../components/design-system/AccessibilityRules';

const sections = [
{ id: 'appearances', label: 'Workspace appearances' },
{ id: 'colour', label: 'Colour tokens' },
{ id: 'foundations', label: 'Type, space & motion' },
{ id: 'controls', label: 'Controls' },
{ id: 'data', label: 'Data' },
{ id: 'feedback', label: 'Feedback & overlays' },
{ id: 'accessibility', label: 'Accessibility rules' }];


export function AdminDesignSystem() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader
        title="Design system"
        description="Decide which appearances workspaces can use, and inspect the tokens and components every screen is built from." />
      
      <div className="mt-10 grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-8 flex flex-col gap-1 border-l border-line">
            {sections.map((s) =>
            <li key={s.id}>
                <a
                href={`#${s.id}`}
                className="-ml-px block border-l border-transparent py-1 pl-3 text-label text-fg-muted transition-colors duration-150 hover:border-line-strong hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                
                  {s.label}
                </a>
              </li>
            )}
          </ul>
        </nav>
        <div className="flex min-w-0 flex-col gap-12">
          <DsSection
            id="appearances"
            title="Workspace appearances"
            description="Four production appearances share one component library. Choose which ones workspace users can pick and which one new workspaces start with.">
            
            <AppearancePolicyPanel />
          </DsSection>
          <DsSection id="colour" title="Colour tokens" description="Shown for the appearance you’re previewing. Components never reference a hex value directly.">
            <ColorTokens />
          </DsSection>
          <DsSection id="foundations" title="Type, space & motion">
            <Foundations />
          </DsSection>
          <DsSection id="controls" title="Controls" description="Every control has default, hover, focus, pressed, disabled and loading states. Tab through to see focus rings.">
            <ControlGallery />
          </DsSection>
          <DsSection id="data" title="Data" description="Tables for operational lists and charts that answer one question. Both have loading, empty and error states.">
            <DataGallery />
          </DsSection>
          <DsSection id="feedback" title="Feedback & overlays" description="Empty, loading, success, warning, conflict and failure states are designed, not left to chance.">
            <FeedbackGallery />
          </DsSection>
          <DsSection id="accessibility" title="Accessibility rules" description="WCAG 2.1 AA, plus dragging alternatives and 24px targets from 2.2. The shared parts already follow these — new screens must too.">
            <AccessibilityRules />
          </DsSection>
        </div>
      </div>
    </div>);

}