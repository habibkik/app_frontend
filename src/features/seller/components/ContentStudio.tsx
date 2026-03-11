import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { BrandKitPanel, fetchBrandKit, type BrandKit } from "./content-studio/BrandKitPanel";
import {
  Sparkles,
  Loader2,
  Wand2,
  ImageIcon,
  Camera,
  Share2,
  Video,
  
  Mail,
  Target,
  AlertCircle,
  Download,
  FileArchive,
  Palette,
} from "lucide-react";
import { MarketingFlowBanner } from "./MarketingFlowBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { resizeImageForAI } from "@/utils/resizeImage";
import { useAnalysisStore, type MarketAnalysisResult } from "@/stores/analysisStore";
import { useContentStudioStore } from "@/stores/contentStudioStore";
import type {
  ContentStudioTab,
  GeneratedImage,
  SocialImagePost,
  EmailCampaign,
  ContentScore,
  GenerationStep,
} from "./content-studio/types";
// ImageGenerationTab removed — replaced by ProImageGenerationTab
import { SocialImagePostsTab } from "./content-studio/SocialImagePostsTab";
import { VideoTab } from "./content-studio/VideoTab";
import { SocialVideoPostsTab } from "./content-studio/SocialVideoPostsTab";

import { EmailCampaignTab } from "./content-studio/EmailCampaignTab";
import { ContentScoreTab } from "./content-studio/ContentScoreTab";
import { ProImageGenerationTab } from "./content-studio/ProImageGenerationTab";

