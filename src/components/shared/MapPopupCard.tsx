/**
 * Map Popup Card Component
 * Popup card displayed when clicking on a map marker
 */
import { MapPin, Mail, Phone, Globe, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GeoLocation, BusinessContact } from "@/stores/analysisStore";

interface MapPopupCardProps {
  name: string;
  type: "supplier" | "competitor" | "producer";
  geoLocation: GeoLocation;
  contact?: BusinessContact;
  matchScore?: number;
  marketShare?: string;
  demandConcentration?: number;
  priceRange?: { min: number; max: number };
  onViewDetails?: () => void;
  onContact?: () => void;
}

const typeLabels = {
  supplier: "Supplier",
  competitor: "Competitor",
  producer: "Manufacturer",
};

const typeColors = {
  supplier: "bg-primary/10 text-primary",
  competitor: "bg-purple-500/10 text-purple-600",
  producer: "bg-indigo-500/10 text-indigo-600",
};

export function MapPopupCard({
  name,
  type,
  geoLocation,
  contact,
  matchScore,
  marketShare,
  demandConcentration,
  priceRange,
  onViewDetails,
  onContact,
}: MapPopupCardProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    geoLocation.formattedAddress
  )}`;

  return (
    <Card className="w-72 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{name}</CardTitle>
          <Badge variant="secondary" className={typeColors[type]}>
            {typeLabels[type]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Location */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="line-clamp-2">{geoLocation.formattedAddress}</p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-xs flex items-center gap-1 mt-1"
            >
              Open in Google Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex flex-wrap gap-2">
          {matchScore !== undefined && (
            <Badge variant="outline" className="text-xs">
              {matchScore}% match
            </Badge>
          )}
          {marketShare && (
            <Badge variant="outline" className="text-xs">
              {marketShare} share
            </Badge>
          )}
          {demandConcentration !== undefined && (
            <Badge variant="outline" className="text-xs">
              {demandConcentration}% demand
            </Badge>
          )}
          {priceRange && (
            <Badge variant="outline" className="text-xs">
              ${priceRange.min} - ${priceRange.max}
            </Badge>
          )}
        </div>

        {/* Quick Contact */}
        {contact && (
          <div className="flex gap-2">
            {contact.email && (
              <a href={`mailto:${contact.email}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Mail className="h-4 w-4" />
                </Button>
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
              </a>
            )}
            {contact.website && (
              <a href={contact.website} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Globe className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onContact && (
            <Button size="sm" className="flex-1" onClick={onContact}>
              Contact
            </Button>
          )}
          {onViewDetails && (
            <Button size="sm" variant="outline" className="flex-1" onClick={onViewDetails}>
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
