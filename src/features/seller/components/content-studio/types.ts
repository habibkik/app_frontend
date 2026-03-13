export interface GeneratedImage {
  id: string;
  label: string;
  prompt: string;
  imageUrl: string | null;
  isGenerating: boolean;
  error?: string;
  section?: string;
}

export type ProImageSection = "packshot" | "ugc" | "usage" | "studio" | "marketing";

export const PRO_IMAGE_SECTIONS: {
  id: ProImageSection;
  title: string;
  description: string;
  imageIds: string[];
}[] = [
  {
    id: "packshot",
    title: "Packshot (Background Removal)",
    description: "Product isolated on white background — 5 professional angles",
    imageIds: ["packshot-front", "packshot-side", "packshot-back", "packshot-45deg", "packshot-top"],
  },
  {
    id: "ugc",
    title: "UGC Lifestyle Content",
    description: "Authentic user-generated content style with real people and candid moments",
    imageIds: ["ugc-outdoor", "ugc-home", "ugc-social", "ugc-unboxing", "ugc-action"],
  },
  {
    id: "usage",
    title: "Real-Life Usage Scenes",
    description: "Contextual product-in-use scenes with cinematic lighting",
    imageIds: ["usage-morning", "usage-work", "usage-commute", "usage-leisure", "usage-evening"],
  },
  {
    id: "studio",
    title: "Studio Commercial Shots",
    description: "Premium studio advertising photography with professional lighting",
    imageIds: ["studio-hero", "studio-detail", "studio-lifestyle", "studio-dramatic", "studio-flat"],
  },
  {
    id: "marketing",
    title: "Marketing Creatives",
    description: "Promotional landing-page-style images — hero banners, trust badges, testimonials & CTAs",
    imageIds: [
      "marketing-hero-banner", "marketing-before-after", "marketing-testimonials",
      "marketing-features", "marketing-trust-badges", "marketing-ingredients",
      "marketing-urgency-cta", "marketing-social-proof", "marketing-guarantee", "marketing-order-footer",
    ],
  },
];

export const PRO_IMAGE_LABELS: Record<string, string> = {
  "packshot-front": "Front View",
  "packshot-side": "Side View",
  "packshot-back": "Back View",
  "packshot-45deg": "45° Perspective",
  "packshot-top": "Top View",
  "ugc-outdoor": "Outdoor",
  "ugc-home": "At Home",
  "ugc-social": "Social Selfie",
  "ugc-unboxing": "Unboxing",
  "ugc-action": "In Action",
  "usage-morning": "Morning Routine",
  "usage-work": "At Work",
  "usage-commute": "Commute",
  "usage-leisure": "Leisure",
  "usage-evening": "Evening",
  "studio-hero": "Hero Shot",
  "studio-detail": "Detail Macro",
  "studio-lifestyle": "Styled Lifestyle",
  "studio-dramatic": "Dramatic Lighting",
  "studio-flat": "Flat Lay",
  "marketing-hero-banner": "Hero Banner",
  "marketing-before-after": "Before & After",
  "marketing-testimonials": "Testimonials",
  "marketing-features": "Features Grid",
  "marketing-trust-badges": "Trust Badges",
  "marketing-ingredients": "Ingredients/Specs",
  "marketing-urgency-cta": "Urgency CTA",
  "marketing-social-proof": "Social Proof",
  "marketing-guarantee": "Guarantee Seal",
  "marketing-order-footer": "Order Footer",
};

export interface SocialImagePost {
  id: string;
  platform: "instagram" | "facebook" | "tiktok" | "linkedin" | "twitter";
  caption: string;
  hook: string;
  cta: string;
  hashtags: string[];
  imageId: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subjectLine: string;
  previewText: string;
  body: string;
  cta: string;
  imageId: string;
}

export interface ContentScore {
  overall: number;
  headlineClarity: number;
  ctaStrength: number;
  emotionalAppeal: number;
  platformOptimization: number;
  competitiveDifferentiation: number;
  suggestions: string[];
  abTestSuggestions: string[];
  pricingAngleSuggestions: string[];
  ctaOptimizations: string[];
}

export interface LandingPageData {
  html: string;
  sectionOrder: LandingPageSection[];
  sections: {
    hero: string;
    benefits: string[];
    features: string[];
    socialProof: string[];
    faq: { question: string; answer: string }[];
    ctaText: string;
  };
}

export type LandingPageSection = "benefits" | "features" | "social-proof" | "faq" | "cta";

