/**
 * Supplier Match Results Component
 * Displays AI-matched suppliers from image analysis with business profile info
 */
import { motion } from "framer-motion";
import { 
  Star, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Package,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BusinessProfileCard } from "@/components/shared/BusinessProfileCard";
import { cn } from "@/lib/utils";
import type { SupplierMatch } from "@/stores/analysisStore";

interface SupplierMatchResultsProps {
  suppliers: SupplierMatch[];
  onContactSupplier?: (supplier: SupplierMatch) => void;
  onViewDetails?: (supplier: SupplierMatch) => void;
}

export function SupplierMatchResults({ 
  suppliers, 
  onContactSupplier,
  onViewDetails,
}: SupplierMatchResultsProps) {
  const { t } = useTranslation();

  if (suppliers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t("buyerDiscovery.noSuppliersMatched")}</h3>
          <p className="text-muted-foreground text-sm">
            {t("buyerDiscovery.uploadToFind")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getGoogleMapsUrl = (supplier: SupplierMatch) => {
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
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t("buyerDiscovery.aiMatchedSuppliers")}
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {t("buyerDiscovery.matchesFound", { count: suppliers.length })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suppliers.map((supplier, index) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative p-4 rounded-xl border border-border bg-card",
              "hover:border-primary/30 hover:shadow-md transition-all duration-200",
              index === 0 && "ring-2 ring-primary/20 border-primary/30"
            )}
          >
            {index === 0 && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-primary text-primary-foreground text-xs">
                  {t("buyerDiscovery.bestMatch")}
                </Badge>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {supplier.name.charAt(0)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {supplier.name}
                      </h4>
                      {supplier.verified && (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <a 
                        href={getGoogleMapsUrl(supplier)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {supplier.geoLocation 
                          ? `${supplier.geoLocation.city}, ${supplier.geoLocation.country}`
                          : supplier.location}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {supplier.leadTime}
                      </span>
                    </div>

                    {supplier.contact && (
                      <div className="flex items-center gap-2 mt-2">
                        {supplier.contact.email && (
                          <a href={`mailto:${supplier.contact.email}`} className="text-muted-foreground hover:text-primary transition-colors" title={supplier.contact.email}>
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {supplier.contact.phone && (
                          <a href={`tel:${supplier.contact.phone}`} className="text-muted-foreground hover:text-primary transition-colors" title={supplier.contact.phone}>
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        {supplier.contact.website && (
                          <a href={supplier.contact.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title={supplier.contact.website}>
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{t("buyerDiscovery.matchScore")}</span>
                    <span className="font-medium text-foreground">{supplier.matchScore}%</span>
                  </div>
                  <Progress value={supplier.matchScore} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    MOQ: {supplier.moq} {t("bomComponents.units")}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ${supplier.priceRange.min} - ${supplier.priceRange.max}/{t("buyerDiscovery.perUnit")}
                  </Badge>
                  {supplier.businessProfile?.yearEstablished && (
                    <Badge variant="outline" className="text-xs">
                      Est. {supplier.businessProfile.yearEstablished}
                    </Badge>
                  )}
                  {supplier.businessProfile?.companySize && (
                    <Badge variant="outline" className="text-xs">
                      {supplier.businessProfile.companySize} {t("settings.company.employees")}
                    </Badge>
                  )}
                </div>

                {supplier.businessProfile?.certifications && supplier.businessProfile.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {supplier.businessProfile.certifications.slice(0, 4).map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs">{cert}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col gap-2 sm:w-32">
                <Button size="sm" className="flex-1 sm:w-full" onClick={() => onContactSupplier?.(supplier)}>
                  {t("buyerDiscovery.contact")}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:w-full" onClick={() => onViewDetails?.(supplier)}>
                  {t("common.details")}
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>

            {(supplier.geoLocation || supplier.contact || supplier.businessProfile) && (
              <div className="mt-4">
                <BusinessProfileCard
                  name={supplier.name}
                  geoLocation={supplier.geoLocation}
                  contact={supplier.contact}
                  businessProfile={supplier.businessProfile}
                />
              </div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
