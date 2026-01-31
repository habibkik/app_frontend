import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAICaptions, type CaptionGenerationResult } from "@/hooks/useAICaptions";

interface AISuggestionsPanelProps {
  selectedPlatforms: string[];
  onSelectCaption: (caption: string) => void;
}

const PLATFORM_ICONS: Record<string, string> = {
  twitter: "𝕏",
  facebook: "f",
  linkedin: "in",
  instagram: "📷",
  tiktok: "♪",
};

export function AISuggestionsPanel({ 
  selectedPlatforms, 
  onSelectCaption 
}: AISuggestionsPanelProps) {
  const { isGenerating, suggestions, generateCaptions, clearSuggestions } = useAICaptions();
  
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "playful" | "inspirational">("casual");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : ["twitter"];
    
    await generateCaptions({
      topic: topic.trim(),
      platforms,
      tone,
      includeHashtags,
      includeEmojis,
    });
  };

  const handleCopy = (caption: string, index: number) => {
    navigator.clipboard.writeText(caption);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleUse = (caption: string) => {
    onSelectCaption(caption);
    clearSuggestions();
    setTopic("");
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">AI Caption Suggestions</span>
      </div>

      {/* Topic Input */}
      <div className="flex gap-2">
        <Input
          placeholder="What's your post about? (e.g., product launch, sale, tips)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          className="flex-1"
        />
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          size="sm"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Advanced Options */}
      <Collapsible open={showOptions} onOpenChange={setShowOptions}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span className="text-xs text-muted-foreground">Advanced options</span>
            {showOptions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="hashtags" className="text-xs">Include hashtags</Label>
            <Switch 
              id="hashtags" 
              checked={includeHashtags} 
              onCheckedChange={setIncludeHashtags}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="emojis" className="text-xs">Include emojis</Label>
            <Switch 
              id="emojis" 
              checked={includeEmojis} 
              onCheckedChange={setIncludeEmojis}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Suggestions Display */}
      <AnimatePresence mode="wait">
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-6 text-muted-foreground"
          >
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Generating captions...</span>
          </motion.div>
        )}

        {suggestions && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Universal Caption */}
            <div className="p-3 bg-background rounded-md border">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  Universal
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(suggestions.universalCaption, -1)}
                  >
                    {copiedIndex === -1 ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleUse(suggestions.universalCaption)}
                  >
                    Use
                  </Button>
                </div>
              </div>
              <p className="text-sm">{suggestions.universalCaption}</p>
            </div>

            {/* Platform-Specific Captions */}
            {suggestions.captions.map((caption, index) => (
              <div key={caption.platform} className="p-3 bg-background rounded-md border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {PLATFORM_ICONS[caption.platform.toLowerCase()] || "📱"}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {caption.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {caption.characterCount} chars
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(caption.caption, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3 text-primary" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => handleUse(caption.caption)}
                    >
                      Use
                    </Button>
                  </div>
                </div>
                <p className="text-sm">{caption.caption}</p>
              </div>
            ))}

            {/* Regenerate Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Generate More
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
