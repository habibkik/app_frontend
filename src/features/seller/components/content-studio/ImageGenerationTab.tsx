import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, RefreshCw, ImageIcon } from "lucide-react";
import type { GeneratedImage } from "./types";

interface Props {
  images: GeneratedImage[];
  onRegenerate: (id: string) => void;
}

const downloadImage = (dataUrl: string, filename: string) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const ImageGenerationTab: React.FC<Props> = ({ images, onRegenerate }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">AI Product Images</h3>
      <p className="text-sm text-muted-foreground">
        5 AI-generated product images optimized for different marketing channels.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {images.map((img) => (
          <Card key={img.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{img.label}</CardTitle>
                <Badge variant="outline" className="text-xs capitalize">
                  {img.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {img.isGenerating ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-xs">Generating...</span>
                  </div>
                ) : img.imageUrl ? (
                  <img
                    src={img.imageUrl}
                    alt={img.label}
                    className="w-full h-full object-cover"
                  />
                ) : img.error ? (
                  <div className="flex flex-col items-center gap-2 text-destructive text-center p-4">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs">{img.error}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs">Not generated yet</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onRegenerate(img.id)}
                  disabled={img.isGenerating}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  disabled={!img.imageUrl || img.isGenerating}
                  onClick={() =>
                    img.imageUrl &&
                    downloadImage(img.imageUrl, `${img.label.replace(/\s/g, "-")}.png`)
                  }
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
