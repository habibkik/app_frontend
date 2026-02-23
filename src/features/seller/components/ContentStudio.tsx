import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Loader2,
  Wand2,
  ImageIcon,
  Camera,
  Share2,
  Video,
  Globe,
  Mail,
  Target,
  AlertCircle,
  Download,
  FileArchive,
} from "lucide-react";
import { MarketingFlowBanner } from "./MarketingFlowBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAnalysisStore, type MarketAnalysisResult } from "@/stores/analysisStore";
import { useContentStudioStore } from "@/stores/contentStudioStore";
import type {
  ContentStudioTab,
  GeneratedImage,
  SocialImagePost,
  EmailCampaign,
  ContentScore,
  LandingPageData,
  GenerationStep,
  LandingPageTheme,
  LandingPageSection,
} from "./content-studio/types";
import { DEFAULT_LANDING_THEME, DEFAULT_SECTION_ORDER } from "./content-studio/types";
// ImageGenerationTab removed — replaced by ProImageGenerationTab
import { SocialImagePostsTab } from "./content-studio/SocialImagePostsTab";
import { VideoTab } from "./content-studio/VideoTab";
import { SocialVideoPostsTab } from "./content-studio/SocialVideoPostsTab";
import { LandingPageTab } from "./content-studio/LandingPageTab";
import { EmailCampaignTab } from "./content-studio/EmailCampaignTab";
import { ContentScoreTab } from "./content-studio/ContentScoreTab";
import { ProImageGenerationTab } from "./content-studio/ProImageGenerationTab";

const TABS: { id: ContentStudioTab; label: string; icon: React.ElementType }[] = [
  { id: "pro-images", label: "Pro Photography", icon: Camera },
  { id: "social-image", label: "Social (Image)", icon: Share2 },
  { id: "video", label: "Video", icon: Video },
  { id: "social-video", label: "Social (Video)", icon: Video },
  { id: "landing-page", label: "Landing Page", icon: Globe },
  { id: "email", label: "Email Campaign", icon: Mail },
  { id: "score", label: "Score & Optimize", icon: Target },
];

// ─── Scoring Algorithm ──────────────────────────────────────
function calculateContentScore(
  socialPosts: SocialImagePost[],
  emailCampaigns: EmailCampaign[],
  sellerResults: MarketAnalysisResult | null
): ContentScore {
  // Headline clarity
  const avgCaptionLength = socialPosts.reduce((a, p) => a + p.caption.length, 0) / Math.max(socialPosts.length, 1);
  const headlineClarity = Math.min(20, Math.round((avgCaptionLength > 20 && avgCaptionLength < 300 ? 18 : 12)));

  // CTA strength
  const actionVerbs = ["buy", "shop", "get", "try", "start", "discover", "order", "claim", "save", "join"];
  const ctaHits = socialPosts.filter((p) => actionVerbs.some((v) => p.cta.toLowerCase().includes(v))).length;
  const ctaStrength = Math.min(20, Math.round((ctaHits / Math.max(socialPosts.length, 1)) * 20));

  // Emotional appeal
  const emotionWords = ["love", "amazing", "incredible", "transform", "dream", "exclusive", "premium", "ultimate", "best", "powerful"];
  const emotionHits = socialPosts.filter((p) =>
    emotionWords.some((w) => p.caption.toLowerCase().includes(w) || p.hook.toLowerCase().includes(w))
  ).length;
  const emotionalAppeal = Math.min(20, Math.round((emotionHits / Math.max(socialPosts.length, 1)) * 20));

  // Platform optimization
  const platformOptimization = Math.min(20, socialPosts.length >= 5 ? 18 : socialPosts.length * 3 + 3);

  // Competitive differentiation
  const competitorNames = sellerResults?.competitors?.map((c) => c.name.toLowerCase()) || [];
  const diffHits = socialPosts.filter((p) => {
    const text = (p.caption + p.hook).toLowerCase();
    return competitorNames.some((c) => text.includes("unlike") || text.includes("better") || text.includes("only"));
  }).length;
  const competitiveDifferentiation = Math.min(20, 10 + Math.round((diffHits / Math.max(socialPosts.length, 1)) * 10));

  const overall = headlineClarity + ctaStrength + emotionalAppeal + platformOptimization + competitiveDifferentiation;

  const suggestions = [
    "Highlight what makes your product unique vs. competitors",
    "Use specific numbers and data points from market analysis",
    "Add customer-centric language focusing on outcomes",
  ];
  const abTestSuggestions = [
    "Test emotional hook vs. data-driven hook in headlines",
    "A/B test urgency-based CTA vs. benefit-based CTA",
    "Compare long-form vs. short-form social captions",
  ];
  const pricingAngleSuggestions = sellerResults?.pricingRecommendation
    ? [
        `Position at $${sellerResults.pricingRecommendation.suggested} based on market analysis`,
        "Emphasize value over price in premium positioning",
        "Use anchoring by showing competitor price ranges",
      ]
    : ["Conduct market analysis first for pricing suggestions"];
  const ctaOptimizations = [
    "Use first-person CTAs: 'Get My Kit' instead of 'Get Your Kit'",
    "Add urgency modifiers: 'Order Today' instead of 'Order Now'",
    "Include benefit in CTA: 'Start Saving 30%' instead of 'Start Now'",
  ];

  return {
    overall,
    headlineClarity,
    ctaStrength,
    emotionalAppeal,
    platformOptimization,
    competitiveDifferentiation,
    suggestions,
    abTestSuggestions,
    pricingAngleSuggestions,
    ctaOptimizations,
  };
}

