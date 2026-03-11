import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Save, Loader2, Plus, X, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface BrandKit {
  id?: string;
  colors: string[];
  aesthetic: string;
  target_audience: string;
  tone_keywords: string[];
  logo_url?: string | null;
}

const AESTHETIC_PRESETS = [
  { value: "minimalist", label: "Minimalist / Scandinavian", description: "Clean lines, white space, neutral tones" },
  { value: "dark-moody", label: "Dark & Moody", description: "Low-key lighting, deep shadows, dramatic contrast" },
  { value: "bright-pop", label: "Bright & Pop", description: "Vibrant colors, high energy, bold contrasts" },
  { value: "luxury", label: "Luxury / Premium", description: "Gold accents, rich textures, elegant compositions" },
  { value: "natural-organic", label: "Natural / Organic", description: "Earth tones, soft textures, botanical elements" },
  { value: "retro-vintage", label: "Retro / Vintage", description: "Film grain, warm tones, nostalgic aesthetic" },
  { value: "tech-modern", label: "Tech / Modern", description: "Gradient backgrounds, neon accents, futuristic feel" },
  { value: "editorial", label: "Editorial / Magazine", description: "High-fashion styling, cinematic compositions" },
];

const DEFAULT_BRAND_KIT: BrandKit = {
  colors: [],
  aesthetic: "minimalist",
  target_audience: "",
  tone_keywords: [],
};

interface Props {
  userId: string;
}

export const BrandKitPanel: React.FC<Props> = ({ userId }) => {
  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_BRAND_KIT);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [newColor, setNewColor] = useState("#6366f1");
  const [newKeyword, setNewKeyword] = useState("");

  // Load existing brand kit
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data, error } = await supabase
        .from("brand_kits" as any)
        .select("*")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      if (data && !error) {
        const row = data as any;
        setBrandKit({
          id: row.id,
          colors: Array.isArray(row.colors) ? row.colors : [],
          aesthetic: row.aesthetic || "minimalist",
          target_audience: row.target_audience || "",
          tone_keywords: Array.isArray(row.tone_keywords) ? row.tone_keywords : [],
          logo_url: row.logo_url,
        });
      }
      setIsLoading(false);
    })();
  }, [userId]);

  const saveBrandKit = useCallback(async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const payload = {
        user_id: userId,
        colors: brandKit.colors,
        aesthetic: brandKit.aesthetic,
        target_audience: brandKit.target_audience,
        tone_keywords: brandKit.tone_keywords,
        logo_url: brandKit.logo_url || null,
      };

      if (brandKit.id) {
        const { error } = await supabase
          .from("brand_kits" as any)
          .update(payload)
          .eq("id", brandKit.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("brand_kits" as any)
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        setBrandKit((prev) => ({ ...prev, id: (data as any).id }));
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      toast.success("Brand kit saved! All future images will use your brand identity.");
    } catch (err: any) {
      console.error("Brand kit save error:", err);
      toast.error("Failed to save brand kit");
    } finally {
      setIsSaving(false);
    }
  }, [userId, brandKit]);

  const addColor = () => {
    if (brandKit.colors.length >= 6) {
      toast.error("Maximum 6 brand colors");
      return;
    }
    if (brandKit.colors.includes(newColor)) return;
    setBrandKit((prev) => ({ ...prev, colors: [...prev.colors, newColor] }));
  };

  const removeColor = (color: string) => {
    setBrandKit((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== color) }));
  };

  const addKeyword = () => {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw || brandKit.tone_keywords.includes(kw)) return;
    if (brandKit.tone_keywords.length >= 10) {
      toast.error("Maximum 10 tone keywords");
      return;
    }
    setBrandKit((prev) => ({ ...prev, tone_keywords: [...prev.tone_keywords, kw] }));
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    setBrandKit((prev) => ({ ...prev, tone_keywords: prev.tone_keywords.filter((k) => k !== kw) }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const selectedPreset = AESTHETIC_PRESETS.find((p) => p.value === brandKit.aesthetic);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          Brand Identity Kit
        </CardTitle>
        <CardDescription>
          Define your brand's visual identity. AI-generated images will automatically reflect your brand colors, style, and audience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Brand Colors */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Brand Colors</Label>
          <div className="flex flex-wrap items-center gap-2">
            {brandKit.colors.map((color) => (
              <div
                key={color}
                className="group relative h-8 w-8 rounded-full border-2 border-background shadow-sm cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                onClick={() => removeColor(color)}
                title={`${color} — click to remove`}
              >
                <X className="h-3 w-3 absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
              </div>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border-0 p-0"
              />
              <Button size="sm" variant="ghost" onClick={addColor} className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Up to 6 colors. Click a swatch to remove it.</p>
        </div>

        {/* Aesthetic Preset */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Aesthetic Preset</Label>
          <Select
            value={brandKit.aesthetic}
            onValueChange={(v) => setBrandKit((prev) => ({ ...prev, aesthetic: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AESTHETIC_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <span className="font-medium">{p.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPreset && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {selectedPreset.description}
            </p>
          )}
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Target Audience</Label>
          <Textarea
            placeholder="e.g., Young professionals aged 25-35, tech-savvy, value premium quality and sustainability..."
            value={brandKit.target_audience}
            onChange={(e) => setBrandKit((prev) => ({ ...prev, target_audience: e.target.value }))}
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Tone Keywords */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tone & Style Keywords</Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {brandKit.tone_keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => removeKeyword(kw)}>
                {kw}
                <X className="h-2.5 w-2.5" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., premium, eco-friendly, bold..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={addKeyword} disabled={!newKeyword.trim()}>
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={saveBrandKit} disabled={isSaving} className="w-full">
          {isSaving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : isSaved ? (
            <><Check className="h-4 w-4 mr-2" /> Saved!</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Save Brand Kit</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Export helper to fetch brand kit for image generation
export async function fetchBrandKit(userId: string): Promise<BrandKit | null> {
  const { data, error } = await supabase
    .from("brand_kits" as any)
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as any;
  return {
    id: row.id,
    colors: Array.isArray(row.colors) ? row.colors : [],
    aesthetic: row.aesthetic || "minimalist",
    target_audience: row.target_audience || "",
    tone_keywords: Array.isArray(row.tone_keywords) ? row.tone_keywords : [],
    logo_url: row.logo_url,
  };
}
