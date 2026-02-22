import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Brain, Database, PenLine } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWebsiteBuilderStore } from "@/stores/websiteBuilderStore";
import { useAnalysisStore, type MarketAnalysisResult } from "@/stores/analysisStore";
import type { SiteBlock } from "./types";
import type { LandingPageTheme } from "../content-studio/types";

interface ProductFormData {
  productName: string;
  category: string;
  targetAudience: string;
  keyFeatures: string;
  specs: string;
  competitiveAdvantages: string;
  marketPositioning: string;
  pricingStrategy: string;
  painPoints: string;
  desires: string;
  testimonials: string;
  faq: string;
  brandTone: string;
}

const INITIAL_FORM: ProductFormData = {
  productName: "", category: "", targetAudience: "", keyFeatures: "", specs: "",
  competitiveAdvantages: "", marketPositioning: "premium", pricingStrategy: "",
  painPoints: "", desires: "", testimonials: "", faq: "", brandTone: "bold",
};

const BRAND_TONE_THEMES: Record<string, Partial<LandingPageTheme>> = {
  luxury: { primaryColor: "#B8860B", secondaryColor: "#1a1a1a", bgColor: "#0f0f0f", textColor: "#f5f5f5", headingFont: "'Playfair Display', serif", borderRadius: "large" as any },
  bold: { primaryColor: "#FF6B35", secondaryColor: "#0D1B2A", bgColor: "#FFFCF9", textColor: "#0D1B2A", headingFont: "'Space Grotesk', system-ui", borderRadius: "medium" as any },
  minimal: { primaryColor: "#1a1a1a", secondaryColor: "#f8f8f8", bgColor: "#ffffff", textColor: "#1a1a1a", headingFont: "'Inter', system-ui", borderRadius: "small" as any },
  aggressive: { primaryColor: "#dc2626", secondaryColor: "#1a1a1a", bgColor: "#fefce8", textColor: "#1a1a1a", headingFont: "'Space Grotesk', system-ui", borderRadius: "medium" as any },
  innovative: { primaryColor: "#7c3aed", secondaryColor: "#1e1b4b", bgColor: "#faf5ff", textColor: "#1e1b4b", headingFont: "'Inter', system-ui", borderRadius: "medium" as any },
};

type DataSource = "market-intel" | "database" | "manual" | string; // string for history item IDs

function fillFromSellerResults(results: MarketAnalysisResult): ProductFormData {
  const attrs = results.productIdentification.attributes || {};
  const keyFeatures = Object.entries(attrs).map(([k, v]) => `${v}`).join(", ");
  const specs = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join("\n");

  // Derive competitive advantages from competitors' weaknesses
  const competitorStrengths = results.competitors?.flatMap(c => c.strengths) || [];
  const competitiveAdvantages = competitorStrengths.length > 0
    ? `Outperforms competitors in areas where they rely on: ${[...new Set(competitorStrengths)].slice(0, 5).join(", ")}`
    : "";

  // Derive market positioning
  const avg = results.marketPriceRange?.average || 0;
  const suggested = results.pricingRecommendation?.suggested || 0;
  let marketPositioning = "premium";
  if (suggested < avg * 0.85) marketPositioning = "affordable";
  else if (suggested > avg * 1.15) marketPositioning = "premium";
  else marketPositioning = "disruptive";

  // Pricing strategy
  const margins = results.pricingRecommendation?.marginScenarios || [];
  const pricingStrategy = suggested
    ? `Suggested: $${suggested}` + (margins.length ? ` | ${margins.map(m => `${m.margin}: $${m.price} (${m.competitiveness})`).join(" | ")}` : "")
    : "";

  // Pain points from demand
  const trend = results.demandIndicators?.trend || "stable";
  const painPoints = trend === "rising"
    ? "Growing demand means customers struggle to find quality options, face long wait times, and deal with inconsistent quality"
    : trend === "declining"
    ? "Market saturation leads to confusion, overpriced options, and lack of innovation"
    : "Customers face difficulty comparing options, inconsistent pricing, and uncertain quality";

  // Desires from demand
  const seasonality = results.demandIndicators?.seasonality || "";
  const desires = `Reliable quality, competitive pricing, fast delivery${seasonality ? `, especially during ${seasonality}` : ""}`;

  // Brand tone from positioning
  let brandTone = "bold";
  if (marketPositioning === "premium") brandTone = "luxury";
  else if (marketPositioning === "affordable") brandTone = "minimal";
  else brandTone = "innovative";

  return {
    productName: results.productIdentification.name || "",
    category: results.productIdentification.category || "",
    targetAudience: "",
    keyFeatures,
    specs,
    competitiveAdvantages,
    marketPositioning,
    pricingStrategy,
    painPoints,
    desires,
    testimonials: "",
    faq: "",
    brandTone,
  };
}

