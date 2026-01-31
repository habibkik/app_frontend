/**
 * Competitor Detail Modal Component
 * Comprehensive popup showing all business information for a competitor
 */
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Award,
  ShieldCheck,
  ExternalLink,
  Eye,
  Star,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  CheckCircle2,
  Bell,
  BellOff,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Competitor type with extended business profile
export interface CompetitorData {
  id: string;
  name: string;
  website: string;
  logo: string;
  priceIndex: number;
  priceChange: number;
  marketShare: number;
  productCount: number;
  avgRating: number;
  strengths: string[];
  weaknesses: string[];
  tracking: boolean;
  lastUpdated: string;
  trend: "up" | "down" | "stable";
  description?: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
    formattedAddress: string;
    city: string;
    state?: string;
    country: string;
  };
  contact?: {
    email: string;
    phone: string;
    website: string;
    linkedIn?: string;
  };
  businessProfile?: {
    companySize: string;
    yearEstablished: number;
    annualRevenue: string;
    certifications: string[];
    specializations: string[];
  };
}

interface CompetitorDetailModalProps {
  competitor: CompetitorData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleTracking?: (competitor: CompetitorData) => void;
}

export function CompetitorDetailModal({
  competitor,
  open,
  onOpenChange,
  onToggleTracking,
}: CompetitorDetailModalProps) {
  if (!competitor) return null;

  const getGoogleMapsUrl = () => {
    if (competitor.geoLocation) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        competitor.geoLocation.formattedAddress
      )}`;
    }
    return null;
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "stable":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Logo/Avatar */}
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-foreground">
                {competitor.logo}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">{competitor.name}</DialogTitle>
                {competitor.tracking && (
                  <Badge variant="default" className="gap-1">
                    <Eye className="h-3 w-3" />
                    Tracking
                  </Badge>
                )}
              </div>
              <a
                href={`https://${competitor.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground mt-1 hover:text-primary transition-colors flex items-center gap-1"
              >
                <Globe className="h-3 w-3" />
                {competitor.website}
              </a>
            </div>
          </div>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Price Index</p>
              <div className="flex items-center justify-center gap-1">
                <p className="font-semibold text-sm">{competitor.priceIndex}</p>
                {getTrendIcon(competitor.trend)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Market Share</p>
              <p className="font-semibold text-sm">{competitor.marketShare}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Products</p>
              <p className="font-semibold text-sm">{competitor.productCount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Description */}
            {competitor.description && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  About
                </h4>
                <p className="pl-6 text-sm text-muted-foreground">
                  {competitor.description}
                </p>
              </div>
            )}

            {/* Address */}
            {competitor.geoLocation && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </h4>
                <div className="pl-6 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {competitor.geoLocation.formattedAddress}
                  </p>
                  <a
                    href={getGoogleMapsUrl() || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Open in Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                Rating
              </h4>
              <div className="pl-6 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(competitor.avgRating)
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{competitor.avgRating}</span>
              </div>
            </div>

            {/* Last Updated */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Last Updated
              </h4>
              <p className="pl-6 text-sm text-muted-foreground">
                {competitor.lastUpdated}
              </p>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-4 space-y-4">
            {competitor.contact ? (
              <div className="space-y-4">
                {competitor.contact.email && (
                  <a
                    href={`mailto:${competitor.contact.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{competitor.contact.email}</p>
                    </div>
                  </a>
                )}

                {competitor.contact.phone && (
                  <a
                    href={`tel:${competitor.contact.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{competitor.contact.phone}</p>
                    </div>
                  </a>
                )}

                {competitor.contact.website && (
                  <a
                    href={competitor.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <p className="font-medium text-foreground">{competitor.contact.website}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                  </a>
                )}

                {competitor.contact.linkedIn && (
                  <a
                    href={competitor.contact.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Linkedin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LinkedIn</p>
                      <p className="font-medium text-foreground">View Profile</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No contact information available</p>
              </div>
            )}
          </TabsContent>

          {/* Business Profile Tab */}
          <TabsContent value="business" className="mt-4 space-y-4">
            {competitor.businessProfile ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {competitor.businessProfile.companySize && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Company Size</p>
                            <p className="font-semibold">{competitor.businessProfile.companySize}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {competitor.businessProfile.yearEstablished && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Established</p>
                            <p className="font-semibold">{competitor.businessProfile.yearEstablished}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {competitor.businessProfile.annualRevenue && (
                    <Card className="col-span-2">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Annual Revenue</p>
                            <p className="font-semibold">{competitor.businessProfile.annualRevenue}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Certifications */}
                {competitor.businessProfile.certifications && competitor.businessProfile.certifications.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Certifications
                    </h4>
                    <div className="grid gap-3">
                      {competitor.businessProfile.certifications.map((cert) => (
                        <div
                          key={cert}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Award className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{cert}</p>
                            <p className="text-xs text-muted-foreground">Verified Certification</p>
                          </div>
                          <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specializations */}
                {competitor.businessProfile.specializations && competitor.businessProfile.specializations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Specializations
                    </h4>
                    <div className="pl-6 flex flex-wrap gap-2">
                      {competitor.businessProfile.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No business profile available</p>
              </div>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="mt-4 space-y-4">
            {/* Strengths */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Strengths
              </h4>
              <div className="pl-6 flex flex-wrap gap-2">
                {competitor.strengths.map((strength) => (
                  <Badge
                    key={strength}
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  >
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Weaknesses
              </h4>
              <div className="pl-6 flex flex-wrap gap-2">
                {competitor.weaknesses.map((weakness) => (
                  <Badge
                    key={weakness}
                    variant="secondary"
                    className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                  >
                    {weakness}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price Trend */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Price Trend
              </h4>
              <div className="pl-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {getTrendIcon(competitor.trend)}
                  <div>
                    <p className="font-medium text-foreground">
                      {competitor.trend === "up" && "Prices Increasing"}
                      {competitor.trend === "down" && "Prices Decreasing"}
                      {competitor.trend === "stable" && "Prices Stable"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {competitor.priceChange > 0 ? "+" : ""}
                      {competitor.priceChange}% change in the last period
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              window.open(`https://${competitor.website}`, "_blank");
            }}
          >
            <Globe className="h-4 w-4 mr-2" />
            Visit Website
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onToggleTracking?.(competitor);
              onOpenChange(false);
            }}
          >
            {competitor.tracking ? (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Stop Tracking
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Start Tracking
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
