import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Percent,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  analyzeProductImage, 
  fileToBase64, 
  AnalysisResult, 
  AnalyzedComponent 
} from "@/lib/ai-analysis-service";
import { cn } from "@/lib/utils";

interface AIAnalysisPanelProps {
  onAnalysisComplete: (components: AnalyzedComponent[], productName: string) => void;
}

type AnalysisStatus = "idle" | "uploading" | "analyzing" | "complete" | "error";

export function AIAnalysisPanel({ onAnalysisComplete }: AIAnalysisPanelProps) {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalContext, setAdditionalContext] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setStatus("idle");
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setStatus("uploading");
    setError(null);
    setAnalysisProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 30) {
            clearInterval(progressInterval);
            return 30;
          }
          return prev + 5;
        });
      }, 100);

      const base64 = await fileToBase64(selectedImage);
      clearInterval(progressInterval);
      
      setStatus("analyzing");
      
      // Simulate analysis progress
      const analysisInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 95) {
            clearInterval(analysisInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 300);

      const analysisResult = await analyzeProductImage({
        imageBase64: base64,
        mimeType: selectedImage.type,
        additionalContext: additionalContext.trim() || undefined,
      });

      clearInterval(analysisInterval);
      setAnalysisProgress(100);

      if (analysisResult.success) {
        setResult(analysisResult);
        setStatus("complete");
      } else {
        setError(analysisResult.error || "Analysis failed");
        setStatus("error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStatus("error");
    }
  };

  const handleApplyResults = () => {
    if (result) {
      onAnalysisComplete(result.components, result.productName);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setStatus("idle");
    setResult(null);
    setError(null);
    setAdditionalContext("");
    setAnalysisProgress(0);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Vision Analysis
          <Badge variant="secondary" className="ml-2">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Upload Area */}
        <div className="space-y-3">
          {!imagePreview ? (
            <label className="block">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Upload product image for analysis
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full h-48 object-contain rounded-lg bg-muted"
              />
              {status === "idle" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleReset}
                >
                  Change
                </Button>
              )}
            </motion.div>
          )}

          {/* Additional Context */}
          {imagePreview && status === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Textarea
                placeholder="Add context about the product (optional)... e.g., 'Consumer electronics device, handheld gaming console'"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </motion.div>
          )}
        </div>

        {/* Analysis Progress */}
        <AnimatePresence mode="wait">
          {(status === "uploading" || status === "analyzing") && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  {status === "uploading" ? "Uploading image..." : "Analyzing components..."}
                </span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                AI is identifying components, materials, and specifications
              </p>
            </motion.div>
          )}

          {status === "complete" && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Success Stats */}
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Analysis Complete</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{result.components.length}</p>
                  <p className="text-xs text-muted-foreground">Components</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Percent className="h-4 w-4" />
                    <p className="text-2xl font-bold">{result.overallConfidence}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    <p className="text-2xl font-bold">
                      {(result.processingTime / 1000).toFixed(1)}s
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
              </div>

              {/* Component Preview */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <p className="text-sm font-medium">Identified Components:</p>
                {result.components.slice(0, 5).map((comp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-2 rounded bg-muted/30"
                  >
                    <span className="text-sm truncate flex-1">{comp.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {comp.confidence}%
                    </Badge>
                  </motion.div>
                ))}
                {result.components.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{result.components.length - 5} more components
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleApplyResults} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply to BOM
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Analysis Failed</span>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={handleReset}>
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze Button */}
        {imagePreview && status === "idle" && (
          <Button onClick={handleAnalyze} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Product Image
          </Button>
        )}

        {/* API Info */}
        {!import.meta.env.VITE_MIROMIND_API_ENDPOINT && (
          <p className="text-xs text-muted-foreground text-center">
            Demo mode: Using simulated MiroMind analysis
          </p>
        )}
      </CardContent>
    </Card>
  );
}
