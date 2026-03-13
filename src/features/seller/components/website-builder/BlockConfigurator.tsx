import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Camera, Check, Loader2, Sparkles, RefreshCw, Crown, Flame, Scissors, Zap, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWebsiteBuilderStore } from "@/stores/websiteBuilderStore";
import { useContentStudioStore } from "@/stores/contentStudioStore";
import { BLOCK_META } from "./blocks";
import type {
  HeroBlockConfig,
  ProductCatalogBlockConfig,
  AboutBlockConfig,
  TestimonialsBlockConfig,
  FaqBlockConfig,
  ContactBlockConfig,
  OrderFormBlockConfig,
  SocialProofBlockConfig,
  MarketStatsBlockConfig,
  ProblemAgitationBlockConfig,
  SolutionBlockConfig,
  OfferPricingBlockConfig,
  FeaturesGridBlockConfig,
  PricingTableBlockConfig,
  ImageGalleryBlockConfig,
  VideoEmbedBlockConfig,
  CountdownTimerBlockConfig,
  NewsletterBlockConfig,
} from "./types";

export const BlockConfigurator: React.FC = () => {
  const { blocks, selectedBlockId, updateBlockConfig } = useWebsiteBuilderStore();
  const block = blocks.find((b) => b.id === selectedBlockId);

  if (!block) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4 text-center">
        Select a block from the left panel to configure it
      </div>
    );
  }

  const meta = BLOCK_META[block.type];
  const Icon = meta.icon;
  const update = (changes: Record<string, any>) => updateBlockConfig(block.id, changes);

  return (
    <div className="p-3 space-y-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{meta.label}</h3>
      </div>

      {block.type === "hero" && <HeroForm config={block.config as HeroBlockConfig} update={update} />}
      {block.type === "product-catalog" && <ProductCatalogForm config={block.config as ProductCatalogBlockConfig} update={update} />}
      {block.type === "about" && <AboutForm config={block.config as AboutBlockConfig} update={update} />}
      {block.type === "testimonials" && <TestimonialsForm config={block.config as TestimonialsBlockConfig} update={update} />}
      {block.type === "faq" && <FaqForm config={block.config as FaqBlockConfig} update={update} />}
      {block.type === "contact" && <ContactForm config={block.config as ContactBlockConfig} update={update} />}
      {block.type === "order-form" && <OrderFormConfig config={block.config as OrderFormBlockConfig} update={update} />}
      {block.type === "social-proof" && <HeadingOnly config={block.config as SocialProofBlockConfig} update={update} />}
      {block.type === "market-stats" && <HeadingOnly config={block.config as MarketStatsBlockConfig} update={update} />}
      {block.type === "problem-agitation" && <ProblemAgitationForm config={block.config as ProblemAgitationBlockConfig} update={update} />}
      {block.type === "solution" && <SolutionForm config={block.config as SolutionBlockConfig} update={update} />}
      {block.type === "offer-pricing" && <OfferPricingForm config={block.config as OfferPricingBlockConfig} update={update} />}
      {block.type === "features-grid" && <FeaturesGridForm config={block.config as FeaturesGridBlockConfig} update={update} />}
      {block.type === "pricing-table" && <PricingTableForm config={block.config as PricingTableBlockConfig} update={update} />}
      {block.type === "image-gallery" && <ImageGalleryForm config={block.config as ImageGalleryBlockConfig} update={update} />}
      {block.type === "video-embed" && <VideoEmbedForm config={block.config as VideoEmbedBlockConfig} update={update} />}
      {block.type === "countdown-timer" && <CountdownTimerForm config={block.config as CountdownTimerBlockConfig} update={update} />}
      {block.type === "newsletter" && <NewsletterForm config={block.config as NewsletterBlockConfig} update={update} />}

      <AIBlockActions blockType={block.type} config={block.config} onUpdate={update} />
    </div>
  );
};

// --- AI Block Actions ---

