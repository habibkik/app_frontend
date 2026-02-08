import { useState, useMemo } from "react";
import {
  MapPin, Mail, Phone, Globe, Star, Package, Clock,
  MessageCircle, ExternalLink, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatDistanceToNow } from "date-fns";
import type { CompetitorTableRow, StockStatus } from "@/features/seller/types/competitorMonitor";

interface CompetitorMonitorDetailModalProps {
  competitor: CompetitorTableRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stockBadge: Record<StockStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  in_stock: { label: "In Stock", variant: "default" },
  limited: { label: "Limited", variant: "secondary" },
  pre_order: { label: "Pre-order", variant: "outline" },
  out_of_stock: { label: "Out of Stock", variant: "destructive" },
};

export function CompetitorMonitorDetailModal({
  competitor, open, onOpenChange,
}: CompetitorMonitorDetailModalProps) {
  const fc = useFormatCurrency();
  const [chartRange, setChartRange] = useState<7 | 30>(30);

  const chartData = useMemo(() => {
    if (!competitor) return [];
    const history = competitor.priceHistory;
    return chartRange === 7 ? history.slice(-7) : history;
  }, [competitor, chartRange]);

  if (!competitor) return null;

  const stock = stockBadge[competitor.stockStatus];
  const change7d = competitor.priceChange7d;
  const contact = competitor.contactInfo;

  const handleRequestInfo = () => {
    if (contact?.whatsapp || contact?.phone) {
      const phone = (contact.whatsapp || contact.phone)!.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Hi, I'd like to inquire about your pricing.`)}`, "_blank");
    } else if (contact?.email) {
      window.open(`mailto:${contact.email}?subject=${encodeURIComponent("Pricing Inquiry")}`, "_blank");
    }
  };

  const hasContact = contact && (contact.email || contact.phone || contact.whatsapp || contact.website);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-foreground">{competitor.logo}</span>
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{competitor.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{competitor.platform}</Badge>
                <Badge variant={stock.variant} className="text-xs">{stock.label}</Badge>
                {competitor.location && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {competitor.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Current Price</p>
              <p className="font-bold text-lg">{fc(competitor.currentPrice)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">7d Change</p>
              <div className="flex items-center justify-center gap-1">
                {change7d > 0 ? <TrendingUp className="h-4 w-4 text-destructive" /> :
                 change7d < 0 ? <TrendingDown className="h-4 w-4 text-emerald-500" /> :
                 <Minus className="h-4 w-4 text-muted-foreground" />}
                <span className={`font-semibold ${change7d > 0 ? "text-destructive" : change7d < 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {change7d > 0 ? "+" : ""}{change7d.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Rating</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold">{competitor.avgRating}</span>
                <span className="text-xs text-muted-foreground">({competitor.reviewCount})</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="price" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="price">Price History</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Price History Tab */}
          <TabsContent value="price" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Price Trend</h4>
              <div className="flex gap-1">
                <Button
                  size="sm" variant={chartRange === 7 ? "default" : "outline"}
                  onClick={() => setChartRange(7)} className="h-7 text-xs"
                >7 Days</Button>
                <Button
                  size="sm" variant={chartRange === 30 ? "default" : "outline"}
                  onClick={() => setChartRange(30)} className="h-7 text-xs"
                >30 Days</Button>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [fc(value), "Price"]}
                  />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-4 space-y-4">
            {competitor.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{competitor.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">Avg Rating:</span>
                <span className="font-medium">{competitor.avgRating}/5</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Reviews:</span>
                <span className="font-medium">{competitor.reviewCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium">{formatDistanceToNow(competitor.lastUpdated, { addSuffix: true })}</span>
              </div>
              {competitor.businessType && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{competitor.businessType}</span>
                </div>
              )}
            </div>

            {competitor.reputation && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Reputation</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Response Time: <span className="text-foreground font-medium">{competitor.reputation.responseTime}h</span></div>
                    <div className="text-muted-foreground">Return Rate: <span className="text-foreground font-medium">{competitor.reputation.returnRate}%</span></div>
                    <div className="text-muted-foreground">Account Age: <span className="text-foreground font-medium">{competitor.reputation.accountAge} days</span></div>
                    <div className="text-muted-foreground">Verified: <span className="text-foreground font-medium">{competitor.reputation.isVerified ? "Yes" : "No"}</span></div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-4 space-y-3">
            {hasContact ? (
              <div className="space-y-3">
                {contact!.email && (
                  <a href={`mailto:${contact!.email}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{contact!.email}</p>
                    </div>
                  </a>
                )}
                {contact!.phone && (
                  <a href={`tel:${contact!.phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{contact!.phone}</p>
                    </div>
                  </a>
                )}
                {contact!.website && (
                  <a href={contact!.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <p className="font-medium text-foreground">{contact!.website}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                  </a>
                )}

                <Separator />

                <Button onClick={handleRequestInfo} className="w-full gap-2" disabled={!hasContact}>
                  <MessageCircle className="h-4 w-4" />
                  Request Info {contact!.whatsapp || contact!.phone ? "via WhatsApp" : "via Email"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No contact information available</p>
                <p className="text-xs text-muted-foreground mt-1">Contact details will appear when available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