export const DEFAULT_SECTION_ORDER: LandingPageSection[] = [
  "benefits", "features", "social-proof", "faq", "cta",
];

export const SECTION_LABELS: Record<LandingPageSection, string> = {
  benefits: "Benefits",
  features: "Features",
  "social-proof": "Social Proof",
  faq: "FAQ",
  cta: "Call to Action",
};

export interface GenerationStep {
  label: string;
  status: "pending" | "running" | "done" | "error";
}

export type ContentStudioTab =
  | "brand-kit"
  | "pro-images"
  | "social-image"
  | "video"
  | "social-video"
  
  | "email"
  | "score";

export interface LandingPageTheme {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  // Gradient
  gradientEnabled?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  // Typography
  headingFont: string;
  bodyFont: string;
  headingSize?: number;
  bodySize?: number;
  // Layout
  layout: "classic" | "modern" | "minimal" | "bold";
  borderRadius: "none" | "small" | "medium" | "large";
  heroStyle: "centered" | "left-aligned" | "split";
  // Spacing & Effects
  sectionPadding?: number;
  contentMaxWidth?: number;
  cardShadow?: "none" | "small" | "medium" | "large";
  buttonStyle?: "filled" | "outline" | "pill" | "gradient";
  hoverEffect?: "none" | "lift" | "glow" | "scale";
}

export const DEFAULT_LANDING_THEME: LandingPageTheme = {
  primaryColor: "#2563eb",
  secondaryColor: "#1a1a2e",
  accentColor: "#16213e",
  textColor: "#1a1a2e",
  bgColor: "#ffffff",
  gradientEnabled: false,
  gradientStart: "#2563eb",
  gradientEnd: "#16213e",
  gradientAngle: 135,
  headingFont: "Inter, system-ui, sans-serif",
  bodyFont: "Inter, system-ui, sans-serif",
  headingSize: 40,
  bodySize: 16,
  layout: "classic",
  borderRadius: "medium",
  heroStyle: "centered",
  sectionPadding: 60,
  contentMaxWidth: 1100,
  cardShadow: "medium",
  buttonStyle: "filled",
  hoverEffect: "lift",
};

export const THEME_PRESETS: { name: string; theme: Partial<LandingPageTheme> }[] = [
  { name: "Default Blue", theme: { primaryColor: "#2563eb", secondaryColor: "#1a1a2e", accentColor: "#16213e" } },
  { name: "Emerald Pro", theme: { primaryColor: "#059669", secondaryColor: "#064e3b", accentColor: "#0d9488" } },
  { name: "Sunset Orange", theme: { primaryColor: "#ea580c", secondaryColor: "#431407", accentColor: "#f97316" } },
  { name: "Royal Purple", theme: { primaryColor: "#7c3aed", secondaryColor: "#1e1b4b", accentColor: "#8b5cf6" } },
  { name: "Slate Minimal", theme: { primaryColor: "#475569", secondaryColor: "#0f172a", accentColor: "#64748b", layout: "minimal" as const } },
  { name: "Bold Red", theme: { primaryColor: "#dc2626", secondaryColor: "#18181b", accentColor: "#ef4444", layout: "bold" as const } },
  { name: "Gradient Neon", theme: { primaryColor: "#8b5cf6", secondaryColor: "#0f172a", accentColor: "#06b6d4", gradientEnabled: true, gradientStart: "#8b5cf6", gradientEnd: "#06b6d4", gradientAngle: 135 } },
  { name: "Warm Gold", theme: { primaryColor: "#d97706", secondaryColor: "#1c1917", accentColor: "#f59e0b", buttonStyle: "pill" as const, cardShadow: "large" as const } },
];

export const FONT_OPTIONS = [
  { label: "Inter (System)", value: "Inter, system-ui, sans-serif" },
  { label: "Georgia (Serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', system-ui, sans-serif" },
  { label: "DM Sans", value: "'DM Sans', system-ui, sans-serif" },
  { label: "Roboto Slab", value: "'Roboto Slab', Georgia, serif" },
  { label: "Montserrat", value: "'Montserrat', system-ui, sans-serif" },
  { label: "Lora", value: "'Lora', Georgia, serif" },
  { label: "Poppins", value: "'Poppins', system-ui, sans-serif" },
  { label: "Raleway", value: "'Raleway', system-ui, sans-serif" },
  { label: "Oswald", value: "'Oswald', system-ui, sans-serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
];
