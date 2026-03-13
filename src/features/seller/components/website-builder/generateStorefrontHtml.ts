import type { LandingPageTheme } from "../content-studio/types";
import type {
  SiteBlock, SiteConfig, ProductData,
  HeroBlockConfig, ProductCatalogBlockConfig, AboutBlockConfig,
  TestimonialsBlockConfig, FaqBlockConfig, ContactBlockConfig,
  OrderFormBlockConfig, SocialProofBlockConfig, MarketStatsBlockConfig,
  ProblemAgitationBlockConfig, SolutionBlockConfig, OfferPricingBlockConfig,
  FeaturesGridBlockConfig, PricingTableBlockConfig, ImageGalleryBlockConfig,
  VideoEmbedBlockConfig, CountdownTimerBlockConfig, NewsletterBlockConfig,
  ProductDetailBlockConfig, ShoppingCartBlockConfig, CheckoutFormBlockConfig,
  CustomerReviewsBlockConfig, OrderTrackingBlockConfig,
} from "./types";

interface GenerateOptions {
  siteConfig: SiteConfig;
  blocks: SiteBlock[];
  theme: LandingPageTheme;
  products: ProductData[];
  marketData?: { priceRange?: { min: number; max: number }; demandTrend?: string; competitorCount?: number };
  socialStats?: { postCount: number; totalEngagement: number };
}

// --- Theme helpers ---

function bgStyle(fallback: string, imageUrl?: string, fitToImage?: boolean, bgW?: number, bgH?: number): string {
  if (imageUrl) {
    const aspectStyle = fitToImage && bgW && bgH ? `aspect-ratio:${bgW}/${bgH};min-height:auto;` : "";
    return `background-image:url('${imageUrl}');background-size:cover;background-position:center;${aspectStyle}`;
  }
  return `background:${fallback};`;
}

// Shorthand: extract fit params from any block config that has BgImageDimensions
function bgFit(cfg: any): [boolean | undefined, number | undefined, number | undefined] {
  return [cfg.fitToImage, cfg.bgImageWidth, cfg.bgImageHeight];
}

function sectionPadFor(theme: LandingPageTheme, cfg: any): string {
  if (cfg.fitToImage && cfg.bgImageWidth && cfg.bgImageHeight) return "40px 20px";
  return sectionPad(theme);
}

function wrapWithOverlay(innerHtml: string, imageUrl?: string, opacity?: number): string {
  if (!imageUrl) return innerHtml;
  const op = typeof opacity === "number" ? opacity : 0.5;
  return `<div style="position:relative;">
  <div style="position:absolute;inset:0;background:rgba(0,0,0,${op});pointer-events:none;z-index:0;"></div>
  <div style="position:relative;z-index:1;">${innerHtml}</div>
</div>`;
}

function borderRadiusValue(br: string) {
  switch (br) { case "none": return "0"; case "small": return "4px"; case "medium": return "8px"; case "large": return "16px"; default: return "8px"; }
}

function sectionPad(theme: LandingPageTheme) {
  return `${theme.sectionPadding ?? 60}px 20px`;
}

function maxW(theme: LandingPageTheme) {
  return `${theme.contentMaxWidth ?? 1100}px`;
}

function shadowValue(theme: LandingPageTheme) {
  switch (theme.cardShadow) {
    case "none": return "none";
    case "small": return "0 1px 3px rgba(0,0,0,.08)";
    case "large": return "0 8px 32px rgba(0,0,0,.12)";
    default: return "0 4px 16px rgba(0,0,0,.08)";
  }
}

function btnStyle(theme: LandingPageTheme, isPrimary = true) {
  const br = borderRadiusValue(theme.borderRadius);
  const gradient = theme.gradientEnabled ? `linear-gradient(${theme.gradientAngle ?? 135}deg,${theme.gradientStart || theme.primaryColor},${theme.gradientEnd || theme.accentColor})` : theme.primaryColor;
  switch (theme.buttonStyle) {
    case "outline":
      return `padding:14px 32px;background:transparent;color:${theme.primaryColor};border:2px solid ${theme.primaryColor};border-radius:${br};text-decoration:none;font-weight:600;display:inline-block;`;
    case "pill":
      return `padding:14px 32px;background:${isPrimary ? gradient : "transparent"};color:${isPrimary ? "#fff" : theme.primaryColor};border:${isPrimary ? "none" : `2px solid ${theme.primaryColor}`};border-radius:999px;text-decoration:none;font-weight:600;display:inline-block;`;
    case "gradient":
      return `padding:14px 32px;background:${gradient};color:#fff;border:none;border-radius:${br};text-decoration:none;font-weight:600;display:inline-block;`;
    default:
      return `padding:14px 32px;background:${theme.primaryColor};color:#fff;border:none;border-radius:${br};text-decoration:none;font-weight:600;display:inline-block;`;
  }
}

const NEON_GREEN = "#39d98a";
const NEON_GREEN_GLOW = "0 0 20px rgba(57,217,138,0.4), 0 0 40px rgba(57,217,138,0.15)";

function neonBtnStyle(theme: LandingPageTheme) {
  const br = borderRadiusValue(theme.borderRadius);
  return `padding:14px 32px;background:${NEON_GREEN};color:#000;border:none;border-radius:${br};text-decoration:none;font-weight:700;display:inline-block;box-shadow:${NEON_GREEN_GLOW};transition:all .2s;`;
}

