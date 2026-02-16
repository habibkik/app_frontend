import { useTranslation } from "react-i18next";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { Star, MapPin, Clock, BadgeCheck, Building2, Users, Calendar, DollarSign, Award, ExternalLink, MessageSquare, Bookmark, Mail, Phone, Globe, Linkedin, TrendingUp, Sparkles, ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Supplier } from "@/data/suppliers";

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContact: (supplier: Supplier) => void;
  onSave: (supplier: Supplier) => void;
}

export function SupplierDetailModal({ supplier, open, onOpenChange, onContact, onSave }: SupplierDetailModalProps) {
  const { t } = useTranslation();
  const fc = useFormatCurrency();
  if (!supplier) return null;

  const googleMapsUrl = supplier.geoLocation 
    ? `https://www.google.com/maps/search/?api=1&query=${supplier.geoLocation.latitude},${supplier.geoLocation.longitude}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <div className="relative bg-gradient-hero p-6 pb-20">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">{supplier.logo}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl text-primary-foreground">{supplier.name}</DialogTitle>
                    {supplier.verified && <BadgeCheck className="h-5 w-5 text-accent flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-primary-foreground/70">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{supplier.location.city}, {supplier.location.country}</span>
                    <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{supplier.industry}</span>
                  </div>
                  {supplier.isAIDiscovered && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-primary text-white text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {t("supplierDetail.aiDiscovered")}
                      </Badge>
                      {supplier.matchScore && <Badge variant="outline" className="text-xs border-white/30 text-white">{supplier.matchScore}% {t("supplierDetail.match")}</Badge>}
                      {supplier.substituteOf && <Badge variant="outline" className="text-xs border-white/30 text-white"><ArrowRightLeft className="h-3 w-3 mr-1" />{t("supplierDetail.substitute")}</Badge>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="absolute -bottom-12 left-6 right-6 bg-card rounded-xl border shadow-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-bold text-lg">{supplier.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">{supplier.reviewCount} {t("competitorMonitor.reviews").toLowerCase()}</span>
              </div>
              <div className="border-l">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-sm">{supplier.responseTime}</span>
                </div>
                <span className="text-xs text-muted-foreground">{t("suppliers.details.responseTime")}</span>
              </div>
              <div className="border-l">
                <div className="font-bold text-lg">{fc(supplier.minOrderValue)}</div>
                <span className="text-xs text-muted-foreground">{t("suppliers.details.minOrder")}</span>
              </div>
              <div className="border-l">
                <div className="font-bold text-lg">{supplier.yearEstablished}</div>
                <span className="text-xs text-muted-foreground">{t("supplierDetail.established")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-16">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t("supplierDetail.overview")}</TabsTrigger>
              <TabsTrigger value="contact">{t("businessProfile.contact")}</TabsTrigger>
              <TabsTrigger value="business">{t("supplierDetail.business")}</TabsTrigger>
              <TabsTrigger value="team">{t("supplierDetail.employees")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {supplier.substituteOf && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-primary/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <ArrowRightLeft className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{t("buyerDiscovery.substituteProductSuppliers")}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t("buyerDiscovery.suppliersWithSavings")}:</p>
                      <Badge variant="secondary" className="mt-2 text-sm">{supplier.substituteOf}</Badge>
                    </div>
                  </div>
                </div>
              )}

              {supplier.geoLocation && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t("supplierDetail.location")}</h3>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{supplier.geoLocation.formattedAddress}</p>
                      {googleMapsUrl && (
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                          {t("supplierDetail.openInGoogleMaps")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{t("supplierDetail.overview")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{supplier.description}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">{t("supplierDetail.specializations")}</h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="px-3 py-1.5 text-sm">{spec}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">{t("supplierDetail.certifications")}</h3>
                <div className="grid gap-3">
                  {supplier.certifications.map((cert) => (
                    <div key={cert} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{cert}</p>
                        <p className="text-xs text-muted-foreground">{t("supplierDetail.verifiedCertification")}</p>
                      </div>
                      <BadgeCheck className="h-5 w-5 text-success" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">{t("businessProfile.contact")}</h3>
                <div className="grid gap-3">
                  {supplier.contact?.email && (
                    <a href={`mailto:${supplier.contact.email}`} className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Mail className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{t("auth.email")}</p>
                        <p className="font-medium text-primary">{supplier.contact.email}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {supplier.contact?.phone && (
                    <a href={`tel:${supplier.contact.phone}`} className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Phone className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{t("contact.phone")}</p>
                        <p className="font-medium text-primary">{supplier.contact.phone}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {supplier.contact?.website && (
                    <a href={supplier.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{t("contact.website")}</p>
                        <p className="font-medium text-primary">{supplier.contact.website}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {supplier.contact?.linkedIn && (
                    <a href={supplier.contact.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-[#0077B5]/10 flex items-center justify-center"><Linkedin className="h-5 w-5 text-[#0077B5]" /></div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">LinkedIn</p>
                        <p className="font-medium text-primary">{t("common.view")}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
                {!supplier.contact && (
                  <div className="p-4 rounded-lg bg-muted/50 text-center text-muted-foreground">
                    <p className="text-sm">{t("supplierDetail.noContactInfo")}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="business" className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">{t("supplierDetail.business")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Calendar className="h-4 w-4 text-primary" /></div>
                    <div><p className="text-xs text-muted-foreground">{t("supplierDetail.established")}</p><p className="text-sm font-medium">{supplier.yearEstablished}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
                    <div><p className="text-xs text-muted-foreground">{t("supplierDetail.employees")}</p><p className="text-sm font-medium">{supplier.employeeCount}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-primary" /></div>
                    <div><p className="text-xs text-muted-foreground">{t("supplierDetail.moq")}</p><p className="text-sm font-medium">{fc(supplier.minOrderValue)}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="h-4 w-4 text-primary" /></div>
                    <div><p className="text-xs text-muted-foreground">{t("settings.company.industry")}</p><p className="text-sm font-medium">{supplier.industry}</p></div>
                  </div>
                </div>
              </div>
              <Separator />
              {supplier.businessProfile && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t("supplierDetail.business")}</h3>
                  <div className="grid gap-4">
                    {supplier.businessProfile.annualRevenue && (
                      <div className="flex items-center gap-3 p-4 rounded-lg border">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div><p className="text-xs text-muted-foreground">{t("supplierDetail.annualRevenue")}</p><p className="font-medium">{supplier.businessProfile.annualRevenue}</p></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                <h3 className="text-lg font-medium">{t("supplierDetail.employees")}</h3>
                <p className="text-muted-foreground mt-1">Team information not available</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-sm border-t flex justify-between items-center gap-4">
          <Button variant="outline" className="flex-1" onClick={() => onSave(supplier)}>
            <Bookmark className="h-4 w-4 mr-2" />
            {t("supplierDetail.saveToList")}
          </Button>
          <Button className="flex-1" onClick={() => onContact(supplier)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            {t("supplierDetail.contactSupplier")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
