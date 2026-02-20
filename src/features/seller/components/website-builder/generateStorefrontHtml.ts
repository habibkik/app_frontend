import type { LandingPageTheme } from "../content-studio/types";
import type {
  SiteBlock,
  SiteConfig,
  ProductData,
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

interface GenerateOptions {
  siteConfig: SiteConfig;
  blocks: SiteBlock[];
  theme: LandingPageTheme;
  products: ProductData[];
  marketData?: {
    priceRange?: { min: number; max: number };
    demandTrend?: string;
    competitorCount?: number;
  };
  socialStats?: {
    postCount: number;
    totalEngagement: number;
  };
}

function borderRadiusValue(br: string) {
  switch (br) {
    case "none": return "0";
    case "small": return "4px";
    case "medium": return "8px";
    case "large": return "16px";
    default: return "8px";
  }
}

function renderHero(cfg: HeroBlockConfig, theme: LandingPageTheme) {
  const bg = cfg.backgroundImageUrl
    ? `background-image:url('${cfg.backgroundImageUrl}');background-size:cover;background-position:center;`
    : `background:${theme.primaryColor};`;
  return `<section style="${bg}color:#fff;padding:80px 20px;text-align:${theme.heroStyle === "left-aligned" ? "left" : "center"};">
  <div style="max-width:900px;margin:0 auto;">
    <h1 style="font-family:${theme.headingFont};font-size:2.5rem;margin:0 0 16px;">${cfg.title}</h1>
    <p style="font-size:1.2rem;opacity:.9;margin:0 0 24px;">${cfg.subtitle}</p>
    <a href="#order" style="display:inline-block;padding:14px 32px;background:#fff;color:${theme.primaryColor};border-radius:${borderRadiusValue(theme.borderRadius)};text-decoration:none;font-weight:600;">${cfg.ctaText}</a>
  </div>
</section>`;
}

function renderProductCatalog(cfg: ProductCatalogBlockConfig, products: ProductData[], theme: LandingPageTheme) {
  const filtered = cfg.categoryFilter
    ? products.filter((p) => p.category?.toLowerCase().includes(cfg.categoryFilter.toLowerCase()))
    : products;
  const cols = cfg.columns;
  const cards = filtered.map((p) => `
    <div style="border:1px solid #e5e7eb;border-radius:${borderRadiusValue(theme.borderRadius)};overflow:hidden;background:#fff;">
      ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:200px;object-fit:cover;">` : `<div style="width:100%;height:200px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;">No Image</div>`}
      <div style="padding:16px;">
        <h3 style="margin:0 0 8px;font-family:${theme.headingFont};font-size:1rem;">${p.name}</h3>
        ${cfg.showDescription && p.description ? `<p style="margin:0 0 8px;font-size:.85rem;color:#6b7280;">${p.description.substring(0, 100)}${p.description.length > 100 ? "…" : ""}</p>` : ""}
        ${cfg.showPrice ? `<p style="margin:0;font-weight:700;color:${theme.primaryColor};font-size:1.1rem;">$${p.current_price.toFixed(2)}</p>` : ""}
      </div>
    </div>`).join("");
  return `<section style="padding:60px 20px;background:${theme.bgColor};">
  <div style="max-width:1100px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${theme.textColor};">Our Products</h2>
    <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px;">${cards}</div>
  </div>
</section>`;
}

function renderAbout(cfg: AboutBlockConfig, theme: LandingPageTheme) {
  return `<section style="padding:60px 20px;background:${theme.bgColor};">
  <div style="max-width:800px;margin:0 auto;${cfg.imageUrl ? "display:flex;gap:32px;align-items:center;" : "text-align:center;"}">
    ${cfg.imageUrl ? `<img src="${cfg.imageUrl}" alt="About" style="width:300px;border-radius:${borderRadiusValue(theme.borderRadius)};object-fit:cover;">` : ""}
    <div>
      <h2 style="font-family:${theme.headingFont};margin:0 0 16px;color:${theme.textColor};">About Us</h2>
      <p style="font-family:${theme.bodyFont};color:#6b7280;line-height:1.7;">${cfg.content}</p>
    </div>
  </div>
</section>`;
}

function renderTestimonials(cfg: TestimonialsBlockConfig, theme: LandingPageTheme) {
  const cards = cfg.items.map((t) => `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:${borderRadiusValue(theme.borderRadius)};padding:24px;">
      <p style="font-style:italic;color:#374151;margin:0 0 12px;">"${t.quote}"</p>
      <p style="margin:0;font-weight:600;color:${theme.primaryColor};font-size:.9rem;">— ${t.author}</p>
    </div>`).join("");
  return `<section style="padding:60px 20px;background:#f9fafb;">
  <div style="max-width:900px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${theme.textColor};">What Our Customers Say</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">${cards}</div>
  </div>
</section>`;
}

function renderFaq(cfg: FaqBlockConfig, theme: LandingPageTheme) {
  const items = cfg.items.map((f) => `
    <div style="border-bottom:1px solid #e5e7eb;padding:16px 0;">
      <h4 style="margin:0 0 8px;font-family:${theme.headingFont};color:${theme.textColor};">${f.question}</h4>
      <p style="margin:0;color:#6b7280;font-size:.9rem;">${f.answer}</p>
    </div>`).join("");
  return `<section style="padding:60px 20px;background:${theme.bgColor};">
  <div style="max-width:700px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${theme.textColor};">Frequently Asked Questions</h2>
    ${items}
  </div>
</section>`;
}

function renderContact(cfg: ContactBlockConfig, theme: LandingPageTheme) {
  return `<section style="padding:60px 20px;background:#f9fafb;">
  <div style="max-width:500px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${theme.textColor};">${cfg.heading}</h2>
    <form style="display:flex;flex-direction:column;gap:12px;">
      <input placeholder="Your Name" style="padding:12px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;">
      <input type="email" placeholder="Your Email" style="padding:12px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;">
      ${cfg.showPhone ? `<input type="tel" placeholder="Phone Number" style="padding:12px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;">` : ""}
      <textarea placeholder="Your Message" rows="4" style="padding:12px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;resize:vertical;"></textarea>
      <button type="submit" style="padding:14px;background:${theme.primaryColor};color:#fff;border:none;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:1rem;cursor:pointer;font-weight:600;">Send Message</button>
    </form>
  </div>
</section>`;
}

function renderOrderForm(cfg: OrderFormBlockConfig, theme: LandingPageTheme) {
  return `<section id="order" style="padding:60px 20px;background:${theme.bgColor};">
  <div style="max-width:500px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${theme.textColor};">${cfg.heading}</h2>
    <form style="display:flex;flex-direction:column;gap:12px;">
      <input placeholder="Full Name" style="padding:12px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;">
      <input type="email" placeholder="Email" style="padding:12px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;">
      <input type="tel" placeholder="Phone" style="padding:12px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;">
      <input type="number" placeholder="Quantity" min="1" value="1" style="padding:12px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;">
      <textarea placeholder="Shipping Address" rows="3" style="padding:12px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;resize:vertical;"></textarea>
      <button type="submit" style="padding:14px;background:${theme.primaryColor};color:#fff;border:none;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:1rem;cursor:pointer;font-weight:600;">Place Order</button>
    </form>
  </div>
</section>`;
}

function renderSocialProof(cfg: SocialProofBlockConfig, theme: LandingPageTheme, stats?: { postCount: number; totalEngagement: number }) {
  const postCount = stats?.postCount ?? 0;
  const engagement = stats?.totalEngagement ?? 0;
  return `<section style="padding:60px 20px;background:#f9fafb;">
  <div style="max-width:700px;margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 32px;color:${theme.textColor};">${cfg.heading}</h2>
    <div style="display:flex;justify-content:center;gap:48px;">
      <div><p style="font-size:2rem;font-weight:700;color:${theme.primaryColor};margin:0;">${postCount}</p><p style="color:#6b7280;font-size:.9rem;margin:4px 0 0;">Posts Published</p></div>
      <div><p style="font-size:2rem;font-weight:700;color:${theme.primaryColor};margin:0;">${engagement.toLocaleString()}</p><p style="color:#6b7280;font-size:.9rem;margin:4px 0 0;">Total Engagement</p></div>
    </div>
  </div>
</section>`;
}

function renderMarketStats(cfg: MarketStatsBlockConfig, theme: LandingPageTheme, marketData?: { priceRange?: { min: number; max: number }; demandTrend?: string; competitorCount?: number }) {
  return `<section style="padding:60px 20px;background:${theme.bgColor};">
  <div style="max-width:700px;margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 32px;color:${theme.textColor};">${cfg.heading}</h2>
    <div style="display:flex;justify-content:center;gap:48px;flex-wrap:wrap;">
      ${marketData?.priceRange ? `<div><p style="font-size:1.5rem;font-weight:700;color:${theme.primaryColor};margin:0;">$${marketData.priceRange.min} – $${marketData.priceRange.max}</p><p style="color:#6b7280;font-size:.9rem;margin:4px 0 0;">Market Price Range</p></div>` : ""}
      ${marketData?.demandTrend ? `<div><p style="font-size:1.5rem;font-weight:700;color:${theme.primaryColor};margin:0;text-transform:capitalize;">${marketData.demandTrend}</p><p style="color:#6b7280;font-size:.9rem;margin:4px 0 0;">Demand Trend</p></div>` : ""}
      ${marketData?.competitorCount !== undefined ? `<div><p style="font-size:1.5rem;font-weight:700;color:${theme.primaryColor};margin:0;">${marketData.competitorCount}</p><p style="color:#6b7280;font-size:.9rem;margin:4px 0 0;">Competitors Tracked</p></div>` : ""}
    </div>
  </div>
</section>`;
}

export function generateStorefrontHtml(options: GenerateOptions): string {
  const { siteConfig, blocks, theme, products, marketData, socialStats } = options;
  const enabledBlocks = blocks.filter((b) => b.enabled);

  const sections = enabledBlocks.map((block) => {
    switch (block.type) {
      case "hero": return renderHero(block.config as HeroBlockConfig, theme);
      case "product-catalog": return renderProductCatalog(block.config as ProductCatalogBlockConfig, products, theme);
      case "about": return renderAbout(block.config as AboutBlockConfig, theme);
      case "testimonials": return renderTestimonials(block.config as TestimonialsBlockConfig, theme);
      case "faq": return renderFaq(block.config as FaqBlockConfig, theme);
      case "contact": return renderContact(block.config as ContactBlockConfig, theme);
      case "order-form": return renderOrderForm(block.config as OrderFormBlockConfig, theme);
      case "social-proof": return renderSocialProof(block.config as SocialProofBlockConfig, theme, socialStats);
      case "market-stats": return renderMarketStats(block.config as MarketStatsBlockConfig, theme, marketData);
      default: return "";
    }
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="description" content="${siteConfig.tagline}">
  <meta property="og:title" content="${siteConfig.name}">
  <meta property="og:description" content="${siteConfig.tagline}">
  <title>${siteConfig.name}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:${theme.bodyFont};color:${theme.textColor};background:${theme.bgColor};-webkit-font-smoothing:antialiased;}
    img{max-width:100%;}
    @media(max-width:768px){
      section div[style*="grid-template-columns"]{grid-template-columns:1fr!important;}
      section div[style*="display:flex"][style*="gap:48px"]{flex-direction:column;gap:24px!important;}
      h1{font-size:1.8rem!important;}
    }
  </style>
</head>
<body>
  <header style="background:${theme.secondaryColor};color:#fff;padding:16px 20px;display:flex;align-items:center;gap:12px;">
    ${siteConfig.logoUrl ? `<img src="${siteConfig.logoUrl}" alt="Logo" style="height:32px;">` : ""}
    <span style="font-family:${theme.headingFont};font-size:1.2rem;font-weight:700;">${siteConfig.name}</span>
  </header>
  ${sections}
  <footer style="background:${theme.secondaryColor};color:#fff;padding:32px 20px;text-align:center;font-size:.85rem;opacity:.8;">
    &copy; ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.
  </footer>
</body>
</html>`;
}
