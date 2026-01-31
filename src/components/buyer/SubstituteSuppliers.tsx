/**
 * Substitute Suppliers Component
 * Shows suppliers of alternative/substitute products for buyers with location data
 */
import { motion } from "framer-motion";
import { 
  Repeat2, 
  MapPin, 
  Clock, 
  Truck,
  DollarSign,
  ArrowRight,
  TrendingDown,
  ExternalLink,
  Mail,
  Globe,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { SubstituteSupplier, DeliveryEstimate } from "@/stores/analysisStore";

interface SubstituteSuppliersProps {
  suppliers: SubstituteSupplier[];
  onContactSupplier?: (supplier: SubstituteSupplier) => void;
}

function DeliveryEstimatesList({ estimates }: { estimates?: DeliveryEstimate[] }) {
  if (!estimates || estimates.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <Truck className="h-3.5 w-3.5" />
        Delivery Estimates
      </p>
      <div className="grid gap-2">
        {estimates.map((est, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50"
          >
            <div>
              <span className="font-medium">{est.method}</span>
              {est.carrier && (
                <span className="text-muted-foreground ml-2">({est.carrier})</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{est.days}</span>
              <Badge variant="secondary" className="text-xs">
                ${est.cost}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubstituteSuppliers({ 
  suppliers,
  onContactSupplier,
}: SubstituteSuppliersProps) {
  if (!suppliers || suppliers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Repeat2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Substitute Suppliers</h3>
          <p className="text-muted-foreground text-sm">
            Upload a product image to find alternative suppliers
          </p>
        </CardContent>
      </Card>
    );
  }

  const getGoogleMapsUrl = (supplier: SubstituteSupplier) => {
    if (supplier.geoLocation) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        supplier.geoLocation.formattedAddress
      )}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.location)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Repeat2 className="h-5 w-5 text-amber-500" />
            Substitute Product Suppliers
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {suppliers.length} alternatives
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Suppliers offering similar alternative products with potential cost savings
        </p>

        <Accordion type="single" collapsible className="space-y-3">
          {suppliers.map((supplier, index) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AccordionItem 
                value={supplier.id}
                className={cn(
                  "border rounded-xl px-4 bg-card",
                  "hover:border-primary/30 transition-colors"
                )}
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left flex-1">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-amber-600">
                        {supplier.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{supplier.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        Offers: {supplier.substituteProduct}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-emerald-500/10 text-emerald-600 border-0 mr-2"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {supplier.priceAdvantage}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3">
                    {/* Similarity */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Similarity to Original</span>
                        <span className="font-medium">{supplier.similarity}%</span>
                      </div>
                      <Progress value={supplier.similarity} className="h-2" />
                    </div>

                    {/* Details with map link */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <a 
                        href={getGoogleMapsUrl(supplier)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {supplier.geoLocation 
                            ? `${supplier.geoLocation.city}, ${supplier.geoLocation.country}`
                            : supplier.location}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.leadTime}</span>
                      </div>
                    </div>

                    {/* Quick Contact */}
                    {supplier.contact && (
                      <div className="flex items-center gap-2">
                        {supplier.contact.email && (
                          <a 
                            href={`mailto:${supplier.contact.email}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title={supplier.contact.email}
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {supplier.contact.website && (
                          <a 
                            href={supplier.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title={supplier.contact.website}
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Delivery Estimates */}
                    <DeliveryEstimatesList estimates={supplier.deliveryEstimates} />

                    {/* Actions */}
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => onContactSupplier?.(supplier)}
                    >
                      Contact Supplier
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
