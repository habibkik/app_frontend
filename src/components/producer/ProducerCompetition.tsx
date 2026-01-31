/**
 * Producer Competition Component
 * Shows competing manufacturers/producers with full business profile and location data
 */
import { motion } from "framer-motion";
import { 
  Factory, 
  MapPin, 
  Clock, 
  DollarSign,
  Award,
  TrendingUp,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Flame,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BusinessProfileCard } from "@/components/shared/BusinessProfileCard";
import { cn } from "@/lib/utils";
import type { ProducerCompetitor } from "@/stores/analysisStore";

interface ProducerCompetitionProps {
  competitors: ProducerCompetitor[];
  onViewCompetitor?: (competitor: ProducerCompetitor) => void;
}

export function ProducerCompetition({ 
  competitors,
  onViewCompetitor,
}: ProducerCompetitionProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Factory className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Competitors Found</h3>
          <p className="text-muted-foreground text-sm">
            Upload a product to analyze manufacturing competition
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate relative market share for visualization
  const totalShare = competitors.reduce((sum, c) => {
    const share = parseFloat(c.marketShare) || 0;
    return sum + share;
  }, 0);

  const getGoogleMapsUrl = (competitor: ProducerCompetitor) => {
    if (competitor.geoLocation) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        competitor.geoLocation.formattedAddress
      )}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(competitor.location)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-indigo-500" />
            Manufacturing Competition
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {competitors.length} producers
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Competing manufacturers producing the same or similar products
        </p>

        <div className="space-y-4">
          {competitors.map((competitor, index) => {
            const shareValue = parseFloat(competitor.marketShare) || 0;
            const sharePercent = totalShare > 0 ? (shareValue / totalShare) * 100 : 0;

            return (
              <motion.div
                key={competitor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border border-border bg-card",
                  "hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-500">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{competitor.name}</h4>
                        <a 
                          href={getGoogleMapsUrl(competitor)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <MapPin className="h-3 w-3" />
                          {competitor.geoLocation 
                            ? `${competitor.geoLocation.city}, ${competitor.geoLocation.country}`
                            : competitor.location}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      {/* Demand Concentration Badge */}
                      {competitor.demandConcentration !== undefined && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            competitor.demandConcentration >= 70 && "bg-destructive/10 text-destructive border-destructive/30",
                            competitor.demandConcentration >= 40 && competitor.demandConcentration < 70 && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                            competitor.demandConcentration < 40 && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          )}
                        >
                          <Flame className="h-3 w-3 mr-1" />
                          {competitor.demandConcentration}% demand
                        </Badge>
                      )}
                    </div>

                    {/* Quick Contact Icons */}
                    {competitor.contact && (
                      <div className="flex items-center gap-2 mb-3">
                        {competitor.contact.email && (
                          <a 
                            href={`mailto:${competitor.contact.email}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title={competitor.contact.email}
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {competitor.contact.phone && (
                          <a 
                            href={`tel:${competitor.contact.phone}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title={competitor.contact.phone}
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        {competitor.contact.website && (
                          <a 
                            href={competitor.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title={competitor.contact.website}
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Market Share */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Market Share</span>
                        <span className="font-medium">{competitor.marketShare}</span>
                      </div>
                      <Progress value={sharePercent} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${competitor.priceRange.min} - ${competitor.priceRange.max}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{competitor.leadTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>Capacity: {competitor.productionCapacity}</span>
                      </div>
                    </div>

                    {/* Business Profile Quick Info */}
                    {competitor.businessProfile && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {competitor.businessProfile.yearEstablished && (
                          <Badge variant="outline" className="text-xs">
                            Est. {competitor.businessProfile.yearEstablished}
                          </Badge>
                        )}
                        {competitor.businessProfile.companySize && (
                          <Badge variant="outline" className="text-xs">
                            {competitor.businessProfile.companySize} employees
                          </Badge>
                        )}
                        {competitor.businessProfile.annualRevenue && (
                          <Badge variant="outline" className="text-xs">
                            {competitor.businessProfile.annualRevenue}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Certifications */}
                    {competitor.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {competitor.certifications.map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            <Award className="h-3 w-3 mr-1 text-amber-500" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Strengths */}
                    <div className="flex flex-wrap gap-1.5">
                      {competitor.strengths.slice(0, 3).map((strength) => (
                        <Badge 
                          key={strength} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCompetitor?.(competitor)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expandable Business Profile */}
                {(competitor.geoLocation || competitor.contact || competitor.businessProfile) && (
                  <div className="mt-4">
                    <BusinessProfileCard
                      name={competitor.name}
                      geoLocation={competitor.geoLocation}
                      contact={competitor.contact}
                      businessProfile={competitor.businessProfile}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
