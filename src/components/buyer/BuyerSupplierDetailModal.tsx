/**
 * Supplier Detail Modal Component
 * Comprehensive popup showing all business information for a supplier
 */
import { useState } from "react";
import { motion } from "framer-motion";
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
  X,
  Truck,
  Clock,
  Package,
  CheckCircle2,
  Star,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DeliverySummary } from "./DeliveryEstimates";
import type { SupplierMatch } from "@/stores/analysisStore";

interface SupplierDetailModalProps {
  supplier: SupplierMatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContact?: (supplier: SupplierMatch) => void;
  onSave?: (supplier: SupplierMatch) => void;
}

export function BuyerSupplierDetailModal({
  supplier,
  open,
  onOpenChange,
  onContact,
  onSave,
}: SupplierDetailModalProps) {
  if (!supplier) return null;

  const getGoogleMapsUrl = () => {
    if (supplier.geoLocation) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        supplier.geoLocation.formattedAddress
      )}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.location)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Logo/Avatar */}
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {supplier.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">{supplier.name}</DialogTitle>
                {supplier.verified && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {supplier.geoLocation
                  ? `${supplier.geoLocation.city}, ${supplier.geoLocation.country}`
                  : supplier.location}
                {supplier.businessProfile?.specializations?.[0] && ` • ${supplier.businessProfile.specializations[0]}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Match Score */}
        <div className="pb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Match Score
            </span>
            <span className="font-bold text-lg text-primary">{supplier.matchScore}%</span>
          </div>
          <Progress value={supplier.matchScore} className="h-3" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <DollarSign className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Price Range</p>
              <p className="font-semibold text-sm">
                ${supplier.priceRange.min} - ${supplier.priceRange.max}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">MOQ</p>
              <p className="font-semibold text-sm">{supplier.moq} units</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Clock className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Lead Time</p>
              <p className="font-semibold text-sm">{supplier.leadTime}</p>
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
            <TabsTrigger value="certifications">Certs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Address */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </h4>
              {supplier.geoLocation ? (
                <div className="pl-6 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {supplier.geoLocation.formattedAddress}
                  </p>
                  <a
                    href={getGoogleMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Open in Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <p className="pl-6 text-sm text-muted-foreground">{supplier.location}</p>
              )}
            </div>

            {/* Delivery Estimates */}
            {supplier.deliveryEstimates && supplier.deliveryEstimates.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Delivery Estimates
                </h4>
                <div className="pl-6">
                  <DeliverySummary estimates={supplier.deliveryEstimates} />
                </div>
              </div>
            )}

            {/* Specializations */}
            {supplier.businessProfile?.specializations && supplier.businessProfile.specializations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Specializations
                </h4>
                <div className="pl-6 flex flex-wrap gap-2">
                  {supplier.businessProfile.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-4 space-y-4">
            {supplier.contact ? (
              <div className="space-y-4">
                {supplier.contact.email && (
                  <a
                    href={`mailto:${supplier.contact.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{supplier.contact.email}</p>
                    </div>
                  </a>
                )}

                {supplier.contact.phone && (
                  <a
                    href={`tel:${supplier.contact.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{supplier.contact.phone}</p>
                    </div>
                  </a>
                )}

                {supplier.contact.website && (
                  <a
                    href={supplier.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <p className="font-medium text-foreground">{supplier.contact.website}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                  </a>
                )}

                {supplier.contact.linkedIn && (
                  <a
                    href={supplier.contact.linkedIn}
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
            {supplier.businessProfile ? (
              <div className="grid grid-cols-2 gap-4">
                {supplier.businessProfile.companySize && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Company Size</p>
                          <p className="font-semibold">{supplier.businessProfile.companySize}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {supplier.businessProfile.yearEstablished && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Established</p>
                          <p className="font-semibold">{supplier.businessProfile.yearEstablished}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {supplier.businessProfile.annualRevenue && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Annual Revenue</p>
                          <p className="font-semibold">{supplier.businessProfile.annualRevenue}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {supplier.businessProfile.employeeCount && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Employees</p>
                          <p className="font-semibold">{supplier.businessProfile.employeeCount.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No business profile available</p>
              </div>
            )}
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="mt-4">
            {supplier.businessProfile?.certifications && supplier.businessProfile.certifications.length > 0 ? (
              <div className="grid gap-3">
                {supplier.businessProfile.certifications.map((cert) => (
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
            ) : (
              <div className="text-center py-8">
                <Award className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No certifications listed</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            onClick={() => {
              onContact?.(supplier);
              onOpenChange(false);
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Supplier
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              onSave?.(supplier);
              onOpenChange(false);
            }}
          >
            <Star className="h-4 w-4 mr-2" />
            Save to List
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
