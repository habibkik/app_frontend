import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Loader2,
  Wand2,
  ImageIcon,
  Share2,
  Video,
  Globe,
  Mail,
  Target,
  AlertCircle,
  Download,
  FileArchive,
} from "lucide-react";
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
} from "./content-studio/types";
import { ImageGenerationTab } from "./content-studio/ImageGenerationTab";
import { SocialImagePostsTab } from "./content-studio/SocialImagePostsTab";
import { VideoTab } from "./content-studio/VideoTab";
import { SocialVideoPostsTab } from "./content-studio/SocialVideoPostsTab";
import { LandingPageTab } from "./content-studio/LandingPageTab";
import { EmailCampaignTab } from "./content-studio/EmailCampaignTab";
import { ContentScoreTab } from "./content-studio/ContentScoreTab";

const TABS: { id: ContentStudioTab; label: string; icon: React.ElementType }[] = [
  { id: "images", label: "Images", icon: ImageIcon },
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
  socialPosts: SocialImagePost[]
): LandingPageData {
  const heroImg = images.find((i) => i.id === "landing")?.imageUrl || images.find((i) => i.imageUrl)?.imageUrl || "";
  const productImg = images.find((i) => i.id === "ecommerce")?.imageUrl || "";
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

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${productName}</title>
<meta name="description" content="${productName} — premium quality, competitive pricing, fast delivery.">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;line-height:1.6}
.hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);color:#fff;padding:80px 24px;text-align:center}
.hero h1{font-size:clamp(2rem,5vw,3.5rem);margin-bottom:16px;font-weight:800}
.hero p{font-size:1.1rem;opacity:0.9;max-width:600px;margin:0 auto 32px}
.hero img{max-width:100%;max-height:400px;border-radius:12px;margin-bottom:32px;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
.cta-btn{display:inline-block;background:#2563eb;color:#fff;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:1.1rem;transition:transform 0.2s}
.cta-btn:hover{transform:translateY(-2px)}
section{padding:60px 24px;max-width:1000px;margin:0 auto}
h2{font-size:2rem;margin-bottom:24px;text-align:center}
.benefits{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;list-style:none}
.benefits li{padding:20px;background:#f8fafc;border-radius:8px;border-left:4px solid #2563eb}
.features{columns:2;gap:16px;list-style:none}
.features li{padding:8px 0;break-inside:avoid}
.features li:before{content:"✓ ";color:#2563eb;font-weight:bold}
.social-proof{background:#f0f4ff;padding:40px 24px;text-align:center}
.social-proof blockquote{font-style:italic;max-width:600px;margin:16px auto;padding:16px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.faq details{margin-bottom:12px;padding:16px;background:#f8fafc;border-radius:8px}
.faq summary{font-weight:600;cursor:pointer;padding:4px 0}
.faq p{margin-top:8px;color:#555}
.order-section{background:#1a1a2e;color:#fff;padding:60px 24px;text-align:center}
.order-section .cta-btn{font-size:1.2rem;padding:20px 48px}
footer{text-align:center;padding:24px;color:#888;font-size:0.85rem}
@media(max-width:600px){.features{columns:1}.hero{padding:48px 16px}}
</style></head><body>
<div class="hero">
${heroImg ? `<img src="${heroImg}" alt="${productName}"/>` : ""}
<h1>${productName}</h1>
<p>${sellerResults?.productIdentification?.category || "Premium quality product"} — engineered for excellence</p>
<a href="#order" class="cta-btn">${ctaText}</a>
</div>
<section><h2>Benefits</h2><ul class="benefits">${benefits.map((b) => `<li>${b}</li>`).join("")}</ul></section>
<section><h2>Features</h2><ul class="features">${features.map((f) => `<li>${f}</li>`).join("")}</ul></section>
${socialProof.length > 0 ? `<div class="social-proof"><h2>Why Customers Choose Us</h2>${socialProof.map((s) => `<blockquote>${s}</blockquote>`).join("")}</div>` : ""}
<section class="faq"><h2>FAQ</h2>${faq.map((f) => `<details><summary>${f.question}</summary><p>${f.answer}</p></details>`).join("")}</section>
<div class="order-section" id="order"><h2>Ready to Get Started?</h2><p style="margin:16px 0;opacity:0.8">Join thousands of satisfied customers.</p><a href="#" class="cta-btn">${ctaText}</a></div>
<footer>&copy; ${new Date().getFullYear()} ${productName}. All rights reserved.</footer>
</body></html>`;

  return { html, sections: { hero: productName, benefits, features, socialProof, faq, ctaText } };
}

// ─── Main Component ────────────────────────────────────────
export const ContentStudio = () => {
  const { t } = useTranslation();
  const sellerResults = useAnalysisStore((s) => s.sellerResults);
  const store = useContentStudioStore();
  const [activeTab, setActiveTab] = useState<ContentStudioTab>("images");
  const [userId, setUserId] = useState<string>("");

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
    const images = store.images;
    return platforms.map((platform, i) => {
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
        imageId: images[i % images.length]?.id || "social",
      };
    });
  }, [productName, productCategory, competitors, store.images]);

  // ── Generate Email Campaigns ──
  const generateEmailCampaigns = useCallback((): EmailCampaign[] => {
    const types = [
      { name: "Launch Announcement", cta: "Shop Now" },
      { name: "Early Bird Offer", cta: "Claim 20% Off" },
      { name: "Social Proof", cta: "See Reviews" },
      { name: "Last Chance", cta: "Order Before Midnight" },
      { name: "VIP Access", cta: "Get Exclusive Access" },
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
      imageId: store.images[i % store.images.length]?.id || "social",
    }));
  }, [productName, productCategory, store.images]);

  // ── Full Kit Generation ──
  const handleGenerateKit = async () => {
    if (!hasIntelligence) {
      toast.error("Please run a market analysis first in Market Intelligence.");
      return;
    }

    const steps: GenerationStep[] = [
      { label: "Generating images", status: "pending" },
      { label: "Creating social posts", status: "pending" },
      { label: "Building landing page", status: "pending" },
      { label: "Creating email campaigns", status: "pending" },
      { label: "Scoring content", status: "pending" },
    ];
    store.setGenerationSteps(steps);
    store.setIsGeneratingKit(true);
    store.setCurrentStepIndex(0);

    try {
      // Step 1: Images
      const updateStep = (idx: number, status: GenerationStep["status"]) => {
        steps[idx] = { ...steps[idx], status };
        store.setGenerationSteps([...steps]);
        store.setCurrentStepIndex(idx);
      };

      updateStep(0, "running");
      const imageTypes = ["social", "ad", "landing", "ecommerce", "email"];
      for (const type of imageTypes) {
        await generateImage(type);
        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1500));
      }
      updateStep(0, "done");

      // Step 2: Social Posts
      updateStep(1, "running");
      const posts = generateSocialPosts();
      store.setSocialPosts(posts);
      updateStep(1, "done");

      // Step 3: Landing Page
      updateStep(2, "running");
      const lp = buildLandingPageHtml(productName, sellerResults, store.images, posts);
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
      images: store.images.filter((i) => i.imageUrl).map((i) => ({ label: i.label, type: i.id })),
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

        <TabsContent value="images">
          <ImageGenerationTab images={store.images} onRegenerate={generateImage} />
        </TabsContent>
        <TabsContent value="social-image">
          <SocialImagePostsTab posts={store.socialPosts} images={store.images} />
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
            images={store.images}
            productName={productName}
            userId={userId}
          />
        </TabsContent>
        <TabsContent value="email">
          <EmailCampaignTab campaigns={store.emailCampaigns} images={store.images} />
        </TabsContent>
        <TabsContent value="score">
          <ContentScoreTab score={store.contentScore} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
