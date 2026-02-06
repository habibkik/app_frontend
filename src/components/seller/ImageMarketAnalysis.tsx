/**
 * Image Market Analysis Component
 * Main results view for Seller mode image analysis
 */
import { motion } from "framer-motion";
import { 
  Sparkles,
  Tag,
  ImageIcon,
  FileText,
  Flame,
  Repeat2,
} from "lucide-react";

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

  // Convert to format needed for content generation
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
      {/* Header with Product Info */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image Preview Card */}
        {imagePreview && (
          <Card className="lg:w-72 flex-shrink-0">
            <CardContent className="p-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                <img
                  src={imagePreview}
                  alt="Analyzed product"
                  className="w-full h-full object-contain"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onNewAnalysis}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Analyze New Product
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Product Identification */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Market Position
              </CardTitle>
              <Badge variant="secondary">
                {confidence}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Product Name & Category */}
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {productIdentification.name}
                </h3>
                <p className="text-muted-foreground">
                  {productIdentification.category}
                </p>
              </div>

              {/* Attributes */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Product Attributes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(productIdentification.attributes).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">
                    {competitors.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Competitors</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">
                    ${marketPriceRange.average}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Price</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground capitalize">
                    {demandIndicators.trend}
                  </p>
                  <p className="text-xs text-muted-foreground">Trend</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
          <TabsTrigger value="substitutes">Substitutes</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Market Analysis Tab */}
        <TabsContent value="analysis" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DemandIndicators demand={demandIndicators} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CompetitorDisplay
              competitors={competitors}
              onViewCompetitor={onViewCompetitor}
            />
          </motion.div>
        </TabsContent>

        {/* Heat Map Tab */}
        <TabsContent value="heatmap" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MarketHeatMap regions={marketHeatMap || []} />
          </motion.div>
        </TabsContent>

        {/* Substitutes Tab */}
        <TabsContent value="substitutes" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SubstituteCompetitors 
              competitors={substituteCompetitors || []}
              onViewCompetitor={onViewSubstituteCompetitor}
            />
          </motion.div>
        </TabsContent>
        {/* Pricing Tab */}
        <TabsContent value="pricing" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PricingRecommendation
              pricing={pricingRecommendation}
              marketRange={marketPriceRange}
            />
          </motion.div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ContentGenerationPanel
              productName={productForContent.productName}
              productCategory={productForContent.productCategory}
              components={productForContent.components}
            />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