// ─── Landing Page HTML Builder ──────────────────────────────
function buildLandingPageHtml(
  productName: string,
  sellerResults: MarketAnalysisResult | null,
  images: GeneratedImage[],
  socialPosts: SocialImagePost[],
  theme: LandingPageTheme = DEFAULT_LANDING_THEME,
  sectionOrder: LandingPageSection[] = DEFAULT_SECTION_ORDER
): LandingPageData {
  const heroImg = images.find((i) => i.id === "studio-hero")?.imageUrl || images.find((i) => i.id === "landing")?.imageUrl || images.find((i) => i.imageUrl)?.imageUrl || "";
  const productImg = images.find((i) => i.id === "packshot-front")?.imageUrl || images.find((i) => i.id === "ecommerce")?.imageUrl || "";
  const pricing = sellerResults?.pricingRecommendation;
  const competitors = sellerResults?.competitors || [];
  const demand = sellerResults?.demandIndicators;

  const benefits = [
    "Premium quality trusted by professionals",
    "Fast and reliable shipping worldwide",
    `Competitive pricing — market range $${sellerResults?.marketPriceRange?.min || "N/A"}-$${sellerResults?.marketPriceRange?.max || "N/A"}`,
    demand?.trend === "rising" ? "Growing market demand — order while supplies last" : "Stable market demand — proven reliability",
    "Full warranty and dedicated support",
  ];

  const features = sellerResults?.productIdentification?.attributes
    ? Object.entries(sellerResults.productIdentification.attributes).map(([k, v]) => `${k}: ${v}`)
    : ["High performance", "Durable construction", "Easy maintenance"];

  const socialProof = competitors.map(
    (c) => `Outperforms ${c.name} in key metrics with ${c.strengths?.[0] || "quality"}`
  );

  const faq = [
    { question: `What makes ${productName} different?`, answer: `Our ${productName} is engineered with premium materials and backed by comprehensive quality assurance. Unlike competitors, we focus on long-term reliability and performance.` },
    { question: "What is the delivery time?", answer: "Standard delivery is 5-7 business days. Express shipping is available for 2-3 day delivery." },
    { question: "Do you offer bulk pricing?", answer: "Yes! Contact us for volume discounts on orders of 10+ units." },
    { question: "What warranty is included?", answer: "Every purchase includes a comprehensive warranty covering manufacturing defects and performance issues." },
  ];

  const ctaText = pricing ? `Order Now — Starting at $${pricing.suggested}` : "Order Now";

  const radius = theme.borderRadius === "none" ? "0" : theme.borderRadius === "small" ? "4px" : theme.borderRadius === "large" ? "16px" : "8px";
  const heroAlign = theme.heroStyle === "left-aligned" ? "left" : "center";
  const isModern = theme.layout === "modern";
  const isMinimal = theme.layout === "minimal";
  const isBold = theme.layout === "bold";

  // Google Fonts import for non-system fonts
  const fontFamilies = new Set([theme.headingFont, theme.bodyFont]);
  const googleFonts = [...fontFamilies]
    .filter((f) => !f.includes("system-ui") && !f.includes("Georgia") && !f.includes("Times"))
    .map((f) => {
      const name = f.split(",")[0].replace(/'/g, "").trim();
      return name.replace(/\s/g, "+");
    });
  const fontImport = googleFonts.length > 0
    ? `<link href="https://fonts.googleapis.com/css2?${googleFonts.map((f) => `family=${f}:wght@400;600;700;800`).join("&")}&display=swap" rel="stylesheet">`
    : "";

  const heroSplitGrid = theme.heroStyle === "split"
    ? `display:grid;grid-template-columns:1fr 1fr;gap:40px;text-align:left;align-items:center`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${productName}</title>
<meta name="description" content="${productName} — premium quality, competitive pricing, fast delivery.">
${fontImport}
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:${theme.bodyFont};color:${theme.textColor};line-height:1.6;background:${theme.bgColor}}
h1,h2,h3{font-family:${theme.headingFont}}
.hero{background:linear-gradient(135deg,${theme.secondaryColor} 0%,${theme.accentColor} 100%);color:#fff;padding:${isBold ? "100px" : "80px"} 24px;text-align:${heroAlign};${heroSplitGrid}}
.hero h1{font-size:clamp(${isBold ? "2.5rem" : "2rem"},5vw,${isBold ? "4rem" : "3.5rem"});margin-bottom:16px;font-weight:800;${isModern ? "letter-spacing:-0.02em" : ""}}
.hero p{font-size:${isMinimal ? "1rem" : "1.1rem"};opacity:0.9;max-width:600px;${heroAlign === "center" ? "margin:0 auto 32px" : "margin:0 0 32px"}}
.hero img{max-width:100%;max-height:400px;border-radius:${radius};margin-bottom:${theme.heroStyle === "split" ? "0" : "32px"};box-shadow:0 20px 60px rgba(0,0,0,0.3)}
.cta-btn{display:inline-block;background:${theme.primaryColor};color:#fff;padding:${isBold ? "18px 44px" : "16px 40px"};border-radius:${radius};text-decoration:none;font-weight:700;font-size:${isBold ? "1.2rem" : "1.1rem"};transition:transform 0.2s,box-shadow 0.2s;font-family:${theme.headingFont}}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px ${theme.primaryColor}44}
section{padding:${isMinimal ? "48px" : "60px"} 24px;max-width:1000px;margin:0 auto}
h2{font-size:${isBold ? "2.2rem" : "2rem"};margin-bottom:24px;text-align:center;${isModern ? "letter-spacing:-0.01em" : ""}}
.benefits{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;list-style:none}
.benefits li{padding:20px;background:${theme.bgColor === "#ffffff" ? "#f8fafc" : theme.bgColor};border-radius:${radius};border-left:4px solid ${theme.primaryColor};${isModern ? `box-shadow:0 2px 12px ${theme.primaryColor}11` : ""}}
.features{columns:2;gap:16px;list-style:none}
.features li{padding:8px 0;break-inside:avoid}
.features li:before{content:"✓ ";color:${theme.primaryColor};font-weight:bold}
.social-proof{background:${theme.primaryColor}08;padding:40px 24px;text-align:center}
.social-proof blockquote{font-style:italic;max-width:600px;margin:16px auto;padding:16px;background:${theme.bgColor};border-radius:${radius};box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.faq details{margin-bottom:12px;padding:16px;background:${theme.bgColor === "#ffffff" ? "#f8fafc" : theme.bgColor};border-radius:${radius}}
.faq summary{font-weight:600;cursor:pointer;padding:4px 0}
.faq p{margin-top:8px;color:${theme.textColor}99}
.order-section{background:${theme.secondaryColor};color:#fff;padding:60px 24px;text-align:center}
.order-section .cta-btn{font-size:1.2rem;padding:20px 48px}
footer{text-align:center;padding:24px;color:${theme.textColor}66;font-size:0.85rem}
@media(max-width:600px){.features{columns:1}.hero{padding:48px 16px;${theme.heroStyle === "split" ? "grid-template-columns:1fr" : ""}}}
</style></head><body>
<div class="hero">
${theme.heroStyle === "split" ? `<div>
<h1>${productName}</h1>
<p>${sellerResults?.productIdentification?.category || "Premium quality product"} — engineered for excellence</p>
<a href="#order" class="cta-btn">${ctaText}</a>
</div>
<div>${heroImg ? `<img src="${heroImg}" alt="${productName}"/>` : ""}</div>` : `
${heroImg ? `<img src="${heroImg}" alt="${productName}"/>` : ""}
<h1>${productName}</h1>
<p>${sellerResults?.productIdentification?.category || "Premium quality product"} — engineered for excellence</p>
<a href="#order" class="cta-btn">${ctaText}</a>`}
</div>
${sectionOrder.map((section) => {
  switch (section) {
    case "benefits": return `<section><h2>Benefits</h2><ul class="benefits">${benefits.map((b) => `<li>${b}</li>`).join("")}</ul></section>`;
    case "features": return `<section><h2>Features</h2><ul class="features">${features.map((f) => `<li>${f}</li>`).join("")}</ul></section>`;
    case "social-proof": return socialProof.length > 0 ? `<div class="social-proof"><h2>Why Customers Choose Us</h2>${socialProof.map((s) => `<blockquote>${s}</blockquote>`).join("")}</div>` : "";
    case "faq": return `<section class="faq"><h2>FAQ</h2>${faq.map((f) => `<details><summary>${f.question}</summary><p>${f.answer}</p></details>`).join("")}</section>`;
    case "cta": return `<div class="order-section" id="order"><h2>Ready to Get Started?</h2><p style="margin:16px 0;opacity:0.8">Join thousands of satisfied customers.</p><a href="#" class="cta-btn">${ctaText}</a></div>`;
    default: return "";
  }
}).join("\n")}
<footer>&copy; ${new Date().getFullYear()} ${productName}. All rights reserved.</footer>
</body></html>`;

  return { html, sectionOrder, sections: { hero: productName, benefits, features, socialProof, faq, ctaText } };
}

// ─── Main Component ────────────────────────────────────────
export const ContentStudio = () => {
  const { t } = useTranslation();
  const sellerResults = useAnalysisStore((s) => s.sellerResults);
  const store = useContentStudioStore();
  const [activeTab, setActiveTab] = useState<ContentStudioTab>("pro-images");
  const [userId, setUserId] = useState<string>("");
  const [landingTheme, setLandingTheme] = useState<LandingPageTheme>(DEFAULT_LANDING_THEME);
  const [sectionOrder, setSectionOrder] = useState<LandingPageSection[]>(DEFAULT_SECTION_ORDER);

  const hasIntelligence = !!sellerResults;
  const productName = sellerResults?.productIdentification?.name || "Product";
  const productCategory = sellerResults?.productIdentification?.category || "";
  const competitors = sellerResults?.competitors || [];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  // ── Generate a single image ──
  const generateImage = useCallback(
    async (imageType: string) => {
      store.updateImage(imageType, { isGenerating: true, error: undefined });
      try {
        const { data, error } = await supabase.functions.invoke("generate-product-images", {
          body: {
            productName,
            productDescription: productCategory,
            category: productCategory,
            imageType,
            competitors: competitors.map((c) => c.name),
          },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        store.updateImage(imageType, { imageUrl: data.imageUrl, isGenerating: false });
      } catch (err: any) {
        console.error(`Image generation error (${imageType}):`, err);
        store.updateImage(imageType, { isGenerating: false, error: err.message || "Failed" });
      }
    },
    [productName, productCategory, competitors, store]
  );

  // ── Generate Social Posts ──
  const generateSocialPosts = useCallback((): SocialImagePost[] => {
    const platforms: SocialImagePost["platform"][] = ["instagram", "facebook", "tiktok", "linkedin", "twitter"];
    const proImageMap: Record<string, string> = {
      instagram: "ugc-outdoor",
      facebook: "studio-hero",
      tiktok: "ugc-action",
      linkedin: "packshot-front",
      twitter: "usage-commute",
    };
    return platforms.map((platform) => {
      const competitorDiff = competitors[0]
        ? ` Unlike ${competitors[0].name}, we deliver unmatched quality.`
        : "";
      const hooks: Record<string, string> = {
        instagram: `✨ Meet the future of ${productCategory}`,
        facebook: `🔥 NEW: ${productName} is here!`,
        tiktok: `POV: You just discovered ${productName} 🚀`,
        linkedin: `Excited to introduce ${productName} to the market.`,
        twitter: `🚀 ${productName} just dropped.`,
      };
      const captions: Record<string, string> = {
        instagram: `Premium ${productName} designed for professionals who demand excellence.${competitorDiff} Link in bio!`,
        facebook: `Discover why thousands are switching to ${productName}. Premium quality, competitive pricing, and fast shipping.${competitorDiff}`,
        tiktok: `This ${productName} is about to change the game. Here's why everyone's talking about it.${competitorDiff}`,
        linkedin: `After extensive market research, we're proud to introduce ${productName} — a solution that addresses the key pain points in ${productCategory}.${competitorDiff}`,
        twitter: `${productName} — premium quality at competitive prices.${competitorDiff}`,
      };
      const ctas: Record<string, string> = {
        instagram: "Shop now — link in bio! 🛒",
        facebook: "Order yours today → Comment 'INFO' for details",
        tiktok: "Link in bio — limited stock! 🔥",
        linkedin: "Let's connect to discuss how this can benefit your business.",
        twitter: "Get yours now →",
      };
      const hashtags = [`${productName.replace(/\s/g, "")}`, productCategory.replace(/\s/g, ""), "Quality", "Premium", platform === "tiktok" ? "FYP" : "NewProduct"];
      return {
        id: `sp-${platform}`,
        platform,
        caption: captions[platform],
        hook: hooks[platform],
        cta: ctas[platform],
        hashtags,
        imageId: proImageMap[platform],
      };
    });
  }, [productName, productCategory, competitors]);

  // ── Generate Email Campaigns ──
  const generateEmailCampaigns = useCallback((): EmailCampaign[] => {
    const types = [
      { name: "Launch Announcement", cta: "Shop Now", imageId: "studio-hero" },
      { name: "Early Bird Offer", cta: "Claim 20% Off", imageId: "packshot-front" },
      { name: "Social Proof", cta: "See Reviews", imageId: "ugc-social" },
      { name: "Last Chance", cta: "Order Before Midnight", imageId: "studio-dramatic" },
      { name: "VIP Access", cta: "Get Exclusive Access", imageId: "studio-lifestyle" },
    ];
    return types.map((type, i) => ({
      id: `ec-${i}`,
      name: type.name,
      subjectLine: `${type.name}: ${productName} — Don't Miss Out`,
      previewText: `Discover why ${productName} is the #1 choice for ${productCategory} professionals.`,
      body: `Hi {{first_name}},\n\n${type.name === "Launch Announcement"
        ? `We're thrilled to introduce ${productName} — a game-changer in ${productCategory}.`
        : type.name === "Early Bird Offer"
        ? `As a valued subscriber, you get exclusive early access to ${productName} with 20% off.`
        : type.name === "Social Proof"
        ? `Join thousands of happy customers who've already made the switch to ${productName}.`
        : type.name === "Last Chance"
        ? `This is your final opportunity to get ${productName} at our introductory price.`
        : `You've been selected for VIP access to ${productName} before the general public.`
      }\n\nKey benefits:\n• Premium quality construction\n• Competitive market pricing\n• Fast worldwide shipping\n• Comprehensive warranty\n\nBest regards,\nThe Team`,
      cta: type.cta,
      imageId: type.imageId,
    }));
  }, [productName, productCategory]);

  // ── Load Demo Data ──
  const handleLoadDemoData = () => {
    const demoImages: GeneratedImage[] = [
      { id: "social", label: "Social Media", prompt: "Demo", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", isGenerating: false },
      { id: "ad", label: "Advertising", prompt: "Demo", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", isGenerating: false },
      { id: "landing", label: "Landing Page", prompt: "Demo", imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80", isGenerating: false },
      { id: "ecommerce", label: "E-commerce", prompt: "Demo", imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80", isGenerating: false },
      { id: "email", label: "Email Marketing", prompt: "Demo", imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80", isGenerating: false },
    ];

    const demoPosts: SocialImagePost[] = [
      { id: "sp-instagram", platform: "instagram", hook: "✨ Meet the future of premium audio", caption: "Premium Wireless Headphones designed for professionals who demand excellence. Unlike competitors, we deliver unmatched quality. Link in bio!", cta: "Shop now — link in bio! 🛒", hashtags: ["WirelessHeadphones", "Audio", "Quality", "Premium", "NewProduct"], imageId: "ugc-outdoor" },
      { id: "sp-facebook", platform: "facebook", hook: "🔥 NEW: ProSound X1 is here!", caption: "Discover why thousands are switching to ProSound X1. Premium quality, competitive pricing, and fast shipping. Experience audio like never before.", cta: "Order yours today → Comment 'INFO' for details", hashtags: ["ProSoundX1", "Audio", "Quality", "Premium", "NewProduct"], imageId: "studio-hero" },
      { id: "sp-tiktok", platform: "tiktok", hook: "POV: You just discovered ProSound X1 🚀", caption: "This ProSound X1 is about to change the game. Here's why everyone's talking about it. Crystal clear audio meets incredible comfort.", cta: "Link in bio — limited stock! 🔥", hashtags: ["ProSoundX1", "Audio", "Quality", "Premium", "FYP"], imageId: "ugc-action" },
      { id: "sp-linkedin", platform: "linkedin", hook: "Excited to introduce ProSound X1 to the market.", caption: "After extensive market research, we're proud to introduce ProSound X1 — a solution that addresses the key pain points in premium audio. Professional-grade sound at an accessible price point.", cta: "Let's connect to discuss how this can benefit your business.", hashtags: ["ProSoundX1", "Audio", "Quality", "Premium", "NewProduct"], imageId: "packshot-front" },
      { id: "sp-twitter", platform: "twitter", hook: "🚀 ProSound X1 just dropped.", caption: "ProSound X1 — premium quality at competitive prices. 40hr battery, ANC, studio-grade drivers. Unlike BeatsPro, we deliver unmatched quality.", cta: "Get yours now →", hashtags: ["ProSoundX1", "Audio", "Quality", "Premium", "NewProduct"], imageId: "usage-commute" },
    ];

    const demoEmails: EmailCampaign[] = [
      { id: "ec-0", name: "Launch Announcement", subjectLine: "Launch Announcement: ProSound X1 — Don't Miss Out", previewText: "Discover why ProSound X1 is the #1 choice for audio professionals.", body: "Hi {{first_name}},\n\nWe're thrilled to introduce ProSound X1 — a game-changer in premium audio.\n\nKey benefits:\n• 40-hour battery life\n• Active noise cancellation\n• Studio-grade 50mm drivers\n• Premium build quality\n\nBest regards,\nThe ProSound Team", cta: "Shop Now", imageId: "studio-hero" },
      { id: "ec-1", name: "Early Bird Offer", subjectLine: "Early Bird Offer: ProSound X1 — 20% Off", previewText: "Exclusive early access to ProSound X1 with a special discount.", body: "Hi {{first_name}},\n\nAs a valued subscriber, you get exclusive early access to ProSound X1 with 20% off.\n\nUse code EARLYBIRD20 at checkout.\n\nKey benefits:\n• Premium quality construction\n• Competitive market pricing\n• Fast worldwide shipping\n• Comprehensive warranty\n\nBest regards,\nThe ProSound Team", cta: "Claim 20% Off", imageId: "packshot-front" },
      { id: "ec-2", name: "Social Proof", subjectLine: "Social Proof: ProSound X1 — See What Others Say", previewText: "Join thousands of happy customers who've made the switch.", body: "Hi {{first_name}},\n\nJoin thousands of happy customers who've already made the switch to ProSound X1.\n\n⭐⭐⭐⭐⭐ \"Best headphones I've ever owned\" — Sarah K.\n⭐⭐⭐⭐⭐ \"Incredible sound quality\" — Mike T.\n\nBest regards,\nThe ProSound Team", cta: "See Reviews", imageId: "ugc-social" },
    ];

    const demoScore: ContentScore = {
      overall: 78,
      headlineClarity: 18,
      ctaStrength: 16,
      emotionalAppeal: 14,
      platformOptimization: 18,
      competitiveDifferentiation: 12,
      suggestions: ["Highlight what makes your product unique vs. competitors", "Use specific numbers and data points", "Add customer-centric language focusing on outcomes"],
      abTestSuggestions: ["Test emotional hook vs. data-driven hook", "A/B test urgency-based CTA vs. benefit-based CTA"],
      pricingAngleSuggestions: ["Position at $149 based on market analysis", "Emphasize value over price in premium positioning"],
      ctaOptimizations: ["Use first-person CTAs: 'Get My Headphones'", "Add urgency: 'Order Today — Free Shipping'"],
    };

    const demoProImages = store.proImages; // already set below
    const demoLandingPage = buildLandingPageHtml(
      "ProSound X1",
      {
        productIdentification: { name: "ProSound X1", category: "Premium Audio", confidence: 0.95, attributes: { "Battery": "40 hours", "Drivers": "50mm Studio-Grade", "ANC": "Hybrid Active", "Weight": "280g" } },
        competitors: [{ name: "BeatsPro", price: 349, currency: "USD", platform: "Amazon", strengths: ["Brand recognition"], weaknesses: ["Overpriced"] }],
        marketPriceRange: { min: 99, max: 349, average: 199, currency: "USD" },
        pricingRecommendation: { suggested: 149, strategy: "penetration", confidence: 0.85 },
        demandIndicators: { trend: "rising", volume: "high", seasonality: "stable" },
      } as any,
      [], // will be rebuilt after pro images are set
      demoPosts,
      DEFAULT_LANDING_THEME,
      DEFAULT_SECTION_ORDER
    );

    // No longer setting old images — pro images are the primary source
    store.setSocialPosts(demoPosts);
    store.setEmailCampaigns(demoEmails);
    store.setContentScore(demoScore);
    store.setLandingPage(demoLandingPage);

    // Demo pro images
    const demoProImg = (id: string, label: string, section: string, url: string): GeneratedImage => ({
      id, label, prompt: "Demo", imageUrl: url, isGenerating: false, section,
    });
    const headphonesUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80";
    store.setProImages([
      demoProImg("packshot-front", "Front View", "packshot", headphonesUrl),
      demoProImg("packshot-side", "Side View", "packshot", headphonesUrl),
      demoProImg("packshot-back", "Back View", "packshot", headphonesUrl),
      demoProImg("packshot-45deg", "45° Perspective", "packshot", headphonesUrl),
      demoProImg("packshot-top", "Top View", "packshot", headphonesUrl),
      demoProImg("ugc-outdoor", "Outdoor", "ugc", "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80"),
      demoProImg("ugc-home", "At Home", "ugc", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80"),
      demoProImg("ugc-social", "Social Selfie", "ugc", "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&q=80"),
      demoProImg("ugc-unboxing", "Unboxing", "ugc", "https://images.unsplash.com/photo-1612478752710-4cbe1e5ac6fe?w=400&q=80"),
      demoProImg("ugc-action", "In Action", "ugc", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80"),
      demoProImg("usage-morning", "Morning Routine", "usage", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80"),
      demoProImg("usage-work", "At Work", "usage", "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=400&q=80"),
      demoProImg("usage-commute", "Commute", "usage", "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=400&q=80"),
      demoProImg("usage-leisure", "Leisure", "usage", "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80"),
      demoProImg("usage-evening", "Evening", "usage", "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&q=80"),
      demoProImg("studio-hero", "Hero Shot", "studio", "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&q=80"),
      demoProImg("studio-detail", "Detail Macro", "studio", "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&q=80"),
      demoProImg("studio-lifestyle", "Styled Lifestyle", "studio", "https://images.unsplash.com/photo-1548921441-89c8bd2c3637?w=400&q=80"),
      demoProImg("studio-dramatic", "Dramatic Lighting", "studio", "https://images.unsplash.com/photo-1608156639585-b3a776571bef?w=400&q=80"),
      demoProImg("studio-flat", "Flat Lay", "studio", "https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=400&q=80"),
    ]);
    store.setReferenceImageUrl(headphonesUrl);

    toast.success("Demo data loaded! Explore all tabs to see the generated content.");
  };

  // ── Full Kit Generation ──
  const handleGenerateKit = async () => {
    if (!hasIntelligence) {
      toast.error("Please run a market analysis first in Market Intelligence.");
      return;
    }

    const steps: GenerationStep[] = [
      { label: "Generating pro photography", status: "pending" },
      { label: "Creating social posts", status: "pending" },
      { label: "Building landing page", status: "pending" },
      { label: "Creating email campaigns", status: "pending" },
      { label: "Scoring content", status: "pending" },
    ];
    store.setGenerationSteps(steps);
    store.setIsGeneratingKit(true);
    store.setCurrentStepIndex(0);

    try {
      const updateStep = (idx: number, status: GenerationStep["status"]) => {
        steps[idx] = { ...steps[idx], status };
        store.setGenerationSteps([...steps]);
        store.setCurrentStepIndex(idx);
      };

      // Step 1: Pro Photography
      updateStep(0, "running");
      const refImg = store.referenceImageUrl || useAnalysisStore.getState().currentImage;
      if (!refImg) {
        toast.error("No reference image available. Upload a product image in Market Intelligence first.");
        store.setIsGeneratingKit(false);
        return;
      }
      store.setReferenceImageUrl(refImg);
      const proTypes = store.proImages.map((i) => i.id);
      for (const type of proTypes) {
        store.updateProImage(type, { isGenerating: true, error: undefined });
        try {
          const { data, error } = await supabase.functions.invoke("generate-product-images", {
            body: { productName, productDescription: productCategory, category: productCategory, imageType: type, competitors: competitors.map((c) => c.name), referenceImageUrl: refImg },
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          store.updateProImage(type, { imageUrl: data.imageUrl, isGenerating: false });
        } catch (err: any) {
          store.updateProImage(type, { isGenerating: false, error: err.message || "Failed" });
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      updateStep(0, "done");

      // Step 2: Social Posts
      const availableImages = store.proImages.filter((i) => i.imageUrl);
      updateStep(1, "running");
      const posts = generateSocialPosts();
      store.setSocialPosts(posts);
      updateStep(1, "done");

      // Step 3: Landing Page
      updateStep(2, "running");
      const lp = buildLandingPageHtml(productName, sellerResults, availableImages, posts, landingTheme, sectionOrder);
      store.setLandingPage(lp);
      updateStep(2, "done");

      // Step 4: Email Campaigns
      updateStep(3, "running");
      const emails = generateEmailCampaigns();
      store.setEmailCampaigns(emails);
      updateStep(3, "done");

      // Step 5: Content Scoring
      updateStep(4, "running");
      const score = calculateContentScore(posts, emails, sellerResults);
      store.setContentScore(score);
      updateStep(4, "done");

      toast.success("Marketing kit generated successfully!");
    } catch (err) {
      console.error("Kit generation error:", err);
      toast.error("Some steps failed. Check individual tabs for details.");
    } finally {
      store.setIsGeneratingKit(false);
    }
  };

  // ── Export All ──
  const handleExportAll = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      productName,
      images: store.proImages.filter((i) => i.imageUrl).map((i) => ({ label: i.label, type: i.id, section: i.section })),
      socialPosts: store.socialPosts,
      emailCampaigns: store.emailCampaigns,
      landingPageHtml: store.landingPage?.html || null,
      contentScore: store.contentScore,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.replace(/\s/g, "-")}-marketing-kit.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Marketing kit exported");
  };

  const progressPercent = store.generationSteps.length > 0
    ? Math.round((store.generationSteps.filter((s) => s.status === "done").length / store.generationSteps.length) * 100)
    : 0;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <MarketingFlowBanner />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Content Studio
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a complete marketing content kit from your product intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportAll} disabled={store.socialPosts.length === 0}>
            <FileArchive className="h-4 w-4 mr-1" /> Export All
          </Button>
          <Button variant="outline" size="sm" onClick={handleLoadDemoData} disabled={store.isGeneratingKit}>
            <Sparkles className="h-4 w-4 mr-1" /> Load Demo
          </Button>
          <Button onClick={handleGenerateKit} disabled={store.isGeneratingKit || !hasIntelligence}>
            {store.isGeneratingKit ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="h-4 w-4 mr-2" /> Generate Full Kit</>
            )}
          </Button>
        </div>
      </div>

      {/* Intelligence Banner */}
      {hasIntelligence ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <Sparkles className="h-8 w-8 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Intelligence data detected — {productName}</p>
              <p className="text-sm text-muted-foreground">
                Category: {productCategory} • {competitors.length} competitors •{" "}
                Trend: {sellerResults?.demandIndicators?.trend || "N/A"} •{" "}
                Suggested price: ${sellerResults?.pricingRecommendation?.suggested || "N/A"}
              </p>
            </div>
            {!store.isGeneratingKit && store.socialPosts.length === 0 && (
              <Button onClick={handleGenerateKit}>
                <Wand2 className="h-4 w-4 mr-2" /> Generate Kit
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
            <div>
              <p className="font-semibold">No intelligence data available</p>
              <p className="text-sm text-muted-foreground">
                Upload a product image in Market Intelligence to auto-activate Content Studio.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Progress */}
      {store.isGeneratingKit && (
        <Card>
          <CardContent className="py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {store.generationSteps[store.currentStepIndex]?.label || "Processing..."}
              </span>
              <span className="text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
            <div className="flex gap-2 flex-wrap">
              {store.generationSteps.map((step, i) => (
                <Badge
                  key={i}
                  variant={
                    step.status === "done"
                      ? "default"
                      : step.status === "running"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-xs"
                >
                  {step.status === "running" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {step.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentStudioTab)}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5 text-xs sm:text-sm">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {(tab.id === "video" || tab.id === "social-video") && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">Soon</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Old images tab removed */}
        <TabsContent value="pro-images">
          <ProImageGenerationTab
            productName={productName}
            productCategory={productCategory}
            competitors={competitors.map((c) => c.name)}
          />
        </TabsContent>
        <TabsContent value="social-image">
          <SocialImagePostsTab posts={store.socialPosts} images={store.proImages} />
        </TabsContent>
        <TabsContent value="video">
          <VideoTab />
        </TabsContent>
        <TabsContent value="social-video">
          <SocialVideoPostsTab />
        </TabsContent>
        <TabsContent value="landing-page">
          <LandingPageTab
            landingPage={store.landingPage}
            images={store.proImages}
            productName={productName}
            userId={userId}
            theme={landingTheme}
            sectionOrder={sectionOrder}
            onThemeChange={(newTheme) => {
              setLandingTheme(newTheme);
              const lp = buildLandingPageHtml(productName, sellerResults, store.proImages, store.socialPosts, newTheme, sectionOrder);
              store.setLandingPage(lp);
            }}
            onSectionOrderChange={(newOrder) => {
              setSectionOrder(newOrder);
              const lp = buildLandingPageHtml(productName, sellerResults, store.proImages, store.socialPosts, landingTheme, newOrder);
              store.setLandingPage(lp);
            }}
          />
        </TabsContent>
        <TabsContent value="email">
          <EmailCampaignTab campaigns={store.emailCampaigns} images={store.proImages} />
        </TabsContent>
        <TabsContent value="score">
          <ContentScoreTab score={store.contentScore} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
