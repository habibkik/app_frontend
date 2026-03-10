import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Save, Globe, Monitor, Smartphone, Loader2, Check, Copy, ExternalLink, Paintbrush, Link as LinkIcon, LayoutTemplate, Sparkles, ImageIcon, Search, Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWebsiteBuilderStore } from "@/stores/websiteBuilderStore";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useContentStudioStore } from "@/stores/contentStudioStore";
import { useDebounce } from "@/hooks/useDebounce";
import { BlockPalette } from "./BlockPalette";
import { BlockConfigurator } from "./BlockConfigurator";
import { generateStorefrontHtml } from "./generateStorefrontHtml";
import { LandingPageCustomizer } from "../content-studio/LandingPageCustomizer";
import { TemplatePicker } from "./TemplatePicker";
import { AILandingGenerator } from "./AILandingGenerator";
import type { WebsiteTemplate } from "./templates";
import { DEFAULT_BLOCKS } from "./blocks";
import type { ProductData } from "./types";

export const WebsiteBuilder: React.FC = () => {
  const store = useWebsiteBuilderStore();
  const sellerResults = useAnalysisStore((s) => s.sellerResults);
  const proImages = useContentStudioStore((s) => s.proImages);
  const pendingWebsiteData = useContentStudioStore((s) => s.pendingWebsiteData);
  const setPendingWebsiteData = useContentStudioStore((s) => s.setPendingWebsiteData);

  const [products, setProducts] = useState<ProductData[]>([]);
  const [socialStats, setSocialStats] = useState({ postCount: 0, totalEngagement: 0 });
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user, products, social stats, and existing website on mount
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: prods } = await supabase.from("products").select("id, name, current_price, image_url, description, category").eq("user_id", user.id);
      if (prods) setProducts(prods);

      const { data: posts } = await supabase.from("scheduled_posts").select("id, total_likes, total_shares, total_comments").eq("user_id", user.id);
      if (posts) {
        setSocialStats({
          postCount: posts.length,
          totalEngagement: posts.reduce((sum, p) => sum + (p.total_likes || 0) + (p.total_shares || 0) + (p.total_comments || 0), 0),
        });
      }

      const { data: sites } = await supabase.from("websites").select("*").eq("user_id", user.id).limit(1) as any;
      if (sites && sites.length > 0) {
        store.loadFromDb(sites[0]);
        if (sites[0].is_published && sites[0].published_html) {
          const slug = sites[0].slug;
          const { data: urlData } = supabase.storage.from("landing-pages").getPublicUrl(`${user.id}/store-${slug}.html`);
          setPublishedUrl(urlData.publicUrl);
        }
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Import landing page from Content Studio
  useEffect(() => {
    if (pendingWebsiteData) {
      store.importLandingPage(pendingWebsiteData);
      setPendingWebsiteData(null);
      toast.success("Landing page imported into Website Builder");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingWebsiteData]);

  // Market data from analysis store
  const marketData = useMemo(() => {
    if (!sellerResults) return undefined;
    return {
      priceRange: sellerResults.marketPriceRange ? { min: sellerResults.marketPriceRange.min, max: sellerResults.marketPriceRange.max } : undefined,
      demandTrend: sellerResults.demandIndicators?.trend,
      competitorCount: sellerResults.competitors?.length,
    };
  }, [sellerResults]);

  // Template selection handler (used both for initial pick and toolbar dialog)
  const handleTemplateSelect = useCallback((template: WebsiteTemplate) => {
    store.setSiteConfig(template.siteConfig);
    store.setTheme(template.theme);
    store.setSlug(template.siteConfig.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "my-store");
    store.setCustomHtml(null);
    if (template.blocks.length > 0) {
      store.setBlocks(template.blocks);
    } else {
      store.setBlocks(DEFAULT_BLOCKS);
    }
    store.setTemplateChosen(true);
    setShowTemplateDialog(false);
    toast.success(`Template "${template.name}" applied!`);
  }, [store]);

  // Debounced HTML generation
  const debouncedBlocks = useDebounce(store.blocks, 300);
  const debouncedTheme = useDebounce(store.theme, 300);
  const debouncedConfig = useDebounce(store.siteConfig, 300);

  const previewHtml = useMemo(
    () =>
      store.customHtml ||
      generateStorefrontHtml({
        siteConfig: debouncedConfig,
        blocks: debouncedBlocks,
        theme: debouncedTheme,
        products,
        marketData,
        socialStats,
      }),
    [store.customHtml, debouncedBlocks, debouncedTheme, debouncedConfig, products, marketData, socialStats]
  );

  // Save draft
  const handleSave = useCallback(async () => {
    if (!userId) { toast.error("Please sign in to save."); return; }
    setIsSaving(true);
    try {
      const configJson = { siteConfig: store.siteConfig, blocks: store.blocks, customHtml: store.customHtml };
      const slug = store.slug || store.siteConfig.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "my-store";

      if (store.websiteId) {
        const { error } = await supabase.from("websites").update({
          name: store.siteConfig.name,
          slug,
          config_json: configJson,
          theme_json: store.theme,
        } as any).eq("id", store.websiteId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("websites").insert({
          user_id: userId,
          name: store.siteConfig.name,
          slug,
          config_json: configJson,
          theme_json: store.theme,
        } as any).select().single();
        if (error) throw error;
        if (data) store.setWebsiteId((data as any).id);
      }
      store.setSlug(slug);
      toast.success("Draft saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }, [userId, store]);

  // Publish
  const handlePublish = useCallback(async () => {
    if (!userId) return;
    setIsPublishing(true);
    try {
      await handleSave();
      const slug = store.slug || "my-store";
      const filePath = `${userId}/store-${slug}.html`;
      const html = store.customHtml || generateStorefrontHtml({
        siteConfig: store.siteConfig,
        blocks: store.blocks,
        theme: store.theme,
        products,
        marketData,
        socialStats,
      });
      const blob = new Blob([html], { type: "text/html" });
      const { error: uploadErr } = await supabase.storage.from("landing-pages").upload(filePath, blob, { contentType: "text/html", upsert: true });
      if (uploadErr) throw uploadErr;

      if (store.websiteId) {
        await supabase.from("websites").update({ published_html: html, is_published: true } as any).eq("id", store.websiteId);
      }
      store.setIsPublished(true);

      const { data: urlData } = supabase.storage.from("landing-pages").getPublicUrl(filePath);
      setPublishedUrl(urlData.publicUrl);
      toast.success("Website published!");
      setShowPublishDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish.");
    } finally {
      setIsPublishing(false);
    }
  }, [userId, store, products, marketData, socialStats, handleSave]);

  const handleCopyUrl = async () => {
    if (!publishedUrl) return;
    await navigator.clipboard.writeText(publishedUrl);
    setCopiedUrl(true);
    toast.success("URL copied!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Show template picker if no template chosen and no existing site loaded
  if (!store.templateChosen) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <TemplatePicker onSelect={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-card flex-wrap">
        <Input
          value={store.siteConfig.name}
          onChange={(e) => store.setSiteConfig({ name: e.target.value })}
          className="h-8 text-sm font-semibold max-w-[200px]"
        />
        <Input
          value={store.siteConfig.tagline}
          onChange={(e) => store.setSiteConfig({ tagline: e.target.value })}
          className="h-8 text-xs max-w-[250px]"
          placeholder="Tagline"
        />
        <div className="flex-1" />
        <Button size="sm" variant={previewMode === "desktop" ? "default" : "outline"} onClick={() => setPreviewMode("desktop")} className="h-7 text-xs">
          <Monitor className="h-3 w-3 mr-1" /> Desktop
        </Button>
        <Button size="sm" variant={previewMode === "mobile" ? "default" : "outline"} onClick={() => setPreviewMode("mobile")} className="h-7 text-xs">
          <Smartphone className="h-3 w-3 mr-1" /> Mobile
        </Button>
        <Button size="sm" variant={showCustomizer ? "default" : "outline"} onClick={() => setShowCustomizer(!showCustomizer)} className="h-7 text-xs">
          <Paintbrush className="h-3 w-3 mr-1" /> Theme
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowTemplateDialog(true)} className="h-7 text-xs">
          <LayoutTemplate className="h-3 w-3 mr-1" /> Templates
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowAIGenerator(true)} className="h-7 text-xs bg-primary/5 border-primary/30 hover:bg-primary/10">
          <Sparkles className="h-3 w-3 mr-1" /> AI Generate
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => {
            const available = proImages.filter((img) => img.imageUrl);
            if (available.length === 0) {
              toast.error("No pro images available. Generate them in Content Studio first.");
              return;
            }
            const heroImg = available.find((i) => i.id === "studio-hero");
            const aboutImg = available.find((i) => i.id === "studio-lifestyle");
            const productImg = available.find((i) => i.id === "packshot-front");
            store.blocks.forEach((block) => {
              if (block.type === "hero" && heroImg?.imageUrl) {
                store.updateBlockConfig(block.id, { backgroundImageUrl: heroImg.imageUrl });
              }
              if (block.type === "about" && aboutImg?.imageUrl) {
                store.updateBlockConfig(block.id, { imageUrl: aboutImg.imageUrl });
              }
              if ((block.type === "product-catalog") && productImg?.imageUrl) {
                store.updateBlockConfig(block.id, { featuredImage: productImg.imageUrl });
              }
            });
            toast.success(`Applied ${available.length} pro images to website blocks`);
          }}
        >
          <ImageIcon className="h-3 w-3 mr-1" /> Use Pro Images
        </Button>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaving} className="h-7 text-xs">
          {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />} Save
        </Button>
        <Button size="sm" onClick={() => setShowPublishDialog(true)} className="h-7 text-xs">
          <Globe className="h-3 w-3 mr-1" /> Publish
        </Button>
      </div>

      {/* Theme customizer */}
      {showCustomizer && (
        <div className="px-4 py-3 border-b bg-muted/30">
          <LandingPageCustomizer theme={store.theme} onChange={store.setTheme} />
        </div>
      )}

      {/* Published URL banner */}
      {publishedUrl && (
        <div className="flex items-center gap-3 px-4 py-2 border-b bg-primary/5">
          <LinkIcon className="h-4 w-4 text-primary shrink-0" />
          <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate flex-1">{publishedUrl}</a>
          <Button size="sm" variant="ghost" onClick={handleCopyUrl} className="h-6 px-2">
            {copiedUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="ghost" asChild className="h-6 px-2">
            <a href={publishedUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a>
          </Button>
        </div>
      )}

      {/* 3-panel layout — always show palette & configurator */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Block Palette */}
        <div className="w-56 border-r bg-card shrink-0 overflow-hidden">
          <BlockPalette />
        </div>

        {/* Center: Preview */}
        <div className="flex-1 bg-muted/20 overflow-auto p-4">
          <div className={`mx-auto transition-all bg-white shadow-lg rounded-lg overflow-hidden ${previewMode === "mobile" ? "max-w-[390px]" : "max-w-[1100px]"}`}>
            <iframe
              srcDoc={previewHtml}
              className="w-full border-0"
              style={{ height: "calc(100vh - 180px)" }}
              title="Website preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Right: Block Configurator */}
        <div className="w-64 border-l bg-card shrink-0 overflow-hidden">
          <BlockConfigurator />
        </div>
      </div>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Switch Template</DialogTitle>
            <DialogDescription>Choose a template. This will replace your current blocks and theme.</DialogDescription>
          </DialogHeader>
          <TemplatePicker onSelect={handleTemplateSelect} />
        </DialogContent>
      </Dialog>

      {/* AI Landing Generator */}
      <AILandingGenerator open={showAIGenerator} onOpenChange={setShowAIGenerator} />

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Your Website</DialogTitle>
            <DialogDescription>Publish your storefront to a public URL.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="site-slug" className="text-sm">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">…/store-</span>
                <Input
                  id="site-slug"
                  value={store.slug}
                  onChange={(e) => store.setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="my-store"
                  maxLength={64}
                />
                <span className="text-xs text-muted-foreground">.html</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>Cancel</Button>
            <Button onClick={handlePublish} disabled={isPublishing || !store.slug.trim()}>
              {isPublishing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing...</> : <><Globe className="h-4 w-4 mr-2" /> Publish</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
