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
import { CourseBlock } from './CourseBlock';
import { FormBlock } from './FormBlock';
import { ProofBlock } from './ProofBlock';
import { MembersOnlyBlock } from './MembersOnlyBlock';
import { TrustBadgeBlock } from './TrustBadgeBlock';
import { AudioBlock } from './AudioBlock';
import { PlaylistBlock } from './PlaylistBlock';
import { CollectionBlock } from './CollectionBlock';
import { SupportBlock } from './SupportBlock';
import { HeroBlock } from './HeroBlock';
import { FeatureGridBlock } from './FeatureGridBlock';
import { StepsBlock } from './StepsBlock';
import { LogoStripBlock } from './LogoStripBlock';
import { FiguresBlock } from './FiguresBlock';
import { MediaListBlock } from './MediaListBlock';
import { ListingsBlock } from './ListingsBlock';
import { SectionBlock } from './SectionBlock';
import { ColumnsBlock } from './ColumnsBlock';
import { TabsBlock } from './TabsBlock';
import { AnnouncementBlock } from './AnnouncementBlock';
import { CtaBlock } from './CtaBlock';
import { QuoteBlock } from './QuoteBlock';
import { TimelineBlock } from './TimelineBlock';
import { ComparisonBlock } from './ComparisonBlock';
import { BeforeAfterBlock } from './BeforeAfterBlock';
import { TeamBlock } from './TeamBlock';
import { CredentialsBlock } from './CredentialsBlock';
import { PressBlock } from './PressBlock';
import { HoursBlock } from './HoursBlock';
import { AgendaBlock } from './AgendaBlock';
import { ContactActionsBlock } from './ContactActionsBlock';
import { ShareBlock } from './ShareBlock';
import { AnchorNavBlock } from './AnchorNavBlock';
import { PoliciesBlock } from './PoliciesBlock';
import { DeliveryBlock } from './DeliveryBlock';
import { CarouselBlock } from './CarouselBlock';
import { BrandHeaderBlock } from './BrandHeaderBlock';
import { LinkCollectionBlock } from './LinkCollectionBlock';
import { QrCodeBlock } from './QrCodeBlock';
import { DocumentBlock } from './DocumentBlock';
import { EmbedBlock } from './EmbedBlock';
import { ShopCategoriesBlock } from './ShopCategoriesBlock';
import { CheckoutButtonBlock } from './CheckoutButtonBlock';
import { PollBlock } from './PollBlock';
import { CommunityBlock } from './CommunityBlock';
import { ReviewSummaryBlock } from './ReviewSummaryBlock';
import { LanguageSwitchBlock } from './LanguageSwitchBlock';
import { SmartButtonBlock } from './SmartButtonBlock';
import { CampaignSpotlightBlock } from './CampaignSpotlightBlock';
import { RecommendationsBlock } from './RecommendationsBlock';
import { BackToTopBlock } from './BackToTopBlock';

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
    case 'course':
      return <CourseBlock block={block} theme={theme} mode={mode} />;
    case 'form':
      return <FormBlock block={block} theme={theme} mode={mode} />;
    case 'proof':
      return <ProofBlock block={block} theme={theme} mode={mode} />;
    case 'membersOnly':
      return <MembersOnlyBlock block={block} theme={theme} mode={mode} />;
    case 'trustBadge':
      return <TrustBadgeBlock block={block} theme={theme} mode={mode} />;
    case 'audio':
      return <AudioBlock block={block} theme={theme} mode={mode} />;
    case 'playlist':
      return <PlaylistBlock block={block} theme={theme} mode={mode} />;
    case 'collection':
      return <CollectionBlock block={block} theme={theme} mode={mode} />;
    case 'support':
      return <SupportBlock block={block} theme={theme} mode={mode} />;
    case 'hero':
      return <HeroBlock block={block} theme={theme} mode={mode} />;
    case 'featureGrid':
      return <FeatureGridBlock block={block} theme={theme} mode={mode} />;
    case 'steps':
      return <StepsBlock block={block} theme={theme} mode={mode} />;
    case 'logoStrip':
      return <LogoStripBlock block={block} theme={theme} mode={mode} />;
    case 'figures':
      return <FiguresBlock block={block} theme={theme} mode={mode} />;
    case 'mediaList':
      return <MediaListBlock block={block} theme={theme} mode={mode} />;
    case 'listings':
      return <ListingsBlock block={block} theme={theme} mode={mode} />;
    case 'section':
      return <SectionBlock block={block} theme={theme} mode={mode} />;
    case 'columns':
      return <ColumnsBlock block={block} theme={theme} mode={mode} />;
    case 'tabs':
      return <TabsBlock block={block} theme={theme} mode={mode} />;
    case 'announcement':
      return <AnnouncementBlock block={block} theme={theme} mode={mode} />;
    case 'cta':
      return <CtaBlock block={block} theme={theme} mode={mode} />;
    case 'quote':
      return <QuoteBlock block={block} theme={theme} mode={mode} />;
    case 'timeline':
      return <TimelineBlock block={block} theme={theme} mode={mode} />;
    case 'comparison':
      return <ComparisonBlock block={block} theme={theme} mode={mode} />;
    case 'beforeAfter':
      return <BeforeAfterBlock block={block} theme={theme} mode={mode} />;
    case 'team':
      return <TeamBlock block={block} theme={theme} mode={mode} />;
    case 'credentials':
      return <CredentialsBlock block={block} theme={theme} mode={mode} />;
    case 'press':
      return <PressBlock block={block} theme={theme} mode={mode} />;
    case 'hours':
      return <HoursBlock block={block} theme={theme} mode={mode} />;
    case 'agenda':
      return <AgendaBlock block={block} theme={theme} mode={mode} />;
    case 'contactActions':
      return <ContactActionsBlock block={block} theme={theme} mode={mode} />;
    case 'share':
      return <ShareBlock block={block} theme={theme} mode={mode} />;
    case 'anchorNav':
      return <AnchorNavBlock block={block} theme={theme} mode={mode} />;
    case 'policies':
      return <PoliciesBlock block={block} theme={theme} mode={mode} />;
    case 'delivery':
      return <DeliveryBlock block={block} theme={theme} mode={mode} />;
    case 'carousel':
      return <CarouselBlock block={block} theme={theme} mode={mode} />;
    case 'brandHeader':
      return <BrandHeaderBlock block={block} theme={theme} mode={mode} />;
    case 'linkCollection':
      return <LinkCollectionBlock block={block} theme={theme} mode={mode} />;
    case 'qrCode':
      return <QrCodeBlock block={block} theme={theme} mode={mode} />;
    case 'document':
      return <DocumentBlock block={block} theme={theme} mode={mode} />;
    case 'embed':
      return <EmbedBlock block={block} theme={theme} mode={mode} />;
    case 'shopCategories':
      return <ShopCategoriesBlock block={block} theme={theme} mode={mode} />;
    case 'checkoutButton':
      return <CheckoutButtonBlock block={block} theme={theme} mode={mode} />;
    case 'poll':
      return <PollBlock block={block} theme={theme} mode={mode} />;
    case 'community':
      return <CommunityBlock block={block} theme={theme} mode={mode} />;
    case 'reviewSummary':
      return <ReviewSummaryBlock block={block} theme={theme} mode={mode} />;
    case 'languageSwitch':
      return <LanguageSwitchBlock block={block} theme={theme} mode={mode} />;
    case 'smartButton':
      return <SmartButtonBlock block={block} theme={theme} mode={mode} />;
    case 'campaignSpotlight':
      return <CampaignSpotlightBlock block={block} theme={theme} mode={mode} />;
    case 'recommendations':
      return <RecommendationsBlock block={block} theme={theme} mode={mode} />;
    case 'backToTop':
      return <BackToTopBlock block={block} theme={theme} mode={mode} />;
    default:
      return null;
  }
}

export const spacingClass: Record<Block['layout']['spacing'], string> = {
  tight: 'py-1',
  normal: 'py-2',
  loose: 'py-4'
};