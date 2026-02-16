/**
 * Business Profile Card Component
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Calendar, Users, DollarSign, Award, Mail, Phone, Globe, Linkedin, ChevronDown, MapPin, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GeoLocation, BusinessContact, BusinessProfile } from "@/stores/analysisStore";

interface BusinessProfileCardProps { name: string; geoLocation?: GeoLocation; contact?: BusinessContact; businessProfile?: BusinessProfile; className?: string; defaultExpanded?: boolean; }

export function BusinessProfileCard({ name, geoLocation, contact, businessProfile, className, defaultExpanded = false }: BusinessProfileCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasData = geoLocation || contact || businessProfile;
  if (!hasData) return null;

  const googleMapsUrl = geoLocation ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(geoLocation.formattedAddress)}` : null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />{t("businessProfile.title")}</CardTitle>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="h-4 w-4 text-muted-foreground" /></motion.div>
        </div>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <CardContent className="pt-2 space-y-4">
              {geoLocation && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("businessProfile.location")}</h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{geoLocation.formattedAddress}</p>
                      <p className="text-xs text-muted-foreground mt-1">{geoLocation.city}{geoLocation.state && `, ${geoLocation.state}`}, {geoLocation.country}</p>
                    </div>
                    {googleMapsUrl && <Button variant="ghost" size="sm" className="h-8 px-2" onClick={(e) => { e.stopPropagation(); window.open(googleMapsUrl, "_blank"); }}><ExternalLink className="h-3.5 w-3.5" /></Button>}
                  </div>
                </div>
              )}
              {contact && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("businessProfile.contact")}</h4>
                  <div className="grid gap-2">
                    {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}><Mail className="h-4 w-4 text-muted-foreground" />{contact.email}</a>}
                    {contact.phone && <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}><Phone className="h-4 w-4 text-muted-foreground" />{contact.phone}</a>}
                    {contact.website && <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}><Globe className="h-4 w-4 text-muted-foreground" />{contact.website.replace(/^https?:\/\//, "")}</a>}
                    {contact.linkedIn && <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}><Linkedin className="h-4 w-4 text-muted-foreground" />LinkedIn</a>}
                  </div>
                </div>
              )}
              {businessProfile && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("businessProfile.companyInfo")}</h4>
                  <div className="grid gap-2 text-sm">
                    {businessProfile.companySize && <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span>{businessProfile.companySize} {t("settings.company.employees")}</span></div>}
                    {businessProfile.yearEstablished && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Est. {businessProfile.yearEstablished}</span></div>}
                    {businessProfile.annualRevenue && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>{businessProfile.annualRevenue}</span></div>}
                  </div>
                  {businessProfile.certifications && businessProfile.certifications.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">{t("businessProfile.certifications")}</p>
                      <div className="flex flex-wrap gap-1.5">{businessProfile.certifications.map((cert) => <Badge key={cert} variant="outline" className="text-xs"><Award className="h-3 w-3 mr-1 text-amber-500" />{cert}</Badge>)}</div>
                    </div>
                  )}
                  {businessProfile.specializations && businessProfile.specializations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">{t("businessProfile.specializations")}</p>
                      <div className="flex flex-wrap gap-1.5">{businessProfile.specializations.map((spec) => <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>)}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
