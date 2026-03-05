import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, Upload, X, GripVertical, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useContentStudioStore } from "@/stores/contentStudioStore";

interface ProductImage {
  id: string;
  url: string;
  name: string;
  isLowRes?: boolean;
}

interface Props {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  listingId?: string;
  maxImages?: number;
}

const MIN_RES = 800;

export function ProductImageUploader({ images, onChange, listingId, maxImages = 10 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const proImages = useContentStudioStore((s) => s.proImages);
  const studioImages = useContentStudioStore((s) => s.images);

  // Combine all generated images from Content Studio
  const availableStudioImages = [
    ...proImages.filter((i) => i.imageUrl),
    ...studioImages.filter((i) => i.imageUrl),
  ];

  const checkResolution = (file: File): Promise<boolean> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width >= MIN_RES && img.height >= MIN_RES);
      img.onerror = () => resolve(true);
      img.src = URL.createObjectURL(file);
    });

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please log in first"); return; }

    const remaining = maxImages - images.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) { toast.error(`Max ${maxImages} images`); return; }

    setUploading(true);
    const newImages: ProductImage[] = [];

    for (const file of toUpload) {
      const isLowRes = !(await checkResolution(file));
      const path = `${user.id}/${listingId || "draft"}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("marketplace-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) { toast.error(`Failed to upload ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("marketplace-media").getPublicUrl(path);
      newImages.push({ id: crypto.randomUUID(), url: urlData.publicUrl, name: file.name, isLowRes });
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded`);
    }
    setUploading(false);
  }, [images, onChange, listingId, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);

  const removeImage = (id: string) => onChange(images.filter((i) => i.id !== id));

  // Drag reorder handlers
  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setOverIdx(idx); };
  const onDragEnd = () => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const reordered = [...images];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(overIdx, 0, moved);
      onChange(reordered);
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  const [importingId, setImportingId] = useState<string | null>(null);

  // Import from Content Studio
  const importStudioImage = async (imageUrl: string, label: string, studioId: string) => {
    if (images.length >= maxImages) { toast.error(`Max ${maxImages} images`); return; }

    const newId = crypto.randomUUID();
    const filename = `studio-${label.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;

    setImportingId(studioId);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setUploading(true);
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const path = `${user.id}/${listingId || "draft"}/${filename}`;

        const { error } = await supabase.storage.from("marketplace-media").upload(path, blob, {
          cacheControl: "3600",
          contentType: blob.type || "image/png",
        });

        if (!error) {
          const { data: urlData } = supabase.storage.from("marketplace-media").getPublicUrl(path);
          onChange([...images, { id: newId, url: urlData.publicUrl, name: filename }]);
          toast.success(`"${label}" imported`);
          setUploading(false);
          setImportingId(null);
          setStudioOpen(false);
          return;
        }
        console.warn("Storage upload failed, using direct URL:", error.message);
      } catch (e) {
        console.warn("Storage upload failed, using direct URL:", e);
      }
      setUploading(false);
    }

    onChange([...images, { id: newId, url: imageUrl, name: filename }]);
    toast.success(`"${label}" imported`);
    setImportingId(null);
    setStudioOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Product Images</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{images.length}/{maxImages}</Badge>
          {availableStudioImages.length > 0 && (
            <Dialog open={studioOpen} onOpenChange={setStudioOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> From Content Studio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import from Content Studio</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
                    {availableStudioImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => img.imageUrl && importStudioImage(img.imageUrl, img.label, img.id)}
                        className={`group relative aspect-square rounded-lg overflow-hidden border transition-all ${
                          importingId === img.id ? "ring-2 ring-primary border-primary" : "border-border hover:ring-2 hover:ring-primary"
                        }`}
                        disabled={!!importingId}
                      >
                        <img src={img.imageUrl!} alt={img.label} className={`w-full h-full object-cover transition-opacity ${importingId === img.id ? "opacity-40" : ""}`} />
                        {importingId === img.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-[10px] text-white font-medium truncate">{img.label}</p>
                          {img.section && (
                            <p className="text-[9px] text-white/70 capitalize">{img.section}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="w-8 h-8 opacity-50" />
            <p className="text-sm">Drag & drop images here or click to upload (up to {maxImages})</p>
            <p className="text-xs">Recommended: 800×800px minimum</p>
          </div>
        )}
      </div>

      {/* Image grid with drag reorder */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              className={`group relative aspect-square rounded-lg overflow-hidden border transition-all ${
                dragIdx === idx ? "opacity-50 scale-95" : ""
              } ${overIdx === idx && dragIdx !== idx ? "ring-2 ring-primary" : "border-border"}`}
            >
              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />

              {/* Drag handle */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5 cursor-grab">
                <GripVertical className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Remove */}
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-0.5"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>

              {/* Low res warning */}
              {img.isLowRes && (
                <div className="absolute bottom-1 left-1 bg-yellow-500/90 rounded px-1.5 py-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-white" />
                  <span className="text-[9px] text-white font-medium">Low Res</span>
                </div>
              )}

              {/* Position badge */}
              {idx === 0 && (
                <div className="absolute bottom-1 right-1 bg-primary/90 rounded px-1.5 py-0.5">
                  <span className="text-[9px] text-primary-foreground font-medium">Cover</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
