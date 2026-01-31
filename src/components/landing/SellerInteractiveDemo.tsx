/**
 * Interactive Seller Demo
 * Let visitors try AI market analysis without signing up
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ArrowRight,
  Camera,
  Package,
  Bot,
  BarChart3,
  Target,
  Eye,
  Map,
  Repeat2,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface SellerDemoResult {
  product: {
    name: string;
    category: string;
    targetSegment: string;
  };
  competitors: Array<{
    type: string;
    priceRange: { min: number; max: number };
    positioning: string;
    marketShare: string;
  }>;
  pricing: {
    suggestedPrice: number;
    marginScenarios: Array<{
      margin: string;
      price: number;
      competitiveness: string;
    }>;
  };
  demand: {
    trend: "rising" | "stable" | "declining";
    seasonality: string;
    searchVolume: string;
  };
  heatMap: Array<{
    region: string;
    demand: "high" | "medium" | "low";
    growth: string;
  }>;
  substituteCompetitors: Array<{
    name: string;
    product: string;
    threat: "high" | "medium" | "low";
  }>;
  confidence: number;
}

// Mock analysis function for demo purposes
const simulateAnalysis = async (): Promise<SellerDemoResult> => {
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  return {
    product: {
      name: "Wireless Bluetooth Earbuds",
      category: "Consumer Electronics",
      targetSegment: "Tech-savvy millennials",
    },
    competitors: [
      { type: "Premium Brands", priceRange: { min: 149, max: 299 }, positioning: "Premium", marketShare: "35%" },
      { type: "Mid-Range", priceRange: { min: 49, max: 99 }, positioning: "Value", marketShare: "45%" },
      { type: "Budget", priceRange: { min: 15, max: 35 }, positioning: "Economy", marketShare: "20%" },
    ],
    pricing: {
      suggestedPrice: 79,
      marginScenarios: [
        { margin: "Low (15%)", price: 59, competitiveness: "High" },
        { margin: "Medium (30%)", price: 79, competitiveness: "Optimal" },
        { margin: "High (45%)", price: 99, competitiveness: "Moderate" },
      ],
    },
    demand: {
      trend: "rising",
      seasonality: "Peak in Q4 (holiday season)",
      searchVolume: "450K monthly",
    },
    heatMap: [
      { region: "North America", demand: "high", growth: "+15%" },
      { region: "Europe", demand: "medium", growth: "+8%" },
      { region: "Asia Pacific", demand: "high", growth: "+22%" },
    ],
    substituteCompetitors: [
      { name: "SoundPods Pro", product: "Noise-cancelling TWS", threat: "high" },
      { name: "AudioMax Elite", product: "Sport earbuds", threat: "medium" },
    ],
    confidence: 94,
  };
};

export function SellerInteractiveDemo() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [result, setResult] = useState<SellerDemoResult | null>(null);

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
    
    const steps = [
      "Identifying product...",
      "Analyzing competitors...",
      "Calculating optimal pricing...",
      "Assessing market demand...",
      "Generating insights...",
    ];

    let stepIndex = 0;
    setAnalysisStep(steps[0]);
    
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setAnalysisProgress((stepIndex / steps.length) * 80);
        setAnalysisStep(steps[stepIndex]);
      }
    }, 500);

    try {
      const analysisResult = await simulateAnalysis();
      clearInterval(progressInterval);
      setResult(analysisResult);
      setAnalysisProgress(100);
      setAnalysisStep("Complete!");
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Analysis Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-emerald-500/5 to-background" id="demo">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <Bot className="h-3 w-3 mr-1" />
            Try It Now - No Signup Required
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See Market Intelligence in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload any product image and watch AI analyze competitors, 
            calculate optimal pricing, and assess market demand.
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
              <Card className="h-full border-emerald-500/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-emerald-600" />
                    Upload Your Product
                  </h3>

                  {!imagePreview ? (
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
                        dragActive
                          ? "border-emerald-500 bg-emerald-500/5 scale-[1.02]"
                          : "border-border hover:border-emerald-500/50 hover:bg-muted/30"
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
                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="h-8 w-8 text-emerald-600" />
                        </div>
                        <p className="text-foreground font-medium mb-2">
                          Drop your product image here
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          or click to browse
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
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
                      <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-full object-contain"
                        />
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-3" />
                            <p className="text-sm font-medium text-foreground">{analysisStep}</p>
                            <div className="w-40 mt-2">
                              <Progress value={analysisProgress} className="h-2" />
                            </div>
                          </div>
                        )}
                        {!isAnalyzing && (
                          <button
                            onClick={clearImage}
                            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background border border-border transition-colors"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                        size="lg"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing Market...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Analyze Market Position
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-emerald-500/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    Market Intelligence
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
                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                          <Bot className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-2">
                          Upload an image to see market analysis
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          Competitors, pricing, and demand in seconds
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
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium text-foreground">Product Identified</span>
                            <Badge variant="secondary" className="ml-auto text-xs bg-emerald-500/10 text-emerald-600">
                              {result.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="font-semibold text-foreground">{result.product.name}</p>
                          <p className="text-sm text-muted-foreground">{result.product.targetSegment}</p>
                        </div>

                        {/* Optimal Pricing */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">AI-Optimized Price</p>
                            <p className="font-semibold text-foreground text-lg">
                              ${result.pricing.suggestedPrice}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                            Optimal
                          </Badge>
                        </div>

                        {/* Competitors */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium text-foreground">
                              Competitor Landscape
                            </span>
                          </div>
                          <div className="space-y-2">
                            {result.competitors.map((competitor, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                              >
                                <div>
                                  <p className="text-sm font-medium text-foreground">{competitor.type}</p>
                                  <p className="text-xs text-muted-foreground">
                                    ${competitor.priceRange.min} - ${competitor.priceRange.max}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {competitor.marketShare}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Demand Trend */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          {result.demand.trend === "rising" ? (
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                          ) : result.demand.trend === "declining" ? (
                            <TrendingDown className="h-5 w-5 text-destructive" />
                          ) : (
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground capitalize">
                              {result.demand.trend} Demand
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.demand.searchVolume} searches • {result.demand.seasonality}
                            </p>
                          </div>
                        </div>

                        {/* Heat Map Preview */}
                        {result.heatMap && result.heatMap.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Map className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-medium text-foreground">
                                Regional Heat Map
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {result.heatMap.map((region, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg text-center text-xs ${
                                    region.demand === "high"
                                      ? "bg-destructive/10 border border-destructive/30"
                                      : region.demand === "medium"
                                      ? "bg-amber-500/10 border border-amber-500/30"
                                      : "bg-primary/10 border border-primary/30"
                                  }`}
                                >
                                  <p className="font-medium text-foreground truncate">{region.region}</p>
                                  <p className="text-primary">{region.growth}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Substitute Competitors */}
                        {result.substituteCompetitors && result.substituteCompetitors.length > 0 && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <Repeat2 className="h-4 w-4 text-amber-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {result.substituteCompetitors.length} Substitute Threats
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {result.substituteCompetitors[0]?.name} selling {result.substituteCompetitors[0]?.product}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600">
                              {result.substituteCompetitors[0]?.threat} threat
                            </Badge>
                          </div>
                        )}

                        {/* CTA */}
                        <Button asChild className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" size="lg">
                          <Link to="/signup">
                            Get Full Analysis
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
