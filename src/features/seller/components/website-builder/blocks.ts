import type {
  BlockType,
  SiteBlock,
  HeroBlockConfig,
  ProductCatalogBlockConfig,
  AboutBlockConfig,
  TestimonialsBlockConfig,
  FaqBlockConfig,
  ContactBlockConfig,
  OrderFormBlockConfig,
  SocialProofBlockConfig,
  MarketStatsBlockConfig,
} from "./types";
import {
  LayoutTemplate,
  ShoppingBag,
  FileText,
  Quote,
  HelpCircle,
  Mail,
  ClipboardList,
  Users,
  BarChart3,
} from "lucide-react";

export const BLOCK_META: Record<BlockType, { label: string; description: string; icon: typeof LayoutTemplate }> = {
  hero: { label: "Hero Banner", description: "Title, subtitle & CTA", icon: LayoutTemplate },
  "product-catalog": { label: "Product Catalog", description: "Grid of your products", icon: ShoppingBag },
  about: { label: "About", description: "Tell your story", icon: FileText },
  testimonials: { label: "Testimonials", description: "Social proof quotes", icon: Quote },
  faq: { label: "FAQ", description: "Common questions", icon: HelpCircle },
  contact: { label: "Contact Form", description: "Let visitors reach you", icon: Mail },
  "order-form": { label: "Order Form", description: "Accept orders directly", icon: ClipboardList },
  "social-proof": { label: "Social Proof", description: "Engagement stats", icon: Users },
  "market-stats": { label: "Market Stats", description: "Market intelligence data", icon: BarChart3 },
};

export function createDefaultBlock(type: BlockType): SiteBlock {
  const id = `${type}-${Date.now()}`;
  const configs: Record<BlockType, any> = {
    hero: { title: "Welcome to Our Store", subtitle: "Quality products, competitive prices", ctaText: "Shop Now", backgroundImageUrl: "" } as HeroBlockConfig,
    "product-catalog": { columns: 3, showPrice: true, showDescription: true, categoryFilter: "" } as ProductCatalogBlockConfig,
    about: { content: "We are a passionate team dedicated to providing the best products at competitive prices.", imageUrl: "" } as AboutBlockConfig,
    testimonials: { items: [{ quote: "Great products and fast delivery!", author: "Happy Customer" }, { quote: "Best prices in the market.", author: "Repeat Buyer" }] } as TestimonialsBlockConfig,
    faq: { items: [{ question: "What is your return policy?", answer: "We offer a 30-day money-back guarantee." }, { question: "How fast is shipping?", answer: "Orders ship within 1-3 business days." }] } as FaqBlockConfig,
    contact: { heading: "Get in Touch", showPhone: true, showAddress: true } as ContactBlockConfig,
    "order-form": { heading: "Place Your Order", productName: "" } as OrderFormBlockConfig,
    "social-proof": { heading: "Our Reach" } as SocialProofBlockConfig,
    "market-stats": { heading: "Market Intelligence" } as MarketStatsBlockConfig,
  };
  return { id, type, enabled: true, config: configs[type] };
}

export const DEFAULT_BLOCKS: SiteBlock[] = [
  createDefaultBlock("hero"),
  createDefaultBlock("product-catalog"),
  createDefaultBlock("about"),
  createDefaultBlock("faq"),
  createDefaultBlock("contact"),
];
