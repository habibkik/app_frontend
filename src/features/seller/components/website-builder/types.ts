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
  | "offer-pricing";

export interface HeroBlockConfig {
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

export interface TestimonialsBlockConfig {
  items: { quote: string; author: string }[];
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface FaqBlockConfig {
  items: { question: string; answer: string }[];
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface ContactBlockConfig {
  heading: string;
  showPhone: boolean;
  showAddress: boolean;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface OrderFormBlockConfig {
  heading: string;
  productName: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface SocialProofBlockConfig {
  heading: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface MarketStatsBlockConfig {
  heading: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number;
}

export interface ProblemAgitationBlockConfig {
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
  | OfferPricingBlockConfig;

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
