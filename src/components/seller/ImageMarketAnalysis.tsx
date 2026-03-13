/**
 * Image Market Analysis Component
 * Main results view for Seller mode image analysis
 */
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, Tag, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitorDisplay } from "./CompetitorDisplay";
import { PricingRecommendation } from "./PricingRecommendation";
import { DemandIndicators } from "./DemandIndicators";
import { MarketHeatMap } from "./MarketHeatMap";
import { SubstituteCompetitors } from "./SubstituteCompetitors";
import { ContentGenerationPanel } from "@/components/bom/ContentGenerationPanel";
import type { MarketAnalysisResult, CompetitorInfo, SubstituteCompetitor } from "@/stores/analysisStore";

interface ImageMarketAnalysisProps {
  result: MarketAnalysisResult;
  imagePreview?: string;
  onViewCompetitor?: (competitor: CompetitorInfo) => void;
  onViewSubstituteCompetitor?: (competitor: SubstituteCompetitor) => void;
  onNewAnalysis?: () => void;
}

export function ImageMarketAnalysis({ 
  result,
  imagePreview,
  onViewCompetitor,
  onViewSubstituteCompetitor,
  onNewAnalysis,
}: ImageMarketAnalysisProps) {
  const { t } = useTranslation();
  const { 
    productIdentification, 
    competitors, 
    substituteCompetitors,
    marketHeatMap,
    marketPriceRange, 
    pricingRecommendation, 
    demandIndicators, 
    confidence 
  } = result;

  const productForContent = {
    productName: productIdentification.name,
    productCategory: productIdentification.category,
    components: Object.entries(productIdentification.attributes).map(([key, value]) => ({
      name: key,
      material: value,
      category: "Attribute",
      quantity: 1,
      unit: "piece",
      estimatedUnitCost: 0,
      specifications: value,
      confidence: confidence,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {imagePreview && (
          <Card className="lg:w-72 flex-shrink-0">
            <CardContent className="p-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                <img src={imagePreview} alt="Analyzed product" className="w-full h-full object-contain" />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={onNewAnalysis}>
                <ImageIcon className="h-4 w-4 mr-2" />
                {t("buyerDiscovery.analyzeNewImage")}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t("marketInsights.title")}
              </CardTitle>
              <Badge variant="secondary">{t("buyerDiscovery.confidence", { value: confidence })}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{productIdentification.name}</h3>
                <p className="text-muted-foreground">{productIdentification.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">{t("buyerDiscovery.detectedSpecifications")}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(productIdentification.attributes).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />{key}: {value}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{competitors.length}</p>
                  <p className="text-xs text-muted-foreground">{t("marketInsights.competitors")}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">${marketPriceRange.average}</p>
                  <p className="text-xs text-muted-foreground">{t("marketInsights.medianPrice")}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground capitalize">{demandIndicators.trend}</p>
                  <p className="text-xs text-muted-foreground">{t("demandIndicators.trend")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="analysis">{t("marketInsights.insights")}</TabsTrigger>
          <TabsTrigger value="heatmap">{t("nav.heatMap")}</TabsTrigger>
          <TabsTrigger value="substitutes">{t("market.competitorAnalysis")}</TabsTrigger>
          <TabsTrigger value="pricing">{t("pricingStrategy.title")}</TabsTrigger>
          <TabsTrigger value="content">{t("contentStudio.title")}</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <DemandIndicators demand={demandIndicators} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <CompetitorDisplay competitors={competitors} onViewCompetitor={onViewCompetitor} />
          </motion.div>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MarketHeatMap regions={marketHeatMap || []} />
          </motion.div>
        </TabsContent>

        <TabsContent value="substitutes" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SubstituteCompetitors competitors={substituteCompetitors || []} onViewCompetitor={onViewSubstituteCompetitor} />
          </motion.div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PricingRecommendation pricing={pricingRecommendation} marketRange={marketPriceRange} />
          </motion.div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ContentGenerationPanel productName={productForContent.productName} productCategory={productForContent.productCategory} components={productForContent.components} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
