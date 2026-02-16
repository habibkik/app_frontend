/**
 * Competitor Display Component
 * Shows competitors identified from image analysis with business profile
 */
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Star, ExternalLink, MapPin, Mail, Phone, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BusinessProfileCard } from "@/components/shared/BusinessProfileCard";
import { cn } from "@/lib/utils";
import type { CompetitorInfo } from "@/stores/analysisStore";

interface CompetitorDisplayProps {
  competitors: CompetitorInfo[];
  onViewCompetitor?: (competitor: CompetitorInfo) => void;
}

export function CompetitorDisplay({ competitors, onViewCompetitor }: CompetitorDisplayProps) {
  const { t } = useTranslation();

  if (competitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t("competitorDisplay.noCompetitorsFound")}</h3>
          <p className="text-muted-foreground text-sm">{t("competitorDisplay.uploadToAnalyze")}</p>
        </CardContent>
      </Card>
    );
  }

  const totalShare = competitors.reduce((sum, c) => sum + (parseFloat(c.marketShare) || 0), 0);

  const getGoogleMapsUrl = (competitor: CompetitorInfo) => {
    if (competitor.geoLocation) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(competitor.geoLocation.formattedAddress)}`;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            {t("competitorDisplay.competitiveLandscape")}
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {competitors.length} {t("marketInsights.competitors")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {competitors.map((competitor, index) => {
          const shareValue = parseFloat(competitor.marketShare) || 0;
          const sharePercent = totalShare > 0 ? (shareValue / totalShare) * 100 : 0;
          const mapsUrl = getGoogleMapsUrl(competitor);
          
          return (
            <motion.div
              key={competitor.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn("p-4 rounded-xl border border-border bg-card", "hover:border-primary/30 hover:shadow-sm transition-all duration-200")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-500">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{competitor.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {competitor.marketShare} {t("competitorDisplay.marketShare")}
                        </p>
                        {competitor.geoLocation && mapsUrl && (
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                            <MapPin className="h-3 w-3" />
                            {competitor.geoLocation.city}, {competitor.geoLocation.country}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {competitor.contact && (
                    <div className="flex items-center gap-2 mb-3">
                      {competitor.contact.email && <a href={`mailto:${competitor.contact.email}`} className="text-muted-foreground hover:text-primary transition-colors" title={competitor.contact.email}><Mail className="h-4 w-4" /></a>}
                      {competitor.contact.phone && <a href={`tel:${competitor.contact.phone}`} className="text-muted-foreground hover:text-primary transition-colors" title={competitor.contact.phone}><Phone className="h-4 w-4" /></a>}
                      {competitor.contact.website && <a href={competitor.contact.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title={competitor.contact.website}><Globe className="h-4 w-4" /></a>}
                    </div>
                  )}

                  <div className="mb-3"><Progress value={sharePercent} className="h-2" /></div>

                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">${competitor.priceRange.min} - ${competitor.priceRange.max}</span>
                  </div>

                  {competitor.businessProfile && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {competitor.businessProfile.yearEstablished && <Badge variant="outline" className="text-xs">Est. {competitor.businessProfile.yearEstablished}</Badge>}
                      {competitor.businessProfile.companySize && <Badge variant="outline" className="text-xs">{competitor.businessProfile.companySize} {t("supplierDetail.employees")}</Badge>}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {competitor.strengths.slice(0, 3).map((strength) => (
                      <Badge key={strength} variant="outline" className="text-xs"><Star className="h-3 w-3 mr-1 text-amber-500" />{strength}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onViewCompetitor?.(competitor)}><ExternalLink className="h-4 w-4" /></Button>
              </div>

              {(competitor.geoLocation || competitor.contact || competitor.businessProfile) && (
                <div className="mt-4">
                  <BusinessProfileCard name={competitor.name} geoLocation={competitor.geoLocation} contact={competitor.contact} businessProfile={competitor.businessProfile} />
                </div>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
