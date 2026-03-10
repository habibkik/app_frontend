import type { SiteBlock, SiteConfig } from "./types";
import type { LandingPageTheme } from "../content-studio/types";

// Template preview images
import imgEvolu from "@/assets/templates/evolu-ebike.jpg";
import imgMinimalist from "@/assets/templates/minimalist-store.jpg";
import imgBold from "@/assets/templates/bold-showcase.jpg";
import imgPremium from "@/assets/templates/premium-conversion.jpg";
import imgSaas from "@/assets/templates/saas-landing.jpg";
import imgPortfolio from "@/assets/templates/portfolio.jpg";
import imgRestaurant from "@/assets/templates/restaurant.jpg";
import imgFashion from "@/assets/templates/fashion.jpg";
import imgRealEstate from "@/assets/templates/real-estate.jpg";
import imgFitness from "@/assets/templates/fitness.jpg";
import imgAgency from "@/assets/templates/agency.jpg";
import imgWellness from "@/assets/templates/wellness.jpg";
import imgBlank from "@/assets/templates/blank.jpg";

// Demo content images
import demoEvoluHero from "@/assets/demo/evolu-hero.jpg";
import demoEvoluAbout from "@/assets/demo/evolu-about.jpg";
import demoMinimalistHero from "@/assets/demo/minimalist-hero.jpg";
import demoBoldHero from "@/assets/demo/bold-hero.jpg";
import demoPremiumHero from "@/assets/demo/premium-hero.jpg";
import demoSaasHero from "@/assets/demo/saas-hero.jpg";
import demoPortfolioWork1 from "@/assets/demo/portfolio-work1.jpg";
import demoPortfolioWork2 from "@/assets/demo/portfolio-work2.jpg";
import demoPortfolioWork3 from "@/assets/demo/portfolio-work3.jpg";
import demoPortfolioWork4 from "@/assets/demo/portfolio-work4.jpg";
import demoRestaurantHero from "@/assets/demo/restaurant-hero.jpg";
import demoRestaurantDish from "@/assets/demo/restaurant-dish.jpg";
import demoFashionHero from "@/assets/demo/fashion-hero.jpg";
import demoRealEstateHero from "@/assets/demo/realestate-hero.jpg";
import demoRealEstateProperty from "@/assets/demo/realestate-property1.jpg";
import demoFitnessHero from "@/assets/demo/fitness-hero.jpg";
import demoAgencyHero from "@/assets/demo/agency-hero.jpg";
import demoWellnessHero from "@/assets/demo/wellness-hero.jpg";
import demoWellnessGarden from "@/assets/demo/wellness-garden.jpg";

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  previewImage: string;
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
    backgroundImageUrl: demoEvoluHero,
  }),
  block("about", {
    content: "Every component is precision-crafted for maximum energy efficiency. Our proprietary power management system adapts to your riding style in real-time. Where bold industrial design meets aerodynamic performance — every curve serves a purpose.",
    imageUrl: demoEvoluAbout,
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

// ─── New Premium Templates: Real Estate ──────────────────────────
const REAL_ESTATE_BLOCKS: SiteBlock[] = [
  block("hero", { title: "Find Your Dream Home", subtitle: "Luxury properties in the most sought-after locations. Expert guidance from search to settlement.", ctaText: "Browse Properties", backgroundImageUrl: "" }),
  block("features-grid", { heading: "Why Choose Us", subtitle: "Decades of excellence in premium real estate", items: [{ icon: "🏠", title: "Premium Listings", description: "Handpicked luxury properties in top locations." }, { icon: "🤝", title: "Personal Agent", description: "Dedicated advisor for your entire journey." }, { icon: "📈", title: "Market Insights", description: "Data-driven pricing and investment analysis." }, { icon: "🔐", title: "Secure Deals", description: "End-to-end legal and financial support." }], columns: 4 }),
  block("image-gallery", { heading: "Featured Properties", images: [{ url: "", caption: "Modern Villa — $2.4M" }, { url: "", caption: "Penthouse Suite — $1.8M" }, { url: "", caption: "Waterfront Estate — $5.2M" }, { url: "", caption: "Urban Loft — $890K" }], columns: 2, style: "grid" }),
  block("testimonials", { items: [{ quote: "They found us the perfect family home in under two weeks. Exceptional service from start to finish.", author: "The Martinez Family" }, { quote: "The market analysis saved us $200K on our purchase. Worth every penny of their commission.", author: "Robert K., Investor" }] }),
  block("contact", { heading: "Schedule a Viewing", showPhone: true, showAddress: true }),
];

const REAL_ESTATE_THEME: LandingPageTheme = {
  primaryColor: "#c8a45a", secondaryColor: "#0a1628", accentColor: "#c8a45a", textColor: "#0a1628", bgColor: "#f8f6f1",
  headingFont: "'Playfair Display', Georgia, serif", bodyFont: "'Inter', system-ui, sans-serif",
  layout: "classic", borderRadius: "small", heroStyle: "split",
};

// ─── New Premium Templates: Fitness ──────────────────────────────
const FITNESS_BLOCKS: SiteBlock[] = [
  block("hero", { title: "UNLEASH YOUR POTENTIAL", subtitle: "Elite training facilities, world-class coaches, and a community that pushes you beyond limits.", ctaText: "Start Free Trial", backgroundImageUrl: "" }),
  block("features-grid", { heading: "What We Offer", subtitle: "Everything you need to transform", items: [{ icon: "💪", title: "Strength Training", description: "Olympic platforms, free weights, and machines." }, { icon: "🏃", title: "HIIT Classes", description: "High-intensity group sessions daily." }, { icon: "🧘", title: "Recovery Zone", description: "Sauna, cold plunge, and stretching area." }, { icon: "🥗", title: "Nutrition Plans", description: "Personalized meal plans by certified dietitians." }], columns: 4 }),
  block("pricing-table", { heading: "Membership Plans", plans: [{ name: "Basic", price: "$29", period: "/month", features: ["Gym Access", "Locker Room", "1 Guest Pass/mo"], highlighted: false, ctaText: "Join Basic" }, { name: "Pro", price: "$59", period: "/month", features: ["Unlimited Classes", "Personal Trainer Intro", "Nutrition Consult", "Recovery Zone"], highlighted: true, ctaText: "Go Pro" }, { name: "Elite", price: "$99", period: "/month", features: ["Everything in Pro", "Monthly Body Scan", "Priority Booking", "VIP Lounge Access"], highlighted: false, ctaText: "Go Elite" }] }),
  block("testimonials", { items: [{ quote: "Lost 30 lbs in 4 months. The coaches here genuinely care about your progress.", author: "Mike T." }, { quote: "Best gym I've ever been to. The community keeps me coming back every single day.", author: "Jessica R." }] }),
  block("contact", { heading: "Visit Us Today", showPhone: true, showAddress: true }),
];

const FITNESS_THEME: LandingPageTheme = {
  primaryColor: "#e53e3e", secondaryColor: "#0a0a0a", accentColor: "#e53e3e", textColor: "#ffffff", bgColor: "#111111",
  headingFont: "'Space Grotesk', system-ui, sans-serif", bodyFont: "'Inter', system-ui, sans-serif",
  layout: "bold", borderRadius: "medium", heroStyle: "centered",
};

// ─── New Premium Templates: Agency ───────────────────────────────
const AGENCY_BLOCKS: SiteBlock[] = [
  block("hero", { title: "We Build Digital Products That Matter", subtitle: "Strategy, design, and engineering — all under one roof. From startups to Fortune 500, we deliver results.", ctaText: "Get a Free Quote", backgroundImageUrl: "" }),
  block("social-proof", { heading: "Trusted by Industry Leaders" }),
  block("features-grid", { heading: "Our Services", subtitle: "End-to-end digital solutions", items: [{ icon: "🎯", title: "Strategy", description: "Market research, positioning, and growth roadmaps." }, { icon: "🎨", title: "Design", description: "UI/UX, branding, and design systems." }, { icon: "⚙️", title: "Engineering", description: "Web apps, mobile apps, and cloud infrastructure." }, { icon: "📊", title: "Analytics", description: "Performance tracking and optimization." }], columns: 4 }),
  block("testimonials", { items: [{ quote: "They took our vague idea and turned it into a product with 50K users in 6 months.", author: "CEO, TechStartup" }, { quote: "The most professional agency we've worked with. Clear communication, on-time delivery.", author: "VP Product, Enterprise Co." }] }),
  block("faq", { items: [{ question: "What's your typical project timeline?", answer: "Most projects run 8-16 weeks depending on scope. We'll give you a detailed timeline after our discovery call." }, { question: "Do you work with startups?", answer: "Absolutely. About 40% of our clients are early-stage startups. We offer flexible engagement models." }] }),
  block("contact", { heading: "Let's Talk", showPhone: true, showAddress: true }),
];

const AGENCY_THEME: LandingPageTheme = {
  primaryColor: "#2563eb", secondaryColor: "#0f172a", accentColor: "#3b82f6", textColor: "#0f172a", bgColor: "#f8fafc",
  headingFont: "'Inter', system-ui, sans-serif", bodyFont: "'Inter', system-ui, sans-serif",
  layout: "modern", borderRadius: "medium", heroStyle: "centered",
};

// ─── New Premium Templates: Wellness ─────────────────────────────
const WELLNESS_BLOCKS: SiteBlock[] = [
  block("hero", { title: "Restore. Renew. Revive.", subtitle: "A sanctuary of calm in the heart of the city. Holistic treatments designed to nurture body, mind, and spirit.", ctaText: "Book a Session", backgroundImageUrl: "" }),
  block("features-grid", { heading: "Our Treatments", subtitle: "Curated wellness experiences", items: [{ icon: "💆", title: "Massage Therapy", description: "Deep tissue, hot stone, and Swedish techniques." }, { icon: "🧖", title: "Facial Treatments", description: "Anti-aging, hydrating, and brightening facials." }, { icon: "🌿", title: "Aromatherapy", description: "Essential oil blends for relaxation and healing." }, { icon: "🧘", title: "Meditation", description: "Guided sessions for stress relief and clarity." }], columns: 4 }),
  block("image-gallery", { heading: "Our Space", images: [{ url: "", caption: "Treatment Rooms" }, { url: "", caption: "Relaxation Lounge" }, { url: "", caption: "Zen Garden" }], columns: 3, style: "grid" }),
  block("testimonials", { items: [{ quote: "The most peaceful place I've ever been. I leave every session feeling completely renewed.", author: "Sarah L." }, { quote: "Their aromatherapy massage is life-changing. I've been coming weekly for a year.", author: "Emma W." }] }),
  block("newsletter", { heading: "Wellness Tips & Offers", subtitle: "Join our community for exclusive deals and self-care inspiration.", buttonText: "Subscribe", placeholderText: "Your email" }),
  block("contact", { heading: "Book Your Experience", showPhone: true, showAddress: true }),
];

const WELLNESS_THEME: LandingPageTheme = {
  primaryColor: "#5b8c5a", secondaryColor: "#2d4a2d", accentColor: "#8fbc8f", textColor: "#2d4a2d", bgColor: "#f5f9f4",
  headingFont: "'Playfair Display', Georgia, serif", bodyFont: "'Lora', Georgia, serif",
  layout: "classic", borderRadius: "large", heroStyle: "split",
};

// ─── All Templates ───────────────────────────────────────────────
export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "evolu-ebike",
    name: "Evolu – E-Bike",
    description: "Premium futuristic electric bike landing page with neon lime accent, dark/light alternating sections, and bold editorial layout.",
    thumbnail: "🚲",
    previewImage: imgEvolu,
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
    previewImage: imgMinimalist,
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
    previewImage: imgBold,
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
    previewImage: imgPremium,
    category: "Conversion",
    siteConfig: { name: "Premium Store", tagline: "Engineered for Every Step", logoUrl: "" },
    blocks: PREMIUM_BLOCKS,
    theme: PREMIUM_THEME,
  },
  {
    id: "saas-landing",
    name: "SaaS Landing",
    description: "Modern SaaS product page with features grid, pricing table, and newsletter signup.",
    thumbnail: "💻",
    previewImage: imgSaas,
    category: "SaaS",
    siteConfig: { name: "LaunchPad", tagline: "Ship Faster, Scale Smarter", logoUrl: "" },
    blocks: SAAS_BLOCKS,
    theme: SAAS_THEME,
  },
  {
    id: "portfolio",
    name: "Creative Portfolio",
    description: "Elegant portfolio with image gallery, editorial typography, and minimal aesthetic.",
    thumbnail: "🎨",
    previewImage: imgPortfolio,
    category: "Portfolio",
    siteConfig: { name: "Studio", tagline: "Creative Studio", logoUrl: "" },
    blocks: PORTFOLIO_BLOCKS,
    theme: PORTFOLIO_THEME,
  },
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Warm, inviting restaurant page with gallery, menu highlights, and reservation form.",
    thumbnail: "🍽️",
    previewImage: imgRestaurant,
    category: "Restaurant",
    siteConfig: { name: "La Maison", tagline: "A Culinary Journey", logoUrl: "" },
    blocks: RESTAURANT_BLOCKS,
    theme: RESTAURANT_THEME,
  },
  {
    id: "fashion",
    name: "Fashion Brand",
    description: "High-end fashion store with countdown timer, video embed, and newsletter capture.",
    thumbnail: "👗",
    previewImage: imgFashion,
    category: "Fashion",
    siteConfig: { name: "Atelier", tagline: "Timeless Elegance", logoUrl: "" },
    blocks: FASHION_BLOCKS,
    theme: FASHION_THEME,
  },
  {
    id: "real-estate",
    name: "Real Estate",
    description: "Luxury property showcase with gold accents, property gallery, agent contact, and elegant serif typography.",
    thumbnail: "🏠",
    previewImage: imgRealEstate,
    category: "Real Estate",
    siteConfig: { name: "Prestige Homes", tagline: "Find Your Dream Home", logoUrl: "" },
    blocks: REAL_ESTATE_BLOCKS,
    theme: REAL_ESTATE_THEME,
  },
  {
    id: "fitness",
    name: "Fitness & Gym",
    description: "Dark, high-energy gym page with bold red accents, membership pricing, and class schedules.",
    thumbnail: "💪",
    previewImage: imgFitness,
    category: "Fitness",
    siteConfig: { name: "Iron Forge", tagline: "Unleash Your Potential", logoUrl: "" },
    blocks: FITNESS_BLOCKS,
    theme: FITNESS_THEME,
  },
  {
    id: "agency",
    name: "Digital Agency",
    description: "Professional blue-toned agency site with services grid, case studies, team section, and contact form.",
    thumbnail: "🚀",
    previewImage: imgAgency,
    category: "Agency",
    siteConfig: { name: "Nexus Digital", tagline: "We Build Digital Products That Matter", logoUrl: "" },
    blocks: AGENCY_BLOCKS,
    theme: AGENCY_THEME,
  },
  {
    id: "wellness",
    name: "Wellness & Spa",
    description: "Serene, nature-inspired spa page with soft greens, treatment gallery, and booking form.",
    thumbnail: "🌿",
    previewImage: imgWellness,
    category: "Wellness",
    siteConfig: { name: "Serenity Spa", tagline: "Restore. Renew. Revive.", logoUrl: "" },
    blocks: WELLNESS_BLOCKS,
    theme: WELLNESS_THEME,
  },
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with the default blocks and your own design.",
    thumbnail: "✨",
    previewImage: imgBlank,
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
