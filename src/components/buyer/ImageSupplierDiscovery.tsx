/**
 * Image Supplier Discovery Component
 * Main results view for Buyer mode image analysis
 */
import { motion } from "framer-motion";
import { 
  Package,
  DollarSign,
  Tag,
  Sparkles,
  ArrowLeft,
  ImageIcon,
  Truck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplierMatchResults } from "./SupplierMatchResults";
import { SubstituteProducts } from "./SubstituteProducts";
import { SubstituteSuppliers } from "./SubstituteSuppliers";
import { DeliverySummary } from "./DeliveryEstimates";
import type { SupplierDiscoveryResult, SupplierMatch, SubstituteSupplier } from "@/stores/analysisStore";

interface ImageSupplierDiscoveryProps {
  result: SupplierDiscoveryResult;
  imagePreview?: string;
  onContactSupplier?: (supplier: SupplierMatch) => void;
  onViewSupplierDetails?: (supplier: SupplierMatch) => void;
  onContactSubstituteSupplier?: (supplier: SubstituteSupplier) => void;
  onNewAnalysis?: () => void;
}

export function ImageSupplierDiscovery({ 
  result,
  imagePreview,
  onContactSupplier,
  onViewSupplierDetails,
  onContactSubstituteSupplier,
  onNewAnalysis,
}: ImageSupplierDiscoveryProps) {
  const { 
    productIdentification, 
    suggestedSuppliers, 
    substitutes, 
    substituteSuppliers,
    estimatedMarketPrice, 
    confidence 
  } = result;

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
                Analyze New Image
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
                Product Identified
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

              {/* Specifications */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Detected Specifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(productIdentification.specifications).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Market Price Estimate */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Market Price</p>
                  <p className="text-lg font-bold text-foreground">
                    ${estimatedMarketPrice.min} - ${estimatedMarketPrice.max}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      per unit
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Results */}
      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="substitutes">Substitute Suppliers</TabsTrigger>
          <TabsTrigger value="products">Alternative Products</TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="mt-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SupplierMatchResults
              suppliers={suggestedSuppliers}
              onContactSupplier={onContactSupplier}
              onViewDetails={onViewSupplierDetails}
            />
          </motion.div>
          
          {/* Delivery summary for each supplier */}
          {suggestedSuppliers.some(s => s.deliveryEstimates?.length) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-5 w-5 text-primary" />
                  Delivery Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedSuppliers.filter(s => s.deliveryEstimates?.length).map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">{supplier.name}</span>
                    <DeliverySummary estimates={supplier.deliveryEstimates} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Substitute Suppliers Tab */}
        <TabsContent value="substitutes" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SubstituteSuppliers
              suppliers={substituteSuppliers || []}
              onContactSupplier={onContactSubstituteSupplier}
            />
          </motion.div>
        </TabsContent>

        {/* Alternative Products Tab */}
        <TabsContent value="products" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SubstituteProducts substitutes={substitutes} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
