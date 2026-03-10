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

// ─── Premium Conversion Template ─────────────────────────────────
const PREMIUM_BLOCKS: SiteBlock[] = [
  block("hero", {
    title: "Engineered for Every Step",
    subtitle: "Premium comfort meets bold design. Experience next-level performance that moves with you — from first mile to finish line.",
    ctaText: "Add to Cart",
    backgroundImageUrl: "",
  }),
  block("social-proof", { heading: "Trusted By Industry Leaders" }),
  block("solution", {
    heading: "Why It's Different",
    intro: "Every detail is designed with purpose. Three core innovations set us apart.",
    differentiationPoints: [
      "Comfort — Adaptive cushioning that responds to your stride in real-time",
      "Stability — Reinforced heel counter and wide base for all-day support",
      "Hands-free — Magnetic quick-lock closure system, no laces needed",
    ],
    credibilityText: "Rated #1 by 12,000+ verified buyers. Featured in GQ, Wired, and Runner's World.",
    imageUrl: "",
  }),
  block("product-catalog", { columns: 3, showPrice: true, showDescription: true, categoryFilter: "" }),
  block("problem-agitation", {
    heading: "The Premium Promise",
    intro: "Every order includes everything you need for a flawless experience.",
    painPoints: [
      { icon: "🚚", title: "Free Shipping", description: "Complimentary express delivery on every order" },
      { icon: "↩️", title: "30-Day Returns", description: "No questions asked — full refund guaranteed" },
      { icon: "⭐", title: "Premium Quality", description: "Handcrafted with sustainable, certified materials" },
      { icon: "💬", title: "24/7 Support", description: "Real humans, real help, anytime you need it" },
    ],
    reinforcement: "Join 50,000+ happy customers who made the switch.",
  }),
  block("testimonials", {
    items: [
      { quote: "I've tried dozens of brands. Nothing comes close to this level of comfort and style. Absolutely worth every penny.", author: "Jordan A." },
      { quote: "The magnetic closure is a game-changer. I can't go back to laces. Plus they look incredible.", author: "Mika S." },
      { quote: "Ordered for my partner too. We both wear them daily — to the gym, to work, everywhere.", author: "Taylor R." },
    ],
  }),
  block("offer-pricing", {
    heading: "Limited Launch Offer",
    valueItems: [
      "Premium product (retail $189)",
      "Free express shipping ($15 value)",
      "Extended 2-year warranty ($29 value)",
      "Exclusive members-only colorway",
    ],
    anchorPrice: "$233",
    actualPrice: "$149",
    scarcityText: "Only 127 units left at this price — launch batch selling fast",
    ctaText: "Claim Your Pair →",
  }),
  block("contact", { heading: "Stay in the Loop", showPhone: false, showAddress: false }),
];

const PREMIUM_THEME: LandingPageTheme = {
  primaryColor: "#FF6B5C",
  secondaryColor: "#111111",
  accentColor: "#FF6B5C",
  textColor: "#111111",
  bgColor: "#FFFFFF",
  headingFont: "'Space Grotesk', system-ui, sans-serif",
  bodyFont: "'Inter', system-ui, sans-serif",
  layout: "bold",
  borderRadius: "large",
  heroStyle: "split",
};

