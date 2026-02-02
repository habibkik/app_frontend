import { BOMComponent } from "@/data/bom";
import {
  ComponentCostBreakdown,
  ProductionCostEstimate,
  LogisticsCostEstimate,
  FeasibilityFactors,
  FeasibilityAnalysis,
  FeasibilityStatus,
  MakeVsBuyAnalysis,
  RiskFactor,
  ScenarioParams,
  ScenarioResult,
  VOLUME_DISCOUNTS,
} from "../types/feasibility";

// Calculate component costs from BOM data
export function calculateComponentCosts(components: BOMComponent[]): ComponentCostBreakdown[] {
  return components.map((comp) => ({
    componentId: comp.id,
    name: comp.name,
    category: comp.category,
    quantity: comp.quantity,
    unitCost: comp.unitCost,
    totalCost: comp.totalCost,
    supplierCount: comp.matchedSuppliers,
  }));
}

// Calculate total component cost
export function getTotalComponentCost(costs: ComponentCostBreakdown[]): number {
  return costs.reduce((sum, c) => sum + c.totalCost, 0);
}

// Estimate production costs
export function calculateProductionCost(
  laborCostPerHour: number,
  componentCount: number,
  volume: number
): ProductionCostEstimate {
  // Estimate 0.5 hours labor per unit (assembly time)
  const laborTimePerUnit = 0.5;
  const laborCostPerUnit = laborTimePerUnit * laborCostPerHour;

  // Equipment cost: $2 base, decreases with volume
  const equipmentCostPerUnit = Math.max(0.5, 2 - (volume / 10000) * 1.5);

  // Facility cost: ~10% of labor cost
  const facilityCostPerUnit = laborCostPerUnit * 0.1;

  return {
    laborCostPerUnit: Math.round(laborCostPerUnit * 100) / 100,
    equipmentCostPerUnit: Math.round(equipmentCostPerUnit * 100) / 100,
    facilityCostPerUnit: Math.round(facilityCostPerUnit * 100) / 100,
    totalProductionCostPerUnit: Math.round(
      (laborCostPerUnit + equipmentCostPerUnit + facilityCostPerUnit) * 100
    ) / 100,
  };
}

// Estimate logistics costs
export function calculateLogisticsCost(
  totalComponentCost: number,
  importedPercent: number
): LogisticsCostEstimate {
  // Shipping: $1.50 base + 5% of component cost
  const shippingCostPerUnit = 1.5 + totalComponentCost * 0.05;

  // Import duties: 8% of imported component value
  const importDuties = (totalComponentCost * (importedPercent / 100)) * 0.08;

  // Handling & storage: 3% of component cost
  const handlingStorage = totalComponentCost * 0.03;

  return {
    shippingCostPerUnit: Math.round(shippingCostPerUnit * 100) / 100,
    importDuties: Math.round(importDuties * 100) / 100,
    handlingStorage: Math.round(handlingStorage * 100) / 100,
    totalLandedCostPerUnit: Math.round(
      (shippingCostPerUnit + importDuties + handlingStorage) * 100
    ) / 100,
  };
}

// Analyze feasibility factors
export function analyzeFeasibilityFactors(
  components: BOMComponent[],
  avgLeadTimeDays: number = 21
): FeasibilityFactors {
  // Component availability
  const allHaveSuppliers = components.every((c) => c.matchedSuppliers > 0);
  const someWithFewSuppliers = components.filter((c) => c.matchedSuppliers < 3);

  // Single supplier risk
  const singleSourceComponents = components.filter((c) => c.matchedSuppliers === 1);

  // Local sourcing estimate (mock: 40% local based on component categories)
  const localCategories = ["Structural", "Fasteners", "Sealing"];
  const localComponents = components.filter((c) => localCategories.includes(c.category));
  const localPercent = Math.round((localComponents.length / components.length) * 100);

  return {
    componentAvailability: {
      status: allHaveSuppliers ? (someWithFewSuppliers.length > 2 ? "warn" : "pass") : "fail",
      message: allHaveSuppliers
        ? someWithFewSuppliers.length > 0
          ? `${someWithFewSuppliers.length} components have fewer than 3 suppliers`
          : "All components have multiple suppliers"
        : "Some components have no suppliers found",
    },
    leadTime: {
      status: avgLeadTimeDays <= 14 ? "pass" : avgLeadTimeDays <= 28 ? "warn" : "fail",
      days: avgLeadTimeDays,
      message:
        avgLeadTimeDays <= 14
          ? "Lead times are acceptable"
          : avgLeadTimeDays <= 28
          ? `Average ${avgLeadTimeDays} days may be tight for production schedule`
          : `${avgLeadTimeDays} days lead time is aggressive`,
    },
    singleSupplierRisk: {
      status:
        singleSourceComponents.length === 0
          ? "pass"
          : singleSourceComponents.length <= 2
          ? "warn"
          : "fail",
      count: singleSourceComponents.length,
      components: singleSourceComponents.map((c) => c.name),
      message:
        singleSourceComponents.length === 0
          ? "All components have multiple suppliers"
          : `${singleSourceComponents.length} component(s) have only 1 supplier`,
    },
    costCompetitiveness: {
      status: "pass", // Mock: assume cost is competitive
      percentDiff: -12,
      message: "12% below market average",
    },
    localSourcing: {
      status: localPercent >= 60 ? "pass" : localPercent >= 40 ? "warn" : "fail",
      localPercent,
      importedPercent: 100 - localPercent,
      message: `${localPercent}% local sourcing, ${100 - localPercent}% imported`,
    },
  };
}

