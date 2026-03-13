/**
 * BuyerSupplierGrid
 * Grid view for Buyer mode on the Heat Map page.
 * Shows supplier cards with sorting & filtering controls.
 */
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, Star, DollarSign, Map, ArrowRight, Building2, ArrowUpDown, Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { MapEntity } from "@/stores/analysisStore";

interface BuyerSupplierGridProps {
  entities: MapEntity[];
  onSelectEntity?: (entity: MapEntity) => void;
}

type SortKey = "matchScore" | "priceMin" | "priceMax" | "country" | "name";
type SortDir = "asc" | "desc";
type ScoreTier = "all" | "excellent" | "good" | "fair";

function matchScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 bg-emerald-500/10 border-emerald-500/30";
  if (score >= 60) return "text-amber-600 bg-amber-500/10 border-amber-500/30";
  return "text-muted-foreground bg-muted border-border";
}

export function BuyerSupplierGrid({ entities, onSelectEntity }: BuyerSupplierGridProps) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<SortKey>("matchScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [scoreTier, setScoreTier] = useState<ScoreTier>("all");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);

  const sortLabels: Record<SortKey, string> = {
    matchScore: t("buyerGrid.sortMatchScore"),
    priceMin: t("buyerGrid.sortPriceLow"),
    priceMax: t("buyerGrid.sortPriceHigh"),
    country: t("buyerGrid.sortCountry"),
    name: t("buyerGrid.sortName"),
  };

  function matchScoreLabel(score: number) {
    if (score >= 80) return t("buyerGrid.excellent");
    if (score >= 60) return t("buyerGrid.good");
    return t("buyerGrid.fair");
  }

  // Unique countries for filter dropdown
  const countries = useMemo(
    () => [...new Set(entities.map((e) => e.geoLocation.country))].sort(),
    [entities]
  );

  const hasActiveFilters = scoreTier !== "all" || countryFilter !== null;

  // Filter
  const filtered = useMemo(() => {
    return entities.filter((e) => {
      if (scoreTier === "excellent" && (e.matchScore ?? 0) < 80) return false;
      if (scoreTier === "good" && ((e.matchScore ?? 0) < 60 || (e.matchScore ?? 0) >= 80)) return false;
      if (scoreTier === "fair" && (e.matchScore ?? 0) >= 60) return false;
      if (countryFilter && e.geoLocation.country !== countryFilter) return false;
      return true;
    });
  }, [entities, scoreTier, countryFilter]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "matchScore":
          return dir * ((a.matchScore ?? 0) - (b.matchScore ?? 0));
        case "priceMin":
          return dir * ((a.priceRange?.min ?? 0) - (b.priceRange?.min ?? 0));
        case "priceMax":
          return dir * ((a.priceRange?.max ?? 0) - (b.priceRange?.max ?? 0));
        case "country":
          return dir * a.geoLocation.country.localeCompare(b.geoLocation.country);
        case "name":
          return dir * a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  if (!entities || entities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t("buyerGrid.noSuppliersFound")}</h3>
          <p className="text-muted-foreground text-sm">
            {t("buyerGrid.noSuppliersDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "matchScore" || key === "priceMax" ? "desc" : "asc");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t("buyerGrid.supplierLocations")}
          </CardTitle>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {sortLabels[sortKey]}
                  <span className="text-muted-foreground">{sortDir === "asc" ? "↑" : "↓"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 bg-popover">
                {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                  <DropdownMenuItem key={key} onClick={() => handleSort(key)} className={cn(sortKey === key && "font-semibold")}>
                    {sortLabels[key]}
                    {sortKey === key && <span className="ms-auto text-xs text-muted-foreground">{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Score tier filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <Star className="h-3.5 w-3.5" />
                  {scoreTier === "all" ? t("buyerGrid.allTiers") : t(`buyerGrid.${scoreTier}`)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 bg-popover">
                {(["all", "excellent", "good", "fair"] as ScoreTier[]).map((tier) => (
                  <DropdownMenuItem key={tier} onClick={() => setScoreTier(tier)} className={cn(scoreTier === tier && "font-semibold")}>
                    {tier === "all" ? t("buyerGrid.allTiers") : tier === "excellent" ? `${t("buyerGrid.excellent")} (80%+)` : tier === "good" ? `${t("buyerGrid.good")} (60–79%)` : `${t("buyerGrid.fair")} (<60%)`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Country filter */}
            {countries.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Filter className="h-3.5 w-3.5" />
                    {countryFilter ?? t("buyerGrid.allCountries")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 bg-popover max-h-60 overflow-y-auto">
                  <DropdownMenuItem onClick={() => setCountryFilter(null)} className={cn(!countryFilter && "font-semibold")}>
                    {t("buyerGrid.allCountries")}
                  </DropdownMenuItem>
                  {countries.map((c) => (
                    <DropdownMenuItem key={c} onClick={() => setCountryFilter(c)} className={cn(countryFilter === c && "font-semibold")}>
                      {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-muted-foreground"
                onClick={() => { setScoreTier("all"); setCountryFilter(null); }}
              >
                <X className="h-3 w-3" />
                {t("buyerGrid.clear")}
              </Button>
            )}
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-muted-foreground mt-1">
          {t("buyerGrid.showing", { count: sorted.length, total: entities.length })}
        </p>
      </CardHeader>

      <CardContent>
        {sorted.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            {t("buyerGrid.noMatch")}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((entity, index) => {
              const score = entity.matchScore ?? 0;
              const scoreClass = matchScoreColor(score);

              return (
                <motion.div
                  key={entity.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => onSelectEntity?.(entity)}
                  className={cn(
                    "group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.02]",
                    "border-border hover:border-primary/40 bg-card"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{entity.name}</h4>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {entity.geoLocation.city
                          ? `${entity.geoLocation.city}, ${entity.geoLocation.country}`
                          : entity.geoLocation.country}
                      </span>
                    </div>
                    {score > 0 && (
                      <Badge variant="outline" className={cn("text-xs ms-2 shrink-0", scoreClass)}>
                        {matchScoreLabel(score)}
                      </Badge>
                    )}
                  </div>

                  {/* Match Score bar */}
                  {score > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {t("buyerGrid.matchScore")}
                        </span>
                        <span className="font-semibold">{score}%</span>
                      </div>
                      <Progress value={score} className="h-1.5" />
                    </div>
                  )}

                  {/* Price Range */}
                  {entity.priceRange && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        {t("buyerGrid.priceRange")}
                      </span>
                      <span className="font-medium text-foreground">
                        ${entity.priceRange.min} – ${entity.priceRange.max}
                      </span>
                    </div>
                  )}

                  {/* Country */}
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {t("buyerGrid.country")}
                    </span>
                    <span className="font-medium text-foreground">{entity.geoLocation.country}</span>
                  </div>

                  {/* Fly-to hint */}
                  {onSelectEntity && (
                    <div className="mt-3 pt-2 border-t border-border flex items-center justify-end gap-1 text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                      <Map className="h-3 w-3" />
                      <span>{t("buyerGrid.viewOnMap")}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
