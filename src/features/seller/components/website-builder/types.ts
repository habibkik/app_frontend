import type { LandingPageTheme } from "../content-studio/types";

export type BlockType =
  | "hero"
  | "product-catalog"
  | "about"
  | "testimonials"
  | "faq"
  | "contact"
  | "order-form"
  | "social-proof"
  | "market-stats"
  | "problem-agitation"
  | "solution"
  | "offer-pricing"
  | "features-grid"
  | "pricing-table"
  | "image-gallery"
  | "video-embed"
  | "countdown-timer"
  | "newsletter"
  | "product-detail"
  | "shopping-cart"
  | "checkout-form"
  | "customer-reviews"
  | "order-tracking";

// Common background image dimension fields
export interface BgImageDimensions {
  bgImageWidth?: number;
  bgImageHeight?: number;
  fitToImage?: boolean;
}

export interface HeroBlockConfig extends BgImageDimensions {
  title: string;
  subtitle: string;
  ctaText: string;
  backgroundImageUrl: string;
  overlayOpacity?: number;
}

export interface ProductCatalogBlockConfig {
  columns: 2 | 3 | 4;
  showPrice: boolean;
  showDescription: boolean;
  categoryFilter: string;
  featuredImage?: string;
}

export interface AboutBlockConfig {
  content: string;
  imageUrl: string;
}

export interface TestimonialsBlockConfig extends BgImageDimensions {
  items: { quote: string; author: string }[];
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface FaqBlockConfig extends BgImageDimensions {
  items: { question: string; answer: string }[];
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface ContactBlockConfig extends BgImageDimensions {
  heading: string;
  showPhone: boolean;
  showAddress: boolean;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface OrderFormBlockConfig extends BgImageDimensions {
  heading: string;
  productName: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface SocialProofBlockConfig extends BgImageDimensions {
  heading: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface MarketStatsBlockConfig extends BgImageDimensions {
  heading: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface ProblemAgitationBlockConfig extends BgImageDimensions {
  heading: string;
  intro: string;
  painPoints: { icon: string; title: string; description: string }[];
  reinforcement: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface SolutionBlockConfig {
  heading: string;
  intro: string;
  differentiationPoints: string[];
  credibilityText: string;
  imageUrl: string;
}

export interface OfferPricingBlockConfig {
  heading: string;
  valueItems: string[];
  anchorPrice: string;
  actualPrice: string;
  scarcityText: string;
  ctaText: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

// --- New Block Configs ---

export interface FeaturesGridBlockConfig {
  heading: string;
  subtitle: string;
  items: { icon: string; title: string; description: string }[];
  columns: 2 | 3 | 4;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface PricingTableBlockConfig {
  heading: string;
  plans: { name: string; price: string; period: string; features: string[]; highlighted: boolean; ctaText: string }[];
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface ImageGalleryBlockConfig {
  heading: string;
  images: { url: string; caption: string }[];
  columns: 2 | 3 | 4;
  style: "grid" | "masonry";
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface VideoEmbedBlockConfig {
  heading: string;
  videoUrl: string;
  provider: "youtube" | "vimeo" | "custom";
  autoplay: boolean;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface CountdownTimerBlockConfig {
  heading: string;
  subtitle: string;
  targetDate: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface NewsletterBlockConfig {
  heading: string;
  subtitle: string;
  buttonText: string;
  placeholderText: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface ProductDetailBlockConfig {
  heading: string;
  productName: string;
  price: string;
  compareAtPrice?: string;
  description: string;
  variants: { type: string; options: string[] }[];
  images: string[];
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface ShoppingCartBlockConfig {
  heading: string;
  emptyMessage: string;
  ctaText: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface CheckoutFormBlockConfig {
  heading: string;
  enabledPaymentMethods: ("stripe" | "paypal" | "cod")[];
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface CustomerReviewsBlockConfig {
  heading: string;
  reviews: { author: string; rating: number; date: string; comment: string }[];
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface OrderTrackingBlockConfig {
  heading: string;
  steps: { label: string; status: "completed" | "active" | "pending" }[];
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export type BlockConfig =
  | HeroBlockConfig
  | ProductCatalogBlockConfig
  | AboutBlockConfig
  | TestimonialsBlockConfig
  | FaqBlockConfig
  | ContactBlockConfig
  | OrderFormBlockConfig
  | SocialProofBlockConfig
  | MarketStatsBlockConfig
  | ProblemAgitationBlockConfig
  | SolutionBlockConfig
  | OfferPricingBlockConfig
  | FeaturesGridBlockConfig
  | PricingTableBlockConfig
  | ImageGalleryBlockConfig
  | VideoEmbedBlockConfig
  | CountdownTimerBlockConfig
  | NewsletterBlockConfig
  | ProductDetailBlockConfig
  | ShoppingCartBlockConfig
  | CheckoutFormBlockConfig
  | CustomerReviewsBlockConfig
  | OrderTrackingBlockConfig;

export interface SiteBlock {
  id: string;
  type: BlockType;
  enabled: boolean;
  config: BlockConfig;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  logoUrl: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  favicon?: string;
}

export interface ProductData {
  id: string;
  name: string;
  current_price: number;
  image_url: string | null;
  description: string | null;
  category: string | null;
}

export interface WebsiteEditorState {
  siteConfig: SiteConfig;
  blocks: SiteBlock[];
  theme: LandingPageTheme;
  selectedBlockId: string | null;
  websiteId: string | null;
  isPublished: boolean;
  slug: string;
  customHtml: string | null;
  templateChosen: boolean;
}
