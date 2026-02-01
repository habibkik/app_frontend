import type { SupplierQuote, ComponentPart } from "@/data/components";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskMetric {
  score: number; // 0-100
  level: RiskLevel;
  details: string;
}

export interface LeadTimeRisk extends RiskMetric {
  averageDays: number;
  maxDays: number;
  minDays: number;
}

export interface SingleSupplierRisk extends RiskMetric {
  affectedComponents: string[];
  componentsWithSingleSource: number;
  totalComponents: number;
}

export interface GeographicRisk extends RiskMetric {
  concentrationDetails: { region: string; percentage: number; count: number }[];
  totalRegions: number;
}

export interface SupplyChainRiskScore {
  overall: number;
  overallLevel: RiskLevel;
  leadTimeRisk: LeadTimeRisk;
  singleSupplierRisk: SingleSupplierRisk;
  geographicRisk: GeographicRisk;
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  if (score <= 80) return "high";
  return "critical";
}

export function calculateLeadTimeRisk(quotes: SupplierQuote[]): LeadTimeRisk {
  if (quotes.length === 0) {
    return {
      score: 0,
      level: "low",
      details: "No suppliers to assess",
      averageDays: 0,
      maxDays: 0,
      minDays: 0,
    };
  }

  const leadTimes = quotes.map((q) => q.leadTimeDays);
  const avgDays = leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length;
  const maxDays = Math.max(...leadTimes);
  const minDays = Math.min(...leadTimes);

  let score: number;
  let details: string;

  if (avgDays <= 7) {
    score = 10;
    details = "Excellent lead times - average under 1 week";
  } else if (avgDays <= 14) {
    score = 30;
    details = "Good lead times - average 1-2 weeks";
  } else if (avgDays <= 21) {
    score = 50;
    details = "Moderate lead times - average 2-3 weeks";
  } else if (avgDays <= 30) {
    score = 70;
    details = "Extended lead times - average 3-4 weeks";
  } else {
    score = 90;
    details = "Critical lead times - average over 4 weeks";
  }

  return {
    score,
    level: getRiskLevel(score),
    details,
    averageDays: Math.round(avgDays),
    maxDays,
    minDays,
  };
}

export function calculateSingleSupplierRisk(
  components: ComponentPart[],
  quotes: SupplierQuote[]
): SingleSupplierRisk {
  const affectedComponents: string[] = [];
  
  components.forEach((component) => {
    const componentQuotes = quotes.filter((q) => q.componentId === component.id);
    if (componentQuotes.length === 1) {
      affectedComponents.push(component.name);
    }
  });

  const componentsWithSingleSource = affectedComponents.length;
  const totalComponents = components.length;
  const ratio = totalComponents > 0 ? componentsWithSingleSource / totalComponents : 0;

  let score: number;
  let details: string;

  if (componentsWithSingleSource === 0) {
    score = 10;
    details = "All components have multiple supplier options";
  } else if (ratio <= 0.2) {
    score = 30;
    details = `${componentsWithSingleSource} component(s) with single supplier`;
  } else if (ratio <= 0.4) {
    score = 50;
    details = `${componentsWithSingleSource} components depend on single suppliers`;
  } else if (ratio <= 0.6) {
    score = 70;
    details = `High dependency - ${componentsWithSingleSource} single-source components`;
  } else {
    score = 90;
    details = `Critical - Most components (${componentsWithSingleSource}) single-sourced`;
  }

  return {
    score,
    level: getRiskLevel(score),
    details,
    affectedComponents,
    componentsWithSingleSource,
    totalComponents,
  };
}

export function calculateGeographicRisk(quotes: SupplierQuote[]): GeographicRisk {
  if (quotes.length === 0) {
    return {
      score: 0,
      level: "low",
      details: "No suppliers to assess",
      concentrationDetails: [],
      totalRegions: 0,
    };
  }

  // Extract regions from supplier locations
  const regionCounts = new Map<string, number>();
  
  quotes.forEach((quote) => {
    // Parse region from location string (e.g., "Shenzhen, China" -> "China")
    const parts = quote.supplierLocation.split(",");
    const region = parts[parts.length - 1]?.trim() || "Unknown";
    regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
  });

  const totalSuppliers = quotes.length;
  const concentrationDetails = Array.from(regionCounts.entries())
    .map(([region, count]) => ({
      region,
      count,
      percentage: Math.round((count / totalSuppliers) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const totalRegions = concentrationDetails.length;
  const topConcentration = concentrationDetails[0]?.percentage || 0;

  let score: number;
  let details: string;

  if (totalRegions >= 4 && topConcentration < 40) {
    score = 15;
    details = `Well diversified across ${totalRegions} regions`;
  } else if (totalRegions >= 3 && topConcentration < 50) {
    score = 30;
    details = `Good diversity - spread across ${totalRegions} regions`;
  } else if (topConcentration < 60) {
    score = 45;
    details = `Moderate concentration - ${topConcentration}% in ${concentrationDetails[0]?.region}`;
  } else if (topConcentration < 75) {
    score = 65;
    details = `High concentration - ${topConcentration}% in ${concentrationDetails[0]?.region}`;
  } else if (topConcentration < 90) {
    score = 80;
    details = `Very high concentration - ${topConcentration}% in ${concentrationDetails[0]?.region}`;
  } else {
    score = 95;
    details = `Critical - ${topConcentration}% concentrated in ${concentrationDetails[0]?.region}`;
  }

  return {
    score,
    level: getRiskLevel(score),
    details,
    concentrationDetails,
    totalRegions,
  };
}

export function calculateOverallRiskScore(
  leadTimeRisk: LeadTimeRisk,
  singleSupplierRisk: SingleSupplierRisk,
  geographicRisk: GeographicRisk
): { overall: number; overallLevel: RiskLevel } {
  // Weighted average: Lead Time 30%, Single Supplier 40%, Geographic 30%
  const overall = Math.round(
    leadTimeRisk.score * 0.3 +
    singleSupplierRisk.score * 0.4 +
    geographicRisk.score * 0.3
  );

  return {
    overall,
    overallLevel: getRiskLevel(overall),
  };
}

export function calculateSupplyChainRisk(
  components: ComponentPart[],
  quotes: SupplierQuote[]
): SupplyChainRiskScore {
  const leadTimeRisk = calculateLeadTimeRisk(quotes);
  const singleSupplierRisk = calculateSingleSupplierRisk(components, quotes);
  const geographicRisk = calculateGeographicRisk(quotes);
  const { overall, overallLevel } = calculateOverallRiskScore(
    leadTimeRisk,
    singleSupplierRisk,
    geographicRisk
  );

  return {
    overall,
    overallLevel,
    leadTimeRisk,
    singleSupplierRisk,
    geographicRisk,
  };
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "text-green-500";
    case "medium":
      return "text-yellow-500";
    case "high":
      return "text-orange-500";
    case "critical":
      return "text-red-500";
  }
}

export function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "bg-green-500/10 border-green-500/20";
    case "medium":
      return "bg-yellow-500/10 border-yellow-500/20";
    case "high":
      return "bg-orange-500/10 border-orange-500/20";
    case "critical":
      return "bg-red-500/10 border-red-500/20";
  }
}

export function getRiskGradient(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "from-green-500 to-emerald-400";
    case "medium":
      return "from-yellow-500 to-amber-400";
    case "high":
      return "from-orange-500 to-red-400";
    case "critical":
      return "from-red-500 to-rose-600";
  }
}