interface AILandingGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AILandingGenerator: React.FC<AILandingGeneratorProps> = ({ open, onOpenChange }) => {
  const store = useWebsiteBuilderStore();
  const sellerResults = useAnalysisStore((s) => s.sellerResults);
  const history = useAnalysisStore((s) => s.history);
  const [form, setForm] = useState<ProductFormData>(INITIAL_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>("manual");
  const [autoFilled, setAutoFilled] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string; category: string | null; description: string | null; current_price: number }[]>([]);

  const sellerHistoryItems = history.filter((h) => h.mode === "seller");

  // Reset and auto-fill when dialog opens
  useEffect(() => {
    if (open) {
      // Fetch DB products
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        supabase.from("products").select("id, name, category, description, current_price").eq("user_id", user.id).then(({ data }) => {
          if (data) setProducts(data);
        });
      });

      // Auto-fill from latest seller results if available
      if (sellerResults) {
        const filled = fillFromSellerResults(sellerResults);
        setForm(filled);
        setDataSource("market-intel");
        setAutoFilled(true);
      } else {
        setForm(INITIAL_FORM);
        setDataSource("manual");
        setAutoFilled(false);
      }
    }
  }, [open, sellerResults]);

  const handleSourceChange = useCallback((source: DataSource) => {
    setDataSource(source);
    setAutoFilled(false);

    if (source === "market-intel" && sellerResults) {
      setForm(fillFromSellerResults(sellerResults));
      setAutoFilled(true);
    } else if (source === "manual") {
      setForm(INITIAL_FORM);
    } else if (source === "database") {
      setForm(INITIAL_FORM);
    }
    // History items handled separately — no stored results to re-fill from
    // (history only stores metadata, not full results)
  }, [sellerResults]);

  const handleAutoFill = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setForm((f) => ({ ...f, productName: p.name, category: p.category || "", pricingStrategy: `Current price: $${p.current_price}` }));
  };

  const update = (field: keyof ProductFormData, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleGenerate = async () => {
    if (!form.productName.trim()) { toast.error("Product name is required"); return; }
    setIsGenerating(true);

    try {
      const marketIntelligence = sellerResults ? {
        competitors: sellerResults.competitors?.map((c) => ({ name: c.name, priceRange: c.priceRange, strengths: c.strengths })),
        marketPriceRange: sellerResults.marketPriceRange,
        demandIndicators: sellerResults.demandIndicators,
        pricingRecommendation: sellerResults.pricingRecommendation,
      } : null;

      const { data, error } = await supabase.functions.invoke("generate-landing-page", {
        body: { productData: form, marketIntelligence },
      });

      if (error) {
        // Check if the response body contains a specific error
        if (data?.error) throw new Error(data.error);
        throw new Error(error.message || "Generation failed");
      }
      if (data?.error) throw new Error(data.error);

      const blocks: SiteBlock[] = [];
      const mkId = (type: string) => `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      if (data.hero) {
        blocks.push({ id: mkId("hero"), type: "hero", enabled: true, config: { title: data.hero.title, subtitle: data.hero.subtitle, ctaText: data.hero.ctaText, backgroundImageUrl: "" } });
      }
      if (data.problemAgitation) {
        blocks.push({ id: mkId("problem-agitation"), type: "problem-agitation", enabled: true, config: data.problemAgitation });
      }
      if (data.solution) {
        blocks.push({ id: mkId("solution"), type: "solution", enabled: true, config: { ...data.solution, imageUrl: "" } });
      }
      if (data.featureBenefits?.content) {
        blocks.push({ id: mkId("about"), type: "about", enabled: true, config: { content: data.featureBenefits.content, imageUrl: "" } });
      }
      if (data.testimonials?.length) {
        blocks.push({ id: mkId("testimonials"), type: "testimonials", enabled: true, config: { items: data.testimonials } });
      }
      if (data.offerPricing) {
        blocks.push({ id: mkId("offer-pricing"), type: "offer-pricing", enabled: true, config: { ...data.offerPricing, scarcityText: data.offerPricing.scarcityText || "" } });
      }
      if (data.faqItems?.length) {
        blocks.push({ id: mkId("faq"), type: "faq", enabled: true, config: { items: data.faqItems } });
      }
      if (data.finalCta?.heading) {
        blocks.push({ id: mkId("contact"), type: "contact", enabled: true, config: { heading: data.finalCta.heading, showPhone: true, showAddress: false } });
      }

      const toneTheme = BRAND_TONE_THEMES[form.brandTone] || BRAND_TONE_THEMES.bold;
      const newTheme: LandingPageTheme = {
        ...store.theme,
        ...toneTheme,
        bodyFont: toneTheme.headingFont || store.theme.bodyFont,
        accentColor: toneTheme.primaryColor || store.theme.accentColor,
        layout: form.brandTone === "minimal" ? "classic" : "bold",
        heroStyle: form.brandTone === "minimal" ? "centered" : "split",
      };

      store.setBlocks(blocks);
      store.setTheme(newTheme);
      store.setCustomHtml(null);

      if (data.seo) {
        store.setSiteConfig({ name: data.seo.title || form.productName, tagline: data.seo.metaDescription || "" });
      }

      toast.success("Landing page generated! All blocks are fully editable.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate landing page");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Landing Page Generator</DialogTitle>
          <DialogDescription>Enter your product data and the AI will generate a high-conversion landing page with editable blocks.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Data Source Selector */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Data Source</Label>
            <Select value={dataSource} onValueChange={(v) => handleSourceChange(v as DataSource)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select data source..." />
              </SelectTrigger>
              <SelectContent>
                {sellerResults && (
                  <SelectItem value="market-intel">
                    <span className="flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-primary" />
                      Market Intelligence: {sellerResults.productIdentification.name}
                    </span>
                  </SelectItem>
                )}
                {sellerHistoryItems.map((item) => (
                  <SelectItem key={item.id} value={`history-${item.id}`}>
                    <span className="flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                      {item.productName} ({new Date(item.timestamp).toLocaleDateString()})
                    </span>
                  </SelectItem>
                ))}
                {products.length > 0 && (
                  <SelectItem value="database">
                    <span className="flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5" />
                      Database Product
                    </span>
                  </SelectItem>
                )}
                <SelectItem value="manual">
                  <span className="flex items-center gap-1.5">
                    <PenLine className="h-3.5 w-3.5" />
                    Manual Entry
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto-filled banner */}
          {autoFilled && (
            <div className="text-xs bg-accent/50 border border-accent rounded-md px-3 py-2 text-accent-foreground flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Fields populated from Market Intelligence: <strong>{sellerResults?.productIdentification.name}</strong>
            </div>
          )}

          {/* Database product picker (only when database source selected) */}
          {dataSource === "database" && products.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Select a product</Label>
              <Select onValueChange={handleAutoFill}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {sellerResults && dataSource !== "market-intel" && !autoFilled && (
            <div className="text-xs bg-primary/10 rounded-md px-3 py-2 text-primary">
              ✨ Market Intelligence data detected — switch source to "Market Intelligence" to auto-fill all fields.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Product Name *</Label>
              <Input value={form.productName} onChange={(e) => update("productName", e.target.value)} className="h-8 text-xs" placeholder="e.g. Evolv X E-Bike" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Input value={form.category} onChange={(e) => update("category", e.target.value)} className="h-8 text-xs" placeholder="e.g. Electric Vehicles" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Target Audience</Label>
            <Input value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} className="h-8 text-xs" placeholder="e.g. Urban commuters aged 25-45" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Key Features (comma-separated)</Label>
            <Textarea value={form.keyFeatures} onChange={(e) => update("keyFeatures", e.target.value)} rows={2} className="text-xs" placeholder="e.g. 100-mile range, Smart controls, Fast charging" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Technical Specifications</Label>
            <Textarea value={form.specs} onChange={(e) => update("specs", e.target.value)} rows={2} className="text-xs" placeholder="e.g. 500W motor, 48V battery, 28mph top speed" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Competitive Advantages</Label>
            <Textarea value={form.competitiveAdvantages} onChange={(e) => update("competitiveAdvantages", e.target.value)} rows={2} className="text-xs" placeholder="e.g. Longest range in class, Proprietary AI controls" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Market Positioning</Label>
              <Select value={form.marketPositioning} onValueChange={(v) => update("marketPositioning", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="affordable">Affordable</SelectItem>
                  <SelectItem value="disruptive">Disruptive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Brand Tone</Label>
              <Select value={form.brandTone} onValueChange={(v) => update("brandTone", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="innovative">Innovative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Pricing Strategy</Label>
            <Input value={form.pricingStrategy} onChange={(e) => update("pricingStrategy", e.target.value)} className="h-8 text-xs" placeholder="e.g. $2,499 with $500 early bird discount" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Customer Pain Points</Label>
              <Textarea value={form.painPoints} onChange={(e) => update("painPoints", e.target.value)} rows={2} className="text-xs" placeholder="e.g. Expensive fuel, traffic congestion" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Customer Desires</Label>
              <Textarea value={form.desires} onChange={(e) => update("desires", e.target.value)} rows={2} className="text-xs" placeholder="e.g. Eco-friendly transport, save money" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Testimonials (optional — one per line: "quote" - Author)</Label>
            <Textarea value={form.testimonials} onChange={(e) => update("testimonials", e.target.value)} rows={2} className="text-xs" placeholder='"Amazing product!" - John D.' />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">FAQ (optional — one per line: Q: question | A: answer)</Label>
            <Textarea value={form.faq} onChange={(e) => update("faq", e.target.value)} rows={2} className="text-xs" placeholder="Q: Return policy? | A: 30-day money back" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !form.productName.trim()}>
            {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Landing Page</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