function hoverCss(theme: LandingPageTheme) {
  switch (theme.hoverEffect) {
    case "lift": return `.hoverable:hover{transform:translateY(-4px);box-shadow:${shadowValue({ ...theme, cardShadow: "large" })};} .hoverable{transition:transform .2s,box-shadow .2s;}`;
    case "glow": return `.hoverable:hover{box-shadow:0 0 20px ${theme.primaryColor}40;} .hoverable{transition:box-shadow .2s;}`;
    case "scale": return `.hoverable:hover{transform:scale(1.03);} .hoverable{transition:transform .2s;}`;
    default: return "";
  }
}

function heroBg(theme: LandingPageTheme, imageUrl?: string, fitToImage?: boolean, bgW?: number, bgH?: number) {
  if (imageUrl) {
    const aspectStyle = fitToImage && bgW && bgH ? `aspect-ratio:${bgW}/${bgH};min-height:auto;` : "";
    return `background-image:url('${imageUrl}');background-size:cover;background-position:center;${aspectStyle}`;
  }
  if (theme.gradientEnabled) return `background:linear-gradient(${theme.gradientAngle ?? 135}deg,${theme.gradientStart || theme.primaryColor},${theme.gradientEnd || theme.accentColor});`;
  return `background:${theme.primaryColor};`;
}

// --- Block Renderers ---

