import type { SiteBlock, SiteConfig } from "./types";
import type { LandingPageTheme } from "../content-studio/types";

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  siteConfig: SiteConfig;
  blocks: SiteBlock[];
  theme: LandingPageTheme;
}

// ─── Helper to create blocks with custom config ──────────────────
function block(type: SiteBlock["type"], config: any): SiteBlock {
  return { id: `${type}-tpl-${Math.random().toString(36).slice(2, 8)}`, type, enabled: true, config };
}

// ─── Evolu E-Bike Template (block-based) ─────────────────────────
const EVOLU_BLOCKS: SiteBlock[] = [
  block("hero", {
    title: "Future of E-Bike",
    subtitle: "Experience the next generation of urban mobility. Precision-engineered motor, extended-range battery, and intelligent smart controls — all in one breathtaking design.",
    ctaText: "Explore Bike",
    backgroundImageUrl: "",
  }),
  block("about", {
    content: "Every component is precision-crafted for maximum energy efficiency. Our proprietary power management system adapts to your riding style in real-time. Where bold industrial design meets aerodynamic performance — every curve serves a purpose.",
    imageUrl: "",
  }),
  block("testimonials", {
    items: [
      { quote: "The Evolv X changed how I commute. Silent, fast, and the battery lasts all week. It's not just a bike — it's a statement.", author: "Alex R., Berlin" },
      { quote: "I've owned three e-bikes before this one. Nothing comes close to the build quality and ride feel. Absolutely worth every penny.", author: "Mia K., Amsterdam" },
      { quote: "The smart controls are game-changing. It learns how I ride and adjusts power delivery automatically. Pure engineering magic.", author: "James T., San Francisco" },
    ],
  }),
  block("faq", {
    items: [
      { question: "What is the battery range?", answer: "The Evolv X delivers up to 100 miles on a single charge, depending on terrain and riding mode." },
      { question: "What warranty is included?", answer: "Every Evolu bike comes with a 3-year comprehensive warranty covering frame, motor, and battery." },
      { question: "How long does charging take?", answer: "A full charge takes approximately 3.5 hours with the included fast charger." },
      { question: "Is it suitable for commuting?", answer: "Absolutely. The Evolv X is designed for daily urban commuting with integrated lights, fenders, and a rear rack option." },
    ],
  }),
  block("contact", {
    heading: "Get in Touch",
    showPhone: true,
    showAddress: true,
  }),
];

const EVOLU_THEME: LandingPageTheme = {
  primaryColor: "#C7FF2F",
  secondaryColor: "#000000",
  accentColor: "#C7FF2F",
  textColor: "#111111",
  bgColor: "#F5F5F5",
  headingFont: "'Space Grotesk', system-ui, sans-serif",
  bodyFont: "'Space Grotesk', system-ui, sans-serif",
  layout: "bold",
  borderRadius: "large",
  heroStyle: "split",
};

// ─── Minimalist Store Template ───────────────────────────────────
const MINIMALIST_BLOCKS: SiteBlock[] = [
  block("hero", {
    title: "Clean. Simple. Yours.",
    subtitle: "Discover thoughtfully curated products designed for modern living.",
    ctaText: "Browse Collection",
    backgroundImageUrl: "",
  }),
  block("product-catalog", { columns: 3, showPrice: true, showDescription: true, categoryFilter: "" }),
  block("about", {
    content: "We believe in the beauty of simplicity. Every product in our collection is carefully selected for quality, function, and timeless design.",
    imageUrl: "",
  }),
  block("contact", { heading: "Say Hello", showPhone: false, showAddress: true }),
];

const MINIMALIST_THEME: LandingPageTheme = {
  primaryColor: "#1a1a1a",
  secondaryColor: "#f8f8f8",
  accentColor: "#e63946",
  textColor: "#1a1a1a",
  bgColor: "#ffffff",
  headingFont: "'Inter', system-ui, sans-serif",
  bodyFont: "'Inter', system-ui, sans-serif",
  layout: "classic",
  borderRadius: "small",
  heroStyle: "centered",
};

// ─── Bold Showcase Template ──────────────────────────────────────
const BOLD_BLOCKS: SiteBlock[] = [
  block("hero", {
    title: "Make a Statement",
    subtitle: "Bold products for bold people. Stand out from the crowd with our exclusive collection.",
    ctaText: "Shop Now →",
    backgroundImageUrl: "",
  }),
  block("product-catalog", { columns: 2, showPrice: true, showDescription: true, categoryFilter: "" }),
  block("testimonials", {
    items: [
      { quote: "Incredible quality and fast shipping. Will definitely order again!", author: "Sarah M." },
      { quote: "The best online store I've found. Products exceeded my expectations.", author: "David L." },
    ],
  }),
  block("social-proof", { heading: "Join Our Community" }),
  block("order-form", { heading: "Quick Order", productName: "" }),
];

const BOLD_THEME: LandingPageTheme = {
  primaryColor: "#FF6B35",
  secondaryColor: "#0D1B2A",
  accentColor: "#FF6B35",
  textColor: "#0D1B2A",
  bgColor: "#FFFCF9",
  headingFont: "'Space Grotesk', system-ui, sans-serif",
  bodyFont: "'Inter', system-ui, sans-serif",
  layout: "bold",
  borderRadius: "medium",
  heroStyle: "split",
};

// ─── All Templates ───────────────────────────────────────────────
export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "evolu-ebike",
    name: "Evolu – E-Bike",
    description: "Premium futuristic electric bike landing page with neon lime accent, dark/light alternating sections, and bold editorial layout.",
    thumbnail: "🚲",
    category: "Product Launch",
    siteConfig: { name: "Evolu", tagline: "Future of E-Bike", logoUrl: "" },
    blocks: EVOLU_BLOCKS,
    theme: EVOLU_THEME,
  },
  {
    id: "minimalist-store",
    name: "Minimalist Store",
    description: "Clean, elegant storefront with focus on products. Minimal design with refined typography and subtle accents.",
    thumbnail: "🪴",
    category: "E-commerce",
    siteConfig: { name: "My Store", tagline: "Clean. Simple. Yours.", logoUrl: "" },
    blocks: MINIMALIST_BLOCKS,
    theme: MINIMALIST_THEME,
  },
  {
    id: "bold-showcase",
    name: "Bold Showcase",
    description: "High-impact product showcase with bold CTA, social proof, testimonials, and integrated order form.",
    thumbnail: "🔥",
    category: "Showcase",
    siteConfig: { name: "Bold Store", tagline: "Make a Statement", logoUrl: "" },
    blocks: BOLD_BLOCKS,
    theme: BOLD_THEME,
  },
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with the default blocks and your own design.",
    thumbnail: "✨",
    category: "Starter",
    siteConfig: { name: "My Store", tagline: "Quality products, competitive prices", logoUrl: "" },
    blocks: [],
    theme: {
      primaryColor: "#2563eb",
      secondaryColor: "#1a1a2e",
      accentColor: "#16213e",
      textColor: "#1a1a2e",
      bgColor: "#ffffff",
      headingFont: "Inter, system-ui, sans-serif",
      bodyFont: "Inter, system-ui, sans-serif",
      layout: "classic",
      borderRadius: "medium",
      heroStyle: "centered",
    },
  },
];
