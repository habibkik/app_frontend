/**
 * Universal Image Upload Component
 * Mode-aware image upload that serves as the entry point for all dashboard modes
 * Runs actual analysis and stores results before navigating
 */
import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Loader2,
  Sparkles,
  Search,
  Package,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDashboardMode } from "@/features/dashboard";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useToast } from "@/hooks/use-toast";
import { 
  analyzeProductImage, 
  analyzeForSourcing, 
  analyzeForSelling 
} from "@/features/agents/miromind/api";

interface ModeConfig {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  buttonText: string;
  processingSteps: string[];
  accentColor: string;
}

import { useTranslation } from "react-i18next";

interface UniversalImageUploadProps {
  onAnalysisComplete?: () => void;
  compact?: boolean;
}

export function UniversalImageUpload({ 
  onAnalysisComplete,
  compact = false,
}: UniversalImageUploadProps) {
  const { t } = useTranslation();
  const { mode } = useDashboardMode();
  
  const modeConfigs: Record<string, ModeConfig> = {
    buyer: {
      icon: Search,
      title: t("imageUpload.buyerTitle"),
      subtitle: t("imageUpload.buyerSubtitle"),
      buttonText: t("buyer", "Buyer"),
      processingSteps: [
        t("imageUpload.identifyingProduct"),
        t("imageUpload.analyzingSpecs"),
        t("imageUpload.matchingSuppliers"),
        t("imageUpload.comparingPrices"),
        t("imageUpload.findingAlternatives"),
      ],
      accentColor: "text-blue-500",
    },
    producer: {
      icon: Package,
      title: t("imageUpload.producerTitle"),
      subtitle: t("imageUpload.producerSubtitle"),
      buttonText: t("imageUpload.producerButton"),
      processingSteps: [
        t("imageUpload.scanningStructure"),
        t("imageUpload.identifyingComponents"),
        t("imageUpload.analyzingMaterials"),
        t("imageUpload.estimatingCosts"),
        t("imageUpload.generatingBOM"),
      ],
      accentColor: "text-amber-500",
    },
    seller: {
      icon: TrendingUp,
      title: t("imageUpload.sellerTitle"),
      subtitle: t("imageUpload.sellerSubtitle"),
      buttonText: t("imageUpload.sellerButton"),
      processingSteps: [
        t("imageUpload.identifyingProduct"),
        t("imageUpload.scanningMarket"),
        t("imageUpload.findingCompetitors"),
        t("imageUpload.analyzingPricing"),
        t("imageUpload.generatingInsights"),
      ],
      accentColor: "text-emerald-500",
    },
  };

  const config = modeConfigs[mode];
  const ModeIcon = config.icon;
  const { toast } = useToast();
  
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    currentImage,
    isAnalyzing,
    analysisProgress,
    analysisStep,
    setCurrentImage,
    setAnalyzing,
    setAnalysisProgress,
    clearCurrentImage,
    setBuyerResults,
    setProducerResults,
    setSellerResults,
  } = useAnalysisStore();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreviewUrl(base64);
      setFileName(file.name);
      // Store just the base64 data (without data URL prefix)
      const base64Data = base64.split(",")[1];
      setCurrentImage(base64Data, file.name);
    };
    reader.readAsDataURL(file);
  }, [setCurrentImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleCameraCapture = () => {
    // For mobile: trigger file input with camera
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setFileName(null);
    setProductDescription("");
    clearCurrentImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!currentImage) return;
    
    setAnalyzing(true);
    
    try {
      // Show progress updates
      const steps = config.processingSteps;
      let currentStep = 0;
      
      const progressInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          setAnalysisProgress((currentStep / steps.length) * 80, steps[currentStep]);
        }
      }, 700);

      setAnalysisProgress(10, steps[0]);
      
      // Call the appropriate API based on mode
      const request = {
        imageBase64: currentImage,
        mimeType: "image/jpeg",
        additionalContext: productDescription.trim() || undefined,
      };

      let analysisSuccessful = false;
      
      switch (mode) {
        case "buyer": {
          const result = await analyzeForSourcing(request);
          setBuyerResults(result);
          analysisSuccessful = true;
          toast({
            title: t("imageUpload.analysisComplete"),
            description: t("imageUpload.foundSuppliers", { 
              count: result.suggestedSuppliers.length,
              name: result.productIdentification.name 
            }),
          });
          break;
        }
        case "producer": {
          const result = await analyzeProductImage(request);
          if (result.success) {
            setProducerResults({
              ...result,
              totalEstimatedCost: result.components.reduce(
                (sum, c) => sum + c.estimatedUnitCost * c.quantity, 
                0
              ),
            });
            analysisSuccessful = true;
            toast({
              title: t("imageUpload.bomComplete"),
              description: t("imageUpload.identifiedComponents", { 
                count: result.components.length,
                name: result.productName 
              }),
            });
          }
          break;
        }
        case "seller": {
          const result = await analyzeForSelling(request);
          setSellerResults(result);
          analysisSuccessful = true;
          toast({
            title: t("imageUpload.marketComplete"),
            description: t("imageUpload.foundCompetitors", { count: result.competitors.length }),
          });
          break;
        }
      }

      clearInterval(progressInterval);
      
      if (analysisSuccessful) {
        setAnalysisProgress(100, t("imageUpload.complete"));
        await new Promise((resolve) => setTimeout(resolve, 500));
        onAnalysisComplete?.();
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: t("imageUpload.analysisFailed"),
        description: t("imageUpload.errorAnalyzing"),
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className={cn("w-full", compact ? "max-w-md" : "max-w-2xl mx-auto")}>
      <AnimatePresence mode="wait">
        {!previewUrl ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "relative border-2 border-dashed rounded-2xl transition-all duration-300",
              dragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-muted/30",
              compact ? "p-6" : "p-8 md:p-12"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center justify-center text-center pointer-events-none">
              {/* Mode Icon */}
              <motion.div 
                className={cn(
                  "rounded-2xl flex items-center justify-center mb-6",
                  compact ? "h-16 w-16" : "h-20 w-20",
                  "bg-gradient-to-br from-primary/20 to-primary/5 mb-4"
                )}
                animate={{ 
                  scale: dragActive ? 1.1 : 1,
                  rotate: dragActive ? 5 : 0,
                }}
              >
                <ModeIcon className={cn(
                  config.accentColor,
                  compact ? "h-8 w-8" : "h-10 w-10"
                )} />
              </motion.div>
              
              {/* Upload Actions */}
              <div className="flex items-center gap-3 pointer-events-auto">
                <Button
                  size={compact ? "default" : "lg"}
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {t("common.upload")}
                </Button>
                <Button
                  variant="outline"
                  size={compact ? "default" : "lg"}
                  className="gap-2"
                  onClick={handleCameraCapture}
                >
                  <Camera className="h-4 w-4" />
                  {t("imageUpload.camera", "Camera")}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                {t("imageUpload.supportsFormats")}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-muted/50 border border-border">
              <img
                src={previewUrl}
                alt="Product preview"
                className={cn(
                  "w-full object-contain",
                  compact ? "max-h-48" : "max-h-72 md:max-h-96"
                )}
              />
              
              {/* Overlay during analysis */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
                  >
                    <div className="relative">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">
                      {analysisStep}
                    </p>
                    <div className="w-48 mt-3">
                      <Progress value={analysisProgress} className="h-2" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Remove button */}
              {!isAnalyzing && (
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background border border-border transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {/* Product Description */}
            {!isAnalyzing && (
              <Textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder={t("imageUpload.descriptionPlaceholder", "Describe your product to improve results (e.g., material, size, specifications, intended use...)")}
                className="resize-none text-sm"
                rows={2}
              />
            )}

            {/* File info & Actions */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("upload", "Upload")}
                  </p>
                </div>
              </div>
              
              <Button
                size={compact ? "default" : "lg"}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="gap-2 flex-shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("imageUpload.processing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {config.buttonText}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
