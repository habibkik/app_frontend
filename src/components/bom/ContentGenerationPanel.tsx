import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Share2,
  Megaphone,
  Wrench,
  Loader2,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generateProductContent,
  type IdentifiedComponent,
  type ContentGenerationResult,
} from "@/features/agents/miromind";
import { cn } from "@/lib/utils";

interface ContentGenerationPanelProps {
  productName: string;
  productCategory?: string;
  components: Array<{
    name: string;
    category: string;
    material?: string;
    specifications?: string;
  }>;
  attributes?: Record<string, string>;
}

type ContentType = "description" | "social" | "ad" | "technical";
type ToneType = "professional" | "casual" | "technical" | "marketing";

const contentTypeConfig = {
  description: {
    label: "Product Description",
    icon: FileText,
    description: "Detailed product description for listings",
  },
  social: {
    label: "Social Media",
    icon: Share2,
    description: "Engaging posts for social platforms",
  },
  ad: {
    label: "Ad Copy",
    icon: Megaphone,
    description: "Persuasive advertising content",
  },
  technical: {
    label: "Technical Specs",
    icon: Wrench,
    description: "Detailed technical documentation",
  },
};

const toneOptions: { value: ToneType; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "technical", label: "Technical" },
  { value: "marketing", label: "Marketing" },
];

export function ContentGenerationPanel({
  productName,
  productCategory = "General",
  components,
  attributes = {},
}: ContentGenerationPanelProps) {
  const [activeTab, setActiveTab] = useState<ContentType>("description");
  const [tone, setTone] = useState<ToneType>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<ContentType, string>>({
    description: "",
    social: "",
    ad: "",
    technical: "",
  });
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (contentType: ContentType) => {
    setIsGenerating(true);

    try {
      // Map components to the expected format
      const mappedComponents: IdentifiedComponent[] = components.map((c) => ({
        name: c.name,
        category: c.category,
        quantity: 1,
        unit: "piece",
        estimatedUnitCost: 0,
        specifications: c.specifications || "",
        material: c.material || "",
        confidence: 100,
      }));

      const result = await generateProductContent({
        productName,
        productCategory,
        components: mappedComponents,
        attributes,
        contentType,
        tone,
      });

      if (result.success) {
        setGeneratedContent((prev) => ({
          ...prev,
          [contentType]: result.content,
        }));
      }
    } catch (error) {
      console.error("Content generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const content = generatedContent[activeTab];
    if (!content) return;

    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentContent = generatedContent[activeTab];
  const hasContent = !!currentContent;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Content Generation
          <Badge variant="secondary" className="ml-2">
            MiroMind
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Context */}
        <div className="p-3 rounded-lg bg-muted/50 text-sm">
          <p className="font-medium text-foreground">{productName}</p>
          <p className="text-muted-foreground text-xs mt-1">
            {components.length} components • {productCategory}
          </p>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tone:</span>
          <Select value={tone} onValueChange={(v) => setTone(v as ToneType)}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content Type Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)}>
          <TabsList className="grid w-full grid-cols-4">
            {(Object.keys(contentTypeConfig) as ContentType[]).map((type) => {
              const config = contentTypeConfig[type];
              const Icon = config.icon;
              return (
                <TabsTrigger key={type} value={type} className="text-xs px-2">
                  <Icon className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">{config.label.split(" ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(Object.keys(contentTypeConfig) as ContentType[]).map((type) => (
            <TabsContent key={type} value={type} className="space-y-3 mt-4">
              <p className="text-xs text-muted-foreground">
                {contentTypeConfig[type].description}
              </p>

              <AnimatePresence mode="wait">
                {generatedContent[type] ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Textarea
                      value={generatedContent[type]}
                      onChange={(e) =>
                        setGeneratedContent((prev) => ({
                          ...prev,
                          [type]: e.target.value,
                        }))
                      }
                      className="min-h-[120px] resize-none text-sm"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {generatedContent[type].split(/\s+/).length} words
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerate(type)}
                          disabled={isGenerating}
                        >
                          <RefreshCw
                            className={cn("h-3 w-3 mr-1", isGenerating && "animate-spin")}
                          />
                          Regenerate
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          {copied ? (
                            <Check className="h-3 w-3 mr-1 text-primary" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      {(() => {
                        const Icon = contentTypeConfig[type].icon;
                        return <Icon className="h-6 w-6 text-muted-foreground" />;
                      })()}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate {contentTypeConfig[type].label.toLowerCase()} for your product
                    </p>
                    <Button
                      onClick={() => handleGenerate(type)}
                      disabled={isGenerating}
                      size="sm"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>Generate {contentTypeConfig[type].label}</>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>

        {/* Demo Mode Notice */}
        {!import.meta.env.VITE_MIROMIND_API_ENDPOINT && (
          <p className="text-xs text-muted-foreground text-center">
            Demo mode: Using simulated content generation
          </p>
        )}
      </CardContent>
    </Card>
  );
}
