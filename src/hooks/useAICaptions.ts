import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/useToast";

export interface PlatformCaption {
  platform: string;
  caption: string;
  characterCount: number;
}

export interface CaptionGenerationResult {
  captions: PlatformCaption[];
  universalCaption: string;
}

export interface CaptionGenerationOptions {
  topic: string;
  platforms: string[];
  tone?: "professional" | "casual" | "playful" | "inspirational";
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

export function useAICaptions() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<CaptionGenerationResult | null>(null);

  const generateCaptions = useCallback(async (options: CaptionGenerationOptions): Promise<CaptionGenerationResult | null> => {
    setIsGenerating(true);
    setSuggestions(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: options,
      });

      if (error) {
        throw new Error(error.message || "Failed to generate captions");
      }

      if (!data.success) {
        throw new Error(data.error || "Caption generation failed");
      }

      const result: CaptionGenerationResult = {
        captions: data.captions,
        universalCaption: data.universalCaption,
      };

      setSuggestions(result);
      return result;
    } catch (error) {
      console.error("Caption generation error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to generate captions";
      
      if (errorMessage.includes("Rate limit")) {
        toast({
          variant: "destructive",
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment and try again.",
        });
      } else if (errorMessage.includes("credits")) {
        toast({
          variant: "destructive",
          title: "Credits Exhausted",
          description: "AI credits are exhausted. Please add credits to continue.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: errorMessage,
        });
      }
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions(null);
  }, []);

  return {
    isGenerating,
    suggestions,
    generateCaptions,
    clearSuggestions,
  };
}