const AI_ACTIONS = [
  { id: "regenerate", label: "Regenerate", icon: RefreshCw, instruction: "Completely rewrite this section with fresh, compelling copy." },
  { id: "conversion", label: "Improve Conversion", icon: Sparkles, instruction: "Make this section more conversion-focused. Add stronger calls to action, urgency, and benefit-driven language." },
  { id: "premium", label: "Make Premium", icon: Crown, instruction: "Rewrite in a luxury, premium tone. Use sophisticated language, emphasize exclusivity and craftsmanship." },
  { id: "aggressive", label: "Make Aggressive", icon: Flame, instruction: "Rewrite with urgency and aggressive sales tone. Add FOMO and scarcity." },
  { id: "shorter", label: "Shorter Copy", icon: Scissors, instruction: "Condense this content significantly. Keep only the most impactful words." },
  { id: "scarcity", label: "Add Scarcity", icon: Zap, instruction: "Add scarcity and urgency elements. Limited time, limited stock, exclusive access." },
  { id: "data", label: "Data-Driven", icon: BarChart3, instruction: "Add statistics, data points, and evidence-based claims to increase credibility." },
];

function AIBlockActions({ blockType, config, onUpdate }: { blockType: string; config: any; onUpdate: (c: any) => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (instruction: string, actionId: string) => {
    setLoading(actionId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-landing-page", {
        body: { mode: "rewriteBlock", blockType, currentConfig: config, instruction },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.config) {
        onUpdate(data.config);
        toast.success("Block updated by AI!");
      }
    } catch (err: any) {
      toast.error(err.message || "AI rewrite failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border-t pt-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Actions</p>
      <div className="grid grid-cols-2 gap-1.5">
        {AI_ACTIONS.map((action) => {
          const ActionIcon = action.icon;
          return (
            <Button
              key={action.id}
              size="sm"
              variant="outline"
              disabled={loading !== null}
              onClick={() => handleAction(action.instruction, action.id)}
              className="h-7 text-[10px] px-2 justify-start"
            >
              {loading === action.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ActionIcon className="h-3 w-3 mr-1 shrink-0" />}
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// --- Reusable Pro Image Picker ---

function ProImagePicker({ currentValue, onSelect }: { currentValue: string; onSelect: (url: string) => void }) {
  const proImages = useContentStudioStore((s) => s.proImages);
  const available = proImages.filter((img) => img.imageUrl);

  if (available.length === 0) {
    return (
      <div className="text-[10px] text-muted-foreground italic p-2 border border-dashed rounded-md">
        No pro images yet. Generate them in Content Studio &gt; Pro Photography.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs flex items-center gap-1"><Camera className="h-3 w-3" /> Pick from Pro Photography</Label>
      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
        {available.map((img) => {
          const selected = currentValue === img.imageUrl;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => onSelect(img.imageUrl!)}
              className={`relative rounded-md overflow-hidden border-2 transition-all aspect-video ${selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40"}`}
            >
              <img src={img.imageUrl!} alt={img.label} className="w-full h-full object-cover" />
              {selected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground drop-shadow" />
                </div>
              )}
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">{img.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Reusable Background Image + Overlay Fields ---

function BackgroundImageFields({ backgroundImageUrl, overlayOpacity, bgImageWidth, bgImageHeight, fitToImage, update }: { backgroundImageUrl?: string; overlayOpacity?: number; bgImageWidth?: number; bgImageHeight?: number; fitToImage?: boolean; update: (c: any) => void }) {
  // Auto-detect image dimensions when URL changes
  React.useEffect(() => {
    if (!backgroundImageUrl) return;
    const img = new Image();
    img.onload = () => {
      update({ bgImageWidth: img.naturalWidth, bgImageHeight: img.naturalHeight, fitToImage: fitToImage ?? true });
    };
    img.src = backgroundImageUrl;
  }, [backgroundImageUrl]);

  return (
    <>
      <Field label="Background Image URL">
        <Input value={backgroundImageUrl || ""} onChange={(e) => update({ backgroundImageUrl: e.target.value })} placeholder="https://..." className="text-xs h-8" />
      </Field>
      <ProImagePicker currentValue={backgroundImageUrl || ""} onSelect={(url) => update({ backgroundImageUrl: url })} />
      {backgroundImageUrl && (
        <>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Overlay Darkness</Label>
              <span className="text-[10px] text-muted-foreground">{Math.round((typeof overlayOpacity === "number" ? overlayOpacity : 0.5) * 100)}%</span>
            </div>
            <Slider
              value={[typeof overlayOpacity === "number" ? overlayOpacity * 100 : 50]}
              onValueChange={([v]) => update({ overlayOpacity: v / 100 })}
              min={0}
              max={90}
              step={5}
              className="w-full"
            />
            <p className="text-[9px] text-muted-foreground">Controls the dark overlay that keeps text readable over photos</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Fit to Image Dimensions</Label>
              {bgImageWidth && bgImageHeight && (
                <p className="text-[9px] text-muted-foreground">{bgImageWidth}×{bgImageHeight}px</p>
              )}
            </div>
            <Switch checked={fitToImage ?? true} onCheckedChange={(v) => update({ fitToImage: v })} className="scale-75" />
          </div>
        </>
      )}
    </>
  );
}

// --- Sub-forms ---

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}

function HeroForm({ config, update }: { config: HeroBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Title"><Input value={config.title} onChange={(e) => update({ title: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Subtitle"><Input value={config.subtitle} onChange={(e) => update({ subtitle: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="CTA Text"><Input value={config.ctaText} onChange={(e) => update({ ctaText: e.target.value })} className="text-xs h-8" /></Field>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function ProductCatalogForm({ config, update }: { config: ProductCatalogBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Columns">
        <Select value={String(config.columns)} onValueChange={(v) => update({ columns: Number(v) })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Price</Label>
        <Switch checked={config.showPrice} onCheckedChange={(v) => update({ showPrice: v })} className="scale-75" />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Description</Label>
        <Switch checked={config.showDescription} onCheckedChange={(v) => update({ showDescription: v })} className="scale-75" />
      </div>
      <Field label="Category Filter"><Input value={config.categoryFilter} onChange={(e) => update({ categoryFilter: e.target.value })} placeholder="Leave empty for all" className="text-xs h-8" /></Field>
      <Field label="Featured Image URL"><Input value={config.featuredImage || ""} onChange={(e) => update({ featuredImage: e.target.value })} placeholder="https://..." className="text-xs h-8" /></Field>
      <ProImagePicker currentValue={config.featuredImage || ""} onSelect={(url) => update({ featuredImage: url })} />
    </>
  );
}

function AboutForm({ config, update }: { config: AboutBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Content"><Textarea value={config.content} onChange={(e) => update({ content: e.target.value })} rows={5} className="text-xs" /></Field>
      <Field label="Image URL"><Input value={config.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="https://..." className="text-xs h-8" /></Field>
      <ProImagePicker currentValue={config.imageUrl} onSelect={(url) => update({ imageUrl: url })} />
    </>
  );
}

function TestimonialsForm({ config, update }: { config: TestimonialsBlockConfig; update: (c: any) => void }) {
  const updateItem = (idx: number, field: string, value: string) => {
    const items = [...config.items];
    items[idx] = { ...items[idx], [field]: value };
    update({ items });
  };
  const addItem = () => update({ items: [...config.items, { quote: "", author: "" }] });
  const removeItem = (idx: number) => update({ items: config.items.filter((_: any, i: number) => i !== idx) });

  return (
    <>
      {config.items.map((item: any, idx: number) => (
        <div key={idx} className="space-y-1 border rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">#{idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
          <Input value={item.quote} onChange={(e) => updateItem(idx, "quote", e.target.value)} placeholder="Quote" className="text-xs h-7" />
          <Input value={item.author} onChange={(e) => updateItem(idx, "author", e.target.value)} placeholder="Author" className="text-xs h-7" />
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addItem} className="w-full text-xs h-7"><Plus className="h-3 w-3 mr-1" />Add Testimonial</Button>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function FaqForm({ config, update }: { config: FaqBlockConfig; update: (c: any) => void }) {
  const updateItem = (idx: number, field: string, value: string) => {
    const items = [...config.items];
    items[idx] = { ...items[idx], [field]: value };
    update({ items });
  };
  const addItem = () => update({ items: [...config.items, { question: "", answer: "" }] });
  const removeItem = (idx: number) => update({ items: config.items.filter((_: any, i: number) => i !== idx) });

  return (
    <>
      {config.items.map((item: any, idx: number) => (
        <div key={idx} className="space-y-1 border rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Q{idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
          <Input value={item.question} onChange={(e) => updateItem(idx, "question", e.target.value)} placeholder="Question" className="text-xs h-7" />
          <Textarea value={item.answer} onChange={(e) => updateItem(idx, "answer", e.target.value)} placeholder="Answer" rows={2} className="text-xs" />
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addItem} className="w-full text-xs h-7"><Plus className="h-3 w-3 mr-1" />Add FAQ</Button>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function ContactForm({ config, update }: { config: ContactBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Phone Field</Label>
        <Switch checked={config.showPhone} onCheckedChange={(v) => update({ showPhone: v })} className="scale-75" />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Address Field</Label>
        <Switch checked={config.showAddress} onCheckedChange={(v) => update({ showAddress: v })} className="scale-75" />
      </div>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function OrderFormConfig({ config, update }: { config: OrderFormBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Product Name"><Input value={config.productName} onChange={(e) => update({ productName: e.target.value })} className="text-xs h-8" /></Field>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function HeadingOnly({ config, update }: { config: { heading: string; backgroundImageUrl?: string; overlayOpacity?: number }; update: (c: any) => void }) {
  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function ProblemAgitationForm({ config, update }: { config: ProblemAgitationBlockConfig; update: (c: any) => void }) {
  const updatePain = (idx: number, field: string, value: string) => {
    const painPoints = [...config.painPoints];
    painPoints[idx] = { ...painPoints[idx], [field]: value };
    update({ painPoints });
  };
  const addPain = () => update({ painPoints: [...config.painPoints, { icon: "😤", title: "", description: "" }] });
  const removePain = (idx: number) => update({ painPoints: config.painPoints.filter((_: any, i: number) => i !== idx) });

  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Intro Text"><Textarea value={config.intro} onChange={(e) => update({ intro: e.target.value })} rows={2} className="text-xs" /></Field>
      {config.painPoints.map((p: any, idx: number) => (
        <div key={idx} className="space-y-1 border rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Pain #{idx + 1}</span>
            <button onClick={() => removePain(idx)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
          <div className="flex gap-1.5">
            <Input value={p.icon} onChange={(e) => updatePain(idx, "icon", e.target.value)} className="text-xs h-7 w-12" />
            <Input value={p.title} onChange={(e) => updatePain(idx, "title", e.target.value)} placeholder="Title" className="text-xs h-7 flex-1" />
          </div>
          <Input value={p.description} onChange={(e) => updatePain(idx, "description", e.target.value)} placeholder="Description" className="text-xs h-7" />
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addPain} className="w-full text-xs h-7"><Plus className="h-3 w-3 mr-1" />Add Pain Point</Button>
      <Field label="Reinforcement"><Textarea value={config.reinforcement} onChange={(e) => update({ reinforcement: e.target.value })} rows={2} className="text-xs" /></Field>
      <Field label="Image URL"><Input value={config.imageUrl || ""} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="https://..." className="text-xs h-8" /></Field>
      <ProImagePicker currentValue={config.imageUrl || ""} onSelect={(url) => update({ imageUrl: url })} />
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={(config as any).bgImageWidth} bgImageHeight={(config as any).bgImageHeight} fitToImage={(config as any).fitToImage} update={update} />
    </>
  );
}

function SolutionForm({ config, update }: { config: SolutionBlockConfig; update: (c: any) => void }) {
  const updatePoint = (idx: number, value: string) => {
    const pts = [...config.differentiationPoints];
    pts[idx] = value;
    update({ differentiationPoints: pts });
  };
  const addPoint = () => update({ differentiationPoints: [...config.differentiationPoints, ""] });
  const removePoint = (idx: number) => update({ differentiationPoints: config.differentiationPoints.filter((_: any, i: number) => i !== idx) });

  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Introduction"><Textarea value={config.intro} onChange={(e) => update({ intro: e.target.value })} rows={2} className="text-xs" /></Field>
      <Label className="text-xs">Differentiation Points</Label>
      {config.differentiationPoints.map((p: string, idx: number) => (
        <div key={idx} className="flex gap-1.5">
          <Input value={p} onChange={(e) => updatePoint(idx, e.target.value)} className="text-xs h-7 flex-1" placeholder={`Point ${idx + 1}`} />
          <button onClick={() => removePoint(idx)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addPoint} className="w-full text-xs h-7"><Plus className="h-3 w-3 mr-1" />Add Point</Button>
      <Field label="Credibility Text"><Textarea value={config.credibilityText} onChange={(e) => update({ credibilityText: e.target.value })} rows={2} className="text-xs" /></Field>
      <Field label="Image URL"><Input value={config.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="https://..." className="text-xs h-8" /></Field>
      <ProImagePicker currentValue={config.imageUrl} onSelect={(url) => update({ imageUrl: url })} />
    </>
  );
}

function OfferPricingForm({ config, update }: { config: OfferPricingBlockConfig; update: (c: any) => void }) {
  const updateValue = (idx: number, value: string) => {
    const items = [...config.valueItems];
    items[idx] = value;
    update({ valueItems: items });
  };
  const addValue = () => update({ valueItems: [...config.valueItems, ""] });
  const removeValue = (idx: number) => update({ valueItems: config.valueItems.filter((_: any, i: number) => i !== idx) });

  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Label className="text-xs">Value Items</Label>
      {config.valueItems.map((v: string, idx: number) => (
        <div key={idx} className="flex gap-1.5">
          <Input value={v} onChange={(e) => updateValue(idx, e.target.value)} className="text-xs h-7 flex-1" />
          <button onClick={() => removeValue(idx)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addValue} className="w-full text-xs h-7"><Plus className="h-3 w-3 mr-1" />Add Value</Button>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Anchor Price"><Input value={config.anchorPrice} onChange={(e) => update({ anchorPrice: e.target.value })} className="text-xs h-8" placeholder="$299" /></Field>
        <Field label="Actual Price"><Input value={config.actualPrice} onChange={(e) => update({ actualPrice: e.target.value })} className="text-xs h-8" placeholder="$199" /></Field>
      </div>
      <Field label="Scarcity Text (optional)"><Input value={config.scarcityText} onChange={(e) => update({ scarcityText: e.target.value })} className="text-xs h-8" placeholder="Only 50 left!" /></Field>
      <Field label="CTA Text"><Input value={config.ctaText} onChange={(e) => update({ ctaText: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Image URL"><Input value={config.imageUrl || ""} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="https://..." className="text-xs h-8" /></Field>
      <ProImagePicker currentValue={config.imageUrl || ""} onSelect={(url) => update({ imageUrl: url })} />
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

// --- New Block Forms ---

function FeaturesGridForm({ config, update }: { config: FeaturesGridBlockConfig; update: (c: any) => void }) {
  const updateItem = (idx: number, field: string, value: string) => {
    const items = [...config.items];
    items[idx] = { ...items[idx], [field]: value };
    update({ items });
  };
  const addItem = () => update({ items: [...config.items, { icon: "✨", title: "", description: "" }] });
  const removeItem = (idx: number) => update({ items: config.items.filter((_: any, i: number) => i !== idx) });

  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Subtitle"><Input value={config.subtitle} onChange={(e) => update({ subtitle: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Columns">
        <Select value={String(config.columns)} onValueChange={(v) => update({ columns: Number(v) })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {config.items.map((item: any, idx: number) => (
        <div key={idx} className="space-y-1 border rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">#{idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
          <div className="flex gap-1.5">
            <Input value={item.icon} onChange={(e) => updateItem(idx, "icon", e.target.value)} className="text-xs h-7 w-12" placeholder="🚀" />
            <Input value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} placeholder="Feature Title" className="text-xs h-7 flex-1" />
          </div>
          <Input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Description" className="text-xs h-7" />
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addItem} className="w-full text-xs h-7"><Plus className="h-3 w-3 mr-1" />Add Feature</Button>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function PricingTableForm({ config, update }: { config: PricingTableBlockConfig; update: (c: any) => void }) {
  const updatePlan = (idx: number, field: string, value: any) => {
    const plans = [...config.plans];
    plans[idx] = { ...plans[idx], [field]: value };
    update({ plans });
  };
  const updatePlanFeature = (planIdx: number, featureIdx: number, value: string) => {
    const plans = [...config.plans];
    const features = [...plans[planIdx].features];
    features[featureIdx] = value;
    plans[planIdx] = { ...plans[planIdx], features };
    update({ plans });
  };
  const addPlanFeature = (planIdx: number) => {
    const plans = [...config.plans];
    plans[planIdx] = { ...plans[planIdx], features: [...plans[planIdx].features, ""] };
    update({ plans });
  };
  const removePlanFeature = (planIdx: number, featureIdx: number) => {
    const plans = [...config.plans];
    plans[planIdx] = { ...plans[planIdx], features: plans[planIdx].features.filter((_: any, i: number) => i !== featureIdx) };
    update({ plans });
  };
  const addPlan = () => update({ plans: [...config.plans, { name: "New Plan", price: "$0", period: "/month", features: ["Feature 1"], highlighted: false, ctaText: "Choose" }] });
  const removePlan = (idx: number) => update({ plans: config.plans.filter((_: any, i: number) => i !== idx) });

  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      {config.plans.map((plan: any, idx: number) => (
        <div key={idx} className="space-y-1.5 border rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">{plan.name || `Plan ${idx + 1}`}</span>
            <button onClick={() => removePlan(idx)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
          <Input value={plan.name} onChange={(e) => updatePlan(idx, "name", e.target.value)} placeholder="Plan Name" className="text-xs h-7" />
          <div className="flex gap-1.5">
            <Input value={plan.price} onChange={(e) => updatePlan(idx, "price", e.target.value)} placeholder="$29" className="text-xs h-7 w-20" />
            <Input value={plan.period} onChange={(e) => updatePlan(idx, "period", e.target.value)} placeholder="/month" className="text-xs h-7 flex-1" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px]">Highlighted</Label>
            <Switch checked={plan.highlighted} onCheckedChange={(v) => updatePlan(idx, "highlighted", v)} className="scale-[0.6]" />
          </div>
          <Input value={plan.ctaText} onChange={(e) => updatePlan(idx, "ctaText", e.target.value)} placeholder="CTA Text" className="text-xs h-7" />
          <Label className="text-[10px] text-muted-foreground">Features:</Label>
          {plan.features.map((f: string, fi: number) => (
            <div key={fi} className="flex gap-1">
              <Input value={f} onChange={(e) => updatePlanFeature(idx, fi, e.target.value)} className="text-xs h-6 flex-1" />
              <button onClick={() => removePlanFeature(idx, fi)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-2.5 w-2.5" /></button>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={() => addPlanFeature(idx)} className="w-full text-[10px] h-5 px-1"><Plus className="h-2.5 w-2.5 mr-0.5" />Feature</Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addPlan} className="w-full text-xs h-7"><Plus className="h-3 w-3 mr-1" />Add Plan</Button>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function ImageGalleryForm({ config, update }: { config: ImageGalleryBlockConfig; update: (c: any) => void }) {
  const updateImage = (idx: number, field: string, value: string) => {
    const images = [...config.images];
    images[idx] = { ...images[idx], [field]: value };
    update({ images });
  };
  const addImage = () => update({ images: [...config.images, { url: "", caption: "" }] });
  const removeImage = (idx: number) => update({ images: config.images.filter((_: any, i: number) => i !== idx) });

  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Columns">
        <Select value={String(config.columns)} onValueChange={(v) => update({ columns: Number(v) })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {config.images.map((img: any, idx: number) => (
        <div key={idx} className="space-y-1 border rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Image #{idx + 1}</span>
            <button onClick={() => removeImage(idx)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
          <Input value={img.url} onChange={(e) => updateImage(idx, "url", e.target.value)} placeholder="Image URL" className="text-xs h-7" />
          <Input value={img.caption} onChange={(e) => updateImage(idx, "caption", e.target.value)} placeholder="Caption (optional)" className="text-xs h-7" />
          <ProImagePicker currentValue={img.url} onSelect={(url) => updateImage(idx, "url", url)} />
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addImage} className="w-full text-xs h-7"><Plus className="h-3 w-3 mr-1" />Add Image</Button>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function VideoEmbedForm({ config, update }: { config: VideoEmbedBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Provider">
        <Select value={config.provider} onValueChange={(v: any) => update({ provider: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="vimeo">Vimeo</SelectItem>
            <SelectItem value="custom">Custom URL</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Video URL"><Input value={config.videoUrl} onChange={(e) => update({ videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="text-xs h-8" /></Field>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Autoplay (muted)</Label>
        <Switch checked={config.autoplay} onCheckedChange={(v) => update({ autoplay: v })} className="scale-75" />
      </div>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function CountdownTimerForm({ config, update }: { config: CountdownTimerBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Subtitle"><Input value={config.subtitle} onChange={(e) => update({ subtitle: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Target Date"><Input type="date" value={config.targetDate} onChange={(e) => update({ targetDate: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="CTA Text"><Input value={config.ctaText} onChange={(e) => update({ ctaText: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="CTA Link"><Input value={config.ctaUrl} onChange={(e) => update({ ctaUrl: e.target.value })} placeholder="#contact" className="text-xs h-8" /></Field>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}

function NewsletterForm({ config, update }: { config: NewsletterBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Subtitle"><Input value={config.subtitle} onChange={(e) => update({ subtitle: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Button Text"><Input value={config.buttonText} onChange={(e) => update({ buttonText: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Placeholder Text"><Input value={config.placeholderText} onChange={(e) => update({ placeholderText: e.target.value })} className="text-xs h-8" /></Field>
      <BackgroundImageFields backgroundImageUrl={config.backgroundImageUrl} overlayOpacity={config.overlayOpacity} bgImageWidth={config.bgImageWidth} bgImageHeight={config.bgImageHeight} fitToImage={config.fitToImage} update={update} />
    </>
  );
}
