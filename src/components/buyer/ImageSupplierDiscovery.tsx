/**
 * Image Supplier Discovery Component
 * Main results view for Buyer mode image analysis
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, DollarSign, Tag, Sparkles, ArrowLeft, ImageIcon, Truck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplierMatchResults } from "./SupplierMatchResults";
import { SubstituteProducts } from "./SubstituteProducts";
import { SubstituteSuppliers } from "./SubstituteSuppliers";
import { DeliverySummary } from "./DeliveryEstimates";
import { BuyerSupplierDetailModal } from "./BuyerSupplierDetailModal";
import type { SupplierDiscoveryResult, SupplierMatch, SubstituteSupplier } from "@/stores/analysisStore";

interface ImageSupplierDiscoveryProps {
  result: SupplierDiscoveryResult;
  imagePreview?: string;
  onContactSupplier?: (supplier: SupplierMatch) => void;
  onSaveSupplier?: (supplier: SupplierMatch) => void;
  onContactSubstituteSupplier?: (supplier: SubstituteSupplier) => void;
  onNewAnalysis?: () => void;
}

export function ImageSupplierDiscovery({ 
  result, imagePreview, onContactSupplier, onSaveSupplier, onContactSubstituteSupplier, onNewAnalysis,
}: ImageSupplierDiscoveryProps) {
  const { t } = useTranslation();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierMatch | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { productIdentification, suggestedSuppliers, substitutes, substituteSuppliers, estimatedMarketPrice, confidence } = result;

  const handleViewSupplierDetails = (supplier: SupplierMatch) => {
    setSelectedSupplier(supplier);
    setIsDetailModalOpen(true);
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
                {t("buyerDiscovery.productIdentified")}
              </CardTitle>
              <Badge variant="secondary">
                {t("buyerDiscovery.confidence", { value: confidence })}
              </Badge>
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
                  {Object.entries(productIdentification.specifications).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("buyerDiscovery.estimatedMarketPrice")}</p>
                  <p className="text-lg font-bold text-foreground">
                    ${estimatedMarketPrice.min} - ${estimatedMarketPrice.max}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{t("buyerDiscovery.perUnit")}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="suppliers">{t("buyerDiscovery.suppliers")}</TabsTrigger>
          <TabsTrigger value="substitutes">{t("buyerDiscovery.substituteSuppliers")}</TabsTrigger>
          <TabsTrigger value="products">{t("buyerDiscovery.alternativeProducts")}</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="mt-6 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SupplierMatchResults suppliers={suggestedSuppliers} onContactSupplier={onContactSupplier} onViewDetails={handleViewSupplierDetails} />
          </motion.div>
          
          {suggestedSuppliers.some(s => s.deliveryEstimates?.length) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-5 w-5 text-primary" />
                  {t("buyerDiscovery.deliveryCostSummary")}
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

        <TabsContent value="substitutes" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SubstituteSuppliers suppliers={substituteSuppliers || []} onContactSupplier={onContactSubstituteSupplier} />
          </motion.div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SubstituteProducts substitutes={substitutes} />
          </motion.div>
        </TabsContent>
      </Tabs>

      <BuyerSupplierDetailModal supplier={selectedSupplier} open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen} onContact={onContactSupplier} onSave={onSaveSupplier} />
    </div>
  );
}