// Calculate feasibility score
export function calculateFeasibilityScore(factors: FeasibilityFactors): number {
  let score = 0;

  // Component availability: 20 points
  score += factors.componentAvailability.status === "pass" ? 20 :
           factors.componentAvailability.status === "warn" ? 10 : 0;

  // Lead time: 20 points
  if (factors.leadTime.days <= 14) score += 20;
  else if (factors.leadTime.days <= 28) score += 15;
  else if (factors.leadTime.days <= 45) score += 8;

  // Single supplier risk: 20 points
  if (factors.singleSupplierRisk.count === 0) score += 20;
  else if (factors.singleSupplierRisk.count <= 2) score += 12;
  else if (factors.singleSupplierRisk.count <= 4) score += 5;

  // Cost competitiveness: 25 points
  score += factors.costCompetitiveness.status === "pass" ? 25 :
           factors.costCompetitiveness.status === "warn" ? 15 : 5;

  // Local sourcing: 15 points
  score += Math.round((factors.localSourcing.localPercent / 100) * 15);

  return Math.min(100, Math.max(0, score));
}

// Determine feasibility status
export function getFeasibilityStatus(score: number): FeasibilityStatus {
  if (score >= 70) return "feasible";
  if (score >= 50) return "risky";
  return "not-feasible";
}

// Make vs Buy analysis
export function calculateMakeVsBuy(
  totalMakeCost: number,
  retailMarkup: number = 1.5
): MakeVsBuyAnalysis {
  const buyCost = totalMakeCost * retailMarkup;
  const difference = buyCost - totalMakeCost;
  const savingsPercent = Math.round((difference / buyCost) * 100);

  return {
    makeCost: Math.round(totalMakeCost * 100) / 100,
    buyCost: Math.round(buyCost * 100) / 100,
    difference: Math.round(difference * 100) / 100,
    savingsPercent,
    recommendation: savingsPercent > 15 ? "make" : "buy",
  };
}

// Identify risk factors
export function identifyRisks(
  factors: FeasibilityFactors,
  logisticsCost: LogisticsCostEstimate,
  totalCost: number
): RiskFactor[] {
  const risks: RiskFactor[] = [];

  // Single supplier risk
  if (factors.singleSupplierRisk.count > 0) {
    risks.push({
      id: "risk-single-supplier",
      type: factors.singleSupplierRisk.count >= 3 ? "critical" : "warning",
      title: `Only 1 supplier for ${factors.singleSupplierRisk.components[0]}`,
      description: `${factors.singleSupplierRisk.count} component(s) have single-source supply risk`,
      mitigation: "Find backup suppliers for critical components",
    });
  }

  // Lead time risk
  if (factors.leadTime.days > 21) {
    risks.push({
      id: "risk-lead-time",
      type: factors.leadTime.days > 35 ? "critical" : "warning",
      title: `${factors.leadTime.days}-day lead time is aggressive`,
      description: "Extended lead times may impact production schedule",
      mitigation: "Pre-order components now to ensure on-time delivery",
    });
  }

  // Import duty risk
  const dutyPercent = (logisticsCost.importDuties / totalCost) * 100;
  if (dutyPercent > 10) {
    risks.push({
      id: "risk-import-duties",
      type: "warning",
      title: `${Math.round(dutyPercent)}% of cost in import duties`,
      description: "High import duties affecting total cost",
      mitigation: "Consider local alternatives for imported components",
    });
  }

  // High imported percentage
  if (factors.localSourcing.importedPercent > 70) {
    risks.push({
      id: "risk-import-dependency",
      type: "warning",
      title: "High import dependency",
      description: `${factors.localSourcing.importedPercent}% of components are imported`,
      mitigation: "Diversify supply chain with local suppliers where possible",
    });
  }

  return risks;
}

