import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ImageIcon, Check } from "lucide-react";
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
    </div>
  );
};

// --- Sub-forms ---

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}

function HeroForm({ config, update }: { config: HeroBlockConfig; update: (c: any) => void }) {
  const studioImages = useContentStudioStore((s) => s.images);
  const available = studioImages.filter((img) => img.imageUrl);

  return (
    <>
      <Field label="Title"><Input value={config.title} onChange={(e) => update({ title: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Subtitle"><Input value={config.subtitle} onChange={(e) => update({ subtitle: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="CTA Text"><Input value={config.ctaText} onChange={(e) => update({ ctaText: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Background Image URL"><Input value={config.backgroundImageUrl} onChange={(e) => update({ backgroundImageUrl: e.target.value })} placeholder="https://..." className="text-xs h-8" /></Field>
      {available.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Pick from Content Studio</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {available.map((img) => {
              const selected = config.backgroundImageUrl === img.imageUrl;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => update({ backgroundImageUrl: img.imageUrl })}
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
      )}
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
    </>
  );
}

function AboutForm({ config, update }: { config: AboutBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Content"><Textarea value={config.content} onChange={(e) => update({ content: e.target.value })} rows={5} className="text-xs" /></Field>
      <Field label="Image URL"><Input value={config.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="https://..." className="text-xs h-8" /></Field>
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
  const removeItem = (idx: number) => update({ items: config.items.filter((_, i) => i !== idx) });

  return (
    <>
      {config.items.map((item, idx) => (
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
  const removeItem = (idx: number) => update({ items: config.items.filter((_, i) => i !== idx) });

  return (
    <>
      {config.items.map((item, idx) => (
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
    </>
  );
}

function OrderFormConfig({ config, update }: { config: OrderFormBlockConfig; update: (c: any) => void }) {
  return (
    <>
      <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>
      <Field label="Product Name"><Input value={config.productName} onChange={(e) => update({ productName: e.target.value })} className="text-xs h-8" /></Field>
    </>
  );
}

function HeadingOnly({ config, update }: { config: { heading: string }; update: (c: any) => void }) {
  return <Field label="Heading"><Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className="text-xs h-8" /></Field>;
}
