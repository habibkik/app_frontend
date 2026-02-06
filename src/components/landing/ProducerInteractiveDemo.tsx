/**
 * Interactive Producer Demo
 * Let visitors try AI BOM analysis without signing up
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
  ArrowRight,
  Camera,
  Package,
  Bot,
  FileSpreadsheet,
  Calculator,
  Truck,
  Layers,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Users,
  Repeat2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface BOMComponent {
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  suppliers: number;
}

interface ProducerDemoResult {
  product: {
    name: string;
    category: string;
    complexity: "Low" | "Medium" | "High";
  };
  components: BOMComponent[];
  costSummary: {
    materialCost: number;
    laborCost: number;
    overhead: number;
    totalCost: number;
    suggestedPrice: number;
    margin: number;
  };
  suppliers: {
    total: number;
    verified: number;
  };
  feasibility: {
    score: number;
    risks: string[];
    leadTime: string;
  };
  competition: Array<{
    name: string;
    product: string;
    price: number;
    marketShare: string;
  }>;
  substituteProducers: Array<{
    name: string;
    product: string;
    advantage: string;
  }>;
  confidence: number;
}

// Mock analysis function for demo purposes
const simulateAnalysis = async (): Promise<ProducerDemoResult> => {
  await new Promise(resolve => setTimeout(resolve, 2800));
  
  return {
    product: {
      name: "Smart LED Desk Lamp",
      category: "Consumer Electronics",
      complexity: "Medium",
    },
    components: [
      { name: "LED Module", category: "Electronics", quantity: 1, unitCost: 12.50, suppliers: 45 },
      { name: "Touch Controller IC", category: "Electronics", quantity: 1, unitCost: 3.20, suppliers: 28 },
      { name: "Aluminum Housing", category: "Structural", quantity: 1, unitCost: 8.75, suppliers: 62 },
      { name: "USB-C Power Circuit", category: "Electronics", quantity: 1, unitCost: 4.50, suppliers: 35 },
      { name: "Flexible Arm Mechanism", category: "Mechanical", quantity: 1, unitCost: 6.80, suppliers: 18 },
    ],
    costSummary: {
      materialCost: 35.75,
      laborCost: 8.50,
      overhead: 4.25,
      totalCost: 48.50,
      suggestedPrice: 79.99,
      margin: 39,
    },
    suppliers: {
      total: 188,
      verified: 67,
    },
    feasibility: {
      score: 87,
      risks: ["LED chip supply volatility", "Holiday season demand spike"],
      leadTime: "4-6 weeks",
    },
    competition: [
      { name: "LightTech Industries", product: "Premium LED Lamp", price: 89.99, marketShare: "28%" },
      { name: "BrightHome Co", product: "Smart Desk Light", price: 69.99, marketShare: "22%" },
    ],
    substituteProducers: [
      { name: "GlowMaster", product: "OLED Desk Lamp", advantage: "Better color accuracy" },
      { name: "SunBeam Tech", product: "Natural Light Lamp", advantage: "Lower power consumption" },
    ],
    confidence: 92,
  };
};

export function ProducerInteractiveDemo() {
  const { toast } = useToast();
  const fc = useFormatCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [result, setResult] = useState<ProducerDemoResult | null>(null);

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
      "Detecting components...",
      "Estimating costs...",
      "Finding suppliers...",
      "Assessing feasibility...",
    ];

    let stepIndex = 0;
    setAnalysisStep(steps[0]);
    
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setAnalysisProgress((stepIndex / steps.length) * 80);
        setAnalysisStep(steps[stepIndex]);
      }
    }, 550);

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
    <section className="py-20 bg-gradient-to-b from-amber-500/5 to-background" id="demo">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <Bot className="h-3 w-3 mr-1" />
            Try It Now - No Signup Required
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See AI BOM Analysis in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload any product image and watch AI generate a complete Bill of Materials 
            with cost estimates and supplier options.
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
              <Card className="h-full border-amber-500/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-amber-600" />
                    Upload Product Image
                  </h3>

                  {!imagePreview ? (
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
                        dragActive
                          ? "border-amber-500 bg-amber-500/5 scale-[1.02]"
                          : "border-border hover:border-amber-500/50 hover:bg-muted/30"
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
                        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="h-8 w-8 text-amber-600" />
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
                            <Loader2 className="h-10 w-10 animate-spin text-amber-600 mb-3" />
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
                        className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                        size="lg"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating BOM...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate Bill of Materials
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
              <Card className="h-full border-amber-500/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-amber-600" />
                    AI BOM Analysis
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
                          Upload an image to generate BOM
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          Components, costs, and suppliers in seconds
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
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Layers className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-foreground">Product Identified</span>
                            <Badge variant="secondary" className="ml-auto text-xs bg-amber-500/10 text-amber-600">
                              {result.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="font-semibold text-foreground">{result.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.product.category} • {result.product.complexity} complexity
                          </p>
                        </div>

                        {/* Components Summary */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium text-foreground">
                                Components ({result.components.length})
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {result.components.slice(0, 4).map((component, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                              >
                                <span className="text-foreground">{component.name}</span>
                                <span className="text-muted-foreground">{fc(component.unitCost)}</span>
                              </div>
                            ))}
                            {result.components.length > 4 && (
                              <p className="text-xs text-muted-foreground text-center py-1">
                                +{result.components.length - 4} more components
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Cost Summary */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Total Cost</span>
                            </div>
                            <p className="font-semibold text-foreground">${result.costSummary.totalCost}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Suggested Price</span>
                            </div>
                            <p className="font-semibold text-foreground">${result.costSummary.suggestedPrice}</p>
                          </div>
                        </div>

                        {/* Suppliers & Feasibility */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Truck className="h-4 w-4 text-amber-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {result.suppliers.total} Suppliers Found
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.suppliers.verified} verified • {result.feasibility.leadTime} lead time
                            </p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={result.feasibility.score >= 80 
                              ? "bg-primary/10 text-primary" 
                              : "bg-amber-500/10 text-amber-600"
                            }
                          >
                            {result.feasibility.score}% feasible
                          </Badge>
                        </div>

                        {/* Risks */}
                        {result.feasibility.risks.length > 0 && (
                          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Risks: </span>
                              {result.feasibility.risks.join(", ")}
                            </p>
                          </div>
                        )}

                        {/* Competition Preview */}
                        {result.competition && result.competition.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium text-foreground">
                                Competition ({result.competition.length})
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {result.competition.slice(0, 2).map((comp, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                                >
                                  <div>
                                    <span className="text-foreground font-medium">{comp.name}</span>
                                    <p className="text-xs text-muted-foreground">{comp.product}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {comp.marketShare}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Substitute Producers */}
                        {result.substituteProducers && result.substituteProducers.length > 0 && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <Repeat2 className="h-4 w-4 text-amber-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {result.substituteProducers.length} Substitute Producers
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {result.substituteProducers[0]?.name}: {result.substituteProducers[0]?.advantage}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <Button asChild className="w-full gap-2 bg-amber-600 hover:bg-amber-700" size="lg">
                          <Link to="/signup">
                            Get Full BOM Report
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