// Calculate break-even units
export function calculateBreakEven(
  fixedCosts: number,
  unitCost: number,
  sellingPrice: number
): number {
  if (sellingPrice <= unitCost) return Infinity;
  return Math.ceil(fixedCosts / (sellingPrice - unitCost));
}

// Scenario simulation
export function simulateScenario(
  baseAnalysis: FeasibilityAnalysis,
  params: ScenarioParams
): ScenarioResult {
  const baseUnitCost = baseAnalysis.totalCostPerUnit;

  // Apply cost increase
  const componentCostWithIncrease =
    getTotalComponentCost(baseAnalysis.componentCosts) * (1 + params.costIncreasePercent / 100);

  // Recalculate production with new labor rate
  const newProductionCost = calculateProductionCost(
    params.laborCostPerHour,
    baseAnalysis.componentCount,
    params.productionVolume
  );

  // Find applicable volume discount
  const applicableDiscount = VOLUME_DISCOUNTS
    .filter((d) => params.productionVolume >= d.threshold)
    .pop();

  const discountPercent = applicableDiscount?.discount || 0;
  const volumeDiscountApplied = discountPercent > 0;

  // Calculate projected cost
  let projectedCost =
    componentCostWithIncrease +
    newProductionCost.totalProductionCostPerUnit +
    baseAnalysis.logisticsCost.totalLandedCostPerUnit;

  // Apply volume discount
  if (volumeDiscountApplied) {
    projectedCost = projectedCost * (1 - discountPercent / 100);
  }

  projectedCost = Math.round(projectedCost * 100) / 100;

  return {
    baseUnitCost,
    projectedUnitCost: projectedCost,
    percentChange: Math.round(((projectedCost - baseUnitCost) / baseUnitCost) * 100 * 10) / 10,
    volumeDiscountApplied,
    discountPercent,
  };
}

// Main function to perform full feasibility analysis
export function performFeasibilityAnalysis(
  productName: string,
  components: BOMComponent[],
  laborCostPerHour: number = 25,
  productionVolume: number = 1000
): FeasibilityAnalysis {
  // Calculate costs
  const componentCosts = calculateComponentCosts(components);
  const totalComponentCost = getTotalComponentCost(componentCosts);

  // Analyze factors first to get local sourcing info
  const factors = analyzeFeasibilityFactors(components);

  // Calculate production and logistics costs
  const productionCost = calculateProductionCost(
    laborCostPerHour,
    components.length,
    productionVolume
  );
  const logisticsCost = calculateLogisticsCost(
    totalComponentCost,
    factors.localSourcing.importedPercent
  );

  // Total cost per unit
  const totalCostPerUnit =
    Math.round(
      (totalComponentCost +
        productionCost.totalProductionCostPerUnit +
        logisticsCost.totalLandedCostPerUnit) *
        100
    ) / 100;

  // Calculate score and status
  const score = calculateFeasibilityScore(factors);
  const status = getFeasibilityStatus(score);

  // Make vs Buy analysis
  const makeVsBuy = calculateMakeVsBuy(totalCostPerUnit);

  // Identify risks
  const risks = identifyRisks(factors, logisticsCost, totalCostPerUnit);

  // Break-even calculation (assuming 50% margin selling price)
  const sellingPrice = totalCostPerUnit * 1.5;
  const fixedCosts = 5000; // Mock fixed costs
  const breakEvenUnits = calculateBreakEven(fixedCosts, totalCostPerUnit, sellingPrice);

  // Recommended minimum order (based on MOQ economics)
  const recommendedMinOrder = Math.max(100, Math.ceil(breakEvenUnits * 1.2));

  return {
    productName,
    componentCount: components.length,
    score,
    status,
    componentCosts,
    productionCost,
    logisticsCost,
    totalCostPerUnit,
    factors,
    makeVsBuy,
    risks,
    breakEvenUnits: Math.min(breakEvenUnits, 99999),
    recommendedMinOrder,
  };
}
