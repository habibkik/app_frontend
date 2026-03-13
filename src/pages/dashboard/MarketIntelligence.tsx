import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Loader2, Sparkles, Search, ImageIcon, Play } from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketSearch } from "@/components/market/MarketSearch";
import { AnalysisSummaryCard } from "@/components/market/AnalysisSummaryCard";
import { TrendAnalysisCard } from "@/components/market/TrendAnalysisCard";
import { CompetitorAnalysisCard } from "@/components/market/CompetitorAnalysisCard";
import { PricingAnalysisCard } from "@/components/market/PricingAnalysisCard";
import { AnalysisHistory } from "@/components/market/AnalysisHistory";
import { ImageMarketAnalysis } from "@/components/seller/ImageMarketAnalysis";
import { UniversalImageUpload } from "@/components/shared/UniversalImageUpload";
import { useAnalysisStore, type CompetitorInfo } from "@/stores/analysisStore";
import { useToast } from "@/hooks/use-toast";
import { analyzeForSelling } from "@/features/agents/miromind/api";
import { DEMO_MARKET_RESULT } from "@/data/demoMarketData";
import {
  analyzeMarket,
  saveAnalysisToHistory,
  MarketAnalysisRequest,
  MarketAnalysisResult,
} from "@/lib/market-intel-service";

export default function MarketIntelligencePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    sellerResults, 
    currentImage, 
    setSellerResults, 
    setAnalyzing, 
    setAnalysisProgress,
    clearResults,
    isAnalyzing: storeIsAnalyzing,
  } = useAnalysisStore();

  const [activeTab, setActiveTab] = useState<string>(sellerResults ? "ai-image" : "ai-image");
  const [isAnalyzing, setIsAnalyzingLocal] = useState(false);
  const [currentResult, setCurrentResult] = useState<MarketAnalysisResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [historyRefresh, setHistoryRefresh] = useState(0);

  // Handle image analysis completion
  const handleImageAnalysisComplete = async () => {
    if (!currentImage) return;
    
    try {
      setAnalyzing(true);
      
      // Simulate progress
      const steps = [
        "Identifying product...",
        "Scanning market data...",
        "Finding competitors...",
        "Analyzing pricing...",
        "Generating insights...",
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setAnalysisProgress((i / steps.length) * 100, steps[i]);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      
      // Call the API
      const result = await analyzeForSelling({
        imageBase64: currentImage,
        mimeType: "image/jpeg",
      });
      
      setSellerResults(result);
      setAnalysisProgress(100, "Complete!");
      
      toast({
        title: t("pages.marketIntelligence.marketAnalysisComplete"),
        description: t("pages.marketIntelligence.analysisCompetitors", { count: result.competitors.length }),
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: t("pages.marketIntelligence.analysisFailed"),
        description: t("pages.marketIntelligence.analysisFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle text-based market analysis
  const handleTextAnalyze = async (request: MarketAnalysisRequest) => {
    setIsAnalyzingLocal(true);
    setCurrentQuery(request.query);

    try {
      const result = await analyzeMarket(request);
      setCurrentResult(result);

      if (result.success) {
        saveAnalysisToHistory(request.query, request.type, result);
        setHistoryRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzingLocal(false);
    }
  };

  // Handle new image analysis
  const handleNewAnalysis = () => {
    clearResults("seller");
  };

  // Handle competitor view
  const handleViewCompetitor = (competitor: CompetitorInfo) => {
    toast({
      title: competitor.name,
      description: `Market share: ${competitor.marketShare}. Price range: $${competitor.priceRange.min}-$${competitor.priceRange.max}`,
    });
  };

  const handleLoadFromHistory = (result: MarketAnalysisResult, query: string) => {
    setCurrentResult(result);
    setCurrentQuery(query);
    setActiveTab("text-search");
  };

  // Load demo data
  const handleLoadDemo = () => {
    setSellerResults(DEMO_MARKET_RESULT);
    toast({
      title: t("pages.marketIntelligence.demoDataLoaded"),
      description: t("pages.marketIntelligence.demoDataLoadedDesc"),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Market Intelligence</h1>
              <p className="text-muted-foreground">
                AI-powered market analysis and competitive insights
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs for Image vs Text Analysis */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ai-image" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Image Analysis
              {sellerResults && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  Results
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="text-search" className="gap-2">
              <Search className="h-4 w-4" />
              Text Search
            </TabsTrigger>
          </TabsList>

          {/* Image Analysis Tab */}
          <TabsContent value="ai-image" className="mt-6">
            <AnimatePresence mode="wait">
              {sellerResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ImageMarketAnalysis
                    result={sellerResults}
                    imagePreview={currentImage ? `data:image/jpeg;base64,${currentImage}` : undefined}
                    onViewCompetitor={handleViewCompetitor}
                    onNewAnalysis={handleNewAnalysis}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="text-center mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Analyze Market from Image
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Upload a product image to get instant competitor analysis, 
                      pricing recommendations, and market demand signals.
                    </p>
                  </div>
                  <UniversalImageUpload 
                    onAnalysisComplete={handleImageAnalysisComplete}
                  />
                  
                  {/* Demo Button */}
                  <div className="mt-8 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or explore with sample data
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleLoadDemo}
                      className="mt-4 gap-2"
                    >
                      <Play className="h-4 w-4" />
                      View Demo Analysis
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Text Search Tab */}
          <TabsContent value="text-search" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Search & Results */}
              <div className="lg:col-span-2 space-y-6">
                {/* Search */}
                <MarketSearch onAnalyze={handleTextAnalyze} isAnalyzing={isAnalyzing} />

                {/* Loading State */}
                <AnimatePresence>
                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card>
                        <CardContent className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p className="font-medium">Analyzing "{currentQuery}"</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Gathering market data and generating insights...
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                  {currentResult && !isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      {/* Summary - Always shown */}
                      <AnalysisSummaryCard result={currentResult} />

                      {/* Trends */}
                      {currentResult.trends && currentResult.trends.length > 0 && (
                        <TrendAnalysisCard trends={currentResult.trends} />
                      )}

                      {/* Competitors */}
                      {currentResult.competitors && currentResult.competitors.length > 0 && (
                        <CompetitorAnalysisCard competitors={currentResult.competitors} />
                      )}

                      {/* Pricing */}
                      {currentResult.pricing && (
                        <PricingAnalysisCard pricing={currentResult.pricing} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty State */}
                {!currentResult && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card>
                      <CardContent className="py-16">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            Start Your Market Analysis
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Enter a product, industry, or market to get AI-powered insights
                            including competitor analysis, market trends, and pricing recommendations.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Right Column - History */}
              <div>
                <AnalysisHistory
                  onLoadAnalysis={handleLoadFromHistory}
                  refreshTrigger={historyRefresh}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
