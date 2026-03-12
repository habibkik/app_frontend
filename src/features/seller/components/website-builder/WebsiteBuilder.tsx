import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Save, Globe, Monitor, Smartphone, Loader2, Check, Copy, ExternalLink, Paintbrush,
  Link as LinkIcon, LayoutTemplate, Sparkles, ImageIcon, Download, Search, Store, FileText, Plug,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { useWebsiteBuilderStore } from "@/stores/websiteBuilderStore";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useContentStudioStore } from "@/stores/contentStudioStore";
import { useDebounce } from "@/hooks/useDebounce";
import { BlockPalette } from "./BlockPalette";
import { BlockConfigurator } from "./BlockConfigurator";
import { generateStorefrontHtml } from "./generateStorefrontHtml";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { TemplatePicker } from "./TemplatePicker";
import { AILandingGenerator } from "./AILandingGenerator";
import type { WebsiteTemplate } from "./templates";
import { DEFAULT_BLOCKS } from "./blocks";
import { ConnectStoreModal } from "./ConnectStoreModal";
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
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [showConnectStore, setShowConnectStore] = useState(false);

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

  useEffect(() => {
    if (pendingWebsiteData) {
      store.importLandingPage(pendingWebsiteData);
      setPendingWebsiteData(null);
      toast.success("Landing page imported into Website Builder");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingWebsiteData]);

  const marketData = useMemo(() => {
    if (!sellerResults) return undefined;
    return {
      priceRange: sellerResults.marketPriceRange ? { min: sellerResults.marketPriceRange.min, max: sellerResults.marketPriceRange.max } : undefined,
      demandTrend: sellerResults.demandIndicators?.trend,
      competitorCount: sellerResults.competitors?.length,
    };
  }, [sellerResults]);

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

  const handleSave = useCallback(async () => {
    if (!userId) { toast.error("Please sign in to save."); return; }
    setIsSaving(true);
    try {
      const configJson = { siteConfig: store.siteConfig, blocks: store.blocks, customHtml: store.customHtml };
      const slug = store.slug || store.siteConfig.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "my-store";
      if (store.websiteId) {
        const { error } = await supabase.from("websites").update({
          name: store.siteConfig.name, slug, config_json: configJson, theme_json: store.theme,
        } as any).eq("id", store.websiteId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("websites").insert({
          user_id: userId, name: store.siteConfig.name, slug, config_json: configJson, theme_json: store.theme,
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

  const handlePublish = useCallback(async () => {
    if (!userId) return;
    setIsPublishing(true);
    try {
      await handleSave();
      const slug = store.slug || "my-store";
      const filePath = `${userId}/store-${slug}.html`;
      const html = store.customHtml || generateStorefrontHtml({
        siteConfig: store.siteConfig, blocks: store.blocks, theme: store.theme, products, marketData, socialStats,
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

  const handleExportZip = useCallback(async () => {
    setIsExporting(true);
    try {
      const html = store.customHtml || generateStorefrontHtml({
        siteConfig: store.siteConfig, blocks: store.blocks, theme: store.theme, products, marketData, socialStats,
      });
      const zip = new JSZip();
      zip.file("index.html", html);
      zip.file("README.txt", `Website: ${store.siteConfig.name}\nExported: ${new Date().toISOString()}\n\nOpen index.html in your browser to view.`);
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store.slug || "website"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Website exported as ZIP!");
    } catch (err: any) {
      toast.error(err.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  }, [store, products, marketData, socialStats]);

  const handleCopyUrl = async () => {
    if (!publishedUrl) return;
    await navigator.clipboard.writeText(publishedUrl);
    setCopiedUrl(true);
    toast.success("URL copied!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

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
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-card flex-wrap">
        <Input value={store.siteConfig.name} onChange={(e) => store.setSiteConfig({ name: e.target.value })} className="h-8 text-sm font-semibold max-w-[180px]" />
        <Input value={store.siteConfig.tagline} onChange={(e) => store.setSiteConfig({ tagline: e.target.value })} className="h-8 text-xs max-w-[220px]" placeholder="Tagline" />
        
        {/* Store Mode Toggle */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-muted/50">
          <FileText className={`h-3 w-3 ${store.storeMode === "standard" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-[10px] font-medium ${store.storeMode === "standard" ? "text-primary" : "text-muted-foreground"}`}>Site</span>
          <Switch
            checked={store.storeMode === "ecommerce"}
            onCheckedChange={(checked) => store.setStoreMode(checked ? "ecommerce" : "standard")}
            className="scale-75"
          />
          <Store className={`h-3 w-3 ${store.storeMode === "ecommerce" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-[10px] font-medium ${store.storeMode === "ecommerce" ? "text-primary" : "text-muted-foreground"}`}>Store</span>
        </div>

        <div className="flex-1" />
        <Button size="sm" variant={previewMode === "desktop" ? "default" : "outline"} onClick={() => setPreviewMode("desktop")} className="h-7 text-xs">
          <Monitor className="h-3 w-3 mr-1" /> Desktop
        </Button>
        <Button size="sm" variant={previewMode === "mobile" ? "default" : "outline"} onClick={() => setPreviewMode("mobile")} className="h-7 text-xs">
          <Smartphone className="h-3 w-3 mr-1" /> Mobile
        </Button>
        <Button size="sm" variant={showCustomizer ? "default" : "outline"} onClick={() => { setShowCustomizer(!showCustomizer); if (!showCustomizer) setShowSeoPanel(false); }} className="h-7 text-xs">
          <Paintbrush className="h-3 w-3 mr-1" /> Theme
        </Button>
        <Button size="sm" variant={showSeoPanel ? "default" : "outline"} onClick={() => { setShowSeoPanel(!showSeoPanel); if (!showSeoPanel) setShowCustomizer(false); }} className="h-7 text-xs">
          <Search className="h-3 w-3 mr-1" /> SEO
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowTemplateDialog(true)} className="h-7 text-xs">
          <LayoutTemplate className="h-3 w-3 mr-1" /> Templates
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowAIGenerator(true)} className="h-7 text-xs bg-primary/5 border-primary/30 hover:bg-primary/10">
          <Sparkles className="h-3 w-3 mr-1" /> AI Generate
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
          const available = proImages.filter((img) => img.imageUrl);
          if (available.length === 0) { toast.error("No pro images available. Generate them in Content Studio first."); return; }
          const heroImg = available.find((i) => i.id === "studio-hero");
          const aboutImg = available.find((i) => i.id === "studio-lifestyle");
          const productImg = available.find((i) => i.id === "packshot-front");
          store.blocks.forEach((block) => {
            if (block.type === "hero" && heroImg?.imageUrl) store.updateBlockConfig(block.id, { backgroundImageUrl: heroImg.imageUrl });
            if (block.type === "about" && aboutImg?.imageUrl) store.updateBlockConfig(block.id, { imageUrl: aboutImg.imageUrl });
            if (block.type === "product-catalog" && productImg?.imageUrl) store.updateBlockConfig(block.id, { featuredImage: productImg.imageUrl });
          });
          toast.success(`Applied ${available.length} pro images to website blocks`);
        }}>
          <ImageIcon className="h-3 w-3 mr-1" /> Use Pro Images
        </Button>
        <Button size="sm" variant="outline" onClick={handleExportZip} disabled={isExporting} className="h-7 text-xs">
          {isExporting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Download className="h-3 w-3 mr-1" />} Export ZIP
        </Button>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaving} className="h-7 text-xs">
          {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />} Save
        </Button>
        <Button size="sm" onClick={() => setShowPublishDialog(true)} className="h-7 text-xs">
          <Globe className="h-3 w-3 mr-1" /> Publish
        </Button>
      </div>

      {showCustomizer && (
        <div className="px-4 py-3 border-b bg-muted/30">
          <ThemeCustomizer theme={store.theme} onChange={store.setTheme} />
        </div>
      )}

      {showSeoPanel && (
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold">SEO Settings</h3>
            <Button size="sm" variant="outline" className="h-7 text-xs ml-auto bg-primary/5 border-primary/30 hover:bg-primary/10" disabled={isGeneratingSeo} onClick={async () => {
              setIsGeneratingSeo(true);
              try {
                const { data, error } = await supabase.functions.invoke("generate-seo", {
                  body: { siteName: store.siteConfig.name, tagline: store.siteConfig.tagline, blocks: store.blocks.filter(b => b.enabled).map(b => ({ type: b.type, enabled: b.enabled, config: b.config })) },
                });
                if (error) throw error;
                if (data?.error) throw new Error(data.error);
                store.setSiteConfig({
                  metaTitle: data.metaTitle || store.siteConfig.metaTitle,
                  metaDescription: data.metaDescription || store.siteConfig.metaDescription,
                  metaKeywords: data.metaKeywords || store.siteConfig.metaKeywords,
                });
                toast.success("SEO fields auto-filled by AI!");
              } catch (err: any) {
                toast.error(err.message || "Failed to generate SEO metadata");
              } finally {
                setIsGeneratingSeo(false);
              }
            }}>
              {isGeneratingSeo ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />} AI Auto-Fill
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Meta Title <span className="text-muted-foreground">({(store.siteConfig.metaTitle || store.siteConfig.name || "").length}/60)</span></Label>
                <Input value={store.siteConfig.metaTitle || ""} onChange={(e) => store.setSiteConfig({ metaTitle: e.target.value })} placeholder={store.siteConfig.name || "Page title for search engines"} maxLength={60} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Meta Description <span className="text-muted-foreground">({(store.siteConfig.metaDescription || "").length}/160)</span></Label>
                <Textarea value={store.siteConfig.metaDescription || ""} onChange={(e) => store.setSiteConfig({ metaDescription: e.target.value })} placeholder="Brief description for search results…" maxLength={160} className="text-xs min-h-[60px] resize-none" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Keywords <span className="text-muted-foreground">(comma-separated)</span></Label>
                <Input value={store.siteConfig.metaKeywords || ""} onChange={(e) => store.setSiteConfig({ metaKeywords: e.target.value })} placeholder="e-bike, electric, store" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">OG Image URL</Label>
                <Input value={store.siteConfig.ogImage || ""} onChange={(e) => store.setSiteConfig({ ogImage: e.target.value })} placeholder="https://example.com/og-image.jpg" className="h-8 text-xs" />
                {store.siteConfig.ogImage && (
                  <img src={store.siteConfig.ogImage} alt="OG preview" className="h-16 w-28 object-cover rounded border mt-1" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Favicon URL</Label>
                <Input value={store.siteConfig.favicon || ""} onChange={(e) => store.setSiteConfig({ favicon: e.target.value })} placeholder="https://example.com/favicon.ico" className="h-8 text-xs" />
                {store.siteConfig.favicon && (
                  <img src={store.siteConfig.favicon} alt="Favicon preview" className="h-6 w-6 object-contain rounded border mt-1" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>
              <div className="p-2 rounded bg-card border text-xs text-muted-foreground space-y-1 mt-2">
                <p className="font-medium text-foreground">SEO Tips</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Title under 60 chars with primary keyword</li>
                  <li>Description under 160 chars, compelling CTA</li>
                  <li>OG image: 1200×630px for social shares</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Google Search Preview */}
          <div className="mt-4 max-w-xl">
            <Label className="text-xs font-medium text-muted-foreground mb-1 block">Google Search Preview</Label>
            <div className="p-3 rounded-lg border bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-1">
                {store.siteConfig.favicon && (
                  <img src={store.siteConfig.favicon} alt="" className="h-4 w-4 rounded-sm object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
                <span className="text-xs text-muted-foreground truncate">{store.slug ? `example.com › store-${store.slug}` : "example.com › your-page"}</span>
              </div>
              <p className="text-base font-medium text-[#1a0dab] dark:text-primary leading-tight truncate cursor-pointer hover:underline">
                {store.siteConfig.metaTitle || store.siteConfig.name || "Page Title"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {store.siteConfig.metaDescription || store.siteConfig.tagline || "Add a meta description to control how your page appears in search results."}
              </p>
            </div>
          </div>
        </div>
      )}

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

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r bg-card shrink-0 overflow-hidden">
          <BlockPalette />
        </div>
        <div className="flex-1 bg-muted/20 overflow-auto p-4">
          <div className={`mx-auto transition-all bg-white shadow-lg rounded-lg overflow-hidden ${previewMode === "mobile" ? "max-w-[390px]" : "max-w-[1100px]"}`}>
            <iframe srcDoc={previewHtml} className="w-full border-0" style={{ height: "calc(100vh - 180px)" }} title="Website preview" sandbox="allow-same-origin" />
          </div>
        </div>
        <div className="w-64 border-l bg-card shrink-0 overflow-hidden">
          <BlockConfigurator />
        </div>
      </div>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Switch Template</DialogTitle>
            <DialogDescription>Choose a template. This will replace your current blocks and theme.</DialogDescription>
          </DialogHeader>
          <TemplatePicker onSelect={handleTemplateSelect} />
        </DialogContent>
      </Dialog>

      <AILandingGenerator open={showAIGenerator} onOpenChange={setShowAIGenerator} />

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
                <Input id="site-slug" value={store.slug} onChange={(e) => store.setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="my-store" maxLength={64} />
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
