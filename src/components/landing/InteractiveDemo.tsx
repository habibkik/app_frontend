/**
 * Interactive Demo Section
 * Let visitors try AI image analysis without signing up
 */
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Upload,
  ImageIcon,
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
  MapPin,
  Clock,
  DollarSign,
  TrendingDown,
  ArrowRight,
  Camera,
  Package,
  ShieldCheck,
  Repeat2,
  Bot,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DemoAnalysisResult {
  product: {
    name: string;
    category: string;
    specifications: Record<string, string>;
  };
  suppliers: Array<{
    id: string;
    name: string;
    matchScore: number;
    priceRange: { min: number; max: number };
    moq: number;
    leadTime: string;
    location: string;
    verified: boolean;
  }>;
  substitutes: Array<{
    name: string;
    similarity: number;
    priceAdvantage: string;
    suppliers: Array<{
      name: string;
      price: number;
      location: string;
    }>;
  }>;
  substituteSuppliers: Array<{
    name: string;
    product: string;
    price: number;
    savings: string;
  }>;
  deliveryEstimates: Array<{
    supplier: string;
    method: string;
    cost: number;
    days: string;
  }>;
  estimatedPrice: { min: number; max: number };
  confidence: number;
}

export function InteractiveDemo() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [result, setResult] = useState<DemoAnalysisResult | null>(null);

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
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const clearImage = () => {
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep("Uploading image...");

    const steps = [
      "Identifying product...",
      "Analyzing specifications...",
      "Searching global suppliers...",
      "Finding alternatives...",
      "Generating insights...",
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setAnalysisProgress((stepIndex / steps.length) * 80);
        setAnalysisStep(steps[stepIndex]);
      }
    }, 700);

    try {
      const base64Data = imagePreview.split(",")[1];

      const { data, error } = await supabase.functions.invoke('product-supplier-analysis', {
        body: { imageBase64: base64Data, mimeType: 'image/jpeg' },
      });

      clearInterval(progressInterval);

      if (error) throw new Error(error.message);

      if (data?.success && data?.data) {
        const enrichedData = {
          ...data.data,
          substituteSuppliers: data.data.substituteSuppliers || [
            { name: "AlternaTech", product: "Compatible Component", price: 42, savings: "15%" },
            { name: "ValueParts Co", product: "Generic Alternative", price: 38, savings: "22%" },
          ],
          deliveryEstimates: data.data.deliveryEstimates || [
            { supplier: "Top Supplier", method: "Express", cost: 45, days: "3-5 days" },
            { supplier: "Top Supplier", method: "Standard", cost: 25, days: "7-10 days" },
          ],
        };
        setResult(enrichedData);
        setAnalysisProgress(100);
        setAnalysisStep("Complete!");
      } else {
        throw new Error(data?.error || "Analysis failed");
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="py-28 bg-column" id="demo">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="column-pill mb-4">
            <Bot className="h-3 w-3" />
            Try It Now - No Signup Required
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-column-navy mb-4 tracking-tight mt-4">
            See AI in Action
          </h2>
          <p className="text-xl text-column-body max-w-2xl mx-auto">
            Upload any product image and watch our AI instantly find suppliers,
            compare prices, and suggest alternatives.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="column-card h-full">
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-column-navy mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-column-navy" />
                    </div>
                    Upload Product Image
                  </h3>

                  {!imagePreview ? (
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer ${
                        dragActive
                          ? "border-column-teal bg-column-teal/5 scale-[1.02]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <div className="text-center">
                        <div className="h-16 w-16 rounded-xl border border-gray-200 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="h-8 w-8 text-column-navy" />
                        </div>
                        <p className="text-column-navy font-medium mb-2">
                          Drop your product image here
                        </p>
                        <p className="text-sm text-column-muted mb-4">
                          or click to browse (JPG, PNG up to 5MB)
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-column-muted">
                          <span className="flex items-center gap-1">
                            <Camera className="h-3.5 w-3.5" />
                            Camera
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            Any Product
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-xl overflow-hidden bg-gray-50 aspect-video">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-full object-contain"
                        />
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-column-teal mb-3" />
                            <p className="text-sm font-medium text-column-navy">{analysisStep}</p>
                            <div className="w-40 mt-2">
                              <Progress value={analysisProgress} className="h-2" />
                            </div>
                          </div>
                        )}
                        {!isAnalyzing && (
                          <button
                            onClick={clearImage}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 transition-colors"
                          >
                            <X className="h-4 w-4 text-column-body" />
                          </button>
                        )}
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full gap-2 bg-column-teal hover:brightness-110 text-white"
                        size="lg"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="column-card h-full">
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-column-navy mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-column-navy" />
                    </div>
                    AI Analysis Results
                  </h3>

                  <AnimatePresence mode="wait">
                    {!result ? (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <div className="h-16 w-16 rounded-xl border border-gray-200 flex items-center justify-center mb-4">
                          <Bot className="h-8 w-8 text-column-muted" />
                        </div>
                        <p className="text-column-body mb-2">
                          Upload an image to see AI analysis
                        </p>
                        <p className="text-sm text-column-muted">
                          Suppliers, pricing, and alternatives in seconds
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {/* Product Identified */}
                        <div className="p-4 rounded-xl bg-column-teal/5 border border-column-teal/20">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-column-teal" />
                            <span className="text-sm font-medium text-column-navy">Product Identified</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {result.confidence}% match
                            </Badge>
                          </div>
                          <p className="font-semibold text-column-navy">{result.product.name}</p>
                          <p className="text-sm text-column-body">{result.product.category}</p>
                        </div>

                        {/* Price Range */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <div className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-column-navy" />
                          </div>
                          <div>
                            <p className="text-xs text-column-muted">Market Price</p>
                            <p className="font-semibold text-column-navy">
                              ${result.estimatedPrice.min} - ${result.estimatedPrice.max}/unit
                            </p>
                          </div>
                        </div>

                        {/* Top Suppliers */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="h-4 w-4 text-column-navy" />
                            <span className="text-sm font-medium text-column-navy">
                              Top Suppliers ({result.suppliers?.length || 0} found)
                            </span>
                          </div>
                          <div className="space-y-2">
                            {result.suppliers?.slice(0, 2).map((supplier) => (
                              <div
                                key={supplier.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <span className="text-xs font-bold text-column-navy">
                                      {supplier.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-column-navy flex items-center gap-1">
                                      {supplier.name}
                                      {supplier.verified && (
                                        <CheckCircle2 className="h-3 w-3 text-column-teal" />
                                      )}
                                    </p>
                                    <p className="text-xs text-column-muted flex items-center gap-2">
                                      <MapPin className="h-3 w-3" />
                                      {supplier.location}
                                      <Clock className="h-3 w-3 ml-1" />
                                      {supplier.leadTime}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {supplier.matchScore}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Substitutes Preview */}
                        {result.substitutes && result.substitutes.length > 0 && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200/50">
                            <Repeat2 className="h-4 w-4 text-amber-600" />
                            <div>
                              <p className="text-sm font-medium text-column-navy">
                                {result.substitutes.length} Alternatives Found
                              </p>
                              <p className="text-xs text-column-muted">
                                {result.substitutes[0]?.priceAdvantage} potential savings
                              </p>
                            </div>
                            <TrendingDown className="h-4 w-4 text-column-navy ml-auto" />
                          </div>
                        )}

                        {/* Substitute Suppliers */}
                        {result.substituteSuppliers && result.substituteSuppliers.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-4 w-4 text-column-navy" />
                              <span className="text-sm font-medium text-column-navy">
                                Substitute Suppliers
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {result.substituteSuppliers.slice(0, 2).map((sub, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm"
                                >
                                  <div>
                                    <span className="text-column-navy font-medium">{sub.name}</span>
                                    <p className="text-xs text-column-muted">{sub.product}</p>
                                  </div>
                                  <Badge variant="secondary" className="text-xs bg-column-teal/10 text-column-teal">
                                    {sub.savings} savings
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Estimates */}
                        {result.deliveryEstimates && result.deliveryEstimates.length > 0 && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                            <Truck className="h-4 w-4 text-column-navy" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-column-navy">
                                Delivery Estimates
                              </p>
                              <p className="text-xs text-column-muted">
                                From ${result.deliveryEstimates[0]?.cost} • {result.deliveryEstimates[0]?.days}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <Button asChild className="w-full gap-2 bg-column-navy hover:brightness-125 text-white" size="lg">
                          <Link to="/signup">
                            Get Full Access
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        <p className="text-xs text-center text-column-muted">
                          Free 14-day trial • No credit card required
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
