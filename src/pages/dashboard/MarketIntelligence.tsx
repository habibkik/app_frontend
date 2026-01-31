import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { MarketSearch } from "@/components/market/MarketSearch";
import { AnalysisSummaryCard } from "@/components/market/AnalysisSummaryCard";
import { TrendAnalysisCard } from "@/components/market/TrendAnalysisCard";
import { CompetitorAnalysisCard } from "@/components/market/CompetitorAnalysisCard";
import { PricingAnalysisCard } from "@/components/market/PricingAnalysisCard";
import { AnalysisHistory } from "@/components/market/AnalysisHistory";
import {
  analyzeMarket,
  saveAnalysisToHistory,
  MarketAnalysisRequest,
  MarketAnalysisResult,
} from "@/lib/market-intel-service";

export default function MarketIntelligencePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<MarketAnalysisResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleAnalyze = async (request: MarketAnalysisRequest) => {
    setIsAnalyzing(true);
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
      setIsAnalyzing(false);
    }
  };

  const handleLoadFromHistory = (result: MarketAnalysisResult, query: string) => {
    setCurrentResult(result);
    setCurrentQuery(query);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Market Intelligence</h1>
            <p className="text-muted-foreground">
              AI-powered market analysis and competitive insights
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Search & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <MarketSearch onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

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
      </div>
    </DashboardLayout>
  );
}