// ─── SaaS Landing Template ───────────────────────────────────────
const SAAS_BLOCKS: SiteBlock[] = [
  block("hero", { title: "Ship Faster, Scale Smarter", subtitle: "The all-in-one platform that helps teams build, deploy, and grow their products. No DevOps required.", ctaText: "Start Free Trial", backgroundImageUrl: "" }),
  block("features-grid", { heading: "Everything You Need", subtitle: "Powerful features to accelerate your workflow", items: [{ icon: "⚡", title: "Lightning Fast", description: "Deploy in seconds with our global CDN." }, { icon: "🔐", title: "Enterprise Security", description: "SOC2 compliant with end-to-end encryption." }, { icon: "📊", title: "Real-time Analytics", description: "Monitor performance with live dashboards." }, { icon: "🔄", title: "CI/CD Built-in", description: "Automatic deployments on every push." }, { icon: "🌍", title: "Global Edge", description: "50+ regions worldwide for low latency." }, { icon: "🤝", title: "Team Collaboration", description: "Built-in tools for seamless teamwork." }], columns: 3 }),
  block("pricing-table", { heading: "Simple, Transparent Pricing", plans: [{ name: "Starter", price: "$0", period: "/month", features: ["3 Projects", "1 GB Storage", "Community Support"], highlighted: false, ctaText: "Start Free" }, { name: "Pro", price: "$49", period: "/month", features: ["Unlimited Projects", "100 GB Storage", "Priority Support", "Custom Domains", "Analytics"], highlighted: true, ctaText: "Go Pro" }, { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Pro", "SSO / SAML", "SLA Guarantee", "Dedicated Support", "On-premise Option"], highlighted: false, ctaText: "Contact Sales" }] }),
  block("testimonials", { items: [{ quote: "We cut our deployment time by 90%. Absolute game changer for our engineering team.", author: "CTO, TechCorp" }, { quote: "The analytics alone are worth 10x the price. Our conversion rates went through the roof.", author: "VP Growth, StartupXYZ" }] }),
  block("newsletter", { heading: "Stay in the Loop", subtitle: "Get product updates and engineering tips delivered weekly.", buttonText: "Subscribe", placeholderText: "you@company.com" }),
];

const SAAS_THEME: LandingPageTheme = {
  primaryColor: "#6366f1", secondaryColor: "#1e1b4b", accentColor: "#818cf8", textColor: "#1e1b4b", bgColor: "#fafafe",
  headingFont: "'Inter', system-ui, sans-serif", bodyFont: "'Inter', system-ui, sans-serif",
  layout: "modern", borderRadius: "medium", heroStyle: "centered",
};

// ─── Portfolio Template ──────────────────────────────────────────
const PORTFOLIO_BLOCKS: SiteBlock[] = [
  block("hero", { title: "Creative Studio", subtitle: "Award-winning design, branding, and digital experiences that make brands unforgettable.", ctaText: "View Our Work", backgroundImageUrl: "" }),
  block("image-gallery", { heading: "Selected Work", images: [{ url: "", caption: "Brand Identity — Luxe Co." }, { url: "", caption: "Web Design — FinTech App" }, { url: "", caption: "Packaging — Organic Blends" }, { url: "", caption: "Campaign — Summer '24" }], columns: 2, style: "grid" }),
  block("about", { content: "We're a boutique creative studio specializing in brand strategy, visual identity, and digital product design. With over a decade of experience, we've helped 200+ brands tell their story with clarity and conviction.", imageUrl: "" }),
  block("testimonials", { items: [{ quote: "They transformed our brand from forgettable to iconic. The ROI has been incredible.", author: "Founder, Luxe Co." }] }),
  block("contact", { heading: "Let's Create Together", showPhone: true, showAddress: true }),
];

const PORTFOLIO_THEME: LandingPageTheme = {
  primaryColor: "#0f0f0f", secondaryColor: "#0f0f0f", accentColor: "#e5e5e5", textColor: "#0f0f0f", bgColor: "#f5f5f0",
  headingFont: "'Playfair Display', Georgia, serif", bodyFont: "'Inter', system-ui, sans-serif",
  layout: "minimal", borderRadius: "none", heroStyle: "centered",
};

// ─── Restaurant Template ─────────────────────────────────────────
const RESTAURANT_BLOCKS: SiteBlock[] = [
  block("hero", { title: "A Culinary Journey", subtitle: "Farm-to-table dining in the heart of the city. Seasonal ingredients, timeless flavors.", ctaText: "Reserve a Table", backgroundImageUrl: "" }),
  block("features-grid", { heading: "Why Dine With Us", subtitle: "", items: [{ icon: "🌿", title: "Farm Fresh", description: "Locally sourced seasonal ingredients." }, { icon: "👨‍🍳", title: "Award-Winning Chef", description: "Michelin-starred culinary team." }, { icon: "🍷", title: "Wine Pairing", description: "Curated selection of 200+ wines." }], columns: 3 }),
  block("image-gallery", { heading: "From Our Kitchen", images: [{ url: "", caption: "Signature Dish" }, { url: "", caption: "Private Dining" }, { url: "", caption: "Our Garden" }], columns: 3, style: "grid" }),
  block("testimonials", { items: [{ quote: "Best dining experience in the city. The tasting menu is a masterpiece.", author: "Food & Wine Magazine" }] }),
  block("faq", { items: [{ question: "Do you take reservations?", answer: "Yes! Book online or call us at (555) 123-4567." }, { question: "Is there parking available?", answer: "Complimentary valet parking is available Friday through Sunday." }] }),
  block("contact", { heading: "Make a Reservation", showPhone: true, showAddress: true }),
];

const RESTAURANT_THEME: LandingPageTheme = {
  primaryColor: "#8B4513", secondaryColor: "#2c1810", accentColor: "#d4a574", textColor: "#2c1810", bgColor: "#faf8f5",
  headingFont: "'Playfair Display', Georgia, serif", bodyFont: "'Lora', Georgia, serif",
  layout: "classic", borderRadius: "small", heroStyle: "centered",
};

// ─── Fashion Template ────────────────────────────────────────────
const FASHION_BLOCKS: SiteBlock[] = [
  block("hero", { title: "NEW COLLECTION", subtitle: "Timeless elegance meets modern design. Discover pieces crafted for the discerning individual.", ctaText: "Shop Collection", backgroundImageUrl: "" }),
  block("product-catalog", { columns: 3, showPrice: true, showDescription: false, categoryFilter: "" }),
  block("video-embed", { heading: "Behind the Scenes", videoUrl: "", provider: "youtube", autoplay: false }),
  block("countdown-timer", { heading: "Flash Sale Ends Soon", subtitle: "Up to 40% off selected items", targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], ctaText: "Shop Sale", ctaUrl: "#order" }),
  block("testimonials", { items: [{ quote: "The quality is unmatched. These are investment pieces you'll wear for decades.", author: "Vogue Editor" }, { quote: "Finally, a brand that understands both style and sustainability.", author: "Elle Magazine" }] }),
  block("newsletter", { heading: "Join the Inner Circle", subtitle: "Early access to new collections, exclusive offers, and style inspiration.", buttonText: "Join Now", placeholderText: "Your email" }),
];

const FASHION_THEME: LandingPageTheme = {
  primaryColor: "#1a1a1a", secondaryColor: "#0a0a0a", accentColor: "#c4a35a", textColor: "#1a1a1a", bgColor: "#ffffff",
  headingFont: "'Montserrat', system-ui, sans-serif", bodyFont: "'Inter', system-ui, sans-serif",
  layout: "bold", borderRadius: "none", heroStyle: "centered",
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
    id: "premium-conversion",
    name: "Premium Conversion",
    description: "Nike-inspired high-conversion product landing with coral accent, split hero, social proof, benefits strip, and value-stack pricing.",
    thumbnail: "🔶",
    category: "Conversion",
    siteConfig: { name: "Premium Store", tagline: "Engineered for Every Step", logoUrl: "" },
    blocks: PREMIUM_BLOCKS,
    theme: PREMIUM_THEME,
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