const TABS: { id: ContentStudioTab; label: string; icon: React.ElementType }[] = [
  { id: "brand-kit", label: "Brand Identity", icon: Palette },
  { id: "pro-images", label: "Pro Photography", icon: Camera },
  { id: "social-image", label: "Social (Image)", icon: Share2 },
  { id: "video", label: "Video", icon: Video },
  { id: "social-video", label: "Social (Video)", icon: Video },
  
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


// ─── Main Component ────────────────────────────────────────
export const ContentStudio = () => {
  const { t } = useTranslation();
  const sellerResults = useAnalysisStore((s) => s.sellerResults);
  const store = useContentStudioStore();
  const [activeTab, setActiveTab] = useState<ContentStudioTab>("pro-images");
  const [userId, setUserId] = useState<string>("");
  const [authReady, setAuthReady] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  const hasIntelligence = !!sellerResults;
  const productName = sellerResults?.productIdentification?.name || "Product";
  const productCategory = sellerResults?.productIdentification?.category || "";
  const competitors = sellerResults?.competitors || [];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchBrandKit(session.user.id).then((kit) => setBrandKit(kit));
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || "";
      setUserId(uid);
      if (uid) {
        fetchBrandKit(uid).then((kit) => setBrandKit(kit));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Persist pro images to DB ──
  const saveProImageToDB = useCallback(
    async (img: GeneratedImage) => {
      if (!userId || !img.imageUrl) return;
      const { error } = await supabase.from("generated_pro_images" as any).upsert(
        {
          user_id: userId,
          image_key: img.id,
          label: img.label,
          section: img.section || "",
          prompt: img.prompt || "",
          image_url: img.imageUrl,
          product_name: productName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,image_key,product_name" }
      );
      if (error) console.error("Failed to save pro image:", error);
    },
    [userId, productName]
  );

  const saveAllProImages = useCallback(async () => {
    const images = useContentStudioStore.getState().proImages.filter((i) => i.imageUrl);
    await Promise.all(images.map(saveProImageToDB));
  }, [saveProImageToDB]);

  // ── Load persisted pro images on mount ──
  useEffect(() => {
    if (!userId || !productName || productName === "Product") return;
    (async () => {
      const { data, error } = await supabase
        .from("generated_pro_images" as any)
        .select("*")
        .eq("user_id", userId)
        .eq("product_name", productName);
      if (error || !data || data.length === 0) return;
      const saved = data as unknown as { image_key: string; label: string; section: string; prompt: string; image_url: string }[];
      const current = store.proImages;
      const merged = current.map((img) => {
        const match = saved.find((s) => s.image_key === img.id);
        if (match && !img.imageUrl) {
          return { ...img, imageUrl: match.image_url, prompt: match.prompt || img.prompt };
        }
        return img;
      });
      store.setProImages(merged);
      // Also restore reference image if available
      const heroImg = saved.find((s) => s.image_key === "packshot-front");
      if (heroImg && !store.referenceImageUrl) {
        store.setReferenceImageUrl(heroImg.image_url);
      }
      console.log(`Loaded ${saved.length} persisted pro images for "${productName}"`);
    })();
  }, [userId, productName]);

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
    // Use dynamic generators so demo reflects the current product context
    const posts = generateSocialPosts();
    const emails = generateEmailCampaigns();
    store.setSocialPosts(posts);
    store.setEmailCampaigns(emails);
    store.setContentScore(calculateContentScore(posts, emails, sellerResults));

    // Preserve already-generated pro images; only fill missing slots with Unsplash fallbacks
    const fallbackUrls: Record<string, string> = {
      // Packshot – clean product studio shots
      "packshot-front": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80",
      "packshot-side": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80",
      "packshot-back": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
      "packshot-45deg": "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=400&q=80",
      "packshot-top": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80",
      // UGC – authentic lifestyle moments
      "ugc-outdoor": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80",
      "ugc-home": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80",
      "ugc-social": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
      "ugc-unboxing": "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=400&q=80",
      "ugc-action": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80",
      // Usage – real-life contextual scenes
      "usage-morning": "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&q=80",
      "usage-work": "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=400&q=80",
      "usage-commute": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80",
      "usage-leisure": "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&q=80",
      "usage-evening": "https://images.unsplash.com/photo-1612478752710-4cbe1e5ac6fe?w=400&q=80",
      // Studio – premium commercial photography
      "studio-hero": "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&q=80",
      "studio-detail": "https://images.unsplash.com/photo-1608156639585-b3a776571bef?w=400&q=80",
      "studio-lifestyle": "https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=400&q=80",
      "studio-dramatic": "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&q=80",
      "studio-flat": "https://images.unsplash.com/photo-1548921441-89c8bd2c3637?w=400&q=80",
    };
    const mergedProImages = store.proImages.map((img) => ({
      ...img,
      imageUrl: img.imageUrl || fallbackUrls[img.id] || null,
    }));
    store.setProImages(mergedProImages);

    // Keep existing reference image or use fallback
    if (!store.referenceImageUrl) {
      store.setReferenceImageUrl("https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80");
    }

    saveAllProImages();
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
      const rawRefImg = store.referenceImageUrl || useAnalysisStore.getState().currentImage;
      if (!rawRefImg) {
        toast.error("No reference image available. Upload a product image in Market Intelligence first.");
        store.setIsGeneratingKit(false);
        return;
      }
      const refImg = await resizeImageForAI(rawRefImg);
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
          const updatedImg = useContentStudioStore.getState().proImages.find((i) => i.id === type);
          if (updatedImg) saveProImageToDB(updatedImg);
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

      // Step 3: Email Campaigns
      updateStep(2, "running");
      const emails = generateEmailCampaigns();
      store.setEmailCampaigns(emails);
      updateStep(2, "done");

      // Step 4: Content Scoring
      updateStep(3, "running");
      const score = calculateContentScore(posts, emails, sellerResults);
      store.setContentScore(score);
      updateStep(3, "done");

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

        <TabsContent value="brand-kit">
          {userId ? (
            <BrandKitPanel userId={userId} />
          ) : (
            <p className="text-muted-foreground text-sm py-8 text-center">Please sign in to manage your brand kit.</p>
          )}
        </TabsContent>
        <TabsContent value="pro-images">
          <ProImageGenerationTab
            productName={productName}
            productCategory={productCategory}
            competitors={competitors.map((c) => c.name)}
            onImageGenerated={saveProImageToDB}
            brandKit={brandKit}
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
