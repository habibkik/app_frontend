import { Star, MapPin, Clock, BadgeCheck, Building2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/data/suppliers";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface SupplierCardProps {
  supplier: Supplier;
  onContact: (supplier: Supplier) => void;
  onSave: (supplier: Supplier) => void;
  onClick?: (supplier: Supplier) => void;
  onNameClick?: (supplier: Supplier) => void;
}

export function SupplierCard({ supplier, onContact, onSave, onClick, onNameClick }: SupplierCardProps) {
  const fc = useFormatCurrency();
  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 hover:border-primary/30 cursor-pointer"
      onClick={() => onClick?.(supplier)}
    >
      <CardContent className="p-5" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="h-14 w-14 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary-foreground">
              {supplier.logo}
            </span>
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className="font-semibold text-foreground truncate hover:text-primary cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onNameClick?.(supplier);
                }}
              >
                {supplier.name}
              </h3>
              {supplier.verified && (
                <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {supplier.location.city}, {supplier.location.country}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {supplier.industry}
              </span>
            </div>
            
            {/* AI Discovery Badges */}
            {supplier.isAIDiscovered && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-gradient-to-r from-purple-500 to-primary text-white text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Discovered
                </Badge>
                {supplier.matchScore && (
                  <Badge variant="outline" className="text-xs">
                    {supplier.matchScore}% Match
                  </Badge>
                )}
                {supplier.substituteOf && (
                  <Badge variant="secondary" className="text-xs">
                    Substitute
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {supplier.description}
        </p>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {supplier.specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="text-xs font-normal">
              {spec}
            </Badge>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="font-semibold text-sm">{supplier.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {supplier.reviewCount} reviews
            </span>
          </div>
          <div className="text-center border-x border-border">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-sm">{supplier.responseTime}</span>
            </div>
            <span className="text-xs text-muted-foreground">Response</span>
          </div>
          <div className="text-center">
            <span className="font-semibold text-sm">
              {fc(supplier.minOrderValue)}
            </span>
            <span className="text-xs text-muted-foreground block">Min. Order</span>
          </div>
        </div>

        {/* Certifications */}
        <div className="flex items-center gap-1.5 mb-4 overflow-hidden">
          {supplier.certifications.slice(0, 3).map((cert) => (
            <span
              key={cert}
              className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
            >
              {cert}
            </span>
          ))}
          {supplier.certifications.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{supplier.certifications.length - 3}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={() => onContact(supplier)}
          >
            Contact Supplier
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onSave(supplier)}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