function renderHero(cfg: HeroBlockConfig, theme: LandingPageTheme) {
  const bg = heroBg(theme, cfg.backgroundImageUrl, cfg.fitToImage, cfg.bgImageWidth, cfg.bgImageHeight);
  const hSize = theme.headingSize ?? 40;
  const fitPad = cfg.fitToImage && cfg.bgImageWidth && cfg.bgImageHeight ? "padding:40px 20px;" : "padding:80px 20px;";
  const inner = `
  <div style="max-width:900px;margin:0 auto;">
    <h1 style="font-family:${theme.headingFont};font-size:${hSize}px;margin:0 0 16px;">${cfg.title}</h1>
    <p style="font-size:${(theme.bodySize ?? 16) * 1.2}px;opacity:.9;margin:0 0 24px;">${cfg.subtitle}</p>
    <a href="#order" style="${btnStyle(theme)}">${cfg.ctaText}</a>
  </div>`;
  return `<section style="${bg}color:#fff;${fitPad}text-align:${theme.heroStyle === "left-aligned" ? "left" : "center"};">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderProductCatalog(cfg: ProductCatalogBlockConfig, products: ProductData[], theme: LandingPageTheme) {
  const filtered = cfg.categoryFilter ? products.filter((p) => p.category?.toLowerCase().includes(cfg.categoryFilter.toLowerCase())) : products;
  const cards = filtered.map((p) => `
    <div class="hoverable" style="border:1px solid #e5e7eb;border-radius:${borderRadiusValue(theme.borderRadius)};overflow:hidden;background:#fff;box-shadow:${shadowValue(theme)};">
      ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:200px;object-fit:cover;">` : `<div style="width:100%;height:200px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;">No Image</div>`}
      <div style="padding:16px;">
        <h3 style="margin:0 0 8px;font-family:${theme.headingFont};font-size:1rem;">${p.name}</h3>
        ${cfg.showDescription && p.description ? `<p style="margin:0 0 8px;font-size:.85rem;color:#6b7280;">${p.description.substring(0, 100)}${p.description.length > 100 ? "…" : ""}</p>` : ""}
        ${cfg.showPrice ? `<p style="margin:0;font-weight:700;color:${theme.primaryColor};font-size:1.1rem;">$${p.current_price.toFixed(2)}</p>` : ""}
      </div>
    </div>`).join("");
  return `<section style="padding:${sectionPad(theme)};background:${theme.bgColor};">
  <div style="max-width:${maxW(theme)};margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${theme.textColor};">Our Products</h2>
    <div style="display:grid;grid-template-columns:repeat(${cfg.columns},1fr);gap:24px;">${cards}</div>
  </div>
</section>`;
}

function renderAbout(cfg: AboutBlockConfig, theme: LandingPageTheme) {
  return `<section style="padding:${sectionPad(theme)};background:${theme.bgColor};">
  <div style="max-width:800px;margin:0 auto;${cfg.imageUrl ? "display:flex;gap:32px;align-items:center;" : "text-align:center;"}">
    ${cfg.imageUrl ? `<img src="${cfg.imageUrl}" alt="About" style="width:300px;border-radius:${borderRadiusValue(theme.borderRadius)};object-fit:cover;">` : ""}
    <div>
      <h2 style="font-family:${theme.headingFont};margin:0 0 16px;color:${theme.textColor};">About Us</h2>
      <p style="font-family:${theme.bodyFont};color:#6b7280;line-height:1.7;font-size:${theme.bodySize ?? 16}px;">${cfg.content}</p>
    </div>
  </div>
</section>`;
}

function renderTestimonials(cfg: TestimonialsBlockConfig, theme: LandingPageTheme) {
  const cards = cfg.items.map((t) => `
    <div class="hoverable" style="background:#fff;border:1px solid #e5e7eb;border-radius:${borderRadiusValue(theme.borderRadius)};padding:24px;box-shadow:${shadowValue(theme)};">
      <p style="font-style:italic;color:#374151;margin:0 0 12px;">"${t.quote}"</p>
      <p style="margin:0;font-weight:600;color:${theme.primaryColor};font-size:.9rem;">— ${t.author}</p>
    </div>`).join("");
  const inner = `
  <div style="max-width:${maxW(theme)};margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${cfg.backgroundImageUrl ? "#fff" : theme.textColor};">What Our Customers Say</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">${cards}</div>
  </div>`;
  return `<section style="padding:${sectionPadFor(theme, cfg)};${bgStyle("#f9fafb", cfg.backgroundImageUrl, ...bgFit(cfg))}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderFaq(cfg: FaqBlockConfig, theme: LandingPageTheme) {
  const items = cfg.items.map((f) => `
    <div style="border-bottom:1px solid ${cfg.backgroundImageUrl ? "rgba(255,255,255,.2)" : "#e5e7eb"};padding:16px 0;">
      <h4 style="margin:0 0 8px;font-family:${theme.headingFont};color:${cfg.backgroundImageUrl ? "#fff" : theme.textColor};">${f.question}</h4>
      <p style="margin:0;color:${cfg.backgroundImageUrl ? "rgba(255,255,255,.8)" : "#6b7280"};font-size:.9rem;">${f.answer}</p>
    </div>`).join("");
  const inner = `
  <div style="max-width:700px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${cfg.backgroundImageUrl ? "#fff" : theme.textColor};">Frequently Asked Questions</h2>
    ${items}
  </div>`;
  return `<section style="padding:${sectionPadFor(theme, cfg)};${bgStyle(theme.bgColor, cfg.backgroundImageUrl, ...bgFit(cfg))}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderContact(cfg: ContactBlockConfig, theme: LandingPageTheme) {
  const br = borderRadiusValue(theme.borderRadius);
  const inner = `
  <div style="max-width:500px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${cfg.backgroundImageUrl ? "#fff" : theme.textColor};">${cfg.heading}</h2>
    <form style="display:flex;flex-direction:column;gap:12px;">
      <input placeholder="Your Name" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.9rem;">
      <input type="email" placeholder="Your Email" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.9rem;">
      ${cfg.showPhone ? `<input type="tel" placeholder="Phone" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.9rem;">` : ""}
      <textarea placeholder="Your Message" rows="4" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.9rem;resize:vertical;"></textarea>
      <button type="submit" style="${btnStyle(theme)}cursor:pointer;">Send Message</button>
    </form>
  </div>`;
  return `<section style="padding:${sectionPadFor(theme, cfg)};${bgStyle("#f9fafb", cfg.backgroundImageUrl, ...bgFit(cfg))}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderOrderForm(cfg: OrderFormBlockConfig, theme: LandingPageTheme) {
  const br = borderRadiusValue(theme.borderRadius);
  const inner = `
  <div style="max-width:500px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${cfg.backgroundImageUrl ? "#fff" : theme.textColor};">${cfg.heading}</h2>
    <form style="display:flex;flex-direction:column;gap:12px;">
      <input placeholder="Full Name" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.9rem;">
      <input type="email" placeholder="Email" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.9rem;">
      <input type="tel" placeholder="Phone" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.9rem;">
      <input type="number" placeholder="Quantity" min="1" value="1" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.9rem;">
      <textarea placeholder="Shipping Address" rows="3" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.9rem;resize:vertical;"></textarea>
      <button type="submit" style="${btnStyle(theme)}cursor:pointer;">Place Order</button>
    </form>
  </div>`;
  return `<section id="order" style="padding:${sectionPad(theme)};${bgStyle(theme.bgColor, cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderSocialProof(cfg: SocialProofBlockConfig, theme: LandingPageTheme, stats?: { postCount: number; totalEngagement: number }) {
  const textColor = cfg.backgroundImageUrl ? "#fff" : theme.textColor;
  const accentColor = cfg.backgroundImageUrl ? "#fff" : theme.primaryColor;
  const inner = `
  <div style="max-width:700px;margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 32px;color:${textColor};">${cfg.heading}</h2>
    <div style="display:flex;justify-content:center;gap:48px;">
      <div><p style="font-size:2rem;font-weight:700;color:${accentColor};margin:0;">${stats?.postCount ?? 0}</p><p style="color:${cfg.backgroundImageUrl ? "rgba(255,255,255,.8)" : "#6b7280"};font-size:.9rem;margin:4px 0 0;">Posts Published</p></div>
      <div><p style="font-size:2rem;font-weight:700;color:${accentColor};margin:0;">${(stats?.totalEngagement ?? 0).toLocaleString()}</p><p style="color:${cfg.backgroundImageUrl ? "rgba(255,255,255,.8)" : "#6b7280"};font-size:.9rem;margin:4px 0 0;">Total Engagement</p></div>
    </div>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle("#f9fafb", cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderMarketStats(cfg: MarketStatsBlockConfig, theme: LandingPageTheme, marketData?: any) {
  const textColor = cfg.backgroundImageUrl ? "#fff" : theme.textColor;
  const accentColor = cfg.backgroundImageUrl ? "#fff" : theme.primaryColor;
  const subColor = cfg.backgroundImageUrl ? "rgba(255,255,255,.8)" : "#6b7280";
  const inner = `
  <div style="max-width:700px;margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 32px;color:${textColor};">${cfg.heading}</h2>
    <div style="display:flex;justify-content:center;gap:48px;flex-wrap:wrap;">
      ${marketData?.priceRange ? `<div><p style="font-size:1.5rem;font-weight:700;color:${accentColor};margin:0;">$${marketData.priceRange.min} – $${marketData.priceRange.max}</p><p style="color:${subColor};font-size:.9rem;margin:4px 0 0;">Market Price Range</p></div>` : ""}
      ${marketData?.demandTrend ? `<div><p style="font-size:1.5rem;font-weight:700;color:${accentColor};margin:0;text-transform:capitalize;">${marketData.demandTrend}</p><p style="color:${subColor};font-size:.9rem;margin:4px 0 0;">Demand Trend</p></div>` : ""}
      ${marketData?.competitorCount !== undefined ? `<div><p style="font-size:1.5rem;font-weight:700;color:${accentColor};margin:0;">${marketData.competitorCount}</p><p style="color:${subColor};font-size:.9rem;margin:4px 0 0;">Competitors Tracked</p></div>` : ""}
    </div>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle(theme.bgColor, cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderProblemAgitation(cfg: ProblemAgitationBlockConfig, theme: LandingPageTheme) {
  const textColor = cfg.backgroundImageUrl ? "#fff" : theme.textColor;
  const bullets = cfg.painPoints.map((p) => `
    <div class="hoverable" style="background:#fff;border:1px solid #e5e7eb;border-radius:${borderRadiusValue(theme.borderRadius)};padding:24px;text-align:center;box-shadow:${shadowValue(theme)};">
      <div style="font-size:2rem;margin-bottom:8px;">${p.icon}</div>
      <h4 style="font-family:${theme.headingFont};margin:0 0 8px;color:${theme.textColor};">${p.title}</h4>
      <p style="margin:0;color:#6b7280;font-size:.9rem;">${p.description}</p>
    </div>`).join("");
  const inner = `
  <div style="max-width:800px;margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 12px;color:${textColor};">${cfg.heading}</h2>
    <p style="color:${cfg.backgroundImageUrl ? "rgba(255,255,255,.8)" : "#6b7280"};margin:0 0 32px;font-size:1.1rem;">${cfg.intro}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">${bullets}</div>
    <p style="margin-top:32px;font-size:1.15rem;font-weight:600;color:${cfg.backgroundImageUrl ? "#fff" : theme.primaryColor};">${cfg.reinforcement}</p>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle("#fef2f2", cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderSolution(cfg: SolutionBlockConfig, theme: LandingPageTheme) {
  const points = cfg.differentiationPoints.map((p) => `<li style="padding:6px 0;color:#374151;">✓ ${p}</li>`).join("");
  return `<section style="padding:${sectionPad(theme)};background:${theme.bgColor};">
  <div style="max-width:${maxW(theme)};margin:0 auto;${cfg.imageUrl ? "display:flex;gap:40px;align-items:center;" : "text-align:center;"}">
    ${cfg.imageUrl ? `<img src="${cfg.imageUrl}" alt="Solution" style="width:360px;border-radius:${borderRadiusValue(theme.borderRadius)};object-fit:cover;">` : ""}
    <div>
      <h2 style="font-family:${theme.headingFont};margin:0 0 12px;color:${theme.textColor};">${cfg.heading}</h2>
      <p style="color:#6b7280;margin:0 0 20px;font-size:1.05rem;">${cfg.intro}</p>
      <ul style="list-style:none;padding:0;margin:0 0 20px;text-align:left;">${points}</ul>
      <p style="font-style:italic;color:${theme.primaryColor};font-size:.95rem;">${cfg.credibilityText}</p>
    </div>
  </div>
</section>`;
}

function renderOfferPricing(cfg: OfferPricingBlockConfig, theme: LandingPageTheme) {
  const values = cfg.valueItems.map((v) => `<li style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#374151;">✓ ${v}</li>`).join("");
  const inner = `
  <div style="max-width:500px;margin:0 auto;text-align:center;background:#fff;border-radius:${borderRadiusValue(theme.borderRadius)};padding:40px;box-shadow:${shadowValue(theme)};">
    <h2 style="font-family:${theme.headingFont};margin:0 0 24px;color:${theme.textColor};">${cfg.heading}</h2>
    <ul style="list-style:none;padding:0;margin:0 0 24px;text-align:left;">${values}</ul>
    ${cfg.anchorPrice ? `<p style="color:#9ca3af;text-decoration:line-through;font-size:1.2rem;margin:0;">${cfg.anchorPrice}</p>` : ""}
    <p style="font-size:2.5rem;font-weight:800;color:${theme.primaryColor};margin:4px 0 16px;">${cfg.actualPrice}</p>
    ${cfg.scarcityText ? `<p style="color:#dc2626;font-weight:600;font-size:.9rem;margin:0 0 16px;">⚡ ${cfg.scarcityText}</p>` : ""}
    <a href="#order" style="${btnStyle(theme)}">${cfg.ctaText}</a>
  </div>`;
  const gradBg = theme.gradientEnabled
    ? `linear-gradient(135deg,${theme.primaryColor}11,${theme.accentColor}22)`
    : `linear-gradient(135deg,${theme.primaryColor}11,${theme.accentColor}22)`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle(gradBg, cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderFeaturesGrid(cfg: FeaturesGridBlockConfig, theme: LandingPageTheme) {
  const cards = cfg.items.map((item) => `
    <div class="hoverable" style="text-align:center;padding:24px;border:1px solid #e5e7eb;border-radius:${borderRadiusValue(theme.borderRadius)};background:#fff;box-shadow:${shadowValue(theme)};">
      <div style="font-size:2.5rem;margin-bottom:12px;">${item.icon}</div>
      <h4 style="font-family:${theme.headingFont};margin:0 0 8px;color:${theme.textColor};font-size:1rem;">${item.title}</h4>
      <p style="margin:0;color:#6b7280;font-size:.9rem;line-height:1.5;">${item.description}</p>
    </div>`).join("");
  const textColor = cfg.backgroundImageUrl ? "#fff" : theme.textColor;
  const inner = `
  <div style="max-width:${maxW(theme)};margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 8px;color:${textColor};">${cfg.heading}</h2>
    <p style="color:${cfg.backgroundImageUrl ? "rgba(255,255,255,.8)" : "#6b7280"};margin:0 0 40px;font-size:1.05rem;">${cfg.subtitle}</p>
    <div style="display:grid;grid-template-columns:repeat(${cfg.columns},1fr);gap:24px;">${cards}</div>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle(theme.bgColor, cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderPricingTable(cfg: PricingTableBlockConfig, theme: LandingPageTheme) {
  const plans = cfg.plans.map((plan) => {
    const features = plan.features.map((f) => `<li style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#374151;font-size:.9rem;">✓ ${f}</li>`).join("");
    const border = plan.highlighted ? `border:2px solid ${theme.primaryColor};` : "border:1px solid #e5e7eb;";
    const badge = plan.highlighted ? `<div style="background:${theme.primaryColor};color:#fff;text-align:center;padding:4px;font-size:.75rem;font-weight:600;">MOST POPULAR</div>` : "";
    return `
    <div class="hoverable" style="${border}border-radius:${borderRadiusValue(theme.borderRadius)};overflow:hidden;background:#fff;box-shadow:${shadowValue(theme)};">
      ${badge}
      <div style="padding:32px 24px;text-align:center;">
        <h3 style="font-family:${theme.headingFont};margin:0 0 16px;color:${theme.textColor};">${plan.name}</h3>
        <p style="font-size:2.5rem;font-weight:800;color:${theme.primaryColor};margin:0;">${plan.price}<span style="font-size:.9rem;font-weight:400;color:#9ca3af;">${plan.period}</span></p>
        <ul style="list-style:none;padding:0;margin:24px 0;text-align:left;">${features}</ul>
        <a href="#order" style="${plan.highlighted ? btnStyle(theme) : btnStyle(theme, false)}">${plan.ctaText}</a>
      </div>
    </div>`;
  }).join("");
  const textColor = cfg.backgroundImageUrl ? "#fff" : theme.textColor;
  const inner = `
  <div style="max-width:${maxW(theme)};margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 40px;color:${textColor};">${cfg.heading}</h2>
    <div style="display:grid;grid-template-columns:repeat(${cfg.plans.length},1fr);gap:24px;">${plans}</div>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle("#f9fafb", cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderImageGallery(cfg: ImageGalleryBlockConfig, theme: LandingPageTheme) {
  const imgs = cfg.images.filter((i) => i.url).map((img) => `
    <div class="hoverable" style="border-radius:${borderRadiusValue(theme.borderRadius)};overflow:hidden;border:1px solid #e5e7eb;box-shadow:${shadowValue(theme)};">
      <img src="${img.url}" alt="${img.caption}" style="width:100%;height:250px;object-fit:cover;display:block;">
      ${img.caption ? `<p style="padding:8px 12px;margin:0;font-size:.85rem;color:#6b7280;background:#fff;">${img.caption}</p>` : ""}
    </div>`).join("");
  const textColor = cfg.backgroundImageUrl ? "#fff" : theme.textColor;
  const inner = `
  <div style="max-width:${maxW(theme)};margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${textColor};">${cfg.heading}</h2>
    <div style="display:grid;grid-template-columns:repeat(${cfg.columns},1fr);gap:16px;">${imgs}</div>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle(theme.bgColor, cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderVideoEmbed(cfg: VideoEmbedBlockConfig, theme: LandingPageTheme) {
  let embedHtml = "";
  if (cfg.videoUrl) {
    if (cfg.provider === "youtube") {
      const videoId = cfg.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/)?.[1] || cfg.videoUrl;
      embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}${cfg.autoplay ? "?autoplay=1&mute=1" : ""}" style="width:100%;aspect-ratio:16/9;border:none;border-radius:${borderRadiusValue(theme.borderRadius)};" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
    } else if (cfg.provider === "vimeo") {
      const vimeoId = cfg.videoUrl.match(/vimeo\.com\/(\d+)/)?.[1] || cfg.videoUrl;
      embedHtml = `<iframe src="https://player.vimeo.com/video/${vimeoId}${cfg.autoplay ? "?autoplay=1&muted=1" : ""}" style="width:100%;aspect-ratio:16/9;border:none;border-radius:${borderRadiusValue(theme.borderRadius)};" allow="autoplay;fullscreen" allowfullscreen></iframe>`;
    } else {
      embedHtml = `<video src="${cfg.videoUrl}" ${cfg.autoplay ? "autoplay muted" : ""} controls style="width:100%;border-radius:${borderRadiusValue(theme.borderRadius)};"></video>`;
    }
  } else {
    embedHtml = `<div style="width:100%;aspect-ratio:16/9;background:#f3f4f6;display:flex;align-items:center;justify-content:center;border-radius:${borderRadiusValue(theme.borderRadius)};color:#9ca3af;">Add a video URL</div>`;
  }
  const textColor = cfg.backgroundImageUrl ? "#fff" : theme.textColor;
  const inner = `
  <div style="max-width:800px;margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 24px;color:${textColor};">${cfg.heading}</h2>
    ${embedHtml}
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle(theme.bgColor, cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderCountdownTimer(cfg: CountdownTimerBlockConfig, theme: LandingPageTheme) {
  const bg = heroBg(theme, cfg.backgroundImageUrl);
  const inner = `
  <div style="max-width:600px;margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 8px;color:#fff;">${cfg.heading}</h2>
    <p style="color:rgba(255,255,255,.8);margin:0 0 24px;font-size:1.05rem;">${cfg.subtitle}</p>
    <div id="countdown-display" style="display:flex;justify-content:center;gap:16px;margin-bottom:24px;">
      ${["Days", "Hours", "Minutes", "Seconds"].map((label, i) => `
      <div style="background:rgba(255,255,255,.15);padding:16px 20px;border-radius:${borderRadiusValue(theme.borderRadius)};min-width:70px;">
        <span class="cd-${["days","hours","mins","secs"][i]}" style="font-size:2rem;font-weight:800;color:#fff;">00</span>
        <p style="margin:4px 0 0;font-size:.75rem;color:rgba(255,255,255,.7);">${label}</p>
      </div>`).join("")}
    </div>
    <a href="${cfg.ctaUrl || "#"}" style="${btnStyle({ ...theme, primaryColor: "#fff", buttonStyle: "filled" })}color:${theme.primaryColor};">${cfg.ctaText}</a>
  </div>
  <script>
  (function(){
    var target=new Date("${cfg.targetDate}T00:00:00").getTime();
    function upd(){var now=Date.now();var diff=Math.max(0,target-now);var d=Math.floor(diff/86400000);var h=Math.floor((diff%86400000)/3600000);var m=Math.floor((diff%3600000)/60000);var s=Math.floor((diff%60000)/1000);var el=document.getElementById("countdown-display");if(el){el.querySelector(".cd-days").textContent=String(d).padStart(2,"0");el.querySelector(".cd-hours").textContent=String(h).padStart(2,"0");el.querySelector(".cd-mins").textContent=String(m).padStart(2,"0");el.querySelector(".cd-secs").textContent=String(s).padStart(2,"0");}}
    upd();setInterval(upd,1000);
  })();
  </script>`;
  return `<section style="padding:${sectionPad(theme)};${bg}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderNewsletter(cfg: NewsletterBlockConfig, theme: LandingPageTheme) {
  const textColor = cfg.backgroundImageUrl ? "#fff" : theme.textColor;
  const inner = `
  <div style="max-width:500px;margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 8px;color:${textColor};">${cfg.heading}</h2>
    <p style="color:${cfg.backgroundImageUrl ? "rgba(255,255,255,.8)" : "#6b7280"};margin:0 0 24px;font-size:.95rem;">${cfg.subtitle}</p>
    <form style="display:flex;gap:8px;">
      <input type="email" placeholder="${cfg.placeholderText}" style="flex:1;padding:14px;border:1px solid #d1d5db;border-radius:${borderRadiusValue(theme.borderRadius)};font-size:.9rem;">
      <button type="submit" style="${btnStyle(theme)}cursor:pointer;white-space:nowrap;">${cfg.buttonText}</button>
    </form>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle("#f9fafb", cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderProductDetail(cfg: ProductDetailBlockConfig, theme: LandingPageTheme) {
  const br = borderRadiusValue(theme.borderRadius);
  const images = cfg.images.length > 0
    ? cfg.images.map((url, i) => `<img src="${url}" alt="Product ${i + 1}" style="width:100%;height:300px;object-fit:cover;border-radius:${br};${i > 0 ? "display:none;" : ""}">`).join("")
    : `<div style="width:100%;height:300px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;border-radius:${br};color:#9ca3af;font-size:3rem;">📦</div>`;
  const variants = cfg.variants.map((v) => `
    <div style="margin-bottom:12px;">
      <p style="font-size:.8rem;font-weight:600;color:${theme.textColor};margin:0 0 6px;">${v.type}</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${v.options.map((o, i) => `<span style="padding:6px 14px;border:${i === 0 ? `2px solid ${theme.primaryColor}` : "1px solid #d1d5db"};border-radius:${br};font-size:.8rem;cursor:pointer;${i === 0 ? `background:${theme.primaryColor}11;font-weight:600;` : ""}">${o}</span>`).join("")}
      </div>
    </div>`).join("");
  const inner = `
  <div style="max-width:${maxW(theme)};margin:0 auto;display:flex;gap:40px;align-items:flex-start;flex-wrap:wrap;">
    <div style="flex:1;min-width:300px;">${images}</div>
    <div style="flex:1;min-width:300px;">
      <h2 style="font-family:${theme.headingFont};margin:0 0 8px;color:${theme.textColor};">${cfg.productName}</h2>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <span style="font-size:1.8rem;font-weight:800;color:${theme.primaryColor};">${cfg.price}</span>
        ${cfg.compareAtPrice ? `<span style="font-size:1.1rem;text-decoration:line-through;color:#9ca3af;">${cfg.compareAtPrice}</span>` : ""}
      </div>
      <p style="color:#6b7280;line-height:1.6;margin:0 0 20px;font-size:.95rem;">${cfg.description}</p>
      ${variants}
      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
        <button style="${neonBtnStyle(theme)}cursor:pointer;flex:1;min-width:180px;text-align:center;" onmouseover="this.style.filter='brightness(1.15)'" onmouseout="this.style.filter='none'">🛒 Add to Cart</button>
        <button style="padding:14px 20px;background:transparent;border:2px solid ${theme.primaryColor};color:${theme.primaryColor};border-radius:${br};cursor:pointer;font-weight:600;">♡</button>
      </div>
    </div>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle(theme.bgColor, cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderShoppingCart(cfg: ShoppingCartBlockConfig, theme: LandingPageTheme) {
  const br = borderRadiusValue(theme.borderRadius);
  const inner = `
  <div style="max-width:500px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 24px;color:${cfg.backgroundImageUrl ? "#fff" : theme.textColor};">${cfg.heading}</h2>
    <div style="background:rgba(255,255,255,0.7);backdrop-filter:blur(16px) saturate(1.8);-webkit-backdrop-filter:blur(16px) saturate(1.8);border:1px solid rgba(255,255,255,0.3);border-radius:${br};overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
      <div style="padding:16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:12px;">
        <div style="width:60px;height:60px;background:#f3f4f6;border-radius:${br};display:flex;align-items:center;justify-content:center;">📦</div>
        <div style="flex:1;">
          <p style="margin:0;font-weight:600;font-size:.9rem;">Sample Product</p>
          <p style="margin:2px 0 0;color:#6b7280;font-size:.8rem;">Qty: 1</p>
        </div>
        <p style="margin:0;font-weight:700;color:${theme.primaryColor};">$99.00</p>
      </div>
      <div style="padding:16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:12px;">
        <div style="width:60px;height:60px;background:#f3f4f6;border-radius:${br};display:flex;align-items:center;justify-content:center;">📦</div>
        <div style="flex:1;">
          <p style="margin:0;font-weight:600;font-size:.9rem;">Another Product</p>
          <p style="margin:2px 0 0;color:#6b7280;font-size:.8rem;">Qty: 2</p>
        </div>
        <p style="margin:0;font-weight:700;color:${theme.primaryColor};">$59.00</p>
      </div>
      <div style="padding:16px;display:flex;justify-content:space-between;align-items:center;background:#f9fafb;">
        <span style="font-weight:700;font-size:1.1rem;">Total: $217.00</span>
        <button style="${neonBtnStyle(theme)}cursor:pointer;" onmouseover="this.style.filter='brightness(1.15)'" onmouseout="this.style.filter='none'">${cfg.ctaText}</button>
      </div>
    </div>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle("#f9fafb", cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderCheckoutForm(cfg: CheckoutFormBlockConfig, theme: LandingPageTheme) {
  const br = borderRadiusValue(theme.borderRadius);
  const payIcons = cfg.enabledPaymentMethods.map((m) => {
    const labels: Record<string, string> = { stripe: "💳 Credit Card", paypal: "🅿️ PayPal", cod: "💵 Cash on Delivery" };
    return `<label style="display:flex;align-items:center;gap:8px;padding:12px;border:1px solid #d1d5db;border-radius:${br};cursor:pointer;font-size:.85rem;"><input type="radio" name="payment" style="accent-color:${theme.primaryColor};">${labels[m] || m}</label>`;
  }).join("");
  const inner = `
  <div style="max-width:600px;margin:0 auto;">
    <h2 style="font-family:${theme.headingFont};text-align:center;margin:0 0 32px;color:${cfg.backgroundImageUrl ? "#fff" : theme.textColor};">${cfg.heading}</h2>
    <form style="display:flex;flex-direction:column;gap:20px;">
      <div>
        <p style="font-weight:600;margin:0 0 8px;font-size:.9rem;color:${theme.textColor};">Shipping Address</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <input placeholder="First Name" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.85rem;">
          <input placeholder="Last Name" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.85rem;">
        </div>
        <input placeholder="Street Address" style="width:100%;padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.85rem;margin-top:8px;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;margin-top:8px;">
          <input placeholder="City" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.85rem;">
          <input placeholder="State" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.85rem;">
          <input placeholder="ZIP" style="padding:12px;border:1px solid #d1d5db;border-radius:${br};font-size:.85rem;">
        </div>
      </div>
      <div>
        <p style="font-weight:600;margin:0 0 8px;font-size:.9rem;color:${theme.textColor};">Payment Method</p>
        <div style="display:flex;flex-direction:column;gap:8px;">${payIcons}</div>
      </div>
      <button type="submit" style="${neonBtnStyle(theme)}cursor:pointer;width:100%;text-align:center;" onmouseover="this.style.filter='brightness(1.15)'" onmouseout="this.style.filter='none'">Complete Order</button>
    </form>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle(theme.bgColor, cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderCustomerReviews(cfg: CustomerReviewsBlockConfig, theme: LandingPageTheme) {
  const br = borderRadiusValue(theme.borderRadius);
  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
  const cards = cfg.reviews.map((r) => `
    <div class="hoverable" style="background:rgba(255,255,255,0.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.3);border-radius:${br};padding:20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="color:${theme.primaryColor};font-size:1rem;letter-spacing:2px;">${stars(r.rating)}</span>
        <span style="color:#9ca3af;font-size:.75rem;">${r.date}</span>
      </div>
      <p style="margin:0 0 8px;color:#374151;font-size:.9rem;line-height:1.5;">"${r.comment}"</p>
      <p style="margin:0;font-weight:600;font-size:.85rem;color:${theme.textColor};">— ${r.author}</p>
    </div>`).join("");
  const avgRating = cfg.reviews.length > 0 ? (cfg.reviews.reduce((s, r) => s + r.rating, 0) / cfg.reviews.length).toFixed(1) : "0";
  const textColor = cfg.backgroundImageUrl ? "#fff" : theme.textColor;
  const inner = `
  <div style="max-width:${maxW(theme)};margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 8px;color:${textColor};">${cfg.heading}</h2>
    <p style="color:${theme.primaryColor};font-size:1.5rem;margin:0 0 32px;letter-spacing:2px;">${stars(Math.round(Number(avgRating)))} <span style="font-size:.9rem;color:${cfg.backgroundImageUrl ? "rgba(255,255,255,.7)" : "#9ca3af"};">(${avgRating} avg)</span></p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">${cards}</div>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle("#f9fafb", cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
</section>`;
}

function renderOrderTracking(cfg: OrderTrackingBlockConfig, theme: LandingPageTheme) {
  const br = borderRadiusValue(theme.borderRadius);
  const steps = cfg.steps.map((s, i) => {
    const color = s.status === "completed" ? theme.primaryColor : s.status === "active" ? theme.accentColor : "#d1d5db";
    const textColor = s.status === "pending" ? "#9ca3af" : theme.textColor;
    const icon = s.status === "completed" ? "✓" : s.status === "active" ? "●" : "○";
    const connector = i < cfg.steps.length - 1
      ? `<div style="flex:1;height:3px;background:${cfg.steps[i + 1].status === "pending" ? "#e5e7eb" : theme.primaryColor};margin:0 -4px;"></div>`
      : "";
    return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;position:relative;">
      <div style="width:36px;height:36px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem;z-index:1;">${icon}</div>
      <p style="margin:8px 0 0;font-size:.8rem;font-weight:${s.status === "active" ? "700" : "500"};color:${textColor};text-align:center;">${s.label}</p>
    </div>${connector}`;
  }).join("");
  const inner = `
  <div style="max-width:700px;margin:0 auto;text-align:center;">
    <h2 style="font-family:${theme.headingFont};margin:0 0 32px;color:${cfg.backgroundImageUrl ? "#fff" : theme.textColor};">${cfg.heading}</h2>
    <div style="display:flex;align-items:flex-start;gap:0;">${steps}</div>
  </div>`;
  return `<section style="padding:${sectionPad(theme)};${bgStyle(theme.bgColor, cfg.backgroundImageUrl)}">
  ${wrapWithOverlay(inner, cfg.backgroundImageUrl, cfg.overlayOpacity)}
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
      case "problem-agitation": return renderProblemAgitation(block.config as ProblemAgitationBlockConfig, theme);
      case "solution": return renderSolution(block.config as SolutionBlockConfig, theme);
      case "offer-pricing": return renderOfferPricing(block.config as OfferPricingBlockConfig, theme);
      case "features-grid": return renderFeaturesGrid(block.config as FeaturesGridBlockConfig, theme);
      case "pricing-table": return renderPricingTable(block.config as PricingTableBlockConfig, theme);
      case "image-gallery": return renderImageGallery(block.config as ImageGalleryBlockConfig, theme);
      case "video-embed": return renderVideoEmbed(block.config as VideoEmbedBlockConfig, theme);
      case "countdown-timer": return renderCountdownTimer(block.config as CountdownTimerBlockConfig, theme);
      case "newsletter": return renderNewsletter(block.config as NewsletterBlockConfig, theme);
      case "product-detail": return renderProductDetail(block.config as ProductDetailBlockConfig, theme);
      case "shopping-cart": return renderShoppingCart(block.config as ShoppingCartBlockConfig, theme);
      case "checkout-form": return renderCheckoutForm(block.config as CheckoutFormBlockConfig, theme);
      case "customer-reviews": return renderCustomerReviews(block.config as CustomerReviewsBlockConfig, theme);
      case "order-tracking": return renderOrderTracking(block.config as OrderTrackingBlockConfig, theme);
      default: return "";
    }
  }).join("\n");

  const metaTitle = siteConfig.metaTitle || siteConfig.name;
  const metaDesc = siteConfig.metaDescription || siteConfig.tagline;
  const metaKw = siteConfig.metaKeywords ? `<meta name="keywords" content="${siteConfig.metaKeywords}">` : "";
  const ogImage = siteConfig.ogImage ? `<meta property="og:image" content="${siteConfig.ogImage}">` : "";
  const favicon = siteConfig.favicon ? `<link rel="icon" href="${siteConfig.favicon}">` : "";

  const fontFamilies = new Set<string>();
  [theme.headingFont, theme.bodyFont].forEach((f) => {
    const match = f.match(/'([^']+)'/);
    if (match && !["Inter", "Georgia", "Times New Roman"].includes(match[1])) fontFamilies.add(match[1]);
  });
  const googleFontsLink = fontFamilies.size > 0
    ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${[...fontFamilies].map((f) => `family=${f.replace(/ /g, "+")}:wght@400;600;700;800`).join("&")}&display=swap" rel="stylesheet">`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${metaTitle}</title>
  <meta name="description" content="${metaDesc}">
  ${metaKw}
  <meta property="og:title" content="${metaTitle}">
  <meta property="og:description" content="${metaDesc}">
  ${ogImage}
  ${favicon}
  ${googleFontsLink}
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:${theme.bodyFont};color:${theme.textColor};background:${theme.bgColor};-webkit-font-smoothing:antialiased;font-size:${theme.bodySize ?? 16}px;}
    img{max-width:100%;}
    ${hoverCss(theme)}
    .neon-btn:hover{filter:brightness(1.15);box-shadow:0 0 28px rgba(57,217,138,0.5),0 0 56px rgba(57,217,138,0.2);}
    @media(max-width:768px){
      section div[style*="grid-template-columns"]{grid-template-columns:1fr!important;}
      section div[style*="display:flex"][style*="gap:48px"]{flex-direction:column;gap:24px!important;}
      section div[style*="display:flex"][style*="gap:16px"]{flex-direction:column;gap:12px!important;}
      section div[style*="display:flex"][style*="min-width:300px"]{flex-direction:column!important;}
      section div[style*="grid-template-columns:2fr"]{grid-template-columns:1fr!important;}
      section div[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr!important;}
      h1{font-size:1.8rem!important;}
      h2{font-size:1.4rem!important;}
      section{padding:40px 16px!important;}
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
