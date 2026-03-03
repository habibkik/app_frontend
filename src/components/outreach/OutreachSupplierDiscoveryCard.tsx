import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Send, Star, MapPin, ChevronDown, Zap, ShieldCheck, Bot, Clock } from "lucide-react";
import type { Supplier } from "@/data/suppliers";

function calculateLeadScore(supplier: Supplier): { score: number; label: string; badgeClass: string } {
  let score = 0;
  score += (supplier.rating / 5) * 25;
  score += Math.min((supplier.certifications?.length || 0) * 5, 20);
  if (supplier.isAIDiscovered) score += 15;
  // Simulated engagement signals for demo
  score += Math.round(Math.random() * 20);
  score += Math.round(Math.random() * 20);
  score = Math.min(100, Math.round(score));

  if (score >= 80) return { score, label: "🔥 Hot Lead", badgeClass: "bg-destructive/10 text-destructive border-destructive/20" };
  if (score >= 60) return { score, label: "🟡 Warm Lead", badgeClass: "bg-amber-500/10 text-amber-600 border-amber-300/20" };
  if (score >= 40) return { score, label: "🟢 Nurture", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-300/20" };
  return { score, label: "🔵 Cold", badgeClass: "bg-primary/10 text-primary border-primary/20" };
}

interface OutreachSupplierDiscoveryCardProps {
  supplier: Supplier;
  onGenerateCampaigns: (supplier: Supplier, tier?: string) => Promise<number>;
}

export function OutreachSupplierDiscoveryCard({
  supplier,
  onGenerateCampaigns,
}: OutreachSupplierDiscoveryCardProps) {
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState("B");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const leadScore = calculateLeadScore(supplier);
  const isHot = leadScore.score >= 80;

  const handleGenerate = async () => {
    setLoading(true);
    await onGenerateCampaigns(supplier, tier);
    setLoading(false);
  };

  const tags: { label: string; icon: React.ElementType }[] = [];
  if (supplier.isAIDiscovered) tags.push({ label: "AI Found", icon: Bot });
  if ((supplier.certifications?.length || 0) > 0) tags.push({ label: "Certified", icon: ShieldCheck });
  if (supplier.rating >= 4.5) tags.push({ label: "Top Rated", icon: Star });

  return (
    <Card className={`border-border/50 transition-all ${isHot ? "ring-1 ring-destructive/30 shadow-[0_0_12px_-4px_hsl(var(--destructive)/0.3)]" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Score Circle */}
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">{leadScore.score}</span>
              </div>
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
                <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray={`${(leadScore.score / 100) * 113} 113`} strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-sm truncate">{supplier.name}</h4>
                <Badge className={`${leadScore.badgeClass} text-[10px] px-1.5 py-0 border`}>{leadScore.label}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {supplier.location.city}, {supplier.location.country}
                </span>
                <span>•</span>
                <span>{supplier.industry}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {supplier.rating}
                </span>
              </div>
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {tags.map((tag) => {
                    const TagIcon = tag.icon;
                    return (
                      <Badge key={tag.label} variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
                        <TagIcon className="h-2.5 w-2.5" /> {tag.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Tier A — Strategic</SelectItem>
                <SelectItem value="B">Tier B — Operational</SelectItem>
                <SelectItem value="C">Tier C — Backup</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        {/* Score Breakdown */}
        <Collapsible open={showBreakdown} onOpenChange={setShowBreakdown}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 hover:text-foreground transition-colors">
              <ChevronDown className={`h-3 w-3 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
              Score Breakdown
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 p-2 bg-muted/30 rounded text-[10px]">
              <div><span className="text-muted-foreground">Rating:</span> <span className="font-medium">{Math.round((supplier.rating / 5) * 25)}pts</span></div>
              <div><span className="text-muted-foreground">Certs:</span> <span className="font-medium">{Math.min((supplier.certifications?.length || 0) * 5, 20)}pts</span></div>
              <div><span className="text-muted-foreground">AI Found:</span> <span className="font-medium">{supplier.isAIDiscovered ? "15" : "0"}pts</span></div>
              <div><span className="text-muted-foreground">Engagement:</span> <span className="font-medium">~{leadScore.score - Math.round((supplier.rating / 5) * 25) - Math.min((supplier.certifications?.length || 0) * 5, 20) - (supplier.isAIDiscovered ? 15 : 0)}pts</span></div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
