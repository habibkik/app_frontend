import { 
  Star, 
  MapPin, 
  Clock, 
  BadgeCheck, 
  Building2, 
  Users, 
  Calendar,
  DollarSign,
  Award,
  ExternalLink,
  MessageSquare,
  Bookmark,
  Share2,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Supplier } from "@/data/suppliers";
import { cn } from "@/lib/utils";

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContact: (supplier: Supplier) => void;
  onSave: (supplier: Supplier) => void;
}

export function SupplierDetailModal({
  supplier,
  open,
  onOpenChange,
  onContact,
  onSave,
}: SupplierDetailModalProps) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-hero p-6 pb-20">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {supplier.logo}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl text-primary-foreground">
                      {supplier.name}
                    </DialogTitle>
                    {supplier.verified && (
                      <BadgeCheck className="h-5 w-5 text-accent flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-primary-foreground/70">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {supplier.location.city}, {supplier.location.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {supplier.industry}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Floating stats card */}
          <div className="absolute -bottom-12 left-6 right-6 bg-card rounded-xl border shadow-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-bold text-lg">{supplier.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {supplier.reviewCount} reviews
                </span>
              </div>
              <div className="border-l">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-sm">{supplier.responseTime}</span>
                </div>
                <span className="text-xs text-muted-foreground">Response</span>
              </div>
              <div className="border-l">
                <div className="font-bold text-lg">
                  ${supplier.minOrderValue.toLocaleString()}
                </div>
                <span className="text-xs text-muted-foreground">Min. Order</span>
              </div>
              <div className="border-l">
                <div className="font-bold text-lg">{supplier.yearEstablished}</div>
                <span className="text-xs text-muted-foreground">Est.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-16">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {supplier.description}
                </p>
              </div>

              <Separator />

              {/* Company Details */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Company Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Established</p>
                      <p className="text-sm font-medium">{supplier.yearEstablished}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employees</p>
                      <p className="text-sm font-medium">{supplier.employeeCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Min. Order Value</p>
                      <p className="text-sm font-medium">
                        ${supplier.minOrderValue.toLocaleString()} USD
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">
                        {supplier.location.city}, {supplier.location.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="mt-6 space-y-6">
              {/* Specializations */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.specializations.map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Industry */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Industry Focus
                </h3>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{supplier.industry}</p>
                    <p className="text-sm text-muted-foreground">
                      Primary industry sector
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Response & Reliability */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Response & Reliability
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">Response Time</span>
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {supplier.responseTime}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">Rating</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {supplier.rating}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        / 5.0
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="certifications" className="mt-6 space-y-6">
              {/* Certifications */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Certifications & Compliance
                </h3>
                <div className="grid gap-3">
                  {supplier.certifications.map((cert) => (
                    <div
                      key={cert}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{cert}</p>
                        <p className="text-xs text-muted-foreground">
                          Verified certification
                        </p>
                      </div>
                      <BadgeCheck className="h-5 w-5 text-success" />
                    </div>
                  ))}
                </div>
              </div>

              {supplier.verified && (
                <>
                  <Separator />
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <BadgeCheck className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-success">Verified Supplier</p>
                        <p className="text-sm text-muted-foreground">
                          This supplier has been verified by TradePlatform
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button
              className="flex-1"
              size="lg"
              onClick={() => {
                onContact(supplier);
                onOpenChange(false);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Supplier
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                onSave(supplier);
              }}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
