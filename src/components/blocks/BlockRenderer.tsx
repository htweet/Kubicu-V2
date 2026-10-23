import React from 'react';
import type { Block, PageTheme, RenderMode } from '../../types/page';
import { ProfileBlock } from './ProfileBlock';
import { HeadingBlock } from './HeadingBlock';
import { TextBlock } from './TextBlock';
import { LinkBlock } from './LinkBlock';
import { SocialBlock } from './SocialBlock';
import { ImageBlock } from './ImageBlock';
import { VideoBlock } from './VideoBlock';
import { DividerBlock } from './DividerBlock';
import { SpacerBlock } from './SpacerBlock';
import { ContactBlock } from './ContactBlock';
import { FaqBlock } from './FaqBlock';
import { LeadFormBlock } from './LeadFormBlock';
import { ProductBlock } from './ProductBlock';
import { BookingBlock } from './BookingBlock';
import { WhatsAppBlock } from './WhatsAppBlock';
import { NewsletterBlock } from './NewsletterBlock';
import { GalleryBlock } from './GalleryBlock';
import { ProductGridBlock } from './ProductGridBlock';
import { MenuBlock } from './MenuBlock';
import { PricingBlock } from './PricingBlock';
import { TestimonialBlock } from './TestimonialBlock';
import { EventBlock } from './EventBlock';
import { CountdownBlock } from './CountdownBlock';
import { DownloadBlock } from './DownloadBlock';
import { PortfolioBlock } from './PortfolioBlock';
import { LocationBlock } from './LocationBlock';
import { SubscriptionBlock } from './SubscriptionBlock';
import { FormBlock } from './FormBlock';
import { ProofBlock } from './ProofBlock';
import { MembersOnlyBlock } from './MembersOnlyBlock';
import { TrustBadgeBlock } from './TrustBadgeBlock';

interface BlockRendererProps {
  block: Block;
  theme: PageTheme;
  mode: RenderMode;
}

export function BlockRenderer({ block, theme, mode }: BlockRendererProps) {
  switch (block.type) {
    case 'profile':
      return <ProfileBlock block={block} theme={theme} mode={mode} />;
    case 'heading':
      return <HeadingBlock block={block} theme={theme} mode={mode} />;
    case 'text':
      return <TextBlock block={block} theme={theme} mode={mode} />;
    case 'link':
      return <LinkBlock block={block} theme={theme} mode={mode} />;
    case 'social':
      return <SocialBlock block={block} theme={theme} mode={mode} />;
    case 'image':
      return <ImageBlock block={block} theme={theme} mode={mode} />;
    case 'video':
      return <VideoBlock block={block} theme={theme} mode={mode} />;
    case 'divider':
      return <DividerBlock block={block} theme={theme} mode={mode} />;
    case 'spacer':
      return <SpacerBlock block={block} theme={theme} mode={mode} />;
    case 'contact':
      return <ContactBlock block={block} theme={theme} mode={mode} />;
    case 'faq':
      return <FaqBlock block={block} theme={theme} mode={mode} />;
    case 'leadForm':
      return <LeadFormBlock block={block} theme={theme} mode={mode} />;
    case 'product':
      return <ProductBlock block={block} theme={theme} mode={mode} />;
    case 'booking':
      return <BookingBlock block={block} theme={theme} mode={mode} />;
    case 'whatsapp':
      return <WhatsAppBlock block={block} theme={theme} mode={mode} />;
    case 'newsletter':
      return <NewsletterBlock block={block} theme={theme} mode={mode} />;
    case 'gallery':
      return <GalleryBlock block={block} theme={theme} mode={mode} />;
    case 'productGrid':
      return <ProductGridBlock block={block} theme={theme} mode={mode} />;
    case 'menu':
      return <MenuBlock block={block} theme={theme} mode={mode} />;
    case 'pricing':
      return <PricingBlock block={block} theme={theme} mode={mode} />;
    case 'testimonial':
      return <TestimonialBlock block={block} theme={theme} mode={mode} />;
    case 'event':
      return <EventBlock block={block} theme={theme} mode={mode} />;
    case 'countdown':
      return <CountdownBlock block={block} theme={theme} mode={mode} />;
    case 'download':
      return <DownloadBlock block={block} theme={theme} mode={mode} />;
    case 'portfolio':
      return <PortfolioBlock block={block} theme={theme} mode={mode} />;
    case 'location':
      return <LocationBlock block={block} theme={theme} mode={mode} />;
    case 'subscription':
      return <SubscriptionBlock block={block} theme={theme} mode={mode} />;
    case 'form':
      return <FormBlock block={block} theme={theme} mode={mode} />;
    case 'proof':
      return <ProofBlock block={block} theme={theme} mode={mode} />;
    case 'membersOnly':
      return <MembersOnlyBlock block={block} theme={theme} mode={mode} />;
    case 'trustBadge':
      return <TrustBadgeBlock block={block} theme={theme} mode={mode} />;
    default:
      return null;
  }
}

export const spacingClass: Record<Block['layout']['spacing'], string> = {
  tight: 'py-1',
  normal: 'py-2',
  loose: 'py-4'
};