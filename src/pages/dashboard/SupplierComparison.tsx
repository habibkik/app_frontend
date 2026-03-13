import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompareArrows,
  Plus,
  X,
  Star,
  MapPin,
  BadgeCheck,
  Clock,
  Building2,
  Shield,
  DollarSign,
  Cog,
  FileCheck,
  Globe,
  Award,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Supplier, mockSuppliers } from "@/data/suppliers";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";

// ── Risk scoring (same logic as SupplierRiskScoring) ──
function hashStr(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function seedScore(seed: number, offset: number) {
  return ((seed + offset * 37) % 80) + 10;
}

interface RiskScores {
  financial: number;
  operational: number;
  compliance: number;
  geopolitical: number;
  overall: number;
}

function computeRiskScores(supplier: Supplier): RiskScores {
  const seed = hashStr(supplier.id);
  const s = (o: number) => seedScore(seed, o);

  const financial = Math.round((s(1) + s(2) + s(3)) / 3);
  const operational = Math.round(
    (s(4) + Math.max(10, 100 - supplier.rating * 20 + (s(5) % 10)) + s(6)) / 3
  );
  const compliance = Math.round(
    (Math.max(10, 90 - supplier.certifications.length * 15) +
      (supplier.verified ? (s(7) % 40) + 10 : (s(7) % 40) + 40) +
      s(8)) /
      3
  );
  const geopolitical = Math.round((s(9) + (s(10) % 50) + s(11)) / 3);

  const overall = Math.round(
    financial * 0.3 + operational * 0.25 + compliance * 0.25 + geopolitical * 0.2
  );

  return { financial, operational, compliance, geopolitical, overall };
}

type RiskLevel = "low" | "medium" | "high" | "critical";
function getRiskLevel(score: number): RiskLevel {
  if (score <= 25) return "low";
  if (score <= 50) return "medium";
  if (score <= 75) return "high";
  return "critical";
}
function riskColor(level: RiskLevel) {
  switch (level) {
    case "low": return "text-emerald-500";
    case "medium": return "text-amber-500";
    case "high": return "text-orange-500";
    case "critical": return "text-destructive";
  }
}
function riskBg(level: RiskLevel) {
  switch (level) {
    case "low": return "bg-emerald-500/10";
    case "medium": return "bg-amber-500/10";
    case "high": return "bg-orange-500/10";
    case "critical": return "bg-destructive/10";
  }
}
function riskProgressColor(level: RiskLevel) {
  switch (level) {
    case "low": return "[&>div]:bg-emerald-500";
    case "medium": return "[&>div]:bg-amber-500";
    case "high": return "[&>div]:bg-orange-500";
    case "critical": return "[&>div]:bg-destructive";
  }
}

// ── Components ──

function SupplierSelector({
  selected,
  onAdd,
  onRemove,
}: {
  selected: Supplier[];
  onAdd: (s: Supplier) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const available = mockSuppliers.filter((s) => !selected.some((sel) => sel.id === s.id));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Select Suppliers to Compare
          <Badge variant="secondary" className="ml-auto">{selected.length}/6</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <AnimatePresence>
            {selected.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-sm">
                  <span className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {s.logo}
                  </span>
                  {s.name}
                  <button onClick={() => onRemove(s.id)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>

          {selected.length < 6 && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add Supplier
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search suppliers..." />
                  <CommandList>
                    <CommandEmpty>No suppliers found.</CommandEmpty>
                    <CommandGroup>
                      {available.map((s) => (
                        <CommandItem
                          key={s.id}
                          onSelect={() => {
                            onAdd(s);
                            if (selected.length >= 5) setOpen(false);
                          }}
                          className="gap-2"
                        >
                          <span className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {s.logo}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.location.city}, {s.location.country}</div>
                          </div>
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          <span className="text-xs">{s.rating}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
        {selected.length < 3 && (
          <p className="text-xs text-muted-foreground">Select at least 3 suppliers to start comparing.</p>
        )}
      </CardContent>
    </Card>
  );
}

// Score cell with color coding
function ScoreCell({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const level = getRiskLevel(inverse ? 100 - value : value);
  return (
    <div className={cn("flex items-center gap-2")}>
      <Progress value={value} className={cn("h-2 flex-1", riskProgressColor(inverse ? getRiskLevel(100 - value) : level))} />
      <span className={cn("text-sm font-semibold w-8 text-right", riskColor(inverse ? getRiskLevel(100 - value) : level))}>{value}</span>
    </div>
  );
}

// Best/worst highlighting
function bestWorst(values: number[], mode: "lowest" | "highest") {
  if (values.length === 0) return { best: -1, worst: -1 };
  const sorted = [...values].sort((a, b) => a - b);
  if (mode === "lowest") {
    return { best: values.indexOf(sorted[0]), worst: values.indexOf(sorted[sorted.length - 1]) };
  }
  return { best: values.indexOf(sorted[sorted.length - 1]), worst: values.indexOf(sorted[0]) };
}

// ── Main Page ──

export default function SupplierComparisonPage() {
  const { t } = useTranslation();
  const fc = useFormatCurrency();
  const [selected, setSelected] = useState<Supplier[]>(() => mockSuppliers.slice(0, 3));
  const [expandedSection, setExpandedSection] = useState<string | null>("risk");

  const risks = useMemo(() => selected.map((s) => computeRiskScores(s)), [selected]);

  const addSupplier = (s: Supplier) => {
    if (selected.length < 6 && !selected.some((sel) => sel.id === s.id)) {
      setSelected([...selected, s]);
    }
  };
  const removeSupplier = (id: string) => setSelected(selected.filter((s) => s.id !== id));

  const toggleSection = (id: string) => setExpandedSection(expandedSection === id ? null : id);

  const sections = [
    { id: "risk", label: t("pages.supplierComparison.riskScores"), icon: Shield },
    { id: "pricing", label: t("pages.supplierComparison.pricingTerms"), icon: DollarSign },
    { id: "capabilities", label: t("pages.supplierComparison.capabilitiesProfile"), icon: Award },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GitCompareArrows className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("pages.supplierComparison.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("pages.supplierComparison.subtitle")}</p>
            </div>
          </div>
        </motion.div>

        {/* Selector */}
        <SupplierSelector selected={selected} onAdd={addSupplier} onRemove={removeSupplier} />

        {/* Comparison Table */}
        {selected.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Supplier Header Row */}
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <div className="min-w-[800px]">
                    <div className="grid" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
                      <div className="p-4 border-b border-r border-border bg-muted/30 font-medium text-sm text-muted-foreground">
                        Supplier
                      </div>
                      {selected.map((s) => (
                        <div key={s.id} className="p-4 border-b border-r last:border-r-0 border-border text-center">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                            <span className="font-bold text-primary">{s.logo}</span>
                          </div>
                          <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {s.location.city}, {s.location.country}
                          </div>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span className="text-sm font-medium">{s.rating}</span>
                            {s.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary ml-1" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Collapsible Sections */}
            {sections.map((section) => {
              const isExpanded = expandedSection === section.id;
              return (
                <Card key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{section.label}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="p-0 border-t border-border">
                          <ScrollArea className="w-full">
                            <div className="min-w-[800px]">
                              {section.id === "risk" && (
                                <RiskSection suppliers={selected} risks={risks} />
                              )}
                              {section.id === "pricing" && (
                                <PricingSection suppliers={selected} fc={fc} />
                              )}
                              {section.id === "capabilities" && (
                                <CapabilitiesSection suppliers={selected} />
                              )}
                            </div>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}

            {/* Summary / Recommendation */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  {t("pages.supplierComparison.comparisonSummary")}
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(() => {
                    const lowestRisk = selected.reduce((best, s, i) =>
                      risks[i].overall < risks[best.idx].overall ? { idx: i, s } : best,
                      { idx: 0, s: selected[0] }
                    );
                    const highestRated = selected.reduce((best, s) =>
                      s.rating > best.rating ? s : best,
                      selected[0]
                    );
                    const lowestMOV = selected.reduce((best, s) =>
                      s.minOrderValue < best.minOrderValue ? s : best,
                      selected[0]
                    );
                    return (
                      <>
                        <div className="rounded-lg bg-background p-3 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">{t("pages.supplierComparison.lowestRisk")}</p>
                          <p className="font-semibold text-sm">{lowestRisk.s.name}</p>
                          <Badge variant="outline" className="text-xs mt-1 text-emerald-500">
                            Score: {risks[lowestRisk.idx].overall}/100
                          </Badge>
                        </div>
                        <div className="rounded-lg bg-background p-3 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Highest Rated</p>
                          <p className="font-semibold text-sm">{highestRated.name}</p>
                          <Badge variant="outline" className="text-xs mt-1 text-amber-500">
                            ★ {highestRated.rating} ({highestRated.reviewCount} reviews)
                          </Badge>
                        </div>
                        <div className="rounded-lg bg-background p-3 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Lowest MOV</p>
                          <p className="font-semibold text-sm">{lowestMOV.name}</p>
                          <Badge variant="outline" className="text-xs mt-1 text-primary">
                            {fc(lowestMOV.minOrderValue)}
                          </Badge>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Section Components ──

function ComparisonRow({
  label,
  cols,
  suppliers,
  highlight,
}: {
  label: string;
  cols: React.ReactNode[];
  suppliers: Supplier[];
  highlight?: { best: number; worst: number };
}) {
  return (
    <div
      className="grid border-b border-border last:border-b-0"
      style={{ gridTemplateColumns: `200px repeat(${suppliers.length}, 1fr)` }}
    >
      <div className="p-3 border-r border-border bg-muted/20 flex items-center">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      {cols.map((col, i) => (
        <div
          key={i}
          className={cn(
            "p-3 border-r last:border-r-0 border-border flex items-center justify-center",
            highlight?.best === i && "bg-emerald-500/5",
            highlight?.worst === i && "bg-destructive/5"
          )}
        >
          {col}
        </div>
      ))}
    </div>
  );
}

function RiskSection({ suppliers, risks }: { suppliers: Supplier[]; risks: RiskScores[] }) {
  const categories: { key: keyof RiskScores; label: string; icon: React.ElementType }[] = [
    { key: "overall", label: "Overall Risk", icon: Shield },
    { key: "financial", label: "Financial", icon: DollarSign },
    { key: "operational", label: "Operational", icon: Cog },
    { key: "compliance", label: "Compliance", icon: FileCheck },
    { key: "geopolitical", label: "Geopolitical", icon: Globe },
  ];

  return (
    <>
      {categories.map((cat) => {
        const values = risks.map((r) => r[cat.key]);
        const hw = bestWorst(values, "lowest");
        return (
          <ComparisonRow
            key={cat.key}
            label={cat.label}
            suppliers={suppliers}
            highlight={hw}
            cols={values.map((v, i) => (
              <div className="w-full max-w-[140px]">
                <ScoreCell value={v} />
              </div>
            ))}
          />
        );
      })}
    </>
  );
}

function PricingSection({ suppliers, fc }: { suppliers: Supplier[]; fc: (v: number) => string }) {
  const movValues = suppliers.map((s) => s.minOrderValue);
  const movHw = bestWorst(movValues, "lowest");

  const ratingValues = suppliers.map((s) => s.rating);
  const ratingHw = bestWorst(ratingValues, "highest");

  return (
    <>
      <ComparisonRow
        label="Min Order Value"
        suppliers={suppliers}
        highlight={movHw}
        cols={suppliers.map((s) => (
          <span className="text-sm font-semibold">{fc(s.minOrderValue)}</span>
        ))}
      />
      <ComparisonRow
        label="Response Time"
        suppliers={suppliers}
        cols={suppliers.map((s) => (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {s.responseTime}
          </div>
        ))}
      />
      <ComparisonRow
        label="Rating"
        suppliers={suppliers}
        highlight={ratingHw}
        cols={suppliers.map((s) => (
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="font-semibold">{s.rating}</span>
            <span className="text-muted-foreground">({s.reviewCount})</span>
          </div>
        ))}
      />
      <ComparisonRow
        label="Verified"
        suppliers={suppliers}
        cols={suppliers.map((s) => (
          s.verified ? (
            <Badge variant="outline" className="text-xs text-emerald-500 gap-1">
              <Check className="h-3 w-3" /> Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">Unverified</Badge>
          )
        ))}
      />
    </>
  );
}

function CapabilitiesSection({ suppliers }: { suppliers: Supplier[] }) {
  const certCountValues = suppliers.map((s) => s.certifications.length);
  const certHw = bestWorst(certCountValues, "highest");

  return (
    <>
      <ComparisonRow
        label="Industry"
        suppliers={suppliers}
        cols={suppliers.map((s) => (
          <Badge variant="secondary" className="text-xs">{s.industry}</Badge>
        ))}
      />
      <ComparisonRow
        label="Specializations"
        suppliers={suppliers}
        cols={suppliers.map((s) => (
          <div className="flex flex-wrap gap-1 justify-center">
            {s.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
            ))}
          </div>
        ))}
      />
      <ComparisonRow
        label="Certifications"
        suppliers={suppliers}
        highlight={certHw}
        cols={suppliers.map((s) => (
          <div className="flex flex-wrap gap-1 justify-center">
            {s.certifications.map((cert) => (
              <Badge key={cert} variant="secondary" className="text-xs">{cert}</Badge>
            ))}
          </div>
        ))}
      />
      <ComparisonRow
        label="Employees"
        suppliers={suppliers}
        cols={suppliers.map((s) => (
          <span className="text-sm">{s.employeeCount}</span>
        ))}
      />
      <ComparisonRow
        label="Established"
        suppliers={suppliers}
        cols={suppliers.map((s) => (
          <div className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {s.yearEstablished}
          </div>
        ))}
      />
      <ComparisonRow
        label="Location"
        suppliers={suppliers}
        cols={suppliers.map((s) => (
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {s.location.city}, {s.location.country}
          </div>
        ))}
      />
    </>
  );
}
