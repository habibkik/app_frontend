import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Copy,
  Check,
  Download,
  Monitor,
  Smartphone,
  Eye,
  Globe,
  Loader2,
  Link as LinkIcon,
  FileArchive,
  ExternalLink,
  Paintbrush,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import JSZip from "jszip";
import type { LandingPageData, GeneratedImage, LandingPageTheme } from "./types";
import { OrderForm } from "./OrderForm";
import { LandingPageCustomizer } from "./LandingPageCustomizer";

interface Props {
  landingPage: LandingPageData | null;
  images: GeneratedImage[];
  productName: string;
  userId: string;
  theme: LandingPageTheme;
  onThemeChange: (theme: LandingPageTheme) => void;
}

export const LandingPageTab: React.FC<Props> = ({ landingPage, images, productName, userId, theme, onThemeChange }) => {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Publish state
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [slug, setSlug] = useState(() => productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Download package state
  const [isPackaging, setIsPackaging] = useState(false);

  const handleCopyHtml = async () => {
    if (!landingPage?.html) return;
    await navigator.clipboard.writeText(landingPage.html);
    setCopied(true);
    toast.success("HTML copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!landingPage?.html) return;
    const blob = new Blob([landingPage.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.replace(/\s/g, "-")}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML downloaded");
  };

  // ── Publish to cloud storage ──
  const handlePublish = async () => {
    if (!landingPage?.html || !userId) return;
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/(^-|-$)/g, "") || "landing-page";

    setIsPublishing(true);
    try {
      const filePath = `${userId}/${cleanSlug}.html`;
      const blob = new Blob([landingPage.html], { type: "text/html" });

      // Upload (upsert) to storage
      const { error } = await supabase.storage
        .from("landing-pages")
        .upload(filePath, blob, { contentType: "text/html", upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("landing-pages")
        .getPublicUrl(filePath);

      setPublishedUrl(urlData.publicUrl);
      toast.success("Landing page published successfully!");
    } catch (err: any) {
      console.error("Publish error:", err);
      toast.error(err.message || "Failed to publish landing page.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!publishedUrl) return;
    await navigator.clipboard.writeText(publishedUrl);
    setCopiedUrl(true);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // ── Download as static site package ──
  const handleDownloadPackage = async () => {
    if (!landingPage?.html) return;
    setIsPackaging(true);

    try {
      const zip = new JSZip();

      // Add index.html
      zip.file("index.html", landingPage.html);

      // Add images as base64 files
      const assetsFolder = zip.folder("assets");
      let imageIndex = 0;
      for (const img of images) {
        if (img.imageUrl) {
          // Extract base64 data
          const match = img.imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
          if (match) {
            const ext = match[1] === "jpeg" ? "jpg" : match[1];
            const base64Data = match[2];
            assetsFolder?.file(`${img.id}-${img.label.replace(/\s/g, "-").toLowerCase()}.${ext}`, base64Data, { base64: true });
            imageIndex++;
          }
        }
      }

      // Add a README
      zip.file("README.md", `# ${productName} Landing Page

Generated by Content Studio on ${new Date().toLocaleDateString()}.

## Files
- \`index.html\` — The complete landing page (self-contained with inline CSS)
${imageIndex > 0 ? `- \`assets/\` — ${imageIndex} product image(s)\n` : ""}
## Usage
Simply open \`index.html\` in any browser, or deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).
`);

      // Add metadata JSON
      zip.file("metadata.json", JSON.stringify({
        productName,
        generatedAt: new Date().toISOString(),
        sections: {
          hero: landingPage.sections.hero,
          benefitsCount: landingPage.sections.benefits.length,
          featuresCount: landingPage.sections.features.length,
          faqCount: landingPage.sections.faq.length,
          ctaText: landingPage.sections.ctaText,
        },
        imagesIncluded: imageIndex,
      }, null, 2));

      // Generate and download
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName.replace(/\s/g, "-")}-static-site.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Static site package downloaded!");
    } catch (err: any) {
      console.error("Package error:", err);
      toast.error("Failed to create package.");
    } finally {
      setIsPackaging(false);
    }
  };

  if (!landingPage) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Eye className="h-12 w-12 mb-3" />
        <p className="text-sm">Generate your marketing kit to see the landing page preview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold">Landing Page</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={previewMode === "desktop" ? "default" : "outline"}
            onClick={() => setPreviewMode("desktop")}
          >
            <Monitor className="h-3 w-3 mr-1" /> Desktop
          </Button>
          <Button
            size="sm"
            variant={previewMode === "mobile" ? "default" : "outline"}
            onClick={() => setPreviewMode("mobile")}
          >
            <Smartphone className="h-3 w-3 mr-1" /> Mobile
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopyHtml}>
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            Copy HTML
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadHtml}>
            <Download className="h-3 w-3 mr-1" /> Export HTML
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadPackage}
            disabled={isPackaging}
          >
            {isPackaging ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FileArchive className="h-3 w-3 mr-1" />}
            Download Package
          </Button>
          <Button
            size="sm"
            variant={showCustomizer ? "default" : "outline"}
            onClick={() => setShowCustomizer(!showCustomizer)}
          >
            <Paintbrush className="h-3 w-3 mr-1" /> Customize
          </Button>
          <Button
            size="sm"
            onClick={() => setShowPublishDialog(true)}
          >
            <Globe className="h-3 w-3 mr-1" /> Publish
          </Button>
        </div>
      </div>

      {/* Theme Customizer */}
      {showCustomizer && (
        <LandingPageCustomizer theme={theme} onChange={onThemeChange} />
      )}

      {/* Published URL banner */}
      {publishedUrl && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-3">
            <LinkIcon className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Published!</p>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline truncate block"
              >
                {publishedUrl}
              </a>
            </div>
            <Button size="sm" variant="outline" onClick={handleCopyUrl}>
              {copiedUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Live Preview */}
      <Card>
        <CardContent className="p-0">
          <div
            className={`mx-auto transition-all ${previewMode === "mobile" ? "max-w-[390px]" : "w-full"}`}
          >
            <iframe
              srcDoc={landingPage.html}
              className="w-full border-0 rounded-lg"
              style={{ height: "600px" }}
              title="Landing page preview"
              sandbox="allow-same-origin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {landingPage.sections.benefits.map((b, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">✓</span> {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {landingPage.sections.faq.map((f, i) => (
              <div key={i}>
                <p className="text-sm font-medium">{f.question}</p>
                <p className="text-xs text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Order Form */}
      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={() => setShowOrderForm(!showOrderForm)}
          className="w-full"
        >
          {showOrderForm ? "Hide Order Form" : "Show Order Form Preview"}
        </Button>
        {showOrderForm && <OrderForm productName={productName} userId={userId} />}
      </div>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Landing Page</DialogTitle>
            <DialogDescription>
              Publish your landing page to a shareable URL. Choose a custom slug for your page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="publish-slug">Page Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">…/landing-pages/</span>
                <Input
                  id="publish-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="my-product"
                  maxLength={64}
                />
                <span className="text-xs text-muted-foreground">.html</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>
            {publishedUrl && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate"
                >
                  {publishedUrl}
                </a>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing || !slug.trim()}>
              {isPublishing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing...</>
              ) : (
                <><Globe className="h-4 w-4 mr-2" /> {publishedUrl ? "Update & Publish" : "Publish"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
