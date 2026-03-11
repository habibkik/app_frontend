import React, { useState, useCallback, useEffect } from "react";
import JSZip from "jszip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  Download,
  DownloadCloud,
  RefreshCw,
  ImageIcon,
  Camera,
  ChevronDown,
  ChevronRight,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { resizeImageForAI } from "@/utils/resizeImage";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useContentStudioStore } from "@/stores/contentStudioStore";
import { PRO_IMAGE_SECTIONS } from "./types";
import type { GeneratedImage } from "./types";
import type { BrandKit } from "./BrandKitPanel";

const downloadImage = (dataUrl: string, filename: string) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

interface Props {
  productName: string;
  productCategory: string;
  competitors: string[];
  onImageGenerated?: (img: GeneratedImage) => void;
}

export const ProImageGenerationTab: React.FC<Props> = ({
  productName,
  productCategory,
  competitors,
  onImageGenerated,
}) => {
  const store = useContentStudioStore();
  const currentImage = useAnalysisStore((s) => s.currentImage);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    packshot: true,
    ugc: true,
    usage: true,
    studio: true,
  });
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Auto-populate reference from Market Intelligence on mount (resize it)
  useEffect(() => {
    if (currentImage && !store.referenceImageUrl) {
      resizeImageForAI(currentImage).then((resized) => {
        store.setReferenceImageUrl(resized);
      }).catch(() => {
        store.setReferenceImageUrl(currentImage);
      });
    }
  }, [currentImage, store.referenceImageUrl]);

  const referenceImageUrl = store.referenceImageUrl || currentImage || null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      const rawUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const resized = await resizeImageForAI(rawUrl);
      store.setReferenceImageUrl(resized);
      toast.success("Reference image set (resized for AI)");
    } catch {
      toast.error("Failed to process image");
    }
  };

  const generateProImage = useCallback(
    async (imageType: string) => {
      store.updateProImage(imageType, { isGenerating: true, error: undefined });
      try {
        const { data, error } = await supabase.functions.invoke(
          "generate-product-images",
          {
            body: {
              productName,
              productDescription: productCategory,
              category: productCategory,
              imageType,
              competitors,
              referenceImageUrl,
            },
          }
        );
        if (error) {
          // Parse the actual error message from the response body
          let errorMsg = "Generation failed";
          try {
            const ctx = error.context;
            if (ctx && typeof ctx.json === "function") {
              const body = await ctx.json();
              errorMsg = body?.error || errorMsg;
            } else if (error.message) {
              errorMsg = error.message;
            }
          } catch {
            errorMsg = error.message || errorMsg;
          }
          
          // Show specific toast for credit issues
          if (errorMsg.includes("credits") || errorMsg.includes("402")) {
            toast.error("AI credits exhausted. Please add credits to continue.");
          } else if (errorMsg.includes("Rate limit") || errorMsg.includes("429")) {
            toast.error("Rate limit reached. Please wait a moment and retry.");
          }
          
          throw new Error(errorMsg);
        }
        if (data?.error) throw new Error(data.error);
        store.updateProImage(imageType, {
          imageUrl: data.imageUrl,
          isGenerating: false,
        });
        const updated = useContentStudioStore.getState().proImages.find((i) => i.id === imageType);
        if (updated && onImageGenerated) onImageGenerated(updated);
      } catch (err: any) {
        console.error(`Pro image error (${imageType}):`, err);
        store.updateProImage(imageType, {
          isGenerating: false,
          error: err.message || "Failed",
        });
      }
    },
    [productName, productCategory, competitors, referenceImageUrl, store]
  );

  const generateSection = useCallback(
    async (imageIds: string[]) => {
      for (const id of imageIds) {
        await generateProImage(id);
        await new Promise((r) => setTimeout(r, 2000));
      }
    },
    [generateProImage]
  );

  const generateAllSections = useCallback(async () => {
    if (!referenceImageUrl) {
      toast.error("Please set a reference product image first");
      return;
    }
    setIsGeneratingAll(true);
    try {
      for (const section of PRO_IMAGE_SECTIONS) {
        // Check if any previous image hit a credit/rate error — stop early
        const hasCreditError = store.proImages.some(
          (img) => img.error?.includes("credits") || img.error?.includes("Rate limit")
        );
        if (hasCreditError) {
          toast.error("Generation stopped — credits exhausted or rate limited.");
          break;
        }
        await generateSection(section.imageIds);
      }
      const generated = store.proImages.filter((i) => i.imageUrl).length;
      if (generated > 0) toast.success(`${generated} pro images generated!`);
    } catch {
      toast.error("Some images failed. Retry individual ones.");
    } finally {
      setIsGeneratingAll(false);
    }
  }, [referenceImageUrl, generateSection, store.proImages]);

  const sectionImages = (sectionId: string) =>
    store.proImages.filter((img) => img.section === sectionId);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const allGenerated = store.proImages.every((img) => img.imageUrl);
  const [isZipping, setIsZipping] = useState(false);

  const [zippingSections, setZippingSections] = useState<Record<string, boolean>>({});

  const downloadSectionAsZip = useCallback(async (sectionId: string, sectionTitle: string) => {
    const imgs = store.proImages.filter((img) => img.section === sectionId && img.imageUrl);
    if (imgs.length === 0) { toast.error("No images to download"); return; }
    setZippingSections((prev) => ({ ...prev, [sectionId]: true }));
    try {
      const zip = new JSZip();
      const folder = zip.folder(sectionTitle.replace(/\s+/g, "-").toLowerCase())!;
      await Promise.all(
        imgs.map(async (img) => {
          const res = await fetch(img.imageUrl!);
          const blob = await res.blob();
          const ext = blob.type.includes("png") ? "png" : "jpg";
          folder.file(`${img.label.replace(/\s+/g, "-").toLowerCase()}.${ext}`, blob);
        })
      );
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName || "pro"}-${sectionTitle.replace(/\s+/g, "-").toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${sectionTitle} ZIP downloaded!`);
    } catch {
      toast.error("Failed to create ZIP");
    } finally {
      setZippingSections((prev) => ({ ...prev, [sectionId]: false }));
    }
  }, [store.proImages, productName]);

  const downloadAllAsZip = useCallback(async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(productName || "pro-images")!;
      await Promise.all(
        store.proImages.map(async (img) => {
          if (!img.imageUrl) return;
          const res = await fetch(img.imageUrl);
          const blob = await res.blob();
          const ext = blob.type.includes("png") ? "png" : "jpg";
          folder.file(`${img.section}/${img.label.replace(/\s+/g, "-").toLowerCase()}.${ext}`, blob);
        })
      );
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName || "pro-images"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("ZIP downloaded!");
    } catch {
      toast.error("Failed to create ZIP");
    } finally {
      setIsZipping(false);
    }
  }, [store.proImages, productName]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Pro Product Photography
          </h3>
          <p className="text-sm text-muted-foreground">
            20 professional images across 4 categories using your product as reference.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {allGenerated && (
            <Button variant="outline" onClick={downloadAllAsZip} disabled={isZipping}>
              {isZipping ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Zipping...</>
              ) : (
                <><DownloadCloud className="h-4 w-4 mr-2" /> Download All (ZIP)</>
              )}
            </Button>
          )}
          <Button
            onClick={generateAllSections}
            disabled={isGeneratingAll || !referenceImageUrl}
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" /> Generate All 20 Images
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Reference Image */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {referenceImageUrl ? (
                <img
                  src={referenceImageUrl}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Reference Product Image</p>
              <p className="text-xs text-muted-foreground">
                {referenceImageUrl
                  ? "Image set — all pro photography will use this as reference"
                  : "Upload or analyze a product image to use as reference"}
              </p>
            </div>
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-3 w-3 mr-1" /> Upload
                </span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {PRO_IMAGE_SECTIONS.map((section) => {
        const imgs = sectionImages(section.id);
        const isAnySectionGenerating = imgs.some((i) => i.isGenerating);
        const generatedCount = imgs.filter((i) => i.imageUrl).length;

        return (
          <Collapsible
            key={section.id}
            open={openSections[section.id]}
            onOpenChange={() => toggleSection(section.id)}
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-3">
                    {openSections[section.id] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <p className="text-xs text-muted-foreground font-normal mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {generatedCount}/5
                    </Badge>
                    {generatedCount > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!!zippingSections[section.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadSectionAsZip(section.id, section.title);
                        }}
                      >
                        {zippingSections[section.id] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <><Download className="h-3 w-3 mr-1" /> ZIP</>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isAnySectionGenerating || isGeneratingAll || !referenceImageUrl}
                      onClick={(e) => {
                        e.stopPropagation();
                        generateSection(section.imageIds);
                      }}
                    >
                      {isAnySectionGenerating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Wand2 className="h-3 w-3 mr-1" /> Generate
                        </>
                      )}
                    </Button>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {imgs.map((img) => (
                      <div key={img.id} className="space-y-2">
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {img.isGenerating ? (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                              <Loader2 className="h-6 w-6 animate-spin" />
                              <span className="text-[10px]">Generating...</span>
                            </div>
                          ) : img.imageUrl ? (
                            <img
                              src={img.imageUrl}
                              alt={img.label}
                              className="w-full h-full object-cover"
                            />
                          ) : img.error ? (
                            <div className="flex flex-col items-center gap-1 text-destructive text-center p-2">
                              <ImageIcon className="h-5 w-5" />
                              <span className="text-[10px]">{img.error}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                              <ImageIcon className="h-5 w-5" />
                              <span className="text-[10px]">Pending</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium text-center truncate">
                          {img.label}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-7 text-xs px-1"
                            onClick={() => generateProImage(img.id)}
                            disabled={img.isGenerating || isGeneratingAll}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-7 text-xs px-1"
                            disabled={!img.imageUrl || img.isGenerating}
                            onClick={() =>
                              img.imageUrl &&
                              downloadImage(
                                img.imageUrl,
                                `${img.id}.png`
                              )
                            }
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};
